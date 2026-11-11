// Characters: the gold bull mascot and the fee goblin. Everything is a pure function of time.
import { PAL, clamp, lerp, E, rng, noise, prepKeys, evalKeys, stepKeys, f1 } from './core.js';

const MOODS = {
  neutral: { bA: 0, bY: 0, lid: 0.1, smile: 0.35, pup: 1, asym: 0 },
  happy: { bA: 6, bY: -10, lid: 0.04, smile: 1, pup: 1.05, asym: 0 },
  excited: { bA: 4, bY: -18, lid: 0, smile: 1.15, pup: 1.1, asym: 0 },
  shocked: { bA: 6, bY: -26, lid: 0, smile: -0.25, pup: 0.62, asym: 0 },
  worried: { bA: 20, bY: -8, lid: 0.12, smile: -0.5, pup: 0.95, asym: 0 },
  sad: { bA: 24, bY: -2, lid: 0.36, smile: -0.95, pup: 0.95, asym: 0 },
  angry: { bA: -22, bY: 6, lid: 0.2, smile: -0.45, pup: 0.9, asym: 0 },
  smug: { bA: -6, bY: 0, lid: 0.32, smile: 0.85, pup: 1, asym: 14 },
  think: { bA: 0, bY: -6, lid: 0.14, smile: 0.05, pup: 1, asym: 16 },
  determined: { bA: -12, bY: 2, lid: 0.16, smile: 0.55, pup: 1, asym: 0 },
};
const LOOKS = {
  cam: [0, 0], left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1],
  upleft: [-0.8, -0.7], upright: [0.8, -0.7], downleft: [-0.8, 0.7], downright: [0.8, 0.7],
};

function moodAt(keys, t) {
  let cur = null, prev = null;
  for (const k of keys) if (k._t <= t) { prev = cur; cur = k; }
  if (!cur) return { ...MOODS[keys[0]?.mood || 'neutral'] };
  const a = MOODS[prev?.mood || cur.mood], b = MOODS[cur.mood];
  const p = E.inOut(clamp((t - cur._t) / 0.22));
  const o = {};
  for (const f in b) o[f] = lerp(a[f], b[f], p);
  return o;
}
function lookAt(keys, t, seed) {
  let cur = null, prev = null;
  for (const k of keys) if (k._t <= t) { prev = cur; cur = k; }
  const v = (k) => (k ? (Array.isArray(k.look) ? k.look : LOOKS[k.look] || [0, 0]) : [0, 0]);
  const a = v(prev), b = v(cur);
  const p = cur ? E.out(clamp((t - cur._t) / 0.18)) : 1;
  return [lerp(a[0], b[0], p) + 0.18 * noise(t * 0.9, seed + 'lx'), lerp(a[1], b[1], p) + 0.14 * noise(t * 0.8, seed + 'ly')];
}
// action weight with soft edges
function actW(a, t) {
  if (t < a._t || t > a._t + a._d) return 0;
  const r = a.ramp ?? 0.14;
  return Math.min(1, (t - a._t) / r, (a._t + a._d - t) / r);
}

class Actor {
  constructor(cfg, scene, defs) {
    this.cfg = cfg;
    this.id = cfg.id;
    this.scene = scene;
    const tl = scene.tl;
    this.tl = tl;
    this.path = prepKeys(cfg.path, tl, 0.7);
    this.moods = prepKeys(cfg.moods || [{ at: 0, mood: 'neutral' }], tl, 0);
    this.looks = prepKeys(cfg.looks || [], tl, 0);
    this.actions = (cfg.actions || []).map((a) => ({ ...a, _t: tl.at(a.at), _d: a.dur ?? defs[a.do] ?? 0.8 }));
    this.shows = (cfg.show || [{ at: 0 }]).map((s) => ({ _t: tl.at(s.at), _u: s.until != null ? tl.at(s.until) : 1e9, puff: s.puff ?? this.scene.tl.at(s.at) > 0.05 }));
    const r = rng(this.id + 'blink');
    this.blinks = [];
    for (let b = 0.8 + r() * 1.5; b < tl.duration + 5; b += 2.0 + r() * 2.6) this.blinks.push(b);
  }
  acts(t, name) { return this.actions.filter((a) => a.do === name).map((a) => [a, actW(a, t)]).filter(([, w]) => w > 0); }
  w(t, name) { return this.acts(t, name).reduce((m, [, w]) => Math.max(m, w), 0); }
  visible(t) {
    for (const s of this.shows) if (t >= s._t && t <= s._u) {
      const pin = E.back(clamp((t - s._t) / 0.3)), pout = clamp((t - (s._u - 0.2)) / 0.2);
      return { s: pin * (1 - E.in(pout)), puffIn: s.puff ? t - s._t : 99, puffOut: s.puff && s._u < 1e8 ? t - s._u + 0.2 : -1 };
    }
    return null;
  }
  base(t) {
    const p = evalKeys(this.path, t, ['x', 'y', 'scale'], (v) => v);
    let face = 1;
    for (const k of this.path) if (k._t - k._m <= t && k.face != null) face = k.face;
    p.scale = p.scale ?? 1;
    p.face = face;
    // hop while travelling
    p.hop = 0; p.squash = 0;
    if (p._moving) {
      const dist = Math.hypot((p._to.x ?? 0) - (p._from.x ?? 0), (p._to.y ?? 0) - (p._from.y ?? 0));
      const hops = Math.max(1, Math.round(dist / 260));
      const ph = (p._raw * hops) % 1;
      p.hop = Math.sin(Math.PI * ph) * Math.min(110, 40 + dist * 0.06);
      p.squash = Math.max(0, 1 - Math.sin(Math.PI * ph) * 3) * 0.12;
    }
    return p;
  }
  blink(t) {
    for (const b of this.blinks) if (t >= b && t <= b + 0.16) return 1 - Math.abs((t - b) / 0.08 - 1);
    return 0;
  }
  speaking(t) {
    const li = this.tl.lineAt(t);
    if (li < 0) return false;
    const sp = this.scene.ep.lines[li].speaker || this.scene.narrator;
    return sp === this.id;
  }
  puff(x, y, age, r0 = 60) {
    if (age < 0 || age > 0.5) return '';
    const p = age / 0.5, rr = rng('puff' + Math.round(x));
    let s = '';
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + rr();
      const d = r0 * (0.4 + E.out(p) * 1.4);
      s += `<circle cx="${f1(x + Math.cos(a) * d)}" cy="${f1(y + Math.sin(a) * d * 0.7)}" r="${f1(r0 * 0.5 * (1 - p * 0.6))}" fill="#d9dde6" opacity="${f1((1 - p) * 0.8 * 100) / 100}"/>`;
    }
    return s;
  }
}

// ======================= BULL =======================
const BULL_DEF = { wave: 1.2, point: 1.2, cheer: 1.2, type: 1.5, write: 1.0, shrug: 1.0, jump: 0.6, tilt: 1.0, shake: 0.6, sweat: 1.6, nod: 0.6, facepalm: 1.2, hold: 1.0, bounce: 1.0 };

export class Bull extends Actor {
  constructor(cfg, scene) { super(cfg, scene, BULL_DEF); }

  state(t) {
    const b = this.base(t);
    const tl = this.tl;
    let y = b.y ?? 1300, x = b.x ?? 0;
    // jump
    let jy = 0, sq = b.squash;
    for (const [a] of this.acts(t, 'jump')) {
      const p = clamp((t - a._t) / a._d);
      jy = Math.max(jy, 4 * p * (1 - p) * (a.h ?? 150));
      if (p > 0.85) sq = Math.max(sq, (1 - (p - 0.85) / 0.15) * 0.14);
      if (p < 0.12) sq = Math.max(sq, (1 - p / 0.12) * 0.1);
    }
    for (const [a] of this.acts(t, 'bounce')) jy = Math.max(jy, Math.abs(Math.sin((t - a._t) * 9)) * 40);
    let sx = 0;
    for (const [, w] of this.acts(t, 'shake')) sx += Math.sin(t * 60) * 9 * w;
    const speaking = this.speaking(t);
    const mouth = speaking ? tl.mouth(t) : 0;
    const en = speaking ? tl.energy(t) : 0;
    return { x: x + sx, y: y - b.hop - jy, s: b.scale, face: b.face, sq, mouth, en, moving: b._moving };
  }

  arms(t, st) {
    const id = this.id;
    let L = 10 + 4 * Math.sin(t * 2.1), R = 10 + 4 * Math.sin(t * 2.1 + 1.3);
    // talking gestures
    L += 26 * st.en * (0.55 + 0.45 * Math.sin(t * 2.3 + 1));
    R += 38 * st.en * (0.55 + 0.45 * Math.sin(t * 3.1));
    if (st.moving) { L = 55 + 10 * Math.sin(t * 12); R = 55 + 10 * Math.sin(t * 12 + 2); }
    const F = st.face > 0 ? 'R' : 'L';
    const set = (side, v, w) => { if (side === 'L') L = lerp(L, v, w); else R = lerp(R, v, w); };
    let marker = 0, palm = 0;
    for (const [a, w] of this.acts(t, 'wave')) set(a.arm || 'R', 150 + 22 * Math.sin((t - a._t) * 16), w);
    for (const [a, w] of this.acts(t, 'point')) set(a.arm || F, 92 + 4 * Math.sin((t - a._t) * 5), w);
    for (const [, w] of this.acts(t, 'cheer')) { set('L', 155 + 12 * Math.sin(t * 14), w); set('R', 155 + 12 * Math.sin(t * 14 + 1.5), w); }
    for (const [, w] of this.acts(t, 'type')) { set('L', 48 + 14 * Math.sin(t * 34), w); set('R', 48 + 14 * Math.sin(t * 34 + 2.2), w); }
    for (const [a, w] of this.acts(t, 'write')) { set(a.arm || F, 118 + 7 * Math.sin((t - a._t) * 19) + 4 * Math.sin((t - a._t) * 7), w); marker = Math.max(marker, w); }
    for (const [, w] of this.acts(t, 'shrug')) { set('L', 72, w); set('R', 72, w); }
    for (const [, w] of this.acts(t, 'hold')) { set('L', 45, w); set('R', 45, w); }
    for (const [, w] of this.acts(t, 'facepalm')) { set(F, 168, w); palm = w; }
    return { L, R, marker, F, palm };
  }

  anchor(name, t) {
    const st = this.state(t);
    const s = st.s;
    if (name === 'head') return [st.x, st.y - 420 * s];
    if (name === 'hand') {
      const a = this.arms(t, st);
      const side = a.F === 'R' ? 1 : -1, ang = ((side > 0 ? a.R : a.L) * Math.PI) / 180;
      return [st.x + side * (112 + Math.sin(ang) * 160) * s, st.y + (-280 + Math.cos(ang) * 160) * s];
    }
    return [st.x, st.y - 200 * s];
  }

  draw(t) {
    const vis = this.visible(t);
    if (!vis) return '';
    const st = this.state(t);
    const m = moodAt(this.moods, t);
    const look = lookAt(this.looks, t, this.id);
    const arms = this.arms(t, st);
    const id = this.id;
    const fx = 16 * st.face;
    const breathe = 1 + 0.014 * Math.sin(t * 2.6);
    const sy = (1 - st.sq) * breathe, sxs = 1 + st.sq * 0.8;
    let tilt = 2.2 * Math.sin(t * 0.9) + st.face * 2;
    for (const [a, w] of this.acts(t, 'tilt')) tilt += (a.deg ?? 12) * w;
    for (const [, w] of this.acts(t, 'shrug')) tilt += 8 * w;
    let nod = 0;
    for (const [a] of this.acts(t, 'nod')) nod += Math.sin((t - a._t) * 18) * 10 * (1 - (t - a._t) / a._d);
    const headY = -st.mouth * 5 + nod;
    const lid = Math.max(m.lid, this.blink(t));
    const O = PAL.outline;

    const arm = (side, raise) => {
      const sgn = side === 'R' ? 1 : -1;
      const rot = -sgn * raise;
      const bend = 22 * sgn;
      const hasMarker = arms.marker > 0.3 && side === arms.F;
      return `<g transform="translate(${sgn * 108} -282) rotate(${f1(rot)})">
        <path d="M0 0 Q ${bend} 80 0 150" stroke="${O}" stroke-width="58" fill="none" stroke-linecap="round"/>
        <path d="M0 0 Q ${bend} 80 0 150" stroke="${PAL.gold}" stroke-width="44" fill="none" stroke-linecap="round"/>
        ${hasMarker ? `<g transform="translate(0 170) rotate(${sgn * 30})"><rect x="-9" y="-10" width="18" height="70" rx="6" fill="#2b3245" stroke="#11151f" stroke-width="3"/><rect x="-9" y="52" width="18" height="16" rx="4" fill="#1f2a44"/></g>` : ''}
        <ellipse cx="0" cy="162" rx="31" ry="27" fill="#4a3420" stroke="#2a1d10" stroke-width="5"/>
        <path d="M0 140 L0 170" stroke="#2a1d10" stroke-width="4"/>
      </g>`;
    };

    const eye = (side) => {
      const sgn = side === 'R' ? 1 : -1;
      const cx = fx + sgn * 56, cy = -442;
      const px = cx + look[0] * 13 + st.face * 4, py = cy + 4 + look[1] * 12;
      const lidH = clamp(lid) * 88;
      return `<clipPath id="${id}eye${side}"><ellipse cx="${cx}" cy="${cy}" rx="36" ry="43"/></clipPath>
        <ellipse cx="${cx}" cy="${cy}" rx="36" ry="43" fill="#fff" stroke="${O}" stroke-width="5"/>
        <g clip-path="url(#${id}eye${side})">
          <circle cx="${f1(px)}" cy="${f1(py)}" r="${f1(18 * m.pup)}" fill="#1a1208"/>
          <circle cx="${f1(px + 6)}" cy="${f1(py - 7)}" r="${f1(6 * m.pup)}" fill="#fff"/>
          ${lidH > 1 ? `<rect x="${cx - 40}" y="${cy - 46}" width="80" height="${f1(lidH)}" fill="${PAL.gold}"/><path d="M${cx - 38} ${f1(cy - 45 + lidH)} Q ${cx} ${f1(cy - 41 + lidH)} ${cx + 38} ${f1(cy - 45 + lidH)}" stroke="${O}" stroke-width="5" fill="none"/>` : ''}
        </g>`;
    };
    const brow = (side) => {
      const sgn = side === 'R' ? 1 : -1;
      const yb = -506 + m.bY - (side === 'R' ? m.asym : 0) + Math.sin(t * 1.7) * 1.5;
      const xi = fx + sgn * 22, xo = fx + sgn * 90;
      const yi = yb - m.bA * 0.9, yo = yb + m.bA * 0.35;
      return `<path d="M${f1(xi)} ${f1(yi)} Q ${f1((xi + xo) / 2)} ${f1((yi + yo) / 2 - 12)} ${f1(xo)} ${f1(yo)}" stroke="#4a3010" stroke-width="17" stroke-linecap="round" fill="none"/>`;
    };
    // mouth
    const mo = st.mouth, cy = -318, wdt = 40 + 8 * mo;
    const sm = m.smile;
    const cornerY = cy - 13 * sm;
    const openH = 4 + 52 * mo;
    let mouth;
    if (openH < 8) {
      mouth = `<path d="M${fx - wdt} ${f1(cornerY)} Q ${fx} ${f1(cy + 14 * sm)} ${fx + wdt} ${f1(cornerY)}" stroke="#4a1f14" stroke-width="7" stroke-linecap="round" fill="none"/>`;
    } else {
      const top = cy - 4 + 4 * sm, bot = cy + openH + 8 * Math.max(0, sm);
      mouth = `<clipPath id="${id}mouth"><path d="M${fx - wdt} ${f1(cornerY)} Q ${fx} ${f1(top)} ${fx + wdt} ${f1(cornerY)} Q ${fx} ${f1(bot + openH * 0.25)} ${fx - wdt} ${f1(cornerY)} Z"/></clipPath>
        <path d="M${fx - wdt} ${f1(cornerY)} Q ${fx} ${f1(top)} ${fx + wdt} ${f1(cornerY)} Q ${fx} ${f1(bot + openH * 0.25)} ${fx - wdt} ${f1(cornerY)} Z" fill="#5a1a14" stroke="#3a120c" stroke-width="5"/>
        <g clip-path="url(#${id}mouth)"><ellipse cx="${fx}" cy="${f1(bot + openH * 0.1)}" rx="${f1(wdt * 0.7)}" ry="${f1(openH * 0.45)}" fill="#e2706c"/>
        <rect x="${fx - wdt}" y="${f1(top - 20)}" width="${wdt * 2}" height="${f1(Math.min(14, openH * 0.3) + 18)}" fill="#fffaf0"/></g>`;
    }
    // sweat
    let sweat = '';
    for (const [a] of this.acts(t, 'sweat')) {
      const r = rng(id + 'sw' + a._t);
      for (let k = 0; k < 12; k++) {
        const t0 = a._t + k * 0.33;
        const p = (t - t0) / 0.9;
        if (p < 0 || p > 1 || t0 > a._t + a._d) continue;
        const side = k % 2 ? 1 : -1;
        const x0 = fx + side * (120 + r() * 30), y0 = -520 + r() * 40;
        const yy = y0 + 170 * p * p, xx = x0 + side * 30 * p;
        sweat += `<path transform="translate(${f1(xx)} ${f1(yy)}) scale(${f1(1 - p * 0.3)})" d="M0 -24 C 10 -8 16 2 16 10 A16 16 0 0 1 -16 10 C -16 2 -10 -8 0 -24 Z" fill="#9fdcff" stroke="#3a7ca5" stroke-width="3" opacity="${f1((1 - p) * 10) / 10 + 0.1}"/>`;
      }
    }
    const facepalm = arms.palm > 0.6;
    const body = `
      <path d="M-30 -110 Q -130 -60 -150 -150" stroke="${O}" stroke-width="16" fill="none" stroke-linecap="round" transform="rotate(${f1(6 * Math.sin(t * 4))} -30 -110)"/>
      <path d="M-30 -110 Q -130 -60 -150 -150" stroke="${PAL.gold}" stroke-width="8" fill="none" stroke-linecap="round" transform="rotate(${f1(6 * Math.sin(t * 4))} -30 -110)"/>
      ${[-1, 1].map((sg) => `<rect x="${sg * 52 - 26}" y="-80" width="52" height="66" rx="20" fill="#d4b25e" stroke="${O}" stroke-width="6"/>
        <rect x="${sg * 52 - 32}" y="-28" width="64" height="28" rx="12" fill="#4a3420" stroke="#2a1d10" stroke-width="5"/>`).join('')}
      ${arm(arms.F === 'R' ? 'L' : 'R', arms.F === 'R' ? arms.L : arms.R)}
      <ellipse cx="0" cy="-190" rx="128" ry="150" fill="url(#gBull)" stroke="${O}" stroke-width="7"/>
      <ellipse cx="${fx * 0.5}" cy="-165" rx="82" ry="102" fill="${PAL.goldL}" opacity="0.92"/>
      <path d="M${fx * 0.4 - 22} -318 L ${fx * 0.4 + 22} -318 L ${fx * 0.4 + 12} -296 L ${fx * 0.4 + 26} -205 L ${fx * 0.4} -180 L ${fx * 0.4 - 26} -205 L ${fx * 0.4 - 12} -296 Z" fill="#22304d" stroke="#141c2e" stroke-width="4"/>
      <path d="M${fx * 0.4 - 18} -262 L ${fx * 0.4 + 20} -278 M ${fx * 0.4 - 22} -232 L ${fx * 0.4 + 24} -248" stroke="${PAL.gold}" stroke-width="6"/>`;
    const head = `
      <g transform="rotate(${f1(tilt)} 0 -330) translate(0 ${f1(headY)})">
        ${[-1, 1].map((sg) => `<path d="M${sg * 108} -500 Q ${sg * 190} -510 ${sg * 200} -610 Q ${sg * 160} -545 ${sg * 92} -532 Z" fill="${PAL.goldL}" stroke="${O}" stroke-width="6" stroke-linejoin="round"/>`).join('')}
        ${[-1, 1].map((sg) => `<g transform="rotate(${sg * (18 + 4 * Math.sin(t * 3 + sg))} ${sg * 140} -450)"><ellipse cx="${sg * 168}" cy="-450" rx="54" ry="25" fill="${PAL.gold}" stroke="${O}" stroke-width="6"/><ellipse cx="${sg * 172}" cy="-450" rx="32" ry="12" fill="#e8a39a"/></g>`).join('')}
        <ellipse cx="0" cy="-420" rx="152" ry="132" fill="url(#gBull)" stroke="${O}" stroke-width="7"/>
        <path d="M-30 -548 Q -16 -590 0 -552 Q 16 -592 30 -548" fill="#c9a24a" stroke="${O}" stroke-width="5" stroke-linejoin="round"/>
        <ellipse cx="${fx}" cy="-342" rx="104" ry="70" fill="${PAL.goldL}" stroke="${O}" stroke-width="6"/>
        <ellipse cx="${fx - 32}" cy="-366" rx="12" ry="9" fill="#7a5a2a"/><ellipse cx="${fx + 32}" cy="-366" rx="12" ry="9" fill="#7a5a2a"/>
        ${mouth}
        ${eye('L')}${eye('R')}
        ${brow('L')}${brow('R')}
        ${sweat}
      </g>`;
    const front = arm(arms.F, arms.F === 'R' ? arms.R : arms.L);
    const s = st.s * vis.s;
    return `<g transform="translate(${f1(st.x)} ${f1(st.y)}) scale(${f1(s * sxs * 1000) / 1000} ${f1(s * sy * 1000) / 1000})">
      <ellipse cx="0" cy="6" rx="${f1(130 * (1 - Math.min(0.5, (1300 - st.y) / 600)))}" ry="16" fill="#000" opacity="0.25" transform="translate(0 ${f1((1300 - st.y) / s)})"/>
      ${body}${facepalm ? head + front : front + head}
    </g>` + this.puff(st.x, st.y - 250 * st.s, vis.puffIn, 110) + this.puff(st.x, st.y - 250 * st.s, vis.puffOut, 110);
  }
}

// ======================= GOBLIN =======================
const GOB_DEF = { grab: 0.7, laugh: 1.2, dance: 1.6, sad: 1.5, sneak: 1.5, jump: 0.6, shake: 0.6 };
const GOB = { skin: '#7fb24a', dark: '#2f4f1f', vest: '#6b3f22', sack: '#9a6a3a' };

export class Goblin extends Actor {
  constructor(cfg, scene) {
    super(cfg, scene, GOB_DEF);
    this.sackKeys = prepKeys(cfg.sack || [{ at: 0, size: 1 }], scene.tl, 0.3);
  }
  state(t) {
    const b = this.base(t);
    let jy = 0;
    for (const [a] of this.acts(t, 'jump')) { const p = clamp((t - a._t) / a._d); jy = Math.max(jy, 4 * p * (1 - p) * (a.h ?? 140)); }
    for (const [a] of this.acts(t, 'grab')) { const p = clamp((t - a._t) / a._d); jy = Math.max(jy, 4 * p * (1 - p) * (a.h ?? 220)); }
    for (const [, w] of this.acts(t, 'laugh')) jy = Math.max(jy, Math.abs(Math.sin(t * 16)) * 22 * w);
    for (const [, w] of this.acts(t, 'dance')) jy = Math.max(jy, Math.abs(Math.sin(t * 10)) * 50 * w);
    const sack = evalKeys(this.sackKeys, t, ['size']).size ?? 1;
    return { x: b.x, y: (b.y ?? 1300) - b.hop - jy, s: b.scale, face: b.face, moving: b._moving, sack };
  }
  anchor(name, t) {
    const st = this.state(t);
    if (name === 'sack') return [st.x - st.face * 78 * st.s, st.y - 175 * st.s];
    return [st.x, st.y - 200 * st.s];
  }
  draw(t) {
    const vis = this.visible(t);
    if (!vis) return '';
    const st = this.state(t);
    const sad = this.w(t, 'sad');
    const fc = st.face;
    const run = st.moving || this.w(t, 'sneak') > 0 || this.w(t, 'dance') > 0;
    const legA = run ? Math.sin(t * 22) * 32 : 0;
    const grab = this.w(t, 'grab');
    const laugh = this.w(t, 'laugh');
    const D = GOB.dark;
    let armF = lerp(20 + 6 * Math.sin(t * 3), 150, grab), armB = 25 + 5 * Math.sin(t * 2.5 + 1);
    if (laugh) armF = lerp(armF, 60 + 15 * Math.sin(t * 16), laugh);
    for (const [, w] of this.acts(t, 'dance')) { armF = lerp(armF, 140 + 20 * Math.sin(t * 10), w); armB = lerp(armB, 140 + 20 * Math.sin(t * 10 + 3), w); }
    const ear = lerp(-6 + 4 * Math.sin(t * 5), 28, sad);
    const lx = 6 + 4 * noise(t, 'gl');
    const ss = st.sack;
    const limb = (x, y, ang, len, w) => `<g transform="translate(${x} ${y}) rotate(${f1(ang)})"><path d="M0 0 L0 ${len}" stroke="${D}" stroke-width="${w + 8}" stroke-linecap="round"/><path d="M0 0 L0 ${len}" stroke="${GOB.skin}" stroke-width="${w}" stroke-linecap="round"/></g>`;
    const sack = `<g transform="translate(-78 -175) scale(${f1(ss * 100) / 100}) rotate(${f1(-10 + 4 * Math.sin(t * 6))})">
        <path d="M-58 10 Q -70 -60 -8 -66 L 8 -66 Q 70 -60 58 10 Q 50 62 0 64 Q -50 62 -58 10 Z" fill="${GOB.sack}" stroke="#5a3a18" stroke-width="6"/>
        <path d="M-20 -66 Q 0 -86 20 -66" stroke="#5a3a18" stroke-width="8" fill="none"/>
        <circle cx="-16" cy="-8" r="9" fill="none" stroke="${PAL.gold}" stroke-width="6"/><circle cx="16" cy="26" r="9" fill="none" stroke="${PAL.gold}" stroke-width="6"/><path d="M20 -16 L-20 34" stroke="${PAL.gold}" stroke-width="7" stroke-linecap="round"/>
      </g>`;
    const browA = lerp(-16, 18, sad);
    const s = st.s * vis.s;
    return `<g transform="translate(${f1(st.x)} ${f1(st.y)}) scale(${f1(s * fc * 1000) / 1000} ${f1(s * 1000) / 1000})">
      <ellipse cx="0" cy="${f1((1300 - st.y) / s + 4)}" rx="70" ry="10" fill="#000" opacity="0.25"/>
      ${sack}
      ${limb(-14, -42, -legA, 42, 14)}${limb(14, -42, legA, 42, 14)}
      <ellipse cx="${-14 - legA * 0.5}" cy="-2" rx="22" ry="10" fill="#4a2e14"/><ellipse cx="${14 + legA * 0.5}" cy="-2" rx="22" ry="10" fill="#4a2e14"/>
      ${limb(-40, -120, armB, 64, 14)}
      <ellipse cx="0" cy="-92" rx="50" ry="58" fill="${GOB.skin}" stroke="${D}" stroke-width="6"/>
      <path d="M-44 -118 Q -50 -60 -30 -44 L -6 -44 L -6 -146 Q -30 -146 -44 -118 Z M44 -118 Q 50 -60 30 -44 L 6 -44 L 6 -146 Q 30 -146 44 -118 Z" fill="${GOB.vest}"/>
      <g transform="translate(0 ${f1(-laugh * Math.abs(Math.sin(t * 16)) * 6)}) rotate(${f1(laugh * 6 * Math.sin(t * 16) + sad * 8)} 0 -150)">
        <path d="M-60 -215 L -150 ${-238 + ear} L -70 -185 Z" fill="${GOB.skin}" stroke="${D}" stroke-width="6" stroke-linejoin="round"/>
        <path d="M60 -215 L 150 ${-238 + ear} L 70 -185 Z" fill="${GOB.skin}" stroke="${D}" stroke-width="6" stroke-linejoin="round"/>
        <ellipse cx="0" cy="-205" rx="74" ry="62" fill="${GOB.skin}" stroke="${D}" stroke-width="6"/>
        <circle cx="${-26 + lx}" cy="-222" r="17" fill="#fff6a8" stroke="${D}" stroke-width="4"/><circle cx="${26 + lx}" cy="-222" r="17" fill="#fff6a8" stroke="${D}" stroke-width="4"/>
        <circle cx="${-24 + lx * 1.6}" cy="-220" r="7" fill="#1a1208"/><circle cx="${28 + lx * 1.6}" cy="-220" r="7" fill="#1a1208"/>
        <path d="M${-46 + lx} ${-246 - browA * 0.5} L ${-12 + lx} ${-240 + browA * 0.5} M ${46 + lx} ${-246 - browA * 0.5} L ${12 + lx} ${-240 + browA * 0.5}" stroke="${D}" stroke-width="8" stroke-linecap="round"/>
        <path d="M${8 + lx} -212 Q ${52 + lx} -196 ${40 + lx} -180 Q ${22 + lx} -182 ${4 + lx} -194 Z" fill="#6c9c3c" stroke="${D}" stroke-width="5"/>
        ${sad > 0.5
          ? `<path d="M-30 -160 Q 0 -178 30 -160" stroke="${D}" stroke-width="7" fill="none" stroke-linecap="round"/>`
          : `<path d="M-40 -172 Q 0 ${-138 - laugh * 14} 40 -172 Z" fill="#3a1a10" stroke="${D}" stroke-width="5"/><path d="M-22 -170 L -14 -156 L -6 -169 M 6 -169 L 14 -156 L 22 -170" fill="#fff" stroke="#fff" stroke-width="2"/>`}
      </g>
      ${limb(40, -120, -armF, 64, 14)}
    </g>` + this.puff(st.x, st.y - 150 * st.s, vis.puffIn, 80) + this.puff(st.x, st.y - 150 * st.s, vis.puffOut, 80);
  }
}

export const CHARS = { bull: Bull, goblin: Goblin };
