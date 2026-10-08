// Пересобирает авто-блоки в INDEX.md и MAP.md: список файлов и номера строк.
// Запуск: node tools/gen-map.mjs  (сам запускается перед каждым коммитом, см. .githooks/pre-commit)
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const rd = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const kb = (n) => (n < 1024 ? n + " Б" : n < 1048576 ? Math.round(n / 1024) + " КБ" : (n / 1048576).toFixed(1) + " МБ");
const strip = (s) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&[a-z]+;/g, "").replace(/\s+/g, " ").trim();
const TEXT = /\.(html|js|mjs|md|css|txt|json)$/;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    if (e.name.startsWith(".git") || e.name === "node_modules") continue;
    const p = dir ? dir + "/" + e.name : e.name;
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

function replaceBlock(file, name, body) {
  const f = path.join(ROOT, file), src = fs.readFileSync(f, "utf8");
  const a = `<!-- auto:${name} -->`, b = `<!-- /auto:${name} -->`;
  const i = src.indexOf(a), j = src.indexOf(b);
  if (i < 0 || j < 0) throw new Error(`нет маркеров ${name} в ${file}`);
  const next = src.slice(0, i + a.length) + "\n" + body.trim() + "\n" + src.slice(j);
  if (next !== src) fs.writeFileSync(f, next);
}

// ---------- INDEX: файлы по папкам ----------
const files = walk("");
const top = {};
for (const p of files) { const k = p.includes("/") ? p.split("/")[0] : "."; (top[k] ||= []).push(p); }
let idx = "| Папка | Файлов | Вес | Текстовые файлы (строк) |\n|---|---|---|---|\n";
for (const k of Object.keys(top).sort()) {
  const list = top[k];
  const size = list.reduce((s, p) => s + fs.statSync(path.join(ROOT, p)).size, 0);
  const txt = list.filter((p) => TEXT.test(p) && !p.includes("/lib/") && !p.endsWith(".min.js"))
    .map((p) => `${p} (${rd(p).split("\n").length})`);
  idx += `| ${k} | ${list.length} | ${kb(size)} | ${txt.slice(0, 14).join(", ")}${txt.length > 14 ? ` … ещё ${txt.length - 14}` : ""} |\n`;
}
replaceBlock("INDEX.md", "files", idx);

// ---------- MAP: экраны sistema и якоря в коде ----------
const html = rd("sistema/index.html").split("\n");
const js = rd("sistema/app.js").split("\n");
let map = "### Экраны (sistema/index.html)\n\n| # | id | Строка | Заголовок |\n|---|---|---|---|\n";
let n = 0;
html.forEach((l, i) => {
  const m = l.match(/<section class="([^"]+)" id="([^"]+)"/);
  if (!m) return;
  n++;
  let h = "";
  for (let k = i; k < Math.min(i + 12, html.length); k++) { const t = html[k].match(/<h[12][^>]*>(.*?)<\/h[12]>/); if (t) { h = strip(t[1]); break; } }
  map += `| ${n} | ${m[2]} | ${i + 1} | ${h} |\n`;
});

map += "\n### CSS-блоки (sistema/index.html)\n\n";
html.forEach((l, i) => { const m = l.match(/^\/\* (.+?)(\*\/|$)/); if (m && i < 700) map += `- ${i + 1}: ${m[1].replace(/=+|-{3,}/g, "").trim().slice(0, 80)}\n`; });

map += "\n### Формы сцены (sistema/app.js, build)\n\n";
js.forEach((l, i) => { const m = l.match(/\/\/\s*([0-7])\s+([^:,;]+)/); if (m && i > 200 && i < 300) map += `- ${i + 1}: форма ${m[1]} — ${m[2].trim().slice(0, 50)}\n`; });

map += "\n### Функции и константы (sistema/app.js)\n\n";
js.forEach((l, i) => {
  let m = l.match(/^\s*(?:async\s+)?function\s+(\w+)/) || l.match(/^\s*const\s+(N_CH|LABELS|HOLDS?|CAM|HUE|FORM|lens|bloom)\b/);
  if (m) map += `- ${i + 1}: ${m[1]}\n`;
});
replaceBlock("MAP.md", "anchors", map);
console.log("INDEX.md и MAP.md обновлены");
