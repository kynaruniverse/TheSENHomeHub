/* ============================================================
   THE SEN HOME HUB — Service Worker (PWA offline support)
   ============================================================ */

const CACHE = 'shh-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/children/index.html',
  '/children/phonics.html',
  '/children/maths.html',
  '/children/feelings.html',
  '/children/spelling.html',
  '/children/games.html',
  '/children/fidget.html',
  '/parent/resources.html',
  '/parent/printables.html',
  '/parent/ehcp.html',
  '/parent/sen-types.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
      return cached || network;
    })
  );
});
