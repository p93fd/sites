// Фильм-нить: все формы считаются в шейдере из одной ДНК, поэтому точки
// не теряются — каждая точка всегда течёт по своей нити, а при прокрутке
// та же нить перестраивается в следующую форму. Движение не останавливается.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

export const SHAPES = 9;

const VS = /* glsl */`
attribute vec4 aP;      // u вдоль нити, s выбор нити, r, r2
attribute vec4 aSeed;   // размер, горячая, фаза, частота
uniform float uShape, uTime, uScale, uSize, uPulse, uPulseAmt, uFlow, uPR;
uniform vec4 uRect; uniform vec3 uMouse;
varying float vB; varying float vHot; varying float vE;
const float PI=3.14159265;
float h(float n){ return fract(sin(n*12.9898)*43758.5453); }

// ветка, растущая из точки нити: длина g, свой изгиб у каждой ветки
vec3 branch(float id, float g, float spread, vec3 down){
  float dx=(h(id*3.1)-.5)*spread, dz=(h(id*5.7)-.5)*spread;
  return vec3(dx*g + sin(g*3.+id)*.16*g, -g*.25*down.y - .1*g*g, dz*g + cos(g*2.6+id)*.12*g);
}
vec3 helixPt(float u, float side, float R, float L, float tw, float t){
  float a=u*tw + t + side;
  return vec3(cos(a)*R, (u-.5)*L, sin(a)*R);
}

vec4 shp(float k, vec4 P, float t){
  float u=P.x, s=P.y, r=P.z, r2=P.w;
  vec3 p; float b=1.;
  if(k<.5){                                   // 0 — ДНК, с краёв осыпается пыль и снова садится на нить
    float uu=fract(u+t*.012);
    if(s<.34){ p=helixPt(uu,0.,.95,7.4,13.2,t*.35); }
    else if(s<.68){ p=helixPt(uu,PI,.95,7.4,13.2,t*.35); }
    else if(s<.84){ float rk=floor(uu*34.)/34.; float ra=rk*13.2+t*.35, v=r*2.-1.; p=vec3(cos(ra)*.95*v,(rk-.5)*7.4,sin(ra)*.95*v); b=.5; }
    else { float life=fract(r2+t*.07), d=life*3.4; p=helixPt(uu,r<.5?0.:PI,.95,7.4,13.2,t*.35)+vec3(d*1.2+sin(r*40.+t)*.2*d, d*.4+cos(r*30.)*.3*d, sin(r*20.)*.5*d); b=.95*(1.-life); }
    p+=(vec3(h(r*7.),h(r*9.),h(r*11.))-.5)*.05;
  } else if(k<1.5){                           // 1 — нить разорвана: те же точки, но их носит
    vec3 q=helixPt(fract(u+t*.006),s<.5?0.:PI,1.,7.,13.2,t*.12);
    vec3 d=vec3(sin(q.y*1.3+t*.4+r*6.), cos(q.x*1.1-t*.33+r2*6.), sin(q.z*1.7+t*.5+r*3.));
    p=q*vec3(1.6,.75,1.2)+d*(1.2+r2*1.9); b=.38+.5*r;
  } else if(k<2.5){                           // 2 — осевшая пыль течёт, редкие искры падают
    float x=(fract(u+t*.02)-.5)*12., z=(s-.5)*7.-1.;
    p=vec3(x,-1.9+sin(x*.7+z+t*.5)*.14+(h(r*3.)-.5)*.08,z); b=.17+r2*.12;
    if(r<.05){ float l=fract(r2+t*.15); p.y=-1.9+(1.-l)*2.6; b=.85*(1.-l*.5); }
  } else if(k<3.5){                           // 3 — три пути: три витые пары, из них растут ветки
    float kk=floor(s*3.), s2=fract(s*3.), uu=fract(u+t*.018);
    vec3 c=vec3((kk-1.)*1.4+sin(uu*5.2+kk*1.7)*.32, 3.7-uu*7.4, sin(uu*4.+kk*2.1)*.5);
    if(s2<.58){ float a=uu*38.+t*.9+(s2<.29?0.:PI); p=c+vec3(cos(a),0.,sin(a))*.1; b=1.; }
    else { float id=floor(r2*90.)+kk*91., ua=h(id*1.7); float g=fract(u+t*.05)*1.5;
      vec3 c0=vec3((kk-1.)*1.4+sin(ua*5.2+kk*1.7)*.32, 3.7-ua*7.4, sin(ua*4.+kk*2.1)*.5);
      p=c0+branch(id,g,1.3,vec3(0.,1.,0.)); b=.6*(1.-g/1.7); }
  } else if(k<4.5){                           // 4 — сеть: девять витых нитей сплетаются по диагонали
    float kk=floor(s*9.), s2=fract(s*9.), uu=fract(u+t*.015);
    vec3 c=vec3((uu-.5)*8.,(uu-.5)*5.2+(kk-4.)*.3+sin(uu*6.+kk)*.35+sin(uu*9.+kk*2.)*.22,sin(uu*5.+kk*.9)*.8);
    if(s2<.55){ float a=uu*52.+t*.8+(s2<.275?0.:PI); p=c+vec3(0.,cos(a),sin(a))*.06; b=1.; }
    else { float id=floor(r2*60.)+kk*61., ua=h(id*1.3); float g=fract(u+t*.04)*1.3;
      vec3 c0=vec3((ua-.5)*8.,(ua-.5)*5.2+(kk-4.)*.3+sin(ua*6.+kk)*.35+sin(ua*9.+kk*2.)*.22,sin(ua*5.+kk*.9)*.8);
      p=c0+branch(id,g,2.2,vec3(0.,-.4,0.)); b=.5*(1.-g/1.5); }
  } else if(k<5.5){                           // 5 — лента-спираль: ДНК разворачивается вширь
    float uu=fract(u+t*.01), ang=uu*17.3+t*.15, R=2.6+uu*.6, w=(s-.5)*.5;
    p=vec3(cos(ang)*R,(uu-.5)*6.+w*.3,sin(ang)*R-1.2+w);
    float a2=uu*140.+t; p+=vec3(cos(a2),sin(a2),0.)*.05*(s<.5?1.:-1.);
    b=(.35+.65*(1.-abs(w)*2.))*(.5+r*.5);
  } else if(k<6.5){                           // 6 — горизонт: нити ложатся волнами и уходят вдаль
    float row=floor(s*26.), x=(fract(u+t*.012*(1.+row*.05))-.5)*14., z=-row*.45+1.5;
    p=vec3(x,-1.3+sin(x*.55+row*.4+t*.4)*.22+(r<.5?1.:-1.)*.03*sin(x*6.+t*1.4),z); b=(.85-row/32.)*(.5+r*.5);
  } else if(k<7.5){                           // 7 — шесть мест: у каждого своя маленькая ДНК
    float kk=floor(s*6.), s2=fract(s*6.), an=kk/6.*2.*PI+.3+t*.03;
    vec3 c=vec3(cos(an)*3.9,sin(an)*2.25,sin(an*2.)*.6);
    if(s2<.78){ float uu=fract(u+t*.06), a=uu*16.+t*1.2+(s2<.39?0.:PI); p=c+vec3(cos(a)*.18,(uu-.5)*1.15,sin(a)*.18); b=1.; }
    else { p=c+(vec3(h(r*3.),h(r*5.),h(r*7.))-.5)*1.4*r2; b=.14; }
  } else {                                    // 8 — финал: снова одна ДНК, светлая и ровная
    float uu=fract(u+t*.02);
    if(s<.8){ p=helixPt(uu,s<.4?0.:PI,.72,5.4,15.,t*.5); b=1.05; }
    else if(s<.92){ float rk=floor(uu*30.)/30.; float ra=rk*15.+t*.5, v=r*2.-1.; p=vec3(cos(ra)*.72*v,(rk-.5)*5.4,sin(ra)*.72*v); b=.6; }
    else { float rr=pow(r,2.)*.45; p=(vec3(h(r*3.),h(r2*5.),h(r*7.))-.5)*2.*rr; b=1.; }
  }
  return vec4(p,b);
}

void main(){
  float A=floor(uShape), f=uShape-A, t=uTime;
  float delay=.5*(aP.z*.6+aP.x*.4);
  float ff=clamp((f-delay)/.5,0.,1.); ff=ff*ff*ff*(ff*(ff*6.-15.)+10.);
  vec4 a=shp(A,aP,t), bb=shp(min(A+1.,8.),aP,t);
  vec3 p=mix(a.xyz,bb.xyz,ff); float br=mix(a.w,bb.w,ff);
  float k=sin(PI*ff); k*=k;
  p+=vec3(sin(aP.z*50.+t*1.3),cos(aP.w*40.+t*1.1),sin(aP.z*30.-t))*k*.9;
  p+=vec3(sin(t*.7*aSeed.w+aSeed.z*30.),cos(t*.6*aSeed.w+aSeed.x*30.),0.)*.015;
  float flow=.55+.45*sin(dot(p,vec3(.9,1.4,.5))*2.2-t*1.6+aSeed.x*2.);
  br*=mix(1.,flow,uFlow);
  br*=1.+uPulseAmt*2.2*exp(-pow((p.x*.6+p.y*.4-uPulse)*2.2,2.));
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  vec2 nd=gl_Position.xy/gl_Position.w;
  // курсор раздвигает нить
  vec2 dm=nd-uMouse.xy; dm.x*=uMouse.z; float md=length(dm);
  vec2 tg=vec2(-dm.y,dm.x); gl_Position.xy+=(tg*1.4+dm*.35)*exp(-md*md*18.)*.12*gl_Position.w;
  float inR=smoothstep(uRect.x-.18,uRect.x+.06,nd.x)*(1.-smoothstep(uRect.z-.06,uRect.z+.18,nd.x))*smoothstep(uRect.y-.18,uRect.y+.06,nd.y)*(1.-smoothstep(uRect.w-.06,uRect.w+.18,nd.y));
  float z=-mv.z;
  float base=uSize*(.55+aSeed.x*.9)*uScale/z;
  float coc=abs(z-9.)*.0022*uScale;
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

export function createFilm(canvas, { N, DPR, mobile }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance", alpha: false });
  if (!renderer.getContext()) throw new Error("no gl");
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0807);
  const camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 80); camera.position.set(0, 0, 10);
  const group = new THREE.Group(); scene.add(group);

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  const P = new Float32Array(N * 4), S = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    P[i * 4] = Math.random(); P[i * 4 + 1] = Math.random(); P[i * 4 + 2] = Math.random(); P[i * 4 + 3] = Math.random();
    S[i * 4] = Math.random(); S[i * 4 + 1] = Math.random(); S[i * 4 + 2] = Math.random(); S[i * 4 + 3] = 0.5 + Math.random();
  }
  g.setAttribute("aP", new THREE.BufferAttribute(P, 4)); g.setAttribute("aSeed", new THREE.BufferAttribute(S, 4));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
  const mat = new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    uniforms: { uShape: { value: 0 }, uTime: { value: 0 }, uScale: { value: 1 }, uSize: { value: mobile ? 0.034 : 0.03 }, uPulse: { value: -9 }, uPulseAmt: { value: 0 }, uFlow: { value: 0.6 }, uPR: { value: DPR },
      uRect: { value: new THREE.Vector4(9, 9, 9, 9) }, uMouse: { value: new THREE.Vector3(9, 9, 1) }, uCol: { value: new THREE.Color(0xd9a27c) }, uHot: { value: new THREE.Color(0xfff1e2) } },
  });
  group.add(new THREE.Points(g, mat));

  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }));
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.42, 0.5, 0.32));
  composer.addPass(new OutputPass());

  let dpr = DPR;
  function resize(newDpr) {
    if (newDpr) dpr = newDpr;
    renderer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight, false); composer.setPixelRatio(dpr); composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    mat.uniforms.uScale.value = innerHeight * dpr / (2 * Math.tan((camera.fov * Math.PI) / 360));
  }
  resize();
  const look = new THREE.Vector3();
  function render(st) {
    const u = mat.uniforms;
    u.uShape.value = st.shape; u.uTime.value = st.time; u.uPulse.value = st.pulse; u.uPulseAmt.value = st.pulseAmt;
    u.uRect.value.copy(st.rect); u.uMouse.value.set(st.mx, st.my, innerWidth / innerHeight);
    group.position.set(st.x, st.y, 0); group.scale.setScalar(st.scale);
    group.rotation.set(st.rx, st.ry, st.rz);
    camera.position.set(Math.sin(st.time * 0.11) * 0.35, st.camY + Math.cos(st.time * 0.09) * 0.2, st.camZ);
    look.set(st.x * 0.15, st.lookY, 0); camera.lookAt(look);
    composer.render();
  }
  return { render, resize, get dpr() { return dpr; }, canvas };
}
