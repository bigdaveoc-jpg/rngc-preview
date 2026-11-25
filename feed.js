/* Club feed (David, Nov 24 2026: "we need a social feed as well, within our own system"; all members post).
   - Home > Club feed: one stream, newest first, for signed-in members. Member posts (words, a photo, or both) mixed
     with club news, event photo drops and big shots from live days.
   - Everyone signed in can react (one of four, tap again to take it back) and comment.
   - The poster, a club admin or any chapter president takes a post or comment down. The poster can clear comments
     off their own post. Members report a post or comment; at 3 reports it's on hold for everyone but the leaders and
     the poster until a leader keeps it or takes it down.
   - Home overview shows the newest two items and a count of new posts.
   Square corners only (no pill shapes, David Nov 19). The club server checks every rule again. */
(function(){
const CLUB_API='https://rngc-club.137.184.188.41.sslip.io';
const api=()=>{try{const o=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&localStorage.getItem('rngc-club-api');if(o)return o.replace(/\/$/,'')}catch(e){}return CLUB_API};
const tok=()=>{try{return localStorage.getItem('rngc-auth-token')||''}catch(e){return ''}};
const call=(path,body)=>fetch(api()+path,{method:body?'POST':'GET',cache:'no-store',
  headers:Object.assign(tok()?{Authorization:'Bearer '+tok()}:{},body?{'Content-Type':'application/json'}:{}),body:body?JSON.stringify(body):undefined})
  .then(async r=>{const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||'The club server had a problem.'),{status:r.status});return j});
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=m=>{if(typeof toast==='function')toast(m)};
const errMsg=x=>x.status===401?'Your sign-in ran out. Sign in again.':x.status===429?'That\'s a lot at once. Give it a few minutes.':x.status?x.message:'We can\'t reach the club server. Check your signal and try again.';
const REACT=[['fire','🔥','Fire'],['clap','👏','Clap'],['golf','⛳','Flag'],['laugh','😂','Laugh']];
const SHOT={ace:'🏴‍☠️',albatross:'🦅',eagle:'🦅',ctp:'🎯',ld:'💣',live:'🔴'};

let ITEMS=[],MORE=false,NEXT=0,LOADED=false,LEAD=false,HELD=0,NEW=0,LAST=0,BUSY=false,ERR='';
const OPEN=new Set(),DRAFT={};

const ago=t=>{const s=Math.max(0,(Date.now()-t)/1000);if(s<60)return 'just now';if(s<3600)return Math.floor(s/60)+'m';if(s<86400)return Math.floor(s/3600)+'h';
  if(s<604800)return Math.floor(s/86400)+'d';return new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric'})};
const av=x=>typeof avOf==='function'?avOf({name:x.name,pid:x.pid,photo:x.photo}):`<span class="av">${esc((x.name||'?')[0])}</span>`;
const evName=ev=>{if(!ev)return 'the club album';const e=(typeof EVENTS!=='undefined'?EVENTS:[]).find(x=>x.id===ev);return e?e.name:'a club event'};
const onPage=()=>typeof S!=='undefined'&&S.tab==='home'&&S.hpage==='feed';
const typing=()=>{const a=document.activeElement;return !!(a&&a.closest&&a.closest('.fd')&&/INPUT|TEXTAREA/.test(a.tagName))};

function rerender(){try{if(typeof S==='undefined'||typeof renderHome!=='function'||S.tab!=='home')return;if(typing())return;renderHome()}catch(e){}}
function load(more){if(!tok()||BUSY)return Promise.resolve();BUSY=true;LAST=Date.now();
  return call('/feed'+(more&&NEXT?'?before='+NEXT:'')).then(j=>{const got=j.items||[];
      ITEMS=more?ITEMS.concat(got.filter(x=>!ITEMS.some(y=>y.key===x.key))):got;MORE=!!j.more;NEXT=j.next||0;LEAD=!!j.lead;HELD=j.held||0;LOADED=true;ERR='';if(LEAD&&!SOC)socLoad().then(rerender).catch(()=>{});
      if(onPage()&&!more){NEW=0;call('/feed/seen',{}).catch(()=>{})}})
    .catch(x=>{ERR=errMsg(x);LOADED=true}).finally(()=>{BUSY=false;rerender()})}
function poll(){if(!tok())return;call('/feed/new').then(j=>{if(j.new!==NEW){NEW=j.new;rerender()}}).catch(()=>{})}

/* one card in the stream */
function reactBar(x){const n=Object.values(x.reacts||{}).reduce((a,b)=>a+b,0),c=(x.cmts||[]).length;
  return `<div class="fdbar">${REACT.map(([k,e,l])=>`<button type="button" class="fdr${x.me===k?' on':''}" data-fdr="${esc(x.key)}|${k}" aria-pressed="${x.me===k}" aria-label="${l}${x.reacts&&x.reacts[k]?', '+x.reacts[k]:''}">${e}${x.reacts&&x.reacts[k]?`<small>${x.reacts[k]}</small>`:''}</button>`).join('')}
   ${x.t!=='post'||x.mine?`<button type="button" class="fdr" data-fdshare="${esc(x.key)}" aria-label="Share to your social media"><i class="ph-bold ph-share-fat"></i></button>`:''}
   ${LEAD?`<button type="button" class="fdr" data-fdclub="${esc(x.key)}" aria-label="Send to the club Facebook and Instagram"><i class="ph-bold ph-megaphone"></i></button>`:''}
   <button type="button" class="fdr fdc" data-fdopen="${esc(x.key)}"><i class="ph-bold ph-chat-circle"></i>${c?`<small>${c}</small>`:''}<span class="sr">Comments</span></button></div>`}
function cmtsHTML(x){const all=x.cmts||[],open=OPEN.has(x.key),list=open?all:all.slice(-2);
  return `<div class="fdcm">${!open&&all.length>2?`<button type="button" class="fdmore" data-fdopen="${esc(x.key)}">View all ${all.length} comments</button>`:''}
   ${list.map(k=>`<div class="fdk${k.held?' held':''}">${av(k)}<div><p><b>${esc(k.name)}</b> ${esc(k.body)}</p>
     <span class="fdmeta">${ago(k.at)}${k.held?' · on hold, '+k.reports+' reports':''}
     ${k.held&&LEAD?` · <button type="button" data-fdkeep="c|${k.id}">Keep</button>`:''}
     ${k.can?` · <button type="button" data-fddel="c|${k.id}">Take down</button>`:''}
     ${!k.mine?` · <button type="button" data-fdrep="c|${k.id}">Report</button>`:''}</span></div></div>`).join('')}
   ${open||all.length?`<form class="fdadd" data-fdcm="${esc(x.key)}"><input class="field" maxlength="500" placeholder="Add a comment" value="${esc(DRAFT[x.key]||'')}" aria-label="Add a comment">
     <button class="btn small" type="submit" aria-label="Send comment"><i class="ph-bold ph-paper-plane-right"></i></button></form>`:''}</div>`}
function itemHTML(x){
  let head='',body='';
  if(x.t==='post'){
    head=`${av(x)}<div class="fdwho"><b>${esc(x.name)}</b><span class="fdmeta">${ago(x.at)}</span></div>
      <div class="fdmenu">${x.can?`<button type="button" data-fddel="p|${x.id}" aria-label="Take down this post"><i class="ph-bold ph-trash"></i></button>`:''}
      ${!x.mine?`<button type="button" data-fdrep="p|${x.id}" aria-label="Report this post"><i class="ph-bold ph-flag"></i></button>`:''}</div>`;
    body=(x.held?`<p class="fdhold"><i class="ph-bold ph-eye-slash"></i> On hold: ${x.reports?x.reports+' members reported it':'members reported it'}. ${LEAD?'Only leaders and the poster see it.':'Only you and the club leaders see it.'}
        ${LEAD?`<button type="button" class="btn small ghost" data-fdkeep="p|${x.id}">Keep it</button>`:''}</p>`:'')
      +(x.body?`<p class="fdtext">${esc(x.body)}</p>`:'')
      +(x.img?`<button type="button" class="fdimg" data-fdzoom="${api()}/feed/img?id=${x.id}"><img src="${api()}/feed/img?id=${x.id}&t=1" alt="Photo from ${esc(x.name)}" loading="lazy"></button>`:'');
  }else if(x.t==='news'){
    head=`<span class="av fdico"><i class="ph-bold ph-megaphone"></i></span><div class="fdwho"><b>Club news</b><span class="fdmeta">${esc(x.chapter||'')} · ${esc(x.name||'')} · ${ago(x.at)}</span></div>`;
    body=`<h3 class="fdtitle">${esc(x.title)}</h3><p class="fdtext fdclip">${esc(x.body)}</p>`
      +(x.img?`<button type="button" class="fdimg" data-fdzoom="${api()}/news/img?id=${x.id}"><img src="${api()}/news/img?id=${x.id}" alt="" loading="lazy"></button>`:'');
  }else if(x.t==='photos'){
    head=`<span class="av fdico"><i class="ph-bold ph-images"></i></span><div class="fdwho"><b>${esc(x.name||'A member')} added ${x.n} photo${x.n===1?'':'s'}</b><span class="fdmeta">to ${esc(evName(x.ev))} · ${ago(x.at)}</span></div>`;
    body=(x.cap?`<p class="fdtext">${esc(x.cap)}</p>`:'')+`<div class="fdgrid n${Math.min(x.ids.length,4)}">${x.ids.slice(0,4).map((id,i)=>`<button type="button" data-ph="${id}" aria-label="Open photo"><img src="${api()}/photos/img?id=${id}&t=1" alt="" loading="lazy">${i===3&&x.n>4?`<span>+${x.n-4}</span>`:''}</button>`).join('')}</div>
      ${x.ev?`<button type="button" class="fdmore" data-phev="${esc(x.ev)}">See the whole album</button>`:''}`;
  }else if(x.t==='shot'){
    head=`<span class="av fdico">${SHOT[x.kind]||'⛳'}</span><div class="fdwho"><b>${esc(x.title)}</b><span class="fdmeta">${esc(evName(x.ev))} · ${ago(x.at)}</span></div>`;
    body=x.body?`<p class="fdtext">${esc(x.body)}</p>`:'';
  }
  return `<article class="card fdi fd-${x.t}${x.held?' held':''}"><div class="fdhead">${head}</div>${body}${reactBar(x)}${cmtsHTML(x)}</article>`}

function composer(){const m=typeof S!=='undefined'&&S.authMe;
  return `<button type="button" class="card fdnew" data-fdpost>${av({name:m&&m.name,pid:m&&m.pid,photo:m&&m.photo})}<span>Share something with the club</span><i class="ph-bold ph-camera"></i></button>`}

/* the Club feed page */
function html(){
  if(!tok())return (typeof pageHead==='function'?pageHead('Club feed'):'')+'<div class="card empty fd"><i class="ph-bold ph-users-three"></i>Sign in to see the club feed and post with the members.</div>';
  if(!BUSY&&Date.now()-LAST>30000)setTimeout(()=>load(),0);
  const body=!LOADED?'<p class="meta">Loading the club feed...</p>'
    :ERR&&!ITEMS.length?`<div class="card empty"><i class="ph-bold ph-wifi-slash"></i>${esc(ERR)}<div class="acts"><button class="btn small ghost" data-fdreload>Try again</button></div></div>`
    :!ITEMS.length?'<div class="card empty"><i class="ph-bold ph-chat-circle-dots"></i>Nothing here yet. Be the first to post.</div>'
    :ITEMS.map(itemHTML).join('')+(MORE?`<button type="button" class="btn ghost fdload" data-fdmore>${BUSY?'Loading...':'Show older posts'}</button>`:'<p class="meta fdend">That\'s everything.</p>');
  return (typeof pageHead==='function'?pageHead('Club feed','Posts from the members, club news, photos and big shots.'):'')
    +`<div class="fd rise">${LEAD?`<div class="row" style="margin:0 0 10px"><button type="button" class="btn small ghost" data-fdqueue><i class="ph-bold ph-megaphone"></i> Club pages${CLUBQ?' ('+CLUBQ+' waiting)':''}</button></div>`:''}${LEAD&&HELD?`<p class="fdhold"><i class="ph-bold ph-flag"></i> ${HELD} on hold from reports. Look for the gray cards below.</p>`:''}${composer()}${body}</div>`}

/* Home overview: newest two, new count */
function peek(){if(!tok())return '';if(!LOADED&&!BUSY)setTimeout(()=>load(),0);
  const two=ITEMS.slice(0,2);
  return `<section class="fd fdpeek"><div class="fdph"><h2 class="sec">Club feed${NEW?` <span class="fdnum">${NEW} new</span>`:''}</h2><button class="btn small ghost" data-sub="home|feed">Open the feed</button></div>
   ${two.length?two.map(itemHTML).join(''):composer()}</section>`}

/* new post */
function prep(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),im=new Image();
  const make=(side,limit,q)=>{for(let i=0;i<6;i++){const k=Math.min(1,side/Math.max(im.naturalWidth,im.naturalHeight)),c=document.createElement('canvas');
      c.width=Math.max(1,Math.round(im.naturalWidth*k));c.height=Math.max(1,Math.round(im.naturalHeight*k));
      const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
      const out=c.toDataURL('image/jpeg',q);if(out.startsWith('data:image/jpeg')&&out.length<limit)return out;side=Math.round(side*.8);q=Math.max(.55,q-.07)}
    return null};
  im.onload=()=>{URL.revokeObjectURL(u);const f=make(1800,760000,.84),t=make(720,150000,.78);f&&t?res({img:f,thumb:t}):rej(new Error('That photo is too big. Try another one.'))};
  im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('That photo didn\'t open. Try a JPG or PNG.'))};im.src=u})}
function openPost(){if(!tok()){say('Sign in to post.');return}let pic=null;
  openSheet(`<form id="fdForm" class="fd"><h3 style="margin:0">Post to the club feed</h3><p class="meta" style="margin:2px 0 10px">Every member sees it right away.</p>
   <label class="sr" for="fdText">What's going on?</label><textarea class="field" id="fdText" maxlength="1000" rows="4" placeholder="Round recap, a tee time with open spots, game day plans..."></textarea>
   <div id="fdPrev"></div>
   <div class="row" style="gap:8px;margin-top:10px"><label class="btn ghost small" for="fdFile" style="cursor:pointer"><i class="ph-bold ph-camera-plus"></i> Add a photo</label>
    <input type="file" id="fdFile" accept="image/*" hidden><span class="meta" id="fdCount" style="margin-left:auto">0/1000</span></div>
   <button class="btn" type="submit" style="width:100%;margin-top:12px" disabled><i class="ph-bold ph-paper-plane-tilt"></i> Post</button>
   <p class="meta" id="fdErr" role="alert" style="min-height:1.2em;margin-top:6px"></p>
   <p class="help">Keep it about the club: golf, Raiders, trips. Leaders can take posts down.</p></form>`);
  const f=document.getElementById('fdForm'),ta=document.getElementById('fdText'),inp=document.getElementById('fdFile'),btn=f.querySelector('button[type=submit]'),err=document.getElementById('fdErr'),prev=document.getElementById('fdPrev');
  const sync=()=>{btn.disabled=!ta.value.trim()&&!pic;document.getElementById('fdCount').textContent=ta.value.length+'/1000'};
  const show=()=>{prev.innerHTML=pic?`<div class="fdpv"><img src="${pic.thumb}" alt=""><button type="button" class="btn small ghost" id="fdX" aria-label="Remove the photo"><i class="ph-bold ph-x"></i></button></div>`:'';
    const x=document.getElementById('fdX');if(x)x.onclick=()=>{pic=null;show();sync()};sync()};
  ta.oninput=sync;
  inp.onchange=async()=>{const file=inp.files&&inp.files[0];inp.value='';if(!file)return;err.textContent='Getting the photo ready...';
    try{pic=await prep(file);err.textContent=''}catch(x){err.textContent=x.message}show()};
  f.onsubmit=e=>{e.preventDefault();if(btn.disabled)return;btn.disabled=true;err.textContent='Posting...';
    call('/feed/post',Object.assign({text:ta.value},pic||{})).then(()=>{if(typeof closeSheet==='function')closeSheet();say('Posted');
        if(typeof goSub==='function'&&!onPage())goSub('home','feed');return load()})
      .catch(x=>{err.textContent=errMsg(x);btn.disabled=false})};
  setTimeout(()=>{if(matchMedia('(min-width:1000px)').matches)ta.focus()},60)}

/* share to the member's own Facebook, Instagram, texts: the phone's share menu, photo included when there is one */
const SITE='https://raidernationgolfclub.com';
async function share(key){const x=find(key);if(!x)return;
  const text=(x.t==='post'?x.body:x.t==='news'?x.title+'\n\n'+x.body:x.t==='shot'?x.title+(x.body?' '+x.body:''):(x.cap||'Golf day with the club'))+'\n\n#RaiderNationGolfClub';
  const src=x.t==='post'&&x.img?api()+'/feed/img?id='+x.id:x.t==='news'&&x.img?api()+'/news/img?id='+x.id:x.t==='photos'?api()+'/photos/img?id='+x.ids[0]:'';
  let files=[];
  if(src)try{const b=await (await fetch(src)).blob();const f=new File([b],'raider-nation-golf.jpg',{type:'image/jpeg'});if(navigator.canShare&&navigator.canShare({files:[f]}))files=[f]}catch(e){}
  const data=files.length?{text,files}:{text,url:SITE};
  if(navigator.share){try{await navigator.share(data)}catch(e){if(e&&e.name!=='AbortError')say('Sharing didn\'t work on this phone.')}return}
  try{await navigator.clipboard.writeText(text+'\n'+SITE);say('Copied. Paste it into your post.')}catch(e){say('Sharing works from the phone app.')}}

/* Send to club pages (leaders): the club's own Facebook page and Instagram. Admins post straight out; a chapter
   president's send waits for an admin's OK. A member's post needs their OK first. */
let CLUBQ=0,SOC=null;
const TAGS='#RaiderNationGolfClub #RaiderNation #GolfLife';
const SOCST={needs_ok:'Waiting for an admin\'s OK',waiting:'Waiting for the club pages to be connected',sent:'Posted',failed:'Didn\'t go out',dropped:'Stopped'};
function socLoad(){return call('/social/status').then(j=>{SOC=j;CLUBQ=(j.items||[]).filter(x=>x.status==='needs_ok').length;return j})}
function socList(){if(!SOC)return '<p class="meta">Loading...</p>';const it=SOC.items||[];
  if(!it.length)return '<p class="meta">Nothing sent to the club pages yet.</p>';
  return it.map(x=>`<div class="fdq"><div><b>${esc(SOCST[x.status]||x.status)}</b> · ${[x.fb?'Facebook':'',x.ig?'Instagram':''].filter(Boolean).join(' + ')}
     <p>${esc(x.caption.slice(0,140))}${x.caption.length>140?'...':''}</p><span class="fdmeta">${esc(x.name||'')} · ${ago(x.at)}${x.err?' · '+esc(x.err):''}</span></div>
     <div class="fdqa">${SOC.admin&&x.status==='needs_ok'?`<button type="button" class="btn small" data-socok="${x.id}">OK, post it</button>`:''}
     ${SOC.admin&&x.status==='failed'?`<button type="button" class="btn small ghost" data-socretry="${x.id}">Try again</button>`:''}
     ${['needs_ok','waiting','failed'].includes(x.status)?`<button type="button" class="btn small ghost" data-socdrop="${x.id}">Stop</button>`:''}</div></div>`).join('')}
function openQueue(){openSheet(`<div class="fd"><h3 style="margin:0">Club pages</h3><p class="meta" style="margin:2px 0 10px">What leaders sent to the club Facebook and Instagram.</p><div id="fdQ">${socList()}</div>
  <div class="acts" style="margin-top:12px"><button class="btn ghost" data-zoomclose>Close</button></div></div>`);
  socLoad().then(()=>{const q=document.getElementById('fdQ');if(q)q.innerHTML=socList()}).catch(x=>say(errMsg(x)))}
function openClub(key){const x=find(key);if(!x)return;
  const text=x.t==='post'?x.body:x.t==='news'?x.title+'\n\n'+x.body:x.t==='shot'?x.title+(x.body?' '+x.body:''):(x.cap||'');
  const pic=x.t==='post'&&x.img?api()+'/feed/img?id='+x.id+'&t=1':x.t==='news'&&x.img?api()+'/news/img?id='+x.id:x.t==='photos'?api()+'/photos/img?id='+x.ids[0]+'&t=1':'';
  const whose=(x.t==='post'&&!x.mine)||x.t==='photos'?(x.name||'the member'):'';
  openSheet(`<form id="socForm" class="fd"><h3 style="margin:0">Send to club pages</h3>
   <p class="meta" id="socConn" style="margin:2px 0 10px">Posts on the club Facebook page and Instagram.</p>
   ${pic?`<img src="${pic}" alt="" style="display:block;width:100%;max-height:220px;object-fit:cover;border-radius:4px;margin-bottom:10px">`:''}
   <label for="socCap">Caption</label><textarea class="field" id="socCap" rows="5" maxlength="2200">${esc((text||'').trim()+'\n\n'+TAGS)}</textarea>
   <p class="help" style="margin-top:4px">Hook first, then the town. No links. Instagram takes 5 hashtags at most.</p>
   <label class="fdck"><input type="checkbox" id="socFb" checked> Facebook page</label>
   <label class="fdck"><input type="checkbox" id="socIg" ${pic?'checked':'disabled'}> Instagram${pic?'':' · needs a photo'}</label>
   ${whose?`<label class="fdck"><input type="checkbox" id="socOk"> ${esc(whose)} said it's OK to post this</label>`:''}
   <button class="btn" type="submit" style="width:100%;margin-top:12px"><i class="ph-bold ph-megaphone"></i> <span id="socGo">Post to club pages</span></button>
   <p class="meta" id="socErr" role="alert" style="min-height:1.2em;margin-top:6px"></p></form>`);
  socLoad().then(j=>{const c=document.getElementById('socConn'),g=document.getElementById('socGo');if(!c)return;
    if(!j.connected.fb)c.textContent='The club pages aren\'t connected yet. This waits in line and goes out once they are.';
    if(!j.admin&&g)g.textContent='Send for an admin\'s OK'}).catch(()=>{});
  const f=document.getElementById('socForm'),err=document.getElementById('socErr');
  f.onsubmit=e=>{e.preventDefault();const b=f.querySelector('button[type=submit]'),okb=document.getElementById('socOk');
    if(okb&&!okb.checked){err.textContent=`Ask ${whose} first, then tick the box.`;return}
    b.disabled=true;err.textContent='Sending...';
    call('/social/send',{key,caption:document.getElementById('socCap').value,fb:document.getElementById('socFb').checked,ig:document.getElementById('socIg').checked,consent:!!(okb&&okb.checked)})
      .then(r=>{if(typeof closeSheet==='function')closeSheet();say(r.status==='sent'?'Posted to the club pages':r.status==='needs_ok'?'Sent. A club admin gives it the OK.':r.status==='failed'?'It didn\'t go out. See Club pages.':'In line. It goes out once the club pages are connected.');socLoad().then(rerender)})
      .catch(x=>{err.textContent=errMsg(x);b.disabled=false})}}

/* clicks */
const find=k=>ITEMS.find(x=>x.key===k);
function react(key,kind){const x=find(key);if(!x)return;const was=x.me;
  x.reacts=Object.assign({},x.reacts);if(was){x.reacts[was]--;if(!x.reacts[was])delete x.reacts[was]}
  x.me=was===kind?'':kind;if(x.me)x.reacts[x.me]=(x.reacts[x.me]||0)+1;rerender();   /* show it now, the server confirms */
  call('/feed/react',{key,kind}).catch(e=>{say(errMsg(e));load()})}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target;if(!t)return;
  let b;
  if(t.closest('[data-fdpost]')){e.preventDefault();openPost();return}
  if((b=t.closest('[data-fdr]'))){e.preventDefault();const [k,kind]=b.dataset.fdr.split('|');react(k,kind);return}
  if((b=t.closest('[data-fdclub]'))){e.preventDefault();openClub(b.dataset.fdclub);return}
  if(t.closest('[data-fdqueue]')){e.preventDefault();openQueue();return}
  if((b=t.closest('[data-socok],[data-socretry],[data-socdrop]'))){e.preventDefault();const d=b.dataset,path=d.socok?'/social/ok':d.socretry?'/social/retry':'/social/drop',id=+(d.socok||d.socretry||d.socdrop);
    if(d.socok&&!confirm('Post this on the club Facebook and Instagram now?'))return;
    call(path,{id}).then(r=>{say(d.socdrop?'Stopped':r.status==='sent'?'Posted to the club pages':r.status==='failed'?'It didn\'t go out.':'OK given. It goes out once the club pages are connected.');
      return socLoad().then(()=>{const q=document.getElementById('fdQ');if(q)q.innerHTML=socList();rerender()})}).catch(x=>say(errMsg(x)));return}
  if((b=t.closest('[data-fdshare]'))){e.preventDefault();share(b.dataset.fdshare);return}
  if((b=t.closest('[data-fdopen]'))){e.preventDefault();const k=b.dataset.fdopen;OPEN.add(k);rerender();
    setTimeout(()=>{const i=document.querySelector(`.fdadd[data-fdcm="${CSS.escape(k)}"] input`);if(i)i.focus()},30);return}
  if((b=t.closest('[data-fdzoom]'))){e.preventDefault();openSheet(`<img class="zoomimg" src="${esc(b.dataset.fdzoom)}" alt=""><div class="acts" style="margin-top:10px"><button class="btn ghost" data-zoomclose>Close</button></div>`);return}
  if((b=t.closest('[data-fddel]'))){e.preventDefault();const [kind,id]=b.dataset.fddel.split('|');
    if(!confirm(kind==='p'?'Take this post down? It leaves the feed for everyone.':'Take this comment down?'))return;
    call('/feed/delete',{kind,id:+id}).then(()=>{say('Taken down');return load()}).catch(x=>say(errMsg(x)));return}
  if((b=t.closest('[data-fdrep]'))){e.preventDefault();const [kind,id]=b.dataset.fdrep.split('|');
    const why=prompt(kind==='p'?'Report this post to the club leaders. What\'s wrong with it? (optional)':'Report this comment to the club leaders. What\'s wrong with it? (optional)','');
    if(why===null)return;call('/feed/report',{kind,id:+id,why}).then(r=>{say(r.held?'Reported. It\'s on hold for the leaders.':'Reported to the club leaders. Thanks.');return load()}).catch(x=>say(errMsg(x)));return}
  if((b=t.closest('[data-fdkeep]'))){e.preventDefault();const [kind,id]=b.dataset.fdkeep.split('|');
    call('/feed/keep',{kind,id:+id}).then(()=>{say('Kept. It\'s back for everyone.');return load()}).catch(x=>say(errMsg(x)));return}
  if(t.closest('[data-fdmore]')){e.preventDefault();load(true);return}
  if(t.closest('[data-fdreload]')){e.preventDefault();LOADED=false;rerender();load();return}});
document.addEventListener('input',e=>{const f=e.target.closest&&e.target.closest('.fdadd');if(f)DRAFT[f.dataset.fdcm]=e.target.value});
document.addEventListener('submit',e=>{const f=e.target.closest&&e.target.closest('.fdadd');if(!f)return;e.preventDefault();
  const key=f.dataset.fdcm,i=f.querySelector('input'),text=i.value.trim();if(!text)return;i.disabled=true;
  call('/feed/comment',{key,text}).then(()=>{DRAFT[key]='';OPEN.add(key);i.blur();return load()}).catch(x=>{say(errMsg(x));i.disabled=false})});

/* styles: square corners, the app's colors */
const css=`.fd .card{border-radius:6px}
.fd .fdi{margin:0 0 12px;padding:14px}
.fd .fdi.held{opacity:.72;border-style:dashed}
.fd .fdhead{display:flex;align-items:center;gap:10px}
.fd .fdhead .av{width:40px;height:40px;font-size:15px;flex:none}
.fd .fdico{font-size:20px}
.fd .fdwho{display:flex;flex-direction:column;min-width:0;flex:1}
.fd .fdwho b{font-size:15px;line-height:1.25}
.fd .fdmeta{color:var(--muted);font-size:13px}
.fd .fdmeta button{background:none;border:0;color:var(--muted);font:inherit;padding:4px 0;text-decoration:underline;cursor:pointer}
.fd .fdmenu{display:flex;gap:2px}
.fd .fdmenu button{background:none;border:0;color:var(--muted);width:40px;height:40px;border-radius:4px;font-size:18px;cursor:pointer}
.fd .fdmenu button:hover{background:var(--panel-2);color:var(--silver)}
.fd .fdtitle{margin:10px 0 0;font-size:18px}
.fd .fdtext{margin:10px 0 0;white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.45}
.fd .fdclip{display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.fd .fdimg{display:block;width:100%;margin:10px 0 0;padding:0;border:0;background:none;cursor:zoom-in}
.fd .fdimg img{display:block;width:100%;max-height:520px;object-fit:cover;border-radius:4px}
.fd .fdgrid{display:grid;gap:4px;margin-top:10px;grid-template-columns:1fr 1fr}
.fd .fdgrid.n1{grid-template-columns:1fr}
.fd .fdgrid button{position:relative;padding:0;border:0;background:var(--panel-2);aspect-ratio:4/3;overflow:hidden;border-radius:4px;cursor:zoom-in}
.fd .fdgrid.n1 button{aspect-ratio:auto}
.fd .fdgrid.n3 button:first-child{grid-row:span 2;aspect-ratio:auto}
.fd .fdgrid img{width:100%;height:100%;object-fit:cover;display:block}
.fd .fdgrid span{position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.55);font-size:22px;font-weight:700;color:#fff}
.fd .fdbar{display:flex;gap:6px;margin-top:12px;flex-wrap:wrap}
.fd .fdr{min-width:52px;height:40px;padding:0 10px;border:1px solid var(--line);background:var(--panel-2);color:var(--silver);border-radius:4px;font-size:18px;display:inline-flex;align-items:center;justify-content:center;gap:5px;cursor:pointer}
.fd .fdr small{font-size:13px;font-weight:700}
.fd .fdr.on{border-color:var(--silver);background:#2a2f37}
.fd .fdc{margin-left:auto}
.fd .fdcm{margin-top:4px}
.fd .fdk{display:flex;gap:8px;margin-top:10px}
.fd .fdk .av{width:30px;height:30px;font-size:12px;flex:none}
.fd .fdk p{margin:0;background:var(--panel-2);padding:7px 10px;border-radius:4px;white-space:pre-wrap;overflow-wrap:anywhere;font-size:15px}
.fd .fdk.held p{opacity:.6;border:1px dashed var(--line)}
.fd .fdk .fdmeta{display:block;margin:2px 0 0 4px;font-size:12px}
.fd .fdmore{background:none;border:0;color:var(--muted);font:inherit;font-size:14px;padding:8px 0 0;cursor:pointer;text-decoration:underline}
.fd .fdadd{display:flex;gap:6px;margin-top:10px}
.fd .fdadd .field{flex:1;min-height:44px;margin:0;border-radius:4px}
.fd .fdadd .btn{min-width:48px;padding:0 12px;border-radius:4px}
.fd .fdnew{display:flex;align-items:center;gap:10px;width:100%;text-align:left;margin:0 0 12px;padding:12px 14px;color:var(--muted);font:inherit;font-size:16px;cursor:pointer}
.fd .fdnew .av{width:40px;height:40px;font-size:15px;flex:none}
.fd .fdnew span{flex:1}
.fd .fdnew i{font-size:22px;color:var(--silver)}
.fd .fdhold{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:10px 0 12px;color:var(--muted);font-size:14px}
.fd .fdi .fdhold{margin:10px 0 0}
.fd .btn,.fd .btn.small{border-radius:4px}
.fd .fdload{width:100%;margin:4px 0 8px}
.fd .fdend{text-align:center;margin:8px 0 16px}
.fd .fdpv{position:relative;margin-top:10px}
.fd .fdpv img{display:block;width:100%;max-height:260px;object-fit:cover;border-radius:4px}
.fd .fdpv .btn{position:absolute;top:6px;right:6px;min-height:36px;padding:0 10px}
.fd .fdck{display:flex;align-items:center;gap:10px;min-height:44px;font-size:16px}
.fd .fdck input{width:22px;height:22px;accent-color:var(--silver)}
.fd .fdq{display:flex;gap:10px;justify-content:space-between;align-items:flex-start;padding:10px 0;border-top:1px solid var(--line)}
.fd .fdq p{margin:4px 0;font-size:14px;white-space:pre-wrap;overflow-wrap:anywhere}
.fd .fdqa{display:flex;flex-direction:column;gap:6px;flex:none}
.fdpeek{margin:18px 0 6px}
.fdpeek .fdph{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.fdpeek .fdph .sec{margin:0}
.fdnum{display:inline-block;margin-left:6px;padding:2px 7px;border-radius:3px;background:#c8102e;color:#fff;font-size:13px;vertical-align:middle;font-family:system-ui,sans-serif}
.fd .sr,.fdpeek .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* open straight to the feed from a phone alert (/#feed) */
function deep(){if(location.hash!=='#feed')return;try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
  const go=()=>{if(typeof goSub==='function'&&typeof setTab==='function'){if(S.tab!=='home')setTab('home');goSub('home','feed')}else setTimeout(go,200)};go()}
window.addEventListener('hashchange',deep);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){poll();if(onPage()&&Date.now()-LAST>30000)load()}});
if(typeof window.signedIn==='function'){const orig=window.signedIn;window.signedIn=function(){const r=orig.apply(this,arguments);LOADED=false;ITEMS=[];setTimeout(()=>{load();poll()},500);return r}}
setInterval(()=>{if(document.visibilityState!=='visible')return;if(onPage())load();else poll()},60000);
setTimeout(()=>{deep();if(tok()){load();poll()}},400);
window.RNGCFEED={html,peek,load,openPost};
})();
