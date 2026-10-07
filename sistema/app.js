import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/* ==========================================================================
   Одна система частиц. Шесть состояний. Прокрутка перетекает одно в другое.
   сфера → воронка → двойная спираль → волна → число «100+» → галактика
   ========================================================================== */

const root = document.documentElement;
const canvas = document.getElementById("gl");
const Q = new URLSearchParams(location.search);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
const narrow = () => innerWidth < 860;
const lite = !Q.has("hq") && (narrow() || (navigator.hardwareConcurrency || 8) <= 4);
const N_CH = 8;
const LABELS = ["Система", "Фокус", "Архитектура", "Управление", "Результаты", "Путь", "Рядом", "Стратегия"];
const HOLD = 0.3, HOLDS = [0.18, 0.18, 0.18, 0.86, 0.18, 0.18, 0.18, 0.18], ORB_END = 0.84, ORB_STEP = 58, ORB_N = 5;                        // доля шага, пока форма стоит и текст читается
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));

/* ---------- загрузка: счётчик идёт за настоящими этапами ---------- */
const boot = { target: 0, shown: 0, el: $("#cnt") };
const stage = (v) => { boot.target = Math.max(boot.target, v); root.style.setProperty("--load", (boot.target / 100).toFixed(3)); };
(function tickBoot() {
  boot.shown += Math.max(1, Math.ceil((boot.target - boot.shown) * 0.12)) * (boot.shown < boot.target ? 1 : 0);
  if (boot.el) boot.el.textContent = String(Math.min(100, boot.shown)).padStart(3, "0");
  if (!root.classList.contains("ready")) setTimeout(tickBoot, 40);
})();
{ const bw = $(".boot .w"); if (bw) { const ring = document.createElement("div"); ring.className = "ring"; for (let n = 0; n < 20; n++) { const p = document.createElement("i"); p.style.setProperty("--n", n); ring.appendChild(p); } bw.appendChild(ring); } }
stage(12);

const setVH = () => root.style.setProperty("--vh", innerHeight * 0.01 + "px");
setVH();

const orb = { q: 0, qs: 0, cards: [], R: 0 };
/* ---------- приборы, которые работают и без сцены ---------- */
const chapters = $$(".ch"), railBtns = $$(".rail button"), numEl = $("#num"), labEl = $("#lab"), hintEl = $("#hint");
let tops = [], VHpx = innerHeight;
function measure() { tops = chapters.map((c) => c.offsetTop); VHpx = innerHeight; orb.R = Math.min(innerWidth * (innerWidth < 860 ? 0.66 : 0.34), 620); }
function rawProgress() {
  const y = scrollY; let k = 0;
  for (let i = 0; i < N_CH - 1; i++) if (y >= tops[i]) k = i;
  const span = (tops[k + 1] - tops[k]) || 1, f = Math.min(1, Math.max(0, (y - tops[k]) / span));
  return { k, f };
}
const go = (k) => scrollTo({ top: tops[k] || 0, behavior: reduce ? "auto" : "smooth" });
$$("[data-go]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); go(+b.dataset.go); }));
addEventListener("keydown", (e) => {
  if (e.target.closest("a,button,input,textarea")) return;
  const { k, f } = rawProgress(), cur = Math.round(k + f);
  if (["ArrowDown", "PageDown"].includes(e.key)) { e.preventDefault(); go(Math.min(N_CH - 1, cur + 1)); }
  if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); go(Math.max(0, cur - 1)); }
});

// подписи «печатаются» при появлении главы
const GLYPHS = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789—/";
function scramble(el) {
  if (reduce || el._busy) return; el._busy = true;
  const txt = el._txt || (el._txt = el.textContent); let n = 0; const total = 16;
  const id = setInterval(() => {
    n++; const keep = Math.floor((n / total) * txt.length);
    el.textContent = txt.slice(0, keep) + [...txt.slice(keep)].map((c) => (c === " " || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
    if (n >= total) { clearInterval(id); el.textContent = txt; el._busy = false; }
  }, 40);
}
function typeIn(el, delay = 0) {
  const txt = el.textContent; if (reduce || !txt) return; const dur = Math.min(1500, Math.max(500, 2 * txt.length + 50) * 1.6), t0 = performance.now() + delay; el.style.visibility = "hidden";
  const id = setInterval(() => { const x = (performance.now() - t0) / dur; if (x < 0) return; el.style.visibility = "";
    if (x >= 1) { el.textContent = txt; clearInterval(id); return; }
    const keep = Math.floor(x * txt.length), tail = Math.min(4, txt.length - keep);
    el.textContent = txt.slice(0, keep) + [...Array(tail)].map(() => ((Math.random() * 10) | 0)).join(""); }, 66);
}
function orbLayout(dt) {
  if (!orb.cards.length) return;
  orb.qs += (orb.q - orb.qs) * Math.min(1, dt * 6);
  const R = orb.R, stepY = innerHeight * 0.17;
  orb.cards.forEach((c, i) => {
    const d = i - orb.qs, a = d * ORB_STEP, ad = Math.abs(d);
    c.style.transform = `translate(-50%,-50%) translateY(${(d * stepY).toFixed(1)}px) translateZ(${-R}px) rotateY(${a.toFixed(2)}deg) translateZ(${R}px) rotateX(${(-d * 5).toFixed(2)}deg)`;
    c.style.opacity = (d < 0 ? Math.max(0, 1 - Math.max(0, ad - 0.25) * 1.5) : Math.max(0, 1 - Math.max(0, ad - 0.7) * 0.62)).toFixed(3);
    c.style.filter = ad < 0.5 ? "" : `brightness(${Math.max(0.4, 1 - ad * 0.38).toFixed(2)}) saturate(.8) blur(${Math.min(5, (ad - 0.5) * 2.4).toFixed(1)}px)`;
    c.style.pointerEvents = ad > 1.6 ? "none" : "";
    c.style.zIndex = String(10 - Math.round(ad * 2));
    c.classList.toggle("front", ad < 0.5);
  });
}
let curCh = -1;
function ui(k, f) {
  const raw = k + f;
  chapters.forEach((el, j) => {
    const d = raw - j, on = d > -0.4 && d < 0.9;
    if (on !== el._in) { el._in = on; el.classList.toggle("in", on); if (on) $$("[data-sc]", el).forEach((s) => setTimeout(() => scramble(s), 200)); }
    if (Math.abs(d) < 1.2) el.style.setProperty("--d", d.toFixed(3));
    if (j === 3) { el.style.setProperty("--w", Math.min(1, Math.max(0, (-d - 0.03) / 0.42)).toFixed(3)); orb.q = Math.min(1, Math.max(0, d / ORB_END)) * (ORB_N - 1); }
  });
  const c = Math.round(raw);
  if (c !== curCh) {
    curCh = c; numEl.textContent = "0" + (c + 1); labEl.textContent = LABELS[c];
    railBtns.forEach((b, i) => b.setAttribute("aria-current", i === c ? "true" : "false"));
    root.classList.toggle("last", c === N_CH - 1);
  }
  const total = (tops[N_CH - 1] || 1);
  root.style.setProperty("--prog", Math.min(1, scrollY / total).toFixed(4));
  root.classList.toggle("moved", scrollY > 30);
  if (hintEl) hintEl.textContent = scrollY < 30 ? "Листайте" : "Прокрутка " + String(Math.round(Math.min(1, scrollY / total) * 100)).padStart(2, "0") + " %";
}

// московское время в углу — настоящее
const clk = $("#clk");
const tickClock = () => { if (clk) clk.textContent = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" }).format(new Date()); };
tickClock(); setInterval(tickClock, 20000);

// курсор и «магнит» кнопки — только для мыши
const mouse = { x: 0, y: 0, sx: 0, sy: 0, px: -100, py: -100, cx: -100, cy: -100 };
const cur = $("#cur"), goBtn = $("#go"), mag = { x: 0, y: 0, tx: 0, ty: 0 };
if (fine) {
  addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1; mouse.px = e.clientX; mouse.py = e.clientY;
    cur.classList.add("on"); cur.classList.toggle("hot", !!e.target.closest("a,button"));
    if (goBtn) {
      const r = goBtn.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const inside = Math.hypot(dx, dy) < r.width * 0.7; mag.tx = inside ? dx * 0.3 : 0; mag.ty = inside ? dy * 0.3 : 0;
    }
  }, { passive: true });
  document.addEventListener("pointerleave", () => cur.classList.remove("on"));
}

/* ---------- кейс раскрывается на весь экран: растёт вся сетка вокруг выбранной карточки ---------- */
const ledger = $(".ledger"), cp = $("#cp"), CBG = ["#0b1f8a", "#0a4a5e", "#43197a", "#7a1730"];
let openCard = null;
function openCase(card, idx) {
  if (openCard || !ledger) return; openCard = card;
  const r = card.getBoundingClientRect(), lr = ledger.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const S = Math.max(innerWidth / r.width, innerHeight / r.height) * 1.2;
  const rot = narrow() ? 0 : (cx < innerWidth / 2 ? -1 : 1) * (idx === 0 || idx === 3 ? 4 : 1.5);
  card.style.setProperty("--cbg", CBG[idx]); cp.style.setProperty("--cbg", CBG[idx]);
  ledger.style.transformOrigin = `${cx - lr.left}px ${cy - lr.top}px`;
  card.classList.add("sel"); root.classList.add("opening");
  ledger.style.transform = `translate(${innerWidth / 2 - cx}px,${innerHeight / 2 - cy}px) scale(${S}) rotate(${rot}deg)`;
  const was = $(".was", card).textContent.split("·").map((x) => x.trim());
  $("#cpn").textContent = "Кейс 0" + (idx + 1); $("#cpw").textContent = $(".who", card).textContent; $("#cpr").textContent = $(".role", card).textContent;
  $("#cpb").textContent = was[0] || ""; $("#cpa").textContent = $(".big", card).textContent; $("#cpt").textContent = was[1] || "";
  const im = $("img", card), ci = $("#cpi"); ci.src = im.getAttribute("src"); ci.alt = im.alt;
  cp.hidden = false;
  setTimeout(() => { cp.classList.add("on"); typeIn($("#cpn"), 100); typeIn($("#cpw"), 300); typeIn($("#cpr"), 600); typeIn($("#cpa"), 800); typeIn($("#cpt"), 1400); root.style.overflow = "hidden"; $("#cpx").focus({ preventScroll: true }); }, reduce ? 0 : 1450);
}
function closeCase() {
  if (!openCard) return; cp.classList.remove("on"); root.style.overflow = "";
  setTimeout(() => {
    ledger.style.transform = ""; root.classList.remove("opening"); cp.hidden = true;
    const c = openCard; setTimeout(() => { c.classList.remove("sel"); openCard = null; }, reduce ? 0 : 1500);
  }, reduce ? 0 : 380);
}
$$(".case").forEach((c, idx) => {
  c.tabIndex = 0; c.setAttribute("role", "button");
  orb.cards.push(c);
  c.addEventListener("click", () => { if (Math.abs(idx - orb.qs) < 0.5) { if (c.classList.contains("next")) open("https://t.me/coachkomlevaleks", "_blank", "noopener"); else openCase(c, idx); } else scrollTo({ top: tops[3] + (tops[4] - tops[3]) * ORB_END * (idx / (ORB_N - 1)) + 2, behavior: reduce ? "auto" : "smooth" }); });
  c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); c.click(); } });
  c.addEventListener("pointermove", (e) => { const r = c.getBoundingClientRect(); c.style.setProperty("--cx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(2)); c.style.setProperty("--cy", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(2)); }, { passive: true });
});
$("#cpx") && $("#cpx").addEventListener("click", closeCase);
addEventListener("keydown", (e) => { if (e.key === "Escape") closeCase(); });

/* ---------- запуск ---------- */
let scene3d = null;
function reveal() {
  measure(); const { k, f } = rawProgress(); ui(k, f);
  stage(100);
  setTimeout(() => { root.classList.add("ready"); if (scene3d) scene3d.intro(); }, reduce ? 0 : 520);
}
function fallback() { root.classList.add("nogl"); loop2d(); reveal(); }
function loop2d() {                               // без сцены: только текст и приборы
  const f = () => { const p = rawProgress(); ui(p.k, p.f); orbLayout(0.016); requestAnimationFrame(f); }; requestAnimationFrame(f);
}

const fontsReady = Promise.race([
  Promise.all([document.fonts.load('900 80px "TTS"', "СП100+"), document.fonts.load('900 extra-expanded 80px "TTS"', "100+").catch(() => 0), document.fonts.load('500 11px "Plex"', "А0")]).then(() => document.fonts.ready),
  new Promise((r) => setTimeout(r, 3500)),
]);

fontsReady.then(() => {
  stage(40); measure();
  try { scene3d = build(); } catch (err) { console.warn("scene off:", err); scene3d = null; }
  if (!scene3d) return fallback();
  stage(80);
  scene3d.warm().then(reveal, reveal);
});

addEventListener("resize", () => {
  if (!fine && Math.abs(innerHeight - VHpx) < 160 && innerWidth === measure.w) return;   // адресная строка телефона — не повод перестраивать
  measure.w = innerWidth; setVH(); measure(); if (scene3d) scene3d.resize();
});
measure.w = innerWidth;

/* ==========================================================================
   Сцена
   ========================================================================== */
function build() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" });
  const DPR_MAX = Math.min(devicePixelRatio || 1, lite ? 1.5 : 1.75);
  let dpr = DPR_MAX;
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x06070c, 1);
  const TM = { agx: THREE.AgXToneMapping, aces: THREE.ACESFilmicToneMapping, neutral: THREE.NeutralToneMapping, none: THREE.NoToneMapping };
  renderer.toneMapping = TM[Q.get("tm")] ?? THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = +(Q.get("ex") || 1.2);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04050a);   // фон задаём сценой: так он верно переводится в линейное пространство буфера
  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);

  /* ---- сетка u×v: одни и те же точки собирают все состояния ---- */
  const U = lite ? 450 : 900, V = lite ? 130 : 220, N = U * V, TAU = Math.PI * 2;   // вдоль линии точек много, линий мало: формы читаются прядями
  const P = [0, 1, 2, 3, 4, 5, 6, 7].map(() => new Float32Array(N * 3));
  const aUV = new Float32Array(N * 2), aR = new Float32Array(N * 4), aChaos = new Float32Array(N);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  // число «100+»: точки берутся из растра настоящего шрифта
  const numPts = (() => {
    const W = 1600, H = 520, c = Object.assign(document.createElement("canvas"), { width: W, height: H }), x = c.getContext("2d", { willReadFrequently: true });
    x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "alphabetic";
    x.font = '900 400px "TTS", Arial, sans-serif';
    try { x.fontStretch = "extra-expanded"; } catch (e) {}
    if ("letterSpacing" in x) x.letterSpacing = "-10px";
    const m = x.measureText("100+"), tw = m.width, asc = m.actualBoundingBoxAscent || 290;
    const sc = Math.min(1, (W - 40) / tw); x.setTransform(sc, 0, 0, sc, W / 2, H / 2 + (asc * sc) / 2); x.fillText("100+", 0, 0); x.setTransform(1, 0, 0, 1, 0, 0);
    const d = x.getImageData(0, 0, W, H).data, pts = []; let x0 = W, x1 = 0, y0 = H, y1 = 0;
    for (let yy = 0; yy < H; yy += 2) for (let xx = 0; xx < W; xx += 2) if (d[(yy * W + xx) * 4 + 3] > 128) { pts.push(xx, yy); if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
    const w = Math.max(1, x1 - x0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, out = [];
    for (let i = 0; i < pts.length; i += 2) out.push([(pts[i] - cx) / w, (cy - pts[i + 1]) / w]);
    out.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return { pts: out, aspect: (y1 - y0) / w };
  })();

  for (let j = 0; j < V; j++) for (let i = 0; i < U; i++) {
    const k = j * U + i, u = i / (U - 1), v = j / (V - 1), o = k * 3;
    aUV[k * 2] = u; aUV[k * 2 + 1] = v;
    aR[k * 4] = rnd(); aR[k * 4 + 1] = rnd(); aR[k * 4 + 2] = rnd(); aR[k * 4 + 3] = rnd();
    { const th = u * TAU, ph = Math.acos(1 - 2 * (0.012 + v * 0.976)), R = 3.05;                       // 0 сфера: полая оболочка
      P[0][o] = R * Math.sin(ph) * Math.cos(th); P[0][o + 1] = R * Math.cos(ph); P[0][o + 2] = R * Math.sin(ph) * Math.sin(th); }
    { const hs = (n) => { const x = Math.sin((j + 1) * n) * 43758.5453; return x - Math.floor(x); }, h1 = hs(12.9898), h2 = hs(78.233), h3 = hs(37.719), h4 = hs(93.989);   // 1 пряди: разбросаны и спутаны, сходятся в один поток
      const conv = Math.min(1, Math.max(0, (u - 0.12) / 0.5)), cs = conv * conv * (3 - 2 * conv), free = 1 - cs;
      const sx = (h1 - 0.5) * 12, sy = 0.6 + h2 * 4.4, sz = (h3 - 0.5) * 10, an = h4 * TAU + u * (h2 - 0.5) * 16, amp = (0.5 + h1 * 1.3) * free;
      P[1][o] = sx * free + Math.cos(an) * amp + (h4 - 0.5) * 0.16 * cs; P[1][o + 1] = sy + (-4.9 - sy) * Math.pow(u, 0.85) + Math.sin(an * 0.7) * amp * 0.5; P[1][o + 2] = sz * free + Math.sin(an) * amp + (h1 - 0.5) * 0.16 * cs; aChaos[k] = free; }
    { const y = (v - 0.5) * 9.4, th = v * TAU * 1.6, s = 2 * u - 1, e = Math.sign(s) * Math.pow(Math.abs(s), 0.22), R = 0.9;   // 2 спираль
      P[2][o] = Math.cos(th) * e * R; P[2][o + 1] = y; P[2][o + 2] = Math.sin(th) * e * R; }
    { const y = (v - 0.5) * 13, cl = Math.pow(Math.abs(Math.sin(v * 31 + Math.sin(v * 9) * 2.2)), 2.2), q = aR[k * 4 + 1];              // 3 ось: столб из сгустков, вокруг него идут кейсы
      const r = 0.06 + (0.1 + 0.62 * cl) * Math.pow(q, 0.6), th = u * TAU * 5 + v * 14;
      P[3][o] = r * Math.cos(th); P[3][o + 1] = y; P[3][o + 2] = r * Math.sin(th); }
    { const n = numPts.pts.length || 1, q = numPts.pts[Math.min(n - 1, Math.floor(((i + j / V) / U) * n))] || [0, 0];   // 4 число
      P[4][o] = q[0]; P[4][o + 1] = q[1]; P[4][o + 2] = 0; }
    { const dip = Math.exp(-Math.pow((u - 0.28) / 0.13, 2)), up = Math.pow(Math.max(0, u - 0.36) / 0.64, 1.6);                 // 5 путь: лента уходит вниз и поднимается
      P[5][o] = -6.2 + u * 13; P[5][o + 1] = -0.9 - 0.95 * dip + 4.5 * up; P[5][o + 2] = 2.6 - u * 7 + (v - 0.5) * (1.1 + u * 2.4); }
    { const kk = u < 0.5 ? 0 : 1, uu = (kk ? u - 0.5 : u) * 2, z = 7 - v * 36, rad = 0.07 + 0.13 * aR[k * 4 + 2], an = uu * TAU;                 // 6 рядом: два потока идут вместе к одной точке
      P[6][o] = (kk ? 0.62 : -0.62) + Math.sin(v * 8 + kk * Math.PI) * 0.24 + rad * Math.cos(an); P[6][o + 1] = -1.55 + v * v * 1.9 + rad * Math.sin(an); P[6][o + 2] = z; }
    { const sx = Math.pow(u, 0.62), r = Math.pow(1 - sx, 1.35) * 1.7 * (0.25 + 0.75 * aR[k * 4 + 1]) + 0.012, th = sx * 17 + v * TAU;            // 7 всё сходится в кнопку
      P[7][o] = (1 - sx) * 6.8; P[7][o + 1] = r * Math.cos(th); P[7][o + 2] = r * Math.sin(th); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(P[0], 3));
  for (let f = 1; f < 8; f++) geo.setAttribute("p" + f, new THREE.BufferAttribute(P[f], 3));
  geo.setAttribute("aUV", new THREE.BufferAttribute(aUV, 2));
  geo.setAttribute("aR", new THREE.BufferAttribute(aR, 4));
  geo.setAttribute("aChaos", new THREE.BufferAttribute(aChaos, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 80);
  const ptsEl = $("#pts"); if (ptsEl) ptsEl.textContent = N.toLocaleString("ru-RU");

  /* ---- общий шейдер формы ---- */
  const NOISE = /* glsl */`
  vec3 m289(vec3 x){return x-floor(x*(1./289.))*289.;} vec4 m289(vec4 x){return x-floor(x*(1./289.))*289.;}
  vec4 perm(vec4 x){return m289(((x*34.)+1.)*x);} vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}
  float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=m289(i);
    vec4 p=perm(perm(perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
    float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
    vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 q0=vec3(a0.xy,h.x);vec3 q1=vec3(a0.zw,h.y);vec3 q2=vec3(a1.xy,h.z);vec3 q3=vec3(a1.zw,h.w);
    vec4 nr=tis(vec4(dot(q0,q0),dot(q1,q1),dot(q2,q2),dot(q3,q3)));q0*=nr.x;q1*=nr.y;q2*=nr.z;q3*=nr.w;
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
    return 42.*dot(m*m,vec4(dot(q0,x0),dot(q1,x1),dot(q2,x2),dot(q3,x3)));}`;
  const FORM = NOISE + /* glsl */`
  attribute vec3 p1,p2,p3,p4,p5,p6,p7; attribute vec2 aUV; attribute vec4 aR; attribute float aChaos;
  uniform float uP,uT,uPoint,uSwirl,uVel,uIntro,uRot,uOrb; uniform vec3 uNum,uBtn;
  float w0,w1,w2,w3,w4,w5,w6,w7,gTr,gW,gH;
  vec3 rotY(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
  vec3 rotZ(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
  vec3 form(){
    float i=floor(uP),f=uP-i;
    // пятнами: соседние точки уходят вместе, волна идёт по сетке
    float n=snoise(vec3(aUV.x*3.2,aUV.y*2.4,i*7.31))*.5+.5;
    float delay=.3*(n*.65+aUV.y*.35);
    float ff=clamp((f-delay)/.7,0.,1.); ff=ff*ff*ff*(ff*(ff*6.-15.)+10.);
    float pe=i+ff;
    w0=max(0.,1.-abs(pe));w1=max(0.,1.-abs(pe-1.));w2=max(0.,1.-abs(pe-2.));w3=max(0.,1.-abs(pe-3.));w4=max(0.,1.-abs(pe-4.));w5=max(0.,1.-abs(pe-5.));w6=max(0.,1.-abs(pe-6.));w7=max(0.,1.-abs(pe-7.));
    float fl=1.+.03*sin(aUV.x*44.+uT*1.3)*sin(aUV.y*19.-uT*.7)+.02*sin(aUV.x*113.-uT*2.1);     // кромка «горит» прядями
    vec3 a=rotY(position,uT*.06+uRot)*fl;
    vec3 b=p1+vec3(sin(uT*.6+aUV.y*90.+aUV.x*7.),cos(uT*.5+aUV.y*70.+aUV.x*5.),sin(uT*.4+aUV.y*50.))*.14*aChaos; b=rotY(b,uT*.05+uRot);
    vec3 c=rotY(p2,uT*.13+uRot*2.);
    vec3 d=rotY(p3,uT*.07+uRot+uOrb); d.y+=uOrb*.55;
    vec3 e=vec3(p4.xy*uNum.z+uNum.xy+(aR.xy-.5)*uNum.z*.0035,(aR.z-.5)*.1*uPoint+sin(uT*.6+p4.x*5.)*.03);
    vec3 g=p5; g.y+=sin(p5.x*.7+uT*.5)*.07*(1.+aUV.y); g=rotY(g,uRot*.3);
    vec3 g6=p6; g6.x+=sin(p6.z*.45+uT*.6)*.07; g6.y+=cos(p6.z*.3-uT*.4)*.04; g6=rotY(g6,uRot*.2);
    vec3 q7=p7; float c7=cos(uT*.5+uRot),s7=sin(uT*.5+uRot); q7.yz=vec2(c7*q7.y-s7*q7.z,s7*q7.y+c7*q7.z); float t7=p7.x/6.8; q7.y+=t7*t7*2.1; q7.z-=t7*4.5;
    vec3 g7=q7*uBtn.z+vec3(uBtn.xy,0.);
    vec3 P=a*w0+b*w1+c*w2+d*w3+e*w4+g*w5+g6*w6+g7*w7;
    gTr=sin(3.14159*ff);
    P=rotY(P,gTr*gTr*(.25+.55*n)*(mod(i,2.)<.5?1.:-1.));            // на переходе точки идут дугой, а не по прямой
    float k=gTr*gTr*uSwirl*.6+uVel*.18;
    if(k>.002){ vec3 q=vec3(aUV*3.6,uT*.14+i*3.1);
      P+=vec3(snoise(q),snoise(q+vec3(17.1,3.3,0.)),snoise(q+vec3(41.7,9.2,0.)))*k*.5; }
    vec3 j=aR.xyz-.5;
    P+=uPoint*j*.045*(1.-w4*.75);
    P+=uPoint*vec3(sin(uT*.7+aR.x*40.),cos(uT*.6+aR.y*40.),sin(uT*.5+aR.z*40.))*.018;
    P+=uPoint*w1*aChaos*(j*.07+vec3(sin(uT*.5+aR.x*50.),cos(uT*.4+aR.y*50.),sin(uT*.6+aR.z*50.))*.05);
    P+=uPoint*w2*j*.07;
    P+=uPoint*w5*j*.02;
    P+=uPoint*gTr*j*.16;
    gH=step(.84,aR.z)*uPoint;                                        // дымка вокруг формы: часть точек висит облаком и даёт объём
    P+=gH*normalize(j+vec3(.001))*(.25+aR.w*aR.w*1.9)*(1.-w4*.85)*(1.-w7*.6)*(1.-w0*.5);
    // вход: облако собирается из разлёта
    // тонкий фронт идёт от центра раз в несколько секунд: точка приподнимается и вспыхивает
    gW=pow(.5+.5*sin(-uT*.8+length(P)*1.5),140.)*(1.-w4)*(1.-gTr);
    P+=normalize(P+vec3(.0001))*gW*.1*uPoint;
    // вход: точки ссыпаются сверху на свои места
    float it=clamp(uIntro*1.55-aR.w*.55,0.,1.); it=1.-pow(1.-it,3.);
    P+=(1.-it)*vec3(j.x*5.,3.+10.*aR.w*aR.w,j.z*5.+1.5);
    return P;
  }`;

  const uni = {
    uP: { value: 0 }, uT: { value: 0 }, uSwirl: { value: reduce ? 0.2 : 1 }, uVel: { value: 0 }, uIntro: { value: reduce ? 1 : 0 }, uRot: { value: 0 }, uOrb: { value: 0 }, uBtn: { value: new THREE.Vector3(0, 0, 1) },
    uNum: { value: new THREE.Vector3(0, 0, 6) }, uScale: { value: 1 }, uFocus: { value: 7 }, uAp: { value: 1 },
    uRect: { value: new THREE.Vector4(0.5, 0.5, 0, 0) }, uYield: { value: 0 },
    cA: { value: new THREE.Color("#1233ff") }, cB: { value: new THREE.Color("#2fc0ff") }, cC: { value: new THREE.Color("#ff2f55") },
  };

  const points = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: { ...uni, uPoint: { value: 1 }, uSize: { value: lite ? 0.0135 : 0.0118 }, uOp: { value: 0.4 } },
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: FORM + /* glsl */`
      uniform float uScale,uFocus,uAp,uSize,uYield; uniform vec4 uRect; uniform vec3 cA,cB,cC;
      varying vec3 vC; varying float vA; varying float vS;
      void main(){
        vec3 P=form(); vec4 mv=modelViewMatrix*vec4(P,1.); gl_Position=projectionMatrix*mv;
        float z=max(.2,-mv.z);
        float hot=0.;
        float solid=0.;
        float s=uSize*(.88+aR.w*.24)*(1.+gW*1.2)*(1.+.2*sin(uT*5.+aR.x*60.))*(aR.y>.98?2.2:1.);
        float base=s*uScale/z;
        float coc=abs(z-uFocus)*uAp*uScale*.0011;
        float size=max(1.,base+coc);
        float en=clamp(base*base/(size*size),0.,1.);
        float fog=exp(-max(0.,z-uFocus)*mix(.07,.018,w3));
        float back=smoothstep(-1.3,2.3,z-uFocus);
        float vol=mix(mix(1.3,.45,back),1.,max(max(max(w3,w4),max(w5,w6)),w7));
        vec3 vd=normalize(mv.xyz);
        float rim0=pow(1.-abs(dot(normalize((modelViewMatrix*vec4(normalize(position),0.)).xyz),vd)),2.6);        // сфера: светится только кромка
        float rim1=pow(1.-abs(dot(normalize((modelViewMatrix*vec4(P.x,0.,P.z,0.)).xyz+vec3(0.,0.,1e-4)),vd)),1.5);   // воронка: края ярче тела
        float shape=w0*(.012+rim0*2.6)+w1*mix(.2,.5,aChaos)+w2*.55+w3*.5+w4*${narrow() ? ".15" : ".42"}+w5*.55+w6*.36+w7*${narrow() ? ".45" : ".8"};
        vA=mix(en,sqrt(en),.2)*fog*vol*shape*mix(1.,.5,gH)*mix(1.25,.7,smoothstep(-2.5,3.,z-uFocus));
        vS=solid*smoothstep(.45,.9,base/size)*smoothstep(3.,7.,size);
        // сцена уступает тексту: внутри блока точки тише и мельче
        vec2 uv=gl_Position.xy/gl_Position.w*.5+.5;
        vec2 dd=abs(uv-uRect.xy)-uRect.zw; float ins=1.-smoothstep(0.,.17,length(max(dd,0.)));
        float y=ins*uYield;
        vA*=mix(1.,.1,y); size*=mix(1.,.7,y);
        gl_PointSize=min(size,uScale*.2);
        // цвет стоит на форме по месту, а не пятнами: как в образце
        vec3 RED=vec3(1.,.03,.06), BLU=vec3(.004,.06,.75), CY=vec3(.11,.66,.92), ICE=vec3(.72,.95,1.), DEEP=vec3(.004,.008,.11);
        float sy=clamp(position.y/3.05*.5+.5,0.,1.);
        vec3 c0=mix(mix(CY,BLU,smoothstep(.05,.5,sy)),RED,smoothstep(.55,.92,sy));
        float h1c=fract(sin(aUV.y*913.7)*43758.5); vec3 c1=mix(mix(mix(BLU,CY,h1c),RED,step(.86,h1c)*aChaos),mix(CY,ICE,.6),smoothstep(.35,.9,1.-aChaos));
        float st=smoothstep(.55,1.,abs(aUV.x*2.-1.));
        vec3 c2=mix(BLU,mix(CY,ICE,.55),st);
        float s3=fract(aUV.y*4.+aR.y*.15); vec3 c3=mix(mix(BLU,CY,smoothstep(.0,.5,s3)),mix(ICE,vec3(.62,.4,1.),aR.x),smoothstep(.55,1.,aR.y))+RED*smoothstep(.93,1.,aR.z)*.8;
        vec3 c4=mix(CY,ICE,.6);
        vec3 c5=mix(mix(RED,BLU,smoothstep(.2,.42,aUV.x)),mix(CY,ICE,.5),smoothstep(.5,.95,aUV.x));
        vec3 c6=mix(aUV.x<.5?mix(BLU,CY,.75):mix(RED,vec3(1.,.42,.5),.35),ICE,smoothstep(.55,1.,aUV.y)*.8);
        vec3 c7=mix(mix(BLU,CY,smoothstep(0.,.5,aUV.x)),vec3(1.,.8,.5),smoothstep(.55,1.,aUV.x));
        vec3 col=c0*w0+c1*w1+c2*w2+c3*w3+c4*w4+c5*w5+c6*w6+c7*w7;
        vC=col*(.9+.2*aR.x)*1.7;
      }`,
    fragmentShader: /* glsl */`
      uniform float uOp; varying vec3 vC; varying float vA; varying float vS;
      void main(){ vec2 q=gl_PointCoord*2.-1.; q.y=-q.y; float m=dot(q,q); if(m>1.)discard;
        float d=sqrt(m); float a=smoothstep(1.,0.,d); a=a*a*(1.+a*.9);
        vec3 N=vec3(q,sqrt(1.-m));
        float diff=max(0.,dot(N,vec3(-.47,.66,.59)));
        float spec=pow(max(0.,dot(N,vec3(-.29,.48,.83))),26.);
        float bead=smoothstep(1.,.8,d)*(.05+.7*diff*diff+.12*diff)+spec*1.15;
        gl_FragColor=vec4(vC*mix(a,bead,vS)*vA*uOp,1.); }`,
  }));
  points.frustumCulled = false; scene.add(points);
  points.material.uniforms.uOp.value = +(Q.get("op") || (lite ? 0.95 : 0.8));

  /* ---- структурные грани: линии по той же сетке ---- */
  function makeLines(rowStep, colStep, op, isCol) {
    const idx = [];
    if (!isCol) { for (let j = 0; j < V; j += rowStep) for (let i = 0; i < U - 1; i++) idx.push(j * U + i, j * U + i + 1); }
    else {
      for (let i = 0; i < U; i += colStep) for (let j = 0; j < V - 1; j++) idx.push(j * U + i, (j + 1) * U + i);
      if ((U - 1) % colStep) for (let j = 0; j < V - 1; j++) idx.push(j * U + U - 1, (j + 1) * U + U - 1);
    }
    const g = new THREE.BufferGeometry();
    for (const n of ["position", "p1", "p2", "p3", "p4", "p5", "p6", "p7", "aUV", "aR", "aChaos"]) g.setAttribute(n, geo.getAttribute(n));
    g.setIndex(idx); g.boundingSphere = geo.boundingSphere;
    const m = new THREE.ShaderMaterial({
      uniforms: { ...uni, uPoint: { value: 0 }, uOp: { value: op }, uCol: { value: isCol ? 0 : 1 } },
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      vertexShader: FORM + /* glsl */`
        uniform float uFocus,uCol,uAp,uYield; uniform vec4 uRect; uniform vec3 cA,cB; varying vec3 vC; varying float vA;
        void main(){ vec3 P=form(); vec4 mv=modelViewMatrix*vec4(P,1.); gl_Position=projectionMatrix*mv; float z=-mv.z;
          float coc=abs(z-uFocus)*uAp;
          vA=(1.-w1*aChaos*.3)*(1.-gTr*.85)*(1.-w4)*exp(-max(0.,z-uFocus)*mix(.11,.03,w3))*smoothstep(.3,1.6,z)/(1.+coc*coc*.9);
          vA*=uIntro*uIntro*uIntro;
          vec2 uv=gl_Position.xy/gl_Position.w*.5+.5; vec2 dd=abs(uv-uRect.xy)-uRect.zw; vA*=mix(1.,.08,(1.-smoothstep(0.,.17,length(max(dd,0.))))*uYield);
          vC=mix(cA,cB,clamp(.5+P.y*.2,0.,1.))*1.3; vA*=(1.-w0)*(1.+w5*1.4)*(1.-w7*.8); }`,
      fragmentShader: /* glsl */`uniform float uOp; varying vec3 vC; varying float vA; void main(){ gl_FragColor=vec4(vC*vA*uOp,1.); }`,
    });
    const l = new THREE.LineSegments(g, m); l.frustumCulled = false; l.userData.op = op; scene.add(l); return l;
  }
  const lineSets = [makeLines(Math.max(2, Math.round(V / 28)), 0, 0.34, false), makeLines(0, Math.round(U / 16), 0.1, true)];

  /* ---- воздух: дальняя пыль и редкое ближнее боке ---- */
  {
    const M = lite ? 420 : 620, pos = new Float32Array(M * 3), sz = new Float32Array(M);
    for (let i = 0; i < M; i++) {
      const near = i < 22, r = near ? 2.6 + rnd() * 3 : 9 + rnd() * 26, th = rnd() * TAU, ph = Math.acos(2 * rnd() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.cos(ph) * 0.65; pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) + (near ? 3.2 : 0);
      sz[i] = near ? 0.07 + rnd() * 0.05 : 0.01 + rnd() * 0.022;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aS", new THREE.BufferAttribute(sz, 1));
    const dust = new THREE.Points(g, new THREE.ShaderMaterial({
      uniforms: { uScale: uni.uScale, uFocus: uni.uFocus, uT: uni.uT, uIntro: uni.uIntro },
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */`attribute float aS; uniform float uScale,uFocus,uT,uIntro; varying float vA; varying float vB;
        void main(){ vec3 p=position; p.y+=sin(uT*.12+position.x*.7)*.25; p.x+=cos(uT*.09+position.z*.5)*.25;
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; float z=max(.3,-mv.z);
          float base=aS*uScale/z; float coc=max(0.,uFocus-z)*uScale*.012; float size=max(1.2,base+coc);
          gl_PointSize=min(size,uScale*.15); vB=clamp(coc/(base+.001),0.,6.);
          vA=clamp(base*base/(size*size),0.,1.)*(z>uFocus? .6*exp(-(z-uFocus)*.03) : .28)*smoothstep(.4,1.5,z)*uIntro; }`,
      fragmentShader: /* glsl */`varying float vA; varying float vB;
        void main(){ float d=length(gl_PointCoord-.5); if(d>.5)discard;
          float soft=smoothstep(.5,.0,d);
          gl_FragColor=vec4(mix(vec3(.5,.68,1.),vec3(.2,.9,1.),clamp(vB,0.,1.))*soft*soft*vA,1.); }`,
    }));
    dust.frustumCulled = false; scene.add(dust);
  }



  /* ---- постобработка: свечение в HDR, линза, тональная кривая в самом конце ---- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), +(Q.get("bs") || (lite ? 0.42 : 0.5)), +(Q.get("br") || 0.3), +(Q.get("bt") || 0.42));
  composer.addPass(bloom);
  const lens = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uCA: { value: 0.01 }, uL: { value: new THREE.Vector2(0.5, 0.5) }, uG: { value: 0.3 },
      uT: uni.uT, uAsp: { value: 1 }, uBlade: { value: -1 }, uHue: { value: 0 }, uOpen: { value: 0 }, uVis: { value: reduce ? 1 : 0 }, uFlash: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uCA,uG,uT,uAsp,uBlade,uHue,uOpen,uVis,uFlash; uniform vec2 uL; varying vec2 vUv;
      float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
      float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y); }
      void main(){
        vec2 uv0=vUv; vec2 c=vUv-.5;
        // кейс открыт: сцена уходит в глубину через круг с рваным краем
        float rr=length(c*vec2(uAsp,1.)); float edge=uOpen*1.25+(vn(c*9.+uT*.3)-.5)*.16*uOpen;
        float inside=smoothstep(edge,edge-.1,rr)*step(.001,uOpen);
        uv0=(uv0-.5)/(1.+uOpen*inside)+.5;
        // клинок: наклонная полоса стекла едет снизу вверх на переходе глав
        float k=-.14*uAsp; float sl=uv0.y+(uv0.x-.5)*k; float bw=.05; float bd=(sl-uBlade)/bw;
        float band=(1.-smoothstep(.75,1.,abs(bd)))*step(-.5,uBlade);
        vec2 nrm=normalize(vec2(k,1.));
        uv0+=nrm*band*.03*(bd*.6-1.)*.9;
        vec2 o=c*dot(c,c)*uCA+nrm*band*.004;
        vec3 col=vec3(texture2D(tDiffuse,uv0+o).r,texture2D(tDiffuse,uv0).g,texture2D(tDiffuse,uv0-o).b);
        vec2 d=(uv0-uL)*(.22/${lite ? "12." : "20."}); vec2 uv=uv0; float il=1.; vec3 ray=vec3(0.);
        for(int i=0;i<${lite ? 12 : 20};i++){ uv-=d; ray+=texture2D(tDiffuse,uv).rgb*il; il*=${lite ? ".88" : ".93"}; }
        col+=ray*(${lite ? ".07" : ".043"})*(uG+uFlash*1.6);
        // стекло: чуть светлее внутри, тонкие блики по кромкам
        float rim=smoothstep(.72,.92,abs(bd))*band;
        col=col*(1.+band*.35)+vec3(.55,.8,1.)*(band*.012+rim*.07)+vec3(1.,.35,.5)*rim*.03*step(0.,bd);
        // цветные углы: оттенок свой у каждой главы и медленно плывёт
        float n=vn(vUv*2.2+vec2(uT*.03,-uT*.02)); float r=length(c)*1.42; float hh=uHue+(n-.5)*.5+sin(uT*.07)*.12;
        vec3 tint=mix(vec3(.05,.42,.38),vec3(.26,.14,.55),smoothstep(.2,.8,hh)); tint=mix(tint,vec3(.5,.08,.2),smoothstep(.85,1.3,hh));
        float cw=1.12*smoothstep(.02,.81,r)*(.35+n*.9); col+=tint*(.008+cw*cw*.11)*mix(1.,.45,vUv.y*step(.5,vUv.x));
        col*=1.-inside*.8*uOpen; col*=mix(1.,.3,uOpen*uOpen*uOpen);
        col*=smoothstep(0.,.5,uVis); col+=vec3(.9,.95,1.)*uFlash*.05*(1.-r*.6);
        col+=(h21(vUv*vec2(1973.,1289.)+fract(uT)*31.)-.5)*.022;
        gl_FragColor=vec4(max(col,0.),1.); }`,
  });
  composer.addPass(lens);
  composer.addPass(new OutputPass());

  /* ---- камера по главам: [позиция], [цель] ---- */
  const CAM = {
    wide: [
      [[0, 0, 7.9], [0, 0, 0]],
      [[0.9, -2.6, 7.4], [-2.6, 0.5, 0]],
      [[-0.4, 0.2, 7.6], [2.3, 0, 0]],
      [[0, 0.1, 9.4], [-2.6, 0, 0]],
      [[0, 0, 9], [0, 0, 0]],
      [[0, 0.9, 10], [-3.2, 0.9, 0]],
      [[0, 0.5, 9], [-2.7, 0.1, 0]],
      [[0, 0, 9.5], [0, 0, 0]],
    ],
    tall: [
      [[0, 0, 12.6], [0, 0.2, 0]],
      [[0, -2.5, 11.5], [0, -2.2, 0]],
      [[0, 0, 12], [0, -3.4, 0]],
      [[0, 0.2, 11], [0, 1.6, 0]],
      [[0, 0, 9], [0, 0, 0]],
      [[0, 0.5, 17], [0, -4.2, 0]],
      [[0, 0.4, 11], [0, -2.6, 0]],
      [[0, 0, 12], [0, 0, 0]],
    ],
  };
  const v3 = (a) => new THREE.Vector3(...a);
  const keys = () => (innerWidth / innerHeight < 0.85 ? CAM.tall : CAM.wide).map(([p, t]) => [v3(p), v3(t)]);
  let K = keys();
  const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3(), tmp = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3();
  const numEl100 = $(".n100"), yields = chapters.map((c) => $(".y", c));
  let W = 1, H = 1;

  function resize() {
    W = canvas.clientWidth || innerWidth; H = canvas.clientHeight || innerHeight;
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false); composer.setPixelRatio(dpr); composer.setSize(W, H);
    bloom.resolution.set(W * (lite ? 0.5 : 1), H * (lite ? 0.5 : 1));
    lens.uniforms.uAsp.value = W / H; camera.aspect = W / H; camera.fov = W / H < 0.85 ? 52 : 46; camera.updateProjectionMatrix();
    uni.uScale.value = (H * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    K = keys();
  }

  /* ---- цикл ---- */
  const clock = new THREE.Clock();
  let t = 0, running = true, pS = 0, vel = 0, lastY = scrollY, intro = reduce ? 1 : 0, introGo = false, yieldS = 0;
  let acc = 0, frames = 0, cool = 0;
  const rect = { x: 0.5, y: 0.5, w: 0, h: 0 };
  const HUE = [0.15, 0.75, 0.3, 0.9, 0.2, 1.1, 0.5, 0.25], drag = { on: false, x: 0, dx: 0, d: 0, rot: 0 };
  let sv = 0, svBusy = false;
  if (fine && !reduce) {
    addEventListener("pointerdown", (e) => { if (e.button === 0 && !e.target.closest("a,button,.case,.cp")) { drag.on = true; drag.x = e.clientX; } });
    addEventListener("pointermove", (e) => { if (drag.on) { drag.dx += e.clientX - drag.x; drag.x = e.clientX; root.classList.add("drag"); } }, { passive: true });
    addEventListener("pointerup", () => { drag.on = false; root.classList.remove("drag"); });
  }
  // след курсора: короткие белые штрихи-кометы
  const tc = $("#trail"), tx = tc && fine && !reduce ? tc.getContext("2d") : null, sparks = []; let tpx = -1, tpy = -1, tW = 0, tH = 0;
  function trail(dt) {
    if (!tx) return;
    if (tW !== W || tH !== H) { tW = W; tH = H; tc.width = W; tc.height = H; }
    if (tpx >= 0) { const mx = mouse.px - tpx, my = mouse.py - tpy, sp = Math.hypot(mx, my);
      if (sp > 5 && sparks.length < 260) for (let q = 0; q < Math.min(4, sp / 9); q++) { const a = Math.atan2(my, mx) + (Math.random() - 0.5) * 1.5, v = 30 + Math.random() * 110;
        sparks.push({ x: mouse.px + (Math.random() - 0.5) * 14, y: mouse.py + (Math.random() - 0.5) * 14, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 0, m: 1 + Math.random() * 0.5 }); } }
    tpx = mouse.px; tpy = mouse.py;
    tx.clearRect(0, 0, tW, tH); if (!sparks.length) return;
    tx.lineCap = "round"; tx.lineWidth = 1.2;
    for (let q = sparks.length - 1; q >= 0; q--) { const p = sparks[q]; p.l += dt; if (p.l > p.m) { sparks.splice(q, 1); continue; }
      const kq = 1 - p.l / p.m; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.97; p.vy *= 0.97;
      tx.strokeStyle = `rgba(235,244,255,${(kq * kq * 0.75).toFixed(3)})`; tx.beginPath(); tx.moveTo(p.x, p.y); tx.lineTo(p.x - p.vx * 0.07, p.y - p.vy * 0.07); tx.stroke(); }
  }

  function frame() {
    if (!running) return;
    const raw = clock.getDelta(), dt = Math.min(0.05, raw), dte = Math.min(0.25, raw);
    t += dt * (reduce ? 0.3 : 1);

    // прокрутка → состояние: сначала форма стоит (HOLD), потом медленно перетекает
    const { k, f } = rawProgress();
    const target = k + ss(HOLDS[k], 1, f);
    pS = damp(pS, target, 2.5, dte); if (Math.abs(target - pS) < 0.0003) pS = target;
    const i = Math.min(N_CH - 2, Math.floor(pS)), h = pS - i, env = Math.sin(Math.PI * Math.min(1, h));
    uni.uP.value = pS; uni.uT.value = t;

    // скорость прокрутки: быстро нарастает, медленно отпускает
    const dy = (scrollY - lastY) / Math.max(1, VHpx); lastY = scrollY;
    const v = Math.min(1, Math.abs(dy) * 14); vel = damp(vel, v, v > vel ? 9 : 2.2, dte);
    uni.uVel.value = reduce ? 0 : vel;

    if (introGo && intro < 1) { intro = Math.min(1, intro + dte / 4.6); const x = ss(0, 1, Math.min(1, intro * 1.25)), e = 1 - Math.pow(1 - x, 2.4); uni.uIntro.value = e; lens.uniforms.uVis.value = e; lens.uniforms.uFlash.value = Math.exp(-Math.pow((intro - 0.66) / 0.06, 2)); if (intro >= 1) lens.uniforms.uFlash.value = 0; }

    mouse.sx = damp(mouse.sx, mouse.x, 2.2, dte); mouse.sy = damp(mouse.sy, mouse.y, 2.2, dte);
    camPos.lerpVectors(K[i][0], K[i + 1][0], h); camTgt.lerpVectors(K[i][1], K[i + 1][1], h);
    camPos.z += env * (i === 2 ? -2.6 : -0.9) - (1 - uni.uIntro.value) * 6.2; camPos.y += env * 0.18;   // после спирали камера пролетает сквозь облако
    camPos.x += Math.sin(t * 0.19) * 0.5; camPos.y += Math.cos(t * 0.15) * 0.2; camPos.z += Math.sin(t * 0.11) * 0.25;
    camera.position.copy(camPos); camera.lookAt(camTgt);
    right.setFromMatrixColumn(camera.matrixWorld, 0); up.setFromMatrixColumn(camera.matrixWorld, 1);
    const wNum = Math.max(0, 1 - Math.abs(pS - 4)), par = 1 - wNum * 0.7;
    camera.position.addScaledVector(right, mouse.sx * 0.95 * par).addScaledVector(up, -mouse.sy * 0.6 * par);
    camera.lookAt(camTgt); camera.rotation.z += mouse.sx * -0.01 * par;

    const wWave = Math.max(0, 1 - Math.abs(pS - 3));
    const dist = tmp.copy(camera.position).sub(camTgt).length();
    uni.uFocus.value = dist;
    uni.uAp.value = 1.0 + env * 0.55 - wNum * 0.6;

    // число «100+» садится ровно в свой блок на странице
    if (wNum > 0.001 && numEl100) {
      const r = numEl100.getBoundingClientRect(), wpp = (2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) / H;
      const wpx = Math.min(r.width * 0.94, (r.height * 1.02) / numPts.aspect);
      uni.uNum.value.set((r.left + r.width / 2 - W / 2) * wpp, -(r.top + r.height / 2 - H / 2) * wpp, wpx * wpp);
    }

    const wBtn = Math.max(0, 1 - Math.abs(pS - 7));
    if (wBtn > 0.001 && goBtn) {
      const r = goBtn.getBoundingClientRect(), wpp = (2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) / H;
      uni.uBtn.value.set((r.left + r.width / 2 - W / 2) * wpp, -(r.top + r.height / 2 - H / 2) * wpp, W / H < 0.85 ? 0.8 : 1.55);
      goBtn.style.setProperty("--glow", wBtn.toFixed(3));
    }
    // текст активной главы: сцена под ним гаснет
    const el = yields[f < 0.66 ? k : Math.min(N_CH - 1, k + 1)];
    if (el) {
      const r = el.getBoundingClientRect();
      rect.x = (r.left + r.width / 2) / W; rect.y = 1 - (r.top + r.height / 2) / H; rect.w = r.width / W / 2; rect.h = r.height / H / 2;
      uni.uRect.value.set(rect.x, rect.y, rect.w, rect.h);
    }
    yieldS = damp(yieldS, (1 - env * 0.6) * (1 - wNum), 3, dte); uni.uYield.value = yieldS * uni.uIntro.value;

    { const w0 = Math.max(0, 1 - Math.abs(pS)), w4 = Math.max(0, 1 - Math.abs(pS - 4)); lens.uniforms.uG.value = reduce ? 0.15 : 0.3 + w0 * 0.55 + w4 * (lite || narrow() ? 0.05 : 0.35); }
    lens.uniforms.uCA.value = reduce ? 0 : 0.008 + env * 0.012 + vel * 0.012;
    if (intro >= 1) lens.uniforms.uFlash.value = reduce ? 0 : Math.exp(-Math.pow((pS - 3.93) / 0.05, 2)) * Math.min(1, Math.abs(target - pS) * 6) * 0.8;
    lens.uniforms.uHue.value = HUE[i] + (HUE[i + 1] - HUE[i]) * h;
    lens.uniforms.uOpen.value = damp(lens.uniforms.uOpen.value, root.classList.contains("opening") ? 1 : 0, root.classList.contains("opening") ? 2.2 : 4.5, dte);
    drag.d = drag.d + (drag.dx - drag.d) * 0.07; drag.dx = 0; drag.rot += drag.d * 0.0025; uni.uRot.value = drag.rot;
    { const tot = Math.max(1, tops[N_CH - 1] || 1), raw = Math.max(-3, Math.min(3, 1500 * (dy * VHpx) / tot)); sv += (raw - sv) * 0.1;
      root.style.setProperty("--sv", (reduce ? 0 : sv).toFixed(3));
      if (Math.abs(sv) > 1.1 && !svBusy) { svBusy = true; $$(".top .name, #lab, .top .cta").forEach(scramble); setTimeout(() => (svBusy = false), 900); } }
    trail(dte);

    // «магнит» кнопки и курсор
    if (fine) {
      mouse.cx = damp(mouse.cx, mouse.px, 14, dte); mouse.cy = damp(mouse.cy, mouse.py, 14, dte);
      cur.style.transform = `translate3d(${mouse.cx.toFixed(1)}px,${mouse.cy.toFixed(1)}px,0)`;
      mag.x = damp(mag.x, mag.tx, 7, dte); mag.y = damp(mag.y, mag.ty, 7, dte);
      if (goBtn) goBtn.style.translate = `${mag.x.toFixed(1)}px ${mag.y.toFixed(1)}px`;
    }
    root.style.setProperty("--mx", mouse.sx.toFixed(4)); root.style.setProperty("--my", mouse.sy.toFixed(4));
    ui(k, f); orbLayout(dte); uni.uOrb.value = -orb.qs * ORB_STEP * Math.PI / 180;
    composer.render();

    // держим плавность: меряем кадр, шагаем плотностью пикселей
    acc += raw; frames++; cool -= raw;
    if (frames >= 50) {
      const ms = (acc / frames) * 1000; acc = 0; frames = 0;
      if (cool <= 0 && !Q.has("fix")) {
        if (ms > 24 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); resize(); cool = 2.5; }
        else if (ms < 12.5 && dpr < DPR_MAX) { dpr = Math.min(DPR_MAX, dpr + 0.25); resize(); cool = 4; }
      }
    }
    requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) { clock.getDelta(); lastY = scrollY; requestAnimationFrame(frame); } });
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); running = false; root.classList.add("nogl"); loop2d(); });
  canvas.addEventListener("webglcontextrestored", () => location.reload());

  // доводка к собранному кадру, когда прокрутка остановилась рядом с главой
  if (fine && !reduce) {
    let idle = 0;
    addEventListener("scroll", () => {
      clearTimeout(idle);
      idle = setTimeout(() => {
        const y = scrollY; let best = -1, bd = 1e9;
        tops.forEach((tp, j) => { const d = Math.abs(y - tp); if (d < bd) { bd = d; best = j; } });
        if (bd > 2 && bd < VHpx * 0.2) scrollTo({ top: tops[best], behavior: "smooth" });
      }, 420);
    }, { passive: true });
  }

  resize();
  { const p = rawProgress(); pS = p.k + ss(HOLDS[p.k], 1, p.f); }
  if (Q.has("p")) { /* служебное: зафиксировать состояние для снимков */ }
  return {
    resize,
    warm: () => (renderer.compileAsync ? renderer.compileAsync(scene, camera).then(() => { composer.render(); }) : Promise.resolve(composer.render())),
    intro: () => { introGo = true; requestAnimationFrame(frame); },
  };
}
