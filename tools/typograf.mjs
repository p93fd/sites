// Русская типографика в HTML: неразрывные пробелы, тире, кавычки.
// node tools/typograf.mjs <файл.html> [--write]   (без --write только показывает, что изменится)
// Нужен пакет: npm i typograf
import fs from "fs"; import { createRequire } from "module";
const require = createRequire(import.meta.url);
let Typograf; try { Typograf = require("typograf"); } catch { console.error("Поставьте пакет: npm i typograf"); process.exit(2); }
const [file, flag] = process.argv.slice(2); if (!file) { console.error("Укажите файл"); process.exit(2); }
const tp = new Typograf({ locale: ["ru", "en-US"], htmlEntity: { type: "name", onlyInvisible: true } });
tp.setSetting("common/nbsp/afterShortWord", "lengthShortWord", 3);
tp.setSetting("common/nbsp/beforeShortLastWord", "lengthLastWord", 5);
tp.enableRule("common/nbsp/afterNumber");
tp.disableRule("common/punctuation/hellip");
const src = fs.readFileSync(file, "utf8");
// обрабатываем только текст между тегами внутри <body>, скрипты и стили не трогаем
const bodyAt = src.search(/<body[\s>]/i); const head = src.slice(0, bodyAt), body = src.slice(bodyAt);
let changed = 0;
const out = head + body.replace(/(<(script|style|svg|noscript)[\s\S]*?<\/\2>)|>([^<]+)</g, (m, skip, _t, text) => {
  if (skip || !/[А-Яа-яЁё]/.test(text)) return m;
  const lead = text.match(/^\s*/)[0], tail = text.match(/\s*$/)[0], fixed = tp.execute(text.trim());
  if (fixed !== text.trim()) { changed++; if (flag !== "--write") console.log("−", text.trim(), "\n+", fixed, "\n"); }
  return ">" + lead + fixed + tail + "<";
});
if (flag === "--write") fs.writeFileSync(file, out);
console.log(`Фрагментов с правками: ${changed}${flag === "--write" ? " · записано" : " · запустите с --write, чтобы записать"}`);
