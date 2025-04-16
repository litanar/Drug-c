const CACHE_VERSION = 'v1.0.0'; // با هر آپدیت این مقدار را تغییر دهید
const CACHE_NAME = `app-${CACHE_VERSION}`;

// نصب و کش کردن فایل‌ها
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js'
      ]))
      .then(() => {
        console.log('نسخه جدید نصب شد:', CACHE_VERSION);
        self.skipWaiting(); // فعال‌سازی فوری
      })
  );
});

// فعال‌سازی و پاک‌سازی کش قدیمی
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
    }).then(() => {
      // ارسال پیام به همه تبهای باز
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'NEW_VERSION_AVAILABLE',
            version: CACHE_VERSION
          });
        });
      });
    })
  );
});
