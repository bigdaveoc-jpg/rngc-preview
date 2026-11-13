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
const TEAM={1:'Singles',2:'Twosomes',3:'Threesomes',4:'Foursomes',5:'5-player teams',6:'6-player teams'};
function applyInfo(items){Object.entries(items||{}).forEach(([id,f])=>{let e=evs().find(x=>x.id===id);
  if(!e){if(!f.custom||typeof EVENTS==='undefined')return;   /* an event made in the app */
    e={id,name:f.name,date:f.date,where:f.where||'',chapter:f.chapter,price:f.price||'',note:f.note||'',url:'',custom:true,
       img:'assets/old-site/photos/'+(PHOTO[f.chapter]||PHOTO.Club)+'.jpg'};EVENTS.push(e)}
  if(!BASE[id])BASE[id]={status:e.status||'',spots:e.spots||''};
  ['name','date','where','price'].forEach(k=>{if(f[k])e[k]=f[k]});
  if(f.note!=null)e.note=f.note;
  if(f.rules!=null)e.rules=f.rules;
  if(f.url)e.url=f.url;
  if('cap' in f||'team' in f){e.cap=f.cap||0;e.team=f.team||0;
    e.spots=[TEAM[e.team],e.cap?e.cap+' players max':''].filter(Boolean).join(' · ')||BASE[id].spots}
  if('cancelled' in f)e.status=f.cancelled?'cancelled':(BASE[id].status==='cancelled'?'':BASE[id].status)})}
function keep(j){try{localStorage.setItem('rngc-evinfo',JSON.stringify(j))}catch(e){}}
let INFO={events:[],items:{}};
try{const c=JSON.parse(localStorage.getItem('rngc-evinfo')||'null');if(c&&c.items){INFO=c;SRV_EVS=c.events||[];applyInfo(c.items);setTimeout(rerender,0)}}catch(e){}
function loadInfo(){return call('/events/info').then(j=>{INFO={events:j.events||[],items:j.items||{}};SRV_EVS=INFO.events;keep(INFO);applyInfo(INFO.items);rerender()}).catch(()=>{})}
function saveInfo(id,fields){return call('/admin/event-info',Object.assign({ev:id},fields)).then(j=>{INFO.items[id]=j.info;keep(INFO);applyInfo({[id]:j.info});rerender();return j})}
const hasCard=id=>typeof SCORECARD_EVENTS!=='undefined'&&SCORECARD_EVENTS.includes(id);

/* Event setup (David, Nov 13 2026: "the teams and how many players and send the invites out and the setting up the
   rules and setting up the games"). One sheet per event: details, players and team size, rules, cancel; links to the
   event-day groups and game pages; and the invite, written for you in the club's message box. */
function openInfo(id){const e=evs().find(x=>x.id===id);if(!e)return;
  if(!canInfo(e)){say(SRV_EVS.includes(id)?'Club admins and this chapter\'s president change this event.':'This event isn\'t on the club server yet. Ask David.');return}
  const h4=t=>`<div style="margin:18px 0 4px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;font-size:13px;opacity:.85">${t}</div>`;
  openSheet(`<h3 style="margin:0">Event setup</h3><p class="meta" style="margin:2px 0 6px">${esc(e.name)}</p>
   <form id="eiForm">${h4('1. Details')}
   <label for="eiN">Event name</label><input class="field" id="eiN" required minlength="3" maxlength="70" value="${esc(e.name)}">
   <div class="two"><div><label for="eiD">Date</label><input class="field" id="eiD" type="date" required value="${esc(e.date)}"></div>
    <div><label for="eiP">Price</label><input class="field" id="eiP" maxlength="30" value="${esc(e.price)}" placeholder="$175 per player"></div></div>
   <label for="eiW">Where</label><input class="field" id="eiW" maxlength="90" value="${esc(e.where)}">
   <label for="eiU">Sign-up and pay link</label><input class="field" id="eiU" type="url" maxlength="300" value="${esc(e.url&&/^(https:|\/)/.test(e.url)?e.url:'')}" placeholder="https://... from the club store">
   <label for="eiNo">Details</label><textarea class="field" id="eiNo" maxlength="600" rows="4">${esc(e.note||'')}</textarea>
   ${h4('2. Players and teams')}
   <div class="two"><div><label for="eiCap">Players max</label><input class="field" id="eiCap" type="number" inputmode="numeric" min="0" max="500" value="${e.cap||''}" placeholder="No limit"></div>
    <div><label for="eiTeam">Team size</label><select class="field" id="eiTeam"><option value="0">Not set</option>${[1,2,3,4,5,6].map(n=>`<option value="${n}" ${+e.team===n?'selected':''}>${TEAM[n]}</option>`).join('')}</select></div></div>
   ${h4('3. Rules')}
   <textarea class="field" id="eiR" maxlength="1500" rows="4" aria-label="Event rules" placeholder="Mulligans, gimmes, dress code, carts, pace of play">${esc(e.rules||'')}</textarea>
   <label class="check" style="margin-top:10px"><input type="checkbox" id="eiX" ${e.status==='cancelled'?'checked':''}> Cancelled: hide it from members</label>
   <button class="btn full" type="submit" style="width:100%;margin-top:12px"><i class="ph-bold ph-check"></i> Save for everyone</button>
   <p class="meta" id="eiErr" role="alert" style="color:#ffb3b5;min-height:1.2em;margin-top:6px"></p></form>
   ${h4('4. Groups and the game')}
   ${hasCard(id)?`<a class="btn ghost" style="width:100%" href="scorecard/#/field"><i class="ph-bold ph-users-three"></i> Groups: add, move, remove players</a>
     <a class="btn ghost" style="width:100%;margin-top:8px" href="scorecard/#/setup"><i class="ph-bold ph-sliders-horizontal"></i> Game, contests, skins, start time</a>`
     :'<p class="meta">Groups and the game open once this event\'s course scorecard is set up. Ask David.</p>'}
   ${h4('5. Invite')}
   <button class="btn ghost" style="width:100%" id="eiInv" type="button"><i class="ph-bold ph-paper-plane-tilt"></i> Write the invite</button>
   <p class="meta" style="margin-top:6px">Opens the club message box with the invite written. You pick who gets it and tap Send.</p>`);
  const f=document.getElementById('eiForm');
  f.onsubmit=ev=>{ev.preventDefault();const b=f.querySelector('button[type=submit]'),err=document.getElementById('eiErr');b.disabled=true;err.textContent='';
    saveInfo(id,{name:f.eiN.value,date:f.eiD.value,price:f.eiP.value,where:f.eiW.value,url:f.eiU.value.trim(),note:f.eiNo.value,rules:f.eiR.value,
      cap:Math.max(0,Math.min(500,parseInt(f.eiCap.value,10)||0)),team:+f.eiTeam.value||0,cancelled:f.eiX.checked})
     .then(()=>{err.textContent='';say('Saved for everyone')})
     .catch(x=>{err.textContent=x.status===401?'Your sign-in ran out. Sign in again.':x.message}).finally(()=>{b.disabled=false})};
  document.getElementById('eiInv').onclick=()=>invite(id)}

function invite(id){const e=evs().find(x=>x.id===id);if(!e)return;
  if(typeof openCompose!=='function'){say('Messages open once you sign in.');return}
  const when=new Date(e.date+'T12:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  const teams=[TEAM[e.team],e.cap?e.cap+' players max':''].filter(Boolean).join(', ');
  const body=[`You're invited to ${e.name}.`,'',`When: ${when}`,`Where: ${e.where}`,`Cost: ${e.price}`].concat(teams?[`Format: ${teams}`]:[])
    .concat(e.note?['',e.note]:[]).concat(['',`Sign up in the club app: ${location.origin}/`]).join('\n');
  const to=e.chapter==='National'||!e.chapter?'club':'chapter:'+e.chapter;
  if(typeof closeSheet==='function')closeSheet();
  setTimeout(()=>openCompose({to,subject:`You're invited: ${e.name}`.slice(0,90),body}),330)}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-evinfo]');if(b){ev.preventDefault();openInfo(b.dataset.evinfo)}
  if(ev.target.closest&&ev.target.closest('[data-evnew]')){ev.preventDefault();openNew()}});

/* New event (David, Nov 13 2026): club admins for any chapter, presidents for theirs. Saved on the club server,
   then the Event setup opens for it (players, rules, invite). */
function openNew(){if(!canLead()){say('Club admins and chapter presidents make events.');return}
  const chs=mine().filter(c=>c!=='Club');
  openSheet(`<h3 style="margin:0">New event</h3><p class="meta" style="margin:2px 0 8px">Members see it as soon as you save.</p><form id="enForm">
   <label for="enC">Chapter</label><select class="field" id="enC">${chs.map(c=>`<option>${c}</option>`).join('')}</select>
   <label for="enN">Event name</label><input class="field" id="enN" required minlength="3" maxlength="70" placeholder="RNGC vs ...">
   <div class="two"><div><label for="enD">Date</label><input class="field" id="enD" type="date" required></div>
    <div><label for="enP">Price</label><input class="field" id="enP" maxlength="30" placeholder="$175 per player"></div></div>
   <label for="enW">Where</label><input class="field" id="enW" maxlength="90" placeholder="Course, city">
   <div class="two"><div><label for="enCap">Players max</label><input class="field" id="enCap" type="number" inputmode="numeric" min="0" max="500" placeholder="No limit"></div>
    <div><label for="enT">Team size</label><select class="field" id="enT"><option value="0">Not set</option>${[1,2,3,4,5,6].map(n=>`<option value="${n}" ${n===4?'selected':''}>${TEAM[n]}</option>`).join('')}</select></div></div>
   <label for="enU">Sign-up and pay link</label><input class="field" id="enU" type="url" maxlength="300" placeholder="https://... from the club store">
   <label for="enNo">Details</label><textarea class="field" id="enNo" maxlength="600" rows="3" placeholder="Format, check-in time, what's included"></textarea>
   <button class="btn full" type="submit" style="width:100%;margin-top:12px"><i class="ph-bold ph-plus"></i> Make the event</button>
   <p class="meta" id="enErr" role="alert" style="color:#ffb3b5;min-height:1.2em;margin-top:6px"></p></form>`);
  const f=document.getElementById('enForm');
  f.onsubmit=ev=>{ev.preventDefault();const b=f.querySelector('button[type=submit]'),err=document.getElementById('enErr');b.disabled=true;err.textContent='';
    call('/admin/event-new',{chapter:f.enC.value,name:f.enN.value,date:f.enD.value,price:f.enP.value,where:f.enW.value,url:f.enU.value.trim(),note:f.enNo.value,
      cap:Math.max(0,Math.min(500,parseInt(f.enCap.value,10)||0)),team:+f.enT.value||0})
     .then(j=>{INFO.items[j.ev]=j.info;if(!INFO.events.includes(j.ev))INFO.events.push(j.ev);SRV_EVS=INFO.events;keep(INFO);applyInfo({[j.ev]:j.info});rerender();
       say('Event made. Finish the setup here.');openInfo(j.ev)})
     .catch(x=>{err.textContent=x.status===401?'Your sign-in ran out. Sign in again.':x.message;b.disabled=false})}}

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
   ${group('Your events',`<button class="btn" data-evnew style="width:100%;margin-bottom:10px"><i class="ph-bold ph-plus"></i> New event</button>`+(mineEv.length?`<div class="stack">${mineEv.map(e=>`<div class="card"><b>${esc(e.name)}</b>${e.status==='cancelled'?' <span class="pill out">Cancelled</span>':''}
     <p class="meta">${day(e.date+'T12:00')} · ${esc(e.where)} · ${esc(e.price)}</p><div class="row" style="flex-wrap:wrap;gap:6px;margin-top:6px">
     ${canInfo(e)?`<button class="btn small" data-evinfo="${e.id}"><i class="ph-bold ph-gear-six"></i> Event setup</button>`:''}
     
     ${!canInfo(e)?'<p class="meta">Not on the club server yet. Ask David.</p>':''}</div></div>`).join('')}</div>`:'<p class="meta">No upcoming events for your chapter.</p>'))}
   ${group('Your chapter',`<button class="btn full" data-sub="members|inbox"><i class="ph-bold ph-envelope-simple"></i> Message my chapter</button>`)}
  </div><p class="meta" style="opacity:.55;margin-top:10px">App update: Nov 13, 11 AM</p>`}

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

/* the scorecard's Edit the event page links here: /?evinfo=nov14 opens the details form once sign-in is checked */
function openFromLink(){let id='';try{id=new URLSearchParams(location.search).get('evinfo')||''}catch(e){}if(!id)return;
  try{history.replaceState(null,'',location.pathname+location.hash)}catch(e){}
  let n=0;const t=setInterval(()=>{const e=evs().find(x=>x.id===id);n++;
    if(e&&canInfo(e)){clearInterval(t);openInfo(id)}
    else if(n>30){clearInterval(t);say(tok()?'Only club admins and the chapter president can edit this event.':'Sign in first, then try again.')}},500)}
load();loadInfo().then(openFromLink);
window.RNGCCHAPTER={html,wire,load,canLead,canEdit,canInfo,saveInfo,openInfo,invite,openNew,club:call};
})();
