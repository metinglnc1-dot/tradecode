#!/usr/bin/env node
// Render Pinterest images: node engine/pins.mjs [id ...]  -> out/pins/<id>.png
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out', 'pins');
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'timings.json'), JSON.stringify({ fps: 30, voiceEnd: 1, lines: [], mouth: [] }));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.ttf': 'font/ttf' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['a1', 'a2', 'a3', 'a4', 'a5', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3', 'd1', 'd2', 'd3'];
const browser = await chromium.launch();
for (const id of ids) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}/engine/runtime/index.html?ep=pins&pin=${id}`);
  await page.waitForFunction(() => window.__ready || window.__error);
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(err);
  await page.evaluate(() => window.__render(0.3));
  const file = path.join(OUT, `${id}.png`);
  const clip = id.startsWith('d') ? { x: 0, y: 0, width: 1080, height: 1920 } : { x: 40, y: 210, width: 1000, height: 1500 };
  await page.screenshot({ path: file, clip });
  console.log(file);
  await page.close();
}
await browser.close();
server.close();
