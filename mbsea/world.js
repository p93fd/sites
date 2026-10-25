// mbsea · один подводный мир, камера плывёт сквозь него без остановки.
// Главы: 0 лес ламинарии · 1 лист срезан руками · 2 цельные листы в цеху · 3 лист → гель
// 4 банка 1 кг · 5 состав (протокол) · 6 отзывы · 7 набор мастера · 8 опт (коробки)
// 9 вопросы (коробка поднимается) · 10 выход на поверхность
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

const BG = new THREE.Color("#02110f"), SKY = new THREE.Color("#0a2226");
const FOAM = new THREE.Color("#bdf2e2"), SEA = new THREE.Color("#2f8f86"), KELP = new THREE.Color("#9c8a3a"), KELP0 = new THREE.Color("#16240c");
const SUN = new THREE.Color("#ffe3b0"), GOLD = new THREE.Color("#ffcf7a");
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ss = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const bump = (a, b, c, d, x) => ss(a, b, x) * (1 - ss(c, d, x));
const rnd = (() => { let s = 11; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
const SURF = 14; // уровень поверхности моря
const NC = 11; // число глав

// ── ключевые кадры камеры: c → позиция, взгляд ──
const K = [
  [0.0, [0, 2.4, 22], [0, 3.4, 0]],
  [0.5, [0, 2.6, 15.5], [0, 3.6, -2]],
  [1.0, [0, 3.2, -12], [0, 4.6, -38]],
  [1.5, [0, 3.8, -25.5], [0, 5.6, -40]],
  [2.0, [0, 5.4, -43], [0, 1.4, -64]],
  [2.5, [0, 6.6, -55], [0, 0.4, -70]],
  [3.0, [0, 4.6, -79], [0, 3, -104]],
  [3.5, [0, 3.1, -92.5], [0, 3, -104]],
  [4.0, [0, 3.2, -110], [0, 2.1, -128]],
  [4.5, [0, 2.7, -120.2], [0, 1.45, -128]],
  [5.0, [0, 3, -134], [0, 2.8, -156]],
  [5.5, [0, 3, -146.5], [0, 2.8, -156]],
  [6.0, [0, 3, -163], [0, 3.4, -186]],
  [6.5, [0, 2.9, -176.5], [0, 3.5, -186]],
  [7.0, [0, 3, -194], [0, 1.3, -214]],
  [7.5, [0, 2.6, -205.5], [0, 1.15, -214]],
  [8.0, [1.4, 3.6, -221], [0, 1.2, -242]],
  [8.5, [3.4, 4.8, -232.5], [0, 1.1, -242]],
  [9.0, [1.6, 4.2, -247], [0, 4, -266]],
  [9.5, [0, 4.8, -256.5], [0, 7.4, -266]],
  [10.0, [0, 9.6, -266], [0, 12.6, -282]],
  [10.5, [0, 15.4, -279], [0, 15.1, -330]],
  [11.0, [0, 16.0, -283], [0, 15.3, -340]],
].map(([c, p, l]) => ({ c, p: new THREE.Vector3(...p), l: new THREE.Vector3(...l) }));
function camAt(c, outP, outL) {
  c = cl(c, 0, NC);
  let i = 0; while (i < K.length - 2 && K[i + 1].c < c) i++;
  const a = K[Math.max(0, i - 1)], b = K[i], d = K[i + 1], e = K[Math.min(K.length - 1, i + 2)];
  const t = cl((c - b.c) / (d.c - b.c));
  const cr = (p0, p1, p2, p3, o) => { const t2 = t * t, t3 = t2 * t;
    for (const k of ["x", "y", "z"]) o[k] = 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3); };
  cr(a.p, b.p, d.p, e.p, outP); cr(a.l, b.l, d.l, e.l, outL);
}

// ── окружение для отражений: холодные световые панели ──
function makeEnv(renderer) {
  const s = new THREE.Scene(); s.background = new THREE.Color(0x020a09);
  const g = new THREE.BoxGeometry(1, 1, 1);
  const add = (col, k, p, sc) => { const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k) })); m.position.set(...p); m.scale.set(...sc); s.add(m); };
  add(0xe6fbff, 7, [0, 9, -1], [12, 0.2, 3]);
  add(0x8fe3d0, 2.6, [-9, 2.5, -3], [0.2, 8, 3]);
  add(0xcff4ff, 3.2, [9, 3, 3], [0.2, 7, 2.2]);
  add(0x2f8f86, 1.4, [0, -1.5, -11], [18, 3, 0.2]);
  add(0xffffff, 9, [4, 7, 7], [2.2, 0.2, 2.2]);
  add(0xffe6c4, 2.2, [-5, 6, 8], [0.2, 4, 1.2]);
  add(0x0d3b33, 1, [0, -7, 0], [30, 0.2, 30]);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.03).texture; pm.dispose();
  return tex;
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

// ── этикетка банки: белый пластик, синие волны, Arti made by sea ──
function labelTex(small) {
  const W = 2048, H = 640, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  x.fillStyle = "#f2f5f4"; x.fillRect(0, 0, W, H);
  const y0 = H * 0.13, y1 = H * 0.92; // зона стенки
  // волны — тонкие линии, как гравюра
  x.lineWidth = 2.2;
  for (let k = 0; k < 26; k++) {
    x.strokeStyle = `rgba(52,108,150,${0.18 + (k % 5) * 0.08})`; x.beginPath();
    for (let i = 0; i <= 120; i++) { const u = i / 120, px = 1100 + u * 520, a = u * Math.PI * 2.2 + k * 0.23;
      const py = y1 - 40 - k * 9 - Math.sin(a) * (40 + k * 2.2) - Math.pow(u, 2) * 120; i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke();
  }
  x.fillStyle = "#1f4a6c"; x.textAlign = "center";
  x.font = "600 54px Arial, sans-serif"; x.fillText(small ? "ПРОБНИК" : "МОРСКИЕ ВОДОРОСЛИ", 1024, y0 + 95);
  x.font = "34px Arial, sans-serif"; x.fillStyle = "#3b6687"; x.fillText("водорослевое обёртывание · ламинария и фукус", 1024, y0 + 150);
  x.font = "italic 190px Georgia, 'Times New Roman', serif"; x.fillStyle = "#2c6a93"; x.fillText("Arti", 980, y0 + 345);
  x.font = "italic 44px Georgia, serif"; x.fillText("made by sea", 1060, y0 + 400);
  x.font = "600 46px Arial, sans-serif"; x.fillStyle = "#1f4a6c"; x.fillText(small ? "на пробу" : "1 кг", 1024, y1 - 26);
  x.fillStyle = "#c9d6d2"; x.fillRect(0, y0 - 6, W, 3); x.fillRect(0, y1 + 3, W, 3);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function cardTex(lines, title) {
  const W = 512, H = 720, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  x.fillStyle = "#f3f1ea"; x.fillRect(0, 0, W, H); x.fillStyle = "#13290f"; x.fillRect(0, 0, W, 120);
  x.fillStyle = "#e8f3e4"; x.font = "600 30px Arial, sans-serif"; x.fillText(title, 34, 74);
  x.fillStyle = "#1f3a26"; x.font = "26px Arial, sans-serif";
  lines.forEach((l, i) => { x.fillStyle = "#2c6a5a"; x.fillText(String(i + 1).padStart(2, "0"), 34, 200 + i * 110); x.fillStyle = "#1f2a20"; x.fillText(l, 90, 200 + i * 110);
    x.fillStyle = "#d6d2c4"; x.fillRect(34, 236 + i * 110, W - 68, 2); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function boxTex() {
  const W = 256, H = 256, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  x.fillStyle = "#a9875c"; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${90 + rnd() * 40},${60 + rnd() * 30},${30 + rnd() * 20},${rnd() * 0.12})`; x.fillRect(rnd() * W, rnd() * H, 2, 2); }
  x.fillStyle = "rgba(225,215,190,.55)"; x.fillRect(W / 2 - 22, 0, 44, H);
  x.fillStyle = "#13290f"; x.font = "italic 34px Georgia, serif"; x.textAlign = "center"; x.fillText("Arti", W / 2, H / 2 + 52);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createWorld(canvas, { mobile = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", alpha: false });
  let DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.3 : 1.6);
  renderer.setPixelRatio(DPR);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  GT = glowTex();

  const scene = new THREE.Scene();
  scene.background = BG.clone();
  scene.fog = new THREE.FogExp2(BG.getHex(), 0.032);
  scene.environment = makeEnv(renderer);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 600);
  const U = { time: { value: 0 } };
  const FOG = { col: { value: BG.clone() }, d: { value: 0.032 } };
  const parts = [];
  const zone = (g, z0, z1) => { parts.push({ g, z0, z1 }); scene.add(g); return g; };
  const FOGGLSL = `uniform vec3 uFogCol; uniform float uFogD; vec3 fogit(vec3 c, float d){ float f=1.-exp(-uFogD*uFogD*d*d); return mix(c,uFogCol,f); }`;

  // ── ламинария: ленты с волнистым краем, качаются в толще воды ──
  const leafBase = new THREE.PlaneGeometry(1, 1, 2, 56); leafBase.translate(0, 0.5, 0);
  function kelpMat(o = {}) {
    return new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: { uTime: U.time, uFogCol: FOG.col, uFogD: FOG.d, uK: { value: o.k ?? 1 }, uLit: { value: o.lit ?? 0 }, uC0: { value: (o.c0 ?? KELP0).clone() }, uC1: { value: (o.c1 ?? KELP).clone() }, uRim: { value: FOAM.clone() }, uSway: { value: o.sway ?? 1 }, uTwist: { value: o.twist ?? 1 } },
      vertexShader: `attribute vec3 aBase; attribute vec4 aP; uniform float uTime,uSway,uTwist; varying vec2 vUv; varying vec3 vW; varying float vD;
        void main(){ float v=position.y, h=aP.x, w=aP.y, ph=aP.z, yaw=aP.w;
          float width=w*(.28+.72*pow(sin(3.14159*clamp(v*.93+.05,0.,1.)),.65));
          float x=position.x*width*(1.+.16*sin(v*h*5.5+ph*3.+uTime*1.2));
          float tw=(v*1.3+sin(uTime*.3+ph)*.35)*uTwist+yaw; float cs=cos(tw), sn=sin(tw);
          vec3 p=vec3(x*cs, v*h, x*sn);
          p.x+=uSway*(sin(uTime*.55+ph+v*2.)*.85*pow(v,1.4)+sin(uTime*1.05+ph*2.)*.12*v);
          p.z+=uSway*(cos(uTime*.42+ph*1.7+v*1.7)*.55*pow(v,1.5));
          p+=vec3(-sn,0.,cs)*.11*sin(v*h*4.6+uTime*1.5+ph)*abs(position.x)*2.;
          vec4 wp=modelMatrix*vec4(aBase+p,1.); vW=wp.xyz; vUv=vec2(position.x+.5,v); vD=length(cameraPosition-wp.xyz);
          gl_Position=projectionMatrix*viewMatrix*wp; }`,
      fragmentShader: `uniform float uK,uLit; uniform vec3 uC0,uC1,uRim; varying vec2 vUv; varying vec3 vW; varying float vD; ${FOGGLSL}
        void main(){ vec3 col=mix(uC0,uC1,smoothstep(0.,.85,vUv.y));
          float rib=smoothstep(.07,0.,abs(vUv.x-.5)); float edge=smoothstep(.36,.5,abs(vUv.x-.5));
          float stripes=.85+.15*sin(vUv.y*90.+vUv.x*6.);
          col*=stripes; col+=uC1*rib*.25; col+=uRim*edge*.07*(.4+vUv.y);
          float dk=mix(.35+.85*smoothstep(-1.,13.,vW.y),1.,uLit);
          col*=dk*uK; gl_FragColor=vec4(fogit(col,vD),1.); }`,
    });
  }
  function kelpSet(items, mat) {
    const g = new THREE.InstancedBufferGeometry(); g.index = leafBase.index; g.attributes.position = leafBase.attributes.position; g.instanceCount = items.length;
    const b = new Float32Array(items.length * 3), p = new Float32Array(items.length * 4);
    items.forEach((it, i) => { b.set(it.b, i * 3); p.set([it.h, it.w, it.ph, it.yaw], i * 4); });
    g.setAttribute("aBase", new THREE.InstancedBufferAttribute(b, 3)); g.setAttribute("aP", new THREE.InstancedBufferAttribute(p, 4));
    const m = new THREE.Mesh(g, mat); m.frustumCulled = false; return m;
  }
  // лес: густо в начале, дальше — вдоль всего пути по краям
  {
    const it = [];
    const nA = mobile ? 150 : 280, nB = mobile ? 120 : 230;
    for (let i = 0; i < nA; i++) { let x, z; do { x = (rnd() - 0.5) * 34; z = 14 - rnd() * 64; } while (Math.abs(x) < (z > -6 ? 2.4 : 2.9) && rnd() < 0.85);
      it.push({ b: [x, -1, z], h: 5 + rnd() * 9, w: 0.45 + rnd() * 0.55, ph: rnd() * 6.3, yaw: rnd() * 6.3 }); }
    for (let i = 0; i < nB; i++) { const s = rnd() < 0.5 ? -1 : 1; const x = s * (7 + rnd() * 14), z = -50 - rnd() * 225;
      it.push({ b: [x, -1, z], h: 4 + rnd() * 9, w: 0.45 + rnd() * 0.5, ph: rnd() * 6.3, yaw: rnd() * 6.3 }); }
    scene.add(kelpSet(it, kelpMat()));
  }

  // ── дно с каустикой ──
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(140, 360, 1, 1), new THREE.ShaderMaterial({
    uniforms: { uTime: U.time, uFogCol: FOG.col, uFogD: FOG.d, uCol: { value: new THREE.Color("#0d1f17") }, uLight: { value: FOAM.clone().lerp(SEA, 0.4) } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform float uTime; uniform vec3 uCol,uLight; varying vec3 vW; ${FOGGLSL}
      float ca(vec2 p){ vec2 q=p; float v=0.; for(int i=0;i<3;i++){ q+=vec2(sin(q.y*1.3+uTime*.6+float(i)),cos(q.x*1.1-uTime*.5+float(i)*1.7))*.6; v+=pow(abs(sin(q.x)*sin(q.y)),.18); } return v/3.; }
      void main(){ vec2 p=vW.xz*.55; float c=pow(1.-ca(p),5.)*2.2; float n=fract(sin(dot(floor(vW.xz*8.),vec2(12.9,78.2)))*43758.5);
        vec3 col=uCol*(.85+.3*n)+uLight*c*.55; float d=length(cameraPosition-vW); gl_FragColor=vec4(fogit(col,d),1.); }`,
  }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, -1, -140); scene.add(floor);

  // ── поверхность: снизу — живое светлое окно, сверху — тёмная вода с дорожкой солнца ──
  const surfM = new THREE.ShaderMaterial({
    side: THREE.DoubleSide, transparent: false,
    uniforms: { uTime: U.time, uFogCol: FOG.col, uFogD: FOG.d, uFoam: { value: FOAM.clone() }, uSea: { value: SEA.clone() }, uSun: { value: SUN.clone() }, uSunPos: { value: new THREE.Vector3(0, 21, -420) } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform float uTime; uniform vec3 uFoam,uSea,uSun,uSunPos; varying vec3 vW; ${FOGGLSL}
      float wv(vec2 p){ return sin(p.x*.9+uTime*.7)*.5+sin(p.y*1.3-uTime*.6+p.x*.4)*.35+sin((p.x+p.y)*2.1+uTime*1.3)*.15; }
      void main(){ vec3 V=cameraPosition-vW; float d=length(V); V/=d; vec2 p=vW.xz*.6;
        float e=.05; vec3 N=normalize(vec3(-(wv(p+vec2(e,0.))-wv(p))/e*.22,1.,-(wv(p+vec2(0.,e))-wv(p))/e*.22));
        vec3 col;
        if(cameraPosition.y<${SURF.toFixed(1)}){
          float r=pow(abs(sin(p.x*1.7+wv(p*1.3)*2.)*sin(p.y*1.5-wv(p)*2.)),.25);
          float win=pow(max(-V.y,0.),1.5);
          col=uSea*.3+uFoam*(1.-r)*.62*(.35+win)+uFoam*win*.28;
          col*=smoothstep(140.,10.,d);
        } else {
          vec3 L=normalize(uSunPos-vW); vec3 R=reflect(-V,N);
          float sp=pow(max(dot(R,L),0.),160.)*5.+pow(max(dot(R,L),0.),30.)*.12;
          float fr=pow(1.-max(dot(N,V),0.),4.);
          col=vec3(.01,.05,.05)+uSea*.06+mix(vec3(.05,.12,.13),uSun*.5,.2)*fr+uSun*sp;
        }
        gl_FragColor=vec4(fogit(col,d*.6),1.); }`,
  });
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(500, 700, 1, 1), surfM); surf.rotation.x = -Math.PI / 2; surf.position.set(0, SURF, -170); scene.add(surf);

  // ── планктон по всему маршруту ──
  {
    const N = mobile ? 2600 : 5600, pos = new Float32Array(N * 3), sd = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos[i * 3] = (rnd() - 0.5) * 46; pos[i * 3 + 1] = -1 + rnd() * 15; pos[i * 3 + 2] = 22 - rnd() * 310; sd[i] = rnd(); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: U.time, uPix: { value: DPR }, uCol: { value: FOAM.clone() } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aSeed; uniform float uTime,uPix; varying float vA;
        void main(){ vec3 p=position; p.y+=sin(uTime*.2+aSeed*6.28)*.4; p.x+=cos(uTime*.15+aSeed*11.)*.4; p.z+=sin(uTime*.1+aSeed*3.)*.3;
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; float d=-mv.z;
          gl_PointSize=uPix*(.6+aSeed*1.7)*(16./max(d,.5));
          vA=(.25+.75*(.5+.5*sin(uTime*(.5+aSeed)+aSeed*40.)))*smoothstep(40.,5.,d)*smoothstep(.4,2.5,d)*step(p.y,${SURF.toFixed(1)}); }`,
      fragmentShader: `uniform vec3 uCol; varying float vA; void main(){ float r=length(gl_PointCoord-.5); float a=smoothstep(.5,.0,r); gl_FragColor=vec4(uCol*a*a*vA*1.1,1.); }`,
    });
    const p = new THREE.Points(g, m); p.frustumCulled = false; scene.add(p);
  }
  // ── пузырьки: поднимаются к поверхности ──
  function bubbles(n, x0, x1, z0, z1, k) {
    const pos = new Float32Array(n * 3), sd = new Float32Array(n);
    for (let i = 0; i < n; i++) { pos.set([x0 + rnd() * (x1 - x0), rnd(), z0 + rnd() * (z1 - z0)], i * 3); sd[i] = rnd(); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("aSeed", new THREE.BufferAttribute(sd, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: U.time, uPix: { value: DPR }, uK: { value: k }, uCol: { value: FOAM.clone() } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aSeed; uniform float uTime,uPix; varying float vA;
        void main(){ vec3 p=position; float span=${(SURF + 1).toFixed(1)}; p.y=-1.+mod(p.y*span+uTime*(.5+aSeed*1.2),span); p.x+=sin(uTime*2.+aSeed*30.+p.y)*.08;
          vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; float d=-mv.z;
          gl_PointSize=uPix*(1.4+aSeed*3.2)*(14./max(d,.5)); vA=smoothstep(36.,4.,d)*smoothstep(.5,2.,d)*smoothstep(${SURF.toFixed(1)},${(SURF - 1.5).toFixed(1)},p.y); }`,
      fragmentShader: `uniform vec3 uCol; uniform float uK; varying float vA; void main(){ float r=length(gl_PointCoord-.5); float ring=smoothstep(.5,.38,r)*smoothstep(.22,.42,r); float hi=smoothstep(.16,0.,length(gl_PointCoord-vec2(.38,.34)));
        gl_FragColor=vec4(uCol*(ring*.55+hi*.9)*vA*uK,1.); }`,
    });
    const p = new THREE.Points(g, m); p.frustumCulled = false; return p;
  }
  scene.add(bubbles(mobile ? 500 : 1100, -20, 20, 16, -290, 0.8));

  // ── лучи света сверху ──
  function ray(x, z, rTop, rBot, k) {
    const h = SURF + 1.5, g = new THREE.CylinderGeometry(rTop, rBot, h, 48, 1, true);
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: U.time, uK: { value: k }, uCol: { value: FOAM.clone().lerp(SEA, 0.25) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vN,vV; varying vec2 vUv; varying float vD;
        void main(){ vec4 wp=modelMatrix*vec4(position,1.); vN=normalize(mat3(modelMatrix)*normal); vV=normalize(cameraPosition-wp.xyz); vUv=uv; vD=length(cameraPosition-wp.xyz); gl_Position=projectionMatrix*viewMatrix*wp; }`,
      fragmentShader: `uniform float uTime,uK; uniform vec3 uCol; varying vec3 vN,vV; varying vec2 vUv; varying float vD;
        void main(){ float f=pow(abs(dot(normalize(vN),normalize(vV))),2.); float h=vUv.y;
          float fade=smoothstep(0.,.6,h)*smoothstep(1.,.9,h);
          float st=.55+.45*sin(vUv.x*60.+uTime*.3)*sin(vUv.x*23.-uTime*.21);
          gl_FragColor=vec4(uCol*f*fade*st*uK*smoothstep(1.,7.,vD)*smoothstep(70.,18.,vD),1.); }`,
    });
    const me = new THREE.Mesh(g, m); me.position.set(x, SURF - h / 2 + 0.5, z); return me;
  }

  // ════ 0 · ЛЕС ЛАМИНАРИИ ════
  const g0 = new THREE.Group();
  g0.add(ray(-3, -4, 0.3, 2.6, 0.75), ray(2.4, -8, 0.25, 2.2, 0.6), ray(0.4, -1.5, 0.35, 3.2, 0.5), ray(5.5, -12, 0.25, 2.4, 0.45), ray(-6.5, -14, 0.25, 2.6, 0.4));
  const sun0 = glow(FOAM, 0.45, 20); sun0.position.set(0, SURF - 3, -16); g0.add(sun0);
  const far0 = glow(SEA, 0.9, 22); far0.position.set(0, 4, -34); g0.add(far0);
  zone(g0, -40, 18);

  // ════ 1 · ЛИСТ СРЕЗАН РУКАМИ ════
  const g1 = new THREE.Group(); const L1 = new THREE.Vector3(1.4, -1, -38.5);
  const heroMat = kelpMat({ k: 1.9, lit: 0.6, c1: new THREE.Color("#e2c55c"), c0: new THREE.Color("#5a5a1c"), sway: 0.7 });
  const hero = kelpSet([{ b: [0, 0, 0], h: 12, w: 1.7, ph: 1.2, yaw: 0.9 }], heroMat); hero.position.copy(L1); g1.add(hero);
  const cut = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.025, 8, 96), new THREE.MeshBasicMaterial({ color: FOAM.clone().multiplyScalar(3), transparent: true, opacity: 0 })); cut.rotation.x = Math.PI / 2; cut.position.set(L1.x, 0.6, L1.z); g1.add(cut);
  const cutGlow = glow(FOAM, 0, 2.4); cutGlow.position.set(L1.x, 0.6, L1.z); g1.add(cutGlow);
  const heroLight = glow(GOLD, 0.22, 8); heroLight.position.set(L1.x, 6, L1.z - 2.5); g1.add(heroLight);
  g1.add(ray(-4, -45, 0.25, 2, 0.45), ray(4.5, -47, 0.3, 2.2, 0.4));
  zone(g1, -52, -28);

  // ════ 2 · ЦЕЛЬНЫЕ ЛИСТЫ В ЦЕХУ ════
  const g2 = new THREE.Group();
  {
    const it = []; const cols = mobile ? 11 : 13;
    for (let r = 0; r < 2; r++) for (let i = 0; i < cols; i++) it.push({ b: [(i - (cols - 1) / 2) * 0.95, r * 7.2 + rnd() * 0.4, 0], h: 6.4 + rnd() * 0.4, w: 0.72, ph: rnd() * 6.3, yaw: 0 });
    const racks = kelpSet(it, kelpMat({ lit: 1, k: 0.95, c1: new THREE.Color("#b49b44"), c0: new THREE.Color("#3a4a18"), sway: 0.22, twist: 0.08 }));
    const rg = new THREE.Group(); rg.add(racks); rg.rotation.x = -Math.PI / 2; rg.position.set(0, 0.35, -57); g2.add(rg); g2.userData.rg = rg;
    const table = new THREE.Mesh(new THREE.PlaneGeometry(14.5, 16), new THREE.MeshPhysicalMaterial({ color: 0x07110e, roughness: 0.18, metalness: 0.5, clearcoat: 1, envMapIntensity: 0.8 }));
    table.rotation.x = -Math.PI / 2; table.position.set(0, 0.12, -64.5); g2.add(table);
    const barM = new THREE.MeshBasicMaterial({ color: new THREE.Color("#dff7f2").multiplyScalar(2.2) });
    const bars = new THREE.Group(); g2.add(bars); g2.userData.bars = bars; for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(13, 0.05, 0.12), barM); b.position.set(0, 6.8, -58 - k * 3.4); bars.add(b); }
    const tg = glow(FOAM, 0.35, 18); tg.position.set(0, 7.5, -66); g2.add(tg);
    const pl = new THREE.PointLight(0xdff7f2, 40, 20, 2); pl.position.set(0, 5.5, -64); g2.add(pl);
  }
  zone(g2, -80, -48);

  // ════ 3 · ЛИСТ → ГЕЛЬ ════
  const OC = new THREE.Vector3(0, 3, -104);
  const g3 = new THREE.Group();
  const gelMat = new THREE.MeshPhysicalMaterial({ color: 0x8fd29a, metalness: 0, roughness: 0.1, transmission: 1, thickness: 2.4, ior: 1.34, attenuationColor: new THREE.Color("#2f7a38"), attenuationDistance: 1.3, clearcoat: 1, clearcoatRoughness: 0.05, iridescence: 0.25, iridescenceIOR: 1.3, envMapIntensity: 1.8, specularColor: new THREE.Color(0xe6fff2) });
  gelMat.onBeforeCompile = (s) => { s.uniforms.uTime = U.time;
    s.vertexShader = "uniform float uTime;\n" + s.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
      float n=sin(position.x*2.1+uTime*.9)*sin(position.y*2.4+uTime*1.1)*sin(position.z*1.8+uTime*.7)+.5*sin(position.y*4.+uTime*1.7);
      transformed+=normal*n*.16;`); };
  const orb = new THREE.Group(); orb.position.copy(OC);
  orb.add(new THREE.Mesh(new THREE.SphereGeometry(2, mobile ? 72 : 128, mobile ? 48 : 96), gelMat));
  const orbCore = new THREE.Mesh(new THREE.SphereGeometry(1.05, 32, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color("#8ff0b8").multiplyScalar(2.2) })); orb.add(orbCore);
  g3.add(orb);
  const orbBack = glow(SEA, 0.9, 14); orbBack.position.set(OC.x, OC.y, OC.z - 5); g3.add(orbBack);
  const flN = mobile ? 36 : 54;
  const flakes = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.42, 1.5, 1, 6), new THREE.MeshStandardMaterial({ color: 0xa8923e, roughness: 0.5, side: THREE.DoubleSide, emissive: new THREE.Color("#3a3510"), envMapIntensity: 0.6 }), flN);
  flakes.frustumCulled = false; g3.add(flakes);
  const FL = Array.from({ length: flN }, () => ({ a: rnd() * 6.3, r: 4.5 + rnd() * 4, y: (rnd() - 0.5) * 6, d: rnd() * 0.6, sp: 0.3 + rnd() * 0.5, rx: rnd() * 6, ry: rnd() * 6 }));
  const gpl = new THREE.PointLight(0xc8ffe0, 30, 14, 2); gpl.position.set(-2, 6, -99); g3.add(gpl);
  g3.add(ray(0, -104, 0.4, 3, 0.7));
  zone(g3, -116, -84);

  // ════ 4 · БАНКА 1 КГ ════
  const JC = new THREE.Vector3(0, 0, -128);
  function makeJar(small) {
    const pts = [new THREE.Vector2(0.001, 0), new THREE.Vector2(0.95, 0)];
    for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push(new THREE.Vector2(1.0 + 0.1 * t, 0.05 + 1.95 * t)); }
    pts.push(new THREE.Vector2(1.15, 2.02), new THREE.Vector2(1.15, 2.1), new THREE.Vector2(1.08, 2.12));
    const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), new THREE.MeshPhysicalMaterial({ map: labelTex(small), roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.25, envMapIntensity: 0.9, side: THREE.DoubleSide }));
    const j = new THREE.Group(); j.add(body);
    const gel = new THREE.Mesh(new THREE.CircleGeometry(1.06, 64), new THREE.MeshPhysicalMaterial({ color: 0x1f4a22, roughness: 0.08, clearcoat: 1, envMapIntensity: 1.6 })); gel.rotation.x = -Math.PI / 2; gel.position.y = 1.86; j.add(gel);
    const lid = new THREE.Group();
    const lm = new THREE.MeshPhysicalMaterial({ color: 0xf1f4f3, roughness: 0.35, clearcoat: 0.6, envMapIntensity: 0.9 });
    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(1.19, 1.19, 0.3, 96), lm); l1.position.y = 0.15; lid.add(l1);
    const l2 = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.04, 10, 96), lm); l2.rotation.x = Math.PI / 2; l2.position.y = 0.31; lid.add(l2);
    lid.position.y = 2.1; j.add(lid); j.userData.lid = lid;
    j.rotation.y = Math.PI; return j;
  }
  function pedestal(at) {
    const g = new THREE.Group(); g.position.copy(at);
    const p = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.4, 0.5, 96), new THREE.MeshPhysicalMaterial({ color: 0x06100d, metalness: 0.6, roughness: 0.16, clearcoat: 1, envMapIntensity: 1 })); p.position.y = -0.25; g.add(p);
    const r = new THREE.Mesh(new THREE.TorusGeometry(2.33, 0.018, 8, 160), new THREE.MeshBasicMaterial({ color: FOAM.clone().multiplyScalar(1.3) })); r.rotation.x = Math.PI / 2; r.position.y = 0.01; g.add(r);
    return g;
  }
  const g4 = new THREE.Group();
  g4.add(pedestal(JC));
  const jar = makeJar(false); jar.position.copy(JC); jar.scale.setScalar(1.05); g4.add(jar);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 1, 24, 1, true), gelMat); stream.visible = false; g4.add(stream);
  { const k1 = new THREE.PointLight(0xe8fbff, 46, 14, 2); k1.position.set(-3, 4.5, -123); g4.add(k1);
    const k2 = new THREE.PointLight(0x7fe0c0, 34, 12, 2); k2.position.set(3, 3, -131); g4.add(k2);
    const k3 = new THREE.PointLight(0xfff0d8, 14, 10, 2); k3.position.set(2, 1, -122); g4.add(k3); }
  const jBack = glow(SEA, 0.8, 13); jBack.position.set(0, 2, -134); g4.add(jBack);
  g4.add(ray(0, -128, 0.5, 2.6, 0.55));
  zone(g4, -140, -110);

  // ════ 5 · СОСТАВ: элементы на орбитах ════
  const EC = new THREE.Vector3(0, 2.8, -156);
  const g5 = new THREE.Group(); g5.position.copy(EC);
  const EL = [["I", 58.44, GOLD], ["K", 2273.9, FOAM], ["Na", 3786, FOAM], ["Ca", 752.3, FOAM], ["Mg", 263.9, SEA], ["P", 335.8, FOAM], ["Si", 104, SEA], ["Zn", 20.92, FOAM], ["Fe", 6.637, GOLD], ["Se", 0.4325, FOAM]];
  const orbs = [];
  EL.forEach(([n, v, col], i) => {
    const R = 1.35 + i * 0.3, tilt = new THREE.Group(); tilt.rotation.set(1.15 + (rnd() - 0.5) * 0.7, (rnd() - 0.5) * 0.8, (rnd() - 0.5) * 0.6); g5.add(tilt);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.006, 6, 220), new THREE.MeshBasicMaterial({ color: FOAM.clone().multiplyScalar(0.5), transparent: true, opacity: 0.5 })); tilt.add(ring);
    const r = 0.06 + 0.05 * (Math.log10(v) + 0.6);
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(n === "I" ? 2.4 : 1.4) })); tilt.add(s);
    orbs.push({ s, R, sp: 0.18 + rnd() * 0.25, a: rnd() * 6.3 });
  });
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.95, 96, 64), gelMat); g5.add(drop);
  const dropCore = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color("#6fe0a0").multiplyScalar(1.4) })); g5.add(dropCore);
  const eBack = glow(SEA, 0.8, 14); eBack.position.z = -5; g5.add(eBack);
  zone(g5, -166, -140);

  // ════ 6 · ОТЗЫВЫ: пять звёзд ════
  const g6 = new THREE.Group(); const SC = new THREE.Vector3(0, 5.7, -186);
  const stars = [];
  {
    const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.24 : 0.56; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? sh.lineTo(x, y) : sh.moveTo(x, y); } sh.closePath();
    const sg = new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2 }); sg.center();
    for (let k = 0; k < 5; k++) { const m = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: GOLD.clone().multiplyScalar(k === 4 ? 0.9 : 1.35) }));
      const x = (k - 2) * 1.2; m.position.set(SC.x + x, SC.y - Math.abs(k - 2) * 0.22, SC.z); g6.add(m);
      const gs = glow(GOLD, 0.3, 1.8); gs.position.copy(m.position); gs.position.z -= 0.3; g6.add(gs); stars.push({ m, gs, k }); }
  }
  g6.add(bubbles(mobile ? 220 : 420, -7, 7, -180, -196, 1.2));
  g6.add(ray(-3, -188, 0.3, 2.2, 0.5), ray(3, -190, 0.3, 2.2, 0.5));
  zone(g6, -198, -170);

  // ════ 7 · НАБОР МАСТЕРА ════
  const KC = new THREE.Vector3(mobile ? 0.4 : -1.5, 0, -214);
  const g7 = new THREE.Group(); g7.add(pedestal(KC));
  const kBig = makeJar(false); kBig.scale.setScalar(0.78); kBig.position.set(KC.x - 0.1, 0, KC.z - 0.2); g7.add(kBig);
  const kSmall = makeJar(true); kSmall.scale.setScalar(0.4); kSmall.position.set(KC.x + 1.35, 0, KC.z + 0.7); g7.add(kSmall);
  const card = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.4, 0.02), [0, 0, 0, 0, 0, 0].map((_, i) => i === 4 ? new THREE.MeshStandardMaterial({ map: cardTex(["Подготовка кожи", "Нанесение геля", "Плёнка и тепло", "Время и смывка"], "Процедура"), roughness: 0.6 }) : new THREE.MeshStandardMaterial({ color: 0xe8e5dc, roughness: 0.6 })));
  card.position.set(KC.x - 1.55, 0.72, KC.z - 0.9); card.rotation.set(-0.08, 0.5, -0.02); g7.add(card);
  { const k1 = new THREE.PointLight(0xe8fbff, 38, 12, 2); k1.position.set(-2.5, 4, -209); g7.add(k1);
    const k2 = new THREE.PointLight(0x7fe0c0, 26, 10, 2); k2.position.set(2.8, 2.5, -217); g7.add(k2);
    const k3 = new THREE.PointLight(0xfff0d8, 12, 8, 2); k3.position.set(1.5, 1.2, -209); g7.add(k3); }
  const kBack = glow(SEA, 0.75, 12); kBack.position.set(0, 1.8, -220); g7.add(kBack);
  zone(g7, -226, -196);

  // ════ 8 · ОПТ: коробки встают в паллету ════
  const BC = new THREE.Vector3(0, 0, -242);
  const g8 = new THREE.Group();
  const bxN = 36, bxM = new THREE.MeshStandardMaterial({ map: boxTex(), roughness: 0.85, metalness: 0 });
  const boxes = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.8, 0.8), bxM, bxN); boxes.frustumCulled = false; g8.add(boxes);
  const BX = []; for (let y = 0, k = 0; y < 3; y++) for (let z = 0; z < 3; z++) for (let x = 0; x < 4; x++, k++) BX.push({ to: new THREE.Vector3(BC.x + (x - 1.5) * 1.03, 0.4 + y * 0.82, BC.z + (z - 1) * 0.83), o: (y * 12 + z * 4 + x) / bxN, ry: (rnd() - 0.5) * 0.6 });
  const pallet = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.16, 2.9), new THREE.MeshStandardMaterial({ color: 0x5a4630, roughness: 0.9 })); pallet.position.set(BC.x, -0.06, BC.z); g8.add(pallet);
  { const k1 = new THREE.PointLight(0xfff1dc, 40, 16, 2); k1.position.set(3, 6, -237); g8.add(k1);
    const k2 = new THREE.PointLight(0x7fe0c0, 30, 14, 2); k2.position.set(-3.5, 3, -244); g8.add(k2); }
  g8.add(ray(0, -242, 0.5, 3.4, 0.6));
  zone(g8, -254, -222);

  // ════ 9 · ВОПРОСЫ: коробка поднимается к свету ════
  const g9 = new THREE.Group(); const RC = new THREE.Vector3(0, 0, -266);
  const riser = new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 0.8), bxM); riser.position.copy(RC); g9.add(riser);
  const column = ray(0, -266, 1.0, 2.2, 0.42); g9.add(column);
  const rGlow = glow(FOAM, 0.6, 4); g9.add(rGlow);
  const rpl = new THREE.PointLight(0xe8fbff, 30, 10, 2); g9.add(rpl);
  zone(g9, -280, -246);

  // ════ 10 · ПОВЕРХНОСТЬ ════
  const g10 = new THREE.Group();
  const sun = glow(SUN, 1.0, 26); sun.position.set(0, 21, -420); g10.add(sun);
  const hz = glow(SUN.clone().lerp(SEA, 0.5), 0.6, 160); hz.position.set(0, SURF + 1, -430); hz.scale.set(260, 26, 1); g10.add(hz);
  const window0 = glow(FOAM, 0.0, 26); window0.position.set(0, SURF - 0.5, -282); g10.add(window0);
  zone(g10, -460, -262);

  // ── пост-обработка ──
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.8, 0.6, 0.8); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const fin = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uFlash: { value: 0 }, uGrain: { value: 0.03 }, uTint: { value: 1 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime,uFlash,uGrain,uTint; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
      void main(){ vec2 d=vUv-.5; float r=dot(d,d); vec2 w=vUv+vec2(sin(vUv.y*18.+uTime*.9),cos(vUv.x*14.+uTime*.7))*.0009*uTint; vec3 c;
        c.r=texture2D(tDiffuse,w-d*r*.012).r; c.g=texture2D(tDiffuse,w).g; c.b=texture2D(tDiffuse,w+d*r*.012).b;
        c*=1.-r*.9; c+=(h(vUv*937.+fract(uTime*.37))-.5)*uGrain; c=mix(c,vec3(.85,.97,.95),uFlash); gl_FragColor=vec4(c,1.); }`,
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
  const P = new THREE.Vector3(), L = new THREE.Vector3(), dm = new THREE.Object3D(), v3 = new THREE.Vector3(), tmpC = new THREE.Color();
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  function update(cTarget, dt, t, sideTarget) {
    U.time.value = t; fin.uniforms.uTime.value = t;
    const prev = cs; const k = 1 - Math.exp(-dt * 2.6); let step = (cTarget - cs) * k; step = cl(step, -dt * 1.4, dt * 1.4); cs += step;
    vel += ((cs - prev) / Math.max(dt, 1e-3) - vel) * 0.1;
    side += (sideTarget - side) * (1 - Math.exp(-dt * 2.2));
    mouse.sx += (mouse.x - mouse.sx) * 0.04; mouse.sy += (mouse.y - mouse.sy) * 0.04;
    const c = cs;

    camAt(c, P, L);
    P.x += Math.sin(t * 0.29) * 0.16 + mouse.sx * 0.35; P.y += Math.sin(t * 0.21) * 0.12 - mouse.sy * 0.22;
    camera.position.copy(P); camera.lookAt(L); camera.rotateZ(cl(-vel * 0.03, -0.05, 0.05) + Math.sin(t * 0.17) * 0.008);
    const off = -side * 0.2 * W, offY = W < Hh ? 0.2 * Hh : 0; camera.setViewOffset(W, Hh, off, offY, W, Hh);

    // вода ↔ воздух
    const above = ss(SURF - 0.3, SURF + 0.6, P.y);
    tmpC.copy(BG).lerp(SKY, above); scene.background.copy(tmpC); scene.fog.color.copy(tmpC); FOG.col.value.copy(tmpC);
    const fd = THREE.MathUtils.lerp(0.032, 0.0045, above); scene.fog.density = fd; FOG.d.value = fd;
    fin.uniforms.uTint.value = 1 - above;
    fin.uniforms.uFlash.value = 0.55 * bump(SURF - 1.2, SURF - 0.1, SURF + 0.1, SURF + 1.4, P.y);

    const cz = P.z; for (const z of parts) z.g.visible = z.z1 > cz - 50 && z.z0 < cz + 14;

    // 0 · лес
    if (g0.visible) { setGlow(sun0, 0.55 + 0.12 * Math.sin(t * 0.6)); setGlow(far0, 0.8 + 0.25 * Math.sin(t * 0.8)); }

    // 1 · лист: свет, линия среза, лист уходит вверх
    if (g1.visible) {
      const cutK = bump(1.15, 1.45, 1.75, 2.0, c), lift = ss(1.62, 2.25, c);
      cut.material.opacity = cutK; cut.scale.setScalar(1 + 0.15 * Math.sin(t * 3)); setGlow(cutGlow, 1.4 * cutK);
      hero.position.y = L1.y + lift * 11; hero.position.x = L1.x + Math.sin(t * 0.4) * 0.1;
      setGlow(heroLight, 0.4 + 0.15 * Math.sin(t * 0.9));
    }

    // 2 · цех: листы плывут на столе
    if (g2.visible) { g2.userData.rg.position.z = -57 + Math.sin(t * 0.25) * 0.25; g2.userData.bars.visible = c > 1.85; }

    // 3 · лист → гель
    if (g3.visible) {
      const m = ss(2.4, 4.0, c);
      for (let i = 0; i < flN; i++) { const f = FL[i]; const s = ss(0, 1, (m * 1.5 - f.d) / 0.9);
        const a = f.a + t * f.sp + s * 3; const r = THREE.MathUtils.lerp(f.r, 1.2, s);
        dm.position.set(OC.x + Math.cos(a) * r, OC.y + f.y * (1 - s) + Math.sin(t * 0.7 + f.a) * 0.3, OC.z + Math.sin(a) * r);
        dm.rotation.set(f.rx + t * 0.4, f.ry + a, t * 0.3); dm.scale.setScalar(Math.max(0.001, 1 - s * 0.95)); dm.updateMatrix(); flakes.setMatrixAt(i, dm.matrix); }
      flakes.instanceMatrix.needsUpdate = true;
      const born = ss(2.9, 3.5, c), drop = ss(3.68, 4.1, c);
      orb.scale.setScalar(Math.max(0.001, (0.15 + 0.85 * born) * (1 - drop * 0.82) * (1 - ss(4.1, 4.2, c))) * (1 + 0.02 * Math.sin(t * 1.3)));
      orb.position.set(OC.x, THREE.MathUtils.lerp(OC.y, JC.y + 3.4, drop), THREE.MathUtils.lerp(OC.z, JC.z, drop * drop * (3 - 2 * drop)));
      orb.rotation.y = t * 0.15; orbCore.scale.setScalar(0.8 + 0.1 * Math.sin(t * 1.6));
      setGlow(orbBack, 0.7 * born * (1 - drop));
    }

    // 4 · банка: крышка открывается, гель стекает, крышка закрывается
    if (g4.visible || g3.visible) {
      g4.visible = g4.visible || c > 3.6;
      const open = bump(3.5, 3.85, 4.15, 4.36, c), pour = bump(3.88, 3.98, 4.1, 4.2, c);
      const lid = jar.userData.lid; lid.position.y = 2.1 + open * 1.9; lid.position.x = open * 1.4; lid.rotation.z = -open * 0.5;
      jar.rotation.y = Math.PI + Math.sin(t * 0.3) * 0.35 + ss(4.5, 5.2, c) * 0.6;
      stream.visible = pour > 0.02; if (stream.visible) { const top = orb.position.y - 0.4, bot = JC.y + 2.0; stream.scale.set(pour, Math.max(0.01, top - bot), pour); stream.position.set(JC.x, (top + bot) / 2, JC.z); }
      setGlow(jBack, 0.7 + 0.15 * Math.sin(t * 0.7));
    }

    // 5 · элементы
    if (g5.visible) { const a = ss(4.55, 5.4, c); g5.scale.setScalar(0.4 + 0.6 * a);
      orbs.forEach((o, i) => { const an = o.a + t * o.sp * (i % 2 ? -1 : 1); o.s.position.set(Math.cos(an) * o.R, Math.sin(an) * o.R, 0); });
      g5.rotation.y = t * 0.05; drop.rotation.y = t * 0.2; setGlow(eBack, 0.7 * a); }

    // 6 · звёзды
    if (g6.visible) { const a = ss(5.6, 6.4, c);
      stars.forEach((s) => { const ak = ss(0, 1, a * 1.6 - s.k * 0.15); s.m.scale.setScalar(Math.max(0.001, ak * 0.8)); s.m.rotation.y = Math.sin(t * 0.6 + s.k) * 0.5; s.m.position.y = SC.y - Math.abs(s.k - 2) * 0.22 + Math.sin(t * 0.8 + s.k) * 0.08; setGlow(s.gs, 0.28 * ak); }); }

    // 7 · набор
    if (g7.visible) { kBig.rotation.y = Math.PI + 0.3 + Math.sin(t * 0.25) * 0.25; kSmall.rotation.y = Math.PI - 0.4 + Math.sin(t * 0.3 + 1) * 0.3; card.position.y = 0.72 + Math.sin(t * 0.7) * 0.04; }

    // 8 · коробки
    if (g8.visible) { const m = ss(7.55, 8.45, c);
      BX.forEach((b, i) => { const s = ss(0, 1, (m * 1.6 - b.o) / 0.6); dm.position.copy(b.to); dm.position.y += (1 - s) * 7; dm.rotation.set((1 - s) * 0.8, b.ry * (1 - s * 0.9), (1 - s) * 0.5); dm.scale.setScalar(Math.max(0.001, s > 0 ? 1 : 0)); dm.updateMatrix(); boxes.setMatrixAt(i, dm.matrix); });
      boxes.instanceMatrix.needsUpdate = true; }

    // 9 · коробка поднимается
    if (g9.visible) { const r = ss(8.9, 10.2, c); riser.position.set(RC.x, 0.4 + r * 12.6 + Math.sin(t * 0.8) * 0.06, RC.z); riser.rotation.set(Math.sin(t * 0.4) * 0.1, t * 0.3, Math.sin(t * 0.5) * 0.08);
      rGlow.position.copy(riser.position); setGlow(rGlow, 0.3 + 0.1 * Math.sin(t * 1.2)); rpl.position.copy(riser.position).add(v3.set(0, 1.5, 1.5)); }

    // 10 · поверхность
    if (g10.visible) { setGlow(window0, 0.6 * bump(9.4, 9.9, 10.1, 10.3, c)); setGlow(sun, (0.8 + 0.06 * Math.sin(t * 0.5)) * above); setGlow(hz, 0.16 * above); }

    for (const g of GLOWS) { if (!g.parent || !g.parent.visible) continue; g.getWorldPosition(v3); const sc = Math.max(g.scale.x, g.scale.y) * (g.parent.scale.x || 1), dd = v3.distanceTo(camera.position);
      const kk = g.userData.cur * ss(sc * 0.35, sc * 1.05 + 1, dd); g.material.color.copy(g.userData.col).multiplyScalar(kk); g.visible = kk > 0.002; }
    composer.render(dt);
  }

  async function warm(prog) {
    for (let c = 0; c <= NC; c += 1) { cs = c; for (const z of parts) z.g.visible = true; renderer.compile(scene, camera); camAt(c, P, L); camera.position.copy(P); camera.lookAt(L); composer.render(0.016); prog && prog(c / NC); await new Promise((r) => setTimeout(r, 0)); }
    cs = 0;
  }

  return { update, resize, mouse, warm, snap(c) { cs = c; }, get c() { return cs; }, setDPR(d) { DPR = d; renderer.setPixelRatio(d); resize(); }, lowPower() { bloom.strength = 0.65; }, renderer };
}
