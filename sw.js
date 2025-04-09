const CACHE_NAME = 'medmate-cache-v2' + (new Date()).toISOString().replace(/\D/g,'').slice(0,12);
const ASSETS = [
  '/',
  '/index.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json'
  // سایر فایل‌های استاتیک
];

// نصب و کش کردن
self.addEventListener('install', (event) => {
  self.skipWaiting(); // فعال‌سازی فوری
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

// فعال‌سازی و پاک‌سازی کش قدیم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheName.startsWith('medmate-cache-v')) return caches.delete(cacheName);
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim(); // کنترل فوری کلاینت‌ها
});

// استراتژی fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // برای فایل‌های دینامیک از شبکه بگیر
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('sw.js') || 
      event.request.url.includes('version=')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetchAndCache(event.request))
      .catch(() => caches.match('/index.html'))
  );
});

// تابع کمکی برای کش کردن پاسخ‌های شبکه
function fetchAndCache(request) {
  return fetch(request).then(response => {
    if (response && response.status === 200) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
    }
    return response;
  });
}
