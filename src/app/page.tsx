"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { AnalysisReport, SparkCandle, Zone } from "@/lib/types";
import { fetchAllBrowser } from "@/lib/browser-fetchers";
import { buildReport, fmt } from "@/lib/report";

type Asset = "BTC" | "ETH" | "GOLD";

function getCurrentSession(): { label: string; color: string } {
  const h = new Date().getUTCHours();
  if (h >= 0 && h < 8)   return { label: "Asia",     color: "text-violet-400" };
  if (h >= 8 && h < 12)  return { label: "London",   color: "text-blue-400" };
  if (h >= 12 && h < 13) return { label: "Overlap",  color: "text-cyan-400" };
  if (h >= 13 && h < 17) return { label: "New York", color: "text-emerald-400" };
  if (h >= 17 && h < 21) return { label: "NY Close", color: "text-amber-400" };
  return { label: "Off-hrs", color: "text-slate-500" };
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [asset, setAsset] = useState<Asset>("BTC");
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [allReports, setAllReports] = useState<Partial<Record<Asset, AnalysisReport>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const REFRESH_SECS = 300; // 5 minutes
  const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

  // Keep a ref so analyze() always sees the latest asset without being recreated
  const assetRef = useRef<Asset>(asset);
  assetRef.current = asset;
  const cacheRef = useRef<Map<Asset, { report: AnalysisReport; ts: number }>>(new Map());

  const analyze = useCallback(async (force = false, forAsset?: Asset) => {
    const a = forAsset ?? assetRef.current;
    if (forAsset && forAsset !== assetRef.current) {
      setAsset(forAsset);
      assetRef.current = forAsset;
    }
    const cached = cacheRef.current.get(a);
    if (!force && cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      setReport(cached.report);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllBrowser(a);
      const result = buildReport(a, data);
      cacheRef.current.set(a, { report: result, ts: Date.now() });
      setReport(result);
      setAllReports(prev => ({ ...prev, [a]: result }));
    } catch (e: any) {
      setError(e.message ?? "Analiz sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countRef.current) clearInterval(countRef.current);
      setCountdown(0);
      return;
    }
    setCountdown(REFRESH_SECS);
    timerRef.current = setInterval(() => {
      analyze(true); // force past cache on scheduled refresh
      setCountdown(REFRESH_SECS);
    }, REFRESH_SECS * 1000);
    countRef.current = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countRef.current) clearInterval(countRef.current);
    };
  }, [autoRefresh, analyze]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          Trade<span className="text-blue-400">Code</span>
          <span className="text-sm font-normal text-slate-400 ml-2">SMC Analyzer</span>
        </h1>
        <span className="text-xs text-slate-600 bg-slate-800 px-2 py-1 rounded">
          Canlı veri · Tahmin yok
        </span>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {(["BTC", "ETH", "GOLD"] as Asset[]).map((a) => (
          <button
            key={a}
            onClick={() => { setAsset(a); setReport(null); }}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              asset === a
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {a === "BTC" ? "₿ Bitcoin" : a === "ETH" ? "Ξ Ethereum" : "◈ Altın (XAU)"}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              autoRefresh
                ? "bg-blue-700 text-blue-100 hover:bg-blue-600"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
            title="5 dakikada bir otomatik yenile"
          >
            {autoRefresh ? `↻ ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}` : "↻ Oto"}
          </button>
          <button
            onClick={() => analyze(true)}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Veri çekiliyor...
              </>
            ) : (
              "Analiz Et"
            )}
          </button>
        </div>
      </div>

      {/* ── Multi-asset overview strip ───────────────── */}
      {Object.keys(allReports).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {(["BTC", "ETH", "GOLD"] as Asset[]).map((a) => {
            const r = allReports[a];
            if (!r) return null;
            const isActive = a === asset;
            const decColor =
              r.decision === "LONG" ? "text-emerald-400 border-emerald-800/60" :
              r.decision === "SHORT" ? "text-rose-400 border-rose-800/60" :
              "text-amber-400 border-amber-800/60";
            const bg = isActive ? "bg-slate-700/60" : "bg-slate-900/80 hover:bg-slate-800/60";
            return (
              <button
                key={a}
                onClick={() => { setAsset(a); setReport(r); }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${decColor} ${bg} transition-all text-xs`}
              >
                <span className="text-slate-400 font-medium">{a === "GOLD" ? "XAU" : a}</span>
                <span className="font-mono font-bold">${fmt(r.currentPrice)}</span>
                <span className={`font-bold ${r.change24h.startsWith("-") ? "text-rose-400" : "text-emerald-400"}`}>{r.change24h}%</span>
                <span className="font-semibold">{r.decision}</span>
                <span className="text-slate-500">{r.confidence}/10</span>
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {loading && <LoadingSkeleton />}
      {report && !loading && <ReportView report={report} />}

      {!report && !loading && !error && (
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          {([
            { a: "BTC" as Asset, icon: "₿", label: "Bitcoin", tip: "OKX Futures · 4H/15M yapı · OI + L/S oranı · Funding rate · FVG · AMD modeli" },
            { a: "ETH" as Asset, icon: "Ξ", label: "Ethereum", tip: "OKX Futures · BTC ile korelasyon gözetilir · Supply/Demand zone · Volume Profile" },
            { a: "GOLD" as Asset, icon: "◈", label: "Altın (XAU)", tip: "CoinGecko PAXG proxy · Makro/savaş haberleri yüksek ağırlıklı · Uzun vadeli plan" },
          ]).map(({ a, icon, label, tip }) => (
            <button
              key={a}
              onClick={() => analyze(true, a)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-5 text-left transition-all group"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className="font-semibold text-slate-200 mb-1 group-hover:text-white transition-colors">{label}</div>
              <div className="text-xs text-slate-500">{tip}</div>
              <div className="mt-3 text-xs text-emerald-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Analiz Et →
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}

// ─── Loading ──────────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[200, 300, 250, 180].map((h, i) => (
        <div key={i} className="bg-slate-900 rounded-xl border border-slate-800" style={{ height: h }} />
      ))}
    </div>
  );
}

// ─── Report ───────────────────────────────────────────────────────────────────

function ReportView({ report: r }: { report: AnalysisReport }) {
  const [newsOpen, setNewsOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const bc = (b: string) =>
    b === "bullish" ? "text-emerald-400" : b === "bearish" ? "text-rose-400" : "text-amber-400";
  const bl = (b: string) =>
    b === "bullish" ? "BULLISH ↑" : b === "bearish" ? "BEARISH ↓" : "NEUTRAL →";
  const decBg =
    r.decision === "LONG"
      ? "from-emerald-900/80 to-emerald-950 border-emerald-700"
      : r.decision === "SHORT"
        ? "from-rose-900/80 to-rose-950 border-rose-700"
        : "from-amber-900/80 to-amber-950 border-amber-700";
  const decText =
    r.decision === "LONG" ? "text-emerald-300" : r.decision === "SHORT" ? "text-rose-300" : "text-amber-300";

  const pctColor = (s: string) => parseFloat(s) >= 0 ? "text-emerald-400" : "text-rose-400";

  return (
    <div className="space-y-4">
      {/* ── Decision Banner ─────────────────────────── */}
      <div className={`bg-gradient-to-br ${decBg} border rounded-xl p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <div>
            <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Karar</div>
            <div className={`text-4xl font-black ${decText}`}>{r.decision}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Güven Skoru</div>
            <div className={`text-4xl font-black ${decText}`}>{r.confidence}/10</div>
          </div>
          <div className="w-full space-y-1">
            <div className="text-sm text-white/80">
              <span className="text-white/40">En temiz setup: </span>{r.bestSetup}
            </div>
            <div className="text-sm text-white/60">
              <span className="text-white/40">Risk: </span>{r.riskNote}
            </div>
          </div>
        </div>
        {/* Confidence bar */}
        <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${r.decision === "LONG" ? "bg-emerald-400" : r.decision === "SHORT" ? "bg-rose-400" : "bg-amber-400"}`}
            style={{ width: `${r.confidence * 10}%` }}
          />
        </div>
      </div>

      {/* ── Price Header ────────────────────────────── */}
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 mb-1">
              {r.asset}/USD{r.asset !== "GOLD" ? "T" : ""} · {r.asset !== "GOLD" ? "Futures" : "PAXG Proxy"}
            </div>
            <div className="text-3xl font-bold text-white tabular-nums">
              ${fmt(r.currentPrice)}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Stat label="24h" value={`${r.change24h}%`} color={pctColor(r.change24h)} />
            <Stat label="7d" value={`${r.change7d}%`} color={pctColor(r.change7d)} />
            <Stat label="30d" value={`${r.change30d}%`} color={pctColor(r.change30d)} />
            {r.high24h > 0 && <Stat label="24h High" value={`$${fmt(r.high24h)}`} />}
            {r.low24h > 0 && <Stat label="24h Low" value={`$${fmt(r.low24h)}`} />}
            {r.vol24h !== "?" && <Stat label="Vol 24h" value={r.vol24h} />}
          </div>
        </div>
        {r.sparkline.length >= 10 && (
          <div className="mt-4">
            <SparklineChart
              candles={r.sparkline}
              currentPrice={r.currentPrice}
              supply={r.zones.supply[0] ?? null}
              demand={r.zones.demand[0] ?? null}
              poc={r.volProfile.poc || null}
            />
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot inline-block" />
          {new Date(r.timestamp).toLocaleString("tr-TR")}
          <CacheAge timestamp={r.timestamp} />
          <span className="mx-1 text-slate-700">·</span>
          <span className={getCurrentSession().color}>{getCurrentSession().label}</span>
        </div>
        {r.fearGreed.available && (
          <div className="mt-2">
            <FearGreedBadge value={r.fearGreed.value} label={r.fearGreed.label} />
          </div>
        )}
      </Card>

      {/* ── 1. Genel Yön ────────────────────────────── */}
      <Section num="1" title="Genel Yön">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <BiasBox label="4H Bias" bias={r.struct4h.bias} bc={bc} bl={bl} />
          <BiasBox label="15M Bias" bias={r.struct15m.bias} bc={bc} bl={bl} />
          {r.structDaily && <BiasBox label="Daily Bias" bias={r.structDaily.bias} bc={bc} bl={bl} />}
        </div>
        {r.struct4h.bias !== r.struct15m.bias && (
          <div className="mt-3 text-xs text-amber-400 bg-amber-900/20 border border-amber-800/30 rounded px-3 py-2">
            ⚠ 4H–15M çatışması — güven skoru düşük, confirmasyonsuz işlem açma
          </div>
        )}
      </Section>

      {/* ── 2. Kısa Analiz ──────────────────────────── */}
      <Section num="2" title="Kısa Analiz">
        <div className="space-y-4">
          {/* Structure */}
          <Group title="Market Structure">
            <Row label="4H Yapı" value={r.struct4h.label} />
            <Row label="15M Yapı" value={r.struct15m.label} />
            {r.struct4h.bos && <Row label="4H BOS" value={`${r.struct4h.bos.type.toUpperCase()} — $${fmt(r.struct4h.bos.level)}`} highlight={r.struct4h.bos.type === "bullish" ? "green" : "red"} />}
            {r.struct4h.choch && <Row label="4H CHoCH" value={`Seviye $${fmt(r.struct4h.choch.level)} — ${r.struct4h.choch.type}`} highlight="yellow" />}
            {r.struct15m.bos && <Row label="15M BOS" value={`${r.struct15m.bos.type.toUpperCase()} — $${fmt(r.struct15m.bos.level)}`} highlight={r.struct15m.bos.type === "bullish" ? "green" : "red"} />}
          </Group>

          {/* Volume Profile */}
          <Group title="Volume Profile (4H Tahmini)">
            {r.volProfile.poc === 0 ? (
              <Unavailable />
            ) : (
              <>
                <Row label="POC" value={`$${fmt(r.volProfile.poc)}`} highlight="yellow" />
                <Row label="VAH" value={`$${fmt(r.volProfile.vah)}`} highlight="red" />
                <Row label="VAL" value={`$${fmt(r.volProfile.val)}`} highlight="green" />
                <p className="text-xs text-slate-600 mt-1">
                  Hacim verisi sınırlı — OKX/CoinGecko hacminden hesaplandı, gerçek VPVR yerini tutmaz
                </p>
              </>
            )}
          </Group>

          {/* AMD */}
          <Group title="AMD Model">
            <Row label="Faz" value={r.amd.phase.toUpperCase()} highlight={r.amd.phase === "distribution" ? "green" : r.amd.phase === "accumulation" ? "yellow" : "none"} />
            <Row label="Açıklama" value={r.amd.description} />
            {r.amd.sweepLevel && <Row label="Sweep Seviyesi" value={`$${fmt(r.amd.sweepLevel)}`} highlight="yellow" />}
          </Group>

          {/* Order Flow */}
          <Group title="Order Flow / Momentum">
            <Row label="Momentum" value={r.orderFlow.momentum} />
            <Row label="15M (Bull/Bear)" value={`${r.orderFlow.bullish15m} bullish / ${r.orderFlow.bearish15m} bearish (son 12 bar)`} />
            <Row label="Hacim Trendi" value={r.orderFlow.volTrend} />
            <Row label="Range Pozisyon" value={r.orderFlow.priceInRange} />
            {r.orderFlow.displacement && (
              <Row label="Displacement" value={`${r.orderFlow.displacement.direction} — body: $${r.orderFlow.displacement.body} (ort: $${r.orderFlow.displacement.avgBody})`} highlight={r.orderFlow.displacement.direction === "bullish" ? "green" : "red"} />
            )}
          </Group>

          {/* Zones */}
          <Group title="Supply / Demand Zone'ları">
            {r.zones.supply.length === 0 && r.zones.demand.length === 0 ? (
              <Unavailable />
            ) : (
              <>
                {r.zones.supply.map((z, i) => (
                  <Row key={`s${i}`} label={`Supply ${i + 1} (${z.strength})`} value={`$${fmt(z.bottom)} — $${fmt(z.top)}`} highlight="red" />
                ))}
                {r.zones.demand.map((z, i) => (
                  <Row key={`d${i}`} label={`Demand ${i + 1} (${z.strength})`} value={`$${fmt(z.bottom)} — $${fmt(z.top)}`} highlight="green" />
                ))}
              </>
            )}
          </Group>

          {/* FVGs */}
          <Group title="FVG / iFVG Bölgeleri">
            {r.fvgs4h.length === 0 && r.fvgs15m.length === 0 ? (
              <Unavailable />
            ) : (
              <>
                {r.fvgs4h.map((f, i) => (
                  <Row key={`f4${i}`} label={`4H ${f.type === "bullish" ? "Bullish" : "Bearish"} FVG [${f.status}]`} value={`$${fmt(f.bottom)} — $${fmt(f.top)}`} highlight={f.type === "bullish" ? "green" : "red"} />
                ))}
                {r.fvgs15m.slice(0, 3).map((f, i) => (
                  <Row key={`f15${i}`} label={`15M ${f.type === "bullish" ? "Bullish" : "Bearish"} FVG [${f.status}]`} value={`$${fmt(f.bottom)} — $${fmt(f.top)}`} highlight={f.type === "bullish" ? "green" : "red"} />
                ))}
              </>
            )}
          </Group>

          {/* Funding / OI / L/S */}
          <Group title="OI / Funding / Positioning">
            {r.oi.available
              ? <>
                  <Row label="Open Interest" value={`${r.oi.oiUsd} (${r.oi.oiContracts} kontrat)`} />
                  <Row
                    label="OI 24h Değişim"
                    value={r.oi.change24h}
                    highlight={r.oi.changeBias === "rising" ? "green" : r.oi.changeBias === "falling" ? "red" : "none"}
                  />
                </>
              : <Row label="Open Interest" value="Veri yetersiz / kaynak erişilemedi" />
            }
            {r.funding.rate === null
              ? <Row label="Funding Rate" value="Veri yetersiz / kaynak erişilemedi" />
              : <>
                  <Row label="Funding Rate" value={`${r.funding.ratePct} (${r.funding.annualized})`} />
                  <Row label="Funding Yorum" value={r.funding.interpretation} />
                </>
            }
            {r.longShort.available
              ? <Row
                  label="L/S Oranı"
                  value={`${r.longShort.ratio.toFixed(2)} — ${r.longShort.interpretation}`}
                  highlight={r.longShort.ratio > 2 ? "red" : r.longShort.ratio < 0.6 ? "green" : "none"}
                />
              : <Row label="L/S Oranı" value="Veri yetersiz / kaynak erişilemedi" />
            }
            <Row label="CoinGlass Likidasyon" value="Veri yetersiz / kaynak erişilemedi (API key gerekli)" />
          </Group>
        </div>
      </Section>

      {/* ── Likidasyonlar ────────────────────────────── */}
      <Section num="" title="Likidasyon Haritası">
        {r.liquidation.pools.length > 0 ? (
          <div className="space-y-2">
            {r.liquidation.pools.map((p, i) => (
              <div key={i} className={`flex justify-between items-center px-3 py-2 rounded-lg border text-sm ${
                p.side === "short"
                  ? "bg-emerald-900/15 border-emerald-800/30 text-emerald-300"
                  : "bg-rose-900/15 border-rose-800/30 text-rose-300"
              }`}>
                <span className="font-medium">
                  {p.side === "short" ? "↑ SHORT Liq" : "↓ LONG Liq"} ({p.distance})
                </span>
                <span className="font-mono text-slate-200">${p.priceRange}</span>
                <span className="text-xs text-slate-500 hidden sm:block">{p.description}</span>
              </div>
            ))}
            <Row label="Önce hedef" value={r.liquidation.likelyFirstTarget} highlight="yellow" />
            <p className="text-xs text-slate-600 mt-1">Kaynak: {r.liquidation.source}</p>
          </div>
        ) : (
          <div className="text-sm text-amber-400">Veri yetersiz / kaynak erişilemedi (CoinGlass API key gerekli)</div>
        )}
      </Section>

      {/* ── Makro / Haber ───────────────────────────── */}
      <Section num="" title="Global Haber / Makro / Savaş Etkisi">
        {r.macro.available ? (
          <div className="space-y-2">
            <Row label="Savaş / Jeopolitik Risk" value={r.macro.warRisk} />
            <Row label="Enflasyon" value={r.macro.inflationOutlook} />
            <Row label="Faiz / Merkez Bankası" value={r.macro.ratesOutlook} />
            <Row label="DXY / Dolar" value={r.macro.dxyBias} />
            <Row label="Genel Etki" value={r.macro.overallImpact} highlight={
              r.macro.overallImpact.includes("BULLISH") ? "green" :
              r.macro.overallImpact.includes("BEARISH") ? "red" : "none"
            } />
            {r.macro.headlines.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setNewsOpen(!newsOpen)}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
                >
                  {newsOpen ? "▾" : "▸"} {r.macro.headlines.length} haber göster
                </button>
                {newsOpen && (
                  <div className="mt-2 space-y-1 max-h-56 overflow-y-auto pr-1">
                    {r.macro.headlines.map((h, i) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className={`shrink-0 w-[72px] text-right font-mono ${
                          h.impact === "bullish" ? "text-emerald-400" :
                          h.impact === "bearish" ? "text-rose-400" : "text-slate-500"
                        }`}>[{h.category}]</span>
                        <span className="text-slate-300">{h.title}</span>
                        <span className="text-slate-600 shrink-0 hidden sm:block">— {h.source}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-amber-400">Veri yetersiz / kaynak erişilemedi</div>
        )}
      </Section>

      {/* ── 3. En Olası Senaryo ─────────────────────── */}
      <Section num="3" title="En Olası Senaryo">
        <div className="space-y-2 text-sm">
          <Row label="AMD Fazı" value={`${r.amd.phase.toUpperCase()} — ${r.amd.description}`} />
          <Row label="Önce alınacak likidite" value={r.liquidation.likelyFirstTarget || "Belirsiz — likidasyon verisi yetersiz"} />
          {r.zones.supply[0] && <Row label="Yukarı hedef (supply)" value={`$${fmt(r.zones.supply[0].bottom)} — $${fmt(r.zones.supply[0].top)}`} highlight="red" />}
          {r.zones.demand[0] && <Row label="Aşağı destek (demand)" value={`$${fmt(r.zones.demand[0].bottom)} — $${fmt(r.zones.demand[0].top)}`} highlight="green" />}
        </div>
      </Section>

      {/* ── 4 & 5. Trade Setups ─────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <SetupCard title="4. Long Planı" type="long" setup={r.longSetup} />
        <SetupCard title="5. Short Planı" type="short" setup={r.shortSetup} />
      </div>

      {/* ── 6. Uzun Vadeli Plan ─────────────────────── */}
      <Section num="6" title="Uzun Vadeli Plan">
        <div className="space-y-2 text-sm">
          <Row label="Yön" value={r.longTermPlan.direction} />
          <Row label="Ana birikim bölgesi" value={r.longTermPlan.accumulationZone} />
          <Row label="Geçersizlik seviyesi" value={`$${r.longTermPlan.invalidation}`} highlight="red" />
          <Row label="Hedef 1" value={`$${r.longTermPlan.target1}`} highlight="green" />
          <Row label="Hedef 2" value={`$${r.longTermPlan.target2}`} highlight="green" />
          <Row label="Güçlendiren makro" value={r.longTermPlan.strengthenedBy} />
          <Row label="Zayıflatan makro" value={r.longTermPlan.weakenedBy} />
        </div>
      </Section>

      {/* ── 7. Sonuç ────────────────────────────────── */}
      <Section num="7" title="Sonuç">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">Karar</div>
            <div className={`text-xl font-black ${decText}`}>{r.decision}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">Güven</div>
            <div className="text-xl font-black text-white">{r.confidence}/10</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-500 mb-1">Tempo</div>
            <div className="text-sm font-semibold text-slate-200">
              {r.struct4h.bias === "bullish" && r.struct15m.bias === "bullish" ? "↑↑ Uyumlu" :
               r.struct4h.bias === "bearish" && r.struct15m.bias === "bearish" ? "↓↓ Uyumlu" :
               "⇄ Çatışma"}
            </div>
          </div>
        </div>
      </Section>

      {/* ── 8. Fiyat Yolu ───────────────────────────── */}
      {r.priceMap.length > 0 && (
        <Section num="8" title="Fiyat Yolu Şeması">
          <div className="price-map text-xs leading-6 overflow-x-auto">
            {r.priceMap.map((l, i) => (
              <div key={i} className={
                l.tag === "CURRENT" ? "text-blue-400 font-bold" :
                l.tag === "SUPPLY" ? "text-rose-400" :
                l.tag === "DEMAND" ? "text-emerald-400" :
                l.tag === "supply" || l.tag === "demand" ? "text-slate-500" :
                l.tag === "poc" ? "text-yellow-400 font-semibold" :
                l.tag === "vp" ? "text-slate-500" :
                "text-amber-400/80"
              }>{l.line}</div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Source Status ────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <button
          onClick={() => setSourcesOpen(!sourcesOpen)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span>Veri Kaynağı Durumu</span>
          <span className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400">{r.sources.filter(s => s.status === "ok").length} ok</span>
            <span className="text-rose-400">{r.sources.filter(s => s.status === "failed").length} fail</span>
            {sourcesOpen ? "▾" : "▸"}
          </span>
        </button>
        {sourcesOpen && (
          <div className="px-5 pb-4 grid gap-1.5">
            {r.sources.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  s.status === "ok" ? "bg-emerald-400" :
                  s.status === "partial" ? "bg-amber-400" : "bg-rose-400"
                }`} />
                <span className="text-slate-300 min-w-[160px]">{s.name}</span>
                <span className="text-slate-600">{s.detail}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">{children}</div>
  );
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
        {num && <span className="text-xs text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded font-mono">{num}</span>}
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value, highlight = "none" }: {
  label: string; value: string | number; highlight?: "green" | "red" | "yellow" | "none"
}) {
  const vc =
    highlight === "green" ? "text-emerald-300" :
    highlight === "red" ? "text-rose-300" :
    highlight === "yellow" ? "text-amber-300" :
    "text-slate-300";
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-slate-500 shrink-0 w-28 sm:w-44 text-right">{label}:</span>
      <span className={`${vc} min-w-0 break-words`}>{value}</span>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className={`font-semibold tabular-nums ${color ?? "text-slate-200"}`}>{value}</div>
    </div>
  );
}

function BiasBox({ label, bias, bc, bl }: {
  label: string; bias: string;
  bc: (b: string) => string;
  bl: (b: string) => string;
}) {
  const bg =
    bias === "bullish" ? "bg-emerald-900/20 border-emerald-800/40" :
    bias === "bearish" ? "bg-rose-900/20 border-rose-800/40" :
    "bg-amber-900/20 border-amber-800/40";
  return (
    <div className={`border rounded-lg p-3 text-center ${bg}`}>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-base font-bold ${bc(bias)}`}>{bl(bias)}</div>
    </div>
  );
}

function SetupCard({ title, setup, type }: {
  title: string;
  setup: { entry: string; entry2?: string; sl: string; tp1: string; tp2: string; tp3: string; rrNote: string; validWhen: string; invalidWhen: string };
  type: "long" | "short";
}) {
  const border = type === "long" ? "border-emerald-800/50" : "border-rose-800/50";
  const headBg = type === "long" ? "bg-emerald-900/20 border-b-emerald-800/30" : "bg-rose-900/20 border-b-rose-800/30";
  return (
    <section className={`bg-slate-900 border ${border} rounded-xl overflow-hidden`}>
      <div className={`${headBg} border-b px-5 py-3`}>
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-5 space-y-1.5">
        <Row label="Entry Zone" value={setup.entry} highlight={type === "long" ? "green" : "red"} />
        {setup.entry2 && <Row label="Entry Zone 2" value={setup.entry2} highlight={type === "long" ? "green" : "red"} />}
        <Row label="Stop Loss" value={setup.sl} highlight="red" />
        <Row label="TP1" value={setup.tp1} highlight="green" />
        <Row label="TP2" value={setup.tp2} highlight="green" />
        <Row label="TP3" value={setup.tp3} highlight="green" />
        {setup.rrNote && <Row label="Risk:Reward" value={setup.rrNote} highlight="yellow" />}
        <div className="border-t border-slate-700/50 my-2" />
        <Row label="Geçerli şart" value={setup.validWhen} />
        <Row label="İptal şartı" value={setup.invalidWhen} highlight="red" />
      </div>
    </section>
  );
}

function Unavailable() {
  return <p className="text-sm text-amber-400 italic">Veri yetersiz / kaynak erişilemedi</p>;
}

function FearGreedBadge({ value, label }: { value: number; label: string }) {
  const col =
    value <= 24 ? "bg-rose-900/40 text-rose-300 border-rose-800/50" :
    value <= 49 ? "bg-orange-900/40 text-orange-300 border-orange-800/50" :
    value <= 74 ? "bg-emerald-900/40 text-emerald-300 border-emerald-800/50" :
                  "bg-emerald-800/40 text-emerald-200 border-emerald-700/50";
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-xs ${col}`}>
      <span className="font-bold tabular-nums">{value}</span>
      <span className="text-[10px] opacity-80">{label}</span>
      <span className="text-[10px] opacity-50">· F&amp;G</span>
    </div>
  );
}

// ─── Cache Age ───────────────────────────────────────────────────────────────

function CacheAge({ timestamp }: { timestamp: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    function update() {
      const diffSec = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
      const next =
        diffSec < 10 ? "· az önce" :
        diffSec < 60 ? `· ${diffSec}s önce` :
        diffSec < 3600 ? `· ${Math.floor(diffSec / 60)}dk önce` :
        `· ${Math.floor(diffSec / 3600)}sa önce`;
      setLabel(prev => prev === next ? prev : next);
    }
    update();
    const id = setInterval(update, 15000);
    return () => clearInterval(id);
  }, [timestamp]);

  return <span>{label}</span>;
}

// ─── Sparkline Chart ─────────────────────────────────────────────────────────

const SPK = {
  supply: "rgba(239,68,68,0.08)",
  demand: "rgba(16,185,129,0.08)",
  poc: "rgba(250,204,21,0.5)",
  bull: "#10b981",
  bear: "#ef4444",
  bullVol: "rgba(16,185,129,0.25)",
  bearVol: "rgba(239,68,68,0.25)",
  price: "#60a5fa",
} as const;

function SparklineChart({ candles, currentPrice, supply, demand, poc }: {
  candles: SparkCandle[];
  currentPrice: number;
  supply: Zone | null;
  demand: Zone | null;
  poc: number | null;
}) {
  const W = 600, H = 120;
  const PAD = { top: 8, bottom: 24, left: 4, right: 4 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Single pass: price range + max volume
  let priceMin = Infinity, priceMax = -Infinity, maxVol = 1;
  for (const c of candles) {
    if (c.h > priceMax) priceMax = c.h;
    if (c.l < priceMin) priceMin = c.l;
    if (c.v > maxVol) maxVol = c.v;
  }
  const priceRange = priceMax - priceMin || 1;
  const candleW = innerW / candles.length;
  const bodyW = Math.max(1, candleW * 0.6);
  const volBarH = innerH * 0.2;

  const py = (p: number) => PAD.top + innerH - ((p - priceMin) / priceRange) * innerH;
  const px = (i: number) => PAD.left + (i + 0.5) * candleW;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }} preserveAspectRatio="none">
      {supply && supply.bottom < priceMax && (
        <rect x={PAD.left} y={py(Math.min(supply.top, priceMax))} width={innerW}
          height={Math.max(0, py(supply.bottom) - py(Math.min(supply.top, priceMax)))}
          fill={SPK.supply} />
      )}
      {demand && demand.top > priceMin && (
        <rect x={PAD.left} y={py(Math.min(demand.top, priceMax))} width={innerW}
          height={Math.max(0, py(demand.bottom) - py(Math.min(demand.top, priceMax)))}
          fill={SPK.demand} />
      )}
      {poc && poc > priceMin && poc < priceMax && (
        <line x1={PAD.left} y1={py(poc)} x2={PAD.left + innerW} y2={py(poc)}
          stroke={SPK.poc} strokeWidth="0.8" strokeDasharray="3 3" />
      )}

      {/* Volume bars + candle bodies in a single pass */}
      {candles.map((c, i) => {
        const bull = c.c >= c.o;
        const col = bull ? SPK.bull : SPK.bear;
        const bodyTop = py(Math.max(c.o, c.c));
        const bodyHeight = Math.max(0.8, py(Math.min(c.o, c.c)) - bodyTop);
        const barH = (c.v / maxVol) * volBarH;
        return (
          <g key={i}>
            <rect x={px(i) - bodyW / 2} y={H - PAD.bottom - barH} width={bodyW} height={barH}
              fill={bull ? SPK.bullVol : SPK.bearVol} />
            <line x1={px(i)} y1={py(c.h)} x2={px(i)} y2={py(c.l)}
              stroke={col} strokeWidth="0.8" opacity="0.7" />
            <rect x={px(i) - bodyW / 2} y={bodyTop} width={bodyW} height={bodyHeight}
              fill={col} opacity={0.85} />
          </g>
        );
      })}

      {currentPrice >= priceMin && currentPrice <= priceMax && (
        <>
          <line x1={PAD.left} y1={py(currentPrice)} x2={PAD.left + innerW} y2={py(currentPrice)}
            stroke={SPK.price} strokeWidth="0.8" strokeDasharray="4 2" />
          <text x={PAD.left + innerW - 2} y={py(currentPrice) - 2}
            fill={SPK.price} fontSize="7" textAnchor="end">
            {fmt(currentPrice)}
          </text>
        </>
      )}

      {/* X-axis label: first and last timestamp */}
      {candles.length > 0 && (
        <>
          <text x={PAD.left} y={H - 4} fill="#475569" fontSize="7">
            {new Date(candles[0].ts).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
          </text>
          <text x={PAD.left + innerW} y={H - 4} fill="#475569" fontSize="7" textAnchor="end">
            {new Date(candles[candles.length - 1].ts).toLocaleDateString("tr-TR", { month: "short", day: "numeric" })}
          </text>
          <text x={W / 2} y={H - 4} fill="#334155" fontSize="7" textAnchor="middle">
            4H · son {candles.length} mum
          </text>
        </>
      )}
    </svg>
  );
}
