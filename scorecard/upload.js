/* Upload teams and players for an event (David, Nov 26 2026: "need to have a file upload place for ross to put all the
   teams and players to a event. need to make it easy for him").
   Ross picks an Excel or CSV file, or pastes from any sheet or text. The reader finds the groups, starting holes,
   team names and players on its own, shows what it found, and only saves when he taps Replace all groups.
   Saves through the same /admin/field call as the Groups page; team names through /event/name.
   The reading part (rows -> groups) is plain and tested in tools/club/test_upload.js. */
(function(){
'use strict';
const MAXG=40,MAXP=6;
const clean=s=>String(s==null?'':s).replace(/[<>"`\\]|[\x00-\x1f]/g,' ').replace(/\s+/g,' ').trim();
const low=s=>clean(s).toLowerCase();

/* ---------- reading: rows of cells -> groups ---------- */
function kind(h){h=low(h).replace(/[.:]/g,'');if(!h)return '';
  if(/tee ?time|^time$|hcp|handicap|index|email|phone|paid|shirt|size|cart ?#?$|notes?|ghin/.test(h))return 'skip';
  if(/^first( ?name)?$/.test(h))return 'first';if(/^last( ?name)?$/.test(h))return 'last';
  if(/team ?name|name of team/.test(h))return 'tname';
  if(/\b(hole|start|starting|shotgun)\b/.test(h))return 'hole';
  if(/^(group|grp|flight|pairing|foursome|team|squad|team ?(#|no|num|number)|group ?(#|no|num|number)|#|no)$/.test(h))return 'grp';
  if(/player|golfer|name|member|participant|partner/.test(h))return 'player';
  return ''}
/* "16B", "Hole 16", "#3", "Group 4", "Team Raiders" -> {hole, letter, num, name} */
function label(v,ctx){const s=clean(v);if(!s)return null;let m;
  if((m=/^(?:hole|tee|start(?:ing)?(?: hole)?)\s*#?\s*(\d{1,2})\s*-?\s*([a-z])?\b\s*(.*)$/i.exec(s)))return {hole:+m[1],letter:(m[2]||'').toUpperCase(),name:nm(m[3])};
  if((m=/^#?\s*(\d{1,2})\s*-?\s*([a-z])$/i.exec(s)))return {hole:+m[1],letter:m[2].toUpperCase()};
  if((m=/^#?\s*(\d{1,2})$/.exec(s)))return ctx==='hole'?{hole:+m[1],letter:''}:{num:+m[1]};
  if((m=/^(?:group|grp|flight|pairing|foursome|team|squad)\s*#?\s*(\d{1,2})\b\s*[-:,]?\s*(.*)$/i.exec(s)))return {num:+m[1],name:nm(m[2])};
  if((m=/^(?:team|squad)\s+(.+)$/i.exec(s)))return {name:nm(m[1])};
  return ctx==='grp'||ctx==='tname'?{name:nm(s)}:null}
const nm=s=>{s=clean(s).replace(/^[-:,]\s*/,'');return s.length>=2?s.slice(0,24):''};
const isLabel=v=>{const s=clean(v);return /^(?:hole|tee|group|grp|flight|pairing|foursome|team|squad)\b/i.test(s)||/^#?\s*\d{1,2}\s*-?\s*[a-z]?$/i.test(s)};
/* a player cell: drop handicaps like "(12)" or " 8.4", skip blanks and fillers */
function person(v){let s=clean(v).replace(/\s*\([^)]*\)\s*$/,'').replace(/\s+[+-]?\d{1,2}(\.\d)?$/,'').replace(/^\d{1,2}[.)]\s+/,'').trim();
  if(!s||/^(tbd|tba|open|n\/?a|-+|x|player ?\d*|name)$/i.test(s)||!/[a-z]/i.test(s))return '';
  if(/^[^,]+,\s*[^,]+$/.test(s)&&!/\s/.test(s.split(',')[0].trim()))s=s.split(',').map(x=>x.trim()).reverse().join(' ');   /* "Smith, John" */
  return s.slice(0,40)}
const splitList=s=>String(s).split(/\s*(?:;|\/|&|\band\b|\n|,(?=\s*[A-Za-z][^,]*\s[A-Za-z]))\s*/i);

function read(rows){
  rows=(rows||[]).map(r=>(Array.isArray(r)?r:[r]).map(clean)).filter(r=>r.some(Boolean));
  const out=[];let cur=null;
  const start=(lab)=>{cur={hole:lab&&lab.hole||0,letter:lab&&lab.letter||'',num:lab&&lab.num||0,name:lab&&lab.name||'',players:[]};out.push(cur);return cur};
  const addP=v=>{const p=person(v);if(p)(cur||start(null)).players.push(p)};
  /* header row: one of the first 6 rows naming a player column, or a group/hole column next to another known one */
  let hi=-1,cols=null;
  for(let i=0;i<Math.min(6,rows.length);i++){const k=rows[i].map(kind),n=k.filter(x=>x&&x!=='skip').length;
    if(k.includes('player')||k.includes('first')||((k.includes('grp')||k.includes('hole'))&&n>=2)){hi=i;cols=k;break}}
  if(hi>=0){
    const P=cols.map((k,i)=>k==='player'?i:-1).filter(i=>i>=0),F=cols.indexOf('first'),L=cols.indexOf('last');
    const G=cols.indexOf('grp'),H=cols.indexOf('hole'),T=cols.indexOf('tname');
    const who=r=>F>=0?[clean(r[F]+' '+(L>=0?r[L]:''))]:P.map(i=>r[i]);
    const labOf=r=>{const a=G>=0?label(r[G],'grp'):null,b=H>=0?label(r[H],'hole'):null,t=T>=0?nm(r[T]):'';
      if(!a&&!b&&!t)return null;return {hole:(b&&b.hole)||(a&&a.hole)||0,letter:(b&&b.letter)||(a&&a.letter)||'',num:(a&&a.num)||(b&&b.num)||0,name:t||(a&&a.name)||(b&&b.name)||''}};
    const wide=P.length>=2&&F<0;
    let lastKey=null;
    for(const r of rows.slice(hi+1)){if(r.map(kind).filter(x=>x&&x!=='skip').length>=2)continue;   /* a repeated header */
      const lab=labOf(r),names=who(r).map(person).filter(Boolean);
      if(wide){if(!names.length&&!lab)continue;
        if(!lab&&cur&&!names.length)continue;start(lab);names.forEach(p=>cur.players.push(p));continue}
      const key=lab?JSON.stringify([lab.hole,lab.letter,lab.num,lab.name]):null;
      if(key&&key!==lastKey){const same=out.find(g=>JSON.stringify([g.hole,g.letter,g.num,g.name])===key);if(same)cur=same;else start(lab);lastKey=key}
      names.forEach(p=>(cur||start(null)).players.push(p))}
  }else{
    /* "16B: John, Mike" or "Group 2 - Bo Kim / Sam Lee": a label, then the players */
    const lead=s=>{const m=/^(.{1,30}?)\s*(?::|\s-\s|\s–\s)\s*(.+)$/.exec(s);return m&&isLabel(m[1])?{lab:label(m[1]),rest:m[2]}:null};
    for(const r0 of rows){const c=r0.filter(Boolean),ld=c.length?lead(c[0]):null;
      if(ld){const more=[ld.rest].concat(c.slice(1)),ps=more.flatMap(splitList).filter(person);
        if(ps.length>=2||c.length>1){start(ld.lab);more.forEach(v=>splitList(v).forEach(addP));continue}}
      if(c.length===1){const s=c[0];
        if(isLabel(s)){start(label(s));continue}
        if(/[;&\/]|,.*,/.test(s)&&splitList(s).filter(person).length>=2){start(null);splitList(s).forEach(addP);continue}
        addP(s);continue}
      if(isLabel(c[0])){start(label(c[0]));c.slice(1).forEach(v=>splitList(v).forEach(addP));continue}
      start(null);c.forEach(addP)}
  }
  return out.filter(g=>g.players.length)}

/* starting holes and group ids (g + hole + letter), the same ids the Groups page makes */
function place(groups,mode){const used={},res=[];let next=1;
  const free=(h,want)=>{const L='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),u=used[h]||(used[h]=new Set());const l=want&&!u.has(want)?want:L.find(x=>!u.has(x));if(l)u.add(l);return l};
  const anyHole=groups.some(g=>g.hole>=1&&g.hole<=18);
  for(const g of groups){let h=g.hole>=1&&g.hole<=18?g.hole:0;
    if(!h){if(mode==='one'||(!anyHole&&mode!=='shotgun'))h=1;else{const taken=new Set(groups.filter(x=>x.hole>=1&&x.hole<=18).map(x=>x.hole).concat(res.map(x=>x.start)));
      let k=0;while(taken.has(next)&&k++<18)next=next%18+1;h=next;next=next%18+1}}
    const l=free(h,g.letter);res.push({id:l?'g'+h+l:'',start:h,name:g.name,players:g.players.slice()})}
  return res}

function check(teams){const w=[];
  if(teams.length>MAXG)w.push(`That's ${teams.length} groups. The most is ${MAXG}.`);
  teams.forEach(t=>{if(t.players.length>MAXP)w.push(`${t.name||'Group '+t.id.slice(1)} has ${t.players.length} players. The most is ${MAXP}.`);if(!t.id)w.push('Too many groups on one hole.')});
  return w}

/* ---------- files ---------- */
function csvRows(text){const t=String(text).replace(/^﻿/,''),first=t.split(/\r?\n/).find(l=>l.trim())||'';
  const d=first.includes('\t')?'\t':(first.split(';').length>first.split(',').length?';':',');
  if(d===','&&!/,/.test(t))return t.split(/\r?\n/).map(l=>[l]);
  const rows=[];let row=[],cell='',q=false;
  for(let i=0;i<t.length;i++){const ch=t[i];
    if(q){if(ch==='"'){if(t[i+1]==='"'){cell+='"';i++}else q=false}else cell+=ch;continue}
    if(ch==='"'&&!cell){q=true;continue}
    if(ch===d){row.push(cell);cell='';continue}
    if(ch==='\n'||ch==='\r'){if(ch==='\r'&&t[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';continue}
    cell+=ch}
  row.push(cell);rows.push(row);return rows}
let xl=null;
const XLSRC=(()=>{try{return new URL('../assets/vendor/xlsx-0.18.5.min.js',document.currentScript.src).href}catch(e){return '../assets/vendor/xlsx-0.18.5.min.js'}})();   /* works from the scorecard and the main app */
const loadXL=()=>xl||(xl=new Promise((ok,no)=>{const s=document.createElement('script');s.src=XLSRC;s.onload=()=>ok(window.XLSX);s.onerror=()=>{xl=null;no(new Error('No signal. Try again in a minute.'))};document.head.appendChild(s)}));
async function fileRows(file){const n=(file.name||'').toLowerCase();
  if(/\.(xlsx|xlsm|xls|ods)$/.test(n)){const X=await loadXL(),wb=X.read(await file.arrayBuffer(),{type:'array'});
    let best=[];wb.SheetNames.forEach(sn=>{const r=X.utils.sheet_to_json(wb.Sheets[sn],{header:1,raw:false,defval:''}).filter(x=>x.some(c=>String(c).trim()));if(r.length>best.length)best=r});return best}
  if(/\.(csv|txt|tsv)$/.test(n)||/text/.test(file.type))return csvRows(await file.text());
  throw new Error('Use an Excel or CSV file. A picture or PDF won\'t read: copy the names and paste them instead.')}

/* ---------- screens (Groups page, leaders only) ---------- */
const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function open(){sheetOpen(`<b style="font-size:18px">Upload teams and players</b>
   <div class="muted">An Excel or CSV file, or paste from any sheet, email or text. You see everything before it saves.</div>
   <label class="btn block" for="upF" style="margin-top:12px;cursor:pointer"><i class="ph-bold ph-upload-simple"></i> Pick a file</label>
   <input type="file" id="upF" accept=".xlsx,.xls,.xlsm,.ods,.csv,.txt,.tsv,text/csv,text/plain" hidden>
   <div class="lbl">Or paste it here</div>
   <textarea class="field" id="upT" rows="6" placeholder="16B: John Smith, Mike Jones, Al Ruiz, Bo Kim&#10;Or copy the rows from Excel and paste them"></textarea>
   <button type="button" class="btn ghost block" id="upGo" style="margin-top:8px"><i class="ph-bold ph-magnifying-glass"></i> Read what I pasted</button>
   <p class="muted" id="upMsg" role="status" style="margin:8px 0 0;font-size:14px;min-height:1.2em"></p>
   <button type="button" class="linkbtn" id="upTpl" style="margin-top:6px"><i class="ph-bold ph-download-simple"></i> Download a blank sheet to fill in</button>`);
  const msg=$('#upMsg');
  $('#upF').onchange=async e=>{const f=e.target.files&&e.target.files[0];e.target.value='';if(!f)return;msg.textContent='Reading '+f.name+'...';
    try{show(read(await fileRows(f)),f.name)}catch(x){msg.textContent=x.message||'That file did not read. Try pasting instead.'}};
  $('#upGo').onclick=()=>{const t=$('#upT').value;if(!t.trim()){msg.textContent='Paste the names first.';return}show(read(csvRows(t)),'what you pasted')};
  $('#upTpl').onclick=()=>{const head='Group,Starting hole,Team name,Player 1,Player 2,Player 3,Player 4';
    const body=Array.from({length:18},(_,i)=>`${i+1},${i+1},,,,,`).join('\r\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+head+'\r\n'+body+'\r\n'],{type:'text/csv'}));a.download='RNGC teams and players.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000)}}

function show(groups,from,mode){
  if(!groups.length){const m=$('#upMsg');if(m)m.textContent='No player names found in '+from+'. Check it has a column of names, or paste them.';return}
  const anyHole=groups.some(g=>g.hole>=1&&g.hole<=18);mode=mode||(anyHole?'file':'shotgun');
  const teams=place(groups,mode),warn=check(teams),np=teams.reduce((a,t)=>a+t.players.length,0),had=TEAMS.reduce((a,t)=>a+t.players.length,0);
  sheetOpen(`<b style="font-size:18px">${teams.length} group${teams.length===1?'':'s'} · ${np} player${np===1?'':'s'}</b>
   <div class="muted">From ${E(from)}. Check it, then save.</div>
   ${anyHole?'':`<div class="lbl">No starting holes in it. Where do they start?</div>
    <div style="display:flex;gap:8px"><button type="button" class="btn ${mode==='shotgun'?'':'ghost'}" style="flex:1" data-upm="shotgun">Shotgun: 1, 2, 3...</button><button type="button" class="btn ${mode==='one'?'':'ghost'}" style="flex:1" data-upm="one">All on hole 1</button></div>`}
   ${warn.length?`<p style="color:#ffb3b5;margin:10px 0 0">${warn.map(E).join('<br>')}<br>Fix the sheet and upload it again.</p>`:''}
   <div style="margin-top:10px">${teams.map(t=>`<div class="fgp" style="display:block;padding:8px 4px"><b>Hole ${t.start}${E(t.id.slice(-1))}</b>${t.name?' · '+E(t.name):''}
     <div class="muted" style="font-size:14px">${t.players.map(E).join(', ')}</div></div>`).join('')}</div>
   ${had?`<p class="muted" style="font-size:14px;margin-top:10px">This replaces the ${TEAMS.length} group${TEAMS.length===1?'':'s'} there now. Players with the same name keep their check-in.</p>`:''}
   <p class="muted" id="upSv" role="status" style="font-size:14px;min-height:1.2em;margin:6px 0 0"></p>
   <button type="button" class="btn block" id="upSave" ${warn.length?'disabled':''} style="margin-top:8px"><i class="ph-bold ph-check"></i> ${had?'Replace all groups':'Save the groups'}</button>
   <button type="button" class="btn ghost block" id="upBack" style="margin-top:8px">Start over</button>`);
  document.querySelectorAll('#sheet [data-upm]').forEach(b=>b.onclick=()=>show(groups,from,b.dataset.upm));
  $('#upBack').onclick=open;
  $('#upSave').onclick=()=>save(teams)}

async function save(teams){const b=$('#upSave'),m=$('#upSv');b.disabled=true;m.textContent='Saving for every phone...';
  const byName={};TEAMS.forEach(t=>t.players.forEach(p=>{const k=low(p.name);if(!byName[k])byName[k]=p.id}));
  const seen=new Set(),mk=()=>'p'+Date.now().toString(36)+Math.floor(Math.random()*1e6).toString(36);
  const plain=teams.map(t=>({id:t.id,start:t.start,players:t.players.map(n=>{let id=byName[low(n)];if(!id||seen.has(id))id=mk();while(seen.has(id))id=mk();seen.add(id);return {id,name:n}})}));
  try{await fieldSave({teams:plain},'Groups saved for every phone')}
  catch(st){b.disabled=false;m.textContent=st===401?'Sign in first.':st===403?'Only club admins and the chapter president can do this.':st===400?'Something in the sheet did not fit. Check it and try again.':'No signal. Try again in a minute.';return}
  const named=teams.filter(t=>t.name);let ok=0,left=0;
  for(const t of named){m.textContent=`Saving team names ${ok+1} of ${named.length}...`;
    try{const j=await scCall('/event/name',{team:t.id,name:t.name});const c=REMOTE[t.id]||(REMOTE[t.id]={});if(j.name)c.name=j.name;ok++}catch(e){left=named.length-ok;break}}
  if(named.length)try{gNames()}catch(e){}
  closeSheet();if(location.hash.startsWith('#/field'))fieldPage();
  note(left?`Groups saved. ${left} team name${left===1?'':'s'} didn't save: add them in Team settings.`:`${teams.length} groups saved for every phone`)}

window.RNGCUPLOAD={open,read,place,check,csvRows,person,fileRows,MAXG,MAXP};
})();
