/* Crash reports from phones (David, Nov 14 2026: "did you can you see any crash logs?"). When something on the page breaks,
   the phone quietly tells the club server what broke: the error, the file and line, which screen and the phone type.
   No names, no typed text, no sign-in. At most 5 reports per page open, each error once. Lost signal, a closed server and
   errors from browser add-ons or other sites are left out, since they aren't ours to fix. */
(function () {
  var API = (function () {
    try { var o = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && localStorage.getItem('rngc-club-api'); if (o) return o; } catch (e) {}
    return 'https://rngc-club.137.184.188.41.sslip.io';
  })();
  var sent = {}, n = 0;
  var app = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  function path(u) {
    if (!u) return '';
    try { var x = new URL(u, location.href); return x.origin === location.origin ? x.pathname : 'other site'; } catch (e) { return ''; }
  }
  function clean(st) {
    return String(st || '').split(location.origin).join('').replace(/\?[^:\s)]*/g, '').slice(0, 1500);
  }
  function send(msg, src, line, col, stack) {
    msg = String(msg || '').slice(0, 300);
    if (!msg || n >= 5) return;
    if (/^(Uncaught )?Script error\.?$/i.test(msg) || /ResizeObserver loop/i.test(msg)) return;
    if (/extension:\/\/|^moz-|webkit-masked-url/i.test(String(src) + String(stack))) return;
    var key = msg + '|' + src + '|' + line;
    if (sent[key]) return;
    sent[key] = 1; n++;
    var body = JSON.stringify({
      msg: msg, src: path(src), line: line || 0, col: col || 0, stack: clean(stack),
      page: location.pathname + location.hash.split('/').slice(0, 2).join('/'),
      ua: String(navigator.userAgent || '').slice(0, 160), app: app ? 1 : 0
    });
    try { if (navigator.sendBeacon && navigator.sendBeacon(API + '/log/error', new Blob([body], { type: 'text/plain' }))) return; } catch (e) {}
    try { fetch(API + '/log/error', { method: 'POST', body: body, headers: { 'Content-Type': 'text/plain' }, keepalive: true, mode: 'no-cors' }).catch(function () {}); } catch (e) {}
  }
  window.addEventListener('error', function (e) {
    if (e.target && e.target !== window) return;   /* a picture or file that didn't load: not a crash */
    send(e.message, e.filename, e.lineno, e.colno, e.error && e.error.stack);
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason;
    if (r == null || typeof r === 'number') return;   /* a server answer like 401 or 404, handled on screen */
    var m = String((r && r.message) || r);
    if (/Failed to fetch|Load failed|NetworkError|network connection|aborted|timed? ?out/i.test(m)) return;   /* lost signal */
    send('Unhandled: ' + m, '', 0, 0, r && r.stack);
  });
  window.rngcReportError = send;
})();
