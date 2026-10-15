'use strict';
/* Деньги: учёт расходов по фото. Всё живёт в телефоне, зашифровано кодом. Сети нет. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const VAULT = 'dengi.vault', TRIES = 'dengi.tries';

/* ---------- Статьи ---------- */
const CATS = [
  { id: 'food',   n: 'Продукты',          c: '#7ee0a1' },
  { id: 'cafe',   n: 'Кафе и доставка',   c: '#f2c14e' },
  { id: 'taxi',   n: 'Транспорт',         c: '#6bb7ff' },
  { id: 'car',    n: 'Авто',              c: '#5a8dee' },
  { id: 'home',   n: 'Дом и ЖКХ',         c: '#c79bff' },
  { id: 'phone',  n: 'Связь и интернет',  c: '#59d2d2' },
  { id: 'subs',   n: 'Подписки',          c: '#ff9ad5' },
  { id: 'health', n: 'Здоровье',          c: '#ff7a6b' },
  { id: 'beauty', n: 'Красота',           c: '#ffb38a' },
  { id: 'cloth',  n: 'Одежда',            c: '#e3a1ff' },
  { id: 'shop',   n: 'Покупки',           c: '#ffd36b' },
  { id: 'kids',   n: 'Дети',              c: '#a6e36b' },
  { id: 'fun',    n: 'Развлечения',       c: '#ff8fa3' },
  { id: 'travel', n: 'Путешествия',       c: '#4fd1c5' },
  { id: 'edu',    n: 'Обучение',          c: '#b0c4ff' },
  { id: 'biz',    n: 'Бизнес',            c: '#d9f26b' },
  { id: 'tax',    n: 'Налоги и сборы',    c: '#c0a080' },
  { id: 'xfer',   n: 'Переводы',          c: '#a0a8b0' },
  { id: 'other',  n: 'Другое',            c: '#80868c' },
  { id: 'income', n: 'Доход',             c: '#7ee0a1', inc: true },
];
const CAT = Object.fromEntries(CATS.map(c => [c.id, c]));

const RULES = [
  ['income', /зарплат|аванс|зачислен|поступлен|входящ|возврат|кешб[эе]к|cashback|оплата от|доход|пополнение от/],
  ['food',   /пят[её]рочк|агроторг|магнит|тандер|перекр[её]ст|вкусвилл|вкус ?вилл|лента|ашан|ат[ао]к|дикси|окей|о'?кей|метро ?кэш|metro|спар|spar|азбука вкуса|глобус|светофор|верный|самокат|лавка|бристоль|красное ?& ?белое|красное и белое|продукт|супермаркет|гипермаркет|fix ?price|фикс ?прайс|мясо|пекарн|хлеб|овощ|фрукт|молок/],
  ['cafe',   /кафе|ресторан|кофе|coffee|кофейн|бар\b|паб|пицц|суши|роллы|бургер|burger|kfc|ростикс|вкусно.{0,4}точка|фастфуд|рестораны|макдон|теремок|шоколадниц|додо|delivery|деливери|яндекс ?ед|кухня на районе|стардогс|cofix|surf|столов|шаурм|чайхон|бистро|еда/],
  ['taxi',   /такси|taxi|uber|ситимобил|яндекс ?go|метро\b|метрополит|мосметро|тройк|автобус|трамва|электричк|аэроэкспресс|ржд|транспорт|самокат.*аренд|whoosh|юрент|кикшеринг|делимобил|ситидрайв|belka|каршеринг/],
  ['car',    /азс|лукойл|газпромнефт|роснефт|shell|татнефт|bp\b|топлив|бензин|аи-?9[25]|дт\b|парковк|мойка|шиномонтаж|автосервис|осаго|каско|штраф гибдд|платная дорог|автодор/],
  ['home',   /жкх|жку|коммунал|квартплат|мосэнерго|энергосбыт|электроэнерг|водоканал|газ\b|мосгаз|управляющ|аренда кв|ипотек|леруа|leroy|obi\b|икеа|ikea|hoff|хофф|максидом|петрович|хозтовар|бытов/],
  ['phone',  /мтс|mts|mtc|мобильная связь|билайн|beeline|мегафон|megafon|теле2|tele2|t2\b|ростелеком|интернет|связь|йота|yota|сотов/],
  ['subs',   /подписк|яндекс ?плюс|кинопоиск|ivi|иви|okko|окко|netflix|spotify|apple\.com|itunes|app ?store|google ?play|youtube|telegram premium|vk ?музык|звук|литрес|storytel|chatgpt|openai|claude|anthropic|icloud/],
  ['health', /аптеки|медицина|apteka|ригла|горздрав|36[.,]6|здравсити|еаптека|клиник|медцентр|стоматолог|анализ|инвитро|гемотест|врач|медицин|больниц|лекарст/],
  ['beauty', /салон|парикмахер|барбер|barber|маникюр|косметолог|спа\b|spa\b|золотое яблоко|летуаль|рив гош|иль де боте|косметик/],
  ['cloth',  /одежд|обув|zara|h&m|uniqlo|befree|gloria jeans|глория|спортмастер|lamoda|ламода|love republic|o'?stin|остин|кари|ecco|adidas|nike|reebok|ушакова/],
  ['shop',   /маркетплейс|цифровые товары|ozon|озон|wildberries|вайлдберриз|wb\b|яндекс ?маркет|market|aliexpress|алиэкспресс|мвидео|м\.видео|эльдорадо|днс|dns|ситилинк|магазин|мегамаркет|авито/],
  ['kids',   /детск|детский мир|кружок|секци|школ|садик|игрушк/],
  ['fun',    /кино|театр|концерт|билет|музей|боулинг|квест|клуб|фитнес|спортзал|бассейн|world class|ddx|x-?fit/],
  ['travel', /отель|hotel|гостиниц|booking|островок|суточно|авиабилет|аэрофлот|победа|s7|уральские авиа|utair|туту|aviasales|авиасейлс|аэропорт/],
  ['edu',    /курс|обучени|тренинг|вебинар|skillbox|нетологи|geekbrains|яндекс ?практикум|книг/],
  ['biz',    /реклам|таргет|директ|хостинг|домен|tilda|тильда|getcourse|геткурс|amocrm|битрикс|бухгалтер|эквайринг|рко|обслуживание сч[её]т/],
  ['tax',    /налог|фнс|госпошлин|пошлин|пени|штраф|страхов.*взнос/],
  ['xfer',   /перевод|сбп|по номеру телефона|клиенту|на карту/],
];

/* ---------- Состояние ---------- */
let key = null;            // ключ шифрования в памяти, пока приложение открыто
let S = null;              // данные
let view = ymNow();        // показываемый месяц 'YYYY-MM'
let hiddenAt = 0;

function blank() { return { v: 1, ops: [], limits: {}, learn: {}, lockAfter: 60 }; }
function ymNow() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
function today() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

/* ---------- Шифрование ---------- */
const te = new TextEncoder(), td = new TextDecoder();
const b64 = u => btoa(String.fromCharCode(...new Uint8Array(u)));
const unb64 = s => Uint8Array.from(atob(s), ch => ch.charCodeAt(0));

async function deriveKey(pin, salt) {
  const base = await crypto.subtle.importKey('raw', te.encode(pin), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function seal(obj, k, salt) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, te.encode(JSON.stringify(obj)));
  return { v: 1, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}
async function open(vault, k) {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(vault.iv) }, k, unb64(vault.ct));
  return JSON.parse(td.decode(pt));
}
let salt = null;
async function persist() {
  if (!key) return;
  localStorage.setItem(VAULT, JSON.stringify(await seal(S, key, salt)));
}

/* ---------- Замок ---------- */
let pin = '', mode = 'unlock', firstPin = '';
const lockEl = $('#lock');

function showLock(m) {
  mode = m; pin = ''; firstPin = '';
  const t = {
    unlock: ['Деньги', 'Введи код'],
    setup1: ['Придумай код', 'От 4 до 6 цифр. Им шифруются все данные'],
    setup2: ['Повтори код', 'Чтобы точно не ошибиться'],
    new1:   ['Новый код', 'От 4 до 6 цифр'],
    new2:   ['Повтори новый код', ''],
  }[m];
  $('#lockTitle').textContent = t[0];
  $('#lockHint').textContent = t[1];
  $('#lockCancel').hidden = !m.startsWith('new');
  lockEl.hidden = false;
  $('#app').hidden = true;
  closeSheets();
  drawDots();
}
function drawDots() {
  $$('#dots i').forEach((d, i) => d.classList.toggle('on', i < pin.length));
  $('#pad .pad-ok').disabled = pin.length < 4;
}
function shake(msg) {
  const d = $('#dots'); d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake');
  if (msg) $('#lockHint').textContent = msg;
  pin = ''; drawDots();
}
function triesState() { try { return JSON.parse(localStorage.getItem(TRIES)) || { n: 0, until: 0 }; } catch { return { n: 0, until: 0 }; } }

$('#pad').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.k === 'del') { pin = pin.slice(0, -1); drawDots(); return; }
  if (b.dataset.k === 'ok') { if (pin.length >= 4) submitPin(); return; }
  if (pin.length >= 6) return;
  pin += b.textContent; drawDots();
  if (pin.length === 6) setTimeout(submitPin, 120);
});
document.addEventListener('keydown', e => {
  if (lockEl.hidden) return;
  if (/^\d$/.test(e.key) && pin.length < 6) { pin += e.key; drawDots(); if (pin.length === 6) submitPin(); }
  else if (e.key === 'Backspace') { pin = pin.slice(0, -1); drawDots(); }
  else if (e.key === 'Enter' && pin.length >= 4) submitPin();
});
$('#lockCancel').addEventListener('click', () => { lockEl.hidden = true; $('#app').hidden = false; });

let busy = false;
async function submitPin() {
  if (busy || pin.length < 4) return;
  busy = true;
  try {
    if (mode === 'setup1' || mode === 'new1') {
      firstPin = pin; const next = mode === 'setup1' ? 'setup2' : 'new2';
      const keep = firstPin; showLock(next); firstPin = keep; return;
    }
    if (mode === 'setup2' || mode === 'new2') {
      if (pin !== firstPin) { const m = mode === 'setup2' ? 'setup1' : 'new1'; showLock(m); shake('Коды не совпали, давай заново'); return; }
      salt = crypto.getRandomValues(new Uint8Array(16));
      key = await deriveKey(pin, salt);
      if (!S) S = blank();
      await persist();
      pin = firstPin = '';
      enterApp(mode === 'new2' ? 'Код сменил' : '');
      return;
    }
    // unlock
    const t = triesState();
    if (Date.now() < t.until) { shake('Подожди ' + Math.ceil((t.until - Date.now()) / 1000) + ' сек'); return; }
    $('#lockHint').textContent = 'Открываю…';
    const vault = JSON.parse(localStorage.getItem(VAULT));
    const s = unb64(vault.salt);
    const k = await deriveKey(pin, s);
    try {
      S = Object.assign(blank(), await open(vault, k));
      key = k; salt = s; pin = '';
      localStorage.removeItem(TRIES);
      enterApp();
    } catch {
      t.n++;
      if (t.n >= 5) t.until = Date.now() + Math.min(30000 * 2 ** (t.n - 5), 3600000);
      localStorage.setItem(TRIES, JSON.stringify(t));
      shake(t.n >= 5 ? 'Неверно. Пауза ' + Math.round((t.until - Date.now()) / 1000) + ' сек' : 'Неверный код');
    }
  } finally { busy = false; }
}

function lockNow() {
  key = null; S = null;
  $('#ops').innerHTML = ''; $('#cats').innerHTML = '';
  showLock('unlock');
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); if (key && S && S.lockAfter === 0) lockNow(); }
  else if (key && S && Date.now() - hiddenAt > S.lockAfter * 1000 && hiddenAt) lockNow();
});

function enterApp(msg) {
  lockEl.hidden = true;
  $('#app').hidden = false;
  view = ymNow();
  render();
  if (msg) toast(msg);
}

/* ---------- Формат ---------- */
const nf = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
const money = n => nf.format(Math.round(n * 100) / 100).replace(/\u00a0/g, '\u202f') + '\u00a0₽';
const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const MONTHS_G = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
function dayLabel(d) {
  if (d === today()) return 'Сегодня';
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (d === isoLocal(y)) return 'Вчера';
  const [Y, M, D] = d.split('-').map(Number);
  return D + ' ' + MONTHS_G[M - 1] + (Y !== new Date().getFullYear() ? ' ' + Y : '');
}
function isoLocal(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function esc(s) { return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
function parseNum(s) { const n = parseFloat(String(s).replace(/[\s\u00a0\u202f₽]/g, '').replace(',', '.')); return isFinite(n) ? n : 0; }
function catOptions(sel, onlyInc) {
  return CATS.filter(c => onlyInc === undefined || !!c.inc === onlyInc)
    .map(c => `<option value="${c.id}"${c.id === sel ? ' selected' : ''}>${c.n}</option>`).join('');
}

/* ---------- Главный экран ---------- */
function render() {
  const [Y, M] = view.split('-').map(Number);
  $('#monthLbl').textContent = MONTHS[M - 1][0].toUpperCase() + MONTHS[M - 1].slice(1) + (Y !== new Date().getFullYear() ? ' ' + Y : '');
  const ops = S.ops.filter(o => o.d.startsWith(view));
  let out = 0, inc = 0; const by = {};
  for (const o of ops) {
    if (o.k === 'in') inc += o.s;
    else { out += o.s; by[o.c] = (by[o.c] || 0) + o.s; }
  }
  $('#sumOut').textContent = money(out);
  $('#sumIn').textContent = money(inc);
  const bal = inc - out;
  $('#sumBal').textContent = money(bal);
  $('#sumBal').className = bal < 0 ? 'neg' : '';
  const isNow = view === ymNow();
  const days = isNow ? new Date().getDate() : new Date(Y, M, 0).getDate();
  $('#sumDay').textContent = money(out / days);

  // статьи: траты и лимиты
  const ids = new Set([...Object.keys(by), ...Object.keys(S.limits).filter(k => S.limits[k] > 0)]);
  const rows = [...ids].map(id => ({ id, s: by[id] || 0, lim: S.limits[id] || 0 })).sort((a, b) => b.s - a.s);
  const max = Math.max(1, ...rows.map(r => r.s));
  $('#cats').innerHTML = rows.length ? rows.map(r => {
    const c = CAT[r.id] || CAT.other;
    const pct = r.lim ? Math.min(100, r.s / r.lim * 100) : r.s / max * 100;
    const over = r.lim && r.s > r.lim;
    const col = r.lim ? (over ? 'var(--neg)' : r.s / r.lim > .8 ? 'var(--warn)' : c.c) : c.c;
    return `<div class="cat${over ? ' over' : ''}">
      <div class="cat-top"><span class="cat-name"><i style="background:${c.c}"></i>${c.n}</span>
      <span class="cat-sum">${money(r.s)}${r.lim ? ` <small>из ${money(r.lim)}</small>` : ''}</span></div>
      <div class="cat-bar"><i style="width:${pct.toFixed(1)}%;background:${col}"></i></div></div>`;
  }).join('') : `<div class="empty">Пока пусто. Загрузи фото чека или скрин из банка — разложу по статьям.</div>`;

  // операции по дням
  const sorted = ops.slice().sort((a, b) => b.d.localeCompare(a.d) || b.t - a.t);
  let html = '', last = '';
  for (const o of sorted) {
    if (o.d !== last) { html += `<div class="day">${dayLabel(o.d)}</div>`; last = o.d; }
    const c = CAT[o.c] || CAT.other;
    html += `<button class="op" data-id="${esc(o.id)}">
      <span class="op-dot" style="background:${c.c}">${esc(c.n[0])}</span>
      <span class="op-mid"><span class="op-name">${esc(o.n || c.n)}</span><span class="op-cat">${c.n}</span></span>
      <span class="op-sum ${o.k === 'in' ? 'pos' : ''}">${o.k === 'in' ? '+' : '−'}${money(o.s)}</span></button>`;
  }
  $('#ops').innerHTML = html;
}
$('#prevM').onclick = () => { view = shiftYm(view, -1); render(); };
$('#nextM').onclick = () => { view = shiftYm(view, 1); render(); };
function shiftYm(ym, d) { let [y, m] = ym.split('-').map(Number); m += d; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } return y + '-' + String(m).padStart(2, '0'); }
$('#ops').addEventListener('click', e => { const b = e.target.closest('.op'); if (b) openOp(S.ops.find(o => o.id === b.dataset.id)); });

/* ---------- Шторки ---------- */
function openSheet(id) { $(id).hidden = false; }
function closeSheets() { $$('.sheet').forEach(s => s.hidden = true); }
$$('.sheet').forEach(s => s.addEventListener('click', e => {
  if (e.target === s || e.target.closest('[data-close]')) { s.hidden = true; if (s.id === 'sheetReview') stopOcr(); }
}));
let toastT;
function toast(t) { const el = $('#toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => el.hidden = true, 2600); }

/* ---------- Операция вручную ---------- */
let editing = null, opKind = 'out';
function setKind(k) {
  opKind = k;
  $$('#opKind button').forEach(b => b.classList.toggle('on', b.dataset.v === k));
  const cur = $('#opCat').value;
  $('#opCat').innerHTML = catOptions(k === 'in' ? 'income' : (cur && cur !== 'income' ? cur : 'other'), k === 'in' ? true : false);
}
$('#opKind').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setKind(b.dataset.v); });
function openOp(o) {
  editing = o || null;
  $('#opTitle').textContent = o ? 'Операция' : 'Новая операция';
  $('#opDel').hidden = !o;
  $('#opCat').innerHTML = '';
  setKind(o ? o.k : 'out');
  $('#opCat').value = o ? o.c : (opKind === 'in' ? 'income' : 'other');
  $('#opSum').value = o ? String(o.s).replace('.', ',') : '';
  $('#opName').value = o ? o.n : '';
  $('#opDate').value = o ? o.d : (view === ymNow() ? today() : view + '-01');
  openSheet('#sheetOp');
  if (!o) setTimeout(() => $('#opSum').focus(), 250);
}
$('#addManual').onclick = () => openOp();
$('#opName').addEventListener('change', () => {
  if (editing) return;
  const g = guessCat($('#opName').value, opKind);
  if (g) $('#opCat').value = g;
});
$('#opSave').onclick = async () => {
  const s = parseNum($('#opSum').value);
  if (!(s > 0)) { toast('Впиши сумму'); return; }
  const rec = { s, k: opKind, n: $('#opName').value.trim(), c: $('#opCat').value, d: $('#opDate').value || today() };
  if (editing) {
    if (editing.c !== rec.c && rec.n) learn(rec.n, rec.c);
    Object.assign(editing, rec);
  } else {
    S.ops.push({ id: uid(), t: Date.now(), src: 'hand', ...rec });
    if (rec.n) learn(rec.n, rec.c);
  }
  await persist(); closeSheets(); render(); toast('Сохранил');
};
$('#opDel').onclick = async () => {
  if (!editing || !confirm('Удалить операцию?')) return;
  S.ops = S.ops.filter(o => o !== editing);
  await persist(); closeSheets(); render(); toast('Удалил');
};

/* ---------- Статья по названию ---------- */
function norm(s) { return String(s).toLowerCase().replace(/ё/g, 'е'); }
function learnKey(name) {
  return norm(name).replace(/\b(ооо|ип|ао|пао|зао)\b/g, ' ').replace(/[^a-zа-я ]+/g, ' ').trim().split(/\s+/).slice(0, 3).join(' ');
}
function learn(name, cat) { const k = learnKey(name); if (k.length >= 3) S.learn[k] = cat; }
function guessCat(text, kind) {
  const k = learnKey(text);
  if (k && S.learn[k] && (kind !== 'in' || S.learn[k] === 'income')) return S.learn[k];
  if (kind === 'in') return 'income';
  const t = norm(text);
  for (const [id, re] of RULES) { if (id !== 'income' && re.test(t)) return id; }
  return null;
}

/* ---------- Распознавание фото ---------- */
let worker = null, ocrStop = false;
const abs = p => new URL(p, location.href).href;

async function getWorker() {
  if (worker) return worker;
  worker = await Tesseract.createWorker(['rus', 'eng'], 1, {
    workerPath: abs('vendor/worker.min.js'),
    corePath: abs('vendor/'),
    langPath: abs('vendor/lang'),
    workerBlobURL: false,
    gzip: true,
    logger: m => {
      if (m.status === 'recognizing text') setProgress('Читаю текст…', m.progress);
      else if (/load|init/.test(m.status)) setProgress('Готовлю распознавание…', m.progress * .3);
    },
  });
  await worker.setParameters({ preserve_interword_spaces: '1', tessedit_pageseg_mode: '4' });
  return worker;
}
function stopOcr() { ocrStop = true; }
function setProgress(t, p) { $('#progressTxt').textContent = t; $('#progressBar').style.width = Math.round((p || 0) * 100) + '%'; }

// Готовим картинку: уменьшаем, серый, контраст, тёмную тему переворачиваем в светлую.
async function prepImage(file) {
  const bmp = await createImageBitmap(file);
  let w = bmp.width, h = bmp.height;
  const target = Math.min(2200, Math.max(1400, w));
  const sc = target / w; w = Math.round(w * sc); h = Math.round(h * sc);
  if (h > 7000) { const k = 7000 / h; w = Math.round(w * k); h = 7000; }
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  cx.imageSmoothingQuality = 'high';
  cx.drawImage(bmp, 0, 0, w, h); bmp.close && bmp.close();
  const img = cx.getImageData(0, 0, w, h), px = img.data;
  let sum = 0;
  for (let i = 0; i < px.length; i += 4) { const g = .299 * px[i] + .587 * px[i + 1] + .114 * px[i + 2]; px[i] = g; sum += g; }
  const inv = sum / (px.length / 4) < 115;
  for (let i = 0; i < px.length; i += 4) {
    let g = px[i]; if (inv) g = 255 - g;
    g = (g - 128) * 1.35 + 128; g = g < 0 ? 0 : g > 255 ? 255 : g;
    px[i] = px[i + 1] = px[i + 2] = g; px[i + 3] = 255;
  }
  cx.putImageData(img, 0, 0);
  return cv;
}

// Собираем строки из слов по их положению: суммы справа не отрываются от названий.
function rowsFromData(data) {
  const words = (data.words || []).filter(w => w.text && w.text.trim());
  if (!words.length) return (data.text || '').split('\n');
  words.sort((a, b) => (a.bbox.y0 + a.bbox.y1) - (b.bbox.y0 + b.bbox.y1));
  const rows = [];
  for (const w of words) {
    const cy = (w.bbox.y0 + w.bbox.y1) / 2, hh = w.bbox.y1 - w.bbox.y0;
    let r = rows.find(r => cy > r.y0 - hh * .15 && cy < r.y1 + hh * .15 && Math.abs(cy - r.cy) < Math.max(hh, r.h) * .6);
    if (!r) { r = { y0: w.bbox.y0, y1: w.bbox.y1, cy, h: hh, w: [] }; rows.push(r); }
    r.w.push(w); r.y0 = Math.min(r.y0, w.bbox.y0); r.y1 = Math.max(r.y1, w.bbox.y1);
  }
  rows.sort((a, b) => a.y0 - b.y0);
  return rows.map(r => r.w.sort((a, b) => a.bbox.x0 - b.bbox.x0).map(w => w.text).join(' '));
}

$('#photo').addEventListener('change', async e => {
  const files = [...e.target.files]; e.target.value = '';
  if (!files.length) return;
  ocrStop = false;
  $('#reviewBody').innerHTML = ''; $('#reviewFoot').hidden = true; $('#rawBox').hidden = true;
  $('#progress').hidden = false; setProgress('Готовлю распознавание…', 0);
  openSheet('#sheetReview');
  const all = []; let raw = '';
  try {
    const wk = await getWorker();
    for (let i = 0; i < files.length && !ocrStop; i++) {
      setProgress(files.length > 1 ? `Фото ${i + 1} из ${files.length}…` : 'Читаю текст…', 0);
      let cv = await prepImage(files[i]);
      const { data } = await wk.recognize(cv, {}, { text: true, blocks: true });
      cv.width = cv.height = 0; cv = null;           // картинку сразу выбрасываем
      const lines = rowsFromData(data);
      raw += (raw ? '\n\n———\n\n' : '') + lines.join('\n');
      all.push(parseText(lines));
    }
  } catch (err) {
    console.error(err);
    $('#progress').hidden = true;
    $('#reviewBody').innerHTML = `<p class="rv-note">Не получилось прочитать фото. Попробуй снять ровнее и ближе или добавь вручную.</p>`;
    return;
  } finally {
    if (worker) { worker.terminate(); worker = null; }
  }
  if (ocrStop) return;
  $('#progress').hidden = true;
  $('#rawTxt').textContent = raw; $('#rawBox').hidden = !raw.trim();
  showReview(all);
});

/* ---------- Разбор текста ---------- */
const MON_RE = /(\d{1,2})\s+(янв|фев|мар|апр|ма[йя]|июн|июл|авг|сен|окт|ноя|дек)[а-я]*\.?(?:\s+(\d{4}))?/;
const MON_IX = { янв: 0, фев: 1, мар: 2, апр: 3, мая: 4, май: 4, июн: 5, июл: 6, авг: 7, сен: 8, окт: 9, ноя: 10, дек: 11 };
const SKIP_RE = /\bинн\b|ккт|\bфн\b|\bфд\b|\bфп\b|\bрн\b|\bзн\b|смена|чек\s*№|ндс|\bсно\b|\bусн\b|тел[.:ефон]|www|http|\.ru\b|кассир|баланс|доступно|бонус|балл|лимит|остаток|сдача|получено|наличн|безналичн|электронн|номер|сайт фнс|место расч|адрес|qr|код\b/;
const SUM_RE = /итог|к оплате|всего|сумма/;

function cleanLine(l) {
  return l.replace(/[—–−‒]/g, '-').replace(/[|]/g, ' ').replace(/\s+/g, ' ').trim();
}
// Последняя сумма в строке: {v, sign, at, money}
function findAmount(line) {
  const re = /(^|[^\d*#•.,:\/])([+-]?)\s?(\d{1,3}(?:[ \u00a0\u202f]\d{3})+|\d+)(?:\s?[.,]\s?(\d{2}))?(?![\d:\/])(\s?(?:₽|руб\.?|р\.|р\b|rub|р$|p$))?/gi;
  let m, best = null;
  while ((m = re.exec(line))) {
    const v = parseFloat(m[3].replace(/[\s\u00a0\u202f]/g, '') + (m[4] ? '.' + m[4] : ''));
    if (!(v > 0) || v > 5e7) continue;
    const at = m.index + m[1].length;
    const before = line.slice(0, at);
    if (/[.:\/]\d*$/.test(before) && !m[4]) continue;          // кусок даты или времени
    if (MON_RE.test(line.slice(at, at + 16)) && !m[4] && !m[5]) continue; // «14 октября»
    const isMoney = !!(m[4] || m[5] || m[2] || /\d{1,3}[ \u00a0\u202f]\d{3}/.test(m[3]) || /=\s*$/.test(before));
    best = { v, sign: m[2], at, end: m.index + m[0].length, money: isMoney, tailEnd: line.slice(m.index + m[0].length).trim().length === 0 };
  }
  return best;
}
function dateIn(line, fallback) {
  const l = norm(line);
  if (/сегодня/.test(l)) return today();
  if (/вчера/.test(l)) { const d = new Date(); d.setDate(d.getDate() - 1); return isoLocal(d); }
  let m = l.match(/(\d{2})[.\/-](\d{2})[.\/-](\d{2,4})/);
  if (m) { const y = m[3].length === 2 ? '20' + m[3] : m[3]; const mm = +m[2], dd = +m[1]; if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) return `${y}-${m[2]}-${m[1]}`; }
  m = l.match(MON_RE);
  if (m) {
    const now = new Date(), mi = MON_IX[m[2]] ?? MON_IX[m[2].slice(0, 3)];
    let y = m[3] ? +m[3] : now.getFullYear();
    if (!m[3] && (mi > now.getMonth() + 1)) y--;
    return `${y}-${String(mi + 1).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`;
  }
  return fallback;
}
function letters(s) { return (s.match(/[a-zа-яё]/gi) || []).length; }
function nameFrom(line, a) {
  return line.slice(0, a.at).replace(/[*=x×х]\s*\d*[.,]?\d*\s*$/i, '').replace(/[^\p{L}\p{N} .,'"&«»-]/gu, ' ').replace(/\s+/g, ' ').replace(/^[\s.,-]+|[\s.,=*-]+$/g, '').trim();
}

function parseText(rawLines) {
  const lines = rawLines.map(cleanLine).filter(Boolean);
  const text = norm(lines.join('\n'));
  const isReceipt = /кассов|итог|фискал|\bккт\b|приход|\bфн\b|\bфд\b/.test(text);
  return isReceipt ? parseReceipt(lines, text) : parseBank(lines);
}

function parseReceipt(lines, text) {
  const date = dateIn(lines.find(l => /\d{2}[.\/-]\d{2}[.\/-]\d{2,4}/.test(l)) || '', today());
  // магазин: первая осмысленная строка
  let shop = '';
  for (const l of lines.slice(0, 8)) {
    const n = norm(l);
    if (letters(l) < 3 || /^(ооо|000|ип|ао|пао|зао)\b|кассовый чек|^чек|приход|добро пожаловать|спасибо|смена|инн/.test(n)) continue;
    shop = l.replace(/[^\p{L}\p{N} .,'"&«»-]/gu, ' ').replace(/\s+/g, ' ').trim(); break;
  }
  // итог
  let total = 0, totalIx = -1;
  for (let i = 0; i < lines.length; i++) {
    const n = norm(lines[i]);
    if (!SUM_RE.test(n) || /ндс|без ндс/.test(n)) continue;
    const a = findAmount(lines[i]) || (lines[i + 1] && findAmount(lines[i + 1]));
    if (!a) continue;
    if (/итог/.test(n) || !total) { total = a.v; totalIx = i; if (/итог/.test(n)) break; }
  }
  // позиции
  const items = [];
  const end = totalIx > 0 ? totalIx : lines.length;
  let pending = '';
  for (let i = 0; i < end; i++) {
    const l = lines[i], n = norm(l);
    if (SKIP_RE.test(n) || SUM_RE.test(n)) { pending = ''; continue; }
    const a = findAmount(l);
    if (!a || !a.money) { if (letters(l) >= 3) pending = l; continue; }
    let name = nameFrom(l, a);
    if (letters(name) < 3 && pending) name = nameFrom(pending, { at: pending.length }) || pending;
    pending = '';
    if (letters(name) < 2) continue;
    // в строке «2 x 89,90 =179,80» берём итог строки
    items.push({ n: name.slice(0, 60), s: a.v });
  }
  const cat = guessCat(shop, 'out') || guessCat(text, 'out') || 'other';
  if (!total && items.length) total = Math.round(items.reduce((s, x) => s + x.s, 0) * 100) / 100;
  return {
    type: 'receipt', date, shop,
    whole: total ? [{ n: shop || 'Покупка', s: total, k: 'out', c: cat, d: date, on: true }] : [],
    items: items.map(x => ({ n: x.n, s: x.s, k: 'out', c: guessCat(x.n, 'out') || cat, d: date, on: true })),
  };
}

function parseBank(lines) {
  const ops = [];
  let date = today(), pending = '';
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i], n = norm(l);
    const a = findAmount(l);
    // заголовок с датой
    if (!a || !a.money) {
      const d = dateIn(l, null);
      if (d && letters(l.replace(MON_RE, '')) < 12) { date = d; pending = ''; continue; }
      if (letters(l) >= 3 && !SKIP_RE.test(n)) pending = l;
      continue;
    }
    if (SKIP_RE.test(n) || /итого|всего|расходы|доходы|траты|поступления за|за (месяц|неделю|период)/.test(n)) { pending = ''; continue; }
    let name = nameFrom(l, a);
    const d = dateIn(l, null); if (d) date = d;
    if (letters(name) < 3 && pending) name = pending.replace(/\s+/g, ' ').trim();
    if (letters(name) < 2) { pending = ''; continue; }
    // строка под названием часто подпись категории банка: «Супермаркеты», её добавим к тексту для угадывания
    const sub = lines[i + 1] && !findAmount(lines[i + 1]) ? lines[i + 1] : '';
    const isIn = a.sign === '+' || RULES[0][1].test(norm(name));
    const k = isIn ? 'in' : 'out';
    const c = isIn ? 'income' : (guessCat(name, 'out') || guessCat(sub, 'out') || 'other');
    ops.push({ n: name.slice(0, 60), s: a.v, k, c, d: date, on: true });
    pending = '';
  }
  return { type: 'bank', ops };
}

/* ---------- Проверка перед сохранением ---------- */
let review = [];   // [{res, mode}]
function showReview(results) {
  review = results.map(r => ({ r, mode: r.type === 'receipt' ? (r.whole.length ? 'whole' : 'items') : 'ops' }));
  drawReview();
}
function rowsOf(x) { return x.mode === 'whole' ? x.r.whole : x.mode === 'items' ? x.r.items : x.r.ops; }
function markDupes(list) {
  for (const o of list) {
    const dup = S.ops.some(p => p.d === o.d && Math.abs(p.s - o.s) < .01 && p.k === o.k && learnKey(p.n) === learnKey(o.n));
    if (dup && o.dup === undefined) { o.dup = true; o.on = false; }
    else if (o.dup === undefined) o.dup = false;
  }
}
function drawReview() {
  let html = '', count = 0;
  review.forEach((x, xi) => {
    const list = rowsOf(x); markDupes(list); count += list.length;
    if (review.length > 1) html += `<h4>Фото ${xi + 1}</h4>`;
    if (x.r.type === 'receipt' && x.r.items.length && x.r.whole.length) {
      html += `<div class="rv-switch" data-x="${xi}">
        <button class="chip ${x.mode === 'whole' ? 'on' : ''}" data-m="whole">Одной суммой</button>
        <button class="chip ${x.mode === 'items' ? 'on' : ''}" data-m="items">По позициям (${x.r.items.length})</button></div>`;
    }
    if (!list.length) { html += `<p class="rv-note">Сумм не нашёл. Проверь, что на фото видны цифры, или добавь вручную.</p>`; return; }
    list.forEach((o, oi) => {
      html += `<div class="rv${o.on ? '' : ' off'}" data-x="${xi}" data-i="${oi}">
        <input type="checkbox" ${o.on ? 'checked' : ''} data-f="on" aria-label="Взять">
        <div class="rv-fields">
          <div class="rv-line"><button class="rv-kind ${o.k === 'in' ? 'pos' : 'neg'}" data-f="k">${o.k === 'in' ? '+' : '−'}</button>
          <input value="${esc(o.n)}" data-f="n" placeholder="Название"></div>
          <select data-f="c">${catOptions(o.c)}</select>
          <input class="rv-sum" value="${String(o.s).replace('.', ',')}" data-f="s" inputmode="decimal">
          <input type="date" class="rv-date" value="${o.d}" data-f="d" style="grid-column:span 2">
        </div>
        ${o.dup ? '<div class="rv-flag">Похоже, уже есть в списке</div>' : ''}
      </div>`;
    });
  });
  const intro = count ? `<p class="rv-note">Проверь и поправь, если надо. Статью запомню для следующих раз.</p>` : '';
  $('#reviewBody').innerHTML = intro + html;
  $('#reviewFoot').hidden = !count;
}
$('#reviewBody').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (chip) { review[chip.parentElement.dataset.x].mode = chip.dataset.m; drawReview(); return; }
  const kb = e.target.closest('[data-f=k]');
  if (kb) {
    const row = kb.closest('.rv'), o = rowsOf(review[row.dataset.x])[row.dataset.i];
    o.k = o.k === 'in' ? 'out' : 'in';
    if (o.k === 'in') o.c = 'income'; else if (o.c === 'income') o.c = guessCat(o.n, 'out') || 'other';
    drawReview();
  }
});
$('#reviewBody').addEventListener('change', e => {
  const f = e.target.dataset.f, row = e.target.closest('.rv'); if (!f || !row) return;
  const o = rowsOf(review[row.dataset.x])[row.dataset.i];
  if (f === 'on') { o.on = e.target.checked; row.classList.toggle('off', !o.on); }
  else if (f === 's') o.s = parseNum(e.target.value);
  else if (f === 'c') { o.c = e.target.value; o.touched = true; }
  else if (f === 'n') { o.n = e.target.value.trim(); if (!o.touched) { const g = guessCat(o.n, o.k); if (g) { o.c = g; row.querySelector('[data-f=c]').value = g; } } }
  else if (f === 'd') o.d = e.target.value || o.d;
});
$('#saveReview').onclick = async () => {
  let n = 0;
  for (const x of review) for (const o of rowsOf(x)) {
    if (!o.on || !(o.s > 0)) continue;
    S.ops.push({ id: uid(), t: Date.now() + n, src: 'photo', d: o.d, s: o.s, k: o.k, n: o.n, c: o.c });
    if (o.touched && o.n) learn(o.n, o.c);
    n++;
  }
  review = [];
  await persist(); closeSheets();
  const d = S.ops[S.ops.length - 1]; if (d && n) view = d.d.slice(0, 7);
  render(); toast(n ? 'Добавил: ' + n : 'Ничего не выбрано');
};

/* ---------- Настройки ---------- */
$('#openSet').onclick = () => {
  $('#limits').innerHTML = CATS.filter(c => !c.inc).map(c =>
    `<label class="lim"><span><i style="background:${c.c}"></i>${c.n}</span>
     <input inputmode="numeric" data-c="${c.id}" placeholder="—" value="${S.limits[c.id] ? S.limits[c.id] : ''}"></label>`).join('');
  $('#lockAfter').value = String(S.lockAfter);
  openSheet('#sheetSet');
};
$('#limits').addEventListener('change', async e => {
  const c = e.target.dataset.c; if (!c) return;
  const v = parseNum(e.target.value);
  if (v > 0) S.limits[c] = v; else delete S.limits[c];
  await persist(); render();
});
$('#lockAfter').onchange = async e => { S.lockAfter = +e.target.value; await persist(); };
$('#lockNow').onclick = lockNow;
$('#changePin').onclick = () => showLock('new1');

async function shareOrSave(blob, name) {
  const file = new File([blob], name, { type: blob.type });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
$('#exportBtn').onclick = async () => {
  await persist();
  const blob = new Blob([localStorage.getItem(VAULT)], { type: 'application/octet-stream' });
  shareOrSave(blob, 'dengi-' + today() + '.dengi');
};
$('#csvBtn').onclick = () => {
  if (!confirm('Таблица будет НЕ зашифрована. Сохранить?')) return;
  const rows = [['Дата', 'Тип', 'Сумма', 'Статья', 'Описание']].concat(
    S.ops.slice().sort((a, b) => a.d.localeCompare(b.d)).map(o => [o.d, o.k === 'in' ? 'доход' : 'расход', String(o.s).replace('.', ','), (CAT[o.c] || CAT.other).n, o.n]));
  const csv = '\ufeff' + rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(';')).join('\r\n');
  shareOrSave(new Blob([csv], { type: 'text/csv' }), 'dengi-' + today() + '.csv');
};
$('#importFile').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try {
    const v = JSON.parse(await f.text());
    const code = prompt('Код, которым была зашифрована копия');
    if (!code) return;
    const data = await open(v, await deriveKey(code, unb64(v.salt)));
    const have = new Set(S.ops.map(o => o.id)); let n = 0;
    for (const o of data.ops || []) if (!have.has(o.id)) { S.ops.push(o); n++; }
    S.limits = Object.assign({}, data.limits, S.limits);
    S.learn = Object.assign({}, data.learn, S.learn);
    await persist(); render(); toast('Восстановил операций: ' + n);
  } catch { toast('Не открылось. Проверь файл и код'); }
});
$('#wipeBtn').onclick = async () => {
  if (!confirm('Стереть все операции и код? Вернуть будет нельзя, если нет копии.')) return;
  if (!confirm('Точно стереть?')) return;
  localStorage.removeItem(VAULT); localStorage.removeItem(TRIES);
  try { indexedDB.deleteDatabase('keyval-store'); } catch {}
  key = null; S = null; showLock('setup1');
};

/* ---------- Старт ---------- */
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
showLock(localStorage.getItem(VAULT) ? 'unlock' : 'setup1');
