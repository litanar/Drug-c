const CACHE_NAME = 'my-pwa-cache-' + new Date().getTime(); // استفاده از timestamp برای نام منحصر به فرد
const ASSETS = [
  '/',
  '/index.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json',
  '/styles.css',
  '/app.js'
];

// نصب و کش کردن منابع
self.addEventListener('install', (event) => {
  self.skipWaiting(); // فعال سازی فوری سرویس ورکر جدید
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching essential files with new cache:', CACHE_NAME);
        return cache.addAll(ASSETS);
      })
      .catch(err => console.error('Caching failed:', err))
  );
});

// فعال سازی و حذف کش های قدیمی
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // حذف تمام کش های قدیمی
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // اطمینان از کنترل فوری کلاینت ها
      self.clients.claim(),
      // اطلاع به کلاینت ها برای ریلود
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage('SW_UPDATED'));
      })
    ])
  );
});

// مدیریت درخواست ها
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // جلوگیری از کش کردن درخواست های sw.js و پارامترهای version
  if (event.request.url.includes('/sw.js') || event.request.url.includes('version=')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // اگر پاسخ در کش بود برگردان
        if (cachedResponse) return cachedResponse;
        
        // در غیر این صورت از شبکه بگیر و کش کن
        return fetch(event.request)
          .then(networkResponse => {
            // فقط پاسخ های معتبر را کش می کنیم
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
            
            return networkResponse;
          })
          .catch(() => {
            // اگر آفلاین هستیم صفحه اصلی را نشان بده
            return caches.match('/index.html');
          });
      })
  );
});

// دریافت پیام برای بروزرسانی
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
