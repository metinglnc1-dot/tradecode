// ─── Asset types ─────────────────────────────────────────────────────────────

export type Asset = "BTC" | "ETH" | "GOLD";
export type Bias = "bullish" | "bearish" | "neutral";
export type AnalysisMode = "short" | "long" | "both";

// ─── Candle ──────────────────────────────────────────────────────────────────

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  vol: number;
  confirmed: boolean;
}

// ─── Swing / Structure ───────────────────────────────────────────────────────

export interface SwingPoint {
  type: "H" | "L";
  price: number;
  idx: number;
  ts: number;
}

export interface StructureResult {
  bias: Bias;
  label: string;
  swings: SwingPoint[];
  bos: { type: Bias; level: number } | null;
  choch: { level: number; type: string } | null;
  lastH: SwingPoint | null;
  lastL: SwingPoint | null;
  prevH: SwingPoint | null;
  prevL: SwingPoint | null;
}

// ─── FVG ─────────────────────────────────────────────────────────────────────

export interface FVG {
  type: "bullish" | "bearish";
  top: number;
  bottom: number;
  midpoint: number;
  ts: number;
  status: "fresh" | "active" | "mitigated";
}

// ─── Supply / Demand ─────────────────────────────────────────────────────────

export interface Zone {
  top: number;
  bottom: number;
  midpoint: number;
  ts: number;
  strength: "major" | "minor";
}

export interface Zones {
  supply: Zone[];
  demand: Zone[];
}

// ─── AMD ─────────────────────────────────────────────────────────────────────

export interface AMDResult {
  phase: "accumulation" | "manipulation" | "distribution" | "rebalancing" | "unknown";
  description: string;
  sweepLevel: number | null;
  lastLow: number;
  prevLow: number;
  lastHigh: number;
}

// ─── Order Flow ──────────────────────────────────────────────────────────────

export interface OrderFlowResult {
  momentum: string;
  bullish15m: number;
  bearish15m: number;
  volTrend: string;
  displacement: {
    direction: string;
    body: string;
    avgBody: string;
  } | null;
  priceInRange: string;
}

// ─── Funding ─────────────────────────────────────────────────────────────────

export interface FundingResult {
  rate: number | null;
  ratePct: string;
  annualized: string;
  interpretation: string;
  bias: string;
}

// ─── Liquidation ─────────────────────────────────────────────────────────────

export interface LiquidationPool {
  side: "long" | "short";
  distance: "near" | "far";
  priceRange: string;
  description: string;
}

export interface LiquidationResult {
  available: boolean;
  pools: LiquidationPool[];
  likelyFirstTarget: string;
  source: string;
}

// ─── News / Macro ────────────────────────────────────────────────────────────

export interface NewsItem {
  title: string;
  source: string;
  timestamp: string;
  category: "war" | "inflation" | "rates" | "crypto" | "macro" | "gold" | "other";
  impact: "bullish" | "bearish" | "neutral";
  relevance: "high" | "medium" | "low";
}

export interface MacroResult {
  headlines: NewsItem[];
  warRisk: string;
  inflationOutlook: string;
  ratesOutlook: string;
  dxyBias: string;
  overallImpact: string;
  available: boolean;
}

// ─── Trade Setup ─────────────────────────────────────────────────────────────

export interface TradeSetup {
  entry: string;
  entry2?: string;
  sl: string;
  tp1: string;
  tp2: string;
  tp3: string;
  validWhen: string;
  invalidWhen: string;
}

// ─── Long-term Plan ──────────────────────────────────────────────────────────

export interface LongTermPlan {
  direction: string;
  accumulationZone: string;
  invalidation: string;
  target1: string;
  target2: string;
  strengthenedBy: string;
  weakenedBy: string;
}

// ─── Price Map Level ─────────────────────────────────────────────────────────

export interface PriceMapLevel {
  line: string;
  tag: string;
  price: number;
}

// ─── Source Status ───────────────────────────────────────────────────────────

export interface SourceStatus {
  name: string;
  status: "ok" | "partial" | "failed";
  detail: string;
}

// ─── Fetch Result (shared between server and browser fetchers) ───────────────

export interface FetchResult {
  ticker: any;
  klines4h: Candle[];
  klines15m: Candle[];
  klinesDaily: Candle[];
  funding: any;
  gecko: any;
  coinglassOI: any;
  coinglassLiq: any;
  coinglassLS: any;
  newsHeadlines: { title: string; source: string; pubDate: string }[];
  sources: SourceStatus[];
}

// ─── Full Report ─────────────────────────────────────────────────────────────

export interface AnalysisReport {
  asset: Asset;
  timestamp: string;
  currentPrice: number;
  high24h: number;
  low24h: number;
  vol24h: string;
  change24h: string;
  change7d: string;
  change30d: string;

  struct4h: StructureResult;
  struct15m: StructureResult;
  structDaily: StructureResult | null;

  fvgs4h: FVG[];
  fvgs15m: FVG[];

  zones: Zones;
  amd: AMDResult;
  orderFlow: OrderFlowResult;
  funding: FundingResult;
  liquidation: LiquidationResult;
  macro: MacroResult;

  longSetup: TradeSetup;
  shortSetup: TradeSetup;
  longTermPlan: LongTermPlan;

  decision: "LONG" | "SHORT" | "WAIT";
  confidence: number;
  bestSetup: string;
  riskNote: string;
  priceMap: PriceMapLevel[];

  sources: SourceStatus[];
}
