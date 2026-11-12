// Episode: Answer these 3 before the chart opens. (idea card 7, Fikirler 2026-11-12)
// No figures. Process lesson: answer stop / size / plan before the session, so the entry is one click.
const ROOM = 0, KIT = 1200, OUT = 2400;

export default {
  id: 'three-questions',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 2.0,
  narrator: 'bull',

  lines: [
    { say: 'Stop. Size. Plan. By the time you check all three, the move is gone.',
      caption: '*Stop*. *Size*. *Plan*. By the time you check all three, the move is *gone*.' },
    { say: 'Skipping the questions is not the fix.',
      caption: '*Skipping* the questions is not the fix.', pauseAfter: 0.35 },
    { say: 'Answer them before the chart opens. Over coffee. Write them down.',
      caption: 'Answer them *before* the chart opens. Over *coffee*. Write them *down*.' },
    { say: 'One: where is my stop?',
      caption: '*One*: where is my *stop*?' },
    { say: 'Two: if it hits, how many dollars do I lose?',
      caption: '*Two*: if it hits, how many *dollars* do I lose?' },
    { say: 'Three: is this setup in my plan? If not, no trade.',
      caption: '*Three*: is this setup in my *plan*? If not, *no trade*.', pauseAfter: 0.5 },
    { say: 'Then the entry is one click, not a panic. The thinking is already done.',
      caption: 'Then the entry is *one click*, not a panic. The *thinking* is already done.', pauseAfter: 0.35 },
    { say: 'Save this and answer them tomorrow morning.',
      caption: '*Save this* and answer them tomorrow morning.' },
  ],

  world: [
    { set: 'room', x: ROOM },
    { set: 'kitchen', x: KIT },
    { set: 'outdoor', x: OUT },
  ],

  camera: [
    { at: 0, x: ROOM + 640, y: 970, zoom: 1.0, push: 0.02 },
    { at: '3+0.15', x: KIT + 520, y: 970, zoom: 1.0, move: 0.7 },
    { at: '4', x: KIT + 500, y: 986, zoom: 1.05, move: 0.5 },
    { at: '7+0.15', x: ROOM + 640, y: 970, zoom: 1.0, move: 0.8 },
    { at: '8+0.15', x: OUT + 600, y: 953, zoom: 0.95, move: 0.8 },
  ],
  shake: [{ at: '1:gone', amp: 10 }],

  actors: [{
    kind: 'bull', id: 'bull',
    path: [
      { at: 0, x: ROOM + 330, y: 1300, face: 1, scale: 0.85 },
      { at: '3+0.15', x: KIT + 380, move: 0.7 },
      { at: '7+0.15', x: ROOM + 330, move: 0.8 },
      { at: '8+0.15', x: OUT + 820, face: -1, scale: 0.92, move: 0.8 },
    ],
    moods: [
      { at: 0, mood: 'worried' }, { at: '1:gone', mood: 'shocked' }, { at: '2', mood: 'determined' }, { at: '3', mood: 'happy' },
      { at: '4', mood: 'think' }, { at: '6:no', mood: 'determined' }, { at: '7', mood: 'smug' }, { at: '8', mood: 'happy' },
    ],
    looks: [
      { at: 0, look: 'right' }, { at: '1:gone', look: 'up' }, { at: '2', look: 'cam' }, { at: '4', look: 'right' },
      { at: '5:dollars', look: 'cam' }, { at: '6', look: 'right' }, { at: '6:no', look: 'cam' }, { at: '7', look: 'right' }, { at: '7:panic', look: 'cam' },
    ],
    actions: [
      { at: 0, do: 'type', dur: 2.2 },
      { at: 0.3, do: 'sweat', dur: 2.6 },
      { at: '1:gone', do: 'jump', h: 80 },
      { at: '2', do: 'shrug', dur: 0.9 },
      { at: '3:coffee', do: 'nod', dur: 0.6 },
      { at: '3:write', do: 'write', dur: 0.9 },
      { at: '4', do: 'write', dur: 1.2 },
      { at: '5', do: 'write', dur: 1.4 },
      { at: '6', do: 'write', dur: 1.2 },
      { at: '6:no', do: 'nod', dur: 0.6 },
      { at: '7:one', do: 'point', dur: 0.8 },
      { at: '8:save', do: 'jump', h: 150 },
      { at: '8:save+0.1', do: 'cheer', dur: 1.2 },
    ],
  }],

  props: [
    // hook: three questions, no time
    { type: 'title', at: 0.02, until: '2-0.05', text: '3 QUESTIONS.\n*NO TIME?*', y: 325, sfx: 'bell' },
    { type: 'sticky', at: '1:stop', until: '3+0.2', x: ROOM + 560, y: 600, w: 180, h: 150, rot: -6, size: 54, text: 'STOP?' },
    { type: 'sticky', at: '1:size', until: '3+0.2', x: ROOM + 760, y: 620, w: 180, h: 150, rot: 4, size: 54, color: '#c8f1ea', text: 'SIZE?' },
    { type: 'sticky', at: '1:plan', until: '3+0.2', x: ROOM + 960, y: 600, w: 180, h: 150, rot: -3, size: 54, color: '#ffcdd2', text: 'PLAN?' },
    { type: 'custom', layer: 'front', at: '1:by', until: '2+0.4', draw: (t, sc, p) => {
      // the move leaves without you: a green candle rockets off the monitor
      const q = Math.min(1, (t - p._at) / 1.4), y = 820 - 1500 * q * q;
      return `<g transform="translate(${ROOM + 830} ${y.toFixed(1)})"><line x1="0" x2="0" y1="-120" y2="140" stroke="#26a69a" stroke-width="12"/>
        <rect x="-38" y="-90" width="76" height="200" rx="10" fill="#26a69a"/>
        ${[0, 1, 2].map((i) => `<circle cx="${(i - 1) * 18}" cy="${150 + i * 26}" r="${14 - i * 3}" fill="#E4C471" opacity="${(0.8 - i * 0.2).toFixed(1)}"/>`).join('')}</g>`;
    } },
    { type: 'title', at: '2', until: '3-0.05', text: 'SKIPPING THEM\nIS *NOT* THE FIX', y: 325, keyColor: '#ef5350' },

    // rewind to the morning
    { type: 'custom', space: 'screen', at: '3', until: '3+0.75', draw: (t, sc, p) => {
      const q = (t - p._at) / 0.75, o = Math.sin(Math.PI * Math.min(1, q));
      let s = `<g opacity="${(o * 0.85).toFixed(2)}"><rect width="1080" height="1920" fill="#0b0f19" opacity="0.35"/>`;
      for (let i = 0; i < 14; i++) s += `<rect x="0" y="${((i * 140 + t * 2400) % 1920).toFixed(0)}" width="1080" height="10" fill="#fff" opacity="0.18"/>`;
      s += `<g transform="translate(540 700)"><path d="M-20 -60 L -100 0 L -20 60 Z M 80 -60 L 0 0 L 80 60 Z" fill="#F6E6B0"/></g>
        <text data-qa="screen" data-g="rew" x="540" y="860" text-anchor="middle" font-family="Luckiest Guy" font-size="90" fill="#F6E6B0" stroke="#141414" stroke-width="12" paint-order="stroke">7:30 AM</text></g>`;
      return s;
    } },

    // the three answers, written before the open
    { type: 'custom', layer: 'back', at: '3+0.5', until: '7+0.3', draw: (t, sc, p) => {
      const q = Math.min(1, (t - p._at) / 0.3);
      return `<rect x="${KIT + 30}" y="330" width="680" height="380" rx="26" fill="#141a26" stroke="#E4C471" stroke-width="6" opacity="${q.toFixed(2)}"/>`;
    } },
    { type: 'rules', at: '3+0.6', until: '7+0.3', x: KIT + 30, y: 410, w: 680, title: 'BEFORE THE *OPEN*', titleSize: 56, gap: 92, size: 44,
      items: [
        { at: '4:where', text: 'Where is my *stop*?' },
        { at: '5:if', text: 'How many *$* if it hits?' },
        { at: '6:is', text: 'Is it in my *plan*?' },
      ] },

    // back at the desk: one calm click
    { type: 'notify', at: '7:one', until: '8', y: 300, icon: 'check', tone: 'green', title: 'Order placed', body: 'Stop and size set before the open' },

    // CTA with the checklist on the billboard
    { type: 'rules', at: '8', x: OUT + 140, y: 370, w: 920, title: '', gap: 95, size: 50,
      items: [
        { at: '8', text: 'Where is my *stop*?' },
        { at: '8+0.15', text: 'How many *$* if it hits?' },
        { at: '8+0.3', text: 'Is it in my *plan*?' },
      ] },
    { type: 'title', at: '8:save', text: '*SAVE THIS*', y: 300, size: 140, icon: 'bookmark', sfx: 'ding' },
    { type: 'confetti', at: '8:save', x: 540, y: 760, n: 120 },
  ],

  sfx: [
    { at: '1:stop', name: 'tick', gain: 1.0 }, { at: '1:size', name: 'tick', gain: 1.0 }, { at: '1:plan', name: 'tick', gain: 1.0 },
    { at: '1:gone', name: 'whoosh', gain: 0.9, dur: 0.8 },
    { at: '3', name: 'whoosh', gain: 0.8, dur: 0.7 },
    { at: '7:one', name: 'ding', gain: 0.5 },
    { at: '8:save', name: 'bell', gain: 0.5 },
  ],
};
