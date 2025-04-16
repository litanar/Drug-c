const CACHE_NAME = 'my-pwa-cache-v' + new Date().getTime(); // نام کش منحصر به فرد
const ASSETS = [
  '/',
  '/index.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json'
  // سایر فایل‌های مورد نیاز
];

// نصب سرویس ورکر
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()) // فعال شدن فوری
  );
});

// فعال سازی و حذف کش‌های قدیمی
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // کنترل تمام کلاینت‌ها
  );
});

// مدیریت درخواست‌های fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  // عدم کش کردن فایل سرویس ورکر
  if (event.request.url.includes('/sw.js')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // استفاده از کش یا دریافت از شبکه
        return cachedResponse || fetch(event.request)
          .then(response => {
            // کش کردن پاسخ‌های موفق
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
            }
            return response;
          })
          .catch(() => caches.match('/index.html')); // بازگشت به صفحه اصلی در صورت خطا
      })
  );
});

// دریافت پیام از صفحه برای رفرش
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
