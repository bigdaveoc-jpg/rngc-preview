/* Raider Bucks (David, Nov 12 2026): club points members earn, play golf side bets with, and trade for club merch.
   Loaded by the club app (index.html) and the scorecard (scorecard/index.html), so both read one wallet.

   Rules built in, to keep Bucks a loyalty points program and not money:
   - Bucks can't be bought, sold, transferred for cash or cashed out. They are earned by playing and showing up.
   - Bets in Bucks are golf side games among the players in the round (skill), never on NFL games.
   - A wallet can't go below zero.
   The amounts below are demo numbers until David sets them.
   Club server (rngc-club, see drafts/rngc/server in the BOSS repo): when CLUB_API is set and the member is signed in, the
   wallet, rules and store come from the server and every earn, bet and trade is posted there (queued when there's no
   signal on the course). With CLUB_API empty the wallet lives on this phone, as in the preview. */
(function(){
'use strict';
const KEY='rngc-bucks',CACHE='rngc-bucks-server',OUTBOX='rngc-bucks-outbox';
const CLUB_API='https://rngc-club.137.184.188.41.sslip.io';   /* club server live 2026-11-12 */
const api=()=>{try{const o=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&localStorage.getItem('rngc-club-api');if(o)return o.replace(/\/$/,'')}catch(e){}return CLUB_API};
const tok=()=>{try{return localStorage.getItem('rngc-auth-token')||''}catch(e){return ''}};
const remote=()=>!!api()&&!!tok();
async function club(path,body){
  const t=tok(),r=await fetch(api()+path,{method:body?'POST':'GET',headers:Object.assign(body?{'Content-Type':'application/json'}:{},t?{Authorization:'Bearer '+t}:{}),body:body?JSON.stringify(body):undefined});
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok)throw Object.assign(new Error(j.error||'Could not reach the club server.'),{status:r.status});
  return j}
const jget=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(e){return d}};
const jset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const changed=()=>{try{window.dispatchEvent(new Event('rngc-bucks'))}catch(e){}};
/* server mode: the last wallet the server sent, plus posts waiting for signal */
async function sync(){if(!remote())return null;
  try{const [w,rules]=await Promise.all([club('/bucks/me'),RULES?Promise.resolve(null):club('/bucks/rules').catch(()=>null)]);
    if(rules){RULES=rules;applyRules(rules)}
    const before=JSON.stringify(jget(CACHE,{})&&[jget(CACHE,{}).tx,jget(CACHE,{}).orders,jget(CACHE,{}).bal]),now=[w.tx||[],w.orders||[],w.bal];
    jset(CACHE,{tx:now[0],orders:now[1],bal:now[2],at:Date.now()});if(before!==JSON.stringify(now)||rules)changed();return w}   /* redraw only when something changed */
  catch(e){return null}}
let RULES=null,flushing=false,lastSync=0;
async function flush(){if(!remote()||flushing)return;flushing=true;
  try{let q=jget(OUTBOX,[]);while(q.length){const it=q[0];
      try{await club(it.path,it.body)}catch(e){if(!e.status||e.status>=500||e.status===401)break}   /* keep it for later; a 4xx answer is final */
      q=jget(OUTBOX,[]).filter(x=>x.id!==it.id);jset(OUTBOX,q)}}
  finally{flushing=false}await sync()}
function queue(path,body){const q=jget(OUTBOX,[]);q.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),path,body});jset(OUTBOX,q);flush()}
const EARN={                                 /* demo amounts, David sets the real ones */
  welcome:{amt:250,label:'Welcome to Raider Bucks'},
  round:{amt:25,label:'Posted a round',perDay:2},
  event:{amt:50,label:'Played a club event'},
  ffWin:{amt:20,label:'Fantasy: weekly win (live league)'},
  ffHigh:{amt:50,label:'Fantasy: weekly high score (live league)'}
};
const STORE=[                                /* demo catalog: real items and Bucks prices come from the club shop */
  {id:'marker',n:'Ball marker',b:400,ic:'coin'},
  {id:'tees',n:'Pack of club tees',b:300,ic:'golf'},
  {id:'towel',n:'Club golf towel',b:900,ic:'flag'},
  {id:'hat',n:'Club hat',b:1500,ic:'baseball-cap'},
  {id:'cover',n:'Driver head cover',b:2500,ic:'shield'},
  {id:'polo',n:'Club polo',b:4000,ic:'t-shirt'}
];
const fmtN=n=>Math.round(n).toLocaleString('en-US');
const fmt=n=>(n<0?'-':'')+fmtN(Math.abs(n))+' RB';
function load(){if(remote()){const c=jget(CACHE,null);return c?{tx:c.tx,orders:c.orders}:{tx:[],orders:[]}}try{const w=JSON.parse(localStorage.getItem(KEY)||'null');if(w&&Array.isArray(w.tx))return w}catch(e){}return {tx:[],orders:[]}}
function store(w){try{localStorage.setItem(KEY,JSON.stringify(w))}catch(e){}}
const bal=w=>w.tx.reduce((s,t)=>s+t.amt,0);
const sameDay=(a,b)=>new Date(a).toDateString()===new Date(b).toDateString();
/* one posting per key, so a reload or a second tap never pays twice; never below zero */
function post(k,amt,why,kind,now){
  const w=load();now=now||Date.now();
  if(!k||w.tx.some(t=>t.k===k))return {ok:false,dup:true,bal:bal(w)};
  if(kind==='round'){const n=w.tx.filter(t=>t.kind==='round'&&sameDay(t.at,now)).length;if(n>=EARN.round.perDay)return {ok:false,cap:true,bal:bal(w)}}
  const b=bal(w),a=Math.round(Math.max(amt,-b));
  w.tx.unshift({k,amt:a,why:String(why||'').slice(0,80),kind:kind||'other',at:now});
  store(w);return {ok:true,amt:a,bal:b+a};
}
function earn(type,k,now){const e=EARN[type];if(!e)return {ok:false};if(remote()){queue('/bucks/earn',{type,key:String(k)});return {ok:true,queued:true}}return post(type+':'+k,e.amt,e.label,type,now)}
/* a round's side-bet result in Bucks: the server checks the caps; the phone wallet floors at zero */
function bet(rid,amt,where){if(remote()){queue('/bucks/bet',{rid:String(rid),amt:Math.round(amt),where:String(where||'round').slice(0,40)});return {ok:true,queued:true}}
  return post('bets:'+rid,amt,(amt>0?'Won':'Lost')+' side bets, '+(where||'round'),'bet')}
function applyRules(r){if(r.earn)for(const [k,v] of Object.entries(r.earn))EARN[k]=Object.assign({},EARN[k]||{},v);if(r.welcome)EARN.welcome.amt=r.welcome;
  if(Array.isArray(r.store)&&r.store.length){STORE.length=0;r.store.forEach(x=>STORE.push(x))}}
function ensureWelcome(){if(remote()){if(Date.now()-lastSync>30e3){lastSync=Date.now();sync()}return}const w=load();if(!w.tx.some(t=>t.kind==='welcome'))post('welcome',EARN.welcome.amt,EARN.welcome.label,'welcome')}
async function redeemAsync(id,extra){if(!remote())return redeem(id);try{const r=await club('/bucks/redeem',Object.assign({item:id},extra||{}));await sync();return r}catch(e){return {ok:false,why:e.message}}}
function redeem(id,now){
  const it=STORE.find(x=>x.id===id),w=load();if(!it)return {ok:false,why:'No such item'};
  if(bal(w)<it.b)return {ok:false,why:'Not enough Raider Bucks yet'};
  now=now||Date.now();const oid='o'+now.toString(36);
  w.tx.unshift({k:'order:'+oid,amt:-it.b,why:'Traded for: '+it.n,kind:'order',at:now});
  (w.orders=w.orders||[]).unshift({id:oid,item:it.id,n:it.n,b:it.b,at:now,status:'requested'});
  store(w);return {ok:true,order:oid,bal:bal(w)};
}
window.RNGCBUCKS={KEY,EARN,STORE,fmt,fmtN,load,post,earn,bet,redeem,redeemAsync,ensureWelcome,sync,flush,club,api,remote,
  balance(){if(remote()){const c=jget(CACHE,null);return c&&typeof c.bal==='number'?c.bal:0}return bal(load())},
  /* the scorecard's money() asks which currency a bet is in */
  cur(){return window.__cur||'usd'}};
if(typeof document!=='undefined'&&remote()){flush();window.addEventListener('online',flush)}
if(typeof document==='undefined'||!document.getElementById('v-home'))return;   /* tests and the scorecard stop here */

/* ---------- club app: wallet card on Home and the wallet sheet ---------- */
const B=window.RNGCBUCKS;
(function(){const s=document.createElement('style');s.textContent=`
.rbcard{display:flex;align-items:center;gap:12px;width:100%;text-align:left;margin-top:12px;padding:14px;background:linear-gradient(135deg,rgba(213,218,225,.16),rgba(213,218,225,.03) 60%),var(--panel)}
.rbcard i.big{font-size:34px;color:var(--silver)}
.rbcard b{display:block;font-family:var(--display);font-size:26px;font-weight:800;line-height:1}
.rbcard span{color:var(--muted);font-size:13px}
.rbcard .go{margin-left:auto;color:var(--muted);font-size:20px}
.rbs .bal{text-align:center;margin:4px 0 10px}
.rbs .bal b{display:block;font-family:var(--display);font-size:44px;font-weight:800;line-height:1}
.rbs .bal span{color:var(--muted);font-size:13px;text-transform:uppercase;letter-spacing:.1em}
.rbs .row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}
.rbs .row:first-child{border-top:0}
.rbs .row small{display:block;color:var(--muted);font-size:12px}
.rbs .row .v{font-family:var(--display);font-weight:800;font-size:18px;white-space:nowrap;font-variant-numeric:tabular-nums}
.rbs .row .v.up{color:#fff}.rbs .row .v.dn{color:var(--muted)}
.rbs .items{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.rbs .item{padding:12px;display:flex;flex-direction:column;gap:6px}
.rbs .item i{font-size:28px;color:var(--silver-2)}
.rbs .item b{font-size:15px}
.rbs .item .p{font-family:var(--display);font-weight:800;font-size:18px}
.rbs .item .btn{min-height:38px;font-size:14px;padding:0 12px}
.rbs .bar{height:6px;border-radius:3px;background:var(--panel-2);overflow:hidden}.rbs .bar i{display:block;height:100%;background:var(--silver-2)}
`;document.head.appendChild(s)})();

window.bucksCard=function(){B.ensureWelcome();return `<button class="card rbcard" data-rbopen><i class="ph-fill ph-coins big"></i><div><b>${B.fmtN(B.balance())} RB</b><span>Raider Bucks: earn them golfing, play side bets, trade for club gear</span></div><i class="ph-bold ph-caret-right go"></i></button>`};
let tab='wallet';
function sheetHTML(){
  const w=B.load(),b=B.balance(),seg=(k,t)=>`<button class="chip" data-rbtab="${k}" aria-pressed="${tab===k}">${t}</button>`;
  const when=t=>new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric'});
  let body='';
  if(tab==='wallet')body=`<div class="card">${w.tx.slice(0,25).map(t=>`<div class="row"><span>${esc(t.why)}<small>${when(t.at)}</small></span><span class="v ${t.amt>=0?'up':'dn'}">${t.amt>0?'+':''}${B.fmt(t.amt)}</span></div>`).join('')||'<p class="sub" style="margin:0">Nothing yet.</p>'}</div>
    ${(w.orders||[]).length?`<h3 class="sec" style="font-size:20px">Gear on the way</h3><div class="card">${w.orders.map(o=>`<div class="row"><span>${esc(o.n)}<small>Requested ${when(o.at)}. A club leader confirms and ships it.</small></span><span class="v dn">${B.fmt(-o.b)}</span></div>`).join('')}</div>`:''}`;
  if(tab==='earn')body=`<div class="card">${Object.values(B.EARN).filter(e=>e!==B.EARN.welcome).map(e=>`<div class="row"><span>${esc(e.label)}${e.perDay?`<small>Up to ${e.perDay} a day</small>`:''}</span><span class="v up">+${B.fmt(e.amt)}</span></div>`).join('')}
    <div class="row"><span>Golf side bets in Raider Bucks<small>Skins, Nassau and custom bets in the scorecard. Pick "Raider Bucks" on the Side bets page; winnings land here when the round is saved.</small></span><span class="v">+/-</span></div></div>`;
  if(tab==='store')body=`<div class="items">${B.STORE.map(it=>`<div class="card item"><i class="ph-bold ph-${it.ic}"></i><b>${esc(it.n)}</b><span class="p">${B.fmt(it.b)}</span>
    ${b>=it.b?`<button class="btn small" data-rbbuy="${it.id}">Trade</button>`:`<div class="bar" aria-label="${Math.round(b/it.b*100)}% of the way"><i style="width:${Math.min(100,b/it.b*100)}%"></i></div><small class="sub" style="margin:0">${B.fmtN(it.b-b)} to go</small>`}</div>`).join('')}</div>`;
  return `<div class="rbs"><div class="bal"><b>${B.fmtN(b)}</b><span>Raider Bucks</span></div>
   <div class="seg" style="margin-top:0;justify-content:center">${seg('wallet','Wallet')}${seg('earn','How to earn')}${seg('store','Club store')}</div>
   <div style="margin-top:12px">${body}</div>
   <div class="card privacy"><i class="ph-bold ph-info"></i><span>Raider Bucks are club points, not money: they can't be bought, sold or cashed out, and bets in Bucks are golf side games among the players in your round. ${B.remote()?'Kept by the club server.':'Demo amounts and demo store items; saved on this phone until the club server is on.'} <a href="/bucks-rules/">Full rules</a></span></div></div>`;
}
const draw=()=>openSheet(sheetHTML());
/* server answers arrive after the sheet opened: redraw what's on screen */
window.addEventListener('rngc-bucks',()=>{const sh=document.getElementById('sheet');if(sh&&sh.classList.contains('on')&&sh.querySelector('.rbs'))draw();else if(typeof S!=='undefined'&&S.tab==='home'&&typeof renderHome==='function'&&document.querySelector('[data-rbopen]'))renderHome()});
document.addEventListener('click',e=>{
  if(e.target.closest('[data-rbopen]')){B.ensureWelcome();tab='wallet';draw();return}
  const t=e.target.closest('[data-rbtab]');if(t){tab=t.dataset.rbtab;draw();return}
  const by=e.target.closest('[data-rbbuy]');if(by){const it=B.STORE.find(x=>x.id===by.dataset.rbbuy);
    if(!confirm('Trade '+B.fmt(it.b)+' for the '+it.n.toLowerCase()+'? A club leader confirms and ships it.'))return;
    B.redeemAsync(it.id).then(r=>{toast(r.ok?'Requested. '+B.fmtN(B.balance())+' RB left.':r.why);tab='wallet';draw();
      if(S.tab==='home'&&typeof renderHome==='function')renderHome()});return}
});
})();
