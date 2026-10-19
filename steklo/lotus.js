(() => {
'use strict';
// Лотос → живое облако частиц → звёзды. Частицы берутся из самого кадра лотоса (цвет каждого пикселя),
// всё движение считает видеокарта в одном проходе (без работы процессора на кадр).
// Сцены (с нуля): 6 — лотос, 7 — облако (живёт без остановки), 8 — горизонт.
// Свайп 6→7: лотос рассыпается в 3D-облако с завихрением. 7→8: искры поднимаются и гаснут, проявляется горизонт.
const cv = document.getElementById('gl');
const gl = cv && cv.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
if (!gl || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
const st = () => (window.__state ? window.__state() : { pos: 0 });
const MOB = innerHeight > innerWidth || innerWidth < 760;
const GW = MOB ? 220 : 340, GH = Math.round(GW * 9 / 16);

const VS = `precision highp float;
attribute vec2 aUV; attribute vec3 aCol; attribute vec3 aS;
uniform float uP, uT, uDpr; uniform vec2 uR, uSc;
varying vec3 vCol; varying float vA, vD, vB;
float sm(float a,float b,float x){ float t=clamp((x-a)/(b-a),0.,1.); return t*t*t*(t*(t*6.-15.)+10.); }
void main(){
  vec3 h = vec3((aUV.x-.5)*2.*uSc.x, (.5-aUV.y)*2.*uSc.y, 0.);
  float lum = dot(aCol, vec3(.3,.59,.11));
  float p = min(uP,1.), q = max(uP-1.,0.);
  // распад сверху вниз и случайно: кончики лепестков уходят первыми
  float st0 = .45*aS.x + .35*aUV.y;
  float d = sm(st0*.6, st0*.6+.55, p);
  vec3 tg = vec3(h.x*1.15 + (aS.y-.5)*2.6, h.y*.9 + (aS.z-.5)*1.7 + .18, (aS.x-.5)*2.4);
  vec3 P = mix(h, tg, d);
  // завихрение на лету и живое парение, когда частица уже свободна
  float sw = d*(1.-d)*4.*(aS.z-.5)*2.2 + d*uT*.05;
  float cs = cos(sw), sn = sin(sw); P.xz = mat2(cs,-sn,sn,cs)*P.xz;
  P += d*vec3(sin(uT*.31+aS.x*31.), sin(uT*.27+aS.y*23.), sin(uT*.23+aS.z*17.))*.07;
  // 7→8: искры поднимаются звёздами
  P.y += q*q*(1.1+aS.y*1.8); P.z += q*.6;
  float D = 3.2, f = D/(D-P.z);
  vec2 sp = P.xy*f;
  gl_Position = vec4(sp.x, sp.y, 0., 1.);
  float cell = 2.*uSc.x/${GW}.*uR.x*.5;
  float bok = step(.94, aS.y);
  float sz = mix(cell*1.55, (1.2+2.6*aS.z)*uDpr*(1.+bok*5.), d) * f;
  gl_PointSize = max(sz, 1.);
  vec3 glow = vec3(.72,.86,1.)*(.75+lum*1.7);
  vCol = mix(aCol, glow, d*.7)*(1.+d*.25);
  float tw = .65+.35*sin(uT*(1.5+aS.x*3.)+aS.z*40.);
  vA = mix(1., (.55+.45*tw)*(1.-bok*.7), d) * (1.-sm(.25,.8,q));
  vD = d; vB = bok;
}`;
const FS = `precision mediump float;
varying vec3 vCol; varying float vA, vD, vB;
void main(){
  vec2 c = gl_PointCoord-.5; float r = length(c)*2.;
  float soft = pow(clamp(1.-r,0.,1.), mix(1.6, .8, vB));
  float a = mix(step(r, 1.42), soft, vD) * vA;
  if (a < .003) discard;
  gl_FragColor = vec4(vCol*a, a*(1.-vD*.65));
}`;
function sh(t, s) { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; }
let prog;
try { prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); }
catch (e) { console.warn(e); return; }
gl.useProgram(prog);
const U = {}; for (const k of ['uP', 'uT', 'uDpr', 'uR', 'uSc']) U[k] = gl.getUniformLocation(prog, k);
let N = 0, bg = [0.01, 0.02, 0.05], ready = false;

// частицы из кадра лотоса
const img = new Image(); img.crossOrigin = 'anonymous';
img.src = `${document.documentElement.dataset.assets || 'v'}/dp6.webp`;
img.decode().then(() => {
  const c = document.createElement('canvas'); c.width = GW; c.height = GH; const x = c.getContext('2d');
  x.drawImage(img, 0, 0, GW, GH); const px = x.getImageData(0, 0, GW, GH).data;
  // цвет фона — средний по краям кадра
  let br = 0, bgc = 0, bb = 0, n = 0;
  for (let i = 0; i < GW; i++) for (const j of [0, GH - 1]) { const o = (j * GW + i) * 4; br += px[o]; bgc += px[o + 1]; bb += px[o + 2]; n++; }
  bg = [br / n / 255, bgc / n / 255, bb / n / 255];
  const uv = [], col = [], sd = [];
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const o = (j * GW + i) * 4, r = px[o] / 255, g = px[o + 1] / 255, b = px[o + 2] / 255;
    const l = .3 * r + .59 * g + .11 * b, dl = l - (.3 * bg[0] + .59 * bg[1] + .11 * bg[2]);
    if (dl < .045 && Math.random() > .06) continue;           // фон почти не берём — он остаётся цветом холста
    uv.push((i + .5) / GW, (j + .5) / GH); col.push(r, g, b); sd.push(Math.random(), Math.random(), Math.random());
  }
  N = uv.length / 2;
  for (const [name, arr, size] of [['aUV', uv, 2], ['aCol', col, 3], ['aS', sd, 3]]) {
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
    const l = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0);
  }
  ready = true;
}).catch(() => {});

let W = 0, H = 0, DPR = 1;
function size() { DPR = Math.min(MOB ? 1.5 : 1.75, devicePixelRatio || 1); W = Math.round(innerWidth * DPR); H = Math.round(innerHeight * DPR); cv.width = W; cv.height = H; gl.viewport(0, 0, W, H); }
size(); addEventListener('resize', size);
gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
let lastOp = -1;
function frame(now) {
  const pos = st().pos;
  let op = 0, P = 0;
  if (pos > 6 && pos < 7) { P = pos - 6; op = sm(0, .06, P); }
  else if (pos >= 7 && pos < 8) { P = pos - 6; op = 1 - sm(.3, .7, pos - 7); }
  if (!ready) op = 0;
  window.__glCover = op > .999;
  if (Math.abs(op - lastOp) > .001) { cv.style.opacity = op.toFixed(3); lastOp = op; }
  if (op > 0) {
    gl.clearColor(bg[0], bg[1], bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT);
    const A = W / H, R = 16 / 9;
    gl.uniform1f(U.uP, P); gl.uniform1f(U.uT, now / 1000); gl.uniform1f(U.uDpr, DPR);
    gl.uniform2f(U.uR, W, H); gl.uniform2f(U.uSc, Math.max(1, R / A), Math.max(1, A / R));
    gl.drawArrays(gl.POINTS, 0, N);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
