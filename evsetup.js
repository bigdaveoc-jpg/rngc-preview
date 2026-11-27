/* Event setup on tiles (David, Nov 26 2026: "re work the entire event set up ... needs to be alot easier", "use the new tile
   menu", "less clicky", "as easy as possible to create, edit, manage and control", "drag and drop players into the teams").
   Spec: docs/superpowers/specs/2026-11-26-event-setup-tiles-design.md. Approved mockup: tile-menus-mockup/event-setup.html.
   One sheet: what's left, event-day box, 4 tiles (Details, Teams, Game, Pay & invite), one pane. Saves as you go.
   The club server checks every rule again (who can edit which event). */
(function(){
'use strict';
const C=()=>window.RNGCCHAPTER,U=()=>window.RNGCUPLOAD;
const call=(p,b)=>C().club(p,b);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=m=>{if(typeof toast==='function')toast(m)};
const evOf=id=>(typeof EVENTS!=='undefined'?EVENTS:[]).find(x=>x.id===id);
const many=(n,w)=>n+' '+w+(n===1?'':'s');
const low=s=>String(s==null?'':s).trim().replace(/\s+/g,' ').toLowerCase();
const mkId=()=>'p'+Date.now().toString(36)+Math.floor(Math.random()*1e6).toString(36);
const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/Los_Angeles'});
const TEAM={1:'Singles',2:'Twosomes',3:'Threesomes',4:'Foursomes',5:'5 a team',6:'6 a team'};
const FMT=[['scramble','Scramble'],['bestball','Best ball'],['best2','Best 2'],['shamble','Shamble'],['stroke','Stroke'],['stableford','Stableford']];
const IC={details:'calendar-blank',teams:'users-three',game:'flag-pennant',share:'qr-code'};

/* ---- the course list (same file the Courses tab uses) and a course's pars ---- */
/* Course editor fixes (renames, added courses, hidden doubles, par) come from the same phone copy courseedit.js keeps,
   read fresh on every search so a fix made a minute ago shows up here too (Nov 26: Los Serranos renamed). */
let LIB=null,LIBP=null,RAWLIB=null;const PARS={};
const edits=()=>{try{return JSON.parse(localStorage.getItem('rngc-course-edits')||'{}').items||{}}catch(e){return {}}};
const merge=()=>{const E=edits(),out=RAWLIB.filter(c=>!(E[c.id]&&E[c.id].hide)).map(c=>{const e=E[c.id];return e&&e.par?{id:c.id,name:e.name,city:e.city,st:e.state||c.st}:c});
  for(const[id,e]of Object.entries(E))if(e.new&&!e.hide&&e.par)out.push({id,name:e.name,city:e.city,st:e.state});return LIB=out};
const lib=()=>(LIBP=LIBP||fetch('scorecard/courses/index.json').then(r=>{if(!r.ok)throw 0;return r.json()}).then(j=>{
  const F=j.fields||[],k=n=>F.indexOf(n);RAWLIB=(j.courses||[]).map(c=>({id:c[k('id')],name:c[k('name')],city:c[k('city')],st:c[k('state')]}))}).catch(e=>{LIBP=null;throw e})).then(merge);
const pars=id=>{const e=edits()[id];if(e&&e.par)return Promise.resolve(PARS[id]=e.par.slice());
  return PARS[id]?Promise.resolve(PARS[id]):fetch('scorecard/courses/c/'+encodeURIComponent(id)+'.json').then(r=>r.ok?r.json():null).then(j=>PARS[id]=(j&&j.app&&j.app.par)||[]).catch(()=>[])};
const courseName=id=>{const c=LIB&&LIB.find(x=>x.id===id);return c?c.name:''};

/* ---- state for the open sheet ---- */
let ST=null;   /* {id, tile, field:{teams,bench,cfg,start}, cards, here, closed, mv, upl, newev} */
const F=()=>ST.field||(ST.field={teams:[],bench:[],cfg:{}});
const teamsOf=()=>F().teams||(F().teams=[]),benchOf=()=>F().bench||(F().bench=[]);
const np=()=>teamsOf().reduce((a,t)=>a+t.players.length,0);
const nameOf=t=>((ST.cards||{})[t.id]||{}).name||'';

/* ---- saving as you go: one note at the top says Saving / Saved / Didn't save ---- */
const T={};
function note(s,bad){const n=document.getElementById('esSaved');if(n){n.textContent=s;n.classList.toggle('bad',!!bad)}}
function run(p){note('Saving...');return p.then(j=>{note('✓ Saved');return j},x=>{note(x&&x.status===401?'Sign in again':'Didn\'t save. Check your signal.',1);throw x})}
function later(key,fn,ms){clearTimeout(T[key]);note('Saving...');T[key]=setTimeout(()=>{delete T[key];run(fn()).catch(()=>{})},ms==null?700:ms)}
const saveInfo=f=>run(C().saveInfo(ST.id,f)).then(j=>{tilesOnly();return j});
const saveField=()=>run(call('/admin/field',{ev:ST.id,teams:teamsOf().map(t=>({id:t.id,start:t.start,players:t.players})),bench:benchOf()})).then(j=>{if(j.field)ST.field=j.field;tilesOnly();return j});
const saveCfg=()=>run(call('/admin/field',{ev:ST.id,cfg:F().cfg||{}})).then(()=>tilesOnly());

/* ---- the sheet ---- */
function open(id,tile){const e=evOf(id);if(!e)return;
  if(!C().canInfo(e)){say('Club admins and this chapter\'s president change this event.');return}
  ST={id,tile:tile||'details',field:null,cards:{},here:{},closed:null,started:null,live:false,mv:null,upl:null,loaded:false};
  openSheet('<div id="es" class="es"></div>');draw();
  call('/event/board',{ev:id}).then(j=>{if(!ST||ST.id!==id)return;ST.field=j.field||{teams:[],bench:[],cfg:{}};ST.cards=j.cards||{};ST.here=j.here||{};ST.closed=j.closed||null;ST.started=j.started||null;ST.live=!!j.live;ST.loaded=true;
    if(!tile&&isDay(e))ST.tile='teams';draw()},()=>{if(ST&&ST.id===id){ST.loaded=true;ST.err=1;draw()}});
  if(e.course)lib().then(()=>tilesOnly()).catch(()=>{})}
const isDay=e=>e&&e.date===today();
function draw(){const box=document.getElementById('es');if(!box||!ST)return;const e=evOf(ST.id);if(!e)return;
  const sh=document.getElementById('sheet'),y=sh?sh.scrollTop:0;
  box.innerHTML=`<div class="es-top"><h3>Event setup</h3><span id="esSaved" class="es-saved" role="status"></span></div>
   <p class="meta es-sub">${esc(e.name)} · ${esc(e.chapter||'')}</p>
   ${dayBox(e)}${leftLine(e)}<nav class="swt es-tiles" id="esTiles" aria-label="Event setup parts">${tiles(e)}</nav>
   <section class="es-pane" id="esPane">${ST.loaded?PANE[ST.tile](e):'<p class="meta" style="padding:14px">Getting the event...</p>'}</section>`;
  if(sh)sh.scrollTop=y}
function tilesOnly(){const e=ST&&evOf(ST.id),t=document.getElementById('esTiles');if(!e||!t)return;t.innerHTML=tiles(e);
  const l=document.getElementById('esLeft');if(l)l.outerHTML=leftLine(e);const s=document.querySelector('#es .es-sub');if(s)s.textContent=e.name+' · '+(e.chapter||'')}
function tiles(e){const n=teamsOf().length,c=e.course;
  const st={details:[e.date?new Date(e.date+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})+(e.where?' · '+e.where.split(',')[0]:''):'No date',!e.date],
    teams:ST.loaded?(n?[many(n,'group')+' · '+np()]:['No teams yet',1]):['...'],
    game:c?[(FMT.find(f=>f[0]===(F().cfg||{}).format)||['','Pick the game'])[1]]:['Needs a course',1],
    share:e.zelle||e.url?[e.flyer?'Ready to send':'No flyer yet']:['No way to pay yet',1]};
  const L={details:'Details',teams:'Teams',game:'Game',share:'Pay & invite'};
  return Object.keys(L).map(k=>`<button type="button" class="swt-tile" data-est="${k}" aria-pressed="${k===ST.tile}"><i class="ph-bold ph-${IC[k]}" aria-hidden="true"></i><span class="swt-n">${L[k]}</span><span class="swt-s${st[k][1]?' warn':''}">${esc(st[k][0])}</span></button>`).join('')}
function leftLine(e){if(!ST.loaded)return '<div id="esLeft"></div>';const todo=[];
  if(!teamsOf().length)todo.push(['teams','Add the teams']);if(!e.course)todo.push(['details','Pick the course']);
  if(!e.zelle&&!e.url)todo.push(['share','Add the Zelle QR or pay link']);if(!e.flyer)todo.push(['share','Add the flyer']);
  return todo.length?`<div class="es-left" id="esLeft"><b>${many(todo.length,'thing')} left</b><div>${todo.map(([t,l])=>`<button type="button" data-est="${t}">${l}</button>`).join('')}</div></div>`
    :'<div class="es-left ok" id="esLeft"><b>✓ Ready for event day</b></div>'}
function dayBox(e){if(!ST.loaded||!isDay(e))return '';const cards=ST.cards||{},scoring=teamsOf().filter(t=>{const c=cards[t.id];return c&&c.scores&&Object.keys(c.scores).length}).length;
  const inn=Object.values(ST.here||{}).reduce((a,t)=>a+Object.keys(t).length,0),closed=!!ST.closed;
  const on=!closed&&(ST.started||ST.live),hm=ms=>new Date(ms).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
  return `<div class="es-day"><div class="es-dayrow"><b class="${closed?'':'live'}">${closed?'Final':on?'● Live'+(ST.started?' since '+hm(ST.started):''):'● Event day'}</b><span class="meta">${esc(F().start||'')}</span></div>
   ${closed||on?'':`<button type="button" class="btn full sq" data-esgo style="width:100%;margin:10px 0 4px"><i class="ph-bold ph-play" aria-hidden="true"></i> Start the event</button>
   <p class="meta" style="margin:0 0 6px">Goes live for everyone right away: scorecards, leaderboard, the live banner and every guest QR code.</p><div id="esGoQ"></div>`}
   <div class="es-stats"><div><strong>${scoring} of ${teamsOf().length}</strong>groups scoring</div><div><strong>${inn}</strong>players checked in</div></div>
   <div class="two" style="margin-top:10px">${hasCard(ST.id)?`<a class="btn ghost sq" href="${esc(scLink(ST.id,'board'))}">Leaderboard</a>`:'<span></span>'}
    <button type="button" class="btn sq" data-esend>${closed?'Reopen the event':'End the event'}</button></div>
   <div id="esEndQ"></div></div>`}
const hasCard=id=>typeof SCORECARD_EVENTS!=='undefined'&&SCORECARD_EVENTS.includes(id);
const scLink=(id,h)=>'scorecard/'+(id&&id!=='nov14'?'?ev='+encodeURIComponent(id):'')+'#/'+h;

/* ---- panes ---- */
const PANE={
 details(e){const n=ST.newev;return `<div class="es-pb">${detailFields(e||{},n)}</div>
   ${n?'':`<div class="es-pf"><button type="button" class="linkbtn" data-escancel>${e.status==='cancelled'?'Un-cancel the event':'Cancel the event'}</button></div><div id="esCanQ" class="es-pb" hidden></div>`}`},
 teams(){const t=teamsOf(),b=benchOf(),mv=ST.mv;
  if(ST.upl)return uploadPreview();
  return `<div class="es-pb">${t.length?'':dropZone()}
   ${t.length?`<div class="es-sum"><b>${many(t.length,'group')} · ${many(np(),'player')}</b><span class="meta">Drag a name, or tap it then a group</span></div>
   <div class="es-bench" data-drop="bench"><b>Not on a team · ${b.length}</b><div class="es-ps">${b.map((p,j)=>chip('b',j,p)).join('')||'<span class="meta">Drag a player here to take them off a team</span>'}
     <button type="button" class="es-p add" data-esadd="b">+ Player</button></div></div>`:''}
   ${mv?`<div class="es-moving"><span>Moving <b>${esc(mv.n)}</b>: tap a group</span><span>${mv.g==='b'?'':'<button type="button" class="es-sm" data-esoff>Bench</button> '}<button type="button" class="es-sm" data-escx>Cancel</button></span></div>`:''}
   ${t.map((g,i)=>`<div class="es-grp${mv&&mv.g!==i?' target':''}" data-drop="${i}">
     <select class="es-hole" data-eshole="${i}" aria-label="Starting hole">${Array.from({length:18},(_,h)=>`<option ${h+1===g.start?'selected':''}>${h+1}</option>`).join('')}</select>
     <div style="min-width:0"><input class="es-tname" data-estn="${i}" maxlength="24" value="${esc(nameOf(g))}" placeholder="Team name, optional" aria-label="Team name">
     <div class="es-ps">${g.players.map((p,j)=>chip(i,j,p)).join('')}${g.players.length<6?`<button type="button" class="es-p add" data-esadd="${i}">+ Player</button>`:''}
     ${g.players.length?'':`<button type="button" class="es-p add" data-esrm="${i}">Remove group</button>`}</div></div></div>`).join('')}</div>
   ${t.length?`<div class="es-pf"><button type="button" class="linkbtn" data-esaddg>Add a group</button><button type="button" class="linkbtn" data-esnew>Upload a new sheet</button><button type="button" class="linkbtn danger" data-esclear>Clear all</button></div><div id="esClearQ" class="es-pb" hidden></div>`:''}`},
 game(e){if(!e.course)return `<div class="es-pb"><p class="meta">Pick the course in Details first. It's saved with the event for the live scorecard.</p><button type="button" class="btn full sq" data-est="details" style="width:100%;margin-top:10px">Pick the course</button></div>`;
  const c=F().cfg||{},pr=PARS[e.course]||[],ctp=c.ctp||[],ld=c.ld||0;
  if(!PARS[e.course])pars(e.course).then(()=>{if(ST&&ST.tile==='game')draw()});
  const holes=(k,on)=>`<div class="es-holes">${Array.from({length:18},(_,h)=>`<button type="button" class="es-h${pr[h]===3?' par3':''}" data-es${k}="${h+1}" aria-pressed="${on(h+1)}">${h+1}</button>`).join('')}</div>`;
  return `<div class="es-pb"><p class="meta" style="margin:0">${esc(courseName(e.course)||e.where||'Course picked')}</p>
   <div class="es-lbl">Format</div><div class="es-g3">${FMT.map(([k,l])=>`<button type="button" class="es-sm" data-esfmt="${k}" aria-pressed="${(c.format||'scramble')===k}">${l}</button>`).join('')}</div>
   <div class="es-lbl">Closest to pin${pr.length?' · dots are par 3s':''}</div>${holes('ctp',h=>ctp.includes(h))}
   <div class="es-lbl">Long drive</div>${holes('ld',h=>ld===h)}
   <div class="es-lbl">Skins</div><div class="es-g3">${['off','gross','net'].map(k=>`<button type="button" class="es-sm" data-essk="${k}" aria-pressed="${(c.skins||'off')===k}">${k==='off'?'Off':k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</div>
   ${hasCard(ST.id)?'':'<p class="meta" style="margin-top:12px">The live scorecard for this course is the next piece we build. Your game is saved for it.</p>'}</div>`},
 share(e){const pic=(k,label,src)=>`<div><label class="es-pic${src?' on':''}" for="es${k}In">${src?`<img src="${esc(src)}" alt="${label}">`:`<span>Tap to add the ${label==='Flyer'?'flyer':label}</span>`}</label>
     <input type="file" id="es${k}In" accept="image/*" hidden data-espic="${k==='Fly'?'flyer':'zelle'}">${src?`<button type="button" class="linkbtn" data-espicx="${k==='Fly'?'flyer':'zelle'}">Remove</button>`:''}</div>`;
  return `<div class="es-pb"><div class="es-pics">${pic('Fly','Flyer',e.flyer)}${pic('Zel','Zelle QR',e.zelle)}</div><p class="meta" id="esPicMsg" role="status"></p>
   <label for="esZn">Zelle note, optional</label><input class="field" id="esZn" data-esinfo="zelle_note" maxlength="200" value="${esc(e.zelNote||'')}" placeholder="Send to Ross Ricks. Put your name and the event in the memo.">
   <label for="esU">Sign-up and pay link, optional</label><input class="field" id="esU" data-esinfo="url" type="url" maxlength="300" value="${esc(e.url&&/^(https:|\/)/.test(e.url)?e.url:'')}" placeholder="https://... from the club store">
   <button type="button" class="btn full sq" data-esinv style="width:100%;margin-top:14px"><i class="ph-bold ph-paper-plane-tilt"></i> Write the invite</button>
   <p class="meta">Opens the club message box with the invite written. You pick who gets it and tap Send.</p></div>
   ${typeof isPast==='function'&&!isPast(e.date)?`<div class="es-pf"><button type="button" class="linkbtn" data-gpqr="${esc(ST.id)}">Guest pass QR</button></div>`:''}`}};
function chip(g,j,name){const mv=ST.mv,on=mv&&mv.g===g&&mv.j===j;return `<button type="button" class="es-p${on?' sel':''}" data-esp="${g}:${j}">${esc(name.name||name)}</button>`}
function detailFields(e,n){const sel=(k,v)=>+e.team===v;
  const chs=n?(C().mine?C().mine():[]).filter(c=>c!=='Club'):[];
  return `${n&&chs.length>1?`<div class="es-lbl" style="margin-top:0">Chapter</div><div class="es-g3">${chs.map(c=>`<button type="button" class="es-sm" data-esch="${c}" aria-pressed="${ST.newev.chapter===c}">${c}</button>`).join('')}</div>`:''}
   <label for="esN">Event name</label><input class="field" id="esN" data-esinfo="name" required minlength="3" maxlength="70" value="${esc(e.name||'')}" placeholder="RNGC vs ...">
   <div class="two"><div><label for="esD">Date</label><input class="field" id="esD" data-esinfo="date" type="date" value="${esc(e.date||'')}"></div>
    <div><label for="esP">Price</label><input class="field" id="esP" data-esinfo="price" maxlength="30" value="${esc(e.price||'')}" placeholder="$175 per player"></div></div>
   <label for="esW">Course</label><div class="es-course"><input class="field" id="esW" autocomplete="off" maxlength="90" value="${esc(e.where||'')}" placeholder="Start typing: Los Serranos"><div id="esSug"></div></div>
   <p class="meta${e.course?' es-ok':''}" id="esWhy">${e.course?'✓ '+esc(courseName(e.course)||'On our course list'):'Pick it from the list so the scorecard knows the holes.'}</p>
   <div class="es-lbl">Team size</div><div class="es-g6">${[1,2,3,4,5,6].map(v=>`<button type="button" class="es-sm" data-essize="${v}" aria-pressed="${sel('team',v)}" aria-label="${TEAM[v]}">${v}</button>`).join('')}</div>
   <div class="two"><div><label for="esCap">Players max</label><input class="field" id="esCap" data-esinfo="cap" type="number" inputmode="numeric" min="0" max="500" value="${e.cap||''}" placeholder="No limit"></div>
    <div><label for="esS">Start</label><input class="field" id="esS" data-esstart maxlength="40" value="${esc(n?'':(F().start||''))}" placeholder="8:00 am shotgun"></div></div>
   <label for="esNo">Details</label><textarea class="field" id="esNo" data-esinfo="note" maxlength="600" rows="3" placeholder="Check-in time, what's included">${esc(e.note||'')}</textarea>
   <label for="esR">Rules</label><textarea class="field" id="esR" data-esinfo="rules" maxlength="1500" rows="3" placeholder="Mulligans, gimmes, carts, dress code">${esc(e.rules||'')}</textarea>
   ${n?`<div class="es-lbl">Teams, optional</div><div id="esNewTeams">${newTeamsBox()}</div>
     <button type="button" class="btn full sq" data-esmake style="width:100%;margin-top:14px"><i class="ph-bold ph-plus"></i> Make the event</button><p class="meta" id="esMakeErr" role="alert" style="color:#ffb3b5"></p>`:''}`}

/* ---- teams from a sheet: drop zone, preview, replace ---- */
function dropZone(){return `<div class="es-drop" data-esdropzone><b>Add your teams sheet</b><p class="meta">Excel, CSV, or paste the names. We find the groups and holes for you, and you see them before they save.</p>
  <div class="two"><label class="btn ghost sq" for="esUpF" style="cursor:pointer">Pick a file</label><button type="button" class="btn ghost sq" data-espaste>Paste names</button></div>
  <input type="file" id="esUpF" accept=".xlsx,.xls,.xlsm,.ods,.csv,.txt,.tsv,text/csv,text/plain" hidden>
  <div id="esPasteBox" hidden><textarea class="field" id="esUpT" rows="5" aria-label="Paste teams and players" placeholder="16B: John Smith, Mike Jones, Al Ruiz, Bo Kim&#10;Or copy the rows from Excel and paste them"></textarea>
   <button type="button" class="btn ghost sq" data-esread style="width:100%;margin-top:6px">Read what I pasted</button></div>
  <p class="meta" id="esUpMsg" role="status"></p><button type="button" class="linkbtn" data-estpl>Download a blank sheet</button></div>`}
function newTeamsBox(){const u=ST.upl;if(!u)return dropZone();const t=U().place(u.groups,u.mode),w=U().check(t);
  return `<p class="meta es-ok">${many(t.length,'group')} · ${many(t.reduce((a,x)=>a+x.players.length,0),'player')} from ${esc(u.from)}. They save with the event.</p>
   ${w.length?`<p style="color:#ffb3b5">${w.map(esc).join('<br>')}</p>`:''}<button type="button" class="linkbtn" data-esupx>Clear</button>`}
function uploadPreview(){const u=ST.upl,t=U().place(u.groups,u.mode),w=U().check(t),anyHole=u.groups.some(g=>g.hole>=1&&g.hole<=18),had=teamsOf().length;
  return `<div class="es-pb"><div class="es-sum"><b>${many(t.length,'group')} · ${many(t.reduce((a,x)=>a+x.players.length,0),'player')}</b><span class="meta">from ${esc(u.from)}</span></div>
   ${anyHole?'':`<div class="es-lbl">No starting holes in it. Where do they start?</div><div class="two"><button type="button" class="es-sm" data-esmode="shotgun" aria-pressed="${u.mode==='shotgun'}">Shotgun: 1, 2, 3...</button><button type="button" class="es-sm" data-esmode="one" aria-pressed="${u.mode==='one'}">All on hole 1</button></div>`}
   ${w.length?`<p style="color:#ffb3b5">${w.map(esc).join('<br>')}<br>Fix the sheet and upload it again.</p>`:''}
   ${t.map(g=>`<div class="es-grp"><b class="es-hn">${g.start}${esc(g.id.slice(-1))}</b><div style="min-width:0">${g.name?`<b>${esc(g.name)}</b>`:''}<div class="meta">${g.players.map(esc).join(', ')}</div></div></div>`).join('')}
   <button type="button" class="btn full sq" data-esupsave ${w.length?'disabled':''} style="width:100%;margin-top:12px">${had?'Replace all teams':'Save the teams'}</button>
   <button type="button" class="btn ghost full sq" data-esupx style="width:100%;margin-top:8px">Cancel</button></div>`}
function readRows(rows,from){const g=U().read(rows),m=document.getElementById('esUpMsg');
  if(!g.length){if(m)m.textContent='No player names found in '+from+'. Check it has a column of names, or paste them.';return}
  ST.upl={groups:g,from,mode:g.some(x=>x.hole>=1&&x.hole<=18)?'file':'shotgun'};
  if(ST.newev){const b=document.getElementById('esNewTeams');if(b)b.innerHTML=newTeamsBox()}else draw()}
/* teams from the sheet replace the groups; a name already in the event keeps its player id, so check-ins stay */
function placed(){const u=ST.upl,t=U().place(u.groups,u.mode),byName={};
  teamsOf().forEach(g=>g.players.forEach(p=>{byName[low(p.name)]=byName[low(p.name)]||p.id}));benchOf().forEach(p=>{byName[low(p.name)]=byName[low(p.name)]||p.id});
  const seen=new Set(),teams=t.map(g=>({id:g.id,start:g.start,name:g.name,players:g.players.map(n=>{let id=byName[low(n)];if(!id||seen.has(id))id=mkId();while(seen.has(id))id=mkId();seen.add(id);return {id,name:n}})}));
  return {teams,bench:benchOf().filter(p=>!seen.has(p.id))}}
async function saveTeamsFrom(ev,pl){const j=await call('/admin/field',{ev,teams:pl.teams.map(t=>({id:t.id,start:t.start,players:t.players})),bench:pl.bench});
  const named=pl.teams.filter(t=>t.name);let left=0;
  for(const t of named){try{const r=await call('/event/name',{ev,team:t.id,name:t.name});if(ST&&ST.id===ev)(ST.cards[t.id]||(ST.cards[t.id]={})).name=r.name}catch(e){left++}}
  return {field:j.field,left}}

/* ---- moving players: drag, or tap then tap a group ---- */
function take(src,j){return src==='b'?benchOf().splice(j,1)[0]:teamsOf()[src].players.splice(j,1)[0]}
function move(src,j,dst){if(String(src)===String(dst)||(src==='b'&&dst==='bench'))return;
  if(dst!=='bench'&&teamsOf()[+dst].players.length>=6){say('That group is full: 6 players at most.');return}
  const p=take(src,j);if(dst==='bench')benchOf().push(p);else teamsOf()[+dst].players.push(p);ST.mv=null;draw();
  saveField().then(()=>say(dst==='bench'?p.name+' is off the team':p.name+' moved to hole '+teamsOf()[+dst].start),()=>say('Didn\'t save. Check your signal.'))}
let drag=null,justDragged=false;
document.addEventListener('pointerdown',e=>{const c=e.target.closest&&e.target.closest('#es [data-esp]');if(!c||e.button>0)return;const [a,j]=c.dataset.esp.split(':');
  drag={src:a==='b'?'b':+a,j:+j,el:c,x:e.clientX,y:e.clientY,on:false,ghost:null,over:null}});
document.addEventListener('pointermove',e=>{if(!drag)return;
  if(!drag.on){if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<6)return;drag.on=true;if(ST)ST.mv=null;drag.el.classList.add('dragging');
    const g=document.createElement('div');g.className='es-ghost';g.textContent=drag.el.textContent;document.body.appendChild(g);drag.ghost=g}
  e.preventDefault();drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';
  const t=document.elementFromPoint(e.clientX,e.clientY),d=t&&t.closest('#es [data-drop]');
  if(drag.over&&drag.over!==d)drag.over.classList.remove('over');if(d){d.classList.add('over');drag.over=d}else drag.over=null;
  const sh=document.getElementById('sheet'),r=sh&&sh.getBoundingClientRect();if(r){if(e.clientY<r.top+60)sh.scrollTop-=14;else if(e.clientY>r.bottom-60)sh.scrollTop+=14}},{passive:false});
document.addEventListener('pointerup',()=>{if(!drag)return;const d=drag;drag=null;if(!d.on)return;justDragged=true;setTimeout(()=>{justDragged=false},60);
  d.ghost.remove();d.el.classList.remove('dragging');if(d.over){d.over.classList.remove('over');move(d.src,d.j,d.over.dataset.drop)}});
document.addEventListener('pointercancel',()=>{if(drag){if(drag.ghost)drag.ghost.remove();drag.el.classList.remove('dragging')}drag=null});

/* ---- one click handler for the sheet ---- */
document.addEventListener('click',ev=>{const box=document.getElementById('es');if(!box||!box.contains(ev.target)||!ST)return;
  const q=s=>ev.target.closest(s);let b;const e=evOf(ST.id);
  if(justDragged){justDragged=false;return}
  if(b=q('[data-est]')){if(ST.newev)return;ST.tile=b.dataset.est;ST.mv=null;draw();return}
  /* teams */
  if(ST.mv&&!q('[data-esp]')&&(b=q('[data-drop]'))&&!q('button,select,input')){move(ST.mv.g,ST.mv.j,b.dataset.drop);return}
  if(b=q('[data-esp]')){const [a,j0]=b.dataset.esp.split(':'),g=a==='b'?'b':+a,j=+j0,mv=ST.mv;
    if(mv&&!(mv.g===g&&mv.j===j)&&g!=='b'&&mv.g!==g){move(mv.g,mv.j,g);return}
    ST.mv=mv&&mv.g===g&&mv.j===j?null:{g,j,n:(g==='b'?benchOf()[j]:teamsOf()[g].players[j]).name};draw();return}
  if(q('[data-esoff]')){move(ST.mv.g,ST.mv.j,'bench');return}
  if(q('[data-escx]')){ST.mv=null;draw();return}
  if(b=q('[data-esadd]')){const k=b.dataset.esadd;b.outerHTML=`<input class="es-newp" data-esnewp="${k}" maxlength="40" placeholder="Name, then Enter" aria-label="New player name">`;const i=box.querySelector('[data-esnewp]');if(i)i.focus();return}
  if(b=q('[data-esrm]')){teamsOf().splice(+b.dataset.esrm,1);draw();saveField().catch(()=>{});return}
  if(q('[data-esaddg]')){const t=teamsOf(),used=new Set(t.map(g=>g.id));let h=1;while(h<18&&t.some(g=>g.start===h))h++;
    let id='';for(const L of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'){if(!used.has('g'+h+L)){id='g'+h+L;break}}if(!id||t.length>=40){say('40 groups is the most.');return}
    t.push({id,start:h,players:[]});draw();saveField().catch(()=>{});return}
  if(q('[data-esclear]')){const z=document.getElementById('esClearQ');z.hidden=false;z.innerHTML=`<p><b>Clear all ${many(teamsOf().length,'group')}?</b> Players go to Not on a team, so nobody is lost.</p><div class="two"><button type="button" class="btn sq" data-esclear2>Clear them</button><button type="button" class="btn ghost sq" data-esclearx>Keep them</button></div>`;return}
  if(q('[data-esclearx]')){document.getElementById('esClearQ').hidden=true;return}
  if(q('[data-esclear2]')){teamsOf().forEach(t=>benchOf().push(...t.players));F().teams=[];draw();saveField().catch(()=>{});return}
  if(q('[data-esnew]')){ST.tile='teams';const pb=document.querySelector('#esPane .es-pb');if(pb){pb.insertAdjacentHTML('afterbegin',dropZone());pb.querySelector('.es-drop').scrollIntoView({block:'nearest'})}return}
  if(q('[data-espaste]')){const p=document.getElementById('esPasteBox');p.hidden=false;document.getElementById('esUpT').focus();return}
  if(q('[data-esread]')){const t=document.getElementById('esUpT').value;if(!t.trim()){document.getElementById('esUpMsg').textContent='Paste the names first.';return}readRows(U().csvRows(t),'what you pasted');return}
  if(q('[data-estpl]')){const head='Group,Starting hole,Team name,Player 1,Player 2,Player 3,Player 4',body=Array.from({length:18},(_,i)=>`${i+1},${i+1},,,,,`).join('\r\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+head+'\r\n'+body+'\r\n'],{type:'text/csv'}));a.download='RNGC teams and players.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);return}
  if(b=q('[data-esmode]')){ST.upl.mode=b.dataset.esmode;draw();return}
  if(q('[data-esupx]')){ST.upl=null;if(ST.newev){const n=document.getElementById('esNewTeams');if(n)n.innerHTML=newTeamsBox()}else draw();return}
  if(b=q('[data-esupsave]')){b.disabled=true;const pl=placed();note('Saving...');
    saveTeamsFrom(ST.id,pl).then(r=>{ST.field=r.field||ST.field;ST.upl=null;note('✓ Saved');draw();say(r.left?`Teams saved. ${r.left} team name${r.left===1?'':'s'} didn't save.`:`${many(pl.teams.length,'group')} saved`)},
      x=>{b.disabled=false;note('Didn\'t save. Check your signal.',1)});return}
  /* details */
  if(b=q('[data-essize]')){const v=+b.dataset.essize;if(ST.newev){ST.newev.team=v}else saveInfo({team:v}).catch(()=>{});box.querySelectorAll('[data-essize]').forEach(x=>x.setAttribute('aria-pressed',x===b));return}
  if(b=q('[data-esch]')){ST.newev.chapter=b.dataset.esch;box.querySelectorAll('[data-esch]').forEach(x=>x.setAttribute('aria-pressed',x===b));return}
  if(b=q('[data-escourse]')){const c=LIB.find(x=>x.id===b.dataset.escourse),w=c.name+', '+c.city+(c.st?' '+c.st:'');document.getElementById('esW').value=w;document.getElementById('esSug').innerHTML='';
    const why=document.getElementById('esWhy');why.textContent='✓ '+c.name;why.classList.add('es-ok');
    if(ST.newev){ST.newev.where=w;ST.newev.course=c.id}else saveInfo({where:w,course:c.id}).catch(()=>{});return}
  if(q('[data-escancel]')){const z=document.getElementById('esCanQ'),on=e.status==='cancelled';z.hidden=false;
    z.innerHTML=on?`<button type="button" class="btn sq" data-escan2="0" style="width:100%">Show it to members again</button>`:`<p><b>Cancel ${esc(e.name)}?</b> Members see it as cancelled.</p><div class="two"><button type="button" class="btn sq" data-escan2="1">Cancel it</button><button type="button" class="btn ghost sq" data-escanx>Keep it</button></div>`;return}
  if(q('[data-escanx]')){document.getElementById('esCanQ').hidden=true;return}
  if(b=q('[data-escan2]')){saveInfo({cancelled:b.dataset.escan2==='1'}).then(()=>{draw();say(b.dataset.escan2==='1'?'Event cancelled':'Event is back on')}).catch(()=>{});return}
  if(q('[data-esmake]')){makeEvent();return}
  /* game */
  const cfg=()=>F().cfg||(F().cfg={});
  if(b=q('[data-esfmt]')){cfg().format=b.dataset.esfmt;draw();saveCfg().catch(()=>{});return}
  if(b=q('[data-essk]')){cfg().skins=b.dataset.essk;draw();saveCfg().catch(()=>{});return}
  if(b=q('[data-esctp]')){const h=+b.dataset.esctp,a=(cfg().ctp||[]).slice(),i=a.indexOf(h);i<0?a.push(h):a.splice(i,1);cfg().ctp=a.sort((x,y)=>x-y);draw();saveCfg().catch(()=>{});return}
  if(b=q('[data-esld]')){const h=+b.dataset.esld;cfg().ld=cfg().ld===h?0:h;draw();saveCfg().catch(()=>{});return}
  /* pay & invite */
  if(q('[data-esinv]')){C().invite(ST.id);return}
  if(b=q('[data-espicx]')){const k=b.dataset.espicx;run(call('/admin/event-img',{ev:ST.id,kind:k,img:''})).then(j=>{C().took(ST.id,j.info);draw()}).catch(()=>{});return}
  /* event day */
  if(q('[data-esend]')){const z=document.getElementById('esEndQ'),closed=!!ST.closed;
    z.innerHTML=closed?'':`<p><b>End the event?</b> Scores lock and the board says Final. You can still fix a score or reopen.</p><div class="two"><button type="button" class="btn sq" data-esend2>End it</button><button type="button" class="btn ghost sq" data-esendx>Not yet</button></div>`;
    if(closed)endEvent(true);return}
  if(q('[data-esendx]')){document.getElementById('esEndQ').innerHTML='';return}
  /* Start event (David, Nov 26 2026: "for event organizers let's have a start event button") */
  if(q('[data-esgo]')){const z=document.getElementById('esGoQ');if(z)z.innerHTML=`<p><b>Start the event now?</b> Every phone can score and the leaderboard goes live.</p><div class="two"><button type="button" class="btn sq" data-esgo2>Start it</button><button type="button" class="btn ghost sq" data-esgox>Not yet</button></div>`;return}
  if(q('[data-esgox]')){document.getElementById('esGoQ').innerHTML='';return}
  if(q('[data-esgo2]')){startEvent();return}
  if(q('[data-esend2]')){endEvent(false);return}});
function startEvent(){run(call('/admin/event-start',{ev:ST.id})).then(j=>{ST.started=j.started||Date.now();ST.live=!!j.live;ST.closed=j.closed||null;draw();say('The event is live 🏴‍☠️');
    try{if(window.RNGCLIVE&&RNGCLIVE.poll)RNGCLIVE.poll()}catch(x){}}).catch(x=>{const z=document.getElementById('esGoQ');if(z)z.innerHTML=`<p class="meta" style="color:#ff8a8a">${esc(x&&x.message||'Could not reach the club server. Try again.')}</p>`})}
function endEvent(open){run(call('/event/close',open?{ev:ST.id,open:true}:{ev:ST.id})).then(j=>{ST.closed=open?null:(j.closed||Date.now());draw();say(open?'Event reopened':'Event ended. Scores are final.')}).catch(()=>{})}

/* ---- typing: details save as you go; team names; new players; course search ---- */
document.addEventListener('input',ev=>{const t=ev.target,box=document.getElementById('es');if(!box||!box.contains(t)||!ST)return;
  if(t.dataset.esinfo){const k=t.dataset.esinfo;if(ST.newev){ST.newev[k]=t.value;return}
    if(k==='name'&&t.value.trim().length<3)return;if(k==='date'&&!t.value)return;
    later('info:'+k,()=>C().saveInfo(ST.id,{[k]:k==='cap'?Math.max(0,Math.min(500,parseInt(t.value,10)||0)):(k==='url'?t.value.trim():t.value)}).then(j=>{tilesOnly();return j}));return}
  if(t.hasAttribute('data-esstart')){if(ST.newev){ST.newev.start=t.value;return}F().start=t.value;later('start',()=>call('/admin/field',{ev:ST.id,start:t.value}));return}
  if(t.dataset.estn!=null){const g=teamsOf()[+t.dataset.estn];if(!g)return;const v=t.value.trim();if(v&&v.length<2)return;
    later('tn:'+g.id,()=>call('/event/name',{ev:ST.id,team:g.id,name:v}).then(r=>{(ST.cards[g.id]||(ST.cards[g.id]={})).name=r.name;return r}));return}
  if(t.id==='esW'){const v=t.value.trim(),s=document.getElementById('esSug'),why=document.getElementById('esWhy');
    if(ST.newev){ST.newev.where=t.value;ST.newev.course=''}else later('info:where',()=>C().saveInfo(ST.id,{where:t.value,course:''}).then(j=>{tilesOnly();return j}),900);
    why.textContent='Pick it from the list so the scorecard knows the holes.';why.classList.remove('es-ok');
    if(v.length<3){s.innerHTML='';return}
    lib().then(L=>{const w=low(v).split(' ').filter(Boolean),hit=L.filter(c=>{const h=low(c.name+' '+c.city+' '+c.st);return w.every(x=>h.includes(x))}).slice(0,6);
      if(document.getElementById('esW').value.trim()!==v)return;
      s.innerHTML=hit.length?`<div class="es-sug">${hit.map(c=>`<button type="button" data-escourse="${esc(c.id)}">${esc(c.name)} <span class="meta">· ${esc(c.city)}${c.st?', '+esc(c.st):''}</span></button>`).join('')}</div>`:'<p class="meta">Not on our course list. It still saves as the place.</p>'}).catch(()=>{s.innerHTML=''})}});
document.addEventListener('keydown',ev=>{const t=ev.target;if(!t.dataset||t.dataset.esnewp==null||ev.key!=='Enter')return;ev.preventDefault();addPlayer(t)});
document.addEventListener('focusout',ev=>{const t=ev.target;if(t.dataset&&t.dataset.esnewp!=null&&t.value.trim())addPlayer(t)});
function addPlayer(t){const v=t.value.replace(/[<>"`\\]/g,'').trim().slice(0,40),k=t.dataset.esnewp;t.dataset.esnewp='';if(!v){draw();return}
  const p={id:mkId(),name:v};if(k==='b')benchOf().push(p);else{const g=teamsOf()[+k];if(!g||g.players.length>=6){say('That group is full: 6 players at most.');draw();return}g.players.push(p)}
  draw();saveField().catch(()=>{})}
document.addEventListener('change',ev=>{const t=ev.target,box=document.getElementById('es');if(!box||!box.contains(t)||!ST)return;
  if(t.dataset.eshole!=null){const g=teamsOf()[+t.dataset.eshole];g.start=+t.value;saveField().catch(()=>{});return}
  if(t.id==='esUpF'){const f=t.files&&t.files[0];t.value='';if(!f)return;const m=document.getElementById('esUpMsg');if(m)m.textContent='Reading '+f.name+'...';
    U().fileRows(f).then(r=>readRows(r,f.name),x=>{if(m)m.textContent=x.message||'That file did not read. Try pasting instead.'});return}
  if(t.dataset.espic){const kind=t.dataset.espic,f=t.files&&t.files[0],m=document.getElementById('esPicMsg');t.value='';if(!f)return;m.textContent='Getting the picture ready...';
    (kind==='zelle'?C().shrinkTo(f,1000,.9,'#fff'):C().shrink(f)).then(d=>run(call('/admin/event-img',{ev:ST.id,kind,img:d}))).then(j=>{C().took(ST.id,j.info);draw();say(kind==='flyer'?'Flyer saved':'Zelle code saved')},
      x=>{m.textContent=x.status===413?'That picture is too big. Try another one.':(x.message||'That picture didn\'t save.')})}});

/* ---- New event: one screen. Details, the teams sheet if you have it, Make the event. ---- */
function openNew(){if(!C().canLead()){say('Club admins and chapter presidents make events.');return}
  const chs=(C().mine?C().mine():[]).filter(c=>c!=='Club');
  ST={id:'',newev:{chapter:chs[0]||'',team:4},field:{teams:[],bench:[],cfg:{}},cards:{},upl:null,loaded:true};
  openSheet(`<div id="es" class="es"><div class="es-top"><h3>New event</h3><span id="esSaved" class="es-saved"></span></div><p class="meta es-sub">Members see it once you make it.</p>
    <section class="es-pane"><div class="es-pb">${detailFields({team:4},true)}</div></section></div>`)}
function makeEvent(){const n=ST.newev,err=document.getElementById('esMakeErr'),b=document.querySelector('[data-esmake]');
  if(!n.name||n.name.trim().length<3){err.textContent='Give the event a name.';return}if(!n.date){err.textContent='Pick a date.';return}
  if(ST.upl&&U().check(U().place(ST.upl.groups,ST.upl.mode)).length){err.textContent='Fix the teams sheet first, or tap Clear.';return}
  b.disabled=true;err.textContent='';
  call('/admin/event-new',{chapter:n.chapter,name:n.name,date:n.date,price:n.price||'',where:n.where||'',course:n.course||'',url:'',note:n.note||'',rules:n.rules||'',
    cap:Math.max(0,Math.min(500,parseInt(n.cap,10)||0)),team:n.team||0})
   .then(async j=>{C().took(j.ev,j.info,true);const id=j.ev;
     if(n.start)await call('/admin/field',{ev:id,start:n.start}).catch(()=>{});
     if(ST.upl){err.textContent='Event made. Saving the teams...';ST.id=id;try{await saveTeamsFrom(id,placed())}catch(e){say('Event made. The teams didn\'t save: add them on Teams.')}}
     say('Event made');open(id,ST.upl?'teams':'details')})
   .catch(x=>{b.disabled=false;err.textContent=x.status===401?'Your sign-in ran out. Sign in again.':x.message})}

window.RNGCEVSETUP={open,openNew};
})();
