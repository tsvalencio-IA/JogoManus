const CACHE_NAME = 'thiaguinho-arcade-v1';
const ASSETS = [
  './',
  './index.html',
  './drive.html',
  './run.html',
  './dance.html',
  './css/style.css',
  './js/modules/camera.js',
  './js/modules/ia.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
