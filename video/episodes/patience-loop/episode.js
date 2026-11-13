// Episode: The setup comes to the patient. (idea card 9, Fikirler 2026-11-13)
// A 10 to 12 second loop with one scene and one sentence, as the card asks: the pier at sunset.
// The fish is released at the end so the last frame flows back into the first. Our own sentence. No product.
const SEC = 2.0; // the restless one recasts every 2 seconds
const CATCH = 6.0, LAND = 7.2, RELEASE = 9.4, BACK = 10.4;

const pier = (t) => {
  let s = `<defs><linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b1d4a"/><stop offset="0.55" stop-color="#d9644a"/><stop offset="1" stop-color="#f5b35c"/></linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a4f78"/><stop offset="1" stop-color="#0d1b30"/></linearGradient></defs>
    <rect x="-400" y="-900" width="2000" height="2250" fill="url(#sun)"/>
    <circle cx="600" cy="1200" r="230" fill="#ffd27a" opacity="0.9"/>
    <rect x="-400" y="1250" width="2000" height="1500" fill="url(#sea)"/>`;
  for (let k = 0; k < 9; k++) {
    const y = 1290 + k * 70, w = 160 + k * 40, x = 600 + Math.sin(t * 1.5 + k) * 30;
    s += `<rect x="${(x - w / 2).toFixed(1)}" y="${y}" width="${w}" height="8" rx="4" fill="#ffd27a" opacity="${(0.5 - k * 0.04).toFixed(2)}"/>`;
  }
  s += `<rect x="150" y="1300" width="900" height="40" fill="#6b4226" stroke="#3a2214" stroke-width="6"/>
    ${[200, 450, 750, 1000].map((x) => `<rect x="${x - 16}" y="1340" width="32" height="420" fill="#4a2e1b"/>`).join('')}`;
  return s;
};

const rods = (t) => {
  let s = '';
  // restless: recast every SEC seconds
  const ph = (t % SEC) / SEC;
  const lift = ph < 0.25 ? ph / 0.25 : ph < 0.4 ? 1 - (ph - 0.25) / 0.15 : 0;
  const tipL = [70 + 60 * lift, 860 - 120 * lift];
  const fly = ph >= 0.25 && ph < 0.45 ? (ph - 0.25) / 0.2 : ph >= 0.45 ? 1 : 0;
  const bobL = ph < 0.25 ? [40 + 30 * lift, 1440 - 500 * lift] : [tipL[0] + (30 - tipL[0]) * fly, tipL[1] + (1450 - tipL[1]) * fly + Math.sin(t * 6) * 4];
  s += `<line x1="265" y1="1120" x2="${tipL[0].toFixed(1)}" y2="${tipL[1].toFixed(1)}" stroke="#3a2214" stroke-width="10" stroke-linecap="round"/>
    <path d="M${tipL[0].toFixed(1)} ${tipL[1].toFixed(1)} Q ${((tipL[0] + bobL[0]) / 2 - 30).toFixed(1)} ${((tipL[1] + bobL[1]) / 2).toFixed(1)} ${bobL[0].toFixed(1)} ${bobL[1].toFixed(1)}" stroke="#eee" stroke-width="3" fill="none"/>
    <circle cx="${bobL[0].toFixed(1)}" cy="${bobL[1].toFixed(1)}" r="12" fill="#ef5350" stroke="#fff" stroke-width="4"/>`;
  if (ph > 0.45 && ph < 0.7) { const r = (ph - 0.45) * 300; s += `<ellipse cx="30" cy="1458" rx="${r.toFixed(1)}" ry="${(r * 0.25).toFixed(1)}" fill="none" stroke="#fff" stroke-width="4" opacity="${(1 - (ph - 0.45) / 0.25).toFixed(2)}"/>`; }

  // patient: still, then the catch, then the release
  const pull = t < CATCH ? 0 : t < LAND ? (t - CATCH) / (LAND - CATCH) : t < RELEASE ? 1 : t < BACK ? 1 - (t - RELEASE) / (BACK - RELEASE) : 0;
  const bend = Math.sin(Math.min(1, pull) * Math.PI / 2);
  const tipR = [1130 - 40 * bend, 860 + 60 * bend];
  const dip = t > CATCH - 0.5 && t < CATCH ? Math.sin((t - (CATCH - 0.5)) * 20) * 12 : 0;
  const fishY = 1460 - (1460 - 1000) * bend, fishX = 1170 - 30 * bend;
  s += `<line x1="935" y1="1120" x2="${tipR[0].toFixed(1)}" y2="${tipR[1].toFixed(1)}" stroke="#3a2214" stroke-width="10" stroke-linecap="round"/>
    <line x1="${tipR[0].toFixed(1)}" y1="${tipR[1].toFixed(1)}" x2="${fishX.toFixed(1)}" y2="${(pull > 0 ? fishY - 60 : 1450 + dip).toFixed(1)}" stroke="#eee" stroke-width="3"/>`;
  if (pull <= 0) s += `<circle cx="1170" cy="${(1450 + dip + Math.sin(t * 2) * 3).toFixed(1)}" r="12" fill="#ef5350" stroke="#fff" stroke-width="4"/>`;
  else s += `<g transform="translate(${fishX.toFixed(1)} ${fishY.toFixed(1)}) rotate(${(-80 + 10 * Math.sin(t * 10)).toFixed(1)}) scale(1.6)">
      <ellipse rx="110" ry="46" fill="#E4C471" stroke="#7a5c1c" stroke-width="7"/><path d="M100 0 L 160 -40 L 160 40 Z" fill="#E4C471" stroke="#7a5c1c" stroke-width="7"/>
      <circle cx="-60" cy="-10" r="10" fill="#141414"/></g>`;
  if (t > CATCH && t < CATCH + 0.6) { const r = (t - CATCH) * 260; s += `<ellipse cx="1170" cy="1458" rx="${r.toFixed(1)}" ry="${(r * 0.25).toFixed(1)}" fill="none" stroke="#fff" stroke-width="5" opacity="${(1 - (t - CATCH) / 0.6).toFixed(2)}"/>`; }
  if (t > BACK - 0.2 && t < BACK + 0.5) { const r = (t - BACK + 0.2) * 260; s += `<ellipse cx="1170" cy="1458" rx="${r.toFixed(1)}" ry="${(r * 0.25).toFixed(1)}" fill="none" stroke="#fff" stroke-width="5" opacity="${Math.max(0, 1 - (t - BACK + 0.2) / 0.7).toFixed(2)}"/>`; }
  return s;
};

export default {
  id: 'patience-loop',
  voice: { name: 'am_fenrir', speed: 1.15, lead: 6.6, gap: 0.22 },
  tail: 2.6,
  narrator: 'calm',

  lines: [
    { say: 'The setup comes to the patient.',
      caption: 'The *setup* comes to the *patient*.' },
  ],

  world: [],

  camera: [{ at: 0, x: 600, y: 912, zoom: 0.85, push: 0 }],

  actors: [
    { kind: 'bull', id: 'rush', tie: '#c62828',
      path: [{ at: 0, x: 330, y: 1300, face: -1, scale: 0.78 }],
      moods: [{ at: 0, mood: 'angry' }, { at: CATCH + 0.3, mood: 'shocked' }, { at: RELEASE, mood: 'angry' }],
      looks: [{ at: 0, look: 'left' }, { at: CATCH + 0.3, look: 'right' }, { at: RELEASE, look: 'left' }],
      actions: Array.from({ length: 6 }, (_, k) => ({ at: k * SEC + 0.05, do: 'grab', dur: 0.5 })).concat([{ at: 0.9, do: 'sweat', dur: 4.0 }]),
    },
    { kind: 'bull', id: 'calm', tie: '#1f8f84',
      path: [{ at: 0, x: 870, y: 1300, face: 1, scale: 0.78 }],
      moods: [{ at: 0, mood: 'neutral' }, { at: CATCH, mood: 'excited' }, { at: LAND, mood: 'happy' }, { at: BACK, mood: 'neutral' }],
      looks: [{ at: 0, look: 'right' }, { at: LAND, look: 'cam' }, { at: RELEASE, look: 'right' }],
      actions: [{ at: CATCH + 0.1, do: 'grab', dur: 1.0 }, { at: LAND, do: 'cheer', dur: 1.2 }],
    },
  ],

  props: [
    { type: 'custom', layer: 'back', at: 0, draw: (t) => pier(t) },
    { type: 'custom', layer: 'front', at: 0, draw: (t) => rods(t) },
    { type: 'title', at: 0.02, until: 3.6, text: 'WHO CATCHES\n*THE BIG ONE?*', y: 330, sfx: false },
    { type: 'title', at: 6.6, until: 9.9, text: 'THE SETUP COMES\nTO THE *PATIENT*', y: 330, sfx: false },
    { type: 'title', at: 9.9, until: 11.4, text: '*SAVE THIS* FOR\nYOUR NEXT RED DAY', y: 330, size: 90, icon: 'bookmark', sfx: false },
  ],

  sfx: [
    ...Array.from({ length: 6 }, (_, k) => ({ at: k * SEC + 0.5, name: 'whoosh', gain: 0.35, dur: 0.4 })),
    { at: CATCH, name: 'pop', gain: 0.9 }, { at: LAND, name: 'ding', gain: 0.7 },
  ],
};
