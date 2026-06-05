const CACHE = 'sabores-ancestrales-v3';
const STATIC_ASSETS = [
  '/css/style.css',
  '/js/app.js?v=3',
  '/imagenes/Logo.jpg',
  '/imagenes/hero.webp',
  '/offline.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;
  if (request.url.includes('/api/') || request.url.includes('/uploads/')) return;

  const isPage = request.mode === 'navigate' || request.headers.get('Accept')?.includes('text/html');

  if (isPage) {
    event.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(cache => cache.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match('/offline.html'))
    );
  } else {
    event.respondWith(
      caches.match(request)
        .then(cached => cached || fetch(request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(cache => cache.put(request, clone));
          }
          return res;
        }))
        .catch(() => new Response('', { status: 408 }))
    );
  }
});

self.addEventListener('push', event => {
  let data = { titulo: 'Sabores Ancestrales', cuerpo: '', url: '/' };
  try {
    if (event.data) data = JSON.parse(event.data.text());
  } catch {}
  event.waitUntil(
    self.registration.showNotification(data.titulo, {
      body: data.cuerpo,
      icon: '/imagenes/Logo.jpg',
      badge: '/imagenes/Logo.jpg',
      data: { url: data.url }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});