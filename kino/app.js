// Фильм от первого лица на 10 кадров:
// подлетаешь к шторму → нырок → рыбы → акула → темнота → вынырнул к солнцу → окно своего джета → повернул голову: салон → снижение → пляж.
// Видео идут текстурами в WebGL. Камера всё время чуть движется вперёд; переходы — нырок/всплытие через границу воды,
// пролёт вперёд сквозь кадр (размытие по ходу движения) и поворот головы. Поверх — объёмные частицы.
import * as THREE from "three";

const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const root = document.documentElement;
const MOB = matchMedia("(max-width:860px)").matches;
const FINE = matchMedia("(pointer:fine)").matches;
const REDUCE = matchMedia("(prefers-reduced-motion:reduce)").matches;
const N = 10;
const FILES = ["c01", "c02", "c03", "c04", "c05", "c06", "c07", "c08", "c09", "c10"];
const NAMES = ["Шторм", "Нырок", "Рыбы", "Акула", "Темнота", "Солнце", "Борт", "Салон", "Снижение", "Рай"];
// переход i → i+1: 0 — граница воды (DIR 1 нырок, −1 всплытие), 1 — пролёт вперёд, 2 — поворот головы
const MODE = [0, 1, 1, 1, 0, 1, 2, 1, 1];
const DIR = [1, 1, 1, 1, -1, 1, 1, 1, 1];
const ZOOM = [1, 1, 1, 1.28, 1, 1, 1, 1, 1, 1];          // доп. приближение кадра (убрать лишнее по краям)
const PA = [0.14, 0.5, 0.36, 0.3, 0.26, 0, 0.02, 0, 0.02, 0]; // частицы: пузыри и взвесь под водой
const PR = [0.1, 1.4, 0.9, 0.7, 0.4, 0, 0, 0, 0, 0];
const HOLD = 0.4;

const secs = $$(".sc");
secs.forEach((s) => s.dataset.h && s.style.setProperty("--h", s.dataset.h));
if (!FINE) $("#hint").innerHTML = "<i></i>Листайте";

// ---------- прокрутка ----------
let lenis = null;
if (window.Lenis && !REDUCE) lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 0.85, smoothWheel: true });
let tops = [], VH = innerHeight, TOT = 1;
function measure() {
  VH = innerHeight; tops = secs.map((s) => s.offsetTop);
  TOT = Math.max(1, root.scrollHeight - VH);
  $("#ticks").innerHTML = tops.map((t) => `<i style="left:${(t / TOT) * 100}%"></i>`).join("");
}
$$("[data-go]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); lenis ? lenis.scrollTo(tops[+b.dataset.go], { duration: 2 }) : scrollTo({ top: tops[+b.dataset.go], behavior: "smooth" }); }));
// положение в фильме: целая часть — кадр, дробная — ход перехода; второе число — где мы внутри стоянки кадра
function filmPos(y) {
  let i = 0; for (let k = 0; k < N; k++) if (y >= tops[k]) i = k;
  if (i >= N - 1) return [N - 1, Math.min(1, (y - tops[i]) / Math.max(1, root.scrollHeight - VH - tops[i]))];
  const f = (y - tops[i]) / (tops[i + 1] - tops[i]);
  return [i + Math.min(1, Math.max(0, (f - HOLD) / (1 - HOLD))), Math.min(1, f / HOLD)];
}

// ---------- видео ----------
const vids = [], texs = [], posters = [];
const loader = new THREE.TextureLoader();
for (let i = 0; i < N; i++) {
  const v = document.createElement("video");
  v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "none";
  v.dataset.src = `./v/${FILES[i]}${MOB ? "-m" : ""}.mp4`;
  vids.push(v);
  const t = new THREE.VideoTexture(v); t.colorSpace = THREE.NoColorSpace; t.minFilter = t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
  texs.push(t); posters.push(null);
}
function poster(i) {
  if (!posters[i]) { posters[i] = loader.load(`./v/${FILES[i]}.jpg`); posters[i].colorSpace = THREE.NoColorSpace; }
  return posters[i];
}
function load(i) { const v = vids[i]; if (!v || v.src) return; v.src = v.dataset.src; v.preload = "auto"; v.load(); }
const play = (v) => { if (v.paused) { const p = v.play(); p && p.catch(() => {}); } };
const texOf = (i) => (vids[i].readyState >= 2 ? texs[i] : poster(i));
let live = new Set();
function keep(a, b) {
  load(a); load(b); load(Math.min(N - 1, b + 1));
  const want = new Set([a, b]);
  want.forEach((i) => play(vids[i]));
  live.forEach((i) => { if (!want.has(i)) vids[i].pause(); });
  live = want;
}

// ---------- WebGL ----------
const canvas = $("#gl");
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" }); } catch (e) { renderer = null; }

const NOISE = /* glsl */`
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float s=0., a=.5; for(int k=0;k<4;k++){ s+=a*vn(p); p=p*2.03+17.1; a*=.5; } return s; }`;

const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
  depthTest: false, depthWrite: false,
  uniforms: {
    tA: { value: null }, tB: { value: null }, uT: { value: 0 }, uMode: { value: 0 }, uDir: { value: 1 },
    uTime: { value: 0 }, uAsp: { value: 1.6 }, uPar: { value: new THREE.Vector2() },
    uZA: { value: 1 }, uZB: { value: 1 }, uDrift: { value: 0 },
    uSpot: { value: new THREE.Vector2(0.5, 0.5) }, uSpotR: { value: 0 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: NOISE + /* glsl */`
varying vec2 vUv;
uniform sampler2D tA,tB; uniform float uT,uMode,uDir,uTime,uAsp,uSpotR,uZA,uZB,uDrift; uniform vec2 uPar,uSpot;
vec2 cover(vec2 uv){ float va=16./9.; vec2 s = uAsp>va ? vec2(1., va/uAsp) : vec2(uAsp/va, 1.); return (uv-.5)*s+.5; }
vec2 zoom(vec2 uv,float z){ return (uv-.5)/z+.5; }
// размытие по ходу движения: выборки вдоль луча к центру (камера летит вперёд) или вбок (поворот головы)
vec3 moveTap(sampler2D t, vec2 uv, float amt, vec2 sideways){
  if(amt<.002 && length(sideways)<.002) return texture2D(t,uv).rgb;   // кадр стоит — без лишних выборок
  vec3 c=vec3(0.); float w=0.;
  for(int k=0;k<8;k++){ float f=float(k)/7.; vec2 o = (uv-.5)*amt*f + sideways*f; float ww=1.-f*.6; c+=texture2D(t, uv-o).rgb*ww; w+=ww; }
  return c/w;
}
void main(){
  vec2 uv=vUv;
  float e=uT*uT*(3.-2.*uT), mid=sin(3.14159*e);
  vec2 dis = vec2(fbm(uv*5.+uTime*.22), fbm(uv*5.+9.-uTime*.22))-.5;
  float m=e, band=0.;
  vec2 ua, ub; float ba=0., bb=0.; vec2 sa=vec2(0.), sb=vec2(0.);
  float za = uZA*(1.+uDrift*.07), zb = uZB;
  if(uMode<.5){
    // граница воды: нырок — снизу вверх, всплытие — сверху вниз; камера продолжает лететь вперёд
    float yy = uDir>0. ? uv.y : 1.-uv.y;
    float n = fbm(vec2(uv.x*2.4*uAsp + uTime*.18, uTime*.22));
    float edge = mix(-.28, 1.28, e) + (n-.5)*.24*mid;
    float d = yy-edge;
    m = smoothstep(.04,-.04,d);
    band = exp(-d*d/.005)*mid;
    ua = zoom(uv+uPar, za*(1.+e*.35)); ub = zoom(uv+uPar*1.4, zb*(1.22-.22*e));
    ba = mid*.12; bb = mid*.1;
  } else if(uMode<1.5){
    // пролёт вперёд: уходящий кадр набегает и размывается, новый проступает из глубины
    ua = zoom(uv+uPar, za*(1.+e*1.1)); ub = zoom(uv+uPar*1.4, zb*(1.55-.55*e));
    ba = e*.18; bb = (1.-e)*.14;
    float r = length((uv-.5)*vec2(uAsp,1.));
    m = smoothstep(.0,1.,e*1.25 - r*.35 + (fbm(uv*3.+uTime*.1)-.5)*.25*mid);
  } else {
    // поворот головы: оба кадра уезжают вбок с размытием
    float s = e;
    ua = zoom(uv+uPar, za) + vec2(s*.55,0.); ub = zoom(uv+uPar*1.4, zb) - vec2((1.-s)*.55,0.);
    sa = vec2(mid*.09,0.); sb = sa;
    m = smoothstep(.0,1.,s*1.4 - (1.-uv.x)*.4);
  }
  ua = cover(ua) + dis*(band*.06 + mid*.006); ub = cover(ub) + dis*(band*.06 + mid*.006);
  vec3 A = moveTap(tA, ua, ba, sa), B = moveTap(tB, ub, bb, sb);
  // фонарик на первом кадре: под курсором уже видно, что под водой
  if(uSpotR>0.){
    vec2 q=(uv-uSpot)*vec2(uAsp,1.); float dd=length(q);
    float s=smoothstep(uSpotR, uSpotR*.35, dd)*.85;
    float ring=exp(-pow((dd-uSpotR*.7)/(uSpotR*.2),2.));
    vec2 us = cover(zoom(uv+uPar*1.4,1.15)) + dis*(.012+ring*.03) - q*.04;
    A = mix(A, texture2D(tB,us).rgb*.85, s) + ring*.016;
  }
  vec3 col = mix(A,B,m);
  // мягкий переход по яркости: в середине оба кадра сходятся к общему тону — без вспышек и провалов
  vec3 veil = mix(A,B,.5);
  col = mix(col, veil, mid*.3);
  col += band*vec3(.55,.72,.78)*.14;
  vec2 v=uv-.5; col *= 1.-dot(v,v)*.45;
  gl_FragColor=vec4(col,1.);
}`,
}));
const qScene = new THREE.Scene(); qScene.add(quad);
const oCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

// частицы: пузыри и взвесь — в настоящем 3D, летят навстречу
const PN = MOB ? 420 : 900;
const pg = new THREE.BufferGeometry();
const pos = new Float32Array(PN * 3), rnd = new Float32Array(PN);
for (let i = 0; i < PN; i++) { pos[i * 3] = (Math.random() - 0.5) * 26; pos[i * 3 + 1] = (Math.random() - 0.5) * 18; pos[i * 3 + 2] = -Math.random() * 44; rnd[i] = Math.random(); }
pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
pg.setAttribute("aR", new THREE.BufferAttribute(rnd, 1));
const pm = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  uniforms: { uTime: { value: 0 }, uFly: { value: 0 }, uRise: { value: 0 }, uA: { value: 0 }, uPx: { value: 1 } },
  vertexShader: /* glsl */`
attribute float aR; uniform float uTime,uFly,uRise,uPx; varying float vA;
void main(){
  vec3 p=position;
  p.y = mod(p.y + uRise*(.6+aR) + 9., 18.) - 9.;
  p.x += sin(uTime*.4 + aR*20.)*.25;
  p.z = mod(p.z + uFly*(.7+aR*.6) + 40., 44.) - 40.;
  vec4 mv = modelViewMatrix*vec4(p,1.);
  gl_Position = projectionMatrix*mv;
  float size = (aR<.9 ? .8 : 1.8)*(.5+aR);
  gl_PointSize = size*uPx*38./-mv.z;
  vA = smoothstep(-40.,-26.,p.z)*smoothstep(4.5,1.,p.z);
}`,
  fragmentShader: /* glsl */`
uniform float uA; varying float vA;
void main(){ float d=length(gl_PointCoord-.5); float a=smoothstep(.5,.05,d)*.7;
  gl_FragColor=vec4(vec3(.72,.86,.9)*a*vA*uA, 1.); }`,
});
const pScene = new THREE.Scene(); pScene.add(new THREE.Points(pg, pm));
const pCam = new THREE.PerspectiveCamera(60, 1, 0.1, 100); pCam.position.set(0, 0, 5);

function resize() {
  const W = innerWidth, H = innerHeight, DPR = Math.min(devicePixelRatio || 1, MOB ? 1.25 : 1.5);
  renderer.setPixelRatio(DPR); renderer.setSize(W, H, false);
  quad.material.uniforms.uAsp.value = W / H;
  pCam.aspect = W / H; pCam.updateProjectionMatrix();
  pm.uniforms.uPx.value = DPR * (H / 900);
}

// ---------- мышь ----------
let mx = 0, my = 0, cx = 0, cy = 0, sx = 0.5, sy = 0.5, stx = 0.5, sty = 0.5, moved = false;
const ring = $("#ring");
addEventListener("pointermove", (e) => {
  if (e.pointerType !== "mouse") return;
  moved = true; stx = e.clientX / innerWidth; sty = 1 - e.clientY / innerHeight;
  mx = stx - 0.5; my = sty - 0.5;
  ring.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
}, { passive: true });

// ---------- кадр ----------
let Pd = 0, Hd = 0, fly = 0, rise = 0, amp = PA[0], riseK = PR[0], spotR = 0, last = performance.now(), lastY = 0, vel = 0, shown = -1;
const hint = $("#hint"), no = $("#no"), nm = $("#nm"), bar = $("#bar"), clk = $("#clk");
function frame(t) {
  const dt = Math.min(0.05, (t - last) / 1000); last = t;
  lenis && lenis.raf(t);
  const y = scrollY;
  vel += ((y - lastY) / Math.max(dt, 1e-3) / VH - vel) * (1 - Math.exp(-dt * 6)); lastY = y;
  const [P, H] = filmPos(y);
  Pd += (P - Pd) * (1 - Math.exp(-dt * 9)); Hd += (H - Hd) * (1 - Math.exp(-dt * 6));
  const a = Math.min(N - 1, Math.floor(Pd + 1e-4)), b = Math.min(N - 1, a + 1), tr = Math.min(1, Pd - a);
  keep(a, b);
  const k = Math.round(Pd);
  hint.style.opacity = Pd < 0.05 ? "" : "0";
  if (k !== shown) { shown = k; no.textContent = String(k + 1).padStart(2, "0"); nm.textContent = NAMES[k]; }
  const p = Math.min(1, y / TOT); bar.style.transform = `scaleX(${p})`;
  const s = Math.round(p * 80 * 24);
  clk.textContent = `00:${String(Math.floor(s / 1440)).padStart(2, "0")}:${String(Math.floor(s / 24) % 60).padStart(2, "0")}:${String(s % 24).padStart(2, "0")}`;

  if (renderer) {
    const u = quad.material.uniforms, j = Math.min(a, N - 2);
    u.tA.value = texOf(a); u.tB.value = texOf(b); u.uT.value = a === b ? 0 : tr;
    u.uMode.value = MODE[j]; u.uDir.value = DIR[j];
    u.uZA.value = ZOOM[a]; u.uZB.value = ZOOM[b];
    u.uDrift.value = tr > 0 ? 1 : Hd;           // пока кадр стоит, камера всё равно тихо движется вперёд
    u.uTime.value = t / 1000;
    if (!moved || !FINE) { const q = t * 0.00033; stx = 0.5 + Math.cos(q) * 0.22; sty = 0.5 + Math.sin(q) * 0.16; }
    sx += (stx - sx) * (1 - Math.exp(-dt * 7)); sy += (sty - sy) * (1 - Math.exp(-dt * 7));
    const wantR = FINE && Pd < 0.02 ? 0.2 : 0;
    spotR += (wantR - spotR) * (1 - Math.exp(-dt * 4));
    u.uSpot.value.set(sx, sy); u.uSpotR.value = spotR;
    ring.classList.toggle("on", FINE && moved && spotR > 0.05);
    cx += (mx - cx) * (1 - Math.exp(-dt * 2.5)); cy += (my - cy) * (1 - Math.exp(-dt * 2.5));
    u.uPar.value.set(-cx * 0.018, -cy * 0.012);
    pCam.position.x = cx * 1.6; pCam.position.y = cy * 1.1; pCam.lookAt(0, 0, -12);
    const ta = PA[a] + (PA[b] - PA[a]) * tr, trk = PR[a] + (PR[b] - PR[a]) * tr;
    amp += (ta - amp) * (1 - Math.exp(-dt * 3)); riseK += (trk - riseK) * (1 - Math.exp(-dt * 3));
    fly += dt * (0.5 + Math.min(14, Math.abs(vel) * 10) * (REDUCE ? 0 : 1));
    rise += dt * riseK * 1.6;
    pm.uniforms.uTime.value = t / 1000; pm.uniforms.uFly.value = fly; pm.uniforms.uRise.value = rise;
    pm.uniforms.uA.value = amp * (0.85 + Math.min(0.25, Math.abs(vel)));
    renderer.autoClear = false; renderer.clear();
    renderer.render(qScene, oCam); renderer.render(pScene, pCam);
  } else {
    const f = $("#fb"), want = `v/${FILES[k]}.jpg`;
    if (!f.src.endsWith(want)) f.src = "./" + want;
  }
  requestAnimationFrame(frame);
}

// ---------- загрузка ----------
function boot() {
  const pc = $("#pc"), bt = $("#boot");
  load(0); load(1); play(vids[0]); play(vids[1]);
  let p = 0, ok = false, done = false, t0 = performance.now(), tl = t0;
  vids[0].addEventListener("canplay", () => (ok = true), { once: true });
  setTimeout(() => (ok = true), 4500);
  const tick = () => {
    const now = performance.now(), d = Math.min(0.1, (now - tl) / 1000); tl = now;
    p += ((ok ? 100 : 86) - p) * (1 - Math.exp(-d * 4)); if (ok && now - t0 > 900) p = Math.max(p, 99.3); pc.textContent = Math.round(p);
    if (ok && p > 99.2 && !done) { done = true; pc.textContent = "100"; bt.classList.add("go"); root.classList.add("ready"); setTimeout(() => bt.remove(), 1700); return; }
    requestAnimationFrame(tick);
  };
  tick();
}

if (renderer) { root.classList.add("gl"); resize(); addEventListener("resize", () => { resize(); measure(); }); }
else addEventListener("resize", measure);
document.addEventListener("visibilitychange", () => { live.forEach((i) => (document.hidden ? vids[i].pause() : play(vids[i]))); });
addEventListener("load", measure);
measure(); boot(); requestAnimationFrame(frame);
