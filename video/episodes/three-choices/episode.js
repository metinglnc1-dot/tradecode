// Episode: Same $500 win. Three traders. (idea card 2, Fikirler 2026-11-13)
// Illustrative: $10,000 start, +$500 win, then one losing trade.
//  A takes $250 out, keeps 1% risk:  $10,250 - 1% ($102.50) = $10,147.50, plus $250 aside
//  B changes nothing, 1% risk:       $10,500 - 1% ($105)    = $10,395
//  C risks 5% after the win:         $10,500 - 5% ($525)    = $9,975, below the $10,000 start
// No product.
const ST = 0, TR = 1200, WB = 2400, END = 3600;
const LANE = [240, 600, 960];
const NAMES = ['A', 'B', 'C'];
const TIE = ['#1f8f84', '#3b5bdb', '#c62828'];
const COL = ['#26a69a', '#5c7cfa', '#ef5350'];
const AFTER_WIN = [10250, 10500, 10500];
const AFTER_LOSS = [10147.5, 10395, 9975];
const LINE = [2, 3, 4];

const counters = [];
NAMES.forEach((n, k) => {
  counters.push({ type: 'counter', at: 0.3, until: '2+0.2', x: ST + LANE[k], y: 760, w: 330, size: 56, label: n, accent: COL[k],
    keys: [{ at: 0.3, v: 10000 }, { at: '1:win-0.1', v: 10000 }, { at: '1:win+0.3', v: 10500, ease: 'out' }], sfx: false });
  counters.push({ type: 'counter', at: '2', until: '6+0.3', x: TR + LANE[k], y: 760, w: 330, size: 54, label: n, accent: COL[k], decimals: k === 0 ? 2 : 0,
    sub: k === 0 ? '+$250 SET ASIDE' : k === 1 ? 'RISK 1%' : 'RISK 5%',
    keys: [{ at: '2', v: 10500 }, { at: `${LINE[k]}+0.3`, v: 10500 }, { at: `${LINE[k]}+0.8`, v: AFTER_WIN[k], ease: 'out' },
      { at: '5:loses-0.1', v: AFTER_WIN[k] }, { at: '5:loses+0.5', v: AFTER_LOSS[k], ease: 'out' }], sfx: false });
});

const bull = (n, k) => ({
  kind: 'bull', id: n, tie: TIE[k],
  path: [
    { at: 0, x: ST + LANE[k], y: 1300, face: k < 1 ? 1 : -1, scale: 0.62 },
    { at: '2+0.1', x: TR + LANE[k], move: 0.7 },
    ...(k === 2 ? [{ at: '6+0.15', x: WB + 970, face: -1, scale: 0.8, move: 0.8 }] : []),
    { at: '7+0.15', x: END + LANE[k], face: k < 1 ? 1 : -1, scale: 0.62, move: 0.8 },
  ],
  moods: [
    { at: 0, mood: 'neutral' }, { at: '1:win', mood: 'excited' }, { at: '2', mood: 'neutral' },
    { at: `${LINE[k]}`, mood: k === 2 ? 'smug' : 'confident' },
    { at: '5:loses', mood: k === 2 ? 'shocked' : 'think' }, { at: k === 2 ? '6:c' : '6', mood: k === 2 ? 'sad' : 'happy' },
    { at: '7', mood: 'happy' },
  ],
  looks: [{ at: 0, look: 'cam' }, { at: '1:win', look: 'up' }, { at: '2', look: 'cam' }, { at: '5:loses', look: 'up' }, { at: '6', look: 'cam' }],
  actions: [
    { at: '1:win', do: 'jump', h: 80, sfx: false },
    ...(k === 0 ? [{ at: '2:takes', do: 'grab', dur: 1.0 }] : []),
    ...(k === 1 ? [{ at: '3:nothing', do: 'shrug', dur: 0.9 }] : []),
    ...(k === 2 ? [{ at: '4:hot', do: 'dance', dur: 1.4 }, { at: '5:loses', do: 'sweat', dur: 1.6 }] : []),
    { at: '5:loses', do: 'shake', dur: 0.3 },
    { at: `7:${['comment', 'a', 'b'][k]}`, do: 'jump', h: 90, sfx: false },
    { at: '7:comment', do: 'wave', dur: 2.0 },
  ],
});

export default {
  id: 'three-choices',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.8,
  narrator: 'B',

  lines: [
    { say: 'Same five hundred dollar win. Three traders. Which one are you?',
      caption: 'Same *$500 win*. *3 traders*. Which one are *you*?', pauseAfter: 0.3 },
    { say: 'Trader A, takes half the profit out and keeps the same risk.',
      caption: 'Trader *A* takes *half* the profit out and keeps the *same risk*.' },
    { say: 'Trader B, changes nothing.',
      caption: 'Trader *B* changes *nothing*.' },
    { say: 'Trader C, feels hot, and risks five times more on the next trade.',
      caption: 'Trader *C* feels *hot*, and risks *5 times* more on the next trade.', pauseAfter: 0.3 },
    { say: 'Then the next trade loses.',
      caption: 'Then the next trade *loses*.', pauseAfter: 0.5 },
    { say: 'Trader A, has about ten thousand one hundred fifty, plus two fifty set aside. Trader B, has ten thousand three ninety five. Trader C, has nine thousand nine seventy five. Below the start.',
      caption: 'Trader *A* has about *$10,150*, plus *$250* set aside. Trader *B* has *$10,395*. Trader *C* has *$9,975*. Below the *start*.', pauseAfter: 0.3 },
    { say: 'Same win. Different choice. Comment A, B or C.',
      caption: 'Same win. Different *choice*. *Comment A, B or C*.' },
  ],

  world: [
    { set: 'stage', x: ST, opts: { spots: LANE } },
    { set: 'track', x: TR, opts: { lanes: LANE } },
    { set: 'whiteboard', x: WB },
    { set: 'stage', x: END, opts: { spots: LANE } },
  ],

  camera: [
    { at: 0, x: ST + 600, y: 925, zoom: 0.88, push: 0.01 },
    { at: '2+0.1', x: TR + 600, y: 925, zoom: 0.88, move: 0.7, push: 0.006 },
    { at: '6+0.15', x: WB + 610, y: 956, zoom: 0.95, move: 0.8, push: 0.002 },
    { at: '7+0.15', x: END + 600, y: 925, zoom: 0.88, move: 0.8, push: 0.01 },
  ],
  shake: [{ at: '5:loses', amp: 12 }],

  actors: NAMES.map(bull),

  props: [
    { type: 'title', at: 0.02, until: '2-0.05', text: 'SAME *+$500*\n3 CHOICES', y: 330, sfx: 'bell' },
    { type: 'tag', space: 'screen', at: 0.4, until: '7', x: 540, y: 1163, size: 16, text: 'ILLUSTRATIVE  $10,000 START  +$500 WIN  THEN ONE LOSS' },
    ...counters,
    // spotlight on the trader whose line is playing
    ...NAMES.map((n, k) => ({ type: 'custom', layer: 'back', at: `${LINE[k]}`, until: `${LINE[k] + 1}`, draw: (t, sc, p) => {
      const o = Math.min(1, (t - p._at) / 0.25, (p._until - t) / 0.25);
      const x = TR + LANE[k], c = COL[k];
      return `<g opacity="${(o * 0.9).toFixed(2)}"><path d="M${x - 40} 180 L ${x - 175} 1300 L ${x + 175} 1300 L ${x + 40} 180 Z" fill="${c}" opacity="0.22"/>
        <ellipse cx="${x}" cy="1306" rx="185" ry="30" fill="${c}" opacity="0.35"/></g>`;
    } })),
    { type: 'title', at: '2', until: '3-0.05', text: '*A*  HALF OUT', y: 300, size: 120, keyColor: '#26a69a' },
    { type: 'title', at: '3', until: '4-0.05', text: '*B*  NO CHANGE', y: 300, size: 120, keyColor: '#5c7cfa' },
    { type: 'title', at: '4', until: '5-0.05', text: '*C*  RISK x5', y: 300, size: 120, keyColor: '#ef5350' },
    { type: 'title', at: '5:loses', until: '6-0.05', text: 'ONE *LOSS*', y: 300, size: 120, keyColor: '#ef5350' },

    // whiteboard math
    { id: 'w1', type: 'write', at: '6', dur: 0.6, x: WB + 110, y: 450, size: 58, maxW: 800, keyColor: '#1f8f84', text: 'A  10,250 - 1% = *10,147.50*' },
    { id: 'w0', type: 'write', at: '6+0.5', dur: 0.4, x: WB + 160, y: 540, size: 46, color: '#5b6680', text: '+ $250 set aside' },
    { id: 'w2', type: 'write', at: '6:b', dur: 0.6, x: WB + 110, y: 660, size: 58, maxW: 800, keyColor: '#3b5bdb', text: 'B  10,500 - 1% = *10,395*' },
    { id: 'w3', type: 'write', at: '6:c', dur: 0.6, x: WB + 110, y: 790, size: 58, maxW: 800, keyColor: '#d84341', text: 'C  10,500 - 5% = *9,975*' },
    { type: 'draw', around: 'w3', sub: '9,975', at: '6:start', shape: 'circle' },

    // CTA
    { type: 'title', at: '7', text: '*COMMENT*  A, B OR C', y: 300, size: 104, icon: 'comment', sfx: 'ding' },
    { type: 'custom', at: '7', draw: (t, sc, p) => NAMES.map((n, k) => {
      const q = Math.min(1, Math.max(0, (t - p._at - k * 0.15) / 0.3)), s = q < 1 ? 0.4 + 0.7 * q : 1.1 - 0.1 * Math.min(1, (t - p._at - k * 0.15 - 0.3) / 0.2);
      return q <= 0 ? '' : `<g transform="translate(${END + LANE[k]} 680) scale(${s.toFixed(3)})"><circle r="100" fill="${COL[k]}" stroke="#141414" stroke-width="10" filter="url(#shadow)"/>
        <text data-qa="world" data-g="abc${k}" x="0" y="44" text-anchor="middle" font-family="Luckiest Guy" font-size="130" fill="#fff" stroke="#141414" stroke-width="10" paint-order="stroke">${n}</text></g>`;
    }).join('') },
  ],

  sfx: [
    { at: '1:win', name: 'coin', gain: 0.8 }, { at: '1:win+0.2', name: 'coin', gain: 0.6 },
    { at: '2:takes', name: 'coin', gain: 0.6 },
    { at: '4:hot', name: 'whoosh', gain: 0.5, dur: 0.6 },
    { at: '5:loses', name: 'thud', gain: 0.9 }, { at: '6:below', name: 'sad', gain: 0.6 },
  ],
};
