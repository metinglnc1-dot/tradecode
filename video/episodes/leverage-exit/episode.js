// Episode: Leverage doesn't change your idea. It changes your exit. (idea card 6, Fikirler 2026-11-12)
// Illustrative, isolated margin, before fees and maintenance margin: liquidation distance is roughly 1 / leverage.
//   5x 20%, 10x 10%, 25x 4%, 50x 2%, 100x 1%. Maintenance margin rates could not be verified, so the video
//   says "roughly" and names fees and maintenance margin as making it closer.
// The 3% dip that liquidates 50x and 100x is illustrative. Calculator card: $1,000 account, 1% risk = $10,
//   2% stop distance -> $10 / 0.02 = $500 position (illustrative).
// Product (1 of 2 product ideas): Trading Journal App (position size and liquidation calculator), link in bio.
const A = 0, ROOM = 1800, OUT = 3000;
const ENTRY = 700, PX20 = 300;           // world px for a 20% move
const LEV = [
  { id: 'b5', x: 140, lev: '5x', pct: 20, tie: '#26a69a' },
  { id: 'b10', x: 360, lev: '10x', pct: 10, tie: '#5c7cfa' },
  { id: 'b25', x: 580, lev: '25x', pct: 4, tie: '#E4C471' },
  { id: 'b50', x: 800, lev: '50x', pct: 2, tie: '#ff9f43' },
  { id: 'b100', x: 1020, lev: '100x', pct: 1, tie: '#ef5350' },
];
const SHOW = { b5: '2:5x', b10: '3:10x', b25: '3:25x', b50: '4:50x', b100: '4:100x' };
const liqY = (pct) => ENTRY + (PX20 * pct) / 20;
const DIP = 3;                            // illustrative dip in %

export default {
  id: 'leverage-exit',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.8,
  narrator: 'b5',

  lines: [
    { say: 'Same entry. Five traders. Different leverage.',
      caption: '*Same entry*. *5 traders*. Different *leverage*.' },
    { say: 'At five x, price can move about twenty percent against you before liquidation.',
      caption: 'At *5x*, price can move about *20%* against you before *liquidation*.' },
    { say: 'At ten x, about ten percent. At twenty five x, about four.',
      caption: 'At *10x*, about *10%*. At *25x*, about *4%*.' },
    { say: 'At fifty x, two percent. At a hundred x, about one.',
      caption: 'At *50x*, *2%*. At *100x*, about *1%*.' },
    { say: 'Roughly one divided by leverage. Fees and maintenance margin make it even closer.',
      caption: 'Roughly *1 divided by leverage*. *Fees* and *maintenance margin* make it even closer.' },
    { say: "Leverage doesn't change your idea. It changes how much room it gets.",
      caption: "Leverage doesn't change your *idea*. It changes how much *room* it gets.", pauseAfter: 1.1 },
    { say: 'Size the position from your stop, not from the leverage slider.',
      caption: 'Size the position from your *stop*, not from the *leverage slider*.', pauseAfter: 0.35 },
    { say: 'Our position size and liquidation calculator is in the link in bio.',
      caption: 'Our position size and liquidation calculator is in the *link in bio*.' },
  ],

  world: [
    { set: 'chartscape', x: A, opts: { small: [] } },
    { set: 'room', x: ROOM },
    { set: 'outdoor', x: OUT },
  ],

  camera: [
    { at: 0, x: A + 580, y: 800, zoom: 0.85, push: 0.003 },
    { at: '7+0.15', x: ROOM + 640, y: 970, zoom: 1.0, move: 0.8 },
    { at: '8+0.15', x: OUT + 600, y: 953, zoom: 0.95, move: 0.8 },
  ],
  shake: [{ at: '6:room', amp: 10 }],

  actors: LEV.map((b) => ({
    kind: 'bull', id: b.id, tie: b.tie,
    show: b.pct <= 2 ? [{ at: 0, until: '6:room+0.5' }] : [{ at: 0 }],
    path: [
      { at: 0, x: A + b.x, y: ENTRY, face: b.x < 580 ? 1 : -1, scale: 0.45 },
      ...(b.id === 'b5' ? [
        { at: '7+0.15', x: ROOM + 330, y: 1300, face: 1, scale: 0.85, move: 0.8 },
        { at: '8+0.15', x: OUT + 820, face: -1, scale: 0.92, move: 0.8 },
      ] : []),
    ],
    moods: [
      { at: 0, mood: 'excited' }, { at: SHOW[b.id], mood: b.pct >= 10 ? 'happy' : b.pct >= 4 ? 'worried' : 'shocked' },
      { at: '6:room', mood: b.pct <= 2 ? 'sad' : 'happy' }, ...(b.id === 'b5' ? [{ at: '7', mood: 'determined' }, { at: '8', mood: 'happy' }] : []),
    ],
    looks: [{ at: 0, look: 'cam' }, { at: SHOW[b.id], look: 'down' }, { at: SHOW[b.id] + '+1', look: 'cam' }],
    actions: [
      ...(b.pct <= 2 ? [{ at: SHOW[b.id], do: 'sweat', dur: 3.5 }, { at: '6:room-0.1', do: 'jump', h: 60, sfx: false }] : []),
      ...(b.id === 'b5' ? [{ at: '7:stop', do: 'point', dur: 1.0 }, { at: '8:link', do: 'wave', dur: 2.0 }] : []),
    ],
  })),

  props: [
    { type: 'title', at: 0.02, until: '2-0.05', text: 'SAME ENTRY.\n*5 LEVERAGES.*', y: 325, sfx: 'bell' },
    { type: 'tag', at: 0.3, until: '7+0.2', x: A + 580, y: 335, size: 18, text: 'ILLUSTRATIVE  ISOLATED MARGIN  BEFORE FEES' },
    // entry line, liquidation lines and the dip
    { type: 'custom', layer: 'back', at: 0, until: '7+0.4', draw: (t, sc, p) => {
      const tl = sc.tl;
      const d0 = tl.at('6:room') - 0.35;
      const dq = Math.max(0, Math.min(1, (t - d0) / 0.5)), back = Math.max(0, Math.min(1, (t - d0 - 0.9) / 0.6));
      const dipY = ENTRY + (PX20 * DIP) / 20 * (dq * (1 - back));
      let s = `<line x1="${A + 20}" x2="${A + 1140}" y1="${ENTRY}" y2="${ENTRY}" stroke="#E4C471" stroke-width="8"/>
        <text data-qa="world" data-g="entry" x="${A + 30}" y="${ENTRY + 38}" font-family="Inter" font-weight="900" font-size="26" fill="#E4C471">ENTRY</text>`;
      for (const b of LEV) {
        const on = t >= tl.at(SHOW[b.id]);
        s += `<text data-qa="world" data-g="lev${b.id}" x="${A + b.x}" y="398" text-anchor="middle" font-family="Luckiest Guy" font-size="54" fill="#fff" stroke="#141414" stroke-width="8" paint-order="stroke">${b.lev}</text>`;
        if (!on) continue;
        const q = Math.min(1, (t - tl.at(SHOW[b.id])) / 0.4), y = liqY(b.pct);
        const hit = b.pct <= DIP && t >= tl.at('6:room');
        s += `<line x1="${A + b.x}" x2="${A + b.x}" y1="${ENTRY}" y2="${(ENTRY + (y - ENTRY) * q).toFixed(1)}" stroke="#ef5350" stroke-width="4" stroke-dasharray="8 8"/>
          <line x1="${A + b.x - 90 * q}" x2="${A + b.x + 90 * q}" y1="${y}" y2="${y}" stroke="#ef5350" stroke-width="7"/>
          <text data-qa="world" data-g="pct${b.id}" x="${A + b.x}" y="${y + 40}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="34" fill="#ef5350" opacity="${q.toFixed(2)}">-${b.pct}%</text>`;
        if (hit) s += `<text data-qa="world" data-g="liq${b.id}" x="${A + b.x}" y="${ENTRY - 120}" text-anchor="middle" font-family="Luckiest Guy" font-size="40" fill="#ef5350" stroke="#141414" stroke-width="7" paint-order="stroke">LIQUIDATED</text>`;
      }
      if (dq > 0 && back < 1) s += `<line x1="${A + 20}" x2="${A + 1140}" y1="${dipY.toFixed(1)}" y2="${dipY.toFixed(1)}" stroke="#ff9f43" stroke-width="6" stroke-dasharray="20 10"/>
        <text data-qa="world" data-g="dip" x="${A + 200}" y="${(dipY + 40).toFixed(1)}" text-anchor="start" font-family="Inter" font-weight="900" font-size="30" fill="#ff9f43">-${DIP}% DIP</text>`;
      return s;
    } },
    { type: 'title', at: '5', until: '6-0.05', text: 'ROUGHLY\n*1 / LEVERAGE*', y: 325 },
    { type: 'title', at: '6:room', until: '7-0.05', text: 'SAME IDEA.\n*LESS ROOM.*', y: 325, keyColor: '#ef5350' },

    // size from the stop
    { type: 'card', at: '7:size', until: '8+0.2', x: ROOM + 470, y: 430, w: 560, title: 'POSITION SIZE', badge: 'CALCULATOR', badgeColor: '#E4C471', tag: 'ILLUSTRATIVE',
      rows: [
        { label: 'Account', value: '$1,000' },
        { label: 'Risk per trade', values: [{ at: '7:size+0.3', v: '1% = $10' }] },
        { label: 'Stop distance', values: [{ at: '7:stop', v: '2%' }] },
        { label: 'Position size', values: [{ at: '7:not', v: '$500' }], color: '#26a69a' },
      ] },

    // CTA: product link
    { type: 'rules', at: '8', x: OUT + 140, y: 370, w: 920, title: '', gap: 95, size: 48,
      items: [
        { at: '8', text: 'Liq. distance: roughly *1 / leverage*' },
        { at: '8+0.15', text: 'Size from your *stop*' },
        { at: '8+0.3', text: 'Calculator: *link in bio*', icon: 'link', color: '#E4C471' },
      ] },
    { type: 'title', at: '8:link', text: '*LINK IN BIO*', y: 300, size: 130, icon: 'link', sfx: 'ding' },
  ],

  sfx: [
    { at: '2:5x', name: 'tick', gain: 1 }, { at: '3:10x', name: 'tick', gain: 1 }, { at: '3:25x', name: 'tick', gain: 1 },
    { at: '4:50x', name: 'tick', gain: 1 }, { at: '4:100x', name: 'tick', gain: 1 },
    { at: '6:room-0.35', name: 'whoosh', gain: 0.7, dur: 0.6 },
    { at: '6:room', name: 'thud', gain: 1.0 },
    { at: '6:room+0.3', name: 'sad', gain: 0.7 },
  ],
};
