// Episode: Would you enter here? (idea card 4, Fikirler 2026-11-12)
// No figures. The chart is illustrative and points at no real asset. No buy or sell call:
// the lesson is process (decide where you are wrong before the candle).
const CH = 0, BUS = 1800, ROOM = 3000;
const BIG = { x: 900, top: 520, bottom: 1250 };

const bus = (x) => `<g>
  <rect x="${x - 330}" y="985" width="660" height="290" rx="34" fill="#26a69a" stroke="#14544e" stroke-width="8"/>
  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${x - 300 + i * 116}" y="1020" width="96" height="92" rx="12" fill="#bfe8ff" opacity="0.85"/>`).join('')}
  <rect x="${x + 250}" y="1130" width="60" height="120" rx="8" fill="#14544e"/>
  <rect x="${x - 330}" y="1160" width="660" height="18" fill="#E4C471"/>
  <circle cx="${x - 200}" cy="1275" r="42" fill="#1b1f27" stroke="#555" stroke-width="10"/><circle cx="${x + 200}" cy="1275" r="42" fill="#1b1f27" stroke="#555" stroke-width="10"/>
  <circle cx="${x + 318}" cy="1210" r="14" fill="#fff7d6"/></g>`;

export default {
  id: 'enter-here',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.8,
  narrator: 'bull',

  lines: [
    { say: 'Would you enter here? Comment yes or wait before the reveal.',
      caption: 'Would you *enter here*? Comment *YES* or *WAIT* before the reveal.' },
    { say: "Big green candle. Everyone's watching. It feels safe.",
      caption: "Big *green candle*. Everyone's watching. It feels *safe*." },
    { say: 'But where does your idea fail? Way down at the bottom of that candle.',
      caption: 'But where does your idea *fail*? Way down at the *bottom* of that candle.' },
    { say: 'Chasing means a far stop, a tiny position, or no plan at all.',
      caption: 'Chasing means a *far stop*, a *tiny position*, or *no plan* at all.', pauseAfter: 0.35 },
    { say: "Waiting means you might miss it. That's fine. Another setup will come.",
      caption: "Waiting means you might *miss* it. That's fine. Another *setup* will come.", pauseAfter: 0.35 },
    { say: "Decide where you're wrong before the candle. Not after.",
      caption: "Decide where you're *wrong* before the candle. Not after." },
    { say: 'So, yes or wait? Comment it, then watch again.',
      caption: 'So, *YES* or *WAIT*? Comment it, then watch again.' },
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

  // cam.y = feet - 330 / zoom on the candle top; wider shots keep the candle bottom above the captions
  camera: [
    { at: 0, x: 880, y: 220, zoom: 1.1, push: 0.02 },
    { at: '2', x: 800, y: 1006, zoom: 0.78, move: 0.6 },
    { at: '3:bottom', x: 880, y: 1010, zoom: 0.8, move: 0.5 },
    { at: '4', x: 780, y: 1006, zoom: 0.78, move: 0.5 },
    { at: '5+0.15', x: BUS + 600, y: 953, zoom: 0.95, move: 0.8 },
    { at: '6+0.15', x: ROOM + 600, y: 970, zoom: 1.0, move: 0.8 },
    { at: '7', x: ROOM + 550, y: 1000, zoom: 1.08, move: 0.5 },
  ],
  shake: [{ at: '3:bottom', amp: 10 }],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: CH + BIG.x, y: BIG.top, face: 1, scale: 0.8 },
      { at: '5+0.15', x: BUS + 330, y: 1300, scale: 0.85, move: 0.8 },
      { at: '6+0.15', x: ROOM + 300, face: 1, move: 0.8 },
    ],
    moods: [
      { at: 0, mood: 'excited' }, { at: '1:comment', mood: 'happy' }, { at: '2:feels', mood: 'smug' }, { at: '3:fail', mood: 'worried' },
      { at: '3:bottom', mood: 'shocked' }, { at: '4', mood: 'worried' }, { at: '5', mood: 'neutral' }, { at: '5:miss', mood: 'sad' },
      { at: '5:fine', mood: 'happy' }, { at: '6', mood: 'determined' }, { at: '7', mood: 'happy' },
    ],
    looks: [
      { at: 0, look: 'cam' }, { at: '2:everyone', look: 'left' }, { at: '2:feels', look: 'cam' }, { at: '3:bottom', look: 'down' },
      { at: '4', look: 'cam' }, { at: '5:miss', look: 'right' }, { at: '5:another', look: 'left' }, { at: '6', look: 'right' }, { at: '7', look: 'cam' },
    ],
    actions: [
      { at: 0, do: 'bounce', dur: 1.0 },
      { at: '1:comment', do: 'point', dur: 0.9 },
      { at: '2:safe', do: 'nod', dur: 0.6 },
      { at: '3:bottom', do: 'shake', dur: 0.6 },
      { at: '3:bottom', do: 'sweat', dur: 1.6 },
      { at: '5:miss', do: 'wave', dur: 1.0 },
      { at: '5:fine', do: 'shrug', dur: 0.9 },
      { at: '6:wrong', do: 'point', dur: 1.2 },
      { at: '7', do: 'jump', h: 110 },
      { at: '7:comment', do: 'wave', dur: 2.0 },
    ],
  }],

  props: [
    // hook: on top of the candle, five-second countdown
    { type: 'title', at: 0.02, until: '2-0.05', text: 'WOULD YOU *ENTER HERE?*', y: 300, size: 104, sfx: 'bell' },
    { type: 'countdown', at: 0.3, from: 5, x: 170, y: 560, r: 70 },
    { type: 'tag', space: 'screen', at: 0.2, until: '2+0.1', x: 600, y: 468, size: 19, text: 'ILLUSTRATIVE CHART' },
    { type: 'tag', at: '2+0.3', until: '5+0.2', x: 430, y: 360, size: 22, text: 'ILLUSTRATIVE CHART' },

    // the reveal: where the idea fails
    { type: 'custom', layer: 'front', at: '3:fail', until: '5+0.2', draw: (t, sc, p) => {
      const q = Math.min(1, (t - p._at) / 0.6);
      const x0 = CH + 560, x1 = CH + 560 + 680 * q, y = BIG.bottom + 10;
      return `<line x1="${x0}" x2="${x1}" y1="${y}" y2="${y}" stroke="#ef5350" stroke-width="10" stroke-dasharray="30 18"/>
        <g opacity="${q}"><text data-qa="world" data-g="fail" x="${CH + 1240}" y="${y - 40}" text-anchor="end" font-family="Luckiest Guy" font-size="64" fill="#ef5350" stroke="#141414" stroke-width="10" paint-order="stroke">YOUR IDEA FAILS HERE</text></g>
        <path d="M${CH + 1100} ${BIG.top + 40} L ${CH + 1100} ${BIG.top + 40 + (y - BIG.top - 100) * q}" stroke="#ef5350" stroke-width="8" stroke-dasharray="14 10"/>`;
    } },
    { type: 'sticky', at: '4:far', until: '5+0.3', x: 360, y: 620, w: 330, h: 190, rot: -5, size: 60, color: '#ffcdd2', text: 'FAR STOP' },
    { type: 'sticky', at: '4:tiny', until: '5+0.3', x: 360, y: 830, w: 330, h: 190, rot: 4, size: 60, color: '#ffe680', text: 'TINY\nPOSITION' },
    { type: 'sticky', at: '4:no', until: '5+0.3', x: 360, y: 1040, w: 330, h: 190, rot: -3, size: 60, color: '#d7ccff', text: 'NO PLAN' },

    // bus stop: one bus leaves, another arrives
    { type: 'custom', layer: 'back', at: '5', until: '6+0.3', draw: (t, sc) => {
      const leave = sc.tl.at('5:miss'), arrive = sc.tl.at('5:another');
      let s = '';
      const q1 = Math.max(0, Math.min(1, (t - leave) / 1.0));
      if (q1 < 1) s += bus(BUS + 760 + 1300 * q1 * q1);
      const q2 = Math.max(0, Math.min(1, (t - arrive) / 1.0));
      if (t >= arrive) s += bus(BUS - 700 + 1460 * (1 - (1 - q2) * (1 - q2)));
      return s;
    } },
    { type: 'notify', at: '5:another', until: '6', y: 300, icon: 'bell', tone: 'gold', title: 'Next setup arriving', body: 'Only the ones in your plan' },

    // desk: decide before the candle
    { type: 'sticky', at: '6:wrong', until: '7-0.05', x: ROOM + 955, y: 940, w: 250, h: 210, rot: 6, size: 38,
      text: 'Where am I wrong?\nStop?\nSize?' },

    // CTA: YES or WAIT buttons
    { type: 'custom', space: 'screen', at: '7', draw: (t, sc, p) => {
      const btn = (x, label, c, d) => {
        const q = Math.max(0, Math.min(1, (t - p._at - d) / 0.3));
        if (q <= 0) return '';
        const s = (q < 1 ? 0.5 + 0.6 * q : 1.1 - 0.1 * Math.min(1, (t - p._at - d - 0.3) / 0.2)) * (1 + 0.03 * Math.sin((t - p._at) * 6 + d * 9));
        return `<g transform="translate(${x} 580) scale(${s.toFixed(3)})"><rect x="-170" y="-80" width="340" height="160" rx="40" fill="${c}" stroke="#141414" stroke-width="10" filter="url(#shadow)"/>
          <text data-qa="screen" data-g="cta-${label}" x="0" y="34" text-anchor="middle" font-family="Luckiest Guy" font-size="96" fill="#fff" stroke="#141414" stroke-width="10" paint-order="stroke">${label}</text></g>`;
      };
      return btn(300, 'YES', '#26a69a', 0) + btn(780, 'WAIT', '#d4a63a', 0.15);
    } },
    { type: 'title', at: '7:comment', text: '*COMMENT* YOUR ANSWER', y: 300, size: 104, icon: 'comment', sfx: 'ding' },
    { type: 'confetti', at: '7:comment', x: 540, y: 700, n: 100 },
  ],

  sfx: [
    { at: '3:bottom', name: 'thud', gain: 1.0 },
    { at: '5:miss', name: 'whoosh', gain: 0.8, dur: 0.9 },
    { at: '5:another', name: 'whoosh', gain: 0.6, dur: 0.9 },
    { at: '7', name: 'pop', gain: 0.8 },
  ],
};
