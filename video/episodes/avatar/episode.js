// Brand asset: profile picture of the mascot (square, safe for a circular crop).
// Rendered with engine/avatar.mjs, not with build.mjs (no voice).
const BG = {
  navy: ['#1d2742', '#0b0f19', '#E4C471'],
  green: ['#164a45', '#0b1a19', '#E4C471'],
};
const pick = (globalThis.location && new URLSearchParams(location.search).get('bg')) || 'green';
const [c0, c1, ring] = BG[pick] || BG.navy;

export default {
  id: 'avatar',
  captions: false,
  tail: 0,
  lines: [],
  world: [],
  camera: [{ at: 0, x: 0, y: 628, zoom: 1, push: 0 }],
  actors: [{
    kind: 'bull', id: 'bull', steadyLook: true,
    // face 0 = straight to camera (no 3/4 turn)
    path: [{ at: 0, x: 0, y: 1300, face: 0, scale: 1.6 }],
    moods: [{ at: 0, mood: 'confident' }],
    looks: [{ at: 0, look: 'cam' }],
  }],
  props: [
    { type: 'custom', layer: 'back', at: 0, draw: () => `
      <defs><radialGradient id="avbg" cx="0.5" cy="0.42" r="0.7"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></radialGradient></defs>
      <rect x="-1200" y="-800" width="2400" height="3000" fill="url(#avbg)"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${-470 + i * 170}" y="${940 - i * 60}" width="70" height="${180 + i * 60}" rx="12" fill="${ring}" opacity="0.07"/>`).join('')}` },
    { type: 'custom', space: 'screen', at: 0, draw: () =>
      `<circle cx="540" cy="960" r="522" fill="none" stroke="${ring}" stroke-width="18"/>` },
  ],
};
