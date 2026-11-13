// Episode: "My bot turned 68 dollars into 750K": fact or hype? (AI for traders, Part 2/5)
// The phone screen is a made-up example and is labelled FAKE EXAMPLE. No real account, video or person.
// Claude is named in voice and captions only; no logo or interface is drawn. No profit claims.
const ROOM = 0, WB = 1200, CT = 2400;

const phone = (t, at) => {
  const q = Math.max(0, Math.min(1, (t - at - 0.3) / 1.6));
  const e = 1 - Math.pow(1 - q, 4);
  const v = Math.round(68 + (750000 - 68) * e);
  const pop = Math.min(1, (t - at) / 0.3);
  return `<g transform="translate(735 790) scale(${(0.55 + 0.33 * pop).toFixed(3)})" opacity="${pop.toFixed(2)}">
    <rect x="-200" y="-300" width="400" height="600" rx="46" fill="#0d1117" stroke="#3a4157" stroke-width="10"/>
    <rect x="-176" y="-262" width="352" height="520" rx="22" fill="#121a28"/>
    <g transform="translate(0 -170)"><rect x="-56" y="-46" width="112" height="92" rx="22" fill="#5c7cfa"/><circle cx="-22" cy="-6" r="12" fill="#fff"/><circle cx="22" cy="-6" r="12" fill="#fff"/>
      <rect x="-26" y="22" width="52" height="8" rx="4" fill="#fff"/><line x1="0" y1="-46" x2="0" y2="-70" stroke="#5c7cfa" stroke-width="6"/><circle cy="-74" r="8" fill="#ef5350"/></g>
    <text data-qa="screen" data-g="phone" x="0" y="-60" text-anchor="middle" font-family="Inter" font-weight="800" font-size="30" fill="#8d97a8">AI BOT BALANCE</text>
    <text data-qa="screen" data-g="phone" x="0" y="20" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${v > 99999 ? 62 : 72}" fill="#26a69a">$${v.toLocaleString('en-US')}</text>
    <path d="M-120 140 L -40 90 L 20 120 L 120 30" fill="none" stroke="#26a69a" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(0 205) rotate(-8)"><rect x="-150" y="-32" width="300" height="64" rx="10" fill="none" stroke="#ef5350" stroke-width="6"/>
      <text data-qa="screen" data-g="phone" x="0" y="13" text-anchor="middle" font-family="Inter" font-weight="900" font-size="36" fill="#ef5350">FAKE EXAMPLE</text></g>
  </g>`;
};

const verdict = (t, at) => {
  const btn = (x, label, c, d) => {
    const q = Math.max(0, Math.min(1, (t - at - d) / 0.3));
    if (q <= 0) return '';
    const s = (q < 1 ? 0.5 + 0.6 * q : 1.1 - 0.1 * Math.min(1, (t - at - d - 0.3) / 0.2)) * (1 + 0.03 * Math.sin((t - at) * 6 + d * 9));
    return `<g transform="translate(${x} 600) scale(${s.toFixed(3)})"><rect x="-170" y="-80" width="340" height="160" rx="40" fill="${c}" stroke="#141414" stroke-width="10" filter="url(#shadow)"/>
      <text data-qa="screen" data-g="cta-${label}" x="0" y="34" text-anchor="middle" font-family="Luckiest Guy" font-size="96" fill="#fff" stroke="#141414" stroke-width="10" paint-order="stroke">${label}</text></g>`;
  };
  return btn(300, 'FACT', '#26a69a', 0) + btn(780, 'HYPE', '#ef5350', 0.15);
};

export default {
  id: 'ai-fact-or-hype',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'bull',

  lines: [
    { say: 'My bot turned sixty eight dollars into seven hundred fifty thousand. Fact or hype?',
      caption: '"My bot turned *$68* into *$750K*." *Fact* or *hype*?', pauseAfter: 0.3 },
    { say: "Here are three signs it's hype.",
      caption: "Here are *3 signs* it's *hype*." },
    { say: 'One: you only see a balance. No broker statement, no dates.',
      caption: '*One*: you only see a *balance*. No *broker statement*, no dates.' },
    { say: 'Two: not a single losing trade is shown. Real trading has losses.',
      caption: '*Two*: not a single *losing trade* is shown. Real trading has *losses*.' },
    { say: 'Three: it ends with something to buy. Usually the bot.',
      caption: '*Three*: it ends with something to *buy*. Usually the *bot*.', pauseAfter: 0.4 },
    { say: "Real use is boring. Claude can speed up your research and check your plan. It cannot predict the market.",
      caption: "Real use is *boring*. *Claude* can speed up your *research* and check your *plan*. It cannot *predict* the market.", pauseAfter: 0.3 },
    { say: 'So, fact or hype? Comment it.',
      caption: 'So, *FACT* or *HYPE*? *Comment* it.' },
  ],

  world: [
    { set: 'room', x: ROOM },
    { set: 'whiteboard', x: WB },
    { set: 'court', x: CT },
  ],

  camera: [
    { at: 0, x: ROOM + 640, y: 970, zoom: 1.0, push: 0.01 },
    { at: '2+0.15', x: WB + 610, y: 956, zoom: 0.95, move: 0.8, push: 0.003 },
    { at: '6+0.2', x: CT + 600, y: 953, zoom: 0.95, move: 0.8, push: 0.004 },
  ],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: ROOM + 330, y: 1300, face: 1, scale: 0.85 },
      { at: '2+0.15', x: WB + 970, face: -1, scale: 0.82, move: 0.8 },
      { at: '6+0.2', x: CT + 900, scale: 0.88, move: 0.8 },
    ],
    moods: [
      { at: 0, mood: 'shocked' }, { at: '1:fact', mood: 'think' }, { at: '2', mood: 'smug' }, { at: '3', mood: 'think' },
      { at: '5:buy', mood: 'angry' }, { at: '6', mood: 'determined' }, { at: '7', mood: 'happy' },
    ],
    looks: [{ at: 0, look: 'right' }, { at: '1:fact', look: 'cam' }, { at: '3', look: 'left' }, { at: '6', look: 'cam' }],
    actions: [
      { at: 0.4, do: 'shake', dur: 0.5 },
      { at: '1:fact', do: 'tilt', dur: 1.0, deg: 12 },
      { at: '3', do: 'point', dur: 1.0 },
      { at: '4', do: 'point', dur: 1.0 },
      { at: '5', do: 'point', dur: 1.0 },
      { at: '6:claude', do: 'nod', dur: 0.6 },
      { at: '6:predict', do: 'shrug', dur: 1.0 },
      { at: '7:comment', do: 'wave', dur: 1.8 },
    ],
  }],

  props: [
    { type: 'badge', at: 0.05, text: 'AI FOR TRADERS  PART 2/5' },
    { type: 'title', at: 0.02, until: '2-0.05', text: '*FACT* OR *HYPE?*', y: 300, size: 120, keyColor: '#ef5350', sfx: 'bell' },
    { type: 'custom', space: 'screen', at: 0.1, until: '2+0.3', draw: (t, sc, p) => phone(t, p._at) },

    // detective board: three clues
    { type: 'title', at: '2', until: '3-0.05', text: '*3 SIGNS* OF HYPE', y: 300, size: 120 },
    // red strings behind the clue notes
    { type: 'custom', layer: 'back', at: '3:one+0.3', until: '6+0.4', draw: (t, sc) => {
      const tl = sc.tl, k2 = t >= tl.at('4:two'), k3 = t >= tl.at('5:three');
      return `${k2 ? `<line x1="${WB + 250}" y1="520" x2="${WB + 640}" y2="560" stroke="#d84341" stroke-width="5"/>` : ''}
        ${k3 ? `<line x1="${WB + 640}" y1="560" x2="${WB + 440}" y2="850" stroke="#d84341" stroke-width="5"/><line x1="${WB + 440}" y1="850" x2="${WB + 250}" y2="520" stroke="#d84341" stroke-width="5"/>` : ''}`;
    } },
    { type: 'sticky', at: '3:one', until: '6+0.4', x: WB + 250, y: 520, w: 330, h: 220, rot: -4, size: 52, color: '#ffe680', text: '1. Only a\n*balance*' },
    { type: 'sticky', at: '4:two', until: '6+0.4', x: WB + 640, y: 560, w: 330, h: 220, rot: 5, size: 52, color: '#ffcdd2', text: '2. No *losing*\ntrades' },
    { type: 'sticky', at: '5:three', until: '6+0.4', x: WB + 440, y: 850, w: 330, h: 220, rot: -3, size: 52, color: '#c8f1ea', text: '3. Ends with\na *sale*', keyColor: '#1f6f66' },

    // magnifier resting on the newest clue
    { type: 'custom', layer: 'front', at: '3:one+0.3', until: '6+0.4', draw: (t, sc) => {
      const tl = sc.tl, k2 = t >= tl.at('4:two'), k3 = t >= tl.at('5:three');
      const [cx, cy] = k3 ? [WB + 440, 850] : k2 ? [WB + 640, 560] : [WB + 250, 520];
      const mx = cx + 190 + Math.sin(t * 2) * 8, my = cy + 120 + Math.cos(t * 1.7) * 8;
      return `<g transform="translate(${mx.toFixed(1)} ${my.toFixed(1)}) rotate(-30)"><circle r="70" fill="#9fd3ff" opacity="0.18" stroke="#3a3f52" stroke-width="14"/><rect x="-12" y="70" width="24" height="120" rx="10" fill="#6b4226"/></g>`;
    } },

    // court: the verdict on real use
    { type: 'custom', layer: 'back', at: '6+0.3', until: '7+0.3', draw: (t, sc, p) => {
      const q = Math.min(1, (t - p._at) / 0.3);
      return `<rect x="${CT + 60}" y="600" width="650" height="330" rx="24" fill="#141a26" stroke="#E4C471" stroke-width="6" opacity="${q.toFixed(2)}"/>`;
    } },
    { type: 'rules', at: '6+0.4', until: '7+0.3', x: CT + 60, y: 650, w: 650, title: '', gap: 90, size: 44,
      items: [
        { at: '6:research', text: 'Speeds up *research*' },
        { at: '6:plan', text: 'Checks your *plan*' },
        { at: '6:predict', text: 'Predicts the market', icon: 'alert', color: '#ef5350' },
      ] },
    { type: 'tag', at: '6+0.4', until: '7+0.3', x: CT + 385, y: 960, size: 17, text: 'CLAUDE IS MADE BY ANTHROPIC  NOT AFFILIATED' },
    { type: 'custom', space: 'screen', at: '7', draw: (t, sc, p) => verdict(t, p._at) },
    { type: 'title', at: '7:comment', text: '*COMMENT* FACT OR HYPE', y: 300, size: 100, icon: 'comment', sfx: 'ding' },
  ],

  sfx: [
    { at: 0.4, name: 'coin', gain: 0.8 }, { at: 0.8, name: 'coin', gain: 0.6 }, { at: 1.2, name: 'coin', gain: 0.5 },
    { at: '7', name: 'thud', gain: 0.9 },
  ],
};
