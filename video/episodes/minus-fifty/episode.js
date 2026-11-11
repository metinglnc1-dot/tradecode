// Episode: The -50% trap. (idea card 3, Fikirler 2026-11-12)
// Pure math (illustrative): gain needed = 1 / (1 - loss) - 1.
//  -10% -> +11.1%, -25% -> +33.3%, -50% -> +100%, -80% -> +400%.
//  $1,000 - 50% = $500; $500 + 50% = $750; 1.5 x 0.5 = 0.75 -> still -25%.
// Building floors: $1,000 at y 100, $750 at y 700, $500 at y 1300 (two stair flights per $250).
const FLOORS = [
  { y: 1300, label: '$500' }, { y: 1000 }, { y: 700, label: '$750' }, { y: 400 }, { y: 100, label: '$1,000' },
];
const SH = 0, PIT = 3200, WB = 2000; // world x of the sets

export default {
  id: 'minus-fifty',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.8,
  narrator: 'bull',

  lines: [
    { say: 'Lose fifty percent. Then gain fifty percent. Back to even?',
      caption: 'Lose *50%*. Then gain *50%*. Back to even?' },
    { say: "No. You're still down twenty five percent.",
      caption: "No. You're still down *25%*." },
    { say: 'A thousand becomes five hundred. Plus fifty percent is only seven fifty.',
      caption: '*$1,000* becomes *$500*. Plus 50% is only *$750*.', pauseAfter: 0.35 },
    { say: 'To climb back from minus fifty, you need plus one hundred.',
      caption: 'To climb back from *-50%*, you need *+100%*.' },
    { say: 'Minus ten needs eleven. Minus twenty five needs thirty three.',
      caption: '*-10%* needs *+11%*. *-25%* needs *+33%*.', pauseAfter: 0.35 },
    { say: 'Down is the elevator. Up is the stairs.',
      caption: 'Down is the *elevator*. Up is the *stairs*.' },
    { say: 'So what does minus eighty need? Comment your guess before the reveal.',
      caption: 'So what does *-80%* need? *Comment your guess*.', pauseAfter: 0.5 },
    { say: 'Four hundred percent.',
      caption: '*+400%*.' },
  ],

  world: [
    { set: 'shaft', x: SH, opts: { floors: FLOORS } },
    { set: 'whiteboard', x: WB },
    { set: 'pit', x: PIT, opts: { depth: 1000 }, pillar: false },
  ],

  // cam.y = feet - 330 / zoom keeps the face above the captions
  camera: [
    // the whole building stays in view so all three floor plates are readable
    { at: 0, x: 640, y: 711, zoom: 0.56, push: 0.015 },
    { at: '1:50%>', x: 560, y: 731, zoom: 0.58, move: 0.55, ease: 'in' },
    { at: '1:50%#2>', x: 720, y: 731, zoom: 0.58, move: 0.8 },
    { at: '3+0.2', x: 640, y: 711, zoom: 0.56, move: 0.6 },
    { at: '4+0.15', x: WB + 610, y: 956, zoom: 0.96, move: 0.9 },
    { at: '6+0.1', x: PIT + 450, y: 912, zoom: 0.85, move: 0.9 },
    { at: '6:elevator>', x: PIT + 600, y: 1829, zoom: 0.7, move: 0.45, ease: 'in' },
  ],
  shake: [{ at: '1:50%>', amp: 16 }, { at: '6:elevator>', amp: 16 }],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: SH + 250, y: 100, face: 1, scale: 0.8 },
      { at: '1:50%>', y: 1300, move: 0.55, hop: false, ease: 'in' },
      { at: '1:then', x: SH + 560, move: 0.3 },
      { at: '1:gain', x: SH + 1100, y: 1000, move: 0.4 },
      { at: '1:50%#2>', x: SH + 600, y: 700, move: 0.4 },
      { at: '4+0.15', x: WB + 970, face: -1, scale: 0.82, move: 0.9 },
      { at: '6+0.1', x: PIT + 200, y: 1300, face: 1, scale: 0.8, move: 0.9 },
      { at: '6:elevator>', x: PIT + 560, y: 2300, move: 0.45, hop: false, ease: 'in' },
    ],
    moods: [
      { at: 0, mood: 'excited' }, { at: '1:lose', mood: 'shocked' }, { at: '1:then', mood: 'determined' },
      { at: '1:back', mood: 'happy' }, { at: '2', mood: 'sad' }, { at: '3', mood: 'think' }, { at: '4', mood: 'determined' },
      { at: '6', mood: 'neutral' }, { at: '6:elevator', mood: 'shocked' }, { at: '6:stairs', mood: 'worried' },
      { at: '7', mood: 'think' }, { at: '8', mood: 'excited' },
    ],
    looks: [
      { at: 0, look: 'cam' }, { at: '1:lose', look: 'up' }, { at: '1:then', look: 'upright' }, { at: '1:back', look: 'up' },
      { at: '2', look: 'cam' }, { at: '4', look: 'left' }, { at: '5:needs#2', look: 'cam' }, { at: '6', look: 'down' },
      { at: '6:stairs', look: 'upright' }, { at: '7', look: 'cam' },
    ],
    actions: [
      { at: '1:lose', do: 'sweat', dur: 1.2 },
      { at: '2:no', do: 'facepalm', dur: 0.9 },
      { at: '3', do: 'shrug', dur: 0.9 },
      { at: '4', do: 'write', dur: 1.3 },
      { at: '5', do: 'write', dur: 1.6 },
      { at: '4:+100%', do: 'tilt', dur: 0.8, deg: -12 },
      { at: '6:stairs', do: 'point', dur: 1.0 },
      { at: '7:comment', do: 'wave', dur: 1.4 },
      { at: '8', do: 'jump', h: 120 },
      { at: '8+0.4', do: 'cheer', dur: 1.4 },
    ],
  }],

  props: [
    // hook
    { type: 'title', at: 0.02, text: '*-50%* THEN *+50%* = EVEN?', y: 1060, size: 96, sfx: 'bell', until: '2-0.05' },
    { type: 'counter', space: 'screen', at: 0.05, until: '4+0.1', x: 790, y: 470, w: 380, size: 76, label: 'BALANCE', sub: 'ILLUSTRATIVE',
      keys: [{ at: 0.3, v: 1000 }, { at: '1:lose', v: 1000 }, { at: '1:50%>', v: 500, ease: 'in' }, { at: '1:then', v: 500 }, { at: '1:50%#2>', v: 750 }], sfx: false },
    { type: 'custom', layer: 'front', at: '2:still', until: '3+0.2', draw: (t, sc, p) => {
      const q = Math.min(1, (t - p._at) / 0.25), o = Math.min(1, (p._until - t) / 0.2);
      const s = (q < 1 ? 0.6 + 0.55 * q : 1.15 - 0.15 * Math.min(1, (t - p._at - 0.25) / 0.2)) * o;
      return `<g transform="translate(${SH + 1060} 300) scale(${s.toFixed(3)}) rotate(-3)"><text data-qa="world" data-g="still" x="0" y="40" text-anchor="middle" font-family="Luckiest Guy" font-size="120" fill="#fff" stroke="#141414" stroke-width="14" paint-order="stroke">STILL <tspan fill="#ef5350">-25%</tspan></text></g>`;
    } },
    // elevator car around the bull while it is in the shaft
    { type: 'custom', layer: 'back', at: 0, until: '1:then', draw: (t, sc) => {
      const st = sc.actor('bull').state(t);
      return `<rect x="${st.x - 150}" y="${st.ground - 560}" width="300" height="566" rx="10" fill="#232a3d" stroke="#5a6480" stroke-width="8"/>
        <rect x="${st.x - 150}" y="${st.ground - 6}" width="300" height="14" fill="#5a6480"/>`;
    } },
    { type: 'custom', layer: 'front', at: '3+0.3', until: '4+0.1', draw: (t, sc, p) => {
      // recap arrows on the cut-away: elevator down fast, stairs up slow
      const q = Math.min(1, (t - p._at) / 0.5);
      return `<g opacity="${q}">
        <path d="M${SH + 470} 140 L ${SH + 470} ${140 + 1100 * q}" stroke="#ef5350" stroke-width="18" stroke-linecap="round"/>
        <path d="M${SH + 440} ${1200 * q} L ${SH + 470} ${40 + 1200 * q} L ${SH + 500} ${1200 * q}" fill="none" stroke="#ef5350" stroke-width="14" stroke-linecap="round"/>
        <text data-qa="world" data-g="arrows" x="${SH + 500}" y="760" font-family="Luckiest Guy" font-size="110" fill="#ef5350" stroke="#141414" stroke-width="12" paint-order="stroke">-50%</text>
        <text data-qa="world" data-g="arrows" x="${SH + 1180}" y="1000" font-family="Luckiest Guy" font-size="110" fill="#26a69a" stroke="#141414" stroke-width="12" paint-order="stroke" text-anchor="end">+50%</text>
      </g>`;
    } },

    // whiteboard table
    { id: 'f0', type: 'write', at: '4', dur: 0.8, x: WB + 110, y: 430, size: 52, color: '#5b6680', text: 'gain needed = 1 / (1 - loss) - 1' },
    { id: 'r3', type: 'write', at: '4:need', dur: 0.6, x: WB + 110, y: 760, size: 76, keyColor: '#d84341', text: '-50%  needs  *+100%*' },
    { type: 'draw', around: 'r3', sub: '+100%', at: '4:+100%>', shape: 'circle' },
    { id: 'r1', type: 'write', at: '5:-10%', dur: 0.5, x: WB + 110, y: 540, size: 76, text: '-10%  needs  +11.1%' },
    { id: 'r2', type: 'write', at: '5:-25%', dur: 0.5, x: WB + 110, y: 650, size: 76, text: '-25%  needs  +33.3%' },
    { id: 'r4', type: 'write', at: '5>-0.3', dur: 0.4, x: WB + 110, y: 870, size: 76, keyColor: '#d84341', text: '-80%  needs  *?*' },
    { type: 'tag', at: '4', until: '6', x: WB + 480, y: 990, size: 19, text: 'PURE MATH  ILLUSTRATIVE' },

    // pit: question and reveal
    { type: 'custom', layer: 'back', at: '6:elevator>', draw: (t, sc, p) => {
      const rev = sc.tl.at('8');
      const shown = t >= rev ? '+400%' : '?';
      const col = t >= rev ? '#26a69a' : '#ef5350';
      const s = t >= rev ? 1 + 0.25 * Math.max(0, 1 - (t - rev) / 0.3) : 1;
      return `<rect x="${PIT + 1010}" y="1240" width="16" height="60" fill="#5a4a3a"/>
        <g transform="translate(${PIT + 1018} 1180) scale(${s.toFixed(3)})">
          <rect x="-200" y="-110" width="400" height="210" rx="18" fill="#0f1420" stroke="${col}" stroke-width="10"/>
          <text data-qa="world" data-g="sign" x="0" y="-38" text-anchor="middle" font-family="Inter" font-weight="900" font-size="56" fill="#ef5350">-80%</text>
          <text data-qa="world" data-g="sign" x="0" y="62" text-anchor="middle" font-family="Inter" font-weight="900" font-size="84" fill="${col}">${shown}</text>
        </g>`;
    } },
    { type: 'title', at: '7', until: '7:comment-0.05', text: '*-80%* NEEDS *?*', keyColor: '#ef5350', y: 300, size: 130 },
    { type: 'title', at: '7:comment', until: '8-0.05', text: '*COMMENT* YOUR GUESS', y: 300, size: 110, icon: 'comment' },
    { type: 'title', at: '8', text: '*+400%*', keyColor: '#26a69a', y: 300, size: 150, sfx: 'ding' },
  ],

  sfx: [
    { at: '1:lose', name: 'whoosh', gain: 0.9, dur: 0.6 },
    { at: '1:50%>', name: 'thud', gain: 1.0 },
    { at: '2:still', name: 'sad', gain: 0.7 },
    { at: '6:elevator', name: 'whoosh', gain: 0.9, dur: 0.5 },
    { at: '6:elevator>', name: 'thud', gain: 1.0 },
    { at: '8', name: 'bell', gain: 0.6 },
  ],
};
