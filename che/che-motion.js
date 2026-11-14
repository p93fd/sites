/* ЧЕ 10.7 — живой фон «жидкое стекло».
 * Наклон телефона двигает и переливает свет за интерфейсом.
 * Без наклона (компьютер, отказ в доступе) фон медленно плывёт сам.
 * Двигаем только положение слоёв, без пересчёта вёрстки.
 */
(()=>{
'use strict';
const root=document.getElementById('cheLiquid');
if(!root)return;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
let tx=0,ty=0,x=0,y=0,raf=0,live=false,last=performance.now();
function frame(now){
  raf=0;
  // Пружина: значение догоняет руку на 7% за кадр, без рывков.
  x+=(tx-x)*.07;y+=(ty-y)*.07;
  if(!live){const t=now/1000;tx=Math.sin(t*.21)*.55;ty=Math.cos(t*.17)*.45;}
  root.style.setProperty('--lx',x.toFixed(3));
  root.style.setProperty('--ly',y.toFixed(3));
  if(!document.hidden&&!reduce.matches)raf=requestAnimationFrame(frame);
}
function start(){if(!raf&&!reduce.matches)raf=requestAnimationFrame(frame);}
function onTilt(e){
  if(e.gamma==null||e.beta==null)return;
  live=true;
  // Наклон влево-вправо и вперёд-назад, в пределах ±1.
  tx=Math.max(-1,Math.min(1,e.gamma/28));
  ty=Math.max(-1,Math.min(1,(e.beta-45)/28));
  start();
}
function listen(){window.addEventListener('deviceorientation',onTilt,{passive:true});}
const D=window.DeviceOrientationEvent;
if(D&&typeof D.requestPermission==='function'){
  // iPhone даёт доступ к наклону только после касания. Спрашиваем на первом же касании.
  let asked=false;
  try{if(localStorage.getItem('che-tilt')==='granted')listen();}catch{}
  const locked=()=>{const a=document.getElementById('lockGate'),b=document.getElementById('cheVaultGate');return (a&&!a.hidden)||(b&&!b.hidden)||document.querySelector('dialog[open]');};
  const ask=()=>{
    // Не мешаем окну Face ID: спрашиваем только когда приложение уже открыто.
    if(asked||locked())return;asked=true;
    document.removeEventListener('touchend',ask);document.removeEventListener('click',ask);
    D.requestPermission().then(r=>{try{localStorage.setItem('che-tilt',r);}catch{}if(r==='granted')listen();}).catch(()=>{});
  };
  document.addEventListener('touchend',ask,{passive:true});
  document.addEventListener('click',ask);
}else if(D){listen();}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)start();});
reduce.addEventListener?.('change',start);
start();
})();
