/* Club news + chapter tools (David, Nov 13 2026: "creating club news" and "the admin piece for the chapter presidents").
   - Club news posted in the app shows first in Club news, for everyone. Text only; the chapter's photo goes with it.
   - Settings > Chapter tools, for club admins and chapter presidents: post news for your chapters, take a post down,
     edit your chapter's event (groups, game, start), message your chapter.
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
let POSTS=[];

function me(){return (typeof S!=='undefined'&&S.authMe)||null}
const isAdmin=()=>!!(me()&&me().role==='admin');
const leads=()=>(me()&&me().leads)||[];
const mine=()=>isAdmin()?CHS:leads();
const canEdit=ch=>isAdmin()||leads().includes(ch);
const canLead=()=>!!tok()&&(isAdmin()||leads().length>0);

/* news from the server goes first in the club's news list */
function load(){return call('/news').then(j=>{POSTS=j.items||[];
  if(typeof NEWS!=='undefined'){for(let i=NEWS.length-1;i>=0;i--)if(String(NEWS[i].id).startsWith('s'))NEWS.splice(i,1);
    NEWS.unshift(...POSTS.map(p=>({id:'s'+p.id,tag:p.chapter==='Club'?'Club news':p.chapter,title:p.title,meta:day(p.at)+' · '+p.name,img:'assets/old-site/photos/'+(PHOTO[p.chapter]||PHOTO.Club)+'.jpg',body:p.body})))}
  if(typeof S!=='undefined'){if(S.tab==='home'&&typeof renderHome==='function')renderHome();if(S.tab==='settings'&&S.spage==='lead'&&typeof renderSettings==='function')renderSettings()}}).catch(()=>{})}

function html(){if(!canLead())return pageHead('Chapter tools')+'<p class="meta">For club admins and chapter presidents.</p>';
  const evs=(typeof EVENTS!=='undefined'?EVENTS:[]).filter(e=>!isPast(e.date)&&(isAdmin()||leads().includes(e.chapter)));
  return pageHead('Chapter tools',isAdmin()?'Club admin: every chapter.':'President: '+leads().join(', ')+'.')+`<div class="setcols rise">
   ${group('Post club news',`<form id="cnForm"><label for="cnCh">For</label><select class="field" id="cnCh">${mine().map(c=>`<option value="${c}">${c==='Club'?'Whole club':c}</option>`).join('')}</select>
     <label for="cnT">Title</label><input class="field" id="cnT" required minlength="3" maxlength="80" placeholder="Nov 14 groups are out">
     <label for="cnB">Message</label><textarea class="field" id="cnB" required minlength="3" maxlength="1500" placeholder="What members need to know"></textarea>
     <button class="btn full" type="submit" style="width:100%;margin-top:12px"><i class="ph-bold ph-newspaper"></i> Post to Club news</button>
     <p class="meta" id="cnErr" role="alert" style="color:#ffb3b5;min-height:1.2em;margin-top:6px"></p></form>`,'Shows in Club news for everyone, right away.')}
   ${group('Posted',POSTS.length?`<div class="stack">${POSTS.map(p=>`<div class="card"><span class="pill">${esc(p.chapter==='Club'?'Whole club':p.chapter)}</span> <small class="meta">${day(p.at)} · ${esc(p.name)}</small>
     <b class="annt">${esc(p.title)}</b><p class="meta" style="white-space:pre-line">${esc(p.body)}</p>
     ${canEdit(p.chapter)?`<button class="btn small ghost" data-cndel="${p.id}"><i class="ph-bold ph-trash"></i> Take down</button>`:''}</div>`).join('')}</div>`:'<p class="meta">Nothing posted yet.</p>')}
   ${group('Your events',evs.length?`<div class="stack">${evs.map(e=>`<div class="card"><b>${esc(e.name)}</b><p class="meta">${day(e.date+'T12:00')} · ${esc(e.where)}</p>
     ${typeof SCORECARD_EVENTS!=='undefined'&&SCORECARD_EVENTS.includes(e.id)?`<a class="btn small" href="scorecard/#/setup"><i class="ph-bold ph-pencil-simple"></i> Edit event: groups, game, start</a>`
       :'<p class="meta">Event-day scorecard not set up for this one yet. Ask David.</p>'}</div>`).join('')}</div>`:'<p class="meta">No upcoming events for your chapter.</p>')}
   ${group('Your chapter',`<button class="btn full" data-sub="members|inbox"><i class="ph-bold ph-envelope-simple"></i> Message my chapter</button>`)}
  </div>`}

function wire(){const f=document.getElementById('cnForm');if(f)f.onsubmit=e=>{e.preventDefault();const b=f.querySelector('button[type=submit]'),err=document.getElementById('cnErr');b.disabled=true;err.textContent='';
    call('/news/post',{chapter:f.cnCh.value,title:f.cnT.value,body:f.cnB.value}).then(()=>{say('Posted to Club news');f.reset();return load()})
     .catch(x=>{err.textContent=x.status===401?'Your sign-in ran out. Sign in again.':x.message})
     .finally(()=>{b.disabled=false})};
  document.querySelectorAll('[data-cndel]').forEach(b=>b.onclick=()=>{if(!confirm('Take this post down? It leaves Club news for everyone.'))return;
    call('/news/delete',{id:+b.dataset.cndel}).then(()=>{say('Taken down');return load()}).catch(x=>say(x.message))})}

load();
window.RNGCCHAPTER={html,wire,load,canLead,canEdit};
})();
