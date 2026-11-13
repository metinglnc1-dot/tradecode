#!/usr/bin/env node
// Pinterest "Trading Desk Setup" pins: node engine/desk.mjs [id ...] -> out/desk/<file>.jpg (1000x1500)
// Flat vector scenes in the MetrivaStudio style. No people, no hands, no brands, no P&L on any screen.
// The indicator on the main monitor is our own drawing in the channel's chart look (same colours and labels).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out', 'desk');
fs.mkdirSync(OUT, { recursive: true });

const W = 1000, H = 1500;
const G = '#26a69a', R = '#ef5350', GOLD = '#E4C471', GL = '#F6E6B0';
const font = (f) => `data:font/ttf;base64,${fs.readFileSync(path.join(ROOT, 'assets/fonts', f)).toString('base64')}`;

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ---------------- price path from key points (fractions of height, 0 = top) ----------------
function series(keys, n, seed, vol = 0.025) {
  const r = rng(seed), closes = [];
  for (let i = 0; i < n; i++) {
    const u = (i / (n - 1)) * (keys.length - 1), k = Math.floor(u), f = u - k;
    const a = keys[Math.min(k, keys.length - 1)], b = keys[Math.min(k + 1, keys.length - 1)];
    closes.push(a + (b - a) * (f * f * (3 - 2 * f)) + (r() - 0.5) * vol);
  }
  return closes.map((c, i) => {
    const o = i ? closes[i - 1] : c + (r() - 0.5) * vol;
    const hi = Math.min(o, c) - r() * vol * 0.8, lo = Math.max(o, c) + r() * vol * 0.8;
    return { o, c, hi, lo };
  });
}
function candles(x, y, w, h, bars, opts = {}) {
  const n = bars.length, cw = w / n;
  let s = '';
  bars.forEach((b, i) => {
    const cx = x + cw * (i + 0.5), up = b.c < b.o, col = up ? G : R;
    const yo = y + b.o * h, yc = y + b.c * h;
    s += `<line x1="${cx.toFixed(1)}" x2="${cx.toFixed(1)}" y1="${(y + b.hi * h).toFixed(1)}" y2="${(y + b.lo * h).toFixed(1)}" stroke="${col}" stroke-width="${Math.max(1.2, cw * 0.12).toFixed(1)}"/>
      <rect x="${(cx - cw * 0.32).toFixed(1)}" y="${Math.min(yo, yc).toFixed(1)}" width="${(cw * 0.64).toFixed(1)}" height="${Math.max(1.5, Math.abs(yc - yo)).toFixed(1)}" fill="${col}"/>`;
  });
  return s;
}
const chip = (x, y, text, bg, fg = '#0b111b', size = 13) => {
  const w = text.length * size * 0.66 + 14;
  return `<rect x="${(x - w / 2).toFixed(1)}" y="${(y - size).toFixed(1)}" width="${w.toFixed(1)}" height="${(size * 1.55).toFixed(1)}" rx="4" fill="${bg}"/>
    <text x="${x.toFixed(1)}" y="${(y + size * 0.22).toFixed(1)}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="${size}" fill="${fg}">${esc(text)}</text>`;
};

// ---------------- the indicator screens ----------------
function screen(product, x, y, w, h, seed, light = false) {
  const bg = light ? '#f7f8fa' : '#0b111b', grid = light ? '#e3e7ee' : '#1a2230';
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}"/>`;
  if (product === 'journal') return s + journalUI(x, y, w, h, light);
  for (let i = 1; i < 6; i++) s += `<line x1="${x}" x2="${x + w}" y1="${y + (h * i) / 6}" y2="${y + (h * i) / 6}" stroke="${grid}" stroke-width="1"/>`;
  for (let i = 1; i < 8; i++) s += `<line x1="${x + (w * i) / 8}" x2="${x + (w * i) / 8}" y1="${y}" y2="${y + h}" stroke="${grid}" stroke-width="1"/>`;
  // a neutral top bar (no brand): symbol placeholder and timeframe
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h * 0.075}" fill="${light ? '#eceff4' : '#111826'}"/>
    <text x="${x + 10}" y="${y + h * 0.055}" font-family="Inter" font-weight="800" font-size="${(h * 0.042).toFixed(1)}" fill="${light ? '#4b5568' : '#8d97a8'}">DEMO  15m</text>`;
  const cx = x + w * 0.02, cy = y + h * 0.1, cw = w * 0.9, ch = h * 0.84;
  const P = (fx, fy) => [cx + cw * fx, cy + ch * fy];
  let bars, over = '';
  if (product === 'smc') {
    bars = series([0.35, 0.55, 0.72, 0.62, 0.45, 0.3, 0.38, 0.22, 0.12], 46, seed);
    const [a, b] = P(0.3, 0.64), [a2] = P(0.42, 0);
    over += `<rect x="${a}" y="${b}" width="${cw * 0.62}" height="${ch * 0.1}" fill="${G}" opacity="0.18"/><rect x="${a}" y="${b}" width="${cw * 0.08}" height="${ch * 0.1}" fill="none" stroke="${G}" stroke-width="2"/>`;
    over += chip(a + cw * 0.04, b - 8, 'OB', G, '#06231f');
    const [fx, fy] = P(0.56, 0.36);
    over += `<rect x="${fx}" y="${fy}" width="${cw * 0.4}" height="${ch * 0.07}" fill="${GOLD}" opacity="0.22"/>` + chip(fx + cw * 0.05, fy - 8, 'FVG', GOLD);
    const [l1, ly] = P(0.12, 0.33), [l2] = P(0.78, 0);
    over += `<line x1="${l1}" x2="${l2}" y1="${ly}" y2="${ly}" stroke="#9fb4ff" stroke-width="2" stroke-dasharray="8 6"/>` + chip(l2 - 20, ly - 10, 'BOS', '#9fb4ff');
    const [c1, c1y] = P(0.18, 0.5);
    over += chip(c1, c1y, 'CHoCH', R, '#2a0b0a');
    void a2;
  } else if (product === 'killzones') {
    bars = series([0.45, 0.48, 0.44, 0.47, 0.45, 0.62, 0.4, 0.36, 0.42, 0.22, 0.15, 0.2], 54, seed, 0.02);
    [['ASIA', 0.04, 0.3, '#5c7cfa'], ['LONDON', 0.38, 0.58, G], ['NEW YORK', 0.66, 0.92, GOLD]].forEach(([n, a, b, c]) => {
      const [x0] = P(a, 0), [x1] = P(b, 0);
      over += `<rect x="${x0}" y="${cy}" width="${x1 - x0}" height="${ch}" fill="${c}" opacity="0.13"/><rect x="${x0}" y="${cy}" width="${x1 - x0}" height="4" fill="${c}"/>` + chip((x0 + x1) / 2, cy + 24, n, c, '#0b111b', 12);
    });
    const [r0, ry1] = P(0.04, 0.4), [r1, ry2] = P(0.6, 0.52);
    over += `<line x1="${r0}" x2="${r1}" y1="${ry1}" y2="${ry1}" stroke="#9fb4ff" stroke-width="1.6" stroke-dasharray="6 5"/><line x1="${r0}" x2="${r1}" y1="${ry2}" y2="${ry2}" stroke="#9fb4ff" stroke-width="1.6" stroke-dasharray="6 5"/>`;
  } else if (product === 'reversal') {
    bars = series([0.3, 0.55, 0.78, 0.6, 0.35, 0.18, 0.4, 0.62, 0.5], 46, seed);
    const marks = [[0.22, 'up'], [0.62, 'down'], [0.85, 'up']];
    marks.forEach(([f, d]) => {
      const i = Math.round(f * (bars.length - 1)), b = bars[i];
      const [mx] = P((i + 0.5) / bars.length, 0);
      if (d === 'up') { const my = cy + b.lo * ch + 14; over += `<path d="M${mx} ${my} l -9 16 h 18 Z" fill="${G}"/>` + chip(mx, my + 34, 'R', G, '#06231f', 12); }
      else { const my = cy + b.hi * ch - 14; over += `<path d="M${mx} ${my} l -9 -16 h 18 Z" fill="${R}"/>` + chip(mx, my - 30, 'R', R, '#2a0b0a', 12); }
    });
    const [zx, zy] = P(0.5, 0.12);
    over += `<rect x="${zx}" y="${zy}" width="${cw * 0.45}" height="${ch * 0.1}" fill="${R}" opacity="0.14"/>` + chip(zx + cw * 0.13, zy - 8, 'REVERSAL ZONE', R, '#2a0b0a', 11);
    const [rx, ry] = P(0.93, 0.85);
    over += `<g transform="translate(${rx} ${ry})" fill="none" stroke="${GOLD}" stroke-width="2.5"><circle r="5" fill="${GOLD}"/><path d="M 10 -10 A 14 14 0 0 1 10 10"/><path d="M 17 -17 A 24 24 0 0 1 17 17"/></g>`;
  } else {
    bars = series([0.3, 0.42, 0.64, 0.5, 0.66, 0.55, 0.65, 0.84, 0.5, 0.32, 0.2], 50, seed, 0.02);
    const [e0, ey] = P(0.25, 0.68), [e1] = P(0.66, 0);
    over += `<line x1="${e0}" x2="${e1}" y1="${ey}" y2="${ey}" stroke="${GOLD}" stroke-width="2" stroke-dasharray="8 6"/>` + chip(e0 + 26, ey + 22, 'EQL', GOLD);
    const [h0, hy] = P(0.04, 0.27), [h1] = P(0.3, 0);
    over += `<line x1="${h0}" x2="${h1}" y1="${hy}" y2="${hy}" stroke="#9fb4ff" stroke-width="2" stroke-dasharray="8 6"/>` + chip(h0 + 26, hy - 12, 'EQH', '#9fb4ff');
    const [sx, sy] = P(0.71, 0.82);
    over += `<circle cx="${sx}" cy="${sy}" r="16" fill="none" stroke="${GOLD}" stroke-width="3"/>` + chip(sx + 46, sy + 6, 'SWEEP', GOLD);
  }
  s += candles(cx, cy, cw, ch, bars) + over;
  // price scale strip without numbers
  s += `<rect x="${x + w * 0.93}" y="${y + h * 0.075}" width="${w * 0.07}" height="${h * 0.925}" fill="${light ? '#eef1f5' : '#0f1520'}"/>`;
  for (let i = 1; i < 6; i++) s += `<rect x="${x + w * 0.945}" y="${y + (h * i) / 6 - 2}" width="${w * 0.04}" height="4" rx="2" fill="${light ? '#c9d0db' : '#2a3446'}"/>`;
  return s;
}

function journalUI(x, y, w, h, light) {
  const fg = light ? '#1d2433' : '#e8edf5', mute = light ? '#8a94a6' : '#6b768c', line = light ? '#e3e7ee' : '#1d2636';
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h * 0.1}" fill="${light ? '#eceff4' : '#111826'}"/>
    <text x="${x + 14}" y="${y + h * 0.068}" font-family="Inter" font-weight="900" font-size="${(h * 0.045).toFixed(1)}" fill="${fg}">TRADING JOURNAL</text>`;
  s += chip(x + w - 70, y + h * 0.06, 'THIS WEEK', GOLD, '#0b111b', 11);
  const cols = ['DATE', 'SETUP', 'RISK', 'RULES', 'NOTE'], cx = [0.03, 0.18, 0.4, 0.52, 0.68];
  const ty = y + h * 0.17;
  cols.forEach((c, i) => { s += `<text x="${x + w * cx[i]}" y="${ty}" font-family="Inter" font-weight="800" font-size="${(h * 0.035).toFixed(1)}" fill="${mute}">${c}</text>`; });
  const rows = [['Mon', 'Breakout', '1%', 1, 0.7], ['Mon', 'Pullback', '1%', 1, 0.5], ['Tue', 'Range', '0.5%', 0, 0.8], ['Wed', 'Sweep', '1%', 1, 0.6], ['Thu', 'Pullback', '1%', 1, 0.45], ['Fri', 'Breakout', '1%', 1, 0.7]];
  rows.forEach((r, k) => {
    const ry = ty + h * 0.085 * (k + 1);
    s += `<line x1="${x + w * 0.02}" x2="${x + w * 0.98}" y1="${ry - h * 0.055}" y2="${ry - h * 0.055}" stroke="${line}" stroke-width="1"/>`;
    [r[0], r[1], r[2]].forEach((v, i) => { s += `<text x="${x + w * cx[i]}" y="${ry}" font-family="Inter" font-weight="700" font-size="${(h * 0.038).toFixed(1)}" fill="${fg}">${v}</text>`; });
    const ix = x + w * cx[3] + 10, iy = ry - h * 0.013;
    s += r[3] ? `<circle cx="${ix}" cy="${iy}" r="${h * 0.022}" fill="${G}"/><path d="M${ix - 5} ${iy} l 3 4 l 7 -8" stroke="#fff" stroke-width="2.4" fill="none"/>`
      : `<circle cx="${ix}" cy="${iy}" r="${h * 0.022}" fill="${GOLD}"/><rect x="${ix - 1.2}" y="${iy - 6}" width="2.4" height="7" fill="#0b111b"/><circle cx="${ix}" cy="${iy + 4.5}" r="1.4" fill="#0b111b"/>`;
    s += `<rect x="${x + w * cx[4]}" y="${ry - h * 0.03}" width="${w * 0.28 * r[4]}" height="${h * 0.02}" rx="${h * 0.01}" fill="${mute}" opacity="0.5"/>`;
  });
  // rules followed per day (a count, not money)
  const by = y + h * 0.86;
  s += `<text x="${x + w * 0.03}" y="${by - h * 0.01}" font-family="Inter" font-weight="800" font-size="${(h * 0.032).toFixed(1)}" fill="${mute}">RULES FOLLOWED</text>`;
  [5, 4, 5, 3, 5].forEach((v, i) => { const bh = h * 0.02 * v; s += `<rect x="${x + w * (0.4 + i * 0.07)}" y="${by + h * 0.1 - bh}" width="${w * 0.045}" height="${bh}" rx="3" fill="${GOLD}" opacity="0.85"/>`; });
  return s;
}

function sideChart(x, y, w, h, seed, light) {
  const bars = series([0.6, 0.5, 0.55, 0.35, 0.4, 0.25, 0.3], 30, seed, 0.03);
  const bg = light ? '#f7f8fa' : '#0b111b';
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}"/>`;
  for (let i = 1; i < 5; i++) s += `<line x1="${x}" x2="${x + w}" y1="${y + (h * i) / 5}" y2="${y + (h * i) / 5}" stroke="${light ? '#e3e7ee' : '#1a2230'}" stroke-width="1"/>`;
  return s + candles(x + w * 0.04, y + h * 0.08, w * 0.9, h * 0.84, bars);
}

// ---------------- room pieces ----------------
const SKY = {
  blue: ['#1b2a5a', '#3b5aa0', '#e59b7a'], morning: ['#9fd3ff', '#cfeaff', '#fff1d6'],
  night: ['#05070f', '#0d1430', '#1b2448'], cloudy: ['#9aa3ad', '#b9c0c8', '#d6dbe0'],
};
function windowView(x, y, w, h, light, seed) {
  const [a, b, c] = SKY[light];
  const r = rng(seed);
  let s = `<defs><linearGradient id="sky${seed}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="0.6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>
    <clipPath id="win${seed}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs>
    <g clip-path="url(#win${seed})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sky${seed})"/>`;
  if (light === 'night' || light === 'blue') for (let i = 0; i < 30; i++) s += `<circle cx="${x + r() * w}" cy="${y + r() * h * 0.4}" r="${(r() * 1.4 + 0.4).toFixed(1)}" fill="#fff" opacity="${(0.3 + r() * 0.6).toFixed(2)}"/>`;
  if (light === 'cloudy') for (let i = 0; i < 5; i++) { const cx = x + r() * w, cy = y + 40 + r() * h * 0.35; s += `<ellipse cx="${cx}" cy="${cy}" rx="${90 + r() * 80}" ry="${24 + r() * 16}" fill="#eef1f4" opacity="0.75"/>`; }
  if (light === 'morning') s += `<circle cx="${x + w * 0.8}" cy="${y + h * 0.25}" r="54" fill="#fff6d8" opacity="0.95"/>`;
  // skyline
  const day = light === 'morning' || light === 'cloudy';
  let bx = x - 10;
  while (bx < x + w) {
    const bw = 40 + r() * 70, bh = h * (0.25 + r() * 0.45), top = y + h - bh;
    const col = day ? (light === 'morning' ? '#8fa3b8' : '#7d8794') : (light === 'blue' ? '#131b3a' : '#0a0e1c');
    s += `<rect x="${bx.toFixed(1)}" y="${top.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${col}"/>`;
    if (!day) for (let wy = top + 10; wy < y + h - 10; wy += 16) for (let wx = bx + 6; wx < bx + bw - 8; wx += 12) if (r() < 0.38) s += `<rect x="${wx.toFixed(1)}" y="${wy.toFixed(1)}" width="5" height="8" fill="${GL}" opacity="${(0.5 + r() * 0.5).toFixed(2)}"/>`;
    bx += bw + 4;
  }
  s += `</g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#1b1410" stroke-width="16"/>
    <line x1="${x + w / 2}" x2="${x + w / 2}" y1="${y}" y2="${y + h}" stroke="#1b1410" stroke-width="10"/>`;
  return s;
}

function monitor(x, y, w, h, inner, stand = true, deskY = 1010) {
  let s = '';
  if (stand) s += `<rect x="${x + w / 2 - 14}" y="${y + h}" width="28" height="${deskY - y - h - 8}" fill="#2b2f38"/><rect x="${x + w / 2 - 70}" y="${deskY - 12}" width="140" height="14" rx="6" fill="#2b2f38"/>`;
  s += `<rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" rx="12" fill="#14171d"/>${inner}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#glare)" opacity="0.5"/>`;
  return s;
}

function desk(kind) {
  if (kind === 'walnut') return `<rect x="0" y="1000" width="${W}" height="300" fill="#3b2516"/><rect x="0" y="1000" width="${W}" height="40" fill="#5a3a22"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M0 ${1012 + i * 3} Q 500 ${1006 + i * 4} 1000 ${1014 + i * 2}" stroke="#4a2e1b" stroke-width="1.2" fill="none" opacity="0.7"/>`).join('')}
    <rect x="0" y="1040" width="${W}" height="10" fill="#2a1a10"/>`;
  if (kind === 'marble') return `<rect x="0" y="1000" width="${W}" height="300" fill="#2a2a2e"/><rect x="0" y="1000" width="${W}" height="42" fill="#efece6"/>
    <path d="M40 1008 q 120 18 260 4 t 300 14 t 360 -6" stroke="#c9c2b6" stroke-width="2" fill="none"/><path d="M120 1030 q 200 -12 380 6 t 420 -4" stroke="#d8d1c6" stroke-width="1.4" fill="none"/>
    <rect x="0" y="1042" width="${W}" height="8" fill="#b9b2a6"/>`;
  return `<rect x="0" y="1000" width="${W}" height="300" fill="#d9d6cf"/><rect x="0" y="1000" width="${W}" height="38" fill="#f7f6f2"/><rect x="0" y="1038" width="${W}" height="6" fill="#cfcbc2"/>
    <rect x="80" y="1044" width="18" height="256" fill="#bdb8ae"/><rect x="902" y="1044" width="18" height="256" fill="#bdb8ae"/>`;
}

const P = {
  keyboard: (x = 330, w = 340) => `<rect x="${x}" y="1010" width="${w}" height="26" rx="6" fill="#20242c"/>${Array.from({ length: 3 }, (_, r) => Array.from({ length: 16 }, (_, c) => `<rect x="${x + 10 + c * ((w - 20) / 16)}" y="${1014 + r * 7}" width="${(w - 20) / 16 - 3}" height="5" rx="1" fill="#3a404c"/>`).join('')).join('')}`,
  mouse: (x = 715) => `<ellipse cx="${x}" cy="1024" rx="18" ry="12" fill="#20242c"/><line x1="${x}" x2="${x}" y1="1013" y2="1022" stroke="#3a404c" stroke-width="2"/>`,
  lamp: (x, glow) => `${glow ? `<path d="M${x + 70} 760 L ${x - 20} 1010 L ${x + 230} 1010 Z" fill="#ffd27a" opacity="0.16"/>` : ''}
    <ellipse cx="${x}" cy="1006" rx="34" ry="8" fill="#1d1a16"/><line x1="${x}" y1="1004" x2="${x + 30}" y2="860" stroke="#2b2620" stroke-width="7"/><line x1="${x + 30}" y1="860" x2="${x + 80}" y2="770" stroke="#2b2620" stroke-width="7"/>
    <path d="M${x + 50} 760 L ${x + 110} 742 L ${x + 120} 790 L ${x + 70} 800 Z" fill="${GOLD}"/>${glow ? `<ellipse cx="${x + 95}" cy="795" rx="22" ry="8" fill="#fff3c4"/>` : ''}`,
  mug: (x, col = '#f2efe8') => `<rect x="${x - 22}" y="970" width="44" height="40" rx="6" fill="${col}"/><path d="M${x + 22} 978 q 18 2 16 14 q -2 12 -16 12" stroke="${col}" stroke-width="6" fill="none"/>
    <path d="M${x - 8} 960 q 6 -10 0 -20 M${x + 6} 960 q 6 -10 0 -20" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.5"/>`,
  espresso: (x) => `<ellipse cx="${x}" cy="1010" rx="30" ry="7" fill="#e9e4da"/><rect x="${x - 16}" y="986" width="32" height="22" rx="5" fill="#f4f1ea"/><ellipse cx="${x}" cy="987" rx="15" ry="3" fill="#5a3825"/>
    <path d="M${x + 16} 992 q 10 1 8 8 q -2 6 -8 6" stroke="#f4f1ea" stroke-width="4" fill="none"/>`,
  notebook: (x, col = '#2d3b5a') => `<rect x="${x}" y="1008" width="120" height="18" rx="3" fill="${col}" transform="skewX(-25)"/><rect x="${x + 4}" y="1006" width="112" height="4" fill="#efece6" transform="skewX(-25)"/>`,
  leatherBook: (x) => `<rect x="${x}" y="1006" width="130" height="20" rx="4" fill="#5b3a24" transform="skewX(-25)"/><rect x="${x + 6}" y="1004" width="118" height="4" fill="#e9e1d0" transform="skewX(-25)"/>
    <line x1="${x - 4}" y1="1012" x2="${x + 92}" y2="1000" stroke="#141414" stroke-width="6" stroke-linecap="round"/><line x1="${x + 70}" y1="1003" x2="${x + 92}" y2="1000" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/>`,
  gold: (x) => [0, 1, 2].map((k) => { const bx = x + (k === 2 ? 30 : k * 62), by = 1010 - (k === 2 ? 30 : 0) - 30;
    return `<path d="M${bx} ${by + 30} L ${bx + 8} ${by} L ${bx + 52} ${by} L ${bx + 60} ${by + 30} Z" fill="${GOLD}" stroke="#9c7a2e" stroke-width="2"/><path d="M${bx + 10} ${by + 4} L ${bx + 50} ${by + 4}" stroke="#fff3c4" stroke-width="2"/>`; }).join(''),
  cash: (x) => [0, 1].map((k) => `<rect x="${x + k * 14}" y="${990 - k * 18}" width="96" height="20" rx="3" fill="#7fa58a" stroke="#4b6b54" stroke-width="2"/><rect x="${x + 36 + k * 14}" y="${990 - k * 18}" width="20" height="20" fill="#e8e1cf"/>`).join(''),
  watch: (x) => `<rect x="${x - 50}" y="1012" width="100" height="10" rx="5" fill="#3b2a1e"/><circle cx="${x}" cy="1012" r="20" fill="#d9d6cf" stroke="#8d8576" stroke-width="4"/><circle cx="${x}" cy="1012" r="14" fill="#14171d"/>
    <line x1="${x}" y1="1012" x2="${x}" y2="1002" stroke="${GOLD}" stroke-width="2"/><line x1="${x}" y1="1012" x2="${x + 7}" y2="1015" stroke="${GOLD}" stroke-width="2"/>`,
  crystal: (x) => `<path d="M${x - 20} 966 L ${x + 20} 966 L ${x + 16} 1010 L ${x - 16} 1010 Z" fill="#cfe6ff" opacity="0.35" stroke="#e8f3ff" stroke-width="2"/><path d="M${x - 17} 990 L ${x + 17} 990 L ${x + 15} 1008 L ${x - 15} 1008 Z" fill="#c8862f" opacity="0.7"/>
    <rect x="${x - 8}" y="994" width="12" height="10" fill="#eaf6ff" opacity="0.7"/>`,
  plant: (x, h = 200) => `<rect x="${x - 30}" y="${1010 - 60}" width="60" height="60" rx="8" fill="#e9e4da"/>${Array.from({ length: 7 }, (_, i) => { const a = -1.2 + i * 0.4, l = h * (0.6 + 0.4 * Math.sin(i * 1.7) ** 2);
    return `<path d="M${x} 952 Q ${x + Math.sin(a) * l * 0.4} ${952 - l * 0.6} ${x + Math.sin(a) * l * 0.7} ${952 - l}" stroke="#4f8a5b" stroke-width="12" fill="none" stroke-linecap="round"/>`; }).join('')}`,
  chair: () => `<path d="M800 1300 L 800 860 Q 800 800 860 800 L 1000 800 L 1000 1300 Z" fill="#3a2418"/>
    ${[880, 940].map((cx) => [880, 960, 1040].map((cy) => `<circle cx="${cx}" cy="${cy}" r="5" fill="#24150d"/>`).join('')).join('')}
    <path d="M800 860 Q 800 800 860 800 L 1000 800" stroke="#5a3a22" stroke-width="8" fill="none"/>`,
};

// ---------------- scenes ----------------
const LIGHT = {
  night: { wall: '#141824', tint: '#0a0e1a', tintA: 0.35, warm: true },
  blue: { wall: '#1d2440', tint: '#1b2a5a', tintA: 0.18, warm: true },
  morning: { wall: '#efe7da', tint: '#fff2d6', tintA: 0.08, warm: false },
  cloudy: { wall: '#d7d9dc', tint: '#9aa3ad', tintA: 0.08, warm: false },
};

const SCENES = [
  { file: 'desk-4545019112-01', product: 'smc', style: 'lux', light: 'night', deskType: 'walnut', title: 'Order blocks and FVGs, *drawn clean*', props: ['lamp', 'cash', 'watch', 'crystal'] },
  { file: 'desk-4545019112-02', product: 'smc', style: 'minimal', light: 'morning', title: 'Smart money concepts, *mapped for you*' },
  { file: 'desk-4557390194-01', product: 'killzones', style: 'lux', light: 'blue', deskType: 'marble', title: 'ICT Killzones *on your chart*', props: ['espresso', 'leatherBook', 'watch'] },
  { file: 'desk-4557390194-02', product: 'killzones', style: 'minimal', light: 'cloudy', title: 'Know *which session* you trade' },
  { file: 'desk-4545027043-01', product: 'reversal', style: 'lux', light: 'night', deskType: 'walnut', title: 'Reversal zones, *marked for you*', props: ['lamp', 'gold', 'crystal', 'leatherBook'] },
  { file: 'desk-4545027043-02', product: 'reversal', style: 'minimal', light: 'morning', title: 'A calmer way to *watch reversals*' },
  { file: 'desk-4565674941-01', product: 'liquidity', style: 'lux', light: 'blue', deskType: 'marble', title: 'See where *the stops* sit', props: ['crystal', 'gold', 'leatherBook'] },
  { file: 'desk-4565674941-02', product: 'liquidity', style: 'lux', light: 'cloudy', deskType: 'walnut', title: 'Liquidity sweeps, *marked for you*', props: ['espresso', 'cash', 'watch'] },
  { file: 'desk-4604297195-01', product: 'journal', style: 'lux', light: 'morning', deskType: 'walnut', title: 'Your trading journal, *finally organized*', props: ['espresso', 'leatherBook', 'watch'] },
  { file: 'desk-4604297195-02', product: 'journal', style: 'minimal', light: 'cloudy', title: 'Review every trade, *every week*' },
];

function titleBand(t) {
  const words = t.split('*');
  const plain = t.replace(/\*/g, '');
  const size = plain.length > 30 ? 46 : 54;
  const tsp = words.map((p, i) => `<tspan fill="${i % 2 ? GOLD : '#fff'}">${esc(p)}</tspan>`).join('');
  return `<rect x="0" y="1300" width="${W}" height="200" fill="#0b0f19"/><rect x="0" y="1300" width="${W}" height="6" fill="${GOLD}"/>
    <text x="${W / 2}" y="1398" text-anchor="middle" font-family="Luckiest Guy" font-size="${size}" stroke="#141414" stroke-width="6" paint-order="stroke">${tsp}</text>
    <text x="${W / 2}" y="1462" text-anchor="middle" font-family="Inter" font-weight="900" font-size="24" letter-spacing="3" fill="${GOLD}" opacity="0.85">MetrivaStudio</text>`;
}

function scene(sc, idx) {
  const L = LIGHT[sc.light];
  const lux = sc.style === 'lux';
  let s = `<defs><linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.08"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#9fd3ff" stop-opacity="0.35"/><stop offset="1" stop-color="#9fd3ff" stop-opacity="0"/></radialGradient></defs>`;
  if (lux) {
    s += `<rect width="${W}" height="1300" fill="${L.wall}"/>` + windowView(30, 40, 940, 660, sc.light, 100 + idx);
    s += `<rect x="0" y="700" width="${W}" height="300" fill="${L.wall}"/><rect x="0" y="700" width="${W}" height="10" fill="#0e0b09" opacity="0.5"/>`;
  } else {
    const wall = sc.light === 'morning' ? '#f1ede6' : '#e3e5e8';
    s += `<rect width="${W}" height="1300" fill="${wall}"/>` + windowView(620, 90, 320, 420, sc.light, 200 + idx);
    s += `<rect x="610" y="510" width="340" height="16" fill="#d8d3ca"/>`;
    if (sc.light === 'morning') s += `<path d="M640 120 L 300 1000 L 520 1000 L 920 120 Z" fill="#fff7dc" opacity="0.22"/>`;
  }
  s += desk(lux ? sc.deskType : 'white');
  s += '<g transform="translate(500 1010) scale(1.3) translate(-500 -1010)">';
  const seed = 1000 + idx * 37;
  if (lux) {
    // three monitors, the main one in the middle
    s += `<ellipse cx="500" cy="720" rx="420" ry="190" fill="url(#glow)"/>`;
    s += monitor(110, 660, 220, 140, sideChart(110, 660, 220, 140, seed + 1, false), true);
    s += monitor(670, 660, 220, 140, sc.product === 'journal' ? sideChart(670, 660, 220, 140, seed + 2, false) : screen('journal', 670, 660, 220, 140, seed + 2, false), true);
    s += monitor(275, 575, 450, 280, screen(sc.product, 275, 575, 450, 280, seed, false), true);
  } else {
    s += monitor(230, 560, 440, 280, screen(sc.product, 230, 560, 440, 280, seed, sc.light === 'morning'), true);
  }
  s += P.keyboard() + P.mouse();
  if (lux) {
    const pr = sc.props;
    const big = (x, svg, k = 1.45) => `<g transform="translate(${x} 1010) scale(${k}) translate(${-x} -1010)">${svg}</g>`;
    if (pr.includes('lamp')) s += P.lamp(70, true);
    if (pr.includes('cash')) s += big(200, P.cash(150));
    if (pr.includes('gold')) s += big(790, P.gold(740));
    if (pr.includes('leatherBook')) s += big(230, P.leatherBook(200), 1.3);
    if (pr.includes('watch')) s += big(690, P.watch(690));
    if (pr.includes('crystal')) s += big(pr.includes('gold') ? 640 : 830, P.crystal(pr.includes('gold') ? 640 : 830));
    if (pr.includes('espresso')) s += big(820, P.espresso(820));
    s += '</g>';
    // a soft overall tint for the light of the hour
    s += `<rect width="${W}" height="1300" fill="${L.tint}" opacity="${L.tintA}"/>`;
    if (sc.light === 'night') s += `<ellipse cx="180" cy="850" rx="260" ry="200" fill="#ffd27a" opacity="0.08"/>`;
    if (pr.includes('chair')) s += P.chair();
  } else {
    s += P.plant(790, 200) + P.mug(220, '#ffffff') + P.notebook(250, '#b9c9d6') + '</g>';
    s += `<rect width="${W}" height="1300" fill="${L.tint}" opacity="${L.tintA}"/>`;
  }
  return s + titleBand(sc.title);
}

const ids = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const css = `@font-face{font-family:'Luckiest Guy';src:url(${font('LuckiestGuy.ttf')})} body{margin:0;background:#000}`;
for (const [i, sc] of SCENES.entries()) {
  if (ids.length && !ids.includes(sc.file)) continue;
  await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${scene(sc, i)}</svg></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  const file = path.join(OUT, `${sc.file}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: W, height: H } });
  console.log(file, Math.round(fs.statSync(file).size / 1024) + ' KB');
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'list.json'), JSON.stringify(SCENES.map(({ file, product, style, light, title }) => ({ file, product, style, light, title: title.replace(/\*/g, '') })), null, 1));
