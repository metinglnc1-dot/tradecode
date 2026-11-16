// Episode: Three bulls. Motivation, discipline, obsession. (user request 16 Nov 2026)
// Our own take on the "three mindsets" format: each bull builds a tower, one candle block per backtest.
// Motivation stops at 14, Discipline completes 100, Obsession keeps going to 1,000 and finds a bigger
// mountain. The counts are a story, not data. No profit figures, no product.
const LANE = [240, 600, 960];
const COL = ['#E4C471', '#26a69a', '#ef5350'];
const NAME = ['MOTIVATION', 'DISCIPLINE', 'OBSESSION'];
const TIE = ['#9c7a2e', '#1f8f84', '#c62828'];
const UNIT = 8; // world units per backtest block
const ease = (q) => { q = Math.max(0, Math.min(1, q)); return q * q * (3 - 2 * q); };

// how many blocks each bull has stacked at time t
function count(k, t, sc) {
  const at = (a) => sc.tl.at(a);
  const a = at('2');
  if (k === 0) return Math.round(14 * ease((t - a) / (at('3:14') - a)));
  const d = Math.round(100 * Math.min(1, Math.max(0, (t - a) / (at('4:100') - a))));
  if (k === 1 || t < at('5')) return d;
  const b = at('5'), c = at('6:thousand');
  const q = Math.max(0, Math.min(1, (t - b) / (c - b)));
  return Math.round(100 + 900 * q * q);
}

const world = (t, sc) => {
  let s = `<defs><linearGradient id="tmSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#05060c"/><stop offset="0.55" stop-color="#0d1430"/><stop offset="1" stop-color="#1b2448"/></linearGradient>
    ${COL.map((c, k) => `<pattern id="tmBlk${k}" width="120" height="${UNIT * 2}" patternUnits="userSpaceOnUse"><rect width="120" height="${UNIT * 2}" fill="${c}"/><rect y="${UNIT * 2 - 1.5}" width="120" height="1.5" fill="#000" opacity="0.35"/></pattern>`).join('')}</defs>
    <rect x="-3000" y="-10000" width="10000" height="11300" fill="url(#tmSky)"/>`;
  const r = (i) => ((Math.sin(i * 127.1) * 43758.5453) % 1 + 1) % 1;
  for (let i = 0; i < 320; i++) s += `<circle cx="${(-2500 + r(i) * 7500).toFixed(0)}" cy="${(-9500 + r(i + 7) * 9300).toFixed(0)}" r="${(3 + r(i + 3) * 9).toFixed(1)}" fill="#fff" opacity="${(0.25 + r(i + 5) * 0.6).toFixed(2)}"/>`;
  // the bigger mountain, revealed at the end
  const mt = Math.min(1, Math.max(0, (t - sc.tl.at('6:bigger')) / 0.8));
  s += `<g opacity="${(0.25 + 0.75 * mt).toFixed(2)}"><path d="M1300 1300 L 2700 -6900 L 4200 1300 Z" fill="#1e2a4a"/><path d="M2700 -6900 L 2380 -5200 L 2560 -5450 L 2720 -5050 L 2880 -5500 L 3020 -5150 Z" fill="#e8edf5"/>
    <path d="M1300 1300 L 2000 -2500 L 2800 1300 Z" fill="#162038"/></g>`;
  // clouds
  [[-600, -2400, 2.2], [900, -3600, 2.8], [2200, -3000, 3.2], [-200, -5200, 3], [1500, -6200, 3.6]].forEach(([x, y, k], i) => {
    s += `<g opacity="${(0.16 + 0.05 * i).toFixed(2)}" transform="translate(${x} ${y}) scale(${k})"><ellipse rx="260" ry="60" fill="#c9d3e6"/><ellipse cx="-120" cy="-30" rx="140" ry="60" fill="#c9d3e6"/><ellipse cx="120" cy="-40" rx="170" ry="70" fill="#c9d3e6"/></g>`;
  });
  s += `<rect x="-3000" y="1300" width="9000" height="1600" fill="#0b0f19"/><rect x="-3000" y="1300" width="9000" height="10" fill="#2a3446"/>`;
  // the three towers
  LANE.forEach((x, k) => {
    const n = count(k, t, sc), h = n * UNIT;
    s += `<rect x="${x + 20}" y="${1300 - h}" width="120" height="${h}" fill="url(#tmBlk${k})"/>`;
    if (n > 0) s += `<rect x="${x + 20}" y="${1300 - h}" width="120" height="${h}" fill="none" stroke="#141414" stroke-width="5"/>`;
    // a block flying from the bull to the top of the tower
    const stop = k === 0 ? sc.tl.at('3:14') : k === 1 ? sc.tl.at('4:100') : sc.tl.at('6:thousand');
    if (t > sc.tl.at('2') && t < stop) {
      const per = k === 2 && t > sc.tl.at('5') ? 0.18 : 0.45, ph = ((t - sc.tl.at('2')) % per) / per;
      const x0 = x - 30, y0 = 1180, x1 = x + 80, y1 = 1300 - h - 10;
      const bx = x0 + (x1 - x0) * ph, by = y0 + (y1 - y0) * ph - Math.sin(Math.PI * ph) * 120;
      s += `<rect x="${(bx - 22).toFixed(1)}" y="${(by - 8).toFixed(1)}" width="44" height="16" rx="3" fill="${COL[k]}" stroke="#141414" stroke-width="3"/>`;
    }
  });
  // flag on top of discipline's finished tower
  const done = Math.min(1, Math.max(0, (t - sc.tl.at('4:100')) / 0.4));
  if (done > 0) s += `<g transform="translate(${LANE[1] + 80} ${1300 - 100 * UNIT})"><line x1="0" y1="0" x2="0" y2="${-90 * done}" stroke="#d9d2c3" stroke-width="5"/><path d="M0 ${-90 * done} l 50 12 l -50 12 Z" fill="${COL[1]}"/></g>`;
  return s;
};

// screen-space counters, one per bull
const counters = (t, sc) => {
  const zoomOut = Math.min(1, Math.max(0, (t - sc.tl.at('5')) / 0.6));
  let s = '';
  LANE.forEach((x, k) => {
    const n = count(k, t, sc);
    const big = k === 2 ? Math.max(0, (zoomOut - 0.34) / 0.66) : 0;
    const op = k === 2 ? 1 : Math.max(0, 1 - zoomOut * 3);
    if (op <= 0) return;
    const cx = k === 2 ? 900 - 360 * big : [180, 540, 900][k], cy = 330 + 120 * big, sz = 92 + 40 * big;
    const label = NAME[k];
    s += `<g opacity="${op.toFixed(2)}"><text data-qa="screen" data-g="cn${k}" x="${cx}" y="${cy - sz * 0.95}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${(30 + 8 * big).toFixed(1)}" letter-spacing="3" fill="${COL[k]}" stroke="#0b0f19" stroke-width="6" paint-order="stroke">${label}</text>
      <text data-qa="screen" data-g="cn${k}" x="${cx}" y="${cy}" text-anchor="middle" font-family="Luckiest Guy" font-size="${sz.toFixed(1)}" fill="#fff" stroke="#141414" stroke-width="8" paint-order="stroke">${n.toLocaleString('en-US')}</text></g>`;
    if (k === 1 && n >= 100 && op > 0) s += `<g opacity="${op.toFixed(2)}"><rect x="${cx - 120}" y="${cy + 18}" width="240" height="44" rx="10" fill="${COL[1]}"/><text data-qa="screen" data-g="gc" x="${cx}" y="${cy + 49}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="22" fill="#06231f">GOAL COMPLETE</text></g>`;
    if (k === 0 && t > sc.tl.at('3:quits')) s += `<g opacity="${op.toFixed(2)}"><rect x="${cx - 70}" y="${cy + 18}" width="140" height="44" rx="10" fill="#5b6680"/><text data-qa="screen" data-g="qt" x="${cx}" y="${cy + 49}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="22" fill="#fff">QUIT</text></g>`;
  });
  return s;
};

const pick = (t, at) => {
  const btn = (x, label, c, d) => {
    const q = Math.max(0, Math.min(1, (t - at - d) / 0.3));
    if (q <= 0) return '';
    const s = (q < 1 ? 0.5 + 0.6 * q : 1.1 - 0.1 * Math.min(1, (t - at - d - 0.3) / 0.2)) * (1 + 0.03 * Math.sin((t - at) * 6 + d * 9));
    return `<g transform="translate(${x} 640) scale(${s.toFixed(3)})"><rect x="-160" y="-56" width="320" height="112" rx="30" fill="${c}" stroke="#141414" stroke-width="8" filter="url(#shadow)"/>
      <text data-qa="screen" data-g="pk${label}" x="0" y="16" text-anchor="middle" font-family="Luckiest Guy" font-size="44" fill="#fff" stroke="#141414" stroke-width="7" paint-order="stroke">${label}</text></g>`;
  };
  return btn(540, 'MOTIVATION', '#c9a443', 0) + `<g transform="translate(0 150)">${btn(540, 'DISCIPLINE', '#1f8f84', 0.15)}</g><g transform="translate(0 300)">${btn(540, 'OBSESSION', '#c62828', 0.3)}</g>`;
};

const bull = (k) => ({
  kind: 'bull', id: NAME[k].toLowerCase(), tie: TIE[k],
  path: [{ at: 0, x: LANE[k] - 75, y: 1300, face: 1, scale: 0.5 }],
  moods: k === 0
    ? [{ at: 0, mood: 'excited' }, { at: '3', mood: 'worried' }, { at: '3:quits', mood: 'sad' }]
    : k === 1
      ? [{ at: 0, mood: 'determined' }, { at: '4:goal', mood: 'happy' }]
      : [{ at: 0, mood: 'determined' }, { at: '5', mood: 'angry' }, { at: '6:bigger', mood: 'excited' }],
  looks: [{ at: 0, look: 'cam' }, { at: '2', look: 'upright' }, ...(k === 0 ? [{ at: '3:quits', look: 'down' }] : []), ...(k === 2 ? [{ at: '6:bigger', look: 'upright' }] : [])],
  actions: [
    ...Array.from({ length: 30 }, (_, i) => ({ at: `2+${(i * 0.45).toFixed(2)}`, do: 'grab', dur: 0.3, sfx: false }))
      .filter((a, i) => (k === 0 ? i < 7 : k === 1 ? i < 22 : true)),
    ...(k === 0 ? [{ at: '3:quits', do: 'facepalm', dur: 1.2 }] : []),
    ...(k === 1 ? [{ at: '4:goal', do: 'cheer', dur: 1.4 }] : []),
    ...(k === 2 ? [{ at: '5', do: 'sweat', dur: 2.4 }] : []),
  ],
});

export default {
  id: 'three-minds',
  voice: { name: 'am_fenrir', speed: 1.2, lead: 0.4, gap: 0.22 },
  tail: 2.8,
  narrator: 'discipline',

  lines: [
    { say: 'Three bulls. Same goal: one hundred back tests.',
      caption: '*3 bulls*. Same goal: *100 backtests*.', pauseAfter: 0.3 },
    { say: 'One block for every back test. Motivation starts fast.',
      caption: 'One block for every back test. *Motivation* starts *fast*.', pauseAfter: 0.4 },
    { say: 'Fourteen in, the first losing streak. Motivation quits.',
      caption: '*14* in, the first *losing streak*. Motivation *quits*.', pauseAfter: 0.5 },
    { say: 'Discipline shows up every day. One hundred. Goal complete.',
      caption: '*Discipline* shows up *every day*. *100*. *Goal complete*.', pauseAfter: 0.4 },
    { say: 'Obsession does not stop at one hundred.',
      caption: '*Obsession* does not stop at *100*.', pauseAfter: 0.3 },
    { say: 'A thousand back tests later, it finds a bigger mountain.',
      caption: 'A *thousand* backtests later, it finds a *bigger mountain*.', pauseAfter: 0.5 },
    { say: 'Which one are you? Comment your bull.',
      caption: 'Which one are *you*? *Comment your bull*.' },
  ],

  world: [],

  camera: [
    { at: 0, x: 600, y: 925, zoom: 0.88, push: 0.004 },
    { at: '5', x: 900, y: 0, zoom: 0.45, move: 1.6 },
    { at: '6', x: 1400, y: -2800, zoom: 0.21, move: 2.6 },
  ],

  actors: [0, 1, 2].map(bull),

  props: [
    { type: 'custom', layer: 'back', at: 0, draw: (t, sc) => world(t, sc) },
    { type: 'custom', space: 'screen', at: 0, until: '7', draw: (t, sc) => counters(t, sc) },
    { type: 'title', at: 0.02, until: '2-0.05', text: 'MOTIVATION\nDISCIPLINE *OBSESSION*', y: 560, size: 92, keyColor: '#ef5350', sfx: 'bell' },
    { type: 'title', at: '6:bigger', until: '7-0.05', text: 'A *BIGGER*\nMOUNTAIN', y: 760, size: 110 },
    { type: 'custom', space: 'screen', at: '7', draw: (t, sc, p) => pick(t, p._at) },
    { type: 'title', at: '7', text: 'WHICH ONE\nARE *YOU?*', y: 330, icon: 'comment', sfx: 'ding' },
  ],

  sfx: [
    ...Array.from({ length: 14 }, (_, i) => ({ at: `2+${(i * 0.45).toFixed(2)}`, name: 'tick', gain: 0.5 })),
    { at: '3:quits', name: 'sad', gain: 0.7 },
    { at: '4:goal', name: 'ding', gain: 0.8 },
    { at: '5', name: 'whoosh', gain: 0.7, dur: 1.4 },
    { at: '6:bigger', name: 'thud', gain: 0.9 },
  ],
};
