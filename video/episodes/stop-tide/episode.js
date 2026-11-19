// Episode: Moving your stop doesn't stop the loss. No narration (user request 19 Nov 2026).
// Our gold bull plants a STOP LOSS sign on the beach. Each time a wave comes close, it pulls the sign
// up and moves it further back, and the loss on the sign doubles: -$200, -$400, -$800, -$1,600.
// Then a big wave takes all of it: -$3,200. End card: set it, leave it. Numbers are illustrative.
const LEN = 16.5;
const POS = [290, 440, 590, 730];               // where the sign gets planted (x)
const LOSS = ['-$200', '-$400', '-$800', '-$1,600'];
const MOVES = [[2.4, 3.2], [5.2, 6.0], [8.0, 8.8]]; // pull-up and replant times
const WAVES = [[0.6, 2.6, 290], [3.4, 5.4, 440], [6.2, 8.2, 590]]; // start, end, how far the water reaches
const BIG = [9.2, 11.0];                          // the big wave
const CARD = 11.8;
const ease = (q) => { q = Math.max(0, Math.min(1, q)); return q * q * (3 - 2 * q); };
const lerp = (a, b, q) => a + (b - a) * q;
const GROUND = 1300;

// where the sign is right now (planted, or carried by the bull)
function signX(t) {
  let x = POS[0];
  MOVES.forEach(([a, b], k) => { if (t >= a) x = lerp(POS[k], POS[k + 1], ease((t - a) / (b - a))); });
  return x;
}
function stage(t) { let k = 0; MOVES.forEach(([, b], i) => { if (t >= b) k = i + 1; }); return k; }
// how far the wet edge reaches right now
function shore(t) {
  let x = 200;
  for (const [a, b, reach] of WAVES) {
    if (t >= a && t <= b) {
      const q = (t - a) / (b - a);
      x = q < 0.55 ? lerp(200, reach, ease(q / 0.55)) : lerp(reach, 230, ease((q - 0.55) / 0.45));
    }
  }
  return x;
}

const scene = (t) => {
  let s = `<defs><linearGradient id="stSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1330"/><stop offset="1" stop-color="#1d2c5a"/></linearGradient>
    <linearGradient id="stSea" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#123a7a"/><stop offset="1" stop-color="#2a6fc0"/></linearGradient></defs>
    <rect x="-200" y="-200" width="1480" height="1100" fill="url(#stSky)"/>`;
  for (let i = 0; i < 60; i++) { const x = (i * 197) % 1080, y = 120 + ((i * 71) % 560); s += `<circle cx="${x}" cy="${y}" r="${(i % 3) + 1.5}" fill="#fff" opacity="${0.25 + (i % 5) * 0.12}"/>`; }
  s += `<circle cx="860" cy="260" r="70" fill="#f6e6b0" opacity="0.9"/>`;
  // far sea band and the sand
  s += `<rect x="-200" y="860" width="1480" height="80" fill="#1a4f9a"/><rect x="-200" y="900" width="1480" height="20" fill="#2a6fc0" opacity="0.6"/>
    <path d="M-200 940 L 1280 940 L 1280 1700 L -200 1700 Z" fill="#e8b878"/>
    <path d="M-200 1300 L 1280 1300 L 1280 1700 L -200 1700 Z" fill="#d9a666"/>`;
  for (let i = 0; i < 26; i++) s += `<ellipse cx="${(i * 131) % 1080}" cy="${980 + ((i * 53) % 600)}" rx="${8 + (i % 4) * 3}" ry="3" fill="#c48f52" opacity="0.5"/>`;
  // the sea coming in from the left (shoreline tilts with depth)
  const x = shore(t), wob = Math.sin(t * 3) * 10;
  s += `<path d="M-200 940 L ${x - 120 + wob} 940 Q ${x + wob} 1120 ${x - 40 + wob} 1300 L ${x - 160} 1700 L -200 1700 Z" fill="url(#stSea)"/>
    <path d="M${x - 120 + wob} 940 Q ${x + wob} 1120 ${x - 40 + wob} 1300 L ${x - 160} 1700" fill="none" stroke="#e8f3ff" stroke-width="14" stroke-linecap="round" opacity="0.9"/>`;
  for (let i = 0; i < 5; i++) s += `<path d="M${-150 + i * 60 + ((t * 80) % 60)} ${1000 + i * 120} q 40 -18 80 0" stroke="#bfe0ff" stroke-width="6" fill="none" opacity="0.5"/>`;
  // wet marks left by earlier waves
  WAVES.forEach(([, b, reach]) => { if (t > b) s += `<path d="M${reach - 110} 945 Q ${reach - 10} 1120 ${reach - 50} 1300 L ${reach - 170} 1700" fill="none" stroke="#b9875a" stroke-width="6" opacity="0.6"/>`; });
  return s;
};

// the sign follows the bull's left hand: planted (post in the sand, hand gripping it) or lifted and carried
const GRIP = 175; // bull stands this far right of the post so its left mitten sits on the pole
const sign = (t, sc) => {
  const k = stage(t), moving = MOVES.some(([a, b]) => t >= a - 0.25 && t < b + 0.1);
  const fallen = t > BIG[0] + 0.7;
  if (fallen) return `<g transform="translate(${POS[3] - 40} ${GROUND - 20}) rotate(-78)"><rect x="-9" y="-300" width="18" height="300" fill="#8a5a32" stroke="#141414" stroke-width="5"/><rect x="-105" y="-390" width="210" height="110" rx="12" fill="#f4efe2" stroke="#141414" stroke-width="7"/></g>`;
  const bull = sc.actors.find((a) => a.id === 'bull');
  const [hx, hy] = bull.anchor('handL', t);
  // planted: the post stands in the sand; carried: it rides in the hand, tilted toward the walk
  const lift = MOVES.reduce((m, [a, b]) => Math.max(m, Math.min(1, (t - a + 0.25) / 0.3, (b + 0.1 - t) / 0.3)), 0);
  const bottom = lerp(GROUND - 30, hy + 110, Math.max(0, lift));
  const x = hx, tilt = moving ? -10 * Math.max(0, lift) : Math.sin(t * 2) * 1.2;
  let s = `<g transform="translate(${x.toFixed(1)} ${bottom.toFixed(1)}) rotate(${tilt.toFixed(1)})">
    <rect x="-9" y="-310" width="18" height="310" rx="4" fill="#8a5a32" stroke="#141414" stroke-width="5"/>
    <rect x="-185" y="-400" width="210" height="110" rx="12" fill="#f4efe2" stroke="#141414" stroke-width="8"/>
    <text data-qa="world" data-g="sl" x="-80" y="-328" text-anchor="middle" font-family="Luckiest Guy" font-size="48" fill="#141414">STOP LOSS</text></g>`;
  if (lift <= 0) s += `<ellipse cx="${x.toFixed(1)}" cy="${GROUND - 26}" rx="56" ry="9" fill="#b9875a" opacity="0.7"/>`;
  const pop = Math.min(1, (t - (k ? MOVES[k - 1][1] : 0)) / 0.3);
  s += `<g transform="translate(${(x - 80).toFixed(1)} ${(bottom - 470).toFixed(1)}) scale(${(0.6 + 0.4 * pop).toFixed(2)})"><text data-qa="world" data-g="loss" x="0" y="0" text-anchor="middle" font-family="Luckiest Guy" font-size="${74 + k * 10}" fill="#ef5350" stroke="#141414" stroke-width="8" paint-order="stroke">${LOSS[k]}</text></g>`;
  return s;
};

// the big wave sweeping across, then pulling back
const bigWave = (t) => {
  const [a, b] = BIG;
  if (t < a || t > b + 1.2) return '';
  const q = (t - a) / (b - a);
  const front = q < 0.6 ? lerp(-400, 1500, ease(q / 0.6)) : lerp(1500, -600, ease((q - 0.6) / 0.4 + (t > b ? (t - b) / 1.2 : 0)));
  const F = front;
  return `<path d="M-700 1800 L -700 520 C ${F - 520} 430 ${F - 120} 330 ${F + 70} 500 C ${F + 170} 600 ${F + 80} 700 ${F - 20} 650 C ${F + 30} 900 ${F + 110} 1250 ${F + 170} 1800 Z" fill="#1d58ad"/>
    <path d="M-700 640 C ${F - 520} 560 ${F - 200} 520 ${F - 60} 600" fill="none" stroke="#3a7fd0" stroke-width="30" opacity="0.7"/>
    <path d="M${F - 300} 400 C ${F - 120} 330 ${F + 40} 380 ${F + 70} 500 C ${F + 170} 600 ${F + 80} 700 ${F - 20} 650" fill="none" stroke="#e8f3ff" stroke-width="34" stroke-linecap="round"/>
    ${Array.from({ length: 10 }, (_, i) => `<circle cx="${(F + 40 + Math.sin(i * 1.7 + t * 6) * 70).toFixed(1)}" cy="${(700 + i * 90).toFixed(1)}" r="${24 + (i % 3) * 12}" fill="#e8f3ff" opacity="0.85"/>`).join('')}`;
};

const card = (t) => {
  const q = Math.min(1, (t - CARD) / 0.5);
  return `<rect x="0" y="0" width="1080" height="1920" fill="#07090f" opacity="${(0.8 * q).toFixed(2)}"/>`;
};

export default {
  id: 'stop-tide',
  silent: true,
  captions: false,
  length: LEN,
  tail: 0,
  lines: [],
  sheet: [0.8, 1.9, 2.8, 4.5, 6.9, 9.6, 10.6, 13, 15.5],

  world: [],
  camera: [{ at: 0, x: 560, y: 1010, zoom: 1.05, push: 0 }],
  shake: [{ at: BIG[0] + 0.7, amp: 18 }],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: POS[0] + GRIP, y: GROUND, face: -1, scale: 0.7 },
      ...MOVES.map(([a, b], k) => ({ at: b, x: POS[k + 1] + GRIP, move: b - a })),
    ],
    moods: [
      { at: 0, mood: 'determined' }, { at: 1.6, mood: 'worried' }, { at: 3.2, mood: 'neutral' }, { at: 4.4, mood: 'worried' },
      { at: 6.0, mood: 'neutral' }, { at: 7.2, mood: 'shocked' }, { at: 8.8, mood: 'worried' }, { at: BIG[0] + 0.3, mood: 'shocked' },
      { at: BIG[1], mood: 'sad' },
    ],
    looks: [{ at: 0, look: 'left' }, { at: BIG[0], look: 'upleft' }, { at: BIG[1], look: 'down' }],
    actions: [
      // the left mitten grips the post the whole time, lower while carrying it
      { at: 0, do: 'pose', dur: BIG[0] + 0.7, L: 58, ramp: 0.2 },
      ...MOVES.map(([a, b]) => ({ at: a - 0.25, do: 'pose', dur: b - a + 0.35, L: 34, R: 40, ramp: 0.25 })),
      // turn side-on while pulling the post up and carrying it
      ...MOVES.map(([a, b]) => ({ at: a - 0.3, do: 'turn', dur: b - a + 0.5, by: 1.6, ramp: 0.3 })),
      ...MOVES.map(([a, b]) => ({ at: a + 0.1, do: 'sweat', dur: b - a })),
      { at: BIG[0] + 0.5, do: 'shake', dur: 0.6 },
      { at: BIG[1] + 0.2, do: 'facepalm', dur: 1.4 },
    ],
  }],

  props: [
    { type: 'custom', layer: 'back', at: 0, draw: (t) => scene(t) },
    { type: 'custom', layer: 'back', at: 0, until: CARD + 0.6, draw: (t, sc) => sign(t, sc) },
    { type: 'custom', layer: 'front', at: BIG[0], until: BIG[1] + 1.3, draw: (t) => bigWave(t) },
    { type: 'title', at: 0.05, until: 1.9, text: "WHERE'S YOUR\n*STOP?*", y: 330 },
    { type: 'title', at: BIG[0] + 0.9, until: CARD, text: '*-$3,200*', y: 420, size: 170, keyColor: '#ef5350', sfx: false },
    { type: 'tag', space: 'screen', at: 2.0, until: CARD, x: 540, y: 200, size: 16, text: 'ILLUSTRATIVE NUMBERS' },
    { type: 'custom', space: 'screen', at: CARD, draw: (t) => card(t) },
    { type: 'title', at: CARD + 0.2, until: 14.2, text: 'MOVING YOUR STOP\nDOES NOT *STOP*\nTHE LOSS', y: 760, size: 100 },
    { type: 'title', at: 14.3, text: 'SET IT.\n*LEAVE IT.*', y: 700, size: 140, sfx: 'ding' },
    { type: 'title', at: 14.9, text: '*SAVE THIS*', y: 1020, size: 90, icon: 'bookmark', sfx: false },
  ],

  sfx: [
    ...WAVES.map(([a]) => ({ at: a + 0.4, name: 'whoosh', gain: 0.45, dur: 1.2 })),
    ...MOVES.map(([, b]) => ({ at: b, name: 'thud', gain: 0.7 })),
    ...MOVES.map(([, b]) => ({ at: b + 0.1, name: 'pop', gain: 0.6 })),
    { at: BIG[0], name: 'whoosh', gain: 1.0, dur: 1.4 }, { at: BIG[0] + 0.7, name: 'thud', gain: 1.0 },
    { at: BIG[0] + 1.0, name: 'sad', gain: 0.7 },
    { at: CARD + 0.2, name: 'pop', gain: 0.6 },
  ],
};
