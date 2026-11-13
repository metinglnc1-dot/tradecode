// Episode: The trade after the loss. (idea card 7, Fikirler 2026-11-13)
// Message: the revenge trade after a loss does the damage. Rules: no size-up after a loss, two losses ends
// the day, walk away, read the journal tomorrow. No numbers, no product. Our own wording, no quotes.
const ROOM = 0, RING = 1200, PARK = 2400;

const ring = (t) => `<rect x="${RING - 300}" y="-900" width="1800" height="2200" fill="#120d18"/>
  ${Array.from({ length: 9 }, (_, i) => `<path d="M${RING - 200 + i * 200} -900 L ${RING - 100 + i * 200} 900" stroke="#fff" stroke-width="60" opacity="0.025"/>`).join('')}
  <rect x="${RING - 300}" y="1300" width="1800" height="1400" fill="#0b0810"/>
  <rect x="${RING + 40}" y="1180" width="1120" height="130" fill="#2b3a6b" stroke="#141414" stroke-width="6"/>
  <rect x="${RING + 40}" y="1170" width="1120" height="22" fill="#e9e4f2"/>
  ${[RING + 90, RING + 1110].map((x) => `<rect x="${x - 22}" y="820" width="44" height="370" rx="8" fill="${x < RING + 600 ? '#ef5350' : '#5c7cfa'}" stroke="#141414" stroke-width="6"/>`).join('')}
  ${[880, 970, 1060].map((y, k) => `<path d="M${RING + 90} ${y} Q ${RING + 600} ${y + 18 + Math.sin(t * 2 + k) * 4} ${RING + 1110} ${y}" stroke="#f1e9ff" stroke-width="10" fill="none"/>`).join('')}
  <rect x="${RING + 140}" y="1100" width="120" height="16" rx="6" fill="#4a3526"/><rect x="${RING + 160}" y="1116" width="12" height="54" fill="#4a3526"/><rect x="${RING + 228}" y="1116" width="12" height="54" fill="#4a3526"/>`;

// tilt gauge over the bull's head (screen space)
const tilt = (t, sc) => {
  const a = sc.tl.at('3'), b = sc.tl.at('3>');
  const q = Math.max(0, Math.min(1, (t - a) / (b - a)));
  const v = 0.15 + 0.85 * q * q;
  const o = Math.min(1, (t - sc.tl.at('2:fine')) / 0.3) * Math.max(0, Math.min(1, (sc.tl.at('4') + 0.2 - t) / 0.25));
  const col = v < 0.5 ? '#E4C471' : '#ef5350', jit = v > 0.8 ? Math.sin(t * 40) * 3 : 0;
  return `<g opacity="${Math.max(0, o).toFixed(2)}" transform="translate(${(220 + jit).toFixed(1)} 560)">
    <rect x="0" y="0" width="420" height="120" rx="24" fill="#0f1420" fill-opacity="0.94" stroke="${col}" stroke-width="5"/>
    <text data-qa="screen" data-g="tilt" x="28" y="76" font-family="Luckiest Guy" font-size="58" fill="${col}">TILT</text>
    <rect x="170" y="38" width="220" height="44" rx="14" fill="#1d2636"/><rect x="170" y="38" width="${(220 * v).toFixed(1)}" height="44" rx="14" fill="${col}"/></g>`;
};

export default {
  id: 'after-the-loss',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: 'The loss did not blow the account. The trade after it did.',
      caption: 'The *loss* did not blow the account. The trade *after it* did.', pauseAfter: 0.3 },
    { say: 'You take a small loss. Fine. That is part of the job.',
      caption: 'You take a *small loss*. Fine. That is part of the *job*.' },
    { say: 'Then your brain wants it back. Fast. And bigger.',
      caption: 'Then your brain wants it *back*. *Fast*. And *bigger*.', pauseAfter: 0.4 },
    { say: 'Rule one: never size up after a loss.',
      caption: 'Rule one: *never size up* after a loss.' },
    { say: 'Rule two: two losses in a day, and the day is over.',
      caption: 'Rule two: *2 losses* in a day, and the day is *over*.', pauseAfter: 0.3 },
    { say: 'Close the screen. Take a walk. Read the journal tomorrow.',
      caption: '*Close the screen*. Take a *walk*. Read the *journal* tomorrow.', pauseAfter: 0.3 },
    { say: 'Send this to the friend who always wins it back.',
      caption: '*Send this* to the friend who always *wins it back*.' },
  ],

  world: [
    { set: 'room', x: ROOM },
    { set: 'outdoor', x: PARK },
  ],

  camera: [
    { at: 0, x: ROOM + 620, y: 1000, zoom: 1.0, push: 0.008 },
    { at: '3:bigger+0.2', x: ROOM + 520, y: 1040, zoom: 1.12, move: 0.4 },
    { at: '4', x: RING + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.003 },
    { at: '6+0.1', x: PARK + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.004 },
  ],
  shake: [{ at: '3:bigger', amp: 10 }],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: ROOM + 300, y: 1300, face: 1, scale: 0.85 },
      { at: '4', x: RING + 200, face: 1, scale: 0.78, move: 0.8 },
      { at: '6+0.1', x: PARK + 260, face: 1, scale: 0.85, move: 0.8 },
      { at: '6:walk', x: PARK + 700, move: 2.2 },
      { at: '7', x: PARK + 820, face: -1, move: 0.6 },
    ],
    moods: [
      { at: 0, mood: 'sad' }, { at: '2:fine', mood: 'neutral' }, { at: '3', mood: 'angry' }, { at: '3:bigger', mood: 'shocked' },
      { at: '4', mood: 'determined' }, { at: '6', mood: 'neutral' }, { at: '6:walk', mood: 'happy' }, { at: '7', mood: 'smug' },
    ],
    looks: [{ at: 0, look: 'cam' }, { at: '2', look: 'right' }, { at: '3', look: 'right' }, { at: '4', look: 'cam' }, { at: '6:walk', look: 'right' }, { at: '7', look: 'cam' }],
    actions: [
      { at: '2:loss', do: 'shrug', dur: 0.9 },
      { at: '3:back', do: 'sweat', dur: 2.0 },
      { at: '3:bigger', do: 'grab', dur: 1.0 },
      { at: '4:never', do: 'shake', dur: 0.5 },
      { at: '5:over', do: 'point', dur: 1.0 },
      { at: '6:close', do: 'nod', dur: 0.6 },
      { at: '7:send', do: 'wave', dur: 2.0 },
    ],
  }],

  props: [
    { type: 'title', at: 0.02, until: '2-0.05', text: 'THE TRADE\n*AFTER* THE LOSS', y: 330, sfx: 'bell' },
    { type: 'custom', layer: 'back', at: '3+0.6', until: '6+0.6', draw: (t) => ring(t) },
    { type: 'custom', space: 'screen', at: '2:fine', until: '4+0.2', draw: (t, sc) => tilt(t, sc) },
    // the big red button
    { type: 'custom', layer: 'front', at: '3', until: '4+0.3', draw: (t, sc, p) => {
      const q = Math.min(1, (t - p._at) / 0.3), pulse = 1 + 0.06 * Math.sin(t * 9);
      return `<g transform="translate(${ROOM + 640} 1110) scale(${(q * pulse).toFixed(3)})"><rect x="-120" y="-10" width="240" height="60" rx="14" fill="#3a3f52" stroke="#141414" stroke-width="6"/>
        <ellipse cx="0" cy="-10" rx="96" ry="40" fill="#ef5350" stroke="#141414" stroke-width="6"/>
        <text data-qa="world" data-g="btn" x="0" y="-2" text-anchor="middle" font-family="Luckiest Guy" font-size="40" fill="#fff" stroke="#141414" stroke-width="6" paint-order="stroke">SIZE UP</text></g>`;
    } },
    { type: 'title', at: '3:bigger', until: '4-0.05', text: '*REVENGE* TRADE', y: 300, size: 116, keyColor: '#ef5350' },

    // the rules, in the corner
    { type: 'sticky', space: 'screen', at: '4', until: '6+0.1', x: 610, y: 560, w: 600, h: 230, rot: -3, size: 58, color: '#ffe680', text: '1. No *size up*\nafter a loss' },
    { type: 'sticky', space: 'screen', at: '5', until: '6+0.1', x: 640, y: 830, w: 600, h: 230, rot: 3, size: 58, color: '#ffcdd2', text: '2. *2 losses*\n= day over', keyColor: '#c62828' },
    { type: 'title', at: '4', until: '6-0.05', text: 'BACK TO *THE CORNER*', y: 300, size: 100 },

    // the walk
    { type: 'rules', at: '6', x: PARK + 140, y: 335, w: 920, title: '', gap: 95, size: 50,
      items: [
        { at: '6:close', text: '*Close* the screen' },
        { at: '6:walk', text: 'Take a *walk*' },
        { at: '6:journal', text: 'Read the *journal* tomorrow' },
      ] },
    { type: 'title', at: '7:send', text: '*SEND THIS*', y: 300, size: 120, icon: 'send', sfx: 'ding' },
  ],

  sfx: [
    { at: '2:loss', name: 'thud', gain: 0.6 },
    { at: '3:back', name: 'tick', gain: 0.7 }, { at: '3:fast', name: 'tick', gain: 0.8 }, { at: '3:bigger', name: 'thud', gain: 0.9 },
    { at: '4', name: 'bell', gain: 0.7 }, { at: '5', name: 'bell', gain: 0.5 },
  ],
};
