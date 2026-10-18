(() => {
'use strict';
// Сцена 8 «Формат»: живая россыпь частиц над лотосом. Частицы бьют из чаши вверх-в стороны и парят без остановки.
// Кадр под ними уходит в мягкую глубину (blur + затемнение), живые частицы — резкие, поверх.
const SCENE = 7;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cv = document.createElement('canvas');
cv.id = 'sparks'; cv.setAttribute('aria-hidden', 'true');
cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;opacity:0;transition:opacity 1.4s cubic-bezier(.22,1,.36,1)';
document.getElementById('stage').after(cv);
const g = cv.getContext('2d');
const stage = document.getElementById('stage');

let W = 0, H = 0, DPR = 1, N = 0;
function size() {
  DPR = Math.min(2, devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  N = (W < 760 || H > W) ? 900 : 2000;
}
size(); addEventListener('resize', size);

// кадр 16:9 вписан как object-fit:cover — пересчёт координат кадра в экран
function img2scr(u, v) {
  const s = Math.max(W / 16, H / 9), iw = 16 * s, ih = 9 * s;
  return [(W - iw) / 2 + u * iw, (H - ih) / 2 + v * ih, iw];
}

// спрайты: резкая искра и мягкое боке
function sprite(r, soft) {
  const c = document.createElement('canvas'); c.width = c.height = r * 2;
  const x = c.getContext('2d'), gr = x.createRadialGradient(r, r, 0, r, r, r);
  if (soft) { gr.addColorStop(0, 'rgba(150,200,255,.55)'); gr.addColorStop(.6, 'rgba(90,140,255,.18)'); gr.addColorStop(1, 'rgba(60,90,230,0)'); }
  else { gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.18, 'rgba(200,228,255,.95)'); gr.addColorStop(.45, 'rgba(118,183,255,.4)'); gr.addColorStop(1, 'rgba(65,85,232,0)'); }
  x.fillStyle = gr; x.fillRect(0, 0, r * 2, r * 2); return c;
}
const SP = sprite(24, false), BK = sprite(48, true);

const P = [];
function spawn(p, fresh) {
  const [cx, cy, iw] = img2scr(.5, .8);
  const ang = -Math.PI / 2 + (Math.random() - .5) * 2.3;          // веер вверх и в стороны
  const sp = iw * (.018 + Math.random() * .05);                    // px/с
  p.x = cx + (Math.random() - .5) * iw * .34;
  p.y = cy + (Math.random() - .5) * iw * .03;
  p.vx = Math.cos(ang) * sp; p.vy = Math.sin(ang) * sp;
  p.z = Math.random();                                             // глубина: 0 далеко, 1 близко
  p.r = (.6 + p.z * 2.4) * (iw / 1600 + .4);
  p.life = 7 + Math.random() * 9; p.t = fresh ? Math.random() * p.life : 0;
  p.ph = Math.random() * 6.283; p.tw = 1.5 + Math.random() * 3;
  p.bokeh = Math.random() < .07;
  return p;
}
function move(p, dt, t) {
  if (p.t > p.life || p.y < -40 || p.x < -40 || p.x > W + 40) spawn(p, false);
  // плавное торможение и восходящий поток: частицы не падают, а парят
  const drag = Math.pow(.9, dt);
  p.vx = p.vx * drag + Math.sin(t * .4 + p.ph) * 6 * dt;
  p.vy = p.vy * drag - 9 * dt * (.4 + p.z);
  p.x += p.vx * dt * (.5 + p.z); p.y += p.vy * dt * (.5 + p.z);
}
let warmW = 0;
function fill() {
  const fresh = P.length < N || warmW !== W; while (P.length < N) P.push(spawn({}, true)); P.length = N;
  if (!fresh) return; warmW = W;
  // предразогрев: прокручиваем жизнь системы, чтобы россыпь сразу стояла целиком
  for (const p of P) { const T = p.t; p.t = 0; for (let s = 0; s < T; s += .1) { p.t += .1; move(p, .1, s); } }
}

let on = false, alive = false, last = 0, fade = 0;
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000 || 0); last = now;
  fade += ((on ? 1 : 0) - fade) * Math.min(1, dt * 2.2);
  if (!on && fade < .01) { alive = false; g.clearRect(0, 0, cv.width, cv.height); return; }
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  g.clearRect(0, 0, W, H);
  g.globalCompositeOperation = 'lighter';
  const t = now / 1000;
  for (const p of P) {
    p.t += dt; move(p, dt, t);
    const k = p.t / p.life, env = Math.min(1, k * 6, (1 - k) * 3);
    const a = env * (.55 + .45 * Math.sin(t * p.tw + p.ph)) * fade;
    if (a <= .01) continue;
    g.globalAlpha = a;
    if (p.bokeh) { const R = p.r * 7; g.drawImage(BK, p.x - R, p.y - R, R * 2, R * 2); continue; }
    // лёгкий след по направлению движения — как на кадре
    const R = p.r * 3, v = Math.hypot(p.vx, p.vy) || 1, st = Math.min(2.4, 1 + v / 60);
    g.save(); g.translate(p.x, p.y); g.rotate(Math.atan2(p.vy, p.vx)); g.scale(st, 1);
    g.drawImage(SP, -R, -R, R * 2, R * 2); g.restore();
  }
  g.globalAlpha = 1;
  requestAnimationFrame(frame);
}

addEventListener('scene', e => {
  const k = e.detail;
  if (k === SCENE && !reduce) {
    fill(); on = true; cv.style.opacity = '1'; stage.classList.add('deep');
    if (!alive) { alive = true; last = performance.now(); requestAnimationFrame(frame); }
  } else if (on) {
    on = false; cv.style.opacity = '0'; stage.classList.remove('deep');
  }
});
})();
