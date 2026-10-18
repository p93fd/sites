// Студия иконок: три объёмные стеклянные иконки для карточек «Вам сюда, если».
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const S = 640;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(S, S);
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);
const C = { bg: 0x0b1230, royal: 0x4155e8, sky: 0x76b7ff, ice: 0xe0e2f2 };

function envFor(renderer) {
  const s = new THREE.Scene(); const pm = new THREE.PMREMGenerator(renderer);
  const add = (w, h, pos, rot, color, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(...pos); m.rotation.set(...rot); s.add(m); };
  add(10, 1.6, [0, 6, 3], [Math.PI / 2, 0, 0], C.ice, 8); add(1, 8, [-6, 1, 2], [0, Math.PI / 2, 0], C.sky, 3);
  add(1, 8, [6, 1, 2], [0, -Math.PI / 2, 0], C.royal, 4); add(6, 3, [0, 0, -7], [0, 0, 0], C.royal, 1.2); add(0.6, 6, [3, 2, 7], [0, Math.PI, 0], C.ice, 3);
  return pm.fromScene(s, 0.02).texture;
}
const glass = () => new THREE.MeshPhysicalMaterial({ color: 0xcfe0ff, emissive: new THREE.Color(0x24399e), emissiveIntensity: 0.32, roughness: 0.04, metalness: 0.08, transmission: 0.62, thickness: 1.1, ior: 1.5, dispersion: 4,
  clearcoat: 1, clearcoatRoughness: 0.03, attenuationColor: new THREE.Color(C.sky), attenuationDistance: 1.2, envMapIntensity: 3.2, iridescence: 0.4, iridescenceIOR: 1.3 });
const frosted = () => new THREE.MeshPhysicalMaterial({ color: 0xaac4ff, emissive: new THREE.Color(0x1a2a80), emissiveIntensity: 0.38, roughness: 0.2, metalness: 0.06, transmission: 0.55, envMapIntensity: 2.6, thickness: 0.4, ior: 1.4, envMapIntensity: 1.4, clearcoat: 1, attenuationColor: new THREE.Color(C.royal), attenuationDistance: 0.8 });
const glow = (c, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), toneMapped: false });

function shapeGeo(shape, depth, bevel = 0.06) {
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 8, curveSegments: 48 }).center();
}
function roundedRectShape(w, h, r) { const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
function bubbleShape(w, h, r, tailLeft) { const s = roundedRectShape(w, h, r); // хвостик
  const t = new THREE.Shape(); const sx = tailLeft ? -w / 2 + 0.35 : w / 2 - 0.35, d = tailLeft ? -1 : 1;
  t.moveTo(sx - 0.15 * d, -h / 2 + 0.05); t.lineTo(sx + 0.35 * d, -h / 2 - 0.45); t.lineTo(sx + 0.3 * d, -h / 2 + 0.05); return [s, t]; }

function scene(kind) {
  const sc = new THREE.Scene(); sc.background = new THREE.Color(C.bg); sc.environment = envFor(renderer);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50); cam.position.set(0, 0.6, 7.2); cam.lookAt(0, 0, 0);
  const g = new THREE.Group(); sc.add(g);
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const cx = cv.getContext('2d'); const gr = cx.createRadialGradient(128,128,0,128,128,128);
  gr.addColorStop(0,'rgba(90,120,255,1)'); gr.addColorStop(.45,'rgba(50,70,190,.75)'); gr.addColorStop(1,'rgba(11,18,48,0)'); cx.fillStyle = gr; cx.fillRect(0,0,256,256);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 6.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  back.position.z = -2.5; sc.add(back); // свечение за стеклом
  if (kind === 0) { // нестабильные продажи: стеклянная плашка + ломаная линия
    const plate = new THREE.Mesh(shapeGeo(roundedRectShape(2.6, 2.0, 0.35), 0.18, 0.08), frosted()); g.add(plate);
    const pts = [[-1.0, -0.5], [-0.55, 0.35], [-0.15, -0.25], [0.25, 0.55], [0.6, -0.1], [1.0, 0.4]].map(([x, y]) => new THREE.Vector3(x, y, 0.32));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.05);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 200, 0.11, 24, false), glass()));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 200, 0.03, 12, false), glow(C.ice, 1.8)));
    pts.forEach(p => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 24), glow(C.ice, 2.4)); d.position.copy(p); g.add(d); });
    g.rotation.set(-0.18, 0.42, 0.03);
  } else if (kind === 1) { // созвоны: два пузыря-реплики, которые не сходятся
    const [s1, t1] = bubbleShape(1.7, 1.05, 0.42, true), [s2, t2] = bubbleShape(1.7, 1.05, 0.42, false);
    const b1 = new THREE.Group(); b1.add(new THREE.Mesh(shapeGeo(s1, 0.32, 0.1), glass())); const tt1 = new THREE.Mesh(shapeGeo(t1, 0.3, 0.06), glass()); tt1.position.set(-0.55, -0.62, 0); b1.add(tt1);
    b1.position.set(-0.62, 0.42, 0.2); b1.rotation.set(0, 0.3, 0.04); g.add(b1);
    const b2 = new THREE.Group(); b2.add(new THREE.Mesh(shapeGeo(s2, 0.32, 0.1), frosted())); const tt2 = new THREE.Mesh(shapeGeo(t2, 0.3, 0.06), frosted()); tt2.position.set(0.55, -0.62, 0); b2.add(tt2);
    b2.position.set(0.66, -0.5, -0.2); b2.rotation.set(0, -0.3, -0.04); g.add(b2);
    for (let i = 0; i < 3; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 24), glow(C.ice, 2.6)); d.position.set(-1.0 + i * 0.36, 0.42, 0.45); g.add(d); }
    const gap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.025), glow(C.sky, 3)); gap.position.set(0.02, -0.02, 0.4); gap.rotation.z = -0.6; g.add(gap);
    g.rotation.set(-0.1, 0.2, 0);
  } else { // чек не растёт: стеклянный ценник с ровной линией
    const s = new THREE.Shape(); s.moveTo(-1.2, -0.7); s.lineTo(0.55, -0.7); s.lineTo(1.25, 0); s.lineTo(0.55, 0.7); s.lineTo(-1.2, 0.7); s.lineTo(-1.2, -0.7);
    const hole = new THREE.Path(); hole.absarc(0.62, 0, 0.16, 0, Math.PI * 2, true); s.holes.push(hole);
    const tag = new THREE.Mesh(shapeGeo(s, 0.26, 0.1), glass()); g.add(tag);
    const line = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.06, 0.06), glow(C.ice, 3.2)); line.position.set(-0.32, 0, 0.3); g.add(line);
    [-0.85, -0.32, 0.21].forEach(x => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.12), frosted()); b.position.set(x, -0.25, 0.28); g.add(b); });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 16, 48), glow(C.sky, 2)); ring.position.set(0.62, 0, 0.3); g.add(ring);
    g.rotation.set(-0.2, 0.45, 0.12);
  }
  return { sc, cam };
}

const composer = new EffectComposer(renderer); composer.setSize(S, S);
const rp = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera()); composer.addPass(rp);
composer.addPass(new UnrealBloomPass(new THREE.Vector2(S, S), 0.45, 0.4, 0.85)); composer.addPass(new OutputPass());
window.renderIcon = k => { const { sc, cam } = scene(k); rp.scene = sc; rp.camera = cam; composer.render(); return renderer.domElement.toDataURL('image/png'); };
window.__ready = true;
