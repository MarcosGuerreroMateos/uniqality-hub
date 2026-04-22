const CACHE_NAME = 'uniqality-v2'; // Cambia esto a v3, v4, etc., cuando hagas grandes cambios
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo.png' // Asegúrate de que este sea el nombre real de tu logo
];

// Instalar y guardar en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activar y borrar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar peticiones (Fetch)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si hay internet y la respuesta es válida, actualizamos la caché
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // Si no hay internet, devolvemos lo que hay en la caché
        return caches.match(event.request);
      })
  );
});
