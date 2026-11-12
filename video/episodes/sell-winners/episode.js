// Episode: You sell winners too early. You hold losers too long. (idea card 8, Fikirler 2026-11-12)
// Source: "Are Investors Reluctant to Realize Their Losses?" (1998): trading records of 10,000 accounts at a
// large discount brokerage; investors show "a strong preference for realizing winners rather than losers".
// https://faculty.haas.berkeley.edu/odean/papers/disposition/disposition.html
// Position cards (+4%, -8% to -30%) are illustrative.
const ST = 0, EX = 1800, ROOM = 3000;

// balloons held by the bull: green one lets go, red one swells and lifts him
const balloons = (t, sc) => {
  const st = sc.actor('bull').state(t);
  const s = st.s;
  const hx = st.x + 125 * s, hy = st.y - 140 * s; // right hand
  const lx = st.x - 125 * s, ly = st.y - 140 * s; // left hand
  const go = sc.tl.at('1:winners'), grow = sc.tl.at('1:losers');
  let out = '';
  // green: small, released on "winners"
  const q = Math.max(0, t - go);
  const gx = lx - 40 + q * 120, gy = ly - 260 - q * q * 700;
  if (gy > -1200) {
    out += q > 0 ? '' : `<path d="M${lx} ${ly} Q ${lx - 30} ${ly - 120} ${gx} ${gy + 70}" stroke="#d8d8d8" stroke-width="4" fill="none"/>`;
    out += `<ellipse cx="${gx}" cy="${gy}" rx="58" ry="70" fill="#26a69a" stroke="#14544e" stroke-width="5"/><path d="M${gx - 8} ${gy + 70} L ${gx + 8} ${gy + 70} L ${gx} ${gy + 82} Z" fill="#14544e"/>
      <text x="${gx}" y="${gy + 14}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="40" fill="#fff">+</text>`;
  }
  // red: grows from the "losers" word until the scene ends
  const r = 60 + 110 * Math.max(0, Math.min(1, (t - grow) / 3.2));
  const rx = hx + 70 + r * 0.55, ry = hy - 250 - r;
  out += `<path d="M${hx} ${hy} Q ${hx + 50} ${hy - 100} ${rx} ${ry + r * 1.15}" stroke="#d8d8d8" stroke-width="4" fill="none"/>
    <ellipse cx="${rx}" cy="${ry}" rx="${r}" ry="${r * 1.15}" fill="#ef5350" stroke="#8e2a28" stroke-width="6"/>
    <ellipse cx="${rx - r * 0.35}" cy="${ry - r * 0.45}" rx="${r * 0.18}" ry="${r * 0.28}" fill="#fff" opacity="0.35"/>
    <text x="${rx}" y="${ry + r * 0.22}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${(r * 0.7).toFixed(0)}" fill="#fff">-</text>`;
  return out;
};

export default {
  id: 'sell-winners',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.8,
  narrator: 'bull',

  lines: [
    { say: 'You sell your winners too early. And hold your losers too long.',
      caption: 'You sell your *winners* too early. And hold your *losers* too long.' },
    { say: 'It has a name: the disposition effect.',
      caption: 'It has a name: the *disposition effect*.', pauseAfter: 0.35 },
    { say: 'A study of ten thousand brokerage accounts found a strong preference for selling winners over losers.',
      caption: 'A study of *10,000* brokerage accounts found a strong preference for selling *winners* over *losers*.' },
    { say: 'Why? Your buy price becomes an anchor.',
      caption: 'Why? Your *buy price* becomes an *anchor*.' },
    { say: 'Green feels like a gift to grab. Red feels like a loan that must come back.',
      caption: '*Green* feels like a gift to grab. *Red* feels like a loan that must come back.' },
    { say: 'So you lock in small wins and let losses grow.',
      caption: 'So you lock in *small wins* and let *losses grow*.', pauseAfter: 0.35 },
    { say: "Fix it at the entry. Write your exit when you buy, not when it hurts.",
      caption: 'Fix it at the *entry*. Write your *exit* when you buy, not when it *hurts*.' },
    { say: 'Send this to the friend still holding that coin.',
      caption: '*Send this* to the friend still holding that coin.' },
  ],

  world: [
    { set: 'busstop', x: ST },
    { set: 'exchange', x: EX, opts: { symbol: 'COIN A / COIN B' } },
    { set: 'room', x: ROOM },
  ],

  camera: [
    { at: 0, x: ST + 560, y: 986, zoom: 1.05, push: 0.01 },
    { at: '2', x: ST + 560, y: 900, zoom: 1.0, move: 0.8 },
    { at: '3+0.15', x: EX + 600, y: 941, zoom: 0.92, move: 0.8, push: 0 },
    { at: '7+0.15', x: ROOM + 640, y: 970, zoom: 1.0, move: 0.8 },
    { at: '8', x: ROOM + 600, y: 1000, zoom: 1.06, move: 0.5 },
  ],
  shake: [{ at: '6:grow', amp: 8 }],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: ST + 500, y: 1300, face: 1, scale: 0.8 },
      { at: '2', y: 1180, move: 1.2, hop: false },
      { at: '3+0.15', x: EX + 980, y: 1300, face: -1, scale: 0.82, move: 0.8 },
      { at: '7+0.15', x: ROOM + 330, face: 1, scale: 0.85, move: 0.8 },
    ],
    moods: [
      { at: 0, mood: 'happy' }, { at: '1:losers', mood: 'worried' }, { at: '2', mood: 'shocked' }, { at: '3', mood: 'think' },
      { at: '5:red', mood: 'worried' }, { at: '6:losses', mood: 'sad' }, { at: '7', mood: 'determined' }, { at: '8', mood: 'happy' },
    ],
    looks: [
      { at: 0, look: 'cam' }, { at: '1:winners', look: 'upleft' }, { at: '1:losers', look: 'upright' }, { at: '2:name', look: 'cam' },
      { at: '3', look: 'left' }, { at: '4', look: 'cam' }, { at: '5', look: 'left' }, { at: '7', look: 'right' }, { at: '7:hurts', look: 'cam' },
    ],
    actions: [
      { at: '1:losers', do: 'sweat', dur: 2.6 },
      { at: '2', do: 'shake', dur: 0.6 },
      { at: '3:study', do: 'point', dur: 1.0 },
      { at: '4:anchor', do: 'tilt', dur: 0.8, deg: 10 },
      { at: '5:green', do: 'point', dur: 0.8 },
      { at: '6:losses', do: 'facepalm', dur: 1.0 },
      { at: '7:write', do: 'write', dur: 1.4 },
      { at: '8:send', do: 'wave', dur: 2.0 },
    ],
  }],

  props: [
    // hook: two balloons
    { type: 'title', at: 0.02, until: '2-0.05', text: 'SELL *WINNERS*.\nKEEP *LOSERS*?', y: 325, sfx: 'bell' },
    { type: 'custom', layer: 'front', at: 0, until: '3+0.3', draw: (t, sc) => balloons(t, sc) },
    { type: 'title', at: '2:disposition', until: '3-0.05', text: 'THE *DISPOSITION*\nEFFECT', y: 325 },

    // the study and the two positions
    { type: 'sticky', at: '3:study', until: '4', x: EX + 330, y: 560, w: 300, h: 210, rot: -4, size: 44,
      text: 'Study:\n*10,000* accounts\nSource in caption', keyColor: '#1f6f66' },
    { id: 'winner', type: 'card', at: '4', until: '7+0.3', x: EX + 90, y: 420, w: 470, title: 'COIN A', badge: 'SOLD', badgeColor: '#26a69a', tag: 'ILLUSTRATIVE',
      rows: [{ label: 'Result', value: '+4%', color: '#26a69a' }, { label: 'Held for', value: '2 hours' }] },
    { id: 'loser', type: 'card', at: '4+0.2', until: '7+0.3', x: EX + 590, y: 420, w: 470, title: 'COIN B', badge: 'HOLDING', badgeColor: '#ef5350', tag: 'ILLUSTRATIVE',
      rows: [
        { label: 'Result', values: [{ at: '4+0.2', v: '-8%' }, { at: '5:red', v: '-15%' }, { at: '6:losses', v: '-30%' }], color: '#ef5350' },
        { label: 'Held for', values: [{ at: '4+0.2', v: '3 weeks' }, { at: '6:losses', v: '5 months' }] },
      ] },
    { type: 'custom', layer: 'front', at: '4:buy', until: '5', draw: (t, sc, p) => {
      // the buy price as an anchor line across the chart
      const q = Math.min(1, (t - p._at) / 0.5), y = 760;
      return `<line x1="${EX + 84}" x2="${EX + 84 + 1010 * q}" y1="${y}" y2="${y}" stroke="#E4C471" stroke-width="6" stroke-dasharray="20 12"/>
        <g transform="translate(${EX + 1010} ${y + 70}) scale(${q.toFixed(2)})" opacity="${q.toFixed(2)}">
          <circle cy="-52" r="14" fill="none" stroke="#E4C471" stroke-width="8"/><line y1="-38" y2="40" stroke="#E4C471" stroke-width="10"/>
          <line x1="-26" x2="26" y1="-16" y2="-16" stroke="#E4C471" stroke-width="8"/><path d="M-44 10 Q -40 52 0 52 Q 40 52 44 10" fill="none" stroke="#E4C471" stroke-width="10" stroke-linecap="round"/></g>
        <text data-qa="world" data-g="anchor" x="${EX + 100}" y="${y - 18}" font-family="Inter" font-weight="800" font-size="30" fill="#E4C471" opacity="${q.toFixed(2)}">YOUR BUY PRICE</text>`;
    } },

    // fix it at the entry
    { type: 'sticky', at: '7:write', until: '8-0.05', x: ROOM + 955, y: 940, w: 250, h: 210, rot: 6, size: 40, text: 'EXIT:\nwritten\nat entry' },
    { type: 'title', at: '7:fix', until: '8-0.05', text: 'WRITE THE EXIT\n*WHEN YOU BUY*', y: 325 },
    { type: 'title', at: '8:send', text: '*SEND THIS*', y: 300, size: 140, icon: 'send', sfx: 'ding' },
    { type: 'confetti', at: '8:send', x: 540, y: 760, n: 110 },
  ],

  sfx: [
    { at: '1:winners', name: 'pop', gain: 0.9 },
    { at: '1:losers', name: 'whoosh', gain: 0.5, dur: 1.4 },
    { at: '6:losses', name: 'sad', gain: 0.7 },
  ],
};
