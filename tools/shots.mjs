// Снимки и проверки сайта в безголовом Chromium.
// node tools/shots.mjs <папка сайта> [--chapters 6] [--step 1.6] [--out /tmp/shots] [--qs "?hq&fix"]
// Делает: снимок каждой главы на 1440×900 и 390×844, ловит ошибки консоли и упавшие запросы,
// меряет горизонтальную прокрутку, называет шрифты заголовков, печатает итог PASS / FAIL.
import fs from "fs"; import path from "path"; import http from "http"; import { createRequire } from "module";
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("/opt/npm-tools/node_modules/playwright")); }
const a = process.argv.slice(2), root = path.resolve(a[0] || "."), opt = (k, d) => { const i = a.indexOf("--" + k); return i > -1 ? a[i + 1] : d; };
const N = +opt("chapters", 6), STEP = +opt("step", 1.6), OUT = opt("out", "/tmp/shots"), QS = opt("qs", "?hq&fix");
fs.mkdirSync(OUT, { recursive: true });
const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".json": "application/json" };
const srv = http.createServer((q, s) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p.endsWith("/")) p += "index.html"; const f = path.join(root, p);
  if (!f.startsWith(root) || !fs.existsSync(f)) { s.writeHead(404); return s.end(); } s.writeHead(200, { "content-type": MIME[path.extname(f)] || "application/octet-stream" }); s.end(fs.readFileSync(f)); });
await new Promise((r) => srv.listen(0, r)); const url = `http://localhost:${srv.address().port}/${QS}`;
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"] });
const errs = [], report = [];
for (const [name, w, h] of [["d", 1440, 900], ["m", 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on("console", (m) => m.type() === "error" && errs.push(`[${name}] ${m.text()}`)); p.on("pageerror", (e) => errs.push(`[${name}] ${e.message}`));
  p.on("requestfailed", (r) => errs.push(`[${name}] не загрузилось: ${r.url()}`));
  await p.goto(url); await p.waitForFunction(() => document.documentElement.classList.contains("ready") || window.__ready, null, { timeout: 30000 }).catch(() => errs.push(`[${name}] страница не сообщила о готовности`));
  await p.mouse.move(w * 0.56, h * 0.46); await p.waitForTimeout(6500);
  for (let k = 0; k < N; k++) { await p.evaluate(([k, s]) => scrollTo(0, Math.round(k * s * innerHeight)), [k, STEP]); await p.waitForTimeout(4200); await p.screenshot({ path: `${OUT}/${name}-${k}.png` }); }
  const info = await p.evaluate(() => ({ over: document.documentElement.scrollWidth - innerWidth,
    fonts: [...new Set([...document.querySelectorAll("h1,h2")].map((e) => getComputedStyle(e).fontFamily.split(",")[0].replace(/"/g, "")))],
    small: [...document.querySelectorAll("p,span,a,li")].filter((e) => e.offsetParent && e.textContent.trim() && parseFloat(getComputedStyle(e).fontSize) < 10).length }));
  report.push(`${name}: горизонтальная прокрутка ${info.over}px · шрифты заголовков ${info.fonts.join(", ")} · текста мельче 10px: ${info.small}`);
  if (info.over > 0) errs.push(`[${name}] горизонтальная прокрутка ${info.over}px`);
  if (info.fonts.some((f) => /^(Inter|Inter Tight|Manrope|Montserrat|Roboto|Open Sans|Arial|Helvetica)/i.test(f))) errs.push(`[${name}] заголовки набраны шаблонным шрифтом: ${info.fonts}`);
  await p.close();
}
await b.close(); srv.close();
report.forEach((r) => console.log(r)); errs.forEach((e) => console.log(" -", e));
console.log(errs.length ? `FAIL: ${errs.length}` : "PASS", "· снимки:", OUT);
process.exit(errs.length ? 1 : 0);
