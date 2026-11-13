/* Live event day (David, Nov 13 2026). When a club event is on:
   - Home gets a red LIVE banner at the top: leaderboard, my scorecard and event details one tap away, plus the latest
     big shots and thrash talk. The Events tab gets a red dot and the event card a LIVE tag.
   - Phone alerts (club server /push/*): big shots (aces, eagles, new closest-to-pin and long-drive leaders), every
     birdie if you want it, thrash talk, and the "we're live" note. Chosen per phone. iPhone needs the club app on the
     home screen for alerts (Apple's rule).
   - Thrash talk: signed-in members pick one of the club's lines and a group. No typing, so nothing to moderate.
     One line a minute. David or Ross can switch it off for everyone.
   Preview before the day: add ?livepreview to the address (this browser only, until the tab closes). */
(function(){
const CLUB_API='https://rngc-club.137.184.188.41.sslip.io';
const api=()=>{try{const o=localStorage.getItem('rngc-club-api');if(o)return o.replace(/\/$/,'')}catch(e){}return CLUB_API};
const tok=()=>{try{return localStorage.getItem('rngc-auth-token')||''}catch(e){return ''}};
const call=(path,body)=>fetch(api()+path,{method:body?'POST':'GET',cache:'no-store',
  headers:Object.assign(tok()?{Authorization:'Bearer '+tok()}:{},body?{'Content-Type':'application/json'}:{}),body:body?JSON.stringify(body):undefined})
  .then(async r=>{const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||'The club server had a problem.'),{status:r.status});return j});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=m=>{if(typeof toast==='function')return toast(m);let t=document.getElementById('rlToast');
  if(!t){t=document.createElement('div');t.id='rlToast';t.setAttribute('role','status');t.style.cssText='position:fixed;left:50%;bottom:calc(150px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9600;background:#eef0f3;color:#0a0b0d;padding:12px 18px;border-radius:999px;font:600 15px Barlow,system-ui,sans-serif;max-width:calc(100% - 32px);box-shadow:0 6px 20px rgba(0,0,0,.4)';document.body.appendChild(t)}
  t.textContent=m;t.hidden=false;clearTimeout(t._t);t._t=setTimeout(()=>t.hidden=true,3200)};
const ROOT=location.pathname.startsWith('/scorecard')?'../':'';

/* the events that have the event-day scorecard; the main app's list wins when it's there */
const FALLBACK=[{id:'nov14',name:'RNGC vs The 12th Man',date:'2026-11-14',where:'Chimera Golf Club, Henderson NV',start:'8:00 am shotgun'}];
const GROUPS={nov14:['g1A','g1B','g18A','g18B','g17A','g17B','g16A','g16B','g15A']};
function events(){try{if(typeof EVENTS!=='undefined'&&Array.isArray(EVENTS)&&typeof SCORECARD_EVENTS!=='undefined')
  return EVENTS.filter(e=>SCORECARD_EVENTS.includes(e.id)).map(e=>Object.assign({start:(FALLBACK.find(f=>f.id===e.id)||{}).start||''},e))}catch(e){}return FALLBACK}
const pacific=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles'}).format(new Date());   /* YYYY-MM-DD */
let preview=false;try{if(/[?&#]livepreview/.test(location.search+location.hash))sessionStorage.setItem('rngc-live-preview','1');preview=sessionStorage.getItem('rngc-live-preview')==='1'}catch(e){}
function pickEvent(){const t=pacific(),evs=events();return evs.find(e=>e.date===t)||(preview?evs.filter(e=>e.date>=t).sort((a,b)=>a.date<b.date?-1:1)[0]:null)||null}

const L={ev:null,live:false,feed:[],talkOn:true,lines:[],admin:false,at:0};
const isLive=id=>!!(L.live&&L.ev&&(!id||L.ev.id===id));

const css=`.rl-banner:empty{display:none}
.rl-b{position:relative;margin:12px 0 14px;border:1px solid #C8161F;border-radius:var(--r,16px);background:linear-gradient(135deg,rgba(200,22,31,.24),rgba(200,22,31,.06) 60%),var(--panel,#16191e);padding:14px;overflow:hidden}
.rl-top{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.rl-tag{display:inline-flex;align-items:center;gap:7px;background:#C8161F;color:#fff;font:800 14px/1 var(--display,'Barlow Condensed',sans-serif);letter-spacing:.12em;padding:7px 11px;border-radius:999px;flex:none}
.rl-tag i,.rl-dot,.rl-pill i{width:8px;height:8px;border-radius:50%;background:#fff;display:inline-block;animation:rlPulse 1.4s ease-in-out infinite}
.rl-pill{display:inline-flex;align-items:center;gap:6px;min-height:24px;padding:0 10px;border-radius:999px;background:#C8161F;color:#fff;font-size:12px;font-weight:800;letter-spacing:.08em}
@keyframes rlPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}
@media (prefers-reduced-motion:reduce){.rl-tag i,.rl-dot,.rl-pill i{animation:none}}
.rl-name{min-width:0;flex:1 1 220px}.rl-name b{display:block;font:800 21px/1.1 var(--display,'Barlow Condensed',sans-serif);text-transform:uppercase;letter-spacing:.02em}
.rl-name span{color:var(--muted,#9aa2ae);font-size:14px}
.rl-acts{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:12px}
.rl-acts a,.rl-acts button{display:flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:0 12px;border-radius:999px;font-weight:700;font-size:15px;
  border:1px solid var(--line,#2a2f37);background:rgba(255,255,255,.06);color:var(--text,#eef0f3);text-decoration:none;cursor:pointer;font-family:inherit;white-space:nowrap}
.rl-acts .main{background:#C8161F;border-color:#C8161F;color:#fff}
.rl-acts .on{border-color:rgba(255,255,255,.4)}
.rl-feed{list-style:none;margin:12px 0 0;padding:0;border-top:1px solid rgba(255,255,255,.1)}
.rl-feed li{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:9px 0 0;font-size:14px;line-height:1.35}
.rl-feed li span{grid-column:1/-1;color:var(--muted,#9aa2ae)}
.rl-feed li small{grid-row:1;grid-column:2;color:var(--muted,#9aa2ae);font-size:12px}
@media (min-width:760px){.rl-feed li{grid-template-columns:auto 1fr auto}.rl-feed li span{grid-column:2;grid-row:1}.rl-feed li small{grid-column:3}}
@media (max-width:759px){.rl-acts{grid-template-columns:1fr 1fr}.rl-acts>:last-child:nth-child(odd){grid-column:1/-1}}
.tab[data-tab="events"]{position:relative}
.tab .rl-dot{position:absolute;top:6px;right:calc(50% - 22px);background:#C8161F;width:9px;height:9px;box-shadow:0 0 0 2px var(--bg,#0a0b0d)}
.rl-flash{animation:rlFlash 2.2s ease}
@keyframes rlFlash{0%,40%{box-shadow:0 0 0 3px #C8161F}100%{box-shadow:0 0 0 0 transparent}}
#rlSheet{position:fixed;inset:0;z-index:9400;display:grid;place-items:end center;background:rgba(5,5,6,.72);font-family:var(--body,Barlow,system-ui,sans-serif);color:var(--text,#eef0f3)}
#rlSheet[hidden]{display:none}
#rlSheet .box{width:min(520px,100%);max-height:90dvh;overflow-y:auto;background:var(--panel,#16191e);border:1px solid var(--line,#2a2f37);border-radius:18px 18px 0 0;
  padding:18px 16px max(18px,env(safe-area-inset-bottom))}
@media (min-width:700px){#rlSheet{place-items:center}#rlSheet .box{border-radius:18px}}
#rlSheet h2{font:800 24px/1.05 var(--display,'Barlow Condensed',sans-serif);text-transform:uppercase;letter-spacing:.03em;margin:0 0 6px}
#rlSheet p{color:var(--muted,#9aa2ae);margin:0 0 12px;font-size:15px;line-height:1.4}
#rlSheet .opt{display:flex;gap:12px;align-items:center;padding:11px 0;border-top:1px solid var(--line,#2a2f37);cursor:pointer;font-size:15px;line-height:1.35}
#rlSheet .opt input{width:22px;height:22px;flex:none;margin:0;accent-color:#C8161F}
#rlSheet .opt small{display:block;color:var(--muted,#9aa2ae);font-size:13px}
#rlSheet .lbl{font-weight:700;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#9aa2ae);margin:14px 0 6px}
#rlSheet .chips{display:flex;flex-wrap:wrap;gap:6px}
#rlSheet .chips button{min-height:40px;padding:0 14px;border-radius:999px;border:1px solid var(--line,#2a2f37);background:rgba(255,255,255,.05);color:inherit;font:600 15px inherit;font-family:inherit;cursor:pointer}
#rlSheet .chips button[aria-pressed="true"]{background:#C8161F;border-color:#C8161F;color:#fff}
#rlSheet .lines{display:grid;gap:6px}
#rlSheet .lines button{text-align:left;min-height:46px;padding:10px 14px;border-radius:12px;border:1px solid var(--line,#2a2f37);background:rgba(255,255,255,.04);color:inherit;font:500 15px/1.35 inherit;font-family:inherit;cursor:pointer}
#rlSheet .lines button[aria-pressed="true"]{border-color:#C8161F;background:rgba(200,22,31,.18)}
#rlSheet .go{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:50px;margin-top:14px;border:0;border-radius:999px;background:#C8161F;color:#fff;font:700 17px var(--body,Barlow,sans-serif);cursor:pointer}
#rlSheet .go:disabled{opacity:.45;cursor:not-allowed}
#rlSheet .ghost{display:block;margin:8px auto 0;padding:10px;color:var(--muted,#9aa2ae);font-size:15px;background:none;border:0;text-decoration:underline;cursor:pointer;font-family:inherit}
#rlSheet .err{color:#ffb3b5;min-height:1.3em;margin-top:8px;font-size:14px;text-align:center}
.rl-card{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.rl-card>div{flex:1 1 220px}.rl-card b{display:block}.rl-card span{color:var(--muted,#9aa2ae);font-size:14px}
#rlTalkFab{position:fixed;right:16px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:39;width:54px;height:54px;border-radius:50%;border:0;background:#C8161F;color:#fff;
  font-size:24px;display:grid;place-items:center;box-shadow:0 6px 20px rgba(0,0,0,.45);cursor:pointer}
#rlTalkFab[hidden]{display:none}
body.rl-fabpad{padding-bottom:84px}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

const ago=t=>{const m=Math.round((Date.now()-t)/60000);return m<1?'now':m<60?m+' min':Math.round(m/60)+' hr'};
function bannerInner(){if(!isLive())return '';const e=L.ev,signed=!!tok(),pr=prefs();
  return `<div class="rl-b" role="region" aria-label="Live event"><div class="rl-top"><span class="rl-tag"><i></i>LIVE${preview&&!L.realLive?' PREVIEW':''}</span>
   <div class="rl-name"><b>${esc(e.name)}</b><span>${esc(e.where||'')}${e.start?' · '+esc(e.start):''}</span></div></div>
   <div class="rl-acts"><a class="main" href="${ROOT}scorecard/#/board"><i class="ph-bold ph-ranking"></i> Leaderboard</a>
    <a href="${ROOT}scorecard/#/event"><i class="ph-bold ph-pencil-simple-line"></i> My scorecard</a>
    <button type="button" data-rl="details"><i class="ph-bold ph-info"></i> Event details</button>
    ${signed&&L.talkOn?'<button type="button" data-rl="talk"><i class="ph-bold ph-megaphone"></i> Thrash talk</button>':''}
    <button type="button" data-rl="alerts" class="${pr.on?'on':''}"><i class="ph-bold ph-bell${pr.on?'-ringing':''}"></i> ${pr.on?'Alerts on':'Get alerts'}</button></div>
   ${L.feed.length?`<ul class="rl-feed" aria-live="polite">${L.feed.slice(0,3).map(f=>`<li><b>${esc(f.title)}</b><span>${esc(f.body)}</span><small>${ago(f.at)}</small></li>`).join('')}</ul>`:''}</div>`}
const banner=()=>`<div class="rl-banner" id="rlBanner">${bannerInner()}</div>`;

function paint(){const b=document.getElementById('rlBanner');if(b)b.innerHTML=bannerInner();
  document.querySelectorAll('.tab[data-tab="events"],[data-tab="events"].tab').forEach(t=>{let d=t.querySelector('.rl-dot');
    if(isLive()&&!d){d=document.createElement('span');d.className='rl-dot';d.setAttribute('aria-label','Live now');t.appendChild(d)}else if(!isLive()&&d)d.remove()});
  const f=document.getElementById('rlTalkFab');if(f){f.hidden=!(isLive()&&tok()&&L.talkOn&&/^#\/board/.test(location.hash));document.body.classList.toggle('rl-fabpad',!f.hidden)}}

let wasLive=null;
function poll(){L.ev=pickEvent();if(!L.ev){L.live=false;paint();return}
  call('/live/feed?ev='+encodeURIComponent(L.ev.id)).then(j=>{L.realLive=!!j.live;L.live=j.live||preview;L.feed=j.feed||[];L.talkOn=j.talkOn!==false;L.lines=j.lines||[];L.admin=!!j.admin;L.at=Date.now()})
   .catch(()=>{L.live=preview||L.live})
   .finally(()=>{paint();if(wasLive!==null&&wasLive!==L.live&&typeof S!=='undefined'&&S.tab==='events'&&typeof renderEvents==='function')renderEvents();wasLive=L.live})}

/* banner buttons (event delegation: the banner is redrawn often) */
document.addEventListener('click',e=>{const b=e.target.closest('[data-rl]');if(!b)return;const k=b.dataset.rl;
  if(k==='details')return details();if(k==='talk')return talkSheet();if(k==='alerts')return alertSheet()});
function details(){if(typeof setTab==='function'){setTab('events');setTimeout(()=>{const c=document.getElementById('ev-'+(L.ev&&L.ev.id));
  if(c){c.scrollIntoView({behavior:'smooth',block:'start'});c.classList.remove('rl-flash');void c.offsetWidth;c.classList.add('rl-flash')}},120)}else location.href=ROOT+'#events'}

/* ---------- the sheet (alerts + thrash talk share one) ---------- */
let sheet=null;
function open(html,wire){if(!sheet){sheet=document.createElement('div');sheet.id='rlSheet';sheet.hidden=true;sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');
  sheet.addEventListener('click',e=>{if(e.target===sheet)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sheet&&!sheet.hidden)close()});document.body.appendChild(sheet)}
  sheet.innerHTML=`<div class="box">${html}<button class="ghost" type="button" data-close>Close</button></div>`;sheet.hidden=false;
  sheet.querySelector('[data-close]').onclick=close;wire&&wire(sheet);const f=sheet.querySelector('button,input');if(f)f.focus()}
function close(){if(sheet)sheet.hidden=true}

/* ---------- phone alerts ---------- */
const PK='rngc-alerts';
function prefs(){try{return Object.assign({on:false,shots:'big',talk:true,live:true},JSON.parse(localStorage.getItem(PK)||'{}'))}catch(e){return{on:false,shots:'big',talk:true,live:true}}}
function savePrefs(p){try{localStorage.setItem(PK,JSON.stringify(p))}catch(e){}}
const ios=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const canPush=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
const keyBytes=k=>{const p='='.repeat((4-k.length%4)%4),r=atob((k+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(r,c=>c.charCodeAt(0))};
async function subscribe(p,hello){const perm=await Notification.requestPermission();if(perm!=='granted')throw Object.assign(new Error('blocked'),{blocked:true});
  const reg=await navigator.serviceWorker.register('/sw.js').then(()=>navigator.serviceWorker.ready);
  const {key}=await call('/push/key');if(!key)throw new Error('Phone alerts aren\'t switched on at the club yet.');
  let sub=await reg.pushManager.getSubscription();
  if(sub&&sub.options&&sub.options.applicationServerKey){const a=new Uint8Array(sub.options.applicationServerKey),b=keyBytes(key);if(a.length!==b.length||a.some((x,i)=>x!==b[i])){await sub.unsubscribe();sub=null}}
  if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(key)});
  await call('/push/sub',{sub:sub.toJSON(),shots:p.shots,talk:p.talk,live:p.live,hello:!!hello});return sub}
async function unsubscribe(){try{const reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();
  if(sub){await call('/push/off',{endpoint:sub.endpoint}).catch(()=>{});await sub.unsubscribe()}}catch(e){}}
function alertSheet(){const p=prefs();
  if(!tok())return open(`<h2>Live alerts</h2><p>Sign in with your club account to get big shots and thrash talk on your phone.</p>
    <button class="go" type="button" data-signin-rl><i class="ph-bold ph-sign-in"></i> Sign in</button>`,s=>{s.querySelector('[data-signin-rl]').onclick=()=>{close();
      const b=document.querySelector('[data-signin]');if(b)b.click();else location.href=ROOT}});
  if(!canPush()||(ios()&&!standalone()))return open(`<h2>Live alerts</h2><p>${ios()?'On iPhone, alerts only work from the club app on your home screen. Add it first, open it from the RNGC icon, then turn alerts on there.':'This browser can\'t do phone alerts. Try Chrome, or add the club app to your home screen.'}</p>
    ${typeof openGetApp==='function'?'<button class="go" type="button" data-getapp-rl><i class="ph-bold ph-download-simple"></i> Get the app</button>':''}`,s=>{const g=s.querySelector('[data-getapp-rl]');if(g)g.onclick=()=>{close();openGetApp()}});
  const blocked=Notification.permission==='denied';
  open(`<h2>Live alerts</h2><p>${blocked?'Alerts are blocked for this site. Open your browser\'s site settings, allow notifications for raidernationgolfclub.com, then come back.':'On event day we ping this phone. Pick what you want.'}</p>
   <div class="lbl">Shots</div>
   <label class="opt"><input type="radio" name="rlShots" value="big" ${p.shots==='big'?'checked':''}><span>Big shots only<small>Hole in one, eagles, new closest-to-pin and long-drive leader</small></span></label>
   <label class="opt"><input type="radio" name="rlShots" value="all" ${p.shots==='all'?'checked':''}><span>Every birdie too<small>Busy. Every group, every birdie</small></span></label>
   <label class="opt"><input type="radio" name="rlShots" value="off" ${p.shots==='off'?'checked':''}><span>No shot alerts</span></label>
   <div class="lbl">Also</div>
   <label class="opt"><input type="checkbox" id="rlTalk" ${p.talk?'checked':''}><span>Thrash talk<small>Club lines members send during the round</small></span></label>
   <label class="opt"><input type="checkbox" id="rlLive" ${p.live?'checked':''}><span>We're live<small>One note when the event starts</small></span></label>
   <button class="go" type="button" id="rlGo" ${blocked?'disabled':''}><i class="ph-bold ph-bell-ringing"></i> ${p.on?'Save':'Turn on alerts'}</button>
   ${p.on?'<button class="ghost" type="button" id="rlOff">Turn off alerts on this phone</button>':''}
   <div class="err" id="rlErr" role="alert"></div>`,s=>{const go=s.querySelector('#rlGo'),err=s.querySelector('#rlErr');
    go.onclick=async()=>{const n={on:true,shots:(s.querySelector('[name=rlShots]:checked')||{}).value||'big',talk:s.querySelector('#rlTalk').checked,live:s.querySelector('#rlLive').checked};
      go.disabled=true;err.textContent='';const first=!p.on;
      try{await subscribe(n,first);savePrefs(n);close();say(first?'Alerts are on. Watch for a test ping.':'Saved.');paint();if(typeof renderSettings==='function'&&typeof S!=='undefined'&&S.tab==='settings')renderSettings()}
      catch(x){err.textContent=x.blocked?'You said no to notifications. Allow them in your browser\'s site settings to turn alerts on.':x.status===401?'Your sign-in ran out. Sign in again.':(x.message&&!/fetch/i.test(x.message)?x.message:'We can\'t reach the club server. Check your signal and try again.')}
      finally{go.disabled=false}};
    const off=s.querySelector('#rlOff');if(off)off.onclick=async()=>{off.disabled=true;await unsubscribe();savePrefs(Object.assign(prefs(),{on:false}));close();say('Alerts are off on this phone.');paint();
      if(typeof renderSettings==='function'&&typeof S!=='undefined'&&S.tab==='settings')renderSettings()}})}
/* the Notifications page in Profile shows the same switch */
function card(){const p=prefs();return `<div class="card rl-card rise" style="margin:0 0 14px"><i class="ph-fill ph-bell-ringing" style="font-size:28px;color:#C8161F"></i>
  <div><b>Live event alerts</b><span>${p.on?{big:'On: big shots',all:'On: every birdie',off:'On: no shot alerts'}[p.shots]+(p.talk?', thrash talk':'')+(p.live?', we\'re live':''):'Big shots and thrash talk on event day, on this phone.'}</span></div>
  <button class="btn small${p.on?' ghost':''}" type="button" data-rl="alerts">${p.on?'Change':'Turn on'}</button></div>`}

/* ---------- thrash talk ---------- */
function talkSheet(){if(!tok())return alertSheet();
  if(!L.lines.length)return open(`<h2>Thrash talk</h2><p>Can't load the club's lines right now. Check your signal and try again.</p>`);
  const gs=GROUPS[L.ev.id]||[],gname=g=>'Group '+g.slice(1);let to='all',line=-1;
  open(`<h2>Thrash talk</h2><p>Pick who it's for and a line. Everyone with thrash talk on gets it, with your first name.</p>
   <div class="lbl">Who</div><div class="chips" id="rlTo"><button type="button" data-to="all" aria-pressed="true">Everybody</button>${gs.map(g=>`<button type="button" data-to="${g}" aria-pressed="false">${gname(g)}</button>`).join('')}</div>
   <div class="lbl">Line</div><div class="lines" id="rlLines">${L.lines.map((l,i)=>`<button type="button" data-line="${i}" aria-pressed="false">${esc(l)}</button>`).join('')}</div>
   <button class="go" type="button" id="rlSend" disabled><i class="ph-bold ph-megaphone"></i> Send it</button><div class="err" id="rlErr" role="alert"></div>
   ${L.admin?`<label class="opt" style="margin-top:12px"><input type="checkbox" id="rlTalkOn" ${L.talkOn?'checked':''}><span>Thrash talk on for everyone<small>Only David and Ross see this. Off stops it right away.</small></span></label>`:''}`,s=>{
    const send=s.querySelector('#rlSend'),err=s.querySelector('#rlErr');
    s.querySelectorAll('[data-to]').forEach(b=>b.onclick=()=>{to=b.dataset.to;s.querySelectorAll('[data-to]').forEach(x=>x.setAttribute('aria-pressed',x===b))});
    s.querySelectorAll('[data-line]').forEach(b=>b.onclick=()=>{line=+b.dataset.line;s.querySelectorAll('[data-line]').forEach(x=>x.setAttribute('aria-pressed',x===b));send.disabled=false});
    send.onclick=()=>{if(line<0)return;send.disabled=true;err.textContent='';
      call('/talk/send',{ev:L.ev.id,to,line}).then(()=>{close();say('Sent. Let them hear it.');setTimeout(poll,800)})
       .catch(x=>{err.textContent=x.status===429?'One line a minute. Let that one land first.':x.status===401?'Your sign-in ran out. Sign in again.':x.message||'We can\'t reach the club server.';send.disabled=false})};
    const sw=s.querySelector('#rlTalkOn');if(sw)sw.onchange=()=>call('/admin/talk',{ev:L.ev.id,on:sw.checked}).then(j=>{L.talkOn=j.talkOn;say(j.talkOn?'Thrash talk is on.':'Thrash talk is off for everyone.');paint()})
      .catch(()=>{sw.checked=!sw.checked;say('Couldn\'t change it. Check your signal.')})})}

/* scorecard leaderboard: a round red button for thrash talk (hole screens stay untouched: nothing scrolls there) */
if(ROOT){const f=document.createElement('button');f.id='rlTalkFab';f.type='button';f.hidden=true;f.setAttribute('aria-label','Thrash talk');f.innerHTML='<i class="ph-bold ph-megaphone"></i>';
  f.onclick=talkSheet;document.body.appendChild(f);addEventListener('hashchange',paint)}

poll();setInterval(()=>{if(!document.hidden)poll()},30000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-L.at>10000)poll()});
window.RNGCLIVE={banner,card,isLive,poll,alertSheet,talkSheet};
})();
