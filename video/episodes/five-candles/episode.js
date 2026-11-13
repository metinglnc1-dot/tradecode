// Episode: 5 candles. Which one didn't you know? (idea card 4, Fikirler 2026-11-13)
// Hammer, shooting star, engulfing, doji, inside bar: what each shows, plus the caution that a single
// candle without context is not a signal. Charts are illustrative. No numbers, no product.
// Locations: candle museum (5 statues), chart floor (context), classroom board (CTA list).
const MUS = 0, CH = 2800, WB = 4000;
const SPOT = [300, 780, 1260, 1740, 2220].map((x) => MUS + x);
const G = '#26a69a', Rd = '#ef5350';
const NAMES = ['HAMMER', 'SHOOTING STAR', 'ENGULFING', 'DOJI', 'INSIDE BAR'];
const NOTES = [
  ['Long lower wick', 'Buyers pushed back from the low'],
  ['Long upper wick', 'Sellers pushed back from the high'],
  ['One body swallows the last', 'A sharp change in control'],
  ['Open and close almost equal', 'Indecision'],
  ['Fits inside the last candle', 'The range is tightening'],
];

const c = (x, top, bot, wTop, wBot, col, w = 70) => `<line x1="${x}" x2="${x}" y1="${wTop}" y2="${wBot}" stroke="${col}" stroke-width="12" stroke-linecap="round"/>
  <rect x="${x - w / 2}" y="${top}" width="${w}" height="${Math.max(10, bot - top)}" rx="8" fill="${col}" stroke="#141414" stroke-width="5"/>`;
// statues sit on a pedestal top at y 1040
const STATUE = [
  (x) => c(x, 700, 790, 680, 1010, G),
  (x) => c(x, 920, 1010, 680, 1030, Rd),
  (x) => c(x - 60, 800, 920, 780, 950, Rd, 60) + c(x + 50, 720, 990, 690, 1020, G, 90),
  (x) => c(x, 845, 855, 690, 1010, '#c9b27a', 90),
  (x) => c(x - 60, 700, 1000, 680, 1025, G, 90) + c(x + 55, 790, 900, 770, 930, Rd, 60),
];

const museum = (t, sc) => {
  let s = `<rect x="${MUS - 400}" y="-900" width="3200" height="2200" fill="#231c2c"/>
    <rect x="${MUS - 400}" y="1300" width="3200" height="1400" fill="#3a2a22"/><rect x="${MUS - 400}" y="1290" width="3200" height="16" fill="#1a120d"/>
    ${Array.from({ length: 16 }, (_, i) => `<rect x="${MUS - 400 + i * 200}" y="1306" width="100" height="1400" fill="#fff" opacity="0.03"/>`).join('')}`;
  SPOT.forEach((x, k) => {
    const on = t >= sc.tl.at(`${k + 2}`) - 0.1;
    s += `<path d="M${x - 50} -400 L ${x - 260} 1300 L ${x + 260} 1300 L ${x + 50} -400 Z" fill="#fff4cc" opacity="${on ? 0.12 : 0.04}"/>
      <rect x="${x - 150}" y="1040" width="300" height="260" fill="#d9d2c3" stroke="#8d8576" stroke-width="6"/>
      <rect x="${x - 170}" y="1030" width="340" height="30" rx="6" fill="#efe9dc" stroke="#8d8576" stroke-width="5"/>
      <rect x="${x - 70}" y="1110" width="140" height="90" rx="10" fill="#E4C471" stroke="#7a5c1c" stroke-width="5"/>
      <text data-qa="world" data-g="ped${k}" x="${x}" y="1182" text-anchor="middle" font-family="Luckiest Guy" font-size="72" fill="#141414">${k + 1}</text>
      <g opacity="${on ? 1 : 0.55}">${STATUE[k](x)}</g>`;
  });
  return s;
};

const card = (t, at, until, k) => {
  const q = Math.min(1, (t - at) / 0.3), o = Math.min(q, Math.max(0, (until - t) / 0.2));
  const s = 0.85 + 0.15 * (1 - Math.pow(1 - q, 3));
  return `<g transform="translate(540 450) scale(${s.toFixed(3)}) translate(-540 -450)" opacity="${o.toFixed(2)}">
    <rect x="80" y="330" width="920" height="250" rx="30" fill="#141a26" stroke="#E4C471" stroke-width="5" filter="url(#shadow)"/>
    <text data-qa="screen" data-g="cd${k}" x="120" y="408" font-family="Luckiest Guy" font-size="64" fill="#E4C471">${k + 1}  ${NAMES[k]}</text>
    <text data-qa="screen" data-g="cd${k}" x="120" y="478" font-family="Inter" font-weight="800" font-size="44" fill="#fff">${NOTES[k][0]}</text>
    <text data-qa="screen" data-g="cd${k}" x="120" y="540" font-family="Inter" font-weight="600" font-size="38" fill="#9aa4b5">${NOTES[k][1]}</text></g>`;
};

export default {
  id: 'five-candles',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: "Five candles. Which one didn't you know? Drop the number.",
      caption: "*5 candles*. Which one didn't you know? *Drop the number*.", pauseAfter: 0.3 },
    { say: 'One, hammer. Long lower wick. Buyers pushed back from the low.',
      caption: '*One*, *hammer*. Long *lower* wick. Buyers pushed back from the low.', pauseAfter: 0.2 },
    { say: 'Two, shooting star. Long upper wick. Sellers pushed back from the high.',
      caption: '*Two*, *shooting star*. Long *upper* wick. Sellers pushed back from the high.', pauseAfter: 0.2 },
    { say: 'Three, engulfing. One body swallows the last one.',
      caption: '*Three*, *engulfing*. One body *swallows* the last one.', pauseAfter: 0.2 },
    { say: 'Four, doji. Open and close almost equal. Indecision.',
      caption: '*Four*, *doji*. Open and close almost *equal*. *Indecision*.', pauseAfter: 0.2 },
    { say: 'Five, inside bar. The whole candle fits inside the last one.',
      caption: '*Five*, *inside bar*. The whole candle fits *inside* the last one.', pauseAfter: 0.3 },
    { say: 'But one candle without context is not a signal.',
      caption: 'But one candle without *context* is not a *signal*.', pauseAfter: 0.3 },
    { say: "Drop the number you didn't know.",
      caption: "*Drop the number* you didn't know." },
  ],

  world: [
    { set: 'chartscape', x: CH, opts: { small: [
      { x: 120, top: 980, bottom: 1080, up: true }, { x: 270, top: 1000, bottom: 1090, up: false },
      { x: 420, top: 970, bottom: 1060, up: true }, { x: 570, top: 990, bottom: 1080, up: false },
      { x: 870, top: 975, bottom: 1070, up: false }, { x: 1020, top: 985, bottom: 1075, up: true },
    ] } },
    { set: 'whiteboard', x: WB },
  ],

  camera: [
    { at: 0, x: MUS + 540, y: 900, zoom: 0.9, push: 0.004 },
    ...SPOT.map((x, k) => ({ at: `${k + 2}`, x: Math.min(x + 60, MUS + 2200), y: 900, zoom: 0.9, move: 0.6, push: 0.002 })),
    { at: '7+0.1', x: CH + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.003 },
    { at: '8+0.1', x: WB + 610, y: 956, zoom: 0.95, move: 0.8, push: 0.002 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: SPOT[0] + 240, y: 1300, face: -1, scale: 0.68 },
      ...SPOT.map((x, k) => ({ at: `${k + 2}`, x: x + 240, face: -1, move: 0.6 })),
      { at: '7+0.1', x: CH + 950, face: -1, scale: 0.8, move: 0.8 },
      { at: '8+0.1', x: WB + 970, face: -1, scale: 0.82, move: 0.8 },
    ],
    moods: [{ at: 0, mood: 'think' }, { at: '2', mood: 'happy' }, { at: '4', mood: 'excited' }, { at: '5', mood: 'think' }, { at: '7', mood: 'determined' }, { at: '8', mood: 'happy' }],
    looks: [{ at: 0, look: 'upleft' }, { at: '1:drop', look: 'cam' }, { at: '2', look: 'upleft' }, { at: '7', look: 'cam' }, { at: '8', look: 'cam' }],
    actions: [
      { at: 0.4, do: 'tilt', dur: 1.4, deg: 10 },
      ...[2, 3, 4, 5, 6].map((n) => ({ at: `${n}+0.5`, do: 'point', dur: 1.0 })),
      { at: '7:context', do: 'shake', dur: 0.5 },
      { at: '8:drop', do: 'wave', dur: 2.0 },
    ],
  }],

  props: [
    { type: 'custom', layer: 'back', at: 0, until: '7+0.6', draw: (t, sc) => museum(t, sc) },
    { type: 'title', at: 0.02, until: '2-0.05', text: '*5 CANDLES*\nWHICH ONE?', y: 330, sfx: 'bell' },
    ...[0, 1, 2, 3, 4].map((k) => ({ type: 'custom', space: 'screen', at: `${k + 2}`, until: `${k + 3}-0.02`,
      draw: (t, sc, p) => card(t, p._at, p._until, k) })),

    // context: the same hammer shape, alone in a sideways range
    { type: 'custom', at: '7', until: '8+0.4', draw: (t, sc, p) => {
      const q = Math.min(1, (t - p._at) / 0.3);
      return `<g opacity="${q.toFixed(2)}">${c(CH + 720, 960, 1010, 940, 1150, G, 90)}
        <circle cx="${CH + 720}" cy="1045" r="160" fill="none" stroke="#E4C471" stroke-width="8" stroke-dasharray="20 14"/>
        <text data-qa="world" data-g="q" x="${CH + 720}" y="830" text-anchor="middle" font-family="Luckiest Guy" font-size="110" fill="#E4C471">?</text></g>`;
    } },
    { type: 'title', at: '7:context', until: '8-0.05', text: 'NO *CONTEXT*\nNO SIGNAL', y: 330 },
    { type: 'tag', space: 'screen', at: '7', until: '8+0.3', x: 540, y: 1163, size: 16, text: 'ILLUSTRATIVE CHART' },

    // CTA list
    { type: 'rules', at: '8', x: WB + 120, y: 420, w: 800, title: '', gap: 95, size: 54,
      items: NAMES.map((n, k) => ({ at: `8+${(k * 0.12).toFixed(2)}`, text: `${k + 1}. *${n.charAt(0)}${n.slice(1).toLowerCase()}*` })) },
    { type: 'title', at: '8:drop', text: '*DROP* THE NUMBER', y: 300, size: 110, icon: 'comment', sfx: 'ding' },
  ],

  sfx: [
    ...[2, 3, 4, 5, 6].map((n) => ({ at: `${n}`, name: 'pop', gain: 0.8 })),
    { at: '7:context', name: 'thud', gain: 0.8 },
  ],
};
