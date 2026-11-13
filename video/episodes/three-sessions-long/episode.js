// Long TikTok version (about 65 s) of idea card 5: 3 sessions, 3 personalities.
// Hours: the common ICT killzone times given on the card, New York time: Asia 20:00-00:00, London 02:00-05:00,
// New York 07:00-10:00. They could not be checked against the indicator's default settings (the listing
// page refuses automated reading), so the video calls them "common" times and the report flags them.
// The price path is illustrative. Product (1 of 2): ICT Killzones Sessions Indicator, caption only.
const CLK = 0, CH = 1300, WB = 4100;
const HX = (h) => CH + 100 + (h - 18) * 130; // 18:00 (previous day) to 12:00 = 18 hours
const ZONES = [
  { name: 'ASIA', h0: 20, h1: 24, col: '#5c7cfa', label: '20:00 TO 00:00' },
  { name: 'LONDON', h0: 26, h1: 29, col: '#26a69a', label: '02:00 TO 05:00' },
  { name: 'NEW YORK', h0: 31, h1: 34, col: '#E4C471', label: '07:00 TO 10:00' },
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
    pts.push([HX(h), y]);
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

const day = (t, sc) => {
  let s = `<rect x="${CH - 300}" y="-900" width="3000" height="2200" fill="#0b111b"/>
    ${Array.from({ length: 30 }, (_, i) => `<line x1="${CH - 300 + i * 100}" x2="${CH - 300 + i * 100}" y1="-900" y2="1300" stroke="#1d2636" stroke-width="3"/>`).join('')}
    ${Array.from({ length: 22 }, (_, i) => `<line x1="${CH - 300}" x2="${CH + 2700}" y1="${-900 + i * 100}" y2="${-900 + i * 100}" stroke="#1d2636" stroke-width="3"/>`).join('')}
    <rect x="${CH - 300}" y="1300" width="3000" height="1400" fill="#080c14"/>`;
  ZONES.forEach((z, k) => {
    const on = Math.min(1, Math.max(0, (t - sc.tl.at(['3', '5', '7'][k])) / 0.4));
    const x0 = HX(z.h0), x1 = HX(z.h1);
    const nxAt = k < 2 ? ['3', '5', '7'][k + 1] : '9';
    const nx = Math.min(1, Math.max(0, (t - sc.tl.at(nxAt) + 0.3) / 0.3));
    const lab = on * (1 - nx);
    s += `<rect x="${x0}" y="560" width="${x1 - x0}" height="700" fill="${z.col}" opacity="${(0.06 + 0.12 * on).toFixed(2)}"/>
      <rect x="${x0}" y="560" width="${x1 - x0}" height="10" fill="${z.col}" opacity="${(0.3 + 0.7 * on).toFixed(2)}"/>
      ${lab > 0 ? `<text data-qa="world" data-g="z${k}" x="${(x0 + x1) / 2}" y="640" text-anchor="middle" font-family="Luckiest Guy" font-size="54" fill="${z.col}" opacity="${lab.toFixed(2)}">${z.name}</text>
      <text data-qa="world" data-g="z${k}h" x="${(x0 + x1) / 2}" y="690" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="${z.col}" opacity="${lab.toFixed(2)}">${z.label}</text>` : ''}`;
  });
  // the path draws itself as the camera moves along the day
  const a = sc.tl.at('2'), b = sc.tl.at('7>');
  const n = Math.max(1, Math.min(PATH.length - 1, Math.floor(2 + ((t - a) / (b - a)) * (PATH.length - 2))));
  s += `<polyline points="${PATH.slice(0, n + 1).map(([x, y]) => `${x},${y.toFixed(1)}`).join(' ')}" fill="none" stroke="#e8edf5" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="${PATH[n][0]}" cy="${PATH[n][1].toFixed(1)}" r="12" fill="#E4C471"/>`;
  // the Asia range lines
  const r = Math.min(1, Math.max(0, (t - sc.tl.at('4:high')) / 0.4));
  if (r > 0) s += `<g opacity="${r.toFixed(2)}"><line x1="${HX(20)}" x2="${HX(29)}" y1="976" y2="976" stroke="#5c7cfa" stroke-width="4" stroke-dasharray="14 10"/><line x1="${HX(20)}" x2="${HX(29)}" y1="1044" y2="1044" stroke="#5c7cfa" stroke-width="4" stroke-dasharray="14 10"/></g>`;
  return s;
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
  id: 'three-sessions-long',
  voice: { name: 'am_fenrir', speed: 1.15, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: 'The market has three personalities. Which one do you trade?',
      caption: 'The market has *3 personalities*. Which one do *you* trade?', pauseAfter: 0.3 },
    { say: 'Here is one trading day, in New York time.',
      caption: 'Here is *one trading day*, in *New York time*.', pauseAfter: 0.2 },
    { say: 'Asia is usually calm. Fewer traders are awake, so it often builds a tight range.',
      caption: '*Asia* is usually *calm*. Fewer traders are awake, so it often builds a tight *range*.', pauseAfter: 0.2 },
    { say: 'Mark the high and the low of that range. They matter later.',
      caption: 'Mark the *high* and the *low* of that range. They matter *later*.', pauseAfter: 0.3 },
    { say: 'London is fast. Its open often takes one side of the Asia range.',
      caption: '*London* is *fast*. Its open often takes *one side* of the Asia range.', pauseAfter: 0.2 },
    { say: 'Sometimes that is a sweep and price turns back. Sometimes it is the real move.',
      caption: 'Sometimes that is a *sweep* and price turns back. Sometimes it is the *real move*.', pauseAfter: 0.3 },
    { say: 'New York is the crowd. Its open, overlapping London, is the busiest part of the day.',
      caption: '*New York* is the *crowd*. Its open, overlapping London, is the *busiest* part of the day.', pauseAfter: 0.2 },
    { say: 'Big news often lands here too, so spikes can get wild.',
      caption: 'Big *news* often lands here too, so *spikes* can get wild.', pauseAfter: 0.3 },
    { say: 'Common killzones in New York time: Asia eight to midnight, London two to five, New York seven to ten.',
      caption: 'Common *killzones* in New York time: *Asia 20 to 24*, *London 2 to 5*, *New York 7 to 10*.', pauseAfter: 0.3 },
    { say: 'Check your own settings. Daylight saving can shift them.',
      caption: 'Check your own *settings*. *Daylight saving* can shift them.', pauseAfter: 0.3 },
    { say: 'Set your chart clock to New York time, or convert the hours.',
      caption: 'Set your *chart clock* to *New York time*, or convert the hours.', pauseAfter: 0.3 },
    { say: 'Then watch what price does inside each box for two weeks before you trade it.',
      caption: 'Then *watch* what price does inside each box for *2 weeks* before you trade it.', pauseAfter: 0.3 },
    { say: 'Many traders pick one session and skip the rest. Less screen time, fewer random trades.',
      caption: 'Many traders pick *one session* and skip the rest. Less *screen time*, fewer *random trades*.', pauseAfter: 0.3 },
    { say: 'Do not memorise the hours. Draw them on your chart.',
      caption: 'Do not memorise the hours. *Draw them* on your chart.', pauseAfter: 0.3 },
    { say: 'Asia, London or New York? Comment your session.',
      caption: '*Asia*, *London* or *New York*? *Comment your session*.' },
  ],

  world: [{ set: 'whiteboard', x: WB }],

  camera: [
    { at: 0, x: CLK + 600, y: 953, zoom: 0.95, push: 0.008 },
    { at: '2', x: HX(22), y: 925, zoom: 0.88, move: 0.9, push: 0 },
    { at: '3', x: (HX(20) + HX(24)) / 2, y: 953, zoom: 0.95, move: 0.9, push: 0 },
    { at: '5', x: (HX(26) + HX(29)) / 2, y: 953, zoom: 0.95, move: 0.9, push: 0 },
    { at: '7', x: (HX(31) + HX(34)) / 2, y: 900, zoom: 0.95, move: 0.9, push: 0 },
    { at: '9+0.1', x: WB + 610, y: 956, zoom: 0.95, move: 0.9, push: 0.002 },
    { at: '15+0.1', x: CLK + 600, y: 953, zoom: 0.95, move: 0.9, push: 0.004 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: CLK + 600, y: 1300, face: 1, scale: 0.8 },
      { at: '2', x: HX(22) + 380, face: -1, scale: 0.7, move: 0.9 },
      { at: '3', x: (HX(20) + HX(24)) / 2 + 280, move: 0.9 },
      { at: '5', x: (HX(26) + HX(29)) / 2 + 280, move: 0.9 },
      { at: '7', x: (HX(31) + HX(34)) / 2 + 300, move: 0.9 },
      { at: '9+0.1', x: WB + 970, scale: 0.82, move: 0.9 },
      { at: '15+0.1', x: CLK + 600, face: 1, scale: 0.85, move: 0.9 },
    ],
    moods: [
      { at: 0, mood: 'think' }, { at: '3', mood: 'neutral' }, { at: '5', mood: 'excited' }, { at: '6', mood: 'think' }, { at: '7', mood: 'shocked' },
      { at: '9', mood: 'determined' }, { at: '15', mood: 'happy' },
    ],
    looks: [{ at: 0, look: 'up' }, { at: '1:which', look: 'cam' }, { at: '2', look: 'left' }, { at: '10', look: 'cam' }, { at: '14', look: 'left' }, { at: '15', look: 'cam' }],
    actions: [
      { at: '1:personalities', do: 'point', dur: 1.0 },
      { at: '3:calm', do: 'nod', dur: 0.6 },
      { at: '4:high', do: 'point', dur: 1.2 },
      { at: '5:fast', do: 'shake', dur: 0.5 },
      { at: '7:crowd', do: 'sweat', dur: 1.6 },
      { at: '9', do: 'write', dur: 3.6 }, { at: '12', do: 'write', dur: 3.0 },
      { at: '10:settings', do: 'point', dur: 1.0 },
      { at: '15:comment', do: 'wave', dur: 2.0 },
    ],
  }],

  props: [
    { type: 'custom', layer: 'back', at: 0, until: '2+0.6', draw: (t) => clocks(t) },
    { type: 'custom', layer: 'back', at: '1>', draw: (t, sc) => day(t, sc) },
    { type: 'custom', layer: 'back', at: '15', draw: (t) => clocks(t) },
    { type: 'title', at: 0.02, until: '2-0.05', text: '3 SESSIONS\n*3 PERSONALITIES*', y: 330, sfx: 'bell' },
    { type: 'tag', space: 'screen', at: '2', until: '9+0.3', x: 540, y: 1163, size: 16, text: 'ILLUSTRATIVE PRICE PATH  NEW YORK TIME' },
    { type: 'title', at: '2', until: '3-0.05', text: 'ONE *TRADING DAY*', y: 300, size: 116 },
    { type: 'title', at: '3', until: '4-0.05', text: '*ASIA*  CALM', y: 300, size: 120, keyColor: '#9fb4ff' },
    { type: 'title', at: '4', until: '5-0.05', text: 'MARK THE *RANGE*', y: 300, size: 116, keyColor: '#9fb4ff' },
    { type: 'title', at: '5', until: '6-0.05', text: '*LONDON*  FAST', y: 300, size: 120, keyColor: '#26a69a' },
    { type: 'title', at: '6', until: '7-0.05', text: 'SWEEP OR *REAL MOVE?*', y: 300, size: 100, keyColor: '#26a69a' },
    { type: 'title', at: '7', until: '9-0.05', text: '*NEW YORK*  CROWD', y: 300, size: 110 },

    // whiteboard: the hours
    { id: 'w1', type: 'write', at: '9:asia', until: '12', dur: 0.6, x: WB + 120, y: 460, size: 60, maxW: 790, keyColor: '#3b5bdb', text: '*Asia*  20:00 to 00:00' },
    { id: 'w2', type: 'write', at: '9:london', until: '12', dur: 0.6, x: WB + 120, y: 580, size: 60, maxW: 790, keyColor: '#1f8f84', text: '*London*  02:00 to 05:00' },
    { id: 'w3', type: 'write', at: '9:new#2', until: '12', dur: 0.6, x: WB + 120, y: 700, size: 60, maxW: 790, keyColor: '#9c7a2e', text: '*New York*  07:00 to 10:00' },
    { id: 'w5', type: 'write', at: '10:daylight', until: '12', dur: 0.6, x: WB + 120, y: 820, size: 50, maxW: 790, keyColor: '#d84341', text: 'Check *daylight saving*' },
    { id: 'w6', type: 'write', at: '11:chart', until: '12', dur: 0.6, x: WB + 120, y: 920, size: 50, maxW: 790, keyColor: '#1f8f84', text: 'Chart clock: *NY time*' },
    { id: 'w7', type: 'write', at: '12:watch', dur: 0.6, x: WB + 120, y: 460, size: 60, maxW: 790, keyColor: '#1f8f84', text: '*Watch* each box' },
    { id: 'w8', type: 'write', at: '12:weeks', dur: 0.6, x: WB + 120, y: 570, size: 60, maxW: 790, keyColor: '#1f8f84', text: 'for *2 weeks* first' },
    { id: 'w9', type: 'write', at: '13:one', dur: 0.6, x: WB + 120, y: 700, size: 60, maxW: 790, keyColor: '#9c7a2e', text: '*One* session is enough' },
    { id: 'w4', type: 'write', at: '14:draw', dur: 0.6, x: WB + 120, y: 830, size: 50, maxW: 790, color: '#5b6680', text: 'Draw them on the chart.' },
    { type: 'tag', at: '9', until: '15+0.3', x: WB + 500, y: 1010, size: 19, text: 'COMMON ICT TIMES  CHECK YOUR OWN SETTINGS' },

    // CTA
    { type: 'custom', space: 'screen', at: '15', draw: (t, sc, p) => pick(t, p._at) },
    { type: 'title', at: '15:comment', text: '*COMMENT* YOUR SESSION', y: 300, size: 100, icon: 'comment', sfx: 'ding' },
  ],

  sfx: [{ at: '3', name: 'pop', gain: 0.7 }, { at: '5', name: 'whoosh', gain: 0.6, dur: 0.5 }, { at: '7', name: 'thud', gain: 0.7 }, { at: '15', name: 'pop', gain: 0.8 }],
};
