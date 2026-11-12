#!/usr/bin/env node
// Render the mascot profile picture: node engine/avatar.mjs [navy|green]
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'out', 'avatar');
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
const browser = await chromium.launch();
for (const bg of process.argv.slice(2).length ? process.argv.slice(2) : ['navy', 'green']) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto(`http://127.0.0.1:${server.address().port}/engine/runtime/index.html?ep=avatar&bg=${bg}`);
  await page.waitForFunction(() => window.__ready || window.__error);
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(err);
  await page.evaluate(() => window.__render(0.3));
  const file = path.join(OUT, `metrivastudio-avatar-${bg}.png`);
  await page.screenshot({ path: file, clip: { x: 0, y: 420, width: 1080, height: 1080 } });
  console.log(file);
}
await browser.close();
server.close();
