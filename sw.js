const CACHE_NAME = 'my-pwa-cache-v53'; // نسخه را دستی افزایش دهید
const ASSETS = [
  '/',
  '/index.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json'
  // فایل‌های دیگر...
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching assets in:', CACHE_NAME);
        return cache.addAll(ASSETS);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // عدم کش کردن درخواست‌های sw.js
  if (event.request.url.includes('/sw.js')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        return cachedResponse || fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
            }
            return networkResponse;
          })
          .catch(() => caches.match('/index.html'));
      })
  );
});
