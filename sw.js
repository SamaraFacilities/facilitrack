// Samara Facilities — Service Worker v1.0
// Provides: offline cache, background sync, push notifications

const CACHE_NAME = 'samara-v1';
const OFFLINE_URL = '/index.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-512.png',
];

// ── INSTALL: Cache core assets ──
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache what we can, ignore failures
      return Promise.allSettled(
        PRECACHE_ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: Clean old caches ──
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Network-first for API, Cache-first for assets ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip Supabase API calls (always go to network)
  if(url.hostname.includes('supabase.co')) return;

  // Skip non-GET requests
  if(request.method !== 'GET') return;

  // For HTML navigation: network-first with offline fallback
  if(request.mode === 'navigate'){
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // For other assets: cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if(cached) return cached;
      return fetch(request).then(response => {
        // Cache successful responses
        if(response && response.status === 200 && response.type === 'basic'){
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => cached);
    })
  );
});

// ── PUSH: Handle push notifications ──
self.addEventListener('push', event => {
  console.log('[SW] Push received');
  let data = { title: 'Samara', body: 'Nueva notificación', icon: '/icon-192.png' };
  
  try {
    if(event.data) data = { ...data, ...event.data.json() };
  } catch(e) {
    if(event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: '/icon-96.png',
    tag: data.tag || 'samara',
    data: data,
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── NOTIFICATION CLICK ──
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.action);
  event.notification.close();

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // If app is already open, focus it
        for(const client of clientList){
          if(client.url.includes(self.location.origin) && 'focus' in client){
            return client.focus();
          }
        }
        // Otherwise open new window
        if(clients.openWindow){
          return clients.openWindow('/');
        }
      })
  );
});

// ── BACKGROUND SYNC ──
self.addEventListener('sync', event => {
  if(event.tag === 'sync-ots'){
    console.log('[SW] Background sync: OTs');
    // Could sync pending offline changes here
  }
});

// ── MESSAGE: From page to SW ──
self.addEventListener('message', event => {
  if(event.data === 'SKIP_WAITING'){
    self.skipWaiting();
  }
  if(event.data === 'GET_VERSION'){
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
