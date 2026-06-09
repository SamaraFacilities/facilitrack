// ═══════════════════════════════════════════════════════════════
// SAMARA FACILITIES — Service Worker v3
// Fusión del sw.js original con background sync de Supabase
// ════════════════════════════════════════════════════════════

const CACHE_NAME  = 'samara-v3';
const OFFLINE_URL = '/index.html';
const SUPA_URL    = 'https://knzelkthjzdtlghaizmr.supabase.co';
const SUPA_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuemVsa3RoanpkdGxnaGFpem1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjY2NTQsImV4cCI6MjA5NDM0MjY1NH0.xL1cAwZ4kQ-u1bILLm-WMR-5j-PH_MJ8aVjBRCuhi6k';

const PRECACHE_ASSETS = ['/', '/index.html', '/icon-192.png', '/icon-512.png'];

// ── INSTALL ──────────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing v3...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(PRECACHE_ASSETS.map(url => cache.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating v3...');
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH: network-first para navegación, cache-first para assets ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.hostname.includes('supabase.co')) return; // nunca cachear Supabase
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          caches.open(CACHE_NAME).then(c => c.put(request, resp.clone()));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});

// ── PUSH: notificación recibida del servidor ──────────────────
self.addEventListener('push', event => {
  console.log('[SW] Push received');
  let data = { title: 'Samara Facilities', body: 'Nueva notificación' };
  try { if (event.data) data = { ...data, ...event.data.json() }; }
  catch (_) { if (event.data) data.body = event.data.text(); }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:               data.body,
      icon:               '/icon-192.png',
      badge:              '/icon-192.png',
      tag:                data.tag || 'samara',
      vibrate:            data.urgent ? [300,100,300,100,300] : [200,100,200],
      requireInteraction: data.urgent || false,
      data,
    })
  );
});

// ── NOTIFICATION CLICK ────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

// ── BACKGROUND SYNC ───────────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'samara-check-ots') {
    event.waitUntil(checkNuevasOTs());
  }
});

self.addEventListener('periodicsync', event => {
  if (event.tag === 'samara-check-ots') {
    event.waitUntil(checkNuevasOTs());
  }
});

// ── MENSAJES DESDE LA APP ─────────────────────────────────────
self.addEventListener('message', async event => {
  const data = event.data;
  if (!data) return;

  if (data === 'SKIP_WAITING' || data.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }
  if (data === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_NAME });
    return;
  }

  // La app nos da el contexto del usuario al hacer login
  if (data.type === 'INIT_USER') {
    await saveCtx({
      userId:    data.userId,
      rol:       data.rol,
      zona:      data.zona || null,
      lastCheck: data.lastCheck || new Date().toISOString(),
    });
    console.log('[SW] Contexto guardado:', data.rol);
    return;
  }

  // La app nos reenvía una notificación para mostrar si está en background
  if (data.type === 'IN_APP_NOTIF') {
    // Solo mostrar push nativa si la app NO está en primer plano
    const list = await clients.matchAll({ type: 'window' });
    const appVisible = list.some(c => !c.hidden);
    if (!appVisible) {
      self.registration.showNotification(data.title || 'Samara Facilities', {
        body:               data.body || '',
        icon:               '/icon-192.png',
        badge:              '/icon-192.png',
        tag:                data.tag  || 'samara-notif',
        vibrate:            data.urgent ? [300,100,300,100,300] : [200,100,200],
        requireInteraction: data.urgent || false,
      });
    }
    return;
  }
});

// ── CONSULTAR SUPABASE POR OTs NUEVAS ────────────────────────
async function checkNuevasOTs() {
  try {
    const ctx = await getCtx();
    if (!ctx?.userId) return;

    const since = ctx.lastCheck || new Date(Date.now() - 60000).toISOString();

    const resp = await fetch(
      `${SUPA_URL}/rest/v1/ordenes_trabajo?created_at=gt.${encodeURIComponent(since)}&order=created_at.asc&limit=10&select=id,equipo_nombre,tipo,prioridad,tecnico_id,created_at`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
    );
    if (!resp.ok) return;

    const ots = await resp.json();
    if (!ots?.length) return;

    for (const ot of ots) {
      const urg     = ot.prioridad === 'Urgente';
      const esMia   = ot.tecnico_id === ctx.userId;
      const sinAsig = !ot.tecnico_id;
      let title, body;

      if (['admin','gerencia','supervisor'].includes(ctx.rol)) {
        title = urg ? '🔴 OT Urgente — Samara' : '📋 Nueva OT — Samara';
        body  = `${ot.equipo_nombre||'Equipo'} · ${ot.tipo||''} · ${ot.prioridad||''}`;
      } else if (ctx.rol === 'tecnico' || ctx.rol === 'supervisor_zona') {
        if (!esMia && !sinAsig) continue;
        title = urg ? '🔴 OT Urgente — Samara' : '📋 Nueva OT — Samara';
        body  = `${ot.equipo_nombre||'Equipo'} · ${ot.tipo||''}` +
                (esMia   ? ' — asignada a ti ✓' :
                 sinAsig ? ' — sin asignar, puedes tomarla' : '');
      } else continue;

      await self.registration.showNotification(title, {
        body,
        icon:               '/icon-192.png',
        badge:              '/icon-192.png',
        tag:                'ot-' + ot.id,
        vibrate:            urg ? [300,100,300,100,300] : [200,100,200],
        requireInteraction: urg,
        data:               { otId: ot.id },
      });
    }

    // Actualizar lastCheck al más reciente
    const latest = ots[ots.length - 1].created_at;
    await saveCtx({ ...ctx, lastCheck: latest });

    // Avisar a la app (si está abierta) para que recargue
    const list = await clients.matchAll({ type: 'window' });
    list.forEach(c => c.postMessage({ type: 'NEW_OTS', count: ots.length }));

  } catch (err) {
    console.warn('[SW] checkNuevasOTs error:', err);
  }
}

// ── IndexedDB: guardar/leer contexto del usuario ──────────────
function openDB() {
  return new Promise((res, rej) => {
    const req = indexedDB.open('samara-sw', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('ctx', { keyPath: 'k' });
    req.onsuccess  = e => res(e.target.result);
    req.onerror    = e => rej(e.target.error);
  });
}

async function saveCtx(data) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('ctx', 'readwrite');
    tx.objectStore('ctx').put({ k: 'user', ...data });
    tx.oncomplete = res; tx.onerror = rej;
  });
}

async function getCtx() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const req = db.transaction('ctx', 'readonly').objectStore('ctx').get('user');
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });
}
concurrency:
  group: "pages"
  cancel-in-progress: false  # ← esto evita el error de cancelación
