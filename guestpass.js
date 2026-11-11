/* RNGC guest pass (David, Nov 11 2026): players from other clubs at a club event scan a QR code and get the whole
   golf tracking system (scorecard, live leaderboard, side games, rounds and stats) on event day and for 72 hours after
   the event. Then the pass expires and the golf tab offers an upgrade. The upgrade price is not set yet (price study).

   Loads after the main script. Pieces:
   - leaders: "Guest pass QR" on an event card -> a QR code and a typed code for that event
   - guests: open the link (?pass=EVENT-CODE) -> name and club -> golf tab opens
   - golf tab: a bar with the time left; after expiry, the upgrade screen instead of "members only"
   The club server should issue and check passes (/admin/pass and /pass/redeem). Until it answers, PREVIEW mode makes
   the code on the phone, which anyone reading this file could copy, so it is only for the preview site. */
(function(){
'use strict';
const PASS_KEY='rngc-guest-pass',WANT_KEY='rngc-golf-upgrade-interest';
const AFTER_MS=72*3600e3;
const PREVIEW=true;              /* flip to false once the club server issues and checks passes */
const TZ='America/Los_Angeles';   /* club events are in California and Nevada */

/* ---------- time window (pure, tested) ---------- */
function tzOffsetMs(ms){            /* how far Pacific time is from UTC at that moment */
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:TZ,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).formatToParts(new Date(ms)).map(x=>[x.type,x.value]));
  return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second)-Math.floor(ms/1000)*1000;
}
function zoned(date,h,m,s){         /* a Pacific wall-clock time on that date, as epoch ms */
  const [y,mo,d]=date.split('-').map(Number),guess=Date.UTC(y,mo-1,d,h,m,s);
  return guess-tzOffsetMs(guess-tzOffsetMs(guess));
}
function windowFor(date){const start=zoned(date,0,0,0),dayEnd=zoned(date,23,59,59)+999;return {start,dayEnd,exp:dayEnd+AFTER_MS}}
function status(p,now){
  if(!p||!p.start||!p.exp)return 'none';
  if(now<p.start)return 'early';
  if(now<=p.dayEnd)return 'event';
  if(now<p.exp)return 'after';
  return 'expired';
}
const isOpen=st=>st==='event'||st==='after';
function leftText(ms){
  if(ms<=0)return 'ended';
  const h=Math.floor(ms/3600e3),d=Math.floor(h/24),m=Math.floor(ms%3600e3/6e4);
  return d?`${d} day${d>1?'s':''} ${h%24} hr`:h?`${h} hr ${m} min`:`${Math.max(1,m)} min`;
}
function previewCode(ev){let x=2166136261;for(const c of 'rngc-pass:'+ev){x^=c.charCodeAt(0);x=Math.imul(x,16777619)}
  const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';x>>>=0;for(let i=0;i<6;i++){s+=A[x%32];x=Math.floor(x/32)||(x^0x9e3779b9)>>>0}return s}
function parsePass(q){const m=/^([a-z0-9]{2,24})-([A-Z2-9]{6,12})$/i.exec(String(q||'').trim());return m?{ev:m[1].toLowerCase(),code:m[2].toUpperCase()}:null}

window.RNGCPASS={windowFor,status,leftText,previewCode,parsePass,AFTER_MS,
  get(){try{return JSON.parse(localStorage.getItem(PASS_KEY)||'null')}catch(e){return null}},
  active(){return isOpen(status(this.get(),Date.now()))}};
if(typeof document==='undefined'||typeof S==='undefined')return;   /* tests stop here */

/* ---------- app glue ---------- */
const P=window.RNGCPASS;
const evById=id=>(typeof EVENTS!=='undefined'?EVENTS:[]).find(e=>e.id===id);
const isLeader=()=>!!(S.authMe&&(S.authMe.role==='admin'||(S.authMe.leads||[]).length))||!!S.demo;
const fmt=ms=>new Date(ms).toLocaleString('en-US',{timeZone:TZ,weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
const savePass=p=>{try{localStorage.setItem(PASS_KEY,JSON.stringify(p))}catch(e){}};

(function(){const s=document.createElement('style');s.textContent=`
#v-golf.gp{display:flex;flex-direction:column}
#v-golf.gp iframe{flex:1;height:auto;min-height:0}
.gpbar{display:flex;align-items:center;gap:10px;justify-content:space-between;padding:8px 16px;background:var(--panel);border-bottom:1px solid var(--line);font-size:14px}
.gpbar b{font-weight:700}.gpbar span{color:var(--muted)}
.gpbar .btn{min-height:36px;padding:0 14px;font-size:14px;flex:none}
.gpup .opt{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:14px;margin-top:10px;text-align:left}
.gpup .opt b{display:block;font-family:var(--display);font-size:20px;text-transform:uppercase}
.gpup .opt small{color:var(--muted);font-size:13px}
.gpup .opt .pr{font-family:var(--display);font-weight:800;font-size:22px;text-align:right;white-space:nowrap}
.gpup .opt .pr small{display:block;font-family:var(--body);font-weight:600;font-size:11px}
.gpcode{text-align:center;font:700 26px/1.2 ui-monospace,monospace;letter-spacing:.12em;margin:0}
`;document.head.appendChild(s)})();

/* leaders: QR for an event */
async function issue(ev){
  try{if(!PREVIEW||authTok()){const r=await authCall('/admin/pass',{ev},authTok());if(r&&r.code)return r.code}}catch(e){if(!PREVIEW)throw e}
  return previewCode(ev);
}
async function showPassQR(ev){
  const e=evById(ev);if(!e)return;
  try{const [code,qr]=await Promise.all([issue(ev),loadQR()]);
    const link=location.origin+location.pathname+'?pass='+ev+'-'+code,w=windowFor(e.date);
    const q=qr(0,'M');q.addData(link);q.make();
    openSheet(`<h3 style="margin:0;text-align:center">Guest golf pass</h3>
     <p class="meta" style="text-align:center;margin:6px 0 12px">${esc(e.name)}. Guests scan with the phone camera and tap the link.</p>
     <div style="background:#fff;padding:14px;max-width:300px;margin:0 auto">${q.createSvgTag({cellSize:6,margin:0,scalable:true})}</div>
     <p class="meta" style="text-align:center;margin:14px 0 4px">No camera? Open the club app and type this pass code:</p>
     <p class="gpcode">${esc(ev.toUpperCase()+'-'+code)}</p>
     <p class="meta" style="text-align:center;margin:10px 0 0">Full golf tracking from ${esc(fmt(w.start))} until ${esc(fmt(w.exp))} (event day plus 72 hours).${PREVIEW?' Preview code: the live code comes from the club server.':''}</p>
     <div class="acts" style="display:flex;gap:8px;margin-top:14px"><button class="btn ghost" style="flex:1" data-gpshare="${esc(link)}"><i class="ph-bold ph-share-network"></i> Share link</button></div>`);
  }catch(err){toast(err.message||'Could not make the pass')}
}
window.passBtn=e=>isLeader()&&!isPast(e.date)?`<button class="btn small ghost" data-gpqr="${esc(e.id)}"><i class="ph-bold ph-qr-code"></i> Guest pass QR</button>`:'';

/* guests: open the link */
async function redeem(ev,code,name,club){
  const e=evById(ev);if(!e)throw new Error('That pass is for an event we can\'t find.');
  if(!PREVIEW||authTok()){try{const r=await authCall('/pass/redeem',{ev,code,name,club});if(r&&r.pass)return r.pass}catch(err){if(!PREVIEW)throw err}}
  if(code!==previewCode(ev))throw new Error('That pass code doesn\'t match this event.');
  return Object.assign({ev,name,club,ename:e.name,date:e.date,at:Date.now()},windowFor(e.date));
}
function openRedeem(pp){
  const e=evById(pp.ev);
  if(!e){toast('That pass is for an event we can\'t find.');return}
  const w=windowFor(e.date),st=status(w,Date.now());
  if(st==='expired'){showUpgrade({ename:e.name,exp:w.exp});return}
  const opp=(/vs (?:the )?(.+)$/i.exec(e.name)||[])[1]||'';
  openSheet(`<h3 style="margin:0">Guest golf pass</h3><p class="sub" style="margin:4px 0 10px">${esc(e.name)} - ${esc(e.where)}</p>
   <div class="card" style="padding:12px 14px;font-size:14px;color:var(--muted)">The full scorecard, live leaderboard, skins, Nassau and other side games, your rounds and stats. Good on event day and for 72 hours after, until ${esc(fmt(w.exp))}. No card needed.</div>
   <label class="meta" for="gpName" style="display:block;margin:12px 0 6px">Your name</label><input class="field" id="gpName" maxlength="24" autocomplete="name">
   <label class="meta" for="gpClub" style="display:block;margin:12px 0 6px">Your club</label><input class="field" id="gpClub" maxlength="40" value="${esc(opp)}">
   <div class="acts" style="margin-top:14px"><button class="btn full" id="gpGo" style="width:100%"><i class="ph-bold ph-golf"></i> ${st==='early'?'Save my pass':'Start golfing'}</button></div>`);
  $('#gpGo').addEventListener('click',async()=>{
    const name=$('#gpName').value.trim(),club=$('#gpClub').value.trim();
    if(!name){toast('Add your name for the scorecard');return}
    try{const p=await redeem(pp.ev,pp.code,name,club);savePass(p);closeSheet();syncGolf();
      if(status(p,Date.now())==='early')toast('Pass saved. It opens on '+fmt(p.start));else{toast('Welcome, '+name.split(' ')[0]+'. Golf is open.');setTab('golf')}}
    catch(err){toast(err.message)}});
}

/* upgrade screen: shown when the pass has ended */
function upgradeHTML(p){
  const want=(()=>{try{return localStorage.getItem(WANT_KEY)}catch(e){return null}})();
  return `<div class="card gate rise gpup" style="text-align:left"><h3>Your guest pass ended</h3>
   <p>${p&&p.ename?esc(p.ename)+'. ':''}${p&&p.exp?'Access ended '+esc(fmt(p.exp))+'. ':''}Your rounds and stats are still saved on this phone. Pick a plan and they're right where you left them.</p>
   <button class="card opt" data-gpwant><span><b>Golf subscription</b><small>The full golf tracking system: scorecard, GPS course data, side games, leaderboards, rounds and stats.</small></span><span class="pr">${want?'<i class="ph-bold ph-check"></i>':'Soon'}<small>${want?'On the list':'Price coming'}</small></span></button>
   <button class="card opt" data-gpjoin><span><b>Club membership</b><small>Golf plus events, the Raiders game map, ticket exchange and the member chat. Chapter plans add an official GHIN handicap.</small></span><span class="pr">$99<small>a year and up</small></span></button>
   <div class="acts"><button class="btn ghost" data-signin><i class="ph-bold ph-sign-in"></i> I'm already a member</button></div></div>`;
}
function showUpgrade(p){openSheet(upgradeHTML(p))}
const _showGate=window.showGate;
window.showGate=function(t){
  _showGate(t);
  const p=P.get();
  if(t==='golf'&&p&&status(p,Date.now())==='expired')$('#v-gate').innerHTML=upgradeHTML(p);
  if(t==='golf'&&(!p||status(p,Date.now())==='none')){const c=document.querySelector('#v-gate .gate');if(c)c.insertAdjacentHTML('beforeend',`<form class="gpform" style="margin-top:14px;display:flex;gap:8px"><input class="field" id="gpCode" placeholder="Guest pass code" autocapitalize="characters" style="flex:1" aria-label="Guest pass code"><button class="btn ghost">Use</button></form>`)}
  if(t==='golf'&&p&&status(p,Date.now())==='early')$('#v-gate').innerHTML=`<div class="card gate rise"><i class="ph-fill ph-calendar-check"></i><h3>Your pass opens ${esc(fmt(p.start))}</h3><p>${esc(p.ename)}. Come back on event day; golf opens on its own.</p></div>`;
};

/* golf tab: time-left bar for guests */
function syncGolf(){
  const v=$('#v-golf');if(!v)return;
  const p=P.get(),st=status(p,Date.now()),guest=!authTok()&&isOpen(st);
  v.classList.toggle('gp',guest);
  let bar=v.querySelector('.gpbar');
  if(!guest){if(bar)bar.remove();return}
  if(!bar){bar=document.createElement('div');bar.className='gpbar';v.insertBefore(bar,v.firstChild)}
  bar.innerHTML=`<div><b>Guest pass</b> <span>${st==='event'?'event day, then 72 hours':esc(leftText(p.exp-Date.now()))+' left'}</span></div><button class="btn small ghost" data-gpup>Keep it</button>`;
}
setInterval(()=>{syncGolf();const p=P.get();if(S.tab==='golf'&&!authTok()&&p&&status(p,Date.now())==='expired'&&!gateOn)setTab('golf')},60e3);

document.addEventListener('submit',e=>{if(!e.target.classList.contains('gpform'))return;e.preventDefault();
  if(!window.rngcTryPassCode($('#gpCode').value))toast('That code is not a guest pass for a club event.')});
document.addEventListener('click',e=>{
  const q=e.target.closest('[data-gpqr]');if(q){showPassQR(q.dataset.gpqr);return}
  const sh=e.target.closest('[data-gpshare]');if(sh){const text='Guest golf pass for '+(evById((parsePass(sh.dataset.gpshare.split('pass=')[1])||{}).ev)||{name:'the event'}).name+': '+sh.dataset.gpshare;
    if(navigator.share)navigator.share({text}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(sh.dataset.gpshare).then(()=>toast('Link copied'));return}
  if(e.target.closest('[data-gpup]')){showUpgrade(Object.assign({},P.get(),{exp:null,ename:null}));const h=$('#sheet h3');if(h)h.textContent='Keep golf after your pass';return}
  if(e.target.closest('[data-gpwant]')){try{localStorage.setItem(WANT_KEY,String(Date.now()))}catch(err){}
    /* the club server gets this list once it has the endpoint; nothing is charged */
    try{if(!PREVIEW)authCall('/pass/interest',{ev:(P.get()||{}).ev})}catch(err){}
    toast('You\'re on the list. We\'ll tell you the price first.');if($('#sheet').classList.contains('on'))closeSheet();if(gateOn&&S.tab==='golf')setTab('golf');return}
  if(e.target.closest('[data-gpjoin]')){closeSheet();S.joinSent=null;S.hpage='join';setTab('home');return}
});

/* a typed pass code works from the sign-in "setup code" path too: EVENT-CODE */
window.rngcTryPassCode=t=>{const pp=parsePass(t);if(pp&&evById(pp.ev)){openRedeem(pp);return true}return false};

/* open from the QR link */
const q=new URLSearchParams(location.search).get('pass');
if(q){const pp=parsePass(q);history.replaceState(null,'',location.pathname+location.hash);
  if(pp)setTimeout(()=>openRedeem(pp),300);else toast('That pass link is not complete.')}
syncGolf();
const _setTab=window.setTab;window.setTab=function(t){_setTab(t);syncGolf()};
})();
