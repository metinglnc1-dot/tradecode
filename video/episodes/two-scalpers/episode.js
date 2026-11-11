// Episode: Same $1,000. Two scalpers. (idea card 1, Fikirler 2026-11-12)
// Fee tiers from the idea card (Binance USDS-M regular user): maker 0.02%, taker 0.05%.
// Illustrative: $1,000 margin x 10 = $10,000 position.
// Taker round trip: 0.05% x 2 = 0.10% of $10,000 = $10. Maker round trip: 0.02% x 2 = 0.04% = $4. 10 / 4 = 2.5x.
// 20 round trips: $200 (20% of margin) vs $80 (8%). Balances after 20 trades: $800 vs $920.
export default {
  id: 'two-scalpers',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.7,
  narrator: 'maker',

  lines: [
    { say: 'Same thousand dollars. Same trades. One pays two and a half times more in fees.',
      caption: 'Same *$1,000*. Same trades. One pays *2.5x* more in fees.' },
    { say: 'The difference? How they click.',
      caption: 'The difference? How they *click*.', pauseAfter: 0.35 },
    { say: 'Market orders pay the taker fee. Zero point zero five percent.',
      caption: '*Market* orders pay the *taker* fee. *0.05%*.' },
    { say: 'Limit orders that wait in the book pay the maker fee. Zero point zero two.',
      caption: '*Limit* orders that wait in the book pay the *maker* fee. *0.02%*.', pauseAfter: 0.35 },
    { say: "At ten x, that's ten dollars per round trip. Versus four.",
      caption: "At *10x*, that's *$10* per round trip. Versus *$4*." },
    { say: 'Twenty trades a day? Two hundred dollars. Versus eighty.',
      caption: '*20 trades* a day? *$200*. Versus *$80*.', pauseAfter: 0.4 },
    { say: "The catch: a limit order can miss the move. Plan the entry. Don't chase it.",
      caption: 'The catch: a limit order can *miss* the move. *Plan* the entry.' },
    { say: 'Save this, and check which button you press.',
      caption: '*Save this*, and check which button you press.' },
  ],

  world: [
    { set: 'duo', x: 0 },
    { set: 'exchange', x: 1200, opts: { symbol: 'BTC-PERP' } },
    { set: 'whiteboard', x: 2400 },
    { set: 'outdoor', x: 3600 },
  ],

  // cam.y = 1300 - 330 / zoom keeps faces above the caption band
  camera: [
    { at: 0, x: 600, y: 953, zoom: 0.95, push: 0.015 },
    { at: '2', x: 600, y: 976, zoom: 1.02, move: 0.5 },
    { at: '3+0.1', x: 1800, y: 941, zoom: 0.92, move: 0.8 },
    { at: '5+0.15', x: 3010, y: 956, zoom: 0.96, move: 0.8 },
    { at: '6', x: 3005, y: 925, zoom: 0.88, move: 0.5 },
    { at: '7+0.2', x: 4200, y: 953, zoom: 0.95, move: 0.8 },
    { at: '8', x: 4300, y: 1000, zoom: 1.08, move: 0.6 },
  ],
  shake: [{ at: 1.9, amp: 8 }],

  actors: [
    {
      kind: 'bull', id: 'taker', tie: '#c62828',
      path: [
        { at: 0, x: 300, y: 1300, face: 1, scale: 0.85 },
        { at: '3+0.1', x: 1460, face: 1, move: 0.8 },
        { at: '7+0.2', x: 4140, face: 1, move: 0.8 },
      ],
      moods: [{ at: 0, mood: 'excited' }, { at: 1.6, mood: 'shocked' }, { at: '3', mood: 'worried' }, { at: '6:200', mood: 'sad' }, { at: '7', mood: 'think' }, { at: '8', mood: 'happy' }],
      looks: [{ at: 0, look: 'up' }, { at: 1.6, look: 'cam' }, { at: '3', look: 'right' }, { at: '7', look: 'right' }, { at: '8', look: 'cam' }],
      actions: [
        { at: 0, do: 'type', dur: 1.5 },
        { at: 1.0, do: 'sweat', dur: 2.2 },
        { at: '2:click', do: 'type', dur: 0.9 },
        { at: '3:market', do: 'point', dur: 0.9 },
        { at: '3:taker', do: 'shake', dur: 0.5 },
        { at: '7:catch', do: 'shrug', dur: 1.0 },
        { at: '8:save', do: 'jump', h: 150, sfx: false },
        { at: '8:save+0.1', do: 'cheer', dur: 1.2 },
      ],
    },
    {
      kind: 'bull', id: 'maker', tie: '#1f8f84',
      path: [
        { at: 0, x: 900, y: 1300, face: -1, scale: 0.85 },
        { at: '3+0.1', x: 2150, face: -1, move: 0.8 },
        { at: '5+0.15', x: 3340, face: -1, move: 0.8 },
        { at: '7+0.2', x: 4450, face: -1, move: 0.8 },
      ],
      moods: [{ at: 0, mood: 'smug' }, { at: '2', mood: 'happy' }, { at: '5', mood: 'think' }, { at: '6:200', mood: 'shocked' }, { at: '7', mood: 'determined' }, { at: '8', mood: 'happy' }],
      looks: [{ at: 0, look: 'up' }, { at: 1.2, look: 'cam' }, { at: '4', look: 'left' }, { at: '5', look: 'left' }, { at: '6', look: 'cam' }, { at: '7', look: 'upleft' }, { at: '8', look: 'cam' }],
      actions: [
        { at: 0.6, do: 'nod', dur: 0.6 },
        { at: '2:click', do: 'point', dur: 0.8 },
        { at: '4:limit', do: 'point', dur: 1.2 },
        { at: '5', do: 'write', dur: 1.0 },
        { at: '5:versus', do: 'write', dur: 0.8 },
        { at: '6', do: 'write', dur: 0.8 },
        { at: '6:200', do: 'tilt', dur: 0.8, deg: -12 },
        { at: '7:miss', do: 'point', dur: 0.9 },
        { at: '7:plan', do: 'nod', dur: 0.6 },
        { at: '8:save', do: 'jump', h: 170 },
        { at: '8:check', do: 'wave', dur: 2.2 },
      ],
    },
    {
      kind: 'goblin', id: 'goblin',
      show: [{ at: 0, until: '8:save' }],
      path: [
        { at: 0, x: 600, y: 1300, face: -1, scale: 0.9 },
        { at: '3+0.25', x: 1820, face: 1, move: 0.8 },
        { at: '5+0.3', x: 2665, face: 1, move: 0.8 },
        { at: '7+0.35', x: 3850, face: 1, move: 0.8 },
      ],
      sack: [{ at: 0, size: 0.8 }, { at: 1.9, size: 1.3, move: 1.4 }, { at: '6:200', size: 1.8, move: 0.6 }],
      actions: [
        { at: 0.4, do: 'laugh', dur: 1.4 },
        { at: '3:taker', do: 'grab', h: 110 },
        { at: '6:200', do: 'dance', dur: 1.4 },
        { at: '7:plan', do: 'sad', dur: 1.6 },
      ],
    },
  ],

  props: [
    // hook: same start, two balances melting at different speeds
    { type: 'title', at: 0.02, until: '2-0.55', text: 'SAME *$1,000*.\nTWO SCALPERS.', y: 325, sfx: 'bell' },
    { type: 'counter', at: 0.05, until: '3+0.2', x: 300, y: 560, w: 400, label: 'TAKER', accent: '#ef5350',
      sub: 'AFTER 20 TRADES  ILLUSTRATIVE', keys: [{ at: 0.3, v: 1000 }, { at: 1.9, v: 800 }] },
    { type: 'counter', at: 0.05, until: '3+0.2', x: 900, y: 560, w: 400, label: 'MAKER', accent: '#26a69a',
      sub: 'AFTER 20 TRADES  ILLUSTRATIVE', keys: [{ at: 0.3, v: 1000 }, { at: 1.9, v: 920 }] },
    { type: 'coins', at: 0.3, from: 'taker.hand', to: 'goblin.sack', n: 10, stagger: 0.14, dur: 0.55, arc: 140, r: 20 },
    { type: 'coins', at: 0.5, from: 'maker.hand', to: 'goblin.sack', n: 4, stagger: 0.35, dur: 0.55, arc: 140, r: 20 },

    // exchange: taker vs maker on the order book
    { type: 'sticky', at: '3:taker', until: '5+0.3', x: 1775, y: 600, w: 290, h: 200, rot: -5, size: 48, color: '#ffcdd2',
      text: 'MARKET\n= TAKER *0.05%*' },
    { type: 'sticky', at: '4:maker', until: '5+0.3', x: 1762, y: 870, w: 262, h: 190, rot: 3, size: 46, color: '#c8f1ea',
      text: 'LIMIT\n= MAKER *0.02%*', keyColor: '#1f6f66' },
    { type: 'tag', at: '3:taker', until: '5+0.3', x: 1590, y: 434, size: 18, text: 'TYPICAL REGULAR TIER  ILLUSTRATIVE' },
    { type: 'custom', at: '3:market', until: '4', layer: 'front', draw: (t, sc, p) => {
      // a market order sweeping the ask side
      const q = Math.min(1, (t - p._at) / 0.6);
      const x = 1924, rows = [6, 5, 4];
      let s = '';
      rows.forEach((r, i) => {
        const on = q > i / 3;
        if (on) s += `<rect x="${x - 4}" y="${502 + r * 33 - 2}" width="398" height="31" rx="6" fill="#ef5350" opacity="${0.35 * (1 - Math.max(0, (t - p._at - 1.2) / 0.6))}"/>`;
      });
      const ay = 502 + 6 * 33 + 14 - q * 66;
      s += `<path d="M${x - 70} ${ay} L ${x - 14} ${ay}" stroke="#ef5350" stroke-width="10" stroke-linecap="round"/><path d="M${x - 30} ${ay - 16} L ${x - 10} ${ay} L ${x - 30} ${ay + 16}" fill="none" stroke="#ef5350" stroke-width="8" stroke-linecap="round"/>`;
      return s;
    } },
    { type: 'custom', at: '4:limit', until: '5+0.3', layer: 'front', draw: (t, sc, p) => {
      // a limit order resting in the bid side, pulsing while it waits
      const pulse = 0.5 + 0.5 * Math.sin((t - p._at) * 6);
      const y = 502 + 10.4 * 33 - 2;
      return `<rect x="1920" y="${y}" width="398" height="31" rx="6" fill="none" stroke="#E4C471" stroke-width="${3 + pulse * 3}"/>
        <rect x="1920" y="${y}" width="398" height="31" rx="6" fill="#E4C471" opacity="${0.12 + 0.12 * pulse}"/>`;
    } },
    { type: 'coins', at: '3:taker', from: 'taker.hand', to: 'goblin.sack', n: 3, stagger: 0.1, dur: 0.55, arc: 160 },
    { type: 'coins', at: '4:maker', from: 'maker.hand', to: 'goblin.sack', n: 1, dur: 0.6, arc: 160 },

    // whiteboard math
    { id: 'n1', type: 'write', at: '5', x: 2510, y: 440, size: 60, color: '#5b6680', text: '$1,000 × 10x = $10,000' },
    { id: 'w1', type: 'write', at: '5:10', x: 2510, y: 580, size: 84, text: 'Taker  0.10% = *$10*' },
    { id: 'w2', type: 'write', at: '5:versus', x: 2510, y: 710, size: 84, text: 'Maker  0.04% = *$4*', keyColor: '#1f8f84' },
    { id: 'n2', type: 'write', at: '5:versus+0.5', x: 2516, y: 790, size: 46, color: '#5b6680', text: 'per round trip' },
    { id: 'w3', type: 'write', at: '6', x: 2510, y: 900, size: 84, text: '× 20 = *$200* vs $80' },
    { type: 'draw', around: 'w3', sub: '$200', at: '6:200', shape: 'circle' },
    { type: 'tag', at: '5', until: '7', x: 2880, y: 990, size: 19, text: 'ILLUSTRATIVE  $1,000 MARGIN AT 10x' },
    { type: 'title', at: '6:200', until: '7-0.05', text: '*$200* VS $80 A DAY', keyColor: '#ef5350', y: 290, size: 100, maxW: 840 },

    // the catch
    { type: 'rules', at: '7', until: '8', x: 3740, y: 360, w: 920, title: 'THE *CATCH*', gap: 120, size: 50,
      items: [
        { at: '7:miss', text: 'Limit order: *cheaper*, may not fill', icon: 'alert', color: '#b8923e' },
        { at: '7:plan', text: '*Plan* the entry. Don\'t chase it.' },
      ] },

    // CTA
    { type: 'title', at: '8:save', text: '*SAVE THIS*', y: 300, size: 140, icon: 'bookmark', sfx: 'ding' },
    { type: 'confetti', at: '8:save', x: 540, y: 760, n: 140 },
    { type: 'confetti', at: '8:save+0.5', mode: 'rain', n: 80, dur: 3, sfx: false },
  ],

  sfx: [
    { at: '6:200>', name: 'sad', gain: 0.7 },
    { at: '8:save', name: 'bell', gain: 0.6 },
  ],
};
