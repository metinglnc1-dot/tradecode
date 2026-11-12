// Episode: Would you enter here? (idea card 4, Fikirler 2026-11-12), v2 script.
// No figures. The chart is illustrative and points at no real asset. No buy or sell call:
// the lesson is process (if you enter, know where your idea fails before you enter).
// Structure: question, 3-second thinking gap with YES/WAIT buttons, then each answer is explained.
const CH = 0, BUS = 1800, ROOM = 3000;
const BIG = { x: 900, top: 520, bottom: 1250 };

const bus = (x) => `<g>
  <rect x="${x - 330}" y="985" width="660" height="290" rx="34" fill="#26a69a" stroke="#14544e" stroke-width="8"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${x - 300 + i * 116}" y="1020" width="96" height="92" rx="12" fill="#bfe8ff" opacity="0.85"/>`).join('')}
  <rect x="${x + 250}" y="1130" width="60" height="120" rx="8" fill="#14544e"/>
  <rect x="${x - 330}" y="1160" width="660" height="18" fill="#E4C471"/>
  <circle cx="${x - 200}" cy="1275" r="42" fill="#1b1f27" stroke="#555" stroke-width="10"/><circle cx="${x + 200}" cy="1275" r="42" fill="#1b1f27" stroke="#555" stroke-width="10"/>
  <circle cx="${x + 318}" cy="1210" r="14" fill="#fff7d6"/></g>`;

// two answer buttons, screen space; `pick` highlights one of them
const buttons = (t, at, y, pick) => {
  const btn = (x, label, c, d) => {
    if (pick && pick !== label) return ''; // while an answer is explained only its button stays
    const q = Math.max(0, Math.min(1, (t - at - (pick ? 0 : d)) / 0.3));
    if (q <= 0) return '';
    const dim = 1;
    const s = (q < 1 ? 0.5 + 0.6 * q : 1.1 - 0.1 * Math.min(1, (t - at - d - 0.3) / 0.2)) * (1 + 0.03 * Math.sin((t - at) * 6 + d * 9));
    return `<g transform="translate(${x} ${y}) scale(${s.toFixed(3)})" opacity="${dim}"><rect x="-170" y="-80" width="340" height="160" rx="40" fill="${c}" stroke="#141414" stroke-width="10" filter="url(#shadow)"/>
      <text data-qa="screen" data-g="cta-${label}" x="0" y="34" text-anchor="middle" font-family="Luckiest Guy" font-size="96" fill="#fff" stroke="#141414" stroke-width="10" paint-order="stroke">${label}</text></g>`;
  };
  return btn(300, 'YES', '#26a69a', 0) + btn(780, 'WAIT', '#d4a63a', 0.15);
};

export default {
  id: 'enter-here',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: 'Big green candle. Would you enter right here? Yes or wait?',
      caption: 'Big *green candle*. Would you *enter right here*? *YES* or *WAIT*?' },
    { say: 'Comment your answer. You have three seconds.',
      caption: '*Comment* your answer. You have *3 seconds*.', pauseAfter: 3.4 }, // thinking gap
    { say: 'If you said yes, where is your stop?',
      caption: 'If you said *YES*, where is your *stop*?' },
    { say: "Your idea fails if price drops back below this candle. That's way down here.",
      caption: "Your idea *fails* if price drops back below this candle. That's way *down here*." },
    { say: 'A far stop means a big loss, or a tiny position.',
      caption: 'A *far stop* means a *big loss*, or a *tiny position*.', pauseAfter: 0.35 },
    { say: "If you said wait, you might miss it. That's fine. Another setup will come.",
      caption: "If you said *WAIT*, you might *miss* it. That's fine. Another *setup* will come.", pauseAfter: 0.35 },
    { say: "Decide where you're wrong before you enter. Not after.",
      caption: "Decide where you're *wrong* before you enter. Not after." },
  ],

  world: [
    { set: 'chartscape', x: CH, opts: {
      big: BIG,
      small: [
        { x: 120, top: 1050, bottom: 1180, up: true }, { x: 270, top: 980, bottom: 1080, up: true },
        { x: 420, top: 1000, bottom: 1060, up: false }, { x: 570, top: 880, bottom: 1010, up: true },
        { x: 720, top: 820, bottom: 920, up: true },
      ] } },
    { set: 'busstop', x: BUS },
    { set: 'room', x: ROOM },
  ],

  // close on the candle top for the question; wider shots keep the candle bottom above the captions
  camera: [
    { at: 0, x: 880, y: 220, zoom: 1.1, push: 0.02 },
    { at: '3', x: 800, y: 1006, zoom: 0.78, move: 0.6 },
    { at: '4:down', x: 880, y: 1010, zoom: 0.8, move: 0.5 },
    { at: '5', x: 780, y: 1006, zoom: 0.78, move: 0.5 },
    { at: '6+0.15', x: BUS + 600, y: 953, zoom: 0.95, move: 0.8 },
    { at: '7+0.15', x: ROOM + 600, y: 970, zoom: 1.0, move: 0.8 },
    { at: '7:not', x: ROOM + 550, y: 1000, zoom: 1.08, move: 0.5 },
  ],
  shake: [{ at: '4:down', amp: 10 }],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: CH + BIG.x, y: BIG.top, face: 1, scale: 0.8 },
      { at: '6+0.15', x: BUS + 330, y: 1300, scale: 0.85, move: 0.8 },
      { at: '7+0.15', x: ROOM + 300, face: 1, move: 0.8 },
    ],
    moods: [
      { at: 0, mood: 'excited' }, { at: '2', mood: 'think' }, { at: '3', mood: 'worried' }, { at: '4:down', mood: 'shocked' },
      { at: '5', mood: 'worried' }, { at: '6', mood: 'neutral' }, { at: '6:miss', mood: 'sad' }, { at: '6:fine', mood: 'happy' },
      { at: '7', mood: 'determined' }, { at: '7:not', mood: 'happy' },
    ],
    looks: [
      { at: 0, look: 'cam' }, { at: '2>', look: 'up' }, { at: '3', look: 'cam' }, { at: '4', look: 'down' }, { at: '5', look: 'cam' },
      { at: '6:miss', look: 'right' }, { at: '6:another', look: 'left' }, { at: '7', look: 'right' }, { at: '7:not', look: 'cam' },
    ],
    actions: [
      { at: 0, do: 'bounce', dur: 1.0 },
      { at: '2:comment', do: 'point', dur: 0.9 },
      { at: '2>+0.2', do: 'tilt', dur: 2.8, deg: 10 },
      { at: '4:down', do: 'shake', dur: 0.6 },
      { at: '4:down', do: 'sweat', dur: 1.6 },
      { at: '6:miss', do: 'wave', dur: 1.0 },
      { at: '6:fine', do: 'shrug', dur: 0.9 },
      { at: '7:wrong', do: 'point', dur: 1.2 },
      { at: '7:not', do: 'jump', h: 110 },
    ],
  }],

  props: [
    // question
    { type: 'title', at: 0.02, until: '2-0.05', text: 'WOULD YOU *ENTER HERE?*', y: 300, size: 104, sfx: 'bell' },
    { type: 'tag', space: 'screen', at: 0.2, until: '3+0.1', x: 600, y: 440, size: 19, text: 'ILLUSTRATIVE CHART' },
    { type: 'custom', space: 'screen', at: '1:yes', until: '3', draw: (t, sc, p) => buttons(t, p._at, 600, null) },
    // thinking gap: comment prompt, ticking 3-2-1, no voice
    { type: 'title', at: '2', until: '3-0.05', text: '*COMMENT* YOUR ANSWER', y: 300, size: 100, icon: 'comment', sfx: 'pop' },
    { type: 'countdown', at: '2>+0.15', from: 3, x: 170, y: 1000, r: 80 },

    // answer YES: where the idea fails
    { type: 'custom', space: 'screen', at: '3', until: '4', draw: (t, sc, p) => buttons(t, p._at, 600, 'YES') },
    { type: 'tag', at: '3+0.3', until: '6+0.2', x: 430, y: 360, size: 22, text: 'ILLUSTRATIVE CHART' },
    { type: 'custom', layer: 'front', at: '4:fails', until: '6+0.2', draw: (t, sc, p) => {
      const q = Math.min(1, (t - p._at) / 0.6);
      const x0 = CH + 560, x1 = CH + 560 + 680 * q, y = BIG.bottom + 10;
      return `<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="#ef5350" stroke-width="10" stroke-dasharray="30 18"/>
        <g opacity="${q}"><text data-qa="world" data-g="fail" x="${CH + 1240}" y="${y - 40}" text-anchor="end" font-family="Luckiest Guy" font-size="64" fill="#ef5350" stroke="#141414" stroke-width="10" paint-order="stroke">YOUR IDEA FAILS HERE</text></g>`;
    } },
    { type: 'custom', layer: 'front', at: '4:down', until: '6+0.2', draw: (t, sc, p) => {
      // the distance from the entry to the stop
      const q = Math.min(1, (t - p._at) / 0.5);
      const y0 = BIG.top + 30, y1 = y0 + (BIG.bottom - 60 - y0) * q;
      return `<path d="M${CH + 1100} ${y0} L ${CH + 1100} ${y1}" stroke="#ef5350" stroke-width="8" stroke-dasharray="14 10"/>
        <path d="M${CH + 1082} ${y1 - 22} L ${CH + 1100} ${y1} L ${CH + 1118} ${y1 - 22}" fill="none" stroke="#ef5350" stroke-width="8"/>`;
    } },
    { type: 'sticky', at: '5:far', until: '6+0.3', x: 360, y: 620, w: 330, h: 190, rot: -5, size: 60, color: '#ffcdd2', text: 'FAR STOP' },
    { type: 'sticky', at: '5:big', until: '6+0.3', x: 360, y: 830, w: 330, h: 190, rot: 4, size: 60, color: '#ffe680', text: 'BIG LOSS' },
    { type: 'sticky', at: '5:tiny', until: '6+0.3', x: 360, y: 1040, w: 330, h: 190, rot: -3, size: 60, color: '#d7ccff', text: 'OR TINY\nPOSITION' },

    // answer WAIT: one bus leaves, another arrives
    { type: 'custom', space: 'screen', at: '6', until: '6:miss', draw: (t, sc, p) => buttons(t, p._at, 600, 'WAIT') },
    { type: 'custom', layer: 'back', at: '6', until: '7+0.3', draw: (t, sc) => {
      const leave = sc.tl.at('6:miss'), arrive = sc.tl.at('6:another');
      let s = '';
      const q1 = Math.max(0, Math.min(1, (t - leave) / 1.0));
      if (q1 < 1) s += bus(BUS + 760 + 1300 * q1 * q1);
      const q2 = Math.max(0, Math.min(1, (t - arrive) / 1.0));
      if (t >= arrive) s += bus(BUS - 700 + 1460 * (1 - (1 - q2) * (1 - q2)));
      return s;
    } },
    { type: 'notify', at: '6:another', until: '7', y: 300, icon: 'bell', tone: 'gold', title: 'Next setup arriving', body: 'Only the ones in your plan' },

    // decide before you enter
    { type: 'sticky', at: '7:wrong', until: '7:not-0.05', x: ROOM + 955, y: 940, w: 250, h: 210, rot: 6, size: 38,
      text: 'Where am I wrong?\nStop?\nSize?' },
    { type: 'title', at: '7:not', text: 'DECIDE *BEFORE* YOU ENTER', y: 300, size: 96, sfx: 'ding' },
    { type: 'confetti', at: '7:not', x: 540, y: 700, n: 90 },
  ],

  sfx: [
    { at: '4:down', name: 'thud', gain: 1.0 },
    { at: '6:miss', name: 'whoosh', gain: 0.8, dur: 0.9 },
    { at: '6:another', name: 'whoosh', gain: 0.6, dur: 0.9 },
  ],
};
