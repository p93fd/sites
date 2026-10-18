(() => {
'use strict';
// Живой фон в покое: кадр сцены рисуется шейдером — течёт дымка, дышит свет, бегут блики, переливаются лучи.
// Движение нарастает плавно после остановки ролика и гаснет перед следующим пролётом — без шва.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const still = document.getElementById('still'), zoom = document.getElementById('zoom');
const cv = document.createElement('canvas'); cv.id = 'live';
cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0';
still.after(cv);
const gl = !reduce && cv.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
if (!gl) return;

// параметры сцен: flow — течение, drift — направление течения, glow — дыхание света,
// sweep — бегущий блик, ray — переливы лучей из точки src, tun — свет летит в глубину к точке src
const P = [
  { flow: 1.1, drift: [.6, .05], glow: .9, sweep: 0,  ray: 0,  tun: 0,  src: [.5, .55] },  // 1 небо
  { flow: 1.0, drift: [0, 0],    glow: 1,  sweep: .3, ray: 0,  tun: 0,  src: [.5, .48], swirl: 1 }, // 2 портал
  { flow: .2,  drift: [0, 0],    glow: .8, sweep: 1,  ray: 0,  tun: 0,  src: [.5, .5] },   // 3 соты
  { flow: .25, drift: [0, 0],    glow: .7, sweep: 0,  ray: 0,  tun: 1,  src: [.6, .42] },  // 4 тоннель
  { flow: .45, drift: [0, .1],   glow: .8, sweep: 0,  ray: 1,  tun: 0,  src: [.52, -.15] },// 5 лучи
  { flow: .4,  drift: [0, 0],    glow: 1,  sweep: 0,  ray: 1,  tun: 0,  src: [.75, .62] }, // 6 крест лучей
  { flow: .9,  drift: [.35, 0],  glow: 1,  sweep: .5, ray: 0,  tun: 0,  src: [.5, .7] },   // 7 лотос
  { flow: .35, drift: [0, -.2],  glow: .7, sweep: 0,  ray: 0,  tun: 0,  src: [.5, .6] },   // 8 россыпь
  { flow: .5,  drift: [.15, 0],  glow: 1,  sweep: .6, ray: .4, tun: 0,  src: [.5, .62] },  // 9 горизонт
];

const VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
const FS = `precision highp float;varying vec2 v;uniform sampler2D T;uniform vec2 R,I,S,D;uniform float t,A,F,G,W,Y,U,X;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+17.;a*=.5;}return s;}
void main(){
  // кадр 16:9 вписан как object-fit:cover
  vec2 s=R/I, sc=vec2(max(s.x,s.y)), q=(v-.5)*R/(I*sc)+.5; q.y=1.-q.y;
  vec2 o=q;
  // течение: дымка и облака медленно плывут, у краёв кадра движение гаснет
  vec2 w=vec2(fb(q*3.+D*t*.05+t*.03),fb(q*3.+5.-D.yx*t*.05-t*.03))-.5;
  if(X>.5){vec2 c=q-S;float a=.08*sin(t*.15);w+=vec2(-c.y,c.x)*a*3.;}
  float edge=smoothstep(0.,.06,q.x)*smoothstep(0.,.06,q.y)*smoothstep(0.,.06,1.-q.x)*smoothstep(0.,.06,1.-q.y);
  q+=w*.006*F*A*edge;
  vec3 c=texture2D(T,q).rgb;
  float L=dot(c,vec3(.299,.587,.114)), hi=smoothstep(.38,.95,L);
  // свет дышит
  float br=.16*sin(t*.7)+.12*(fb(o*4.+t*.12)-.5)*2.;
  c+=c*hi*br*G*A;
  // бегущий блик по граням
  float b=dot(o,normalize(vec2(1.,.55)));float ph=fract(t*.07)*2.2-.6;
  c+=vec3(.55,.75,1.)*exp(-pow((b-ph)*9.,2.))*smoothstep(.3,.85,L)*.45*W*A;
  // лучи переливаются вдоль направления из источника
  vec2 d=o-S;float ang=atan(d.x,d.y), r=length(d);
  float rn=fb(vec2(ang*14.,r*2.5-t*.35));
  c*=1.+Y*A*(rn-.45)*.55*smoothstep(.15,.7,L);
  // свет в тоннеле летит в глубину
  float tn=fb(vec2(ang*6.,log(r+.02)*5.+t*.9));
  c+=c*U*A*(tn-.4)*.7*hi;
  gl_FragColor=vec4(c,1.);
}`;
function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
gl.useProgram(pr);
gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
const pl = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(pl); gl.vertexAttribPointer(pl, 2, gl.FLOAT, false, 0, 0);
const u = {}; for (const k of ['R', 'I', 'S', 'D', 't', 'A', 'F', 'G', 'W', 'Y', 'U', 'X']) u[k] = gl.getUniformLocation(pr, k);
const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
for (const [k, val] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, val);

let W = 0, H = 0;
function size() { const d = Math.min(1.5, devicePixelRatio || 1); W = Math.round(innerWidth * d); H = Math.round(innerHeight * d); cv.width = W; cv.height = H; gl.viewport(0, 0, W, H); }
size(); addEventListener('resize', size);

let ready = false, scene = 0, amp = 0, iw = 16, ih = 9;
// живая петля покоя: камера дышит по своему 3D-пути (v/<набор>i<сцена>.mp4), кадр 0 = постер сцены
const idle = document.createElement('video'); idle.muted = true; idle.loop = true; idle.playsInline = true; idle.preload = 'auto';
idle.setAttribute('playsinline', ''); idle.setAttribute('aria-hidden', 'true');
idle.style.cssText = 'position:absolute;width:2px;height:2px;opacity:0;pointer-events:none;left:0;top:0';
document.body.appendChild(idle);
const idleUrl = window.__idleUrl || (() => null);
const cache = {};
function fetchIdle(k) { const u = idleUrl(k); if (!u || cache[k]) return cache[k]; return cache[k] = fetch(u).then(r => r.ok ? r.blob() : null).then(b => b && (cache[k] = URL.createObjectURL(b))).catch(() => null); }
let idleScene = -1, idleLive = false;
function startIdle(k) {
  idleLive = false; idleScene = k;
  const c = cache[k], u = typeof c === 'string' ? c : idleUrl(k); if (!u) return;
  idle.src = u; idle.currentTime = 0;
  idle.onplaying = () => { if (idleScene === k) idleLive = true; };
  const pr = idle.play(); if (pr && pr.catch) pr.catch(() => {});
}
// после старта догружаем петли всех сцен по очереди, начиная с текущей
setTimeout(async () => { for (let d = 0; d < 9; d++) for (const k of [scene + d, scene - d]) if (k >= 0 && k < 9) await fetchIdle(k); }, 2500);
// кадр сцены меняется в конце каждого ролика — тогда же переливаем его в текстуру
still.addEventListener('load', () => {
  if (scene >= 0 && !(window.__state && window.__state().playing)) startIdle(scene);
  try { gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, still); iw = still.naturalWidth; ih = still.naturalHeight; ready = true; amp = 0; }
  catch (e) { ready = false; }
});
addEventListener('scene', e => { if (e.detail >= 0) scene = e.detail; });

const st = window.__state || (() => ({ playing: false }));
let last = performance.now(), shown = false;
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  const play = st().playing;
  if (play && !idle.paused && amp <= 0) { idle.pause(); idleLive = false; }
  else if (!play && ready && idleScene !== scene) startIdle(scene);
  const target = ready && !play ? 1 : 0;
  // нарастание 1.8 с с мягким стартом, угасание 0.25 с
  amp = target ? Math.min(1, amp + dt / 1.8) : Math.max(0, amp - dt / .25);
  const vis = ready && (amp > 0 || !play);
  if (vis !== shown) { shown = vis; cv.style.opacity = vis ? '1' : '0'; }
  if (vis) {
    const p = P[scene] || P[0], a = amp * amp * (3 - 2 * amp);
    gl.uniform2f(u.R, W, H); gl.uniform2f(u.I, iw, ih); gl.uniform2f(u.S, p.src[0], p.src[1]); gl.uniform2f(u.D, p.drift[0], p.drift[1]);
    gl.uniform1f(u.t, now / 1000); gl.uniform1f(u.A, a); gl.uniform1f(u.F, p.flow); gl.uniform1f(u.G, p.glow);
    if (idleLive && idle.readyState >= 2) { try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, idle); iw = idle.videoWidth; ih = idle.videoHeight; } catch (e) { idleLive = false; } }
    gl.uniform1f(u.W, p.sweep); gl.uniform1f(u.Y, p.ray); gl.uniform1f(u.U, p.tun); gl.uniform1f(u.X, p.swirl ? 1 : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
