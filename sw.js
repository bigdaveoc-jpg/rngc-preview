/* RNGC app helper (Nov 12 2026). Lets phones install the club site as an app and opens pages already seen when
   the signal drops (golf courses). Always tries the network first, so updates show up right away; falls back to
   the last saved copy only when the network fails or takes over 5 seconds. Only this site's own files; sign-in,
   scores, store and maps calls go straight to the network and are never saved here. */
const CACHE = 'rngc-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/', '/assets/app/icon-192.png']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname === '/sw.js') return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const net = fetch(r).then(res => { if (res.ok && res.type === 'basic') cache.put(r, res.clone()).catch(() => {}); return res; });
    net.catch(() => {});
    const slow = new Promise(ok => setTimeout(ok, 5000)).then(() => cache.match(r, { ignoreSearch: r.mode === 'navigate' }));
    try {
      const first = await Promise.race([net, slow]);
      if (first) return first;
      return await net;
    } catch (err) {
      const hit = await cache.match(r, { ignoreSearch: r.mode === 'navigate' }) || (r.mode === 'navigate' && await cache.match('/'));
      if (hit) return hit;
      throw err;
    }
  })());
});
