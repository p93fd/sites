import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

/* ============================================================
   Одна система частиц. Пять форм. Прокрутка перетекает форму в форму.
   сфера → воронка → спираль ДНК → волна-горизонт → галактика
   ============================================================ */

const canvas = document.getElementById("gl");
const root = document.documentElement;
const N_CH = 5;
const LABELS = ["Система", "Фокус", "Архитектура", "Управление", "Стратегия"];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = () => innerWidth < 820;
const lite = small() || (navigator.hardwareConcurrency || 8) <= 4;

/* ---------- renderer ---------- */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
const DPR = Math.min(devicePixelRatio || 1, lite ? 1.5 : 1.75);
renderer.setPixelRatio(DPR);
renderer.setClearColor(0x05060b, 1);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);

/* ---------- сетка u×v: одни и те же точки собирают все пять форм ---------- */
const U = lite ? 150 : 230, V = lite ? 92 : 124, N = U * V;
const P = [0, 1, 2, 3, 4].map(() => new Float32Array(N * 3));
const aUV = new Float32Array(N * 2), aR = new Float32Array(N * 4), aChaos = new Float32Array(N);
const TAU = Math.PI * 2;
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

for (let j = 0; j < V; j++) for (let i = 0; i < U; i++) {
  const k = j * U + i, u = i / (U - 1), v = j / (V - 1), o = k * 3;
  aUV[k * 2] = u; aUV[k * 2 + 1] = v;
  aR[k * 4] = rnd(); aR[k * 4 + 1] = rnd(); aR[k * 4 + 2] = rnd(); aR[k * 4 + 3] = rnd();

  // 0 — сфера: широты и меридианы
  { const th = u * TAU, ph = Math.acos(1 - 2 * (0.012 + v * 0.976)), R = 2.25;
    P[0][o] = R * Math.sin(ph) * Math.cos(th); P[0][o + 1] = R * Math.cos(ph); P[0][o + 2] = R * Math.sin(ph) * Math.sin(th); }

  // 1 — воронка: сверху широко и разбросано, книзу один чистый поток
  { const y = 2.5 - v * 5.2, r = 0.05 + 2.9 * Math.pow(1 - v, 2.3), th = u * TAU + v * 5.5;
    P[1][o] = r * Math.cos(th); P[1][o + 1] = y; P[1][o + 2] = r * Math.sin(th);
    aChaos[k] = Math.pow(1 - v, 1.5); }

  // 2 — двойная спираль: две нити и перекладины между ними
  { const y = (v - 0.5) * 6.2, th = v * TAU * 2.4, s = 2 * u - 1;
    const e = Math.sign(s) * Math.pow(Math.abs(s), 0.3), R = 1.05;
    P[2][o] = Math.cos(th) * e * R; P[2][o + 1] = y; P[2][o + 2] = Math.sin(th) * e * R; }

  // 3 — волна до горизонта (движение добавляется в шейдере)
  { P[3][o] = (u - 0.5) * 17; P[3][o + 1] = -1.25; P[3][o + 2] = 3.2 - Math.pow(v, 1.25) * 24; }

  // 4 — галактика: три рукава, каждая линия — дорожка рукава
  { const arm = Math.min(2, Math.floor(v * 3)), lane = v * 3 - arm - 0.5;
    const r = 0.22 + Math.pow(u, 0.82) * 3.7, th = arm * TAU / 3 + u * 4.6 + lane * (0.95 - u * 0.45);
    P[4][o] = r * Math.cos(th); P[4][o + 1] = lane * 0.2 * (1 - u) * (1 - u); P[4][o + 2] = r * Math.sin(th); }
}

const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(P[0], 3));
for (let f = 1; f < 5; f++) geo.setAttribute("p" + f, new THREE.BufferAttribute(P[f], 3));
geo.setAttribute("aUV", new THREE.BufferAttribute(aUV, 2));
geo.setAttribute("aR", new THREE.BufferAttribute(aR, 4));
geo.setAttribute("aChaos", new THREE.BufferAttribute(aChaos, 1));
geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);

/* ---------- общий шейдер формы ---------- */
const FORM = /* glsl */`
attribute vec3 p1,p2,p3,p4; attribute vec2 aUV; attribute vec4 aR; attribute float aChaos;
uniform float uP,uT,uPoint,uSwirl;
float w0,w1,w2,w3,w4,gTr;
vec3 rotY(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
vec3 form(){
  float i=floor(uP),f=uP-i;
  float delay=aUV.y*.34+.08+.08*sin(aUV.x*6.2832);
  float ff=clamp(f*1.5-delay,0.,1.); ff=ff*ff*ff*(ff*(ff*6.-15.)+10.);
  float pe=i+ff;
  w0=max(0.,1.-abs(pe));w1=max(0.,1.-abs(pe-1.));w2=max(0.,1.-abs(pe-2.));w3=max(0.,1.-abs(pe-3.));w4=max(0.,1.-abs(pe-4.));
  vec3 a=rotY(position,uT*.085)*(1.+sin(uT*.9)*.03);
  vec3 b=rotY(p1,uT*.11);
  vec3 c=rotY(p2,uT*.2);
  vec3 d=p3; float far=smoothstep(3.,-21.,d.z);
  d.y+=sin(d.x*.55+uT*.55)*.34+sin(d.z*.42-uT*.8)*.42*(1.-far*.4)+sin((d.x+d.z)*.23+uT*.35)*.3;
  vec3 e=rotY(p4,uT*.06);
  vec3 P=a*w0+b*w1+c*w2+d*w3+e*w4;
  gTr=sin(3.14159*ff);
  P+=gTr*uSwirl*vec3(sin(aUV.y*8.+uT*.6+aUV.x*6.2832),cos(aUV.x*12.566+uT*.45+aUV.y*3.),sin(aUV.y*6.-uT*.5+aUV.x*6.2832))*.75;
  vec3 j=aR.xyz-.5;
  P+=uPoint*j*.05;
  P+=uPoint*w1*aChaos*(j*2.6+vec3(sin(uT*.5+aR.x*50.),cos(uT*.4+aR.y*50.),sin(uT*.6+aR.z*50.))*.22);
  P+=uPoint*w2*j*.09;
  P+=uPoint*w4*j*vec3(.55,.16,.55)*(.25+aUV.x);
  P+=uPoint*gTr*j*.9;
  return P;
}`;

const uni = {
  uP: { value: 0 }, uT: { value: 0 }, uSwirl: { value: reduce ? 0.25 : 1 },
  uScale: { value: 1 }, uFocus: { value: 7 }, uAp: { value: 1 },
  cA: { value: new THREE.Color("#3f5cff") }, cB: { value: new THREE.Color("#76B7FF") }, cC: { value: new THREE.Color("#9A7BFF") },
};

const points = new THREE.Points(geo, new THREE.ShaderMaterial({
  uniforms: { ...uni, uPoint: { value: 1 }, uSize: { value: lite ? 0.021 : 0.017 }, uOp: { value: lite ? 0.42 : 0.3 } },
  transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  vertexShader: FORM + /* glsl */`
    uniform float uScale,uFocus,uAp,uSize; uniform vec3 cA,cB,cC; varying vec3 vC; varying float vA;
    void main(){
      vec3 P=form(); vec4 mv=modelViewMatrix*vec4(P,1.); gl_Position=projectionMatrix*mv;
      float z=max(.2,-mv.z);
      float hot=step(.94,aR.w);
      float s=uSize*(.55+aR.w*.9+hot*1.6);
      float base=s*uScale/z;
      float coc=abs(z-uFocus)*uAp*uScale*.0042*(1.+max(0.,uFocus-z)*.55);
      float size=max(1.4,base+coc);
      gl_PointSize=min(size,uScale*.22);
      float en=clamp(base*base/(size*size),0.,1.);
      vA=mix(en,sqrt(en),.2)*exp(-max(0.,z-uFocus)*mix(.07,.018,w3))*(1.+hot*1.1);
      float t=clamp(.5+P.y*.2+(aR.y-.5)*.7,0.,1.);
      vec3 col=mix(cA,cB,smoothstep(0.,.6,t)); col=mix(col,cC,smoothstep(.55,1.,t)*.9);
      col=mix(col,cB,w3*.5);
      vC=mix(col,vec3(1.),hot*.75+gTr*.12);
    }`,
  fragmentShader: /* glsl */`
    uniform float uOp; varying vec3 vC; varying float vA;
    void main(){ float d=length(gl_PointCoord-.5); if(d>.5)discard;
      float a=smoothstep(.5,0.,d); a=a*a*(1.+a*.8);
      gl_FragColor=vec4(vC*a*vA*uOp,1.); }`,
}));
points.frustumCulled = false;
scene.add(points);

/* ---------- структурные грани: линии по той же сетке ---------- */
function lineIndex(rowStep, colStep) {
  const rows = [], cols = [];
  for (let j = 0; j < V; j += rowStep) for (let i = 0; i < U - 1; i++) rows.push(j * U + i, j * U + i + 1);
  for (let i = 0; i < U; i += colStep) for (let j = 0; j < V - 1; j++) cols.push(j * U + i, (j + 1) * U + i);
  if ((U - 1) % colStep) for (let j = 0; j < V - 1; j++) cols.push(j * U + U - 1, (j + 1) * U + U - 1);
  return [rows, cols];
}
const [rowIdx, colIdx] = lineIndex(lite ? 7 : 6, lite ? 15 : 19);
function makeLines(idx, op) {
  const g = new THREE.BufferGeometry();
  for (const n of ["position", "p1", "p2", "p3", "p4", "aUV", "aR", "aChaos"]) g.setAttribute(n, geo.getAttribute(n));
  g.setIndex(idx); g.boundingSphere = geo.boundingSphere;
  const m = new THREE.ShaderMaterial({
    uniforms: { ...uni, uPoint: { value: 0 }, uOp: { value: op }, uCol: { value: 1 } },
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: FORM + /* glsl */`
      uniform float uFocus,uCol; uniform vec3 cA,cB,cC; varying vec3 vC; varying float vA;
      void main(){ vec3 P=form(); vec4 mv=modelViewMatrix*vec4(P,1.); gl_Position=projectionMatrix*mv;
        float z=-mv.z;
        vA=(1.-w1*aChaos*.92)*(1.-gTr*.8)*exp(-max(0.,z-uFocus)*mix(.11,.03,w3))*smoothstep(.3,1.6,z)*mix(1.,1.-w4,1.-uCol);
        float t=clamp(.5+P.y*.2,0.,1.); vC=mix(mix(cA,cB,t),vec3(1.),.22); }`,
    fragmentShader: /* glsl */`uniform float uOp; varying vec3 vC; varying float vA;
      void main(){ gl_FragColor=vec4(vC*vA*uOp,1.); }`,
  });
  const l = new THREE.LineSegments(g, m); l.frustumCulled = false; scene.add(l); return l;
}
const rowLines = makeLines(rowIdx, 0.3);
const colLines = makeLines(colIdx, 0.17);
colLines.material.uniforms.uCol.value = 0;

/* ---------- воздух: дальняя пыль и ближнее боке ---------- */
{
  const M = lite ? 700 : 1500, pos = new Float32Array(M * 3), sz = new Float32Array(M);
  for (let i = 0; i < M; i++) {
    const near = i < (lite ? 8 : 16);
    const r = near ? 2.2 + rnd() * 3 : 9 + rnd() * 26, th = rnd() * TAU, ph = Math.acos(2 * rnd() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.cos(ph) * (near ? 0.7 : 0.6); pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) + (near ? 3.2 : 0);
    sz[i] = near ? 0.05 + rnd() * 0.07 : 0.02 + rnd() * 0.05;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aS", new THREE.BufferAttribute(sz, 1));
  const dust = new THREE.Points(g, new THREE.ShaderMaterial({
    uniforms: { uScale: uni.uScale, uFocus: uni.uFocus, uT: uni.uT },
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`attribute float aS; uniform float uScale,uFocus,uT; varying float vA; varying float vB;
      void main(){ vec3 p=position; p.y+=sin(uT*.12+position.x*.7)*.25; p.x+=cos(uT*.09+position.z*.5)*.25;
        vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; float z=max(.3,-mv.z);
        float base=aS*uScale/z; float coc=max(0.,uFocus-z)*uScale*.012; float size=max(1.2,base+coc);
        gl_PointSize=min(size,uScale*.16); vB=clamp(coc/(base+.001),0.,6.);
        vA=clamp(base*base/(size*size),0.,1.)*(z>uFocus? .5*exp(-(z-uFocus)*.03) : .5)*smoothstep(.4,1.5,z); }`,
    fragmentShader: /* glsl */`varying float vA; varying float vB;
      void main(){ float d=length(gl_PointCoord-.5); if(d>.5)discard;
        float soft=smoothstep(.5,.0,d); float disc=smoothstep(.5,.42,d)*(.55+.45*smoothstep(.2,.5,d));
        float a=mix(soft*soft,disc,clamp(vB*.5,0.,1.));
        gl_FragColor=vec4(vec3(.52,.68,1.)*a*vA,1.); }`,
  }));
  dust.frustumCulled = false; scene.add(dust);
}

/* ---------- постобработка ---------- */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), lite ? 0.55 : 0.7, 0.8, 0.24);
composer.addPass(bloom);
composer.addPass(new OutputPass());

/* ---------- камера по главам: [позиция], [цель]; на узком экране — свои ---------- */
const CAM = {
  wide: [
    [[0, 0.15, 7.6], [0, 0, 0]],
    [[0.4, 0.9, 8.4], [-2.05, -0.1, 0]],
    [[-0.6, -0.4, 7.0], [1.75, 0, 0]],
    [[0, 0.55, 5.8], [0, -0.55, -7]],
    [[0, 4.6, 6.6], [0, -0.75, 0]],
  ],
  tall: [
    [[0, 0.1, 10.8], [0, 0, 0]],
    [[0, 0.6, 11.5], [0, -1.6, 0]],
    [[0, 0, 10.4], [0, -1.5, 0]],
    [[0, 0.7, 6.2], [0, -0.3, -7]],
    [[0, 6.4, 9.4], [0, -0.4, 0]],
  ],
};
const v3 = (a) => new THREE.Vector3(...a);
const keys = () => (innerWidth / innerHeight < 0.85 ? CAM.tall : CAM.wide).map(([p, t]) => [v3(p), v3(t)]);
let K = keys();
const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3(), tmp = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3();

/* ---------- прокрутка ---------- */
let VH = innerHeight, STEP = VH * 1.3;
const track = document.getElementById("track");
const chapters = [...document.querySelectorAll(".ch")];
const railBtns = [...document.querySelectorAll(".rail button")];
const numEl = document.getElementById("num"), labEl = document.getElementById("lab");
let pT = 0, pS = 0, cur = -1;
const mouse = { x: 0, y: 0, sx: 0, sy: 0 };

function layout(force) {
  if (force || Math.abs(innerHeight - VH) > 160 || !layout.w || layout.w !== innerWidth) {
    VH = innerHeight; STEP = VH * 1.3; layout.w = innerWidth;
    track.style.height = (STEP * (N_CH - 1) + VH) + "px";
    K = keys();
  }
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); composer.setSize(w, h);
  bloom.resolution.set(w * (lite ? 0.5 : 1), h * (lite ? 0.5 : 1));
  camera.aspect = w / h; camera.fov = w / h < 0.85 ? 52 : 46; camera.updateProjectionMatrix();
  uni.uScale.value = h * DPR / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
}
const readScroll = () => { pT = Math.min(N_CH - 1, Math.max(0, scrollY / STEP)); if (scrollY > 40) document.body.classList.add("moved"); else document.body.classList.remove("moved"); };
const go = (k) => scrollTo({ top: Math.round(k * STEP), behavior: reduce ? "auto" : "smooth" });
document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(+b.dataset.go)));
addEventListener("scroll", readScroll, { passive: true });
addEventListener("resize", () => { layout(); readScroll(); });
addEventListener("keydown", (e) => {
  const k = Math.round(pT);
  if (["ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(Math.min(N_CH - 1, k + 1)); }
  if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); go(Math.max(0, k - 1)); }
});
addEventListener("pointermove", (e) => { if (e.pointerType === "touch") return; mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });

const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function ui(p) {
  for (let k = 0; k < N_CH; k++) {
    const el = chapters[k], d = p - k, ad = Math.abs(d), a = 1 - ss(0.16, 0.46, ad);
    const on = a > 0.002;
    if (on !== el._on) { el._on = on; el.classList.toggle("on", on); }
    const live = a > 0.6;
    if (live !== el._live) { el._live = live; el.classList.toggle("live", live); }
    if (!on) continue;
    el.style.setProperty("--d", d.toFixed(4)); el.style.setProperty("--ad", ad.toFixed(4)); el.style.setProperty("--a", a.toFixed(3));
  }
  const k = Math.round(p);
  if (k !== cur) {
    cur = k; numEl.textContent = "0" + (k + 1); labEl.textContent = LABELS[k];
    railBtns.forEach((b, i) => b.setAttribute("aria-current", i === k ? "true" : "false"));
  }
  root.style.setProperty("--prog", (p / (N_CH - 1)).toFixed(4));
}

/* ---------- кадр ---------- */
const clock = new THREE.Clock();
let t = 0, running = true;
document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) { clock.getDelta(); requestAnimationFrame(frame); } });

function frame() {
  if (!running) return;
  const raw = clock.getDelta(), dt = Math.min(0.05, raw), dte = Math.min(0.4, raw);
  t += dt * (reduce ? 0.35 : 1);
  const ease = 1 - Math.pow(0.0012, dte);
  pS += (pT - pS) * ease; if (Math.abs(pT - pS) < 0.0004) pS = pT;
  mouse.sx += (mouse.x - mouse.sx) * (1 - Math.pow(0.02, dte)); mouse.sy += (mouse.y - mouse.sy) * (1 - Math.pow(0.02, dte));

  const i = Math.min(N_CH - 2, Math.floor(pS)), f = pS - i, h = ss(0.14, 0.86, f);
  uni.uP.value = i + h; uni.uT.value = t;

  camPos.lerpVectors(K[i][0], K[i + 1][0], h); camTgt.lerpVectors(K[i][1], K[i + 1][1], h);
  const arc = Math.sin(Math.PI * h); camPos.z += arc * 1.5; camPos.y += arc * 0.35;      // отлёт между формами
  camPos.x += Math.sin(t * 0.21) * 0.12; camPos.y += Math.cos(t * 0.17) * 0.08;          // дыхание камеры
  camera.position.copy(camPos); camera.lookAt(camTgt);
  right.setFromMatrixColumn(camera.matrixWorld, 0); up.setFromMatrixColumn(camera.matrixWorld, 1);
  camera.position.addScaledVector(right, mouse.sx * 0.62).addScaledVector(up, -mouse.sy * 0.4);
  camera.lookAt(camTgt);
  camera.rotation.z += mouse.sx * -0.012;

  const wWave = Math.max(0, 1 - Math.abs(i + h - 3));
  uni.uFocus.value = THREE.MathUtils.lerp(tmp.copy(camera.position).sub(camTgt).length(), 5.2, wWave * 0.75);
  uni.uAp.value = 0.8 + arc * 0.9 - Math.max(0, i + h - 3) * 0.3;

  root.style.setProperty("--mx", mouse.sx.toFixed(4)); root.style.setProperty("--my", mouse.sy.toFixed(4));
  ui(pS);
  composer.render();
  requestAnimationFrame(frame);
}

layout(true); readScroll(); pS = pT; ui(pS);
requestAnimationFrame(frame);
window.__ready = true;
