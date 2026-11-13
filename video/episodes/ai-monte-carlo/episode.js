// Episode: I asked Claude to run my strategy 10,000 times. (AI for traders, Part 5/5)
// Illustrative strategy: 40% win rate, +2R wins, -1R losses, expected value +0.2R per trade.
// Odds checked with our own 200,000-run simulation of 100 trades: at least one streak of 5 losses 97.5%,
// 8 losses 48.9%, 10 losses 20.6% (the idea card says about 98, 49 and 20). Drawdown of 8 losses:
// 0.99^8 = 0.923 (about -8%) at 1% risk, 0.9^8 = 0.430 (about -57%) at 10% risk.
// The paths drawn on screen come from the same rules (60 seeded runs). Claude is named only.
const LAB = 0, WB = 1200, OUT = 2400;
const PROMPT = 'Simulate 10,000 random orders of 100 trades with a 40 percent win rate, plus 2R wins and minus 1R losses. Show the chance of 5, 8 and 10 losses in a row, and the worst drawdown at 1 percent and 10 percent risk per trade.';

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const PATHS = (() => {
  const r = rng(424242), out = [];
  for (let k = 0; k < 60; k++) {
    let eq = 0, run = 0, best = 0; const pts = [0];
    for (let i = 0; i < 100; i++) {
      const win = r() < 0.4;
      eq += win ? 2 : -1; run = win ? 0 : run + 1; best = Math.max(best, run);
      pts.push(eq);
    }
    out.push({ pts, streak8: best >= 8 });
  }
  return out;
})();
const wrap = (s, n = 42) => {
  const out = []; let line = '';
  for (const w of s.split(' ')) { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }
  if (line.trim()) out.push(line.trim());
  return out;
};

// the lab screen: equity paths drawing in, the ones with 8 losses in a row turn red after the reveal
const lab = (t, sc) => {
  const a = sc.tl.at('1'), b = sc.tl.at('2>');
  const prog = Math.max(0, Math.min(1, (t - a) / (b - a)));
  const reveal = t >= sc.tl.at('5');
  const X0 = LAB + 110, X1 = LAB + 1090, Y0 = 860, SC = 9;
  let s = `<rect x="${LAB - 400}" y="-900" width="2000" height="2200" fill="#0b111b"/>
    ${Array.from({ length: 20 }, (_, i) => `<line x1="${LAB - 400 + i * 100}" x2="${LAB - 400 + i * 100}" y1="-900" y2="1300" stroke="#1d2636" stroke-width="3"/>`).join('')}
    ${Array.from({ length: 22 }, (_, i) => `<line x1="${LAB - 400}" x2="${LAB + 1600}" y1="${-900 + i * 100}" y2="${-900 + i * 100}" stroke="#1d2636" stroke-width="3"/>`).join('')}
    <rect x="${LAB - 400}" y="1300" width="2000" height="1400" fill="#080c14"/>
    <line x1="${X0}" x2="${X1}" y1="${Y0}" y2="${Y0}" stroke="#E4C471" stroke-width="4" stroke-dasharray="14 10" opacity="0.7"/>
    <text data-qa="world" data-g="lab" x="${X0}" y="${Y0 + 40}" font-family="Inter" font-weight="800" font-size="26" fill="#E4C471">START</text>`;
  const n = Math.max(1, Math.floor(prog * 100));
  for (const p of PATHS) {
    let d = `M${X0} ${Y0}`;
    for (let i = 1; i <= n; i++) d += ` L ${(X0 + ((X1 - X0) * i) / 100).toFixed(1)} ${(Y0 - p.pts[i] * SC).toFixed(1)}`;
    const red = reveal && p.streak8;
    s += `<path d="${d}" fill="none" stroke="${red ? '#ef5350' : '#26a69a'}" stroke-width="${red ? 4 : 3}" opacity="${red ? 0.85 : 0.35}"/>`;
  }
  return s;
};

export default {
  id: 'ai-monte-carlo',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: 'This strategy makes money. So why do so many of these paths fall into a hole?',
      caption: 'This strategy *makes money*. So why do so many of these paths fall into a *hole*?' },
    { say: 'I asked Claude to simulate it ten thousand times.',
      caption: 'I asked *Claude* to simulate it *10,000 times*.', pauseAfter: 0.4 },
    { say: 'Forty percent wins at two R, losses at one R. Plus zero point two R per trade.',
      caption: '*40%* wins at *2R*, losses at *1R*. *+0.2R* per trade.', pauseAfter: 0.3 },
    { say: 'Guess: in a hundred trades, the odds of eight losses in a row? Comment it.',
      caption: 'Guess: in *100 trades*, the odds of *8 losses in a row*? *Comment it*.', pauseAfter: 3.4 },
    { say: 'About forty nine percent. Five in a row: about ninety eight. Ten in a row: about twenty.',
      caption: 'About *49%*. *5* in a row: about *98%*. *10* in a row: about *20%*.', pauseAfter: 0.35 },
    { say: 'Eight losses at one percent risk: about minus eight percent. At ten percent: minus fifty seven.',
      caption: '*8 losses* at *1%* risk: about *-8%*. At *10%*: *-57%*.', pauseAfter: 0.35 },
    { say: 'Size your risk for the streak, not for the win rate.',
      caption: 'Size your risk for the *streak*, not for the *win rate*.' },
  ],

  world: [
    { set: 'whiteboard', x: WB },
    { set: 'outdoor', x: OUT },
  ],

  camera: [
    { at: 0, x: LAB + 600, y: 860, zoom: 0.92, push: 0.004 },
    { at: '6+0.15', x: WB + 610, y: 956, zoom: 0.95, move: 0.8, push: 0.003 },
    { at: '7+0.15', x: OUT + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.004 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: LAB + 1000, y: 1300, face: -1, scale: 0.72 },
      { at: '6+0.15', x: WB + 970, scale: 0.82, move: 0.8 },
      { at: '7+0.15', x: OUT + 820, scale: 0.92, move: 0.8 },
    ],
    moods: [
      { at: 0, mood: 'think' }, { at: '3', mood: 'happy' }, { at: '4', mood: 'think' }, { at: '5', mood: 'shocked' },
      { at: '6', mood: 'worried' }, { at: '7', mood: 'determined' },
    ],
    looks: [{ at: 0, look: 'upleft' }, { at: '2', look: 'cam' }, { at: '4', look: 'cam' }, { at: '4>', look: 'up' }, { at: '5', look: 'upleft' }, { at: '6', look: 'left' }, { at: '7', look: 'cam' }],
    actions: [
      { at: '1:paths', do: 'point', dur: 1.2 },
      { at: '4>+0.2', do: 'tilt', dur: 2.8, deg: 10 },
      { at: '5', do: 'shake', dur: 0.6 },
      { at: '6', do: 'write', dur: 3.0 },
      { at: '7:streak', do: 'point', dur: 1.0 },
    ],
  }],

  props: [
    { type: 'badge', at: 0.05, text: 'AI FOR TRADERS  PART 5/5' },
    { type: 'custom', layer: 'back', at: 0, until: '6+0.4', draw: (t, sc) => lab(t, sc) },
    { type: 'tag', space: 'screen', at: 0.3, until: '6+0.3', x: 540, y: 1163, size: 16, text: 'ILLUSTRATIVE  40% WINS  +2R / -1R  60 OF 10,000 RUNS SHOWN' },
    { type: 'title', at: 0.02, until: '2-0.05', text: 'IT MAKES MONEY.\nSO WHY THE *HOLES?*', y: 330, sfx: 'bell' },
    // the prompt, on screen for two lines
    { type: 'custom', space: 'screen', at: '2', until: '4-0.02', draw: (t, sc, p) => {
      const q = Math.min(1, (t - p._at) / 0.3), o = Math.min(q, Math.max(0, (p._until - t) / 0.2));
      const lines = wrap(PROMPT), h = 124 + lines.length * 55;
      return `<g opacity="${o.toFixed(2)}"><rect x="60" y="330" width="960" height="${h}" rx="30" fill="#141a26" stroke="#E4C471" stroke-width="5" filter="url(#shadow)"/>
        <text data-qa="screen" data-g="mp" x="100" y="392" font-family="Luckiest Guy" font-size="44" fill="#E4C471">THE PROMPT</text>
        ${lines.map((l, k) => `<text data-qa="screen" data-g="mp" x="100" y="${456 + k * 55}" font-family="Inter" font-weight="600" font-size="40" fill="#fff">${l}</text>`).join('')}</g>`;
    } },
    // guess, with a silent 3-2-1
    { type: 'title', at: '4', until: '5-0.05', text: '*8 LOSSES* IN A ROW?', y: 300, size: 110, keyColor: '#ef5350' },
    { type: 'countdown', at: '4>+0.15', from: 3, x: 540, y: 600, r: 86 },
    // reveal
    { type: 'custom', space: 'screen', at: '5', until: '6-0.02', draw: (t, sc, p) => {
      const q = Math.min(1, (t - p._at) / 0.3), o = Math.min(q, Math.max(0, (p._until - t) / 0.2));
      const rows = [['8 LOSSES IN A ROW', 'ABOUT 49%', '#ef5350', '5'], ['5 LOSSES IN A ROW', 'ABOUT 98%', '#E4C471', '5:5'], ['10 LOSSES IN A ROW', 'ABOUT 20%', '#E4C471', '5:10']];
      return `<g opacity="${o.toFixed(2)}"><rect x="60" y="330" width="960" height="420" rx="30" fill="#141a26" stroke="#E4C471" stroke-width="5" filter="url(#shadow)"/>
        <text data-qa="screen" data-g="odds" x="100" y="400" font-family="Luckiest Guy" font-size="48" fill="#E4C471">IN 100 TRADES</text>
        ${rows.map(([l, v, c, at], k) => t < sc.tl.at(at) ? '' : `<text data-qa="screen" data-g="odds${k}" x="100" y="${500 + k * 95}" font-family="Inter" font-weight="700" font-size="44" fill="#fff">${l}</text>
          <text data-qa="screen" data-g="odds${k}v" x="980" y="${500 + k * 95}" text-anchor="end" font-family="Inter" font-weight="900" font-size="52" fill="${c}">${v}</text>`).join('')}</g>`;
    } },
    // the math of the streak
    { id: 'm1', type: 'write', at: '6:8', x: WB + 120, y: 470, size: 74, keyColor: '#1f8f84', text: '1% risk: 0.99⁸ = *0.92*' },
    { id: 'm2', type: 'write', at: '6:1%>', x: WB + 120, y: 560, size: 60, color: '#5b6680', text: 'about -8%' },
    { id: 'm3', type: 'write', at: '6:at', x: WB + 120, y: 700, size: 74, keyColor: '#d84341', text: '10% risk: 0.9⁸ = *0.43*' },
    { id: 'm4', type: 'write', at: '6:57', x: WB + 120, y: 790, size: 60, keyColor: '#d84341', text: 'about *-57%*' },
    { type: 'draw', around: 'm4', sub: '-57%', at: '6:57>', shape: 'circle' },
    // CTA
    { type: 'rules', at: '7', x: OUT + 140, y: 335, w: 920, title: '', gap: 95, size: 48,
      items: [
        { at: '7', text: 'Positive EV still has *streaks*' },
        { at: '7+0.15', text: 'Ask for a *Monte Carlo* run' },
        { at: '7:size', text: 'Size risk for the *streak*' },
      ] },
    { type: 'title', at: '7:streak', text: 'SIZE FOR THE *STREAK*', y: 300, size: 104 },
    { type: 'tag', space: 'screen', at: '7', x: 540, y: 1163, size: 16, text: 'CLAUDE IS MADE BY ANTHROPIC  NOT AFFILIATED' },
  ],

  sfx: [{ at: '5', name: 'thud', gain: 0.9 }, { at: '6:57', name: 'sad', gain: 0.6 }],
};
