import type { Asset, NewsItem, MacroResult } from "./types";

// ─── Keyword sets for categorization ─────────────────────────────────────────

const WAR_KEYWORDS = [
  "war", "attack", "missile", "military", "troops", "invasion", "nato", "conflict",
  "strike", "bomb", "ukraine", "russia", "gaza", "israel", "iran", "houthi",
  "pentagon", "defense", "nuclear", "escalat", "tension", "ceasefire", "sanction",
  "savaş", "saldırı", "füze", "askeri", "çatışma", "gerilim",
  "taiwan", "china military", "north korea", "red sea",
];

const INFLATION_KEYWORDS = [
  "inflation", "cpi", "ppi", "consumer price", "producer price", "deflation",
  "enflasyon", "tüfe", "üfe", "cost of living", "price index",
];

const RATES_KEYWORDS = [
  "interest rate", "fed", "federal reserve", "ecb", "boe", "boj", "central bank",
  "rate cut", "rate hike", "hawkish", "dovish", "fomc", "monetary policy",
  "faiz", "merkez bankası", "powell", "lagarde", "quantitative", "taper",
  "treasury", "yield", "bond",
];

const CRYPTO_KEYWORDS = [
  "bitcoin", "btc", "ethereum", "eth", "crypto", "blockchain", "defi",
  "etf", "spot etf", "sec", "binance", "coinbase", "regulation", "stablecoin",
  "halving", "mining", "whale", "custody", "exchange",
];

const GOLD_KEYWORDS = [
  "gold", "xau", "precious metal", "safe haven", "bullion", "gold price",
  "silver", "commodit", "altın", "değerli metal",
];

const MACRO_KEYWORDS = [
  "gdp", "employment", "jobs", "nonfarm", "unemployment", "trade war", "tariff",
  "recession", "stimulus", "fiscal", "debt ceiling", "default", "dollar", "dxy",
  "oil", "opec", "energy", "gsyih", "istihdam", "işsizlik", "resesyon",
];

// ─── Impact assessment keywords ──────────────────────────────────────────────

const BULLISH_CRYPTO = [
  "etf approv", "rate cut", "dovish", "stimulus", "adoption", "institutional",
  "accumulation", "inflow", "support", "rally", "surge", "bullish",
];

const BEARISH_CRYPTO = [
  "rate hike", "hawkish", "ban", "crack down", "restrict", "sell", "dump",
  "outflow", "bearish", "plunge", "crash", "fear", "recession",
  "tariff", "trade war", "sanction",
];

const BULLISH_GOLD = [
  "war", "conflict", "escalat", "tension", "safe haven", "rate cut", "dovish",
  "inflation ris", "uncertainty", "fear", "geopolitical", "crisis", "debt",
];

const BEARISH_GOLD = [
  "ceasefire", "peace", "rate hike", "hawkish", "strong dollar", "risk on",
  "deflation", "optimis",
];

// ─── Categorize a headline ───────────────────────────────────────────────────

function categorize(title: string, asset: Asset): NewsItem {
  const lower = title.toLowerCase();

  // Category
  let category: NewsItem["category"] = "other";
  if (WAR_KEYWORDS.some((k) => lower.includes(k))) category = "war";
  else if (INFLATION_KEYWORDS.some((k) => lower.includes(k))) category = "inflation";
  else if (RATES_KEYWORDS.some((k) => lower.includes(k))) category = "rates";
  else if (CRYPTO_KEYWORDS.some((k) => lower.includes(k))) category = "crypto";
  else if (GOLD_KEYWORDS.some((k) => lower.includes(k))) category = "gold";
  else if (MACRO_KEYWORDS.some((k) => lower.includes(k))) category = "macro";

  // Relevance to selected asset
  let relevance: NewsItem["relevance"] = "low";
  if (asset === "GOLD") {
    if (["war", "gold", "rates", "inflation", "macro"].includes(category)) relevance = "high";
    else if (category === "other") relevance = "low";
  } else {
    // BTC / ETH
    if (["crypto", "rates", "macro"].includes(category)) relevance = "high";
    else if (["war", "inflation"].includes(category)) relevance = "medium";
  }

  // Impact direction
  let impact: NewsItem["impact"] = "neutral";
  if (asset === "GOLD") {
    if (BULLISH_GOLD.some((k) => lower.includes(k))) impact = "bullish";
    else if (BEARISH_GOLD.some((k) => lower.includes(k))) impact = "bearish";
  } else {
    if (BULLISH_CRYPTO.some((k) => lower.includes(k))) impact = "bullish";
    else if (BEARISH_CRYPTO.some((k) => lower.includes(k))) impact = "bearish";
  }

  return { title, source: "", timestamp: "", category, impact, relevance };
}

// ─── Analyze all headlines ───────────────────────────────────────────────────

export function analyzeNews(
  headlines: { title: string; source: string; pubDate: string }[],
  asset: Asset
): MacroResult {
  if (!headlines.length) {
    return {
      headlines: [],
      warRisk: "Veri yetersiz / kaynak erişilemedi",
      inflationOutlook: "Veri yetersiz / kaynak erişilemedi",
      ratesOutlook: "Veri yetersiz / kaynak erişilemedi",
      dxyBias: "Veri yetersiz / kaynak erişilemedi",
      overallImpact: "Veri yetersiz / kaynak erişilemedi",
      available: false,
    };
  }

  const categorized = headlines.map((h) => {
    const item = categorize(h.title, asset);
    item.source = h.source;
    item.timestamp = h.pubDate;
    return item;
  });

  // Filter relevant items — keep high/medium relevance, plus high-impact "other"
  const relevant = categorized.filter(
    (h) => h.relevance === "high" || h.relevance === "medium" ||
           (h.category !== "other" && h.impact !== "neutral")
  );

  // War risk assessment
  const warItems = relevant.filter((h) => h.category === "war");
  let warRisk = "Düşük — Aktif savaş haberi tespit edilmedi";
  if (warItems.length >= 5) warRisk = "Yüksek — Çok sayıda savaş/çatışma haberi. Risk-off ortamı olası";
  else if (warItems.length >= 2) warRisk = "Orta — Savaş/gerilim haberleri mevcut. Piyasa hassasiyeti artabilir";

  // Inflation outlook
  const inflItems = relevant.filter((h) => h.category === "inflation");
  let inflationOutlook = "Nötr — Güncel enflasyon verisi haberlerde belirgin değil";
  if (inflItems.some((h) => h.title.toLowerCase().includes("ris"))) inflationOutlook = "Yükselen enflasyon beklentisi — altın için pozitif, riskli varlıklar için belirsiz";
  else if (inflItems.some((h) => h.title.toLowerCase().includes("fall") || h.title.toLowerCase().includes("declin"))) inflationOutlook = "Düşen enflasyon — faiz indirimi beklentisini güçlendirir";

  // Rates outlook
  const ratesItems = relevant.filter((h) => h.category === "rates");
  let ratesOutlook = "Nötr — Belirgin faiz yönü haberi yok";
  if (ratesItems.some((h) => h.title.toLowerCase().includes("cut"))) ratesOutlook = "Faiz indirimi beklentisi — likidite artışı, risk varlıkları için pozitif";
  else if (ratesItems.some((h) => h.title.toLowerCase().includes("hike") || h.title.toLowerCase().includes("hawkish"))) ratesOutlook = "Faiz artırım/şahin yönelim — riskli varlıklar için negatif";

  // DXY bias
  let dxyBias = "Nötr";
  if (ratesOutlook.includes("indirimi")) dxyBias = "Zayıf dolar beklentisi — BTC/Altın için pozitif";
  else if (ratesOutlook.includes("artırım") || ratesOutlook.includes("şahin")) dxyBias = "Güçlü dolar beklentisi — BTC/Altın için negatif";

  // Overall impact
  const bullishCount = relevant.filter((h) => h.impact === "bullish").length;
  const bearishCount = relevant.filter((h) => h.impact === "bearish").length;
  let overallImpact: string;
  if (bullishCount > bearishCount * 1.5) overallImpact = `Genel olarak BULLISH (${bullishCount} pozitif vs ${bearishCount} negatif haber)`;
  else if (bearishCount > bullishCount * 1.5) overallImpact = `Genel olarak BEARISH (${bearishCount} negatif vs ${bullishCount} pozitif haber)`;
  else overallImpact = `KARIŞIK — ${bullishCount} pozitif, ${bearishCount} negatif, ${relevant.length - bullishCount - bearishCount} nötr`;

  const sortedHeadlines = relevant.sort((a, b) => {
    const relOrder = { high: 0, medium: 1, low: 2 };
    return relOrder[a.relevance] - relOrder[b.relevance];
  }).slice(0, 15);

  return {
    headlines: sortedHeadlines,
    warRisk,
    inflationOutlook,
    ratesOutlook,
    dxyBias,
    overallImpact,
    // available only if we have relevant classified headlines to show
    available: sortedHeadlines.length > 0,
  };
}
