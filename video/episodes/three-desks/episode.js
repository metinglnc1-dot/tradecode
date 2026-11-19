// Episode: Ego, motivation, obsession at the desk. No narration (user request 19 Nov 2026, from a reference video).
// Three bulls under three lamps, a framed chart above each desk.
// Ego: a quick early win, throws the money around, then leans back with its feet up; its chart rolls over.
// Motivation: types fast while the battery is full, the battery drains, it falls asleep on the desk.
// Obsession: types steadily the whole time; the pile of bills next to it keeps growing.
// End: Ego and Motivation stand up and stare; Ego takes a phone photo of the pile.
const LEN = 18;
const C = [180, 540, 900];
const NAME = ['EGO', 'MOTIVATION', 'OBSESSION'];
const LINE = ['#ef5350', '#E4C471', '#26a69a'];
const TIE = ['#c62828', '#9c7a2e', '#1f8f84'];
const SIT = 1330, STAND = 1225, DESK = 1180, FLOOR = 1420;
const EGO_WIN = 1.6, EGO_UP = 2.2, EGO_BACK = 5.2;
const MOT_TIRED = 5.0, MOT_SLEEP = 8.4;
const END = 13.2, PHOTO = 14.6, CTA = 16.0;
const ease = (q) => { q = Math.max(0, Math.min(1, q)); return q * q * (3 - 2 * q); };
const lerp = (a, b, q) => a + (b - a) * q;
const rnd = (i) => ((Math.sin(i * 127.1 + 3.7) * 43758.5453) % 1 + 1) % 1;

// ---------- the room ----------
const room = (t) => {
  let s = `<rect x="-200" y="-200" width="1480" height="2400" fill="#2c2824"/>
    <rect x="-200" y="${FLOOR}" width="1480" height="800" fill="#1b1815"/><rect x="-200" y="${FLOOR - 6}" width="1480" height="10" fill="#120f0d"/>`;
  C.forEach((x) => {
    // ceiling lamp and its cone of light
    s += `<rect x="${x - 3}" y="-200" width="6" height="300" fill="#141210"/>
      <path d="M${x - 70} 130 L ${x + 70} 130 L ${x + 44} 96 L ${x - 44} 96 Z" fill="#3a352f" stroke="#141210" stroke-width="5"/>
      <ellipse cx="${x}" cy="132" rx="54" ry="8" fill="#fff4cc"/>
      <path d="M${x - 60} 132 L ${x - 175} ${FLOOR} L ${x + 175} ${FLOOR} L ${x + 60} 132 Z" fill="#fff4cc" opacity="0.07"/>
      <ellipse cx="${x}" cy="${FLOOR + 12}" rx="170" ry="22" fill="#fff4cc" opacity="0.06"/>`;
  });
  return s;
};

// framed charts above the desks: the line draws over time
const chartPts = (k) => {
  const ys = k === 0 ? [0.8, 0.25, 0.15, 0.3, 0.55, 0.7, 0.82, 0.88]
    : k === 1 ? [0.8, 0.55, 0.4, 0.5, 0.45, 0.6, 0.62, 0.66]
      : [0.85, 0.78, 0.7, 0.6, 0.5, 0.38, 0.25, 0.12];
  return ys;
};
const frames = (t) => {
  let s = '';
  C.forEach((x, k) => {
    const fx = x - 150, fy = 360, w = 300, h = 210;
    s += `<rect x="${x - 120}" y="${fy - 62}" width="240" height="44" rx="6" fill="#141210" stroke="#5b544b" stroke-width="3"/>
      <text data-qa="world" data-g="nm${k}" x="${x}" y="${fy - 31}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="24" letter-spacing="4" fill="#f4efe2">${NAME[k]}</text>
      <rect x="${fx - 12}" y="${fy - 12}" width="${w + 24}" height="${h + 24}" rx="6" fill="#4a3526" stroke="#141414" stroke-width="5"/>
      <rect x="${fx}" y="${fy}" width="${w}" height="${h}" fill="#f4efe2"/>
      <line x1="${fx + 20}" x2="${fx + 20}" y1="${fy + 18}" y2="${fy + h - 18}" stroke="#c9c2b6" stroke-width="3"/>
      <line x1="${fx + 20}" x2="${fx + w - 18}" y1="${fy + h - 18}" y2="${fy + h - 18}" stroke="#c9c2b6" stroke-width="3"/>`;
    const ys = chartPts(k), q = Math.max(0, Math.min(1, (t - 0.8) / (END - 1.2)));
    const n = (ys.length - 1) * q, full = Math.floor(n);
    const P = (i) => [fx + 30 + (i / (ys.length - 1)) * (w - 60), fy + 20 + ys[i] * (h - 50)];
    let d = `M${P(0).join(' ')}`;
    for (let i = 1; i <= full; i++) d += ` L ${P(i).map((v) => v.toFixed(1)).join(' ')}`;
    if (full < ys.length - 1) {
      const [x0, y0] = P(full), [x1, y1] = P(full + 1), f = n - full;
      d += ` L ${(x0 + (x1 - x0) * f).toFixed(1)} ${(y0 + (y1 - y0) * f).toFixed(1)}`;
    }
    s += `<path d="${d}" fill="none" stroke="${LINE[k]}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  return s;
};

// ---------- money ----------
const bill = (x, y, rot, sc = 1, op = 1) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${sc.toFixed(2)})" opacity="${op.toFixed(2)}">
  <rect x="-26" y="-13" width="52" height="26" rx="3" fill="#6fbf73" stroke="#2f6b3a" stroke-width="3"/><circle r="7" fill="#9bd69c" stroke="#2f6b3a" stroke-width="2"/></g>`;

// obsession's pile: grows the whole time, bills keep flying onto it
const pileH = (t) => 30 + 620 * Math.pow(ease((t - 2.5) / (END - 1.5)), 1.2);
const pile = (t) => {
  const h = pileH(t), cx = 1065, base = FLOOR + 10, w = 120 + h * 0.62;
  let s = `<path d="M${cx - w / 2} ${base} Q ${cx - w * 0.3} ${base - h * 0.9} ${cx} ${base - h} Q ${cx + w * 0.3} ${base - h * 0.9} ${cx + w / 2} ${base} Z" fill="#5aa760" stroke="#2f6b3a" stroke-width="5"/>`;
  const n = Math.floor(10 + h / 6);
  for (let i = 0; i < n; i++) {
    const u = rnd(i), v = rnd(i + 50);
    const yy = base - v * h * 0.95, half = (w / 2) * Math.sqrt(1 - Math.pow((base - yy) / h, 1.4)) * 0.92;
    s += bill(cx + (u * 2 - 1) * half, yy, rnd(i + 9) * 80 - 40, 0.9);
  }
  // incoming bills from the laptop
  if (t > 2.5 && t < END + 0.5) {
    for (let k = 0; k < 4; k++) {
      const ph = ((t * 1.6 + k / 4) % 1);
      const x = lerp(C[2] + 10, cx + (rnd(k) - 0.5) * 80, ph), y = lerp(DESK - 40, base - h - 10, ph) - Math.sin(Math.PI * ph) * 140;
      s += bill(x, y, ph * 360 + k * 40, 0.8);
    }
  }
  return s;
};

// ego's money: a burst on the first win, then thrown up in the air, then lying around on the floor
const egoMoney = (t) => {
  let s = '';
  if (t > EGO_WIN && t < EGO_BACK + 0.6) {
    for (let i = 0; i < 26; i++) {
      const t0 = EGO_UP + 0.2 + (i % 13) * 0.18, u = t - t0;
      if (t < EGO_UP + 0.2) {
        const q = Math.min(1, (t - EGO_WIN) / 0.4);
        s += bill(C[0] - 30 + (i % 5) * 14, DESK - 60 - Math.floor(i / 5) * 10 * q, rnd(i) * 20 - 10, q);
        continue;
      }
      if (u < 0) continue;
      const vx = (rnd(i) - 0.5) * 520, vy = -620 - rnd(i + 3) * 300;
      const x = C[0] + vx * u, y = DESK - 120 + vy * u + 700 * u * u;
      if (y > FLOOR) continue;
      s += bill(x, y, u * 500 + i * 30, 0.9);
    }
  }
  if (t > EGO_UP + 1.0) {
    const q = Math.min(1, (t - EGO_UP - 1.0) / 1.5);
    for (let i = 0; i < 18; i++) s += bill(C[0] - 170 + rnd(i + 20) * 340, FLOOR - 4 - rnd(i + 30) * 14, rnd(i) * 180, 0.85, q);
  }
  return s;
};

// ---------- desks, laptops and props in front of the bulls ----------
const desk = (k, t) => {
  const x = C[k];
  let s = `<rect x="${x - 150}" y="${DESK}" width="300" height="18" rx="4" fill="#7a5638" stroke="#2a1d10" stroke-width="5"/>
    <rect x="${x - 140}" y="${DESK + 18}" width="280" height="${FLOOR - DESK - 18}" fill="#5d4129" stroke="#2a1d10" stroke-width="5"/>
    <rect x="${x - 120}" y="${DESK + 40}" width="110" height="60" rx="4" fill="#6b4c31" stroke="#2a1d10" stroke-width="3"/><circle cx="${x - 65}" cy="${DESK + 70}" r="5" fill="#2a1d10"/>
    <rect x="${x + 10}" y="${DESK + 40}" width="110" height="60" rx="4" fill="#6b4c31" stroke="#2a1d10" stroke-width="3"/><circle cx="${x + 65}" cy="${DESK + 70}" r="5" fill="#2a1d10"/>`;
  // laptop seen from behind
  const asleep = k === 1 && t > MOT_SLEEP;
  s += `<path d="M${x - 70} ${DESK} L ${x - 60} ${DESK - 88} L ${x + 60} ${DESK - 88} L ${x + 70} ${DESK} Z" fill="#9aa1ad" stroke="#2b2f38" stroke-width="5"/>
    <circle cx="${x}" cy="${DESK - 46}" r="9" fill="${asleep ? '#5b6170' : '#e8edf5'}" opacity="0.8"/>`;
  // ego's feet on the desk while leaning back
  if (k === 0 && t > EGO_BACK && t < END) {
    const q = Math.min(1, (t - EGO_BACK) / 0.5);
    [-1, 1].forEach((sg) => {
      s += `<g opacity="${q.toFixed(2)}" transform="translate(${x + 95 + sg * 26} ${DESK - 8})"><rect x="-22" y="-44" width="44" height="50" rx="16" fill="#d4b25e" stroke="#3a2a12" stroke-width="5"/>
        <rect x="-26" y="-6" width="52" height="22" rx="9" fill="#4a3420" stroke="#2a1d10" stroke-width="4"/></g>`;
    });
  }
  // motivation's battery
  if (k === 1) {
    const lvl = t < MOT_TIRED ? 1 : Math.max(0, 1 - (t - MOT_TIRED) / (MOT_SLEEP - MOT_TIRED));
    const col = lvl > 0.5 ? '#26a69a' : lvl > 0.2 ? '#E4C471' : '#ef5350';
    const blink = lvl <= 0 ? (Math.sin(t * 8) > 0 ? 1 : 0.3) : 1;
    s += `<g transform="translate(${x - 40} 880)" opacity="${blink}"><rect x="0" y="0" width="80" height="36" rx="7" fill="#141210" stroke="#f4efe2" stroke-width="4"/><rect x="80" y="11" width="8" height="14" rx="2" fill="#f4efe2"/>
      <rect x="6" y="6" width="${(68 * Math.max(0.08, lvl)).toFixed(1)}" height="24" rx="4" fill="${col}"/></g>`;
    if (t > MOT_SLEEP) for (let i = 0; i < 3; i++) {
      const ph = ((t * 0.6 + i / 3) % 1);
      s += `<text x="${x + 60 + ph * 70}" y="${1040 - ph * 160}" font-family="Luckiest Guy" font-size="${30 + i * 8}" fill="#f4efe2" opacity="${(1 - ph).toFixed(2)}">Z</text>`;
    }
  }
  return s;
};

// ego's phone at the end, held in the right mitten, with a flash
const phone = (t, sc) => {
  if (t < PHOTO - 0.4) return '';
  const ego = sc.actors.find((a) => a.id === 'ego');
  const [hx, hy] = ego.anchor('handR', t);
  let s = `<g transform="translate(${hx.toFixed(1)} ${(hy - 30).toFixed(1)}) rotate(8)"><rect x="-20" y="-36" width="40" height="72" rx="8" fill="#1d2433" stroke="#0b0f19" stroke-width="4"/><rect x="-14" y="-28" width="28" height="52" rx="4" fill="#5c7cfa"/></g>`;
  for (const f of [PHOTO, PHOTO + 0.6]) {
    const u = t - f;
    if (u > 0 && u < 0.35) s += `<circle cx="${hx}" cy="${hy - 40}" r="${(40 + u * 300).toFixed(1)}" fill="#fff" opacity="${(0.8 * (1 - u / 0.35)).toFixed(2)}"/>`;
  }
  return s;
};

const actors = [
  { kind: 'bull', id: 'ego', tie: TIE[0],
    path: [
      { at: 0, x: C[0], y: SIT, face: 1, scale: 0.6 },
      { at: EGO_UP, y: STAND, move: 0.3 },
      { at: EGO_BACK, y: SIT + 30, move: 0.4 },
      { at: END + 0.3, y: STAND, move: 0.3 },
    ],
    moods: [{ at: 0, mood: 'neutral' }, { at: EGO_WIN, mood: 'excited' }, { at: EGO_BACK, mood: 'smug' }, { at: 9.5, mood: 'neutral' }, { at: END, mood: 'shocked' }],
    looks: [{ at: 0, look: 'down' }, { at: EGO_WIN, look: 'cam' }, { at: EGO_BACK, look: 'up' }, { at: END, look: 'right' }],
    actions: [
      { at: 0.3, do: 'type', dur: EGO_WIN - 0.3 },
      { at: EGO_UP, do: 'cheer', dur: 2.6 },
      { at: EGO_BACK, do: 'pose', dur: END - EGO_BACK, L: 165, R: 165, ramp: 0.4 },
      { at: EGO_BACK, do: 'tilt', dur: END - EGO_BACK, deg: -14, ramp: 0.4 },
      { at: PHOTO - 0.5, do: 'pose', dur: LEN, R: 140, ramp: 0.3 },
      { at: END + 0.3, do: 'turn', dur: LEN, by: 1.2, ramp: 0.3 },
    ] },
  { kind: 'bull', id: 'motivation', tie: TIE[1],
    path: [
      { at: 0, x: C[1], y: SIT, face: 1, scale: 0.6 },
      { at: MOT_SLEEP, y: SIT + 70, move: 0.6 },
      { at: END + 0.8, y: STAND, move: 0.3 },
    ],
    moods: [{ at: 0, mood: 'excited' }, { at: MOT_TIRED, mood: 'worried' }, { at: MOT_SLEEP - 1, mood: 'sad' }, { at: END + 0.6, mood: 'shocked' }],
    looks: [{ at: 0, look: 'down' }, { at: END + 0.6, look: 'right' }],
    actions: [
      { at: 0.3, do: 'type', dur: MOT_TIRED - 0.3 },
      { at: MOT_TIRED, do: 'type', dur: MOT_SLEEP - MOT_TIRED - 0.6 },
      { at: MOT_TIRED + 0.8, do: 'sweat', dur: 2.0 },
      { at: MOT_SLEEP, do: 'sleep', dur: END - MOT_SLEEP + 0.4, ramp: 0.5 },
      { at: END + 0.8, do: 'turn', dur: LEN, by: 1.2, ramp: 0.3 },
      { at: MOT_SLEEP, do: 'tilt', dur: END - MOT_SLEEP + 0.4, deg: 22, ramp: 0.5 },
    ] },
  { kind: 'bull', id: 'obsession', tie: TIE[2],
    path: [{ at: 0, x: C[2], y: SIT, face: 1, scale: 0.6 }],
    moods: [{ at: 0, mood: 'determined' }],
    looks: [{ at: 0, look: 'down' }],
    actions: [{ at: 0.3, do: 'type', dur: LEN }],
  },
];

const cta = (t) => {
  const q = Math.min(1, (t - CTA) / 0.4);
  return `<rect x="0" y="0" width="1080" height="1920" fill="#07090f" opacity="${(0.55 * q).toFixed(2)}"/>`;
};

export default {
  id: 'three-desks',
  silent: true,
  captions: false,
  length: LEN,
  tail: 0,
  lines: [],
  sheet: [1.0, 2.6, 4.0, 6.5, 9.0, 11.5, 14.8, 17.4],

  world: [],
  camera: [
    { at: 0, x: 540, y: 800, zoom: 1, push: 0.003 },
  ],
  actors,

  props: [
    { type: 'custom', layer: 'back', at: 0, draw: (t) => room(t) + frames(t) },
    { type: 'custom', layer: 'front', at: 0, draw: (t) => [0, 1, 2].map((k) => desk(k, t)).join('') + egoMoney(t) + pile(t) },
    { type: 'custom', layer: 'front', at: PHOTO - 0.4, draw: (t, sc) => phone(t, sc) },
    { type: 'custom', space: 'screen', at: CTA, draw: (t) => cta(t) },
    { type: 'title', at: CTA + 0.1, text: 'WHICH ONE\nARE *YOU?*', y: 820, icon: 'comment', sfx: 'ding' },
  ],

  sfx: [
    { at: EGO_WIN, name: 'coin', gain: 0.9 }, { at: EGO_WIN + 0.15, name: 'coin', gain: 0.7 },
    { at: EGO_UP + 0.2, name: 'whoosh', gain: 0.6, dur: 1.2 },
    { at: MOT_SLEEP, name: 'sad', gain: 0.6 },
    ...Array.from({ length: 16 }, (_, i) => ({ at: 3 + i * 0.6, name: 'coin', gain: 0.35 })),
    { at: PHOTO, name: 'pop', gain: 0.8 }, { at: PHOTO + 0.6, name: 'pop', gain: 0.8 },
  ],
};
