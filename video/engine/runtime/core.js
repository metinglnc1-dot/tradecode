// Core helpers: math, easing, seeded randomness, text measuring, timeline anchors, keyed tracks.
export const W = 1080, H = 1920;
export const SAFE = { top: 170, bottom: 1330, left: 24, right: 1056 };
export const PAL = {
  gold: '#E4C471', goldL: '#F6E6B0', green: '#26a69a', red: '#ef5350',
  yellow: '#FFD84D', ink: '#0d1117', white: '#ffffff', outline: '#6b4f1d',
};
export const FONT = {
  ui: "Inter", title: "Luckiest Guy", hand: "Caveat", mono: "JetBrains Mono",
};

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const E = {
  linear: (t) => t,
  in: (t) => t * t * t,
  out: (t) => 1 - Math.pow(1 - t, 3),
  inOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  sine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  back: (t) => { const c1 = 2.1, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  elastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3) + 1),
};
export const f1 = (v) => Math.round(v * 10) / 10;
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function rng(seed) {
  let s = typeof seed === 'string' ? hash(seed) : seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const nCache = new Map();
function nval(seed, i) {
  const k = seed + ':' + i;
  let v = nCache.get(k);
  if (v === undefined) { v = (hash(k) % 100000) / 50000 - 1; nCache.set(k, v); }
  return v;
}
// smooth value noise in [-1, 1]
export function noise(x, seed = 'n') {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(nval(seed, i), nval(seed, i + 1), u);
}

// life of an element that pops in at `at` and out at `until`
export function life(t, at, until, inDur = 0.28, outDur = 0.18) {
  if (t < at || (until != null && t > until)) return null;
  const pi = clamp((t - at) / inDur);
  const po = until == null ? 0 : clamp((t - (until - outDur)) / outDur);
  return { pi, po, s: E.back(pi) * (1 - E.in(po)), o: clamp(pi * 3) * (1 - po), lt: t - at };
}

// ---------- text measuring ----------
const mctx = document.createElement('canvas').getContext('2d');
const mcache = new Map();
export function textW(text, size, family = FONT.ui, weight = 400) {
  const k = `${weight}|${size}|${family}|${text}`;
  let w = mcache.get(k);
  if (w === undefined) {
    mctx.font = `${weight} ${size}px '${family}'`;
    w = mctx.measureText(text).width;
    mcache.set(k, w);
  }
  return w;
}
export function fit(text, size, family, weight, maxW) {
  const w = textW(text, size, family, weight);
  return w > maxW ? (size * maxW) / w : size;
}
// "*word*" markup -> segments [{s, key}]
export function rich(str) {
  const segs = [];
  let key = false, buf = '';
  for (const ch of str) {
    if (ch === '*') { if (buf) segs.push({ s: buf, key }); buf = ''; key = !key; } else buf += ch;
  }
  if (buf) segs.push({ s: buf, key });
  return segs;
}
export const plain = (str) => str.replace(/\*/g, '');
export function tspans(str, color, keyColor) {
  return rich(str).map((g) => `<tspan fill="${g.key ? keyColor : color}">${esc(g.s)}</tspan>`).join('');
}

// ---------- timeline ----------
export const normW = (s) => s.toLowerCase().replace(/×/g, 'x').replace(/[^a-z0-9%]/g, '');

export class Timeline {
  constructor(timings, ep) {
    this.lines = timings.lines;
    this.fps = timings.fps;
    this.mouthArr = timings.mouth;
    this.voiceEnd = timings.voiceEnd;
    this.duration = Math.round((timings.voiceEnd + (ep.tail ?? 1.5)) * 1000) / 1000;
  }
  // Anchors: number (seconds) | "3" line start | "3>" line end | "3:word" | "3:word#2>" | "...+0.2" | "end-0.5"
  at(a) {
    if (a == null) return null;
    if (typeof a === 'number') return a;
    if (Array.isArray(a)) return this.at(a[0]) + (a[1] || 0);
    const m = String(a).trim().match(/^(end|\d+)(?::(.+?)(?:#(\d+))?)?(>)?([+-]\d*\.?\d+)?$/);
    if (!m) throw new Error('Bad anchor: ' + a);
    const [, base, word, occ, isEnd, off] = m;
    const o = off ? parseFloat(off) : 0;
    if (base === 'end') return this.duration + o;
    const L = this.lines[+base - 1];
    if (!L) throw new Error('Anchor line missing: ' + a);
    if (!word) return (isEnd ? L.end : L.start) + o;
    const n = normW(word);
    for (const exact of [true, false]) {
      let k = +(occ || 1);
      for (const w of L.words) {
        const wn = normW(w.text);
        if (exact ? wn === n : wn.startsWith(n)) { if (--k === 0) return (isEnd ? w.end : w.start) + o; }
      }
    }
    throw new Error('Anchor word not found: ' + a + ' in "' + L.words.map((w) => w.text).join(' ') + '"');
  }
  mouth(t) {
    const f = t * this.fps, i = Math.floor(f);
    return lerp(this.mouthArr[i] ?? 0, this.mouthArr[i + 1] ?? 0, f - i);
  }
  energy(t) { // smoothed speaking energy for gestures
    let s = 0;
    for (let k = -6; k <= 6; k++) s += this.mouth(t + k / 30);
    return s / 13;
  }
  lineAt(t) { return this.lines.findIndex((l) => t >= l.start && t <= l.end); }
}

// ---------- keyed tracks ("arrive at this value by `at`, moving for `move` seconds") ----------
export function prepKeys(keys, tl, defMove = 0.8) {
  return (keys || []).map((k) => ({ ...k, _t: tl.at(k.at), _m: k.move ?? defMove })).sort((a, b) => a._t - b._t);
}
export function evalKeys(keys, t, fields, hold = (v) => v) {
  const pick = (k, base) => {
    const o = { ...(base || {}) };
    for (const f of fields) if (k[f] != null) o[f] = k[f];
    return o;
  };
  const ev = (n, tt) => {
    let i = -1;
    for (let j = 0; j <= n; j++) if (keys[j]._t - keys[j]._m <= tt) i = j;
    if (i <= 0) {
      const k = keys[0];
      return { ...hold(pick(k), Math.max(0, tt - k._t), k), _i: 0, _moving: false };
    }
    const k = keys[i];
    const s = k._t - k._m;
    const from = ev(i - 1, s);
    const target = pick(k, from);
    if (tt >= k._t) return { ...hold(target, tt - k._t, k), _i: i, _moving: false };
    const p = (E[k.ease || 'inOut'])((tt - s) / k._m);
    const out = { ...from };
    for (const f of fields) if (typeof target[f] === 'number') out[f] = lerp(from[f], target[f], p);
    return { ...out, _i: i, _moving: true, _p: p, _raw: (tt - s) / k._m, _from: from, _to: target };
  };
  return ev(keys.length - 1, t);
}
// step track: latest key at or before t
export function stepKeys(keys, t) {
  let cur = null;
  for (const k of keys) if (k._t <= t) cur = k;
  return cur;
}
