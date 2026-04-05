/**
 * Browser-side data fetchers — uses native browser fetch API.
 * All external APIs have CORS headers allowing browser access.
 * This module MUST NOT be imported by server-side code.
 */
import type { Asset, Candle, FetchResult, SourceStatus } from "./types";

const TIMEOUT = 10000;

function abort() {
  return typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
    ? AbortSignal.timeout(TIMEOUT)
    : undefined;
}

// ─── OKX helpers (BTC / ETH) ─────────────────────────────────────────────────

const OKX = "https://www.okx.com";
const OKX_INST: Record<string, string> = {
  BTC: "BTC-USDT-SWAP",
  ETH: "ETH-USDT-SWAP",
};

async function okxGet(path: string) {
  const res = await fetch(`${OKX}${path}`, { signal: abort() });
  const json = await res.json();
  if (json.code !== "0") throw new Error(json.msg ?? "OKX error");
  return json.data as any[];
}

function parseOKXCandles(raw: string[][]): Candle[] {
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
    .reverse(); // OKX returns newest-first; reverse to oldest-first
}

async function fetchOKXTicker(asset: "BTC" | "ETH") {
  const data = await okxGet(`/api/v5/market/ticker?instId=${OKX_INST[asset]}`);
  return data[0] ?? null;
}

async function fetchOKXKlines(asset: "BTC" | "ETH", bar: string, limit = 100): Promise<Candle[]> {
  const data = await okxGet(
    `/api/v5/market/candles?instId=${OKX_INST[asset]}&bar=${bar}&limit=${limit}`
  );
  return parseOKXCandles(data as unknown as string[][]);
}

async function fetchOKXFunding(asset: "BTC" | "ETH") {
  const data = await okxGet(`/api/v5/public/funding-rate?instId=${OKX_INST[asset]}`);
  return data[0] ?? null;
}

async function fetchOKXOpenInterest(asset: "BTC" | "ETH") {
  const uly = asset === "BTC" ? "BTC-USDT" : "ETH-USDT";
  const data = await okxGet(`/api/v5/public/open-interest?instType=SWAP&uly=${uly}`);
  return data[0] ?? null; // { oi, oiCcy, oiUsd, ts }
}

// OI history for 24h change — returns array [[ts, oi, vol], ...]
async function fetchOKXOIHistory(asset: "BTC" | "ETH") {
  const ccy = asset === "BTC" ? "BTC" : "ETH";
  const data = await okxGet(`/api/v5/rubik/stat/contracts/open-interest-volume?ccy=${ccy}&period=1H`);
  // data[0] = latest, data[-1] = oldest; each entry is [ts, oi, vol]
  if (!data || data.length < 2) return null;
  const latest = parseFloat(data[0][1]);
  // find entry ~24h ago
  const tsNow = parseInt(data[0][0]);
  const ts24h = tsNow - 24 * 3600 * 1000;
  const old = data.find((d: string[]) => parseInt(d[0]) <= ts24h);
  const oldOI = old ? parseFloat(old[1]) : parseFloat(data[data.length - 1][1]);
  return { latest, oldOI };
}

async function fetchOKXLongShort(asset: "BTC" | "ETH") {
  const ccy = asset === "BTC" ? "BTC" : "ETH";
  const data = await okxGet(`/api/v5/rubik/stat/contracts/long-short-account-ratio?ccy=${ccy}&period=1H`);
  // returns [[ts, ratio], ...] newest first — take latest
  return data[0] ? { ts: data[0][0], ratio: parseFloat(data[0][1]) } : null;
}

// ─── CoinGecko helpers ───────────────────────────────────────────────────────

const GECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  GOLD: "pax-gold", // PAX Gold (PAXG) tracks 1 troy oz of gold
};

async function fetchGeckoMarket(asset: Asset) {
  const id = GECKO_IDS[asset];
  if (!id) return null;
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false`,
    { signal: abort() }
  );
  const json = await res.json();
  if (json.status?.error_code) throw new Error(`CoinGecko: ${json.status.error_message}`);
  return json?.market_data ?? null;
}

// CoinGecko OHLC endpoint — granularity depends on days:
// days=1 → ~30m, days≤7 → 4H, days≤90 → daily
async function fetchGeckoOHLC(asset: Asset, days: number): Promise<Candle[]> {
  const id = GECKO_IDS[asset];
  if (!id) return [];
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${days}`,
    { signal: abort() }
  );
  const raw = await res.json();
  if (!Array.isArray(raw)) return [];
  return raw.map((c: number[], i: number) => ({
    timestamp: c[0],
    open: c[1],
    high: c[2],
    low: c[3],
    close: c[4],
    vol: 0,
    confirmed: i < raw.length - 1,
  }));
}

// Fallback: CoinGecko market_chart (hourly prices → synthesize pseudo-4H candles)
async function fetchGeckoChartCandles(asset: Asset, days: number, groupHours = 4): Promise<Candle[]> {
  const id = GECKO_IDS[asset];
  if (!id) return [];
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`,
    { signal: abort() }
  );
  const json = await res.json();
  const prices: number[][] = json?.prices ?? [];
  if (!prices.length) return [];

  // Group hourly data into pseudo-OHLCV candles
  const candles: Candle[] = [];
  for (let i = 0; i < prices.length - groupHours; i += groupHours) {
    const group = prices.slice(i, i + groupHours);
    const open = group[0][1];
    const close = group[group.length - 1][1];
    const high = Math.max(...group.map((p) => p[1]));
    const low = Math.min(...group.map((p) => p[1]));
    candles.push({
      timestamp: group[0][0],
      open, high, low, close, vol: 0,
      confirmed: i + groupHours < prices.length,
    });
  }
  return candles;
}

// ─── News via allorigins CORS proxy ─────────────────────────────────────────

const CORS_PROXY = "https://api.allorigins.win/get?url=";

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
    const rawTitle = cdataMatch?.[1] ?? plainMatch?.[1] ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
    const title = rawTitle.trim()
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    if (title) items.push({ title, source, pubDate });
  }
  return items;
}

const RSS_FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml", name: "BBC Business" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", name: "BBC World" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", name: "CoinDesk" },
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", name: "CNBC" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml", name: "NYT Business" },
];

async function fetchNewsHeadlines(): Promise<RSSItem[]> {
  const all: RSSItem[] = [];
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const res = await fetch(`${CORS_PROXY}${encodeURIComponent(feed.url)}`, {
        signal: abort(),
      });
      const json = await res.json();
      return extractRSSItems(json?.contents ?? "", feed.name);
    })
  );
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }
  return all;
}

// ─── Gold fetcher (CoinGecko PAX Gold with fallbacks) ────────────────────────

async function fetchGoldData() {
  const market = await fetchGeckoMarket("GOLD");
  const ticker = market
    ? {
        last: market.current_price?.usd ?? 0,
        high_24h: market.high_24h?.usd ?? 0,
        low_24h: market.low_24h?.usd ?? 0,
        vol24h: market.total_volume?.usd ?? 0,
      }
    : null;

  // Try OHLC first, fall back to market_chart
  let klines4h: Candle[] = await fetchGeckoOHLC("GOLD", 7);
  if (!klines4h.length) klines4h = await fetchGeckoChartCandles("GOLD", 7, 4);

  let klines15m: Candle[] = await fetchGeckoOHLC("GOLD", 1);
  if (!klines15m.length) klines15m = await fetchGeckoChartCandles("GOLD", 1, 1);

  let klinesDaily: Candle[] = await fetchGeckoOHLC("GOLD", 90);
  if (!klinesDaily.length) klinesDaily = await fetchGeckoChartCandles("GOLD", 90, 24);

  // Return market too so the orchestrator can reuse it (avoids a second API call)
  return { ticker, market, klines4h, klines15m, klinesDaily };
}

// ─── Master orchestrator ─────────────────────────────────────────────────────

export async function fetchAllBrowser(asset: Asset): Promise<FetchResult> {
  const sources: SourceStatus[] = [];
  const isCrypto = asset === "BTC" || asset === "ETH";

  function track<T>(r: PromiseSettledResult<T>, name: string, fallback: T): T {
    const val = r.status === "fulfilled" ? r.value : null;
    const ok =
      val !== null &&
      val !== undefined &&
      (Array.isArray(val) ? (val as unknown[]).length > 0 : true);
    sources.push({
      name,
      status: ok ? "ok" : "failed",
      detail: ok
        ? Array.isArray(val)
          ? `${(val as unknown[]).length} kayıt`
          : "Veri alındı"
        : r.status === "rejected"
          ? String((r as PromiseRejectedResult).reason?.message ?? "Hata").slice(0, 100)
          : "Boş / hatalı veri",
    });
    return (ok ? val : fallback) as T;
  }

  let results: [
    PromiseSettledResult<any>,
    PromiseSettledResult<Candle[]>,
    PromiseSettledResult<Candle[]>,
    PromiseSettledResult<Candle[]>,
    PromiseSettledResult<any>,
    PromiseSettledResult<any>,
    PromiseSettledResult<RSSItem[]>,
    PromiseSettledResult<any>,
    PromiseSettledResult<any>,
    PromiseSettledResult<any>,
  ];

  if (isCrypto) {
    results = await Promise.allSettled([
      fetchOKXTicker(asset as "BTC" | "ETH"),
      fetchOKXKlines(asset as "BTC" | "ETH", "4H", 100),
      fetchOKXKlines(asset as "BTC" | "ETH", "15m", 100),
      fetchOKXKlines(asset as "BTC" | "ETH", "1D", 200),
      fetchOKXFunding(asset as "BTC" | "ETH"),
      fetchGeckoMarket(asset),
      fetchNewsHeadlines(),
      fetchOKXOpenInterest(asset as "BTC" | "ETH"),
      fetchOKXLongShort(asset as "BTC" | "ETH"),
      fetchOKXOIHistory(asset as "BTC" | "ETH"),
    ]) as typeof results;
  } else {
    // Gold: sequential OHLC fetches to avoid CoinGecko rate limiting;
    // market data is fetched once inside fetchGoldData and reused for gecko field
    const goldData = await fetchGoldData().catch(() => ({
      ticker: null, market: null,
      klines4h: [] as Candle[], klines15m: [] as Candle[], klinesDaily: [] as Candle[],
    }));
    const [newsR] = await Promise.allSettled([fetchNewsHeadlines()]);

    return {
      ticker: goldData.ticker,
      klines4h: goldData.klines4h,
      klines15m: goldData.klines15m,
      klinesDaily: goldData.klinesDaily,
      funding: null,
      gecko: goldData.market,   // reuse — no second CoinGecko call
      coinglassOI: null,
      coinglassLiq: null,
      coinglassLS: null,
      newsHeadlines: newsR.status === "fulfilled" ? newsR.value : [],
      sources: [
        { name: "CoinGecko Gold (PAXG) Ticker", status: goldData.ticker ? "ok" : "failed", detail: goldData.ticker ? "Veri alındı" : "Hata" },
        { name: "CoinGecko Gold 4H OHLC", status: goldData.klines4h.length ? "ok" : "failed", detail: goldData.klines4h.length ? `${goldData.klines4h.length} kayıt` : "Hata" },
        { name: "CoinGecko Gold ~30M OHLC", status: goldData.klines15m.length ? "ok" : "failed", detail: goldData.klines15m.length ? `${goldData.klines15m.length} kayıt` : "Hata" },
        { name: "CoinGecko Gold Daily", status: goldData.klinesDaily.length ? "ok" : "failed", detail: goldData.klinesDaily.length ? `${goldData.klinesDaily.length} kayıt` : "Hata" },
        { name: "Funding Rate", status: "failed", detail: "Altın için geçerli değil" },
        { name: "CoinGecko Market Data", status: goldData.market ? "ok" : "failed", detail: goldData.market ? "Veri alındı (yeniden kullanıldı)" : "Hata" },
        { name: "RSS News (CORS proxy)", status: newsR.status === "fulfilled" && (newsR.value as RSSItem[]).length ? "ok" : "failed", detail: newsR.status === "fulfilled" ? `${(newsR.value as RSSItem[]).length} haber` : "Hata" },
        { name: "CoinGlass OI", status: "failed", detail: "API key gerekli" },
        { name: "CoinGlass Liquidation", status: "failed", detail: "API key gerekli" },
        { name: "CoinGlass L/S Ratio", status: "failed", detail: "API key gerekli" },
      ],
    };
  }

  const [tickerR, k4hR, k15mR, kDayR, fundingR, geckoR, newsR, oiR, lsR, oiHistR] = results;
  const prefix = `OKX ${asset}`;

  return {
    ticker: track(tickerR, `${prefix} Ticker`, null),
    klines4h: track(k4hR, `${prefix} 4H (100 bar)`, [] as Candle[]),
    klines15m: track(k15mR, `${prefix} 15M (100 bar)`, [] as Candle[]),
    klinesDaily: track(kDayR, `${prefix} Daily (200 bar)`, [] as Candle[]),
    funding: track(fundingR, `OKX ${asset} Funding Rate`, null),
    gecko: track(geckoR, `CoinGecko ${asset}`, null),
    coinglassOI: (() => {
      const oi = oiR.status === "fulfilled" ? oiR.value : null;
      const hist = oiHistR.status === "fulfilled" ? oiHistR.value : null;
      return oi ? { ...oi, history: hist } : null;
    })(),
    coinglassLiq: null,
    coinglassLS: track(lsR, `OKX ${asset} L/S Ratio`, null),
    newsHeadlines: track(newsR, "RSS Feeds (allorigins CORS proxy)", [] as RSSItem[]),
    sources: [
      ...sources,
      { name: "CoinGlass Liquidation", status: "failed" as const, detail: "API key gerekli" },
    ],
  };
}
