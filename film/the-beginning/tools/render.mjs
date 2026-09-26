// Offline frame capture: drives film.js in headless Chromium, one frame at a
// time, and pipes JPEG frames into ffmpeg.
//
//   node tools/render.mjs                    # full film -> build/picture.mp4
//   node tools/render.mjs --stills 3,16.5    # PNG stills -> build/stills/
import { createRequire } from 'node:module';
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(execFileSync('npm', ['root', '-g']).toString().trim() + '/playwright')); }

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BUILD = path.join(ROOT, 'build');
const FFMPEG = process.env.FFMPEG || execFileSync('python3', ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())']).toString().trim();

const args = process.argv.slice(2);
const stillsArg = args.includes('--stills') ? args[args.indexOf('--stills') + 1] : null;
const from = args.includes('--from') ? +args[args.indexOf('--from') + 1] : 0;
const to = args.includes('--to') ? +args[args.indexOf('--to') + 1] : null;

// Tiny static server so fonts and scripts load from http://.
const types = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const url = `http://127.0.0.1:${server.address().port}/index.html?capture=1`;

const browser = await chromium.launch({ args: ['--disable-gpu-vsync'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 804 } });
page.on('pageerror', (e) => { console.error('page error:', e); process.exitCode = 1; });
await page.goto(url);
await page.waitForFunction(() => window.FILM_READY === true);
const { FPS, DURATION } = await page.evaluate(() => ({ FPS: FILM.FPS, DURATION: FILM.DURATION }));

async function grab(t, type = 'jpeg') {
  const dataUrl = await page.evaluate(([t, type]) => {
    FILM.render(window.FILM_CTX, t, 1);
    return window.FILM_CTX.canvas.toDataURL(type === 'png' ? 'image/png' : 'image/jpeg', 0.94);
  }, [t, type]);
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

if (stillsArg) {
  const dir = path.join(BUILD, 'stills');
  fs.mkdirSync(dir, { recursive: true });
  for (const s of stillsArg.split(',')) {
    const t = +s;
    fs.writeFileSync(path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.jpg`), await grab(t));
    console.log('still', t);
  }
} else {
  fs.mkdirSync(BUILD, { recursive: true });
  const out = path.join(BUILD, to ? `picture_${from}_${to}.mp4` : 'picture.mp4');
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p', '-tune', 'film', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n0 = Math.round(from * FPS), n1 = Math.round((to ?? DURATION) * FPS);
  const started = Date.now();
  for (let n = n0; n < n1; n++) {
    const buf = await grab(n / FPS);
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (n % 48 === 0) console.log(`frame ${n}/${n1}  ${((Date.now() - started) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log('wrote', out);
}
await browser.close();
server.close();
