/* Course editor (David, Nov 26 2026: "we need to have ability to edit the courses, holes, yardage and anything else you
   can think of"). Club leaders (club admins and chapter presidents) get Edit course on any course page and Add a course on
   Find a course. One screen: the course's details, its tees (name, men's or women's, rating, slope) and the scorecard grid
   (par, hole ranks, yards for every tee), laid out like the card at the course so it's easy to copy in.
   Save for everyone puts it on the club server; every phone lays it over the library card (here and in scorecard/tracker.js),
   so the fix reaches the Courses tab, Find a course, Play here and saved courses on phones. Undo steps back one change;
   Back to the library card drops the edit. Square corners only (no pill shapes, David Nov 19). */
(function(){
const CLUB_API='https://rngc-club.137.184.188.41.sslip.io';
const api=()=>{try{const o=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&localStorage.getItem('rngc-club-api');if(o)return o.replace(/\/$/,'')}catch(e){}return CLUB_API};
const tok=()=>{try{return localStorage.getItem('rngc-auth-token')||''}catch(e){return ''}};
const call=(path,body)=>fetch(api()+path,{method:body?'POST':'GET',cache:'no-store',
  headers:Object.assign({Authorization:'Bearer '+tok()},body?{'Content-Type':'application/json'}:{}),body:body?JSON.stringify(body):undefined})
  .then(async r=>{const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||'The club server had a problem.'),{status:r.status});return j});
const me=()=>{try{return typeof S!=='undefined'&&S&&S.authMe||null}catch(e){return null}};
const leader=()=>{const m=me();return !!(m&&tok()&&(m.role==='admin'||(m.leads||[]).length))};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const sum=a=>a.reduce((x,y)=>x+(+y||0),0);
const day=ms=>new Date(ms).toLocaleDateString([], {month:'short',day:'numeric'});

/* ---- the edits, shared with the golf pages (same phone copy) ---- */
const CE={items:{},v:0};try{Object.assign(CE,JSON.parse(localStorage.getItem('rngc-course-edits')||'{}'))}catch(e){}
let RAW=null;   /* the library list as downloaded, before edits */
function keep(j){CE.items=j.items||{};CE.v=j.v||0;try{localStorage.setItem('rngc-course-edits',JSON.stringify({items:CE.items,v:CE.v}))}catch(e){}}
function apply(id,d){const e=CE.items[id];if(!e||!e.par)return d;
  d=d?JSON.parse(JSON.stringify(d)):{id};
  ['name','city','state','address','phone','website'].forEach(k=>d[k]=e[k]||'');if(e.lat!=null){d.lat=e.lat;d.lng=e.lng}
  d.app=Object.assign(d.app||{},{name:e.name,city:[e.city,e.state].filter(Boolean).join(', '),par:e.par.slice(),si:e.si.slice(),siW:(e.siW||e.si).slice(),
    tees:e.tees.map(t=>({id:t.id,name:t.name+(t.w?' · W':''),rating:t.rating||0,slope:t.slope||0,y:t.y.slice()})),   /* blank shows as a dash here; golf fills in par and 113 */
    lib:true,n9:!!e.n9,est:e.tees.some(t=>!t.rating||!t.slope),stdsi:false,edited:e.at});
  d.holes=e.n9?9:18;return d}
const lvl=e=>e.tees.some(t=>t.y.some(Boolean))?2:1;
function rows(j){RAW=j;const E=CE.items,out=j.courses.filter(c=>!(E[c[0]]&&E[c[0]].hide)).map(c=>{const e=E[c[0]];if(!e||!e.par)return c;
    return[c[0],e.name,e.city,e.state||c[3],c[4],c[5],e.n9?9:18,lvl(e),c[8],c[9]]});
  for(const[id,e]of Object.entries(E))if(e.new&&!e.hide&&e.par)out.push([id,e.name,e.city,e.state,e.lat||0,e.lng||0,e.n9?9:18,lvl(e),0,'Added']);
  return Object.assign({},j,{courses:out})}
const json=id=>fetch('scorecard/courses/c/'+encodeURIComponent(id)+'.json').then(r=>r.ok?r.json():null,()=>null).then(d=>{d=apply(id,d);if(!d)throw 0;return d});
/* club course cards on the Courses tab (CARDS in index.html) follow the edits too */
const BASE={};
function cards(){if(typeof CARDS==='undefined')return;
  for(const id of new Set([...Object.keys(CE.items),...Object.keys(BASE)])){const e=CE.items[id];
    if(!(id in CARDS)&&!(id in BASE))continue;if(!(id in BASE))BASE[id]=CARDS[id];
    if(e&&e.par)CARDS[id]={par:e.n9?sum(e.par)/2:sum(e.par),holes:e.n9?9:18,maps:(BASE[id]||{}).maps||0,tees:e.tees.map(t=>[t.name+(t.w?' · W':''),e.n9?sum(t.y)/2:sum(t.y),t.rating||null,t.slope||null])};
    else{CARDS[id]=BASE[id];delete BASE[id]}}}
function refresh(){cards();
  try{if(RAW&&typeof CLIB!=='undefined')CLIB=rows(RAW)}catch(e){}
  try{for(const id of Object.keys(FOUND))delete FOUND[id]}catch(e){}
  try{if(S.tab==='courses'){if(S.cview==='course'&&S.selLib&&!S.selCourse)openFound(S.selLib);else renderCourses()}}catch(e){}
  try{const w=document.getElementById('golfFrame').contentWindow;if(w&&w.trLibRefresh)w.trLibRefresh()}catch(e){}}
const load=()=>call('/courses/edits').then(j=>{const was=JSON.stringify(CE.items);keep(j);if(JSON.stringify(CE.items)!==was)refresh()}).catch(()=>{});
cards();load();
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')load()});

/* ---- buttons on the course pages ---- */
function btn(id){return leader()&&id?`<button class="btn small ghost" data-ceedit="${esc(id)}"><i class="ph-bold ph-pencil-simple"></i> Edit course</button>`:''}
function addBtn(){return leader()?`<button class="btn small ghost" data-ceadd style="margin-top:10px"><i class="ph-bold ph-plus"></i> Add a course that's not on the list</button>`:''}
function stamp(id){const e=CE.items[id];return e&&e.at?`<p class="findsrc">Card fixed by ${esc(e.byName||'a club leader')}, ${day(e.at)}.</p>`:''}
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('[data-ceedit],[data-ceadd]');if(!b)return;
  if(b.dataset.ceedit)open(b.dataset.ceedit);else open(null)});

/* ---- the editor ---- */
const css=`#rgCE{position:fixed;inset:0;z-index:9300;background:var(--bg,#0a0b0d);color:var(--text,#eef0f3);display:flex;flex-direction:column;font-family:var(--body,Barlow,system-ui,sans-serif)}
#rgCE[hidden]{display:none}
#rgCE .hd{display:flex;align-items:center;gap:10px;padding:max(12px,env(safe-area-inset-top)) 14px 12px 16px;border-bottom:1px solid var(--line,#2a2f37);background:var(--bg-2,#111317)}
#rgCE .hd h2{flex:1;margin:0;font:800 22px/1.05 var(--display,'Barlow Condensed',sans-serif);text-transform:uppercase;letter-spacing:.03em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#rgCE .x{width:44px;height:44px;border:1px solid var(--line,#2a2f37);border-radius:4px;background:none;color:inherit;font-size:22px;cursor:pointer}
#rgCE .bd{flex:1;overflow:auto;padding:6px 16px 24px;-webkit-overflow-scrolling:touch}
#rgCE .bd>*{max-width:760px;margin-left:auto;margin-right:auto}
#rgCE h3{margin:20px auto 8px;font:800 15px var(--display,'Barlow Condensed',sans-serif);text-transform:uppercase;letter-spacing:.08em;color:var(--silver,#d5dae1)}
#rgCE label{display:block;font-size:13px;color:var(--muted,#9aa3ae);margin:10px 0 4px}
#rgCE input,#rgCE select{font:500 16px var(--body,Barlow,sans-serif);color:var(--text,#eef0f3);background:var(--bg-2,#111317);border:1px solid var(--line,#2a2f37);border-radius:4px;padding:10px;width:100%;box-sizing:border-box}
#rgCE input:focus,#rgCE select:focus{outline:2px solid var(--silver-2,#aeb5bf);outline-offset:0}
#rgCE .two{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}
#rgCE .chk{display:flex;gap:10px;align-items:flex-start;margin-top:12px;font-size:15px;color:var(--text,#eef0f3)}
#rgCE .chk input{width:22px;height:22px;flex:none;margin:0}
#rgCE .chk small{display:block;color:var(--muted,#9aa3ae);font-size:13px}
#rgCE .tee{display:grid;grid-template-columns:1fr 104px 74px 66px 44px;gap:6px;align-items:end;margin-top:8px}
#rgCE .tee label{margin-top:0}
#rgCE .sq{min-height:44px;border:1px solid var(--line,#2a2f37);border-radius:4px;background:var(--bg-2,#111317);color:inherit;font:700 15px var(--body,Barlow,sans-serif);padding:0 14px;cursor:pointer}
#rgCE .sq.go{background:var(--silver,#d5dae1);color:#0a0b0d;border-color:var(--silver,#d5dae1)}
#rgCE .sq.del{width:44px;padding:0;font-size:18px}
#rgCE .sq[disabled]{opacity:.5}
#rgCE .grid{overflow-x:auto;border:1px solid var(--line,#2a2f37);border-radius:4px;margin-top:6px}
#rgCE table{border-collapse:collapse;font-size:14px;min-width:100%}
#rgCE th,#rgCE td{border-bottom:1px solid var(--line,#2a2f37);padding:3px;text-align:center;white-space:nowrap}
#rgCE th{font:700 12px var(--body,Barlow,sans-serif);color:var(--muted,#9aa3ae);text-transform:uppercase;letter-spacing:.04em;padding:8px 4px;background:var(--bg-2,#111317)}
#rgCE td:first-child,#rgCE th:first-child{position:sticky;left:0;background:var(--bg-2,#111317);z-index:1;font-weight:800;min-width:40px}
#rgCE td input{width:52px;padding:8px 4px;text-align:center;font-size:16px}
#rgCE td input.yd{width:60px}
#rgCE td input.bad{border-color:#e25c5c;background:rgba(226,92,92,.12)}
#rgCE tr.tot td{font-weight:800;color:var(--silver,#d5dae1);background:rgba(255,255,255,.03);padding:9px 4px}
#rgCE .ft{border-top:1px solid var(--line,#2a2f37);background:var(--bg-2,#111317);padding:10px 16px max(10px,env(safe-area-inset-bottom))}
#rgCE .ft>div{max-width:760px;margin:0 auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
#rgCE .ft .msg{flex:1 1 100%;font-size:14px;min-height:0}
#rgCE .ft .msg.err{color:#ff8a8a}
#rgCE .ft .msg.ok{color:#7fd492}
#rgCE .ft .go{flex:1}
#rgCE .more{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
#rgCE .log{font-size:14px;color:var(--muted,#9aa3ae);margin-top:8px;line-height:1.6}
#rgCE .hint{font-size:13px;color:var(--muted,#9aa3ae);margin:4px 0 0}
#rgCE .tee+.tee{border-top:1px solid var(--line,#2a2f37);padding-top:8px}
@media (max-width:560px){#rgCE .tee{grid-template-columns:1.3fr 1fr 1fr 44px}#rgCE .tee>div:first-child{grid-column:1/-1}}`;
let box=null,D=null,ID=null,BUSY=false;
function shell(){if(box)return box;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  box=document.createElement('div');box.id='rgCE';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Edit course');
  document.body.appendChild(box);return box}
function close(){if(box)box.hidden=true;document.documentElement.style.overflow=''}
const STD=[7,15,11,3,1,13,9,17,5,8,16,12,4,2,14,10,18,6];
function fromLib(d){const a=d&&d.app,st=(d&&d.state)||'';
  if(a&&a.par&&a.par.length===18&&a.tees&&a.tees.length)return{name:d.name||a.name||'',city:d.city||'',state:st,address:d.address||'',phone:d.phone||'',website:d.website||'',
    lat:null,lng:null,n9:!!a.n9,hide:false,par:a.par.slice(),si:(a.stdsi||!a.si?STD:a.si).slice(),siW:(a.siW||a.si||STD).slice(),
    tees:a.tees.map(t=>({id:t.id,name:t.name.replace(/ · W$/,''),w:/ · W$/.test(t.name),rating:a.est?0:t.rating||0,slope:a.est?0:t.slope||0,y:(t.y||[]).concat(Array(18).fill(0)).slice(0,18).map(v=>+v||0)}))};
  return{name:(d&&d.name)||'',city:(d&&d.city)||'',state:st,address:(d&&d.address)||'',phone:(d&&d.phone)||'',website:(d&&d.website)||'',lat:null,lng:null,n9:false,hide:false,
    par:Array(18).fill(4),si:STD.slice(),siW:STD.slice(),tees:[{id:'',name:'White',w:false,rating:0,slope:0,y:Array(18).fill(0)}]}}
function open(id){if(!leader())return;shell();ID=id;BUSY=false;
  box.hidden=false;document.documentElement.style.overflow='hidden';
  box.innerHTML=`<div class="hd"><h2>${id?'Edit course':'Add a course'}</h2><button class="x" data-cex aria-label="Close"><i class="ph-bold ph-x"></i></button></div><div class="bd"><p class="hint" style="margin-top:20px">Loading the card...</p></div>`;
  box.querySelector('[data-cex]').onclick=close;
  if(!id){D=fromLib(null);D.state='NV';return draw()}
  /* start from the leader's last save if there is one, else the library card */
  const e=CE.items[id];
  fetch('scorecard/courses/c/'+encodeURIComponent(id)+'.json').then(r=>r.ok?r.json():null,()=>null).then(d=>{
    D=e&&e.par?JSON.parse(JSON.stringify(e)):fromLib(d);D.lib=d;
    if(!D.siW)D.siW=D.si.slice();draw()})}
const num=v=>{const n=parseFloat(String(v).replace(/[^\d.]/g,''));return isNaN(n)?0:n};
function draw(){const e=CE.items[ID],tees=D.tees;
  const h2=box.querySelector('.hd h2');if(h2)h2.textContent=ID?'Edit course':'Add a course';
  const tHead=tees.map((t,i)=>`<th>${esc(t.name||'Tee '+(i+1))}${t.w?' · W':''}</th>`).join('');
  const row=h=>`<tr><td>${h+1}</td><td><input inputmode="numeric" data-k="par" data-h="${h}" value="${D.par[h]}" aria-label="Par hole ${h+1}"></td>
    <td><input inputmode="numeric" data-k="si" data-h="${h}" value="${D.si[h]}" aria-label="Rank hole ${h+1}"></td>
    <td><input inputmode="numeric" data-k="siW" data-h="${h}" value="${D.siW[h]}" aria-label="Women's rank hole ${h+1}"></td>
    ${tees.map((t,i)=>`<td><input class="yd" inputmode="numeric" data-k="y" data-t="${i}" data-h="${h}" value="${t.y[h]||''}" placeholder="-" aria-label="${esc(t.name)} yards hole ${h+1}"></td>`).join('')}</tr>`;
  const tot=(l,a,b)=>`<tr class="tot"><td>${l}</td><td data-tot="par" data-a="${a}" data-b="${b}"></td><td></td><td></td>${tees.map((t,i)=>`<td data-tot="y${i}" data-a="${a}" data-b="${b}"></td>`).join('')}</tr>`;
  const H=[...Array(18).keys()];
  box.querySelector('.bd').innerHTML=`
   <h3>The course</h3>
   <label for="ceN">Course name</label><input id="ceN" value="${esc(D.name)}" maxlength="70" autocomplete="off">
   <div class="two"><div><label for="ceC">City</label><input id="ceC" value="${esc(D.city)}" maxlength="40"></div>
    <div><label for="ceS">State</label><select id="ceS">${[['CA','California'],['NV','Nevada'],['AZ','Arizona'],['UT','Utah']].concat(D.state&&!/^(CA|NV|AZ|UT)$/.test(D.state)?[[D.state,D.state]]:[]).map(([k,n])=>`<option value="${k}" ${D.state===k?'selected':''}>${n}</option>`).join('')}</select></div></div>
   <label for="ceA">Address</label><input id="ceA" value="${esc(D.address)}" maxlength="120">
   <div class="two"><div><label for="ceP">Phone</label><input id="ceP" type="tel" value="${esc(D.phone)}" maxlength="30"></div>
    <div><label for="ceW">Website</label><input id="ceW" type="url" value="${esc(D.website)}" maxlength="200" placeholder="https://"></div></div>
   ${ID?'':`<div class="more"><button class="sq" data-cegeo><i class="ph-bold ph-navigation-arrow"></i> ${D.lat!=null?'Location set · update':'Use where I am for the map'}</button></div>`}
   <label class="chk"><input type="checkbox" id="ce9" ${D.n9?'checked':''}><span>9-hole course, played twice for 18<small>Put the front 9 on holes 1 to 9 and the second time around on 10 to 18.</small></span></label>
   <label class="chk"><input type="checkbox" id="ceH" ${D.hide?'checked':''}><span>Hide this course<small>Takes it off the course lists, for a closed course or a double. Saved rounds keep it.</small></span></label>
   <h3>Tees</h3>
   <p class="hint">Rating and slope are on the scorecard. Leave them blank if you don't know; rounds then stay out of the handicap.</p>
   ${tees.map((t,i)=>`<div class="tee"><div><label for="ceTn${i}">Tee name</label><input id="ceTn${i}" data-tk="name" data-t="${i}" value="${esc(t.name)}" maxlength="24" placeholder="Blue"></div>
     <div><label for="ceTw${i}">For</label><select id="ceTw${i}" data-tk="w" data-t="${i}"><option value="0" ${t.w?'':'selected'}>Men</option><option value="1" ${t.w?'selected':''}>Women</option></select></div>
     <div class="rt"><label for="ceTr${i}">Rating</label><input id="ceTr${i}" data-tk="rating" data-t="${i}" inputmode="decimal" value="${t.rating||''}" placeholder="71.2"></div>
     <div class="sl"><label for="ceTs${i}">Slope</label><input id="ceTs${i}" data-tk="slope" data-t="${i}" inputmode="numeric" value="${t.slope||''}" placeholder="125"></div>
     <button class="sq del" data-tdel="${i}" aria-label="Remove the ${esc(t.name)} tee" ${tees.length<2?'disabled':''}><i class="ph-bold ph-trash"></i></button></div>`).join('')}
   <div class="more"><button class="sq" data-tadd><i class="ph-bold ph-plus"></i> Add a tee</button></div>
   <h3>Scorecard</h3>
   <p class="hint">Rank is the hole's handicap rank, 1 = hardest. Each rank 1 to 18 goes on one hole. Slide sideways for more tees.</p>
   <div class="grid"><table><thead><tr><th>Hole</th><th>Par</th><th>Rank</th><th>Rank W</th>${tHead}</tr></thead>
    <tbody>${H.slice(0,9).map(row).join('')}${tot('Out',0,9)}${H.slice(9).map(row).join('')}${tot('In',9,18)}${tot('Total',0,18)}</tbody></table></div>
   ${ID?`<h3>Changes</h3><div class="log" id="ceLog">${e&&e.at?`Last fixed by ${esc(e.byName||'a club leader')}, ${day(e.at)}.`:'Library card, not changed in the app yet.'}</div>
   <div class="more">${e?`<button class="sq" data-ceundo><i class="ph-bold ph-arrow-counter-clockwise"></i> Undo last change</button>`:''}
    ${e&&!e.new?`<button class="sq" data-cereset><i class="ph-bold ph-book-open"></i> Back to the library card</button>`:''}
    ${e?`<button class="sq" data-celog><i class="ph-bold ph-clock-counter-clockwise"></i> History</button>`:''}</div>`:''}`;
  if(!box.querySelector('.ft')){const ft=document.createElement('div');ft.className='ft';box.appendChild(ft)}
  box.querySelector('.ft').innerHTML=`<div><p class="msg" id="ceMsg" role="status"></p><button class="sq" data-cex>Cancel</button><button class="sq go" data-cesave><i class="ph-bold ph-check"></i> Save for everyone</button></div>`;
  wire();totals();check()}
function grab(){const v=id=>(box.querySelector('#'+id)||{}).value||'';
  D.name=v('ceN').trim();D.city=v('ceC').trim();D.state=v('ceS');D.address=v('ceA').trim();D.phone=v('ceP').trim();D.website=v('ceW').trim();
  if(D.website&&!/^https?:\/\//i.test(D.website))D.website='https://'+D.website;
  D.n9=!!(box.querySelector('#ce9')||{}).checked;D.hide=!!(box.querySelector('#ceH')||{}).checked}
function wire(){box.querySelectorAll('[data-cex]').forEach(b=>b.onclick=close);
  box.querySelectorAll('[data-k]').forEach(inp=>inp.oninput=()=>{const h=+inp.dataset.h,k=inp.dataset.k,n=Math.round(num(inp.value));
    if(k==='y')D.tees[+inp.dataset.t].y[h]=n;else D[k][h]=n;totals();check()});
  box.querySelectorAll('[data-tk]').forEach(inp=>inp.oninput=inp.onchange=()=>{const t=D.tees[+inp.dataset.t],k=inp.dataset.tk;
    if(k==='name'){t.name=inp.value.trim();const th=box.querySelectorAll('thead th')[4+ +inp.dataset.t];if(th)th.textContent=(t.name||'Tee')+(t.w?' · W':'')}
    else if(k==='w'){t.w=inp.value==='1';const th=box.querySelectorAll('thead th')[4+ +inp.dataset.t];if(th)th.textContent=(t.name||'Tee')+(t.w?' · W':'')}
    else t[k]=k==='rating'?Math.round(num(inp.value)*10)/10:Math.round(num(inp.value))});
  box.querySelectorAll('[data-tdel]').forEach(b=>b.onclick=()=>{const t=D.tees[+b.dataset.tdel];if(!confirm('Remove the '+(t.name||'this')+' tee?'))return;grab();D.tees.splice(+b.dataset.tdel,1);draw()});
  const add=box.querySelector('[data-tadd]');if(add)add.onclick=()=>{grab();const last=D.tees[D.tees.length-1];D.tees.push({id:'',name:'',w:false,rating:0,slope:0,y:last?last.y.slice():Array(18).fill(0)});draw();
    const n=box.querySelector('#ceTn'+(D.tees.length-1));if(n)n.focus()};
  const geo=box.querySelector('[data-cegeo]');if(geo)geo.onclick=()=>{if(!('geolocation'in navigator))return msg('No location on this phone.','err');geo.textContent='Finding you...';
    navigator.geolocation.getCurrentPosition(p=>{D.lat=Math.round(p.coords.latitude*1e5)/1e5;D.lng=Math.round(p.coords.longitude*1e5)/1e5;geo.innerHTML='<i class="ph-bold ph-check"></i> Location set';},()=>{geo.textContent='Location is off for this page';},{timeout:15000})};
  box.querySelector('[data-cesave]').onclick=save;
  const u=box.querySelector('[data-ceundo]');if(u)u.onclick=()=>{if(!confirm('Undo the last change to this course for everyone?'))return;act('/admin/course-undo','Last change undone.')};
  const r=box.querySelector('[data-cereset]');if(r)r.onclick=()=>{if(!confirm('Put this course back to the library card for everyone? Undo brings your fixes back.'))return;act('/admin/course-reset','Back to the library card.')};
  const l=box.querySelector('[data-celog]');if(l)l.onclick=()=>{l.disabled=true;call('/admin/course-log?id='+encodeURIComponent(ID)).then(j=>{
    const W={edited:'fixed the card',added:'added the course',hid:'hid the course',reset:'put back the library card'};
    box.querySelector('#ceLog').innerHTML=(j.items||[]).map(x=>`${day(x.at)} · ${esc(x.name||'A club leader')} ${W[x.what]||x.what}`).join('<br>')||'No changes yet.'}).catch(er=>msg(er.message,'err'))}}
function totals(){box.querySelectorAll('[data-tot]').forEach(td=>{const a=+td.dataset.a,b=+td.dataset.b,k=td.dataset.tot;
  const arr=k==='par'?D.par:(D.tees[+k.slice(1)]||{y:[]}).y,s=sum(arr.slice(a,b));td.textContent=s?s.toLocaleString():'-'})}
function msg(t,cls){const m=box.querySelector('#ceMsg');if(m){m.textContent=t||'';m.className='msg'+(cls?' '+cls:'')}}
/* flags what the server would turn down, on the spot */
function check(){let bad='';box.querySelectorAll('[data-k]').forEach(inp=>{const h=+inp.dataset.h,k=inp.dataset.k;let wrong=false;
    if(k==='par')wrong=!(D.par[h]>=3&&D.par[h]<=6);
    else if(k==='si'||k==='siW'){const v=D[k][h];wrong=!(v>=1&&v<=18)||D[k].filter(x=>x===v).length>1}
    else wrong=D.tees[+inp.dataset.t].y[h]>999;
    inp.classList.toggle('bad',wrong);if(wrong&&!bad)bad=k==='par'?'Par on each hole is 3 to 6.':k==='y'?'Yards on a hole are 999 at most.':
      `${k==='siW'?"Women's ranks":'Ranks'}: each number 1 to 18 goes on one hole. The red boxes repeat or are missing.`});
  msg(bad,bad?'err':'');return !bad}
function done(j,txt){if(j.item)CE.items[j.id]=j.item;else delete CE.items[j.id];keep(CE);refresh();ID=j.id;
  if(j.item){D=JSON.parse(JSON.stringify(j.item));draw()}else open(ID);setTimeout(()=>msg(txt,'ok'),50)}
function act(path,txt){if(BUSY)return;BUSY=true;call(path,{id:ID}).then(j=>{BUSY=false;done(j,txt)}).catch(er=>{BUSY=false;msg(er.message,'err')})}
function save(){if(BUSY)return;grab();if(!check())return;
  if(D.name.length<2){msg('Give the course a name.','err');return}
  if(D.tees.some(t=>!t.name)){msg('Every tee needs a name, like Blue.','err');return}
  if(D.tees.some(t=>t.rating&&(t.rating<25||t.rating>85)||t.slope&&(t.slope<55||t.slope>155))){msg('Rating is about 60 to 78 and slope 55 to 155.','err');return}
  const c={name:D.name,city:D.city,state:D.state,address:D.address,phone:D.phone,website:D.website,lat:D.lat??null,lng:D.lng??null,n9:D.n9,hide:D.hide,
    par:D.par,si:D.si,siW:D.siW,tees:D.tees.map(t=>({id:t.id||'',name:t.name,w:!!t.w,rating:t.rating||0,slope:t.slope||0,y:t.y}))};
  BUSY=true;const b=box.querySelector('[data-cesave]');b.disabled=true;msg('Saving...');
  call('/admin/course-save',{id:ID||'',course:c}).then(j=>{BUSY=false;b.disabled=false;done(j,ID?'Saved. Every phone gets it on its next open.':'Added. It is on Find a course for everyone now.')})
   .catch(er=>{BUSY=false;b.disabled=false;msg(er.status===401?'Sign in again, then save.':er.message,'err')})}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&box&&!box.hidden)close()});

window.RGCE={rows,json,btn,addBtn,stamp,open,apply,items:()=>CE.items};
})();
