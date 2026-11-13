/* Club news + chapter tools (David, Nov 13 2026: "creating club news" and "the admin piece for the chapter presidents").
   - Club news posted in the app shows first in Club news, for everyone. A post can carry one photo (shrunk on the phone
     first); without one, the chapter's photo goes with it.
   - Settings > Chapter tools, for club admins and chapter presidents: post news for your chapters, take a post down,
     edit your chapter's event (details: name, date, where, price, details, cancelled; and on event day groups, game,
     start), message your chapter.
   - Event details saved on the club server reach everyone's app when it opens (kept on the phone for no signal).
   The club server checks every rule again (who can post for which chapter, who can edit which event). */
(function(){
const CLUB_API='https://rngc-club.137.184.188.41.sslip.io';
const api=()=>{try{const o=localStorage.getItem('rngc-club-api');if(o)return o.replace(/\/$/,'')}catch(e){}return CLUB_API};
const tok=()=>{try{return localStorage.getItem('rngc-auth-token')||''}catch(e){return ''}};
const call=(path,body)=>fetch(api()+path,{method:body?'POST':'GET',cache:'no-store',
  headers:Object.assign(tok()?{Authorization:'Bearer '+tok()}:{},body?{'Content-Type':'application/json'}:{}),body:body?JSON.stringify(body):undefined})
  .then(async r=>{const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||'The club server had a problem.'),{status:r.status});return j});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=m=>{if(typeof toast==='function')toast(m)};
const PHOTO={Club:'img_5442',National:'img_3410',SoCal:'img_3120',NorCal:'img_3402',Nevada:'img_1626'};
const CHS=['Club','National','SoCal','NorCal','Nevada'];
const day=t=>new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric'});
const picOf=p=>p.img?api()+'/news/img?id='+p.id:'assets/old-site/photos/'+(PHOTO[p.chapter]||PHOTO.Club)+'.jpg';
let POSTS=[],PIC=null,SRV_EVS=[];

function me(){return (typeof S!=='undefined'&&S.authMe)||null}
const isAdmin=()=>!!(me()&&me().role==='admin');
const leads=()=>(me()&&me().leads)||[];
const mine=()=>isAdmin()?CHS:leads();
const canEdit=ch=>isAdmin()||leads().includes(ch);
const canLead=()=>!!tok()&&(isAdmin()||leads().length>0);
const canInfo=e=>!!(e&&tok()&&SRV_EVS.includes(e.id)&&canEdit(e.chapter));
const evs=()=>typeof EVENTS!=='undefined'?EVENTS:[];

function rerender(){if(typeof S==='undefined')return;
  try{if(typeof renderHome==='function')renderHome();if(typeof renderEvents==='function')renderEvents()}catch(e){}   /* both tabs are built ahead of time */
  if(S.tab==='settings'&&S.spage==='lead'&&typeof renderSettings==='function')renderSettings()}

/* ---- event details from the club server win over what's built into the app ---- */
const BASE={};
function applyInfo(items){Object.entries(items||{}).forEach(([id,f])=>{const e=evs().find(x=>x.id===id);if(!e)return;
  if(!BASE[id])BASE[id]={status:e.status||''};
  ['name','date','where','price'].forEach(k=>{if(f[k])e[k]=f[k]});
  if(f.note!=null)e.note=f.note;
  if('cancelled' in f)e.status=f.cancelled?'cancelled':(BASE[id].status==='cancelled'?'':BASE[id].status)})}
function keep(j){try{localStorage.setItem('rngc-evinfo',JSON.stringify(j))}catch(e){}}
let INFO={events:[],items:{}};
try{const c=JSON.parse(localStorage.getItem('rngc-evinfo')||'null');if(c&&c.items){INFO=c;SRV_EVS=c.events||[];applyInfo(c.items);setTimeout(rerender,0)}}catch(e){}
function loadInfo(){return call('/events/info').then(j=>{INFO={events:j.events||[],items:j.items||{}};SRV_EVS=INFO.events;keep(INFO);applyInfo(INFO.items);rerender()}).catch(()=>{})}
function saveInfo(id,fields){return call('/admin/event-info',Object.assign({ev:id},fields)).then(j=>{INFO.items[id]=j.info;keep(INFO);applyInfo({[id]:j.info});rerender();return j})}

function openInfo(id){const e=evs().find(x=>x.id===id);if(!e)return;
  if(!canInfo(e)){say(SRV_EVS.includes(id)?'Club admins and this chapter\'s president change this event.':'This event isn\'t on the club server yet. Ask David.');return}
  openSheet(`<h3>Event details</h3><p class="meta" style="margin:-4px 0 8px">Everyone sees the change the next time they open the app.</p><form id="eiForm">
   <label for="eiN">Event name</label><input class="field" id="eiN" required minlength="3" maxlength="70" value="${esc(e.name)}">
   <div class="two"><div><label for="eiD">Date</label><input class="field" id="eiD" type="date" required value="${esc(e.date)}"></div>
    <div><label for="eiP">Price</label><input class="field" id="eiP" maxlength="30" value="${esc(e.price)}" placeholder="$175 per player"></div></div>
   <label for="eiW">Where</label><input class="field" id="eiW" maxlength="90" value="${esc(e.where)}">
   <label for="eiNo">Details</label><textarea class="field" id="eiNo" maxlength="600" rows="4">${esc(e.note||'')}</textarea>
   <label class="check"><input type="checkbox" id="eiX" ${e.status==='cancelled'?'checked':''}> Cancelled: hide it from members</label>
   <button class="btn full" type="submit" style="width:100%;margin-top:12px"><i class="ph-bold ph-check"></i> Save for everyone</button>
   <p class="meta" id="eiErr" role="alert" style="color:#ffb3b5;min-height:1.2em;margin-top:6px"></p></form>`);
  const f=document.getElementById('eiForm');
  f.onsubmit=ev=>{ev.preventDefault();const b=f.querySelector('button[type=submit]'),err=document.getElementById('eiErr');b.disabled=true;err.textContent='';
    saveInfo(id,{name:f.eiN.value,date:f.eiD.value,price:f.eiP.value,where:f.eiW.value,note:f.eiNo.value,cancelled:f.eiX.checked})
     .then(()=>{if(typeof closeSheet==='function')closeSheet();say('Saved for everyone')})
     .catch(x=>{err.textContent=x.status===401?'Your sign-in ran out. Sign in again.':x.message}).finally(()=>{b.disabled=false})}}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-evinfo]');if(b){ev.preventDefault();openInfo(b.dataset.evinfo)}});

/* ---- a news photo: shrunk to a JPEG under about 550 KB before it leaves the phone ---- */
function shrink(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();
  im.onload=()=>{URL.revokeObjectURL(u);let side=1600,q=.82;
    for(let i=0;i<6;i++){const k=Math.min(1,side/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');
      c.width=Math.max(1,Math.round(im.naturalWidth*k));c.height=Math.max(1,Math.round(im.naturalHeight*k));
      const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
      const out=c.toDataURL('image/jpeg',q);if(out.startsWith('data:image/jpeg')&&out.length<740000)return res(out);side=Math.round(side*.8);q=Math.max(.6,q-.06)}
    rej(new Error('That photo is too big. Try another one.'))};
  im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('That photo didn\'t open. Try a JPG or PNG.'))};im.src=u})}

/* news from the server goes first in the club's news list */
function load(){return call('/news').then(j=>{POSTS=j.items||[];
  if(typeof NEWS!=='undefined'){for(let i=NEWS.length-1;i>=0;i--)if(String(NEWS[i].id).startsWith('s'))NEWS.splice(i,1);
    NEWS.unshift(...POSTS.map(p=>({id:'s'+p.id,tag:p.chapter==='Club'?'Club news':p.chapter,title:p.title,meta:day(p.at)+' · '+p.name,img:picOf(p),body:p.body})))}
  rerender()}).catch(()=>{})}

function html(){if(!canLead())return pageHead('Chapter tools')+'<p class="meta">For club admins and chapter presidents.</p>';
  const mineEv=evs().filter(e=>!isPast(e.date)&&(isAdmin()||leads().includes(e.chapter))).sort((a,b)=>a.date<b.date?-1:1);
  return pageHead('Chapter tools',isAdmin()?'Club admin: every chapter.':'President: '+leads().join(', ')+'.')+`<div class="setcols rise">
   ${group('Post club news',`<form id="cnForm"><label for="cnCh">For</label><select class="field" id="cnCh">${mine().map(c=>`<option value="${c}">${c==='Club'?'Whole club':c}</option>`).join('')}</select>
     <label for="cnT">Title</label><input class="field" id="cnT" required minlength="3" maxlength="80" placeholder="Nov 14 groups are out">
     <label for="cnB">Message</label><textarea class="field" id="cnB" required minlength="3" maxlength="1500" placeholder="What members need to know"></textarea>
     <div id="cnPicPrev" ${PIC?'':'hidden'} style="margin-top:10px"><img id="cnPicImg" ${PIC?`src="${PIC}"`:''} alt="Photo for this post" style="display:block;width:100%;max-height:240px;object-fit:cover;border-radius:12px">
      <button type="button" class="btn small ghost" id="cnPicX" style="margin-top:6px"><i class="ph-bold ph-x"></i> Remove photo</button></div>
     <label class="btn ghost" id="cnPicAdd" for="cnImg" style="width:100%;margin-top:10px;cursor:pointer" ${PIC?'hidden':''}><i class="ph-bold ph-image"></i> Add a photo</label>
     <input type="file" id="cnImg" accept="image/*" hidden>
     <button class="btn full" type="submit" style="width:100%;margin-top:12px"><i class="ph-bold ph-newspaper"></i> Post to Club news</button>
     <p class="meta" id="cnErr" role="alert" style="color:#ffb3b5;min-height:1.2em;margin-top:6px"></p></form>`,'Shows in Club news for everyone, right away.')}
   ${group('Posted',POSTS.length?`<div class="stack">${POSTS.map(p=>`<div class="card"><span class="pill">${esc(p.chapter==='Club'?'Whole club':p.chapter)}</span> <small class="meta">${day(p.at)} · ${esc(p.name)}</small>
     <b class="annt">${esc(p.title)}</b>${p.img?`<img src="${picOf(p)}" alt="" loading="lazy" style="display:block;width:100%;max-height:180px;object-fit:cover;border-radius:10px;margin:6px 0">`:''}<p class="meta" style="white-space:pre-line">${esc(p.body)}</p>
     ${canEdit(p.chapter)?`<button class="btn small ghost" data-cndel="${p.id}"><i class="ph-bold ph-trash"></i> Take down</button>`:''}</div>`).join('')}</div>`:'<p class="meta">Nothing posted yet.</p>')}
   ${group('Your events',mineEv.length?`<div class="stack">${mineEv.map(e=>`<div class="card"><b>${esc(e.name)}</b>${e.status==='cancelled'?' <span class="pill out">Cancelled</span>':''}
     <p class="meta">${day(e.date+'T12:00')} · ${esc(e.where)} · ${esc(e.price)}</p><div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px">
     ${canInfo(e)?`<button class="btn small" data-evinfo="${e.id}"><i class="ph-bold ph-pencil-simple"></i> Edit details: name, date, price</button>`:''}
     ${typeof SCORECARD_EVENTS!=='undefined'&&SCORECARD_EVENTS.includes(e.id)?`<a class="btn small ghost" href="scorecard/#/setup"><i class="ph-bold ph-users-three"></i> Groups, game, start</a>`:''}
     ${!canInfo(e)&&!(typeof SCORECARD_EVENTS!=='undefined'&&SCORECARD_EVENTS.includes(e.id))?'<p class="meta">Not on the club server yet. Ask David.</p>':''}</div></div>`).join('')}</div>`:'<p class="meta">No upcoming events for your chapter.</p>')}
   ${group('Your chapter',`<button class="btn full" data-sub="members|inbox"><i class="ph-bold ph-envelope-simple"></i> Message my chapter</button>`)}
  </div>`}

function showPic(){const p=document.getElementById('cnPicPrev'),a=document.getElementById('cnPicAdd'),i=document.getElementById('cnPicImg');if(!p)return;
  p.hidden=!PIC;a.hidden=!!PIC;if(PIC)i.src=PIC;else i.removeAttribute('src')}
function wire(){const f=document.getElementById('cnForm');if(f){
    const inp=document.getElementById('cnImg'),err=document.getElementById('cnErr');
    inp.onchange=()=>{const file=inp.files&&inp.files[0];inp.value='';if(!file)return;err.textContent='Getting the photo ready...';
      shrink(file).then(d=>{PIC=d;err.textContent='';showPic()}).catch(x=>{err.textContent=x.message})};
    document.getElementById('cnPicX').onclick=()=>{PIC=null;showPic()};
    f.onsubmit=e=>{e.preventDefault();const b=f.querySelector('button[type=submit]');b.disabled=true;err.textContent=PIC?'Sending the photo...':'';
    call('/news/post',Object.assign({chapter:f.cnCh.value,title:f.cnT.value,body:f.cnB.value},PIC?{img:PIC}:{})).then(()=>{say('Posted to Club news');f.reset();PIC=null;err.textContent='';return load()})
     .catch(x=>{err.textContent=x.status===401?'Your sign-in ran out. Sign in again.':x.status===413?'That photo is too big. Try another one.':x.message})
     .finally(()=>{b.disabled=false})}}
  document.querySelectorAll('[data-cndel]').forEach(b=>b.onclick=()=>{if(!confirm('Take this post down? It leaves Club news for everyone.'))return;
    call('/news/delete',{id:+b.dataset.cndel}).then(()=>{say('Taken down');return load()}).catch(x=>say(x.message))})}

load();loadInfo();
window.RNGCCHAPTER={html,wire,load,canLead,canEdit,canInfo,saveInfo,openInfo};
})();
