const APP_VERSION = 'v2.0.0'; // حتما با هر تغییر این نسخه را عوض کنید

self.addEventListener('install', (event) => {
  self.skipWaiting(); // فعالسازی فوری
  console.log('نصب نسخه:', APP_VERSION);
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.matchAll({includeUncontrolled: true}).then((clients) => {
      clients.forEach(client => {
        client.postMessage({
          type: 'APP_UPDATED',
          version: APP_VERSION
        });
      });
    })
  );
});
