/* komlev — сцена из частиц, которая пересобирается по главам, и интерфейс страницы */
(function(){
'use strict';
var CONFIG={telegram:'https://t.me/coachkomlevaleks'};
var D=document,root=D.documentElement,body=D.body;
var $=function(s,c){return (c||D).querySelector(s)},$$=function(s,c){return [].slice.call((c||D).querySelectorAll(s))};
var mob=function(){return innerWidth<=860};
var RENDER=/[?&]shot/.test(location.search);

/* ---------- ссылки ---------- */
$$('[data-link]').forEach(function(a){var u=CONFIG[a.dataset.link];if(!u){a.hidden=true;return}a.href=u;a.target='_blank';a.rel='noopener'});

/* ---------- заголовки по словам ---------- */
$$('[data-split]').forEach(function(h){var n=0;
  (function walk(el,grad){[].slice.call(el.childNodes).forEach(function(c){
    if(c.nodeType===3){var f=D.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(function(t){
        if(!t)return;if(/^\s+$/.test(t)){f.appendChild(D.createTextNode(' '));return}
        var w=D.createElement('span');w.className='w';var i=D.createElement('span');i.textContent=t;i.style.setProperty('--i',n++);if(grad)i.className='gdw';w.appendChild(i);f.appendChild(w)});
      el.replaceChild(f,c)}
    else if(c.nodeType===1)walk(c,grad||c.classList.contains('gd'))})})(h,false)});

/* ---------- 19 историй ---------- */
var K=['kuznetsova-yu','vasilyeva','klimova','bodanova','cherenkov','linur','kalashnikova','voropaeva','slinkina','zaveryuho','vainshtein','yagudina','liliya','gorbunova','bekker','golubkova','maksakova','nechitailenko','ermolaeva'];
var kr=$('#kr'),lb=$('.lbx'),li=$('img',lb);
function krow(l,rev,d){var h=l.map(function(n){return '<button type="button" class="kc"><img src="k/'+n+'.webp" alt="Кейс" loading="lazy" width="737" height="364"></button>'}).join('');return '<div class="krow'+(rev?' rev':'')+'" style="--dur:'+d+'s">'+h+h+'</div>'}
kr.innerHTML=krow(K.slice(0,10),0,84)+krow(K.slice(10),1,76);
kr.addEventListener('click',function(e){var b=e.target.closest('.kc');if(!b)return;li.src=$('img',b).src;lb.hidden=false});
lb.addEventListener('click',function(){lb.hidden=true});
addEventListener('keydown',function(e){if(e.key==='Escape')lb.hidden=true});

/* ---------- cookie ---------- */
(function(){var ck=$('.ck'),ok=false;try{ok=localStorage.getItem('ck')==='1'}catch(e){}
  if(!ok&&!RENDER)setTimeout(function(){ck.hidden=false},4000);
  $('button',ck).addEventListener('click',function(){ck.hidden=true;try{localStorage.setItem('ck','1')}catch(e){}})})();

/* ---------- главы ---------- */
var secs=$$('main > section'),centers=[],cn=$('#cn'),cl=$('#cl'),prog=$('.prog'),navA=$$('.nav nav a');
function measure(){centers=secs.map(function(s){var r=s.getBoundingClientRect();return r.top+scrollY+r.height/2})}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('in')})},{rootMargin:'-30% 0px -30% 0px'});
secs.forEach(function(s,i){if(i)io.observe(s)});
var curName=-1;
function chapter(i){if(i===curName)return;curName=i;cn.textContent=(i<9?'0':'')+(i+1);cl.textContent=secs[i].dataset.name||'';
  navA.forEach(function(a){var t=$(a.getAttribute('href'));a.classList.toggle('on',t===secs[i])})}
navA.concat($$('.logo')).forEach(function(a){a.addEventListener('click',function(e){var t=$(a.getAttribute('href'));if(!t)return;e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'})})});

/* параллакс стеклянных карточек */
var cards=$('.cards');
addEventListener('pointermove',function(e){if(mob())return;cards.style.setProperty('--mx',(e.clientX/innerWidth*2-1).toFixed(3));cards.style.setProperty('--my',(e.clientY/innerHeight*2-1).toFixed(3));PX=e.clientX/innerWidth*2-1;PY=e.clientY/innerHeight*2-1},{passive:true});
var PX=0,PY=0;

function ready(){root.classList.add('ready');setTimeout(function(){secs[0].classList.add('in')},RENDER?0:350)}

/* =====================================================================
   СЦЕНА
   ===================================================================== */
var T=window.THREE,cv=$('#gl');
if(!T){cv.remove();ready();basicScroll();return}

var N=mob()?30000:80000;
function rnd(){return Math.random()}
function g(){var u=0,v=0;while(!u)u=rnd();while(!v)v=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(6.2832*v)}
var C={blue:[.14,.36,1],cyan:[.3,.74,1],vio:[.5,.3,1],coral:[1,.34,.28],white:[.85,.92,1],warm:[1,.78,.62],pink:[1,.5,.72]};
function mx(a,b,k){return [a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k]}
function ramp(k,stops){k=Math.max(0,Math.min(.9999,k))*(stops.length-1);var i=Math.floor(k);return mx(stops[i],stops[i+1],k-i)}

/* каждая форма: fn(i) -> [x,y,z, r,g,b] */
var SHAPES={
  ring:function(){var f=Math.floor(rnd()*90),a=rnd()*6.2832,r,y;
    var w=.036*Math.sin(a*3+f*1.7)+.022*Math.sin(a*7+f*2.9)+.012*Math.sin(a*17+f*.7);
    if(rnd()<.88){r=1+w*(f%6===0?2.4:1)+g()*.005;y=.03*Math.sin(a*5+f)+g()*.008}
    else{r=1+Math.abs(g())*.07*(rnd()<.75?1:-.35);y=g()*.04}
    var u=(1-Math.sin(a))/2,c=ramp(u,[C.cyan,C.blue,C.vio,C.coral]),b=(f%6===0?1.5:.8)*(.6+rnd()*.6);
    if(rnd()<.06){c=C.white;b=1.6}
    return [r*Math.cos(a),y,r*Math.sin(a),c[0]*b,c[1]*b,c[2]*b]},
  funnel:function(){var y=1-2*Math.pow(rnd(),.75),h=(y+1)/2,rr=.05+.86*Math.pow(h,2.3),a;
    if(rnd()<.72){a=Math.floor(rnd()*7)*.8976+(1-y)*2.7+g()*.13}else a=rnd()*6.2832;
    var c=ramp(h,[C.white,C.cyan,C.blue,C.vio,C.pink]),b=1.5-h*1.05;
    return [rr*Math.cos(a)+g()*.006,y,rr*Math.sin(a)+g()*.006,c[0]*b,c[1]*b,c[2]*b]},
  helix:function(){var y=rnd()*2-1,r=.27,a,c,b;
    if(rnd()<.76){a=y*5.2+(rnd()<.5?0:3.1416);var sp=rnd()<.25?.05:.02;
      c=ramp(rnd(),[C.blue,C.cyan,C.white]);b=.9+rnd()*.5;
      return [r*Math.cos(a)+g()*sp,y+g()*.006,r*Math.sin(a)+g()*sp,c[0]*b,c[1]*b,c[2]*b]}
    var yq=Math.round(y*13)/13,t=rnd()*2-1;a=yq*5.2;c=mx(C.vio,C.cyan,Math.abs(t));b=.7;
    return [t*r*Math.cos(a),yq+g()*.004,t*r*Math.sin(a),c[0]*b,c[1]*b,c[2]*b]},
  orbits:function(){var u=rnd();
    if(u<.08){var s=.05;return [g()*s,g()*s,g()*s,C.warm[0]*1.3,C.warm[1]*1.3,C.warm[2]*1.3]}
    var j=Math.floor(rnd()*5),R=.36+.15*j,tx=[.0,.3,-.24,.4,-.34][j],tz=[.1,-.2,.3,.12,-.26][j],a,x,y=0,z,c,b;
    if(rnd()<.24){a=j*1.9+g()*.045;var bl=.018;x=R*Math.cos(a)+g()*bl;y=g()*bl;z=R*Math.sin(a)+g()*bl;c=j%2?C.coral:C.warm;b=1.3}
    else{a=rnd()*6.2832;var rr=R+g()*.004;x=rr*Math.cos(a);z=rr*Math.sin(a);y=g()*.003;c=mx(C.blue,C.cyan,rnd());b=.75}
    var cy=Math.cos(tx),sy=Math.sin(tx),y1=cy*y-sy*z,z1=sy*y+cy*z;var cz=Math.cos(tz),sz=Math.sin(tz),x2=cz*x-sz*y1,y2=sz*x+cz*y1;
    return [x2,y2,z1,c[0]*b,c[1]*b,c[2]*b]},
  wave:function(){var L=54,z=-.55+.95*(Math.floor(rnd()*L)/L),x=rnd()*2.4-1.2;
    var ridge=Math.exp(-Math.pow((z+.05)/.2,2));
    var y=.17*ridge*(.62+.38*Math.sin(x*5+1))+.016*Math.sin(x*13+z*22)+g()*.002;
    var c=ramp((x+1.2)/2.4,[C.cyan,C.blue,C.vio,C.coral,C.coral]),b=.14+ridge*1.5;
    return [x,y,z,c[0]*b,c[1]*b,c[2]*b]},
  aura:function(){var u=rnd(),a=rnd()*6.2832,c,b;
    if(u<.34){var r=1+g()*.006;c=mx(C.cyan,C.white,rnd()*.6);b=.9;return [r*Math.cos(a),g()*.006,r*Math.sin(a),c[0]*b,c[1]*b,c[2]*b]}
    if(u<.56){var r2=.82+g()*.004,x=r2*Math.cos(a),z=r2*Math.sin(a),t=.5;c=mx(C.vio,C.blue,rnd());b=.8;return [x,-Math.sin(t)*z,Math.cos(t)*z,c[0]*b,c[1]*b,c[2]*b]}
    var R=Math.pow(rnd(),.5)*1.7,th=Math.acos(rnd()*2-1);c=ramp(rnd(),[C.blue,C.cyan,C.white]);b=.45+rnd()*.5;
    return [R*Math.sin(th)*Math.cos(a),R*Math.cos(th)*.7,R*Math.sin(th)*Math.sin(a),c[0]*b,c[1]*b,c[2]*b]},
  dust:function(){var c=rnd()<.06?C.coral:ramp(rnd(),[C.blue,C.cyan,C.white,C.vio]),b=.35+Math.pow(rnd(),3)*1.3;
    var a=rnd()*6.2832,R=.25+Math.pow(rnd(),.6)*1.9;
    return [R*Math.cos(a),(rnd()*2-1)*1.15,R*Math.sin(a),c[0]*b,c[1]*b,c[2]*b]},
  hole:function(){var a,r,c,b;
    if(rnd()<.14){r=.5+Math.abs(g())*.012;a=rnd()*6.2832;c=mx(C.white,C.cyan,rnd()*.5);b=1.5;return [r*Math.cos(a),g()*.004,r*Math.sin(a),c[0]*b,c[1]*b,c[2]*b]}
    var q=Math.pow(rnd(),2.1);r=.53+q*1.5;a=Math.floor(rnd()*5)*1.2566+Math.log(r)*4.6+g()*.3;
    c=ramp(q*1.25,[C.white,C.cyan,C.blue,C.vio,C.vio]);b=1.15-q*.75;if(rnd()<.03){c=C.coral;b=1.2}
    return [r*Math.cos(a),g()*.014*(1+q*3),r*Math.sin(a),c[0]*b,c[1]*b,c[2]*b]},
  galaxy:function(){var u=rnd(),a,r,c,b;
    if(u<.17){var s=.07;return [g()*s,g()*s*.6,g()*s,C.warm[0]*1.5,C.warm[1]*1.45,C.warm[2]*1.5]}
    if(u<.8){var q=Math.pow(rnd(),1.25);r=.1+q*.72;a=(rnd()<.5?0:3.1416)+r*5.6+g()*.26;
      c=ramp(q,[C.warm,C.pink,C.vio,C.blue,C.cyan]);b=1.2-q*.55;return [r*Math.cos(a),g()*.022*(1.2-q),r*Math.sin(a),c[0]*b,c[1]*b,c[2]*b]}
    r=(rnd()<.5?.95:1.12)+g()*.004;a=rnd()*6.2832;c=mx(C.blue,C.cyan,rnd());b=.85;
    return [r*Math.cos(a),g()*.003,r*Math.sin(a),c[0]*b,c[1]*b,c[2]*b]}
};
/* наклон формы [x,z], вращение рад/с, волна, разлёт при пересборке */
var META={ring:{t:[1.5708,0],sp:.03,w:0},funnel:{t:[.2,-.14],sp:.26,w:0},helix:{t:[.06,.24],sp:.38,w:0},orbits:{t:[.55,.22],sp:.14,w:0},
  wave:{t:[.2,0],sp:0,w:1},aura:{t:[1.3,.28],sp:.1,w:0},dust:{t:[.1,0],sp:.025,w:0},hole:{t:[1.5708,0],sp:.13,w:0},galaxy:{t:[.42,.2],sp:.12,w:0}};
/* главы: d — компьютер (x,y в долях полуэкрана, s в долях полувысоты, sw — полуширины), m — телефон (s в долях полуширины) */
var STAGE=[
  {sh:'ring',  d:{x:0,y:0,s:.84,a:.62},    m:{x:0,y:.02,s:1.24,a:.7}},
  {sh:'funnel',d:{x:.5,y:0,s:.8,a:.6},     m:{x:.3,y:.05,s:1.5,a:.16}},
  {sh:'helix', d:{x:.36,y:0,s:.84,a:.42},  m:{x:.4,y:.34,s:.8,a:.8}},
  {sh:'orbits',d:{x:-.5,y:0,s:.74,a:.42},  m:{x:0,y:0,s:1.15,a:.1}},
  {sh:'wave',  d:{x:0,y:-.62,sw:1,a:.42},  m:{x:0,y:-.82,s:1.7,a:.22}},
  {sh:'aura',  d:{x:-.6,y:.02,s:.74,a:.5}, m:{x:0,y:.36,s:1.02,a:.45}},
  {sh:'dust',  d:{x:0,y:0,s:1.5,a:.42},    m:{x:0,y:0,s:2.6,a:.34}},
  {sh:'dust',  d:{x:0,y:0,s:1.5,a:.42},    m:{x:0,y:0,s:2.6,a:.34}},
  {sh:'hole',  d:{x:0,y:0,s:.98,a:.34},     m:{x:0,y:0,s:1.9,a:.6}},
  {sh:'galaxy',d:{x:0,y:.4,s:.8,a:.45},    m:{x:0,y:.4,s:1.12,a:.75}}
];
var built={};
function build(name){if(built[name])return built[name];var p=new Float32Array(N*3),c=new Float32Array(N*3),f=SHAPES[name];
  for(var i=0;i<N;i++){var v=f();p[i*3]=v[0];p[i*3+1]=v[1];p[i*3+2]=v[2];c[i*3]=v[3];c[i*3+1]=v[4];c[i*3+2]=v[5]}
  return built[name]={p:p,c:c}}

var renderer;
try{renderer=new T.WebGLRenderer({canvas:cv,antialias:false,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:RENDER})}catch(e){cv.remove();ready();basicScroll();return}
renderer.setClearColor(0x02030a,1);
var scene=new T.Scene(),FOV=40,CAMZ=8,cam=new T.PerspectiveCamera(FOV,1,.1,120);cam.position.set(0,0,CAMZ);
var HH=Math.tan(FOV*Math.PI/360)*CAMZ,HW=HH,DPR=1;

var geo=new T.BufferGeometry(),s0=build(STAGE[0].sh),s1=build(STAGE[1].sh);
var aA=new T.BufferAttribute(new Float32Array(s0.p),3),aB=new T.BufferAttribute(new Float32Array(s1.p),3),
    cA=new T.BufferAttribute(new Float32Array(s0.c),3),cB=new T.BufferAttribute(new Float32Array(s1.c),3);
var rr=new Float32Array(N*4);for(var i=0;i<N*4;i++)rr[i]=rnd();
geo.setAttribute('position',aA);geo.setAttribute('aB',aB);geo.setAttribute('cA',cA);geo.setAttribute('cB',cB);geo.setAttribute('aR',new T.BufferAttribute(rr,4));
var U={uT:{value:0},uK:{value:0},uSpinA:{value:0},uSpinB:{value:0},uTiltA:{value:new T.Vector2()},uTiltB:{value:new T.Vector2()},
  uWavA:{value:0},uWavB:{value:0},uOff:{value:new T.Vector3()},uScale:{value:1},uPx:{value:1},uAlpha:{value:1},uSize:{value:.03},uBurst:{value:.5},uVel:{value:0}};
var mat=new T.ShaderMaterial({uniforms:U,transparent:true,depthTest:false,depthWrite:false,blending:T.AdditiveBlending,
vertexShader:[
'attribute vec3 aB;attribute vec3 cA;attribute vec3 cB;attribute vec4 aR;',
'uniform float uT,uK,uSpinA,uSpinB,uWavA,uWavB,uScale,uPx,uAlpha,uSize,uBurst,uVel;uniform vec2 uTiltA,uTiltB;uniform vec3 uOff;',
'varying vec3 vC;varying float vA;',
'vec3 ry(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}',
'vec3 rx(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}',
'vec3 rz(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}',
'vec3 form(vec3 p,float spin,vec2 tilt,float wav){',
'  p.y+=wav*(sin(p.x*4.2+uT*.7+p.z*5.)*.035+sin(p.x*9.-uT*1.1+p.z*7.)*.012);',
'  p=ry(p,spin);p=rx(p,tilt.x);p=rz(p,tilt.y);return p;}',
'void main(){',
'  float k=clamp(uK*1.6-aR.x*.6,0.,1.);k=k*k*(3.-2.*k);',
'  vec3 a=form(position,uSpinA,uTiltA,uWavA),b=form(aB,uSpinB,uTiltB,uWavB);',
'  vec3 p=mix(a,b,k);float bu=sin(k*3.14159);',
'  vec3 dir=normalize(vec3(aR.y-.5,aR.z-.5,aR.w-.5)+1e-4);',
'  p+=dir*bu*uBurst*(.35+aR.x);p=ry(p,bu*(aR.y-.3)*1.6);',
'  p+=vec3(sin(uT*.9+aR.x*40.+p.y*6.),cos(uT*.7+aR.y*31.+p.x*6.),sin(uT*.8+aR.z*17.))*(.006+uVel*.02);',
'  p=p*uScale+uOff;',
'  vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;',
'  gl_PointSize=max(1.,uSize*(.55+aR.z*aR.z*1.9)*(1.+bu*.8)*uPx/-mv.z);',
'  vC=mix(cA,cB,k);vA=uAlpha*(1.-bu*.6)*(.62+.38*sin(uT*(1.+aR.w*2.5)+aR.x*50.));}'].join('\n'),
fragmentShader:[
'precision mediump float;varying vec3 vC;varying float vA;',
'void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.05,d);gl_FragColor=vec4(vC,a*a*vA);}'].join('\n')});
var pts=new T.Points(geo,mat);pts.frustumCulled=false;scene.add(pts);

/* звёзды и крупные размытые огни — глубина позади и впереди */
function sprite(){var c=D.createElement('canvas');c.width=c.height=64;var x=c.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return new T.CanvasTexture(c)}
var tex=sprite(),sky=new T.Group();scene.add(sky);
(function(){var n=mob()?700:1500,p=new Float32Array(n*3),c=new Float32Array(n*3);
  for(var i=0;i<n;i++){var z=-4-rnd()*42,sp=(Math.abs(z)+10)*.95;p[i*3]=(rnd()*2-1)*sp;p[i*3+1]=(rnd()*2-1)*sp*.8;p[i*3+2]=z;
    var col=rnd()<.12?C.coral:ramp(rnd(),[C.blue,C.cyan,C.white]),b=.25+Math.pow(rnd(),4)*1.2;c[i*3]=col[0]*b;c[i*3+1]=col[1]*b;c[i*3+2]=col[2]*b}
  var g1=new T.BufferGeometry();g1.setAttribute('position',new T.BufferAttribute(p,3));g1.setAttribute('color',new T.BufferAttribute(c,3));
  sky.add(new T.Points(g1,new T.PointsMaterial({size:.14,map:tex,vertexColors:true,transparent:true,depthTest:false,depthWrite:false,blending:T.AdditiveBlending})));
  var m=12,p2=new Float32Array(m*3),c2=new Float32Array(m*3);
  for(i=0;i<m;i++){z=-9+rnd()*13;sp=(8-z)*.42;p2[i*3]=(rnd()*2-1)*sp*1.6;p2[i*3+1]=(rnd()*2-1)*sp;p2[i*3+2]=z;col=i%5===0?C.coral:mx(C.blue,C.cyan,rnd());b=.5;c2[i*3]=col[0]*b;c2[i*3+1]=col[1]*b;c2[i*3+2]=col[2]*b}
  var g2=new T.BufferGeometry();g2.setAttribute('position',new T.BufferAttribute(p2,3));g2.setAttribute('color',new T.BufferAttribute(c2,3));
  sky.add(new T.Points(g2,new T.PointsMaterial({size:.5,map:tex,vertexColors:true,transparent:true,opacity:.75,depthTest:false,depthWrite:false,blending:T.AdditiveBlending})))})();

/* свечение: на компьютере — настоящий bloom, на телефоне — аддитивные точки */
var composer=null;
function bloom(){try{if(!T.UnrealBloomPass)return;composer=new T.EffectComposer(renderer);composer.addPass(new T.RenderPass(scene,cam));
  composer.addPass(new T.UnrealBloomPass(new T.Vector2(innerWidth/2,innerHeight/2),.8,.7,.16));size()}catch(e){composer=null}}
if(!mob()){var ps=D.createElement('script');ps.src='fx/post.js';ps.onload=bloom;D.head.appendChild(ps)}

function size(){var w=innerWidth,h=innerHeight;DPR=Math.min(devicePixelRatio||1,mob()?1.75:1.5);renderer.setPixelRatio(DPR);renderer.setSize(w,h,false);
  cam.aspect=w/h;cam.updateProjectionMatrix();HW=HH*cam.aspect;U.uPx.value=h*DPR/(2*Math.tan(FOV*Math.PI/360));U.uSize.value=mob()?.05:.034;
  if(composer)composer.setSize(w,h);measure()}
size();addEventListener('resize',size);
if(D.fonts&&D.fonts.ready)D.fonts.ready.then(measure);addEventListener('load',measure);setTimeout(measure,1500);

function conf(i){var s=STAGE[i],c=mob()?s.m:s.d,sc=mob()?c.s*HW:(c.sw?c.sw*HW:c.s*HH);return {x:c.x*HW,y:c.y*HH,s:sc,a:c.a}}
var curI=-1,Ps=0,lastY=scrollY,vel=0,spin=0,t0=performance.now(),lt=t0;
function setStage(i){if(i===curI)return;curI=i;var a=build(STAGE[i].sh),b=build(STAGE[Math.min(i+1,STAGE.length-1)].sh);
  aA.array.set(a.p);aB.array.set(b.p);cA.array.set(a.c);cB.array.set(b.c);aA.needsUpdate=aB.needsUpdate=cA.needsUpdate=cB.needsUpdate=true;
  var ma=META[STAGE[i].sh],mb=META[STAGE[Math.min(i+1,STAGE.length-1)].sh];
  U.uTiltA.value.set(ma.t[0],ma.t[1]);U.uTiltB.value.set(mb.t[0],mb.t[1]);U.uWavA.value=ma.w;U.uWavB.value=mb.w;
  U.uBurst.value=STAGE[i].sh===STAGE[Math.min(i+1,STAGE.length-1)].sh?0:.55;setStage.ma=ma;setStage.mb=mb}
function target(){var y=scrollY+innerHeight/2,n=centers.length;if(y<=centers[0])return 0;if(y>=centers[n-1])return n-1;
  for(var i=0;i<n-1;i++)if(y<centers[i+1]){var f=(y-centers[i])/(centers[i+1]-centers[i]);f=Math.max(0,Math.min(1,(f-.3)/.5));return i+f*f*(3-2*f)}return n-1}
function frame(now){var dt=Math.min(.05,(now-lt)/1000);lt=now;var t=(now-t0)/1000;
  var P=target();Ps+=(P-Ps)*(RENDER?1:Math.min(1,dt*5));
  var i=Math.min(STAGE.length-2,Math.floor(Ps)),k=Ps-i;setStage(i);
  var dy=scrollY-lastY;lastY=scrollY;vel+=(Math.min(1,Math.abs(dy)/60)-vel)*.08;spin+=dt*(1+vel*5);
  var A=conf(i),B=conf(i+1);
  U.uT.value=t;U.uK.value=k;U.uVel.value=vel;U.uSpinA.value=spin*setStage.ma.sp;U.uSpinB.value=spin*setStage.mb.sp;
  U.uOff.value.set(A.x+(B.x-A.x)*k,A.y+(B.y-A.y)*k,0);U.uScale.value=A.s+(B.s-A.s)*k;U.uAlpha.value=(A.a+(B.a-A.a)*k)*(composer?.8:1.);
  cam.position.x+=(PX*.35-cam.position.x)*.04;cam.position.y+=(-PY*.25-cam.position.y)*.04;cam.lookAt(0,0,0);
  sky.rotation.z=t*.004;sky.position.y=scrollY*.0009;sky.rotation.y=PX*.02;
  if(composer)composer.render();else renderer.render(scene,cam);
  var max=D.documentElement.scrollHeight-innerHeight;prog.style.transform='scaleX('+(max>0?scrollY/max:0)+')';chapter(Math.round(P));
  if(!RENDER)requestAnimationFrame(frame)}
window.__frame=function(){frame(performance.now())};
measure();requestAnimationFrame(function(n){frame(n);setTimeout(ready,RENDER?0:900)});

function basicScroll(){measure();addEventListener('resize',measure);(function l(){var y=scrollY+innerHeight/2,b=0;centers.forEach(function(c,i){if(Math.abs(c-y)<Math.abs(centers[b]-y))b=i});chapter(b);
  var max=D.documentElement.scrollHeight-innerHeight;prog.style.transform='scaleX('+(max>0?scrollY/max:0)+')';requestAnimationFrame(l)})()}
})();
