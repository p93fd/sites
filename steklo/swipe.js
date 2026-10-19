(() => {
'use strict';
// steklo v10. Кадр едет за пальцем и колесом в обе стороны (плёнка, каждый кадр ключевой).
// Отпустил — пружина доводит до сцены, и сцена продолжает жить: петля покоя проигрывается самим браузером
// (аппаратно, без копирования в шейдер), плавно наплывая поверх кадра остановки. Никаких лишних холстов.
const MOBILE = () => innerHeight > innerWidth || innerWidth < 760;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOut = t => 1 - Math.pow(1 - t, 4);
const stops = [...document.querySelectorAll('.stop')].map((el, i) => ({ el, i, name: el.dataset.name }));
const S = stops.length;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NET = navigator.connection || {}; const FAST = !NET.saveData && !/2g|3g/.test(NET.effectiveType || '');
const set = (!MOBILE() || (FAST && (devicePixelRatio || 1) >= 2)) ? 'd' : 'm';
const EXT = document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"') ? 'mp4' : 'webm';
const DS = document.documentElement.dataset, A = DS.assets || 'v', F = DS.film || 'v';
const NOIDLE = new Set([7]);                   // сцена 8 живёт частицами (lotus.js)
window.__set = set;

const film = document.getElementById('film'), idle = document.getElementById('idle'), still = document.getElementById('still');
let T = Array.from({ length: S }, (_, k) => k * 2.3), FPS = 30, filmReady = false;
const timeAt = p => { const k = clamp(Math.floor(p), 0, S - 2), f = clamp(p - k, 0, 1); return T[k] + (T[k + 1] - T[k]) * f; };

// ---------- состояние ----------
let target = 0, pos = 0, pv = 0, moving = false, lastInput = 0, touching = false, restK = 0, settled = false;

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
const STEP_WHEEL = () => innerHeight * 1.1, STEP_TOUCH = () => innerHeight * .75;
addEventListener('wheel', e => { e.preventDefault(); const d = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
  target = clamp(target + d / STEP_WHEEL(), 0, S - 1); lastInput = performance.now(); }, { passive: false });
let ty = 0, tPrev = 0, vel = 0;
addEventListener('touchstart', e => { if (e.target.closest('a,button')) return; touching = true; ty = e.touches[0].clientY; tPrev = performance.now(); vel = 0; target = pos; }, { passive: true });
addEventListener('touchmove', e => { if (!touching) return; e.preventDefault(); const y = e.touches[0].clientY, now = performance.now(), d = (ty - y) / STEP_TOUCH();
  target = clamp(target + d, 0, S - 1); vel = .8 * vel + .2 * (d / Math.max(1, now - tPrev) * 1000); ty = y; tPrev = now; lastInput = now; }, { passive: false });
addEventListener('touchend', () => { if (!touching) return; touching = false;
  target = Math.abs(vel) > 1.2 ? clamp(vel > 0 ? Math.floor(target) + 1 : Math.ceil(target) - 1, 0, S - 1) : target; lastInput = performance.now(); });
addEventListener('keydown', e => { if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); goTo(Math.round(target) + 1); }
  if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(Math.round(target) - 1); } if (e.key === 'Home') goTo(0); if (e.key === 'End') goTo(S - 1); });
document.getElementById('next').addEventListener('click', () => goTo(Math.round(target) + 1));
document.querySelector('[data-go="0"]').addEventListener('click', e => { e.preventDefault(); goTo(0); });

// ---------- перемотка: всегда к последней нужной точке, без очереди ----------
let wantT = 0, seekBusy = false, shownT = -1;
function seek() { if (!filmReady || seekBusy) return; const t = Math.round(wantT * FPS) / FPS; if (Math.abs(t - shownT) < .5 / FPS) return;
  seekBusy = true; shownT = t; if (film.fastSeek) film.fastSeek(t); else film.currentTime = t; }
film.addEventListener('seeked', () => { seekBusy = false; seek(); });

// ---------- петли покоя ----------
const idleBlob = {};
const idleUrl = k => `${A}/${set}i${k}.${EXT}`;
async function preIdle(k) { if (k < 0 || k >= S || idleBlob[k] || NOIDLE.has(k)) return; idleBlob[k] = 'loading';
  try { const b = await (await fetch(idleUrl(k))).blob(); idleBlob[k] = URL.createObjectURL(b); } catch (e) { delete idleBlob[k]; } }
let idleK = -1;
function startIdle(k) {
  if (reduce || NOIDLE.has(k)) return; idleK = k;
  const b = idleBlob[k]; idle.src = typeof b === 'string' && b !== 'loading' ? b : idleUrl(k);
  idle.currentTime = 0;
  idle.onplaying = () => { if (idleK === k && !moving) idle.classList.add('show'); };
  const p = idle.play(); if (p && p.catch) p.catch(() => {});
}
function stopIdle() { idleK = -1; idle.classList.remove('show'); setTimeout(() => { if (idleK === -1) idle.pause(); }, 750); }

// ---------- цифры и кейсы ----------
const counts = [...document.querySelectorAll('[data-count]')]; let cStart = 0;
function countUp() { cStart = performance.now() + 500; }
function tickCounts(now) { if (!cStart) return; const t = easeOut(clamp((now - cStart) / 1600)); counts.forEach(el => el.textContent = Math.round(+el.dataset.count * t) + el.dataset.suf); if (t >= 1) cStart = 0; }
const ring = document.getElementById('ring'), NC = 18, cards = []; let spiralStart = 0;
for (let k = 0; k < NC; k++) { const c = document.createElement('div'); c.className = 'card'; const im = document.createElement('img'); im.alt = 'Кейс клиента'; im.loading = 'lazy';
  im.src = `${DS.cases || 'cases'}/c${String(k).padStart(2, '0')}.webp`; c.appendChild(im); ring.appendChild(c); cards.push(c); }
const GAP = .92, P = NC * GAP;
function tickSpiral(now) { if (!ring.classList.contains('on')) return; const m = MOBILE(), RX = innerWidth * (m ? .16 : .22), RY = innerHeight * (m ? .1 : .14);
  const Tt = (now - spiralStart) / 1350 + .15;
  cards.forEach((c, k) => { let u = Tt - k * GAP; if (u > P - .4) u = ((u + .4) % P) - .4;
    const z = -1900 + u * 900, ang = u * 1.05 + k * .4, x = Math.cos(ang) * RX, y = Math.sin(ang) * RY;
    const op = Math.max(0, Math.min(clamp((u + .4) / .9), clamp((2.55 - u) / .45)));
    c.style.opacity = op.toFixed(3); c.style.visibility = op > 0 ? 'visible' : 'hidden';
    c.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${(Math.sin(ang) * -14).toFixed(2)}deg)`; c.style.zIndex = String(1000 + Math.round(z)); }); }

// ---------- один цикл ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(64, now - last); last = now;
  // отпустили: потянул от сцены больше 18% — едем дальше в ту сторону, меньше — назад
  if (!touching && now - lastInput > 220 && !Number.isInteger(target)) { const d = target - restK;
    target = clamp(d > .18 ? Math.ceil(target) : d < -.18 ? Math.floor(target) : Math.round(target), 0, S - 1); }
  // пружина без перелёта (SmoothDamp): за рукой быстро, доводка спокойно, как пролёт камеры
  const hands = touching || now - lastInput < 220, st = hands ? .14 : .45, vmax = hands ? 5 : 1.2;
  if (reduce) { pos = target; pv = 0; } else {
    const h = dt / 1000, w = 2 / st, x = w * h, e = 1 / (1 + x + .48 * x * x + .235 * x * x * x);
    let c = pos - target; const mc = vmax * st; c = clamp(c, -mc, mc); const tg = pos - c;
    const tmp = (pv + w * c) * h; pv = (pv - w * tmp) * e; let np = tg + (c + tmp) * e;
    if ((target - pos > 0) === (np > target)) { np = target; pv = 0; } pos = np; }
  if (Math.abs(target - pos) < 1e-3 && Math.abs(pv) < .02) { pos = target; pv = 0; }
  const atRest = !touching && pos === target && Number.isInteger(target);
  const near = Math.round(pos);
  ui(near); bar.style.width = (pos / (S - 1) * 100) + '%';
  activate(Math.abs(pos - near) < .12 ? near : -1);
  if (!atRest) {
    if (!moving) { moving = true; settled = false; stopIdle(); }
    wantT = timeAt(pos); seek();
  } else if (!settled) {
    settled = true; moving = false; restK = target; wantT = timeAt(pos); seek();
    startIdle(restK); for (const j of [restK + 1, restK - 1, restK + 2]) preIdle(j);
  }
  tickCounts(now); tickSpiral(now);
  requestAnimationFrame(frame);
}
window.__state = () => ({ idx: Math.round(pos), playing: moving, pos, target });
window.__goTo = goTo;
window.__hold = p => { pos = target = p; pv = 0; touching = true; };  // для проверок: заморозить кадр на позиции p
window.__release = () => { touching = false; lastInput = performance.now(); };

// ---------- старт: плёнка целиком в память, потом открываем ----------
const enter = document.getElementById('enter'), eBar = document.getElementById('enterBar'); let opened = false;
function open() { if (opened) return; opened = true; enter.classList.add('gone'); activate(0); }
still.src = `${A}/${set}p0.webp`;
fetch(`${F}/stops.json`).then(r => r.json()).then(j => { T = j.stops; FPS = j.fps; }).catch(() => {}).then(async () => {
  const r = await fetch(`${F}/film_${set}.${EXT}`);
  const total = +r.headers.get('content-length') || 0, rd = r.body.getReader(), parts = []; let got = 0;
  for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; if (total) eBar.style.width = (8 + 92 * got / total) + '%'; }
  film.src = URL.createObjectURL(new Blob(parts, { type: `video/${EXT}` }));
  film.addEventListener('loadeddata', () => { filmReady = true; shownT = -1; film.classList.add('ready'); seek(); open(); preIdle(0); preIdle(1); }, { once: true });
  film.load();
}).catch(() => open());
setTimeout(open, 15000);
requestAnimationFrame(frame);
})();
