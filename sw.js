// ═══════════════════════════════════════════════════════════════
// SAMARA FACILITIES — Service Worker v4
// Background sync para iOS PWA
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'samara-v4';
const SUPA_URL   = 'https://knzelkthjzdtlghaizmr.supabase.co';
const SUPA_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuemVsa3RoanpkdGxnaGFpem1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjY2NTQsImV4cCI6MjA5NDM0MjY1NH0.xL1cAwZ4kQ-u1bILLm-WMR-5j-PH_MJ8aVjBRCuhi6k';
const PRECACHE   = ['/', '/index.html', '/icon-192.png', '/icon-512.png'];

// ── INSTALL ──────────────────────────────────────────────────
self.addEventListener('install', e => {
  console.log('[SW] install v4');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => Promise.allSettled(PRECACHE.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener('activate', e => {
  console.log('[SW] activate v4');
  e.waitUntil(
    caches.keys()
      .then(ns => Promise.all(
        ns.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

concurrency:
  group: "pages"
  cancel-in-progress: false  # ← esto evita el error de cancelación
// ── FETCH ─────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // No interceptar Supabase ni otros servicios externos
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('jsdelivr') ||
      url.hostname.includes('cdnjs') ||
      url.hostname.includes('unpkg')) return;
  if (e.request.method !== 'GET') return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp?.status === 200 && resp.type === 'basic') {
          caches.open(CACHE_NAME).then(c => c.put(e.request, resp.clone()));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});

// ── PUSH desde servidor ───────────────────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return;
  let d = { title: 'Samara', body: 'Nueva notificación' };
  try { d = { ...d, ...e.data.json() }; } catch (_) { d.body = e.data.text(); }
  e.waitUntil(mostrarNotif(d.title, d.body, d));
});

// ── NOTIFICATION CLICK ────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // Si la app ya está abierta, enfocarla
      const appClient = list.find(c => c.url.includes(self.location.origin));
      if (appClient) return appClient.focus();
      return clients.openWindow ? clients.openWindow('/') : null;
    })
  );
});

// ── PERIODIC SYNC (Chrome/Android) ───────────────────────────
self.addEventListener('periodicsync', e => {
  if (e.tag === 'samara-bg-check') e.waitUntil(bgCheck());
});

// ── SYNC (Background Sync API) ───────────────────────────────
self.addEventListener('sync', e => {
  if (e.tag === 'samara-bg-check') e.waitUntil(bgCheck());
});

// ── MENSAJES DESDE LA APP ─────────────────────────────────────
self.addEventListener('message', async e => {
  const d = e.data;
  if (!d) return;

  if (d === 'SKIP_WAITING' || d.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  // Contexto del usuario para saber qué notificar en background
  if (d.type === 'INIT_USER') {
    await saveCtx({
      userId:    d.userId,
      rol:       d.rol,
      zona:      d.zona || null,
      lastCheck: d.lastCheck || new Date().toISOString(),
    });
    console.log('[SW] contexto guardado:', d.rol);
    // Hacer check inmediato
    await bgCheck();
    return;
  }

  // La app está en primer plano y quiere que mostremos una notif del SO
  if (d.type === 'SHOW_NOTIF') {
    await mostrarNotif(d.title, d.body, d);
    return;
  }
});

// ── LÓGICA DE BACKGROUND CHECK ────────────────────────────────
async function bgCheck() {
  try {
    const ctx = await getCtx();
    if (!ctx?.userId || !ctx?.rol) return;

    const since = ctx.lastCheck || new Date(Date.now() - 30000).toISOString();

    const resp = await fetch(
      `${SUPA_URL}/rest/v1/ordenes_trabajo` +
      `?created_at=gt.${encodeURIComponent(since)}` +
      `&order=created_at.asc&limit=10` +
      `&select=id,equipo_nombre,tipo,prioridad,tecnico_id,created_at`,
      {
        headers: {
          'apikey':        SUPA_KEY,
          'Authorization': `Bearer ${SUPA_KEY}`,
          'Content-Type':  'application/json',
        }
      }
    );

    if (!resp.ok) return;
    const ots = await resp.json();
    if (!ots?.length) return;

    let latest = ctx.lastCheck;

    for (const ot of ots) {
      const urg    = ot.prioridad === 'Urgente';
      const esMia  = String(ot.tecnico_id) === String(ctx.userId);
      const sinAsg = !ot.tecnico_id;

      let title, body;

      if (['admin', 'gerencia', 'supervisor'].includes(ctx.rol)) {
        title = urg ? '🔴 OT Urgente — Samara' : '📋 Nueva OT — Samara';
        body  = `${ot.equipo_nombre || 'Equipo'} · ${ot.tipo || ''} · ${ot.prioridad || ''}`;
      } else if (ctx.rol === 'tecnico' || ctx.rol === 'supervisor_zona') {
        if (!esMia && !sinAsg) {
          if (ot.created_at > latest) latest = ot.created_at;
          continue;
        }
        title = urg ? '🔴 OT Urgente — Samara' : '📋 Nueva OT — Samara';
        body  = `${ot.equipo_nombre || 'Equipo'} · ${ot.tipo || ''}` +
                (esMia ? ' — asignada a ti ✓' : ' — sin asignar, puedes tomarla');
      } else {
        continue;
      }

      await mostrarNotif(title, body, { tag: 'ot-' + ot.id, urgent: urg });
      if (ot.created_at > latest) latest = ot.created_at;
    }

    // Actualizar el timestamp al más reciente procesado
    await saveCtx({ ...ctx, lastCheck: latest });

    // Avisar a la app si está abierta para que recargue datos
    const list = await clients.matchAll({ type: 'window' });
    if (list.length > 0) {
      list.forEach(c => c.postMessage({ type: 'NEW_OTS', count: ots.length }));
    }

  } catch (err) {
    console.warn('[SW] bgCheck error:', err.message);
  }
}

// ── Mostrar notificación nativa ───────────────────────────────
async function mostrarNotif(title, body, data = {}) {
  if (Notification.permission !== 'granted') return;
  return self.registration.showNotification(title, {
    body,
    icon:               '/icon-192.png',
    badge:              '/icon-192.png',
    tag:                data.tag  || 'samara',
    vibrate:            data.urgent ? [300, 100, 300, 100, 300] : [200, 100, 200],
    requireInteraction: !!data.urgent,
    data,
  });
}

// ── IndexedDB: persistir contexto entre activaciones del SW ───
function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('samara-sw', 1);
    r.onupgradeneeded = e => e.target.result.createObjectStore('ctx', { keyPath: 'k' });
    r.onsuccess = e => res(e.target.result);
    r.onerror   = e => rej(e.target.error);
  });
}

async function saveCtx(data) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction('ctx', 'readwrite');
    tx.objectStore('ctx').put({ k: 'user', ...data });
    tx.oncomplete = res;
    tx.onerror    = rej;
  });
}

async function getCtx() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const req = db.transaction('ctx', 'readonly')
                  .objectStore('ctx').get('user');
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });
}
