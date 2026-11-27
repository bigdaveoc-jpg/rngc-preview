/* RNGC app helper (Nov 12 2026). Lets phones install the club site as an app and opens pages already seen when
   the signal drops (golf courses). The page always tries the network first, so updates show up right away; falls back to
   the last saved copy when the network fails or takes over 3 seconds. Only this site's own files; sign-in,
   scores, store and maps calls go straight to the network and are never saved here. */
const CACHE = 'rngc-v2';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/', '/assets/app/icon-192.png']).catch(() => {}))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
/* live event alerts (Nov 13 2026): the club server sends big shots, trash talk and "we're live" */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Raider Nation Golf Club', {
    body: d.body || '', icon: '/assets/app/icon-192.png', tag: d.tag || undefined, renotify: !!d.tag, data: { url: d.url || '/' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    for (const c of cs) if (new URL(c.url).origin === self.location.origin && 'focus' in c)
      return (c.navigate ? c.navigate(url).catch(() => c) : Promise.resolve(c)).then(w => (w || c).focus());
    return clients.openWindow(url);
  }));
});
/* Speed pass (Nov 27 2026): files the page loads with a version tag (?v=) never change under that tag, so the phone uses
   its saved copy at once and only goes to the network for a new tag; old tags of the same file are dropped. Fonts work the
   same way. Pictures show the saved copy at once and refresh it in the background. The page itself still checks the
   network first, so a new version (new tags) shows on the next open. Rule: every edit to a script or style bumps its ?v=. */
const keep = (cache, r, res) => {
  if (!res.ok || res.type !== 'basic') return;
  const u = new URL(r.url);
  cache.put(r, res.clone()).then(() => u.search ? cache.keys().then(ks => Promise.all(ks.map(k => {
    const ku = new URL(k.url);
    return ku.pathname === u.pathname && ku.search !== u.search ? cache.delete(k) : null;
  }))) : null).catch(() => {});
};
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname === '/sw.js' || u.pathname.endsWith('.mobileconfig')) return;
  const tagged = /(^|&)v=/.test(u.search.slice(1)) && /\.(js|css)$/.test(u.pathname);
  const font = /\.woff2$/.test(u.pathname);
  const pic = (!u.search || /(^|&)v=/.test(u.search.slice(1))) && u.pathname.startsWith('/assets/') && /\.(webp|png|jpe?g|svg|gif)$/i.test(u.pathname);
  if (tagged || font || pic) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(r);
      const net = fetch(r).then(res => { keep(cache, r, res); return res; });
      if (hit) { if (pic) e.waitUntil(net.catch(() => {})); else net.catch(() => {}); return hit; }
      return net;
    })());
    return;
  }
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    /* the page and untagged scripts skip the phone's 10-minute web cache, so a new app version shows on the next open */
    const fresh = r.mode === 'navigate' || /\.(html|js|css|webmanifest)$/.test(u.pathname) || u.pathname.endsWith('/');
    const net = fetch(r, fresh ? { cache: 'no-cache' } : undefined).then(res => { if (res.ok && res.type === 'basic') cache.put(r, res.clone()).catch(() => {}); return res; });
    net.catch(() => {});
    const slow = new Promise(ok => setTimeout(ok, 3000)).then(() => cache.match(r, { ignoreSearch: r.mode === 'navigate' }));
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
