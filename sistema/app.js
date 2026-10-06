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
const N_CH = 6;
const LABELS = ["Система", "Фокус", "Архитектура", "Управление", "Результаты", "Стратегия"];
const HOLD = 0.3;                        // доля шага, пока форма стоит и текст читается
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
stage(12);

const setVH = () => root.style.setProperty("--vh", innerHeight * 0.01 + "px");
setVH();

/* ---------- приборы, которые работают и без сцены ---------- */
const chapters = $$(".ch"), railBtns = $$(".rail button"), numEl = $("#num"), labEl = $("#lab"), hintEl = $("#hint");
let tops = [], VHpx = innerHeight;
function measure() { tops = chapters.map((c) => c.offsetTop); VHpx = innerHeight; }
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
let curCh = -1;
function ui(k, f) {
  const raw = k + f;
  chapters.forEach((el, j) => {
    const d = raw - j, on = d > -0.4 && d < 0.9;
    if (on !== el._in) { el._in = on; el.classList.toggle("in", on); if (on) $$("[data-sc]", el).forEach((s) => setTimeout(() => scramble(s), 200)); }
    if (Math.abs(d) < 1.2) el.style.setProperty("--d", d.toFixed(3));
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

/* ---------- запуск ---------- */
let scene3d = null;
function reveal() {
  measure(); const { k, f } = rawProgress(); ui(k, f);
  stage(100);
  setTimeout(() => { root.classList.add("ready"); if (scene3d) scene3d.intro(); }, reduce ? 0 : 520);
}
function fallback() { root.classList.add("nogl"); loop2d(); reveal(); }
function loop2d() {                               // без сцены: только текст и приборы
  const f = () => { const p = rawProgress(); ui(p.k, p.f); requestAnimationFrame(f); }; requestAnimationFrame(f);
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
  const U = lite ? 150 : 236, V = lite ? 92 : 124, N = U * V, TAU = Math.PI * 2;
  const P = [0, 1, 2, 3, 4, 5].map(() => new Float32Array(N * 3));
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
    for (let yy = 0; yy < H; yy += 3) for (let xx = 0; xx < W; xx += 3) if (d[(yy * W + xx) * 4 + 3] > 128) { pts.push(xx, yy); if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
    const w = Math.max(1, x1 - x0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, out = [];
    for (let i = 0; i < pts.length; i += 2) out.push([(pts[i] - cx) / w, (cy - pts[i + 1]) / w]);
    out.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return { pts: out, aspect: (y1 - y0) / w };
  })();

  for (let j = 0; j < V; j++) for (let i = 0; i < U; i++) {
    const k = j * U + i, u = i / (U - 1), v = j / (V - 1), o = k * 3;
    aUV[k * 2] = u; aUV[k * 2 + 1] = v;
    aR[k * 4] = rnd(); aR[k * 4 + 1] = rnd(); aR[k * 4 + 2] = rnd(); aR[k * 4 + 3] = rnd();
    { const th = u * TAU, ph = Math.acos(1 - 2 * (0.012 + v * 0.976)), R = 2.25;                       // 0 сфера
      P[0][o] = R * Math.sin(ph) * Math.cos(th); P[0][o + 1] = R * Math.cos(ph); P[0][o + 2] = R * Math.sin(ph) * Math.sin(th); }
    { const y = 2.5 - v * 5.2, r = 0.05 + 2.9 * Math.pow(1 - v, 2.3), th = u * TAU + v * 5.5;          // 1 воронка
      P[1][o] = r * Math.cos(th); P[1][o + 1] = y; P[1][o + 2] = r * Math.sin(th); aChaos[k] = Math.pow(1 - v, 1.5); }
    { const y = (v - 0.5) * 6.2, th = v * TAU * 2.4, s = 2 * u - 1, e = Math.sign(s) * Math.pow(Math.abs(s), 0.3), R = 1.05;   // 2 спираль
      P[2][o] = Math.cos(th) * e * R; P[2][o + 1] = y; P[2][o + 2] = Math.sin(th) * e * R; }
    { P[3][o] = (u - 0.5) * 17; P[3][o + 1] = -1.25; P[3][o + 2] = 3.2 - Math.pow(v, 1.25) * 24; }     // 3 волна
    { const n = numPts.pts.length || 1, q = numPts.pts[Math.min(n - 1, Math.floor(((i + j / V) / U) * n))] || [0, 0];   // 4 число
      P[4][o] = q[0]; P[4][o + 1] = q[1]; P[4][o + 2] = 0; }
    { const th = u * TAU;                                                                                   // 5 кольцо-вход: тор и тоннель колец за ним
      if (v < 0.55) { const a = (v / 0.55) * TAU, R = 2.5, r = 0.2; P[5][o] = (R + r * Math.cos(a)) * Math.cos(th); P[5][o + 1] = (R + r * Math.cos(a)) * Math.sin(th); P[5][o + 2] = r * Math.sin(a); }
      else { const q = (v - 0.55) / 0.45, R = 2.5 * (1 - q * 0.22); P[5][o] = R * Math.cos(th); P[5][o + 1] = R * Math.sin(th); P[5][o + 2] = -0.5 - Math.pow(q, 1.25) * 17; } }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(P[0], 3));
  for (let f = 1; f < 6; f++) geo.setAttribute("p" + f, new THREE.BufferAttribute(P[f], 3));
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
  attribute vec3 p1,p2,p3,p4,p5; attribute vec2 aUV; attribute vec4 aR; attribute float aChaos;
  uniform float uP,uT,uPoint,uSwirl,uVel,uIntro; uniform vec3 uNum;
  float w0,w1,w2,w3,w4,w5,gTr;
  vec3 rotY(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
  vec3 rotZ(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}
  vec3 form(){
    float i=floor(uP),f=uP-i;
    // пятнами: соседние точки уходят вместе, волна идёт по сетке
    float n=snoise(vec3(aUV.x*3.2,aUV.y*2.4,i*7.31))*.5+.5;
    float delay=.4*(n*.6+aUV.y*.4);
    float ff=clamp((f-delay)/.6,0.,1.); ff=ff*ff*ff*(ff*(ff*6.-15.)+10.);
    float pe=i+ff;
    w0=max(0.,1.-abs(pe));w1=max(0.,1.-abs(pe-1.));w2=max(0.,1.-abs(pe-2.));w3=max(0.,1.-abs(pe-3.));w4=max(0.,1.-abs(pe-4.));w5=max(0.,1.-abs(pe-5.));
    vec3 a=rotY(position,uT*.085)*(1.+sin(uT*.9)*.03);
    vec3 b=rotY(p1,uT*.11);
    vec3 c=rotY(p2,uT*.13);
    vec3 d=p3; float far=smoothstep(3.,-21.,d.z);
    d.y+=sin(d.x*.55+uT*.55)*.34+sin(d.z*.42-uT*.8)*.42*(1.-far*.4)+sin((d.x+d.z)*.23+uT*.35)*.3;
    vec3 e=vec3(p4.xy*uNum.z+uNum.xy,(aR.z-.5)*.1*uPoint+sin(uT*.6+p4.x*5.)*.03);
    vec3 g=rotZ(p5,uT*.045);
    vec3 P=a*w0+b*w1+c*w2+d*w3+e*w4+g*w5;
    gTr=sin(3.14159*ff);
    float k=gTr*gTr*uSwirl+uVel*.22;
    if(k>.002){ vec3 q=vec3(aUV*3.6,uT*.14+i*3.1);
      P+=vec3(snoise(q),snoise(q+vec3(17.1,3.3,0.)),snoise(q+vec3(41.7,9.2,0.)))*k*.5; }
    vec3 j=aR.xyz-.5;
    P+=uPoint*j*.045*(1.-w4*.75);
    P+=uPoint*vec3(sin(uT*.7+aR.x*40.),cos(uT*.6+aR.y*40.),sin(uT*.5+aR.z*40.))*.018;
    P+=uPoint*w1*aChaos*(j*2.6+vec3(sin(uT*.5+aR.x*50.),cos(uT*.4+aR.y*50.),sin(uT*.6+aR.z*50.))*.22);
    P+=uPoint*w2*j*.07;
    P+=uPoint*w5*j*.05;
    P+=uPoint*gTr*j*.4;
    // вход: облако собирается из разлёта
    float it=clamp(uIntro*1.6-aR.w*.6,0.,1.); it=it*it*(3.-2.*it);
    P=mix(normalize(j+vec3(.001))*(5.+aR.w*9.)+vec3(0.,0.,2.),P,it);
    return P;
  }`;

  const uni = {
    uP: { value: 0 }, uT: { value: 0 }, uSwirl: { value: reduce ? 0.2 : 1 }, uVel: { value: 0 }, uIntro: { value: reduce ? 1 : 0 },
    uNum: { value: new THREE.Vector3(0, 0, 6) }, uScale: { value: 1 }, uFocus: { value: 7 }, uAp: { value: 1 },
    uRect: { value: new THREE.Vector4(0.5, 0.5, 0, 0) }, uYield: { value: 0 },
    cA: { value: new THREE.Color("#1f3cff") }, cB: { value: new THREE.Color("#4a96ff") }, cC: { value: new THREE.Color("#7a5cff") },
  };

  const points = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: { ...uni, uPoint: { value: 1 }, uSize: { value: lite ? 0.021 : 0.0175 }, uOp: { value: 0.4 } },
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: FORM + /* glsl */`
      uniform float uScale,uFocus,uAp,uSize,uYield; uniform vec4 uRect; uniform vec3 cA,cB,cC;
      varying vec3 vC; varying float vA; varying float vS;
      void main(){
        vec3 P=form(); vec4 mv=modelViewMatrix*vec4(P,1.); gl_Position=projectionMatrix*mv;
        float z=max(.2,-mv.z);
        float hot=step(.94,aR.w);
        float solid=clamp(w2*.95+w4*.45+w0*.5+w1*.3+w5*.6,0.,1.);
        float s=uSize*(.55+aR.w*.9+hot*1.5)*(1.+solid*.75)*(.86+.2*sin(uT*(1.2+aR.x*2.)+aR.y*40.));
        float base=s*uScale/z;
        float coc=abs(z-uFocus)*uAp*uScale*.0042*(1.+max(0.,uFocus-z)*.55);
        float size=max(1.4,base+coc);
        float en=clamp(base*base/(size*size),0.,1.);
        float fog=exp(-max(0.,z-uFocus)*mix(.07,.018,w3));
        float back=smoothstep(-1.3,2.3,z-uFocus);
        float vol=mix(mix(1.45,.26,back),1.,max(w3,w4));               // ближняя сторона ярче, дальняя уходит в тень
        vA=mix(en,sqrt(en),.2)*fog*(1.+hot*1.6)*vol;
        vS=solid*smoothstep(.45,.9,base/size)*smoothstep(3.,7.,size);
        // сцена уступает тексту: внутри блока точки тише и мельче
        vec2 uv=gl_Position.xy/gl_Position.w*.5+.5;
        vec2 dd=abs(uv-uRect.xy)-uRect.zw; float ins=1.-smoothstep(0.,.17,length(max(dd,0.)));
        float y=ins*uYield;
        vA*=mix(1.,.05,y); size*=mix(1.,.62,y);
        gl_PointSize=min(size,uScale*.2);
        float t=clamp(.5+P.y*.2+(aR.y-.5)*.7,0.,1.);
        vec3 col=mix(cA,cB,smoothstep(0.,.6,t)); col=mix(col,cC,smoothstep(.6,1.,t)*.8);
        col=mix(col,cB,max(w3,w4)*.55);
        col*=.8+.5*aR.x;
        vC=mix(col,vec3(1.),hot*.38+gTr*.06+w4*.5);
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
  const OP = +(Q.get("op") || (lite ? 0.54 : 0.4));

  /* ---- структурные грани: линии по той же сетке ---- */
  function makeLines(rowStep, colStep, op, isCol) {
    const idx = [];
    if (!isCol) { for (let j = 0; j < V; j += rowStep) for (let i = 0; i < U - 1; i++) idx.push(j * U + i, j * U + i + 1); }
    else {
      for (let i = 0; i < U; i += colStep) for (let j = 0; j < V - 1; j++) idx.push(j * U + i, (j + 1) * U + i);
      if ((U - 1) % colStep) for (let j = 0; j < V - 1; j++) idx.push(j * U + U - 1, (j + 1) * U + U - 1);
    }
    const g = new THREE.BufferGeometry();
    for (const n of ["position", "p1", "p2", "p3", "p4", "p5", "aUV", "aR", "aChaos"]) g.setAttribute(n, geo.getAttribute(n));
    g.setIndex(idx); g.boundingSphere = geo.boundingSphere;
    const m = new THREE.ShaderMaterial({
      uniforms: { ...uni, uPoint: { value: 0 }, uOp: { value: op }, uCol: { value: isCol ? 0 : 1 } },
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
      vertexShader: FORM + /* glsl */`
        uniform float uFocus,uCol,uAp,uYield; uniform vec4 uRect; uniform vec3 cA,cB; varying vec3 vC; varying float vA;
        void main(){ vec3 P=form(); vec4 mv=modelViewMatrix*vec4(P,1.); gl_Position=projectionMatrix*mv; float z=-mv.z;
          float coc=abs(z-uFocus)*uAp;
          vA=(1.-w1*aChaos*.92)*(1.-gTr*.85)*(1.-w4)*exp(-max(0.,z-uFocus)*mix(.11,.03,w3))*smoothstep(.3,1.6,z)/(1.+coc*coc*.9);
          vA*=uIntro*uIntro*uIntro;
          vec2 uv=gl_Position.xy/gl_Position.w*.5+.5; vec2 dd=abs(uv-uRect.xy)-uRect.zw; vA*=mix(1.,.08,(1.-smoothstep(0.,.17,length(max(dd,0.))))*uYield);
          float t=clamp(.5+P.y*.2,0.,1.); vC=mix(mix(cA,cB,t),vec3(1.),.12); }`,
      fragmentShader: /* glsl */`uniform float uOp; varying vec3 vC; varying float vA; void main(){ gl_FragColor=vec4(vC*vA*uOp,1.); }`,
    });
    const l = new THREE.LineSegments(g, m); l.frustumCulled = false; l.userData.op = op; scene.add(l); return l;
  }
  const lineSets = [makeLines(lite ? 7 : 6, 0, 0.42, false), makeLines(0, lite ? 15 : 19, 0.26, true)];

  /* ---- воздух: дальняя пыль и редкое ближнее боке ---- */
  {
    const M = lite ? 600 : 1400, pos = new Float32Array(M * 3), sz = new Float32Array(M);
    for (let i = 0; i < M; i++) {
      const near = i < (lite ? 3 : 6), r = near ? 2.4 + rnd() * 3 : 9 + rnd() * 26, th = rnd() * TAU, ph = Math.acos(2 * rnd() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.cos(ph) * 0.65; pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) + (near ? 3.2 : 0);
      sz[i] = near ? 0.05 + rnd() * 0.06 : 0.02 + rnd() * 0.05;
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
          float soft=smoothstep(.5,.0,d); float disc=smoothstep(.5,.42,d)*(.55+.45*smoothstep(.2,.5,d));
          gl_FragColor=vec4(vec3(.5,.68,1.)*mix(soft*soft,disc,clamp(vB*.5,0.,1.))*vA,1.); }`,
    }));
    dust.frustumCulled = false; scene.add(dust);
  }


  /* ---- литой объект: одна гладкая форма, которая перетекает из состояния в состояние (трассировка поля расстояний) ---- */
  const solidU = { uCam: { value: new THREE.Vector3() }, uInv: { value: new THREE.Matrix4() }, uT: uni.uT, uIntro: uni.uIntro, uW: { value: [1, 0, 0, 0, 0, 0] } };
  const solid = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: solidU, transparent: true, depthTest: false, depthWrite: false,
    vertexShader: `varying vec2 vN; void main(){ vN=position.xy; gl_Position=vec4(position.xy,0.,1.); }`,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform vec3 uCam; uniform mat4 uInv; uniform float uT,uIntro; uniform float uW[6]; varying vec2 vN;
      #define STEPS ${lite ? 44 : 72}
      float sdSphere(vec3 p){ return length(p)-2.28+.15*sin(2.6*p.x+uT*.5)*sin(2.3*p.y+uT*.62)*sin(2.8*p.z+uT*.41); }
      float sdFunnel(vec3 p){ float v=clamp((2.5-p.y)/5.2,0.,1.); float r=.06+2.9*pow(1.-v,2.3);
        float shell=abs(length(p.xz)-r)-.045-.03*v; return max(shell,max(p.y-2.5,-2.7-p.y))*.5; }
      float sdHelix(vec3 p){ float a=p.y*2.432+uT*.13; float c=cos(a),s=sin(a); vec2 q=vec2(c*p.x+s*p.z,-s*p.x+c*p.z);
        float d=min(length(q-vec2(1.05,0.)),length(q+vec2(1.05,0.)))-.21;
        float yy=mod(p.y+.31,.62)-.31; d=min(d,max(length(vec2(yy,q.y))-.05,abs(q.x)-1.05));
        return max(d,abs(p.y)-3.25)*.45; }
      float sdWave(vec3 p){ float h=-1.25+sin(p.x*.55+uT*.55)*.34+sin(p.z*.42-uT*.8)*.42+sin((p.x+p.z)*.23+uT*.35)*.3; return max((p.y-h)*.55,p.z-6.); }
      float sdRing(vec3 p){ float a=uT*.045; float c=cos(a),s=sin(a); p.xy=vec2(c*p.x-s*p.y,s*p.x+c*p.y);
        float d=length(vec2(length(p.xy)-2.5,p.z))-.2+.02*sin(atan(p.y,p.x)*9.+uT*.6);
        d=min(d,length(vec2(length(p.xy)-2.2,p.z+3.2))-.07); d=min(d,length(vec2(length(p.xy)-1.95,p.z+7.))-.05); return d; }
      float map(vec3 p){ float d=0.;
        if(uW[0]>.001)d+=uW[0]*sdSphere(p); if(uW[1]>.001)d+=uW[1]*sdFunnel(p); if(uW[2]>.001)d+=uW[2]*sdHelix(p);
        if(uW[3]>.001)d+=uW[3]*sdWave(p); if(uW[4]>.001)d+=uW[4]*6.; if(uW[5]>.001)d+=uW[5]*sdRing(p);
        return d+(1.-uIntro)*2.4; }
      vec3 nrm(vec3 p){ vec2 e=vec2(.004,-.004); return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx)); }
      vec3 env(vec3 r){                                   // студийный свет: тёплый ключ, холодный контровой, полоса софтбокса
        float key=smoothstep(.72,.985,dot(r,normalize(vec3(-.55,.72,.42))));
        float rim=smoothstep(.55,.96,dot(r,normalize(vec3(.85,.12,-.5))));
        float strip=smoothstep(.07,0.,abs(r.y-.18-.12*sin(r.x*2.4+1.)))*smoothstep(-.9,.2,r.z);
        float sky=smoothstep(-.3,.9,r.y);
        return vec3(.012,.02,.06)*(.3+sky)+vec3(1.,.8,.5)*key*2.6+vec3(.22,.48,1.)*rim*2.+vec3(.55,.72,1.)*strip*.9; }
      void main(){
        vec4 a=uInv*vec4(vN,-1.,1.), b=uInv*vec4(vN,1.,1.); vec3 ro=uCam, rd=normalize(b.xyz/b.w-a.xyz/a.w);
        float t=.6, d=0.; bool hit=false;
        for(int i=0;i<STEPS;i++){ d=map(ro+rd*t); if(d<.0025*t){hit=true;break;} t+=d; if(t>44.)break; }
        if(!hit){ gl_FragColor=vec4(0.); return; }
        vec3 p=ro+rd*t, n=nrm(p); float nv=max(dot(n,-rd),0.), fr=pow(1.-nv,4.);
        float ao=clamp(.35+.65*(map(p+n*.35)/.35),0.,1.)*clamp(.5+.5*(map(p+n*.9)/.9),0.,1.);
        vec3 L=normalize(vec3(-.55,.72,.42)); float dif=max(dot(n,L),0.);
        vec3 base=mix(vec3(.008,.014,.05),vec3(.02,.06,.24),.5+.5*n.y);
        vec3 col=base*(.3+1.1*dif)*ao;
        col+=env(reflect(rd,n))*(.1+.9*fr)*mix(.55,1.,ao);
        col+=vec3(.16,.4,1.)*fr*.55+vec3(.3,.2,1.)*pow(fr,2.)*.35;        // холодная кромка с фиолетовым отливом
        col*=mix(1.,.34,uW[3]);                                          // волна темнее: работает бликами, а не заливкой
        col*=exp(-max(0.,t-mix(9.,6.,uW[3]))*mix(.085,.16,uW[3]));                                    // глубина: дальнее уходит в темноту
        float edge=smoothstep(44.,30.,t);
        gl_FragColor=vec4(col*edge,edge);
      }`,
  }));
  solid.frustumCulled = false; solid.renderOrder = -1; scene.add(solid);

  /* ---- постобработка: свечение в HDR, линза, тональная кривая в самом конце ---- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), +(Q.get("bs") || (lite ? 0.3 : 0.36)), +(Q.get("br") || 0.5), +(Q.get("bt") || 0.5));
  composer.addPass(bloom);
  const lens = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uCA: { value: 0.01 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uCA; varying vec2 vUv;
      void main(){ vec2 c=vUv-.5; vec2 o=c*dot(c,c)*uCA;
        gl_FragColor=vec4(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b,1.); }`,
  });
  composer.addPass(lens);
  composer.addPass(new OutputPass());

  /* ---- камера по главам: [позиция], [цель] ---- */
  const CAM = {
    wide: [
      [[0, 0.1, 7.9], [0, 0.05, 0]],
      [[0.4, 0.9, 8.6], [-2.35, -0.1, 0]],
      [[-0.6, -0.4, 7.2], [2.0, 0, 0]],
      [[0, 0.55, 5.8], [0, -0.35, -7]],
      [[0, 0, 9], [0, 0, 0]],
      [[0.7, 0.12, 7.3], [-1.75, -0.45, 0]],
    ],
    tall: [
      [[0, 0.1, 10.6], [0, -0.2, 0]],
      [[0, 0.6, 12], [0, -2.2, 0]],
      [[0, 0, 12], [0, -3.6, 0]],
      [[0, 0.8, 6.2], [0, 0.2, -7]],
      [[0, 0, 9], [0, 0, 0]],
      [[0, 0.1, 12.6], [0, -0.3, 0]],
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
    camera.aspect = W / H; camera.fov = W / H < 0.85 ? 52 : 46; camera.updateProjectionMatrix();
    uni.uScale.value = (H * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
    K = keys();
  }

  /* ---- цикл ---- */
  const clock = new THREE.Clock();
  let t = 0, running = true, pS = 0, vel = 0, lastY = scrollY, intro = reduce ? 1 : 0, introGo = false, yieldS = 0;
  let acc = 0, frames = 0, cool = 0;
  const rect = { x: 0.5, y: 0.5, w: 0, h: 0 };

  function frame() {
    if (!running) return;
    const raw = clock.getDelta(), dt = Math.min(0.05, raw), dte = Math.min(0.25, raw);
    t += dt * (reduce ? 0.3 : 1);

    // прокрутка → состояние: сначала форма стоит (HOLD), потом медленно перетекает
    const { k, f } = rawProgress();
    const target = k + ss(HOLD, 1, f);
    pS = damp(pS, target, 3.0, dte); if (Math.abs(target - pS) < 0.0003) pS = target;
    const i = Math.min(N_CH - 2, Math.floor(pS)), h = pS - i, env = Math.sin(Math.PI * Math.min(1, h));
    uni.uP.value = pS; uni.uT.value = t;

    // скорость прокрутки: быстро нарастает, медленно отпускает
    const dy = (scrollY - lastY) / Math.max(1, VHpx); lastY = scrollY;
    const v = Math.min(1, Math.abs(dy) * 14); vel = damp(vel, v, v > vel ? 9 : 2.2, dte);
    uni.uVel.value = reduce ? 0 : vel;

    if (introGo && intro < 1) { intro = Math.min(1, intro + dte / 3.0); const e = intro < 0.5 ? 2 * intro * intro : 1 - Math.pow(-2 * intro + 2, 2) / 2; uni.uIntro.value = e; }

    mouse.sx = damp(mouse.sx, mouse.x, 2.2, dte); mouse.sy = damp(mouse.sy, mouse.y, 2.2, dte);
    camPos.lerpVectors(K[i][0], K[i + 1][0], h); camTgt.lerpVectors(K[i][1], K[i + 1][1], h);
    camPos.z += env * 0.75 + (1 - uni.uIntro.value) * 2.2; camPos.y += env * 0.18;
    camPos.x += Math.sin(t * 0.21) * 0.1; camPos.y += Math.cos(t * 0.17) * 0.07;
    camera.position.copy(camPos); camera.lookAt(camTgt);
    right.setFromMatrixColumn(camera.matrixWorld, 0); up.setFromMatrixColumn(camera.matrixWorld, 1);
    const wNum = Math.max(0, 1 - Math.abs(pS - 4)), par = 1 - wNum * 0.7;
    camera.position.addScaledVector(right, mouse.sx * 0.55 * par).addScaledVector(up, -mouse.sy * 0.36 * par);
    camera.lookAt(camTgt); camera.rotation.z += mouse.sx * -0.01 * par;

    const wWave = Math.max(0, 1 - Math.abs(pS - 3));
    const dist = tmp.copy(camera.position).sub(camTgt).length();
    uni.uFocus.value = THREE.MathUtils.lerp(dist, 5.2, wWave * 0.75);
    uni.uAp.value = 1.0 + env * 0.55 - wNum * 0.6;

    // число «100+» садится ровно в свой блок на странице
    if (wNum > 0.001 && numEl100) {
      const r = numEl100.getBoundingClientRect(), wpp = (2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)) / H;
      const wpx = Math.min(r.width * 0.94, (r.height * 1.02) / numPts.aspect);
      uni.uNum.value.set((r.left + r.width / 2 - W / 2) * wpp, -(r.top + r.height / 2 - H / 2) * wpp, wpx * wpp);
    }

    // текст активной главы: сцена под ним гаснет
    const el = yields[f < 0.66 ? k : Math.min(N_CH - 1, k + 1)];
    if (el) {
      const r = el.getBoundingClientRect();
      rect.x = (r.left + r.width / 2) / W; rect.y = 1 - (r.top + r.height / 2) / H; rect.w = r.width / W / 2; rect.h = r.height / H / 2;
      uni.uRect.value.set(rect.x, rect.y, rect.w, rect.h);
    }
    yieldS = damp(yieldS, (1 - env * 0.6) * (1 - wNum), 3, dte); uni.uYield.value = yieldS * uni.uIntro.value;

    // веса состояний для литого объекта; точки и линии уходят в фон, кроме числа
    const WT = solidU.uW.value; for (let j = 0; j < 6; j++) { const x = Math.max(0, 1 - Math.abs(pS - j)); WT[j] = x * x * (3 - 2 * x); }
    { const sum = WT.reduce((a, b) => a + b, 0) || 1; for (let j = 0; j < 6; j++) WT[j] /= sum; }
    points.material.uniforms.uOp.value = OP * (0.1 + 0.9 * WT[4]);
    lineSets.forEach((l) => { l.material.uniforms.uOp.value = l.userData.op * (0.16 + 0.5 * WT[5]) * (1 - WT[4]); });
    solidU.uCam.value.copy(camera.position); camera.updateMatrixWorld();
    solidU.uInv.value.copy(camera.matrixWorld).multiply(camera.projectionMatrixInverse);

    lens.uniforms.uCA.value = reduce ? 0 : 0.008 + env * 0.012 + vel * 0.012;

    // «магнит» кнопки и курсор
    if (fine) {
      mouse.cx = damp(mouse.cx, mouse.px, 14, dte); mouse.cy = damp(mouse.cy, mouse.py, 14, dte);
      cur.style.transform = `translate3d(${mouse.cx.toFixed(1)}px,${mouse.cy.toFixed(1)}px,0)`;
      mag.x = damp(mag.x, mag.tx, 7, dte); mag.y = damp(mag.y, mag.ty, 7, dte);
      if (goBtn) goBtn.style.translate = `${mag.x.toFixed(1)}px ${mag.y.toFixed(1)}px`;
    }
    root.style.setProperty("--mx", mouse.sx.toFixed(4)); root.style.setProperty("--my", mouse.sy.toFixed(4));
    ui(k, f);
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
  { const p = rawProgress(); pS = p.k + ss(HOLD, 1, p.f); }
  if (Q.has("p")) { /* служебное: зафиксировать состояние для снимков */ }
  return {
    resize,
    warm: () => (renderer.compileAsync ? renderer.compileAsync(scene, camera).then(() => { composer.render(); }) : Promise.resolve(composer.render())),
    intro: () => { introGo = true; requestAnimationFrame(frame); },
  };
}
