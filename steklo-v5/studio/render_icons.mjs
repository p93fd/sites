import { chromium } from 'playwright'; import fs from 'node:fs';
const B=fs.readFileSync('studio/render.mjs','utf8').match(/executablePath: '([^']+)'/)[1];
const browser=await chromium.launch({executablePath:B,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:640,height:640}}); page.on('pageerror',e=>console.log('ERR',e.message));
await page.goto('http://localhost:8765/studio/icons.html'); await page.waitForFunction(()=>window.__ready);
fs.mkdirSync('site5',{recursive:true});
for(const k of [0,1,2]){ const d=await page.evaluate(k=>window.renderIcon(k),k); fs.writeFileSync(`qa/icon${k}.png`,Buffer.from(d.split(',')[1],'base64')); }
await browser.close();
