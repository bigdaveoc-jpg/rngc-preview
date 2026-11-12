/* Raider Bucks (David, Nov 12 2026): club points members earn, play golf side bets with, and trade for club merch.
   Loaded by the club app (index.html) and the scorecard (scorecard/index.html), so both read one wallet.

   Rules built in, to keep Bucks a loyalty points program and not money:
   - Bucks can't be bought, sold, transferred for cash or cashed out. They are earned by playing and showing up.
   - Bets in Bucks are golf side games among the players in the round (skill), never on NFL games.
   - A wallet can't go below zero.
   The amounts below are demo numbers until David sets them. Until the club server keeps the ledger, the wallet lives on
   this phone, so a member could edit it; the live version keeps balances on the server. */
(function(){
'use strict';
const KEY='rngc-bucks';
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
function load(){try{const w=JSON.parse(localStorage.getItem(KEY)||'null');if(w&&Array.isArray(w.tx))return w}catch(e){}return {tx:[],orders:[]}}
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
function earn(type,k,now){const e=EARN[type];if(!e)return {ok:false};return post(type+':'+k,e.amt,e.label,type,now)}
function ensureWelcome(){const w=load();if(!w.tx.some(t=>t.kind==='welcome'))post('welcome',EARN.welcome.amt,EARN.welcome.label,'welcome')}
function redeem(id,now){
  const it=STORE.find(x=>x.id===id),w=load();if(!it)return {ok:false,why:'No such item'};
  if(bal(w)<it.b)return {ok:false,why:'Not enough Raider Bucks yet'};
  now=now||Date.now();const oid='o'+now.toString(36);
  w.tx.unshift({k:'order:'+oid,amt:-it.b,why:'Traded for: '+it.n,kind:'order',at:now});
  (w.orders=w.orders||[]).unshift({id:oid,item:it.id,n:it.n,b:it.b,at:now,status:'requested'});
  store(w);return {ok:true,order:oid,bal:bal(w)};
}
window.RNGCBUCKS={KEY,EARN,STORE,fmt,fmtN,load,post,earn,redeem,ensureWelcome,
  balance(){return bal(load())},
  /* the scorecard's money() asks which currency a bet is in */
  cur(){return window.__cur||'usd'}};
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
   <div class="card privacy"><i class="ph-bold ph-info"></i><span>Raider Bucks are club points, not money: they can't be bought, sold or cashed out, and bets in Bucks are golf side games among the players in your round. Demo amounts and demo store items; saved on this phone until the club database is built.</span></div></div>`;
}
const draw=()=>openSheet(sheetHTML());
document.addEventListener('click',e=>{
  if(e.target.closest('[data-rbopen]')){B.ensureWelcome();tab='wallet';draw();return}
  const t=e.target.closest('[data-rbtab]');if(t){tab=t.dataset.rbtab;draw();return}
  const by=e.target.closest('[data-rbbuy]');if(by){const it=B.STORE.find(x=>x.id===by.dataset.rbbuy);
    if(!confirm('Trade '+B.fmt(it.b)+' for the '+it.n.toLowerCase()+'? A club leader confirms and ships it.'))return;
    const r=B.redeem(it.id);toast(r.ok?'Requested. '+B.fmtN(r.bal)+' RB left.':r.why);tab='wallet';draw();
    if(S.tab==='home'&&typeof renderHome==='function')renderHome();return}
});
})();
