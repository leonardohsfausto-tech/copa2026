const CACHE_NAME = 'copa2026-pwa-cache-v2';
const urlsToCache = [
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Usamos catch para evitar parar a instalação se algum recurso falhar (como os ícones)
        return cache.addAll(urlsToCache).catch(err => console.log('Alguns recursos falharam ao cachear:', err));
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Ignorar requisições que não sejam GET (como mutations do Convex, autenticação do Clerk, etc.)
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorar requisições de navegação para evitar qualquer problema de redirecionamento ou páginas HTML desatualizadas
  if (event.request.mode === 'navigate') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna o recurso do cache
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Deleta o cache antigo (ex: v1 que continha o redirecionamento quebrado)
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/'
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  const urlToOpen = event.notification.data.url || '/';
  event.waitUntil(clients.openWindow(urlToOpen))
})
