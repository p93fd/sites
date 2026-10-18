(() => {
'use strict';
// Живые частицы на каждой сцене, без остановки. Пресеты:
// burst — россыпь из чаши (сцена 8), motes — пыль в лучах, rise — искры поднимаются,
// stars — мерцание звёзд, warp — искры летят из глубины тоннеля навстречу.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv = document.createElement('canvas');
cv.id = 'sparks'; cv.setAttribute('aria-hidden', 'true');
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0;transition:opacity 1.2s cubic-bezier(.22,1,.36,1)';
document.getElementById('stage').after(cv);
const g = cv.getContext('2d');
const stage = document.getElementById('stage');

// сцена → [пресет, количество на компьютере, точка-источник в кадре u,v]
const SC = [
  ['stars', 160, [.5, .5]],    // 1 небо
  ['rise', 220, [.5, .5]],     // 2 портал
  ['rise', 160, [.5, .45]],    // 3 соты
  ['warp', 320, [.6, .42]],    // 4 тоннель
  ['motes', 420, [.5, .3]],    // 5 лучи
  ['motes', 380, [.75, .62]],  // 6 крест лучей
  ['rise', 260, [.5, .72]],    // 7 лотос
  ['burst', 2000, [.5, .8]],   // 8 россыпь
  ['stars', 220, [.5, .62]],   // 9 горизонт
];
const DEEP = 7;

let W = 0, H = 0, DPR = 1, MOB = false;
function size() {
  DPR = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; MOB = W < 760 || H > W;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
}
size(); addEventListener('resize', () => { size(); warmed = -1; });

function img2scr(u, v) { const s = Math.max(W / 16, H / 9), iw = 16 * s, ih = 9 * s; return [(W - iw) / 2 + u * iw, (H - ih) / 2 + v * ih, iw]; }
function sprite(r, soft) {
  const c = document.createElement('canvas'); c.width = c.height = r * 2;
  const x = c.getContext('2d'), gr = x.createRadialGradient(r, r, 0, r, r, r);
  if (soft) { gr.addColorStop(0, 'rgba(150,200,255,.55)'); gr.addColorStop(.6, 'rgba(90,140,255,.18)'); gr.addColorStop(1, 'rgba(60,90,230,0)'); }
  else { gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.18, 'rgba(200,228,255,.95)'); gr.addColorStop(.45, 'rgba(118,183,255,.4)'); gr.addColorStop(1, 'rgba(65,85,232,0)'); }
  x.fillStyle = gr; x.fillRect(0, 0, r * 2, r * 2); return c;
}
const SP = sprite(24, false), BK = sprite(48, true);

let kind = 'stars', src = [.5, .5], P = [], warmed = -1, cur = -1;

function spawn(p, fresh) {
  const [cx, cy, iw] = img2scr(src[0], src[1]); const k = iw / 1600 + .4;
  p.z = Math.random(); p.ph = Math.random() * 6.283; p.tw = 1 + Math.random() * 3; p.bokeh = false;
  p.life = 7 + Math.random() * 9; p.t = fresh ? Math.random() * p.life : 0;
  if (kind === 'burst') {
    const ang = -Math.PI / 2 + (Math.random() - .5) * 2.3, sp = iw * (.018 + Math.random() * .05);
    p.x = cx + (Math.random() - .5) * iw * .34; p.y = cy + (Math.random() - .5) * iw * .03;
    p.vx = Math.cos(ang) * sp; p.vy = Math.sin(ang) * sp; p.r = (.6 + p.z * 2.4) * k; p.bokeh = Math.random() < .07;
  } else if (kind === 'motes') {
    p.x = Math.random() * W; p.y = Math.random() * H; p.vx = (Math.random() - .5) * 10; p.vy = (Math.random() - .3) * 8;
    p.r = (.4 + p.z * 1.8) * k; p.bokeh = Math.random() < .12; p.life = 10 + Math.random() * 12;
  } else if (kind === 'rise') {
    p.x = cx + (Math.random() - .5) * iw * .7; p.y = cy + Math.random() * H * .35;
    p.vx = (Math.random() - .5) * 8; p.vy = -(8 + Math.random() * 22); p.r = (.4 + p.z * 1.8) * k; p.bokeh = Math.random() < .1;
  } else if (kind === 'warp') {
    const a = Math.random() * 6.283, s0 = 4 + Math.random() * 30;
    p.x = cx + Math.cos(a) * s0; p.y = cy + Math.sin(a) * s0; p.vx = Math.cos(a) * 14; p.vy = Math.sin(a) * 14;
    p.r = (.4 + p.z * 1.4) * k; p.life = 5 + Math.random() * 5;
  } else { // stars
    p.x = Math.random() * W; p.y = Math.random() * H * .62; p.vx = 2 + Math.random() * 3; p.vy = 0;
    p.r = (.25 + p.z * 1.1) * k; p.life = 12 + Math.random() * 14; p.tw = .6 + Math.random() * 2.5;
  }
  return p;
}
function move(p, dt, t) {
  if (p.t > p.life || p.y < -60 || p.y > H + 60 || p.x < -60 || p.x > W + 60) spawn(p, false);
  if (kind === 'burst') {
    const d = Math.pow(.9, dt); p.vx = p.vx * d + Math.sin(t * .4 + p.ph) * 6 * dt; p.vy = p.vy * d - 9 * dt * (.4 + p.z);
  } else if (kind === 'warp') {
    const [cx, cy] = img2scr(src[0], src[1]); const dx = p.x - cx, dy = p.y - cy, r = Math.hypot(dx, dy) || 1;
    const acc = 22 * (1 + r / 120); p.vx += dx / r * acc * dt; p.vy += dy / r * acc * dt;
  } else if (kind === 'motes' || kind === 'rise') {
    p.vx += Math.sin(t * .5 + p.ph) * 4 * dt; p.vy += Math.cos(t * .4 + p.ph * 1.3) * (kind === 'rise' ? 1 : 3) * dt;
  }
  const m = kind === 'warp' ? 1 : (.5 + p.z);
  p.x += p.vx * dt * m; p.y += p.vy * dt * m;
}
function fill(k) {
  const [name, n, s] = SC[k]; kind = name; src = s;
  const N = MOB ? Math.round(n * (name === 'burst' ? .45 : .55)) : n;
  P = []; for (let i = 0; i < N; i++) P.push(spawn({}, true));
  // предразогрев: система сразу стоит целиком, как будто жила всегда
  for (const p of P) { const T = p.t; p.t = 0; for (let s2 = 0; s2 < T; s2 += .1) { p.t += .1; move(p, .1, s2); } }
  warmed = k;
}

let on = false, alive = false, last = 0, fade = 0;
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
  fade += ((on ? 1 : 0) - fade) * Math.min(1, dt * 2.2);
  if (!on && fade < .01) { alive = false; g.clearRect(0, 0, cv.width, cv.height); return; }
  g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H); g.globalCompositeOperation = 'lighter';
  const t = now / 1000, streak = kind === 'burst' || kind === 'warp';
  for (const p of P) {
    p.t += dt; move(p, dt, t);
    const k = p.t / p.life, env = Math.min(1, k * 6, (1 - k) * 3);
    const tw = kind === 'stars' ? (.35 + .65 * Math.pow(.5 + .5 * Math.sin(t * p.tw + p.ph), 3)) : (.55 + .45 * Math.sin(t * p.tw + p.ph));
    const a = env * tw * fade * (kind === 'burst' ? 1 : .85);
    if (a <= .01) continue;
    g.globalAlpha = a;
    if (p.bokeh) { const R = p.r * 7; g.drawImage(BK, p.x - R, p.y - R, R * 2, R * 2); continue; }
    const R = p.r * 3;
    if (streak) {
      const v = Math.hypot(p.vx, p.vy) || 1, st = Math.min(kind === 'warp' ? 5 : 2.4, 1 + v / 60);
      g.save(); g.translate(p.x, p.y); g.rotate(Math.atan2(p.vy, p.vx)); g.scale(st, 1); g.drawImage(SP, -R, -R, R * 2, R * 2); g.restore();
    } else g.drawImage(SP, p.x - R, p.y - R, R * 2, R * 2);
  }
  g.globalAlpha = 1;
  requestAnimationFrame(frame);
}

addEventListener('scene', e => {
  const k = e.detail;
  if (k >= 0 && !reduce && SC[k]) {
    if (warmed !== k || cur !== k) fill(k);
    cur = k; on = true; cv.style.opacity = '1'; stage.classList.toggle('deep', k === DEEP);
    if (!alive) { alive = true; last = performance.now(); requestAnimationFrame(frame); }
  } else {
    on = false; cv.style.opacity = '0'; stage.classList.remove('deep');
  }
});
})();
