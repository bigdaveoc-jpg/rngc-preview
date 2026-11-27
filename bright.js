/* Bright mode for the whole app (David, Nov 26 2026: "I think you can do better on the Bright mode").
   Before: only the golf screens went light, boxed in by the dark top bar and tab bar. Now one switch turns the whole
   app light: a sun button in the top bar on every screen, and the golf screens' Bright button flips the same switch.
   Kept in the golf settings (rngc-golf-v1, pref.sun) so the scorecard and the app always agree.
   Colors come from the club theme: Raider Nation = white cards on cool gray, black ink; Legends = cream and gold. */
(function(){
var GK='rngc-golf-v1';
function read(){try{return !!((JSON.parse(localStorage.getItem(GK)||'{}').pref||{}).sun)}catch(e){return false}}
function write(on){try{var g=JSON.parse(localStorage.getItem(GK)||'{}');(g.pref||(g.pref={})).sun=on;localStorage.setItem(GK,JSON.stringify(g))}catch(e){}}
var css=`
body.sun{--bg:#eef1f5;--bg-2:#f8f9fb;--panel:#fff;--panel-2:#f1f3f6;--line:#d7dce3;--text:#0b0d10;--muted:#4b5563;
  --silver:#0b0d10;--silver-2:#3a414b;--on-silver:#fff;--silver-rgb:11,13,16;
  --glass:rgba(11,13,16,.03);--glass-2:#f1f3f6;--glass-edge:var(--line);--glass-hi:transparent;
  --shade:0 1px 2px rgba(16,24,40,.06),0 8px 20px -10px rgba(16,24,40,.14)}
html:has(body.sun){background:#eef1f5}
body.sun,body.sun .app{background:var(--bg)}
body.sun .top{background:var(--panel);box-shadow:0 1px 0 var(--line),0 6px 16px -12px rgba(16,24,40,.25)}
body.sun .tabs{background:var(--panel);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:0 -1px 0 var(--line)}
body.sun .tab[aria-selected="true"]{color:var(--text)}
body.sun .card,body.sun .hero,body.sun .mapbox{background:var(--panel);border:1px solid var(--line);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:var(--shade)}
body.sun .card .card,body.sun .seatbar>div,body.sun .invstats div,body.sun .invprev,body.sun .date,body.sun .card .pill{background:var(--panel-2);box-shadow:none}
body.sun .hero .bg{filter:none}
body.sun .hero .bg::after{background:linear-gradient(180deg,rgba(255,255,255,0) 50%,var(--panel) 100%)}
body.sun .field,body.sun .chsel{background:var(--panel);border-color:var(--line)}
body.sun .btn.ghost{background:var(--panel);border-color:var(--line);color:var(--text)}
body.sun .iconbtn{background:var(--panel);border-color:var(--line);color:var(--text)}
body.sun .sheet{background:var(--bg-2);box-shadow:0 -12px 30px -12px rgba(16,24,40,.3)}
body.sun select option{background:#fff;color:#0b0d10}
body.sun .views::before{filter:grayscale(1) brightness(.15);opacity:.05}
body.sun .top .logo{filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}
body.sun .pm-switch b,body.sun .pm-panel button[aria-current="true"] span{color:var(--text);-webkit-text-stroke:0}
body.sun .hero p,body.sun .ev .note,body.sun .tix .note2,body.sun .tthr em{color:var(--muted)}
body.sun .es-saved.bad,body.sun .err,body.sun .msg.err,body.sun .btn.danger,body.sun .linkbtn.danger,body.sun .pill.out{color:#b42318}
body.sun .btn.danger,body.sun .pill.out{border-color:#e9a9a4}
body.sun .es-dayrow b.live{color:#c0262d}
body.sun .conn.on b,body.sun .connl.on,body.sun .duesok,body.sun .msg.ok,body.sun .st.done{color:#157f3b}
body.sun .card.nx-golf{--nxc:#157f3b}
body.sun .conn.link b,body.sun .connl.link{color:#8a5a00}
#btnSun{font-size:19px}#btnSun[aria-pressed="true"]{color:#c78a00}
@media (min-width:1000px){.brandrow #btnSun{right:66px}}
@media (max-width:999px){.top #btnSun{order:3;width:36px;height:36px;border-radius:8px}.top #btnProfile{order:4}.brandtxt b{font-size:15.5px}.chsel{max-width:112px}}
`;
var s=document.createElement('style');s.id='brightCss';s.textContent=css;document.head.appendChild(s);
function btn(){var b=document.getElementById('btnSun'),on=document.body.classList.contains('sun');if(!b)return;
  b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',on?'Bright mode is on. Tap for dark':'Bright mode, for sunlight');
  b.innerHTML='<i class="ph-'+(on?'fill':'bold')+' ph-sun"></i>'}
function paint(on){document.body.classList.toggle('sun',on);
  var m=document.querySelector('meta[name="theme-color"]');
  if(m){if(!m.dataset.dark)m.dataset.dark=m.getAttribute('content');m.setAttribute('content',on?getComputedStyle(document.body).getPropertyValue('--panel').trim()||'#ffffff':m.dataset.dark)}
  btn()}
/* set: from the top bar (tell the golf screens too). sync: the golf screens already flipped themselves */
function set(on){write(on);paint(on);var f=document.getElementById('golfFrame');try{f&&f.contentWindow&&f.contentWindow.rngcSetSun&&f.contentWindow.rngcSetSun(on)}catch(e){}}
window.RNGCBRIGHT={on:read,set:set,sync:function(on){paint(on)}};
function init(){paint(read());var p=document.getElementById('btnProfile');
  if(p&&!document.getElementById('btnSun')){var b=document.createElement('button');b.className='iconbtn';b.id='btnSun';b.type='button';
    p.parentNode.insertBefore(b,p);b.addEventListener('click',function(){set(!document.body.classList.contains('sun'))});btn()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
/* another tab or the golf screen changed it */
addEventListener('storage',function(e){if(e.key===GK)paint(read())});
})();
