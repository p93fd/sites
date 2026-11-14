const BASE=new URL('./',self.location).pathname;
const VERSION='10.6';
const CACHE='che-interface-approved-theme-20261113-v108';
const OCR_CACHE='che-ocr-v7';
const OCR_PATH=BASE+'vendor/ocr/';
const SHELL=new Set([
  BASE+'',BASE+'index.html',BASE+'design-v5.css',BASE+'design-v6.css',BASE+'design-v7.css',BASE+'design-v8.css',
  BASE+'reference-design.css',BASE+'che-theme.css',BASE+'update-check.js',BASE+'app-version.json',
  BASE+'refresh.html',BASE+'refresh.js',BASE+'auth.js',BASE+'secure-vault.js',BASE+'che-motion.js',BASE+'assets/finance-ribbons.svg',
  BASE+'assets/icon-192.png',BASE+'assets/icon-512.png',BASE+'manifest.webmanifest'
]);

self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(Array.from(SHELL,path=>new Request(path,{cache:'reload'})));
  await self.skipWaiting();
})()));

self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const ocr=await caches.open(OCR_CACHE);
  const keys=await caches.keys();
  for(const key of keys){
    if(!key.startsWith('che-interface-')||key===CACHE)continue;
    const old=await caches.open(key);
    const models=(await old.keys()).filter(req=>new URL(req.url).pathname.startsWith(OCR_PATH));
    // Preserve offline OCR for existing installations before retiring their shell.
    try{
      for(const req of models){
        if(await ocr.match(req))continue;
        const response=await old.match(req);
        if(response)await ocr.put(req,response);
        await old.delete(req);
      }
      await caches.delete(key);
    }catch{
      // Keep the old cache available if storage is full during migration.
    }
  }
  await self.clients.claim();
})()));

async function serve(req,cacheName,cacheFirst,cacheable){
  const cache=await caches.open(cacheName);
  const cached=()=>cache.match(req,{ignoreSearch:cacheName===CACHE});
  if(cacheFirst){
    const hit=await cached();
    if(hit)return hit;
    if(cacheName===OCR_CACHE){
      const old=await caches.match(req);
      if(old)return old;
    }
  }
  try{
    const response=await fetch(req);
    if(response.ok&&cacheable)await cache.put(req,response.clone()).catch(()=>{});
    return response;
  }catch{
    return await cached()||new Response('Нет соединения. Открой приложение после восстановления сети.',{
      status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}
    });
  }
}

self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith(BASE+'api/'))return;
  if(url.pathname.startsWith(OCR_PATH)){
    event.respondWith(serve(req,OCR_CACHE,true,true));
    return;
  }
  const version=url.searchParams.get('v');
  const versionedAsset=req.mode!=='navigate'&&version===VERSION&&/\.(css|js)$/.test(url.pathname);
  const shellAsset=SHELL.has(url.pathname);
  event.respondWith(serve(req,CACHE,shellAsset&&versionedAsset,shellAsset&&!versionedAsset&&!version));
});

