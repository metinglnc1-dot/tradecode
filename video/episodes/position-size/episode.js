// Episode: How big should your position be? (idea card 10, Fikirler 2026-11-13)
// Illustrative: $5,000 account, 1% risk = $50.
//  Entry 100, stop 98: $2 per unit, 50 / 2 = 25 units, position $2,500.
//  Entry 100, stop 95: $5 per unit, 50 / 5 = 10 units, position $1,000. Both stops cost $50.
// Product quota is full (2 of 2 used), so this one ships without a product.
const TAIL = 0, ROOM = 1200, WB = 2400, END = 3600;

// the tailor shop: two cuts of cloth, same price tag
const shop = (t, sc, ox, show) => {
  let s = `<rect x="${ox - 300}" y="-900" width="1800" height="2200" fill="#3b2a3f"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${ox - 300 + i * 200}" y="-900" width="100" height="2200" fill="#fff" opacity="0.03"/>`).join('')}
    <rect x="${ox - 300}" y="1300" width="1800" height="1400" fill="#2a1d18"/><rect x="${ox - 300}" y="1290" width="1800" height="14" fill="#140d0a"/>
    <rect x="${ox + 80}" y="1080" width="1040" height="40" rx="8" fill="#8d6e4a" stroke="#4a3526" stroke-width="6"/>
    <rect x="${ox + 120}" y="1120" width="30" height="180" fill="#4a3526"/><rect x="${ox + 1050}" y="1120" width="30" height="180" fill="#4a3526"/>
    <rect x="${ox + 120}" y="1062" width="960" height="18" fill="#E4C471"/>
    ${Array.from({ length: 33 }, (_, i) => `<line x1="${ox + 130 + i * 29}" x2="${ox + 130 + i * 29}" y1="1062" y2="${i % 5 ? 1072 : 1080}" stroke="#7a5c1c" stroke-width="3"/>`).join('')}`;
  if (!show) return s;
  const q = Math.min(1, Math.max(0, (t - show) / 0.4));
  const cloth = (x, w, col, label, units) => `<g opacity="${q.toFixed(2)}"><rect x="${x}" y="${(1062 - 240 * q).toFixed(1)}" width="${w}" height="${(240 * q).toFixed(1)}" rx="10" fill="${col}" stroke="#141414" stroke-width="6"/>
    <text data-qa="world" data-g="cl${label}" x="${x + w / 2}" y="${(1062 - 240 * q + 80).toFixed(1)}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="44" fill="#fff">${units}</text>
    <text data-qa="world" data-g="cl${label}2" x="${x + w / 2}" y="${(1062 - 240 * q + 140).toFixed(1)}" text-anchor="middle" font-family="Inter" font-weight="800" font-size="34" fill="#fff" opacity="0.85">${label}</text></g>`;
  return s + cloth(ox + 140, 500, '#5c7cfa', 'STOP 98', '25 UNITS') + cloth(ox + 700, 220, '#26a69a', 'STOP 95', '10');
};

// price ladder on screen
const ladder = (t, sc) => {
  const at = (a) => sc.tl.at(a);
  const o = Math.min(1, Math.max(0, (t - at('3')) / 0.3)) * Math.max(0, Math.min(1, (at('5') + 0.1 - t) / 0.2));
  const s98 = Math.min(1, Math.max(0, (t - at('3:stop')) / 0.3)), s95 = Math.min(1, Math.max(0, (t - at('4')) / 0.3));
  const Y = (p) => 400 + (100 - p) * 70; // 100 -> 400, 95 -> 750
  const row = (p, label, col, op, dash) => `<g opacity="${op.toFixed(2)}"><line x1="120" x2="640" y1="${Y(p)}" y2="${Y(p)}" stroke="${col}" stroke-width="7" ${dash ? 'stroke-dasharray="20 12"' : ''}/>
    <text data-qa="screen" data-g="lad${p}" x="120" y="${Y(p) - 16}" font-family="Inter" font-weight="900" font-size="38" fill="${col}">${label}</text></g>`;
  const box = (y, units, pos, op) => `<g opacity="${op.toFixed(2)}"><rect x="680" y="${y}" width="320" height="150" rx="22" fill="#0f1420" fill-opacity="0.95" stroke="#E4C471" stroke-width="5"/>
    <text data-qa="screen" data-g="box${y}" x="840" y="${y + 66}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="50" fill="#fff">${units}</text>
    <text data-qa="screen" data-g="box${y}" x="840" y="${y + 120}" text-anchor="middle" font-family="Inter" font-weight="700" font-size="32" fill="#9aa4b5">${pos}</text></g>`;
  return `<g opacity="${o.toFixed(2)}"><rect x="80" y="330" width="940" height="520" rx="30" fill="#141a26" fill-opacity="0.92" stroke="#334058" stroke-width="4"/>
    ${row(100, 'ENTRY 100', '#26a69a', 1, false)}${row(98, 'STOP 98   $2 / UNIT', '#ef5350', s98, true)}${row(95, 'STOP 95   $5 / UNIT', '#ef5350', s95, true)}
    ${box(420, '25 UNITS', '$2,500', Math.min(1, Math.max(0, (t - at('3:25')) / 0.3)))}${box(640, '10 UNITS', '$1,000', Math.min(1, Math.max(0, (t - at('4:10')) / 0.3)))}</g>`;
};

export default {
  id: 'position-size',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: 'Same risk. Different size. Why?',
      caption: 'Same *risk*. Different *size*. Why?', pauseAfter: 0.3 },
    { say: 'Account, five thousand dollars. Risk one percent. That is fifty dollars.',
      caption: 'Account, *$5,000*. Risk *1%*. That is *$50*.', pauseAfter: 0.2 },
    { say: 'Entry at one hundred, stop at ninety eight. Two dollars per unit, so twenty five units.',
      caption: 'Entry at *100*, stop at *98*. *$2* per unit, so *25* units.', pauseAfter: 0.3 },
    { say: 'Stop at ninety five? Five dollars per unit. Only ten units.',
      caption: 'Stop at *95*? *$5* per unit. Only *10* units.', pauseAfter: 0.3 },
    { say: 'If either stop is hit, you lose fifty dollars. Same risk.',
      caption: 'If either stop is hit, you lose *$50*. *Same risk*.', pauseAfter: 0.3 },
    { say: 'Size is your risk divided by the stop distance. Wider stop, smaller position.',
      caption: 'Size is your *risk* divided by the *stop distance*. *Wider stop*, *smaller position*.', pauseAfter: 0.3 },
    { say: 'Save this for your next trade.',
      caption: '*Save this* for your next trade.' },
  ],

  world: [
    { set: 'room', x: ROOM },
    { set: 'whiteboard', x: WB },
  ],

  camera: [
    { at: 0, x: TAIL + 600, y: 953, zoom: 0.95, push: 0.008 },
    { at: '2', x: ROOM + 620, y: 1000, zoom: 1.0, move: 0.8, push: 0.004 },
    { at: '5+0.1', x: WB + 610, y: 956, zoom: 0.95, move: 0.8, push: 0.002 },
    { at: '7+0.1', x: END + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.006 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: TAIL + 930, y: 1300, face: -1, scale: 0.8 },
      { at: '2', x: ROOM + 300, face: 1, scale: 0.85, move: 0.8 },
      { at: '5+0.1', x: WB + 970, face: -1, scale: 0.82, move: 0.8 },
      { at: '7+0.1', x: END + 930, face: -1, scale: 0.8, move: 0.8 },
    ],
    moods: [{ at: 0, mood: 'think' }, { at: '2', mood: 'determined' }, { at: '4', mood: 'think' }, { at: '5', mood: 'confident' }, { at: '7', mood: 'happy' }],
    looks: [{ at: 0, look: 'left' }, { at: '1:why', look: 'cam' }, { at: '3', look: 'upright' }, { at: '5', look: 'cam' }, { at: '6', look: 'left' }, { at: '7', look: 'cam' }],
    actions: [
      { at: '1:why', do: 'shrug', dur: 1.0 },
      { at: '2:risk', do: 'point', dur: 1.0 },
      { at: '3:25', do: 'point', dur: 1.0 },
      { at: '4:10', do: 'point', dur: 1.0 },
      { at: '6', do: 'write', dur: 3.2 },
      { at: '7:save', do: 'jump', h: 140 }, { at: '7:save+0.1', do: 'cheer', dur: 1.2 },
    ],
  }],

  props: [
    { type: 'custom', layer: 'back', at: 0, until: '2+0.6', draw: (t) => shop(t, null, TAIL, 0.3) },
    { type: 'custom', layer: 'back', at: '6', draw: (t, sc) => shop(t, sc, END, sc.tl.at('7:save')) },
    { type: 'title', at: 0.02, until: '2-0.05', text: 'SAME *RISK*\nDIFFERENT *SIZE*', y: 330, sfx: 'bell' },
    { type: 'tag', space: 'screen', at: 0.3, until: '7', x: 540, y: 1163, size: 16, text: 'ILLUSTRATIVE  $5,000 ACCOUNT  1% RISK = $50' },
    { type: 'title', at: '2:risk', until: '3-0.05', text: '*1%* OF $5,000\n= *$50*', y: 330 },
    { type: 'custom', space: 'screen', at: '3', until: '5+0.1', draw: (t, sc) => ladder(t, sc) },
    { type: 'title', at: '5', until: '6-0.05', text: 'BOTH LOSE *$50*', y: 300, size: 116 },

    // whiteboard
    { id: 'w1', type: 'write', at: '6', dur: 0.7, x: WB + 120, y: 450, size: 66, maxW: 790, keyColor: '#1f8f84', text: 'Size = *risk ÷ stop*' },
    { id: 'w2', type: 'write', at: '6:divided', dur: 0.6, x: WB + 120, y: 570, size: 56, maxW: 790, color: '#5b6680', text: '$50 ÷ $2 = 25 units' },
    { id: 'w3', type: 'write', at: '6:stop', dur: 0.6, x: WB + 120, y: 670, size: 56, maxW: 790, color: '#5b6680', text: '$50 ÷ $5 = 10 units' },
    { id: 'w4', type: 'write', at: '6:wider', dur: 0.6, x: WB + 120, y: 800, size: 60, maxW: 790, keyColor: '#d84341', text: 'Wider stop, *smaller* size' },
    { type: 'draw', around: 'w1', sub: 'risk ÷ stop', at: '6:position', shape: 'underline' },
    { type: 'title', at: '7:save', text: '*SAVE THIS*', y: 300, size: 120, icon: 'bookmark', sfx: 'ding' },
  ],

  sfx: [{ at: '3:25', name: 'pop', gain: 0.7 }, { at: '4:10', name: 'pop', gain: 0.7 }, { at: '5', name: 'thud', gain: 0.6 }],
};
