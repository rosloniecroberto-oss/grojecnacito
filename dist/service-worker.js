const CACHE_NAME = 'grojec-cito-v4-fresh-2026-02-14';
const urlsToCache = [
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NIE cache'uj Supabase API
  if (url.hostname.includes('supabase')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // NIE cache'uj bundle'ów JS/CSS (zawsze pobieraj świeże)
  if (url.pathname.includes('/assets/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // NIE cache'uj index.html (zawsze świeży)
  if (url.pathname === '/' || url.pathname.includes('index.html')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Tylko manifest.json z cache
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});
