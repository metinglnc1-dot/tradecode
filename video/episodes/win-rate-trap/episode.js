// Episode: A 30% win rate can beat 70%. (idea card 3, Fikirler 2026-11-13)
// Illustrative, R = risk per trade = $100, 100 trades:
//  Left  70% wins at +0.3R, losses -1R: 0.7 x 0.3 - 0.3 x 1 = -0.09R per trade, -9R = -$900
//  Right 30% wins at +3R,   losses -1R: 0.3 x 3 - 0.7 x 1 = +0.2R per trade,  +20R = +$2,000
//  Break-even win rate = 1 / (1 + reward:risk): 0.3R needs 76.9%, 3R needs 25%.
// Guess before the reveal: a silent 3-2-1 after the question. No product.
const DUO = 0, TR = 1200, WB = 2400;
const L = 300, R = 900;
const TALLY = { left: [1, 1, 0, 1, 1, 1, 0, 1, 1, 0], right: [0, 1, 0, 0, 0, 1, 0, 0, 1, 0] };

const tally = (t, sc, x, marks) => {
  const a = sc.tl.at('1:wins');
  return marks.map((w, i) => {
    const q = Math.min(1, Math.max(0, (t - a - i * 0.12) / 0.2));
    if (q <= 0) return '';
    const cx = x - 180 + i * 40;
    return `<g transform="translate(${cx} 560) scale(${(q * 0.8).toFixed(2)})">${w
      ? '<circle r="21" fill="#26a69a"/><path d="M-9 1 L-2 8 L10 -7" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>'
      : '<circle r="21" fill="#ef5350"/><path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'}</g>`;
  }).join('');
};

// running total over 100 trades, drawn as a dollar figure
const total = (t, sc, x, end, col) => {
  const a = sc.tl.at('5:after'), b = a + 1.8;
  const q = Math.max(0, Math.min(1, (t - a) / (b - a)));
  const v = Math.round(end * (1 - Math.pow(1 - q, 3)));
  const txt = (v < 0 ? '-$' : '+$') + Math.abs(v).toLocaleString('en-US');
  const o = Math.min(1, Math.max(0, (t - sc.tl.at('5') + 0.1) / 0.3));
  return `<g opacity="${o.toFixed(2)}"><rect x="${x - 230}" y="420" width="460" height="190" rx="26" fill="#0f1420" fill-opacity="0.94" stroke="${col}" stroke-width="5" filter="url(#shadow)"/>
    <text data-qa="world" data-g="tot${x}" x="${x}" y="470" text-anchor="middle" font-family="Inter" font-weight="800" font-size="28" letter-spacing="3" fill="${col}">AFTER 100 TRADES</text>
    <text data-qa="world" data-g="tot${x}" x="${x}" y="565" text-anchor="middle" font-family="Inter" font-weight="900" font-size="84" fill="${q > 0 ? col : '#fff'}">${q > 0 ? txt : '?'}</text></g>`;
};

const rule = (x, win, col) => `<rect x="${x - 230}" y="660" width="460" height="170" rx="24" fill="#0f1420" fill-opacity="0.94" stroke="#334058" stroke-width="4"/>
  <text data-qa="world" data-g="rule${x}" x="${x - 200}" y="728" font-family="Inter" font-weight="900" font-size="46" fill="#26a69a">WIN ${win}</text>
  <text data-qa="world" data-g="rule${x}" x="${x - 200}" y="800" font-family="Inter" font-weight="900" font-size="46" fill="#ef5350">LOSS -1R</text>
  <rect x="${x + 110}" y="690" width="90" height="${win === '+3R' ? 110 : 22}" transform="translate(0 ${win === '+3R' ? 0 : 88})" rx="8" fill="#26a69a" opacity="0.8"/>`;

export default {
  id: 'win-rate-trap',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'right',

  lines: [
    { say: 'This trader wins seven out of ten. This one wins only three.',
      caption: 'This trader wins *7 out of 10*. This one wins only *3*.', pauseAfter: 0.2 },
    { say: 'Who is up after a hundred trades? Comment left or right before the reveal.',
      caption: 'Who is up after *100 trades*? Comment *LEFT* or *RIGHT* before the reveal.', pauseAfter: 3.4 },
    { say: 'Left wins small, point three R. Loses one R.',
      caption: '*Left* wins small, *0.3R*. Loses *1R*.' },
    { say: 'Right wins three R. Loses one R.',
      caption: '*Right* wins *3R*. Loses *1R*.', pauseAfter: 0.3 },
    { say: 'After a hundred trades, left is down nine hundred dollars. Right is up two thousand.',
      caption: 'After *100 trades*, *left* is down *$900*. *Right* is up *$2,000*.', pauseAfter: 0.4 },
    { say: 'Win rate alone means nothing. Size of wins against losses decides it.',
      caption: '*Win rate* alone means nothing. Size of *wins* against *losses* decides it.', pauseAfter: 0.3 },
    { say: 'Left needs about seventy seven percent just to break even. Save this.',
      caption: '*Left* needs about *77%* just to *break even*. *Save this*.' },
  ],

  world: [
    { set: 'duo', x: DUO, opts: { colors: ['#26a69a', '#E4C471'] } },
    { set: 'track', x: TR, opts: { lanes: [L, R] } },
    { set: 'whiteboard', x: WB },
  ],

  camera: [
    { at: 0, x: DUO + 600, y: 953, zoom: 0.95, push: 0.008 },
    { at: '3+0.1', x: TR + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.004 },
    { at: '6+0.15', x: WB + 610, y: 956, zoom: 0.95, move: 0.8, push: 0.002 },
  ],

  actors: [
    { kind: 'bull', id: 'left', tie: '#1f8f84',
      path: [{ at: 0, x: DUO + L, y: 1300, face: 1, scale: 0.85 }, { at: '3+0.1', x: TR + L, scale: 0.7, move: 0.8 }],
      moods: [{ at: 0, mood: 'excited' }, { at: '2', mood: 'smug' }, { at: '5:left', mood: 'shocked' }, { at: '6', mood: 'sad' }],
      looks: [{ at: 0, look: 'cam' }, { at: '5', look: 'up' }, { at: '6', look: 'right' }],
      actions: [{ at: '1:wins', do: 'cheer', dur: 1.6 }, { at: '5:down', do: 'facepalm', dur: 1.0 }, { at: '7:break', do: 'sweat', dur: 1.4 }],
    },
    { kind: 'bull', id: 'right', tie: '#9c7a2e',
      path: [{ at: 0, x: DUO + R, y: 1300, face: -1, scale: 0.85 }, { at: '3+0.1', x: TR + R, scale: 0.7, move: 0.8 }, { at: '6+0.15', x: WB + 970, move: 0.8 }],
      moods: [{ at: 0, mood: 'neutral' }, { at: '1:only', mood: 'think' }, { at: '4', mood: 'determined' }, { at: '5:right', mood: 'happy' }, { at: '6', mood: 'confident' }],
      looks: [{ at: 0, look: 'left' }, { at: '2', look: 'cam' }, { at: '5', look: 'up' }, { at: '6', look: 'left' }, { at: '7:save', look: 'cam' }],
      actions: [{ at: '1:only', do: 'shrug', dur: 0.9 }, { at: '2:comment', do: 'point', dur: 1.0 }, { at: '5:up', do: 'jump', h: 120 }, { at: '6', do: 'write', dur: 3.0 }, { at: '7:save', do: 'cheer', dur: 1.2 }],
    },
  ],

  props: [
    { type: 'title', at: 0.02, until: '2-0.05', text: '*70%* VS *30%*\nWIN RATE', y: 330, sfx: 'bell' },
    { type: 'custom', at: 0.3, until: '3+0.4', draw: (t, sc) => tally(t, sc, DUO + L, TALLY.left) + tally(t, sc, DUO + R, TALLY.right) },
    { type: 'custom', at: '1:wins', until: '3+0.4', draw: (t, sc, p) => {
      const o = Math.min(1, (t - p._at) / 0.3);
      return `<g opacity="${o.toFixed(2)}"><text data-qa="world" data-g="wr" x="${DUO + L}" y="630" text-anchor="middle" font-family="Inter" font-weight="900" font-size="44" fill="#26a69a">WINS 70%</text>
        <text data-qa="world" data-g="wr2" x="${DUO + R}" y="630" text-anchor="middle" font-family="Inter" font-weight="900" font-size="44" fill="#E4C471">WINS 30%</text></g>`;
    } },
    // guess
    { type: 'title', at: '2', until: '3-0.05', text: '*LEFT* OR *RIGHT?*', y: 300, size: 120, icon: 'comment' },
    { type: 'countdown', at: '2>+0.15', from: 3, x: 540, y: 1010, r: 80 },
    { type: 'tag', space: 'screen', at: 0.4, until: '6', x: 540, y: 1163, size: 16, text: 'ILLUSTRATIVE  R = $100 RISK PER TRADE' },

    // the two rule sets and the 100-trade totals
    { type: 'custom', at: '3', until: '6+0.4', draw: (t, sc) => {
      const a = Math.min(1, Math.max(0, (t - sc.tl.at('3')) / 0.3)), b = Math.min(1, Math.max(0, (t - sc.tl.at('4')) / 0.3));
      return `<g opacity="${a.toFixed(2)}">${rule(TR + L, '+0.3R', '#26a69a')}</g><g opacity="${b.toFixed(2)}">${rule(TR + R, '+3R', '#E4C471')}</g>`;
    } },
    { type: 'custom', at: '5', until: '6+0.4', draw: (t, sc) => total(t, sc, TR + L, -900, '#ef5350') + total(t, sc, TR + R, 2000, '#26a69a') },
    { type: 'title', at: '5:right', until: '6-0.05', text: '*30%* WINS', y: 300, size: 120 },

    // whiteboard
    { id: 'w1', type: 'write', at: '6', dur: 0.7, x: WB + 120, y: 450, size: 54, maxW: 790, keyColor: '#d84341', text: '0.7×0.3 - 0.3×1 = *-0.09R*' },
    { id: 'w2', type: 'write', at: '6:size', dur: 0.7, x: WB + 120, y: 560, size: 54, maxW: 790, keyColor: '#1f8f84', text: '0.3×3 - 0.7×1 = *+0.2R*' },
    { id: 'w3', type: 'write', at: '7', dur: 0.6, x: WB + 120, y: 700, size: 48, maxW: 790, color: '#5b6680', text: 'Break even = 1 ÷ (1 + reward)' },
    { id: 'w4', type: 'write', at: '7:needs', dur: 0.6, x: WB + 120, y: 800, size: 54, maxW: 790, keyColor: '#d84341', text: '0.3R wins need *76.9%*' },
    { id: 'w5', type: 'write', at: '7:even', dur: 0.5, x: WB + 120, y: 900, size: 54, maxW: 790, keyColor: '#1f8f84', text: '3R wins need *25%*' },
    { type: 'draw', around: 'w4', sub: '76.9%', at: '7:even', shape: 'underline' },
    { type: 'title', at: '7:save', text: '*SAVE THIS*', y: 300, size: 120, icon: 'bookmark', sfx: 'ding' },
  ],

  sfx: [
    ...Array.from({ length: 10 }, (_, i) => ({ at: `1:wins+${(i * 0.12).toFixed(2)}`, name: 'tick', gain: 0.6 })),
    { at: '5:down', name: 'sad', gain: 0.6 }, { at: '5:up', name: 'coin', gain: 0.8 },
  ],
};
