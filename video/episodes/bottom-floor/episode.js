// Episode: All in on one coin. Keep your eyes on the bottom floor. (idea card 8, Fikirler 2026-11-13)
// Illustrative: both start with $1,000.
//  A: everything in one coin, the coin falls 80%: $200 left, needs +400% to get back to $1,000.
//  B: 1% of what is left per trade, 10 losses in a row: 0.99^10 = 0.904, about $904 left.
// Guess before the reveal (silent 3-2-1). No coin name or logo, no product.
const OUT = 0, BLD = 1400, WB = 2800;
const SA = BLD + 330, SB = BLD + 870; // shaft centres
const smooth = (q) => { q = Math.max(0, Math.min(1, q)); return q * q * (3 - 2 * q); };

// car heights (y of the car floor). Ground floor is 1300.
const carA = (t, sc) => {
  const up0 = sc.tl.at('2:all'), up1 = sc.tl.at('2>') + 0.3, pop = sc.tl.at('5:drops');
  if (t < pop) return 1300 - 1900 * smooth((t - up0) / (up1 - up0)) + Math.sin(t * 2) * 8 * (t > up1);
  const q = Math.min(1, (t - pop) / 0.9);
  return -600 + (1900 + 600) * q * q;
};
const carB = (t, sc) => {
  const a = sc.tl.at('3:risks'), b = sc.tl.at('6:still');
  return 1300 + 120 * smooth((t - a) / (b - a));
};

const building = (t, sc) => {
  let s = `<rect x="${BLD - 700}" y="-2600" width="2600" height="5400" fill="#121a2b"/>
    <rect x="${BLD + 60}" y="-1500" width="1080" height="4200" fill="#1a2440" stroke="#2b3a5e" stroke-width="10"/>`;
  // floors, with the bottom floors below ground
  for (let y = -1300; y <= 2300; y += 200) {
    const below = y > 1300;
    s += `<rect x="${BLD + 60}" y="${y}" width="1080" height="10" fill="${below ? '#3a2a2a' : '#2b3a5e'}"/>`;
  }
  s += `<rect x="${BLD - 700}" y="1300" width="2600" height="14" fill="#56704b"/>
    <text data-g="gf" x="${BLD + 600}" y="1290" text-anchor="middle" font-family="Inter" font-weight="900" font-size="44" fill="#E4C471" opacity="0.8">START  $1,000</text>
    <rect x="${BLD + 60}" y="1314" width="1080" height="1400" fill="#140d10" opacity="0.6"/>
    ${t > sc.tl.at('5:drops') + 0.6 ? '' : '<!--'}<text data-qa="world" data-g="bf" x="${BLD + 600}" y="1700" text-anchor="middle" font-family="Inter" font-weight="900" font-size="48" fill="#ef5350">BOTTOM FLOOR</text>${t > sc.tl.at('5:drops') + 0.6 ? '' : '-->'}`;
  // glass shafts
  [SA, SB].forEach((x) => { s += `<rect x="${x - 150}" y="-1500" width="300" height="3900" fill="#9fd3ff" opacity="0.07" stroke="#9fd3ff" stroke-opacity="0.25" stroke-width="6"/>`; });
  // the cars
  const doors = t >= sc.tl.at('5') ? Math.min(1, (t - sc.tl.at('5')) / 0.5) : 0;
  const car = (x, y, label, col) => `<g transform="translate(${x} ${y.toFixed(1)}) scale(1.4)">
    <rect x="-130" y="-300" width="260" height="300" rx="14" fill="#2b3346" stroke="#E4C471" stroke-width="8"/>
    <rect x="-118" y="-288" width="${(118 - 118 * doors).toFixed(1)}" height="276" fill="#56607a"/><rect x="${(118 * doors).toFixed(1)}" y="-288" width="${(118 - 118 * doors).toFixed(1)}" height="276" fill="#56607a"/>
    <circle cx="0" cy="-150" r="${(80 * doors).toFixed(1)}" fill="${col}" opacity="0.9"/>
    <text data-qa="bg" data-g="car${label}" x="0" y="-110" text-anchor="middle" font-family="Luckiest Guy" font-size="${(120 * Math.max(0.01, doors)).toFixed(1)}" fill="#fff">${label}</text>
    <rect x="-60" y="-360" width="120" height="60" rx="10" fill="${col}" stroke="#141414" stroke-width="5"/>
    <text data-qa="world" data-g="tag${label}" x="0" y="-314" text-anchor="middle" font-family="Luckiest Guy" font-size="48" fill="#fff">${label}</text></g>`;
  const ya = carA(t, sc), yb = carB(t, sc), pop = sc.tl.at('5:drops');
  s += car(SA, ya, 'A', '#ef5350') + car(SB, yb, 'B', '#26a69a');
  // the coin balloon
  if (t < pop + 0.4) {
    const pq = t > pop ? (t - pop) / 0.4 : 0, r = 170 * (1 + pq * 0.6);
    s += pq > 0
      ? `<g opacity="${(1 - pq).toFixed(2)}">${Array.from({ length: 10 }, (_, k) => { const a = (k / 10) * Math.PI * 2; return `<line x1="${(SA + Math.cos(a) * r * 0.6).toFixed(1)}" y1="${(ya - 760 + Math.sin(a) * r * 0.6).toFixed(1)}" x2="${(SA + Math.cos(a) * r * 1.2).toFixed(1)}" y2="${(ya - 760 + Math.sin(a) * r * 1.2).toFixed(1)}" stroke="#E4C471" stroke-width="14" stroke-linecap="round"/>`; }).join('')}</g>`
      : `<line x1="${SA}" y1="${(ya - 360).toFixed(1)}" x2="${SA}" y2="${(ya - 600).toFixed(1)}" stroke="#d9d2c3" stroke-width="6"/>
        <circle cx="${SA}" cy="${(ya - 760).toFixed(1)}" r="${r * 1.3}" fill="#E4C471" stroke="#7a5c1c" stroke-width="12"/>
        <circle cx="${SA}" cy="${(ya - 760).toFixed(1)}" r="${r - 40}" fill="none" stroke="#7a5c1c" stroke-width="8"/>
        <text data-g="coin" x="${SA}" y="${(ya - 720).toFixed(1)}" text-anchor="middle" font-family="Luckiest Guy" font-size="120" fill="#7a5c1c">1</text>`;
  }
  return s;
};

const money = (t, sc, x, label, keys, col) => {
  let v = keys[0][1];
  for (let i = 0; i < keys.length; i++) {
    const k0 = sc.tl.at(keys[i][0]);
    if (t >= k0) {
      v = keys[i][1];
      const nx = keys[i + 1];
      if (nx) { const k1 = sc.tl.at(nx[0]); if (t < k1) v = keys[i][1] + (nx[1] - keys[i][1]) * smooth((t - k0) / Math.min(0.6, k1 - k0)); }
    }
  }
  return `<g transform="translate(${x} 470)"><rect x="-200" y="-70" width="400" height="140" rx="24" fill="#0f1420" fill-opacity="0.94" stroke="${col}" stroke-width="5"/>
    <text data-qa="screen" data-g="m${label}" x="0" y="-26" text-anchor="middle" font-family="Inter" font-weight="800" font-size="26" letter-spacing="3" fill="${col}">${label}</text>
    <text data-qa="screen" data-g="m${label}" x="0" y="46" text-anchor="middle" font-family="Inter" font-weight="900" font-size="66" fill="#fff">$${Math.round(v).toLocaleString('en-US')}</text></g>`;
};

export default {
  id: 'bottom-floor',
  voice: { name: 'am_fenrir', speed: 1.25, lead: 0.4, gap: 0.22 },
  tail: 1.9,
  narrator: 'B',

  lines: [
    { say: 'Two traders. Same thousand dollars. Keep your eyes on the bottom floor.',
      caption: 'Two traders. Same *$1,000*. Keep your eyes on the *bottom floor*.', pauseAfter: 0.3 },
    { say: 'A puts it all on one coin. It flies.',
      caption: '*A* puts it *all* on *one coin*. It *flies*.', pauseAfter: 0.3 },
    { say: 'B risks one percent per trade. Slow and boring.',
      caption: '*B* risks *1%* per trade. *Slow* and *boring*.' },
    { say: 'Guess where each one ends up before the doors open. Comment it.',
      caption: 'Guess where each one ends up before the *doors open*. *Comment it*.', pauseAfter: 3.4 },
    { say: 'The coin drops eighty percent. A has two hundred dollars left.',
      caption: 'The coin *drops 80%*. *A* has *$200* left.', pauseAfter: 0.3 },
    { say: 'B took ten losses in a row and still has about nine hundred and four.',
      caption: '*B* took *10 losses* in a row and *still* has about *$904*.', pauseAfter: 0.3 },
    { say: 'From two hundred, A needs plus four hundred percent just to get back.',
      caption: 'From *$200*, *A* needs *+400%* just to get back.', pauseAfter: 0.3 },
    { say: 'Keep your eyes on the bottom floor.',
      caption: 'Keep your eyes on the *bottom floor*.' },
  ],

  world: [
    { set: 'outdoor', x: OUT },
    { set: 'whiteboard', x: WB },
  ],

  camera: [
    { at: 0, x: OUT + 600, y: 953, zoom: 0.95, push: 0.008 },
    { at: '2', x: BLD + 600, y: 600, zoom: 0.45, move: 0.9 },
    { at: '4', x: BLD + 600, y: 600, zoom: 0.45, move: 0.6 },
    { at: '5:drops', x: BLD + 600, y: 1500, zoom: 0.5, move: 0.9 },
    { at: '7+0.1', x: WB + 610, y: 956, zoom: 0.95, move: 0.8, push: 0.002 },
  ],

  actors: [
    { kind: 'bull', id: 'A', tie: '#c62828',
      path: [{ at: 0, x: OUT + 330, y: 1300, face: 1, scale: 0.85 }, { at: '2', x: BLD + 140, scale: 1.0, move: 0.9 }],
      moods: [{ at: 0, mood: 'excited' }, { at: '2', mood: 'excited' }, { at: '4', mood: 'smug' }, { at: '5:drops', mood: 'shocked' }, { at: '6', mood: 'sad' }],
      looks: [{ at: 0, look: 'cam' }, { at: '2', look: 'up' }, { at: '5:drops', look: 'down' }],
      actions: [{ at: '2:flies', do: 'cheer', dur: 1.2 }, { at: '5:drops', do: 'facepalm', dur: 1.2 }],
    },
    { kind: 'bull', id: 'B', tie: '#1f8f84',
      path: [{ at: 0, x: OUT + 860, y: 1300, face: -1, scale: 0.85 }, { at: '2', x: BLD + 1060, scale: 1.0, move: 0.9 }, { at: '7+0.1', x: WB + 970, scale: 0.82, move: 0.8 }],
      moods: [{ at: 0, mood: 'neutral' }, { at: '3', mood: 'determined' }, { at: '5', mood: 'worried' }, { at: '6', mood: 'confident' }, { at: '8', mood: 'happy' }],
      looks: [{ at: 0, look: 'left' }, { at: '1:keep', look: 'cam' }, { at: '2', look: 'upleft' }, { at: '3', look: 'cam' }, { at: '5', look: 'left' }, { at: '6', look: 'cam' }, { at: '7', look: 'left' }, { at: '8', look: 'cam' }],
      actions: [{ at: '3:slow', do: 'shrug', dur: 0.9 }, { at: '4:comment', do: 'point', dur: 1.0 }, { at: '6:still', do: 'nod', dur: 0.6 }, { at: '7', do: 'write', dur: 3.0 }, { at: '8:bottom', do: 'point', dur: 1.0 }],
    },
  ],

  props: [
    { type: 'title', at: 0.02, until: '2-0.05', text: 'EYES ON THE\n*BOTTOM FLOOR*', y: 330, sfx: 'bell' },
    { type: 'tag', space: 'screen', at: 0.4, until: '7+0.3', x: 540, y: 1163, size: 16, text: 'ILLUSTRATIVE  $1,000 EACH  ONE COIN FALLS 80%' },
    { type: 'custom', layer: 'back', at: '1>', until: '7+0.6', draw: (t, sc) => building(t, sc) },
    { type: 'custom', space: 'screen', at: '2', until: '7+0.1', draw: (t, sc, p) => {
      const o = Math.min(1, (t - p._at) / 0.3) * Math.max(0, Math.min(1, (p._until - t) / 0.2));
      return `<g opacity="${o.toFixed(2)}">${money(t, sc, 290, 'A  ALL IN', [['2', 1000], ['5:drops', 1000], ['5:drops+0.6', 200]], '#ef5350')}
        ${money(t, sc, 790, 'B  1% RISK', [['2', 1000], ['6', 1000], ['6:still', 904]], '#26a69a')}</g>`;
    } },
    { type: 'title', at: '4', until: '5-0.05', text: 'WHERE DO THEY\n*END UP?*', y: 760, icon: 'comment' },
    { type: 'countdown', at: '4>+0.15', from: 3, x: 540, y: 1000, r: 80 },
    { type: 'title', at: '5:drops', until: '6-0.05', text: '*-80%*', y: 290, size: 140, keyColor: '#ef5350' },
    { type: 'title', at: '6', until: '7-0.05', text: '*10 LOSSES*  STILL $904', y: 290, size: 84, keyColor: '#26a69a' },

    // whiteboard
    { id: 'w1', type: 'write', at: '7', dur: 0.7, x: WB + 120, y: 450, size: 60, maxW: 790, keyColor: '#d84341', text: 'A  $200 → $1,000 = *+400%*' },
    { id: 'w2', type: 'write', at: '7:get', dur: 0.7, x: WB + 120, y: 580, size: 60, maxW: 790, keyColor: '#1f8f84', text: 'B  0.99¹⁰ = 0.904, *$904*' },
    { type: 'draw', around: 'w1', sub: '+400%', at: '7:back', shape: 'circle' },
    { type: 'title', at: '8', text: 'EYES ON THE *BOTTOM FLOOR*', y: 300, size: 96, sfx: 'ding' },
  ],

  sfx: [
    { at: '2:flies', name: 'whoosh', gain: 0.7, dur: 1.2 },
    { at: '5:drops', name: 'pop', gain: 1.0 }, { at: '5:drops+0.9', name: 'thud', gain: 1.0 },
    { at: '5', name: 'ding', gain: 0.5 },
  ],
  shake: [{ at: '5:drops+0.9', amp: 16 }],
};
