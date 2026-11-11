// Locations. Each set occupies [x, x + width] in world space; floor line at y = 1300.
import { PAL, FONT, rng, noise, f1, esc, clamp } from './core.js';

export const FLOOR = 1300;
const TOP = -900, BOT = 2900;

function wall(ox, w, c1, c2, id) {
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
  <rect x="${ox}" y="${TOP}" width="${w}" height="${FLOOR - TOP}" fill="url(#${id})"/>`;
}
function floor(ox, w, c = '#16121a', line = '#221b26') {
  let s = `<rect x="${ox}" y="${FLOOR}" width="${w}" height="${BOT - FLOOR}" fill="${c}"/>
    <rect x="${ox}" y="${FLOOR - 18}" width="${w}" height="22" fill="#0b0d14"/>`;
  for (let i = 1; i < 8; i++) s += `<line x1="${ox}" x2="${ox + w}" y1="${FLOOR + i * 70}" y2="${FLOOR + i * 70}" stroke="${line}" stroke-width="3"/>`;
  return s;
}
function pillar(x) {
  return `<rect x="${x - 26}" y="${TOP}" width="52" height="${BOT - TOP}" fill="#090b11"/><rect x="${x - 26}" y="${TOP}" width="10" height="${BOT - TOP}" fill="#141824"/>`;
}
function stars(ox, x0, y0, w, h, n, t, seed) {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = ox + x0 + r() * w, y = y0 + r() * h, ph = r() * 6, sp = 1 + r() * 2.5, rad = 1.5 + r() * 2.5;
    s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rad)}" fill="#fff" opacity="${f1(0.25 + 0.75 * Math.abs(Math.sin(t * sp + ph)) * 100) / 100}"/>`;
  }
  return s;
}
function skyline(ox, x0, w, base, t, seed, color, maxH = 420, lit = 0.35) {
  const r = rng(seed);
  let s = '', x = ox + x0;
  while (x < ox + x0 + w) {
    const bw = 50 + r() * 90, bh = 120 + r() * maxH;
    s += `<rect x="${f1(x)}" y="${f1(base - bh)}" width="${f1(bw)}" height="${f1(bh)}" fill="${color}"/>`;
    for (let wy = base - bh + 18; wy < base - 16; wy += 30) {
      for (let wx = x + 10; wx < x + bw - 14; wx += 22) {
        const k = r();
        if (k < lit) {
          const on = noise(t * 0.4 + k * 50, seed + 'w') > -0.6;
          if (on) s += `<rect x="${f1(wx)}" y="${f1(wy)}" width="9" height="13" fill="#ffd77a" opacity="${f1(0.35 + k)}"/>`;
        }
      }
    }
    x += bw + 6 + r() * 14;
  }
  return s;
}
export function candles(n, seed, start = 100) {
  const r = rng(seed);
  const out = [];
  let p = start;
  for (let i = 0; i < n; i++) {
    const o = p, c = o + (r() - 0.48) * 3.2;
    out.push({ o, c, h: Math.max(o, c) + r() * 1.6, l: Math.min(o, c) - r() * 1.6 });
    p = c;
  }
  return out;
}
// candle chart box, live last candle and slow scroll
export function chart(x, y, w, h, t, seed, opts = {}) {
  const per = opts.per ?? 1.6;
  const shift = Math.floor(t / per);
  const frac = (t / per) % 1;
  const all = candles(200, seed);
  const vis = opts.count ?? 24;
  const data = all.slice(shift, shift + vis).map((c) => ({ ...c }));
  const last = data[data.length - 1];
  last.c = last.o + (last.c - last.o) * Math.min(1, frac * 1.4) + noise(t * 3, seed + 'c') * 0.6;
  last.h = Math.max(last.h, last.c); last.l = Math.min(last.l, last.c);
  let lo = Infinity, hi = -Infinity;
  for (const c of data) { lo = Math.min(lo, c.l); hi = Math.max(hi, c.h); }
  const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
  const Y = (v) => y + h - ((v - lo) / (hi - lo)) * h;
  const step = w / vis;
  let s = '';
  for (let g = 1; g < 5; g++) s += `<line x1="${x}" x2="${x + w}" y1="${f1(y + (g * h) / 5)}" y2="${f1(y + (g * h) / 5)}" stroke="#1d2636" stroke-width="2"/>`;
  data.forEach((c, i) => {
    const cx = x + step * (i + 0.5);
    const col = c.c >= c.o ? PAL.green : PAL.red;
    s += `<line x1="${f1(cx)}" x2="${f1(cx)}" y1="${f1(Y(c.h))}" y2="${f1(Y(c.l))}" stroke="${col}" stroke-width="${opts.wick ?? 3}"/>`;
    const top = Math.min(Y(c.o), Y(c.c)), bh = Math.max(3, Math.abs(Y(c.o) - Y(c.c)));
    s += `<rect x="${f1(cx - step * 0.32)}" y="${f1(top)}" width="${f1(step * 0.64)}" height="${f1(bh)}" fill="${col}" rx="2"/>`;
  });
  const ly = Y(last.c);
  if (opts.priceLine !== false) s += `<line x1="${x}" x2="${x + w}" y1="${f1(ly)}" y2="${f1(ly)}" stroke="${last.c >= last.o ? PAL.green : PAL.red}" stroke-width="2" stroke-dasharray="8 8" opacity="0.7"/>`;
  return s;
}

// ---------------- ROOM: desk, monitors, window, clock ----------------
function room(ox, t) {
  let s = wall(ox, 1200, '#1b2340', '#111729', 'wRoom');
  for (let i = 0; i < 20; i++) s += `<rect x="${ox + i * 60}" y="${TOP}" width="30" height="${FLOOR - TOP}" fill="#fff" opacity="0.025"/>`;
  // window
  s += `<rect x="${ox + 90}" y="300" width="380" height="420" rx="8" fill="#0a1230"/>
    <defs><linearGradient id="skyR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1235"/><stop offset="1" stop-color="#253666"/></linearGradient>
    <clipPath id="winR"><rect x="${ox + 90}" y="300" width="380" height="420"/></clipPath></defs>
    <g clip-path="url(#winR)"><rect x="${ox + 90}" y="300" width="380" height="420" fill="url(#skyR)"/>
    <circle cx="${ox + 390}" cy="380" r="60" fill="${PAL.goldL}" opacity="0.12"/><circle cx="${ox + 390}" cy="380" r="34" fill="${PAL.goldL}"/>
    ${stars(ox, 100, 310, 360, 200, 16, t, 'rs')}
    ${skyline(ox, 80, 400, 722, t, 'rsky', '#0a0f22', 260, 0.3)}</g>
    <rect x="${ox + 90}" y="300" width="380" height="420" rx="8" fill="none" stroke="#323c5c" stroke-width="18"/>
    <line x1="${ox + 280}" x2="${ox + 280}" y1="300" y2="720" stroke="#323c5c" stroke-width="12"/>
    <line x1="${ox + 90}" x2="${ox + 470}" y1="510" y2="510" stroke="#323c5c" stroke-width="12"/>
    <rect x="${ox + 70}" y="720" width="420" height="22" rx="6" fill="#2a3350"/>`;
  // shelf with books and plant
  s += `<rect x="${ox + 560}" y="430" width="360" height="16" rx="4" fill="#3b2d22"/>`;
  const bc = ['#26a69a', '#ef5350', '#E4C471', '#5c6bc0', '#8d6e63', '#26a69a'];
  for (let i = 0; i < 6; i++) s += `<rect x="${ox + 580 + i * 34}" y="${430 - 90 - (i % 3) * 12}" width="28" height="${90 + (i % 3) * 12}" rx="3" fill="${bc[i]}" opacity="0.85"/>`;
  s += `<rect x="${ox + 820}" y="370" width="56" height="60" rx="8" fill="#6d4c41"/>`;
  for (let i = 0; i < 5; i++) s += `<ellipse cx="${ox + 848 + (i - 2) * 16}" cy="${350 - Math.abs(i - 2) * -8}" rx="14" ry="38" fill="#2e7d5b" transform="rotate(${(i - 2) * 22 + 3 * Math.sin(t * 1.5 + i)} ${ox + 848} 380)"/>`;
  // clock with ticking hand
  const sec = Math.floor(t) + Math.min(1, (t % 1) * 8);
  s += `<circle cx="${ox + 1060}" cy="380" r="64" fill="#e9e4d4" stroke="#3a3f52" stroke-width="10"/>
    ${Array.from({ length: 12 }, (_, i) => `<line x1="${ox + 1060}" y1="326" x2="${ox + 1060}" y2="338" stroke="#3a3f52" stroke-width="5" transform="rotate(${i * 30} ${ox + 1060} 380)"/>`).join('')}
    <line x1="${ox + 1060}" y1="380" x2="${ox + 1060}" y2="345" stroke="#1d2233" stroke-width="7" stroke-linecap="round" transform="rotate(${50 + t * 2} ${ox + 1060} 380)"/>
    <line x1="${ox + 1060}" y1="390" x2="${ox + 1060}" y2="332" stroke="${PAL.red}" stroke-width="4" transform="rotate(${sec * 6 * 6} ${ox + 1060} 380)"/>
    <circle cx="${ox + 1060}" cy="380" r="7" fill="#1d2233"/>`;
  s += floor(ox, 1200, '#17121a', '#211a24');
  s += `<ellipse cx="${ox + 330}" cy="1420" rx="300" ry="70" fill="#3a1f2a"/><ellipse cx="${ox + 330}" cy="1420" rx="260" ry="54" fill="none" stroke="${PAL.gold}" stroke-opacity="0.35" stroke-width="6" stroke-dasharray="18 12"/>
    <ellipse cx="${ox + 330}" cy="1420" rx="190" ry="36" fill="#4a2834"/>
    <rect x="${ox + 1100}" y="1500" width="70" height="90" rx="8" fill="#2a2f3d"/><circle cx="${ox + 1120}" cy="1495" r="16" fill="#e9e4d4"/><circle cx="${ox + 1148}" cy="1490" r="13" fill="#d8d2c0"/>
    <path d="M${ox + 60} 1700 h 260" stroke="#2a2232" stroke-width="10" stroke-linecap="round"/>`;
  // desk + monitors
  s += `<rect x="${ox + 500}" y="1050" width="640" height="250" fill="#2a1e16"/>
    <rect x="${ox + 540}" y="1100" width="250" height="70" rx="6" fill="#33251b"/><rect x="${ox + 820}" y="1100" width="280" height="70" rx="6" fill="#33251b"/>
    <rect x="${ox + 640}" y="1128" width="50" height="10" rx="5" fill="#8a6d4a"/><rect x="${ox + 935}" y="1128" width="50" height="10" rx="5" fill="#8a6d4a"/>
    <rect x="${ox + 470}" y="1030" width="700" height="30" rx="6" fill="#4a3526"/><rect x="${ox + 470}" y="1030" width="700" height="7" rx="3" fill="#6b4e37"/>`;
  [[690, 'm1'], [960, 'm2']].forEach(([cx, seed], k) => {
    const x = ox + cx - 125, y = 800;
    s += `<rect x="${ox + cx - 12}" y="${y + 170}" width="24" height="60" fill="#151821"/><rect x="${ox + cx - 60}" y="1022" width="120" height="10" rx="4" fill="#151821"/>
      <rect x="${x}" y="${y}" width="250" height="175" rx="10" fill="#0c0f16" stroke="#2a2f3d" stroke-width="5"/>
      <rect x="${x + 10}" y="${y + 10}" width="230" height="155" fill="#0b1322"/>
      ${chart(x + 18, y + 22, 214, 130, t + k * 3, seed, { count: 14, per: 0.9, wick: 2, priceLine: false })}
      <rect x="${x + 10}" y="${y + 10}" width="230" height="155" fill="#7fb2ff" opacity="${f1(0.04 + 0.03 * Math.sin(t * 7 + k)) }"/>`;
  });
  s += `<rect x="${ox + 600}" y="1012" width="270" height="20" rx="5" fill="#1e2230"/><rect x="${ox + 900}" y="1010" width="60" height="22" rx="10" fill="#1e2230"/>`;
  // mug + steam
  s += `<rect x="${ox + 1060}" y="975" width="56" height="58" rx="8" fill="${PAL.red}"/><path d="M${ox + 1116} 990 q 22 0 22 18 q 0 18 -22 18" stroke="${PAL.red}" stroke-width="8" fill="none"/>`;
  for (let i = 0; i < 3; i++) {
    const ph = (t * 0.8 + i / 3) % 1;
    s += `<path d="M${ox + 1078 + i * 12} ${965 - ph * 90} q 12 -20 0 -40 q -12 -20 0 -40" stroke="#fff" stroke-width="5" fill="none" opacity="${f1((1 - ph) * 0.35 * 100) / 100}" stroke-linecap="round"/>`;
  }
  return s;
}

// ---------------- EXCHANGE: big trading wall screen ----------------
function exchange(ox, t, o = {}) {
  let s = wall(ox, 1200, '#0e1424', '#0a0e19', 'wEx');
  for (let i = 0; i < 12; i++) s += `<line x1="${ox + i * 100}" x2="${ox + i * 100}" y1="${TOP}" y2="${FLOOR}" stroke="#ffffff" stroke-opacity="0.025" stroke-width="2"/>`;
  // LED strip with moving pulses
  s += `<rect x="${ox + 60}" y="150" width="1080" height="14" rx="7" fill="#151b2b"/>`;
  for (let i = 0; i < 6; i++) {
    const px = ox + 60 + ((t * 260 + i * 180) % 1080);
    s += `<rect x="${f1(px)}" y="150" width="70" height="14" rx="7" fill="${i % 2 ? PAL.green : PAL.gold}" opacity="0.7"/>`;
  }
  const X = ox + 60, Y = 330, Wd = 1080, Hd = 680;
  s += `<rect x="${X - 8}" y="${Y - 8}" width="${Wd + 16}" height="${Hd + 16}" rx="26" fill="#05070b" stroke="#283042" stroke-width="6"/>
    <rect x="${X}" y="${Y}" width="${Wd}" height="${Hd}" rx="18" fill="#0b111b"/>
    <line x1="${X}" x2="${X + Wd}" y1="${Y + 66}" y2="${Y + 66}" stroke="#1d2636" stroke-width="3"/>
    <text data-qa="bg" data-g="exhdr" x="${X + 30}" y="${Y + 45}" font-family="${FONT.ui}" font-weight="800" font-size="32" fill="#fff">${esc(o.symbol || 'BTC-PERP')}</text>
    <text data-qa="bg" data-g="exhdr" x="${X + 240}" y="${Y + 45}" font-family="${FONT.ui}" font-weight="600" font-size="26" fill="#7d8799">1m</text>`;
  const pill = o.tag ?? 'ILLUSTRATIVE DATA';
  if (pill) s += `<rect x="${X + Wd - 290}" y="${Y + 16}" width="262" height="36" rx="18" fill="#ffffff" fill-opacity="0.07" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2"/>
    <text data-qa="bg" data-g="exhdr" x="${X + Wd - 159}" y="${Y + 41}" text-anchor="middle" font-family="${FONT.ui}" font-weight="700" font-size="19" letter-spacing="2" fill="#c9d1d9">${esc(pill)}</text>`;
  s += chart(X + 24, Y + 90, 610, 560, t, o.seed || 'ex1', { count: 22 });
  // order book
  const bx = X + 664, bw = 390;
  s += `<text data-qa="bg" data-g="ob" x="${bx}" y="${Y + 110}" font-family="${FONT.ui}" font-weight="700" font-size="24" fill="#9aa4b5">Order book</text>
    <text data-qa="bg" data-g="ob" x="${bx}" y="${Y + 148}" font-family="${FONT.ui}" font-size="20" fill="#5f6b80">Price</text>
    <text data-qa="bg" data-g="ob" x="${bx + bw}" y="${Y + 148}" text-anchor="end" font-family="${FONT.ui}" font-size="20" fill="#5f6b80">Size</text>`;
  const mid = o.mid ?? 64210.5;
  const tick = Math.floor(t / 0.35);
  const rowH = 33;
  const row = (i, price, side, k) => {
    const r = rng(`ob${side}${k}${tick}`);
    const size = (0.05 + r() * 2.4).toFixed(3);
    const depth = 0.15 + r() * 0.8;
    const yy = Y + 172 + i * rowH;
    const col = side === 'a' ? PAL.red : PAL.green;
    return `<rect x="${f1(bx + bw * (1 - depth))}" y="${yy}" width="${f1(bw * depth)}" height="${rowH - 4}" fill="${col}" opacity="0.13"/>
      <text data-qa="bg" data-g="ob" x="${bx + 6}" y="${yy + 23}" font-family="${FONT.mono}" font-size="22" fill="${col}">${price.toFixed(1)}</text>
      <text data-qa="bg" data-g="ob" x="${bx + bw - 6}" y="${yy + 23}" text-anchor="end" font-family="${FONT.mono}" font-size="22" fill="#c9d1d9">${size}</text>`;
  };
  for (let i = 0; i < 7; i++) s += row(i, mid + (7 - i) * 0.5, 'a', i);
  const midY = Y + 172 + 7 * rowH;
  const last = mid + 0.5 * Math.round(noise(t * 0.8, 'mid') * 2);
  s += `<text data-qa="bg" data-g="ob" x="${bx + 6}" y="${midY + 36}" font-family="${FONT.mono}" font-weight="700" font-size="32" fill="${PAL.green}">${last.toFixed(1)}</text>`;
  for (let i = 0; i < 7; i++) s += row(i + 8.4, mid - i * 0.5 - 0.5, 'b', i);
  s += floor(ox, 1200, '#0f121b', '#181c28');
  s += `<defs><linearGradient id="exRef" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26a69a" stop-opacity="0.16"/><stop offset="1" stop-color="#26a69a" stop-opacity="0"/></linearGradient></defs>
    <rect x="${ox + 60}" y="1305" width="1080" height="420" fill="url(#exRef)"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${ox + 100 + i * 115}" y="1320" width="${40 + (i % 3) * 20}" height="${120 + ((i * 37) % 160)}" fill="${i % 3 ? PAL.green : PAL.red}" opacity="${f1(0.05 + 0.03 * Math.sin(t * 2 + i) * 100) / 100 + 0.03}"/>`).join('')}
    <path d="M${ox + 200} 1600 q 200 40 400 0 t 400 0" stroke="#1d2433" stroke-width="10" fill="none"/>`;
  // ceiling glow over screen
  s += `<ellipse cx="${ox + 600}" cy="${Y + Hd + 40}" rx="520" ry="40" fill="#7fb2ff" opacity="0.05"/>`;
  return s;
}

// ---------------- WHITEBOARD ----------------
function whiteboard(ox, t) {
  let s = wall(ox, 1200, '#1d2333', '#141927', 'wWb');
  s += `<rect x="${ox}" y="1120" width="1200" height="${FLOOR - 1120}" fill="#151a28"/><rect x="${ox}" y="1112" width="1200" height="10" fill="#262d40"/>`;
  // wall lamp glow
  s += `<ellipse cx="${ox + 480}" cy="250" rx="420" ry="90" fill="${PAL.goldL}" opacity="${f1(0.05 + 0.01 * Math.sin(t * 2) * 100) / 100}"/>
    <rect x="${ox + 430}" y="210" width="100" height="22" rx="10" fill="#3a4157"/>`;
  const X = ox + 60, Y = 300, Wd = 840, Hd = 720;
  s += `<rect x="${X - 14}" y="${Y - 14}" width="${Wd + 28}" height="${Hd + 28}" rx="14" fill="#aeb6c4"/>
    <rect x="${X}" y="${Y}" width="${Wd}" height="${Hd}" fill="#f4f3ee"/>
    <ellipse cx="${X + 600}" cy="${Y + 200}" rx="160" ry="40" fill="#8a96aa" opacity="0.06"/>
    <ellipse cx="${X + 200}" cy="${Y + 560}" rx="200" ry="30" fill="#8a96aa" opacity="0.05"/>
    <rect x="${X + 40}" y="${Y + Hd + 14}" width="${Wd - 80}" height="20" rx="6" fill="#8d96a6"/>
    <rect x="${X + 90}" y="${Y + Hd + 4}" width="80" height="14" rx="6" fill="${PAL.red}"/><rect x="${X + 190}" y="${Y + Hd + 4}" width="80" height="14" rx="6" fill="#2d4a8a"/><rect x="${X + 290}" y="${Y + Hd + 4}" width="80" height="14" rx="6" fill="#1f8f84"/>`;
  s += floor(ox, 1200, '#121520', '#1b1f2c');
  for (let i = 0; i < 14; i++) s += `<line x1="${ox + i * 100 - 300}" y1="${FLOOR}" x2="${ox + i * 100 - 600}" y2="${BOT}" stroke="#1b1f2c" stroke-width="3"/>`;
  s += `<rect x="${ox + 120}" y="1520" width="170" height="34" rx="4" fill="#5c6bc0"/><rect x="${ox + 135}" y="1488" width="150" height="32" rx="4" fill="${PAL.red}" opacity="0.85"/><rect x="${ox + 128}" y="1458" width="140" height="30" rx="4" fill="${PAL.green}" opacity="0.85"/>
    <ellipse cx="${ox + 600}" cy="1430" rx="420" ry="60" fill="${PAL.goldL}" opacity="0.04"/>`;
  // potted plant at right
  s += `<rect x="${ox + 1080}" y="1190" width="80" height="110" rx="10" fill="#5d4037"/>`;
  for (let i = 0; i < 6; i++) s += `<ellipse cx="${ox + 1120}" cy="1120" rx="16" ry="66" fill="#2e7d5b" transform="rotate(${(i - 2.5) * 20 + 3 * Math.sin(t * 1.3 + i)} ${ox + 1120} 1190)"/>`;
  return s;
}

// ---------------- OUTDOOR: rooftop at night with billboard ----------------
function outdoor(ox, t) {
  let s = `<defs><linearGradient id="skyO" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060a1c"/><stop offset="0.55" stop-color="#151a3e"/><stop offset="1" stop-color="#3a2346"/></linearGradient></defs>
    <rect x="${ox}" y="${TOP}" width="1200" height="${FLOOR - TOP}" fill="url(#skyO)"/>`;
  s += stars(ox, 0, TOP + 100, 1200, 1100 - TOP, 60, t, 'os');
  s += `<circle cx="${ox + 980}" cy="110" r="120" fill="${PAL.goldL}" opacity="0.08"/><circle cx="${ox + 980}" cy="110" r="62" fill="${PAL.goldL}"/><circle cx="${ox + 960}" cy="95" r="12" fill="#e6d49a"/>`;
  for (let i = 0; i < 4; i++) {
    const cx = ox + ((i * 380 + t * 18) % 1500) - 150, cy = 120 + i * 140;
    s += `<ellipse cx="${f1(cx)}" cy="${cy}" rx="160" ry="34" fill="#fff" opacity="0.05"/><ellipse cx="${f1(cx + 60)}" cy="${cy - 18}" rx="90" ry="28" fill="#fff" opacity="0.05"/>`;
  }
  s += skyline(ox, -20, 1240, 1260, t, 'far', '#16163a', 520, 0.18);
  s += skyline(ox, -40, 1260, 1290, t, 'near', '#0d0d26', 300, 0.3);
  s += `<rect x="${ox}" y="${FLOOR - 30}" width="1200" height="40" fill="#22203a"/><rect x="${ox}" y="${FLOOR}" width="1200" height="${BOT - FLOOR}" fill="#14121f"/>`;
  for (let i = 0; i < 8; i++) s += `<line x1="${ox}" x2="${ox + 1200}" y1="${FLOOR + 30 + i * 70}" y2="${FLOOR + 30 + i * 70}" stroke="#1d1a2b" stroke-width="3"/>`;
  s += `<rect x="${ox + 80}" y="1440" width="220" height="130" rx="10" fill="#262438"/><circle cx="${ox + 190}" cy="1505" r="46" fill="#1a1828"/>
    <g transform="rotate(${f1(t * 400)} ${ox + 190} 1505)"><path d="M${ox + 190} 1465 L ${ox + 200} 1505 L ${ox + 190} 1545 L ${ox + 180} 1505 Z M ${ox + 150} 1505 L ${ox + 190} 1495 L ${ox + 230} 1505 L ${ox + 190} 1515 Z" fill="#3a3852"/></g>
    <ellipse cx="${ox + 760}" cy="1560" rx="190" ry="34" fill="#2a3352" opacity="0.7"/><ellipse cx="${ox + 790}" cy="1556" rx="40" ry="9" fill="${PAL.goldL}" opacity="${f1(0.35 + 0.1 * Math.sin(t * 3) * 100) / 100}"/>
    <path d="M${ox + 400} 1700 h 700" stroke="#1d1a2b" stroke-width="14" stroke-linecap="round"/>`;
  // billboard
  const X = ox + 100, Y = 250, Wd = 1000, Hd = 500;
  const flick = 0.85 + 0.15 * clamp(noise(t * 6, 'neon') * 3 + 0.7);
  s += `<rect x="${ox + 290}" y="${Y + Hd}" width="30" height="${FLOOR - Y - Hd}" fill="#2a2e3a"/><rect x="${ox + 870}" y="${Y + Hd}" width="30" height="${FLOOR - Y - Hd}" fill="#2a2e3a"/>
    <rect x="${X}" y="${Y}" width="${Wd}" height="${Hd}" rx="24" fill="#0f1422"/>
    <rect x="${X + 10}" y="${Y + 10}" width="${Wd - 20}" height="${Hd - 20}" rx="18" fill="none" stroke="${PAL.gold}" stroke-width="16" opacity="${f1(0.25 * flick * 100) / 100}" filter="url(#blur8)"/>
    <rect x="${X + 10}" y="${Y + 10}" width="${Wd - 20}" height="${Hd - 20}" rx="18" fill="none" stroke="${PAL.goldL}" stroke-width="5" opacity="${f1(flick * 100) / 100}"/>`;
  // street lamp
  s += `<rect x="${ox + 1140}" y="700" width="14" height="${FLOOR - 700}" fill="#2a2e3a"/><path d="M${ox + 1147} 700 q 0 -40 -50 -40" stroke="#2a2e3a" stroke-width="12" fill="none"/>
    <ellipse cx="${ox + 1095}" cy="672" rx="26" ry="12" fill="${PAL.goldL}"/><ellipse cx="${ox + 1095}" cy="760" rx="120" ry="160" fill="${PAL.goldL}" opacity="0.06"/>`;
  return s;
}

// ---------------- DUO: two desks side by side with a divider (comparisons) ----------------
function duo(ox, t, o = {}) {
  let s = wall(ox, 1200, '#1a2138', '#10162a', 'wDuo');
  for (let i = 0; i < 20; i++) s += `<rect x="${ox + i * 60}" y="${TOP}" width="30" height="${FLOOR - TOP}" fill="#fff" opacity="0.02"/>`;
  s += floor(ox, 1200, '#17121a', '#211a24');
  const cols = o.colors || [PAL.red, PAL.green];
  [0, 1].forEach((k) => {
    const cx = ox + 300 + k * 600;
    // wall screen
    s += `<rect x="${cx - 190}" y="660" width="380" height="200" rx="12" fill="#0c0f16" stroke="#2a2f3d" stroke-width="6"/>
      <rect x="${cx - 180}" y="670" width="360" height="180" fill="#0b1322"/>
      ${chart(cx - 166, 684, 332, 152, t * (k ? 0.5 : 1.6) + k * 7, 'duo' + k, { count: 16, per: k ? 1.4 : 0.5, wick: 2, priceLine: false })}
      <rect x="${cx - 190}" y="660" width="380" height="8" rx="4" fill="${cols[k]}" opacity="0.8"/>`;
    // desk
    s += `<rect x="${cx - 250}" y="1150" width="500" height="150" fill="#2a1e16"/><rect x="${cx - 270}" y="1130" width="540" height="26" rx="6" fill="#4a3526"/>
      <rect x="${cx - 270}" y="1130" width="540" height="6" rx="3" fill="#6b4e37"/>
      <ellipse cx="${cx}" cy="1420" rx="250" ry="56" fill="${cols[k]}" opacity="0.08"/>`;
  });
  // divider
  s += `<line x1="${ox + 600}" x2="${ox + 600}" y1="200" y2="${FLOOR + 400}" stroke="${PAL.gold}" stroke-width="6" stroke-dasharray="26 18" stroke-dashoffset="${f1(-t * 40)}" opacity="0.55"/>`;
  return s;
}

// ---------------- QUAD: four trading booths in a row, same chart on every screen ----------------
function quad(ox, t, o = {}) {
  let s = wall(ox, 1200, '#171d31', '#0f1424', 'wQuad');
  s += floor(ox, 1200, '#141019', '#1e1824');
  const cols = o.colors || [PAL.red, '#5c7cfa', PAL.green, PAL.gold];
  cols.forEach((c, k) => {
    const cx = ox + 165 + k * 290;
    s += `<rect x="${cx - 132}" y="500" width="264" height="800" fill="${c}" opacity="0.06"/>
      <rect x="${cx - 132}" y="500" width="264" height="8" fill="${c}" opacity="0.8"/>
      <rect x="${cx - 112}" y="560" width="224" height="150" rx="10" fill="#0c0f16" stroke="#2a2f3d" stroke-width="5"/>
      ${chart(cx - 100, 572, 200, 126, t, 'samechart', { count: 12, per: 1.2, wick: 2, priceLine: false })}
      <rect x="${cx - 150}" y="1180" width="300" height="120" fill="#2a1e16"/><rect x="${cx - 160}" y="1165" width="320" height="20" rx="5" fill="#4a3526"/>`;
    if (k) s += `<rect x="${cx - 147}" y="500" width="6" height="800" fill="#0a0d14"/>`;
  });
  return s;
}

// ---------------- TRACK: night stadium with lanes and hurdles ----------------
function track(ox, t, o = {}) {
  let s = `<defs><linearGradient id="skyT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070b1c"/><stop offset="1" stop-color="#1a1d3a"/></linearGradient></defs>
    <rect x="${ox}" y="${TOP}" width="1200" height="${FLOOR - TOP}" fill="url(#skyT)"/>`;
  s += stars(ox, 0, TOP + 100, 1200, 700, 30, t, 'ts');
  // floodlights
  [ox + 180, ox + 1020].forEach((lx, i) => {
    s += `<rect x="${lx - 6}" y="150" width="12" height="520" fill="#2a2e3a"/><rect x="${lx - 60}" y="120" width="120" height="44" rx="8" fill="#3a3f52"/>
      ${[0, 1, 2].map((j) => `<circle cx="${lx - 36 + j * 36}" cy="142" r="13" fill="#fff7d6"/>`).join('')}
      <path d="M${lx - 60} 164 L ${lx - 260 + i * 120} 1300 L ${lx + 260 - (1 - i) * 120} 1300 L ${lx + 60} 164 Z" fill="#fff7d6" opacity="${f1((0.05 + 0.01 * Math.sin(t * 3 + i)) * 100) / 100}"/>`;
  });
  // stands with crowd
  s += `<rect x="${ox}" y="760" width="1200" height="340" fill="#121428"/>`;
  const r = rng('crowd');
  for (let row = 0; row < 6; row++) for (let i = 0; i < 30; i++) {
    const x = ox + 20 + i * 40 + (row % 2) * 20, y = 790 + row * 52 + Math.sin(t * 6 + i + row) * (r() < 0.3 ? 5 : 1);
    s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="13" fill="${['#2b2f4a', '#353a5c', '#262a42'][(i + row) % 3]}"/>`;
  }
  s += `<rect x="${ox}" y="1100" width="1200" height="200" fill="#0f1220"/><rect x="${ox}" y="1096" width="1200" height="8" fill="${PAL.gold}" opacity="0.5"/>`;
  // track surface
  s += `<rect x="${ox}" y="${FLOOR}" width="1200" height="${BOT - FLOOR}" fill="#5a2a24"/>`;
  for (let i = 0; i < 6; i++) s += `<line x1="${ox}" x2="${ox + 1200}" y1="${FLOOR + 40 + i * 90}" y2="${FLOOR + 40 + i * 90}" stroke="#e9e4d4" stroke-width="5" opacity="0.6"/>`;
  // hurdles in front of each runner
  (o.lanes || []).forEach((x) => {
    s += `<g opacity="0.95"><rect x="${ox + x - 110}" y="1380" width="10" height="90" fill="#e9e4d4"/><rect x="${ox + x + 100}" y="1380" width="10" height="90" fill="#e9e4d4"/>
      <rect x="${ox + x - 120}" y="1372" width="240" height="22" rx="4" fill="#e9e4d4"/><rect x="${ox + x - 120}" y="1372" width="60" height="22" fill="${PAL.red}"/><rect x="${ox + x}" y="1372" width="60" height="22" fill="${PAL.red}"/></g>`;
  });
  return s;
}

// ---------------- STAGE: dark stage with coloured spotlights per position ----------------
function stage(ox, t, o = {}) {
  let s = wall(ox, 1200, '#120e1c', '#0b0912', 'wStage');
  // curtains
  for (let i = 0; i < 7; i++) s += `<rect x="${ox + i * 26}" y="${TOP}" width="22" height="${FLOOR - TOP}" fill="#5a1426" opacity="${0.9 - i * 0.1}"/><rect x="${ox + 1178 - i * 26}" y="${TOP}" width="22" height="${FLOOR - TOP}" fill="#5a1426" opacity="${0.9 - i * 0.1}"/>`;
  s += `<path d="M${ox} 140 Q ${ox + 600} 260 ${ox + 1200} 140 L ${ox + 1200} ${TOP} L ${ox} ${TOP} Z" fill="#6b1830"/>`;
  const cols = o.colors || [PAL.red, '#5c7cfa', PAL.green, PAL.gold];
  (o.spots || []).forEach((x, k) => {
    const sw = 0.85 + 0.15 * Math.sin(t * 2 + k);
    s += `<path d="M${ox + x - 30} 160 L ${ox + x - 150} ${FLOOR} L ${ox + x + 150} ${FLOOR} L ${ox + x + 30} 160 Z" fill="${cols[k]}" opacity="${f1(0.14 * sw * 100) / 100}"/>
      <ellipse cx="${ox + x}" cy="${FLOOR + 10}" rx="170" ry="34" fill="${cols[k]}" opacity="0.3"/>
      <rect x="${ox + x - 24}" y="140" width="48" height="30" rx="8" fill="#2a2e3a"/>`;
  });
  s += `<rect x="${ox}" y="${FLOOR}" width="1200" height="${BOT - FLOOR}" fill="#3a2a1e"/>`;
  for (let i = 0; i < 9; i++) s += `<line x1="${ox}" x2="${ox + 1200}" y1="${FLOOR + 20 + i * 60}" y2="${FLOOR + 20 + i * 60}" stroke="#2a1e16" stroke-width="4"/>`;
  s += `<rect x="${ox}" y="${FLOOR - 6}" width="1200" height="12" fill="${PAL.gold}" opacity="0.5"/>`;
  return s;
}

// ---------------- SHAFT: building cut-away, elevator on the left, switchback stairs on the right ----------------
// opts.floors: [{ y, label }] landings (feet level). Stairs connect consecutive landings.
function shaft(ox, t, o = {}) {
  const top = -2400;
  let s = `<rect x="${ox - 700}" y="${top}" width="2600" height="${BOT - top}" fill="#161c2e"/>`;
  for (let y = top; y < FLOOR; y += 120) s += `<line x1="${ox - 700}" x2="${ox + 1900}" y1="${y}" y2="${y}" stroke="#fff" stroke-opacity="0.02" stroke-width="2"/>`;
  // elevator shaft
  s += `<rect x="${ox + 80}" y="${top}" width="340" height="${FLOOR - top}" fill="#0b0e17"/>
    <rect x="${ox + 96}" y="${top}" width="10" height="${FLOOR - top}" fill="#2a3042"/><rect x="${ox + 394}" y="${top}" width="10" height="${FLOOR - top}" fill="#2a3042"/>
    <line x1="${ox + 250}" x2="${ox + 250}" y1="${top}" y2="${FLOOR}" stroke="#3a4157" stroke-width="4"/>`;
  const floors = o.floors || [];
  floors.forEach((f, i) => {
    s += `<rect x="${ox + 420}" y="${f.y}" width="740" height="26" fill="#2c3346"/><rect x="${ox + 420}" y="${f.y}" width="740" height="6" fill="#3d465e"/>
      <rect x="${ox + 80}" y="${f.y - 6}" width="340" height="8" fill="#3a4157" opacity="0.6"/>`;
    if (f.label) s += `<rect x="${ox + 120}" y="${f.y - 700}" width="260" height="96" rx="14" fill="#0f1420" stroke="${PAL.gold}" stroke-width="5"/>
      <text data-qa="bg" data-g="floor${i}" x="${ox + 250}" y="${f.y - 630}" text-anchor="middle" font-family="${FONT.ui}" font-weight="900" font-size="64" fill="${PAL.goldL}">${esc(f.label)}</text>`;
  });
  // switchback stairs between consecutive landings (right half)
  for (let i = 0; i + 1 < floors.length; i++) {
    const y0 = floors[i].y, y1 = floors[i + 1].y;
    const dir = i % 2 === 0 ? 1 : -1; // first flight goes up to the right
    const xa = dir < 0 ? ox + 1120 : ox + 560, xb = dir < 0 ? ox + 560 : ox + 1120;
    const n = 10;
    let d = `M${xa} ${y0}`;
    for (let k = 0; k < n; k++) {
      const x = xa + ((xb - xa) * (k + 1)) / n, y = y0 + ((y1 - y0) * (k + 1)) / n;
      d += ` L ${f1(x - (xb - xa) / n)} ${f1(y)} L ${f1(x)} ${f1(y)}`;
    }
    s += `<path d="${d} L ${xb} ${y0 + 26} L ${xa} ${y0 + 26} Z" fill="#3a3046"/><path d="${d}" fill="none" stroke="#6b5a7a" stroke-width="6"/>`;
    s += `<line x1="${xa}" y1="${y0 - 120}" x2="${xb}" y2="${y1 - 120}" stroke="#8a7a9a" stroke-width="6"/>`;
  }
  s += `<rect x="${ox - 700}" y="${FLOOR + 26}" width="2600" height="${BOT - FLOOR}" fill="#0e1018"/>`;
  return s;
}

// ---------------- PIT: night ground with a deep pit and a long ladder ----------------
function pit(ox, t, o = {}) {
  const depth = o.depth || 1000, px0 = ox + 300, px1 = ox + 900;
  let s = `<defs><linearGradient id="skyP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060a1c"/><stop offset="1" stop-color="#1d1a3e"/></linearGradient></defs>
    <rect x="${ox - 200}" y="${TOP - 600}" width="1900" height="${FLOOR - TOP + 600}" fill="url(#skyP)"/>`;
  s += stars(ox, -200, TOP - 500, 1900, 1500, 70, t, 'ps');
  s += `<circle cx="${ox + 980}" cy="420" r="60" fill="${PAL.goldL}"/><circle cx="${ox + 980}" cy="420" r="120" fill="${PAL.goldL}" opacity="0.07"/>`;
  s += skyline(ox, -220, 1940, 1290, t, 'pitsky', '#121130', 380, 0.2);
  // ground with the pit
  s += `<rect x="${ox - 200}" y="${FLOOR}" width="1900" height="${depth + 900}" fill="#2a2130"/>
    <rect x="${px0}" y="${FLOOR}" width="${px1 - px0}" height="${depth}" fill="#0c0a12"/>
    <rect x="${px0 - 12}" y="${FLOOR}" width="12" height="${depth}" fill="#3a2e42"/><rect x="${px1}" y="${FLOOR}" width="12" height="${depth}" fill="#3a2e42"/>
    <rect x="${ox - 200}" y="${FLOOR - 8}" width="1900" height="16" fill="#4a3a52"/>`;
  for (let i = 1; i < 9; i++) s += `<line x1="${px0}" x2="${px1}" y1="${FLOOR + i * depth / 9}" y2="${FLOOR + i * depth / 9}" stroke="#1a1522" stroke-width="3"/>`;
  // long ladder from the floor of the pit to the rim
  const lx = px1 - 140;
  s += `<rect x="${lx - 50}" y="${FLOOR - 120}" width="10" height="${depth + 120}" fill="#8d6e4a"/><rect x="${lx + 40}" y="${FLOOR - 120}" width="10" height="${depth + 120}" fill="#8d6e4a"/>`;
  for (let y = FLOOR - 100; y < FLOOR + depth; y += 60) s += `<rect x="${lx - 46}" y="${y}" width="92" height="9" fill="#a5835a"/>`;
  return s;
}

// ---------------- CHARTSCAPE: inside a chart, giant candles; opts.big = { x, top, bottom } ----------------
function chartscape(ox, t, o = {}) {
  let s = `<rect x="${ox - 300}" y="${TOP - 900}" width="1800" height="${BOT - TOP + 900}" fill="#0b111b"/>`;
  for (let x = ox - 300; x < ox + 1500; x += 100) s += `<line x1="${x}" x2="${x}" y1="${TOP - 900}" y2="${FLOOR}" stroke="#1d2636" stroke-width="3"/>`;
  for (let y = TOP - 900; y < FLOOR; y += 100) s += `<line x1="${ox - 300}" x2="${ox + 1500}" y1="${y}" y2="${y}" stroke="#1d2636" stroke-width="3"/>`;
  // rising run of normal candles before the big one
  const small = o.small || [];
  small.forEach((c, i) => {
    const col = c.up ? PAL.green : PAL.red, cx = ox + c.x;
    s += `<line x1="${cx}" x2="${cx}" y1="${c.top - 40}" y2="${c.bottom + 40}" stroke="${col}" stroke-width="10"/>
      <rect x="${cx - 45}" y="${c.top}" width="90" height="${c.bottom - c.top}" rx="8" fill="${col}"/>`;
  });
  const b = o.big;
  if (b) {
    const g = 0.5 + 0.5 * Math.sin(t * 3);
    s += `<line x1="${ox + b.x}" x2="${ox + b.x}" y1="${b.top}" y2="${b.bottom + 60}" stroke="${PAL.green}" stroke-width="16"/>
      <rect x="${ox + b.x - 140}" y="${b.top}" width="280" height="${b.bottom - b.top}" rx="14" fill="${PAL.green}"/>
      <rect x="${ox + b.x - 140}" y="${b.top}" width="280" height="${b.bottom - b.top}" rx="14" fill="#fff" opacity="${f1(0.05 + 0.05 * g) }"/>`;
  }
  s += `<rect x="${ox - 300}" y="${FLOOR}" width="1800" height="${BOT - FLOOR}" fill="#080c14"/>`;
  return s;
}

// ---------------- BUSSTOP: evening street with a bus shelter ----------------
function busstop(ox, t) {
  let s = `<defs><linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1840"/><stop offset="1" stop-color="#4a2a4a"/></linearGradient></defs>
    <rect x="${ox}" y="${TOP}" width="1200" height="${FLOOR - TOP}" fill="url(#skyB)"/>`;
  s += skyline(ox, -20, 1240, 1180, t, 'bus', '#1c1a38', 520, 0.25);
  s += `<rect x="${ox}" y="1180" width="1200" height="120" fill="#2a2838"/><rect x="${ox}" y="1290" width="1200" height="16" fill="#8a8aa0"/>
    <rect x="${ox}" y="${FLOOR + 6}" width="1200" height="${BOT - FLOOR}" fill="#1a1a24"/>`;
  for (let i = 0; i < 8; i++) s += `<rect x="${ox + i * 160 + ((-t * 0) % 160)}" y="${FLOOR + 140}" width="90" height="12" fill="#e9e4d4" opacity="0.5"/>`;
  // shelter
  s += `<rect x="${ox + 120}" y="760" width="16" height="540" fill="#3a3f52"/><rect x="${ox + 520}" y="760" width="16" height="540" fill="#3a3f52"/>
    <rect x="${ox + 100}" y="740" width="460" height="30" rx="8" fill="#4a5068"/>
    <rect x="${ox + 136}" y="780" width="384" height="380" fill="#9fd3ff" opacity="0.08"/>
    <rect x="${ox + 640}" y="720" width="14" height="580" fill="#3a3f52"/><circle cx="${ox + 647}" cy="700" r="46" fill="#26a69a" stroke="#e9e4d4" stroke-width="8"/>
    <rect x="${ox + 627}" y="684" width="40" height="30" rx="6" fill="#e9e4d4"/><circle cx="${ox + 635}" cy="718" r="4" fill="#26a69a"/><circle cx="${ox + 659}" cy="718" r="4" fill="#26a69a"/>`;
  // street lamp
  s += `<rect x="${ox + 1060}" y="560" width="14" height="740" fill="#2a2e3a"/><ellipse cx="${ox + 1040}" cy="560" rx="40" ry="14" fill="${PAL.goldL}"/>
    <ellipse cx="${ox + 1040}" cy="700" rx="160" ry="200" fill="${PAL.goldL}" opacity="0.06"/>`;
  return s;
}

export const SETS = { room, exchange, whiteboard, outdoor, duo, quad, track, stage, shaft, pit, chartscape, busstop };
export function drawWorld(world, t) {
  let s = '';
  for (const w of world) s += SETS[w.set](w.x, t, w.opts || {});
  for (const w of world) if (w.x > 0 && w.pillar !== false) s += pillar(w.x);
  return s;
}
