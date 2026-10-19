// Сезон роста — главы, прокрутка и приборы. Сцена-фильм — в film.js.
import Lenis from "./lib/lenis.mjs";
import { createFilm } from "./film.js";

const Q = new URLSearchParams(location.search);
const root = document.documentElement;
const MOB = matchMedia("(max-width: 860px)").matches;
const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FIX = Q.has("fix");

// ---------- загрузка: счётчик идёт за настоящими этапами ----------
const lnEl = document.getElementById("ln");
let loadShown = 0, loadTarget = 0;
const setLoad = (v) => { loadTarget = Math.max(loadTarget, v); };
(function tickLoad() { loadShown += (loadTarget - loadShown) * 0.12; lnEl.textContent = String(Math.round(loadShown)).padStart(3, "0"); if (loadShown < 99.5) requestAnimationFrame(tickLoad); else lnEl.textContent = "100"; })();
function ready() { setLoad(100); setTimeout(() => { root.classList.add("ready"); window.__ready = true; }, 300); }
document.fonts.ready.then(() => setLoad(35));

// ---------- заголовки: буквы приходят по одной (размытие → резкость) ----------
function splitLetters(h) {
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w.replace(/ /g, " "))); return; }
          const word = document.createElement("span"); word.className = "wd";
          [...w].forEach((ch) => { const s = document.createElement("span"); s.className = "lt"; s.style.setProperty("--i", i++); s.textContent = ch; word.appendChild(s); });
          frag.appendChild(word);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(h);
}
document.querySelectorAll("h1,h2").forEach(splitLetters);

// ---------- главы ----------
const chapters = [...document.querySelectorAll(".ch")];
const meta = chapters.map((c) => ({ el: c, name: c.dataset.name, shape: +c.dataset.shape, side: c.dataset.side, weeks: +c.dataset.weeks || 0, pulse: !!c.dataset.pulse, strip: !!c.dataset.strip, box: c.querySelector(".box, .cwrap") }));
// камера по главам: отъезд, высота, куда смотрит — между главами она едет непрерывно
const CAM = [
  { z: 10, y: 0, ly: 0 }, { z: 9.2, y: 0.5, ly: 0 }, { z: 8.4, y: 1.5, ly: -1.3 }, { z: 7.6, y: 0, ly: 0 }, { z: 8.4, y: 0.3, ly: 0 },
  { z: 6.6, y: 0, ly: 0 }, { z: 5.0, y: 0.2, ly: -0.3 }, { z: 7.4, y: -0.25, ly: -0.9 }, { z: 9.4, y: 0, ly: 0 }, { z: 8.2, y: 0, ly: 0 },
];
let tops = [], hts = [], VH = innerHeight;
function measure() { VH = innerHeight; tops = chapters.map((c) => c.getBoundingClientRect().top + scrollY); hts = chapters.map((c) => c.offsetHeight); }
measure();
let lastW = innerWidth, lastH = innerHeight;
addEventListener("resize", () => { if (MOB && innerWidth === lastW && Math.abs(innerHeight - lastH) < 160) return; lastW = innerWidth; lastH = innerHeight; measure(); film && film.resize(); });
function where(y) {
  let i = 0; for (let k = 0; k < chapters.length; k++) if (y >= tops[k] - 1) i = k;
  const span = Math.max(1, hts[i] - VH); const f = Math.min(1, Math.max(0, (y - tops[i]) / span));
  return { i, f };
}
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;
const SIDE_X = { L: 2.35, R: -2.35, C: 0 };

// ---------- приборы ----------
const cn = document.getElementById("cn"), cl = document.getElementById("cl"), prog = document.getElementById("prog"), rail = document.getElementById("rail");
meta.forEach((m, k) => { const a = document.createElement("a"); a.href = "#" + m.el.id; a.setAttribute("aria-label", m.name); a.addEventListener("click", (e) => { e.preventDefault(); goTo(k); }); rail.appendChild(a); });
const railA = [...rail.children];
let curCh = -1;
function setChapter(i) {
  if (i === curCh) return; curCh = i;
  meta.forEach((m, k) => m.el.classList.toggle("on", k === i));
  railA.forEach((a, k) => a.classList.toggle("on", k === i));
  cn.textContent = String(i + 1).padStart(2, "0"); cl.textContent = meta[i].name;
}
const clock = document.getElementById("clock");
const fmt = new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow", hour: "2-digit", minute: "2-digit" });
const tickClock = () => { clock.textContent = "МСК " + fmt.format(new Date()); }; tickClock(); setInterval(tickClock, 15000);

const weeks = [...document.querySelectorAll(".wk")];
let wkOn = -1;
function setWeek(n) { if (n === wkOn) return; wkOn = n; weeks.forEach((w, k) => w.classList.toggle("act", k === n)); }

const strip = document.getElementById("strip");
if (!MOB) for (let k = 0; k < 18; k++) { const im = new Image(); im.src = `./cases/c${String(k).padStart(2, "0")}.webp`; im.alt = "Кейс клиента"; im.loading = "lazy"; im.decoding = "async"; strip.appendChild(im); }

const cur = document.getElementById("cur");
let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, nmx = 0, nmy = 0, gmx = 9, gmy = 9;
addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; nmx = mx / innerWidth - 0.5; nmy = my / innerHeight - 0.5; }, { passive: true });
if (FINE) {
  document.querySelectorAll("a,button").forEach((el) => { el.addEventListener("pointerenter", () => cur.classList.add("hot")); el.addEventListener("pointerleave", () => cur.classList.remove("hot")); });
  document.querySelectorAll(".mag").forEach((el) => {
    el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.32}px)`; });
    el.addEventListener("pointerleave", () => { el.style.transition = "transform .6s cubic-bezier(.22,1,.36,1)"; el.style.transform = ""; setTimeout(() => (el.style.transition = ""), 600); });
  });
}

// ---------- прокрутка ----------
const lenis = REDUCED ? null : new Lenis({ lerp: 0.08, wheelMultiplier: 0.85, smoothWheel: true });
function goTo(k) { const y = tops[k] + (k ? VH * 0.05 : 0); lenis ? lenis.scrollTo(y, { duration: 2.2 }) : scrollTo({ top: y, behavior: "smooth" }); }
document.querySelectorAll('a[href^="#c"]').forEach((a) => a.addEventListener("click", (e) => { const k = chapters.findIndex((c) => "#" + c.id === a.getAttribute("href")); if (k > -1) { e.preventDefault(); goTo(k); } }));

// ---------- фильм ----------
let film = null;
const N = MOB ? 32000 : 70000;
let DPR = Math.min(MOB ? 1.5 : 1.75, devicePixelRatio || 1);
function fallback() { root.classList.add("nogl"); document.getElementById("gl").style.display = "none"; film = null; }
try {
  const c = document.createElement("canvas");
  if (!(c.getContext("webgl2") || c.getContext("webgl"))) throw 0;
  film = createFilm(document.getElementById("gl"), { N, DPR, mobile: MOB });
  document.getElementById("gl").addEventListener("webglcontextlost", (e) => { e.preventDefault(); fallback(); });
  document.getElementById("pts").textContent = N.toLocaleString("ru-RU") + " точек";
  setLoad(70);
} catch (e) { fallback(); }

function boxRect(m) {
  const b = m.box; if (!b) return { x: 9, y: 9, z: 9, w: 9 };
  const r = b.getBoundingClientRect(), W = innerWidth, H = innerHeight;
  return { x: (r.left - 24) / W * 2 - 1, y: 1 - (r.bottom + 24) / H * 2, z: (r.right + 24) / W * 2 - 1, w: 1 - (r.top - 24) / H * 2 };
}

// состояние фильма догоняет прокрутку с инерцией — как scrub у GSAP
const st = { shape: 0, x: MOB ? 0 : SIDE_X.L, y: MOB ? 1.9 : 0, scale: MOB ? 0.62 : 1, camZ: 10, camY: 0, lookY: 0, time: 0, pulse: -9, pulseAmt: 0, rx: 0, ry: 0, rz: -0.32, mx: 9, my: 9, rect: null };
let spin = 0, tPrev = performance.now(), running = true, acc = 0, accN = 0;
window.__perf = { ms: 0 };
import("three").then((THREE) => { st.rect = new THREE.Vector4(9, 9, 9, 9); });

function frame(now) {
  if (!running) return;
  const dt = Math.min(0.05, (now - tPrev) / 1000); tPrev = now;
  const t0 = performance.now();
  lenis && lenis.raf(now);
  const y = scrollY, { i, f } = where(y);
  setChapter(i);
  const last = meta.length - 1, m = meta[i], n = meta[Math.min(i + 1, last)];
  const mix = i < last ? sstep(m.weeks || m.strip ? 0.78 : 0.35, 1, f) : 0;
  const ci = CAM[i], cn2 = CAM[Math.min(i + 1, last)], cf = i < last ? sstep(0, 1, f) : 0;
  const k = 1 - Math.exp(-3.2 * dt);
  const tgt = {
    shape: m.shape + (n.shape - m.shape) * mix,
    x: MOB ? 0 : lerp(SIDE_X[m.side], SIDE_X[n.side], mix),
    camZ: lerp(ci.z, cn2.z, cf), camY: lerp(ci.y, cn2.y, cf), lookY: lerp(ci.ly, cn2.ly, cf),
  };
  st.shape += (tgt.shape - st.shape) * k; st.x += (tgt.x - st.x) * k;
  st.camZ += (tgt.camZ - st.camZ) * k; st.camY += (tgt.camY - st.camY) * k; st.lookY += (tgt.lookY - st.lookY) * k;
  if (m.weeks) setWeek(Math.min(m.weeks - 1, Math.floor(f * m.weeks * 1.12)));
  if (m.strip && strip.children.length) { m.el.classList.toggle("ph2", f > 0.48); const w = strip.scrollWidth - innerWidth * 0.8; strip.style.transform = `translate3d(${innerWidth * 0.25 - (w + innerWidth * 0.25) * sstep(0.5, 0.95, f)}px,0,0)`; }
  prog.style.transform = `scaleX(${y / Math.max(1, document.documentElement.scrollHeight - VH)})`;
  if (FINE) { cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; }

  if (film && st.rect) {
    st.time += dt * (REDUCED ? 0.33 : 1);
    const hw = st.shape < 1 ? 1 - st.shape : st.shape > 7 ? st.shape - 7 : 0;
    spin += dt * 0.14 * hw;
    st.ry = spin + Math.sin(st.time * 0.09) * 0.4 + nmx * 0.18;
    st.rx = nmy * 0.1; st.rz = -0.32 * hw;
    st.pulseAmt += (((m.weeks || m.pulse) ? 1 : 0) - st.pulseAmt) * k;
    st.pulse = m.weeks ? -4 + f * 8 : m.pulse ? -4 + ((st.time * 0.35) % 1) * 8 : st.pulse;
    const r = boxRect(m); st.rect.set(r.x, r.y, r.z, r.w);
    if (FINE) { gmx += (((mx / innerWidth) * 2 - 1) - gmx) * 0.15; gmy += ((1 - (my / innerHeight) * 2) - gmy) * 0.15; }
    st.mx = gmx; st.my = gmy;
    film.render(st);
    acc += performance.now() - t0; accN++;
    if (accN === 50) { window.__perf.ms = acc / accN; if (!FIX && acc / accN > 24 && film.dpr > (MOB ? 0.75 : 1)) film.resize(Math.max(MOB ? 0.75 : 1, film.dpr - 0.25)); acc = 0; accN = 0; }
  }
  requestAnimationFrame(frame);
}
document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) { tPrev = performance.now(); requestAnimationFrame(frame); } });
requestAnimationFrame((t) => { tPrev = t; frame(t); requestAnimationFrame(() => document.fonts.ready.then(() => { measure(); ready(); })); });
