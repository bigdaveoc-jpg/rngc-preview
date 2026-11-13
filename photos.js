/* Club photos (David, Nov 13 2026: "On the photo page, you should be able to upload photos. I think for the events,
   there should be a photo area for the events, and anybody that attended can upload to that event. And then we can
   start organizing the event photos on the photo page").
   - Every event that has started (event day and after) gets a Photos area on its Events card. Signed-in members add
     photos to it; the Club photos page shows every album, newest first, plus a Club album for anything else.
   - The phone shrinks each photo before it leaves (big copy under ~550 KB, thumbnail under ~110 KB).
   - Take down: the person who added it, a club admin, or the president of that event's chapter. The club server checks. */
(function(){
const C=()=>window.RNGCCHAPTER;
const call=(p,b)=>C()?C().club(p,b):Promise.reject(new Error('The club server is not set up.'));
const api=()=>C()&&C().api?C().api():'https://rngc-club.137.184.188.41.sslip.io';
const tok=()=>{try{return localStorage.getItem('rngc-auth-token')||''}catch(e){return ''}};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=m=>{if(typeof toast==='function')toast(m)};
const evs=()=>typeof EVENTS!=='undefined'?EVENTS:[];
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const started=e=>!!e&&e.status!=='cancelled'&&e.date<=today();
const day=t=>new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
const evDay=d=>new Date(d+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
const thumb=id=>api()+'/photos/img?id='+id+'&t=1',big=id=>api()+'/photos/img?id='+id;
let ITEMS=[],LOADED=false,ALB=null,PICKS=[],LAST=0;

const nameOf=ev=>{if(!ev)return 'Club album';const e=evs().find(x=>x.id===ev);return e?e.name:'Club event'};
const of=ev=>ITEMS.filter(p=>p.ev===ev);
/* albums people can add to: the Club album and every event from its day on, newest first */
const addable=()=>[{id:'',name:'Club album'}].concat(evs().filter(started).sort((a,b)=>a.date<b.date?1:-1).map(e=>({id:e.id,name:e.name+' · '+evDay(e.date)})));

function rerender(){try{if(typeof S==='undefined')return;if(typeof renderHome==='function'&&S.hpage==='photos')renderHome();if(typeof renderEvents==='function')renderEvents()}catch(e){}}
function load(){LAST=Date.now();return call('/photos').then(j=>{ITEMS=j.items||[];LOADED=true;rerender()}).catch(()=>{})}

const tile=p=>`<button class="zoomtile" data-ph="${p.id}" aria-label="Open photo${p.cap?': '+esc(p.cap):''}"><img src="${thumb(p.id)}" alt="${esc(p.cap||'Club photo')}" loading="lazy"></button>`;
const addBtn=ev=>tok()?`<button class="btn" data-phadd="${esc(ev||'')}"><i class="ph-bold ph-camera-plus"></i> Add photos</button>`
  :'<p class="meta">Sign in to add your photos.</p>';

/* the Club photos page: albums as chips, then the photos, then the archive from the old club site */
function html(){if(Date.now()-LAST>60000)setTimeout(load,0);   /* fresh list when the page opens */
  const albums=[...new Set(ITEMS.map(p=>p.ev))].map(id=>({id,n:of(id).length,date:(evs().find(e=>e.id===id)||{}).date||''}))
    .sort((a,b)=>(a.id===''?1:0)-(b.id===''?1:0)||(a.date<b.date?1:-1));
  if(ALB!==null&&!albums.some(a=>a.id===ALB))ALB=null;
  const chip=(id,label,n)=>`<button class="btn small ${ALB===id?'':'ghost'}" data-phalb="${esc(id===null?'*':id)}" aria-pressed="${ALB===id}">${esc(label)}${n!=null?` <small style="opacity:.7">${n}</small>`:''}</button>`;
  const shown=ALB===null?albums:albums.filter(a=>a.id===ALB);
  const body=!LOADED?'<p class="meta">Loading club photos...</p>'
    :!ITEMS.length?'<div class="card empty"><i class="ph-bold ph-camera"></i>No member photos yet. Add the first ones from your last golf day.</div>'
    :shown.map(a=>`<h3 class="shophead" style="margin-top:18px">${esc(nameOf(a.id))}</h3><p class="sub" style="margin-top:0">${a.date?evDay(a.date)+' · ':''}${a.n} photo${a.n===1?'':'s'}</p>
       <div class="photogrid">${of(a.id).map(tile).join('')}</div>`).join('');
  return (typeof pageHead==='function'?pageHead('Club photos','Golf days with the club, from the members who were there.'):'')+
   `<div class="acts" style="margin:0 0 12px">${addBtn(ALB||'')}</div>
   ${ITEMS.length?`<div class="row" style="flex-wrap:wrap;gap:6px;margin-bottom:4px">${chip(null,'All albums')}${albums.map(a=>chip(a.id,a.id?nameOf(a.id):'Club album',a.n)).join('')}</div>`:''}
   <div class="rise">${body}</div>
   <h3 class="shophead" style="margin-top:24px">From the club archive</h3><p class="sub" style="margin-top:0">Tap a photo to see it big.</p>
   <div class="photogrid">${(typeof PHOTOS!=='undefined'?PHOTOS:[]).map(f=>`<button class="zoomtile" data-zoom="assets/old-site/photos/${f}.jpg" aria-label="Open photo"><img src="assets/old-site/photos/${f}-sm.jpg" alt="Club golf day" loading="lazy"></button>`).join('')}</div>
   <div class="acts" style="margin-top:16px"><button class="btn ghost" data-sub="events|past"><i class="ph-bold ph-images"></i> Flyers from past events</button></div>`}

/* on an Events card, from event day on */
function evRow(e){if(!started(e))return '';const n=of(e.id).length;
  return `<div class="row" style="margin-top:8px"><button class="btn small ghost" data-phev="${e.id}"><i class="ph-bold ph-images"></i> Photos${n?' ('+n+')':''}</button>${tok()?`<button class="btn small ghost" data-phadd="${e.id}"><i class="ph-bold ph-camera-plus"></i> Add photos</button>`:''}</div>`}

function openAlbum(ev){const e=evs().find(x=>x.id===ev),list=of(ev);
  openSheet(`<h3 style="margin:0">${esc(nameOf(ev))}</h3><p class="meta" style="margin:2px 0 10px">${e?evDay(e.date)+' · ':''}${list.length} photo${list.length===1?'':'s'}</p>
   ${list.length?`<div class="photogrid">${list.map(tile).join('')}</div>`:'<p class="meta">No photos yet. Were you there? Add yours.</p>'}
   <div class="acts" style="margin-top:12px">${addBtn(ev)}<button class="btn ghost" data-zoomclose>Close</button></div>`)}

function openPhoto(id){const p=ITEMS.find(x=>x.id===+id);if(!p)return;
  openSheet(`<img class="zoomimg" src="${big(p.id)}" alt="${esc(p.cap||'Club photo')}">
   ${p.cap?`<p style="margin:10px 0 0">${esc(p.cap)}</p>`:''}<p class="meta" style="margin:4px 0 0">${esc(nameOf(p.ev))} · ${esc(p.name||'Member')} · ${day(p.at)}</p>
   <div class="acts" style="margin-top:10px">${p.ev?`<button class="btn small ghost" data-phev="${esc(p.ev)}">Whole album</button>`:''}
   ${p.can?`<button class="btn small ghost" data-phdel="${p.id}"><i class="ph-bold ph-trash"></i> Take down</button>`:''}<button class="btn ghost" data-zoomclose>Close</button></div>`)}

/* pick photos, add an optional caption, send them one at a time */
function prep(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();
  const make=(side,limit,q)=>{for(let i=0;i<6;i++){const k=Math.min(1,side/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');
      c.width=Math.max(1,Math.round(im.naturalWidth*k));c.height=Math.max(1,Math.round(im.naturalHeight*k));
      const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
      const out=c.toDataURL('image/jpeg',q);if(out.startsWith('data:image/jpeg')&&out.length<limit)return out;side=Math.round(side*.8);q=Math.max(.55,q-.07)}
    return null};
  im.onload=()=>{URL.revokeObjectURL(u);const f=make(1800,760000,.84),t=make(480,150000,.76);
    f&&t?res({img:f,thumb:t}):rej(new Error('That photo is too big. Try another one.'))};
  im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('One photo didn\'t open. Try a JPG or PNG.'))};im.src=u})}

function openAdd(ev){if(!tok()){say('Sign in to add your photos.');return}
  PICKS=[];const opts=addable();if(ev&&!opts.some(o=>o.id===ev))ev='';
  openSheet(`<h3 style="margin:0">Add photos</h3><p class="meta" style="margin:2px 0 8px">Members see them right away. Up to 10 at a time.</p><form id="phForm">
   <label for="phAlb">Album</label><select class="field" id="phAlb">${opts.map(o=>`<option value="${esc(o.id)}" ${o.id===(ev||'')?'selected':''}>${esc(o.name)}</option>`).join('')}</select>
   <div id="phPrev" class="photogrid" style="margin-top:10px"></div>
   <label class="btn ghost" for="phFiles" style="width:100%;margin-top:10px;cursor:pointer"><i class="ph-bold ph-images"></i> Pick photos</label>
   <input type="file" id="phFiles" accept="image/*" multiple hidden>
   <label for="phCap">Caption</label><input class="field" id="phCap" maxlength="140" placeholder="Optional: who, what hole, what happened">
   <button class="btn full" type="submit" style="width:100%;margin-top:12px" disabled><i class="ph-bold ph-upload-simple"></i> Add to the album</button>
   <p class="meta" id="phErr" role="alert" style="min-height:1.2em;margin-top:6px"></p></form>`);
  const f=document.getElementById('phForm'),inp=document.getElementById('phFiles'),err=document.getElementById('phErr'),btn=f.querySelector('button[type=submit]'),prev=document.getElementById('phPrev');
  const show=()=>{prev.innerHTML=PICKS.map((p,i)=>`<div style="position:relative"><img src="${p.thumb}" alt="" style="display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px">
      <button type="button" class="btn small ghost" data-phx="${i}" aria-label="Remove this photo" style="position:absolute;top:4px;right:4px;padding:2px 8px"><i class="ph-bold ph-x"></i></button></div>`).join('');
    btn.disabled=!PICKS.length;btn.innerHTML=`<i class="ph-bold ph-upload-simple"></i> Add ${PICKS.length>1?PICKS.length+' photos':'to the album'}`};
  prev.onclick=e=>{const x=e.target.closest('[data-phx]');if(x){PICKS.splice(+x.dataset.phx,1);show()}};
  inp.onchange=async()=>{const files=[...(inp.files||[])].slice(0,10-PICKS.length);inp.value='';if(!files.length){if(PICKS.length>=10)err.textContent='10 at a time. Send these first.';return}
    for(let i=0;i<files.length;i++){err.textContent=`Getting photo ${i+1} of ${files.length} ready...`;
      try{PICKS.push(await prep(files[i]))}catch(x){say(x.message)}}
    err.textContent='';show()};
  f.onsubmit=async e=>{e.preventDefault();if(!PICKS.length)return;btn.disabled=true;const alb=document.getElementById('phAlb').value,cap=document.getElementById('phCap').value;let done=0;
    for(let i=0;i<PICKS.length;i++){err.textContent=`Sending ${i+1} of ${PICKS.length}...`;
      try{await call('/photos/add',{ev:alb,cap,img:PICKS[i].img,thumb:PICKS[i].thumb});done++}
      catch(x){err.textContent=x.status===401?'Your sign-in ran out. Sign in again.':x.status===413?'One photo was too big. The rest went through.':x.message;
        if(x.status===401||x.status===429)break}}
    if(done){PICKS=PICKS.slice(done);ALB=alb;await load();say(done===1?'Photo added':done+' photos added');
      if(!PICKS.length){if(typeof closeSheet==='function')closeSheet()}else show()}
    btn.disabled=!PICKS.length}}

document.addEventListener('click',e=>{const t=e.target.closest&&e.target;if(!t)return;
  const a=t.closest('[data-phadd]');if(a){e.preventDefault();openAdd(a.dataset.phadd);return}
  const v=t.closest('[data-phev]');if(v){e.preventDefault();openAlbum(v.dataset.phev);return}
  const p=t.closest('[data-ph]');if(p){e.preventDefault();openPhoto(p.dataset.ph);return}
  const c=t.closest('[data-phalb]');if(c){e.preventDefault();ALB=c.dataset.phalb==='*'?null:c.dataset.phalb;rerender();return}
  const d=t.closest('[data-phdel]');if(d){e.preventDefault();if(!confirm('Take this photo down? It leaves the album for everyone.'))return;
    call('/photos/delete',{id:+d.dataset.phdel}).then(()=>{if(typeof closeSheet==='function')closeSheet();say('Taken down');return load()}).catch(x=>say(x.message))}});

load();
window.RNGCPHOTOS={html,evRow,load,openAdd,openAlbum};
})();
