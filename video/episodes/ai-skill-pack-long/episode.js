// Long TikTok version (about 65 s) of AI for traders Part 1/5: what the free Day Trader skill pack actually does.
// Verified from the repository itself (github.com search: day-trader-skill, MIT, read 13 Nov 2026):
//   11 skills: scanner, news, entry, exit, timemachine (replays a session 10,000 times), risk, budget,
//   broker (sends approved orders, paper trading by default, never without your yes), alerts, analyst
//   (earnings), and a Congress trade-disclosure tracker. README: "Nothing in this pack can place an order on
//   its own. Paper trading is the default." Free public data, no API key.
// It is an independent open-source project, not an Anthropic product; the video says so. Claude is named
// only; no logo or interface is drawn. The tracker skill is named after a real politician: not shown.
const OFF = 0, EX = 1800, OUT = 3000;
const JOBS = [
  ['SCANNER', '4:scanner'], ['NEWS', '4:news'], ['ENTRY', '5:entry'], ['EXIT', '5:exit'], ['RISK', '6:risk'], ['BUDGET', '6:budget'],
  ['TIME MACHINE', '7:time'], ['ALERTS', '8:alerts'], ['EARNINGS', '8:earnings'], ['CONGRESS', '8:congress'], ['ORDERS', '9:orders'],
];
const CELL = (i) => {
  const row = i < 4 ? 0 : i < 8 ? 1 : 2;
  const col = row < 2 ? i % 4 : (i - 8) + 1;
  return [OFF + 290 + col * 245, 470 + row * 250];
};

// the open office: 11 robots at numbered desks, each lights up when its job is named
const office = (t, sc) => {
  let s = `<rect x="${OFF - 500}" y="-900" width="2300" height="2200" fill="#161d30"/>
    ${Array.from({ length: 24 }, (_, i) => `<rect x="${OFF - 500 + i * 100}" y="-900" width="50" height="2200" fill="#fff" opacity="0.02"/>`).join('')}
    <rect x="${OFF - 500}" y="1300" width="2300" height="1400" fill="#121520"/><rect x="${OFF - 500}" y="1282" width="2300" height="22" fill="#0b0d14"/>`;
  const allOn = t >= sc.tl.at('16');
  JOBS.forEach(([job, at], i) => {
    const [x, y] = CELL(i);
    const on = allOn || t >= sc.tl.at(at);
    const k = on ? Math.min(1, (t - (allOn ? sc.tl.at('16') : sc.tl.at(at))) / 0.3) : 0;
    const bob = Math.sin(t * 3 + i) * (on ? 6 : 2), hop = on && k < 1 ? -24 * Math.sin(Math.PI * k) : 0;
    const body = on ? '#5c7cfa' : '#3a4157', eye = on ? '#fff' : '#6b768c';
    s += `<g transform="translate(${x} ${y}) scale(1.25)">
      ${on ? `<ellipse cx="0" cy="40" rx="105" ry="22" fill="#E4C471" opacity="${(0.25 * k).toFixed(2)}"/>` : ''}
      <g transform="translate(0 ${(bob + hop).toFixed(1)})">
        <line x1="0" y1="-78" x2="0" y2="-58" stroke="${body}" stroke-width="5"/><circle cy="-82" r="7" fill="${on ? '#ef5350' : '#6b768c'}"/>
        <rect x="-40" y="-58" width="80" height="62" rx="18" fill="${body}"/>
        <circle cx="-15" cy="-30" r="8" fill="${eye}"/><circle cx="15" cy="-30" r="8" fill="${eye}"/>
      </g>
      <rect x="-95" y="6" width="190" height="20" rx="6" fill="#4a3526"/>
      <rect x="40" y="-34" width="52" height="40" rx="5" fill="#0c0f16" stroke="#2a2f3d" stroke-width="3"/>
      <text data-qa="world" data-g="desk${i}" x="0" y="64" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${job.length > 9 ? 22 : 27}" fill="${on ? '#E4C471' : '#6b768c'}">${i + 1}  ${job}</text>
    </g>`;
  });
  return s;
};

export default {
  id: 'ai-skill-pack-long',
  voice: { name: 'am_fenrir', speed: 1.15, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: "Everyone is posting about this free Day Trader skill pack for Claude. Here's what it actually does.",
      caption: "Everyone is posting about this free *Day Trader* skill pack for *Claude*. Here's what it *actually* does.", pauseAfter: 0.3 },
    { say: 'Open source, MIT license, made by an independent developer. Not by Anthropic.',
      caption: '*Open source*, *MIT* license, made by an *independent developer*. Not by Anthropic.' },
    { say: 'It runs on free public data. No API key needed.',
      caption: 'It runs on *free public data*. No *API key* needed.', pauseAfter: 0.3 },
    { say: 'Eleven skills. First, research: a chart scanner and a news monitor.',
      caption: '*11 skills*. First, *research*: a chart *scanner* and a *news* monitor.' },
    { say: 'Then timing: an entry timer and an exit planner.',
      caption: 'Then *timing*: an *entry* timer and an *exit* planner.' },
    { say: 'Then the guards: a risk manager and a budget manager.',
      caption: 'Then the *guards*: a *risk* manager and a *budget* manager.', pauseAfter: 0.2 },
    { say: 'A time machine replays a setup ten thousand times on past data.',
      caption: 'A *time machine* replays a setup *10,000 times* on past data.', pauseAfter: 0.2 },
    { say: 'Plus price alerts, an earnings reader, and a Congress trade tracker.',
      caption: 'Plus price *alerts*, an *earnings* reader, and a *Congress* trade tracker.', pauseAfter: 0.2 },
    { say: 'The last one sends orders. Only the ones you approve.',
      caption: 'The last one sends *orders*. Only the ones *you approve*.', pauseAfter: 0.35 },
    // "cannot", not "can't": the voice model drops the t and the line would mean the opposite
    { say: 'What it cannot do: predict the price, or promise a profit.',
      caption: 'What it *cannot* do: *predict* the price, or *promise* a profit.' },
    { say: 'It cannot place an order on its own. Paper trading is the default.',
      caption: 'It cannot place an order *on its own*. *Paper trading* is the default.', pauseAfter: 0.35 },
    { say: 'Before you use it, read the code. It is open, so you can see what each skill does.',
      caption: 'Before you use it, *read the code*. It is open, so you can see what each skill does.', pauseAfter: 0.25 },
    { say: 'Test it on paper for a few weeks before real money.',
      caption: 'Test it on *paper* for a few weeks before *real money*.', pauseAfter: 0.25 },
    { say: 'Remember, a confident answer is not the same as a right answer.',
      caption: 'Remember, a *confident* answer is not the same as a *right* answer.', pauseAfter: 0.25 },
    { say: 'Keep your own risk rules. The tool should follow them, not replace them.',
      caption: 'Keep your own *risk rules*. The tool should *follow* them, not *replace* them.', pauseAfter: 0.35 },
    { say: 'Which job would you hand over first? Comment the number.',
      caption: 'Which job would you hand over first? *Comment the number*.' },
  ],

  world: [
    { set: 'exchange', x: EX, opts: { symbol: 'DEMO' } },
    { set: 'outdoor', x: OUT },
  ],

  camera: [
    { at: 0, x: OFF + 610, y: 880, zoom: 0.95, push: 0 },
    { at: '2+0.15', x: EX + 600, y: 941, zoom: 0.92, move: 0.8, push: 0 },
    { at: '4+0.15', x: OFF + 610, y: 880, zoom: 0.92, move: 0.8, push: 0 },
    { at: '10+0.15', x: OUT + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.004 },
    { at: '12+0.15', x: EX + 600, y: 941, zoom: 0.92, move: 0.8, push: 0 },
    { at: '16+0.15', x: OFF + 610, y: 880, zoom: 0.92, move: 0.8, push: 0 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: OFF + 190, y: 1300, face: 1, scale: 0.7 },
      { at: '2+0.15', x: EX + 980, face: -1, scale: 0.82, move: 0.8 },
      { at: '4+0.15', x: OFF + 190, face: 1, scale: 0.7, move: 0.8 },
      { at: '10+0.15', x: OUT + 820, face: -1, scale: 0.92, move: 0.8 },
      { at: '12+0.15', x: EX + 980, face: -1, scale: 0.82, move: 0.8 },
      { at: '16+0.15', x: OFF + 190, face: 1, scale: 0.7, move: 0.8 },
    ],
    moods: [
      { at: 0, mood: 'excited' }, { at: '2', mood: 'think' }, { at: '4', mood: 'happy' }, { at: '10', mood: 'determined' },
      { at: '11:paper', mood: 'smug' }, { at: '12', mood: 'think' }, { at: '15', mood: 'determined' }, { at: '16', mood: 'happy' },
    ],
    looks: [{ at: 0, look: 'right' }, { at: '1:here', look: 'cam' }, { at: '4', look: 'upright' }, { at: '10', look: 'cam' }, { at: '12', look: 'cam' }, { at: '16', look: 'upright' }, { at: '16:comment', look: 'cam' }],
    actions: [
      { at: '1:posting', do: 'point', dur: 1.0 },
      { at: '2:not', do: 'shake', dur: 0.5 },
      { at: '4:scanner', do: 'point', dur: 3.0 },
      { at: '7:time', do: 'point', dur: 3.5 },
      { at: '10:predict', do: 'shrug', dur: 1.0 },
      { at: '11:paper', do: 'nod', dur: 0.6 },
      { at: '9:approve', do: 'nod', dur: 0.6 },
      { at: '13:test', do: 'point', dur: 1.0 }, { at: '14:confident', do: 'shake', dur: 0.5 }, { at: '15:rules', do: 'nod', dur: 0.6 },
      { at: '16:comment', do: 'wave', dur: 2.0 },
    ],
  }],

  props: [
    { type: 'badge', at: 0.05, text: 'AI FOR TRADERS  PART 1/5' },
    { type: 'custom', layer: 'back', at: 0, draw: (t, sc) => office(t, sc) },
    { type: 'title', at: 0.02, until: '2-0.05', text: 'WHAT IT *ACTUALLY* DOES', y: 300, size: 104, sfx: 'bell' },

    // who made it
    { type: 'card', at: '2:open', until: '4+0.3', x: EX + 300, y: 440, w: 600, title: 'SKILL PACK', badge: 'FOR CLAUDE', badgeColor: '#E4C471',
      rows: [
        { label: 'Source', value: 'Open, on GitHub' },
        { label: 'License', values: [{ at: '2:mit', v: 'MIT' }] },
        { label: 'Made by', values: [{ at: '2:independent', v: 'Independent developer' }] },
        { label: 'Anthropic product?', values: [{ at: '2:not', v: 'No' }], color: '#ef5350' },
        { label: 'Data', values: [{ at: '3:free', v: 'Free, no API key' }] },
      ] },

    // what it can't do
    { type: 'rules', at: '10', until: '12+0.3', x: OUT + 140, y: 360, w: 920, title: "WHAT IT *CANNOT* DO", titleSize: 64, gap: 100, size: 50,
      items: [
        { at: '10:predict', text: 'Predict the price', icon: 'alert', color: '#ef5350' },
        { at: '10:promise', text: 'Promise a profit', icon: 'alert', color: '#ef5350' },
        { at: '11:place', text: 'Place an order on its own', icon: 'alert', color: '#ef5350' },
      ] },
    { type: 'tag', at: '11:paper', until: '12+0.3', x: OUT + 600, y: 790, size: 20, text: 'PAPER TRADING IS THE DEFAULT' },

    // CTA
    { type: 'rules', at: '12', until: '16+0.3', x: EX + 140, y: 360, w: 920, title: 'BEFORE YOU *USE IT*', titleSize: 64, gap: 100, size: 50,
      items: [
        { at: '12:read', text: 'Read the *code*', icon: 'check', color: '#26a69a' },
        { at: '13:paper', text: 'Test on *paper* first', icon: 'check', color: '#26a69a' },
        { at: '14:confident', text: 'Confident is not *right*', icon: 'alert', color: '#ef5350' },
        { at: '15:rules', text: 'Your *risk rules* lead', icon: 'check', color: '#26a69a' },
      ] },
    { type: 'title', at: '16:comment', text: '*COMMENT* THE NUMBER', y: 300, size: 104, icon: 'comment', sfx: 'ding' },
    { type: 'tag', space: 'screen', at: '16', x: 540, y: 1163, size: 16, text: 'CLAUDE IS MADE BY ANTHROPIC  NOT AFFILIATED' },
  ],

  sfx: [
    ...JOBS.map(([, at]) => ({ at, name: 'tick', gain: 1.0 })),
    { at: '10:predict', name: 'thud', gain: 0.8 }, { at: '10:promise', name: 'thud', gain: 0.8 }, { at: '11:place', name: 'thud', gain: 0.8 },
  ],
};
