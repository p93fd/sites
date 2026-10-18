// Рендер кадров: node studio/render.mjs W H N outDir [onlyList]
import { chromium } from 'playwright'; import fs from 'node:fs';
const [W, H, N, out, only] = [+process.argv[2], +process.argv[3], +process.argv[4], process.argv[5], process.argv[6]];
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
page.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text()); });
page.on('pageerror', e => console.log('PAGEERR', e.message));
await page.goto(`http://localhost:8765/studio/scene.html?w=${W}&h=${H}`);
await page.waitForFunction(() => window.__ready && window.__portraitReady, null, { timeout: 60000 });
const list = only ? only.split(',').map(Number) : [...Array(N).keys()];
const t0 = Date.now();
for (const i of list) {
  const p = N > 1 ? i / (N - 1) : 0;
  const data = await page.evaluate(p => { window.renderAt(p); return document.querySelector('canvas').toDataURL('image/webp', 0.88); }, p);
  fs.writeFileSync(`${out}/f${String(i).padStart(4, '0')}.webp`, Buffer.from(data.split(',')[1], 'base64'));
  if (list.length < 30 || i % 20 === 0) console.log(i, ((Date.now() - t0) / 1000).toFixed(1) + 's');
}
await browser.close();
