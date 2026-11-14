/* Quiet updates (David, Nov 14 2026: "make sure when we are working on the site we are not messing in the users experience,
   then as quickly as possible update it live with as little as possible interference").
   A phone that already has the club app open asks the site every 2 minutes, and whenever it comes back to the screen,
   whether a new version went live (one tiny request, no page download). When one did, it waits for a quiet moment:
   the screen goes off or the person switches away, nothing is being typed, no sheet is open and no score is waiting to
   send. Then it reloads in the background, so they come back to the new version where they left off.
   It never reloads while someone is looking at it. Each page can add its own "not now" check (window.rngcSafe) and
   save where the person is first (window.rngcBeforeReload). The golf screen inside the app leaves this to the app. */
(function () {
  if (window.top !== window) return;
  var url = location.pathname, base = null, pending = false, busy = false;
  function stamp() {
    return fetch(url + '?upd=' + Date.now(), { method: 'HEAD', cache: 'no-store' })
      .then(function (r) { return r.ok ? (r.headers.get('last-modified') || r.headers.get('etag')) : null; })
      .catch(function () { return null; });
  }
  function check() {
    if (busy || pending || !navigator.onLine) return;
    busy = true;
    stamp().then(function (s) {
      busy = false;
      if (!s) return;
      if (base === null) base = s; else if (s !== base) pending = true;
    });
  }
  function safe() {
    var a = document.activeElement;
    if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return false;
    try { return !window.rngcSafe || !!window.rngcSafe(); } catch (e) { return false; }
  }
  function apply() {
    if (!pending || !safe()) return;
    try { if (window.rngcBeforeReload) window.rngcBeforeReload(); } catch (e) {}
    location.reload();
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') apply();
    else if (pending) apply();   /* the phone froze the page before it could reload: do it the moment they're back */
    else check();
  });
  setInterval(function () { if (document.visibilityState === 'visible') check(); }, 120000);
  setTimeout(check, 4000);
  window.rngcUpdate = { check: check, apply: apply, get pending() { return pending; } };
})();
