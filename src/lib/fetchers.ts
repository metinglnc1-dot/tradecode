import axios from "axios";
import type { Asset, Candle, SourceStatus } from "./types";

const TIMEOUT = 10000;
const UA = "Mozilla/5.0 (compatible; TradeCode/1.0)";

// ─── OKX helpers ─────────────────────────────────────────────────────────────

const OKX_INST: Record<string, string> = {
  BTC: "BTC-USDT-SWAP",
  ETH: "ETH-USDT-SWAP",
};

async function okxGet(path: string) {
  const res = await axios.get(`https://www.okx.com${path}`, {
    timeout: TIMEOUT,
    headers: { "User-Agent": UA },
  });
  if (res.data?.code !== "0") throw new Error(res.data?.msg || "OKX error");
  return res.data.data;
}

export function parseOKXCandles(raw: string[][]): Candle[] {
  return raw
    .map((c) => ({
      timestamp: parseInt(c[0]),
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      vol: parseFloat(c[5]),
      confirmed: c[8] === "1",
    }))
    .reverse(); // oldest-first
}

// ─── OKX: Ticker ─────────────────────────────────────────────────────────────

export async function fetchOKXTicker(asset: Asset) {
  const inst = OKX_INST[asset];
  if (!inst) return null;
  const data = await okxGet(`/api/v5/market/ticker?instId=${inst}`);
  return data?.[0] ?? null;
}

// ─── OKX: Klines ─────────────────────────────────────────────────────────────

export async function fetchOKXKlines(
  asset: Asset,
  bar: string,
  limit = 100
): Promise<Candle[]> {
  const inst = OKX_INST[asset];
  if (!inst) return [];
  const data = await okxGet(
    `/api/v5/market/candles?instId=${inst}&bar=${bar}&limit=${limit}`
  );
  return parseOKXCandles(data ?? []);
}

// ─── OKX: Funding rate ──────────────────────────────────────────────────────

export async function fetchOKXFunding(asset: Asset) {
  const inst = OKX_INST[asset];
  if (!inst) return null;
  const data = await okxGet(`/api/v5/public/funding-rate?instId=${inst}`);
  return data?.[0] ?? null;
}

// ─── CoinGecko: Market data ─────────────────────────────────────────────────

const GECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  GOLD: "gold", // tether-gold or pax-gold fallback handled below
};

export async function fetchGeckoMarket(asset: Asset) {
  let id = GECKO_IDS[asset];
  if (!id) return null;

  // CoinGecko doesn't have a "gold" commodity — use pax-gold as proxy for trend data
  if (asset === "GOLD") id = "pax-gold";

  const res = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false`,
    { timeout: TIMEOUT }
  );
  return res.data?.market_data ?? null;
}

// ─── Gate.io: Ticker (backup) ───────────────────────────────────────────────

export async function fetchGateTicker(asset: Asset) {
  const pair =
    asset === "BTC"
      ? "BTC_USDT"
      : asset === "ETH"
        ? "ETH_USDT"
        : null;
  if (!pair) return null;
  const res = await axios.get(
    `https://api.gateio.ws/api/v4/spot/tickers?currency_pair=${pair}`,
    { timeout: TIMEOUT }
  );
  return res.data?.[0] ?? null;
}

// ─── Gold: OHLCV via Yahoo Finance ──────────────────────────────────────────

function parseYahooCandles(chart: any): Candle[] {
  const result = chart?.chart?.result?.[0];
  if (!result) return [];
  const ts = result.timestamp ?? [];
  const q = result.indicators?.quote?.[0];
  if (!q) return [];
  const candles: Candle[] = [];
  for (let i = 0; i < ts.length; i++) {
    if (q.open[i] == null) continue;
    candles.push({
      timestamp: ts[i] * 1000,
      open: q.open[i],
      high: q.high[i],
      low: q.low[i],
      close: q.close[i],
      vol: q.volume?.[i] ?? 0,
      confirmed: i < ts.length - 1,
    });
  }
  return candles;
}

export async function fetchGoldKlines(
  interval: string,
  range: string
): Promise<Candle[]> {
  try {
    const res = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=${interval}&range=${range}`,
      { timeout: TIMEOUT, headers: { "User-Agent": UA } }
    );
    return parseYahooCandles(res.data);
  } catch {
    return [];
  }
}

export async function fetchGoldTicker() {
  try {
    const res = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=1d&range=5d`,
      { timeout: TIMEOUT, headers: { "User-Agent": UA } }
    );
    const result = res.data?.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta) return null;
    return {
      last: meta.regularMarketPrice,
      high24h: meta.regularMarketDayHigh ?? meta.regularMarketPrice * 1.005,
      low24h: meta.regularMarketDayLow ?? meta.regularMarketPrice * 0.995,
      vol24h: meta.regularMarketVolume ?? 0,
    };
  } catch {
    return null;
  }
}

// ─── CoinGlass: OI / Funding / Liquidation ──────────────────────────────────

const CG_BASE = "https://open-api-v3.coinglass.com";

async function coinglassGet(path: string) {
  const key = process.env.COINGLASS_API_KEY;
  if (!key) return null;
  const res = await axios.get(`${CG_BASE}${path}`, {
    timeout: TIMEOUT,
    headers: { "coinglassSecret": key, "User-Agent": UA },
  });
  if (res.data?.code !== "0" && res.data?.success !== true) return null;
  return res.data?.data ?? null;
}

export async function fetchCoinglassOI(asset: Asset) {
  if (asset === "GOLD") return null;
  return coinglassGet(
    `/api/futures/openInterest/chart?symbol=${asset}&interval=0&type=1`
  );
}

export async function fetchCoinglassLiquidation(asset: Asset) {
  if (asset === "GOLD") return null;
  return coinglassGet(
    `/api/futures/liquidation/detail/chart?symbol=${asset}&type=1`
  );
}

export async function fetchCoinglassLSRatio(asset: Asset) {
  if (asset === "GOLD") return null;
  return coinglassGet(
    `/api/futures/globalLongShortAccountRatio/history?symbol=${asset}&interval=1`
  );
}

// ─── News: RSS feeds ─────────────────────────────────────────────────────────

interface RSSItem {
  title: string;
  source: string;
  pubDate: string;
}

function extractRSSItems(xml: string, source: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemBlocks = xml.split("<item>").slice(1);
  for (const block of itemBlocks.slice(0, 15)) {
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]>/)?.[1] ??
      block.match(/<title>(.*?)<\/title>/)?.[1] ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
    if (title) items.push({ title: decodeEntities(title.trim()), source, pubDate });
  }
  return items;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

const RSS_FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml", name: "BBC Business" },
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", name: "CNBC World" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", name: "CoinDesk" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", name: "NYT Business" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC World" },
];

export async function fetchNewsHeadlines(): Promise<RSSItem[]> {
  const all: RSSItem[] = [];

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const res = await axios.get(feed.url, {
        timeout: 8000,
        headers: { "User-Agent": UA },
        responseType: "text",
      });
      return extractRSSItems(res.data, feed.name);
    })
  );

  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  return all;
}

// ─── Master fetch orchestrator ───────────────────────────────────────────────

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
  newsHeadlines: RSSItem[];
  sources: SourceStatus[];
}

export async function fetchAll(asset: Asset): Promise<FetchResult> {
  const sources: SourceStatus[] = [];
  const isCrypto = asset === "BTC" || asset === "ETH";
  const isGold = asset === "GOLD";

  // Parallel fetch everything
  const [
    tickerR, k4hR, k15mR, kDayR, fundingR, geckoR,
    cgOIR, cgLiqR, cgLSR, newsR, gateR
  ] = await Promise.allSettled([
    isCrypto ? fetchOKXTicker(asset) : fetchGoldTicker(),
    isCrypto ? fetchOKXKlines(asset, "4H", 100) : fetchGoldKlines("1h", "20d"),
    isCrypto ? fetchOKXKlines(asset, "15m", 100) : fetchGoldKlines("15m", "5d"),
    isCrypto ? fetchOKXKlines(asset, "1D", 100) : fetchGoldKlines("1d", "6mo"),
    isCrypto ? fetchOKXFunding(asset) : Promise.resolve(null),
    fetchGeckoMarket(asset),
    fetchCoinglassOI(asset),
    fetchCoinglassLiquidation(asset),
    fetchCoinglassLSRatio(asset),
    fetchNewsHeadlines(),
    isCrypto ? fetchGateTicker(asset) : Promise.resolve(null),
  ]);

  // Build source status
  const ok = (r: PromiseSettledResult<any>, name: string) => {
    const val = r.status === "fulfilled" ? r.value : null;
    const hasData = val !== null && val !== undefined && (Array.isArray(val) ? val.length > 0 : true);
    sources.push({
      name,
      status: hasData ? "ok" : "failed",
      detail: hasData ? "Veri alındı" : r.status === "rejected" ? (r.reason?.message ?? "Hata") : "Veri yok",
    });
    return hasData ? val : (Array.isArray(val) ? [] : null);
  };

  const ticker = ok(tickerR, isGold ? "Yahoo Finance (Gold)" : `OKX ${asset} Ticker`);
  const klines4h = ok(k4hR, isGold ? "Yahoo Finance 4H" : `OKX ${asset} 4H`) ?? [];
  const klines15m = ok(k15mR, isGold ? "Yahoo Finance 15M" : `OKX ${asset} 15M`) ?? [];
  const klinesDaily = ok(kDayR, isGold ? "Yahoo Finance Daily" : `OKX ${asset} Daily`) ?? [];
  const funding = ok(fundingR, isCrypto ? `OKX ${asset} Funding` : "Funding (N/A Gold)");
  const gecko = ok(geckoR, `CoinGecko ${asset}`);
  const coinglassOI = ok(cgOIR, "CoinGlass OI");
  const coinglassLiq = ok(cgLiqR, "CoinGlass Liquidation");
  const coinglassLS = ok(cgLSR, "CoinGlass Long/Short");
  const newsHeadlines = ok(newsR, "News RSS Feeds") ?? [];

  // Gate.io as backup ticker
  if (!ticker && gateR.status === "fulfilled" && gateR.value) {
    sources.push({ name: `Gate.io ${asset} (backup)`, status: "ok", detail: "Backup ticker" });
  }

  return {
    ticker,
    klines4h: Array.isArray(klines4h) ? klines4h : [],
    klines15m: Array.isArray(klines15m) ? klines15m : [],
    klinesDaily: Array.isArray(klinesDaily) ? klinesDaily : [],
    funding,
    gecko,
    coinglassOI,
    coinglassLiq,
    coinglassLS,
    newsHeadlines: Array.isArray(newsHeadlines) ? newsHeadlines : [],
    sources,
  };
}
