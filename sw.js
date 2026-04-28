const CACHE_NAME = 'uniqality-hub-v3'; // Incrementar versión
const ASSETS_CACHE = 'uniqality-hub-assets-v3';

const urlsToCache = [
  '/uniqality-hub/',
  '/uniqality-hub/index.html',
  '/uniqality-hub/style.css',
  '/uniqality-hub/app.js',
  '/uniqality-hub/manifest.json',
  'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
];

// Instalación
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalándose...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('💾 Cacheando archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✓ Cache completado');
        return self.skipWaiting();
      })
  );
});

// Activación - Limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activándose...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('Caches encontrados:', cacheNames);
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== ASSETS_CACHE) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✓ Cache limpiado');
      return self.clients.claim();
    })
  );
});

// Fetch - Network First
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear GET
  if (request.method !== 'GET') {
    return;
  }

  // Excluir ciertos dominios (corregido el nombre de usuario de GitHub sin espacios)
  if (url.hostname !== 'localhost' && url.hostname !== 'marcosguerreromateos.github.io' && !request.url.includes('uniqality-hub')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseToCache = response.clone();
        const cacheName = request.destination === 'document' ? CACHE_NAME : ASSETS_CACHE;

        caches.open(cacheName)
          .then((cache) => {
            cache.put(request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // Usar cache si hay error
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Página offline
            if (request.destination === 'document') {
              return new Response(
                '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="background:#05070a;color:#00ff99;text-align:center;padding:50px;font-family:monospace;height:100vh;display:flex;flex-direction:column;justify-content:center"><h1>⚠ OFFLINE</h1><p>No tienes conexión a internet</p><p style="font-size:12px;margin-top:20px">La aplicación se cargará cuando reconectes</p></body></html>',
                { 
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'text/html' } 
                }
              );
            }
          });
      })
  );
});

// Escuchar mensajes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
