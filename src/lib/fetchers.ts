import axios from "axios";
import type { Asset, Candle, SourceStatus, FetchResult } from "./types";

const TIMEOUT = 10000;
// Full browser headers to avoid 403 on strict APIs
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
};

// ─── Gate.io Futures helpers ─────────────────────────────────────────────────

const GATE_CONTRACT: Record<string, string> = {
  BTC: "BTC_USDT",
  ETH: "ETH_USDT",
};

const GATE_BASE = "https://api.gateio.ws/api/v4/futures/usdt";

async function gateGet(path: string) {
  const res = await axios.get(`${GATE_BASE}${path}`, {
    timeout: TIMEOUT,
    headers: HEADERS,
  });
  return res.data;
}

// Gate.io candle format: {t (seconds), o, h, l, c, v, sum}
function parseGateCandles(data: any[]): Candle[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((c) => ({
      timestamp: c.t * 1000, // seconds → ms
      open: parseFloat(c.o),
      high: parseFloat(c.h),
      low: parseFloat(c.l),
      close: parseFloat(c.c),
      vol: parseFloat(c.v),
      confirmed: true,
    }))
    .sort((a, b) => a.timestamp - b.timestamp); // oldest-first
}

// ─── Gate.io: Ticker ─────────────────────────────────────────────────────────

export async function fetchGateFuturesTicker(asset: Asset) {
  const contract = GATE_CONTRACT[asset];
  if (!contract) return null;
  const data = await gateGet(`/tickers?contract=${contract}`);
  return Array.isArray(data) ? data[0] : data;
}

// ─── Gate.io: Klines ─────────────────────────────────────────────────────────

// Gate.io intervals: 10s, 1m, 5m, 15m, 30m, 1h, 4h, 8h, 1d, 7d, 30d
export async function fetchGateKlines(asset: Asset, interval: string, limit = 100): Promise<Candle[]> {
  const contract = GATE_CONTRACT[asset];
  if (!contract) return [];
  const data = await gateGet(`/candlesticks?contract=${contract}&interval=${interval}&limit=${limit}`);
  return parseGateCandles(data ?? []);
}

// ─── Gate.io: Funding Rate ───────────────────────────────────────────────────

export async function fetchGateFunding(asset: Asset) {
  const contract = GATE_CONTRACT[asset];
  if (!contract) return null;
  const data = await gateGet(`/tickers?contract=${contract}`);
  const ticker = Array.isArray(data) ? data[0] : data;
  if (!ticker) return null;
  return {
    fundingRate: ticker.funding_rate ?? "0",
    nextFundingTime: ticker.funding_next_apply ?? null,
  };
}

// ─── Gate.io: Long/Short Ratio ───────────────────────────────────────────────

export async function fetchGateLSRatio(asset: Asset) {
  try {
    const contract = GATE_CONTRACT[asset];
    if (!contract) return null;
    const data = await gateGet(`/liq_orders?contract=${contract}&status=filled&limit=100`);
    return data; // approximate from liquidation data
  } catch {
    return null;
  }
}

// ─── CoinGecko: Market data ──────────────────────────────────────────────────

const GECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  GOLD: "pax-gold", // PAX Gold tracks gold price
};

export async function fetchGeckoMarket(asset: Asset) {
  const id = GECKO_IDS[asset];
  if (!id) return null;
  const res = await axios.get(
    `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false`,
    { timeout: TIMEOUT, headers: HEADERS }
  );
  return res.data?.market_data ?? null;
}

// ─── Yahoo Finance: Gold OHLCV ───────────────────────────────────────────────

function parseYahooCandles(data: any): Candle[] {
  const result = data?.chart?.result?.[0];
  if (!result) return [];
  const ts: number[] = result.timestamp ?? [];
  const q = result.indicators?.quote?.[0];
  if (!q) return [];
  const candles: Candle[] = [];
  for (let i = 0; i < ts.length; i++) {
    if (q.open?.[i] == null || q.close?.[i] == null) continue;
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
  return candles.sort((a, b) => a.timestamp - b.timestamp);
}

async function yahooChart(symbol: string, interval: string, range: string): Promise<any> {
  const res = await axios.get(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`,
    { timeout: TIMEOUT, headers: HEADERS }
  );
  return res.data;
}

export async function fetchGoldKlines(interval: string, range: string): Promise<Candle[]> {
  const data = await yahooChart("GC=F", interval, range);
  return parseYahooCandles(data);
}

export async function fetchGoldTicker() {
  const data = await yahooChart("GC=F", "1d", "5d");
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) return null;
  return {
    last: meta.regularMarketPrice,
    high24h: meta.regularMarketDayHigh ?? meta.regularMarketPrice * 1.005,
    low24h: meta.regularMarketDayLow ?? meta.regularMarketPrice * 0.995,
    vol24h: meta.regularMarketVolume ?? 0,
  };
}

// ─── CoinGlass: OI / Liquidation / L/S ──────────────────────────────────────

async function coinglassGet(path: string) {
  const key = process.env.COINGLASS_API_KEY;
  if (!key) return null;
  const res = await axios.get(`https://open-api-v3.coinglass.com${path}`, {
    timeout: TIMEOUT,
    headers: { ...HEADERS, "coinglassSecret": key },
  });
  if (!res.data?.data) return null;
  return res.data.data;
}

export async function fetchCoinglassOI(asset: Asset) {
  if (asset === "GOLD") return null;
  return coinglassGet(`/api/futures/openInterest/chart?symbol=${asset}&interval=0&type=1`);
}

export async function fetchCoinglassLiquidation(asset: Asset) {
  if (asset === "GOLD") return null;
  return coinglassGet(`/api/futures/liquidation/detail/chart?symbol=${asset}&type=1`);
}

export async function fetchCoinglassLSRatio(asset: Asset) {
  if (asset === "GOLD") return null;
  return coinglassGet(`/api/futures/globalLongShortAccountRatio/history?symbol=${asset}&interval=1`);
}

// ─── News: RSS feeds ─────────────────────────────────────────────────────────

interface RSSItem {
  title: string;
  source: string;
  pubDate: string;
}

function extractRSSItems(xml: string, source: string): RSSItem[] {
  const items: RSSItem[] = [];
  const blocks = xml.split(/<item[\s>]/i).slice(1);
  for (const block of blocks.slice(0, 12)) {
    const cdataMatch = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]>/);
    const plainMatch = block.match(/<title>([\s\S]*?)<\/title>/);
    const title = cdataMatch?.[1] ?? plainMatch?.[1] ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
    if (title.trim())
      items.push({ title: decodeXML(title.trim()), source, pubDate });
  }
  return items;
}

function decodeXML(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#\d+;/g, "");
}

const RSS_FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml", name: "BBC Business" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC World" },
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", name: "CNBC World" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", name: "NYT Business" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", name: "CoinDesk" },
];

export async function fetchNewsHeadlines(): Promise<RSSItem[]> {
  const all: RSSItem[] = [];
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (f) => {
      const res = await axios.get(f.url, {
        timeout: 8000,
        headers: { "User-Agent": HEADERS["User-Agent"] },
        maxRedirects: 5,
        responseType: "text",
      });
      return extractRSSItems(res.data, f.name);
    })
  );
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }
  return all;
}

// ─── Master fetch orchestrator ───────────────────────────────────────────────

export async function fetchAll(asset: Asset): Promise<FetchResult> {
  const sources: SourceStatus[] = [];
  const isCrypto = asset === "BTC" || asset === "ETH";

  const [tickerR, k4hR, k15mR, kDayR, fundingR, geckoR, cgOIR, cgLiqR, cgLSR, newsR] =
    await Promise.allSettled([
      isCrypto ? fetchGateFuturesTicker(asset) : fetchGoldTicker(),
      isCrypto ? fetchGateKlines(asset, "4h", 100) : fetchGoldKlines("1h", "20d"),
      isCrypto ? fetchGateKlines(asset, "15m", 100) : fetchGoldKlines("15m", "5d"),
      isCrypto ? fetchGateKlines(asset, "1d", 200) : fetchGoldKlines("1d", "6mo"),
      isCrypto ? fetchGateFunding(asset) : Promise.resolve(null),
      fetchGeckoMarket(asset),
      fetchCoinglassOI(asset),
      fetchCoinglassLiquidation(asset),
      fetchCoinglassLSRatio(asset),
      fetchNewsHeadlines(),
    ]);

  function pick<T>(r: PromiseSettledResult<T>, name: string, fallback: T): T {
    const val = r.status === "fulfilled" ? r.value : null;
    const hasData = val !== null && val !== undefined &&
      (Array.isArray(val) ? (val as any[]).length > 0 : true);
    sources.push({
      name,
      status: hasData ? "ok" : "failed",
      detail: hasData
        ? Array.isArray(val)
          ? `${(val as any[]).length} kayıt`
          : "Veri alındı"
        : r.status === "rejected"
          ? String((r as PromiseRejectedResult).reason?.message ?? "Hata").slice(0, 80)
          : "Veri yok",
    });
    return (hasData ? val : fallback) as T;
  }

  return {
    ticker: pick(tickerR, isCrypto ? `Gate.io ${asset} Ticker` : "Yahoo Finance Gold", null),
    klines4h: pick(k4hR, isCrypto ? `Gate.io ${asset} 4H` : "Yahoo Finance Gold 1H", [] as Candle[]),
    klines15m: pick(k15mR, isCrypto ? `Gate.io ${asset} 15M` : "Yahoo Finance Gold 15M", [] as Candle[]),
    klinesDaily: pick(kDayR, isCrypto ? `Gate.io ${asset} Daily` : "Yahoo Finance Gold Daily", [] as Candle[]),
    funding: pick(fundingR, isCrypto ? `Gate.io ${asset} Funding` : "Funding (N/A)", null),
    gecko: pick(geckoR, `CoinGecko ${asset}`, null),
    coinglassOI: pick(cgOIR, "CoinGlass OI", null),
    coinglassLiq: pick(cgLiqR, "CoinGlass Liquidation", null),
    coinglassLS: pick(cgLSR, "CoinGlass L/S Ratio", null),
    newsHeadlines: pick(newsR, "News RSS Feeds", [] as RSSItem[]),
    sources,
  };
}
