// Episode: If I had to restart with $1,000. (idea card 1, Fikirler 2026-11-13)
// Illustrative: 1% of $1,000 = $10. Ten losses in a row, each 1% of what is left: 0.99^10 = 0.9044,
// so about $904 left, about -9.6%. No product.
const ROOM = 0, OUT = 1200, WB = 2400;
const BAL = Array.from({ length: 11 }, (_, k) => 1000 * Math.pow(0.99, k));

export default {
  id: 'restart-1000',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: "If I had to restart with one thousand dollars, here's the first rule.",
      caption: "If I had to restart with *$1,000*, here's the *first rule*.", pauseAfter: 0.3 },
    { say: 'Protect the account. Risk one percent per trade. That is ten dollars.',
      caption: '*Protect the account*. Risk *1%* per trade. That is *$10*.', pauseAfter: 0.3 },
    { say: 'Ten losses in a row, one percent of what is left each time. You still have about nine hundred and four dollars.',
      caption: '*10 losses* in a row, *1%* of what is left each time. You still have about *$904*.', pauseAfter: 0.4 },
    { say: 'Two losses in a day? Close the platform.',
      caption: '*2 losses* in a day? *Close the platform*.' },
    { say: 'One setup. Every trade goes in the journal. No trade outside the plan.',
      caption: '*One setup*. Every trade goes in the *journal*. No trade outside the *plan*.', pauseAfter: 0.3 },
    { say: 'Not a profit target. A rule list.',
      caption: 'Not a profit target. A *rule list*.', pauseAfter: 0.3 },
    { say: 'Save this for the day you start over.',
      caption: '*Save this* for the day you *start over*.' },
  ],

  world: [
    { set: 'room', x: ROOM },
    { set: 'outdoor', x: OUT },
    { set: 'whiteboard', x: WB },
  ],

  camera: [
    { at: 0, x: ROOM + 620, y: 1000, zoom: 1.0, push: 0.006 },
    { at: '3+0.1', x: OUT + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.003 },
    { at: '4+0.15', x: WB + 610, y: 956, zoom: 0.95, move: 0.8, push: 0.002 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: ROOM + 330, y: 1300, face: 1, scale: 0.85 },
      { at: '3+0.1', x: OUT + 760, face: -1, scale: 0.85, move: 0.8 },
      { at: '4+0.15', x: WB + 970, face: -1, scale: 0.82, move: 0.8 },
    ],
    moods: [
      { at: 0, mood: 'think' }, { at: '1:first', mood: 'determined' }, { at: '3', mood: 'worried' }, { at: '3:still', mood: 'confident' },
      { at: '4', mood: 'determined' }, { at: '7', mood: 'happy' },
    ],
    looks: [{ at: 0, look: 'cam' }, { at: '3', look: 'left' }, { at: '3:still', look: 'cam' }, { at: '4', look: 'left' }, { at: '7', look: 'cam' }],
    actions: [
      { at: '1:restart', do: 'hold', dur: 1.4 },
      { at: '2:protect', do: 'point', dur: 1.0 },
      { at: '4:close', do: 'shake', dur: 0.5 },
      { at: '5', do: 'write', dur: 3.2 },
      { at: '7:save', do: 'jump', h: 140 }, { at: '7:save+0.1', do: 'cheer', dur: 1.2 },
    ],
  }],

  props: [
    { type: 'title', at: 0.02, until: '2-0.05', text: 'RESTART WITH\n*$1,000*', y: 330, sfx: 'bell' },
    // the single bill in an empty room
    { type: 'custom', space: 'screen', at: 0.3, until: '2>', draw: (t, sc, p) => {
      const q = Math.min(1, (t - p._at) / 0.35), o = Math.min(q, Math.max(0, (p._until - t) / 0.2));
      const s = 0.7 + 0.3 * (1 - Math.pow(1 - q, 3)), r = Math.sin(t * 2) * 2;
      return `<g opacity="${o.toFixed(2)}" transform="translate(540 700) rotate(${r.toFixed(2)}) scale(${s.toFixed(3)})">
        <rect x="-260" y="-120" width="520" height="240" rx="22" fill="#e9f5e1" stroke="#2f6b3a" stroke-width="10" filter="url(#shadow)"/>
        <rect x="-226" y="-88" width="452" height="176" rx="14" fill="none" stroke="#2f6b3a" stroke-width="4"/>
        <circle r="62" fill="#cfe8c4" stroke="#2f6b3a" stroke-width="5"/>
        <text data-qa="screen" data-g="bill" x="0" y="26" text-anchor="middle" font-family="Luckiest Guy" font-size="72" fill="#2f6b3a">$</text>
        <text data-qa="screen" data-g="bill" x="-200" y="-40" font-family="Inter" font-weight="900" font-size="44" fill="#2f6b3a">1,000</text>
        <text data-qa="screen" data-g="bill2" x="200" y="74" text-anchor="end" font-family="Inter" font-weight="900" font-size="44" fill="#2f6b3a">1,000</text></g>`;
    } },
    { type: 'title', at: '2:protect', until: '2>+0.1', text: '*1%* RISK = *$10*', y: 300, size: 120 },
    { type: 'tag', space: 'screen', at: 0.4, until: '4', x: 540, y: 1163, size: 16, text: 'ILLUSTRATIVE  $1,000 ACCOUNT  1% RISK PER TRADE' },

    // the shield: ten losses bounce off
    { type: 'custom', layer: 'front', at: '3', until: '4+0.4', draw: (t, sc) => {
      const a = sc.tl.at('3');
      let s = `<g transform="translate(${OUT + 580} 1120)"><path d="M0 -150 L 110 -110 Q 110 40 0 120 Q -110 40 -110 -110 Z" fill="#E4C471" stroke="#7a5c1c" stroke-width="10"/>
        <path d="M0 -105 L 70 -80 Q 70 20 0 75 Q -70 20 -70 -80 Z" fill="#26a69a" stroke="#1f6f66" stroke-width="6"/>
        <text data-qa="world" data-g="shield" x="0" y="12" text-anchor="middle" font-family="Luckiest Guy" font-size="54" fill="#fff">1%</text></g>`;
      for (let k = 0; k < 10; k++) {
        const t0 = a + (k + 1) * 0.36 - 0.35, u = (t - t0) / 0.35;
        if (u < 0 || u > 1.6) continue;
        const hit = Math.min(1, u), y = 1000 + (k % 3) * 70;
        const x = OUT + 60 + (OUT + 460 - (OUT + 60)) * hit - (u > 1 ? (u - 1) * 200 : 0);
        const rot = u > 1 ? -40 * (u - 1) : 0, op = u > 1 ? Math.max(0, 1 - (u - 1) / 0.6) : 1;
        s += `<g transform="translate(${x.toFixed(1)} ${(y + (u > 1 ? (u - 1) * 260 : 0)).toFixed(1)}) rotate(${rot.toFixed(1)})" opacity="${op.toFixed(2)}">
          <line x1="-90" y1="0" x2="0" y2="0" stroke="#ef5350" stroke-width="10" stroke-linecap="round"/><path d="M0 -18 L 28 0 L 0 18 Z" fill="#ef5350"/></g>`;
      }
      return s;
    } },
    { type: 'counter', at: '3', until: '4+0.3', x: OUT + 600, y: 560, w: 560, size: 104, label: 'ACCOUNT', accent: '#26a69a', decimals: 0,
      keys: [{ at: '3', v: 1000 }, ...BAL.slice(1).map((v, k) => ({ at: `3+${((k + 1) * 0.36).toFixed(2)}`, v, ease: 'out' }))], sfx: false },
    { type: 'title', at: '3:still', until: '4-0.05', text: 'STILL ABOUT *$904*', y: 300, size: 110 },
    { type: 'tag', at: '3:still', until: '4+0.3', x: OUT + 600, y: 700, size: 20, text: '0.99¹⁰ = 0.904  ABOUT -9.6%' },

    // the rule list, handwritten
    { id: 'r1', type: 'write', at: '4+0.3', dur: 0.6, x: WB + 120, y: 440, size: 62, maxW: 790, keyColor: '#1f8f84', text: '1. Risk *1%* ($10)' },
    { id: 'r2', type: 'write', at: '4:close', dur: 0.6, x: WB + 120, y: 550, size: 62, maxW: 790, keyColor: '#d84341', text: '2. 2 losses = *close*' },
    { id: 'r3', type: 'write', at: '5:one', dur: 0.6, x: WB + 120, y: 660, size: 62, maxW: 790, keyColor: '#1f8f84', text: '3. *One* setup' },
    { id: 'r4', type: 'write', at: '5:journal', dur: 0.6, x: WB + 120, y: 770, size: 62, maxW: 790, keyColor: '#1f8f84', text: '4. *Journal* every trade' },
    { id: 'r5', type: 'write', at: '5:plan', dur: 0.6, x: WB + 120, y: 880, size: 62, maxW: 790, keyColor: '#d84341', text: '5. No trade outside *plan*' },
    { type: 'title', at: '6', until: '7:save-0.05', text: 'A *RULE LIST*', y: 300, size: 120 },
    { type: 'draw', around: 'r1', sub: '1%', at: '6:rule', shape: 'circle' },
    { type: 'title', at: '7:save', text: '*SAVE THIS*', y: 300, size: 120, icon: 'bookmark', sfx: 'ding' },
  ],

  sfx: [
    ...Array.from({ length: 10 }, (_, k) => ({ at: `3+${((k + 1) * 0.36).toFixed(2)}`, name: 'tick', gain: 0.8 })),
    { at: '4:close', name: 'thud', gain: 0.8 },
  ],
};
