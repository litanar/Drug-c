// تنظیمات اصلی
const APP_NAME = 'MedMate'; // نام برنامه
const CACHE_VERSION = 'v3'; // نسخه کش
const CACHE_NAME = `${APP_NAME}-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/index.html';

// فایل‌های ضروری برای کش
const ESSENTIAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/sw.js',
  '/styles.css',
  '/app.js'
];

// نصب و کش کردن فایل‌ها
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching essential assets');
        return cache.addAll(ESSENTIAL_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting activated');
        return self.skipWaiting();
      })
  );
});

// فعال‌سازی و پاک‌سازی کش‌های قدیمی
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith(APP_NAME)) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// مدیریت درخواست‌ها
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // استراتژی Cache First با Fallback به شبکه
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        console.log(`[Service Worker] Serving from cache: ${request.url}`);
        return response;
      }
      
      console.log(`[Service Worker] Fetching from network: ${request.url}`);
      return fetch(request)
        .then((networkResponse) => {
          // فقط فایل‌های موفق و از نوع HTTP را کش کنید
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          // کلون پاسخ برای کش
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          
          return networkResponse;
        })
        .catch(() => {
          // Fallback برای حالت آفلاین
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match(OFFLINE_PAGE);
          }
        });
    })
  );
});

// به‌روزرسانی خودکار
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
