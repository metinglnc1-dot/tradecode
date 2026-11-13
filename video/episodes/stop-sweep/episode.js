// Episode: Why price hits your stop, then turns. (idea card 6, Fikirler 2026-11-13)
// Equal lows collect stops (liquidity); price can sweep them and turn, but not every sweep is a reversal.
// Stop beyond the structure, position smaller for the same risk. Chart is illustrative, no buy or sell call.
// Product (2 of 2): Liquidity Sweeps indicator, caption only. No other brand characters.
const CL = 0, CH = 1500, WB = 2700, END = 3900;
const G = '#26a69a', Rd = '#ef5350';
// candles: [bodyTop, bodyBottom, wickTop, wickBottom, up]
const BARS = [
  [860, 960, 840, 990, 0], [960, 1030, 950, 1050, 0], [950, 1030, 930, 1046, 1], [900, 950, 880, 960, 1],
  [900, 980, 890, 1000, 0], [980, 1035, 975, 1050, 0], [990, 1030, 980, 1047, 1],
  [985, 1005, 975, 1150, 1], // the sweep
  [900, 990, 885, 1000, 1], [820, 900, 805, 910, 1], [760, 820, 740, 830, 1],
];
const BX = (i) => CH + 110 + i * 92;
const FLAGS = Array.from({ length: 9 }, (_, k) => [BX(1) + k * 56 - 10, 1070 + (k % 3) * 14]);

const bar = (i, b, o = 1, ghost = false) => {
  const [t0, b0, wt, wb, up] = b, x = BX(i), col = up ? G : Rd;
  return ghost
    ? `<g opacity="${o}"><line x1="${x}" x2="${x}" y1="${wt}" y2="${wb}" stroke="${Rd}" stroke-width="6" stroke-dasharray="10 8"/><rect x="${x - 30}" y="${t0}" width="60" height="${b0 - t0}" rx="6" fill="none" stroke="${Rd}" stroke-width="6" stroke-dasharray="12 8"/></g>`
    : `<g opacity="${o}"><line x1="${x}" x2="${x}" y1="${wt}" y2="${wb}" stroke="${col}" stroke-width="8" stroke-linecap="round"/><rect x="${x - 30}" y="${t0}" width="60" height="${Math.max(8, b0 - t0)}" rx="6" fill="${col}"/></g>`;
};
const flag = (x, y, c = Rd) => `<line x1="${x}" x2="${x}" y1="${y}" y2="${y + 46}" stroke="#d9d2c3" stroke-width="4"/><path d="M${x} ${y} L ${x + 30} ${y + 9} L ${x} ${y + 18} Z" fill="${c}"/>`;

const chartScene = (t, sc) => {
  const at = (a) => sc.tl.at(a);
  const sweep = at('3:takes'), turn = at('3:turns');
  let s = '';
  BARS.slice(0, 7).forEach((b, i) => { s += bar(i, b); });
  // equal lows line
  const eq = Math.min(1, Math.max(0, (t - at('2:equal')) / 0.4));
  s += `<line x1="${BX(1) - 40}" x2="${BX(1) - 40 + (BX(6) - BX(1) + 120) * eq}" y1="1050" y2="1050" stroke="#E4C471" stroke-width="5" stroke-dasharray="16 10"/>`;
  if (eq > 0) s += `<text data-qa="world" data-g="eq" x="${BX(0) - 30}" y="1180" font-family="Inter" font-weight="900" font-size="34" fill="#E4C471" opacity="${eq.toFixed(2)}">EQUAL LOWS</text>`;
  // the stops
  const fs = Math.min(1, Math.max(0, (t - at('2:everyone')) / 0.5));
  FLAGS.forEach(([x, y], k) => {
    const q = Math.min(1, Math.max(0, fs * 9 - k));
    if (q <= 0) return;
    const gone = Math.max(0, (t - sweep - k * 0.03) / 0.6);
    s += `<g transform="translate(0 ${(gone * gone * 300).toFixed(1)}) rotate(${(gone * 60).toFixed(1)} ${x} ${y})" opacity="${Math.max(0, 1 - gone).toFixed(2)}">${flag(x, y)}</g>`;
  });
  if (fs > 0 && t < sweep + 0.3) s += `<text data-qa="world" data-g="stops" x="${BX(3) + 20}" y="1250" text-anchor="middle" font-family="Inter" font-weight="900" font-size="34" fill="${Rd}" opacity="${Math.min(fs, Math.max(0, (sweep + 0.3 - t) / 0.3)).toFixed(2)}">STOPS</text>`;
  // the sweep candle grows down then closes back up
  if (t >= sweep - 0.4) {
    const q = Math.min(1, (t - sweep + 0.4) / 0.5), back = Math.min(1, Math.max(0, (t - sweep - 0.2) / 0.4));
    const [t0, b0, wt, wb] = BARS[7], low = 1047 + (wb - 1047) * q;
    const x = BX(7);
    s += `<line x1="${x}" x2="${x}" y1="${wt}" y2="${low}" stroke="${back > 0.5 ? G : Rd}" stroke-width="8" stroke-linecap="round"/>
      <rect x="${x - 30}" y="${t0}" width="60" height="${(b0 - t0).toFixed(1)}" rx="6" fill="${back > 0.5 ? G : Rd}"/>`;
    s += `<circle cx="${x}" cy="1150" r="${(46 * q).toFixed(1)}" fill="none" stroke="#E4C471" stroke-width="6" opacity="${(q * 0.9).toFixed(2)}"/>`;
  }
  // after: the turn
  [8, 9, 10].forEach((i, k) => { const o = Math.min(1, Math.max(0, (t - turn - k * 0.25) / 0.3)); if (o > 0) s += bar(i, BARS[i], o); });
  // not every sweep turns
  const g = Math.min(1, Math.max(0, (t - at('4')) / 0.4)) * Math.max(0, Math.min(1, (at('5') - t) / 0.3));
  if (g > 0) {
    s += bar(8, [1150, 1190, 1140, 1200, 0], g.toFixed(2), true) + bar(9, [1190, 1240, 1180, 1250, 0], g.toFixed(2), true);
    s += `<text data-qa="world" data-g="alt" x="${BX(9) + 40}" y="1120" text-anchor="end" font-family="Inter" font-weight="900" font-size="30" fill="${Rd}" opacity="${g.toFixed(2)}">OR IT KEEPS GOING</text>`;
  }
  return s;
};

// cliff edge lined with stop flags
const cliff = (t) => {
  let s = `<path d="M${CL + 640} 1300 L ${CL + 1500} 1300 L ${CL + 1500} 2600 L ${CL + 700} 2600 Z" fill="#05070c"/>
    <path d="M${CL - 400} 1300 L ${CL + 660} 1300 L ${CL + 700} 1340 L ${CL + 680} 2600 L ${CL - 400} 2600 Z" fill="#3b4a35"/>
    <rect x="${CL - 400}" y="1290" width="1060" height="18" fill="#56704b"/>`;
  for (let k = 0; k < 14; k++) {
    const x = CL + 420 + (k % 7) * 34, y = 1236 - Math.floor(k / 7) * 26 + Math.sin(t * 3 + k) * 2;
    s += flag(x, y);
  }
  return s;
};

export default {
  id: 'stop-sweep',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: 'Why does price hit your stop, then go your way?',
      caption: 'Why does price hit your *stop*, then go *your way*?', pauseAfter: 0.3 },
    { say: 'Two equal lows. Everyone puts the stop just below them.',
      caption: 'Two *equal lows*. Everyone puts the *stop* just below them.', pauseAfter: 0.2 },
    { say: 'That pile of stops is liquidity. Price dips, takes it, and turns. That is a sweep.',
      caption: 'That pile of stops is *liquidity*. Price dips, *takes it*, and *turns*. That is a *sweep*.', pauseAfter: 0.3 },
    { say: 'But not every sweep turns. Wait for confirmation.',
      caption: 'But not every sweep *turns*. Wait for *confirmation*.', pauseAfter: 0.3 },
    { say: 'Put the stop a bit beyond the structure, and make the position smaller for the same risk.',
      caption: 'Put the stop a bit *beyond* the structure, and make the position *smaller* for the *same risk*.', pauseAfter: 0.3 },
    { say: 'Do not put your stop where everyone else does.',
      caption: 'Do not put your stop where *everyone else* does.', pauseAfter: 0.2 },
    { say: 'Save this before your next stop gets taken.',
      caption: '*Save this* before your next stop gets *taken*.' },
  ],

  world: [
    { set: 'outdoor', x: CL },
    { set: 'chartscape', x: CH, opts: { small: [] } },
    { set: 'whiteboard', x: WB },
    { set: 'outdoor', x: END },
  ],

  camera: [
    { at: 0, x: CL + 560, y: 953, zoom: 0.95, push: 0.01 },
    { at: '2', x: CH + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.003 },
    { at: '5+0.1', x: WB + 610, y: 956, zoom: 0.95, move: 0.8, push: 0.002 },
    { at: '6+0.1', x: END + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.004 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: CL + 160, y: 1300, face: 1, scale: 0.75 },
      { at: 0.6, x: CL + 330, move: 1.2 },
      { at: '2', x: CH + 1010, face: -1, scale: 0.7, move: 0.8 },
      { at: '5+0.1', x: WB + 970, face: -1, scale: 0.82, move: 0.8 },
      { at: '6+0.1', x: END + 820, face: -1, scale: 0.92, move: 0.8 },
    ],
    moods: [
      { at: 0, mood: 'worried' }, { at: '1:your', mood: 'angry' }, { at: '2', mood: 'think' }, { at: '3:takes', mood: 'shocked' },
      { at: '3:sweep', mood: 'smug' }, { at: '4', mood: 'think' }, { at: '5', mood: 'determined' }, { at: '7', mood: 'happy' },
    ],
    looks: [{ at: 0, look: 'right' }, { at: '1:your', look: 'cam' }, { at: '2', look: 'left' }, { at: '6', look: 'cam' }],
    actions: [
      { at: 0.3, do: 'sweat', dur: 1.4 },
      { at: '2:everyone', do: 'point', dur: 1.2 },
      { at: '3:takes', do: 'shake', dur: 0.4 },
      { at: '4:wait', do: 'tilt', dur: 1.2, deg: 10 },
      { at: '5', do: 'write', dur: 3.2 },
      { at: '6:everyone', do: 'shake', dur: 0.5 },
      { at: '7:save', do: 'jump', h: 140 }, { at: '7:save+0.1', do: 'cheer', dur: 1.2 },
    ],
  }],

  props: [
    { type: 'custom', layer: 'back', at: 0, until: '2+0.6', draw: (t) => cliff(t) },
    { type: 'title', at: 0.02, until: '2-0.05', text: 'STOPPED OUT,\nTHEN IT *TURNS?*', y: 330, sfx: 'bell' },
    { type: 'custom', layer: 'back', at: '1>', until: '5+0.6', draw: (t, sc) => chartScene(t, sc) },
    { type: 'tag', space: 'screen', at: '2', until: '5', x: 540, y: 1163, size: 16, text: 'ILLUSTRATIVE CHART  NOT A TRADE SIGNAL' },
    { type: 'title', at: '3:liquidity', until: '3:sweep-0.05', text: '*LIQUIDITY*', y: 300, size: 120 },
    { type: 'title', at: '3:sweep', until: '4-0.05', text: 'THE *SWEEP*', y: 300, size: 120 },
    { type: 'title', at: '4', until: '5-0.05', text: 'WAIT FOR\n*CONFIRMATION*', y: 330 },

    // whiteboard
    { id: 'w1', type: 'write', at: '5:stop', dur: 0.7, x: WB + 120, y: 460, size: 62, maxW: 790, keyColor: '#1f8f84', text: 'Stop *beyond* structure' },
    { id: 'w2', type: 'write', at: '5:smaller', dur: 0.7, x: WB + 120, y: 590, size: 62, maxW: 790, keyColor: '#1f8f84', text: 'Wider stop = *smaller* size' },
    { id: 'w3', type: 'write', at: '5:same', dur: 0.7, x: WB + 120, y: 720, size: 54, maxW: 790, color: '#5b6680', text: 'Size = risk ÷ stop distance' },
    { type: 'draw', around: 'w2', sub: 'smaller', at: '5:risk', shape: 'underline' },

    // CTA
    { type: 'title', at: '6', until: '7:save-0.05', text: 'NOT WHERE\n*EVERYONE* IS', y: 330 },
    { type: 'custom', layer: 'back', at: '6', draw: (t, sc, p) => {
      const o = Math.min(1, (t - p._at) / 0.4);
      let s = '';
      for (let k = 0; k < 10; k++) s += flag(END + 160 + (k % 5) * 30, 1236 - Math.floor(k / 5) * 26);
      return `<g opacity="${o.toFixed(2)}">${s}${flag(END + 470, 1180, '#26a69a')}</g>`;
    } },
    { type: 'title', at: '7:save', text: '*SAVE THIS*', y: 300, size: 120, icon: 'bookmark', sfx: 'ding' },
  ],

  sfx: [
    { at: '3:takes', name: 'whoosh', gain: 0.7, dur: 0.6 }, { at: '3:turns', name: 'pop', gain: 0.8 },
    { at: '4', name: 'thud', gain: 0.7 },
  ],
};
