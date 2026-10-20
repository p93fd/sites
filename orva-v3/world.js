// orva-v3 · один 3D-мир, камера летит сквозь него без остановки.
// Главы: 0 кольцо-ДНК · 1 осколки · 2 соты · 3 три карточки · 4 тоннель 16 недель
// 5 тёмная сфера · 6 лучи (кейсы) · 7 вспышка · 8 лотос 6 лепестков · 9 орбита с ядром
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { Reflector } from "three/addons/objects/Reflector.js";

const CU = new THREE.Color("#d9a27c"), HOT = new THREE.Color("#ffb27a"), PALE = new THREE.Color("#ffe6cf"), BG = new THREE.Color("#060504");
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ss = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const bump = (a, b, c, d, x) => ss(a, b, x) * (1 - ss(c, d, x));
const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
const Y0 = 2.6; // высота оси полёта

// ── ключевые кадры камеры: c (номер главы + доля) → позиция, взгляд ──
const K = [
  [0.0, [0, 2.7, 20.5], [0, 2.6, 0]],
  [0.5, [0, 2.55, 16], [0, 2.6, 0]],
  [1.0, [0, 2.6, 3.5], [0, 2.6, -12]],
  [1.5, [0.4, 2.8, -10], [0, 2.6, -32]],
  [2.0, [-0.3, 2.6, -25], [0, 2.6, -48]],
  [2.5, [0, 2.6, -38], [0, 2.6, -62]],
  [3.0, [0, 2.6, -47], [0, 2.6, -66]],
  [3.5, [0, 2.6, -63.5], [0, 2.6, -78]],
  [4.0, [0, 2.6, -72], [0, 2.6, -94]],
  [4.25, [0, 2.6, -94], [0, 2.6, -118]],
  [4.5, [0, 2.6, -124], [0, 2.6, -148]],
  [4.75, [0, 2.6, -156], [0, 2.6, -182]],
  [5.0, [0, 2.6, -184], [0, 2.6, -213]],
  [5.5, [0, 2.6, -195.5], [0, 2.6, -213]],
  [6.0, [0, 2.6, -214], [0, 2.4, -240]],
  [6.5, [0, 2.45, -228], [0, 2.2, -252]],
  [7.0, [0, 2.3, -243], [0, 1.6, -281]],
  [7.5, [0, 2.6, -254], [0, 1.4, -281]],
  [8.0, [0, 3.6, -267], [0, 1.4, -281]],
  [8.5, [0, 4.6, -269.5], [0, 1.3, -281]],
  [9.0, [0, 4.8, -267], [0, 3.4, -283]],
  [9.5, [0, 8.0, -267], [0, 6.4, -285]],
  [10.0, [0, 8.4, -266], [0, 6.5, -285]],
].map(([c, p, l]) => ({ c, p: new THREE.Vector3(...p), l: new THREE.Vector3(...l) }));
function camAt(c, outP, outL) {
  c = cl(c, 0, 10);
  let i = 0; while (i < K.length - 2 && K[i + 1].c < c) i++;
  const a = K[Math.max(0, i - 1)], b = K[i], d = K[i + 1], e = K[Math.min(K.length - 1, i + 2)];
  const t = (c - b.c) / (d.c - b.c);
  const cr = (p0, p1, p2, p3, o) => {
    const t2 = t * t, t3 = t2 * t;
    for (const k of ["x", "y", "z"]) o[k] = 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
  };
  cr(a.p, b.p, d.p, e.p, outP); cr(a.l, b.l, d.l, e.l, outL);
}

// ── окружение для отражений стекла: тёплые световые панели ──
function makeEnv(renderer) {
  const s = new THREE.Scene(); s.background = new THREE.Color(0x050302);
  const g = new THREE.BoxGeometry(1, 1, 1);
  const add = (col, k, p, sc) => { const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k) })); m.position.set(...p); m.scale.set(...sc); s.add(m); };
  add(0xffe2c6, 7, [0, 9, -2], [12, 0.2, 2.5]);
  add(0xffc293, 3.5, [-9, 2.5, -3], [0.2, 9, 2.5]);
  add(0xffc293, 3, [9, 3, 3], [0.2, 7, 2.2]);
  add(0xd9a27c, 1.6, [0, -1.5, -11], [18, 3, 0.2]);
  add(0xffffff, 10, [4, 7, 7], [2.2, 0.2, 2.2]);
  add(0xffe7d2, 4, [-5, 6, 8], [0.2, 4, 1.2]);
  add(0x6a3a22, 1, [0, -7, 0], [30, 0.2, 30]);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.03).texture; pm.dispose();
  return tex;
}

const glass = (o = {}) => new THREE.MeshPhysicalMaterial({
  color: o.color ?? 0xffffff, metalness: 0, roughness: o.r ?? 0.05, transmission: o.tr ?? 1, thickness: o.th ?? 1.1, ior: o.ior ?? 1.5,
  attenuationColor: new THREE.Color(o.att ?? 0xe0a47a), attenuationDistance: o.ad ?? 2.6, envMapIntensity: o.env ?? 1.8,
  clearcoat: 1, clearcoatRoughness: 0.04, iridescence: o.ir ?? 0.25, iridescenceIOR: 1.35, iridescenceThicknessRange: [200, 600],
  specularIntensity: 1, specularColor: new THREE.Color(0xffe6cf), side: o.side ?? THREE.FrontSide,
});

// кристалл: светящиеся грани, прожилки, блик, холодный перелив по краю
function crystal(o = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
    uniforms: { uTime: o.time, uK: { value: o.k ?? 1 }, uVein: { value: o.vein ?? 1 }, uCu: { value: new THREE.Color("#c98252") }, uHi: { value: new THREE.Color("#ffe2c9") }, uCool: { value: new THREE.Color("#cfe0ff") } },
    vertexShader: `varying vec3 vN, vW; varying vec2 vUv;
      void main(){ vUv=uv; vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform float uTime,uK,uVein; uniform vec3 uCu,uHi,uCool; varying vec3 vN, vW; varying vec2 vUv;
      void main(){ vec3 N=normalize(vN); vec3 V=normalize(cameraPosition-vW); if(dot(N,V)<0.) N=-N;
        float fr=pow(1.-max(dot(N,V),0.),2.2);
        float u=abs(vUv.x*2.-1.), v=vUv.y;
        float edge=smoothstep(.72,1.,u)+smoothstep(.9,1.,v)*.6;
        float vein=pow(abs(sin(vUv.x*3.14159*9.)),28.)*.35*uVein*(1.-v*.6) + smoothstep(.06,0.,abs(vUv.x-.5))*.5*uVein;
        vec3 L=normalize(vec3(.35,1.,.5)); float spec=pow(max(dot(reflect(-V,N),L),0.),36.);
        float dif=.45+.55*max(dot(N,L),0.);
        float shimmer=.5+.5*sin(uTime*.8+v*6.+vUv.x*4.);
        vec3 body=mix(uCu*.55,uHi*.5,v*.6)*dif;
        vec3 col=body*.55 + uHi*(fr*.9+edge*.85) + mix(uHi,uCool,fr)*spec*1.8 + uHi*vein*(.6+.4*shimmer) + uCool*fr*edge*.18;
        float a=clamp(.22+fr*.55+edge*.55+spec*.8+vein*.5,0.,1.);
        gl_FragColor=vec4(col*uK,a*min(uK,1.)); }`,
  });
}
function glowTex() {
  const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d");
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.18, "rgba(255,255,255,.55)"); g.addColorStop(0.45, "rgba(255,255,255,.12)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
let GT; const GLOWS = [];
const glow = (col, k, scale) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: col.clone().multiplyScalar(k), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false })); m.scale.setScalar(scale); m.userData.k = k; m.userData.cur = k; m.userData.col = col; GLOWS.push(m); return m; };
const setGlow = (s, k) => { s.userData.cur = k; };

// материал с собственным свечением на каждый экземпляр (aGlow)
function glowPhys(params, glowCol, rimCol = new THREE.Color(0)) {
  const m = new THREE.MeshPhysicalMaterial(params);
  m.onBeforeCompile = (s) => {
    s.uniforms.uGlowCol = { value: glowCol }; s.uniforms.uRim = { value: rimCol };
    s.vertexShader = "attribute float aGlow;\nvarying float vGlow;\n" + s.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvGlow = aGlow;");
    s.fragmentShader = "uniform vec3 uGlowCol, uRim;\nvarying float vGlow;\n" + s.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uGlowCol * vGlow + uRim * (0.4 + vGlow) * pow(1. - abs(dot(normal, normalize(vViewPosition))), 3.);");
  };
  return m;
}
// стекло со светящимися гранями (кристалл)
function rimGlass(o, rimCol) {
  const m = glass(o);
  m.onBeforeCompile = (s) => {
    s.uniforms.uRim = { value: rimCol };
    s.fragmentShader = "uniform vec3 uRim;\n" + s.fragmentShader.replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uRim * pow(1. - abs(dot(normal, normalize(vViewPosition))), 2.6);");
  };
  return m;
}

export function createWorld(canvas, { mobile = false, onProgress } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", alpha: false });
  let DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.3 : 1.6);
  renderer.setPixelRatio(DPR);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  GT = glowTex();

  const scene = new THREE.Scene();
  scene.background = BG.clone();
  scene.fog = new THREE.FogExp2(BG.getHex(), 0.021);
  scene.environment = makeEnv(renderer);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400);
  const U = { time: { value: 0 } };
  const parts = []; // {g, z0, z1}
  const zone = (g, z0, z1) => { parts.push({ g, z0, z1 }); scene.add(g); return g; };

  // ── пыль по всему маршруту ──
  {
    const N = mobile ? 2600 : 6000, pos = new Float32Array(N * 3), sd = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos[i * 3] = (rnd() - 0.5) * 46; pos[i * 3 + 1] = -4 + rnd() * 22; pos[i * 3 + 2] = 22 - rnd() * 320; sd[i] = rnd(); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: U.time, uPix: { value: DPR }, uCol: { value: PALE.clone().lerp(CU, 0.35) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aSeed; uniform float uTime,uPix; varying float vA;
        void main(){ vec3 p=position; p.y+=sin(uTime*.18+aSeed*6.28)*.35; p.x+=cos(uTime*.13+aSeed*11.)*.35;
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; float d=-mv.z;
          gl_PointSize=uPix*(.7+aSeed*1.9)*(16./max(d,.5));
          vA=(.3+.7*(.5+.5*sin(uTime*(.5+aSeed)+aSeed*40.)))*smoothstep(55.,6.,d)*smoothstep(.4,2.5,d); }`,
      fragmentShader: `uniform vec3 uCol; varying float vA; void main(){ float r=length(gl_PointCoord-.5); float a=smoothstep(.5,.0,r); gl_FragColor=vec4(uCol*a*a*vA*1.5,1.); }`,
    });
    const p = new THREE.Points(g, m); p.frustumCulled = false; scene.add(p);
  }

  // ── световой дождь: тонкие вертикальные нити ──
  function rain(n, x0, x1, z0, z1, yLo, yHi, k) {
    const pos = new Float32Array(n * 6), sd = new Float32Array(n * 2), end = new Float32Array(n * 2);
    for (let i = 0; i < n; i++) { const x = x0 + rnd() * (x1 - x0), z = z0 + rnd() * (z1 - z0), y = rnd(); const s = rnd();
      pos.set([x, y, z, x, y, z], i * 6); sd[i * 2] = sd[i * 2 + 1] = s; end[i * 2] = 0; end[i * 2 + 1] = 1; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1)); g.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: U.time, uK: { value: k }, uLo: { value: yLo }, uHi: { value: yHi }, uCol: { value: PALE.clone().lerp(CU, 0.5) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aSeed,aEnd; uniform float uTime,uLo,uHi; varying float vA;
        void main(){ vec3 p=position; float span=uHi-uLo; float len=.6+aSeed*2.4;
          float y=uHi-mod(p.y*span+uTime*(.6+aSeed*1.6),span+len); p.y=y+aEnd*len;
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; float d=-mv.z;
          vA=aEnd*(.25+.75*aSeed)*smoothstep(45.,8.,d)*smoothstep(uLo,uLo+2.,p.y); }`,
      fragmentShader: `uniform vec3 uCol; uniform float uK; varying float vA; void main(){ gl_FragColor=vec4(uCol*vA*uK,1.); }`,
    });
    const l = new THREE.LineSegments(g, m); l.frustumCulled = false; return l;
  }

  // ── лучи света сверху (объёмные конусы) ──
  const rayMats = [];
  function ray(x, y, z, rTop, rBot, h, k) {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, 48, 1, true);
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: U.time, uK: { value: k }, uCol: { value: PALE.clone().lerp(CU, 0.45) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vN,vV; varying vec2 vUv; varying float vD;
        void main(){ vec4 wp=modelMatrix*vec4(position,1.); vN=normalize(mat3(modelMatrix)*normal); vV=normalize(cameraPosition-wp.xyz); vUv=uv; vD=length(cameraPosition-wp.xyz); gl_Position=projectionMatrix*viewMatrix*wp; }`,
      fragmentShader: `uniform float uTime,uK; uniform vec3 uCol; varying vec3 vN,vV; varying vec2 vUv; varying float vD;
        void main(){ float f=pow(abs(dot(normalize(vN),normalize(vV))),2.2); float h=vUv.y;
          float fade=smoothstep(0.,.55,h)*smoothstep(1.,.8,h);
          float st=.55+.45*sin(vUv.x*70.+uTime*.25)*sin(vUv.x*29.-uTime*.17);
          gl_FragColor=vec4(uCol*f*fade*st*uK*smoothstep(1.,7.,vD)*smoothstep(70.,20.,vD),1.); }`,
    });
    rayMats.push(m);
    const me = new THREE.Mesh(g, m); me.position.set(x, y, z); return me;
  }

  // ════ 0 · КОЛЬЦО-ДНК ════
  const C0 = new THREE.Vector3(0, Y0, 0), R0 = 3.25;
  const ring = new THREE.Group(); ring.position.copy(C0);
  {
    const tw = 9, rr = 0.46, seg = 700;
    const strand = (phi) => { const pts = []; for (let i = 0; i < seg; i++) { const th = (i / seg) * Math.PI * 2, a = tw * th + phi;
      const rad = new THREE.Vector3(Math.cos(th), Math.sin(th), 0);
      pts.push(rad.clone().multiplyScalar(R0 + rr * Math.cos(a)).add(new THREE.Vector3(0, 0, rr * Math.sin(a)))); }
      return new THREE.CatmullRomCurve3(pts, true); };
    const gm = glass({ th: 0.9, ad: 1.8, ir: 0.45, env: 2.2 });
    const s1 = strand(0), s2 = strand(Math.PI);
    ring.add(new THREE.Mesh(new THREE.TubeGeometry(s1, mobile ? 500 : 900, 0.13, 14, true), gm));
    ring.add(new THREE.Mesh(new THREE.TubeGeometry(s2, mobile ? 500 : 900, 0.13, 14, true), gm));
    // перемычки — светящиеся
    const n = tw * 8, rg = new THREE.CylinderGeometry(0.02, 0.02, 1, 6); rg.translate(0, 0.5, 0);
    const rm = new THREE.MeshBasicMaterial({ color: HOT.clone().multiplyScalar(1.35) });
    const im = new THREE.InstancedMesh(rg, rm, n), d = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0);
    const at = (th, phi) => { const a = tw * th + phi; return new THREE.Vector3(Math.cos(th), Math.sin(th), 0).multiplyScalar(R0 + rr * Math.cos(a)).add(new THREE.Vector3(0, 0, rr * Math.sin(a))); };
    for (let k = 0; k < n; k++) { const th = (k / n) * Math.PI * 2, a = at(th, 0), b = at(th, Math.PI);
      const dir = b.clone().sub(a), L = dir.length(); d.position.copy(a); d.quaternion.setFromUnitVectors(up, dir.normalize()); d.scale.set(1, L, 1); d.updateMatrix(); im.setMatrixAt(k, d.matrix); }
    ring.add(im);
    const core = new THREE.Mesh(new THREE.TorusGeometry(R0, 0.018, 8, 360), new THREE.MeshBasicMaterial({ color: PALE.clone().multiplyScalar(1.6) }));
    ring.add(core);
  }
  const g0 = new THREE.Group(); g0.add(ring);
  const back0 = glow(CU, 0.55, 16); back0.position.set(0, Y0, -9); g0.add(back0);
  const far0 = glow(HOT, 1.4, 3.2); far0.position.set(0, Y0, -26); g0.add(far0);
  g0.add(ray(-2.6, 9, -4, 0.2, 2.2, 13, 0.7), ray(1.8, 9.5, -6, 0.15, 1.6, 14, 0.55), ray(0, 9, -2.5, 0.3, 3.4, 12, 0.5), ray(4.5, 9, -9, 0.2, 2, 14, 0.4), ray(-5.5, 9, -10, 0.2, 2.4, 14, 0.35));
  g0.add(rain(mobile ? 280 : 600, -16, 16, 6, -26, -1, 13, 0.75));
  const pl0 = new THREE.PointLight(HOT, 40, 18, 2); pl0.position.set(0, Y0, -2.5); g0.add(pl0);
  zone(g0, -30, 10);

  // зеркальный пол
  let floor = null;
  if (!mobile) {
    floor = new Reflector(new THREE.PlaneGeometry(90, 340), { textureWidth: 768, textureHeight: 768, color: 0x6e6862, clipBias: 0.003 });
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, -1.0, -140); scene.add(floor);
  }
  const floorVeil = new THREE.Mesh(new THREE.PlaneGeometry(90, 340), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, uniforms: { uCol: { value: BG.clone() } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform vec3 uCol; varying vec3 vW; void main(){ float d=length(vW.xz-cameraPosition.xz); gl_FragColor=vec4(uCol, ${mobile ? "0.92" : "0.5"}*smoothstep(4.,40.,d)+${mobile ? "0.0" : "0.18"}); }`,
  }));
  floorVeil.rotation.x = -Math.PI / 2; floorVeil.position.set(0, -0.985, -140); scene.add(floorVeil);
  if (mobile) { floorVeil.material = new THREE.MeshPhysicalMaterial({ color: 0x0b0806, roughness: 0.12, metalness: 0.6, clearcoat: 1, envMapIntensity: 0.7 }); }

  // ════ 1–2 · ОСКОЛКИ → СОТЫ (один набор ячеек) ════
  const HX = mobile ? 20 : 26, HY = mobile ? 13 : 15, HN = HX * HY, hr = 0.92;
  const hexG = new THREE.CylinderGeometry(hr * 0.94, hr * 0.94, 0.24, 6, 1); hexG.rotateX(Math.PI / 2);
  const hexM = glowPhys({ color: 0x0a0705, metalness: 0.85, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.8 }, new THREE.Color('#b8693a').multiplyScalar(0.75), new THREE.Color('#e09a68').multiplyScalar(0.9));
  const hex = new THREE.InstancedMesh(hexG, hexM, HN); hex.frustumCulled = false;
  const hGlow = new Float32Array(HN); hexG.setAttribute("aGlow", new THREE.InstancedBufferAttribute(hGlow, 1));
  const H = []; const WZ = -63, WR = 30;
  for (let j = 0, k = 0; j < HY; j++) for (let i = 0; i < HX; i++, k++) {
    const dx = Math.sqrt(3) * hr, dy = 1.5 * hr; const x = (i - (HX - 1) / 2) * dx + (j % 2 ? dx / 2 : 0), y = Y0 + (j - (HY - 1) / 2) * dy;
    const a = x / WR; const wall = new THREE.Vector3(WR * Math.sin(a), y, WZ + WR * (1 - Math.cos(a)));
    const wq = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -a, 0));
    let sx, sy; do { sx = (rnd() - 0.5) * 26; sy = (rnd() - 0.5) * 15; } while (Math.hypot(sx, sy) < 2.4);
    const sc = new THREE.Vector3(sx, Y0 + sy, -9 - rnd() * 38);
    const sq = new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd() * 6.3, rnd() * 6.3, rnd() * 6.3));
    const lit = rnd() < 0.46;
    H.push({ wall, wq, sc, sq, s: 0.45 + rnd() * 0.7, spin: new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.6), d: rnd(), lit, gk: lit ? 0.35 + rnd() * 1.3 : rnd() * 0.06, ph: rnd() * 6.3,
      dist: Math.hypot(x, y - Y0) / 18, odir: new THREE.Vector3(x, y - Y0, 0).normalize() });
  }
  const g1 = new THREE.Group(); g1.add(hex);
  const wallGlow = glow(CU, 0.0, 34); wallGlow.position.set(0, Y0, WZ - 6); g1.add(wallGlow);
  zone(g1, -80, 2);

  // ════ 3 · ТРИ КАРТОЧКИ ════
  const g3 = new THREE.Group(); const cards = []; const CZ = -77;
  {
    const sh = new THREE.Shape(), w = 3.1, h = 4.5, r = 0.28;
    sh.moveTo(-w / 2 + r, -h / 2); sh.lineTo(w / 2 - r, -h / 2); sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); sh.lineTo(w / 2, h / 2 - r); sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    sh.lineTo(-w / 2 + r, h / 2); sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); sh.lineTo(-w / 2, -h / 2 + r); sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const pg = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3, curveSegments: 10 }); pg.center();
    const pm = glass({ r: 0.32, th: 0.5, ad: 4, ir: 0.08, env: 1.3 });
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.ShapeGeometry(sh, 10)), new THREE.LineBasicMaterial({ color: CU.clone().multiplyScalar(1.4), transparent: true, opacity: 0.8 }));
    const cg = crystal({ time: U.time, k: 0.95, vein: 0.3 });
    const plateG = new THREE.PlaneGeometry(3.4, 4.8);
    for (let k = 0; k < 3; k++) {
      const grp = new THREE.Group(); const base = new THREE.Vector3((k - 1) * 4.4, Y0, CZ);
      const panel = new THREE.Mesh(pg, pm); grp.add(panel);
      const e = edge.clone(); e.position.z = 0.12; grp.add(e);
      const bg = new THREE.Mesh(plateG, new THREE.MeshBasicMaterial({ map: GT, color: (k === 1 ? HOT : CU).clone().multiplyScalar(0.42) })); bg.position.set(0, 0.2, -0.7); grp.add(bg);
      const cpl = new THREE.PointLight(0xffd9b8, 14, 7, 2); cpl.position.set(0.8, 1.2, 2.2); grp.add(cpl);
      const obj = new THREE.Group(); obj.position.z = 0.9; obj.scale.setScalar(1.35);
      if (k === 0) { // стратегия — друза кристаллов
        const og = new THREE.OctahedronGeometry(0.42, 0);
        [[0, 0, 0, 2.6, 0], [-0.45, -0.35, 0.1, 1.7, 0.45], [0.42, -0.4, -0.1, 1.9, -0.4], [0.15, -0.6, 0.35, 1.2, -0.15], [-0.2, -0.65, -0.3, 1.1, 0.25]].forEach(([x, y, z, sy, rz]) => {
          const m = new THREE.Mesh(og, cg); m.position.set(x, y, z); m.scale.set(1, sy, 1); m.rotation.z = rz; obj.add(m); });
      } else if (k === 1) { // продажи — монолит и луч
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.62, 3.1, 0.62), cg); m.rotation.y = 0.6; obj.add(m);
        const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 5.4), new THREE.MeshBasicMaterial({ color: PALE.clone().multiplyScalar(3), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); beam.rotation.z = -0.55; beam.position.z = 0.2; obj.add(beam);
        const bg2 = glow(PALE, 1.2, 1.2); bg2.position.z = 0.25; obj.add(bg2);
      } else { // ИИ-команда — ядро и спутники
        const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 0), cg); obj.add(c); obj.userData.core = c;
        const tg = new THREE.TetrahedronGeometry(0.24, 0);
        for (let q = 0; q < 6; q++) { const m = new THREE.Mesh(tg, cg); m.userData.a = (q / 6) * Math.PI * 2; obj.add(m); }
      }
      grp.add(obj);
      grp.position.copy(base); g3.add(grp); cards.push({ grp, base, obj, k });
    }
  }
  zone(g3, -90, -60);

  // ════ 4 · ТОННЕЛЬ 16 НЕДЕЛЬ ════
  const TZ0 = -90, TZ1 = -201, TR = 5.3, AROUND = mobile ? 26 : 32, STEP = 1.05;
  const ROWS = Math.round((TZ0 - TZ1) / STEP), TN = ROWS * AROUND;
  const tileG = new THREE.BoxGeometry(((2 * Math.PI * TR) / AROUND) * 0.9, 0.14, STEP * 0.9);
  const tileM = glowPhys({ color: 0x0a0705, metalness: 0.8, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 0.7 }, new THREE.Color('#c0703f').multiplyScalar(1.1), new THREE.Color('#d98d58').multiplyScalar(0.5));
  const tiles = new THREE.InstancedMesh(tileG, tileM, TN); tiles.frustumCulled = false;
  const tGlow = new Float32Array(TN); tileG.setAttribute("aGlow", new THREE.InstancedBufferAttribute(tGlow, 1));
  const T = [];
  {
    const d = new THREE.Object3D();
    for (let r = 0; r < ROWS; r++) for (let a = 0; a < AROUND; a++) {
      const k = r * AROUND + a, ph = (a / AROUND) * Math.PI * 2 + (r % 2 ? Math.PI / AROUND : 0), inset = rnd() < 0.3 ? rnd() * 0.35 : 0;
      const z = TZ0 - r * STEP, rad = TR - inset;
      d.position.set(Math.cos(ph) * rad, Y0 + Math.sin(ph) * rad, z); d.rotation.set(0, 0, ph - Math.PI / 2); d.scale.set(1, 1 + inset * 3, 1); d.updateMatrix(); tiles.setMatrixAt(k, d.matrix);
      const h = rnd(); T.push({ z, base: h < 0.1 ? 0.8 + rnd() * 1.3 : h < 0.32 ? 0.06 + rnd() * 0.2 : rnd() * 0.02, ph: rnd() * 6.3, wk: Math.floor(((TZ0 - z) / (TZ0 - TZ1)) * 16) });
    }
  }
  const g4 = new THREE.Group(); g4.add(tiles);
  const endGlow = glow(HOT, 1.6, 26); endGlow.position.set(0, Y0, -224); g4.add(endGlow);
  zone(g4, -240, -86);
  const weekZ = (w) => TZ0 - (w + 0.5) * ((TZ0 - TZ1) / 16);

  // ════ 5 · ТЁМНАЯ СФЕРА ════
  const SZ = -213, SR = 4.4;
  const g5 = new THREE.Group();
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(SR, 96, 64), new THREE.MeshPhysicalMaterial({ color: 0x050302, metalness: 0.15, roughness: 0.07, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 2.4 }));
  sphere.position.set(0, Y0, SZ); g5.add(sphere);
  const rim = new THREE.Mesh(new THREE.SphereGeometry(SR * 1.03, 64, 48), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uCol: { value: HOT.clone() }, uK: { value: 1 } },
    vertexShader: `varying vec3 vN,vV; void main(){ vec4 w=modelMatrix*vec4(position,1.); vN=normalize(mat3(modelMatrix)*normal); vV=normalize(cameraPosition-w.xyz); gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform vec3 uCol; uniform float uK; varying vec3 vN,vV; void main(){ float f=1.-abs(dot(normalize(vN),normalize(vV))); gl_FragColor=vec4(uCol*pow(f,4.)*1.8*uK,1.); }`,
  }));
  rim.position.copy(sphere.position); g5.add(rim);
  zone(g5, -220, -205);

  // ════ 6 · ЛУЧИ, ТЕМНОТА (кейсы) ════
  const g6 = new THREE.Group();
  [[-5, -232, 0.25, 2.6, 0.55], [2.5, -236, 0.3, 3.6, 0.7], [-1.2, -244, 0.2, 2.4, 0.5], [6, -246, 0.25, 3, 0.45], [-7.5, -250, 0.2, 2.8, 0.4]].forEach(([x, z, a, b, k]) => g6.add(ray(x, 9.5, z, a, b, 17, k)));
  g6.add(rain(mobile ? 220 : 480, -16, 16, -222, -262, -1, 14, 0.6));
  zone(g6, -265, -218);

  // ════ 7–8 · ВСПЫШКА → ЛОТОС ════
  const LC = new THREE.Vector3(0, 0.1, -281);
  const g8 = new THREE.Group(); g8.position.copy(LC);
  const petals = [];
  function petalGeo(len, wid, cup, curl) {
    const g = new THREE.PlaneGeometry(1, 1, 18, 36), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const u = p.getX(i) + 0.5, v = p.getY(i) + 0.5;
      const w = wid * Math.pow(Math.sin(Math.PI * Math.min(1, v * 0.96 + 0.04)), 0.62) * (1 - 0.32 * v * v * v), s = (u - 0.5) * 2;
      p.setXYZ(i, s * w * 0.5, v * len, -cup * s * s * w + curl * v * v * len - 0.05 * Math.sin(Math.PI * v)); }
    g.computeVertexNormals(); return g;
  }
  const lm = crystal({ time: U.time, k: 0.72 });
  [[6, 4.0, 2.0, 0.5, 0.22, 0.95, 0], [6, 3.3, 1.7, 0.52, 0.16, 0.62, Math.PI / 6], [8, 2.6, 1.25, 0.55, 0.08, 0.36, 0.2], [8, 1.7, 0.85, 0.55, 0.02, 0.14, 0.6]].forEach(([n, len, wid, cup, curl, open, off], layer) => {
    const geo = petalGeo(len, wid, cup, curl);
    for (let q = 0; q < n; q++) { const az = new THREE.Group(); az.rotation.y = off + (q / n) * Math.PI * 2; const tilt = new THREE.Group(); const m = new THREE.Mesh(geo, lm); tilt.add(m); az.add(tilt); g8.add(az);
      petals.push({ tilt, open, closed: 0.08 + layer * 0.02, d: rnd() * 0.12 + (3 - layer) * 0.05 }); }
  });
  const stam = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: HOT.clone().multiplyScalar(3) }), 24);
  { const d = new THREE.Object3D(); for (let i = 0; i < 24; i++) { const a = i * 2.4, r = 0.12 + (i / 24) * 0.42; d.position.set(Math.cos(a) * r, 0.75 + Math.sin(i) * 0.12 + (1 - i / 24) * 0.25, Math.sin(a) * r); d.updateMatrix(); stam.setMatrixAt(i, d.matrix); } }
  const lcore = new THREE.Group(); lcore.add(stam); g8.add(lcore);
  const lglow = glow(HOT, 1.2, 3.2); lglow.position.y = 0.9; g8.add(lglow);
  const lpl = new THREE.PointLight(HOT, 30, 12, 2); lpl.position.set(0, 1.4, 0); g8.add(lpl);
  const lpl2 = new THREE.PointLight(0xffe2c8, 20, 16, 2); lpl2.position.set(0, 6, 3); g8.add(lpl2);
  g8.scale.setScalar(1);
  const g7 = new THREE.Group(); g7.position.set(LC.x, LC.y + 1.3, LC.z);
  const flareMat = (k) => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, uniforms: { uK: { value: 0 }, uCol: { value: PALE.clone().lerp(HOT, 0.4) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv-.5; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uK; uniform vec3 uCol; varying vec2 vUv; void main(){ float a=exp(-pow(vUv.y*9.,2.))*pow(1.-abs(vUv.x)*2.,2.2); float c=exp(-pow(length(vUv*vec2(3.,9.)),2.)*3.); gl_FragColor=vec4(uCol*(a*.9+c*1.5)*uK,1.); }` });
  const fl1 = new THREE.Mesh(new THREE.PlaneGeometry(26, 2.2), flareMat()), fl2 = new THREE.Mesh(new THREE.PlaneGeometry(26, 2.2), flareMat());
  fl1.rotation.z = 0.62; fl2.rotation.z = -0.62; const flare = new THREE.Group(); flare.add(fl1, fl2); g7.add(flare);
  const fcore = glow(PALE, 0, 7); g7.add(fcore);
  const g9r = new THREE.Group();
  [[-3.6, -286, 0.3, 2.4, 0.38], [3.4, -288, 0.3, 2.6, 0.38], [0, -284, 0.35, 3.2, 0.42]].forEach(([x, z, a, b, k]) => g9r.add(ray(x, 10, z, a, b, 17, k)));
  g9r.add(rain(mobile ? 200 : 420, -14, 14, -262, -296, -1, 15, 0.55));
  const g8z = new THREE.Group(); g8z.add(g7, g8, g9r);
  zone(g8z, -300, -262);

  // ════ 9 · ОРБИТА С ЯДРОМ ════
  const OC = new THREE.Vector3(0, 6.6, -285.5);
  const g10 = new THREE.Group(); g10.position.copy(OC);
  const ocore = new THREE.Mesh(new THREE.SphereGeometry(0.42, 48, 32), new THREE.MeshBasicMaterial({ color: HOT.clone().multiplyScalar(4) })); g10.add(ocore);
  const oglow = glow(HOT, 1.4, 7); g10.add(oglow);
  const orbits = [];
  [[1.6, 0.016, 1.25, 0.2, 1.6], [2.5, 0.02, 1.1, -0.4, 1.2], [3.6, 0.014, 1.38, 0.9, 1.0]].forEach(([R, t, rx, ry, k]) => {
    const o = new THREE.Mesh(new THREE.TorusGeometry(R, t, 8, 256), new THREE.MeshBasicMaterial({ color: CU.clone().multiplyScalar(k) })); o.rotation.set(rx, ry, 0); g10.add(o); orbits.push(o);
    const dot = glow(PALE, 1.2, 0.5); dot.userData.R = R; o.add(dot); o.userData.dot = dot; });
  const arc = new THREE.Mesh(new THREE.TorusGeometry(11, 0.14, 24, 360), glass({ th: 0.5, ad: 2, ir: 0.5, env: 2.4 })); arc.rotation.x = 1.42; arc.position.y = -4.2; g10.add(arc);
  zone(g10, -300, -270);

  // ── пост-обработка ──
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.85, 0.62, 0.78); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const fin = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uDark: { value: 0 }, uGrain: { value: 0.035 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime,uDark,uGrain; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){ vec2 d=vUv-.5; float r=dot(d,d); vec3 c;
        c.r=texture2D(tDiffuse,vUv-d*r*.014).r; c.g=texture2D(tDiffuse,vUv).g; c.b=texture2D(tDiffuse,vUv+d*r*.014).b;
        c*=1.-r*.85; c+=(h(vUv*937.+fract(uTime*.37))-.5)*uGrain; c*=1.-uDark; gl_FragColor=vec4(c,1.); }`,
  });
  composer.addPass(fin);

  // ── размер ──
  let W = 1, Hh = 1;
  function resize() {
    W = innerWidth; Hh = innerHeight; renderer.setSize(W, Hh, false); composer.setSize(W, Hh); composer.setPixelRatio(DPR);
    bloom.resolution.set(W * DPR * 0.5, Hh * DPR * 0.5);
    const asp = W / Hh; camera.aspect = asp;
    camera.fov = asp >= 1 ? 40 : Math.min(72, (2 * Math.atan(Math.tan((34 * Math.PI) / 360) / asp) * 180) / Math.PI);
    camera.updateProjectionMatrix();
  }
  resize();

  // ── кадр ──
  let cs = 0, vel = 0, side = 0;
  const P = new THREE.Vector3(), L = new THREE.Vector3(), tmpQ = new THREE.Quaternion(), tmpE = new THREE.Euler(), dm = new THREE.Object3D(), v3 = new THREE.Vector3();
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  function update(cTarget, dt, t, sideTarget) {
    U.time.value = t; fin.uniforms.uTime.value = t;
    // пружина без перелёта + предел скорости
    const prev = cs; const k = 1 - Math.exp(-dt * 2.6); let step = (cTarget - cs) * k; step = cl(step, -dt * 1.4, dt * 1.4); cs += step;
    vel += ((cs - prev) / Math.max(dt, 1e-3) - vel) * 0.1;
    side += (sideTarget - side) * (1 - Math.exp(-dt * 2.2));
    mouse.sx += (mouse.x - mouse.sx) * 0.04; mouse.sy += (mouse.y - mouse.sy) * 0.04;
    const c = cs;

    camAt(c, P, L);
    P.x += Math.sin(t * 0.31) * 0.14 + mouse.sx * 0.35; P.y += Math.sin(t * 0.23) * 0.1 - mouse.sy * 0.22;
    camera.position.copy(P); camera.lookAt(L); camera.rotateZ(cl(-vel * 0.03, -0.05, 0.05) + Math.sin(t * 0.17) * 0.006);
    // смещение композиции под текст
    const off = -side * 0.2 * W, offY = W < Hh ? 0.2 * Hh : 0; camera.setViewOffset(W, Hh, off, offY, W, Hh);

    // видимость зон
    const cz = P.z; for (const z of parts) z.g.visible = z.z1 > cz - 95 && z.z0 < cz + 14;
    const fv = c < 2.35 || c > 6.9; if (floor) floor.visible = fv; floorVeil.visible = fv;

    // 0 · кольцо
    if (g0.visible) { ring.rotation.z = t * 0.06 + c * 0.25; ring.rotation.y = Math.sin(t * 0.21) * 0.08; setGlow(back0, 0.5 + 0.12 * Math.sin(t * 0.7)); setGlow(far0, 1.1 + 0.4 * Math.sin(t * 0.9)); pl0.intensity = 36 + 8 * Math.sin(t * 0.8); }

    // 1–2 · осколки → соты → раскрытие
    if (g1.visible) {
      const m = ss(1.75, 2.62, c), o = ss(3.02, 3.62, c);
      for (let i = 0; i < HN; i++) { const h = H[i];
        const mi = ss(0, 1, m * 1.5 - h.d * 0.5), oi = ss(0, 1, o * 1.7 - h.dist * 0.7);
        tmpE.set(h.spin.x * t, h.spin.y * t, h.spin.z * t); tmpQ.setFromEuler(tmpE).premultiply(h.sq);
        dm.quaternion.copy(tmpQ).slerp(h.wq, mi);
        dm.position.lerpVectors(h.sc, h.wall, mi);
        dm.position.y += Math.sin(t * 0.5 + h.ph) * 0.25 * (1 - mi);
        if (oi > 0) { dm.position.addScaledVector(h.odir, oi * 26 + oi * oi * 10); dm.position.z -= oi * 7; tmpE.set(oi * h.spin.x * 6, oi * h.spin.y * 6, 0); dm.quaternion.multiply(tmpQ.setFromEuler(tmpE)); }
        const s = THREE.MathUtils.lerp(h.s, 1, mi) * (1 - oi * 0.75); dm.scale.setScalar(s); dm.updateMatrix(); hex.setMatrixAt(i, dm.matrix);
        const fl = 0.75 + 0.25 * Math.sin(t * (1.3 + h.d) + h.ph);
        hGlow[i] = (h.lit ? h.gk * fl : h.gk) * (0.25 + 0.75 * mi) * (1 + oi * 2.2) * (h.lit || mi < 0.5 ? 1 : 0.4);
      }
      hex.instanceMatrix.needsUpdate = true; hexG.attributes.aGlow.needsUpdate = true;
      setGlow(wallGlow, 0.25 * m * (1 - o) + 0.5 * bump(3.0, 3.3, 3.5, 3.9, c));
    }

    // 3 · карточки
    if (g3.visible) {
      const a = ss(2.95, 3.45, c), sp = ss(3.8, 4.3, c); g3.visible = a > 0.01;
      for (const cd of cards) { const { grp, base, obj, k: q } = cd;
        grp.position.set(base.x * (1 + sp * 1.25), base.y - (1 - a) * 12 + (q === 1 ? sp * 9 : 0) + Math.sin(t * 0.6 + q) * 0.08, base.z + (1 - a) * 4);
        grp.rotation.y = (1 - q) * 0.14 * (1 - sp) + Math.sin(t * 0.3 + q * 2) * 0.05 - (q - 1) * sp * 0.7; grp.rotation.x = (1 - a) * 0.5;
        obj.rotation.y = t * 0.35 + q; if (q === 2) obj.children.forEach((ch, j) => { if (ch.userData.a !== undefined) { const an = ch.userData.a + t * 0.6; ch.position.set(Math.cos(an) * 1.05, Math.sin(an * 2) * 0.25, Math.sin(an) * 1.05); ch.rotation.set(t, t * 0.7, 0); } });
      }
    }

    // 4 · тоннель: недели загораются, поток света вперёд
    if (g4.visible) {
      const ahead = cz - 6 - ((t * 9) % 60);
      const wkNow = cl(Math.floor(((TZ0 - cz) / (TZ0 - TZ1)) * 16), -1, 16);
      for (let i = 0; i < TN; i++) { const q = T[i];
        let gl = q.base * (0.7 + 0.3 * Math.sin(t * 1.1 + q.ph));
        const wz = weekZ(q.wk); if (Math.abs(q.z - wz) < 0.6) gl += q.wk <= wkNow ? 0.95 : 0.12;
        const dz = q.z - ahead; gl += 0.85 * Math.exp(-(dz * dz) / 5);
        tGlow[i] = gl; }
      tileG.attributes.aGlow.needsUpdate = true;
      setGlow(endGlow, 1.1 + 0.7 * ss(4.4, 5.2, c) + 0.2 * Math.sin(t * 0.8));
    }

    // 5 · сфера: тёмный проход
    if (g5.visible) { sphere.rotation.y = t * 0.05; rim.material.uniforms.uK.value = 0.7 + 0.6 * ss(4.7, 5.5, c); }
    fin.uniforms.uDark.value = 0.92 * bump(5.78, 5.93, 6.0, 6.2, c);

    // 7–8 · вспышка и лотос
    if (g8z.visible) {
      const fk = 0.65 * bump(6.45, 7.2, 7.8, 8.25, c) + 0.85 * bump(7.82, 7.97, 8.02, 8.25, c);
      fl1.material.uniforms.uK.value = fl2.material.uniforms.uK.value = fk * (0.9 + 0.1 * Math.sin(t * 3));
      flare.quaternion.copy(camera.quaternion); flare.rotation.z += 0; setGlow(fcore, fk * 1.4);
      flare.scale.setScalar(0.6 + 0.6 * ss(6.5, 7.6, c));
      const b = ss(7.45, 8.35, c), sc = 0.12 + 0.88 * ss(7.4, 8.0, c); g8.visible = c > 7.25;
      g8.scale.setScalar(sc * 0.95); g8.rotation.y = t * 0.06; g8.position.y = LC.y + Math.sin(t * 0.5) * 0.08 - ss(8.7, 9.6, c) * 0.5;
      for (const p of petals) { const bi = ss(0, 1, (b - p.d) / (1 - p.d)); p.tilt.rotation.x = THREE.MathUtils.lerp(p.closed, p.open, bi) + Math.sin(t * 0.7 + p.d * 30) * 0.02; }
      setGlow(lglow, (0.55 + 0.2 * Math.sin(t * 1.2)) * sc); lpl.intensity = 9 * sc; lpl2.intensity = 26 * sc;
      lcore.rotation.y = t * 0.4;
    }

    // 9 · орбита
    if (g10.visible) { const a = ss(8.6, 9.4, c); g10.scale.setScalar(0.3 + 0.7 * a); g10.visible = a > 0.01;
      orbits.forEach((o, i) => { o.rotation.z = t * (0.25 + i * 0.1) * (i % 2 ? -1 : 1); const d = o.userData.dot; d.position.set(Math.cos(t * (0.8 + i * 0.3)) * d.userData.R, Math.sin(t * (0.8 + i * 0.3)) * d.userData.R, 0); });
      arc.rotation.z = t * 0.03; setGlow(oglow, (1.2 + 0.3 * Math.sin(t * 1.4)) * a); }

    // ореолы гаснут, когда камера подлетает вплотную — без засветки экрана
    for (const g of GLOWS) { if (!g.parent || !g.parent.visible) continue; g.getWorldPosition(v3); const sc = g.scale.x * (g.parent.scale.x || 1), dd = v3.distanceTo(camera.position);
      const k = g.userData.cur * ss(sc * 0.35, sc * 1.05 + 1, dd); g.material.color.copy(g.userData.col).multiplyScalar(k); g.visible = k > 0.002; }
    composer.render(dt);
  }

  // проекция точки якоря карточки на экран (для подписей)
  const cardAnchor = (i) => { const cd = cards[i]; v3.set(0, -2.75, 0); cd.grp.localToWorld(v3); v3.project(camera); return { x: (v3.x * 0.5 + 0.5) * W, y: (-v3.y * 0.5 + 0.5) * Hh, z: v3.z }; };

  async function warm(prog) {
    // прогрев шейдеров по всем главам, чтобы не было рывков при первом проходе
    for (let c = 0; c <= 10; c += 1) { cs = c; for (const z of parts) z.g.visible = true; renderer.compile(scene, camera); camAt(c, P, L); camera.position.copy(P); camera.lookAt(L); composer.render(0.016); prog && prog(c / 10); await new Promise((r) => setTimeout(r, 0)); }
    cs = 0;
  }

  return { update, resize, mouse, cardAnchor, warm, snap(c) { cs = c; }, get c() { return cs; }, setDPR(d) { DPR = d; renderer.setPixelRatio(d); resize(); }, lowPower() { if (floor) { scene.remove(floor); floor = null; } bloom.strength = 0.7; }, renderer };
}
