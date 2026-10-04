/* komlev — фильм «Чертёж»: прокрутка мотает заранее отрендеренные кадры */
(function(){
'use strict';
var CONFIG={telegram:'https://t.me/coachkomlevaleks'};
var D=document,root=D.documentElement,body=D.body;
var $=function(s,c){return (c||D).querySelector(s)},$$=function(s,c){return [].slice.call((c||D).querySelectorAll(s))};
var mob=function(){return innerWidth<=860};
var SHOT=/[?&]shot/.test(location.search);
var LAST=290,NIGHT=-1;

$$('[data-link]').forEach(function(a){var u=CONFIG[a.dataset.link];if(!u){a.hidden=true;return}a.href=u;a.target='_blank';a.rel='noopener'});

/* 19 историй */
var K=['kuznetsova-yu','vasilyeva','klimova','bodanova','cherenkov','linur','kalashnikova','voropaeva','slinkina','zaveryuho','vainshtein','yagudina','liliya','gorbunova','bekker','golubkova','maksakova','nechitailenko','ermolaeva'];
var kr=$('#kr'),lb=$('.lbx'),li=$('img',lb);
function krow(l,rev,d){var h=l.map(function(n){return '<button type="button" class="kc"><img src="k/'+n+'.webp" alt="Кейс" loading="lazy" width="737" height="364"></button>'}).join('');return '<div class="krow'+(rev?' rev':'')+'" style="--dur:'+d+'s">'+h+h+'</div>'}
kr.innerHTML=krow(K.slice(0,10),0,84)+krow(K.slice(10),1,76);
kr.addEventListener('click',function(e){var b=e.target.closest('.kc');if(!b)return;li.src=$('img',b).src;lb.hidden=false});
lb.addEventListener('click',function(){lb.hidden=true});
addEventListener('keydown',function(e){if(e.key==='Escape')lb.hidden=true});

(function(){var ck=$('.ck'),ok=false;try{ok=localStorage.getItem('ck')==='1'}catch(e){}
  if(!ok&&!SHOT)setTimeout(function(){ck.hidden=false},5000);
  $('button',ck).addEventListener('click',function(){ck.hidden=true;try{localStorage.setItem('ck','1')}catch(e){}})})();

/* ---------- кадры ---------- */
var cv=$('#film'),cx=cv.getContext('2d'),dir='fd/';
var imgs=new Array(LAST+1),loaded=0,bar=$('.intro b');
function load(i,cb){var im=new Image();im.decoding='async';im.onload=function(){imgs[i]=im;loaded++;cb&&cb()};im.onerror=function(){cb&&cb()};im.src=dir+'f_'+('00'+i).slice(-3)+'.webp'}
function nearest(f){f=Math.round(f);for(var d=0;d<=LAST;d++){if(imgs[f-d])return imgs[f-d];if(imgs[f+d])return imgs[f+d]}return null}
var W=0,H=0;
function size(){var dpr=Math.min(devicePixelRatio||1,2);W=cv.width=Math.round(innerWidth*dpr);H=cv.height=Math.round(innerHeight*dpr);measure();drawn=-1}
var drawn=-1;
function paint(f){var a=nearest(Math.floor(f));if(!a)return;
  var s=Math.max(W/a.naturalWidth,H/a.naturalHeight),w=a.naturalWidth*s,h=a.naturalHeight*s,x=(W-w)/2,y=(H-h)/2;
  cx.globalAlpha=1;cx.drawImage(a,x,y,w,h);
  var k=f-Math.floor(f),b=imgs[Math.floor(f)+1];if(k>.02&&b){cx.globalAlpha=k;cx.drawImage(b,x,y,w,h);cx.globalAlpha=1}}

/* ---------- прокрутка -> кадр ---------- */
var secs=$$('main > section'),pts=[],veil=$('.veil'),prog=$('.prog'),cn=$('#cn'),cl=$('#cl'),navA=$$('.nav nav a'),steps=$$('.step');
function measure(){pts=[];var vh=innerHeight;secs.forEach(function(s,i){var r=s.getBoundingClientRect(),top=r.top+scrollY,f=s.dataset.f.split(',').map(Number);
  if(f.length===2){pts.push([top+vh/2,f[0]]);pts.push([top+r.height-vh/2,f[1]])}else pts.push([top+Math.min(r.height,vh*1.4)/2,f[0]])});
  pts.sort(function(a,b){return a[0]-b[0]})}
function target(){var y=scrollY+innerHeight/2,n=pts.length;if(y<=pts[0][0])return pts[0][1];if(y>=pts[n-1][0])return pts[n-1][1];
  for(var i=0;i<n-1;i++)if(y<pts[i+1][0]){var k=(y-pts[i][0])/(pts[i+1][0]-pts[i][0]);return pts[i][1]+(pts[i+1][1]-pts[i][1])*k}return LAST}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.classList.add('in')})},{rootMargin:'-25% 0px -25% 0px'});
secs.forEach(function(s){io.observe(s)});
navA.concat($$('.logo')).forEach(function(a){a.addEventListener('click',function(e){var t=$(a.getAttribute('href'));if(!t)return;e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'})})});

var cur=0,curSec=-1,lt=performance.now();
function frame(now){var dt=Math.min(.05,(now-lt)/1000);lt=now;var t=target();
  cur+=(t-cur)*(SHOT?1:Math.min(1,dt*6));if(Math.abs(t-cur)<.01)cur=t;
  if(Math.abs(cur-drawn)>.01){paint(cur);drawn=cur}
  body.classList.toggle('night',cur>NIGHT);
  var mid=scrollY+innerHeight/2,si=0;secs.forEach(function(s,i){if(s.offsetTop<=mid)si=i});
  if(si!==curSec){curSec=si;cn.textContent=(si<9?'0':'')+(si+1);cl.textContent=secs[si].dataset.name||'';veil.style.opacity=secs[si].dataset.veil||0;
    navA.forEach(function(a){a.classList.toggle('on',$(a.getAttribute('href'))===secs[si])})}
  /* пять частей включаются вместе со стройкой */
  var on=cur<28?-1:cur<42?0:cur<58?1:cur<74?2:cur<90?3:4;steps.forEach(function(s,i){s.classList.toggle('on',i===on||(on===4&&cur>140&&false))});
  var max=root.scrollHeight-innerHeight;prog.style.transform='scaleX('+(max>0?scrollY/max:0)+')';
  if(!SHOT)requestAnimationFrame(frame)}
window.__frame=function(){frame(performance.now())};

size();addEventListener('resize',size);addEventListener('load',measure);if(D.fonts&&D.fonts.ready)D.fonts.ready.then(measure);
/* сначала каждый 6-й кадр, потом остальные — фильм виден сразу и уточняется */
var first=[],rest=[];for(var i=0;i<=LAST;i++)(i%6===0?first:rest).push(i);
var done=0;first.forEach(function(i){load(i,function(){done++;bar.style.transform='scaleX('+done/first.length+')';
  if(done===first.length){root.classList.add('ready');drawn=-1;var q=rest.slice(),run=function(){var n=q.shift();if(n===undefined)return;load(n,function(){drawn=-1;run()})};for(var j=0;j<4;j++)run()}})});
requestAnimationFrame(frame);
})();
