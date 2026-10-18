// Студия «Архитектор»: один детерминированный 3D-мир, весь фильм = функция от p ∈ [0,1].
// renderAt(p) рисует ровно один кадр. Рендерится офлайн в headless Chromium → кадры → сайт.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { TL } from './timeline.js';

const q = new URLSearchParams(location.search);
const W = +q.get('w') || 1280, H = +q.get('h') || 720;
const PORTRAIT = H > W;

const C = { bg: 0x03050d, royal: 0x4155e8, sky: 0x76b7ff, ice: 0xe0e2f2, violet: 0x6d7fff };

// ---------- математика времени ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (p, a, b) => clamp((p - a) / (b - a));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const lerp = (a, b, t) => a + (b - a) * t;
function rand(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function keyed(p, keys) { // keys: [[p, value...]] → кусочная интерполяция с ease
  if (p <= keys[0][0]) return keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, ...va] = keys[i], [b, ...vb] = keys[i + 1];
    if (p <= b) { const t = ease(seg(p, a, b)); return va.map((v, k) => lerp(v, vb[k], t)); }
  }
  return keys[keys.length - 1].slice(1);
}

// ---------- рендер ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(C.bg);
scene.fog = new THREE.FogExp2(C.bg, 0.03);
const camera = new THREE.PerspectiveCamera(PORTRAIT ? 64 : 40, W / H, 0.05, 400);

// окружение: тёмная студия со световыми полосами — даёт стеклу «дорогие» блики
const pmrem = new THREE.PMREMGenerator(renderer);
{
  const s = new THREE.Scene();
  const add = (w, h, pos, rot, color, k) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
    m.position.set(...pos); m.rotation.set(...rot); s.add(m);
  };
  add(24, 1.0, [0, 9, -2], [Math.PI / 2, 0, 0], C.ice, 4);
  add(0.8, 16, [-9, 0, -1], [0, Math.PI / 2, 0], C.sky, 3);
  add(0.8, 16, [9, 0, -1], [0, -Math.PI / 2, 0], C.royal, 4);
  add(16, 5, [0, -1, -12], [0, 0, 0], C.royal, 0.7);
  add(0.35, 12, [5, 1, 10], [0, Math.PI, 0], C.ice, 1.2);
  add(0.35, 12, [-6, 1, 9], [0, Math.PI, 0], C.violet, 1.8);
  scene.environment = pmrem.fromScene(s, 0.012).texture;
}

// ---------- материалы ----------
const glass = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, metalness: 0, roughness: 0.05, transmission: 1, thickness: 0.9, ior: 1.45,
  dispersion: 3.5, clearcoat: 1, clearcoatRoughness: 0.04, attenuationColor: new THREE.Color(C.sky),
  attenuationDistance: 1.8, envMapIntensity: 1.6, iridescence: 0.3, iridescenceIOR: 1.25, side: THREE.FrontSide,
});
const glassPetal = new THREE.MeshPhysicalMaterial({ color: 0xdfe9ff, metalness: 0, roughness: 0.1, transmission: 0.72, thickness: 0.3, ior: 1.4,
  clearcoat: 1, iridescence: 0.45, iridescenceIOR: 1.3, emissive: new THREE.Color(0x3a55c8), emissiveIntensity: 0.5, envMapIntensity: 2.2,
  attenuationColor: new THREE.Color(C.sky), attenuationDistance: 0.8, side: THREE.DoubleSide });
// стекло для сотен ячеек: отражающее, без преломления (быстро и без артефактов)
const glassCell = new THREE.MeshPhysicalMaterial({ color: 0x6f92e0, metalness: 0.15, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.04,
  iridescence: 0.5, iridescenceIOR: 1.3, envMapIntensity: 3.2, transparent: true, opacity: 0.62, emissive: new THREE.Color(0x0d1848), emissiveIntensity: 1 });
const glow = (color, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), toneMapped: false, fog: false });

function radialTex(stops, size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const softGlow = radialTex([[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(160,200,255,.55)'], [0.5, 'rgba(65,85,232,.14)'], [1, 'rgba(0,0,0,0)']]);
const ringGlow = radialTex([[0, 'rgba(0,0,0,0)'], [0.52, 'rgba(0,0,0,0)'], [0.6, 'rgba(225,235,255,1)'], [0.66, 'rgba(118,183,255,.55)'], [0.82, 'rgba(65,85,232,.12)'], [1, 'rgba(0,0,0,0)']], 512);
function sprite(tex, color, scale, opacity = 1) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity, fog: false }));
  s.scale.setScalar(scale); return s;
}

// ---------- мир: световой дождь вдоль всего пролёта (непрозрачный — его видно сквозь стекло) ----------
const rain = new THREE.Group(); scene.add(rain);
{
  const r = rand(7); const geo = new THREE.BoxGeometry(1, 1, 1);
  for (let i = 0; i < 170; i++) {
    const k = 0.15 + r() * 0.7, col = r() < 0.6 ? C.sky : (r() < 0.5 ? C.royal : C.ice);
    const m = new THREE.Mesh(geo, glow(col, k));
    const x = (r() < .5 ? -1 : 1) * (2.5 + r() * 16);
    m.scale.set(0.012 + r() * 0.03, 1.5 + r() * 9, 0.012);
    m.position.set(x, -2 + r() * 8, -9 - r() * 100);
    m.userData = { y0: m.position.y, sp: 0.5 + r() * 2 };
    rain.add(m);
  }
}

// ---------- 00 кольцо ----------
const ring = new THREE.Group(); scene.add(ring);
const torus = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.36, 96, 220), glass); ring.add(torus);
const torusLine = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.01, 8, 300), glow(C.ice, 2.5)); ring.add(torusLine);
const ringCore = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), glow(C.ice, 8)); ring.add(ringCore);
const ringHalo = sprite(softGlow, C.royal, 7, 0.3); ringHalo.position.z = -1.5; scene.add(ringHalo);
// подложка-свет позади (непрозрачная, чтобы стекло её преломляло)
const backPlate = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), new THREE.MeshBasicMaterial({
  map: radialTex([[0, 'rgba(48,72,185,1)'], [0.28, 'rgba(18,28,86,1)'], [0.62, 'rgba(6,9,26,1)'], [1, 'rgba(3,5,13,1)']], 512), toneMapped: false, fog: false,
}));
backPlate.position.z = -6; scene.add(backPlate);

// ---------- 01 три стеклянных окна со знаками из света ----------
const panes = [];
{
  const geo = PORTRAIT ? new RoundedBoxGeometry(2.3, 1.35, 0.16, 6, 0.08) : new RoundedBoxGeometry(1.7, 2.35, 0.18, 6, 0.09);
  for (let i = 0; i < 3; i++) {
    const g = new THREE.Group();
    const pane = new THREE.Mesh(geo, glass); g.add(pane);
    const sign = new THREE.Group(); sign.position.z = -0.45; g.add(sign);
    const s = PORTRAIT ? 0.62 : 0.8;
    if (i === 0) { // нестабильность: разорванное кольцо
      const a = new THREE.Mesh(new THREE.TorusGeometry(0.42 * s, 0.018, 8, 120, Math.PI * 1.35), glow(C.ice, 4)); a.rotation.z = 0.6; sign.add(a);
      const b = new THREE.Mesh(new THREE.TorusGeometry(0.42 * s, 0.018, 8, 40, Math.PI * 0.35), glow(C.sky, 3)); b.rotation.z = 0.6 + Math.PI * 1.55; b.position.set(0.09, -0.06, 0); sign.add(b);
    } else if (i === 1) { // интерес есть, сделки нет: две линии, которые не сходятся
      const l1 = new THREE.Mesh(new THREE.BoxGeometry(0.75 * s, 0.03, 0.03), glow(C.ice, 4)); l1.position.set(-0.32 * s, 0.05, 0); l1.rotation.z = 0.35; sign.add(l1);
      const l2 = new THREE.Mesh(new THREE.BoxGeometry(0.75 * s, 0.03, 0.03), glow(C.sky, 3)); l2.position.set(0.36 * s, -0.08, 0); l2.rotation.z = -0.35; sign.add(l2);
    } else { // чек не растёт: столбцы на одном уровне
      for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.1 * s, 0.42 * s, 0.03), glow(k === 3 ? C.ice : C.sky, k === 3 ? 4 : 2.4)); b.position.set((-0.3 + k * 0.2) * s, -0.05, 0); sign.add(b); }
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.9 * s, 0.012, 0.012), glow(C.ice, 3)); base.position.set(0, 0.17 * s, 0); sign.add(base);
    }
    const halo = sprite(softGlow, C.royal, 2.2, 0.35); halo.position.z = -0.9; g.add(halo);
    scene.add(g); panes.push(g);
  }
}

// ---------- 02–05 соты: хаос → монолит → тоннель → поле осколков ----------
const COLS = 26, ROWS = 18, N = COLS * ROWS;
const hexGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.34, 6, 1); hexGeo.rotateX(Math.PI / 2);
const hexes = new THREE.InstancedMesh(hexGeo, glassCell, N); hexes.instanceMatrix.setUsage(THREE.DynamicDrawUsage); hexes.frustumCulled = false; scene.add(hexes);
const hexEdges = new THREE.InstancedMesh(new THREE.TorusGeometry(0.31, 0.006, 4, 6), glow(C.sky, 1.5), N); hexEdges.frustumCulled = false; scene.add(hexEdges);
const H_ = [];
{
  const r = rand(11); const dummy = new THREE.Object3D();
  const sp = 0.335, cx = (COLS - 1) * sp * 1.5 / 2, cy = (ROWS - 1) * sp * Math.sqrt(3) / 2;
  const tunnelScale = 1.55, R = ROWS * sp * Math.sqrt(3) * tunnelScale / (2 * Math.PI);
  for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) {
    const wall = new THREE.Vector3(i * sp * 1.5 - cx, j * sp * Math.sqrt(3) + (i % 2 ? sp * Math.sqrt(3) / 2 : 0) - cy, (r() - .5) * 0.18);
    const pane = Math.floor(r() * 3);
    const chaos = new THREE.Vector3((r() - .5) * 13, (r() - .5) * 8, -4 + r() * 6);
    const ang = j / ROWS * Math.PI * 2 + (i % 2 ? Math.PI / ROWS : 0);
    const tz = 0.6 - i * 0.62;
    const tunnel = new THREE.Vector3(Math.cos(ang) * R, Math.sin(ang) * R, tz);
    dummy.position.copy(tunnel); dummy.lookAt(0, 0, tz); const qT = dummy.quaternion.clone();
    const qW = new THREE.Quaternion();
    const qC = new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 6, r() * 6, r() * 6));
    let fx = (r() - .5) * 18, fy = (r() - .5) * 10; if (Math.abs(fx) < 1.6 && Math.abs(fy) < 1.2) fx += fx < 0 ? -2.5 : 2.5;
    const field = new THREE.Vector3(fx, fy, -22 - r() * 26);
    const qF = new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 6, r() * 6, r() * 6));
    H_.push({ i, j, wall, chaos, tunnel, field, qW, qC, qT, qF, pane, d: r(), spin: new THREE.Vector3(r() - .5, r() - .5, r() - .5).normalize(), fs: 0.35 + r() * 0.75, ts: tunnelScale, bright: r() });
  }
  const col = new THREE.Color();
  H_.forEach((h, k) => { col.setRGB(0.8 + h.bright * 0.2, 0.9 + h.bright * 0.1, 1); hexes.setColorAt(k, col);
    const e = h.bright > 0.82 ? 1.0 : 0.18 + h.bright * 0.2; col.setRGB(e, e, e); hexEdges.setColorAt(k, col); });
}

// ворота-этапы в тоннеле + свет в конце
const gates = TL.gates.map(z => { const g = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.012, 8, 240), glow(C.ice, 4)); g.position.z = z; scene.add(g); return g; });
const tunnelEnd = sprite(softGlow, C.sky, 16, 0.9); tunnelEnd.position.z = -24; scene.add(tunnelEnd);

// ---------- 04 затмение с портретом ----------
const ECL_Z = -21;
const eclipse = new THREE.Group(); eclipse.position.z = ECL_Z; scene.add(eclipse);
const eclRim = sprite(ringGlow, C.ice, 5.6, 1); eclRim.position.z = -0.6; eclipse.add(eclRim);
const eclHalo = sprite(softGlow, C.royal, 12, 0.7); eclHalo.position.z = -1; eclipse.add(eclHalo);
const eclSphere = new THREE.Mesh(new THREE.SphereGeometry(1.5, 96, 96), new THREE.MeshStandardMaterial({ color: 0x05070f, roughness: 0.32, metalness: 0.85, envMapIntensity: 0.6 }));
eclipse.add(eclSphere);
let portrait = null;
{
  const tex = new THREE.TextureLoader().load('./portrait.png', () => { window.__portraitReady = true; });
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, toneMapped: false,
    uniforms: { map: { value: tex }, uO: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform sampler2D map; uniform float uO; varying vec2 vUv;
      void main(){ vec4 c=texture2D(map,vUv); float d=length(vUv-.5)*2.; float m=smoothstep(1.0,.55,d);
        vec3 col=c.rgb; float l=dot(col,vec3(.299,.587,.114)); col=mix(vec3(l)*vec3(.82,.9,1.08),col,.35);
        col*= .95 + .25*smoothstep(.6,.95,d); gl_FragColor=vec4(col, c.a*m*uO); }`,
  });
  portrait = new THREE.Mesh(new THREE.CircleGeometry(1.42, 96), mat); portrait.position.z = 1.52; eclipse.add(portrait);
}

// дальний свет для поля и лотоса — его отражают ячейки и преломляют лепестки
const deepPlate = new THREE.Mesh(new THREE.PlaneGeometry(160, 90), new THREE.MeshBasicMaterial({
  map: radialTex([[0, 'rgba(40,62,170,1)'], [0.3, 'rgba(14,22,70,1)'], [0.65, 'rgba(5,8,22,1)'], [1, 'rgba(3,5,13,1)']], 512), toneMapped: false, fog: false }));
deepPlate.position.set(0, 4, -78); scene.add(deepPlate);

// ---------- 07 лотос из стекла ----------
const LOTUS = new THREE.Vector3(0, -0.55, -40);
const lotus = new THREE.Group(); lotus.position.copy(LOTUS); scene.add(lotus);
const petals = [];
function petalGeo(L, w) {
  const s = new THREE.Shape(); s.moveTo(0, 0);
  s.bezierCurveTo(w, L * 0.22, w * 0.85, L * 0.78, 0, L); s.bezierCurveTo(-w * 0.85, L * 0.78, -w, L * 0.22, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.018, bevelSegments: 3, curveSegments: 40, steps: 1 });
  const p = g.attributes.position;
  for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k), z = p.getZ(k); const t = y / L;
    p.setZ(k, z - 0.32 * L * t * t + 0.9 * x * x - 0.08 * Math.sin(t * Math.PI) * L); }
  g.computeVertexNormals(); return g;
}
const LAYERS = [ // n, L, w, tiltClosed, tiltOpen
  [6, 0.95, 0.34, 0.12, 0.45], [8, 1.25, 0.42, 0.18, 0.85], [10, 1.5, 0.48, 0.26, 1.18], [12, 1.4, 0.5, 0.4, 1.48],
];
LAYERS.forEach(([n, L, w, t0, t1], li) => {
  const geo = petalGeo(L, w * 1.35);
  for (let k = 0; k < n; k++) {
    const pivot = new THREE.Group(); pivot.rotation.y = (k / n) * Math.PI * 2 + li * 0.35;
    const m = new THREE.Mesh(geo, glassPetal); pivot.add(m); lotus.add(pivot);
    const vein = new THREE.Mesh(new THREE.BoxGeometry(0.008, L * 0.8, 0.008), glow(C.ice, 1.6)); vein.position.set(0, L * 0.42, -0.06 * L); m.add(vein);
    petals.push({ pivot, m, t0, t1, li, k, seed: Math.random });
  }
});
const lotusCore = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), glow(C.ice, 6)); lotusCore.position.y = 0.25; lotus.add(lotusCore);
const lotusHalo = sprite(softGlow, C.sky, 5, 0.8); lotusHalo.position.y = 0.3; lotus.add(lotusHalo);
const mirror = new Reflector(new THREE.PlaneGeometry(120, 120), { textureWidth: Math.round(W / 2), textureHeight: Math.round(H / 2), color: 0x3a4a6a, clipBias: 0.003 });
mirror.rotation.x = -Math.PI / 2; mirror.position.set(0, LOTUS.y - 0.02, -40); scene.add(mirror);

// ---------- 09 горизонт ----------
const PLANET_R = 60;
const planet = new THREE.Mesh(new THREE.SphereGeometry(PLANET_R, 160, 120), new THREE.MeshStandardMaterial({ color: 0x060a18, roughness: 0.55, metalness: 0.4, envMapIntensity: 0.5 }));
planet.position.set(0, -PLANET_R - 1.2, -105); scene.add(planet);
const atmo = new THREE.Mesh(new THREE.SphereGeometry(PLANET_R * 1.035, 160, 120), new THREE.ShaderMaterial({
  side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  uniforms: { uI: { value: 0 }, c1: { value: new THREE.Color(C.sky) }, c2: { value: new THREE.Color(C.ice) } },
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
  fragmentShader: 'uniform float uI; uniform vec3 c1; uniform vec3 c2; varying vec3 vN; varying vec3 vV; void main(){ float f=pow(1.-abs(dot(vN,vV)),5.); float k=pow(f,1.6)*uI; gl_FragColor=vec4(mix(c1,c2,f)*k*2.2,k); }',
}));
atmo.position.copy(planet.position); scene.add(atmo);
const rimLine = new THREE.Mesh(new THREE.TorusGeometry(PLANET_R + 0.02, 0.05, 8, 600), glow(C.ice, 3));
rimLine.position.copy(planet.position); scene.add(rimLine);
const sun = sprite(softGlow, C.ice, 34, 0); sun.position.set(0, -1.4, -100); scene.add(sun);

// ---------- пост-обработка ----------
const composer = new EffectComposer(renderer);
composer.setPixelRatio(1); composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.6, 0.6, 0.82); composer.addPass(bloom);
composer.addPass(new OutputPass());

// ---------- кадр ----------
const dummy = new THREE.Object3D(); const tmpQ = new THREE.Quaternion(); const tmpV = new THREE.Vector3();
const look = new THREE.Vector3();
function setVis(o, v) { o.visible = v; }

window.renderAt = function (p) {
  const T = p * 60; // «время» для медленного дрейфа

  // камера
  const [cz, cy, lz, ly] = keyed(p, TL.camera);
  camera.position.set(0, cy, cz); look.set(0, ly, lz); camera.lookAt(look);
  camera.position.x = Math.sin(T * 0.21) * 0.06; // дыхание
  if (PORTRAIT) camera.position.z += 0;

  rain.children.forEach(m => { m.position.y = m.userData.y0 - ((T * m.userData.sp * 0.06) % 6); });

  // 00 кольцо → схлопывается в линию
  const rk = seg(p, 0.075, 0.105);
  setVis(ring, p < 0.12); setVis(ringHalo, p < 0.13);
  ring.rotation.set(0.32 + Math.sin(T * 0.4) * 0.12, lerp(T * 0.25 % (Math.PI * 2) * 0 + Math.sin(T * 0.3) * 0.35, Math.PI / 2, ease(rk)), T * 0.05);
  ring.scale.set(1, lerp(1, 1.1, ease(rk)), 1);
  ringHalo.material.opacity = lerp(0.3, 0.0, rk) + 0.05 * Math.sin(T);
  torusLine.material.color.setScalar(1).multiply(new THREE.Color(C.ice)).multiplyScalar(2.2 + 1.0 * Math.sin(Math.PI * rk));
  backPlate.visible = p < 0.36;
  backPlate.scale.setScalar(lerp(1, 0.001, ease(seg(p, 0.31, 0.355))) || 0.001);
  backPlate.material.opacity = 1;

  // 01 окна
  const pin = seg(p, 0.095, 0.135), pout = seg(p, 0.19, 0.235);
  panes.forEach((g, i) => {
    const st = clamp((pin - i * 0.18) / 0.64);
    const e = easeOut(st), o = ease(pout);
    g.visible = p > 0.09 && p < 0.24;
    const base = PORTRAIT ? new THREE.Vector3(0, (1 - i) * 1.6, 0) : new THREE.Vector3((i - 1) * 2.05, 0, 0);
    g.position.copy(base).multiplyScalar(lerp(0.2, 1, e));
    g.position.z = lerp(0, -1.5, o) + Math.sin(T * 0.5 + i) * 0.05;
    g.rotation.set(Math.sin(T * 0.3 + i) * 0.04, lerp(Math.PI / 2, (i - 1) * -0.22, e) + o * (i - 1) * 0.8, o * (i - 1) * 0.4);
    g.scale.set(Math.max(0.001, e * (1 - o)), Math.max(0.001, lerp(0.6, 1, e) * (1 - o)), 1);
  });

  // 02–06 соты
  const aIn = seg(p, 0.19, 0.235);       // появление из окон
  const aAsm = seg(p, 0.215, 0.30);      // сборка в монолит
  const aTun = seg(p, 0.315, 0.395);     // монолит сворачивается в тоннель
  const aField = seg(p, 0.555, 0.63);    // тоннель распадается в поле
  const aOut = seg(p, 0.70, 0.77);        // поле уходит
  const showHex = p > 0.19 && p < 0.81;
  hexes.visible = hexEdges.visible = showHex;
  if (showHex) {
    H_.forEach((h, k) => {
      const dAsm = clamp((aAsm - h.d * 0.45) / 0.55);
      const dist = Math.hypot(h.wall.x, h.wall.y) / 7;
      const dTun = clamp((aTun - h.i / COLS * 0.55) / 0.45);
      const dFld = clamp((aField - h.d * 0.4) / 0.6);
      let pos = tmpV.copy(h.chaos);
      // старт хаоса — от окон
      const paneC = PORTRAIT ? new THREE.Vector3(0, (1 - h.pane) * 1.6, -1.5) : new THREE.Vector3((h.pane - 1) * 2.05, 0, -1.5);
      pos.lerpVectors(paneC, h.chaos, easeOut(aIn));
      pos.lerp(h.wall, ease(dAsm));
      pos.lerp(h.tunnel, ease(dTun));
      pos.lerp(h.field, ease(dFld));
      // дрейф поля
      if (dFld > 0) { pos.y += Math.sin(T * 0.3 + h.d * 9) * 0.25 * dFld; pos.x += Math.cos(T * 0.2 + h.d * 7) * 0.2 * dFld; }
      tmpQ.copy(h.qC).multiply(new THREE.Quaternion().setFromAxisAngle(h.spin, T * 0.2 * (1 - dAsm)));
      tmpQ.slerp(h.qW, ease(dAsm)); tmpQ.slerp(h.qT, ease(dTun));
      if (dFld > 0) tmpQ.slerp(new THREE.Quaternion().copy(h.qF).multiply(new THREE.Quaternion().setFromAxisAngle(h.spin, T * 0.15)), ease(dFld));
      let sc = lerp(0.4, 1, easeOut(aIn)) * lerp(1, h.ts, ease(dTun));
      sc = lerp(sc, h.d < 0.45 ? h.fs : 0.0001, ease(dFld)) * (1 - ease(clamp((aOut - h.d * 0.5) / 0.5)));
      // волна света по монолиту
      dummy.position.copy(pos); dummy.quaternion.copy(tmpQ); dummy.scale.setScalar(Math.max(sc, 0.0001));
      dummy.updateMatrix(); hexes.setMatrixAt(k, dummy.matrix);
      dummy.scale.multiplyScalar(Math.max(0.0001, 1 - dFld)); dummy.updateMatrix(); hexEdges.setMatrixAt(k, dummy.matrix);
    });
    hexes.instanceMatrix.needsUpdate = true; hexEdges.instanceMatrix.needsUpdate = true;
  }
  // ворота: вспыхивают, когда камера подходит
  gates.forEach((g, k) => {
    g.visible = p > 0.33 && p < 0.56;
    const d = camera.position.z - g.position.z; // >0 — ворота впереди
    const lit = Math.exp(-Math.pow((d - 1.2) / 2.2, 2));
    g.material.color.set(C.ice).multiplyScalar(1.2 + 7 * lit);
    g.scale.setScalar(lerp(0.3, 1, ease(seg(p, 0.33, 0.39))));
  });
  tunnelEnd.visible = p > 0.3 && p < 0.62;
  tunnelEnd.material.opacity = 0.9 * seg(p, 0.3, 0.38) * (1 - seg(p, 0.54, 0.6));

  // 04 затмение
  const eIn = seg(p, 0.43, 0.5), ePass = seg(p, 0.555, 0.6);
  eclipse.visible = p > 0.42 && p < 0.61;
  eclipse.position.x = PORTRAIT ? 0 : 1.75 * ease(seg(p, 0.465, 0.505)) * (1 - ease(seg(p, 0.55, 0.585)));
  eclipse.scale.setScalar(Math.max(0.0001, lerp(0.6, 1, ease(eIn)) * (1 - ease(ePass))));
  eclRim.material.opacity = ease(eIn) * (1 + 0.5 * Math.sin(Math.PI * ePass));
  eclRim.scale.setScalar(5.6 * (1 + ePass * 2.5));
  eclHalo.material.opacity = 0.7 * ease(eIn) + ePass * 0.6;
  portrait.material.uniforms.uO.value = ease(seg(p, 0.5, 0.535)) * (1 - ease(seg(p, 0.55, 0.575)));

  // 07 лотос
  const lIn = seg(p, 0.74, 0.79), bloomT = seg(p, 0.775, 0.855), lOut = seg(p, 0.86, 0.915);
  lotus.visible = mirror.visible = p > 0.72 && p < 0.94;
  lotus.rotation.y = T * 0.03;
  lotus.scale.setScalar(Math.max(0.0001, lerp(0.55, 1, easeOut(lIn))));
  petals.forEach(pt => {
    const st = clamp((bloomT - (3 - pt.li) * 0.06) / 0.82);
    const tilt = lerp(pt.t0, pt.t1, ease(st));
    pt.m.rotation.set(tilt, 0, 0);
    // распад: лепестки поднимаются и тают
    const dd = clamp((lOut - (pt.k / 12) * 0.3 - pt.li * 0.05) / 0.6);
    pt.pivot.position.set(0, ease(dd) * (1.5 + pt.li * 0.6), 0);
    pt.m.position.set(0, 0, ease(dd) * (0.8 + pt.li * 0.5));
    const sc = 1 - ease(dd); pt.m.scale.setScalar(Math.max(0.0001, sc));
  });
  lotusCore.scale.setScalar(lerp(0.6, 1.2, bloomT) * (1 + ease(lOut) * 2.2));
  lotusHalo.scale.setScalar(5 + bloomT * 2 + ease(lOut) * 4);
  lotusHalo.material.opacity = 0.55 * (1 - ease(seg(p, 0.88, 0.93)));
  lotusCore.visible = p < 0.93;

  // 09 горизонт
  const hz = seg(p, 0.88, 0.99);
  planet.visible = atmo.visible = rimLine.visible = sun.visible = p > 0.86;
  atmo.material.uniforms.uI.value = ease(hz);
  rimLine.material.color.set(C.ice).multiplyScalar(0.4 + 3.2 * ease(hz));
  sun.material.opacity = ease(seg(p, 0.92, 1.0)) * 0.95;
  sun.position.y = lerp(-3.5, -0.6, ease(seg(p, 0.9, 1.0)));

  // свечение: больше света к финалу (облегчение)
  bloom.strength = 0.6 + 0.3 * seg(p, 0.86, 1);
  deepPlate.visible = p > 0.5 && p < 0.95;
  deepPlate.material.color.setScalar(Math.max(0, 1 - ease(seg(p, 0.86, 0.94))));
  renderer.toneMappingExposure = 1.0 + 0.15 * seg(p, 0.88, 1);

  composer.render();
  return true;
};

window.__dbg = { composer, scene, hexes, hexEdges, rain, backPlate, gates, panes };
window.__ready = true;
