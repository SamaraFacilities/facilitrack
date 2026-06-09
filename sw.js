// ═══════════════════════════════════════════════════════════════
// SAMARA FACILITIES — Service Worker v3
// Cache offline + Background sync + Push notifications
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME  = 'samara-v3';
const OFFLINE_URL = '/index.html';
const SUPA_URL    = 'https://knzelkthjzdtlghaizmr.supabase.co';
const SUPA_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuemVsa3RoanpkdGxnaGFpem1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjY2NTQsImV4cCI6MjA5NDM0MjY1NH0.xL1cAwZ4kQ-u1bILLm-WMR-5j-PH_MJ8aVjBRCuhi6k';

const PRECACHE = ['/', '/index.html', '/icon-192.png', '/icon-512.png'];

// ── INSTALL ──────────────────────────────────────────────────
self.addEventListener('install', e => {
  console.log('[SW] install v3');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => Promise.allSettled(PRECACHE.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────
self.addEventListener('activate', e => {
  console.log('[SW] activate v3');
  e.waitUntil(
    caches.keys()
      .then(ns => Promise.all(ns.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// ── FETCH: network-first nav, cache-first assets ──────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('supabase.co')) return;
  if (e.request.method !== 'GET') return;

  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp?.status === 200 && resp.type === 'basic')
          caches.open(CACHE_NAME).then(c => c.put(e.request, resp.clone()));
        return resp;
      }).catch(() => cached);
    })
  );
});

// ── PUSH desde servidor ───────────────────────────────────────
self.addEventListener('push', e => {
  console.log('[SW] push received');
  let d = { title: 'Samara Facilities', body: 'Nueva notificación' };
  try { if (e.data) d = { ...d, ...e.data.json() }; }
  catch (_) { if (e.data) d.body = e.data.text(); }

  e.waitUntil(self.registration.showNotification(d.title, {
    body:               d.body,
    icon:               '/icon-192.png',
    badge:              '/icon-192.png',
    tag:                d.tag  || 'samara',
    vibrate:            d.urgent ? [300,100,300,100,300] : [200,100,200],
    requireInteraction: d.urgent || false,
    data:               d,
  }));
});

// ── NOTIFICATION CLICK ────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin) && 'focus' in c) return c.focus();
      }
      return clients.openWindow ? clients.openWindow('/') : null;
    })
  );
});

// ── BACKGROUND SYNC ───────────────────────────────────────────
self.addEventListener('sync', e => {
  if (e.tag === 'samara-check-ots') e.waitUntil(checkNuevasOTs());
});

self.addEventListener('periodicsync', e => {
  if (e.tag === 'samara-check-ots') e.waitUntil(checkNuevasOTs());
});

// ── MENSAJES DESDE LA APP ─────────────────────────────────────
self.addEventListener('message', async e => {
  const d = e.data;
  if (!d) return;

  // Skip waiting
  if (d === 'SKIP_WAITING' || d.type === 'SKIP_WAITING') {
    self.skipWaiting(); return;
  }
  if (d === 'GET_VERSION') {
    e.ports[0]?.postMessage({ version: CACHE_NAME }); return;
  }

  // La app envía contexto del usuario al hacer login
  if (d.type === 'INIT_USER') {
    await saveCtx({ userId: d.userId, rol: d.rol, zona: d.zona||null, lastCheck: d.lastCheck||new Date().toISOString() });
    console.log('[SW] contexto guardado:', d.rol);
    return;
  }

  // La app pide mostrar push nativa (cuando está en background/sleep)
  if (d.type === 'IN_APP_NOTIF') {
    // Verificar si la app está visible — si no, mostrar push del SO
    const list = await clients.matchAll({ type: 'window' });
    const visible = list.some(c => !document?.hidden); // en SW no existe document
    // Mostrar siempre — el SO decide si mostrarla o no según el foco
    await self.registration.showNotification(d.title || 'Samara Facilities', {
      body:               d.body || '',
      icon:               '/icon-192.png',
      badge:              '/icon-192.png',
      tag:                d.tag  || 'samara-notif',
      vibrate:            d.urgent ? [300,100,300,100,300] : [200,100,200],
      requireInteraction: d.urgent || false,
    });
    return;
  }
});

// ── CONSULTAR SUPABASE por OTs nuevas (background) ───────────
async function checkNuevasOTs() {
  try {
    const ctx = await getCtx();
    if (!ctx?.userId) return;

    const since = ctx.lastCheck || new Date(Date.now() - 60000).toISOString();
    const resp  = await fetch(
      `${SUPA_URL}/rest/v1/ordenes_trabajo?created_at=gt.${encodeURIComponent(since)}&order=created_at.asc&limit=10&select=id,equipo_nombre,tipo,prioridad,tecnico_id,created_at`,
      { headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` } }
    );
    if (!resp.ok) return;

    const ots = await resp.json();
    if (!ots?.length) return;

    for (const ot of ots) {
      const urg    = ot.prioridad === 'Urgente';
      const esMia  = ot.tecnico_id === ctx.userId;
      const sinAsg = !ot.tecnico_id;
      let title, body;

      if (['admin','gerencia','supervisor'].includes(ctx.rol)) {
        title = urg ? '🔴 OT Urgente — Samara' : '📋 Nueva OT — Samara';
        body  = `${ot.equipo_nombre||'Equipo'} · ${ot.tipo||''} · ${ot.prioridad||''}`;
      } else if (ctx.rol==='tecnico' || ctx.rol==='supervisor_zona') {
        if (!esMia && !sinAsg) continue;
        title = urg ? '🔴 OT Urgente — Samara' : '📋 Nueva OT — Samara';
        body  = `${ot.equipo_nombre||'Equipo'} · ${ot.tipo||''}` +
                (esMia ? ' — asignada a ti ✓' : ' — sin asignar, puedes tomarla');
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

    const latest = ots[ots.length - 1].created_at;
    await saveCtx({ ...ctx, lastCheck: latest });

    const list = await clients.matchAll({ type: 'window' });
    list.forEach(c => c.postMessage({ type: 'NEW_OTS', count: ots.length }));

  } catch (err) {
    console.warn('[SW] checkNuevasOTs:', err.message);
  }
}

// ── IndexedDB: contexto del usuario ──────────────────────────
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
    const r = db.transaction('ctx','readonly').objectStore('ctx').get('user');
    r.onsuccess = e => res(e.target.result);
    r.onerror   = e => rej(e.target.error);
  });
}
