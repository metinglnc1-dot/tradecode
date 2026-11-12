// Episode: Same candle, 3 timeframes. (idea card 9, Fikirler 2026-11-12)
// No figures. The chart is illustrative: one synthetic 1-minute series (2,880 candles = 2 days),
// aggregated for real into 15-minute and 4-hour candles, so the same red candle sits inside each view.
// small seeded random (same as the engine's), kept local so Node can import this file
function rng(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  let s = h >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const S1 = 8;                 // world width of one 1-minute candle
const N = 2880;               // 2 days of 1-minute candles
const R = 2005;               // index of the scary red candle
const Y0 = 1300;              // world y of the starting price
const WB = 26000, OUT = 27200;

// ---- synthetic 1-minute series: steady uptrend, noise, one sharp red candle ----
const one = [];
{
  const r = rng('tf-series');
  let p = 0;
  for (let i = 0; i < N; i++) {
    let d = 5.2 + (r() - 0.5) * 30;                 // uptrend drift with noise (world px)
    const blk = Math.floor(i / 15), rb = Math.floor(R / 15);
    if (blk === rb) d = -3 + (r() - 0.5) * 8;       // the 15-minute block around it drifts down a little
    if (i === R) d = -72;                           // the red candle
    if (blk === rb + 1) d = 9 + (r() - 0.5) * 10;   // recovery right after
    const o = p, c = p + d;
    one.push({ o, c, h: Math.max(o, c) + r() * 9, l: Math.min(o, c) - r() * 9 });
    p = c;
  }
}
const agg = (k) => {
  const out = [];
  for (let i = 0; i < N; i += k) {
    const g = one.slice(i, i + k);
    out.push({ i, o: g[0].o, c: g[g.length - 1].c, h: Math.max(...g.map((x) => x.h)), l: Math.min(...g.map((x) => x.l)) });
  }
  return out;
};
const LEVELS = [
  { k: 1, data: one.map((c, i) => ({ ...c, i })) },
  { k: 15, data: agg(15) },
  { k: 240, data: agg(240) },
];
const Y = (p) => Y0 - p;
const red = one[R];
const BULL_X = (R - 1) * S1 + S1 / 2, BULL_Y = Y(one[R - 1].h);
const MIDX = (N * S1) / 2, LO = Math.min(...one.map((c) => c.l)), HI = Math.max(...one.map((c) => c.h));

// draw the chart for the current camera, crossfading between 1m / 15m / 4h by zoom
function chart(t, sc) {
  const cam = sc.camera(t);
  const z = cam.zoom, half = 560 / z;
  const lz = Math.log10(z);
  // level weights: 1m above zoom 2, 15m between 0.2 and 2, 4h below 0.2 (smooth over a decade-ish band)
  const sm = (a, b, x) => { const q = Math.max(0, Math.min(1, (x - a) / (b - a))); return q * q * (3 - 2 * q); };
  const w1 = sm(Math.log10(1.2), Math.log10(3), lz);
  const w4 = 1 - sm(Math.log10(0.07), Math.log10(0.2), lz);
  const w15 = Math.max(0, 1 - w1 - w4);
  let s = `<rect x="${cam.x - half * 1.2}" y="${cam.y - 1000 / z}" width="${half * 2.4}" height="${2000 / z}" fill="#0b111b"/>`;
  const G = Math.pow(10, Math.ceil(Math.log10(110 / z)));
  for (let gx = Math.floor((cam.x - half) / G) * G; gx < cam.x + half; gx += G) s += `<line x1="${gx}" x2="${gx}" y1="${cam.y - 1000 / z}" y2="${cam.y + 1000 / z}" stroke="#1d2636" stroke-width="${(2 / z).toFixed(3)}"/>`;
  for (let gy = Math.floor((cam.y - 1000 / z) / G) * G; gy < cam.y + 1000 / z; gy += G) s += `<line x1="${cam.x - half * 1.2}" x2="${cam.x + half * 1.2}" y1="${gy}" y2="${gy}" stroke="#1d2636" stroke-width="${(2 / z).toFixed(3)}"/>`;
  [[LEVELS[0], w1], [LEVELS[1], w15], [LEVELS[2], w4]].forEach(([L, w]) => {
    if (w < 0.02) return;
    const cw = L.k * S1;
    s += `<g opacity="${w.toFixed(3)}">`;
    for (const c of L.data) {
      const x0 = c.i * S1;
      if (x0 + cw < cam.x - half || x0 > cam.x + half) continue;
      const cx = x0 + cw / 2, col = c.c >= c.o ? '#26a69a' : '#ef5350';
      const hot = L.k === 1 && c.i === R;
      s += `<line x1="${cx}" x2="${cx}" y1="${Y(c.h)}" y2="${Y(c.l)}" stroke="${col}" stroke-width="${Math.max(cw * 0.1, 2.5 / z).toFixed(3)}"/>
        <rect x="${(cx - cw * 0.34).toFixed(2)}" y="${Math.min(Y(c.o), Y(c.c))}" width="${(cw * 0.68).toFixed(2)}" height="${Math.max(Math.abs(c.o - c.c), 1.5 / z).toFixed(2)}" fill="${col}"${hot ? ` stroke="#fff" stroke-width="${(3 / z).toFixed(3)}"` : ''}/>`;
    }
    s += '</g>';
  });
  // ring around the red candle so it can be found at every zoom
  const rr = Math.max(60 / z, 10);
  s += `<circle cx="${R * S1 + S1 / 2}" cy="${Y((red.o + red.c) / 2)}" r="${rr.toFixed(2)}" fill="none" stroke="#E4C471" stroke-width="${(5 / z).toFixed(3)}" stroke-dasharray="${(14 / z).toFixed(2)} ${(10 / z).toFixed(2)}" opacity="${(1 - w1).toFixed(2)}"/>`;
  return s;
}

// timeframe pills on screen
const pills = (t, sc) => {
  const at = (a) => sc.tl.at(a);
  const act = t >= at('4:zoom') ? 2 : t >= at('3:zoom') ? 1 : 0;
  return ['1m', '15m', '4h'].map((l, i) => {
    const x = 540 + (i - 1) * 190, on = i === act;
    return `<g transform="translate(${x} 425) scale(${on ? 1.12 : 1})"><rect x="-80" y="-36" width="160" height="72" rx="36" fill="${on ? '#E4C471' : '#141a26'}" stroke="${on ? '#141414' : '#3a4157'}" stroke-width="5"/>
      <text data-qa="screen" data-g="pills" x="0" y="15" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40" fill="${on ? '#141414' : '#8d97a8'}">${l}</text></g>`;
  }).join('');
};

export default {
  id: 'timeframes',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 2.0,
  narrator: 'bull',

  lines: [
    { say: 'This red candle looks like a crash.',
      caption: 'This *red candle* looks like a *crash*.' },
    { say: 'On the one minute chart, it is.',
      caption: 'On the *1 minute* chart, it is.', pauseAfter: 0.3 },
    { say: "Zoom out to fifteen minutes. It's a small dip.",
      caption: "Zoom out to *15 minutes*. It's a *small dip*.", pauseAfter: 0.3 },
    { say: "Zoom out to four hours. It's barely a wiggle in an uptrend.",
      caption: "Zoom out to *4 hours*. It's barely a *wiggle* in an *uptrend*.", pauseAfter: 0.5 },
    { say: 'Zoomed in, every wiggle feels like danger.',
      caption: 'Zoomed in, every *wiggle* feels like *danger*.', pauseAfter: 0.35 },
    { say: 'Use the big timeframe for direction. The small one only for entries.',
      caption: 'Use the *big* timeframe for *direction*. The *small* one only for *entries*.' },
    { say: "And pick one main timeframe. Stick to it, even when it's boring.",
      caption: "And pick *one main* timeframe. *Stick* to it, even when it's *boring*.", pauseAfter: 0.35 },
    { say: 'Which timeframe do you trade? Comment it.',
      caption: 'Which timeframe do *you* trade? *Comment it*.' },
  ],

  world: [
    { set: 'whiteboard', x: WB },
    { set: 'outdoor', x: OUT },
  ],

  camera: [
    { at: 0, x: R * S1, y: Y(red.o) + 30, zoom: 5, push: 0.01 },
    { at: '3:zoom>+0.6', x: R * S1, y: Y(red.c) - 40, zoom: 0.5, move: 1.0, ease: 'out', push: 0.01 },
    { at: '4:zoom>+0.7', x: MIDX, y: Y((LO + HI) / 2) - 300, zoom: 0.042, move: 1.2, ease: 'out', push: 0.01 },
    { at: '5:zoomed>+0.5', x: R * S1, y: Y(red.o) + 30, zoom: 5, move: 1.0, ease: 'in' },
    { at: '6+0.15', x: WB + 600, y: 956, zoom: 0.96, move: 0.8 },
    { at: '8+0.15', x: OUT + 600, y: 953, zoom: 0.95, move: 0.8 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: BULL_X, y: BULL_Y, face: 1, scale: 0.1 },
      { at: '6+0.15', x: WB + 970, y: 1300, face: -1, scale: 0.82, move: 0.8 },
      { at: '8+0.15', x: OUT + 820, face: -1, scale: 0.92, move: 0.8 },
    ],
    moods: [
      { at: 0, mood: 'shocked' }, { at: '3', mood: 'worried' }, { at: '4', mood: 'happy' }, { at: '5', mood: 'worried' },
      { at: '6', mood: 'determined' }, { at: '7', mood: 'smug' }, { at: '8', mood: 'happy' },
    ],
    looks: [{ at: 0, look: 'downright' }, { at: '2', look: 'cam' }, { at: '5', look: 'downright' }, { at: '6', look: 'left' }, { at: '7', look: 'cam' }],
    actions: [
      { at: 0, do: 'shake', dur: 0.8 },
      { at: 0.2, do: 'sweat', dur: 2.6 },
      { at: '5:danger', do: 'shake', dur: 0.6 },
      { at: '6', do: 'write', dur: 2.6 },
      { at: '7:one', do: 'point', dur: 1.0 },
      { at: '8:comment', do: 'wave', dur: 2.0 },
    ],
  }],

  props: [
    { type: 'custom', layer: 'back', at: 0, until: '6+0.4', draw: (t, sc) => chart(t, sc) },
    { type: 'custom', space: 'screen', at: 0.2, until: '6', draw: (t, sc) => pills(t, sc) },
    { type: 'tag', space: 'screen', at: 0.3, until: '6', x: 880, y: 1110, size: 19, text: 'ILLUSTRATIVE CHART' },
    { type: 'title', at: 0.02, until: '2-0.05', text: 'IS THIS A *CRASH?*', y: 300, size: 120, keyColor: '#ef5350', sfx: 'bell' },
    { type: 'title', at: '3:small', until: '4-0.05', text: 'A *SMALL DIP*', y: 300, size: 120 },
    { type: 'title', at: '4:wiggle', until: '5-0.05', text: 'BARELY A *WIGGLE*', y: 300, size: 110, keyColor: '#26a69a' },

    // whiteboard rules
    { id: 'b1', type: 'write', at: '6:big', x: WB + 110, y: 470, size: 70, keyColor: '#1f8f84', text: 'Big timeframe: *direction*' },
    { id: 'b2', type: 'write', at: '6:small', x: WB + 110, y: 600, size: 70, keyColor: '#d84341', text: 'Small timeframe: *entries*' },
    { id: 'b3', type: 'write', at: '7:pick', x: WB + 110, y: 750, size: 76, keyColor: '#9c7a2e', text: 'ONE *main* timeframe' },
    { type: 'draw', around: 'b3', sub: 'main', at: '7:stick', shape: 'circle', color: '#9c7a2e' },

    // CTA
    { type: 'rules', at: '8', x: OUT + 140, y: 370, w: 920, title: '', gap: 95, size: 50,
      items: [
        { at: '8', text: 'Big timeframe: *direction*' },
        { at: '8+0.15', text: 'Small timeframe: *entries*' },
        { at: '8+0.3', text: 'One *main* timeframe' },
      ] },
    { type: 'title', at: '8:comment', text: '*COMMENT* YOUR TIMEFRAME', y: 300, size: 100, icon: 'comment', sfx: 'ding' },
    { type: 'confetti', at: '8:comment', x: 540, y: 760, n: 100 },
  ],

  sfx: [
    { at: 0.05, name: 'thud', gain: 0.9 },
    { at: '3:zoom', name: 'whoosh', gain: 0.8, dur: 1.0 },
    { at: '4:zoom', name: 'whoosh', gain: 0.8, dur: 1.2 },
    { at: '5:zoomed', name: 'whoosh', gain: 0.7, dur: 1.0 },
  ],
};
