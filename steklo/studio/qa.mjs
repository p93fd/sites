// Проверка: скриншоты середины каждой главы на компьютере и телефоне
import { chromium } from 'playwright'; import fs from 'node:fs';
const B=fs.readFileSync('studio/render.mjs','utf8').match(/executablePath: '([^']+)'/)[1];
const browser = await chromium.launch({ executablePath: B });
const W=[0,.09,.20,.32,.50,.58,.65,.75,.86,.92,1]; // границы глав по p
const CHW=[1.3,1.8,1.6,2.8,1.4,1.2,2.8,1.8,1.3,1.5]; const tot=CHW.reduce((a,b)=>a+b,0);
const targets=process.argv[3]?process.argv[3].split(',').map(Number):[.05,.15,.24,.30,.43,.53,.62,.70,.82,.89,.97];
function sFromP(p){ let acc=0; for(let k=0;k<10;k++){ if(p<=W[k+1]) return acc+CHW[k]/tot*((p-W[k])/(W[k+1]-W[k])); acc+=CHW[k]/tot; } return 1; }
for (const [name,vw,vh] of (process.argv[2]==='m'?[['m',390,844]]:process.argv[2]==='d'?[['d',1440,900]]:[['d',1440,900],['m',390,844]])) {
  const page = await browser.newPage({ viewport: { width: vw, height: vh } });
  const errs=[]; page.on('pageerror',e=>errs.push(e.message)); page.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await page.goto('http://localhost:8765/site/index.html'); await page.waitForTimeout(2500);
  for (const p of targets) {
    await page.evaluate(s=>{ const max=document.documentElement.scrollHeight-innerHeight; scrollTo(0,s*max); }, sFromP(p));
    await page.waitForTimeout(2600);
    await page.screenshot({ path: `qa/shot_${name}_${String(Math.round(p*100)).padStart(3,'0')}.png` });
  }
  const ov=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  console.log(name,'errors:',errs.slice(0,5),'hscroll:',ov);
  await page.close();
}
await browser.close();
