// orva-v3 · прокрутка → номер главы c (0…10) → камера мира; текст, приборы, загрузка
import Lenis from "./lib/lenis.mjs";

const MOB = matchMedia("(max-width:860px)").matches;
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ss = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const root = document.documentElement, body = document.body;

// ── главы ──
const chapters = [...document.querySelectorAll(".ch")];
const N = chapters.length;
function textNodes(list) { const out = []; list.forEach((h) => { const w = document.createTreeWalker(h, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { if (n.nodeValue.trim()) { n.__t = n.nodeValue; out.push(n); } } }); return out; }
const meta = chapters.map((el, i) => ({ el, i, name: el.dataset.name, side: el.dataset.side, box: el.querySelector(".box"), texts: textNodes(el.querySelectorAll("h1,h2")), on: false, run: 0 }));

// буквы пересчитываются из случайных знаков, слева направо
const POOL = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ0123456789#%+=/<>";
const KEEP = "  .,−–—+₽«»";
function scramble(m) {
  const t0 = performance.now(); m.run = t0; let off = 0;
  const items = m.texts.map((n) => { const o = { n, s: n.__t, off }; off += n.__t.length; return o; });
  let frame = 0;
  const tick = () => {
    if (m.run !== t0) return;
    const k = performance.now() - t0; let done = true; frame++;
    if (frame % 2 === 0 || k > 2000) for (const it of items) { let out = "";
      for (let i = 0; i < it.s.length; i++) { const ch = it.s[i], st = (it.off + i) * 17, en = st + 360;
        if (KEEP.includes(ch) || k >= en) out += ch; else { done = false; out += POOL[(Math.random() * POOL.length) | 0]; } }
      it.n.nodeValue = out; }
    else done = false;
    if (!done) requestAnimationFrame(tick);
  };
  tick();
  setTimeout(() => { if (m.run === t0) { m.run = 0; m.texts.forEach((n) => (n.nodeValue = n.__t)); } }, off * 17 + 700);
}
const settle = (m) => { m.run = 0; m.texts.forEach((n) => (n.nodeValue = n.__t)); };

// ── приборы ──
const rail = document.getElementById("rail");
meta.forEach((m, i) => { const a = document.createElement("a"); a.href = "#" + m.el.id; a.setAttribute("aria-label", m.name); a.addEventListener("click", (e) => { e.preventDefault(); goTo(i); }); rail.appendChild(a); });
const dots = [...rail.children];
const cn = document.getElementById("cn"), clb = document.getElementById("cl"), prog = document.getElementById("prog");
const weeks = [...document.querySelectorAll("#weeks .wk")];
const pathsBox = document.getElementById("paths"), paths = [...pathsBox.children];
const strip = document.getElementById("strip");
for (let k = 0; k < 18; k++) { const im = new Image(); im.src = `./cases/c${String(k).padStart(2, "0")}.webp`; im.alt = "Кейс клиента"; im.loading = "lazy"; im.decoding = "async"; strip.appendChild(im); }
const clock = document.getElementById("clock");
const tickClock = () => { try { clock.textContent = "МСК " + new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" }).format(new Date()); } catch (e) {} };
tickClock(); setInterval(tickClock, 30000);

// ── размеры ──
let VH = innerHeight, tops = [], hs = [];
function measure() { VH = innerHeight; tops = chapters.map((c) => c.offsetTop); hs = chapters.map((c) => c.offsetHeight); }
measure();
function coordAt(y) { const mid = y + VH / 2; for (let i = 0; i < N; i++) if (mid < tops[i] + hs[i]) {
  // последняя глава: c доходит до 10 ровно в конце страницы
  const span = i === N - 1 ? Math.max(1, root.scrollHeight - VH / 2 - tops[i]) : hs[i];
  return i + cl((mid - tops[i]) / span); } return N; }
function yAt(c) { const i = Math.min(N - 1, Math.floor(c)), f = c - i; const span = i === N - 1 ? Math.max(1, root.scrollHeight - VH / 2 - tops[i]) : hs[i]; return tops[i] + f * span - VH / 2; }

// ── прокрутка ──
const lenis = REDUCED ? null : new Lenis({ lerp: 0.075, wheelMultiplier: 0.85, smoothWheel: true });
function goTo(i) { const y = Math.max(0, yAt(i + 0.5)); lenis ? lenis.scrollTo(y, { duration: 2.4 }) : scrollTo({ top: y, behavior: "smooth" }); }
document.querySelectorAll('a[href^="#c"]').forEach((a) => { if (a.parentElement === rail) return; a.addEventListener("click", (e) => { const i = chapters.findIndex((c) => "#" + c.id === a.getAttribute("href")); if (i >= 0) { e.preventDefault(); goTo(i); } }); });

// ── мир ──
let world = null;
const canvas = document.getElementById("gl");
const ln = document.getElementById("ln");
let shown = 0, target = 0;
const loadTick = () => { shown += (target - shown) * 0.12; ln.textContent = String(Math.round(shown)).padStart(3, "0"); if (!body.classList.contains("ready")) requestAnimationFrame(loadTick); };
loadTick();

async function boot() {
  target = 12;
  try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]); } catch (e) {}
  target = 28;
  try {
    const { createWorld } = await import("./world.js");
    world = createWorld(canvas, { mobile: MOB });
    target = 45;
    await world.warm((p) => (target = 45 + p * 50));
    world.snap(coordAt(scrollY));
  } catch (e) { console.warn("3D недоступно", e); world = null; root.classList.add("nogl"); }
  target = 100;
  setTimeout(() => body.classList.add("ready"), 450);
}
boot();

addEventListener("pointermove", (e) => { if (!world) return; world.mouse.x = (e.clientX / innerWidth - 0.5) * 2; world.mouse.y = (e.clientY / innerHeight - 0.5) * 2; }, { passive: true });
let rT; addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => { measure(); world && world.resize(); }, 120); });

// ── кадр ──
let last = performance.now(), t = 0, active = -1, frames = 0, slow = 0, tuned = false;
const SIDE = { L: 1, R: -1, C: 0 };
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
  lenis && lenis.raf(now);
  const y = lenis ? lenis.scroll : scrollY;
  const c = coordAt(y);
  const ai = cl(Math.floor(c), 0, N - 1);

  for (const m of meta) {
    const f = (y + VH / 2 - tops[m.i]) / hs[m.i];
    const near = f > -0.4 && f < 1.4;
    if (!near) { if (m.on) { m.on = false; m.el.classList.remove("on"); settle(m); } continue; }
    const fin = m.i === 0 ? 1 : ss(0.06, 0.24, f), fout = m.i === N - 1 ? 1 : 1 - ss(0.8, 0.96, f);
    const o = Math.min(fin, fout);
    if (m.box) { m.box.style.opacity = o.toFixed(3); m.box.style.transform = `translate3d(0,${((1 - fin) * 46 - (1 - fout) * 46).toFixed(1)}px,0)`; }
    const isOn = f > (m.i === 0 ? -1 : 0.1) && f < 0.93;
    if (isOn && !m.on) { m.on = true; m.el.classList.add("on"); scramble(m); }
    else if (!isOn && m.on) { m.on = false; m.el.classList.remove("on"); }
    if (m.el.id === "c5") { const w = Math.min(weeks.length - 1, Math.floor(ss(0.12, 0.88, f) * weeks.length)); weeks.forEach((el, j) => el.classList.toggle("cur", j === w)); }
    if (m.el.id === "c7") { m.el.classList.toggle("ph2", f > 0.52); const sw = strip.scrollWidth - innerWidth * 0.8; strip.style.transform = `translate3d(${(innerWidth * 0.3 - (sw + innerWidth * 0.3) * ss(0.55, 0.95, f)).toFixed(1)}px,0,0)`; }
    if (m.el.id === "c4") pathsBox.style.opacity = o.toFixed(3);
    if (m.el.id === "c4" && world && !MOB) paths.forEach((el, j) => { const p = world.cardAnchor(j); el.style.left = p.x + "px"; el.style.top = p.y + 14 + "px"; el.style.visibility = p.z < 1 ? "visible" : "hidden"; });
  }

  if (ai !== active) {
    active = ai; cn.textContent = String(ai + 1).padStart(2, "0"); clb.textContent = meta[ai].name;
    dots.forEach((d, j) => d.classList.toggle("on", j === ai)); body.dataset.side = meta[ai].side; body.dataset.c = ai;
  }
  prog.style.transform = `scaleX(${cl(c / N).toFixed(4)})`;

  if (world && body.classList.contains("ready")) {
    world.update(c, dt, t, MOB ? 0 : SIDE[meta[ai].side] ?? 0);
    // подстройка качества по скорости
    if (!tuned) { frames++; if (frames > 40) { slow += dt > 0.03 ? 1 : 0; if (frames > 160) { tuned = true; if (slow > 70) { world.setDPR(1); world.lowPower(); } } } }
  }
}
requestAnimationFrame(frame);

// для проверки: прыжок к точке маршрута
window.__orva = { goC(c) { const y = Math.max(0, yAt(c)); lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); world && world.snap(c); }, get c() { return world ? world.c : -1; } };
