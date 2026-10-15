// Офлайн-кэш. Своё — сразу, распознавание — при первом обращении. Никаких запросов наружу.
const V = 'dengi-v2';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'vendor/tesseract.min.js', 'fonts/cg-cyrillic-600.woff2', 'fonts/cg-cyrillic-700.woff2', 'fonts/cg-latin-600.woff2', 'fonts/cg-latin-700.woff2'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const vendor = u.pathname.includes('/vendor/');
  e.respondWith(
    vendor
      // тяжёлые файлы распознавания: из кэша, а если нет — скачать и положить
      ? caches.match(e.request).then(r => r || fetch(e.request).then(res => {
          if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(e.request, cp)); }
          return res;
        }))
      // своё: сначала сеть (чтобы обновления доходили), без сети — кэш
      : fetch(e.request).then(res => {
          if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(e.request, cp)); }
          return res;
        }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
