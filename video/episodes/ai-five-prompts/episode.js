// Episode: 5 prompts I run in Claude before every trade. (AI for traders, Part 3/5)
// Prompts are the exact texts from "AI Fikirleri v2 2026-11-13"; each stays on screen for its whole line
// (3 s or more) and the full texts go into the caption. Claude is named only; the robot is a generic
// assistant, no logo or interface. Product (1 of 2): BTC AI Analysis Prompt Pack, mentioned in the caption.
const ROOM = 0, WB = 1200, OUT = 2400;
const PROMPTS = [
  'Here is my trade plan: market, timeframe, entry, stop, target, account size, risk percent. Act as a skeptical risk manager and give me 3 reasons this trade fails.',
  'Tell me the exact price that proves my idea wrong. Do not tell me whether to buy or sell.',
  'Check my position size against my risk percent and my stop distance. Show the math.',
  "Summarise today's news for this market in 3 bullet points and mark anything scheduled in the next 24 hours.",
  'Here are my last 20 trades. Find the one habit that costs me the most money. Be blunt.',
];

// wrap by characters (Inter 600 at 36 px is about 19 px per character; 46 characters fit 880 px)
const wrap = (s, n = 42) => {
  const out = []; let line = '';
  for (const w of s.split(' ')) { if ((line + ' ' + w).trim().length > n) { out.push(line.trim()); line = w; } else line += ' ' + w; }
  if (line.trim()) out.push(line.trim());
  return out;
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const promptCard = (t, at, until, i) => {
  const q = Math.min(1, (t - at) / 0.3), o = Math.min(q, Math.max(0, (until - t) / 0.2));
  const lines = wrap(PROMPTS[i]);
  const h = 124 + lines.length * 55;
  const s = 0.85 + 0.15 * (1 - Math.pow(1 - q, 3));
  return `<g transform="translate(540 ${330 + h / 2}) scale(${s.toFixed(3)}) translate(-540 ${-(330 + h / 2)})" opacity="${o.toFixed(2)}">
    <rect x="60" y="330" width="960" height="${h}" rx="30" fill="#141a26" stroke="#E4C471" stroke-width="5" filter="url(#shadow)"/>
    <text data-qa="screen" data-g="pc${i}" x="100" y="392" font-family="Luckiest Guy" font-size="44" fill="#E4C471">PROMPT ${i + 1}/5</text>
    <g transform="translate(960 378)"><rect x="-18" y="-22" width="30" height="36" rx="5" fill="none" stroke="#8d97a8" stroke-width="5"/><rect x="-8" y="-12" width="30" height="36" rx="5" fill="#141a26" stroke="#8d97a8" stroke-width="5"/></g>
    ${lines.map((l, k) => `<text data-qa="screen" data-g="pc${i}" x="100" y="${456 + k * 55}" font-family="Inter" font-weight="600" font-size="40" fill="#fff">${esc(l)}</text>`).join('')}
  </g>`;
};

// generic AI helper robot (not a logo)
const robot = (x, y, s, t, glow) => `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="6" rx="110" ry="16" fill="#000" opacity="0.25"/>
  <rect x="-50" y="-150" width="100" height="150" rx="26" fill="#3b5bdb" stroke="#1d2e70" stroke-width="6"/>
  <g transform="translate(0 ${(-260 + Math.sin(t * 3) * 6).toFixed(1)})">
    <line x1="0" y1="-70" x2="0" y2="-100" stroke="#1d2e70" stroke-width="7"/><circle cy="-106" r="12" fill="${glow ? '#E4C471' : '#ef5350'}"/>
    <rect x="-90" y="-70" width="180" height="130" rx="34" fill="#5c7cfa" stroke="#1d2e70" stroke-width="7"/>
    <rect x="-66" y="-46" width="132" height="82" rx="20" fill="#0d1530"/>
    <circle cx="-26" cy="-6" r="13" fill="#9fd3ff"/><circle cx="26" cy="-6" r="13" fill="#9fd3ff"/>
    <path d="M-20 22 Q 0 34 20 22" stroke="#9fd3ff" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>
  <rect x="-80" y="-140" width="26" height="90" rx="12" fill="#3b5bdb" stroke="#1d2e70" stroke-width="5" transform="rotate(${(12 + 6 * Math.sin(t * 2)).toFixed(1)} -67 -140)"/>
  <rect x="54" y="-140" width="26" height="90" rx="12" fill="#3b5bdb" stroke="#1d2e70" stroke-width="5" transform="rotate(${(-12 - 6 * Math.sin(t * 2)).toFixed(1)} 67 -140)"/>
</g>`;

export default {
  id: 'ai-five-prompts',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: "Don't ask Claude if you should enter. Give it your plan and ask it to break it. Here are five prompts.",
      caption: "Don't ask *Claude* if you should enter. Give it your *plan* and ask it to *break* it. Here are *5 prompts*.", pauseAfter: 0.3 },
    { say: 'One: act as a skeptical risk manager. Give me three reasons this trade fails.',
      caption: '*One*: act as a *skeptical risk manager*. Give me *3 reasons* this trade fails.', pauseAfter: 0.6 },
    { say: 'Two: tell me the price that proves my idea wrong. Do not tell me to buy or sell.',
      caption: '*Two*: tell me the price that proves my idea *wrong*. Do not tell me to buy or sell.', pauseAfter: 0.6 },
    { say: 'Three: check my position size against my risk and my stop. Show the math.',
      caption: '*Three*: check my *position size* against my risk and my stop. Show the *math*.', pauseAfter: 0.6 },
    { say: "Four: summarise today's news, and flag anything scheduled in the next twenty four hours.",
      caption: "*Four*: summarise today's *news*, and flag anything scheduled in the next *24 hours*.", pauseAfter: 0.6 },
    { say: 'Five: here are my last twenty trades. Find the habit that costs me the most.',
      caption: '*Five*: here are my last *20 trades*. Find the *habit* that costs me the most.', pauseAfter: 0.5 },
    { say: 'Save this, and use number one before your next trade.',
      caption: '*Save this*, and use *number one* before your next trade.' },
  ],

  world: [
    { set: 'room', x: ROOM },
    { set: 'whiteboard', x: WB },
    { set: 'outdoor', x: OUT },
  ],

  camera: [
    { at: 0, x: ROOM + 620, y: 1000, zoom: 1.0, push: 0.008 },
    { at: '4+0.1', x: WB + 610, y: 1000, zoom: 0.95, move: 0.8, push: 0.004 },
    { at: '7+0.15', x: OUT + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.004 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: ROOM + 300, y: 1300, face: 1, scale: 0.8 },
      { at: '4+0.1', x: WB + 300, face: 1, move: 0.8 },
      { at: '7+0.15', x: OUT + 820, face: -1, scale: 0.92, move: 0.8 },
    ],
    moods: [{ at: 0, mood: 'determined' }, { at: '2', mood: 'think' }, { at: '4', mood: 'happy' }, { at: '6', mood: 'smug' }, { at: '7', mood: 'happy' }],
    looks: [{ at: 0, look: 'cam' }, { at: '1:give', look: 'right' }, { at: '2', look: 'cam' }, { at: '4', look: 'right' }, { at: '7', look: 'cam' }],
    actions: [
      { at: '1:give', do: 'hold', dur: 1.2 },
      { at: '2:one', do: 'point', dur: 0.8 }, { at: '3:two', do: 'point', dur: 0.8 }, { at: '4:three', do: 'point', dur: 0.8 },
      { at: '5:four', do: 'point', dur: 0.8 }, { at: '6:five', do: 'point', dur: 0.8 },
      { at: '7:save', do: 'jump', h: 140 }, { at: '7:save+0.1', do: 'cheer', dur: 1.2 },
    ],
  }],

  props: [
    { type: 'badge', at: 0.05, text: 'AI FOR TRADERS  PART 3/5' },
    { type: 'title', at: 0.02, until: '2-0.05', text: 'COPY THESE\n*5 PROMPTS*', y: 330, sfx: 'bell' },
    // the helper robot: at the desk, then at the whiteboard
    { type: 'custom', layer: 'back', at: 0, until: '4+0.3', draw: (t, sc) => robot(ROOM + 880, 1300, 0.9, t, t > sc.tl.at('1:give') + 0.6) },
    { type: 'custom', layer: 'back', at: '4', until: '7+0.3', draw: (t) => robot(WB + 900, 1300, 0.9, t, true) },
    // the plan file passing from bull to robot
    { type: 'custom', layer: 'front', at: '1:give', until: '1:give+1.4', draw: (t, sc, p) => {
      const q = Math.min(1, (t - p._at) / 0.9), e = q * q * (3 - 2 * q);
      const x = ROOM + 420 + (ROOM + 800 - (ROOM + 420)) * e, y = 1090 - Math.sin(Math.PI * e) * 120;
      return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(-8 + 16 * e).toFixed(1)})"><rect x="-60" y="-44" width="120" height="88" rx="8" fill="#f4efe2" stroke="#8d6e4a" stroke-width="5"/>
        <rect x="-60" y="-44" width="120" height="20" rx="6" fill="#E4C471"/><line x1="-42" x2="42" y1="-4" y2="-4" stroke="#8d97a8" stroke-width="5"/><line x1="-42" x2="30" y1="14" y2="14" stroke="#8d97a8" stroke-width="5"/></g>`;
    } },
    // prompt cards, one per line, each on screen for the whole line
    ...[0, 1, 2, 3, 4].map((i) => ({ type: 'custom', space: 'screen', at: `${i + 2}`, until: `${i + 3}-0.02`, sfx: false,
      draw: (t, sc, p) => promptCard(t, p._at, p._until, i) })),

    // CTA
    { type: 'rules', at: '7', x: OUT + 140, y: 335, w: 920, title: '', gap: 80, size: 42,
      items: [
        { at: '7', text: '1. 3 reasons it *fails*' },
        { at: '7+0.1', text: '2. Where my idea is *wrong*' },
        { at: '7+0.2', text: '3. Check my *size math*' },
        { at: '7+0.3', text: '4. *News* + next 24h' },
        { at: '7+0.4', text: '5. My costliest *habit*' },
      ] },
    { type: 'title', at: '7:save', text: '*SAVE THIS*', y: 300, size: 120, icon: 'bookmark', sfx: 'ding' },
    { type: 'tag', space: 'screen', at: '7', x: 540, y: 1163, size: 16, text: 'CLAUDE IS MADE BY ANTHROPIC  NOT AFFILIATED' },
  ],

  sfx: [
    { at: '1:give', name: 'whoosh', gain: 0.6, dur: 0.8 },
    { at: '2', name: 'pop', gain: 0.8 }, { at: '3', name: 'pop', gain: 0.8 }, { at: '4', name: 'pop', gain: 0.8 },
    { at: '5', name: 'pop', gain: 0.8 }, { at: '6', name: 'pop', gain: 0.8 },
  ],
};
