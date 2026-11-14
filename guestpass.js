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
/* PREVIEW makes codes on the phone; it turns off on its own once bucks.js has the club server address (CLUB_API) */
const PREVIEW=!(typeof window!=='undefined'&&window.RNGCBUCKS&&window.RNGCBUCKS.api());
const club=(path,body)=>window.RNGCBUCKS.club(path,body);
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
.gpqr{position:relative;background:#fff;padding:14px;border-radius:12px;max-width:300px;margin:0 auto;box-shadow:0 0 0 3px var(--silver),0 10px 30px rgba(0,0,0,.45)}
.gpqr svg{display:block;width:100%;height:auto}
.gpqr .gplogo{position:absolute;left:50%;top:50%;width:22%;aspect-ratio:120/140;transform:translate(-50%,-50%);background:#fff;border-radius:10px;padding:4px;box-sizing:content-box;display:flex}
.gpqr .gplogo img{width:100%;height:100%;display:block}
.gpqr.gpload{aspect-ratio:1;display:flex;align-items:center;justify-content:center;color:#555;font-size:14px}
.gphome{padding:16px;margin:0 0 16px;border:1px solid var(--silver);text-align:center;background:radial-gradient(120% 80% at 50% 0,rgba(213,218,225,.14),transparent 60%),var(--panel)}
.gphome .tag{display:inline-flex;align-items:center;gap:6px;font:700 13px/1 var(--display);letter-spacing:.08em;text-transform:uppercase;color:var(--bg);background:var(--silver);padding:6px 10px;border-radius:999px}
.gphome h3{font-family:var(--display);font-size:24px;text-transform:uppercase;margin:10px 0 2px}
.gphome .meta{margin:0 0 14px}
.gphome .gpqr{max-width:260px}
.gphome .gpcode{margin:14px 0 12px;font-size:22px}
.gphome .acts{display:flex;gap:8px}
.gphome .acts .btn{flex:1}
`;document.head.appendChild(s)})();

/* leaders: QR for an event */
async function issue(ev){
  if(!PREVIEW){const r=await club('/admin/pass',{ev});return r.code}
  return previewCode(ev);
}
/* one code per event, made once and kept for this visit */
const qrCache={};
async function passData(ev){
  if(qrCache[ev])return qrCache[ev];
  const [code,qr]=await Promise.all([issue(ev),loadQR()]);
  const link=location.origin+location.pathname+'?pass='+ev+'-'+code;
  const q=qr(0,'H');q.addData(link);q.make();   /* H: the club mark in the middle still scans */
  return qrCache[ev]={code,link,svg:q.createSvgTag({cellSize:6,margin:0,scalable:true})};
}
const qrBox=d=>`<div class="gpqr">${d.svg}<span class="gplogo"><img src="assets/logo/rngc-mark.svg" alt=""></span></div>`;
async function showPassQR(ev){
  const e=evById(ev);if(!e)return;
  try{const d=await passData(ev),w=windowFor(e.date);
    openSheet(`<h3 style="margin:0;text-align:center">Guest golf pass</h3>
     <p class="meta" style="text-align:center;margin:6px 0 12px">${esc(e.name)}. Guests scan with the phone camera and tap the link.</p>
     ${qrBox(d)}
     <p class="meta" style="text-align:center;margin:14px 0 4px">No camera? Open the club app and type this pass code:</p>
     <p class="gpcode">${esc(ev.toUpperCase()+'-'+d.code)}</p>
     <p class="meta" style="text-align:center;margin:10px 0 0">Full golf tracking from ${esc(fmt(w.start))} until ${esc(fmt(w.exp))} (event day plus 72 hours).${PREVIEW?' Preview code: the live code comes from the club server.':''}</p>
     <div class="acts" style="display:flex;gap:8px;margin-top:14px"><button class="btn ghost" style="flex:1" data-gpshare="${esc(d.link)}"><i class="ph-bold ph-share-network"></i> Share link</button></div>`);
  }catch(err){toast(err.message||'Could not make the pass')}
}
/* event day: the guest pass QR sits at the top of the leaders' Home screen (David, Nov 14 2026: "on the day of put the
   qr code on Ross's home screen"). Leaders only, only on the event's own day in Pacific time. */
const todayPT=()=>new Date().toLocaleDateString('en-CA',{timeZone:TZ});
window.passHomeCard=function(){
  if(!isLeader())return '';
  const t=todayPT(),e=(typeof EVENTS!=='undefined'?EVENTS:[]).find(x=>x.date===t&&!x.status&&(typeof SCORECARD_EVENTS==='undefined'||SCORECARD_EVENTS.includes(x.id)));
  if(!e)return '';
  const d=qrCache[e.id];
  if(!d)setTimeout(()=>passData(e.id).then(()=>{const b=document.getElementById('gphome');if(b)b.outerHTML=window.passHomeCard()})
    .catch(err=>{const b=document.querySelector('#gphome .gpqr');if(b)b.textContent=err.message||'Could not make the pass. Pull down to try again.'}),0);
  return `<div class="card gphome rise" id="gphome"><span class="tag"><i class="ph-fill ph-qr-code"></i> Today &middot; Guest golf pass</span>
   <h3>${esc(e.name)}</h3><p class="meta">Guests scan with the phone camera. Live scorecard, side games and stats, today plus 72 hours.</p>
   ${d?qrBox(d):'<div class="gpqr gpload">Making the code...</div>'}
   <p class="gpcode">${d?esc(e.id.toUpperCase()+'-'+d.code):'&nbsp;'}</p>
   <div class="acts"><button class="btn" data-gpshare="${d?esc(d.link):''}"${d?'':' disabled'}><i class="ph-bold ph-share-network"></i> Share link</button><button class="btn ghost" data-gpqr="${esc(e.id)}"><i class="ph-bold ph-arrows-out"></i> Full screen</button></div></div>`;
};
window.passBtn=e=>isLeader()&&!isPast(e.date)?`<button class="btn small ghost" data-gpqr="${esc(e.id)}"><i class="ph-bold ph-qr-code"></i> Guest pass QR</button>`:'';

/* guests: open the link */
async function redeem(ev,code,name,clubName){
  const e=evById(ev);if(!e)throw new Error('That pass is for an event we can\'t find.');
  if(!PREVIEW){const r=await club('/pass/redeem',{ev,code,name,club:clubName});return r.pass}
  if(code!==previewCode(ev))throw new Error('That pass code doesn\'t match this event.');
  return Object.assign({ev,name,club:clubName,ename:e.name,date:e.date,at:Date.now()},windowFor(e.date));
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
    if(!PREVIEW){const gp=P.get()||{};club('/pass/interest',{pass:gp.token||'',ev:gp.ev||''}).catch(()=>{})}
    toast('You\'re on the list. We\'ll tell you the price first.');if($('#sheet').classList.contains('on'))closeSheet();if(gateOn&&S.tab==='golf')setTab('golf');return}
  if(e.target.closest('[data-gpjoin]')){closeSheet();S.joinSent=null;S.hpage='join';setTab('home');return}
});

/* member guest links (David, Nov 13 2026): a member golfing with a non-member sends one link (?guest=CODE, plus &join=LIVE
   when it comes from a live round). Each person who opens it gets 72 hours of golf from that moment: Golf tab only, every
   other tab stays locked. No cap on passes, for the most exposure. */
function openGuestClaim(code,join){
  const goGolf=()=>{setTab('golf');if(join){const fr=$('#golfFrame');if(fr)fr.src='scorecard/?join='+encodeURIComponent(join)+'#/me'}};
  if(authTok()){if(join)goGolf();else toast('You\'re a member, golf is already open.');return}
  const p0=P.get();if(p0&&isOpen(status(p0,Date.now()))){goGolf();return}
  club('/pass/look',{code}).then(r=>{
    openSheet(`<h3 style="margin:0">${esc(r.by)} gave you 72 hours of golf</h3><p class="sub" style="margin:4px 0 10px">Raider Nation Golf Club guest pass. No card, no sign-up.</p>
     <div class="card" style="padding:12px 14px;font-size:14px;color:var(--muted)">The live scorecard${join?' for today\'s round':''}, side games like skins and Nassau, GPS course info, your rounds and stats. Good for 72 hours from now.</div>
     <label class="meta" for="gpName" style="display:block;margin:12px 0 6px">Your name</label><input class="field" id="gpName" maxlength="24" autocomplete="name">
     <div class="acts" style="margin-top:14px"><button class="btn full" id="gpGo" style="width:100%"><i class="ph-bold ph-golf"></i> Start golfing</button></div>
     <p class="meta" style="text-align:center;margin:10px 0 0">Already a member? <button class="linkbtn" data-signin style="margin:0">Sign in</button></p>`);
    $('#gpGo').addEventListener('click',async()=>{const name=$('#gpName').value.trim();if(name.length<2){toast('Add your name for the scorecard');return}
      const b=$('#gpGo');b.disabled=true;
      try{const r2=await club('/pass/claim',{code,name});savePass(r2.pass);closeSheet();syncGolf();toast('Welcome, '+name.split(' ')[0]+'. Golf is open for 72 hours.');goGolf()}
      catch(err){b.disabled=false;toast(err.message)}});
  }).catch(err=>toast(err.message));
}
{const gq=new URLSearchParams(location.search),gc=gq.get('guest'),gj=(gq.get('join')||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5);
  if(gc){history.replaceState(null,'',location.pathname+location.hash);setTimeout(()=>openGuestClaim(gc,gj),400)}}

/* a typed pass code works from the sign-in "setup code" path too: EVENT-CODE */
window.rngcTryPassCode=t=>{const pp=parsePass(t);if(pp&&evById(pp.ev)){openRedeem(pp);return true}return false};

/* open from the QR link */
const q=new URLSearchParams(location.search).get('pass');
if(q){const pp=parsePass(q);history.replaceState(null,'',location.pathname+location.hash);
  if(pp)setTimeout(()=>openRedeem(pp),300);else toast('That pass link is not complete.')}
/* server mode: a pass must carry the server's signature and still be good, or it is dropped */
if(!PREVIEW){const gp=P.get();if(gp){const drop=()=>{try{localStorage.removeItem(PASS_KEY)}catch(e){}syncGolf();if(S.tab==='golf')setTab('golf')};
  if(!gp.token)drop();else club('/pass/check',{pass:gp.token}).then(r=>{if(!r.ok||r.status==='invalid')drop()}).catch(()=>{})}}
/* the golf Events page asks for the QR from inside the golf screen (David, Nov 14 2026: "where did the QR code go, so Ross can just share that") */
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data&&e.data.gpqr&&isLeader())showPassQR(String(e.data.gpqr))});
syncGolf();
const _setTab=window.setTab;window.setTab=function(t){_setTab(t);syncGolf()};
})();
