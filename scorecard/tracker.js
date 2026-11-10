/* RNGC golf: your own rounds, your groups and club events, on top of the live scorecard engine.
   Everything saves on this phone until the club database is built. Loads after the engine in index.html. */
(function(){const s=document.createElement('style');s.textContent=`
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
.tiles .card{padding:12px 8px;text-align:center;width:100%}
.tiles b{display:block;font-family:var(--display);font-size:30px;line-height:1}
.tiles span{display:block;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-top:5px}
.tiles small{display:block;font-size:12px;color:var(--muted);margin-top:2px}
.mix{display:flex;height:12px;border-radius:6px;overflow:hidden;margin-top:10px;background:var(--panel-2)}
.mix i{display:block}
.mixl{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:13px;color:var(--muted);margin-top:8px}
.mixl b{color:var(--text)}
.rrow,.gcard{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;width:100%;text-align:left}
.rrow{padding:12px 0;border-top:1px solid var(--line)}
.rrow:first-child{border-top:0}
.rrow b,.gcard b{display:block}
.gcard b{font-size:17px}
.rrow span,.gcard span{font-size:13px;color:var(--muted)}
.rrow .sc,.gcard .sc{font-family:var(--display);font-size:26px;text-align:right;line-height:1}
.rrow .sc small,.gcard .sc small{display:block;font-family:var(--body);font-size:12px;color:var(--muted);margin-top:2px}
.gcard{padding:14px;margin-top:10px}
.stbl{width:100%;border-collapse:collapse;font-size:15px}
.stbl th{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);text-align:right;padding:10px 4px 6px;font-weight:700}
.stbl th:first-child,.stbl td:first-child{text-align:left}
.stbl td{padding:10px 4px;border-top:1px solid var(--line);text-align:right;font-variant-numeric:tabular-nums}
.spark{width:100%;height:auto;display:block;margin-top:8px}
.parset{display:grid;grid-template-columns:repeat(9,1fr);gap:4px}
.parset button{min-height:44px;border-radius:8px;background:var(--panel-2);border:1px solid var(--line);font-weight:700;line-height:1.1}
.parset button small{display:block;font-size:10px;color:var(--muted);font-weight:600}
.statc{padding:12px 14px;margin-top:10px}
.statc .r{display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap}
.statc .r>span{font-size:13px;color:var(--muted);width:48px}
.statc .chip2{min-height:38px;min-width:40px;padding:0 10px}
.trrow2{display:grid;grid-template-columns:1fr 92px;gap:8px;margin-top:6px}
.findl{margin-top:8px;min-height:120px}
.findl .rrow b{font-size:16px}
.findl .rrow em{font-style:normal;font-size:12px;color:var(--muted);text-align:right;white-space:nowrap}
.ctag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-right:8px}
.ctag.ok{color:var(--text)}
.findsrc{font-size:11px;color:var(--muted);margin-top:10px}
`;document.head.appendChild(s)})();

/* ---------- small helpers ---------- */
const TR_SI=[7,3,15,11,1,13,5,17,9, 8,4,16,12,2,14,6,18,10];   /* standard hole order until a course's real card is loaded */
const trSum=a=>a.reduce((x,y)=>x+y,0);
const trAvg=a=>a.length?trSum(a)/a.length:null;
const trOne=v=>v==null||isNaN(v)?'-':(Math.round(v*10)/10).toFixed(1);
const trPct=(a,b)=>b?Math.round(a/b*100)+'%':'-';
const trDay=d=>new Date(d).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
const trCh=(i,tee,par)=>Math.round(i*tee.slope/113+(tee.rating-trSum(par)));
const trSt=(ph,si)=>ph>=0?Math.floor(ph/18)+(si<=ph%18?1:0):(si>18+Math.max(-18,ph)?-1:0);
const trIdx=v=>{const i=parseFloat(v);return isNaN(i)?18:Math.max(-5,Math.min(54,Math.round(i*10)/10))};
function gfresh(){const f=gload();for(const k of Object.keys(f))G[k]=f[k]}
function trOpen(){$('#scrim').classList.add('on');$('#sheet').classList.add('on');const c=$('#closeSheet');if(c)c.onclick=closeSheet}
function trSetMe(n,i){G.me.name=n;G.me.hcp=i;for(const g of G.groups)for(const m of g.members)if(m.id==='me'){m.name=n;m.hcp=i}gsave()}
function trSettle(led,nm){const pos=[],neg=[],tx=[];for(const[pid,v]of Object.entries(led)){if(v>0.004)pos.push({pid,v});else if(v<-0.004)neg.push({pid,v:-v})}
  pos.sort((a,b)=>b.v-a.v);neg.sort((a,b)=>b.v-a.v);let i=0,j=0;
  while(i<neg.length&&j<pos.length){const x=Math.min(neg[i].v,pos[j].v);tx.push(`${nm(neg[i].pid)} pays ${nm(pos[j].pid)} ${money(x)}`);neg[i].v-=x;pos[j].v-=x;if(neg[i].v<.005)i++;if(pos[j].v<.005)j++}
  return tx}

/* ---------- a finished round, boiled down for history and stats ---------- */
function trSummary(m,scores,st,led){const c=COURSES[m.course],tee=c.tees.find(t=>t.id===m.cfg.tee)||c.tees[0];
  const out={id:m.id,kind:m.kind,group:m.group||null,name:m.name,date:m.date,course:m.course,cname:c.name,tee:tee.name,rating:tee.rating,slope:tee.slope,
    par:c.par.slice(),si:c.si.slice(),format:m.cfg.format,hcp:!!m.cfg.hcp,players:[],money:led||{},demo:!!m.demo};
  for(const p of m.players){const s=scores[p.id]||{},hs=Object.keys(s).map(Number).filter(h=>s[h]!=null).sort((a,b)=>a-b);
    const ch=trCh(p.hcp,tee,c.par),gross=trSum(hs.map(h=>s[h])),par=trSum(hs.map(h=>c.par[h-1]));
    const pl={id:p.id,name:p.name,hcp:p.hcp,ch,scores:s,holes:hs.length,gross,par,net:gross-trSum(hs.map(h=>trSt(ch,c.si[h-1])))};
    /* score differential, World Handicap System: net double bogey cap per hole, then 113/slope x (score - rating) */
    if(hs.length===18){const ags=trSum(hs.map(h=>Math.min(s[h],c.par[h-1]+2+trSt(ch,c.si[h-1]))));pl.diff=Math.round(113/tee.slope*(ags-tee.rating)*10)/10}
    if(p.id==='me'){const sv=st||{},mix={e:0,b:0,p:0,bo:0,d:0};let pt=0,pn=0,fw=0,fwn=0,gir=0;
      for(const h of hs){const x=sv[h]||{},pr=c.par[h-1],d=s[h]-pr;mix[d<=-2?'e':d===-1?'b':d===0?'p':d===1?'bo':'d']++;
        if(x.putts!=null){pt+=x.putts;pn++;if(s[h]-x.putts<=pr-2)gir++}
        if(pr>3&&x.fw){fwn++;if(x.fw==='hit')fw++}}
      Object.assign(pl,{putts:pt,pn,fw,fwn,gir,mix})}
    out.players.push(pl)}
  return out}

/* handicap estimate: WHS table, how many of your best differentials count for 3 to 20 rounds */
const TR_WHS=[[3,1,-2],[4,1,-1],[5,1,0],[6,2,-1],[8,2,0],[11,3,0],[14,4,0],[16,5,0],[18,6,0],[19,7,0],[20,8,0]];
const trMine=()=>G.rounds.filter(r=>r.kind!=='event').map(r=>({r,p:r.players.find(p=>p.id==='me')})).filter(x=>x.p&&x.p.holes).sort((a,b)=>b.r.date-a.r.date);
function trEst(){const d=trMine().filter(x=>x.p.diff!=null).map(x=>x.p.diff).slice(0,20),n=d.length;if(n<3)return{n,v:null};
  const row=TR_WHS.find(x=>n<=x[0]),best=d.slice().sort((a,b)=>a-b).slice(0,row[1]);
  return{n,v:Math.min(54,Math.round((trAvg(best)+row[2])*10)/10)}}
function trWinner(r){const full=r.players.filter(p=>p.holes===18);if(full.length<2)return null;const lo=Math.min(...full.map(p=>p.net-p.par)),w=full.filter(p=>p.net-p.par===lo);return w.length===1?w[0]:null}
function trStandings(g,rs){const m={};
  for(const r of rs){const w=trWinner(r);
    for(const p of r.players){const x=m[p.id]||(m[p.id]={id:p.id,name:p.name,n:0,w:0,nets:[],money:0});x.n++;if(p.holes===18)x.nets.push(p.net-p.par);if(w&&w.id===p.id)x.w++;x.money+=(r.money||{})[p.id]||0}}
  return Object.values(m).sort((a,b)=>b.w-a.w||b.money-a.money||(trAvg(a.nets)??99)-(trAvg(b.nets)??99))}
function trSkins(ids,scores,amt){const led={};let carry=1;
  for(let h=1;h<=18;h++){const v=ids.map(id=>({id,v:scores[id][h]})).sort((a,b)=>a.v-b.v);
    if(v[0].v<v[1].v){for(const id of ids)led[id]=(led[id]||0)+(id===v[0].id?amt*carry*(ids.length-1):-amt*carry);carry=1}else carry++}
  return led}

/* ---------- sample rounds so the preview shows something (cleared with one tap) ---------- */
function trSeed(){const r=rng(hash('rngc-tracker-demo')),c=COURSES.chimera,tee=c.tees.find(t=>t.id==='serpent'),day=86400000;
  const crew=[{id:'me',name:G.me.name,hcp:G.me.hcp},{id:'m1',name:'Mike R.',hcp:8.2},{id:'m2',name:'Tony S.',hcp:15.6},{id:'m3',name:'Dre W.',hcp:21},{id:'m4',name:'Sal P.',hcp:11.3}];
  if(!G.groups.some(g=>g.id==='grp-sat'))G.groups.push({id:'grp-sat',name:'Saturday crew',manager:'me',members:crew,demo:true});
  const sim=p=>{const ch=trCh(p.hcp,tee,c.par),s={};for(let h=1;h<=18;h++){const x=r(),pr=c.par[h-1];s[h]=Math.max(2,pr+trSt(ch,c.si[h-1])+(x<.16?-1:x<.70?0:x<.93?1:2))}return s};
  for(let i=0;i<9;i++){const grp=i%2===0,who=grp?[crew[0],crew[1+i%4],crew[1+(i+1)%4],crew[1+(i+2)%4]]:[crew[0]];
    const scores={},st={};for(const p of who)scores[p.id]=sim(p);
    for(let h=1;h<=18;h++){const pr=c.par[h-1],q=r();st[h]={putts:Math.min(q<.16?1:q<.82?2:3,scores.me[h]-1)};if(pr>3){const y=r();st[h].fw=y<.5?'hit':y<.75?'l':'r'}}
    G.rounds.push(trSummary({id:'demo'+i,kind:grp?'group':'solo',group:grp?'grp-sat':null,name:grp?'Saturday crew':'Solo round',date:new Date().setHours(7,10,0,0)-(i*7+2)*day+Math.floor(r()*7)*20*60000,course:'chimera',
      cfg:{format:'stroke',tee:'serpent',hcp:true},players:who,demo:true},scores,st,grp?trSkins(who.map(p=>p.id),scores,2):{}))}
  G.seeded=true;gsave()}

/* ---------- golf home ---------- */
const EMBED=(()=>{try{return window.top!==window}catch(e){return true}})();
function trBar(title,sub,right=''){return `<div class="bar">${EMBED?'':`<a href="../" aria-label="Back to the club app"><img class="logo" src="${LOGO}" alt=""></a>`}<div class="t"><b>${esc(title)}</b><span>${esc(sub)}</span></div>${right}</div>`}
const trBack=h=>`<a class="ib" href="${h}" aria-label="Back"><i class="ph-bold ph-arrow-left"></i></a>`;
function trTabs(cur){return `<div class="seg" role="group" aria-label="Golf sections">${[['me','My golf'],['groups','Groups'],['events','Club events']].map(([k,l])=>`<button data-tab="${k}" aria-pressed="${k===cur}">${l}</button>`).join('')}</div>`}
function trWire(){document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>location.hash='#/'+b.dataset.tab);
  document.querySelectorAll('[data-round]').forEach(b=>b.onclick=()=>location.hash='#/round/'+b.dataset.round)}

function hub(h){$('#app').className='wrap';if(!G.seeded)trSeed();
  const[a,b]=h.split('/');
  if(EMBED)try{parent.postMessage({golf:a==='group'||a==='new'&&b?'groups':a==='round'||a===''||a==='new'?'me':a},location.origin)}catch(e){}
  if(a==='groups')return trGroups();
  if(a==='group'&&b)return trGroup(b);
  if(a==='events')return trEvents();
  if(a==='new')return trNew(b||null);
  if(a==='round'&&b)return trRound(b);
  if(a==='log')return trLog(b||'all');
  return trMe()}

function trRoundState(id){try{return JSON.parse(localStorage.getItem('rngc-scorecard-v2:'+id)||'{}')}catch(e){return{}}}
function trMeHoles(id){const s=trRoundState(id);return((s.scores||{})['g|players']||{}).me||{}}
const trThru=id=>Object.values(trMeHoles(id)).filter(v=>v!=null).length;
function trNextHole(id){const m=trMeHoles(id);for(let h=1;h<=18;h++)if(m[h]==null)return h;return 18}

function trMe(){const my=trMine(),full=my.filter(x=>x.p.holes===18),est=trEst();
  const live=Object.values(G.live).filter(l=>COURSES[l.course]).sort((a,b)=>b.date-a.date);
  const grossA=full.map(x=>x.p.gross),best=full.slice().sort((a,b)=>a.p.gross-b.p.gross)[0];
  const ptR=my.filter(x=>x.p.pn>=9).map(x=>x.p.putts/x.p.pn*18);
  const fw=trSum(my.map(x=>x.p.fw||0)),fwn=trSum(my.map(x=>x.p.fwn||0)),gir=trSum(my.map(x=>x.p.gir||0)),girn=trSum(my.map(x=>x.p.pn||0));
  const mixR=full.filter(x=>x.p.mix),mix={e:0,b:0,p:0,bo:0,d:0};for(const x of mixR)for(const k in mix)mix[k]+=x.p.mix[k];
  const n=mixR.length||1,mixT=trSum(Object.values(mix))||1;
  const MIXL=[['e','Eagles','var(--under)',1],['b','Birdies','var(--under)',.6],['p','Pars','var(--silver-2)',.75],['bo','Bogeys','var(--over)',.55],['d','Doubles+','var(--over)',1]];
  $('#app').innerHTML=trBar('My golf',G.me.name+' · index '+G.me.hcp)+trTabs('me')+`
   ${live.map(l=>`<section class="card ev" style="padding:14px;margin-top:14px"><span class="tag rngc">In progress</span><h2 style="font-size:24px;margin:6px 0 2px">${esc(l.name)}</h2>
     <div class="muted">${esc(COURSES[l.course].name)} · ${esc(l.dateTxt)} · thru ${trThru(l.id)}</div>
     <div class="row2"><a class="btn" href="./?r=${l.id}#/hole/${trNextHole(l.id)}">Keep scoring</a><button class="btn ghost" data-drop="${l.id}">Throw it out</button></div></section>`).join('')}
   <div class="row2" style="margin-top:14px"><a class="btn" href="#/new"><i class="ph-bold ph-flag"></i> Start a round</a><a class="btn ghost" href="#/groups"><i class="ph-bold ph-users-three"></i> Group round</a></div>
   <div class="lbl">Handicap</div>
   <div class="tiles"><button class="card" id="editMe"><b>${G.me.hcp}</b><span>Your index</span><small>tap to change</small></button>
    <div class="card"><b>${est.v==null?'-':est.v}</b><span>App estimate</span><small>${est.n} full round${est.n===1?'':'s'}</small></div>
    <div class="card"><b>${my.length}</b><span>Rounds</span><small>${full.length} of 18 holes</small></div></div>
   ${est.v!=null&&est.v!==G.me.hcp?`<button class="linkbtn" id="useEst">Use the estimate, ${est.v}</button>`:''}
   <p class="note"><i class="ph-bold ph-info"></i><span>${est.v==null?'Play 3 full rounds and the app works out an index for you.':'World Handicap math on your last 20 full rounds. A guide, not your official GHIN index.'}</span></p>
   <div class="lbl">Scoring</div>
   <div class="tiles">
    <div class="card"><b>${grossA.length?Math.round(trAvg(grossA)):'-'}</b><span>Avg score</span><small>18 holes</small></div>
    <div class="card"><b>${best?best.p.gross:'-'}</b><span>Best</span><small>${best?toPar(best.p.gross-best.p.par)+' · '+trDay(best.r.date):'-'}</small></div>
    <div class="card"><b>${ptR.length?trOne(trAvg(ptR)):'-'}</b><span>Putts</span><small>per round</small></div>
    <div class="card"><b>${trPct(fw,fwn)}</b><span>Fairways</span><small>${fw} of ${fwn}</small></div>
    <div class="card"><b>${trPct(gir,girn)}</b><span>Greens</span><small>in regulation</small></div>
    <div class="card"><b>${mixR.length?trOne((mix.b+mix.e)/n):'-'}</b><span>Birdies</span><small>per round</small></div></div>
   ${mixR.length?`<section class="card" style="padding:12px 14px;margin-top:8px"><b style="font-size:14px">A typical round</b><div class="mix" aria-hidden="true">${MIXL.map(([k,,c,o])=>`<i style="width:${mix[k]/mixT*100}%;background:${c};opacity:${o}"></i>`).join('')}</div>
     <div class="mixl">${MIXL.map(([k,l])=>`<span><b>${trOne(mix[k]/n)}</b> ${l}</span>`).join('')}</div></section>`:''}
   ${full.length>=2?`<section class="card" style="padding:12px 14px;margin-top:8px"><b style="font-size:14px">Last ${Math.min(10,full.length)} rounds</b>${trSpark(full.slice(0,10).reverse().map(x=>x.p.gross))}</section>`:''}
   <div class="lbl" style="display:flex;justify-content:space-between;align-items:center">Recent rounds <a class="linkbtn" href="#/log" style="margin:0;text-transform:none;letter-spacing:0">Full play log</a></div>
   <section class="card tcard">${my.length?my.slice(0,12).map(({r,p})=>`<button class="rrow" data-round="${r.id}"><div><b>${esc(r.cname)}</b><span>${trDay(r.date)} · ${r.kind==='group'?esc(r.name):'Solo'}${p.holes<18?' · '+p.holes+' holes':''}</span></div><div class="sc">${p.gross}<small>${toPar(p.gross-p.par)}${p.pn?' · '+p.putts+' putts':''}</small></div></button>`).join('')
     :'<div class="trow"><span class="muted">No rounds yet. Start one and it lands here.</span></div>'}</section>
   ${G.rounds.some(r=>r.demo)?`<p class="note"><i class="ph-bold ph-flask"></i><span>These are sample rounds so you can see how it works. <button class="linkbtn" id="clearDemo" style="margin:0;min-height:0">Clear samples</button></span></p>`:''}
   <div style="height:28px"></div>`;
  trWire();
  $('#editMe').onclick=trEditMe;
  const ue=$('#useEst');if(ue)ue.onclick=()=>{trSetMe(G.me.name,est.v);trMe()};
  document.querySelectorAll('[data-drop]').forEach(b=>b.onclick=()=>{if(confirm('Throw out this round? Its scores are deleted.')){delete G.live[b.dataset.drop];try{localStorage.removeItem('rngc-scorecard-v2:'+b.dataset.drop)}catch(e){}gsave();trMe()}});
  const cd=$('#clearDemo');if(cd)cd.onclick=()=>{if(confirm('Clear the sample rounds and the sample group? Your own rounds stay.')){G.rounds=G.rounds.filter(r=>!r.demo);G.groups=G.groups.filter(g=>!g.demo);gsave();trMe()}}}

function trSpark(v){const W=320,H=60,lo=Math.min(...v),hi=Math.max(...v),sp=Math.max(1,hi-lo),x=i=>10+i*(W-20)/Math.max(1,v.length-1),y=s=>10+(s-lo)/sp*(H-20);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Scores, oldest to newest: ${v.join(', ')}"><polyline fill="none" stroke="var(--silver-2)" stroke-width="2" points="${v.map((s,i)=>x(i)+','+y(s)).join(' ')}"/>${v.map((s,i)=>`<circle cx="${x(i)}" cy="${y(s)}" r="4" fill="var(--silver)"/>`).join('')}</svg>
   <div class="mixl" style="justify-content:space-between"><span>Low <b>${lo}</b></span><span>High <b>${hi}</b></span><span>Last <b>${v[v.length-1]}</b></span></div>`}

function trEditMe(){$('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">You</h2>
  <label class="inl"><span>Name</span><input class="field" id="meName" maxlength="24" value="${esc(G.me.name)}" autocomplete="off"></label>
  <label class="inl"><span>Handicap index</span><input class="field" id="meIdx" type="number" inputmode="decimal" step="0.1" min="-5" max="54" value="${G.me.hcp}"></label>
  <button class="btn block" style="margin-top:14px" id="meSave">Save</button><button class="btn ghost block" style="margin-top:8px" id="closeSheet">Cancel</button>`;
  trOpen();$('#meSave').onclick=()=>{const i=parseFloat($('#meIdx').value);trSetMe($('#meName').value.trim()||'You',isNaN(i)?G.me.hcp:trIdx(i));closeSheet();route()}}

/* ---------- groups ---------- */
function trGroups(){
  $('#app').innerHTML=trBar('My golf',G.me.name+' · index '+G.me.hcp)+trTabs('groups')+`
   <p class="note" style="margin-top:14px"><i class="ph-bold ph-info"></i><span>Your regular crew. Play rounds together, keep a season table and track who owes who.</span></p>
   ${G.groups.map(g=>{const rs=G.rounds.filter(r=>r.group===g.id);return `<a class="card gcard" href="#/group/${g.id}"><div><b>${esc(g.name)}${g.manager==='me'?' <span class="tag">You manage</span>':''}</b><span>${g.members.map(m=>esc(first(m.name))).join(', ')}</span></div><div class="sc">${rs.length}<small>round${rs.length===1?'':'s'}</small></div></a>`}).join('')}
   <button class="btn ghost block" style="margin-top:14px" id="newG"><i class="ph-bold ph-plus"></i> New group</button><div style="height:28px"></div>`;
  trWire();$('#newG').onclick=trNewGroup}

function trNewGroup(){const d={name:'',ms:[{name:'',hcp:''},{name:'',hcp:''},{name:'',hcp:''}]};
  const draw=()=>{$('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">New group</h2>
    <label class="inl"><span>Group name</span><input class="field" id="ngName" maxlength="30" placeholder="Saturday crew" value="${esc(d.name)}" autocomplete="off"></label>
    <div class="lbl">Who's in · you're on it already</div>
    ${d.ms.map((m,i)=>`<div class="trrow2"><input class="field" data-mn="${i}" placeholder="Name" value="${esc(m.name)}" autocomplete="off"><input class="field" data-mi="${i}" type="number" inputmode="decimal" step="0.1" placeholder="Index" value="${esc(m.hcp)}"></div>`).join('')}
    <button class="linkbtn" id="ngMore">Add another</button>
    <button class="btn block" style="margin-top:12px" id="ngSave">Make the group</button><button class="btn ghost block" style="margin-top:8px" id="closeSheet">Cancel</button>`;
    trOpen();
    $('#ngName').oninput=e=>d.name=e.target.value;
    document.querySelectorAll('[data-mn]').forEach(x=>x.oninput=()=>d.ms[+x.dataset.mn].name=x.value);
    document.querySelectorAll('[data-mi]').forEach(x=>x.oninput=()=>d.ms[+x.dataset.mi].hcp=x.value);
    $('#ngMore').onclick=()=>{d.ms.push({name:'',hcp:''});draw()};
    $('#ngSave').onclick=()=>{const t=Date.now().toString(36);
      const g={id:'grp'+t,name:d.name.trim()||'My group',manager:'me',members:[{id:'me',name:G.me.name,hcp:G.me.hcp},...d.ms.filter(m=>m.name.trim()).map((m,i)=>({id:'m'+t+i,name:m.name.trim(),hcp:trIdx(m.hcp)}))]};
      G.groups.push(g);gsave();closeSheet();location.hash='#/group/'+g.id}};
  draw()}

function trGroup(id){const g=G.groups.find(x=>x.id===id);if(!g){location.hash='#/groups';return}
  const mgr=g.manager==='me',rs=G.rounds.filter(r=>r.group===g.id).sort((a,b)=>b.date-a.date),tbl=trStandings(g,rs);
  const nm=pid=>{const m=g.members.find(x=>x.id===pid);if(m)return m.name;for(const r of rs){const p=r.players.find(x=>x.id===pid);if(p)return p.name}return 'Guest'};
  const man=g.members.find(m=>m.id===g.manager)||g.members[0];
  $('#app').innerHTML=trBar(g.name,g.members.length+' players · '+rs.length+' round'+(rs.length===1?'':'s'),trBack('#/groups'))+`
   <a class="btn block" style="margin-top:12px" href="#/new/${g.id}"><i class="ph-bold ph-flag"></i> Start a round with this group</a>
   <div class="lbl">Season table</div>
   ${tbl.length?`<section class="card" style="padding:4px 12px"><table class="stbl"><thead><tr><th>Player</th><th>Rds</th><th>Wins</th><th>Avg net</th><th>Money</th></tr></thead><tbody>
     ${tbl.map(x=>`<tr><td>${esc(first(nm(x.id)))}</td><td>${x.n}</td><td>${x.w}</td><td>${x.nets.length?toPar(Math.round(trAvg(x.nets))):'-'}</td><td class="${x.money>0?'under':x.money<0?'over':''}">${x.money>0?'+':''}${money(x.money)}</td></tr>`).join('')}</tbody></table></section>
     <p class="note"><i class="ph-bold ph-info"></i><span>A win is the low net score of the round, full handicap. Money comes from the side bets tracked in each round.</span></p>`
    :'<section class="card tcard"><div class="trow"><span class="muted">No rounds yet. Start one and the table fills in.</span></div></section>'}
   <div class="lbl">Members</div>
   <section class="card tcard">${g.members.map(m=>`<div class="trow"><div><b>${esc(m.name)}${m.id===g.manager?' <span class="tag rngc">Manager</span>':''}${m.id==='me'?' <span class="tag">You</span>':''}</b>
     ${mgr&&m.id!=='me'?`<button class="linkbtn" data-rm="${m.id}">Remove</button> <button class="linkbtn" data-mg="${m.id}">Make manager</button>`:''}</div>
     <label class="idxbox"><span>Index</span><input class="field idx" type="number" inputmode="decimal" step="0.1" min="-5" max="54" value="${m.hcp}" data-gi="${m.id}" ${mgr||m.id==='me'?'':'disabled'} aria-label="${esc(m.name)} handicap index"></label></div>`).join('')}
    ${mgr?`<button class="btn ghost block" style="margin:10px 0" id="addM"><i class="ph-bold ph-user-plus"></i> Add a member</button>`:''}</section>
   <p class="note"><i class="ph-bold ph-lock-simple"></i><span>${mgr?'You manage this group, so you can add and remove people and fix anyone\'s handicap.':esc(first(man.name))+' manages this group. You can fix your own handicap. <button class="linkbtn" id="takeBack" style="margin:0;min-height:0">Preview: take it back</button>'}</span></p>
   <div class="lbl">Rounds</div>
   <section class="card tcard">${rs.length?rs.map(r=>{const w=trWinner(r);return `<button class="rrow" data-round="${r.id}"><div><b>${trDay(r.date)} · ${esc(r.cname)}</b><span>${r.players.map(p=>esc(first(nm(p.id)))+' '+p.gross).join(' · ')}</span></div><div class="sc" style="font-size:20px">${w?esc(first(nm(w.id))):'-'}<small>${w?'low net':'no winner'}</small></div></button>`}).join('')
     :'<div class="trow"><span class="muted">None yet</span></div>'}</section>
   ${mgr?`<button class="linkbtn" id="delG" style="margin:16px 0 28px">Delete this group</button>`:'<div style="height:28px"></div>'}`;
  trWire();
  document.querySelectorAll('[data-gi]').forEach(inp=>inp.onchange=()=>{const m=g.members.find(x=>x.id===inp.dataset.gi);m.hcp=trIdx(inp.value);if(m.id==='me')trSetMe(G.me.name,m.hcp);gsave();trGroup(id)});
  document.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{const m=g.members.find(x=>x.id===b.dataset.rm);if(confirm('Take '+first(m.name)+' out of the group? Their old rounds stay in the table.')){g.members=g.members.filter(x=>x!==m);gsave();trGroup(id)}});
  document.querySelectorAll('[data-mg]').forEach(b=>b.onclick=()=>{const m=g.members.find(x=>x.id===b.dataset.mg);if(confirm('Make '+first(m.name)+' the manager? They get the controls for adding people and fixing handicaps.')){g.manager=m.id;gsave();trGroup(id)}});
  const tb=$('#takeBack');if(tb)tb.onclick=()=>{g.manager='me';gsave();trGroup(id)};
  const dg=$('#delG');if(dg)dg.onclick=()=>{if(confirm('Delete '+g.name+'? Rounds you played stay in your own history.')){G.groups=G.groups.filter(x=>x!==g);gsave();location.hash='#/groups'}};
  const am=$('#addM');if(am)am.onclick=()=>{
    $('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">Add a member</h2>
     <div class="trrow2"><input class="field" id="amN" placeholder="Name" autocomplete="off"><input class="field" id="amI" type="number" inputmode="decimal" step="0.1" placeholder="Index"></div>
     <p class="note"><i class="ph-bold ph-info"></i><span>Preview only. In the real app you pick club members, and they get an invite.</span></p>
     <button class="btn block" style="margin-top:12px" id="amSave">Add</button><button class="btn ghost block" style="margin-top:8px" id="closeSheet">Cancel</button>`;
    trOpen();$('#amN').focus();
    $('#amSave').onclick=()=>{const n=$('#amN').value.trim();if(!n){$('#amN').focus();return}g.members.push({id:'m'+Date.now().toString(36),name:n,hcp:trIdx($('#amI').value)});gsave();closeSheet();trGroup(id)}}}

/* ---------- club events ---------- */
function trEvents(){const e=EVENTS.nov14,c=COURSES[e.course],past=G.rounds.filter(r=>r.kind==='event').sort((a,b)=>b.date-a.date),t=S.team&&TEAMS.find(x=>x.id===S.team);
  $('#app').innerHTML=trBar('My golf',G.me.name+' · index '+G.me.hcp)+trTabs('events')+`
   <section class="card ev" style="padding:16px;margin-top:14px"><span class="tag">Next club event</span><h1>${esc(e.name)}</h1><div class="muted">${esc(e.date)} · ${esc(e.start)} · ${esc(c.name)}</div>
    <div class="facts"><div><b>${esc(F().name)}</b><span>${esc(hcpLine())}</span></div><div><b>${TEAMS.length}</b><span>groups</span></div><div><b>${esc(TEE().name)}</b><span>tees</span></div></div>
    ${t?`<p class="note"><i class="ph-bold ph-users"></i><span>You're with ${esc(t.name)}, starting on hole ${t.start}.</span></p>`:''}
    <div class="row2"><a class="btn" href="#/event">${t?'Open my card':'Pick my group'}</a><a class="btn ghost" href="#/board"><i class="ph-bold ph-ranking"></i> Leaderboard</a></div>
    <a class="linkbtn" href="./?admin=1#/setup">Set up the day · admin</a></section>
   <div class="lbl">Your past events</div>
   <section class="card tcard">${past.length?past.map(r=>`<button class="rrow" data-round="${r.id}"><div><b>${esc(r.name)}</b><span>${trDay(r.date)} · ${esc(r.cname)} · ${esc(r.team||'')}</span></div><div class="sc">${esc(r.result||'-')}<small>${r.pos?'place '+r.pos:''}</small></div></button>`).join('')
     :'<div class="trow"><span class="muted">Turn in an event card and it shows up here.</span></div>'}</section>
   <p class="note"><i class="ph-bold ph-info"></i><span>Club events come off the club calendar. The admin picks the game, tees, handicaps and contests, and every group plays the same setup.</span></p><div style="height:28px"></div>`;
  trWire()}

/* ---------- start a round ---------- */
let NR=null;
function trNew(gid){const g=gid?G.groups.find(x=>x.id===gid):null;
  if(!NR||NR.gid!==(g?g.id:null))NR={gid:g?g.id:null,course:'chimera',tee:'serpent',who:g?g.members.slice(0,4).map(m=>m.id):['me'],guests:[],format:'stroke',hcp:true};
  if(!COURSES[NR.course])NR.course='chimera';
  const c=COURSES[NR.course];if(!c.tees.find(t=>t.id===NR.tee))NR.tee=c.tees[Math.min(1,c.tees.length-1)].id;
  const pool=g?g.members:[{id:'me',name:G.me.name,hcp:G.me.hcp}],count=NR.who.length+NR.guests.length;
  $('#app').innerHTML=trBar(g?g.name:'New round',g?'Group round':'Just you, or bring a guest',trBack(g?'#/group/'+g.id:'#/me'))+`
   <div class="lbl">Course</div>
   <div class="chips2">${trCoChips().map(([k,v])=>`<button class="chip2" data-co="${k}" aria-pressed="${k===NR.course}">${esc(v.name)}</button>`).join('')}<button class="chip2" id="findCo"><i class="ph-bold ph-magnifying-glass"></i> Find a course</button><button class="chip2" id="addCo"><i class="ph-bold ph-plus"></i> Add your own</button></div>
   ${c.city?`<p class="muted" style="font-size:13px;margin-top:6px">${esc(c.city)}${c.n9?' · 9 holes, played twice for 18':''}</p>`:''}
   <div class="lbl">Tees</div>
   <div class="seg" role="group" aria-label="Tees">${c.tees.map(x=>`<button data-tee="${x.id}" aria-pressed="${x.id===NR.tee}">${esc(x.name)} <span class="muted" style="font-weight:500">${x.rating} / ${x.slope}</span></button>`).join('')}</div>
   <div class="lbl">Who's playing · ${count} of 4</div>
   <div class="chips2">${pool.map(p=>`<button class="chip2" data-pl="${p.id}" aria-pressed="${NR.who.includes(p.id)}">${esc(first(p.name))} <span style="font-weight:500;opacity:.7">${p.hcp}</span></button>`).join('')}${NR.guests.map((p,i)=>`<button class="chip2" data-ug="${i}" aria-pressed="true" aria-label="Remove ${esc(p.name)}">${esc(first(p.name))} <span style="font-weight:500;opacity:.7">${p.hcp}</span> <i class="ph-bold ph-x"></i></button>`).join('')}</div>
   ${count<4?`<button class="linkbtn" id="addG">Add a guest</button>`:''}
   <div class="lbl">Game</div>
   <div class="fmt">${['stroke','stableford'].map(k=>`<button class="card fmtc" data-f="${k}" aria-pressed="${NR.format===k}" style="margin-bottom:8px"><b>${FORMATS[k].name}</b><span>${FORMATS[k].desc}</span></button>`).join('')}</div>
   <div class="lbl">Handicaps</div>
   <div class="seg" role="group" aria-label="Handicaps"><button data-h="0" aria-pressed="${!NR.hcp}">Gross</button><button data-h="1" aria-pressed="${NR.hcp}">Net, with strokes</button></div>
   <p class="note"><i class="ph-bold ph-coins"></i><span>Skins, a Nassau or any side bet get added from the first tee.</span></p>
   ${c.custom||c.stdsi?`<p class="note"><i class="ph-bold ph-info"></i><span>${esc(c.name)} uses a standard handicap hole order until its real card is loaded.</span></p>`:''}
   ${c.est?`<p class="note"><i class="ph-bold ph-info"></i><span>No rating or slope on file for this course yet, so handicaps use par and 113.</span></p>`:''}
   <div class="stick"><button class="btn block" id="goR">Start the round <i class="ph-bold ph-arrow-right"></i></button></div>`;
  document.querySelectorAll('[data-co]').forEach(b=>b.onclick=()=>{NR.course=b.dataset.co;trNew(gid)});
  document.querySelectorAll('[data-tee]').forEach(b=>b.onclick=()=>{NR.tee=b.dataset.tee;trNew(gid)});
  document.querySelectorAll('[data-pl]').forEach(b=>b.onclick=()=>{const id=b.dataset.pl;if(id==='me')return;const i=NR.who.indexOf(id);
    if(i>=0)NR.who.splice(i,1);else if(count<4)NR.who.push(id);trNew(gid)});
  document.querySelectorAll('[data-ug]').forEach(b=>b.onclick=()=>{NR.guests.splice(+b.dataset.ug,1);trNew(gid)});
  document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{NR.format=b.dataset.f;trNew(gid)});
  document.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{NR.hcp=b.dataset.h==='1';trNew(gid)});
  $('#addCo').onclick=()=>trAddCourse(gid);$('#findCo').onclick=()=>trFind(gid);
  const ag=$('#addG');if(ag)ag.onclick=()=>{
    $('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">Add a guest</h2>
     <div class="trrow2"><input class="field" id="agN" placeholder="Name" autocomplete="off"><input class="field" id="agI" type="number" inputmode="decimal" step="0.1" placeholder="Index"></div>
     <button class="btn block" style="margin-top:12px" id="agSave">Add</button><button class="btn ghost block" style="margin-top:8px" id="closeSheet">Cancel</button>`;
    trOpen();$('#agN').focus();
    $('#agSave').onclick=()=>{const n=$('#agN').value.trim();if(!n){$('#agN').focus();return}NR.guests.push({id:'q'+Date.now().toString(36),name:n,hcp:trIdx($('#agI').value)});closeSheet();trNew(gid)}};
  $('#goR').onclick=()=>trCreate(g)}

function trCreate(g){const pool=g?g.members:[],me={id:'me',name:G.me.name,hcp:G.me.hcp};
  const ps=[me,...pool.filter(p=>p.id!=='me'&&NR.who.includes(p.id)).map(p=>({id:p.id,name:p.name,hcp:p.hcp})),...NR.guests.map(p=>({id:p.id,name:p.name,hcp:p.hcp,guest:true}))];
  const id='c'+Date.now().toString(36),now=Date.now();
  G.live[id]={id,kind:g?'group':'solo',group:g?g.id:null,name:g?g.name:(ps.length>1?'Casual round':'Solo round'),date:now,dateTxt:trDay(now),course:NR.course,
    cfg:{format:NR.format,tee:NR.tee,hcp:NR.hcp,allow:FORMATS[NR.format].allow,ctp:[],ld:0,skins:'off',buyin:0},players:ps,
    bench:g?g.members.filter(p=>p.id!=='me'&&!NR.who.includes(p.id)).map(p=>({id:p.id,name:p.name,hcp:p.hcp,club:''})):[]};
  gsave();NR=null;location.href='./?r='+id+'#/hole/1'}

function trAddCourse(gid,pre){const d={name:'',city:'',par:[4,5,4,3,4,4,3,5,4, 4,5,4,3,4,4,3,5,4],rating:'',slope:''};
  if(pre){d.name=pre.name||'';d.city=pre.city||'';if(pre.pp)d.par=d.par.map((p,i)=>pre.pp[i+1]||4)}
  const draw=()=>{const tot=trSum(d.par);$('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">${pre?'Finish the card':'Add a course'}</h2>${pre?`<p class="muted" style="font-size:14px">We have ${esc(pre.name)} on the map but not its full scorecard yet. Check the pars against the card at the course, then save.</p>`:''}
    <label class="inl"><span>Course name</span><input class="field" id="acN" maxlength="70" value="${esc(d.name)}" placeholder="Course name" autocomplete="off"></label>
    <label class="inl"><span>City</span><input class="field" id="acC" maxlength="40" value="${esc(d.city)}" placeholder="Las Vegas, NV" autocomplete="off"></label>
    <div class="lbl">Par for each hole · tap to change · total ${tot}</div>
    <div class="parset">${d.par.slice(0,9).map((p,i)=>`<button data-par="${i}" aria-label="Hole ${i+1}, par ${p}"><small>${i+1}</small>${p}</button>`).join('')}</div>
    <div class="parset" style="margin-top:4px">${d.par.slice(9).map((p,i)=>`<button data-par="${i+9}" aria-label="Hole ${i+10}, par ${p}"><small>${i+10}</small>${p}</button>`).join('')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px"><label class="inl"><span>Rating</span><input class="field" id="acR" type="number" inputmode="decimal" step="0.1" placeholder="${tot}" value="${esc(d.rating)}"></label><label class="inl"><span>Slope</span><input class="field" id="acS" type="number" inputmode="numeric" placeholder="113" value="${esc(d.slope)}"></label></div>
    <p class="note"><i class="ph-bold ph-info"></i><span>Rating and slope are on the scorecard. Leave them blank and handicaps use par and 113.</span></p>
    <button class="btn block" style="margin-top:12px" id="acSave">Save course</button><button class="btn ghost block" style="margin-top:8px" id="closeSheet">Cancel</button>`;
    trOpen();
    $('#acN').oninput=e=>d.name=e.target.value;$('#acC').oninput=e=>d.city=e.target.value;$('#acR').oninput=e=>d.rating=e.target.value;$('#acS').oninput=e=>d.slope=e.target.value;
    document.querySelectorAll('[data-par]').forEach(b=>b.onclick=()=>{const i=+b.dataset.par;d.par[i]=d.par[i]===5?3:d.par[i]+1;draw()});
    $('#acSave').onclick=()=>{const name=d.name.trim();if(!name){$('#acN').focus();return}
      const rt=parseFloat(d.rating),sl=parseInt(d.slope),id=pre&&pre.lib?pre.lib:'u'+Date.now().toString(36);
      const co={name,city:d.city.trim(),par:d.par.slice(),si:TR_SI.slice(),siW:TR_SI.slice(),custom:true,
        tees:[{id:'main',name:'Tees',rating:rt>50&&rt<85?Math.round(rt*10)/10:tot,slope:sl>=55&&sl<=155?sl:113,y:Array(18).fill(0)}]};
      G.courses[id]=co;COURSES[id]=co;gsave();NR.course=id;NR.tee='main';closeSheet();trNew(gid)}};
  draw()}

/* ---------- course library: every course in California, Nevada and Arizona ----------
   courses/index.json lists them all; courses/c/<id>.json holds the card, tees and hole maps (built by tools/courses/build_courses.py).
   Data: OpenGolfAPI and OpenStreetMap contributors, ODbL 1.0. A picked course is kept on the phone so it works with no signal. */
let LIB=null,LIBP=null;const FQ={q:'',st:'',near:null};
function trLib(){if(LIB)return Promise.resolve(LIB);
  if(!LIBP)LIBP=fetch('courses/index.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(j=>{LIB=j;return j}).catch(e=>{LIBP=null;throw e});return LIBP}
function trCoChips(){const all=Object.entries(COURSES),out=all.slice(0,1);   /* Chimera first, then the newest picks, always the one picked now */
  for(const e of all.slice(1).reverse())if(out.length<6)out.push(e);
  if(!out.find(([k])=>k===NR.course)&&COURSES[NR.course])out.push([NR.course,COURSES[NR.course]]);return out}
const trMi=(a,b,c,d)=>{const r=Math.PI/180,x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 7918*Math.asin(Math.sqrt(x))};
const trFold=t=>t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function trFind(gid){
  $('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">Find a course</h2>
   <input class="field" id="fqQ" type="search" placeholder="Course or city" value="${esc(FQ.q)}" autocomplete="off" aria-label="Search courses">
   <div class="seg" role="group" aria-label="State" style="margin-top:8px">${[['','All'],['CA','California'],['NV','Nevada'],['AZ','Arizona']].map(([k,n])=>`<button data-fst="${k}" aria-pressed="${FQ.st===k}">${n}</button>`).join('')}</div>
   <button class="linkbtn" id="fqNear"><i class="ph-bold ph-navigation-arrow"></i> ${FQ.near?'Sorted by closest to you':'Closest to me'}</button>
   <div class="findl" id="fqL"><p class="muted">Loading courses...</p></div>
   <p class="findsrc">Course data: OpenGolfAPI and OpenStreetMap contributors, ODbL. Cards can change, check the one at the course.</p>
   <button class="btn ghost block" style="margin-top:10px" id="closeSheet">Close</button>`;
  trOpen();
  const q=$('#fqQ');q.oninput=()=>{FQ.q=q.value;list()};
  document.querySelectorAll('[data-fst]').forEach(b=>b.onclick=()=>{FQ.st=b.dataset.fst;document.querySelectorAll('[data-fst]').forEach(x=>x.setAttribute('aria-pressed',x===b));list()});
  $('#fqNear').onclick=()=>{const nb=$('#fqNear');if(!('geolocation'in navigator)){nb.textContent='No location on this phone';return}
    nb.textContent='Finding you...';navigator.geolocation.getCurrentPosition(p=>{FQ.near=[p.coords.latitude,p.coords.longitude];nb.innerHTML='<i class="ph-bold ph-navigation-arrow"></i> Sorted by closest to you';list()},
      ()=>{nb.textContent='Location is off for this page'},{maximumAge:600000,timeout:15000})};
  const list=()=>{const box=$('#fqL');if(!LIB)return;const F=LIB.courses,words=trFold(FQ.q).split(/\s+/).filter(Boolean);
    let rs=F.filter(c=>(!FQ.st||c[3]===FQ.st)&&words.every(w=>trFold(c[1]+' '+c[2]+' '+c[3]).includes(w)));
    if(FQ.near)rs=rs.map(c=>[c,trMi(FQ.near[0],FQ.near[1],c[4],c[5])]).sort((a,b)=>a[1]-b[1]);
    else rs=rs.map(c=>[c,null]).sort((a,b)=>(b[0][7]-a[0][7])||(b[0][8]-a[0][8])||a[0][1].localeCompare(b[0][1]));
    const n=rs.length;rs=rs.slice(0,40);
    box.innerHTML=(n?`<p class="muted" style="font-size:13px">${n.toLocaleString()} course${n===1?'':'s'}${n>40?', showing 40':''}</p>`:`<p class="muted">No course by that name. Try the city, or add your own.</p>`)+
     rs.map(([c,d])=>`<button class="rrow" data-pick="${esc(c[0])}"><div><b>${esc(c[1])}</b><span>${esc(c[2]?c[2]+', ':'')}${c[3]}${c[6]?' · '+c[6]+' holes':''}</span><div style="margin-top:3px"><span class="ctag ${c[7]===2?'ok':''}">${c[7]===2?'Full card':c[7]===1?'Pars only':'Card needed'}</span>${c[8]?'<span class="ctag ok">Hole maps</span>':''}</div></div><em>${d!=null?(d<10?d.toFixed(1):Math.round(d))+' mi':''}</em></button>`).join('');
    box.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>trPick(b.dataset.pick,gid,b))};
  trLib().then(list).catch(()=>{$('#fqL').innerHTML='<p class="muted">The course list needs a signal the first time. Try again in a moment, or add your own.</p>'})}
function trPick(id,gid,btn){
  if(COURSES[id]){NR.course=id;closeSheet();trNew(gid);return}
  const row=LIB&&LIB.courses.find(c=>c[0]===id);if(btn)btn.style.opacity=.5;
  fetch('courses/c/'+encodeURIComponent(id)+'.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(d=>{
    if(d.app){const co=Object.assign(d.app,{lat:d.lat,lng:d.lng,phone:d.phone||'',web:d.website||''});G.courses[id]=co;COURSES[id]=co;gsave();NR.course=id;closeSheet();trNew(gid);return}
    trAddCourse(gid,{lib:id,name:d.name,city:((d.city||'')+', '+d.state).replace(/^, /,''),pp:d.pp||null})})
   .catch(()=>{if(btn)btn.style.opacity=1;if(row)trAddCourse(gid,{lib:id,name:row[1],city:(row[2]?row[2]+', ':'')+row[3]})})}

/* ---------- a saved round ---------- */
function trRound(id){const r=G.rounds.find(x=>x.id===id);if(!r){location.hash='#/me';return}
  const me=r.players.find(p=>p.id==='me'),co={par:r.par,si:r.si},led=r.money||{};
  const back=r.kind==='event'?'#/events':r.group&&G.groups.some(g=>g.id===r.group)?'#/group/'+r.group:'#/me';
  const nmOf=pid=>{const p=r.players.find(x=>x.id===pid);return p?first(p.name):'?'},tx=trSettle(led,nmOf);
  const sub=trDay(r.date)+' · '+(r.kind==='event'?r.cname:(r.kind==='group'?r.name:'Solo'))+(r.tee&&r.tee!=='Tees'?' · '+r.tee+' tees':'');
  $('#app').innerHTML=trBar(r.kind==='event'?r.name:r.cname,sub,trBack(back))+`
   ${me?`<div class="sumrow"><div class="card"><b>${me.gross}</b><span>Score</span></div><div class="card"><b class="${cls(me.gross-me.par)}">${toPar(me.gross-me.par)}</b><span>To par</span></div><div class="card"><b>${me.diff!=null?me.diff:me.holes}</b><span>${me.diff!=null?'Handicap diff':'Holes'}</span></div></div>
     ${me.pn?`<div class="tiles"><div class="card"><b>${me.putts}</b><span>Putts</span><small>${me.pn} holes</small></div><div class="card"><b>${trPct(me.fw,me.fwn)}</b><span>Fairways</span><small>${me.fw} of ${me.fwn}</small></div><div class="card"><b>${trPct(me.gir,me.pn)}</b><span>Greens</span><small>${me.gir} of ${me.pn}</small></div></div>`:''}`
    :r.kind==='event'?`<div class="sumrow"><div class="card"><b>${esc(r.result||'-')}</b><span>${esc(r.format||'')}</span></div><div class="card"><b>${r.pos||'-'}</b><span>Place</span></div><div class="card"><b>${r.holes||'-'}</b><span>Holes</span></div></div>`:''}
   <div class="card paper" style="margin-top:10px">${paperTable(r.players.map(p=>({name:first(p.name),get:h=>p.scores[h],k:1})),co)}</div>
   ${Object.keys(led).length?`<div class="lbl">Side bets</div><section class="card tcard">${r.players.map(p=>{const v=led[p.id]||0;return `<div class="trow"><b>${esc(p.name)}</b><b class="${v>0?'under':v<0?'over':''}">${v>0?'+':''}${money(v)}</b></div>`}).join('')}</section>
     ${tx.length?`<section class="card tcard" style="margin-top:8px">${tx.map(x=>`<div class="trow"><span>${esc(x)}</span></div>`).join('')}</section>`:''}`:''}
   <div class="lbl">Notes</div>
   <textarea class="field" id="rNote" rows="3" maxlength="400" placeholder="Wind, new driver, what worked..." style="padding:10px 12px;min-height:84px">${esc(r.note||'')}</textarea>
   <div class="muted" style="font-size:13px;margin-top:6px">${r.kind==='event'?'':'Teed off '+new Date(r.date).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+' · '}${esc(r.cname)}${COURSES[r.course]&&COURSES[r.course].city?', '+esc(COURSES[r.course].city):''}</div>
   <button class="linkbtn" id="delR" style="margin:16px 0 28px">Delete this round</button>`;
  $('#rNote').onchange=()=>{r.note=$('#rNote').value.trim();gsave()};
  $('#delR').onclick=()=>{if(confirm('Delete this round from your history? This can\'t be undone.')){G.rounds=G.rounds.filter(x=>x!==r);gsave();location.hash=back}}}

/* ---------- hooks the scorecard calls ---------- */
/* your own stats on each hole of a personal or group round: drive and putts; greens in regulation work themselves out */
function statCard(n){if(!CASUAL||F().entry!=='players'||!ids(myTeam()).includes('me'))return'';
  const v=S.st[n]||{},par=CO().par[n-1],sc=mySc('me',n),ro=canScore()?'':'disabled';
  const gir=sc!=null&&v.putts!=null?sc-v.putts<=par-2:null;
  return `<section class="card statc"><b style="font-size:14px">Your stats <span class="muted" style="font-weight:500">· optional</span></b>
   ${par>3?`<div class="r"><span>Drive</span>${[['l','Left'],['hit','Fairway'],['r','Right']].map(([k,l])=>`<button class="chip2" data-fw="${k}" aria-pressed="${v.fw===k}" ${ro}>${l}</button>`).join('')}</div>`:''}
   <div class="r"><span>Putts</span>${[0,1,2,3,4].map(k=>`<button class="chip2" data-pt="${k}" aria-pressed="${v.putts===k}" ${ro}>${k===4?'4+':k}</button>`).join('')}</div>
   ${gir!=null?`<div class="muted" style="font-size:13px;margin-top:8px">${gir?'<i class="ph-fill ph-check-circle"></i> Green in regulation':'Missed the green in regulation'}</div>`:''}</section>`}
function wireStat(n){
  document.querySelectorAll('[data-fw]').forEach(b=>b.onclick=()=>{const v=S.st[n]||(S.st[n]={});v.fw=v.fw===b.dataset.fw?null:b.dataset.fw;save();buzz();hole(n)});
  document.querySelectorAll('[data-pt]').forEach(b=>b.onclick=()=>{const v=S.st[n]||(S.st[n]={}),k=+b.dataset.pt;v.putts=v.putts===k?null:k;save();buzz();hole(n)})}

/* a personal or group round goes into history with its side-bet money */
function finishRound(){const t=myTeam(),miss=order(t.start).filter(h=>!holeDone(h));
  if(!confirm(miss.length?`Save this round with ${18-miss.length} holes? Still blank: ${miss.join(', ')}.`:'Save this round to your history?'))return;
  gfresh();const live=G.live[RID]||LIVE,list=field(),led={};
  for(const b of myBets()){const r=settleBet(b,list);for(const[k,v]of Object.entries(r.led))led[k]=(led[k]||0)+v}
  const m={...live,cfg:CFG(),players:players(t).map(p=>({id:p.id,name:p.name,hcp:idx(p.id)}))};
  const sm=trSummary(m,S.scores[scoreKey(t.id)]||{},S.st,led);
  G.rounds.unshift(sm);delete G.live[RID];
  const me=sm.players.find(p=>p.id==='me');if(me&&me.hcp!==G.me.hcp)trSetMe(G.me.name,me.hcp);
  if(live.group){const g=G.groups.find(x=>x.id===live.group);if(g)for(const p of m.players){const gm=g.members.find(x=>x.id===p.id);if(gm)gm.hcp=p.hcp}}
  gsave();try{localStorage.removeItem(KEY)}catch(e){}
  location.href='./#/round/'+sm.id}

/* a turned-in event card also lands under Club events */
function logEvent(){try{gfresh();const t=myTeam(),e=EV(),c=CO(),P=PEOPLE(),raw=S.scores[scoreKey(t.id)]||{},u=ranked(field()).find(x=>x.mine)||{};
  const pl=Object.entries(raw).map(([w,s])=>{const hs=Object.keys(s).filter(h=>s[h]!=null);
    return{id:w,name:w==='team'?'Team':(P[w]?P[w].name:'Player'),scores:s,holes:hs.length,gross:trSum(hs.map(h=>s[h])),par:trSum(hs.map(h=>c.par[h-1]))}});
  G.rounds=G.rounds.filter(r=>r.id!=='ev-'+e.id);
  G.rounds.unshift({id:'ev-'+e.id,kind:'event',name:e.name,date:Date.now(),cname:c.name,tee:TEE().name,format:F().name,team:t.name,result:String(showScore(u)),pos:u.pos||null,holes:u.thru||0,par:c.par.slice(),si:c.si.slice(),players:pl,money:{}});
  gsave()}catch(err){}}

/* ---------- play log: every round, where and when ---------- */
function trLog(f){const all=G.rounds.slice().sort((a,b)=>b.date-a.date),rs=all.filter(r=>f==='all'||r.kind===f);
  const meP=r=>r.players.find(p=>p.id==='me'),now=new Date(),yr=now.getFullYear();
  const holes=trSum(rs.map(r=>{const p=meP(r);return p?p.holes:(r.holes||0)}));
  const where={};for(const r of rs){const w=where[r.cname]||(where[r.cname]={n:0,g:[],last:0,course:r.course});w.n++;w.last=Math.max(w.last,r.date);const p=meP(r);if(p&&p.holes===18)w.g.push(p.gross)}
  const W=Object.entries(where).sort((a,b)=>b[1].n-a[1].n);
  const months=[];for(let i=5;i>=0;i--){const d=new Date(yr,now.getMonth()-i,1);months.push({k:d.getFullYear()+'-'+d.getMonth(),l:d.toLocaleDateString(undefined,{month:'short'}),n:0})}
  for(const r of rs){const d=new Date(r.date),m=months.find(x=>x.k===d.getFullYear()+'-'+d.getMonth());if(m)m.n++}
  const mx=Math.max(1,...months.map(m=>m.n));
  const dows=[0,0,0,0,0,0,0];for(const r of rs)dows[new Date(r.date).getDay()]++;
  const fav=rs.length?new Date(2026,0,4+dows.indexOf(Math.max(...dows))).toLocaleDateString(undefined,{weekday:'long'}):'-';
  const byMonth={};for(const r of rs){const d=new Date(r.date),k=d.toLocaleDateString(undefined,{month:'long',year:'numeric'});(byMonth[k]||(byMonth[k]=[])).push(r)}
  const withWho=r=>r.kind==='event'?esc(r.team||'Club event'):r.players.filter(p=>p.id!=='me').map(p=>esc(first(p.name))).join(', ')||'Solo';
  const score=r=>{const p=meP(r);return p?`${p.gross}<small>${toPar(p.gross-p.par)}${p.holes<18?' · '+p.holes+' holes':''}</small>`:`${esc(r.result||'-')}<small>${r.pos?'place '+r.pos:'event'}</small>`};
  $('#app').innerHTML=trBar('Play log',G.me.name+' · every round, where and when',trBack('#/me'))+`
   <div class="seg" role="group" aria-label="Which rounds">${[['all','All'],['solo','Solo'],['group','Group'],['event','Events']].map(([k,l])=>`<button data-lf="${k}" aria-pressed="${k===f}">${l}</button>`).join('')}</div>
   <div class="tiles" style="margin-top:12px"><div class="card"><b>${rs.length}</b><span>Rounds</span><small>${rs.filter(r=>new Date(r.date).getFullYear()===yr).length} this year</small></div>
    <div class="card"><b>${W.length}</b><span>Courses</span><small>${W.length?esc(W[0][0].split(' ')[0])+' most':'-'}</small></div>
    <div class="card"><b>${holes}</b><span>Holes</span><small>played</small></div></div>
   <div class="lbl">Where you play</div>
   ${W.length?`<section class="card" style="padding:4px 12px"><table class="stbl"><thead><tr><th>Course</th><th>Rds</th><th>Avg</th><th>Best</th><th>Last</th></tr></thead><tbody>
     ${W.map(([n,w])=>`<tr><td>${esc(n)}</td><td>${w.n}</td><td>${w.g.length?Math.round(trAvg(w.g)):'-'}</td><td>${w.g.length?Math.min(...w.g):'-'}</td><td>${new Date(w.last).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</td></tr>`).join('')}</tbody></table></section>`
    :'<section class="card tcard"><div class="trow"><span class="muted">No rounds yet.</span></div></section>'}
   <div class="lbl">When you play · ${esc(fav)}s most</div>
   <section class="card" style="padding:12px 14px"><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;align-items:end;height:96px">
     ${months.map(m=>`<div style="display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end"><b style="font-size:13px">${m.n||''}</b><i style="display:block;width:70%;height:${m.n/mx*60}px;min-height:${m.n?4:1}px;background:${m.n?'var(--silver-2)':'var(--line)'};border-radius:3px"></i><span class="muted" style="font-size:12px">${m.l}</span></div>`).join('')}</div></section>
   ${Object.entries(byMonth).map(([k,list])=>`<div class="lbl">${esc(k)} · ${list.length} round${list.length===1?'':'s'}</div>
    <section class="card tcard">${list.map(r=>`<button class="rrow" data-round="${r.id}"><div><b>${esc(r.kind==='event'?r.name:r.cname)}</b>
      <span>${new Date(r.date).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})}${r.kind==='event'?'':' · '+new Date(r.date).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})} · ${withWho(r)}${r.tee&&r.tee!=='Tees'?' · '+esc(r.tee):''}</span>
      ${r.note?`<span style="display:block;font-style:italic">${esc(r.note.length>70?r.note.slice(0,70)+'...':r.note)}</span>`:''}</div><div class="sc">${score(r)}</div></button>`).join('')}</section>`).join('')}
   <p class="note"><i class="ph-bold ph-info"></i><span>Tap a round for the full card, side bets and notes.</span></p><div style="height:28px"></div>`;
  trWire();document.querySelectorAll('[data-lf]').forEach(b=>b.onclick=()=>location.hash='#/log/'+b.dataset.lf)}

route();
