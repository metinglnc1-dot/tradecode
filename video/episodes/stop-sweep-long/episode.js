// Long TikTok version (about 65 s) of idea card 6: why price hits your stop, then turns.
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
  const sweep = at('5:takes'), turn = at('5:turns');
  let s = '';
  BARS.slice(0, 7).forEach((b, i) => { s += bar(i, b); });
  // equal lows line
  const eq = Math.min(1, Math.max(0, (t - at('2:equal')) / 0.4));
  const tg = (a) => Math.min(1, Math.max(0, (t - at(a)) / 0.35));
  s += `<line x1="${CH + 40}" x2="${CH + 40 + (BX(6) - CH + 80) * eq}" y1="1050" y2="1050" stroke="#E4C471" stroke-width="5" stroke-dasharray="16 10"/>`;
  if (eq > 0) s += `<g opacity="${eq.toFixed(2)}"><text data-qa="world" data-g="eq" x="${CH + 40}" y="1092" font-family="Inter" font-weight="900" font-size="28" fill="#E4C471">EQUAL</text><text data-qa="world" data-g="eq" x="${CH + 40}" y="1126" font-family="Inter" font-weight="900" font-size="28" fill="#E4C471">LOWS</text></g>`;
  // the stops
  const fs = Math.min(1, Math.max(0, (t - at('2:most')) / 0.5));
  FLAGS.forEach(([x, y], k) => {
    const q = Math.min(1, Math.max(0, fs * 9 - k));
    if (q <= 0) return;
    const gone = Math.max(0, (t - sweep - k * 0.03) / 0.6);
    s += `<g transform="translate(0 ${(gone * gone * 300).toFixed(1)}) rotate(${(gone * 60).toFixed(1)} ${x} ${y})" opacity="${Math.max(0, 1 - gone).toFixed(2)}">${flag(x, y)}</g>`;
  });
  if (fs > 0 && t < sweep + 0.3) s += `<text data-qa="world" data-g="stops" x="${BX(3) + 20}" y="1168" text-anchor="middle" font-family="Inter" font-weight="900" font-size="34" fill="${Rd}" opacity="${Math.min(fs, Math.max(0, (sweep + 0.3 - t) / 0.3)).toFixed(2)}">STOPS</text>`;
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
  const g = Math.min(1, Math.max(0, (t - at('6')) / 0.4)) * Math.max(0, Math.min(1, (at('7') - t) / 0.3));
  if (g > 0) {
    s += bar(8, [1150, 1190, 1140, 1200, 0], g.toFixed(2), true) + bar(9, [1190, 1240, 1180, 1250, 0], g.toFixed(2), true);
    s += `<text data-qa="world" data-g="alt" x="${BX(9) + 40}" y="1120" text-anchor="end" font-family="Inter" font-weight="900" font-size="30" fill="${Rd}" opacity="${g.toFixed(2)}">OR IT KEEPS GOING</text>`;
  }
  const hi = tg('3:highs');
  if (hi > 0 && t < at('5')) s += `<g opacity="${hi.toFixed(2)}"><line x1="${BX(0) - 40}" x2="${BX(6) + 60}" y1="880" y2="880" stroke="#9fb4ff" stroke-width="5" stroke-dasharray="16 10"/>
    ${Array.from({ length: 6 }, (_, k) => `<g transform="translate(0 -64)">${flag(BX(1) + k * 64, 790, '#5c7cfa')}</g>`).join('')}
    <text data-qa="world" data-g="eqh" x="${BX(6) + 60}" y="700" text-anchor="end" font-family="Inter" font-weight="900" font-size="32" fill="#9fb4ff">EQUAL HIGHS</text></g>`;
  const cb = tg('7:close') * Math.max(0, Math.min(1, (at('8') - t) / 0.3 + 1));
  if (t >= at('7:close') && t < at('9')) s += `<g opacity="${cb.toFixed(2)}"><rect x="${BX(7) - 46}" y="960" width="92" height="70" rx="10" fill="none" stroke="#E4C471" stroke-width="6"/>
    <text data-qa="world" data-g="cb" x="${BX(7)}" y="1260" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="#E4C471">CLOSE BACK INSIDE</text></g>`;
  const bos = tg('8:break');
  if (bos > 0 && t < at('9')) s += `<g opacity="${bos.toFixed(2)}"><line x1="${BX(6) - 30}" x2="${BX(8) + 40}" y1="980" y2="980" stroke="#26a69a" stroke-width="6"/>
    <text data-qa="world" data-g="bos" x="${BX(8) + 50}" y="968" font-family="Inter" font-weight="900" font-size="30" fill="#26a69a">BREAK</text></g>`;
  const sb = tg('9:beyond');
  if (sb > 0) s += `<g opacity="${sb.toFixed(2)}"><line x1="${BX(5)}" x2="${BX(9) + 40}" y1="1185" y2="1185" stroke="#ef5350" stroke-width="6" stroke-dasharray="18 10"/>
    <text data-qa="world" data-g="sb" x="${BX(5)}" y="1235" font-family="Inter" font-weight="900" font-size="30" fill="#ef5350">STOP BEYOND THE SWEEP</text></g>`;
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
  id: 'stop-sweep-long',
  voice: { name: 'am_fenrir', speed: 1.15, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: 'Why does price hit your stop, then go your way?',
      caption: 'Why does price hit your *stop*, then go *your way*?', pauseAfter: 0.3 },
    { say: 'Look at these two equal lows. Most traders put the stop just below them.',
      caption: 'Look at these two *equal lows*. Most traders put the *stop* just below them.', pauseAfter: 0.2 },
    { say: 'Equal highs work the same way. Short sellers put their stops just above.',
      caption: 'Equal *highs* work the same way. Short sellers put their stops just *above*.', pauseAfter: 0.2 },
    { say: 'That pile of stops is liquidity. The idea is that big orders need it to fill.',
      caption: 'That pile of stops is *liquidity*. The idea is that *big orders* need it to fill.', pauseAfter: 0.3 },
    { say: 'Price dips, takes the stops, and turns. That is a sweep.',
      caption: 'Price dips, *takes* the stops, and *turns*. That is a *sweep*.', pauseAfter: 0.3 },
    { say: 'But not every sweep turns. Sometimes price just keeps going.',
      caption: 'But not every sweep *turns*. Sometimes price just *keeps going*.', pauseAfter: 0.3 },
    { say: 'So wait for confirmation. A close back inside the range is a start.',
      caption: 'So wait for *confirmation*. A *close back inside* the range is a start.', pauseAfter: 0.2 },
    { say: 'Then a break of the last small high, on a lower timeframe.',
      caption: 'Then a *break* of the last small high, on a *lower timeframe*.', pauseAfter: 0.3 },
    { say: 'Put the stop beyond the sweep, not right under the obvious low.',
      caption: 'Put the stop *beyond* the sweep, not right under the *obvious* low.', pauseAfter: 0.3 },
    { say: 'A wider stop means a smaller position, so the dollar risk stays the same.',
      caption: 'A *wider stop* means a *smaller position*, so the *dollar risk* stays the same.', pauseAfter: 0.3 },
    { say: 'Keep the risk per trade small. Even a good read is wrong some of the time.',
      caption: 'Keep the *risk per trade* small. Even a good read is *wrong* some of the time.', pauseAfter: 0.3 },
    { say: 'Write every sweep you see in your journal. Did it turn, or keep going?',
      caption: 'Write every sweep you see in your *journal*. Did it *turn*, or *keep going*?', pauseAfter: 0.3 },
    { say: 'After fifty examples, you will know how it behaves on your market.',
      caption: 'After *50 examples*, you will know how it behaves on *your market*.', pauseAfter: 0.3 },
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
    { at: '3', x: CH + 560, y: 900, zoom: 0.95, move: 0.6, push: 0 },
    { at: '5', x: CH + 640, y: 953, zoom: 0.95, move: 0.6, push: 0.003 },
    { at: '7', x: CH + 700, y: 976, zoom: 1.02, move: 0.6, push: 0 },
    { at: '9', x: CH + 640, y: 970, zoom: 1.0, move: 0.6, push: 0 },
    { at: '10+0.1', x: WB + 610, y: 956, zoom: 0.95, move: 0.8, push: 0.002 },
    { at: '14+0.1', x: END + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.004 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: CL + 160, y: 1300, face: 1, scale: 0.75 },
      { at: 0.6, x: CL + 330, move: 1.2 },
      { at: '2', x: CH + 1010, face: -1, scale: 0.7, move: 0.8 },
      { at: '10+0.1', x: WB + 970, face: -1, scale: 0.82, move: 0.8 },
      { at: '14+0.1', x: END + 820, face: -1, scale: 0.92, move: 0.8 },
    ],
    moods: [
      { at: 0, mood: 'worried' }, { at: '1:your', mood: 'angry' }, { at: '2', mood: 'think' }, { at: '5:takes', mood: 'shocked' },
      { at: '5:sweep', mood: 'smug' }, { at: '6', mood: 'think' }, { at: '9', mood: 'determined' }, { at: '15', mood: 'happy' },
    ],
    looks: [{ at: 0, look: 'right' }, { at: '1:your', look: 'cam' }, { at: '2', look: 'left' }, { at: '14', look: 'cam' }],
    actions: [
      { at: 0.3, do: 'sweat', dur: 1.4 },
      { at: '2:most', do: 'point', dur: 1.2 },
      { at: '5:takes', do: 'shake', dur: 0.4 }, { at: '3:highs', do: 'point', dur: 1.0 },
      { at: '7:wait', do: 'tilt', dur: 1.2, deg: 10 }, { at: '9:beyond', do: 'point', dur: 1.0 },
      { at: '10', do: 'write', dur: 3.2 },
      { at: '14:everyone', do: 'shake', dur: 0.5 }, { at: '12', do: 'write', dur: 3.0 },
      { at: '15:save', do: 'jump', h: 140 }, { at: '15:save+0.1', do: 'cheer', dur: 1.2 },
    ],
  }],

  props: [
    { type: 'custom', layer: 'back', at: 0, until: '2+0.6', draw: (t) => cliff(t) },
    { type: 'title', at: 0.02, until: '2-0.05', text: 'STOPPED OUT,\nTHEN IT *TURNS?*', y: 330, sfx: 'bell' },
    { type: 'custom', layer: 'back', at: '1>', until: '10+0.6', draw: (t, sc) => chartScene(t, sc) },
    { type: 'tag', space: 'screen', at: '2', until: '10', x: 540, y: 1163, size: 16, text: 'ILLUSTRATIVE CHART  NOT A TRADE SIGNAL' },
    { type: 'title', at: '4:liquidity', until: '5-0.05', text: '*LIQUIDITY*', y: 300, size: 120 },
    { type: 'title', at: '5:sweep', until: '6-0.05', text: 'THE *SWEEP*', y: 300, size: 120 },
    { type: 'title', at: '6', until: '7-0.05', text: 'OR IT *KEEPS GOING*', y: 300, size: 110, keyColor: '#ef5350' },
    { type: 'title', at: '7', until: '9-0.05', text: 'WAIT FOR\n*CONFIRMATION*', y: 330 },
    { type: 'title', at: '9', until: '10-0.05', text: 'STOP *BEYOND*\nTHE SWEEP', y: 330 },

    // whiteboard
    { id: 'w1', type: 'write', at: '10', until: '12', dur: 0.7, x: WB + 120, y: 460, size: 62, maxW: 790, keyColor: '#1f8f84', text: 'Stop *beyond* structure' },
    { id: 'w2', type: 'write', at: '10:smaller', until: '12', dur: 0.7, x: WB + 120, y: 590, size: 62, maxW: 790, keyColor: '#1f8f84', text: 'Wider stop = *smaller* size' },
    { id: 'w3', type: 'write', at: '10:same', until: '12', dur: 0.7, x: WB + 120, y: 720, size: 54, maxW: 790, color: '#5b6680', text: 'Size = risk ÷ stop distance' },
    { type: 'draw', around: 'w2', sub: 'smaller', at: '10:risk', until: '12', shape: 'underline' },
    { id: 'w4', type: 'write', at: '11:small', until: '12', dur: 0.6, x: WB + 120, y: 850, size: 58, maxW: 790, keyColor: '#d84341', text: 'Small *risk* per trade' },
    { id: 'w5', type: 'write', at: '12:journal', dur: 0.6, x: WB + 120, y: 460, size: 62, maxW: 790, keyColor: '#1f8f84', text: 'Sweep journal:' },
    { id: 'w6', type: 'write', at: '12:turn', dur: 0.5, x: WB + 160, y: 580, size: 58, maxW: 760, keyColor: '#1f8f84', text: 'Did it *turn*?' },
    { id: 'w7', type: 'write', at: '12:keep', dur: 0.5, x: WB + 160, y: 690, size: 58, maxW: 760, keyColor: '#d84341', text: 'Or *keep going*?' },
    { id: 'w8', type: 'write', at: '13:50', dur: 0.6, x: WB + 120, y: 830, size: 62, maxW: 790, keyColor: '#9c7a2e', text: 'After *50* examples' },

    // CTA
    { type: 'title', at: '14', until: '15:save-0.05', text: 'NOT WHERE\n*EVERYONE* IS', y: 330 },
    { type: 'custom', layer: 'back', at: '14', draw: (t, sc, p) => {
      const o = Math.min(1, (t - p._at) / 0.4);
      let s = '';
      for (let k = 0; k < 10; k++) s += flag(END + 160 + (k % 5) * 30, 1236 - Math.floor(k / 5) * 26);
      return `<g opacity="${o.toFixed(2)}">${s}${flag(END + 470, 1180, '#26a69a')}</g>`;
    } },
    { type: 'title', at: '15:save', text: '*SAVE THIS*', y: 300, size: 120, icon: 'bookmark', sfx: 'ding' },
  ],

  sfx: [
    { at: '5:takes', name: 'whoosh', gain: 0.7, dur: 0.6 }, { at: '5:turns', name: 'pop', gain: 0.8 },
    { at: '6', name: 'thud', gain: 0.7 }, { at: '8:break', name: 'pop', gain: 0.6 },
  ],
};
