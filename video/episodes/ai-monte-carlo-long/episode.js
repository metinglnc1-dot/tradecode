// Long TikTok version (about 65 s) of AI for traders Part 5/5: the Monte Carlo run.
// Illustrative strategy: 40% wins, +2R / -1R, +0.2R per trade. Our own simulations of 100 trades:
//  40% win rate (200,000 runs): at least one streak of 5 losses 97.5%, 8 losses 48.9%, 10 losses 20.6%.
//  8 losses in a row by win rate (100,000 runs each): 30% 85.7%, 40% 49.1%, 50% 17.0%, 60% 3.6%.
// Drawdown of 8 straight losses at fixed % of what is left: 1% 0.99^8 = 0.923 (-7.7%), 2% 0.851 (-14.9%),
// 5% 0.663 (-33.7%), 10% 0.430 (-57.0%). Claude is named only; no logo or interface.
const LAB = 0, WB = 1200, OUT = 2400;
const PROMPT = 'Simulate 10,000 random orders of 100 trades with a 40 percent win rate, plus 2R wins and minus 1R losses. Show the chance of 5, 8 and 10 losses in a row, and the worst drawdown at 1 percent and 10 percent risk per trade.';
const PROMPT2 = 'My win rate is [X] percent, my average win is [Y]R and my average loss is 1R. Run a Monte Carlo of 100 trades and tell me the chance of 5, 8 and 10 losses in a row.';

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
// the same trades in a different order (37 is coprime with 100, so this is a permutation)
const SHUF = PATHS.map((p, k) => {
  const inc = p.pts.slice(1).map((v, i) => v - p.pts[i]);
  const pts = [0]; let run = 0, best = 0;
  for (let i = 0; i < 100; i++) { const dv = inc[(i * 37 + k) % 100]; pts.push(pts[i] + dv); run = dv > 0 ? 0 : run + 1; best = Math.max(best, run); }
  return { pts, streak8: best >= 8 };
});
const wrap = (s, n = 42) => {
  const out = []; let line = '';
  for (const w of s.split(' ')) { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }
  if (line.trim()) out.push(line.trim());
  return out;
};

const lab = (t, sc) => {
  // paths draw on line 1 to 2, then reshuffle (redraw) on line 4
  const a = sc.tl.at('1'), b = sc.tl.at('2>'), c = sc.tl.at('4'), d = sc.tl.at('4>');
  let prog = Math.max(0, Math.min(1, (t - a) / (b - a)));
  if (t >= c) prog = Math.max(0.02, Math.min(1, (t - c) / (d - c)));
  const reveal = t >= sc.tl.at('6');
  const X0 = LAB + 110, X1 = LAB + 1090, Y0 = 860, SC = 9;
  let s = `<rect x="${LAB - 400}" y="-900" width="2000" height="2200" fill="#0b111b"/>
    ${Array.from({ length: 20 }, (_, i) => `<line x1="${LAB - 400 + i * 100}" x2="${LAB - 400 + i * 100}" y1="-900" y2="1300" stroke="#1d2636" stroke-width="3"/>`).join('')}
    ${Array.from({ length: 22 }, (_, i) => `<line x1="${LAB - 400}" x2="${LAB + 1600}" y1="${-900 + i * 100}" y2="${-900 + i * 100}" stroke="#1d2636" stroke-width="3"/>`).join('')}
    <rect x="${LAB - 400}" y="1300" width="2000" height="1400" fill="#080c14"/>
    <line x1="${X0}" x2="${X1}" y1="${Y0}" y2="${Y0}" stroke="#E4C471" stroke-width="4" stroke-dasharray="14 10" opacity="0.7"/>
    <text data-qa="world" data-g="lab" x="${X0}" y="${Y0 + 40}" font-family="Inter" font-weight="800" font-size="26" fill="#E4C471">START</text>`;
  const n = Math.max(1, Math.floor(prog * 100));
  (t >= c ? SHUF : PATHS).forEach((p) => {
    const pts = p.pts;
    let dpath = `M${X0} ${Y0}`;
    for (let i = 1; i <= n; i++) dpath += ` L ${(X0 + ((X1 - X0) * i) / 100).toFixed(1)} ${(Y0 - pts[i] * SC).toFixed(1)}`;
    const red = reveal && p.streak8;
    s += `<path d="${dpath}" fill="none" stroke="${red ? '#ef5350' : '#26a69a'}" stroke-width="${red ? 4 : 3}" opacity="${red ? 0.85 : 0.35}"/>`;
  });
  return s;
};

const promptCard = (t, p, text, head, tag) => {
  const q = Math.min(1, (t - p._at) / 0.3), o = Math.min(q, Math.max(0, (p._until - t) / 0.2));
  const lines = wrap(text), h = 124 + lines.length * 55;
  return `<g opacity="${o.toFixed(2)}"><rect x="60" y="330" width="960" height="${h}" rx="30" fill="#141a26" stroke="#E4C471" stroke-width="5" filter="url(#shadow)"/>
    <text data-qa="screen" data-g="${tag}" x="100" y="392" font-family="Luckiest Guy" font-size="44" fill="#E4C471">${head}</text>
    ${lines.map((l, k) => `<text data-qa="screen" data-g="${tag}" x="100" y="${456 + k * 55}" font-family="Inter" font-weight="600" font-size="40" fill="#fff">${l.replace(/&/g, '&amp;')}</text>`).join('')}</g>`;
};

const table = (t, sc, p, head, rows) => {
  const q = Math.min(1, (t - p._at) / 0.3), o = Math.min(q, Math.max(0, (p._until - t) / 0.2));
  return `<g opacity="${o.toFixed(2)}"><rect x="60" y="330" width="960" height="${150 + rows.length * 92}" rx="30" fill="#141a26" stroke="#E4C471" stroke-width="5" filter="url(#shadow)"/>
    <text data-qa="screen" data-g="tb${head.length}" x="100" y="400" font-family="Luckiest Guy" font-size="48" fill="#E4C471">${head}</text>
    ${rows.map(([l, v, c, at], k) => t < sc.tl.at(at) ? '' : `<text data-qa="screen" data-g="r${head.length}${k}" x="100" y="${500 + k * 92}" font-family="Inter" font-weight="700" font-size="44" fill="#fff">${l}</text>
      <text data-qa="screen" data-g="r${head.length}${k}v" x="980" y="${500 + k * 92}" text-anchor="end" font-family="Inter" font-weight="900" font-size="52" fill="${c}">${v}</text>`).join('')}</g>`;
};

export default {
  id: 'ai-monte-carlo-long',
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
    { say: 'A Monte Carlo test shuffles the order of the same trades, again and again. Same edge. Different luck.',
      caption: 'A *Monte Carlo* test shuffles the *order* of the same trades, again and again. Same *edge*. Different *luck*.', pauseAfter: 0.3 },
    { say: 'Guess: in a hundred trades, the odds of eight losses in a row? Comment it.',
      caption: 'Guess: in *100 trades*, the odds of *8 losses in a row*? *Comment it*.', pauseAfter: 3.4 },
    { say: 'About forty nine percent. Five in a row: about ninety eight. Ten in a row: about twenty.',
      caption: 'About *49%*. *5* in a row: about *98%*. *10* in a row: about *20%*.', pauseAfter: 0.35 },
    { say: 'Win rate changes the odds. At thirty percent, eight in a row is about eighty six percent. At sixty, about four.',
      caption: '*Win rate* changes the odds. At *30%*, 8 in a row is about *86%*. At *60%*, about *4%*.', pauseAfter: 0.35 },
    { say: 'Now the damage. Eight losses in a row at one percent risk: about minus eight percent.',
      caption: 'Now the *damage*. *8 losses* in a row at *1%* risk: about *-8%*.' },
    { say: 'At two percent, minus fifteen. At five, minus thirty four. At ten, minus fifty seven.',
      caption: 'At *2%*, *-15%*. At *5%*, *-34%*. At *10%*, *-57%*.', pauseAfter: 0.35 },
    { say: 'Same strategy. Same streak. The risk per trade decided the size of the hole.',
      caption: 'Same strategy. Same streak. The *risk per trade* decided the size of the *hole*.', pauseAfter: 0.3 },
    { say: 'Try it with your own numbers. Give Claude your win rate and your average win, and ask for the streak odds.',
      caption: 'Try it with your *own numbers*. Give *Claude* your *win rate* and your *average win*, and ask for the *streak odds*.', pauseAfter: 0.4 },
    { say: 'Size your risk for the streak, not for the win rate.',
      caption: 'Size your risk for the *streak*, not for the *win rate*.' },
  ],

  world: [
    { set: 'whiteboard', x: WB },
    { set: 'outdoor', x: OUT },
  ],

  camera: [
    { at: 0, x: LAB + 600, y: 860, zoom: 0.92, push: 0.003 },
    { at: '8+0.15', x: WB + 610, y: 956, zoom: 0.95, move: 0.8, push: 0.002 },
    { at: '11+0.15', x: OUT + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.003 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: LAB + 1000, y: 1300, face: -1, scale: 0.72 },
      { at: '8+0.15', x: WB + 970, scale: 0.82, move: 0.8 },
      { at: '11+0.15', x: OUT + 820, scale: 0.92, move: 0.8 },
    ],
    moods: [
      { at: 0, mood: 'think' }, { at: '3', mood: 'happy' }, { at: '4', mood: 'think' }, { at: '5', mood: 'think' }, { at: '6', mood: 'shocked' },
      { at: '7', mood: 'think' }, { at: '8', mood: 'worried' }, { at: '10', mood: 'determined' }, { at: '11', mood: 'happy' }, { at: '12', mood: 'determined' },
    ],
    looks: [{ at: 0, look: 'upleft' }, { at: '2', look: 'cam' }, { at: '4', look: 'upleft' }, { at: '5', look: 'cam' }, { at: '5>', look: 'up' }, { at: '6', look: 'upleft' }, { at: '8', look: 'left' }, { at: '10', look: 'cam' }, { at: '11', look: 'cam' }],
    actions: [
      { at: '1:paths', do: 'point', dur: 1.2 },
      { at: '4:shuffles', do: 'shake', dur: 0.6 },
      { at: '5>+0.2', do: 'tilt', dur: 2.8, deg: 10 },
      { at: '6', do: 'shake', dur: 0.6 },
      { at: '8', do: 'write', dur: 3.0 }, { at: '9', do: 'write', dur: 3.0 },
      { at: '10:risk', do: 'point', dur: 1.0 },
      { at: '11:own', do: 'nod', dur: 0.6 },
      { at: '12:streak', do: 'point', dur: 1.0 },
    ],
  }],

  props: [
    { type: 'badge', at: 0.05, text: 'AI FOR TRADERS  PART 5/5' },
    { type: 'custom', layer: 'back', at: 0, until: '8+0.4', draw: (t, sc) => lab(t, sc) },
    { type: 'tag', space: 'screen', at: 0.3, until: '8+0.3', x: 540, y: 1163, size: 16, text: 'ILLUSTRATIVE  40% WINS  +2R / -1R  60 OF 10,000 RUNS SHOWN' },
    { type: 'title', at: 0.02, until: '2-0.05', text: 'IT MAKES MONEY.\nSO WHY THE *HOLES?*', y: 330, sfx: 'bell' },
    { type: 'custom', space: 'screen', at: '2', until: '4-0.02', draw: (t, sc, p) => promptCard(t, p, PROMPT, 'THE PROMPT', 'mp') },
    { type: 'title', at: '4', until: '5-0.05', text: 'SAME EDGE\n*DIFFERENT LUCK*', y: 330 },
    // guess
    { type: 'title', at: '5', until: '6-0.05', text: '*8 LOSSES* IN A ROW?', y: 300, size: 110, keyColor: '#ef5350' },
    { type: 'countdown', at: '5>+0.15', from: 3, x: 540, y: 600, r: 86 },
    // reveal and win-rate table
    { type: 'custom', space: 'screen', at: '6', until: '7-0.02', draw: (t, sc, p) => table(t, sc, p, 'IN 100 TRADES', [
      ['8 LOSSES IN A ROW', 'ABOUT 49%', '#ef5350', '6'], ['5 LOSSES IN A ROW', 'ABOUT 98%', '#E4C471', '6:5'], ['10 LOSSES IN A ROW', 'ABOUT 20%', '#E4C471', '6:10']]) },
    { type: 'custom', space: 'screen', at: '7', until: '8-0.02', draw: (t, sc, p) => table(t, sc, p, '8 IN A ROW, BY WIN RATE', [
      ['30% WIN RATE', 'ABOUT 86%', '#ef5350', '7:30%'], ['40% WIN RATE', 'ABOUT 49%', '#E4C471', '7:30%'], ['50% WIN RATE', 'ABOUT 17%', '#E4C471', '7:60%'], ['60% WIN RATE', 'ABOUT 4%', '#26a69a', '7:60%']]) },
    // damage, on the whiteboard
    { type: 'write', at: '8:1%', x: WB + 120, y: 440, size: 64, keyColor: '#1f8f84', text: '1% risk:  0.99⁸, *-8%*' },
    { type: 'write', at: '9:2%', x: WB + 120, y: 560, size: 64, keyColor: '#9c7a2e', text: '2% risk:  0.98⁸, *-15%*' },
    { type: 'write', at: '9:5', x: WB + 120, y: 680, size: 64, keyColor: '#d84341', text: '5% risk:  0.95⁸, *-34%*' },
    { id: 'm4', type: 'write', at: '9:10', x: WB + 120, y: 800, size: 64, keyColor: '#d84341', text: '10% risk:  0.9⁸, *-57%*' },
    { type: 'draw', around: 'm4', sub: '-57%', at: '9:57', shape: 'circle' },
    { type: 'title', at: '10', until: '11-0.05', text: 'RISK DECIDES\nTHE *HOLE*', y: 330 },
    // your own numbers
    { type: 'custom', space: 'screen', at: '11', until: '12-0.02', draw: (t, sc, p) => promptCard(t, p, PROMPT2, 'YOUR PROMPT', 'mp2') },
    // CTA
    { type: 'rules', at: '12', x: OUT + 140, y: 335, w: 920, title: '', gap: 95, size: 48,
      items: [
        { at: '12', text: 'Positive EV still has *streaks*' },
        { at: '12+0.15', text: 'Ask for a *Monte Carlo* run' },
        { at: '12:size', text: 'Size risk for the *streak*' },
      ] },
    { type: 'title', at: '12:streak', text: 'SIZE FOR THE *STREAK*', y: 300, size: 104 },
    { type: 'tag', space: 'screen', at: '11', x: 540, y: 1163, size: 16, text: 'CLAUDE IS MADE BY ANTHROPIC  NOT AFFILIATED' },
  ],

  sfx: [{ at: '4:shuffles', name: 'whoosh', gain: 0.6, dur: 0.8 }, { at: '6', name: 'thud', gain: 0.9 }, { at: '9:57', name: 'sad', gain: 0.6 }],
};
