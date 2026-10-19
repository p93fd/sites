(() => {
'use strict';
// Движок «свайп туда-сюда»: кадр едет за пальцем и колесом в обе стороны, с инерцией.
// Плёнка film_<набор> — все пролёты подряд, каждый кадр ключевой, поэтому перемотка мгновенная.
// Отпустил — камера доезжает до ближайшей сцены (бросок пальцем — до следующей) и сцена продолжает жить:
// петля покоя + свет (live.js) + частицы (particles.js). Интерфейс для них: событие 'scene' и __state().playing.
const MOBILE = () => innerHeight > innerWidth || innerWidth < 760;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOut = t => 1 - Math.pow(1 - t, 4);
const stops = [...document.querySelectorAll('.stop')].map((el, i) => ({ el, i, name: el.dataset.name }));
const S = stops.length;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NET = navigator.connection || {}; const FAST = !NET.saveData && !/2g|3g/.test(NET.effectiveType || '');
const set = (!MOBILE() || (FAST && (devicePixelRatio || 1) >= 2)) ? 'd' : 'm';
const EXT = document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"') ? 'mp4' : 'webm';
const ASSETS = document.documentElement.dataset.assets || 'v';            // петли и постеры
window.__idleUrl = k => `${ASSETS}/${set}i${k}.${EXT}`;
const purl = k => `${ASSETS}/${set}p${k}.webp`;

// ---------- плёнка ----------
const film = document.getElementById('film'), still = document.getElementById('still'), zoomEl = document.getElementById('zoom');
let T = Array.from({ length: S }, (_, k) => k * 2.3), FPS = 30, filmReady = false;
const timeAt = p => { const k = clamp(Math.floor(p), 0, S - 2), f = clamp(p - k, 0, 1); return T[k] + (T[k + 1] - T[k]) * f; };

// ---------- состояние движения ----------
let target = 0, pos = 0, pv = 0, moving = false, lastInput = 0, touching = false, restK = 0, settled = true;
const posters = {};
function poster(k) { if (!posters[k]) { const im = new Image(); im.decoding = 'async'; im.src = purl(k); posters[k] = im.decode().then(() => im).catch(() => im); } return posters[k]; }
async function setStill(k) { const im = await poster(k); if (still.src !== im.src) { still.src = im.src; try { await still.decode(); } catch (e) {} } else still.dispatchEvent(new Event('load')); }

// ---------- интерфейс ----------
const chapEl = document.getElementById('chap'), bar = document.getElementById('bar'), dotsEl = document.getElementById('dots');
stops.forEach((s, k) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = `${s.name}<i></i>`; b.setAttribute('aria-label', `Сцена ${k + 1}: ${s.name}`); b.addEventListener('click', () => goTo(k)); dotsEl.appendChild(b); });
const dots = [...dotsEl.children];
let uiK = -1;
function ui(k) { if (k === uiK) return; uiK = k; chapEl.innerHTML = `<b>${String(k + 1).padStart(2, '0')}</b> / ${String(S).padStart(2, '0')} · ${stops[k].name}`; dots.forEach((b, i) => b.classList.toggle('on', i === k)); document.getElementById('next').style.opacity = k === S - 1 ? 0 : 1; }
let shownK = -2;
function activate(k) { if (k === shownK) return; shownK = k; dispatchEvent(new CustomEvent('scene', { detail: k })); stops.forEach((s, i) => s.el.classList.toggle('on', i === k)); ring.classList.toggle('on', k === 5); if (k === 5) { countUp(); spiralStart = performance.now(); } }
function goTo(k) { target = clamp(k, 0, S - 1); lastInput = performance.now() - 1000; }

// ---------- ввод ----------
const STEP_WHEEL = () => innerHeight * 1.1;  // столько пикселей колеса = одна сцена
const STEP_TOUCH = () => innerHeight * .75;  // столько пикселей пальца = одна сцена
addEventListener('wheel', e => { e.preventDefault(); const d = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
  target = clamp(target + d / STEP_WHEEL(), 0, S - 1); lastInput = performance.now(); }, { passive: false });
let ty = 0, tPrev = 0, vel = 0;
addEventListener('touchstart', e => { if (e.target.closest('a,button')) return; touching = true; ty = e.touches[0].clientY; tPrev = performance.now(); vel = 0; target = pos; }, { passive: true });
addEventListener('touchmove', e => { if (!touching) return; e.preventDefault(); const y = e.touches[0].clientY, now = performance.now(), dy = ty - y;
  const d = dy / STEP_TOUCH(); target = clamp(target + d, 0, S - 1); vel = .8 * vel + .2 * (d / Math.max(1, now - tPrev) * 1000); ty = y; tPrev = now; lastInput = now; }, { passive: false });
addEventListener('touchend', () => { if (!touching) return; touching = false;
  // бросок: быстрый взмах уводит на следующую сцену в его сторону
  const base = Math.round(target); target = Math.abs(vel) > 1.2 ? clamp((vel > 0 ? Math.floor(target) + 1 : Math.ceil(target) - 1), 0, S - 1) : base;
  lastInput = performance.now() - 1000; });
addEventListener('keydown', e => { if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); goTo(Math.round(target) + 1); }
  if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(Math.round(target) - 1); } if (e.key === 'Home') goTo(0); if (e.key === 'End') goTo(S - 1); });
document.getElementById('next').addEventListener('click', () => goTo(Math.round(target) + 1));
document.querySelector('[data-go="0"]').addEventListener('click', e => { e.preventDefault(); goTo(0); });

// ---------- перемотка плёнки: всегда к последней нужной точке, без очереди ----------
let wantT = 0, seekBusy = false, shownT = -1;
function seek() { if (!filmReady || seekBusy) return; const t = Math.round(wantT * FPS) / FPS; if (Math.abs(t - shownT) < .5 / FPS) return;
  seekBusy = true; shownT = t; film.currentTime = t; }
film.addEventListener('seeked', () => { seekBusy = false; seek(); });

// ---------- цифры и кейсы ----------
const counts = [...document.querySelectorAll('[data-count]')]; let cStart = 0;
function countUp() { cStart = performance.now() + 500; }
function tickCounts(now) { if (!cStart) return; const t = easeOut(clamp((now - cStart) / 1600)); counts.forEach(el => el.textContent = Math.round(+el.dataset.count * t) + el.dataset.suf); }
const ring = document.getElementById('ring'), NC = 18, cards = []; let spiralStart = 0;
for (let k = 0; k < NC; k++) { const c = document.createElement('div'); c.className = 'card'; const im = document.createElement('img'); im.alt = 'Кейс клиента'; im.loading = 'lazy';
  im.src = `${document.documentElement.dataset.cases || 'cases'}/c${String(k).padStart(2, '0')}.webp`; c.appendChild(im); ring.appendChild(c); cards.push(c); }
const GAP = .92, P = NC * GAP;
function tickSpiral(now) { if (!ring.classList.contains('on')) return; const m = MOBILE(), RX = innerWidth * (m ? .16 : .22), RY = innerHeight * (m ? .1 : .14);
  const Tt = (now - spiralStart) / 1350 + .15;
  cards.forEach((c, k) => { let u = Tt - k * GAP; if (u > P - .4) u = ((u + .4) % P) - .4;
    const z = -1900 + u * 900, ang = u * 1.05 + k * .4, x = Math.cos(ang) * RX, y = Math.sin(ang) * RY;
    const op = Math.max(0, Math.min(clamp((u + .4) / .9), clamp((2.55 - u) / .45)));
    c.style.opacity = op.toFixed(3); c.style.visibility = op > 0 ? 'visible' : 'hidden';
    c.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${(Math.sin(ang) * -14).toFixed(2)}deg)`; c.style.zIndex = String(1000 + Math.round(z)); }); }

// ---------- плёнка: зерно и пыль ----------
const gc = document.getElementById('grain'), gx = gc.getContext('2d'); const dust = [];
function gsize() { gc.width = Math.round(innerWidth / 2); gc.height = Math.round(innerHeight / 2); } gsize(); addEventListener('resize', gsize);
for (let i = 0; i < 60; i++) dust.push({ x: Math.random(), y: Math.random(), r: .4 + Math.random() * 1.4, s: .00004 + Math.random() * .0001, a: .12 + Math.random() * .4, p: Math.random() * 6 });
const noise = document.createElement('canvas'); noise.width = noise.height = 128; { const nx = noise.getContext('2d'), d = nx.createImageData(128, 128);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 5; } nx.putImageData(d, 0, 0); }
const pat = gx.createPattern(noise, 'repeat');

// ---------- один цикл ----------
let last = performance.now(), zNow = 1.012, restSince = performance.now();
function frame(now) {
  const dt = Math.min(64, now - last); last = now;
  // доводка к ближайшей сцене, когда руки отпустили
  // потянул от сцены больше чем на 18% — едем на следующую в ту же сторону, меньше — возвращаемся
  if (!touching && now - lastInput > 380 && !Number.isInteger(target)) { const d = target - restK;
    target = d > .18 ? Math.min(Math.ceil(target), restK + Math.max(1, Math.round(d))) : d < -.18 ? Math.max(Math.floor(target), restK + Math.min(-1, Math.round(d))) : Math.round(target); target = clamp(target, 0, S - 1); }
  // инерция: независимая от частоты кадров
  // пружина без перелёта (SmoothDamp): мягкий разгон и мягкая остановка, скорость ограничена
  // палец/колесо — кадр идёт следом быстро; доводка — спокойно, как пролёт камеры
  const hands = touching || now - lastInput < 380, st = hands ? .16 : .42, vmax = hands ? 4 : 1.1;
  if (reduce) { pos = target; pv = 0; } else {
    const h = dt / 1000, w = 2 / st, x = w * h, e = 1 / (1 + x + .48 * x * x + .235 * x * x * x);
    let c = pos - target; const mc = vmax * st; c = clamp(c, -mc, mc); const tg = pos - c;
    const tmp = (pv + w * c) * h; pv = (pv - w * tmp) * e; let np = tg + (c + tmp) * e;
    if ((target - pos > 0) === (np > target)) { np = target; pv = 0; } pos = np; }
  if (Math.abs(target - pos) < 1.5e-3 && Math.abs(pv) < .02) { pos = target; pv = 0; }
  const atRest = !touching && pos === target && Number.isInteger(target) && now - lastInput > 380;
  const near = Math.round(pos);
  ui(near); bar.style.width = (pos / (S - 1) * 100) + '%';
  // текст сцены проявляется на подлёте и уходит, как только сдвинулись
  activate(Math.abs(pos - near) < .14 ? near : -1);
  if (!atRest) {
    if (!moving) { moving = true; settled = false; film.classList.add('show'); }
    wantT = timeAt(pos); seek();
  } else if (!settled) {
    settled = true; moving = false; restK = target; restSince = now;
    setStill(restK).then(() => { if (!moving) setTimeout(() => { if (!moving) film.classList.remove('show'); }, 120); });
    preloadNear(restK);
  }
  const zT = moving ? 1.012 : 1.012 + .01 * Math.sin((now - restSince) * .00032);
  zNow += (zT - zNow) * Math.min(1, dt * .004); if (!reduce) zoomEl.style.transform = `scale(${zNow.toFixed(5)})`;
  tickCounts(now); tickSpiral(now);
  if (!reduce) { gx.clearRect(0, 0, gc.width, gc.height); gx.save(); gx.translate(-(Math.random() * 128) | 0, -(Math.random() * 128) | 0); gx.fillStyle = pat; gx.fillRect(0, 0, gc.width + 128, gc.height + 128); gx.restore();
    for (const p of dust) { p.y -= p.s * dt; if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); } const tw2 = .6 + .4 * Math.sin(now * .001 + p.p);
      gx.beginPath(); gx.arc(p.x * gc.width + Math.sin(now * .0003 + p.p) * 6, p.y * gc.height, p.r, 0, 6.283); gx.fillStyle = `rgba(190,215,255,${(p.a * tw2).toFixed(3)})`; gx.fill(); } }
  requestAnimationFrame(frame);
}
function preloadNear(k) { for (const j of [k - 1, k + 1, k - 2, k + 2]) if (j >= 0 && j < S) poster(j); }
window.__state = () => ({ idx: Math.round(pos), playing: moving, pos: +pos.toFixed(3), target: +target.toFixed(3) });
window.__goTo = goTo;

// ---------- старт: плёнка целиком в память, потом открываем ----------
const enter = document.getElementById('enter'), eBar = document.getElementById('enterBar'); let opened = false;
function open() { if (opened) return; opened = true; enter.classList.add('gone'); activate(0); }
setStill(0).then(() => { eBar.style.width = '15%'; });
fetch(`${document.documentElement.dataset.film || 'film'}/stops.json`).then(r => r.json()).then(j => { T = j.stops; FPS = j.fps; }).catch(() => {}).then(async () => {
  const r = await fetch(`${document.documentElement.dataset.film || 'film'}/film_${set}.${EXT}`);
  const total = +r.headers.get('content-length') || 0, rd = r.body.getReader(), parts = []; let got = 0;
  for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; if (total) eBar.style.width = (15 + 85 * got / total) + '%'; }
  film.src = URL.createObjectURL(new Blob(parts, { type: `video/${EXT}` }));
  film.addEventListener('loadeddata', () => { filmReady = true; shownT = -1; seek(); open(); }, { once: true });
  film.load();
}).catch(() => open());
setTimeout(open, 15000);
for (let k = 1; k < S; k++) setTimeout(() => poster(k), 1500 + k * 200);
requestAnimationFrame(frame);
})();
