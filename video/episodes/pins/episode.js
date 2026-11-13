// Pinterest images (packs A, B, C, D from "Fikirler 2026-11-13"). Rendered with engine/pins.mjs, not build.mjs.
// Pins are 1000x1500 cut from the 1080x1920 frame at (40, 210); wallpapers use the full 1080x1920.
// Every figure is either a definition, simple arithmetic or labelled illustrative. No profit numbers,
// no logos, no real people. Footer: MetrivaStudio.
const X0 = 40, Y0 = 210, PW = 1000, PH = 1500;
const G = '#26a69a', R = '#ef5350', GOLD = '#E4C471', GL = '#F6E6B0';
const pick = (globalThis.location && new URLSearchParams(location.search).get('pin')) || 'a1';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
// *gold* markup
const rich = (s, base, key) => s.split('*').map((p, i) => `<tspan fill="${i % 2 ? key : base}">${esc(p)}</tspan>`).join('');
const T = (x, y, s, size, o = {}) => `<text x="${x}" y="${y}" font-family="${o.font || 'Inter'}" font-weight="${o.w || 800}" font-size="${size}" text-anchor="${o.anchor || 'start'}"${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.stroke ? ` stroke="#141414" stroke-width="${o.stroke}" paint-order="stroke"` : ''}>${rich(s, o.color || '#fff', o.key || GOLD)}</text>`;
const title = (lines, y = 150, size = 96) => lines.map((l, i) => T(PW / 2, y + i * size * 1.05, l, size, { font: 'Luckiest Guy', w: 400, anchor: 'middle', stroke: size * 0.12 })).join('');
const footer = (h = PH, w = PW) => `<rect x="0" y="${h - 70}" width="${w}" height="70" fill="#000" opacity="0.25"/>
  ${T(w / 2, h - 24, 'MetrivaStudio', 30, { anchor: 'middle', color: GOLD, w: 900, ls: 2 })}`;
const bg = (a = '#151c2e', b = '#0a0e17', w = PW, h = PH) => `<defs><linearGradient id="pbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#pbg)"/>
  ${Array.from({ length: 11 }, (_, i) => `<line x1="${i * 100}" x2="${i * 100}" y1="0" y2="${h}" stroke="#fff" stroke-opacity="0.025" stroke-width="2"/>`).join('')}`;
const candle = (x, top, bot, wt, wb, col, w = 56) => `<line x1="${x}" x2="${x}" y1="${wt}" y2="${wb}" stroke="${col}" stroke-width="9" stroke-linecap="round"/>
  <rect x="${x - w / 2}" y="${top}" width="${w}" height="${Math.max(8, bot - top)}" rx="7" fill="${col}"/>`;
const panel = (x, y, w, h, stroke = '#334058') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="#0f1420" fill-opacity="0.92" stroke="${stroke}" stroke-width="4"/>`;
const note = (y, s) => T(PW / 2, y, s, 24, { anchor: 'middle', color: '#8d97a8', w: 700, ls: 1 });

// ---------------- pack A: cheat sheets ----------------
const A1 = () => {
  const rows = [
    ['1  HAMMER', 'Long lower wick. Buyers pushed back from the low.', (x, y) => candle(x, y - 60, y - 20, y - 70, y + 60, G)],
    ['2  SHOOTING STAR', 'Long upper wick. Sellers pushed back from the high.', (x, y) => candle(x, y + 20, y + 60, y - 70, y + 70, R)],
    ['3  ENGULFING', 'One body swallows the last one.', (x, y) => candle(x - 32, y - 30, y + 30, y - 40, y + 40, R, 40) + candle(x + 30, y - 60, y + 60, y - 70, y + 70, G, 60)],
    ['4  DOJI', 'Open and close almost equal. Indecision.', (x, y) => candle(x, y - 4, y + 4, y - 70, y + 70, '#c9b27a', 70)],
    ['5  INSIDE BAR', 'Fits inside the last candle. Range tightening.', (x, y) => candle(x - 32, y - 60, y + 60, y - 70, y + 70, G, 60) + candle(x + 34, y - 25, y + 20, y - 34, y + 30, R, 40)],
  ];
  return bg() + title(['5 CANDLESTICK', '*PATTERNS*'], 140) +
    T(PW / 2, 320, 'CHEAT SHEET', 34, { anchor: 'middle', color: GL, ls: 6 }) +
    rows.map(([n, d, fn], k) => { const y = 380 + k * 190; return panel(50, y, 900, 170) + fn(160, y + 85) +
      T(260, y + 72, n, 46, { font: 'Luckiest Guy', w: 400, color: GOLD }) + T(260, y + 124, d, 27, { w: 600, color: '#dfe5ee' }); }).join('') +
    `<rect x="50" y="1340" width="900" height="64" rx="18" fill="${R}" opacity="0.18"/>` +
    T(PW / 2, 1382, 'One candle without *context* is not a signal.', 30, { anchor: 'middle', key: '#ffb3b0' }) + footer();
};
const A2 = () => {
  const zones = [['ASIA', '20:00 to 00:00', '#5c7cfa', 'Often builds a tight range'], ['LONDON', '02:00 to 05:00', G, 'Often takes one side of that range'], ['NEW YORK', '07:00 to 10:00', GOLD, 'Most active, overlaps London']];
  return bg('#141a2e', '#090c14') + title(['ICT *KILLZONES*'], 150, 92) +
    T(PW / 2, 240, 'CHEAT SHEET  NEW YORK TIME', 32, { anchor: 'middle', color: GL, ls: 4 }) +
    // 24h ring bar
    `<rect x="70" y="300" width="860" height="70" rx="20" fill="#1d2636"/>` +
    zones.map(([, , c], k) => { const [h0, h1] = [[20, 24], [2, 5], [7, 10]][k]; return `<rect x="${70 + (h0 / 24) * 860}" y="300" width="${((h1 - h0) / 24) * 860}" height="70" rx="12" fill="${c}"/>`; }).join('') +
    [0, 6, 12, 18, 24].map((h) => T(70 + (h / 24) * 860, 410, `${String(h % 24).padStart(2, '0')}:00`, 24, { anchor: 'middle', color: '#8d97a8', w: 700 })).join('') +
    zones.map(([n, h, c, d], k) => { const y = 470 + k * 230; return panel(50, y, 900, 200, c) +
      T(100, y + 80, n, 60, { font: 'Luckiest Guy', w: 400, color: c }) + T(900, y + 80, h, 48, { anchor: 'end', w: 900 }) +
      T(100, y + 150, d, 32, { w: 600, color: '#dfe5ee' }); }).join('') +
    T(PW / 2, 1210, 'Mark them on your chart.', 40, { anchor: 'middle', w: 900, color: GOLD }) +
    T(PW / 2, 1262, 'Do not memorise, *draw* them.', 32, { anchor: 'middle', w: 700, color: '#dfe5ee' }) +
    note(1330, 'COMMON ICT TIMES. CHECK YOUR OWN SETTINGS AND DAYLIGHT SAVING.') + footer();
};
const A3 = () => {
  const bars = [[260, 330, 250, 350, 0], [330, 395, 320, 410, 0], [320, 390, 300, 405, 1], [280, 320, 265, 330, 1], [280, 350, 270, 365, 0], [350, 400, 345, 410, 0], [355, 395, 345, 408, 1], [350, 370, 340, 500, 1], [270, 355, 255, 365, 1], [200, 270, 185, 280, 1]];
  const ox = 120, oy = 360;
  return bg() + title(['LIQUIDITY', '*SWEEP*'], 140) + T(PW / 2, 320, 'CHEAT SHEET', 34, { anchor: 'middle', color: GL, ls: 6 }) +
    panel(50, 360, 900, 560) +
    `<g transform="translate(${ox} ${oy})">${bars.map(([a, b, c, d, u], i) => candle(60 + i * 76, a, b, c, d, u ? G : R, 44)).join('')}
      <line x1="80" x2="560" y1="410" y2="410" stroke="${GOLD}" stroke-width="5" stroke-dasharray="16 10"/>
      ${Array.from({ length: 7 }, (_, k) => `<line x1="${150 + k * 50}" x2="${150 + k * 50}" y1="425" y2="465" stroke="#d9d2c3" stroke-width="4"/><path d="M${150 + k * 50} 425 l 26 8 l -26 8 Z" fill="${R}"/>`).join('')}
      <circle cx="${60 + 7 * 76}" cy="500" r="40" fill="none" stroke="${GOLD}" stroke-width="6"/></g>` +
    T(150, 410, 'EQUAL LOWS', 26, { color: GOLD, w: 900 }) + T(735, 905, 'SWEEP', 30, { color: GOLD, w: 900 }) + T(200, 900, 'STOPS', 28, { color: R, w: 900 }) +
    [['1', 'Equal highs and lows *collect stops*.'], ['2', 'Price can *take them* and turn.'], ['3', 'Not every sweep turns. Wait for *confirmation*.'], ['4', 'Stop beyond the structure, *smaller size*.']].map(([n, s], k) => {
      const y = 970 + k * 90; return `<circle cx="95" cy="${y - 12}" r="28" fill="${GOLD}"/>` + T(95, y, n, 32, { anchor: 'middle', color: '#141414', w: 900 }) + T(145, y, s, 32, { w: 700 }); }).join('') +
    note(1340, 'ILLUSTRATIVE CHART. NOT A TRADE SIGNAL.') + footer();
};
const A4 = () => bg() + title(['POSITION', '*SIZE*'], 140) + T(PW / 2, 320, 'CHEAT SHEET', 34, { anchor: 'middle', color: GL, ls: 6 }) +
  panel(70, 370, 860, 190, GOLD) + T(PW / 2, 450, 'SIZE =', 46, { anchor: 'middle', color: '#9aa4b5', w: 900 }) + T(PW / 2, 520, '*RISK* ÷ *STOP DISTANCE*', 52, { anchor: 'middle', w: 900 }) +
  T(PW / 2, 640, 'Example (illustrative)', 32, { anchor: 'middle', color: '#9aa4b5', w: 700 }) +
  T(PW / 2, 700, 'Account $5,000  Risk 1% = *$50*', 40, { anchor: 'middle', w: 800 }) +
  panel(70, 750, 420, 330, '#5c7cfa') + panel(510, 750, 420, 330, G) +
  T(280, 820, 'STOP $2 AWAY', 34, { anchor: 'middle', color: '#9fb4ff', w: 900 }) + T(280, 900, '$50 ÷ $2', 44, { anchor: 'middle', w: 800 }) + T(280, 990, '*25 units*', 58, { anchor: 'middle', w: 900 }) + T(280, 1045, 'position $2,500', 30, { anchor: 'middle', color: '#9aa4b5', w: 700 }) +
  T(720, 820, 'STOP $5 AWAY', 34, { anchor: 'middle', color: '#8fe0d6', w: 900 }) + T(720, 900, '$50 ÷ $5', 44, { anchor: 'middle', w: 800 }) + T(720, 990, '*10 units*', 58, { anchor: 'middle', w: 900 }) + T(720, 1045, 'position $1,000', 30, { anchor: 'middle', color: '#9aa4b5', w: 700 }) +
  T(PW / 2, 1170, 'Either stop hit: you lose *$50*.', 42, { anchor: 'middle', w: 900 }) +
  T(PW / 2, 1240, 'Wider stop, *smaller* position.', 42, { anchor: 'middle', w: 900 }) + footer();
const A5 = () => {
  const rows = [['-10%', '+11.1%', 0.11], ['-25%', '+33.3%', 0.33], ['-50%', '+100%', 1], ['-80%', '+400%', 4]];
  return bg() + title(['LOSS AND', '*RECOVERY*'], 140) + T(PW / 2, 320, 'WHAT IT TAKES TO GET BACK', 34, { anchor: 'middle', color: GL, ls: 4 }) +
    T(130, 420, 'LOSS', 32, { color: '#9aa4b5', w: 900, ls: 3 }) + T(420, 420, 'GAIN NEEDED TO GET BACK', 32, { color: '#9aa4b5', w: 900, ls: 3 }) +
    rows.map(([l, g, v], k) => { const y = 460 + k * 190, bw = Math.min(460, 40 + 105 * v);
      return panel(50, y, 900, 160) + T(130, y + 100, l, 64, { color: R, w: 900 }) + `<rect x="420" y="${y + 50}" width="${bw}" height="60" rx="14" fill="${G}" opacity="0.85"/>` +
        T(420 + bw + 20 > 760 ? 420 + bw - 20 : 420 + bw + 20, y + 100, g, 56, { w: 900, anchor: 420 + bw + 20 > 760 ? 'end' : 'start' }); }).join('') +
    T(PW / 2, 1260, 'Gain needed = 1 ÷ (1 - loss) - 1', 36, { anchor: 'middle', w: 800, color: GOLD }) +
    T(PW / 2, 1320, 'Protect the account *first*.', 38, { anchor: 'middle', w: 900 }) + footer();
};

// ---------------- pack B: rule cards ----------------
const rules = (head, items, sub) => () => bg('#10161f', '#06080d') + title(head, 150, 104) + T(PW / 2, 350, sub, 32, { anchor: 'middle', color: GL, ls: 5 }) +
  items.map((s, k) => { const y = 410 + k * 158;
    return panel(60, y, 880, 132) + `<circle cx="130" cy="${y + 66}" r="38" fill="${GOLD}"/>` + T(130, y + 80, String(k + 1), 42, { anchor: 'middle', color: '#141414', w: 900 }) +
      T(195, y + 82, s, 44, { w: 800 }); }).join('') + footer();
const B1 = rules(['DAY TRADING', '*RULES*'], ['Risk *1%* per trade', '*2 losses* in a day? Close it', '*One* setup only', '*Journal* every trade', 'No trade outside the *plan*'], 'IF I HAD TO RESTART');
const B2 = rules(['AFTER A', '*LOSS*'], ['Never *size up* after a loss', '*2 losses* = the day is over', '*Close* the screen', 'Take a *walk*', 'Read the *journal* tomorrow'], 'TRADING PSYCHOLOGY RULES');
const B3 = rules(['RISK', '*RULES*'], ['Decide where you are *wrong* first', 'Size = *risk ÷ stop*', 'Size for the *streak*', 'Stop beyond the *structure*', 'Same risk, *every* trade'], 'TRADING PSYCHOLOGY RULES');

// ---------------- pack C: quote cards ----------------
const quote = (lines, color = GOLD) => () => bg('#0d1220', '#05070c') +
  T(PW / 2, 420, '“', 300, { font: 'Luckiest Guy', w: 400, anchor: 'middle', color }) +
  lines.map((l, i) => T(PW / 2, 620 + i * 110, l, 92, { font: 'Luckiest Guy', w: 400, anchor: 'middle', stroke: 10 })).join('') +
  `<rect x="${PW / 2 - 60}" y="${660 + lines.length * 110}" width="120" height="8" rx="4" fill="${color}"/>` + footer();
const C1 = quote(['THE *SETUP*', 'COMES TO', 'THE *PATIENT*']);
const C2 = quote(['PROTECT THE', '*ACCOUNT*', 'FIRST'], G);
const C3 = quote(['DECIDE WHERE', "YOU'RE *WRONG*", 'BEFORE YOU', 'ENTER'], R);

// ---------------- pack D: phone wallpapers (full 1080x1920) ----------------
const wall = (lines, a, b) => () => `<defs><radialGradient id="wbg" cx="0.5" cy="0.62" r="0.8"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient></defs>
  <rect width="1080" height="1920" fill="url(#wbg)"/>
  ${Array.from({ length: 8 }, (_, i) => `<rect x="${110 + i * 110}" y="${1500 - i * 70}" width="60" height="${200 + i * 70}" rx="10" fill="${GOLD}" opacity="0.06"/>`).join('')}
  ${lines.map((l, i) => `<text x="540" y="${560 + i * 120}" text-anchor="middle" font-family="Luckiest Guy" font-size="104" stroke="#141414" stroke-width="12" paint-order="stroke">${rich(l, '#fff', GOLD)}</text>`).join('')}
  <text x="540" y="1860" text-anchor="middle" font-family="Inter" font-weight="900" font-size="28" letter-spacing="3" fill="${GOLD}" opacity="0.7">MetrivaStudio</text>`;
const D1 = wall(['PROTECT THE', '*ACCOUNT*', 'FIRST'], '#1b2a44', '#05070c');
const D2 = wall(['THE *SETUP*', 'COMES TO THE', '*PATIENT*'], '#164a45', '#04100f');
const D3 = wall(['SIZE FOR', 'THE *STREAK*'], '#3a1d24', '#0a0507');

const PINS = {
  a1: { draw: A1, bull: [960, 545, 0.27, 'think', 'downleft', -1] },
  a2: { draw: A2, bull: [962, 440, 0.25, 'happy', 'downleft', -1] },
  a3: { draw: A3, bull: [960, 545, 0.27, 'smug', 'downleft', -1] },
  a4: { draw: A4, bull: [960, 545, 0.27, 'confident', 'downleft', -1] },
  a5: { draw: A5, bull: [960, 545, 0.27, 'determined', 'downleft', -1] },
  b1: { draw: B1, bull: [540, 1640, 0.3, 'determined', 'cam', 0] },
  b2: { draw: B2, bull: [540, 1640, 0.3, 'think', 'cam', 0] },
  b3: { draw: B3, bull: [540, 1640, 0.3, 'confident', 'cam', 0] },
  c1: { draw: C1, bull: [540, 1660, 0.62, 'neutral', 'cam', 0] },
  c2: { draw: C2, bull: [540, 1660, 0.62, 'determined', 'cam', 0] },
  c3: { draw: C3, bull: [540, 1660, 0.62, 'think', 'cam', 0] },
  d1: { draw: D1, full: true, bull: [540, 1660, 1.0, 'confident', 'cam', 0] },
  d2: { draw: D2, full: true, bull: [540, 1660, 1.0, 'neutral', 'cam', 0] },
  d3: { draw: D3, full: true, bull: [540, 1660, 1.0, 'determined', 'cam', 0] },
};
const P = PINS[pick];
const [bx, by, bs, mood, look, face] = P.bull;

export default {
  id: 'pins',
  captions: false,
  progress: false,
  tail: 0,
  lines: [],
  world: [],
  camera: [{ at: 0, x: 0, y: 628, zoom: 1, push: 0 }],
  actors: [{
    kind: 'bull', id: 'bull', steadyLook: true,
    path: [{ at: 0, x: bx - 540, y: by - 332, face, scale: bs }],
    moods: [{ at: 0, mood }],
    looks: [{ at: 0, look }],
  }],
  props: [
    { type: 'custom', layer: 'back', at: 0, draw: () => `<g transform="translate(-540 -332)">${P.full ? P.draw() : `<rect width="1080" height="1920" fill="#000"/><g transform="translate(${X0} ${Y0})">${P.draw()}</g>`}</g>` },
  ],
};
export const PIN_SIZE = { w: PW, h: PH, x: X0, y: Y0 };
export const PIN_IDS = Object.keys(PINS);
