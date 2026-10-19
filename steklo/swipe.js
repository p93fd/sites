(() => {
'use strict';
// steklo v11. Как у Apple: фильм — кадры-картинки на холсте, кадр едет за пальцем в обе стороны,
// между соседними кадрами — плавный наплыв (движение непрерывное при любой скорости пальца).
// Грузится сначала то, что рядом с текущей сценой; сайт открывается через 1–2 МБ.
// В покое сцена живёт: петля проигрывается видеоплеером браузера (аппаратно) поверх кадра остановки.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOut = t => 1 - Math.pow(1 - t, 4);
const stops = [...document.querySelectorAll('.stop')].map((el, i) => ({ el, i, name: el.dataset.name }));
const S = stops.length;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const PORTRAIT = innerHeight > innerWidth;
const SEQ = PORTRAIT ? 'p' : 'd';
const EXT = document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"') ? 'mp4' : 'webm';
const DS = document.documentElement.dataset, A = DS.assets || 'v', FR = DS.frames || 'f';
const NOIDLE = new Set([7]);                   // сцена 8 живёт частицами (lotus.js)

// ---------- холст ----------
const cv = document.getElementById('seq'), cx = cv.getContext('2d', { alpha: false });
let W = 0, H = 0, dirty = true, drawnF = -1;
function size() { const d = Math.min(2, devicePixelRatio || 1); W = Math.round(innerWidth * d); H = Math.round(innerHeight * d); cv.width = W; cv.height = H; dirty = true; }
let meta = { fps: 20, n: 1, stops: Array.from({ length: S }, () => 0) };
const blobs = [], bmp = new Map(), decoding = new Set();

// позиция (в сценах) -> номер кадра (дробный)
const frameAt = p => { const k = clamp(Math.floor(p), 0, S - 2), f = clamp(p - k, 0, 1); return meta.stops[k] + (meta.stops[k + 1] - meta.stops[k]) * f; };
const furl = i => `${FR}/${SEQ}/${String(i + 1).padStart(4, '0')}.webp`;

// загрузка: по удалённости от текущего кадра, 6 потоков
let curF = 0, inflight = 0;
function pump() {
  while (inflight < 6) {
    let best = -1; const c = Math.round(curF);
    for (let d = 0; d < meta.n && best < 0; d++) for (const i of [c + d, c - d]) if (i >= 0 && i < meta.n && blobs[i] === undefined) { best = i; break; }
    if (best < 0) return;
    blobs[best] = null; inflight++;
    fetch(furl(best)).then(r => r.blob()).then(b => { blobs[best] = b; inflight--; want(); pump(); }).catch(() => { blobs[best] = undefined; inflight--; setTimeout(pump, 800); });
  }
}
// разжатыми держим только кадры рядом (±36), остальные — сжатыми
function want() {
  const c = Math.round(curF);
  for (const [i, b] of bmp) if (Math.abs(i - c) > 40) { b.close && b.close(); bmp.delete(i); }
  for (let d = 0; d <= 36; d++) for (const i of [c + d, c - d]) {
    if (i < 0 || i >= meta.n || bmp.has(i) || decoding.has(i) || !blobs[i]) continue;
    if (decoding.size >= 4) return;
    decoding.add(i);
    createImageBitmap(blobs[i]).then(b => { decoding.delete(i); if (Math.abs(i - Math.round(curF)) <= 40) { bmp.set(i, b); dirty = true; } else b.close && b.close(); want(); })
      .catch(() => decoding.delete(i));
  }
}
function nearest(i) { if (bmp.has(i)) return [i, bmp.get(i)]; for (let d = 1; d < 12; d++) for (const j of [i - d, i + d]) if (bmp.has(j)) return [j, bmp.get(j)]; return null; }
function cover(b, a) { const s = Math.max(W / b.width, H / b.height), w = b.width * s, h = b.height * s; cx.globalAlpha = a; cx.drawImage(b, (W - w) / 2, (H - h) / 2, w, h); }
function draw(f) {
  if (!dirty && Math.abs(f - drawnF) < .01) return;
  const i0 = Math.floor(f), a = f - i0, n0 = nearest(i0); if (!n0) return;
  cover(n0[1], 1);
  if (a > .02 && n0[0] === i0) { const b1 = bmp.get(i0 + 1); if (b1) cover(b1, a); }
  cx.globalAlpha = 1; drawnF = f; dirty = false;
}

// ---------- состояние ----------
let target = 0, pos = 0, pv = 0, moving = false, lastInput = 0, touching = false, restK = 0, settled = false;

// ---------- интерфейс ----------
const chapEl = document.getElementById('chap'), bar = document.getElementById('bar'), dotsEl = document.getElementById('dots');
stops.forEach((s, k) => { const b = document.createElement('button'); b.type = 'button'; b.innerHTML = `${s.name}<i></i>`; b.setAttribute('aria-label', `Сцена ${k + 1}: ${s.name}`); b.addEventListener('click', () => goTo(k)); dotsEl.appendChild(b); });
const dots = [...dotsEl.children];
let uiK = -1;
function ui(k) { if (k === uiK) return; uiK = k; chapEl.innerHTML = `<b>${String(k + 1).padStart(2, '0')}</b> / ${String(S).padStart(2, '0')} · ${stops[k].name}`; dots.forEach((b, i) => b.classList.toggle('on', i === k)); document.getElementById('next').style.opacity = k === S - 1 ? 0 : 1; }
let shownK = -2;
function activate(k) { if (k === shownK) return; shownK = k; stops.forEach((s, i) => s.el.classList.toggle('on', i === k)); ring.classList.toggle('on', k === 5); if (k === 5) { countUp(); spiralStart = performance.now(); } }
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

// ---------- петли покоя ----------
const idle = document.getElementById('idle'), idleBlob = {};
const idleUrl = k => `${A}/${PORTRAIT ? 'p' : 'd'}i${k}.${EXT}`;
async function preIdle(k) { if (k < 0 || k >= S || idleBlob[k] || NOIDLE.has(k)) return; idleBlob[k] = 'loading';
  try { const b = await (await fetch(idleUrl(k))).blob(); idleBlob[k] = URL.createObjectURL(b); } catch (e) { delete idleBlob[k]; } }
let idleK = -1;
function startIdle(k) {
  if (reduce || NOIDLE.has(k)) return; idleK = k;
  const b = idleBlob[k]; idle.src = typeof b === 'string' && b !== 'loading' ? b : idleUrl(k);
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
const GAP = .92, PP = NC * GAP;
function tickSpiral(now) { if (!ring.classList.contains('on')) return; const RX = innerWidth * (PORTRAIT ? .16 : .22), RY = innerHeight * (PORTRAIT ? .1 : .14);
  const Tt = (now - spiralStart) / 1350 + .15;
  cards.forEach((c, k) => { let u = Tt - k * GAP; if (u > PP - .4) u = ((u + .4) % PP) - .4;
    const z = -1900 + u * 900, ang = u * 1.05 + k * .4, x = Math.cos(ang) * RX, y = Math.sin(ang) * RY;
    const op = Math.max(0, Math.min(clamp((u + .4) / .9), clamp((2.55 - u) / .45)));
    c.style.opacity = op.toFixed(3); c.style.visibility = op > 0 ? 'visible' : 'hidden';
    c.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${(Math.sin(ang) * -14).toFixed(2)}deg)`; c.style.zIndex = String(1000 + Math.round(z)); }); }

// ---------- один цикл ----------
let last = performance.now(), wantTick = 0;
function frame(now) {
  const dt = Math.min(64, now - last); last = now;
  if (!touching && now - lastInput > 220 && !Number.isInteger(target)) { const d = target - restK;
    target = clamp(d > .18 ? Math.ceil(target) : d < -.18 ? Math.floor(target) : Math.round(target), 0, S - 1); }
  // пружина без перелёта: за рукой быстро, доводка спокойно, как пролёт камеры
  const hands = touching || now - lastInput < 220, st = hands ? .14 : .45, vmax = hands ? 5 : 1.2;
  if (reduce) { pos = target; pv = 0; } else {
    const h = dt / 1000, w = 2 / st, x = w * h, e = 1 / (1 + x + .48 * x * x + .235 * x * x * x);
    let c = pos - target; const mc = vmax * st; c = clamp(c, -mc, mc); const tg = pos - c;
    const tmp = (pv + w * c) * h; pv = (pv - w * tmp) * e; let np = tg + (c + tmp) * e;
    if ((target - pos > 0) === (np > target)) { np = target; pv = 0; } pos = np; }
  if (Math.abs(target - pos) < 1e-3 && Math.abs(pv) < .02) { pos = target; pv = 0; }
  const atRest = !touching && pos === target && Number.isInteger(target);
  const near = Math.round(pos);
  ui(near); bar.style.transform = `scaleX(${(pos / (S - 1)).toFixed(4)})`;
  activate(Math.abs(pos - near) < .12 ? near : -1);
  curF = frameAt(pos);
  if (now - wantTick > 120) { wantTick = now; want(); pump(); }
  draw(curF);
  if (!atRest) { if (!moving) { moving = true; settled = false; stopIdle(); } }
  else if (!settled) { settled = true; moving = false; restK = target; startIdle(restK); for (const j of [restK + 1, restK - 1]) preIdle(j); }
  tickCounts(now); tickSpiral(now);
  requestAnimationFrame(frame);
}
window.__state = () => ({ idx: Math.round(pos), playing: moving, pos, target });
window.__goTo = goTo;
window.__hold = p => { pos = target = p; pv = 0; touching = true; };
window.__release = () => { touching = false; lastInput = performance.now(); };

// ---------- старт: открываемся, как только есть кадры первой сцены ----------
const enter = document.getElementById('enter'), eBar = document.getElementById('enterBar'); let opened = false;
function open() { if (opened) return; opened = true; enter.classList.add('gone'); activate(0); }
size(); addEventListener('resize', size);
fetch(`${FR}/seq.json`).then(r => r.json()).then(j => { meta = j; }).catch(() => {}).then(() => {
  pump(); preIdle(0);
  const need = Math.min(meta.n, meta.stops[1] + 1), t0 = performance.now();
  const wait = () => { let got = 0; for (let i = 0; i < need; i++) if (blobs[i]) got++;
    eBar.style.width = (100 * got / need) + '%';
    if ((got >= need && bmp.has(0)) || performance.now() - t0 > 9000) open(); else setTimeout(wait, 80); };
  wait();
});
requestAnimationFrame(frame);
})();
