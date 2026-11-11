#!/usr/bin/env node
// Build one episode: voice -> plan -> sfx mix -> frames -> MP4 -> contact sheet + QA report.
// Usage: node engine/build.mjs <episode-id> [--stills 1.2,5,9] [--workers 4] [--keep-frames] [--no-video]
import { createRequire } from 'node:module';
import { spawnSync, spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PY = path.join(ROOT, '.venv/bin/python');

const args = process.argv.slice(2);
const id = args[0];
if (!id) { console.error('usage: node engine/build.mjs <episode-id>'); process.exit(1); }
const opt = (name, def) => { const i = args.indexOf('--' + name); return i < 0 ? def : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const OUT = path.join(ROOT, 'out', id);
fs.mkdirSync(OUT, { recursive: true });
const FPS = 30;
const SAFE = { top: 170, bottom: 1330, left: 24, right: 1056 };

function run(cmd, a) {
  const r = spawnSync(cmd, a, { stdio: 'inherit', cwd: ROOT });
  if (r.status !== 0) throw new Error(`${cmd} ${a.join(' ')} failed`);
}

// ---------- 1. voice ----------
const ep = (await import(pathToFileURL(path.join(ROOT, 'episodes', id, 'episode.js')).href)).default;
fs.writeFileSync(path.join(OUT, 'lines.json'), JSON.stringify({ voice: ep.voice, lines: ep.lines.map((l) => ({ say: l.say, caption: l.caption, pauseAfter: l.pauseAfter, voice: l.voice, speed: l.speed })) }, null, 1));
run(PY, ['engine/voice.py', path.join(OUT, 'lines.json'), OUT]);

// ---------- static server ----------
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.ttf': 'font/ttf', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const URL0 = `http://127.0.0.1:${server.address().port}/engine/runtime/index.html?ep=${id}`;

const browser = await chromium.launch();
async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(URL0);
  await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 30000 });
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(err);
  return page;
}

try {
  const page = await openPage();
  // ---------- 2. plan + audio ----------
  const plan = await page.evaluate(() => window.__plan());
  fs.writeFileSync(path.join(OUT, 'plan.json'), JSON.stringify(plan, null, 1));
  console.log(`plan: ${plan.duration.toFixed(2)}s, ${plan.sfx.length} sfx, ${plan.chunks.length} caption chunks`);

  // ---------- stills only ----------
  const stills = opt('stills');
  if (stills) {
    for (const s of String(stills).split(',')) {
      const t = parseFloat(s);
      await page.evaluate((t) => window.__render(t), t);
      await page.screenshot({ path: path.join(OUT, `still_${t.toFixed(2)}.png`) });
    }
    console.log('stills written to', OUT);
  }
  if (opt('no-video') || stills) { await browser.close(); server.close(); process.exit(0); }

  run(PY, ['engine/audio.py', OUT]);

  // ---------- 3. frames ----------
  const frames = Math.ceil(plan.duration * FPS);
  const FR = path.join(OUT, 'frames');
  fs.rmSync(FR, { recursive: true, force: true });
  fs.mkdirSync(FR);
  const workers = +opt('workers', 4);
  const pages = [page, ...(await Promise.all(Array.from({ length: workers - 1 }, openPage)))];
  const qa = [];
  let done = 0;
  const t0 = Date.now();
  await Promise.all(pages.map(async (pg, w) => {
    for (let f = w; f < frames; f += workers) {
      const t = f / FPS;
      await pg.evaluate((t) => window.__render(t), t);
      await pg.screenshot({ path: path.join(FR, `f${String(f).padStart(5, '0')}.png`) });
      if (f % 6 === 0) qa.push({ t, items: await pg.evaluate(() => window.__qa()) });
      if (++done % 90 === 0) process.stdout.write(`\rframes ${done}/${frames}`);
    }
  }));
  console.log(`\rframes ${frames}/${frames} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  await browser.close();
  server.close();

  // ---------- 4. encode ----------
  const mp4 = path.join(OUT, `${id}.mp4`);
  run('ffmpeg', ['-y', '-v', 'error', '-framerate', String(FPS), '-i', path.join(FR, 'f%05d.png'), '-i', path.join(OUT, 'audio.wav'),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(FPS),
    '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', mp4]);
  console.log('video:', mp4);

  // ---------- 5. contact sheet ----------
  const sheetTimes = ep.sheet ? ep.sheet.map(Number) : Array.from({ length: 8 }, (_, i) => +(plan.duration * (0.04 + (i * 0.92) / 7)).toFixed(2));
  run('python3', ['engine/sheet.py', FR, path.join(OUT, 'sheet.png'), sheetTimes.join(',')]);
  run('python3', ['engine/sheet.py', FR, path.join(OUT, 'sheet_guides.png'), sheetTimes.join(','), '--guides']);

  // ---------- 6. QA ----------
  const issues = [];
  const moving = (t) => plan.moving.some(([a, b]) => t >= a - 0.05 && t <= b + 0.05);
  for (const { t, items } of qa) {
    const vis = items.filter((r) => r.x1 > 0 && r.x0 < 1080 && r.y1 > 0 && r.y0 < 1920 && r.x1 - r.x0 > 2);
    for (const r of vis) {
      const out = r.y0 < SAFE.top || r.y1 > SAFE.bottom || r.x0 < SAFE.left || r.x1 > SAFE.right;
      if (out && !((r.kind === 'world' || r.kind === 'bg') && moving(t))) issues.push({ t, type: 'safe-area', kind: r.kind, text: r.text, box: [r.x0, r.y0, r.x1, r.y1].map(Math.round) });
    }
    for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
      const a = vis[i], b = vis[j];
      if (a.g === b.g || a.kind === 'bg' || b.kind === 'bg') continue;
      const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (ox > 6 && oy > 6) issues.push({ t, type: 'overlap', kind: `${a.kind}/${b.kind}`, text: `${a.text} | ${b.text}` });
    }
  }
  issues.sort((a, b) => a.t - b.t);
  fs.writeFileSync(path.join(OUT, 'qa.json'), JSON.stringify(issues, null, 1));
  const uniq = new Map();
  for (const i of issues) { const k = i.type + i.kind + i.text; if (!uniq.has(k)) uniq.set(k, { ...i, from: i.t, to: i.t }); else uniq.get(k).to = i.t; }
  console.log(`QA: ${issues.length} findings (${uniq.size} distinct)`);
  for (const u of uniq.values()) console.log(`  ${u.from.toFixed(1)}-${u.to.toFixed(1)}s ${u.type} [${u.kind}] ${u.text}${u.box ? ' ' + u.box.join(',') : ''}`);
  if (!opt('keep-frames')) fs.rmSync(FR, { recursive: true, force: true });
} catch (e) {
  console.error(e);
  await browser.close();
  server.close();
  process.exit(1);
}
