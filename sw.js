const CACHE_NAME = 'MedMate-v2';  // تغییر نام کش برای اعمال تغییرات
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',  // اضافه کردن manifest.json به لیست کش
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/sw.js'  // اضافه کردن خود فایل سرویس ورکر
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();  // فعال کردن سریع سرویس ورکر جدید
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache');
            return caches.delete(cache);  // حذف کش های قدیمی
          }
        })
      );
    })
  );
  self.clients.claim();  // تسلط سریع بر کلیه کلاینت ها
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Fallback برای صفحاتی که کش نشده اند
        return caches.match('/index.html');
      });
    })
  );
});
