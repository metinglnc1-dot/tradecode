// Episode: 3 sessions. 3 personalities. (idea card 5, Fikirler 2026-11-13)
// v2 (17 Nov 2026): no hours anywhere. The chart is drawn in the look of our ICT Killzones indicator
// (from the user's screenshot): each session is a box from its own high to its own low, thin coloured border,
// translucent fill, dashed lines running right from the top and bottom edges, and an arrow-tag label.
// The price path is illustrative. Product (1 of 2): ICT Killzones Sessions Indicator, caption only.
const CLK = 0, CH = 1300;
const HX = (h) => CH + 100 + (h - 18) * 130; // 18:00 (previous day) to 12:00 = 18 hours
const ZONES = [
  { name: 'Asia', h0: 20, h1: 24, line: '#8f7a32', fill: '#8f7a32', tag: '#6e5a24', ink: '#f3e7c4' },
  { name: 'London', h0: 26, h1: 29, line: '#e9a3bd', fill: '#e9a3bd', tag: '#c97d99', ink: '#ffffff' },
  { name: 'New York', h0: 31, h1: 34, line: '#4caf72', fill: '#4caf72', tag: '#3f8f5f', ink: '#ffffff' },
];
// illustrative price path, one point per half hour (y in world units, lower is higher price)
const PATH = (() => {
  const pts = [];
  for (let k = 0; k <= 36; k++) {
    const h = 18 + k / 2;
    let y;
    if (h < 20) y = 1000 + Math.sin(k * 1.7) * 30;
    else if (h < 24) y = 1010 + Math.sin(k * 2.3) * 32; // tight Asia range 978..1042
    else if (h < 26) y = 1015 + Math.sin(k) * 15;
    else if (h < 27.5) y = 1015 + (h - 26) * 70; // London dips under the Asia low
    else if (h < 29) y = 1120 - (h - 27.5) * 90;
    else if (h < 31) y = 985 + Math.sin(k * 1.3) * 18;
    else if (h < 34) y = 985 - (h - 31) * 120 + Math.sin(k * 2.1) * 25; // New York: the big move
    else y = 640 + Math.sin(k * 1.9) * 30;
    pts.push([HX(h), 820 + (y - 980) * 2.6]);
  }
  return pts;
})();

const clocks = (t) => {
  let s = `<rect x="${CLK - 300}" y="-900" width="1800" height="2200" fill="#1c2236"/>
    ${Array.from({ length: 10 }, (_, i) => `<rect x="${CLK - 300 + i * 180}" y="-900" width="90" height="2200" fill="#fff" opacity="0.025"/>`).join('')}
    <rect x="${CLK - 300}" y="1300" width="1800" height="1400" fill="#141826"/><rect x="${CLK - 300}" y="1290" width="1800" height="14" fill="#0b0e17"/>
    <rect x="${CLK + 70}" y="560" width="1060" height="16" rx="6" fill="#4a3526"/>`;
  [['TOKYO', '#5c7cfa', 0.9], ['LONDON', '#26a69a', 2.3], ['NEW YORK', '#E4C471', 4.1]].forEach(([n, c, ph], k) => {
    const x = CLK + 250 + k * 350, y = 760, a = t * 0.6 + ph, b = t * 0.05 + ph * 2;
    s += `<circle cx="${x}" cy="${y}" r="130" fill="#f4efe2" stroke="${c}" stroke-width="16"/>
      ${Array.from({ length: 12 }, (_, i) => { const r = (i / 12) * Math.PI * 2; return `<line x1="${(x + Math.sin(r) * 100).toFixed(1)}" y1="${(y - Math.cos(r) * 100).toFixed(1)}" x2="${(x + Math.sin(r) * 116).toFixed(1)}" y2="${(y - Math.cos(r) * 116).toFixed(1)}" stroke="#3a3f52" stroke-width="6"/>`; }).join('')}
      <line x1="${x}" y1="${y}" x2="${(x + Math.sin(b) * 60).toFixed(1)}" y2="${(y - Math.cos(b) * 60).toFixed(1)}" stroke="#141414" stroke-width="10" stroke-linecap="round"/>
      <line x1="${x}" y1="${y}" x2="${(x + Math.sin(a) * 92).toFixed(1)}" y2="${(y - Math.cos(a) * 92).toFixed(1)}" stroke="#141414" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${x}" cy="${y}" r="10" fill="${c}"/>
      <rect x="${x - 120}" y="920" width="240" height="64" rx="14" fill="${c}"/>
      <text data-qa="world" data-g="ck${k}" x="${x}" y="966" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${n.length > 6 ? 32 : 38}" fill="#141414">${n}</text>`;
  });
  return s;
};

// candles built from the path: one every 20 world units
const CANDLES = (() => {
  const out = [];
  const yAt = (x) => {
    for (let i = 1; i < PATH.length; i++) if (PATH[i][0] >= x) {
      const [x0, y0] = PATH[i - 1], [x1, y1] = PATH[i], q = (x - x0) / (x1 - x0);
      return y0 + (y1 - y0) * q;
    }
    return PATH[PATH.length - 1][1];
  };
  let prev = yAt(PATH[0][0]), seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let x = PATH[0][0]; x <= PATH[PATH.length - 1][0]; x += 20) {
    const c = yAt(x) + (rnd() - 0.5) * 70, o = prev;
    out.push({ x, o, c, hi: Math.min(o, c) - rnd() * 34, lo: Math.max(o, c) + rnd() * 34 });
    prev = c;
  }
  return out;
})();

const day = (t, sc) => {
  let s = `<rect x="${CH - 300}" y="-900" width="3200" height="2200" fill="#0f0f10"/>
    ${Array.from({ length: 32 }, (_, i) => `<line x1="${CH - 300 + i * 100}" x2="${CH - 300 + i * 100}" y1="-900" y2="1300" stroke="#1d1d20" stroke-width="2"/>`).join('')}
    ${Array.from({ length: 22 }, (_, i) => `<line x1="${CH - 300}" x2="${CH + 2900}" y1="${-900 + i * 100}" y2="${-900 + i * 100}" stroke="#1d1d20" stroke-width="2"/>`).join('')}
    <rect x="${CH - 300}" y="1300" width="3200" height="1400" fill="#0a0a0b"/>`;
  // candles draw themselves as the camera moves along the day
  // each line draws its own session: Asia during line 2, London during line 3, New York during line 4
  const seg = [['2', HX(18), '3', HX(25)], ['3', HX(25), '4', HX(30.2)], ['4', HX(30.2), '4>', HX(36)]];
  let xs = HX(18);
  for (const [a0, xa, b0, xb] of seg) {
    const ta = sc.tl.at(a0), tb = sc.tl.at(b0);
    if (t >= ta) xs = xa + (xb - xa) * Math.min(1, (t - ta) / (tb - ta));
  }
  const shown = CANDLES.filter((c) => c.x <= xs);
  if (shown.length < 2) shown.push(CANDLES[0], CANDLES[1]);
  // session boxes: from the session's own high to its own low, growing with the candles
  let tags = '';
  ZONES.forEach((z) => {
    const x0 = HX(z.h0), x1 = HX(z.h1);
    const inside = shown.filter((c) => c.x >= x0 && c.x <= x1);
    if (!inside.length) return;
    const top = Math.min(...inside.map((c) => c.hi)), bot = Math.max(...inside.map((c) => c.lo));
    const right = Math.min(x1, inside[inside.length - 1].x + 10);
    s += `<rect x="${x0}" y="${top.toFixed(1)}" width="${(right - x0).toFixed(1)}" height="${(bot - top).toFixed(1)}" fill="${z.fill}" fill-opacity="0.13" stroke="${z.line}" stroke-width="4"/>`;
    if (right >= x1 - 1) {
      const ex = x1 + 120;
      s += `<line x1="${x1}" x2="${ex}" y1="${top.toFixed(1)}" y2="${top.toFixed(1)}" stroke="${z.line}" stroke-width="4" stroke-dasharray="16 12"/>
        <line x1="${x1}" x2="${ex}" y1="${bot.toFixed(1)}" y2="${bot.toFixed(1)}" stroke="${z.line}" stroke-width="4" stroke-dasharray="16 12"/>`;
      const w = z.name.length * 27 + 50, ty = top;
      tags += `<path d="M${ex} ${ty} l 24 -32 h ${w} a 8 8 0 0 1 8 8 v 48 a 8 8 0 0 1 -8 8 h ${-w} Z" fill="${z.tag}" stroke="${z.line}" stroke-width="3"/>
        <text data-qa="world" data-g="tag${z.name}" x="${ex + 24 + w / 2}" y="${ty + 16}" text-anchor="middle" font-family="Inter" font-weight="600" font-size="46" fill="${z.ink}">${z.name}</text>`;
    }
  });
  shown.forEach((c) => {
    const up = c.c < c.o, col = up ? '#26a69a' : '#ef5350';
    s += `<line x1="${c.x}" x2="${c.x}" y1="${c.hi.toFixed(1)}" y2="${c.lo.toFixed(1)}" stroke="${col}" stroke-width="3"/>
      <rect x="${c.x - 7}" y="${Math.min(c.o, c.c).toFixed(1)}" width="14" height="${Math.max(3, Math.abs(c.c - c.o)).toFixed(1)}" fill="${col}"/>`;
  });
  return s + tags;
};

const pick = (t, at) => {
  const btn = (x, label, c, d) => {
    const q = Math.max(0, Math.min(1, (t - at - d) / 0.3));
    if (q <= 0) return '';
    const s = (q < 1 ? 0.5 + 0.6 * q : 1.1 - 0.1 * Math.min(1, (t - at - d - 0.3) / 0.2)) * (1 + 0.03 * Math.sin((t - at) * 6 + d * 9));
    return `<g transform="translate(${x} 620) scale(${s.toFixed(3)})"><rect x="-150" y="-62" width="300" height="124" rx="34" fill="${c}" stroke="#141414" stroke-width="9" filter="url(#shadow)"/>
      <text data-qa="screen" data-g="pk-${label}" x="0" y="${label.length > 6 ? 18 : 22}" text-anchor="middle" font-family="Luckiest Guy" font-size="${label.length > 6 ? 50 : 62}" fill="#fff" stroke="#141414" stroke-width="8" paint-order="stroke">${label}</text></g>`;
  };
  return btn(200, 'ASIA', '#5c7cfa', 0) + btn(540, 'LONDON', '#26a69a', 0.12) + btn(880, 'NEW YORK', '#c9a443', 0.24);
};

export default {
  id: 'three-sessions',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: 'The market has three personalities. Which one do you trade?',
      caption: 'The market has *3 personalities*. Which one do *you* trade?', pauseAfter: 0.3 },
    { say: 'Asia is usually calm. It often builds a tight range.',
      caption: '*Asia* is usually *calm*. It often builds a tight *range*.', pauseAfter: 0.2 },
    { say: 'London is fast. Its open often takes one side of that range.',
      caption: '*London* is *fast*. Its open often takes *one side* of that range.', pauseAfter: 0.2 },
    { say: 'New York is the crowd. Its open, overlapping London, is the busiest part of the day.',
      caption: '*New York* is the *crowd*. Its open, overlapping London, is the *busiest* part of the day.', pauseAfter: 0.3 },
    { say: 'On the chart, each session gets its own box, from its high to its low.',
      caption: 'On the chart, each session gets its own *box*, from its *high* to its *low*.', pauseAfter: 0.4 },
    { say: 'Do not memorise the hours. Draw them on your chart.',
      caption: 'Do not memorise the hours. *Draw them* on your chart.', pauseAfter: 0.3 },
    { say: 'Asia, London or New York? Comment your session.',
      caption: '*Asia*, *London* or *New York*? *Comment your session*.' },
  ],

  world: [],

  camera: [
    { at: 0, x: CLK + 600, y: 953, zoom: 0.95, push: 0.008 },
    { at: '2', x: (HX(20) + HX(24)) / 2, y: 1150, zoom: 0.95, move: 0.9, push: 0 },
    { at: '3', x: (HX(26) + HX(29)) / 2, y: 1150, zoom: 0.95, move: 0.9, push: 0 },
    { at: '4', x: (HX(31) + HX(34)) / 2 - 60, y: 600, zoom: 0.7, move: 0.9, push: 0 },
    { at: '5', x: HX(27) + 130, y: 950, zoom: 0.44, move: 1.2, push: 0.002 },
    { at: '7', x: CLK + 600, y: 953, zoom: 0.95, move: 0.45, push: 0.004 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: CLK + 600, y: 1300, face: 1, scale: 0.8 },
      { at: '2', x: (HX(20) + HX(24)) / 2 + 330, face: -1, scale: 0.55, move: 0.9 },
      { at: '3', x: (HX(26) + HX(29)) / 2 + 330, move: 0.9 },
      { at: '4', x: (HX(31) + HX(34)) / 2 + 360, move: 0.9 },
      { at: '5', x: HX(35), scale: 0.9, move: 1.2 },
      { at: '7', x: CLK + 600, face: 1, scale: 0.85, move: 0.45 },
    ],
    moods: [
      { at: 0, mood: 'think' }, { at: '2', mood: 'neutral' }, { at: '3', mood: 'excited' }, { at: '4', mood: 'shocked' },
      { at: '5', mood: 'determined' }, { at: '7', mood: 'happy' },
    ],
    looks: [{ at: 0, look: 'up' }, { at: '1:which', look: 'cam' }, { at: '2', look: 'left' }, { at: '6', look: 'cam' }],
    actions: [
      { at: '1:personalities', do: 'point', dur: 1.0 },
      { at: '2:calm', do: 'nod', dur: 0.6 },
      { at: '3:fast', do: 'shake', dur: 0.5 },
      { at: '4:crowd', do: 'sweat', dur: 1.6 },
      { at: '5:box', do: 'point', dur: 1.4 },
      { at: '7:comment', do: 'wave', dur: 2.0 },
    ],
  }],

  props: [
    { type: 'custom', layer: 'back', at: 0, until: '2+0.6', draw: (t) => clocks(t) },
    { type: 'custom', layer: 'back', at: '1>', draw: (t, sc) => day(t, sc) },
    { type: 'custom', layer: 'back', at: '6', draw: (t) => clocks(t) },
    { type: 'title', at: 0.02, until: '2-0.05', text: '3 SESSIONS\n*3 PERSONALITIES*', y: 330, sfx: 'bell' },
    { type: 'tag', space: 'screen', at: '2', until: '7', x: 540, y: 1163, size: 16, text: 'ILLUSTRATIVE PRICE PATH' },
    { type: 'title', at: '2', until: '3-0.05', text: '*ASIA*  CALM', y: 300, size: 120, keyColor: '#9fb4ff' },
    { type: 'title', at: '3', until: '4-0.05', text: '*LONDON*  FAST', y: 300, size: 120, keyColor: '#26a69a' },
    { type: 'title', at: '4', until: '5-0.05', text: '*NEW YORK*  CROWD', y: 300, size: 110 },

    // whiteboard: the hours
    { type: 'title', at: '5', until: '6-0.05', text: 'EACH SESSION,\n*ITS OWN BOX*', y: 330 },
    { type: 'title', at: '6', until: '7-0.05', text: '*DRAW* THEM', y: 300, size: 120 },

    // CTA
    { type: 'custom', space: 'screen', at: '7', draw: (t, sc, p) => pick(t, p._at) },
    { type: 'title', at: '7:comment', text: '*COMMENT* YOUR SESSION', y: 300, size: 100, icon: 'comment', sfx: 'ding' },
  ],

  sfx: [{ at: '2', name: 'pop', gain: 0.7 }, { at: '3', name: 'whoosh', gain: 0.6, dur: 0.5 }, { at: '4', name: 'thud', gain: 0.7 }, { at: '7', name: 'pop', gain: 0.8 }],
};
