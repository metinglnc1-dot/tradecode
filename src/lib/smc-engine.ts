import type {
  Candle, SwingPoint, StructureResult, FVG, Zones, Zone,
  AMDResult, OrderFlowResult, FundingResult, LiquidationResult,
  LiquidationPool, Bias,
} from "./types";

// ─── Swing Point Detection ───────────────────────────────────────────────────

export function findSwings(candles: Candle[], n = 3): SwingPoint[] {
  const swings: SwingPoint[] = [];
  for (let i = n; i < candles.length - n; i++) {
    const c = candles[i];
    const window = candles.slice(i - n, i + n + 1);
    const others = window.filter((w) => w !== c);

    if (window.every((w) => w.high <= c.high) && others.some((w) => w.high < c.high)) {
      swings.push({ type: "H", price: c.high, idx: i, ts: c.timestamp });
    }
    if (window.every((w) => w.low >= c.low) && others.some((w) => w.low > c.low)) {
      swings.push({ type: "L", price: c.low, idx: i, ts: c.timestamp });
    }
  }

  // Deduplicate consecutive same-type swings — keep the most extreme
  const clean: SwingPoint[] = [];
  for (const s of swings) {
    if (!clean.length || clean[clean.length - 1].type !== s.type) {
      clean.push({ ...s });
    } else {
      const last = clean[clean.length - 1];
      if (s.type === "H" && s.price > last.price) clean[clean.length - 1] = { ...s };
      if (s.type === "L" && s.price < last.price) clean[clean.length - 1] = { ...s };
    }
  }
  return clean;
}

// ─── Market Structure Analysis ───────────────────────────────────────────────

export function analyzeStructure(candles: Candle[], swings: SwingPoint[], currentPrice: number): StructureResult {
  const empty: StructureResult = {
    bias: "neutral", label: "Yetersiz veri", swings: [],
    bos: null, choch: null, lastH: null, lastL: null, prevH: null, prevL: null,
  };

  if (swings.length < 4) return { ...empty, swings };

  const last8 = swings.slice(-8);
  const highs = last8.filter((s) => s.type === "H");
  const lows = last8.filter((s) => s.type === "L");

  if (highs.length < 2 || lows.length < 2) return { ...empty, swings: last8, label: "Nötr" };

  const [prevH, lastH] = highs.slice(-2);
  const [prevL, lastL] = lows.slice(-2);

  const hh = lastH.price > prevH.price;
  const hl = lastL.price > prevL.price;
  const lh = lastH.price < prevH.price;
  const ll = lastL.price < prevL.price;

  let bias: Bias, label: string;
  let bos: StructureResult["bos"] = null;
  let choch: StructureResult["choch"] = null;

  if (hh && hl) {
    bias = "bullish";
    label = "Bullish — HH + HL konfirme";
  } else if (lh && ll) {
    bias = "bearish";
    label = "Bearish — LH + LL serisi";
  } else if (hl && lh) {
    bias = "neutral";
    label = "Geçiş aşaması — CHoCH sinyali (HL oluştu, LH devam)";
    choch = { level: lastH.price, type: "potential_bullish" };
  } else if (hh && ll) {
    bias = "neutral";
    label = "Geniş range — HH + LL (yön çatışması)";
  } else if (hl && !lh && !hh) {
    bias = "neutral";
    label = "Nötr → HL oluştu ama HH gelmedi";
    choch = { level: prevH.price, type: "awaiting_confirmation" };
  } else {
    bias = "neutral";
    label = "Nötr / Geçiş aşaması";
  }

  // BOS detection
  if (currentPrice > lastH.price) {
    bos = { type: "bullish", level: lastH.price };
    if (bias !== "bullish") {
      bias = "bullish";
      label = `Bullish BOS — ${lastH.price.toFixed(0)} kırıldı`;
    }
  } else if (currentPrice < lastL.price) {
    bos = { type: "bearish", level: lastL.price };
    if (bias !== "bearish") {
      bias = "bearish";
      label = `Bearish BOS — ${lastL.price.toFixed(0)} kırıldı`;
    }
  }

  return { bias, label, swings: last8, bos, choch, lastH, lastL, prevH, prevL };
}

// ─── FVG Detection ───────────────────────────────────────────────────────────

export function findFVGs(candles: Candle[], currentPrice: number): FVG[] {
  const fvgs: FVG[] = [];
  const confirmed = candles.filter((c) => c.confirmed);

  for (let i = 1; i < confirmed.length - 1; i++) {
    const A = confirmed[i - 1];
    const B = confirmed[i];
    const C = confirmed[i + 1];

    // Bullish FVG: gap between A.high and C.low
    if (A.high < C.low) {
      const top = C.low;
      const bottom = A.high;
      const mitigated = hasBeenMitigated(confirmed, i + 1, bottom, top, "bullish");
      const isActive = currentPrice >= bottom && currentPrice <= top;
      fvgs.push({
        type: "bullish", top, bottom,
        midpoint: (top + bottom) / 2, ts: B.timestamp,
        status: isActive ? "active" : mitigated ? "mitigated" : "fresh",
      });
    }

    // Bearish FVG: gap between A.low and C.high
    if (A.low > C.high) {
      const top = A.low;
      const bottom = C.high;
      const mitigated = hasBeenMitigated(confirmed, i + 1, bottom, top, "bearish");
      const isActive = currentPrice >= bottom && currentPrice <= top;
      fvgs.push({
        type: "bearish", top, bottom,
        midpoint: (top + bottom) / 2, ts: B.timestamp,
        status: isActive ? "active" : mitigated ? "mitigated" : "fresh",
      });
    }
  }

  return fvgs
    .filter((f) => f.status !== "mitigated")
    .slice(-10)
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 6);
}

function hasBeenMitigated(candles: Candle[], fromIdx: number, bottom: number, top: number, type: string): boolean {
  for (let j = fromIdx + 1; j < candles.length; j++) {
    if (type === "bullish" && candles[j].low <= bottom) return true;
    if (type === "bearish" && candles[j].high >= top) return true;
  }
  return false;
}

// ─── Supply / Demand Zones ───────────────────────────────────────────────────

export function findZones(candles: Candle[], swings: SwingPoint[], currentPrice: number): Zones {
  const supply: Zone[] = [];
  const demand: Zone[] = [];

  const highs = swings.filter((s) => s.type === "H").slice(-8);
  const lows = swings.filter((s) => s.type === "L").slice(-8);

  for (const h of highs) {
    const c = candles[h.idx];
    if (!c) continue;
    const top = h.price;
    const bottom = Math.min(c.open, c.close);
    // Supply must be above current price (or active — price currently inside zone)
    if (bottom >= currentPrice * 0.998) {
      const bodySize = Math.abs(c.close - c.open);
      const wickSize = c.high - Math.max(c.open, c.close);
      supply.push({
        top, bottom, midpoint: (top + bottom) / 2, ts: h.ts,
        strength: wickSize > bodySize * 0.5 || top - bottom > currentPrice * 0.003 ? "major" : "minor",
      });
    }
  }

  for (const l of lows) {
    const c = candles[l.idx];
    if (!c) continue;
    const bottom = l.price;
    const top = Math.max(c.open, c.close);
    // Demand must be below current price (or active — price currently inside zone)
    if (top <= currentPrice * 1.002) {
      const bodySize = Math.abs(c.close - c.open);
      const wickSize = Math.min(c.open, c.close) - c.low;
      demand.push({
        top, bottom, midpoint: (top + bottom) / 2, ts: l.ts,
        strength: wickSize > bodySize * 0.5 || top - bottom > currentPrice * 0.003 ? "major" : "minor",
      });
    }
  }

  return {
    // Supply: nearest first (lowest bottom → closest above price)
    supply: supply.sort((a, b) => a.bottom - b.bottom).slice(0, 5),
    // Demand: nearest first (highest bottom → closest below price)
    demand: demand.sort((a, b) => b.bottom - a.bottom).slice(0, 5),
  };
}

// ─── AMD Model ───────────────────────────────────────────────────────────────

export function analyzeAMD(candles: Candle[], swings: SwingPoint[], currentPrice: number): AMDResult {
  const lows = swings.filter((s) => s.type === "L");
  const highs = swings.filter((s) => s.type === "H");
  if (lows.length < 2 || highs.length < 1) {
    return { phase: "unknown", description: "Yetersiz veri", sweepLevel: null, lastLow: 0, prevLow: 0, lastHigh: 0 };
  }

  const lastLow = lows[lows.length - 1];
  const prevLow = lows[lows.length - 2];
  const lastHigh = highs[highs.length - 1];

  const recent = candles.slice(-30);
  const maxH = Math.max(...recent.map((c) => c.high));
  const minL = Math.min(...recent.map((c) => c.low));
  const range = maxH - minL;
  const pct = range > 0 ? (currentPrice - minL) / range : 0.5;

  let phase: AMDResult["phase"], description: string, sweepLevel: number | null = null;

  if (lastLow.price < prevLow.price) {
    const postSweep = candles.slice(lastLow.idx + 1);
    const postHigh = postSweep.length ? Math.max(...postSweep.map((c) => c.high)) : currentPrice;

    if (postHigh > lastHigh.price * 0.98) {
      phase = "distribution";
      description = `Markup aşaması — ${lastLow.price.toFixed(0)}'ye sweep (manipulation) tamamlandı, fiyat yükseliyor`;
      sweepLevel = lastLow.price;
    } else {
      phase = "manipulation";
      description = `Manipulation: ${lastLow.price.toFixed(0)} sweep (önceki dip: ${prevLow.price.toFixed(0)}). Markup henüz doğrulanmadı`;
      sweepLevel = lastLow.price;
    }
  } else if (pct < 0.3) {
    phase = "accumulation";
    description = `Accumulation — Fiyat range'in alt %${Math.round(pct * 100)}'sinde. SM alım yapıyor olabilir`;
  } else if (pct > 0.7) {
    phase = "distribution";
    description = `Distribution/Markup — Fiyat range'in üst %${Math.round(pct * 100)}'sinde`;
  } else {
    phase = "rebalancing";
    description = `Rebalancing — Fiyat range ortasında (%${Math.round(pct * 100)}). Yön bekleniyor`;
  }

  return { phase, description, sweepLevel, lastLow: lastLow.price, prevLow: prevLow.price, lastHigh: lastHigh.price };
}

// ─── Order Flow Analysis ─────────────────────────────────────────────────────

export function analyzeOrderFlow(candles4h: Candle[], candles15m: Candle[], currentPrice: number): OrderFlowResult {
  const recent4h = candles4h.slice(-6);
  const recent15m = candles15m.slice(-12);

  // Displacement detection on 4H
  const bodies = candles4h.slice(-20).map((c) => Math.abs(c.close - c.open));
  const avgBody = bodies.reduce((a, b) => a + b, 0) / (bodies.length || 1);

  const displacements = recent4h.filter((c) => Math.abs(c.close - c.open) > avgBody * 1.8);
  const lastDisp = displacements.length ? displacements[displacements.length - 1] : null;
  const dispDir = lastDisp ? (lastDisp.close > lastDisp.open ? "bullish" : "bearish") : null;

  // 15M momentum
  const bull15 = recent15m.filter((c) => c.close > c.open).length;
  const bear15 = recent15m.length - bull15;

  // Volume trend
  const half = Math.floor(recent15m.length / 2);
  const volRecent = recent15m.slice(half).reduce((a, c) => a + c.vol, 0) / (recent15m.length - half || 1);
  const volPrev = recent15m.slice(0, half).reduce((a, c) => a + c.vol, 0) / (half || 1);
  const volTrend = volRecent > volPrev * 1.2 ? "yükselen" : volRecent < volPrev * 0.8 ? "düşen" : "stabil";

  // Price in recent range
  const h = Math.max(...recent4h.map((c) => c.high));
  const l = Math.min(...recent4h.map((c) => c.low));
  const pct = h > l ? ((currentPrice - l) / (h - l) * 100).toFixed(1) : "50.0";

  let momentum: string;
  if (bull15 >= 9) momentum = "Güçlü Bullish";
  else if (bull15 >= 7) momentum = "Bullish";
  else if (bear15 >= 9) momentum = "Güçlü Bearish";
  else if (bear15 >= 7) momentum = "Bearish";
  else if (bull15 >= 5) momentum = "Hafif Bullish";
  else if (bear15 >= 5) momentum = "Hafif Bearish";
  else momentum = "Nötr";

  return {
    momentum,
    bullish15m: bull15,
    bearish15m: bear15,
    volTrend,
    displacement: lastDisp
      ? { direction: dispDir!, body: Math.abs(lastDisp.close - lastDisp.open).toFixed(0), avgBody: avgBody.toFixed(0) }
      : null,
    priceInRange: `%${pct} (son 6 4H bar aralığı)`,
  };
}

// ─── Funding Rate Analysis ───────────────────────────────────────────────────

export function analyzeFunding(funding: any): FundingResult {
  if (!funding) return { rate: null, ratePct: "N/A", annualized: "N/A", interpretation: "Veri yetersiz / kaynak erişilemedi", bias: "neutral" };

  // Handle Gate.io format {fundingRate} or OKX format {fundingRate} or simple string
  const raw = funding.fundingRate ?? funding.funding_rate ?? funding.rate ?? "0";
  const rate = parseFloat(String(raw));
  const ratePct = (rate * 100).toFixed(4);
  const annualized = (rate * 3 * 365 * 100).toFixed(2);

  let interpretation: string, bias: string;
  if (rate > 0.0005) { interpretation = "Aşırı LONG yoğunluğu — kısa vadede düşüş riski"; bias = "bearish_signal"; }
  else if (rate > 0.0001) { interpretation = "Yüksek long bias — dikkatli ol"; bias = "slightly_bearish"; }
  else if (rate > 0.00001) { interpretation = "Hafif long bias — sağlıklı"; bias = "slightly_bullish"; }
  else if (rate > -0.00001) { interpretation = "Nötr — kalabalık pozisyon yok, sağlıklı ortam"; bias = "neutral"; }
  else if (rate > -0.0001) { interpretation = "Hafif short bias — long için uygun"; bias = "slightly_bullish"; }
  else { interpretation = "Aşırı SHORT yoğunluğu — squeeze potansiyeli"; bias = "bullish_signal"; }

  return { rate, ratePct: `${ratePct}%`, annualized: `${annualized}%/yıl`, interpretation, bias };
}

// ─── Liquidation Pool Estimation ─────────────────────────────────────────────

export function estimateLiquidation(
  swings: SwingPoint[],
  currentPrice: number,
  coinglassData: any
): LiquidationResult {
  // If CoinGlass data available, use it
  if (coinglassData) {
    return {
      available: true,
      pools: [],
      likelyFirstTarget: "CoinGlass verisine göre değerlendirildi",
      source: "CoinGlass API",
    };
  }

  // Otherwise estimate from price structure
  const pools: LiquidationPool[] = [];
  const highs = swings.filter((s) => s.type === "H").map((s) => s.price).sort((a, b) => a - b);
  const lows = swings.filter((s) => s.type === "L").map((s) => s.price).sort((a, b) => b - a);

  // Short liquidation (above price — stops of shorts)
  const nearHighs = highs.filter((h) => h > currentPrice && h < currentPrice * 1.03);
  const farHighs = highs.filter((h) => h > currentPrice * 1.03);

  if (nearHighs.length) {
    pools.push({
      side: "short", distance: "near",
      priceRange: `${Math.min(...nearHighs).toFixed(0)}–${Math.max(...nearHighs).toFixed(0)}`,
      description: `Yakın short SL kümesi (${nearHighs.length} swing high)`,
    });
  }
  if (farHighs.length) {
    pools.push({
      side: "short", distance: "far",
      priceRange: `${Math.min(...farHighs).toFixed(0)}–${Math.max(...farHighs).toFixed(0)}`,
      description: `Uzak short likidasyon havuzu (${farHighs.length} swing high)`,
    });
  }

  // Long liquidation (below price — stops of longs)
  const nearLows = lows.filter((l) => l < currentPrice && l > currentPrice * 0.97);
  const farLows = lows.filter((l) => l < currentPrice * 0.97);

  if (nearLows.length) {
    pools.push({
      side: "long", distance: "near",
      priceRange: `${Math.min(...nearLows).toFixed(0)}–${Math.max(...nearLows).toFixed(0)}`,
      description: `Yakın long SL kümesi (${nearLows.length} swing low)`,
    });
  }
  if (farLows.length) {
    pools.push({
      side: "long", distance: "far",
      priceRange: `${Math.min(...farLows).toFixed(0)}–${Math.max(...farLows).toFixed(0)}`,
      description: `Uzak long likidasyon havuzu (${farLows.length} swing low)`,
    });
  }

  // Determine which side is more likely to be attacked first
  const nearShortDist = nearHighs.length ? Math.min(...nearHighs) - currentPrice : Infinity;
  const nearLongDist = nearLows.length ? currentPrice - Math.max(...nearLows) : Infinity;
  const likelyFirst =
    nearShortDist < nearLongDist
      ? `Üst taraf (short liq) — ${nearHighs.length ? Math.min(...nearHighs).toFixed(0) : "?"} bölgesi daha yakın`
      : nearLongDist < nearShortDist
        ? `Alt taraf (long liq) — ${nearLows.length ? Math.max(...nearLows).toFixed(0) : "?"} bölgesi daha yakın`
        : "Her iki taraf eşit mesafede";

  return {
    available: false,
    pools,
    likelyFirstTarget: likelyFirst,
    source: "Fiyat yapısından tahmin (CoinGlass erişilemedi)",
  };
}

// ─── Volume Profile Estimation ───────────────────────────────────────────────

export function estimateVolumeProfile(candles: Candle[]) {
  if (!candles.length) return { poc: 0, vah: 0, val: 0, description: "Veri yetersiz" };

  const totalVol = candles.reduce((a, c) => a + c.vol, 0);
  if (totalVol === 0) return { poc: 0, vah: 0, val: 0, description: "Hacim verisi mevcut değil (sentez mum)" };

  // single pass to get price range and fill volume buckets
  let high = -Infinity, low = Infinity;
  for (const c of candles) {
    if (c.high > high) high = c.high;
    if (c.low < low) low = c.low;
  }
  const range = high - low;
  if (range === 0) return { poc: candles[0].close, vah: high, val: low, description: "Flat" };

  const buckets = 50;
  const step = range / buckets;
  const volByBucket = new Array(buckets).fill(0);

  for (const c of candles) {
    const midPrice = (c.high + c.low) / 2;
    const bucket = Math.min(Math.floor((midPrice - low) / step), buckets - 1);
    volByBucket[bucket] += c.vol;
  }

  // POC = bucket with max volume
  let maxVol = 0, pocBucket = 0;
  for (let i = 0; i < buckets; i++) {
    if (volByBucket[i] > maxVol) { maxVol = volByBucket[i]; pocBucket = i; }
  }
  const poc = low + (pocBucket + 0.5) * step;

  // Value area = 70% of volume around POC
  const targetVol = totalVol * 0.7;
  let cumVol = volByBucket[pocBucket];
  let lo = pocBucket, hi = pocBucket;

  while (cumVol < targetVol && (lo > 0 || hi < buckets - 1)) {
    const addLo = lo > 0 ? volByBucket[lo - 1] : 0;
    const addHi = hi < buckets - 1 ? volByBucket[hi + 1] : 0;
    if (addLo >= addHi && lo > 0) { lo--; cumVol += addLo; }
    else if (hi < buckets - 1) { hi++; cumVol += addHi; }
    else { lo--; cumVol += addLo; }
  }

  const val = low + lo * step;
  const vah = low + (hi + 1) * step;

  return {
    poc: Math.round(poc),
    vah: Math.round(vah),
    val: Math.round(val),
    description: `POC: ${Math.round(poc)} | VAH: ${Math.round(vah)} | VAL: ${Math.round(val)}`,
  };
}
