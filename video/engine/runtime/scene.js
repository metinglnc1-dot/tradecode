// Scene: turns an episode description + voice timings into one SVG frame for any time t.
import { W, H, PAL, FONT, clamp, lerp, E, noise, Timeline, prepKeys, evalKeys, textW, fit, esc, f1 } from './core.js';
import { drawWorld } from './sets.js';
import { CHARS } from './chars.js';
import { PROPS } from './props.js';

const CAP = { y: 1238, size: 94, maxW: 940 };

export class Scene {
  constructor(ep, timings) {
    this.ep = ep;
    this.tl = new Timeline(timings, ep);
    this.D = this.tl.duration;
    this.narrator = ep.narrator || 'bull';
    this.cam = prepKeys(ep.camera, this.tl, 0.9);
    this.shakes = (ep.shake || []).map((s) => ({ ...s, _t: this.tl.at(s.at) }));
    this.actors = (ep.actors || []).map((a) => new CHARS[a.kind || a.id](a, this));
    this.props = (ep.props || []).map((p, i) => {
      const def = PROPS[p.type];
      if (!def) throw new Error('Unknown prop type ' + p.type);
      return { id: p.id || `p${i}`, space: def.space, layer: def.layer, ...p, _def: def, _at: this.tl.at(p.at ?? 0), _until: p.until != null ? this.tl.at(p.until) : null };
    });
    this.byId = Object.fromEntries(this.props.map((p) => [p.id, p]));
    for (const p of this.props) p._def.layout?.(p, this);
    this.chunks = this.buildChunks();
  }

  prop(id) { const p = this.byId[id]; if (!p) throw new Error('No prop ' + id); return p; }
  actor(id) { return this.actors.find((a) => a.id === id); }
  point(spec, t) {
    if (Array.isArray(spec)) return spec;
    const [id, name] = spec.split('.');
    return this.actor(id).anchor(name, t);
  }

  // ---------- camera ----------
  camera(t) {
    const c = evalKeys(this.cam, t, ['x', 'y', 'zoom', 'rot'], (v, dt, k) => ({ ...v, zoom: v.zoom * (1 + Math.min(dt, 8) * (k.push ?? 0.012)) }));
    // drift is constant on screen: world amount shrinks as the camera zooms in
    let x = c.x + (7 * noise(t * 0.35, 'cx')) / c.zoom, y = c.y + (6 * noise(t * 0.3, 'cy')) / c.zoom;
    let zoom = c.zoom * (1 + 0.007 * noise(t * 0.25, 'cz'));
    let rot = (c.rot || 0) + 0.35 * noise(t * 0.2, 'cr');
    for (const s of this.shakes) {
      const q = (t - s._t) / (s.dur || 0.35);
      if (q >= 0 && q <= 1) { const a = (s.amp || 14) * (1 - q); x += Math.sin(t * 70) * a; y += Math.cos(t * 55) * a; }
    }
    return { x, y, zoom, rot, moving: c._moving };
  }

  // ---------- captions ----------
  buildChunks() {
    const chunks = [];
    const lines = this.tl.lines;
    lines.forEach((L, li) => {
      let cur = [];
      const flush = () => { if (cur.length) chunks.push({ li, words: cur }); cur = []; };
      for (const w of L.words) {
        const len = cur.reduce((n, x) => n + x.text.length + 1, 0) + w.text.length;
        if (cur.length && (cur.length >= 2 || len > 13)) flush();
        cur.push(w);
        if (w.brk) flush();
      }
      flush();
    });
    for (const c of chunks) c.start = c.words[0].start - 0.03;
    chunks.forEach((c, i) => {
      const next = chunks[i + 1];
      const L = lines[c.li];
      const lineEnd = L.end + 0.25;
      c.end = next ? (next.li === c.li ? next.start : Math.min(Math.max(lineEnd, c.words[c.words.length - 1].end + 0.15), next.start)) : this.D - 0.05;
      c.text = c.words.map((w) => w.text).join(' ');
    });
    return chunks;
  }
  captions(t) {
    const c = this.chunks.find((k) => t >= k.start && t < k.end);
    if (!c || this.ep.captions === false) return '';
    const up = (s) => s.toUpperCase();
    let size = fit(up(c.text), CAP.size, FONT.ui, 900, CAP.maxW);
    const q = clamp((t - c.start) / 0.16);
    const s = 0.72 + 0.28 * E.back(q);
    const dy = (1 - E.out(q)) * 22;
    const parts = c.words.map((w) => `<tspan fill="${w.key ? PAL.yellow : '#fff'}">${esc(up(w.text))}</tspan>`).join(' ');
    return `<g${q < 1 ? ' data-anim="1"' : ''} transform="translate(${W / 2} ${f1(CAP.y + dy)}) scale(${f1(s * 1000) / 1000})">
      <text data-qa="caption" data-g="cap" x="0" y="${f1(size * 0.36)}" text-anchor="middle" font-family="${FONT.ui}" font-weight="900" font-size="${f1(size)}" stroke="#0b0b0b" stroke-width="${f1(size * 0.2)}" paint-order="stroke" stroke-linejoin="round" filter="url(#shadow)">${parts}</text></g>`;
  }

  defs() {
    return `<defs>
      <radialGradient id="gBull" cx="0.38" cy="0.3" r="0.8"><stop offset="0" stop-color="#f6dc8e"/><stop offset="0.6" stop-color="${PAL.gold}"/><stop offset="1" stop-color="#c9a24a"/></radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#000" flood-opacity="0.45"/></filter>
      <filter id="blur8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>
      <radialGradient id="vign" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></radialGradient>
    </defs>`;
  }

  svg(t) {
    const cam = this.camera(t);
    const layer = (space, l) => this.props.filter((p) => p.space === space && (space === 'screen' || (p.layer || 'front') === l)).map((p) => p._def.draw(p, t, this)).join('');
    const world = `<g transform="translate(${W / 2} ${H / 2}) rotate(${f1(cam.rot * 100) / 100}) scale(${f1(cam.zoom * 10000) / 10000}) translate(${f1(-cam.x)} ${f1(-cam.y)})">
      ${drawWorld(this.ep.world, t)}
      ${layer('world', 'back')}
      ${this.actors.map((a) => a.draw(t)).join('')}
      ${layer('world', 'front')}
    </g>`;
    const prog = clamp(t / this.D);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${this.defs()}
      <rect width="${W}" height="${H}" fill="#07090f"/>
      ${world}
      <rect width="${W}" height="${H}" fill="url(#vign)"/>
      ${layer('screen')}
      ${this.captions(t)}
      ${this.ep.progress === false ? '' : `<rect x="0" y="1908" width="${W}" height="12" fill="#fff" opacity="0.14"/>
      <rect x="0" y="1908" width="${f1(W * prog)}" height="12" fill="${PAL.gold}"/>`}
    </svg>`;
  }

  // Everything the audio and QA stages need to know.
  plan() {
    const sfx = [];
    for (const p of this.props) if (p._def.sfx) sfx.push(...p._def.sfx(p, this.tl));
    // camera whooshes
    for (let i = 1; i < this.cam.length; i++) {
      const k = this.cam[i], a = this.camera(k._t - k._m), b = k;
      const dist = Math.hypot((b.x ?? a.x) - a.x, (b.y ?? a.y) - a.y), dz = Math.abs((b.zoom ?? a.zoom) - a.zoom);
      if (k.whoosh !== false && (dist > 350 || dz > 0.3) && k._m >= 0.35) sfx.push({ t: k._t - k._m, name: 'whoosh', dur: k._m + 0.15, gain: 0.9 });
    }
    for (const a of this.actors) {
      for (const ac of a.actions) {
        if (ac.sfx === false) continue;
        if (ac.sfx) sfx.push({ t: ac._t, name: ac.sfx, gain: 0.9 });
        else if (ac.do === 'jump') sfx.push({ t: ac._t, name: 'boing', gain: 0.7 });
      }
      for (const s of a.shows) if (s.puff && s._t > 0.05) sfx.push({ t: s._t, name: 'boing', gain: 0.8 });
    }
    for (const s of this.ep.sfx || []) sfx.push({ t: this.tl.at(s.at), name: s.name, gain: s.gain ?? 1, dur: s.dur });
    sfx.sort((a, b) => a.t - b.t);
    // camera motion intervals (QA ignores text cut while the camera travels)
    const moving = this.cam.slice(1).map((k) => [k._t - k._m, k._t]);
    return { duration: this.D, sfx: sfx.filter((s) => s.t >= 0 && s.t < this.D), moving, chunks: this.chunks.map((c) => ({ t: +c.start.toFixed(2), text: c.text })) };
  }
}
