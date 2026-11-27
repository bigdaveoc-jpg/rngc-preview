/* Bright mode for the whole app (David, Nov 26 2026: "I think you can do better on the Bright mode").
   Before: only the golf screens went light, boxed in by the dark top bar and tab bar. Now one switch turns the whole
   app light: a sun button in the top bar on every screen, and the golf screens' Bright button flips the same switch.
   Kept in the golf settings (rngc-golf-v1, pref.sun) so the scorecard and the app always agree.
   LEGENDS ONLY (David, Nov 26: "Don't mess with the Raider versions. Only Legends"): everything here is scoped to a
   club theme (html[data-club]); Raider Nation keeps its own golf-screen Bright mode exactly as it was, no top-bar button.
   Colors come from the club theme's sun palette (Legends = cream and gold). */
(function(){
var GK='rngc-golf-v1';
function read(){try{return !!((JSON.parse(localStorage.getItem(GK)||'{}').pref||{}).sun)}catch(e){return false}}
function write(on){try{var g=JSON.parse(localStorage.getItem(GK)||'{}');(g.pref||(g.pref={})).sun=on;localStorage.setItem(GK,JSON.stringify(g))}catch(e){}}
var css=`
html[data-club] body.sun{--shade:0 1px 2px rgba(16,24,40,.06),0 8px 20px -10px rgba(16,24,40,.14)}
html[data-club] body.sun,html[data-club] body.sun .app{background:var(--bg)}
html[data-club] body.sun .top{background:var(--panel);box-shadow:0 1px 0 var(--line),0 6px 16px -12px rgba(16,24,40,.25)}
html[data-club] body.sun .tabs{background:var(--panel);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:0 -1px 0 var(--line)}
html[data-club] body.sun .tab[aria-selected="true"]{color:var(--text)}
html[data-club] body.sun .card,html[data-club] body.sun .hero,html[data-club] body.sun .mapbox{background:var(--panel);border:1px solid var(--line);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:var(--shade)}
html[data-club] body.sun .card .card,html[data-club] body.sun .seatbar>div,html[data-club] body.sun .invstats div,html[data-club] body.sun .invprev,html[data-club] body.sun .date,html[data-club] body.sun .card .pill{background:var(--panel-2);box-shadow:none}
html[data-club] body.sun .hero .bg{filter:none}
html[data-club] body.sun .hero .bg::after{background:linear-gradient(180deg,rgba(255,255,255,0) 50%,var(--panel) 100%)}
html[data-club] body.sun .field,html[data-club] body.sun .chsel{background:var(--panel);border-color:var(--line)}
html[data-club] body.sun .btn.ghost{background:var(--panel);border-color:var(--line);color:var(--text)}
html[data-club] body.sun .iconbtn{background:var(--panel);border-color:var(--line);color:var(--text)}
html[data-club] body.sun .sheet{background:var(--bg-2);box-shadow:0 -12px 30px -12px rgba(16,24,40,.3)}
html[data-club] body.sun select option{background:#fff;color:#0b0d10}
html[data-club] body.sun .views::before{filter:grayscale(1) brightness(.15);opacity:.05}
html[data-club] body.sun .top .logo{filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}
html[data-club] body.sun .pm-switch b,html[data-club] body.sun .pm-panel button[aria-current="true"] span{color:var(--text);-webkit-text-stroke:0}
html[data-club] body.sun .hero p,html[data-club] body.sun .ev .note,html[data-club] body.sun .tix .note2,html[data-club] body.sun .tthr em{color:var(--muted)}
html[data-club] body.sun .es-saved.bad,html[data-club] body.sun .err,html[data-club] body.sun .msg.err,html[data-club] body.sun .btn.danger,html[data-club] body.sun .linkbtn.danger,html[data-club] body.sun .pill.out{color:#b42318}
html[data-club] body.sun .btn.danger,html[data-club] body.sun .pill.out{border-color:#e9a9a4}
html[data-club] body.sun .es-dayrow b.live{color:#c0262d}
html[data-club] body.sun .conn.on b,html[data-club] body.sun .connl.on,html[data-club] body.sun .duesok,html[data-club] body.sun .msg.ok,html[data-club] body.sun .st.done{color:#157f3b}
html[data-club] body.sun .conn.link b,html[data-club] body.sun .connl.link{color:#8a5a00}
#btnSun{font-size:19px}#btnSun[aria-pressed="true"]{color:#c78a00}
@media (min-width:1000px){html[data-club] .brandrow #btnSun{right:66px}}
@media (max-width:999px){html[data-club] .top #btnSun{order:3;width:36px;height:36px;border-radius:8px}html[data-club] .top #btnProfile{order:4}}
`;
var s=document.createElement('style');s.id='brightCss';s.textContent=css;document.head.appendChild(s);
function btn(){var b=document.getElementById('btnSun'),on=document.body.classList.contains('sun');if(!b)return;
  b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',on?'Bright mode is on. Tap for dark':'Bright mode, for sunlight');
  b.innerHTML='<i class="ph-'+(on?'fill':'bold')+' ph-sun"></i>'}
var themed=function(){return document.documentElement.hasAttribute('data-club')};
function paint(on){if(!themed())return;document.body.classList.toggle('sun',on);
  var m=document.querySelector('meta[name="theme-color"]');
  if(m){if(!m.dataset.dark)m.dataset.dark=m.getAttribute('content');m.setAttribute('content',on?getComputedStyle(document.body).getPropertyValue('--panel').trim()||'#ffffff':m.dataset.dark)}
  btn()}
/* set: from the top bar (tell the golf screens too). sync: the golf screens already flipped themselves */
function set(on){write(on);paint(on);var f=document.getElementById('golfFrame');try{f&&f.contentWindow&&f.contentWindow.rngcSetSun&&f.contentWindow.rngcSetSun(on)}catch(e){}}
window.RNGCBRIGHT={on:read,set:set,sync:function(on){paint(on)},init:function(){init()}};
function init(){if(!themed())return;paint(read());var p=document.getElementById('btnProfile');
  if(p&&!document.getElementById('btnSun')){var b=document.createElement('button');b.className='iconbtn';b.id='btnSun';b.type='button';
    p.parentNode.insertBefore(b,p);b.addEventListener('click',function(){set(!document.body.classList.contains('sun'))});btn()}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
/* another tab or the golf screen changed it */
addEventListener('storage',function(e){if(e.key===GK)paint(read())});
})();
