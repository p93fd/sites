// Кино-сайт: 12 кадров, смена по прокрутке, фонарик на первом экране.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const MOB = matchMedia("(max-width:860px)").matches;
const FINE = matchMedia("(pointer:fine)").matches;
const REDUCE = matchMedia("(prefers-reduced-motion:reduce)").matches;
const NAMES = ["Система", "Сейчас", "Сценарий", "Фокус", "Одно русло", "Из чего система", "Кейсы", "Результат", "Мой путь", "Формат", "Выбор", "Диагностика"];
const SIDE = [0.5, 0.8, 0.8, 0.2, 0.8, 0.8, 0.5, 0.5, 0.2, 0.8, 0.5, 0.5]; // где текст: тень ложится туда
const TX = [0.7, 1, 1, 1, 1, 1.1, 0.8, 0.6, 1, 1, 0.5, 0.9];
const PILL = (k) => (k >= 11 ? 3 : k >= 9 ? 2 : k >= 6 ? 1 : 0);

const secs = $$(".sc"), shots = $$(".shot[data-k]"), reveal = $("#reveal"), shade = $("#shade"), cam = $("#cam");
secs.forEach((s) => s.dataset.h && s.style.setProperty("--h", s.dataset.h));
$$(".tried span").forEach((s, j) => s.style.setProperty("--j", j));

// ---------- видео: грузим только текущий и следующий кадр ----------
const srcOf = (v) => `./v/${v.dataset.src}${MOB ? "-m" : ""}.mp4`;
function load(v, eager) {
  if (!v || v.dataset.ld) return;
  v.dataset.ld = 1; v.muted = true; v.poster = `./v/${v.dataset.src}.jpg`;
  v.preload = eager ? "auto" : "metadata"; v.src = srcOf(v);
}
const play = (v) => { const p = v.play(); p && p.catch(() => {}); };
let cur = -1, outT = 0;
function setShot(k) {
  if (k === cur) return;
  const prev = shots[cur], next = shots[k];
  load(next, true); load(shots[k + 1], false); load(shots[k - 1], false);
  if (k === 0 || k === 7) load(reveal, true);
  if (prev) { prev.classList.remove("on"); prev.classList.add("out"); const p = prev; clearTimeout(outT); outT = setTimeout(() => { p.classList.remove("out"); if (!p.classList.contains("on")) p.pause(); }, 1700); }
  next.classList.remove("out"); next.classList.add("on"); play(next);
  if (!REDUCE && cur >= 0) { root.classList.add("cut"); setTimeout(() => root.classList.remove("cut"), 520); }
  cur = k;
  shade.style.setProperty("--side", SIDE[k] * 100 + "%");
  shade.style.setProperty("--tx", TX[k]);
  $("#no").textContent = String(k + 1).padStart(2, "0");
  $("#nm").textContent = NAMES[k];
  $$(".pill button").forEach((b, i) => b.classList.toggle("on", i === PILL(k)));
  secs.forEach((s, i) => s.classList.toggle("in", i === k));
  if (k === 7) count();
  // фонарик живёт только на первом экране
  spot.on = k === 0;
  reveal.classList.toggle("on", k === 0);
  if (k === 0) play(reveal); else setTimeout(() => cur !== 0 && reveal.pause(), 1200);
}

// ---------- 100+ ----------
let counted = false;
function count() {
  if (counted) return; counted = true;
  const el = $("#n100"), t0 = performance.now(), D = 1800;
  const step = (t) => { const x = Math.min(1, (t - t0) / D), e = 1 - Math.pow(1 - x, 4); el.textContent = Math.round(e * 100) + "+"; if (x < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

// ---------- прокрутка ----------
let lenis = null;
if (window.Lenis && !REDUCE) lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9, smoothWheel: true, syncTouch: false });
let tops = [], hs = [], VH = innerHeight, TOT = 1;
function measure() {
  VH = innerHeight; tops = secs.map((s) => s.offsetTop); hs = secs.map((s) => s.offsetHeight);
  TOT = Math.max(1, document.documentElement.scrollHeight - VH);
  $("#ticks").innerHTML = tops.map((t) => `<i style="left:${(t / TOT) * 100}%"></i>`).join("");
}
function go(k) { const y = tops[k] + (k ? 2 : 0); lenis ? lenis.scrollTo(y, { duration: 1.8 }) : scrollTo({ top: y, behavior: "smooth" }); }
$$("[data-go]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); go(+b.dataset.go); }));

const track = $("#track"), bar = $("#bar"), clk = $("#clk");
function onScroll() {
  const y = scrollY, mid = y + VH * 0.5;
  let k = 0; for (let i = 0; i < tops.length; i++) if (mid >= tops[i]) k = i;
  setShot(k);
  const p = Math.min(1, y / TOT);
  bar.style.transform = `scaleX(${p})`;
  const s = Math.round(p * 96 * 24); // фильм на 1:36
  clk.textContent = `00:${String(Math.floor(s / 1440)).padStart(2, "0")}:${String(Math.floor(s / 24) % 60).padStart(2, "0")}:${String(s % 24).padStart(2, "0")}`;
  // кейсы: лента едет вместе с прокруткой
  const t7 = tops[6], h7 = hs[6];
  if (track && h7) {
    const q = Math.min(1, Math.max(0, (y - t7) / (h7 - VH)));
    const max = track.scrollWidth - innerWidth;
    track.style.transform = `translate3d(${-q * Math.max(0, max)}px,0,0)`;
  }
}

// ---------- фонарик и камера за мышью ----------
const spot = { on: false, r: 0, x: innerWidth * 0.5, y: innerHeight * 0.5, tx: innerWidth * 0.5, ty: innerHeight * 0.55, moved: false };
const ring = $("#spot"); let mx = 0, my = 0, cx = 0, cy = 0;
addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  spot.tx = e.clientX; spot.ty = e.clientY; spot.moved = true;
  mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5;
}, { passive: true });

let last = performance.now();
function frame(t) {
  const dt = Math.min(0.05, (t - last) / 1000); last = t;
  lenis && lenis.raf(t);
  // без мыши фонарик плывёт сам по кругу
  if (!FINE || !spot.moved) { const a = t * 0.00035; spot.tx = innerWidth * (0.5 + Math.cos(a) * 0.2); spot.ty = innerHeight * (0.52 + Math.sin(a) * 0.14); }
  const k = 1 - Math.exp(-dt * 7);
  spot.x += (spot.tx - spot.x) * k; spot.y += (spot.ty - spot.y) * k;
  const R = spot.on ? Math.min(innerWidth, innerHeight) * (MOB ? 0.38 : 0.36) : 0;
  spot.r += (R - spot.r) * (1 - Math.exp(-dt * 3));
  reveal.style.setProperty("--x", spot.x + "px"); reveal.style.setProperty("--y", spot.y + "px"); reveal.style.setProperty("--r", spot.r.toFixed(1) + "px");
  if (FINE) { ring.classList.toggle("on", spot.on && spot.moved); ring.style.transform = `translate3d(${spot.x}px,${spot.y}px,0)`; }
  // камера: лёгкий наклон и сдвиг — у кадра появляется глубина
  if (!REDUCE) {
    cx += (mx - cx) * (1 - Math.exp(-dt * 2.5)); cy += (my - cy) * (1 - Math.exp(-dt * 2.5));
    cam.style.transform = `translate3d(${-cx * 22}px,${-cy * 14}px,0) rotateY(${cx * 1.6}deg) rotateX(${-cy * 1.2}deg)`;
  }
  requestAnimationFrame(frame);
}

// ---------- загрузка ----------
function boot() {
  const pc = $("#pc"), b = $("#boot"), first = shots[0];
  load(first, true); load(reveal, true); load(shots[1], false);
  let p = 0, done = false, ok = false;
  const ready = () => { ok = true; };
  first.addEventListener("canplay", ready, { once: true });
  setTimeout(ready, 4000);
  const tick = () => {
    p += ((ok ? 100 : 86) - p) * 0.06; pc.textContent = Math.round(p);
    if (ok && p > 99.2 && !done) {
      done = true; pc.textContent = "100";
      b.classList.add("go"); root.classList.add("ready");
      setShot(0); setTimeout(() => b.remove(), 1700);
      return;
    }
    requestAnimationFrame(tick);
  };
  tick();
}

// ---------- документы и cookie ----------
const dm = $("#dm"), dfr = $("#dfr");
$$("[data-doc]").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); dfr.src = a.getAttribute("href"); dm.hidden = false; lenis && lenis.stop(); }));
$(".dx").addEventListener("click", () => { dm.hidden = true; dfr.src = "about:blank"; lenis && lenis.start(); });
const ck = $("#ck");
try { if (!localStorage.getItem("ck")) ck.hidden = false; } catch (e) { ck.hidden = false; }
$("button", ck).addEventListener("click", () => { ck.hidden = true; try { localStorage.setItem("ck", 1); } catch (e) {} });

document.addEventListener("visibilitychange", () => { const v = shots[cur]; if (!v) return; document.hidden ? v.pause() : play(v); });
addEventListener("resize", () => { measure(); onScroll(); });
lenis ? lenis.on("scroll", onScroll) : addEventListener("scroll", onScroll, { passive: true });
addEventListener("load", measure);
measure(); boot(); requestAnimationFrame(frame);
setTimeout(() => { measure(); onScroll(); }, 50);
