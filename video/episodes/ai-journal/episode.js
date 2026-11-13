// Episode: I gave Claude my trading journal. (AI for traders, Part 4/5)
// The red card is illustrative. The prompt is the exact text from "AI Fikirleri v2 2026-11-13" and stays on
// screen for two lines. Product (2 of 2): Trading Journal App, named only as a place to keep the journal
// (its export feature could not be verified). Claude is named only; the robot is a generic assistant.
const ROOM = 0, WB = 1200, OUT = 2400;
const PROMPT = 'Here are my last 50 trades with date, time, setup, risk and result. Find the 3 patterns that cost me the most money. Be blunt. Then suggest one rule to test for the next 2 weeks.';
const wrap = (s, n = 42) => {
  const out = []; let line = '';
  for (const w of s.split(' ')) { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }
  if (line.trim()) out.push(line.trim());
  return out;
};
const robot = (x, y, s, t) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="6" rx="110" ry="16" fill="#000" opacity="0.25"/>
  <rect x="-50" y="-150" width="100" height="150" rx="26" fill="#3b5bdb" stroke="#1d2e70" stroke-width="6"/>
  <g transform="translate(0 ${(-260 + Math.sin(t * 3) * 6).toFixed(1)})">
    <line x1="0" y1="-70" x2="0" y2="-100" stroke="#1d2e70" stroke-width="7"/><circle cy="-106" r="12" fill="#E4C471"/>
    <rect x="-90" y="-70" width="180" height="130" rx="34" fill="#5c7cfa" stroke="#1d2e70" stroke-width="7"/>
    <rect x="-66" y="-46" width="132" height="82" rx="20" fill="#0d1530"/>
    <circle cx="-26" cy="-6" r="13" fill="#9fd3ff"/><circle cx="26" cy="-6" r="13" fill="#9fd3ff"/>
    <path d="M-20 22 Q 0 34 20 22" stroke="#9fd3ff" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g></g>`;

export default {
  id: 'ai-journal',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: 'I gave Claude my trading journal. It handed back one red card.',
      caption: 'I gave *Claude* my trading *journal*. It handed back *one red card*.' },
    { say: 'You lose most after two losses in a row.',
      caption: '"You lose most after *2 losses in a row*."', pauseAfter: 0.4 },
    { say: 'Your journal needs six columns: date, time, setup, risk, result, and how you felt.',
      caption: 'Your journal needs *6 columns*: date, time, setup, risk, result, and how you *felt*.', pauseAfter: 0.3 },
    { say: 'Then paste your last fifty trades with this prompt.',
      caption: 'Then paste your last *50 trades* with this *prompt*.', pauseAfter: 0.4 },
    { say: 'Find the three patterns that cost me the most. Be blunt. Suggest one rule to test for two weeks.',
      caption: 'Find the *3 patterns* that cost me the most. Be *blunt*. Suggest *one rule* to test for *2 weeks*.', pauseAfter: 0.4 },
    { say: "Change one rule. Look again in two weeks. That's the whole loop.",
      caption: "Change *one rule*. Look again in *2 weeks*. That's the whole *loop*.", pauseAfter: 0.3 },
    { say: 'Save this for your weekly review.',
      caption: '*Save this* for your weekly review.' },
  ],

  world: [
    { set: 'room', x: ROOM },
    { set: 'whiteboard', x: WB },
    { set: 'outdoor', x: OUT },
  ],

  camera: [
    { at: 0, x: ROOM + 620, y: 1000, zoom: 1.0, push: 0.008 },
    { at: '3+0.1', x: WB + 610, y: 956, zoom: 0.95, move: 0.8, push: 0.003 },
    { at: '6+0.15', x: OUT + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.004 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: ROOM + 300, y: 1300, face: 1, scale: 0.8 },
      { at: '3+0.1', x: WB + 970, face: -1, scale: 0.82, move: 0.8 },
      { at: '6+0.15', x: OUT + 820, scale: 0.92, move: 0.8 },
    ],
    moods: [{ at: 0, mood: 'excited' }, { at: '2', mood: 'shocked' }, { at: '3', mood: 'think' }, { at: '6', mood: 'determined' }, { at: '7', mood: 'happy' }],
    looks: [{ at: 0, look: 'right' }, { at: '2', look: 'cam' }, { at: '3', look: 'left' }, { at: '6', look: 'cam' }],
    actions: [
      { at: '1:gave', do: 'hold', dur: 1.2 },
      { at: '2', do: 'facepalm', dur: 1.0 },
      { at: '3:6', do: 'write', dur: 3.2 },
      { at: '6:change', do: 'point', dur: 1.0 },
      { at: '7:save', do: 'jump', h: 140 }, { at: '7:save+0.1', do: 'cheer', dur: 1.2 },
    ],
  }],

  props: [
    { type: 'badge', at: 0.05, text: 'AI FOR TRADERS  PART 4/5' },
    { type: 'title', at: 0.02, until: '1:handed-0.05', text: 'I GAVE CLAUDE\nMY *JOURNAL*', y: 330, sfx: 'bell' },
    { type: 'custom', layer: 'back', at: 0, until: '3+0.3', draw: (t) => robot(ROOM + 880, 1300, 0.9, t) },
    // notebook to the robot, red card back
    { type: 'custom', layer: 'front', at: '1:gave', until: '1:gave+1.4', draw: (t, sc, p) => {
      const q = Math.min(1, (t - p._at) / 0.9), e = q * q * (3 - 2 * q);
      const x = ROOM + 420 + 380 * e, y = 1090 - Math.sin(Math.PI * e) * 120;
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(-8 + 16 * e).toFixed(1)})"><rect x="-64" y="-50" width="128" height="100" rx="8" fill="#6b4226" stroke="#3a2214" stroke-width="5"/>
        <rect x="-50" y="-36" width="100" height="72" rx="4" fill="#f4efe2"/><line x1="-36" x2="36" y1="-14" y2="-14" stroke="#8d97a8" stroke-width="5"/><line x1="-36" x2="24" y1="6" y2="6" stroke="#8d97a8" stroke-width="5"/></g>`;
    } },
    { type: 'sticky', space: 'screen', at: '1:card', until: '3', x: 540, y: 560, w: 700, h: 330, rot: -3, size: 64, color: '#ffcdd2',
      text: 'You lose most after\n*2 losses in a row*', sfx: 'thud' },
    { type: 'tag', space: 'screen', at: '1:card', until: '3', x: 540, y: 770, size: 18, text: 'ILLUSTRATIVE' },

    // the six columns, handwritten
    { id: 'h1', type: 'write', at: '3:date', until: '4:prompt', x: WB + 120, y: 470, size: 80, keyColor: '#1f8f84', text: 'Date  Time  *Setup*' },
    { id: 'h2', type: 'write', at: '3:risk', until: '4:prompt', x: WB + 120, y: 610, size: 80, keyColor: '#d84341', text: 'Risk  Result  *Feeling*' },
    { type: 'draw', around: 'h2', sub: 'Feeling', at: '3:felt', until: '4:prompt', shape: 'underline' },
    // the prompt card, on screen for two lines (more than 3 s)
    { type: 'custom', space: 'screen', at: '4:prompt', until: '6-0.02', draw: (t, sc, p) => {
      const q = Math.min(1, (t - p._at) / 0.3), o = Math.min(q, Math.max(0, (p._until - t) / 0.2));
      const lines = wrap(PROMPT), h = 124 + lines.length * 55;
      return `<g opacity="${o.toFixed(2)}"><rect x="60" y="330" width="960" height="${h}" rx="30" fill="#141a26" stroke="#E4C471" stroke-width="5" filter="url(#shadow)"/>
        <text data-qa="screen" data-g="jp" x="100" y="392" font-family="Luckiest Guy" font-size="44" fill="#E4C471">THE PROMPT</text>
        ${lines.map((l, k) => `<text data-qa="screen" data-g="jp" x="100" y="${456 + k * 55}" font-family="Inter" font-weight="600" font-size="40" fill="#fff">${l}</text>`).join('')}</g>`;
    } },

    // the loop
    { type: 'title', at: '6', until: '7:save-0.05', text: 'THE *LOOP*', y: 300, size: 120 },
    { type: 'rules', at: '6', x: OUT + 140, y: 335, w: 920, title: '', gap: 90, size: 46,
      items: [
        { at: '6', text: '1. Keep the *journal*' },
        { at: '6+0.15', text: '2. Ask for the *patterns*' },
        { at: '6:change', text: '3. Change *one rule*' },
        { at: '6:look', text: '4. Review in *2 weeks*' },
      ] },
    { type: 'title', at: '7:save', text: '*SAVE THIS*', y: 300, size: 120, icon: 'bookmark', sfx: 'ding' },
    { type: 'tag', space: 'screen', at: '6', x: 540, y: 1163, size: 16, text: 'CLAUDE IS MADE BY ANTHROPIC  NOT AFFILIATED' },
  ],

  sfx: [{ at: '1:gave', name: 'whoosh', gain: 0.6, dur: 0.8 }, { at: '5', name: 'pop', gain: 0.6 }],
};
