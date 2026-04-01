"use client";

import { useState, useCallback } from "react";
import type { AnalysisReport } from "@/lib/types";

type Asset = "BTC" | "ETH" | "GOLD";

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [asset, setAsset] = useState<Asset>("BTC");
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analyze?asset=${asset}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setReport(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [asset]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          Trade<span className="text-blue-400">Code</span>
          <span className="text-sm font-normal text-slate-400 ml-2">SMC Analyzer</span>
        </h1>
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
            {a === "BTC" ? "Bitcoin" : a === "ETH" ? "Ethereum" : "Altın (XAU)"}
          </button>
        ))}

        <button
          onClick={analyze}
          disabled={loading}
          className="ml-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Analiz ediliyor...
            </>
          ) : (
            "Analiz Et"
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* Report */}
      {report && !loading && <ReportView report={report} />}

      {/* Empty state */}
      {!report && !loading && !error && (
        <div className="text-center py-24 text-slate-500">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-lg">Varlık seçin ve <span className="text-emerald-400 font-semibold">Analiz Et</span> butonuna basın</p>
          <p className="text-sm mt-2 text-slate-600">Canlı veri API&apos;lerden çekilecek, tahmin uydurulmayacak</p>
        </div>
      )}
    </main>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="shimmer h-5 w-48 rounded mb-4" />
          <div className="space-y-2">
            <div className="shimmer h-4 w-full rounded" />
            <div className="shimmer h-4 w-3/4 rounded" />
            <div className="shimmer h-4 w-5/6 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Report View ─────────────────────────────────────────────────────────────

function ReportView({ report: r }: { report: AnalysisReport }) {
  const biasColor = (b: string) =>
    b === "bullish" ? "text-emerald-400" : b === "bearish" ? "text-rose-400" : "text-amber-400";
  const biasLabel = (b: string) =>
    b === "bullish" ? "BULLISH" : b === "bearish" ? "BEARISH" : "NEUTRAL";
  const decisionColor =
    r.decision === "LONG" ? "bg-emerald-600" : r.decision === "SHORT" ? "bg-rose-600" : "bg-amber-600";

  return (
    <div className="space-y-4">
      {/* Decision Banner */}
      <div className={`${decisionColor} rounded-xl p-5 flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <div className="text-xs font-medium text-white/60 uppercase">Karar</div>
          <div className="text-3xl font-black text-white">{r.decision}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium text-white/60">Güven Skoru</div>
          <div className="text-3xl font-black text-white">{r.confidence}/10</div>
        </div>
        <div className="w-full">
          <div className="text-sm text-white/90"><strong>En temiz setup:</strong> {r.bestSetup}</div>
          <div className="text-sm text-white/70 mt-1"><strong>Risk:</strong> {r.riskNote}</div>
        </div>
      </div>

      {/* Price Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400">{r.asset}/USDT{r.asset === "GOLD" ? " (XAU)" : ""}</div>
            <div className="text-3xl font-bold text-white">
              {r.asset === "GOLD" ? "$" : ""}{r.currentPrice.toLocaleString("en-US", { maximumFractionDigits: r.currentPrice > 1000 ? 0 : 2 })}
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <Stat label="24h" value={`${r.change24h}%`} color={parseFloat(r.change24h) >= 0 ? "text-emerald-400" : "text-rose-400"} />
            <Stat label="7d" value={`${r.change7d}%`} color={parseFloat(r.change7d) >= 0 ? "text-emerald-400" : "text-rose-400"} />
            <Stat label="30d" value={`${r.change30d}%`} color={parseFloat(r.change30d) >= 0 ? "text-emerald-400" : "text-rose-400"} />
            <Stat label="24h High" value={r.high24h.toLocaleString()} />
            <Stat label="24h Low" value={r.low24h.toLocaleString()} />
            <Stat label="24h Vol" value={r.vol24h} />
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
          Son güncelleme: {new Date(r.timestamp).toLocaleString("tr-TR")}
        </div>
      </div>

      {/* 1. Genel Yön */}
      <Card title="1. Genel Yön">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <BiasBox label="4H Bias" bias={r.struct4h.bias} biasColor={biasColor} biasLabel={biasLabel} />
          <BiasBox label="15M Bias" bias={r.struct15m.bias} biasColor={biasColor} biasLabel={biasLabel} />
          {r.structDaily && <BiasBox label="Daily Bias" bias={r.structDaily.bias} biasColor={biasColor} biasLabel={biasLabel} />}
        </div>
      </Card>

      {/* 2. Kısa Analiz */}
      <Card title="2. Kısa Analiz">
        <div className="space-y-3 text-sm">
          <Row label="4H Structure" value={r.struct4h.label} />
          <Row label="15M Structure" value={r.struct15m.label} />
          {r.struct4h.bos && <Row label="4H BOS" value={`${r.struct4h.bos.type} — seviye: ${r.struct4h.bos.level}`} />}
          {r.struct4h.choch && <Row label="4H CHoCH" value={`Seviye: ${r.struct4h.choch.level} — ${r.struct4h.choch.type}`} />}
          {r.struct15m.bos && <Row label="15M BOS" value={`${r.struct15m.bos.type} — seviye: ${r.struct15m.bos.level}`} />}
          <div className="border-t border-slate-700 pt-2" />
          <Row label="AMD Model" value={r.amd.description} />
          <Row label="Order Flow" value={`${r.orderFlow.momentum} | Vol: ${r.orderFlow.volTrend} | Pozisyon: ${r.orderFlow.priceInRange}`} />
          {r.orderFlow.displacement && (
            <Row label="Displacement" value={`${r.orderFlow.displacement.direction} — body: ${r.orderFlow.displacement.body} (avg: ${r.orderFlow.displacement.avgBody})`} />
          )}
          <div className="border-t border-slate-700 pt-2" />
          <Row label="Funding Rate" value={`${r.funding.ratePct} (${r.funding.annualized}) — ${r.funding.interpretation}`} />
          <div className="border-t border-slate-700 pt-2" />
          <div className="font-medium text-slate-300">Supply Zones:</div>
          {r.zones.supply.length ? r.zones.supply.map((z, i) => (
            <Row key={`s${i}`} label={`Supply ${i + 1}`} value={`${z.bottom.toFixed(0)}–${z.top.toFixed(0)} (${z.strength})`} />
          )) : <div className="text-slate-500 text-xs">Tespit edilemedi</div>}
          <div className="font-medium text-slate-300">Demand Zones:</div>
          {r.zones.demand.length ? r.zones.demand.map((z, i) => (
            <Row key={`d${i}`} label={`Demand ${i + 1}`} value={`${z.bottom.toFixed(0)}–${z.top.toFixed(0)} (${z.strength})`} />
          )) : <div className="text-slate-500 text-xs">Tespit edilemedi</div>}
          <div className="border-t border-slate-700 pt-2" />
          <div className="font-medium text-slate-300">FVG (4H):</div>
          {r.fvgs4h.length ? r.fvgs4h.map((f, i) => (
            <Row key={`f4${i}`} label={`${f.type === "bullish" ? "Bull" : "Bear"} FVG`} value={`${f.bottom.toFixed(0)}–${f.top.toFixed(0)} [${f.status}]`} />
          )) : <div className="text-slate-500 text-xs">4H FVG bulunamadı</div>}
          <div className="font-medium text-slate-300">FVG (15M):</div>
          {r.fvgs15m.length ? r.fvgs15m.slice(0, 3).map((f, i) => (
            <Row key={`f15${i}`} label={`${f.type === "bullish" ? "Bull" : "Bear"} FVG`} value={`${f.bottom.toFixed(0)}–${f.top.toFixed(0)} [${f.status}]`} />
          )) : <div className="text-slate-500 text-xs">15M FVG bulunamadı</div>}
        </div>
      </Card>

      {/* Liquidation */}
      <Card title="Likidasyon Haritası">
        {r.liquidation.pools.length > 0 ? (
          <div className="space-y-2 text-sm">
            {r.liquidation.pools.map((p, i) => (
              <div key={i} className={`flex justify-between p-2 rounded ${p.side === "long" ? "bg-rose-900/20 border border-rose-900/30" : "bg-emerald-900/20 border border-emerald-900/30"}`}>
                <span className={p.side === "long" ? "text-rose-400" : "text-emerald-400"}>
                  {p.side === "long" ? "LONG Liq ▼" : "SHORT Liq ▲"} ({p.distance})
                </span>
                <span className="text-slate-300">{p.priceRange}</span>
              </div>
            ))}
            <Row label="Önce hedeflenecek" value={r.liquidation.likelyFirstTarget} />
            <div className="text-xs text-slate-500 mt-1">Kaynak: {r.liquidation.source}</div>
          </div>
        ) : (
          <div className="text-sm text-amber-400">Veri yetersiz / kaynak erişilemedi</div>
        )}
      </Card>

      {/* Macro / News */}
      <Card title="Global Haber / Makro / Savaş Etkisi">
        {r.macro.available ? (
          <div className="space-y-2 text-sm">
            <Row label="Savaş Riski" value={r.macro.warRisk} />
            <Row label="Enflasyon" value={r.macro.inflationOutlook} />
            <Row label="Faiz" value={r.macro.ratesOutlook} />
            <Row label="DXY" value={r.macro.dxyBias} />
            <Row label="Genel Etki" value={r.macro.overallImpact} />
            {r.macro.headlines.length > 0 && (
              <div className="mt-3 border-t border-slate-700 pt-3">
                <div className="text-xs text-slate-400 mb-2">Öne çıkan haberler ({r.macro.headlines.length})</div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {r.macro.headlines.slice(0, 10).map((h, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className={`shrink-0 w-16 text-right ${h.impact === "bullish" ? "text-emerald-400" : h.impact === "bearish" ? "text-rose-400" : "text-slate-400"}`}>
                        [{h.category}]
                      </span>
                      <span className="text-slate-300 truncate">{h.title}</span>
                      <span className="text-slate-600 shrink-0">{h.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-amber-400">Veri yetersiz / kaynak erişilemedi</div>
        )}
      </Card>

      {/* 3. En Olası Senaryo */}
      <Card title="3. En Olası Senaryo">
        <div className="space-y-2 text-sm">
          <Row label="AMD Fazı" value={r.amd.description} />
          <Row label="Önce alınacak likidite" value={r.liquidation.likelyFirstTarget || "Belirsiz"} />
          {r.zones.supply[0] && <Row label="Yukarı hedef" value={`${r.zones.supply[0].bottom.toFixed(0)}–${r.zones.supply[0].top.toFixed(0)}`} />}
          {r.zones.demand[0] && <Row label="Aşağı destek" value={`${r.zones.demand[0].bottom.toFixed(0)}–${r.zones.demand[0].top.toFixed(0)}`} />}
        </div>
      </Card>

      {/* 4 & 5. Trade Setups */}
      <div className="grid md:grid-cols-2 gap-4">
        <SetupCard title="4. Long Planı" setup={r.longSetup} type="long" />
        <SetupCard title="5. Short Planı" setup={r.shortSetup} type="short" />
      </div>

      {/* 6. Uzun Vadeli Plan */}
      <Card title="6. Uzun Vadeli Plan">
        <div className="space-y-2 text-sm">
          <Row label="Yön" value={r.longTermPlan.direction} />
          <Row label="Birikim bölgesi" value={r.longTermPlan.accumulationZone} />
          <Row label="Geçersizlik" value={r.longTermPlan.invalidation} />
          <Row label="Hedef 1" value={r.longTermPlan.target1} />
          <Row label="Hedef 2" value={r.longTermPlan.target2} />
          <Row label="Güçlendiren" value={r.longTermPlan.strengthenedBy} />
          <Row label="Zayıflatan" value={r.longTermPlan.weakenedBy} />
        </div>
      </Card>

      {/* 8. Price Map */}
      {r.priceMap.length > 0 && (
        <Card title="8. Fiyat Yolu Şeması">
          <div className="price-map text-xs leading-relaxed overflow-x-auto">
            {r.priceMap.map((l, i) => (
              <div key={i} className={
                l.tag === "CURRENT" ? "text-blue-400 font-bold" :
                l.tag === "SUPPLY" ? "text-rose-400" :
                l.tag === "DEMAND" ? "text-emerald-400" :
                l.tag === "supply" || l.tag === "demand" ? "text-slate-400" :
                "text-amber-400/70"
              }>
                {l.line}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Source Status */}
      <Card title="Veri Kaynağı Durumu">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {r.sources.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${s.status === "ok" ? "bg-emerald-400" : s.status === "partial" ? "bg-amber-400" : "bg-rose-400"}`} />
              <span className="text-slate-300">{s.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <h2 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex gap-2">
      <span className="text-slate-500 shrink-0 w-36 text-right">{label}:</span>
      <span className="text-slate-200">{value}</span>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="text-right">
      <div className="text-[10px] text-slate-500 uppercase">{label}</div>
      <div className={`font-semibold ${color ?? "text-slate-200"}`}>{value}</div>
    </div>
  );
}

function BiasBox({ label, bias, biasColor, biasLabel }: {
  label: string; bias: string;
  biasColor: (b: string) => string;
  biasLabel: (b: string) => string;
}) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 text-center">
      <div className="text-[10px] text-slate-500 uppercase">{label}</div>
      <div className={`text-lg font-bold ${biasColor(bias)}`}>{biasLabel(bias)}</div>
    </div>
  );
}

function SetupCard({ title, setup, type }: {
  title: string;
  setup: { entry: string; entry2?: string; sl: string; tp1: string; tp2: string; tp3: string; validWhen: string; invalidWhen: string };
  type: "long" | "short";
}) {
  const accent = type === "long" ? "border-emerald-800" : "border-rose-800";
  const headerBg = type === "long" ? "bg-emerald-900/20" : "bg-rose-900/20";
  return (
    <section className={`bg-slate-900 border ${accent} rounded-xl overflow-hidden`}>
      <div className={`${headerBg} px-5 py-3`}>
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="p-5 space-y-2 text-sm">
        <Row label="Entry" value={setup.entry} />
        {setup.entry2 && <Row label="Entry 2" value={setup.entry2} />}
        <Row label="Stop Loss" value={setup.sl} />
        <Row label="TP1" value={setup.tp1} />
        <Row label="TP2" value={setup.tp2} />
        <Row label="TP3" value={setup.tp3} />
        <div className="border-t border-slate-700 pt-2 mt-2" />
        <Row label="Geçerli" value={setup.validWhen} />
        <Row label="İptal" value={setup.invalidWhen} />
      </div>
    </section>
  );
}
