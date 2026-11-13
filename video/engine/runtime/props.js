// Props: titles, notifications, whiteboard writing, sticky notes, cards, coins, confetti, rules board.
import { PAL, FONT, W, clamp, lerp, E, rng, noise, life, textW, fit, rich, plain, tspans, esc, f1 } from './core.js';

const ICONS = {
  bookmark: (c) => `<path d="M-26 -36 h52 v74 l-26 -20 l-26 20 Z" fill="${c}" stroke="#141414" stroke-width="7" stroke-linejoin="round"/>`,
  check: (c) => `<circle r="34" fill="${c}"/><path d="M-15 1 L-4 13 L17 -12" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  fee: (c) => `<circle r="34" fill="${c}"/><circle cx="-10" cy="-10" r="6" fill="none" stroke="#fff" stroke-width="5"/><circle cx="10" cy="10" r="6" fill="none" stroke="#fff" stroke-width="5"/><path d="M13 -15 L-13 15" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
  bell: (c) => `<circle r="34" fill="${c}"/><path d="M-14 8 Q -14 -16 0 -16 Q 14 -16 14 8 L 18 12 L -18 12 Z" fill="#fff"/><circle cy="17" r="5" fill="#fff"/>`,
  alert: (c) => `<circle r="34" fill="${c}"/><rect x="-4" y="-18" width="8" height="22" rx="4" fill="#fff"/><circle cy="13" r="5" fill="#fff"/>`,
  heart: (c) => `<path d="M0 30 C -40 4 -34 -30 -12 -30 C -2 -30 0 -20 0 -18 C 0 -20 2 -30 12 -30 C 34 -30 40 4 0 30 Z" fill="${c}" stroke="#141414" stroke-width="7"/>`,
  send: (c) => `<path d="M-30 -4 L 32 -30 L 8 32 L 0 6 Z" fill="${c}" stroke="#141414" stroke-width="7" stroke-linejoin="round"/>`,
  comment: (c) => `<path d="M-32 -26 h64 a10 10 0 0 1 10 10 v34 a10 10 0 0 1 -10 10 h-30 l-18 16 v-16 h-16 a10 10 0 0 1 -10 -10 v-34 a10 10 0 0 1 10 -10 Z" fill="${c}" stroke="#141414" stroke-width="7" stroke-linejoin="round"/>`,
  plus: (c) => `<circle r="34" fill="${c}" stroke="#141414" stroke-width="7"/><path d="M0 -16 V16 M-16 0 H16" stroke="#141414" stroke-width="8" stroke-linecap="round"/>`,
  link: (c) => `<g fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round"><path d="M-6 6 L6 -6"/><path d="M-2 -14 l8 -8 a14 14 0 0 1 20 20 l-8 8"/><path d="M2 14 l-8 8 a14 14 0 0 1 -20 -20 l8 -8"/></g>`,
};
export const icon = (name, color) => (ICONS[name] ? ICONS[name](color) : '');

function coin(x, y, r, spin, op = 1) {
  const sx = Math.max(0.12, Math.abs(Math.cos(spin)));
  return `<g transform="translate(${f1(x)} ${f1(y)}) scale(${f1(sx * 100) / 100} 1)" opacity="${op}">
    <circle r="${r}" fill="#c9a24a"/><circle r="${r * 0.86}" fill="${PAL.gold}"/><circle r="${r * 0.6}" fill="none" stroke="#b8923e" stroke-width="${r * 0.12}"/>
    <rect x="${-r * 0.1}" y="${-r * 0.42}" width="${r * 0.2}" height="${r * 0.84}" rx="${r * 0.1}" fill="#b8923e"/>
    <ellipse cx="${-r * 0.35}" cy="${-r * 0.4}" rx="${r * 0.2}" ry="${r * 0.12}" fill="#fff" opacity="0.6"/></g>`;
}

function textWithOpacity(o) { return Math.round(o * 100) / 100; }

// ---------- prop definitions ----------
export const PROPS = {
  // Big pop-in title, screen space. text supports *gold* markup and \n.
  title: {
    space: 'screen',
    sfx: (p) => (p.sfx === false ? [] : [{ t: p._at, name: p.sfx || 'pop', gain: 0.9 }]),
    draw(p, t) {
      const a = life(t, p._at, p._until, 0.3, 0.2);
      if (!a) return '';
      const lines = p.text.split('\n');
      const iconW = p.icon ? 110 : 0;
      let size = p.size || 118;
      for (const l of lines) size = Math.min(size, fit(plain(l), p.size || 118, FONT.title, 400, (p.maxW || 920) - iconW));
      const lh = size * 1.04, cy = p.y ?? 300;
      const y0 = cy - ((lines.length - 1) * lh) / 2;
      const rot = (p.rot ?? -2) + Math.sin(a.lt * 2.6) * 1.4;
      const wob = 1 + 0.025 * Math.sin(a.lt * 4.2);
      const col = p.color || '#fff', key = p.keyColor || PAL.yellow;
      const tw = Math.max(...lines.map((l) => textW(plain(l), size, FONT.title)));
      const cx = W / 2 + iconW / 2;
      let s = `<g${a.pi < 1 || a.po > 0 ? ' data-anim="1"' : ''} transform="translate(${W / 2} ${cy}) rotate(${f1(rot)}) scale(${f1(a.s * wob * 1000) / 1000}) translate(${-W / 2} ${-cy})" opacity="${textWithOpacity(a.o)}">`;
      if (p.band) s += `<rect x="${f1(cx - tw / 2 - 40)}" y="${f1(y0 - size * 0.62)}" width="${f1(tw + 80)}" height="${f1(lh * (lines.length - 1) + size * 1.12)}" rx="22" fill="${p.band}" stroke="#141414" stroke-width="8"/>`;
      lines.forEach((l, i) => {
        s += `<text data-qa="title" data-g="${p.id}" x="${f1(cx)}" y="${f1(y0 + i * lh + size * 0.36)}" text-anchor="middle" font-family="${FONT.title}" font-size="${f1(size)}" stroke="#141414" stroke-width="${f1(size * 0.14)}" paint-order="stroke" stroke-linejoin="round" filter="url(#shadow)">${tspans(l, col, key)}</text>`;
      });
      if (p.icon) {
        const ib = 1 + 0.12 * Math.sin(a.lt * 7);
        s += `<g transform="translate(${f1(cx - tw / 2 - 70)} ${f1(cy)}) scale(${f1(1.3 * ib * 100) / 100}) rotate(${f1(8 * Math.sin(a.lt * 5))})">${icon(p.icon, p.iconColor || PAL.gold)}</g>`;
      }
      return s + '</g>';
    },
  },

  // Phone-style notification card sliding in from the right. Screen space.
  notify: {
    space: 'screen',
    sfx: (p) => (p.sfx === false ? [] : [{ t: p._at + 0.08, name: p.sfx || 'ding', gain: 0.7 }]),
    draw(p, t) {
      const a = life(t, p._at, p._until, 0.38, 0.3);
      if (!a) return '';
      const dx = (1 - E.back(a.pi)) * 720 + E.in(a.po) * 900;
      const y = p.y ?? 520, x = 90, w = 900, h = 132;
      const col = { green: PAL.green, red: PAL.red, gold: '#b8923e' }[p.tone || 'green'] || p.tone;
      const ts = fit(p.title, 36, FONT.ui, 800, 620), bs = fit(p.body || '', 29, FONT.ui, 600, 640);
      return `<g${a.pi < 1 || a.po > 0 ? ' data-anim="1"' : ''} transform="translate(${f1(dx)} 0)" opacity="${textWithOpacity(Math.min(1, a.o * 1.5))}">
        <rect x="${x}" y="${y - h / 2}" width="${w}" height="${h}" rx="32" fill="#151b28" fill-opacity="0.97" stroke="#2c3546" stroke-width="3" filter="url(#shadow)"/>
        <g transform="translate(${x + 78} ${y})">${icon(p.icon || 'check', col)}</g>
        <text data-qa="notify" data-g="${p.id}" x="${x + 140}" y="${y - 10}" font-family="${FONT.ui}" font-weight="800" font-size="${f1(ts)}" fill="#fff">${esc(p.title)}</text>
        <text data-qa="notify" data-g="${p.id}" x="${x + 140}" y="${y + 34}" font-family="${FONT.ui}" font-weight="600" font-size="${f1(bs)}" fill="#98a3b8">${esc(p.body || '')}</text>
        <text data-qa="notify" data-g="${p.id}" x="${x + w - 30}" y="${y - 10}" text-anchor="end" font-family="${FONT.ui}" font-weight="600" font-size="24" fill="#6b768c">now</text>
      </g>`;
    },
  },

  // Handwriting revealed left to right, with a marker following the edge. World space.
  write: {
    space: 'world', layer: 'back',
    layout(p, sc) {
      p._size = p.size || 76;
      p._fam = p.font || FONT.hand;
      p._wt = p.weight || 700;
      if (p.maxW) p._size = fit(plain(p.text), p._size, p._fam, p._wt, p.maxW);
      p._w = textW(plain(p.text), p._size, p._fam, p._wt);
      if (p.follow) { const f = sc.prop(p.follow); p._x = f._x + f._w + (p.gap ?? p._size * 0.28); p._y = p.y ?? f._y; } else { p._x = p.x; p._y = p.y; }
      if (p.align === 'center') p._x -= p._w / 2;
      p._dur = p.dur ?? Math.max(0.35, plain(p.text).length * 0.045);
    },
    sfx: (p) => (p.sfx === false ? [] : [{ t: p._at, name: 'scribble', dur: p._dur, gain: 0.9 }]),
    draw(p, t, sc) {
      if (t < p._at || (p._until != null && t > p._until)) return '';
      const r = clamp((t - p._at) / p._dur);
      const o = p._until != null ? 1 - clamp((t - (p._until - 0.2)) / 0.2) : 1;
      const S = p._size, x = p._x, y = p._y;
      const rx = x + p._w * r;
      const col = p.color || '#1f2a44', key = p.keyColor || '#d84341';
      let s = `<clipPath id="clip-${p.id}"><rect x="${f1(x - 10)}" y="${f1(y - S * 1.1)}" width="${f1(p._w * r + 12)}" height="${f1(S * 1.6)}"/></clipPath>
        <g opacity="${o}"><text data-qa="world" data-g="${p.id}" clip-path="url(#clip-${p.id})" x="${f1(x)}" y="${f1(y)}" font-family="${p._fam}" font-weight="${p._wt}" font-size="${f1(S)}">${tspans(p.text, col, key)}</text></g>`;
      if (r > 0 && r < 1 && p.pen !== false) {
        const py = y - S * 0.32 + Math.sin(t * 40) * S * 0.12;
        s += `<g transform="translate(${f1(rx)} ${f1(py)}) rotate(-28)"><rect x="-10" y="-96" width="22" height="92" rx="7" fill="#2b3245"/><rect x="-10" y="-96" width="22" height="26" rx="7" fill="${col}"/><path d="M-8 -6 L 10 -6 L 2 8 Z" fill="${col}"/></g>`;
      }
      return s;
    },
  },

  // Hand-drawn circle / underline / arrow / cross around a write prop or explicit box. World space.
  draw: {
    space: 'world', layer: 'back',
    layout(p, sc) {
      if (p.around) {
        const w = sc.prop(p.around);
        const full = plain(w.text), sub = p.sub || full;
        const i = Math.max(0, full.indexOf(sub));
        const x0 = w._x + textW(full.slice(0, i), w._size, w._fam, w._wt), sw = textW(sub, w._size, w._fam, w._wt);
        p._box = { x: x0, y: w._y - w._size * 0.72, w: sw, h: w._size * 0.86 };
      } else p._box = { x: p.x, y: p.y, w: p.w, h: p.h };
      p._dur = p.dur ?? 0.45;
    },
    sfx: (p) => (p.sfx === false ? [] : [{ t: p._at, name: 'scribble', dur: p._dur, gain: 0.8 }]),
    draw(p, t) {
      if (t < p._at || (p._until != null && t > p._until)) return '';
      const r = E.out(clamp((t - p._at) / p._dur));
      const b = p._box, col = p.color || '#d84341', sw = p.width || 8;
      let d;
      if (p.shape === 'underline') d = `M${b.x - 6} ${b.y + b.h + 14} Q ${b.x + b.w / 2} ${b.y + b.h + 24} ${b.x + b.w + 10} ${b.y + b.h + 8}`;
      else if (p.shape === 'cross') d = `M${b.x - 10} ${b.y + b.h / 2 + 6} L ${b.x + b.w + 10} ${b.y + b.h / 2 - 6}`;
      else if (p.shape === 'arrow') d = `M${p.x1} ${p.y1} Q ${(p.x1 + p.x2) / 2} ${Math.min(p.y1, p.y2) - 60} ${p.x2} ${p.y2} M ${p.x2 - 26} ${p.y2 - 18} L ${p.x2} ${p.y2} L ${p.x2 - 4} ${p.y2 - 30}`;
      else {
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2, rx = b.w / 2 + 26, ry = b.h / 2 + 22;
        d = `M${cx - rx * 0.9} ${cy - ry * 0.5} C ${cx - rx * 0.6} ${cy - ry * 1.25} ${cx + rx * 1.15} ${cy - ry * 1.15} ${cx + rx} ${cy + ry * 0.1} C ${cx + rx * 0.9} ${cy + ry * 1.2} ${cx - rx * 1.1} ${cy + ry * 1.2} ${cx - rx} ${cy} C ${cx - rx * 1.02} ${cy - ry * 0.6} ${cx - rx * 0.5} ${cy - ry * 1.05} ${cx - rx * 0.1} ${cy - ry * 1.08}`;
      }
      return `<path d="${d}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${f1((1 - r) * 1000) / 1000}" stroke="${col}" stroke-width="${sw}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    },
  },

  // Sticky note slapped on. World or screen space.
  sticky: {
    space: 'world', layer: 'back',
    sfx: (p) => (p.sfx === false ? [] : [{ t: p._at + 0.1, name: p.sfx || 'thud', gain: 0.9 }]),
    draw(p, t) {
      const a = life(t, p._at, p._until, 0.22, 0.2);
      if (!a) return '';
      const w = p.w || 300, h = p.h || 260;
      const sc = lerp(1.5, 1, E.out(a.pi)) * (1 - E.in(a.po));
      const rot = (p.rot ?? -4) + (1 - E.out(a.pi)) * 10 + Math.sin(a.lt * 2) * 0.8;
      const lines = p.text.split('\n');
      let size = p.size || 44;
      for (const l of lines) size = Math.min(size, fit(plain(l), p.size || 44, FONT.hand, 700, w - 36));
      const lh = size * 1.08, y0 = -((lines.length - 1) * lh) / 2 + size * 0.32;
      const c = p.color || '#ffe680';
      return `<g${a.pi < 1 || a.po > 0 ? ' data-anim="1"' : ''} transform="translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(rot)}) scale(${f1(sc * 1000) / 1000})" opacity="${textWithOpacity(Math.min(1, a.o * 2))}">
        <rect x="${-w / 2 + 6}" y="${-h / 2 + 10}" width="${w}" height="${h}" fill="#000" opacity="0.28"/>
        <path d="M${-w / 2} ${-h / 2} H ${w / 2} V ${h / 2 - 34} L ${w / 2 - 34} ${h / 2} H ${-w / 2} Z" fill="${c}"/>
        <path d="M${w / 2} ${h / 2 - 34} L ${w / 2 - 34} ${h / 2} L ${w / 2 - 30} ${h / 2 - 30} Z" fill="#000" opacity="0.15"/>
        <rect x="-50" y="${-h / 2 - 16}" width="100" height="30" fill="#fff" opacity="0.45" transform="rotate(3)"/>
        ${lines.map((l, i) => `<text data-qa="${p.space === 'screen' ? 'screen' : 'world'}" data-g="${p.id}" x="0" y="${f1(y0 + i * lh)}" text-anchor="middle" font-family="${FONT.hand}" font-weight="700" font-size="${f1(size)}">${tspans(l, p.ink || '#2a2a2a', p.keyColor || '#c62828')}</text>`).join('')}
      </g>`;
    },
  },

  // Live number box: value tweens between keys [{at, v}], flashes red when it drops, green when it rises.
  counter: {
    space: 'world', layer: 'front',
    layout(p, sc) { p._keys = p.keys.map((k) => ({ ...k, _t: sc.tl.at(k.at) })).sort((a, b) => a._t - b._t); },
    sfx: (p) => (p.sfx === false ? [] : [{ t: p._at, name: 'pop', gain: 0.6 }]),
    draw(p, t) {
      const a = life(t, p._at, p._until, 0.3, 0.2);
      if (!a) return '';
      const K = p._keys;
      let v = K[0].v, dir = 0, since = 99;
      for (let i = 0; i < K.length; i++) {
        if (t >= K[i]._t) {
          v = K[i].v;
          const nx = K[i + 1];
          if (nx && t < nx._t) {
            const q = (t - K[i]._t) / (nx._t - K[i]._t);
            v = lerp(K[i].v, nx.v, E[nx.ease || 'out'](q));
            dir = Math.sign(nx.v - K[i].v); since = 0;
          } else if (i > 0) { dir = Math.sign(K[i].v - K[i - 1].v); since = t - K[i]._t; }
        }
      }
      const dec = p.decimals ?? 0;
      const txt = (p.prefix ?? '$') + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (p.suffix || '');
      const w = p.w || 400, h = p.sub ? 190 : 160;
      const flash = clamp(1 - since / 0.8);
      const col = dir < 0 && flash > 0 ? PAL.red : dir > 0 && flash > 0 ? PAL.green : (p.color || '#fff');
      const vs = fit(txt, p.size || 84, FONT.ui, 900, w - 40);
      const shake = dir < 0 && since === 0 ? Math.sin(t * 50) * 3 : 0;
      return `<g${a.pi < 1 || a.po > 0 ? ' data-anim="1"' : ''} transform="translate(${f1(p.x + shake)} ${f1(p.y)}) scale(${f1(a.s * 1000) / 1000})" opacity="${textWithOpacity(a.o)}">
        <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="26" fill="#0f1420" fill-opacity="0.94" stroke="${p.accent || '#334058'}" stroke-width="4" filter="url(#shadow)"/>
        <text data-qa="world" data-g="${p.id}" x="0" y="${-h / 2 + 44}" text-anchor="middle" font-family="${FONT.ui}" font-weight="800" font-size="28" letter-spacing="3" fill="${p.accent || '#9aa4b5'}">${esc(p.label || '')}</text>
        <text data-qa="world" data-g="${p.id}" x="0" y="${-h / 2 + 44 + vs * 0.95}" text-anchor="middle" font-family="${FONT.ui}" font-weight="900" font-size="${f1(vs)}" fill="${col}">${esc(txt)}</text>
        ${p.sub ? `<text data-qa="world" data-g="${p.id}" x="0" y="${h / 2 - 20}" text-anchor="middle" font-family="${FONT.ui}" font-weight="700" font-size="19" letter-spacing="2" fill="#6b768c">${esc(p.sub)}</text>` : ''}
      </g>`;
    },
  },

  // Countdown ring: from `from` down to 1, one step per second, screen space by default. Ticks each second.
  countdown: {
    space: 'screen',
    sfx: (p) => (p.sfx === false ? [] : Array.from({ length: p.from || 5 }, (_, i) => ({ t: p._at + i, name: 'tick', gain: 1.2 }))),
    draw(p, t) {
      const n = p.from || 5, end = p._at + n;
      if (t < p._at || t > end + 0.25) return '';
      const k = Math.min(n - 1, Math.floor(t - p._at)), frac = (t - p._at) % 1;
      const num = n - k, r = p.r || 74;
      const pop = 1 + 0.25 * Math.max(0, 1 - frac / 0.18);
      const o = t > end ? 1 - (t - end) / 0.25 : 1;
      const C = 2 * Math.PI * r;
      return `<g transform="translate(${p.x} ${p.y}) scale(${f1(pop * 100) / 100})" opacity="${f1(o * 100) / 100}">
        <circle r="${r + 12}" fill="#0f1420" stroke="#141414" stroke-width="8" filter="url(#shadow)"/>
        <circle r="${r}" fill="none" stroke="#2a3346" stroke-width="12"/>
        <circle r="${r}" fill="none" stroke="${num <= 2 ? PAL.red : PAL.gold}" stroke-width="12" stroke-dasharray="${f1(C)}" stroke-dashoffset="${f1(C * frac)}" transform="rotate(-90)" stroke-linecap="round"/>
        <text data-qa="screen" data-g="${p.id}" x="0" y="${f1(r * 0.42)}" text-anchor="middle" font-family="${FONT.title}" font-size="${f1(r * 1.25)}" fill="#fff">${num}</text></g>`;
    },
  },

  // Series badge in the top corner, e.g. "AI FOR TRADERS  PART 2/5". Screen space, always on.
  badge: {
    space: 'screen',
    draw(p, t) {
      const a = life(t, p._at, p._until, 0.3, 0.2);
      if (!a) return '';
      const size = p.size || 24, w = textW(p.text, size, FONT.ui, 800) + size * 0.1 * p.text.length + 40;
      const x = p.x ?? 40 + w / 2, y = p.y ?? 190;
      return `<g transform="translate(${f1(x)} ${y}) scale(${f1(a.s * 100) / 100})" opacity="${textWithOpacity(a.o)}">
        <rect x="${f1(-w / 2)}" y="${-size}" width="${f1(w)}" height="${size * 2}" rx="${size}" fill="${p.color || PAL.gold}" stroke="#141414" stroke-width="4"/>
        <text data-qa="screen" data-g="${p.id}" x="0" y="${f1(size * 0.36)}" text-anchor="middle" font-family="${FONT.ui}" font-weight="800" font-size="${size}" letter-spacing="${f1(size * 0.1)}" fill="#141414">${esc(p.text)}</text></g>`;
    },
  },

  // Small pill label such as ILLUSTRATIVE.
  tag: {
    space: 'world', layer: 'front',
    draw(p, t) {
      const a = life(t, p._at, p._until, 0.25, 0.2);
      if (!a) return '';
      const size = p.size || 22, w = textW(p.text, size, FONT.ui, 700) + size * 0.12 * p.text.length + 36;
      return `<g${a.pi < 1 || a.po > 0 ? ' data-anim="1"' : ''} transform="translate(${f1(p.x)} ${f1(p.y)}) scale(${f1(a.s * 100) / 100})" opacity="${textWithOpacity(a.o)}">
        <rect x="${f1(-w / 2)}" y="${-size * 0.95}" width="${f1(w)}" height="${size * 1.9}" rx="${size * 0.95}" fill="#0d1117" fill-opacity="0.85" stroke="#ffffff" stroke-opacity="0.35" stroke-width="2"/>
        <text data-qa="${p.space === 'screen' ? 'screen' : 'world'}" data-g="${p.id}" x="0" y="${f1(size * 0.36)}" text-anchor="middle" font-family="${FONT.ui}" font-weight="700" font-size="${size}" letter-spacing="${f1(size * 0.12)}" fill="#c9d1d9">${esc(p.text)}</text></g>`;
    },
  },

  // Position card with rows whose values can change over time.
  card: {
    space: 'world', layer: 'front',
    layout(p, sc) {
      p._rows = (p.rows || []).map((r) => ({
        ...r,
        _vals: (r.values || [{ at: r.at ?? p.at, v: r.value }]).map((v) => ({ ...v, _t: sc.tl.at(v.at ?? r.at ?? p.at) })),
      }));
    },
    sfx: (p) => {
      if (p.sfx === false) return [];
      const ev = [{ t: p._at, name: 'pop', gain: 0.8 }];
      for (const r of p._rows) for (const v of r._vals) if (v._t > p._at + 0.05) ev.push({ t: v._t, name: v.sfx || 'tick', gain: 0.9 });
      return ev;
    },
    draw(p, t) {
      const a = life(t, p._at, p._until, 0.3, 0.2);
      if (!a) return '';
      const w = p.w || 520, rh = 64, h = 110 + p._rows.length * rh + (p.tag ? 40 : 0);
      let s = `<g${a.pi < 1 || a.po > 0 ? ' data-anim="1"' : ''} transform="translate(${f1(p.x + w / 2)} ${f1(p.y + h / 2)}) scale(${f1(a.s * 1000) / 1000}) translate(${-w / 2} ${-h / 2})" opacity="${textWithOpacity(a.o)}">
        <rect x="0" y="0" width="${w}" height="${h}" rx="26" fill="#141a26" stroke="#334058" stroke-width="3" filter="url(#shadow)"/>
        <text data-qa="world" data-g="${p.id}" x="28" y="60" font-family="${FONT.ui}" font-weight="800" font-size="34" fill="#fff">${esc(p.title || '')}</text>`;
      if (p.badge) {
        const bw = textW(p.badge, 24, FONT.ui, 800) + 30;
        s += `<rect x="${f1(w - 28 - bw)}" y="30" width="${f1(bw)}" height="40" rx="10" fill="${p.badgeColor || PAL.green}" fill-opacity="0.18" stroke="${p.badgeColor || PAL.green}" stroke-width="2"/>
          <text data-qa="world" data-g="${p.id}" x="${f1(w - 28 - bw / 2)}" y="58" text-anchor="middle" font-family="${FONT.ui}" font-weight="800" font-size="24" fill="${p.badgeColor || PAL.green}">${esc(p.badge)}</text>`;
      }
      p._rows.forEach((r, i) => {
        let cur = null;
        for (const v of r._vals) if (v._t <= t) cur = v;
        if (!cur) return;
        const y = 104 + i * rh;
        const flash = clamp(1 - (t - cur._t) / 0.6);
        const pop = cur._t > p._at + 0.05 ? 1 + 0.25 * E.out(flash) * flash : 1;
        const col = r.color || '#fff';
        s += `<line x1="24" x2="${w - 24}" y1="${y - 6}" y2="${y - 6}" stroke="#222b3b" stroke-width="2"/>`;
        if (flash > 0 && cur._t > p._at + 0.05) s += `<rect x="12" y="${y}" width="${w - 24}" height="${rh - 8}" rx="12" fill="${col}" opacity="${f1(flash * 0.25 * 100) / 100}"/>`;
        s += `<text data-qa="world" data-g="${p.id}" x="28" y="${y + 40}" font-family="${FONT.ui}" font-weight="600" font-size="28" fill="#8d97a8">${esc(r.label)}</text>
          <text data-qa="world" data-g="${p.id}" transform="translate(${w - 28} ${y + 40}) scale(${f1(pop * 100) / 100})" text-anchor="end" font-family="${FONT.ui}" font-weight="800" font-size="32" fill="${col}">${esc(cur.v)}</text>`;
      });
      if (p.tag) s += `<text data-qa="world" data-g="${p.id}" x="${w / 2}" y="${h - 22}" text-anchor="middle" font-family="${FONT.ui}" font-weight="700" font-size="19" letter-spacing="2.4" fill="#6b768c">${esc(p.tag)}</text>`;
      return s + '</g>';
    },
  },

  // Coins flying along an arc. from/to: [x,y] or "actor.anchor" (resolved live).
  coins: {
    space: 'world', layer: 'front',
    sfx: (p) => {
      if (p.sfx === false) return [];
      const n = p.n || 1, st = p.stagger ?? 0.08, ev = [];
      const every = Math.max(1, Math.ceil(n / 7));
      for (let i = 0; i < n; i += every) ev.push({ t: p._at + i * st + (p.dur || 0.7), name: 'coin', gain: i ? 0.55 : 0.9 });
      return ev;
    },
    draw(p, t, sc) {
      const n = p.n || 1, st = p.stagger ?? 0.08, dur = p.dur || 0.7;
      if (t < p._at || t > p._at + n * st + dur) return '';
      const r = rng(p.id);
      let s = '';
      for (let i = 0; i < n; i++) {
        const jx = (r() - 0.5) * (p.spread ?? 40), jy = (r() - 0.5) * (p.spread ?? 40), sp = 8 + r() * 8;
        const t0 = p._at + i * st, q = (t - t0) / dur;
        if (q < 0 || q > 1) continue;
        const A = sc.point(p.from, t0), B = sc.point(p.to, t);
        const e = E.inOut(q);
        const mx = (A[0] + B[0]) / 2, my = Math.min(A[1], B[1]) - (p.arc ?? 220);
        const x = (1 - e) * (1 - e) * (A[0] + jx) + 2 * (1 - e) * e * mx + e * e * B[0];
        const y = (1 - e) * (1 - e) * (A[1] + jy) + 2 * (1 - e) * e * my + e * e * B[1];
        s += coin(x, y, (p.r || 26) * (1 - 0.35 * e), (t - t0) * sp);
      }
      return s;
    },
  },

  // Coins raining down inside a box.
  coinRain: {
    space: 'world', layer: 'front',
    sfx: (p) => (p.sfx === false ? [] : Array.from({ length: 6 }, (_, i) => ({ t: p._at + 0.35 + i * (p.dur || 1.5) / 6, name: 'coin', gain: 0.5 }))),
    draw(p, t) {
      const dur = p.dur || 1.5;
      if (t < p._at || t > p._at + dur + 1.2) return '';
      const r = rng(p.id);
      let s = '';
      for (let i = 0; i < (p.n || 24); i++) {
        const x = p.x0 + r() * (p.x1 - p.x0), t0 = p._at + r() * dur, sp = 6 + r() * 8;
        const q = t - t0;
        if (q < 0) continue;
        const y = p.y0 + 0.5 * 2600 * q * q;
        if (y > p.y1) continue;
        s += coin(x, y, p.r || 24, q * sp);
      }
      return s;
    },
  },

  // Confetti burst (screen space by default).
  confetti: {
    space: 'screen',
    sfx: (p) => (p.sfx === false ? [] : [{ t: p._at, name: 'pop', gain: 0.7 }]),
    draw(p, t) {
      const q0 = t - p._at, dur = p.dur || 2.6;
      if (q0 < 0 || q0 > dur) return '';
      const r = rng(p.id), cols = [PAL.gold, PAL.goldL, PAL.green, PAL.red, '#fff', '#7aa2ff'];
      let s = '';
      for (let i = 0; i < (p.n || 110); i++) {
        const delay = (p.mode === 'rain' ? r() * 1.2 : r() * 0.08);
        const q = q0 - delay;
        if (q < 0) continue;
        let x, y;
        if (p.mode === 'rain') { x = r() * W + Math.sin(q * 3 + i) * 30; y = -40 + q * (500 + r() * 300); }
        else {
          const ang = -Math.PI / 2 + (r() - 0.5) * 2.4, v = 900 + r() * 1300;
          const k = 1.4;
          const vx = Math.cos(ang) * v, vy = Math.sin(ang) * v;
          const dragT = (1 - Math.exp(-k * q)) / k;
          x = (p.x ?? 540) + vx * dragT + Math.sin(q * 6 + i) * 18;
          y = (p.y ?? 900) + vy * dragT + 0.5 * 1500 * q * q * 0.6;
        }
        const rot = q * (300 + r() * 500) * (i % 2 ? 1 : -1);
        const flip = Math.abs(Math.cos(q * (5 + r() * 6)));
        const op = clamp((dur - q0) / 0.6);
        const c = cols[i % cols.length];
        s += i % 3 ? `<rect x="-9" y="-5" width="18" height="10" fill="${c}" transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(1 ${f1(flip * 100) / 100})" opacity="${f1(op * 100) / 100}"/>`
          : `<circle r="7" fill="${c}" transform="translate(${f1(x)} ${f1(y)}) scale(1 ${f1(flip * 100) / 100})" opacity="${f1(op * 100) / 100}"/>`;
      }
      return s;
    },
  },

  // Rules board content: title + items each popping in with a check icon. World space.
  rules: {
    space: 'world', layer: 'back',
    layout(p, sc) { p._items = p.items.map((it) => ({ ...it, _t: sc.tl.at(it.at) })); },
    sfx: (p) => (p.sfx === false ? [] : [{ t: p._at, name: 'pop', gain: 0.6 }, ...p._items.map((it) => ({ t: it._t, name: 'pop', gain: 0.8 }))]),
    draw(p, t) {
      if (t < p._at) return '';
      const a = life(t, p._at, p._until, 0.3, 0.2);
      if (!a) return '';
      const w = p.w || 880;
      const tsize = fit(plain(p.title || ''), p.titleSize || 72, FONT.title, 400, w - 80);
      let s = `<g opacity="${textWithOpacity(a.o)}"><text data-qa="world" data-g="${p.id}" transform="translate(${p.x + w / 2} ${p.y}) scale(${f1(a.s * 100) / 100})" text-anchor="middle" font-family="${FONT.title}" font-size="${f1(tsize)}" stroke="#141414" stroke-width="${f1(tsize * 0.12)}" paint-order="stroke">${tspans(p.title || '', PAL.goldL, PAL.yellow)}</text>`;
      p._items.forEach((it, i) => {
        const b = life(t, it._t, null, 0.3);
        if (!b) return;
        const y = p.y + (p.gap || 112) * (i + 1);
        const size = fit(plain(it.text), p.size || 50, FONT.ui, 800, w - 150);
        s += `<g transform="translate(${p.x + 50} ${y - size * 0.32}) scale(${f1(b.s * 100) / 100})">${icon(it.icon || 'check', it.color || PAL.green)}</g>
          <text data-qa="world" data-g="${p.id}" x="${p.x + 108 - (1 - E.out(b.pi)) * 40}" y="${y}" opacity="${textWithOpacity(b.o)}" font-family="${FONT.ui}" font-weight="800" font-size="${f1(size)}">${tspans(it.text, '#fff', PAL.yellow)}</text>`;
      });
      return s + '</g>';
    },
  },

  // Escape hatch: episode supplies its own SVG function (t, scene) => string.
  custom: {
    space: 'world', layer: 'front',
    draw(p, t, sc) { if (t < (p._at ?? 0) || (p._until != null && t > p._until)) return ''; return p.draw(t, sc, p); },
  },
};
