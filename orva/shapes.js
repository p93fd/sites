// Формы нити. Каждая форма — массив vec4 на каждую точку: x, y, z, яркость.
// Все формы строятся из одного генератора случайных чисел, поэтому точка с номером i
// в каждой форме своя, но перетекание идёт точка-в-точку.

function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = (r) => { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185 * v); };

// Ветвящиеся нити: из ствола выходят ответвления, каждое — ломаная со случайным блужданием.
function veins(r, trunks, opts) {
  const { branches, steps, stepLen, drift, spread } = opts;
  const lines = [];
  for (const tr of trunks) {
    const pts = []; for (let i = 0; i <= steps; i++) pts.push(tr(i / steps)); lines.push({ pts, w: 1.0, main: true });
  }
  for (let b = 0; b < branches; b++) {
    const base = lines[b % trunks.length].pts; const s0 = Math.floor(r() * (base.length - 2));
    let [x, y, z] = base[s0]; let a = (r() - 0.5) * Math.PI * spread + drift[0], e = (r() - 0.5) * 0.9;
    const pts = [[x, y, z]]; const n = 6 + Math.floor(r() * steps * 0.55);
    for (let i = 0; i < n; i++) {
      a += (r() - 0.5) * 0.55; e += (r() - 0.5) * 0.3;
      x += Math.cos(a) * stepLen; y += Math.sin(a) * stepLen + drift[1] * stepLen; z += Math.sin(e) * stepLen * 0.6;
      pts.push([x, y, z]);
      if (r() < 0.07 && lines.length < branches * 1.6) lines.push({ pts: pts.slice(), w: 0.5, main: false, sub: true });
    }
    lines.push({ pts, w: 0.6 + r() * 0.4, main: false });
  }
  return lines;
}
function onLines(r, lines, out, i, thick, mainShare) {
  const main = lines._main || (lines._main = lines.filter((l) => l.main));
  const L = r() < mainShare ? main[Math.floor(r() * main.length)] : lines[Math.floor(r() * lines.length)];
  const p = L.pts, t = r() * (p.length - 1), k = Math.floor(t), f = t - k, a = p[k], b = p[Math.min(k + 1, p.length - 1)];
  const th = thick * (L.main ? 1.6 : 0.7);
  out[i * 4] = a[0] + (b[0] - a[0]) * f + gauss(r) * th;
  out[i * 4 + 1] = a[1] + (b[1] - a[1]) * f + gauss(r) * th;
  out[i * 4 + 2] = a[2] + (b[2] - a[2]) * f + gauss(r) * th;
  out[i * 4 + 3] = (L.main ? 1.0 : 0.55) * L.w * (0.6 + r() * 0.6);
}

export function buildShapes(N) {
  const S = [];
  const make = (seed, fn) => { const r = rng(seed), a = new Float32Array(N * 4); for (let i = 0; i < N; i++) fn(r, a, i); S.push(a); };

  // 0 — спираль: две нити, перемычки, пыль уходит вправо
  make(11, (r, a, i) => {
    const q = r(), t = r(), L = 7.2, y = (t - 0.5) * L, ang = t * Math.PI * 4.2, R = 0.95;
    let x, z, w;
    if (q < 0.68) { const s = q < 0.34 ? 0 : Math.PI; x = Math.cos(ang + s) * R; z = Math.sin(ang + s) * R; w = 1; x += gauss(r) * 0.035; z += gauss(r) * 0.035; }
    else if (q < 0.84) { const rung = Math.round(t * 34) / 34, ra = rung * Math.PI * 4.2, u = r() * 2 - 1; x = Math.cos(ra) * R * u; z = Math.sin(ra) * R * u; w = 0.55; a[i * 4 + 1] = (rung - 0.5) * L; a[i * 4] = x; a[i * 4 + 2] = z; a[i * 4 + 3] = w; return; }
    else { const d = Math.pow(r(), 1.6) * 3.4; x = Math.cos(ang) * R + d * 1.2 + gauss(r) * 0.25 * d; z = Math.sin(ang) * R + gauss(r) * 0.4 * d; w = 0.9 * (1 - d / 4); a[i * 4 + 1] = y + d * 0.35 + gauss(r) * 0.2 * d; a[i * 4] = x; a[i * 4 + 2] = z; a[i * 4 + 3] = w; return; }
    a[i * 4] = x; a[i * 4 + 1] = y; a[i * 4 + 2] = z; a[i * 4 + 3] = w;
  });

  // 1 — хаос: облако со сгустками, нить разорвана
  make(23, (r, a, i) => {
    const c = Math.floor(r() * 9), cr = rng(100 + c), cx = (cr() - 0.5) * 6, cy = (cr() - 0.5) * 3.6, cz = (cr() - 0.5) * 3;
    const loose = r() < 0.45, s = loose ? 1.6 : 0.42;
    a[i * 4] = cx * (loose ? 0.4 : 1) + gauss(r) * s * 1.2; a[i * 4 + 1] = cy * (loose ? 0.4 : 1) + gauss(r) * s; a[i * 4 + 2] = cz + gauss(r) * s; a[i * 4 + 3] = loose ? 0.35 + r() * 0.3 : 0.7 + r() * 0.3;
  });

  // 2 — пыль осела: тусклый слой внизу, редкие искры
  make(37, (r, a, i) => {
    const x = (r() - 0.5) * 11, z = (r() - 0.5) * 7 - 1;
    a[i * 4] = x; a[i * 4 + 1] = -1.9 + Math.sin(x * 0.7 + z) * 0.12 + Math.abs(gauss(r)) * 0.08 + (r() < 0.04 ? r() * 2.2 : 0); a[i * 4 + 2] = z; a[i * 4 + 3] = r() < 0.05 ? 0.8 : 0.16 + r() * 0.12;
  });

  // 3 — три пути: три светящихся ствола сверху вниз с ветками (центральный кадр образца)
  {
    const r = rng(41);
    const trunks = [-1.35, 0, 1.35].map((x0, k) => (t) => [x0 + Math.sin(t * 5.2 + k * 1.7) * 0.32 + Math.sin(t * 13 + k) * 0.06, 3.7 - t * 7.4, Math.sin(t * 4 + k * 2.1) * 0.5]);
    const lines = veins(r, trunks, { branches: 120, steps: 60, stepLen: 0.11, drift: [-Math.PI / 2, -0.35], spread: 0.9 });
    make(43, (rr, a, i) => onLines(rr, lines, a, i, 0.016, 0.42));
  }

  // 4 — сеть: стволы сплетаются в диагональную сеть (правый кадр образца)
  {
    const r = rng(53);
    const trunks = [];
    for (let k = 0; k < 7; k++) { const o = (k - 3) * 0.32, ph = k * 0.9; trunks.push((t) => { const u = t - 0.5; return [u * 7.6 + Math.sin(t * 7 + ph) * 0.22, u * 5.2 + o + Math.cos(t * 6 + ph) * 0.3, Math.sin(t * 5 + ph) * 0.7]; }); }
    const lines = veins(r, trunks, { branches: 260, steps: 70, stepLen: 0.085, drift: [0.6, 0.0], spread: 1.6 });
    make(59, (rr, a, i) => onLines(rr, lines, a, i, 0.014, 0.34));
  }

  // 5 — лента: широкая спираль вдаль, по ней идут кейсы
  make(67, (r, a, i) => {
    const t = r(), ang = t * Math.PI * 5.5, R = 2.6 + t * 0.6, w = (r() - 0.5) * 0.5;
    a[i * 4] = Math.cos(ang) * R + gauss(r) * 0.03; a[i * 4 + 1] = (t - 0.5) * 6 + w * 0.3; a[i * 4 + 2] = Math.sin(ang) * R - 1.2 + w; a[i * 4 + 3] = (0.35 + 0.65 * (1 - Math.abs(w) * 2)) * (0.5 + r() * 0.5);
  });

  // 6 — горизонт: тонкие линии волной уходят вдаль, над ними тихий свет
  make(71, (r, a, i) => {
    const row = Math.floor(r() * 26), x = (r() - 0.5) * 14, z = -row * 0.45 + 1.5;
    a[i * 4] = x; a[i * 4 + 1] = -1.3 + Math.sin(x * 0.55 + row * 0.4) * 0.22 + gauss(r) * 0.01; a[i * 4 + 2] = z; a[i * 4 + 3] = (0.85 - row / 32) * (0.5 + r() * 0.5);
  });

  // 7 — шесть мест: шесть ярких сгустков, вокруг тихая пыль
  make(83, (r, a, i) => {
    if (r() < 0.7) { const k = Math.floor(r() * 6), an = k / 6 * Math.PI * 2 + 0.3, R = 2.1; const s = 0.09 * Math.pow(r(), 1.5) + 0.02;
      a[i * 4] = Math.cos(an) * R * 1.85 + gauss(r) * s * 2; a[i * 4 + 1] = Math.sin(an) * R * 1.08 + gauss(r) * s * 2; a[i * 4 + 2] = Math.sin(an * 2) * 0.6 + gauss(r) * s * 2; a[i * 4 + 3] = 1.0; }
    else { a[i * 4] = gauss(r) * 3; a[i * 4 + 1] = gauss(r) * 2; a[i * 4 + 2] = gauss(r) * 2 - 1; a[i * 4 + 3] = 0.12; }
  });

  // 8 — одна точка: всё сходится в свет
  make(97, (r, a, i) => {
    const rad = Math.pow(r(), 3.2) * 1.6, th = r() * 6.283, ph = Math.acos(2 * r() - 1);
    a[i * 4] = rad * Math.sin(ph) * Math.cos(th); a[i * 4 + 1] = rad * Math.sin(ph) * Math.sin(th) * 0.9; a[i * 4 + 2] = rad * Math.cos(ph); a[i * 4 + 3] = rad < 0.15 ? 1.0 : 0.25 + (1.6 - rad) * 0.25;
  });
  return S;
}
