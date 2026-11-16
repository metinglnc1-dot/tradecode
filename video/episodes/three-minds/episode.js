// Episode: Three bulls, one rock. Motivation, discipline, obsession. No narration (user request 17 Nov 2026).
// Three panels on screen at once. Each bull swings a hammer at a rock with a red candle carved in it.
// Motivation swings fast and quits at 14%. Discipline keeps a steady rhythm and breaks it at 100%.
// Obsession breaks it too, then takes on a much bigger rock and keeps going to 1,000.
// Our own characters, colours and rock; the counts are a story, not data.
const LEN = 17;
const T0 = 1.2;           // first swing
const DONE = 9.4;         // discipline and obsession break the first rock
const BIG = 10.2;         // obsession's panel takes the screen
const BIG_END = 14.6;     // obsession reaches 1,000
const QUIT = 4.6;         // motivation stops

const COL = ['#E4C471', '#26a69a', '#ef5350'];
const DARK = ['#2a2312', '#0f2a27', '#2c1214'];
const NAME = ['MOTIVATION', 'DISCIPLINE', 'OBSESSION'];
const TIE = ['#9c7a2e', '#1f8f84', '#c62828'];
// panels: top y and height (screen = world, the camera never moves)
const PY = [270, 630, 990], PH = 340;
const ease = (q) => { q = Math.max(0, Math.min(1, q)); return q * q * (3 - 2 * q); };
const lerp = (a, b, q) => a + (b - a) * q;

// obsession's panel grows to fill 230..1330 after BIG
const panel = (k, t) => {
  if (k !== 2) return { y: PY[k], h: PH };
  const q = ease((t - BIG) / 0.7);
  return { y: lerp(PY[2], 270, q), h: lerp(PH, 1060, q) };
};
const period = (k, t) => (k === 0 ? 0.34 : k === 1 ? 0.5 : t > BIG + 0.7 ? 0.26 : 0.46);
const swinging = (k, t) => t >= T0 && (k === 0 ? t < QUIT : k === 1 ? t < DONE + 0.2 : t < BIG_END + 0.2) && !(k === 2 && t > DONE + 0.2 && t < BIG + 0.8);

// hit times for each bull (used for counters, rock shake, debris and sound)
const HITS = [0, 1, 2].map((k) => {
  const out = [];
  for (let t = T0; t < LEN; ) {
    const p = period(k, t);
    const h = t + p * 0.8;
    if (swinging(k, h)) out.push(+h.toFixed(3));
    t += p;
  }
  return out;
});

function damage(k, t) {
  if (k === 0) return Math.max(0, Math.min(14, Math.round(14 * Math.min(1, (t - T0) / (QUIT - T0 - 0.2)))));
  const d = Math.round(100 * Math.max(0, Math.min(1, (t - T0) / (DONE - T0))));
  if (k === 1 || t < BIG + 0.8) return Math.max(0, d);
  return Math.round(100 + 900 * Math.pow(Math.min(1, (t - BIG - 0.8) / (BIG_END - BIG - 0.8)), 1.6));
}

// hammer angle: wind up behind, strike forward on the hit
function swing(k, t) {
  if (!swinging(k, t)) return k === 0 && t >= QUIT ? 15 : -20;
  const p = period(k, t), ph = (((t - T0) % p) + p) % p / p;
  if (ph < 0.6) return lerp(-20, -150, ease(ph / 0.6));
  if (ph < 0.8) return lerp(-150, 40, (ph - 0.6) / 0.2);
  return lerp(40, -20, (ph - 0.8) / 0.2);
}
const lastHit = (k, t) => { let h = -9; for (const x of HITS[k]) { if (x > t) break; h = x; } return h; };

// rock: a boulder with a red candle carved into it, cracking as damage grows
const CRACKS = [[0.5, 0.2, 0.42, 0.42], [0.42, 0.42, 0.55, 0.6], [0.55, 0.6, 0.45, 0.85], [0.3, 0.35, 0.42, 0.42], [0.55, 0.6, 0.75, 0.55], [0.75, 0.55, 0.85, 0.75], [0.62, 0.15, 0.7, 0.35], [0.7, 0.35, 0.55, 0.6], [0.2, 0.6, 0.45, 0.85], [0.45, 0.85, 0.7, 0.95]];
function rock(x, y, w, h, dmg, max, t, k, tint) {
  const hit = t - lastHit(k, t), shake = hit < 0.15 ? Math.sin(hit * 120) * 6 * (1 - hit / 0.15) : 0;
  const q = Math.min(1, dmg / max);
  let s = `<g transform="translate(${(x + shake).toFixed(1)} ${y})">
    <path d="M${w * 0.08} ${h} L 0 ${h * 0.45} L ${w * 0.18} ${h * 0.08} L ${w * 0.55} 0 L ${w * 0.9} ${h * 0.12} L ${w} ${h * 0.55} L ${w * 0.92} ${h} Z" fill="#4a5162" stroke="#20242e" stroke-width="8" stroke-linejoin="round"/>
    <path d="M${w * 0.18} ${h * 0.08} L ${w * 0.55} 0 L ${w * 0.6} ${h * 0.35} L ${w * 0.3} ${h * 0.4} Z" fill="#5d6577"/>
    <path d="M${w * 0.6} ${h * 0.35} L ${w} ${h * 0.55} L ${w * 0.92} ${h} L ${w * 0.62} ${h} Z" fill="#3c4251"/>
    <line x1="${w * 0.5}" x2="${w * 0.5}" y1="${h * 0.16}" y2="${h * 0.86}" stroke="${tint}" stroke-width="${w * 0.03}" opacity="0.55"/>
    <rect x="${w * 0.4}" y="${h * 0.3}" width="${w * 0.2}" height="${h * 0.42}" rx="${w * 0.02}" fill="${tint}" opacity="0.5"/>`;
  const n = Math.max(0, Math.floor(q * CRACKS.length));
  CRACKS.slice(0, n).forEach(([a, b, c, d]) => { s += `<line x1="${w * a}" y1="${h * b}" x2="${w * c}" y2="${h * d}" stroke="#12141a" stroke-width="${Math.max(3, w * 0.012)}" stroke-linecap="round"/>`; });
  return s + '</g>';
}
function shards(x, y, w, h, t0, t) {
  const u = t - t0;
  if (u < 0 || u > 1.2) return '';
  let s = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.3, v = 260 + (i % 4) * 90;
    const px = x + w / 2 + Math.cos(a) * v * u, py = y + h / 2 + Math.sin(a) * v * u + 700 * u * u;
    s += `<rect x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${(w * 0.16).toFixed(1)}" height="${(h * 0.12).toFixed(1)}" fill="#4a5162" stroke="#20242e" stroke-width="4" transform="rotate(${(u * 400 + i * 30).toFixed(0)} ${px.toFixed(1)} ${py.toFixed(1)})" opacity="${Math.max(0, 1 - u / 1.2).toFixed(2)}"/>`;
  }
  return s;
}
function dust(x, y, k, t) {
  const h = lastHit(k, t), u = t - h;
  if (u < 0 || u > 0.35) return '';
  return Array.from({ length: 6 }, (_, i) => {
    const a = -Math.PI / 2 + (i - 2.5) * 0.45;
    return `<circle cx="${(x + Math.cos(a) * 90 * u * 3).toFixed(1)}" cy="${(y + Math.sin(a) * 90 * u * 3).toFixed(1)}" r="${(7 - u * 12).toFixed(1)}" fill="#c9cdd6" opacity="${(1 - u / 0.35).toFixed(2)}"/>`;
  }).join('');
}

// bull positions per panel (feet), and the hammer pivot near the front hand
const bullAt = (k, t) => {
  const p = panel(k, t), big = k === 2 ? ease((t - BIG) / 0.7) : 0;
  const s = lerp(0.42, 0.78, big);
  return { x: lerp(k === 0 && t > QUIT ? 270 : 295, 240, big), y: p.y + p.h - 26, s };
};
function hammer(k, t) {
  const b = bullAt(k, t), a = swing(k, t);
  const px = b.x + 60 * b.s, py = b.y - 230 * b.s, L = 360 * b.s;
  return `<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${a.toFixed(1)})">
    <rect x="0" y="${-7 * b.s}" width="${L}" height="${14 * b.s}" rx="${6 * b.s}" fill="#7a5a3a" stroke="#141414" stroke-width="${4 * b.s}"/>
    <rect x="${L - 30 * b.s}" y="${-60 * b.s}" width="${74 * b.s}" height="${120 * b.s}" rx="${8 * b.s}" fill="${COL[k]}" stroke="#141414" stroke-width="${6 * b.s}"/></g>`;
}

function panels(t) {
  let s = '<rect x="-200" y="-200" width="1480" height="2400" fill="#07090f"/>';
  for (let k = 0; k < 3; k++) {
    const p = panel(k, t);
    const fade = k === 2 ? 1 : 1 - ease((t - BIG) / 0.4);
    if (fade <= 0) continue;
    s += `<g opacity="${fade.toFixed(2)}"><defs><linearGradient id="pg${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0f19"/><stop offset="1" stop-color="${DARK[k]}"/></linearGradient>
      <clipPath id="pc${k}"><rect x="20" y="${p.y}" width="1040" height="${p.h}" rx="22"/></clipPath></defs>
      <g clip-path="url(#pc${k})"><rect x="20" y="${p.y}" width="1040" height="${p.h}" fill="url(#pg${k})"/>
      <path d="M ${540 - 120} ${p.y} L ${540 - 420} ${p.y + p.h} L ${540 + 520} ${p.y + p.h} L ${540 + 160} ${p.y} Z" fill="${COL[k]}" opacity="0.07"/>
      <rect x="20" y="${p.y + p.h - 28}" width="1040" height="28" fill="#06080d"/>`;
    // rocks
    const rw = lerp(300, 520, k === 2 ? ease((t - BIG) / 0.7) : 0), rh = lerp(250, 760, k === 2 ? ease((t - BIG) / 0.7) : 0);
    const rx = 430, ry = p.y + p.h - 28 - rh;
    if (k === 0) s += rock(rx, ry, rw, rh, damage(0, t), 100, t, 0, COL[0]);
    if (k === 1) s += t < DONE ? rock(rx, ry, rw, rh, damage(1, t), 100, t, 1, COL[1]) : shards(rx, ry, rw, rh, DONE, t);
    if (k === 2) {
      if (t < DONE) s += rock(rx, ry, 300, 250, damage(2, t), 100, t, 2, COL[2]);
      else s += shards(rx, p.y + p.h - 278, 300, 250, DONE, t);
      if (t > BIG) {
        const slide = ease((t - BIG) / 0.8);
        s += rock(lerp(1100, 500, slide), ry, rw, rh, damage(2, t) - 100, 900, t, 2, COL[2]);
      }
    }
    const b = bullAt(k, t);
    s += dust(k === 2 && t > BIG ? 520 : 440, b.y - 200 * b.s, k, t);
    s += '</g></g>';
  }
  return s;
}

function labels(t) {
  let s = '';
  for (let k = 0; k < 3; k++) {
    const p = panel(k, t);
    const fade = k === 2 ? 1 : 1 - ease((t - BIG) / 0.4);
    if (fade <= 0) continue;
    const d = damage(k, t), big = k === 2 ? ease((t - BIG) / 0.7) : 0;
    const size = lerp(70, 120, big);
    s += `<g opacity="${fade.toFixed(2)}"><text data-qa="screen" data-g="nm${k}" x="50" y="${p.y + 52}" font-family="Inter" font-weight="900" font-size="${lerp(30, 40, big).toFixed(1)}" letter-spacing="4" fill="${COL[k]}">${NAME[k]}</text>
      <text data-qa="screen" data-g="ct${k}" x="50" y="${(p.y + 52 + size * 0.95).toFixed(1)}" font-family="Luckiest Guy" font-size="${size.toFixed(1)}" fill="#fff" stroke="#141414" stroke-width="8" paint-order="stroke">${d.toLocaleString('en-US')}</text>`;
    if (k === 0 && t > QUIT + 0.3) s += `<rect x="50" y="${p.y + 140}" width="130" height="42" rx="10" fill="#5b6680"/><text data-qa="screen" data-g="q" x="115" y="${p.y + 170}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="22" fill="#fff">QUIT</text>`;
    if (k === 1 && t > DONE) s += `<rect x="50" y="${p.y + 140}" width="250" height="42" rx="10" fill="${COL[1]}"/><text data-qa="screen" data-g="d" x="175" y="${p.y + 170}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="22" fill="#06231f">ROCK BROKEN</text>`;
    if (k === 2 && t > BIG + 0.8) s += `<rect x="50" y="${p.y + 52 + size + 30}" width="220" height="42" rx="10" fill="${COL[2]}"/><text data-qa="screen" data-g="o" x="160" y="${p.y + 52 + size + 60}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="22" fill="#2a0b0a">BIGGER ROCK</text>`;
    s += '</g>';
  }
  return s;
}

const bull = (k) => {
  const path = [{ at: 0, x: 295, y: PY[k] + PH - 26, face: 1, scale: 0.42 }];
  if (k === 2) path.push({ at: BIG, x: 240, y: 270 + 1060 - 26, scale: 0.78, move: 0.7 });
  if (k === 0) path.push({ at: QUIT + 0.2, x: 270, move: 0.05 });
  if (k !== 2) path.push({ at: BIG + 0.35, x: -600, move: 0.05 });
  return {
    kind: 'bull', id: NAME[k].toLowerCase(), tie: TIE[k],
    path,
    moods: k === 0 ? [{ at: 0, mood: 'excited' }, { at: QUIT - 1, mood: 'worried' }, { at: QUIT, mood: 'sad' }]
      : k === 1 ? [{ at: 0, mood: 'determined' }, { at: DONE, mood: 'happy' }]
        : [{ at: 0, mood: 'determined' }, { at: DONE, mood: 'smug' }, { at: BIG, mood: 'angry' }],
    looks: [{ at: 0, look: 'right' }, ...(k === 0 ? [{ at: QUIT, look: 'down' }] : []), ...(k === 1 ? [{ at: DONE + 0.3, look: 'cam' }] : [])],
    actions: [
      ...(k === 0 ? [{ at: QUIT, do: 'facepalm', dur: 1.4 }, { at: QUIT + 1.6, do: 'shrug', dur: 1.0 }] : []),
      ...(k === 1 ? [{ at: DONE + 0.2, do: 'cheer', dur: 1.6 }] : []),
      ...(k === 2 ? [{ at: DONE + 0.2, do: 'nod', dur: 0.6 }] : []),
    ],
  };
};

const pick = (t, at) => {
  const btn = (y, label, c, d) => {
    const q = Math.max(0, Math.min(1, (t - at - d) / 0.3));
    if (q <= 0) return '';
    const s = q < 1 ? 0.5 + 0.6 * q : 1.1 - 0.1 * Math.min(1, (t - at - d - 0.3) / 0.2);
    return `<g transform="translate(540 ${y}) scale(${s.toFixed(3)})"><rect x="-200" y="-56" width="400" height="112" rx="30" fill="${c}" stroke="#141414" stroke-width="8" filter="url(#shadow)"/>
      <text data-qa="screen" data-g="pk${label}" x="0" y="16" text-anchor="middle" font-family="Luckiest Guy" font-size="48" fill="#fff" stroke="#141414" stroke-width="7" paint-order="stroke">${label}</text></g>`;
  };
  return `<rect x="0" y="0" width="1080" height="1920" fill="#07090f" opacity="${Math.min(0.75, (t - at) / 0.4 * 0.75).toFixed(2)}"/>` +
    btn(680, 'MOTIVATION', '#c9a443', 0.1) + btn(830, 'DISCIPLINE', '#1f8f84', 0.25) + btn(980, 'OBSESSION', '#c62828', 0.4);
};

export default {
  id: 'three-minds',
  silent: true,
  captions: false,
  length: LEN,
  tail: 0,
  lines: [],
  sheet: [0.6, 2.5, 4.4, 6.5, 9.6, 11.5, 14.4, 16.2],

  world: [],
  camera: [{ at: 0, x: 540, y: 960, zoom: 1, push: 0 }],
  actors: [0, 1, 2].map(bull),

  props: [
    { type: 'custom', layer: 'back', at: 0, draw: (t) => panels(t) },
    { type: 'custom', layer: 'front', at: 0, until: BIG_END + 0.6, draw: (t) => [0, 1, 2].map((k) => {
      const fade = k === 2 ? 1 : 1 - ease((t - BIG) / 0.4);
      return fade > 0 ? `<g opacity="${fade.toFixed(2)}">${hammer(k, t)}</g>` : '';
    }).join('') },
    { type: 'custom', space: 'screen', at: 0, until: BIG_END + 0.6, draw: (t) => labels(t) },
    { type: 'title', at: 0.02, until: T0 + 1.2, text: '3 BULLS. *1 ROCK.*', y: 218, size: 70 },
    { type: 'custom', space: 'screen', at: BIG_END + 0.4, draw: (t, sc, p) => pick(t, p._at) },
    { type: 'title', at: BIG_END + 0.4, text: 'WHICH BULL\nARE *YOU?*', y: 420, icon: 'comment', sfx: 'ding' },
  ],

  sfx: [
    ...HITS[0].map((h) => ({ at: h, name: 'thud', gain: 0.35 })),
    ...HITS[1].map((h) => ({ at: h, name: 'thud', gain: 0.35 })),
    ...HITS[2].map((h) => ({ at: h, name: 'thud', gain: 0.45 })),
    { at: QUIT + 0.1, name: 'sad', gain: 0.6 },
    { at: DONE, name: 'pop', gain: 1.0 }, { at: DONE + 0.05, name: 'ding', gain: 0.7 },
    { at: BIG, name: 'whoosh', gain: 0.7, dur: 0.8 },
  ],
};
