// Сезон роста — сцена-нить и управление главами.
// Модули: сцена (three), главы и прокрутка (Lenis), приборы (шапка, курсор, часы).
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import Lenis from "./lib/lenis.mjs";
import { buildShapes } from "./shapes.js";

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

// ---------- главы ----------
const chapters = [...document.querySelectorAll(".ch")];
const meta = chapters.map((c) => ({ el: c, name: c.dataset.name, shape: +c.dataset.shape, side: c.dataset.side, weeks: +c.dataset.weeks || 0, pulse: !!c.dataset.pulse, strip: !!c.dataset.strip, box: c.querySelector(".box, .cwrap") }));
let tops = [], hts = [], VH = innerHeight;
function measure() { VH = innerHeight; tops = chapters.map((c) => c.getBoundingClientRect().top + scrollY); hts = chapters.map((c) => c.offsetHeight); }
measure();
let lastW = innerWidth, lastH = innerHeight;
addEventListener("resize", () => { if (MOB && innerWidth === lastW && Math.abs(innerHeight - lastH) < 160) return; lastW = innerWidth; lastH = innerHeight; measure(); resize(); });

function where(y) {
  let i = 0; for (let k = 0; k < chapters.length; k++) if (y >= tops[k] - 1) i = k;
  const span = Math.max(1, hts[i] - VH); const f = Math.min(1, Math.max(0, (y - tops[i]) / span));
  return { i, f };
}
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
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

// недели
const weeks = [...document.querySelectorAll(".wk")];
let wkOn = -1;
function setWeek(n) { if (n === wkOn) return; wkOn = n; weeks.forEach((w, k) => w.classList.toggle("act", k === n)); }

// полоса всех кейсов
const strip = document.getElementById("strip");
if (!MOB) for (let k = 0; k < 18; k++) { const im = new Image(); im.src = `./cases/c${String(k).padStart(2, "0")}.webp`; im.alt = "Кейс клиента"; im.loading = "lazy"; im.decoding = "async"; strip.appendChild(im); }

// курсор и магнит
const cur = document.getElementById("cur");
let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, nmx = 0, nmy = 0;
addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; nmx = mx / innerWidth - 0.5; nmy = my / innerHeight - 0.5; }, { passive: true });
if (FINE) {
  document.querySelectorAll("a,button").forEach((el) => { el.addEventListener("pointerenter", () => cur.classList.add("hot")); el.addEventListener("pointerleave", () => cur.classList.remove("hot")); });
  document.querySelectorAll(".mag").forEach((el) => {
    el.addEventListener("pointermove", (e) => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.32}px)`; });
    el.addEventListener("pointerleave", () => { el.style.transition = "transform .6s cubic-bezier(.16,1,.3,1)"; el.style.transform = ""; setTimeout(() => (el.style.transition = ""), 600); });
  });
}

// ---------- прокрутка ----------
const lenis = REDUCED ? null : new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
function goTo(k) { const y = tops[k] + (k ? VH * 0.05 : 0); lenis ? lenis.scrollTo(y, { duration: 1.8 }) : scrollTo({ top: y, behavior: "smooth" }); }
document.querySelectorAll('a[href^="#c"]').forEach((a) => a.addEventListener("click", (e) => { const k = chapters.findIndex((c) => "#" + c.id === a.getAttribute("href")); if (k > -1) { e.preventDefault(); goTo(k); } }));

// ---------- сцена ----------
let renderer, composer, scene, camera, group, mat, bloom, glOK = true;
const N = MOB ? 30000 : 64000;
let DPR = Math.min(MOB ? 1.5 : 1.75, devicePixelRatio || 1);
const VS = /* glsl */`
attribute vec4 s0; attribute vec4 s1; attribute vec4 s2; attribute vec4 s3; attribute vec4 s4; attribute vec4 s5; attribute vec4 s6; attribute vec4 s7; attribute vec4 s8;
attribute vec4 aSeed;
uniform float uShape, uTime, uScale, uSize, uPulse, uPulseAmt, uFlow;
uniform vec4 uRect;
varying float vB; varying float vHot; varying float vE;
vec4 pick(float k){
  if(k<.5) return s0; if(k<1.5) return s1; if(k<2.5) return s2; if(k<3.5) return s3;
  if(k<4.5) return s4; if(k<5.5) return s5; if(k<6.5) return s6; if(k<7.5) return s7; return s8;
}
vec3 h3(vec3 p){ p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6))); return fract(sin(p)*43758.5453)*2.-1.; }
void main(){
  float A=floor(uShape), f=uShape-A;
  vec4 a=pick(A), b=pick(min(A+1.,8.));
  float delay=.5*(aSeed.z*.6 + clamp(a.y*.08+.5,0.,1.)*.4);
  float ff=clamp((f-delay)/.5,0.,1.); ff=ff*ff*ff*(ff*(ff*6.-15.)+10.);
  vec3 p=mix(a.xyz,b.xyz,ff); float br=mix(a.w,b.w,ff);
  float k=sin(3.14159*ff); k*=k;
  p+=h3(vec3(aSeed.xy*9.,floor(A)))*k*1.1;
  // дыхание в покое
  float t=uTime;
  p+=vec3(sin(t*.7*aSeed.w+aSeed.x*30.),cos(t*.6*aSeed.w+aSeed.y*30.),sin(t*.5+aSeed.z*30.))*.018;
  // свет бежит по нитям
  float flow=.55+.45*sin(dot(p,vec3(.9,1.4,.5))*2.2 - t*1.6 + aSeed.x*2.);
  br*=mix(1.,flow,uFlow);
  // импульс по сети
  br*=1.+uPulseAmt*2.2*exp(-pow((p.x*.6+p.y*.4-uPulse)*2.2,2.));
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  vec2 nd=gl_Position.xy/gl_Position.w;
  float inR=smoothstep(uRect.x-.18,uRect.x+.06,nd.x)*(1.-smoothstep(uRect.z-.06,uRect.z+.18,nd.x))*smoothstep(uRect.y-.18,uRect.y+.06,nd.y)*(1.-smoothstep(uRect.w-.06,uRect.w+.18,nd.y));
  float z=-mv.z;
  float base=uSize*(.55+aSeed.x*.9)*uScale/z;
  float coc=abs(z-10.)*.0025*uScale;
  float px=max(1.2,base+coc);
  vE=clamp(base*base/(px*px),.08,1.);
  gl_PointSize=px*mix(1.,.7,inR);
  vB=br*mix(1.,.16,inR);
  vHot=step(.94,aSeed.y);
}`;
const FS = /* glsl */`
uniform vec3 uCol, uHot;
varying float vB; varying float vHot; varying float vE;
void main(){
  vec2 c=gl_PointCoord-.5; float d=length(c)*2.; if(d>1.) discard;
  float a=exp(-d*d*3.2)*(1.-d);
  vec3 col=mix(uCol,uHot,vHot*.6+(1.-d)*.12);
  gl_FragColor=vec4(col*a*vB*vE*.92,1.);
}`;

function initGL() {
  const cv = document.getElementById("gl");
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: "high-performance", alpha: false }); }
  catch (e) { return false; }
  if (!renderer.getContext()) return false;
  renderer.setPixelRatio(DPR); renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0807);
  camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 60); camera.position.set(0, 0, 10);
  group = new THREE.Group(); scene.add(group);

  const S = buildShapes(N); setLoad(70);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  S.forEach((a, k) => g.setAttribute("s" + k, new THREE.BufferAttribute(a, 4)));
  const seed = new Float32Array(N * 4); for (let i = 0; i < N * 4; i++) seed[i] = Math.random(); for (let i = 0; i < N; i++) seed[i * 4 + 3] = 0.5 + seed[i * 4 + 3];
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
  mat = new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: { uShape: { value: 0 }, uTime: { value: 0 }, uScale: { value: 1 }, uSize: { value: MOB ? 0.034 : 0.03 }, uPulse: { value: -9 }, uPulseAmt: { value: 0 }, uFlow: { value: 0.6 },
      uRect: { value: new THREE.Vector4(9, 9, 9, 9) }, uCol: { value: new THREE.Color(0xd9a27c) }, uHot: { value: new THREE.Color(0xfff1e2) } },
  });
  group.add(new THREE.Points(g, mat));

  composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }));
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.42, 0.5, 0.32); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  resize();
  cv.addEventListener("webglcontextlost", (e) => { e.preventDefault(); fallback(); });
  document.getElementById("pts").textContent = N.toLocaleString("ru-RU") + " точек";
  return true;
}
function resize() {
  if (!renderer) return;
  renderer.setPixelRatio(DPR); renderer.setSize(innerWidth, innerHeight, false); composer.setPixelRatio(DPR); composer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  mat.uniforms.uScale.value = innerHeight * DPR / (2 * Math.tan((camera.fov * Math.PI) / 360));
}
function fallback() { glOK = false; root.classList.add("nogl"); document.getElementById("gl").style.display = "none"; }

// прямоугольник активного текста — точки под ним тише
const rect = new THREE.Vector4(9, 9, 9, 9);
function boxRect(m) {
  const b = m.box; if (!b) return rect.set(9, 9, 9, 9);
  const r = b.getBoundingClientRect(); const W = innerWidth, H = innerHeight;
  return rect.set((r.left - 24) / W * 2 - 1, 1 - (r.bottom + 24) / H * 2, (r.right + 24) / W * 2 - 1, 1 - (r.top - 24) / H * 2);
}

// ---------- цикл ----------
let shape = 0, sideX = SIDE_X.L, sideY = 0, tPrev = performance.now(), time = 0, running = true, acc = 0, accN = 0;
const perf = { ms: 0 };
window.__perf = perf;
function frame(now) {
  if (!running) return;
  const dt = Math.min(0.05, (now - tPrev) / 1000); tPrev = now;
  const t0 = performance.now();
  lenis && lenis.raf(now);
  const y = scrollY, { i, f } = where(y);
  setChapter(i);
  const m = meta[i], n = meta[Math.min(i + 1, meta.length - 1)];
  // форма стоит первую половину главы, потом перетекает в следующую
  const mix = i < meta.length - 1 ? sstep(m.weeks || m.strip ? 0.82 : 0.5, 1, f) : 0;
  const tgtShape = m.shape + (n.shape - m.shape) * mix;
  const tgtX = MOB ? 0 : SIDE_X[m.side] + (SIDE_X[n.side] - SIDE_X[m.side]) * mix;
  const tgtY = MOB ? 1.9 : 0;
  const k = 1 - Math.exp(-5.2 * dt);
  shape += (tgtShape - shape) * k; sideX += (tgtX - sideX) * k; sideY += (tgtY - sideY) * k;
  if (m.weeks) setWeek(Math.min(m.weeks - 1, Math.floor(f * m.weeks * 1.12)));
  if (m.strip && strip.children.length) { m.el.classList.toggle("ph2", f > 0.48); const w = strip.scrollWidth - innerWidth * 0.8; strip.style.transform = `translate3d(${innerWidth * 0.25 - (w + innerWidth * 0.25) * sstep(0.5, 0.95, f)}px,0,0)`; }
  prog.style.transform = `scaleX(${y / Math.max(1, document.documentElement.scrollHeight - VH)})`;
  if (FINE) { cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; }

  if (glOK && renderer) {
    time += dt * (REDUCED ? 0.33 : 1);
    const u = mat.uniforms;
    u.uShape.value = shape; u.uTime.value = time;
    u.uPulseAmt.value += (((m.weeks || m.pulse) ? 1 : 0) - u.uPulseAmt.value) * k;
    u.uPulse.value = m.weeks ? -4 + f * 8 : m.pulse ? -4 + ((time * 0.35) % 1) * 8 : u.uPulse.value;
    u.uRect.value.copy(boxRect(m));
    group.position.set(sideX, sideY, 0);
    const sc = MOB ? 0.62 : 1; group.scale.setScalar(sc);
    group.rotation.y = Math.sin(time * 0.08) * 0.35 + nmx * 0.18 + (shape < 1 ? time * 0.12 : 0);
    group.rotation.x = nmy * 0.1;
    if (shape < 1) group.rotation.z = -0.32 * (1 - shape); else group.rotation.z *= 0.95;
    composer.render();
    // плотность пикселей подстраивается под устройство
    acc += performance.now() - t0; accN++;
    if (accN === 50) { perf.ms = acc / accN; if (!FIX && acc / accN > 24 && DPR > (MOB ? 0.75 : 1)) { DPR = Math.max(MOB ? 0.75 : 1, DPR - 0.25); resize(); } acc = 0; accN = 0; }
  }
  requestAnimationFrame(frame);
}
document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) { tPrev = performance.now(); requestAnimationFrame(frame); } });

// ---------- старт ----------
const hasGL = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } })();
if (!hasGL || !initGL()) fallback();
requestAnimationFrame((t) => { tPrev = t; frame(t); requestAnimationFrame(() => document.fonts.ready.then(() => { measure(); ready(); })); });
