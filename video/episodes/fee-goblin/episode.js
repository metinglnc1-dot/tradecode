// Episode: The fee goblin.
// Math (illustrative): taker fee 0.05% per side -> 0.1% of position per round trip.
// At 10x, position = 10 x margin, so 0.1% x 10 = 1% of margin per round trip.
// 20 round trips a day -> 20% of margin. Example: $1,000 margin -> $10,000 position -> $5 + $5 = $10 per trip.
export default {
  id: 'fee-goblin',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.7,
  narrator: 'bull',

  lines: [
    { say: 'Meet the scalper. Ten x leverage, twenty trades a day.',
      caption: 'Meet the *scalper*. *10x* leverage, *20 trades* a day.' },
    { say: 'But every trade has a tiny passenger. The fee goblin. About zero point zero five percent when you open. Again when you close.',
      caption: 'But every trade has a tiny *passenger*. The *fee goblin*. About *0.05%* when you *open*. Again when you *close*.',
      pauseAfter: 0.45 },
    { say: 'Point one percent per round trip, times ten x leverage, is one percent of your margin.',
      caption: '*0.1%* per round trip, times *10x* leverage, is *1%* of your margin.' },
    { say: 'Twenty trades? Twenty percent of your margin. Every single day.',
      caption: '*20 trades?* *20%* of your margin. Every single *day*.', pauseAfter: 0.6 },
    { say: 'Fewer trades. Limit orders when you can. Fees are the one loss you control.',
      caption: '*Fewer trades.* *Limit orders* when you can. Fees are the one loss you *control*.' },
    { say: 'Save this before your next scalp.',
      caption: '*Save this* before your next scalp.' },
  ],

  world: [
    { set: 'room', x: 0 },
    { set: 'exchange', x: 1200, opts: { symbol: 'BTC-PERP' } },
    { set: 'whiteboard', x: 2400 },
    { set: 'outdoor', x: 3600 },
  ],

  // Framing rule: cam.y = 1300 - 330 / zoom puts the floor just under the caption band,
  // so faces stay above the captions and titles stay above the set content.
  camera: [
    { at: 0, x: 400, y: 1056, zoom: 1.35, push: 0.02 },
    { at: '1:scalper>', x: 500, y: 1020, zoom: 1.15, move: 0.7 },
    { at: '1:20', x: 610, y: 970, zoom: 1.0, move: 0.7 },
    { at: '2:trade>+0.15', x: 1800, y: 941, zoom: 0.92, move: 1.0 },
    { at: '2:about', x: 1806, y: 953, zoom: 0.96, move: 0.8 },
    { at: '3+0.3', x: 3010, y: 956, zoom: 0.96, move: 0.85 },
    { at: '4', x: 3005, y: 925, zoom: 0.88, move: 0.6 },
    { at: '5+0.2', x: 4200, y: 953, zoom: 0.95, move: 0.8 },
    { at: '6', x: 4380, y: 1030, zoom: 1.22, move: 0.6 },
  ],
  shake: [{ at: '2:goblin', amp: 10 }, { at: '4:20%', amp: 12 }],

  actors: [
    {
      kind: 'bull', id: 'bull',
      path: [
        { at: 0, x: 300, y: 1300, face: 1 },
        { at: '2:trade>+0.15', x: 2150, face: -1, scale: 0.86, move: 1.0 },
        { at: '3+0.3', x: 3370, face: -1, scale: 0.82, move: 0.85 },
        { at: '5+0.2', x: 4420, face: -1, scale: 0.92, move: 0.8 },
      ],
      moods: [
        { at: 0, mood: 'excited' }, { at: '2:passenger', mood: 'worried' }, { at: '2:goblin', mood: 'shocked' },
        { at: '2:open', mood: 'worried' }, { at: '3', mood: 'think' }, { at: '3:1%', mood: 'shocked' },
        { at: '4:every', mood: 'sad' }, { at: '5', mood: 'determined' }, { at: '5:control', mood: 'smug' }, { at: '6', mood: 'happy' },
      ],
      looks: [
        { at: 0, look: 'right' }, { at: '1:meet', look: 'cam' }, { at: '1:20', look: 'right' }, { at: '2', look: 'cam' },
        { at: '2:goblin', look: 'left' }, { at: '2:about', look: 'upleft' }, { at: '3', look: 'left' }, { at: '3:is', look: 'cam' },
        { at: '4:every', look: 'downleft' }, { at: '5', look: 'upleft' }, { at: '5:fees', look: 'cam' },
      ],
      actions: [
        { at: 0, do: 'type', dur: 0.75 },
        { at: '1:meet', do: 'wave', dur: 0.9 },
        { at: '1:20', do: 'type', dur: 1.3 },
        { at: '1:20', do: 'sweat', dur: 1.2 },
        { at: '2:goblin', do: 'jump', h: 90 },
        { at: '2:about', do: 'point', dur: 1.0 },
        { at: '2:open', do: 'sweat', dur: 2.2 },
        { at: '3+0.15', do: 'write', dur: 1.0 },
        { at: '3:times', do: 'write', dur: 1.5 },
        { at: '3:1%', do: 'tilt', dur: 0.8, deg: -12 },
        { at: '4', do: 'write', dur: 0.8 },
        { at: '4:20%', do: 'shake', dur: 0.6 },
        { at: '4:every', do: 'sweat', dur: 1.6 },
        { at: '4:day', do: 'facepalm', dur: 1.0 },
        { at: '5:fewer', do: 'point', dur: 0.8 },
        { at: '5:limit', do: 'nod', dur: 0.6 },
        { at: '5:fees', do: 'point', dur: 0.9 },
        { at: '6:save', do: 'jump', h: 170 },
        { at: '6:save+0.1', do: 'cheer', dur: 1.1 },
        { at: '6:next', do: 'wave', dur: 2.4 },
      ],
    },
    {
      kind: 'goblin', id: 'goblin',
      show: [{ at: '2:fee-0.1', until: '6:this' }],
      path: [
        { at: 0, x: 1480, y: 1300, face: 1, scale: 1.2 },
        { at: '2:0.05%+0.9', x: 1560, face: 1, move: 0.9 },
        { at: '3+0.45', x: 2665, face: 1, move: 0.9 },
        { at: '5+0.3', x: 3880, face: 1, move: 0.85 },
        { at: '5:control+0.3', scale: 0.62, move: 0.4 },
      ],
      sack: [{ at: 0, size: 0.9 }, { at: '2:open+0.6', size: 1.1 }, { at: '2:close+0.6', size: 1.3 }, { at: '4:day', size: 2.0, move: 1.0 }, { at: '5:control+0.3', size: 1.0, move: 0.4 }],
      actions: [
        { at: '2:goblin+0.2', do: 'laugh', dur: 1.0 },
        { at: '2:open', do: 'grab', h: 130 },
        { at: '2:close', do: 'grab', h: 130 },
        { at: '4:every', do: 'dance', dur: 1.8 },
        { at: '5:control', do: 'sad', dur: 2.0 },
      ],
    },
  ],

  props: [
    // hook
    { type: 'title', at: 0.02, until: '1:20-0.05', text: "WHO'S STEALING\n*HIS MARGIN?*", y: 325, sfx: 'bell' },
    { type: 'sticky', at: '1:leverage', until: '2:trade+0.6', x: 990, y: 955, w: 210, h: 150, rot: 6, size: 36,
      text: 'GOAL\n20 trades/day' },
    { type: 'notify', at: '1:20', until: '2:trade', y: 290, title: 'Order filled', body: 'BTC-PERP  Long 10x  Trade 18 today' },
    { type: 'notify', at: '1:trades', until: '2:trade', y: 440, title: 'Order filled', body: 'BTC-PERP  Short 10x  Trade 19 today' },
    { type: 'notify', at: '1:day', until: '2:trade', y: 590, title: 'Order filled', body: 'BTC-PERP  Long 10x  Trade 20 today' },

    // exchange + goblin
    { type: 'title', at: '2:fee', until: '2:open', text: 'THE *FEE GOBLIN*', y: 300 },
    { id: 'card', type: 'card', layer: 'back', at: '2:about', until: '3+0.4', x: 1430, y: 440, w: 540,
      title: 'BTC-PERP', badge: 'LONG 10x', tag: 'ILLUSTRATIVE  0.05% FEE PER SIDE',
      rows: [
        { label: 'Margin', value: '$1,000' },
        { label: 'Position', value: '$10,000' },
        { label: 'Open fee', values: [{ at: '2:open', v: '-$5.00' }], color: '#ef5350' },
        { label: 'Close fee', values: [{ at: '2:close', v: '-$5.00' }], color: '#ef5350' },
        { label: 'Fees this trade', values: [{ at: '2:open', v: '-$5.00' }, { at: '2:close', v: '-$10.00' }], color: '#ef5350' },
      ] },
    { type: 'coins', at: '2:open', from: [1700, 880], to: 'goblin.sack', n: 3, dur: 0.55, arc: 160 },
    { type: 'coins', at: '2:close', from: [1700, 940], to: 'goblin.sack', n: 3, dur: 0.55, arc: 160 },

    // whiteboard math
    { id: 'w1', type: 'write', at: '3+0.2', x: 2510, y: 470, size: 84, text: '0.05% + 0.05% = *0.1%*' },
    { id: 'w1b', type: 'write', at: '3:round', x: 2516, y: 545, size: 50, color: '#5b6680', text: 'per round trip' },
    { id: 'w2a', type: 'write', at: '3:times', x: 2510, y: 680, size: 84, text: '0.1% × 10x' },
    { id: 'w2b', type: 'write', follow: 'w2a', at: '3:is', size: 84, text: '= *1%* margin' },
    { type: 'draw', around: 'w2b', sub: '1%', at: '3:margin', shape: 'circle' },
    { id: 'w3a', type: 'write', at: '4', x: 2510, y: 860, size: 84, text: '1% × 20 trades' },
    { id: 'w3b', type: 'write', follow: 'w3a', at: '4:20%', size: 84, text: '= *20%*', keyColor: '#d84341' },
    { type: 'draw', around: 'w3b', sub: '20%', at: '4:every', shape: 'circle' },
    { type: 'title', at: '4:20%', until: '5-0.05', text: '*20%* EVERY DAY', keyColor: '#ef5350', y: 290 },
    { type: 'tag', at: '4', until: '5', x: 2870, y: 972, size: 19,
      text: 'ILLUSTRATIVE  $1,000 MARGIN AT 10x  0.05% FEE PER SIDE' },
    { type: 'coins', at: '4:every', from: 'bull.hand', to: 'goblin.sack', n: 18, stagger: 0.07, dur: 0.6, arc: 240, r: 22 },

    // the rule
    { type: 'rules', at: '5', until: '6', x: 3740, y: 350, w: 920, title: 'THE *RULE*', gap: 100, size: 50,
      items: [
        { at: '5:fewer', text: '*Fewer* trades' },
        { at: '5:limit', text: '*Limit orders* when you can' },
        { at: '5:fees', text: 'Fees are the loss you *control*' },
      ] },

    // CTA
    { type: 'title', at: '6:save', text: '*SAVE THIS*', y: 300, size: 140, icon: 'bookmark', sfx: 'ding' },
    { type: 'confetti', at: '6:save', x: 540, y: 760, n: 140 },
    { type: 'confetti', at: '6:save+0.5', mode: 'rain', n: 80, dur: 3, sfx: false },
  ],

  sfx: [
    { at: '4:day>', name: 'sad', gain: 0.9 },
    { at: '6:save', name: 'bell', gain: 0.6 },
  ],
};
