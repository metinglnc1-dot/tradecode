# TradeCode — Smart Money Concepts Analyzer

BTC, ETH ve Altın (XAUUSD) için canlı veri çeken, Smart Money Concepts tabanlı analiz ve işlem planı üreten web uygulaması.

## Özellikler

- **BTC / ETH / GOLD** varlık seçimi
- **4H ve 15M market structure** analizi (BOS, CHoCH, HH/HL/LH/LL)
- **FVG / iFVG** tespiti
- **Supply / Demand** zone belirleme
- **AMD modeli** (Accumulation / Manipulation / Distribution)
- **Order flow / momentum / displacement** analizi
- **Likidasyon havuzu** tahmini (CoinGlass API key ile gerçek veri)
- **Funding rate + OI** analizi
- **Makro / savaş / jeopolitik haber** analizi (RSS tabanlı)
- **Kısa ve uzun vadeli işlem planı** üretimi
- **Fiyat yolu şeması** (ASCII)
- **Güven skoru** ve karar motoru

## Veri Kaynakları

| Kaynak | Durum | Not |
|---|---|---|
| OKX API | Ücretsiz | BTC/ETH OHLCV, ticker, funding |
| CoinGecko API | Ücretsiz | Fiyat, market data |
| Yahoo Finance | Ücretsiz | Gold OHLCV |
| Gate.io API | Ücretsiz | Backup ticker |
| CoinGlass API | API key gerekli | Likidasyon, OI, L/S oranı |
| BBC/CNBC/CoinDesk RSS | Ücretsiz | Haber akışı |

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Ortam değişkenleri (opsiyonel)
cp .env.example .env.local
# .env.local dosyasını düzenleyip API key'lerinizi ekleyin

# Geliştirme sunucusu
npm run dev

# Production build
npm run build && npm start
```

## Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `COINGLASS_API_KEY` | Hayır | Likidasyon, OI, L/S oranı verisi |
| `NEWSAPI_KEY` | Hayır | Zengin haber akışı |
| `GOLDAPI_KEY` | Hayır | Altın OHLCV verisi |

> API key yoksa ilgili bölümler "veri yetersiz / kaynak erişilemedi" gösterir.

## Mimari

```
src/
├── app/
│   ├── api/analyze/route.ts    # API endpoint
│   ├── globals.css             # Tailwind + custom styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Dashboard UI
└── lib/
    ├── types.ts                # TypeScript interfaces
    ├── fetchers.ts             # Veri çekme katmanı
    ├── smc-engine.ts           # SMC analiz motoru
    ├── news-engine.ts          # Makro/haber analizi
    └── report.ts               # Rapor üreteci
```
