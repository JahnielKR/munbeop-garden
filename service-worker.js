// 문법Garden Service Worker
// v2 — Mejor manejo de actualizaciones

const CACHE_NAME = 'munbeop-garden-v2-21';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './favicon-16.png',
  './splash-1170x2532.png',
  './splash-1284x2778.png',
  './splash-1179x2556.png',
  './splash-1290x2796.png',
  './splash-828x1792.png',
  './splash-1125x2436.png',
  './splash-750x1334.png',
  './splash-640x1136.png'
];

// Al instalar: cachear assets y activar inmediatamente (skipWaiting)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Al activar: limpiar caches antiguos y tomar control de todos los clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME)
             .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Al hacer fetch: network-first para HTML (para recibir actualizaciones)
// cache-first para assets estáticos (iconos, manifest)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === 'navigate' ||
                       url.pathname.endsWith('.html') ||
                       url.pathname === '/' ||
                       url.pathname.endsWith('/');

  if (isNavigation) {
    // Network-first para navegación (HTML) — siempre busca la última versión
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
        }
        return response;
      }).catch(() => {
        // Si falla red, intenta cache
        return caches.match(event.request).then(cached => cached || caches.match('./index.html'));
      })
    );
  } else {
    // Cache-first para assets estáticos (iconos, manifest)
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok && event.request.url.startsWith(self.location.origin)) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          }
          return response;
        });
      })
    );
  }
});

// Mensaje para forzar skipWaiting (desde el client)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
