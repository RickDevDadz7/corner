// Service worker: app funciona offline. Mude VERSION a cada publicação.
const VERSION = 'ronin-v3.35.0';
const FILES = ['./', 'index.html', 'styles.css', 'manifest.webmanifest', 'js/app.js', 'js/calc.js', 'js/data.js', 'js/sports.js', 'js/techniques.js', 'js/cloud.js', 'js/sync.js', 'js/rig.js', 'js/scan.js', 'js/menu.js', 'js/routine.js', 'js/exanim.js', 'js/periodize.js', 'js/health.js', 'js/spine.js', 'js/schedule.js', 'js/tour.js', 'js/theme.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // API da IA passa direto
  e.respondWith(
    // no-cache: sempre confere com o servidor (ETag), então versão nova chega na hora, sem esperar o cache de 10 min do GitHub Pages
    (e.request.mode === 'navigate' ? fetch(e.request.url, { cache: 'no-cache' }) : fetch(e.request, { cache: 'no-cache' })).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
