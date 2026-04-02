import type {
  Asset, AnalysisReport, StructureResult, FVG, Zones,
  TradeSetup, LongTermPlan, PriceMapLevel, FundingResult, MacroResult, AMDResult,
  FetchResult, VolumeProfile,
} from "./types";
import {
  findSwings, analyzeStructure, findFVGs, findZones,
  analyzeAMD, analyzeOrderFlow, analyzeFunding,
  estimateLiquidation, estimateVolumeProfile,
} from "./smc-engine";
import { analyzeNews } from "./news-engine";

// ─── Build full analysis report ──────────────────────────────────────────────

export function buildReport(asset: Asset, data: FetchResult): AnalysisReport {
  const { klines4h, klines15m, klinesDaily, ticker, funding, gecko, coinglassLiq, newsHeadlines, sources } = data;

  // Current price
  let currentPrice = 0;
  if (ticker) {
    currentPrice = typeof ticker.last === "string" ? parseFloat(ticker.last) : ticker.last ?? 0;
  } else if (klines4h.length) {
    currentPrice = klines4h[klines4h.length - 1].close;
  }

  // 24h data — handles Gate.io futures (high_24h/low_24h/volume_24h) and Yahoo Finance gold format
  let high24h = 0, low24h = 0, vol24h = "?";
  if (ticker) {
    high24h = parseFloat(ticker.high_24h ?? ticker.high24h ?? "0");
    low24h = parseFloat(ticker.low_24h ?? ticker.low24h ?? "0");
    const rawVol = ticker.volume_24h ?? ticker.volCcy24h ?? ticker.vol24h;
    vol24h = rawVol
      ? Number(parseFloat(String(rawVol))).toLocaleString("en-US", { maximumFractionDigits: 0 })
      : "?";
  }

  // Change percentages from CoinGecko
  const change24h = gecko?.price_change_percentage_24h?.toFixed(2) ?? "?";
  const change7d = gecko?.price_change_percentage_7d?.toFixed(2) ?? "?";
  const change30d = gecko?.price_change_percentage_30d?.toFixed(2) ?? "?";

  // Swing detection
  const swings4h = findSwings(klines4h, 3);
  const swings15m = findSwings(klines15m, 4);
  const swingsDaily = klinesDaily.length >= 10 ? findSwings(klinesDaily, 3) : [];

  // Structure analysis
  const struct4h = analyzeStructure(klines4h, swings4h, currentPrice);
  const struct15m = analyzeStructure(klines15m, swings15m, currentPrice);
  const structDaily = swingsDaily.length >= 4
    ? analyzeStructure(klinesDaily, swingsDaily, currentPrice)
    : null;

  // FVGs
  const fvgs4h = findFVGs(klines4h, currentPrice);
  const fvgs15m = findFVGs(klines15m, currentPrice);

  // Zones
  const zones = findZones(klines4h, swings4h, currentPrice);

  // AMD
  const amd = analyzeAMD(klines4h, swings4h, currentPrice);

  // Order flow
  const orderFlow = analyzeOrderFlow(klines4h, klines15m, currentPrice);

  // Funding
  const fundingResult = analyzeFunding(funding);

  // Liquidation
  const liquidation = estimateLiquidation(swings4h, currentPrice, coinglassLiq);

  // News / Macro
  const macro = analyzeNews(newsHeadlines, asset);

  // Volume profile
  const volProfile = estimateVolumeProfile(klines4h);

  // Trade setups
  const longSetup = buildLongSetup(currentPrice, struct4h, struct15m, zones, fvgs4h, fundingResult, macro, asset);
  const shortSetup = buildShortSetup(currentPrice, struct4h, struct15m, zones, fvgs4h, fundingResult, macro, asset);

  // Long-term plan
  const longTermPlan = buildLongTermPlan(currentPrice, structDaily, struct4h, swingsDaily.length ? swingsDaily : swings4h, macro, asset);

  // Decision
  const { decision, confidence, bestSetup, riskNote } = makeDecision(
    struct4h, struct15m, fundingResult, macro, amd, orderFlow, zones, currentPrice
  );

  // Price map
  const priceMap = buildPriceMap(currentPrice, zones, fvgs4h, swings4h);

  return {
    asset,
    timestamp: new Date().toISOString(),
    currentPrice,
    high24h, low24h, vol24h,
    change24h, change7d, change30d,
    struct4h, struct15m, structDaily,
    fvgs4h, fvgs15m,
    zones, amd, orderFlow,
    funding: fundingResult,
    liquidation, macro,
    longSetup, shortSetup, longTermPlan,
    decision, confidence, bestSetup, riskNote,
    priceMap, volProfile, sources,
  };
}

// ─── Long Setup ──────────────────────────────────────────────────────────────

function buildLongSetup(
  price: number, s4h: StructureResult, s15m: StructureResult,
  zones: Zones, fvgs: FVG[], funding: FundingResult, macro: MacroResult, asset: Asset
): TradeSetup {
  const nearDemand = zones.demand[0];
  const deepDemand = zones.demand[1] ?? zones.demand[0];
  const nearSupply = zones.supply[0];

  const entry = nearDemand
    ? `${fmt(nearDemand.bottom)}–${fmt(nearDemand.top)}`
    : "Demand bölgesi tespit edilemedi";
  const entry2 = deepDemand && deepDemand !== nearDemand
    ? `${fmt(deepDemand.bottom)}–${fmt(deepDemand.top)}`
    : undefined;

  const slBase = deepDemand ? deepDemand.bottom * 0.995 : price * 0.97;
  const sl = fmt(slBase);

  const tp1 = nearSupply ? fmt(nearSupply.bottom) : fmt(price * 1.015);
  const tp2 = nearSupply ? fmt(nearSupply.top) : fmt(price * 1.025);
  const tp3 = fmt(price * 1.04);

  const validConditions: string[] = [
    "15M CHoCH + bullish displacement demand bölgesinden",
    s4h.bias !== "bearish" ? "4H yapısı bearish değil" : "4H yapısı bearish — dikkatli gir",
  ];
  if (funding.bias === "slightly_bullish" || funding.bias === "neutral") {
    validConditions.push("Funding nötr/negatif — sağlıklı");
  }

  const invalidConditions: string[] = [];
  if (deepDemand) invalidConditions.push(`4H kapanışı ${fmt(deepDemand.bottom * 0.99)} altına inerse`);
  invalidConditions.push("15M'de ardışık LL serisi oluşursa");
  if (funding.bias === "bearish_signal") invalidConditions.push("Funding aşırı pozitif — squeeze riski");

  return {
    entry, entry2, sl, tp1, tp2, tp3,
    validWhen: validConditions.join(" | "),
    invalidWhen: invalidConditions.join(" | "),
  };
}

// ─── Short Setup ─────────────────────────────────────────────────────────────

function buildShortSetup(
  price: number, s4h: StructureResult, s15m: StructureResult,
  zones: Zones, fvgs: FVG[], funding: FundingResult, macro: MacroResult, asset: Asset
): TradeSetup {
  const nearSupply = zones.supply[0];
  const nearDemand = zones.demand[0];
  const deepDemand = zones.demand[1] ?? zones.demand[0];

  const entry = nearSupply
    ? `${fmt(nearSupply.bottom)}–${fmt(nearSupply.top)}`
    : "Supply bölgesi tespit edilemedi";

  const slBase = nearSupply ? nearSupply.top * 1.005 : price * 1.02;
  const sl = fmt(slBase);

  const tp1 = nearDemand ? fmt(nearDemand.top) : fmt(price * 0.985);
  const tp2 = nearDemand ? fmt(nearDemand.bottom) : fmt(price * 0.975);
  const tp3 = deepDemand ? fmt(deepDemand.bottom) : fmt(price * 0.96);

  const validConditions: string[] = [
    "Supply bölgesinde 15M bearish engulfment veya BOS",
    s4h.bias !== "bullish" ? "4H yapısı bullish değil — short uygun" : "4H yapısı bullish — sadece scalp",
  ];

  const invalidConditions: string[] = [];
  if (nearSupply) invalidConditions.push(`4H kapanışı ${fmt(nearSupply.top * 1.005)} üzerinde olursa`);
  invalidConditions.push("15M'de ardışık HH serisi supply üzerinde devam ederse");

  return {
    entry, sl, tp1, tp2, tp3,
    validWhen: validConditions.join(" | "),
    invalidWhen: invalidConditions.join(" | "),
  };
}

// ─── Long-Term Plan ──────────────────────────────────────────────────────────

function buildLongTermPlan(
  price: number, structD: StructureResult | null, struct4h: StructureResult,
  swings: import("./types").SwingPoint[], macro: MacroResult, asset: Asset
): LongTermPlan {
  const struct = structD ?? struct4h;
  const lows = swings.filter((s) => s.type === "L");
  const highs = swings.filter((s) => s.type === "H");

  const direction = struct.bias === "bullish"
    ? "Bullish — yapı yukarı yönlü"
    : struct.bias === "bearish"
      ? "Bearish — yapı aşağı yönlü"
      : "Nötr — net yön oluşmadı";

  const accZone = lows.length >= 2
    ? `${fmt(lows[lows.length - 2].price)}–${fmt(lows[lows.length - 1].price)}`
    : "Tespit edilemedi";

  const invalidation = lows.length
    ? fmt(lows[lows.length - 1].price * 0.97)
    : fmt(price * 0.9);

  const target1 = highs.length ? fmt(highs[highs.length - 1].price) : fmt(price * 1.1);
  const target2 = highs.length >= 2
    ? fmt(Math.max(highs[highs.length - 1].price, highs[highs.length - 2].price) * 1.05)
    : fmt(price * 1.2);

  let strengthenedBy = "Faiz indirimi, zayıf dolar, artan likidite";
  let weakenedBy = "Faiz artışı, güçlü dolar, resesyon korkusu";

  if (asset === "GOLD") {
    strengthenedBy = "Savaş tırmanması, enflasyon artışı, faiz indirimi, DXY düşüşü, risk-off ortamı";
    weakenedBy = "Ateşkes/barış, faiz artışı, güçlü dolar, risk-on ortamı";
  }

  return { direction, accumulationZone: accZone, invalidation, target1, target2, strengthenedBy, weakenedBy };
}

// ─── Decision Engine ─────────────────────────────────────────────────────────

function makeDecision(
  s4h: StructureResult, s15m: StructureResult,
  funding: FundingResult, macro: MacroResult,
  amd: AMDResult, orderFlow: import("./types").OrderFlowResult,
  zones: Zones, price: number
) {
  let score = 5; // Base confidence
  let decision: "LONG" | "SHORT" | "WAIT" = "WAIT";
  let bestSetup = "";
  let riskNote = "";

  // HTF–LTF alignment bonus
  if (s4h.bias === "bullish" && s15m.bias === "bullish") { score += 2; decision = "LONG"; }
  else if (s4h.bias === "bearish" && s15m.bias === "bearish") { score += 2; decision = "SHORT"; }
  else if (s4h.bias === s15m.bias && s4h.bias === "neutral") { score -= 1; }
  else { score -= 1; } // Conflict

  // AMD alignment
  if (amd.phase === "distribution" && decision === "LONG") score += 0.5;
  if (amd.phase === "accumulation" && decision === "LONG") score += 1;
  if (amd.phase === "manipulation") score -= 0.5;

  // Order flow momentum
  if (orderFlow.momentum.includes("Bullish") && decision === "LONG") score += 0.5;
  if (orderFlow.momentum.includes("Bearish") && decision === "SHORT") score += 0.5;
  if (orderFlow.momentum.includes("Güçlü")) score += 0.5;

  // Funding alignment
  if (funding.bias === "bearish_signal") { score -= 1; riskNote += "Funding aşırı pozitif — kalabalık long. "; }
  if (funding.bias === "bullish_signal" && decision === "SHORT") score -= 1;

  // Macro impact
  if (macro.available) {
    if (macro.overallImpact.includes("BULLISH") && decision === "LONG") score += 0.5;
    if (macro.overallImpact.includes("BEARISH") && decision === "SHORT") score += 0.5;
    if (macro.overallImpact.includes("BULLISH") && decision === "SHORT") score -= 0.5;
    if (macro.overallImpact.includes("BEARISH") && decision === "LONG") score -= 0.5;
    if (macro.warRisk.includes("Yüksek")) riskNote += "Savaş riski yüksek — volatilite artabilir. ";
  }

  // Price position (mid-range = lower confidence)
  const nearSupply = zones.supply[0];
  const nearDemand = zones.demand[0];
  if (nearSupply && nearDemand) {
    const range = nearSupply.top - nearDemand.bottom;
    const pos = (price - nearDemand.bottom) / (range || 1);
    if (pos > 0.35 && pos < 0.65) { score -= 1; riskNote += "Fiyat orta range'de — ideal entry değil. "; }
    if (pos > 0.8 && decision === "LONG") { score -= 1; riskNote += "Supply'e çok yakın — long riskli. "; }
    if (pos < 0.2 && decision === "SHORT") { score -= 1; riskNote += "Demand'e çok yakın — short riskli. "; }
  }

  // Clamp
  score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));

  // If score too low, force WAIT
  if (score < 4.5) decision = "WAIT";

  // Best setup
  if (decision === "LONG") {
    bestSetup = nearDemand
      ? `${fmt(nearDemand.bottom)}–${fmt(nearDemand.top)} demand bölgesinde 15M CHoCH sonrası long`
      : "Demand bölgesine pullback bekle";
  } else if (decision === "SHORT") {
    bestSetup = nearSupply
      ? `${fmt(nearSupply.bottom)}–${fmt(nearSupply.top)} supply bölgesinde 15M bearish BOS sonrası short`
      : "Supply bölgesine yükselişi bekle";
  } else {
    bestSetup = "Şartlar net değil — HTF/LTF uyumu veya uç nokta konfirmasyonu bekle";
  }

  if (!riskNote) riskNote = "Standart risk — plan dahilinde kal, invalidation seviyelerini takip et.";

  return { decision, confidence: score, bestSetup, riskNote: riskNote.trim() };
}

// ─── Price Map ───────────────────────────────────────────────────────────────

function buildPriceMap(price: number, zones: Zones, fvgs: FVG[], swings: import("./types").SwingPoint[]): PriceMapLevel[] {
  const levels: { price: number; label: string; tag: string }[] = [];

  zones.supply.forEach((z, i) => {
    levels.push({ price: z.top, label: `Supply${i + 1} Top`, tag: "SUPPLY" });
    levels.push({ price: z.bottom, label: `Supply${i + 1} Bot`, tag: "supply" });
  });

  zones.demand.forEach((z, i) => {
    levels.push({ price: z.top, label: `Demand${i + 1} Top`, tag: "demand" });
    levels.push({ price: z.bottom, label: `Demand${i + 1} Bot`, tag: "DEMAND" });
  });

  fvgs.filter(f => f.status !== "mitigated").slice(0, 3).forEach((f) => {
    levels.push({ price: f.top, label: `${f.type === "bearish" ? "Bear" : "Bull"} FVG Top`, tag: "fvg" });
    levels.push({ price: f.bottom, label: `${f.type === "bearish" ? "Bear" : "Bull"} FVG Bot`, tag: "fvg" });
  });

  levels.push({ price, label: "CURRENT PRICE", tag: "CURRENT" });

  // Sort descending, dedup within 0.15%
  levels.sort((a, b) => b.price - a.price);
  const deduped: typeof levels = [];
  for (const l of levels) {
    if (!deduped.length || Math.abs(deduped[deduped.length - 1].price - l.price) / price > 0.0015) {
      deduped.push(l);
    }
  }

  return deduped.slice(0, 16).map((l) => {
    const p = fmt(l.price).padStart(8);
    let line: string;
    if (l.tag === "CURRENT") line = `  ${p}  ══════════════════════  ${l.label}`;
    else if (l.tag === "SUPPLY") line = `  ${p}  ─────────────────────  ${l.label} ▲`;
    else if (l.tag === "DEMAND") line = `  ${p}  ─────────────────────  ${l.label} ▼`;
    else line = `  ${p}  · · · · · · · · · · ·  ${l.label}`;
    return { line, tag: l.tag, price: l.price };
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n > 10000) return n.toFixed(0);
  if (n > 100) return n.toFixed(1);
  return n.toFixed(2);
}
