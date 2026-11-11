# MetrivaStudio video motoru

1080x1920, 30 fps dikey karikatür videolar. Her video tek bir dosyadan üretilir: `episodes/<id>/episode.js`.

```bash
node engine/build.mjs fee-goblin                 # tam render: out/fee-goblin/fee-goblin.mp4
node engine/build.mjs fee-goblin --stills 1,5,9  # sadece belirli saniyelerin PNG kareleri (hızlı önizleme)
node engine/build.mjs fee-goblin --keep-frames   # kareleri silme (ek contact sheet için)
```

Çıktılar (`out/<id>/`): `<id>.mp4`, `sheet.png` (8 karelik contact sheet), `sheet_guides.png` (güvenli alan çizgili),
`qa.json` (otomatik kontrol), `timings.json` (kelime zamanları), `plan.json` (ses efekti planı).

## Hat (pipeline)

1. **Ses** `engine/voice.py`: Her satır Kokoro TTS ile okunur (varsayılan `am_fenrir`, 1,25x). Whisper tiny.en kelime zamanlarını çıkarır, ağız zarfı (RMS) hesaplanır. Metin değişmezse önbellekten gelir.
2. **Plan**: Tarayıcıda sahne yüklenir. Hangi efektin ne zaman çalacağı başlıklardan, notlardan, paralardan ve kamera hareketlerinden otomatik çıkar.
3. **Efekt + miks** `engine/audio.py`: bell, ding, thud, coin, whoosh, pop, boing, sad, tick ve scribble efektleri numpy ile sentezlenir ve sesle karıştırılır.
4. **Kare** `engine/runtime/*`: Her kare, zamanın saf bir fonksiyonu olarak tek bir SVG şeklinde çizilir (deterministik). Playwright ile 4 paralel sekmede görüntüsü alınır.
5. **Kodlama**: ffmpeg ile H.264 CRF 18, AAC 192k, loudnorm (-14 LUFS hedefi).
6. **Kontrol**: Her 0,2 sn'de bir tüm yazıların kutuları ölçülür. Güvenli alan (y 170-1330, x 24-1056) dışına taşan ya da üst üste binen yazılar raporlanır.

## Yeni bölüm yazmak

`episodes/fee-goblin/episode.js` dosyasını kopyalayın. Alanlar:

| Alan | Açıklama |
|---|---|
| `voice` | `{ name, speed, lead, gap }`. Satır başına `voice`, `speed`, `pauseAfter` da verilebilir. |
| `lines` | `say`: okunacak metin. `caption`: altyazı metni (rakamlar sayıyla yazılabilir, `*kelime*` sarı yapar). |
| `world` | Yan yana mekânlar: `room`, `exchange`, `whiteboard`, `outdoor` (her biri 1200 genişlik, zemin y=1300). |
| `camera` | `{ at, x, y, zoom, move }`. Kamera `at` anına `move` saniyede kayarak varır. Kural: `y = 1300 - 330/zoom` (yüzler altyazının üstünde kalır). |
| `actors` | `bull` ve `goblin`: `path` (konum, `face`, `scale`), `moods`, `looks`, `actions`, `show`. |
| `props` | Görsel öğeler (aşağıda). |
| `sfx` | Ek efektler `{ at, name, gain }`. |
| `shake` | Kamera sarsıntısı `{ at, amp }`. |
| `tail` | Son satırdan sonra kalan süre (CTA için). |

**Zaman çapaları (`at`)**: `2.5` saniye · `"3"` 3. satır başı · `"3>"` satır sonu · `"3:margin"` 3. satırdaki kelime ·
`"4:20#2"` ikinci geçiş · `"2:open>"` kelime sonu · `"2:open+0.3"` ofset · `"end-1"`. Sesler değişse de zamanlama kendiliğinden kayar.

**Boğa eylemleri**: wave, point, cheer, type, write, shrug, hold, facepalm, jump (`h`), bounce, tilt (`deg`), shake, sweat, nod.
**Boğa duyguları**: neutral, happy, excited, shocked, worried, sad, angry, smug, think, determined. Ağız sesle otomatik oynar, göz kırpma otomatiktir.
**Goblin eylemleri**: grab, laugh, dance, sad, sneak, jump. `sack` ile çuval büyüklüğü zamanla değişir.

**Prop türleri**: `title` (pop başlık, `icon: bookmark|heart|send|comment|plus|link`), `notify` (bildirim), `write` (el yazısı, `follow` ile önceki yazının devamı),
`draw` (`around` + `sub` ile yazının bir parçasını daire/altı çizgi), `sticky`, `tag` (ör. ILLUSTRATIVE), `card` (zamanla değişen satırlar),
`coins` (`from`/`to` koordinat ya da `"goblin.sack"`, `"bull.hand"`), `coinRain`, `confetti` (`mode: 'rain'`), `rules`, `custom` (kendi SVG fonksiyonunuz).
Ekran alanındaki öğeler için `space: 'screen'`. Her öğe kendi efektini getirir, `sfx: false` ile kapatılır ya da `sfx: 'bell'` ile değiştirilir.

## İçerik kuralları (her bölümde)

- Örnek rakamlar ekranda "ILLUSTRATIVE" etiketi taşır, hesaplar episode dosyasının başında yorum olarak yazılır.
- Kâr vaadi, al-sat çağrısı, "not financial advice" satırı, em dash, "~", gerçek kişi adı, marka logosu ya da arayüzü yoktur.
- CTA her bölümde değişir: Save this, Follow for more, Comment X, Link in bio, Send this to a friend.

## Kurulum ve lisanslar

`video/.venv` (Python): `kokoro-onnx`, `onnxruntime` (MIT), `faster-whisper` (MIT), `soundfile`.
`video/models` (git dışında): Kokoro-82M v1.0 (Apache-2.0, yaklaşık 340 MB), Whisper tiny.en (MIT, yaklaşık 75 MB).
Fontlar `assets/fonts`: Caveat (OFL), Luckiest Guy (Apache-2.0). Sistemde hazır olanlar: Inter, JetBrains Mono, Chromium + Playwright, ffmpeg.

Yeni bir ortamda kurulum:

```bash
cd video && python3 -m venv .venv && .venv/bin/pip install kokoro-onnx faster-whisper soundfile
mkdir -p models && cd models
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```

Whisper modeli ilk çalıştırmada `models/whisper` klasörüne iner.
