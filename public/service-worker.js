// Nombre del caché: se incrementa la versión al actualizar assets
const CACHE = 'sabores-ancestrales-v1';
// Assets precargados durante la instalación del Service Worker
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/imagenes/Logo.jpg',
  '/imagenes/hero.webp',
  '/404.html',
  '/manifest.json'
];

// Instalación: precarga los assets estáticos en el caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

// Activación: limpia versiones anteriores del caché y toma control de las páginas abiertas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// Intercepción de peticiones: cachea respuestas exitosas, sirve desde caché si está disponible
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const isLocal = request.url.startsWith(self.location.origin);

  // Ignorar peticiones a orígenes externos (Google Fonts, CDNs)
  if (!isLocal) return;

  // Ignorar peticiones a la API y subida de archivos
  if (request.url.includes('/api/') || request.url.includes('/uploads/')) return;

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(request, clone));
      }
      return response;
    })).catch(() => {
      // Fallback offline: mostrar página 404 si es navegación
      if (request.mode === 'navigate') return caches.match('/404.html');
      return new Response('', { status: 408 });
    })
  );
});
