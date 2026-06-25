// ═══════════════════════════════════════════════════════════════
// SAMARA FACILITIES — Service Worker v5
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'samara-v5';
const SUPA_URL   = 'https://knzelkthjzdtlghaizmr.supabase.co';
const SUPA_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuemVsa3RoanpkdGxnaGFpem1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjY2NTQsImV4cCI6MjA5NDM0MjY1NH0.xL1cAwZ4kQ-u1bILLm-WMR-5j-PH_MJ8aVjBRCuhi6k';
const PRECACHE   = ['/', '/index.html', '/icon-192.png', '/icon-512.png'];

// ── INSTALL ──────────────────────────────────────────────────
self.addEventListener('install', e => {
  console.log('[SW] install v5');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => Promise.allSettled(PRECACHE.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener('activate', e => {
  console.log('[SW] activate v5');
  e.waitUntil(
    caches.keys()
      .then(ns => Promise.all(
        ns.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ─────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('supabase.co')  ||
      url.hostname.includes('googleapis')   ||
      url.hostname.includes('jsdelivr')     ||
      url.hostname.includes('cdnjs')        ||
      url.hostname.includes('unpkg')) return;
  if (e.request.method !== 'GET') return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request.clone()).then(resp => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          caches.open(CACHE_NAME).then(c => c.put(e.request, resp.clone()));
        }
        return resp;
      }).catch(() => cached || Response.error());
    })
  );
});

// ── PUSH ──────────────────────────────────────────────────────
// Handles server-sent push notifications (from Edge Function)
// Must show notification immediately — iOS requires this in waitUntil
self.addEventListener('push', e => {
  console.log('[SW] Push received', e.data ? 'with data' : 'no data');

  let title = 'Samara Facilities';
  let body  = 'Nueva notificación';
  let icon  = '/icon-192.png';
  let badge = '/icon-192.png';
  let data  = {};
  let urgent = false;

  if (e.data) {
    try {
      const payload = e.data.json();
      title  = payload.title  || title;
      body   = payload.body   || body;
      icon   = payload.icon   || icon;
      badge  = payload.badge  || badge;
      data   = payload.data   || {};
      urgent = title.includes('🔴') || title.includes('Urgente');
    } catch (_) {
      body = e.data.text();
    }
  }

  const options = {
    body,
    icon,
    badge,
    tag:                data.ot_id ? 'ot-' + data.ot_id : 'samara',
    renotify:           true,
    requireInteraction: urgent,
    vibrate:            urgent ? [300,100,300,100,300] : [200,100,200],
    data,
    // iOS 16.4+ supports these:
    timestamp:          Date.now(),
  };

  e.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        // Wake up the app clients to refresh data
        return self.clients.matchAll({ type: 'window' })
          .then(list => list.forEach(c => c.postMessage({ type: 'NEW_OTS' })));
      })
  );
});

// ── NOTIFICATION CLICK ────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const app = list.find(c => c.url.includes(self.location.origin));
      if (app) return app.focus();
      return clients.openWindow ? clients.openWindow('/') : null;
    })
  );
});

// ── PERIODIC SYNC ─────────────────────────────────────────────
self.addEventListener('periodicsync', e => {
  if (e.tag === 'samara-bg-check') e.waitUntil(bgCheck());
});

self.addEventListener('sync', e => {
  if (e.tag === 'samara-bg-check') e.waitUntil(bgCheck());
});

// ── MESSAGES FROM APP ─────────────────────────────────────────
self.addEventListener('message', async e => {
  const d = e.data;
  if (!d) return;

  if (d === 'SKIP_WAITING' || d.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (d.type === 'INIT_USER') {
    await saveCtx({
      userId:    d.userId,
      rol:       d.rol,
      zona:      d.zona || null,
      lastCheck: d.lastCheck || new Date().toISOString(),
    });
    console.log('[SW] Contexto guardado:', d.rol);
    return;
  }

  if (d.type === 'SHOW_NOTIF') {
    await self.registration.showNotification(d.title || 'Samara', {
      body:    d.body || '',
      icon:    '/icon-192.png',
      badge:   '/icon-192.png',
      tag:     d.tag || 'samara',
      vibrate: [200,100,200],
    });
  }
});

// ── BACKGROUND CHECK (keep-alive fallback) ────────────────────
async function bgCheck() {
  try {
    const ctx = await getCtx();
    if (!ctx?.userId || !ctx?.rol) return;

    const since = ctx.lastCheck || new Date(Date.now() - 30000).toISOString();
    const resp  = await fetch(
      `${SUPA_URL}/rest/v1/ordenes_trabajo` +
      `?fecha_creacion=gt.${encodeURIComponent(since)}` +
      `&order=fecha_creacion.asc&limit=10` +
      `&select=id,equipo_nombre,tipo,prioridad,tecnico_id,fecha_creacion`,
      { headers: { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` } }
    );
    if (!resp.ok) return;
    const ots = await resp.json();
    if (!ots?.length) return;

    let latest = ctx.lastCheck;
    for (const ot of ots) {
      const urg   = ot.prioridad === 'Urgente';
      const esMia = String(ot.tecnico_id) === String(ctx.userId);
      const sinAsg = !ot.tecnico_id;
      if (!['admin','gerencia','supervisor'].includes(ctx.rol) &&
          !((['tecnico','supervisor_zona'].includes(ctx.rol)) && (esMia || sinAsg))) continue;

      await self.registration.showNotification(
        urg ? '🔴 OT Urgente — Samara' : '📋 Nueva OT — Samara',
        {
          body:    `${ot.equipo_nombre} · ${ot.tipo}`,
          icon:    '/icon-192.png',
          badge:   '/icon-192.png',
          tag:     'ot-' + ot.id,
          vibrate: urg ? [300,100,300] : [200,100,200],
          requireInteraction: urg,
        }
      );
      if (ot.fecha_creacion > latest) latest = ot.fecha_creacion;
    }

    await saveCtx({ ...ctx, lastCheck: latest });
    const list = await clients.matchAll({ type: 'window' });
    list.forEach(c => c.postMessage({ type: 'NEW_OTS', count: ots.length }));
  } catch (err) {
    console.warn('[SW] bgCheck error:', err.message);
  }
}

// ── IndexedDB ─────────────────────────────────────────────────
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
    tx.oncomplete = res; tx.onerror = rej;
  });
}
async function getCtx() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const req = db.transaction('ctx','readonly').objectStore('ctx').get('user');
    req.onsuccess = e => res(e.target.result);
    req.onerror   = e => rej(e.target.error);
  });
}
