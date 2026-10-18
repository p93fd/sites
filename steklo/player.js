(() => {
'use strict';
// v6: переходы между сценами — готовые ролики 60 fps с вшитой кривой скорости и моушн-блюром.
// Свайп = проигрывание ролика аппаратным декодером (как у Apple), а не перебор картинок.
const MOBILE = () => innerHeight > innerWidth || innerWidth < 760;
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const easeOut=t=>1-Math.pow(1-t,4);
const stops=[...document.querySelectorAll('.stop')].map((el,i)=>({el,i,name:el.dataset.name}));
const S=stops.length;
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const set=MOBILE()?'m':'d';
const EXT=document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"')?'mp4':'webm';
const url=(k,dir)=>`v/${set}${k}${dir}.${EXT}`, purl=k=>`v/${set}p${k}.webp`;

// ---------- загрузка роликов в память: сначала соседи текущей сцены ----------
const blobs={}, loading={};
function want(k,dir){ const key=k+dir; if(blobs[key]||loading[key]||k<0||k>=S-1) return loading[key];
  return loading[key]=fetch(url(k,dir)).then(r=>r.blob()).then(b=>{ blobs[key]=URL.createObjectURL(b); }).catch(()=>{}); }
let qBusy=false;
function preloadAround(k){ const order=[]; for(let d=0;d<S;d++){ for(const [s,dir] of [[k+d,'f'],[k-1-d,'r']]) if(s>=0&&s<S-1) order.push([s,dir]); }
  if(qBusy) return; qBusy=true; (async()=>{ for(const [s,dir] of order) await want(s,dir); qBusy=false; })(); }
const posters={};
function poster(k){ if(!posters[k]){ const im=new Image(); im.decoding='async'; im.src=purl(k); posters[k]=im.decode().then(()=>im).catch(()=>im); } return posters[k]; }

// ---------- сцена ----------
const still=document.getElementById('still'), vids=[document.getElementById('vA'),document.getElementById('vB')], zoomEl=document.getElementById('zoom');
let vi=0, idx=0, playing=null, queue=null, restSince=performance.now();
const chapEl=document.getElementById('chap'), bar=document.getElementById('bar'), dotsEl=document.getElementById('dots');
stops.forEach((s,k)=>{ const b=document.createElement('button'); b.type='button'; b.innerHTML=`${s.name}<i></i>`; b.setAttribute('aria-label',`Сцена ${k+1}: ${s.name}`); b.addEventListener('click',()=>goTo(k)); dotsEl.appendChild(b); });
const dots=[...dotsEl.children];
function ui(k){ chapEl.innerHTML=`<b>${String(k+1).padStart(2,'0')}</b> / ${String(S).padStart(2,'0')} · ${stops[k].name}`; dots.forEach((b,i)=>b.classList.toggle('on',i===k));
  bar.style.width=(k/(S-1)*100)+'%'; document.getElementById('next').style.opacity=k===S-1?0:1; }
function activate(k){ stops.forEach((s,i)=>s.el.classList.toggle('on',i===k)); ring.classList.toggle('on',k===5); if(k===5){ countUp(); spiralStart=performance.now(); } }

async function setStill(k){ const im=await poster(k); still.src=im.src; try{ await still.decode(); }catch(e){} }

// один шаг: проиграть ролик сегмента from→to (соседние сцены)
function step(from,to,rate,isLast){ return new Promise(res=>{
  const seg=Math.min(from,to), dir=to>from?'f':'r', v=vids[vi]; vi^=1;
  poster(to);
  v.playbackRate=rate; v.src=blobs[seg+dir]||url(seg,dir); v.currentTime=0;
  let shown=false, done=false;
  const watch=()=>{ if(done) return; if(v.duration&&isLast&&!shown&&v.currentTime/v.duration>.62){ shown=true; activate(to); } if(!v.paused||v.readyState<2) requestAnimationFrame(watch); };
  v.onplaying=()=>{ v.classList.add('show'); requestAnimationFrame(watch); };
  v.onended=async()=>{ done=true; await setStill(to); requestAnimationFrame(()=>{ v.classList.remove('show'); }); if(isLast&&!shown) activate(to); res(); };
  v.onerror=async()=>{ done=true; await setStill(to); activate(to); res(); };
  const p=v.play(); if(p&&p.catch) p.catch(async()=>{ done=true; await setStill(to); activate(to); res(); });
}); }

async function goTo(k){ k=clamp(k,0,S-1); if(playing){ queue=k; return; } if(k===idx) return;
  activate(-1); const from=idx; idx=k; ui(k);
  if(reduce){ await setStill(k); activate(k); restSince=performance.now(); return; }
  playing=true; const dist=Math.abs(k-from), sgn=Math.sign(k-from), rate=dist===1?1:Math.min(3,1.4+dist*.3);
  for(let s=from; s!==k; s+=sgn) await step(s,s+sgn,rate,s+sgn===k);
  playing=null; restSince=performance.now(); preloadAround(k);
  if(queue!==null){ const q=queue; queue=null; if(q!==idx) goTo(q); } }

// ---------- ввод: один жест = одна сцена ----------
let lastWheel=0, gestureUsed=false;
addEventListener('wheel',e=>{ e.preventDefault(); const now=performance.now(); if(now-lastWheel>260) gestureUsed=false; lastWheel=now;
  if(gestureUsed||Math.abs(e.deltaY)<6) return; gestureUsed=true; goTo((queue??idx)+(e.deltaY>0?1:-1)); },{passive:false});
let ty=null;
addEventListener('touchstart',e=>{ ty=e.touches[0].clientY; },{passive:true});
addEventListener('touchmove',e=>{ if(e.target.closest('a,button')) return; e.preventDefault(); },{passive:false});
addEventListener('touchend',e=>{ if(ty===null) return; const dy=ty-e.changedTouches[0].clientY; ty=null; if(Math.abs(dy)>34) goTo(idx+(dy>0?1:-1)); });
addEventListener('keydown',e=>{ if(['ArrowDown','PageDown',' '].includes(e.key)){e.preventDefault();goTo(idx+1);} if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();goTo(idx-1);} if(e.key==='Home')goTo(0); if(e.key==='End')goTo(S-1); });
document.getElementById('next').addEventListener('click',()=>goTo(idx+1));
document.querySelector('[data-go="0"]').addEventListener('click',e=>{e.preventDefault();goTo(0);});

// ---------- цифры ----------
const counts=[...document.querySelectorAll('[data-count]')]; let cStart=0;
function countUp(){ cStart=performance.now()+500; }
function tickCounts(now){ if(!cStart) return; const t=easeOut(clamp((now-cStart)/1600)); counts.forEach(el=>el.textContent=Math.round(+el.dataset.count*t)+el.dataset.suf); }

// ---------- кейсы: вылетают из глубины по одному, по спирали ----------
const ring=document.getElementById('ring'), NC=18, cards=[]; let spiralStart=0;
for(let k=0;k<NC;k++){ const c=document.createElement('div'); c.className='card'; const im=document.createElement('img'); im.alt='Кейс клиента'; im.loading='lazy';
  im.src=`cases/c${String(k).padStart(2,'0')}.webp`; c.appendChild(im); ring.appendChild(c); cards.push(c); }
const GAP=.92, P=NC*GAP;
function tickSpiral(now){ if(!ring.classList.contains('on')) return; const m=MOBILE(), RX=innerWidth*(m?.16:.22), RY=innerHeight*(m?.1:.14);
  const T=(now-spiralStart)/1350+.15;
  cards.forEach((c,k)=>{ let u=T-k*GAP; if(u>P-.4) u=((u+.4)%P)-.4;
    const z=-1900+u*900, ang=u*1.05+k*.4, x=Math.cos(ang)*RX, y=Math.sin(ang)*RY;
    const op=Math.max(0,Math.min(clamp((u+.4)/.9),clamp((2.55-u)/.45)));
    c.style.opacity=op.toFixed(3); c.style.visibility=op>0?'visible':'hidden';
    c.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${(Math.sin(ang)*-14).toFixed(2)}deg)`; c.style.zIndex=String(1000+Math.round(z)); }); }

// ---------- плёнка: зерно и пыль ----------
const gc=document.getElementById('grain'), gx=gc.getContext('2d'); const dust=[];
function gsize(){ gc.width=Math.round(innerWidth/2); gc.height=Math.round(innerHeight/2); } gsize();
for(let i=0;i<60;i++) dust.push({x:Math.random(),y:Math.random(),r:.4+Math.random()*1.4,s:.00004+Math.random()*.0001,a:.12+Math.random()*.4,p:Math.random()*6});
const noise=document.createElement('canvas'); noise.width=noise.height=128; { const nx=noise.getContext('2d'), d=nx.createImageData(128,128);
  for(let i=0;i<d.data.length;i+=4){ const v=Math.random()*255; d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=10; } nx.putImageData(d,0,0); }
const pat=gx.createPattern(noise,'repeat');

// ---------- один цикл ----------
let last=performance.now();
function frame(now){ const dt=Math.min(64,now-last); last=now;
  // дыхание кадра в покое; во время ролика — плавно к 1
  const z=playing?1.012:1.012+.012*Math.sin((now-restSince)*.00035-1.57);
  if(!reduce) zoomEl.style.transform=`scale(${z.toFixed(5)})`;
  tickCounts(now); tickSpiral(now);
  if(!reduce){ gx.clearRect(0,0,gc.width,gc.height); gx.save(); gx.translate(-(Math.random()*128)|0,-(Math.random()*128)|0); gx.fillStyle=pat; gx.fillRect(0,0,gc.width+128,gc.height+128); gx.restore();
    for(const p of dust){ p.y-=p.s*dt; if(p.y<-.02){p.y=1.02;p.x=Math.random();} const tw2=.6+.4*Math.sin(now*.001+p.p);
      gx.beginPath(); gx.arc(p.x*gc.width+Math.sin(now*.0003+p.p)*6,p.y*gc.height,p.r,0,6.283); gx.fillStyle=`rgba(190,215,255,${(p.a*tw2).toFixed(3)})`; gx.fill(); } }
  requestAnimationFrame(frame); }

// ---------- старт ----------
const enter=document.getElementById('enter'), eBar=document.getElementById('enterBar'); const t0=performance.now(); let opened=false;
function open(){ if(opened) return; opened=true; setTimeout(()=>{ enter.classList.add('gone'); activate(0); },Math.max(0,1100-(performance.now()-t0))); }
addEventListener('resize',gsize);
ui(0);
setStill(0).then(()=>{ eBar.style.width='50%'; return want(0,'f'); }).then(()=>{ eBar.style.width='100%'; open(); preloadAround(0); });
for(let k=1;k<S;k++) setTimeout(()=>poster(k),1500+k*200);
setTimeout(open,8000); requestAnimationFrame(frame);
window.__goTo=goTo; window.__state=()=>({idx,playing:!!playing});
})();
