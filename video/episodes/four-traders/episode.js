// Episode: 4 traders. 5 losses in a row. (idea card 2, Fikirler 2026-11-12)
// Illustrative, 5 consecutive losses, percentages of the starting balance ($10,000):
//  Red   doubles risk from 1% of start: 1+2+4+8+16 = 31%            -> $6,900
//  Blue  risks 20% of current balance:  0.8^5 = 0.32768 -> -67.2%   -> $3,277
//  Green risks 1% of current balance:   0.99^5 = 0.95099 -> -4.9%   -> $9,510
//  Gold  halves risk from 1% of start:  1+0.5+0.25+0.125+0.0625 = 1.94% -> $9,806
const START = 10000;
const STEPS = {
  red: [9900, 9700, 9300, 8500, 6900],
  blue: [8000, 6400, 5120, 4096, 3276.8],
  green: [9900, 9801, 9702.99, 9605.9601, 9509.9],
  gold: [9900, 9850, 9825, 9812.5, 9806.25],
};
const COL = { red: '#ef5350', blue: '#5c7cfa', green: '#26a69a', gold: '#E4C471' };
const TIE = { red: '#c62828', blue: '#3b5bdb', green: '#1f8f84', gold: '#9c7a2e' };
const NAMES = ['red', 'blue', 'green', 'gold'];
const LANE = [165, 455, 745, 1035];
// words of each bull's line that mark its 5 losses
const LOSS_WORDS = {
  red: ['2:doubles', '2:bet', '2:after', '2:every', '2:loss'],
  blue: ['3:bets', '3:big', '3:20%', '3:account', '3:time'],
  green: ['4:risks', '4:1%', '4:of', "4:what's", '4:left'],
  gold: ['5:cuts', '5:risk', '5:half', '5:after', '5:loss'],
};
const LINE = { red: 2, blue: 3, green: 4, gold: 5 };
const FINAL = { red: '-31%', blue: '-67%', green: '-4.9%', gold: '-1.94%' };
const MOOD = { red: 'shocked', blue: 'sad', green: 'happy', gold: 'smug' };

const counters = [];
NAMES.forEach((n, k) => {
  // quad: all four drop together in the first seconds (shock first)
  counters.push({ type: 'counter', at: 0.05, until: '2+0.2', x: LANE[k], y: 790, w: 250, size: 64, label: n.toUpperCase(), accent: COL[n],
    keys: [{ at: 0.4, v: START }, ...STEPS[n].map((v, i) => ({ at: 0.75 + i * 0.32, v, ease: 'out' }))], sfx: false });
  // track: each one replays on its own line
  counters.push({ type: 'counter', at: '2', until: '6+0.3', x: 1200 + LANE[k], y: 790, w: 250, size: 64, label: n.toUpperCase(), accent: COL[n],
    // hold each value until 0.15 s before the next loss word, then drop on the word
    keys: [{ at: '2', v: START }, ...STEPS[n].flatMap((v, i) => [
      { at: `${LOSS_WORDS[n][i]}-0.15`, v: i ? STEPS[n][i - 1] : START },
      { at: LOSS_WORDS[n][i], v, ease: 'out' },
    ])], sfx: false });
  // stage: final balances
  counters.push({ type: 'counter', at: '7', x: 3600 + LANE[k], y: 790, w: 250, size: 64, label: n.toUpperCase(), accent: COL[n],
    keys: [{ at: 0, v: STEPS[n][4] }], sfx: false });
});

const bull = (n, k) => ({
  kind: 'bull', id: n, tie: TIE[n],
  path: [
    { at: 0, x: LANE[k], y: 1300, face: k < 2 ? 1 : -1, scale: 0.6 },
    { at: '2+0.1', x: 1200 + LANE[k], move: 0.7 },
    ...(n === 'gold' ? [{ at: '6+0.15', x: 3340, face: -1, scale: 0.8, move: 0.8 }] : []),
    { at: '7+0.15', x: 3600 + LANE[k], face: k < 2 ? 1 : -1, scale: 0.6, move: 0.8 },
  ],
  moods: [{ at: 0, mood: 'determined' }, { at: 1.6, mood: 'worried' }, { at: '2', mood: 'neutral' },
    { at: LOSS_WORDS[n][0], mood: 'worried' }, { at: `${LINE[n]}:down`, mood: MOOD[n] },
    ...(n === 'gold' ? [{ at: '6', mood: 'think' }, { at: '6:rule', mood: 'determined' }] : []),
    { at: '7', mood: 'happy' }],
  looks: [{ at: 0, look: 'up' }, { at: 1.6, look: 'cam' }, { at: LOSS_WORDS[n][0], look: 'up' }, { at: `${LINE[n]}:down`, look: 'cam' },
    ...(n === 'gold' ? [{ at: '6', look: 'left' }, { at: '6:rule', look: 'cam' }] : [])],
  actions: [
    { at: 0.75, do: 'sweat', dur: 1.6 },
    ...LOSS_WORDS[n].map((w) => ({ at: w, do: 'shake', dur: 0.28 })),
    { at: `${LINE[n]}:down`, do: n === 'red' || n === 'blue' ? 'facepalm' : 'bounce', dur: 0.9 },
    ...(n === 'gold' ? [{ at: '6', do: 'write', dur: 2.6 }] : []),
    { at: `7:${['which', 'one', 'are', 'you'][k]}`, do: 'jump', h: 90, sfx: false },
    { at: '7:comment', do: 'wave', dur: 2.0 },
  ],
});

export default {
  id: 'four-traders',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.8,
  narrator: 'gold',

  lines: [
    { say: 'Four traders. The same five losses in a row. Who survives?',
      caption: '*4 traders*. The same *5 losses* in a row. Who *survives*?', pauseAfter: 0.35 },
    { say: 'Red doubles the bet after every loss. Down thirty one percent.',
      caption: '*Red* doubles the bet after every loss. Down *31%*.' },
    { say: 'Blue bets big. Twenty percent of the account, every time. Down sixty seven.',
      caption: '*Blue* bets big. *20%* of the account, every time. Down *67%*.' },
    { say: "Green risks one percent of what's left. Down under five.",
      caption: "*Green* risks *1%* of what's left. Down under *5%*." },
    { say: 'Gold cuts the risk in half after each loss. Down under two.',
      caption: '*Gold* cuts the risk in half after each loss. Down under *2%*.', pauseAfter: 0.35 },
    { say: 'Same market. Same mistakes. The rule decided the damage.',
      caption: 'Same market. Same mistakes. The *rule* decided the damage.', pauseAfter: 0.35 },
    { say: 'Which one are you? Comment your color.',
      caption: 'Which one are you? *Comment your color*.' },
  ],

  world: [
    { set: 'quad', x: 0 },
    { set: 'track', x: 1200, opts: { lanes: LANE } },
    { set: 'whiteboard', x: 2400 },
    { set: 'stage', x: 3600, opts: { spots: LANE } },
  ],

  // cam.y = 1300 - 330 / zoom
  camera: [
    { at: 0, x: 600, y: 925, zoom: 0.88, push: 0.015 },
    { at: '2+0.1', x: 1800, y: 925, zoom: 0.88, move: 0.7, push: 0.01 },
    { at: '3', x: 1800, y: 921, zoom: 0.87, move: 0.5, push: 0.01 },
    { at: '4', x: 1800, y: 925, zoom: 0.88, move: 0.5, push: 0.01 },
    { at: '5', x: 1800, y: 921, zoom: 0.87, move: 0.5, push: 0.01 },
    { at: '6+0.15', x: 3010, y: 956, zoom: 0.96, move: 0.8 },
    { at: '7+0.15', x: 4200, y: 925, zoom: 0.88, move: 0.8, push: 0.01 },
  ],
  shake: [{ at: '2:down', amp: 10 }, { at: '3:down', amp: 14 }],

  actors: NAMES.map(bull),

  props: [
    { type: 'title', at: 0.02, until: '1>', text: 'WHO SURVIVES\n*5 LOSSES?*', y: 325, sfx: 'bell' },
    { type: 'tag', at: 0.4, until: '2+0.2', x: 600, y: 470, size: 19, text: 'ILLUSTRATIVE  $10,000 START  5 LOSSES IN A ROW' },
    { type: 'tag', at: '2+0.3', until: '6+0.3', x: 1800, y: 470, size: 19, text: 'ILLUSTRATIVE  $10,000 START  5 LOSSES IN A ROW' },
    ...counters,
    // spotlight on the bull whose line is playing
    ...NAMES.map((n, k) => ({ type: 'custom', layer: 'back', at: `${LINE[n]}`, until: n === 'gold' ? '6' : `${LINE[n] + 1}`, draw: (t, sc, p) => {
      const o = Math.min(1, (t - p._at) / 0.25, (p._until - t) / 0.25);
      const x = 1200 + LANE[k], c = COL[n];
      return `<g opacity="${(o * 0.9).toFixed(2)}"><path d="M${x - 40} 180 L ${x - 175} 1300 L ${x + 175} 1300 L ${x + 40} 180 Z" fill="${c}" opacity="0.22"/>
        <ellipse cx="${x}" cy="1306" rx="185" ry="30" fill="${c}" opacity="0.35"/></g>`;
    } })),
    ...NAMES.map((n) => ({ type: 'title', at: `${LINE[n]}:down`, until: n === 'gold' ? '6-0.7' : `${LINE[n] + 1}`, text: `${n.toUpperCase()}  *${FINAL[n]}*`, keyColor: COL[n], y: 300, size: 120 })),

    // whiteboard
    { id: 'w1', type: 'write', at: '6', dur: 0.7, x: 2500, y: 440, size: 66, maxW: 790, keyColor: '#d84341', text: 'Red  1+2+4+8+16 = *-31%*' },
    { id: 'w2', type: 'write', at: '6+0.6', dur: 0.7, x: 2500, y: 560, size: 66, maxW: 790, keyColor: '#3b5bdb', text: 'Blue  0.8⁵ = 0.328, so *-67%*' },
    { id: 'w3', type: 'write', at: '6:mistakes', dur: 0.7, x: 2500, y: 680, size: 66, maxW: 790, keyColor: '#1f8f84', text: 'Green  0.99⁵ = 0.951, so *-4.9%*' },
    { id: 'w4', type: 'write', at: '6:rule', dur: 0.6, x: 2500, y: 800, size: 66, maxW: 790, keyColor: '#9c7a2e', text: 'Gold  1+0.5+0.25+0.125+0.0625' },
    { id: 'w5', type: 'write', at: '6:decided', dur: 0.4, x: 2560, y: 905, size: 66, keyColor: '#9c7a2e', text: '= *-1.94%*' },
    { type: 'draw', around: 'w5', sub: '-1.94%', at: '6:damage', shape: 'circle', color: '#9c7a2e' },
    { type: 'tag', at: '6', until: '7+0.3', x: 2880, y: 990, size: 19, text: 'ILLUSTRATIVE  % OF STARTING BALANCE' },

    // CTA
    { type: 'title', at: '7', until: '7:comment-0.05', text: 'WHICH ONE\nARE *YOU?*', y: 325, sfx: 'pop' },
    { type: 'title', at: '7:comment', text: '*COMMENT* YOUR COLOR', y: 300, size: 110, icon: 'comment', sfx: 'ding' },
    { type: 'confetti', at: '7:comment', x: 540, y: 760, n: 120 },
  ],

  sfx: [
    ...NAMES.flatMap((n) => LOSS_WORDS[n].map((w) => ({ at: w, name: 'thud', gain: 0.55 }))),
    ...[0, 1, 2, 3, 4].map((i) => ({ at: 0.75 + i * 0.32, name: 'thud', gain: 0.6 })),
    { at: '3:down', name: 'sad', gain: 0.7 },
    { at: '5:down', name: 'ding', gain: 0.7 },
  ],
};
