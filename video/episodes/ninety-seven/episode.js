// Episode: 97 out of 100. (idea card 5, Fikirler 2026-11-12)
// Source 1 (SSRN 2019, "Day Trading for a Living?", abstract read via Crossref, DOI 10.2139/ssrn.3423101):
//   all individuals who began day trading Brazilian equity futures between 2013 and 2015;
//   97% of those who persisted for more than 300 days lost money; only 1.1% earned more than the minimum wage.
// Source 2 (ESMA 2018, notice of product intervention on CFDs): "Between 74-89% of retail investor accounts
//   lose money when trading CFDs".
const TR = 0, WB = 1200, OUT = 2400;

// 10 x 10 grid of tiny bull heads on the scoreboard; 97 turn grey one by one, 3 stay gold
const ORDER = (() => {
  let s = 12345; const a = [...Array(100).keys()];
  for (let i = 99; i > 0; i--) { s = (s * 1103515245 + 12345) & 0x7fffffff; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a; // first 97 lose, last 3 stay gold
})();
const head = (x, y, lost, glow) => {
  const c = lost ? '#4a5163' : '#E4C471', o = lost ? '#2a2f3d' : '#6b4f1d';
  return `<g transform="translate(${x} ${y})">
    ${glow ? `<circle r="38" fill="#E4C471" opacity="0.25"/>` : ''}
    <path d="M-16 -18 Q -30 -30 -30 -42 Q -20 -30 -8 -26 Z M16 -18 Q 30 -30 30 -42 Q 20 -30 8 -26 Z" fill="${lost ? '#6b7183' : '#F6E6B0'}" stroke="${o}" stroke-width="2.5"/>
    <circle r="24" fill="${c}" stroke="${o}" stroke-width="3"/>
    <ellipse cy="9" rx="14" ry="9" fill="${lost ? '#5d6476' : '#F6E6B0'}"/>
    ${lost ? `<path d="M-12 -8 l6 6 m0 -6 l-6 6 M6 -8 l6 6 m0 -6 l-6 6" stroke="#1a1d26" stroke-width="2.5"/>`
           : `<circle cx="-8" cy="-5" r="3.5" fill="#1a1208"/><circle cx="8" cy="-5" r="3.5" fill="#1a1208"/>`}
  </g>`;
};
const board = (t, sc) => {
  const a = sc.tl.at('2:97'), b = sc.tl.at('2>');
  const lostN = Math.max(0, Math.min(97, Math.floor(((t - a) / Math.max(0.6, b - a)) * 97)));
  const lostSet = new Set(ORDER.slice(0, lostN));
  const X = TR + 140, Y = 420, step = 66;
  let s = `<rect x="${X - 30}" y="${Y - 50}" width="${step * 10 + 30}" height="${step * 10 + 30}" rx="24" fill="#0f1220" stroke="#E4C471" stroke-width="6"/>`;
  for (let i = 0; i < 100; i++) {
    const lost = lostSet.has(i), done = lostN >= 97 && !lost;
    s += head(X + (i % 10) * step + 6, Y + Math.floor(i / 10) * step + 10, lost, done);
  }
  const shown = t < a ? 100 : 100 - lostN;
  s += `<text data-qa="world" data-g="score" x="${X + step * 5 - 15}" y="${Y + step * 10 + 50}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40" fill="${shown <= 3 ? '#E4C471' : '#fff'}">NOT LOSING: ${shown} / 100</text>`;
  return s;
};

export default {
  id: 'ninety-seven',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.8,
  narrator: 'bull',

  lines: [
    { say: 'A hundred day traders. They keep at it for more than three hundred days.',
      caption: '*100* day traders. They keep at it for more than *300 days*.' },
    { say: 'Ninety seven of them lose money.',
      caption: '*97* of them *lose money*.', pauseAfter: 0.4 },
    { say: 'Real data: Brazilian day traders who started between 2013 and 2015.',
      caption: '*Real data*: Brazilian day traders who started between *2013* and *2015*.' },
    { say: 'Only about one in a hundred earned more than the minimum wage.',
      caption: 'Only about *1 in 100* earned more than the *minimum wage*.' },
    { say: "Staying longer didn't save them. Persistence is not an edge.",
      caption: "Staying longer didn't save them. *Persistence* is not an *edge*.", pauseAfter: 0.3 },
    { say: 'In Europe, regulators report seventy four to eighty nine percent of retail CFD accounts lose money.',
      caption: 'In Europe, regulators report *74 to 89%* of retail CFD accounts *lose money*.', pauseAfter: 0.35 },
    { say: 'Trade less. Plan more. Track your real results.',
      caption: 'Trade *less*. Plan *more*. Track your *real results*.' },
    { say: 'Send this to a friend who just started day trading.',
      caption: '*Send this* to a friend who just started day trading.' },
  ],

  world: [
    { set: 'track', x: TR, opts: { lanes: [] } },
    { set: 'whiteboard', x: WB },
    { set: 'outdoor', x: OUT },
  ],

  camera: [
    { at: 0, x: TR + 600, y: 925, zoom: 0.88, push: 0.012 },
    { at: '3+0.15', x: WB + 610, y: 956, zoom: 0.95, move: 0.8, push: 0.003 },
    { at: '7+0.15', x: OUT + 600, y: 953, zoom: 0.95, move: 0.8 },
  ],
  shake: [{ at: '2>', amp: 8 }],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: TR + 1000, y: 1300, face: -1, scale: 0.7 },
      { at: '3+0.15', x: WB + 970, scale: 0.82, move: 0.8 },
      { at: '7+0.15', x: OUT + 820, scale: 0.92, move: 0.8 },
    ],
    moods: [
      { at: 0, mood: 'excited' }, { at: '2', mood: 'shocked' }, { at: '3', mood: 'think' }, { at: '4', mood: 'worried' },
      { at: '5', mood: 'sad' }, { at: '6', mood: 'worried' }, { at: '7', mood: 'determined' }, { at: '8', mood: 'happy' },
    ],
    looks: [{ at: 0, look: 'left' }, { at: '2>', look: 'cam' }, { at: '3', look: 'left' }, { at: '5', look: 'cam' }, { at: '6', look: 'left' }, { at: '7', look: 'cam' }],
    actions: [
      { at: '1:100', do: 'point', dur: 1.0 },
      { at: '2:97', do: 'sweat', dur: 2.0 },
      { at: '2>', do: 'facepalm', dur: 0.9 },
      { at: '3:brazilian', do: 'write', dur: 1.6 },
      { at: '4:only', do: 'write', dur: 1.2 },
      { at: '6:74', do: 'write', dur: 1.4 },
      { at: '7:less', do: 'point', dur: 0.8 },
      { at: '7:track', do: 'nod', dur: 0.6 },
      { at: '8:send', do: 'wave', dur: 2.0 },
    ],
  }],

  props: [
    { type: 'title', at: 0.02, until: '2-0.05', text: '100 DAY TRADERS.\nWHO *MAKES IT?*', y: 325, sfx: 'bell' },
    { type: 'custom', layer: 'back', at: 0.1, until: '3+0.4', draw: (t, sc) => board(t, sc) },
    { type: 'title', at: '2:97', until: '3-0.05', text: '*97* LOST MONEY', y: 300, size: 130, keyColor: '#ef5350' },

    // the data, handwritten with sources
    { id: 'd1', type: 'write', at: '3:brazilian', x: WB + 130, y: 440, size: 54, maxW: 780, color: '#5b6680', text: 'Brazil equity futures, started 2013 to 2015' },
    { id: 'd2', type: 'write', at: '3:2015>-0.3', x: WB + 130, y: 560, size: 80, keyColor: '#d84341', text: '300+ days: *97%* lost' },
    { id: 'd3', type: 'write', at: '4:only', x: WB + 130, y: 690, size: 80, keyColor: '#9c7a2e', text: '*1.1%* > minimum wage' },
    { type: 'draw', around: 'd2', sub: '97%', at: '5:persistence', shape: 'circle' },
    { type: 'tag', at: '3:brazilian', until: '6', x: WB + 480, y: 790, size: 17, text: 'SOURCE: SSRN 2019, DAY TRADING FOR A LIVING?' },
    { id: 'd4', type: 'write', at: '6:74', x: WB + 130, y: 900, size: 72, maxW: 660, keyColor: '#d84341', text: 'EU retail CFD: *74-89%* lose' },
    { type: 'tag', at: '6:74', until: '7+0.3', x: WB + 480, y: 990, size: 17, text: 'SOURCE: ESMA 2018' },

    // CTA
    { type: 'rules', at: '7', x: OUT + 140, y: 370, w: 920, title: '', gap: 95, size: 52,
      items: [
        { at: '7:less', text: 'Trade *less*' },
        { at: '7:plan', text: 'Plan *more*' },
        { at: '7:track', text: 'Track your *real results*' },
      ] },
    { type: 'title', at: '8:send', text: '*SEND THIS*', y: 300, size: 140, icon: 'send', sfx: 'ding' },
    { type: 'confetti', at: '8:send', x: 540, y: 760, n: 110 },
  ],

  sfx: [
    { at: '2:97', name: 'whoosh', gain: 0.5, dur: 1.2 },
    { at: '2>', name: 'sad', gain: 0.8 },
  ],
};
