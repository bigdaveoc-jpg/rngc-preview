/* RNGC Fantasy League: the club's own season-long fantasy football, inside the app.
   Games > Fantasy. Loads after the main script and replaces the empty ffHTML() placeholder.

   v1 runs on DEMO data: fictional players and simulated weekly stat lines, so the whole season
   (setup, snake draft, lineups, free agents, weekly scoring, standings, playoffs) can be played
   on one phone. The scoring rules are real; only the stat lines are made up.
   Live data (real NFL players and box scores) plugs in through FF_DATA below once the club
   server caches them; see drafts/rngc/ in the BOSS repo for the plan.

   Money: the app never holds an entry pot. League dues, if any, are collected outside the app.
   Prize and sponsor slots are shown as open until the club fills them. */
(function(){
'use strict';
const KEY='rngcFF';
const POS=['QB','RB','WR','TE'];
const SLOTS=['QB','RB','RB','WR','WR','TE','FLEX'];
const FLEX_OK=['RB','WR','TE'];
const BENCH=6;
const ROUNDS=SLOTS.length+BENCH;      /* 13 */
const REG_WEEKS=14;                   /* weeks 1-14 regular season, 15 semifinal, 16 final */
const LAST_WEEK=16;
const REPL={QB:12,RB:30,WR:30,TE:12};  /* replacement level: about the last starter in a 10-12 team league */
const SCORING={
  std:{label:'Standard',rec:0},half:{label:'Half PPR',rec:0.5},ppr:{label:'Full PPR',rec:1}
};
const RULES={passYd:0.04,passTd:4,int:-2,rushYd:0.1,rushTd:6,recYd:0.1,recTd:6,fumLost:-2};
const NFL=['ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE','DAL','DEN','DET','GB','HOU','IND','JAX','KC','LV','LAC','LAR','MIA','MIN','NE','NO','NYG','NYJ','PHI','PIT','SF','SEA','TB','TEN','WSH'];
const FIRST=['Marcus','Dante','Tyrell','Cole','Jalen','Brock','Isaiah','Trey','Malik','Devin','Andre','Zeke','Rashad','Logan','Darius','Caleb','Jaylen','Hunter','Mason','Quincy','Reggie','Tavon','Cam','Elijah','Jordan','Kendall','Nico','Owen','Preston','Roman','Silas','Theo','Vince','Wes','Xavier','Bo','Ace','Duke','Gage','Kobe'];
const LAST=['Holloway','Brooks','Vance','Mercer','Okafor','Reyes','Whitfield','Stanton','Delgado','Pryor','Hawkins','Booker','Castillo','Dunham','Ellison','Fontaine','Garrity','Hale','Ibarra','Jameson','Kincaid','Lattimore','Monroe','Nash','Oakes','Pruitt','Quarles','Rivers','Sutton','Tatum','Upshaw','Vickers','Wade','Yates','Zimmer','Barlow','Crenshaw','Dorsey','Easley','Fulton'];
const BOT_TEAMS=[['Silver and Black Attack','SoCal'],['Commitment to Eagles','NorCal'],['Just Win Birdie','Nevada'],['Black Hole in One','SoCal'],['Allegiant Aces','Nevada'],['Oakland Mulligans','NorCal'],['Shotgun Start','SoCal'],['Fore the Shield','National'],['Raider Cup Runneth','Nevada'],['Gruden Grinders','SoCal'],['Sin City Sandbaggers','Nevada']];

/* ---------- small helpers ---------- */
const h=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function hash(...xs){let x=2166136261;for(const v of xs){const s=String(v);for(let i=0;i<s.length;i++){x^=s.charCodeAt(i);x=Math.imul(x,16777619)}}return x>>>0}
const r1=n=>Math.round(n*10)/10;

/* ---------- scoring (real rules) ---------- */
function score(st,ppr){
  if(!st)return 0;
  const recPt=(SCORING[ppr]||SCORING.half).rec;
  return r1((st.passYd||0)*RULES.passYd+(st.passTd||0)*RULES.passTd+(st.int||0)*RULES.int+
    (st.rushYd||0)*RULES.rushYd+(st.rushTd||0)*RULES.rushTd+
    (st.rec||0)*recPt+(st.recYd||0)*RULES.recYd+(st.recTd||0)*RULES.recTd+(st.fumLost||0)*RULES.fumLost);
}

/* ---------- demo data adapter: fictional players, simulated stat lines ---------- */
const DEMO={
  live:false,
  label:'Demo players and demo stats',
  players(seed){
    const R=rng(seed),used={},out=[];
    const counts={QB:36,RB:72,WR:90,TE:36};
    POS.forEach(p=>{for(let i=0;i<counts[p];i++){
      let n;do{n=FIRST[Math.floor(R()*FIRST.length)]+' '+LAST[Math.floor(R()*LAST.length)]}while(used[n]);used[n]=1;
      const tier=Math.pow(1-i/counts[p],1.6);              /* best players first */
      out.push({id:p+i,n,pos:p,tm:NFL[Math.floor(R()*NFL.length)],t:Math.round((0.25+0.75*tier+R()*0.08)*100)/100});
    }});
    return out;
  },
  /* one stat line for one player in one week; same inputs always give the same line */
  week(p,wk,seed){
    const R=rng(hash(seed,p.id,wk)),g=()=>Math.max(0,(R()+R()+R())/1.5),t=p.t,o={};
    if(R()<0.04)return {out:true};                         /* injured or inactive this week */
    if(p.pos==='QB'){o.passYd=Math.round((150+170*t)*g());o.passTd=Math.round((0.6+1.9*t)*g());o.int=R()<0.45?1:R()<0.12?2:0;
      o.rushYd=Math.round(18*t*g()*(R()<0.3?2:1));o.rushTd=R()<0.08*t?1:0}
    if(p.pos==='RB'){o.rushYd=Math.round((25+70*t)*g());o.rushTd=R()<0.55*t?(R()<0.25?2:1):0;o.rec=Math.round((1+3*t)*g());
      o.recYd=Math.round(o.rec*(6+R()*4));o.recTd=R()<0.1*t?1:0}
    if(p.pos==='WR'){o.rec=Math.round((2+5.5*t)*g());o.recYd=Math.round(o.rec*(10+R()*6));o.recTd=R()<0.5*t?(R()<0.2?2:1):0;
      o.rushYd=R()<0.1?Math.round(8*R()):0}
    if(p.pos==='TE'){o.rec=Math.round((1+4*t)*g());o.recYd=Math.round(o.rec*(8+R()*4));o.recTd=R()<0.35*t?1:0}
    o.fumLost=R()<0.04?1:0;
    return o;
  },
  proj(p,ppr){                                           /* season-average points, for draft ranks */
    const t=p.t,rec=(SCORING[ppr]||SCORING.half).rec;
    if(p.pos==='QB')return r1((150+170*t)*.04+(0.6+1.9*t)*4-1.1+18*t*.13+0.08*t*6);
    if(p.pos==='RB')return r1((25+70*t)*.1+0.55*t*1.25*6+(1+3*t)*(rec+0.8)+0.1*t*6);
    if(p.pos==='WR')return r1((2+5.5*t)*(rec+1.3)+0.5*t*1.2*6);
    return r1((1+4*t)*(rec+1)+0.35*t*6);
  }
};
const FF_DATA=DEMO;   /* live adapter goes here: same three functions, real players and box scores */

/* ---------- league engine ---------- */
function roundRobin(ids,weeks){
  const a=ids.slice();if(a.length%2)a.push(null);
  const n=a.length,out=[];
  for(let w=0;w<weeks;w++){
    const r=w%(n-1),rot=[a[0],...a.slice(1).map((_,i)=>a[1+((i+r)%(n-1))])],m=[];
    for(let i=0;i<n/2;i++){const x=rot[i],y=rot[n-1-i];if(x!=null&&y!=null)m.push(w%2?[y,x]:[x,y])}
    out.push(m);
  }
  return out;
}
function snakeTeam(pick,n){const rd=Math.floor(pick/n),i=pick%n;return rd%2?n-1-i:i}
function newLeague(o){
  const seed=o.seed||hash('rngc',Date.now(),Math.random());
  const size=[8,10,12].includes(+o.size)?+o.size:10;
  const teams=[{id:'t0',n:(o.team||'My Team').slice(0,28),o:(o.owner||'You').slice(0,24),ch:o.ch||'National',me:true}];
  const R=rng(seed),bots=BOT_TEAMS.slice().sort(()=>R()-.5);
  for(let i=1;i<size;i++)teams.push({id:'t'+i,n:bots[i-1][0],o:'Demo manager',ch:bots[i-1][1]});
  const order=teams.map(t=>t.id).sort(()=>R()-.5);
  return {v:1,seed,name:(o.name||'RNGC Fantasy League').slice(0,40),ppr:SCORING[o.ppr]?o.ppr:'half',
    teams,order,picks:[],rosters:Object.fromEntries(teams.map(t=>[t.id,[]])),lineups:{},
    sched:roundRobin(teams.map(t=>t.id),REG_WEEKS),week:1,results:{},playoffs:{},champ:null,log:[]};
}
let POOL=null,POOL_SEED=null;
function pool(L){if(POOL_SEED!==L.seed){POOL=FF_DATA.players(L.seed);POOL.forEach(p=>p.pj=FF_DATA.proj(p,L.ppr));
  /* rank by value over a replacement starter at the same position, the way real draft ranks work */
  const repl={};POS.forEach(x=>{const ps=POOL.filter(p=>p.pos===x).sort((a,b)=>b.pj-a.pj);repl[x]=(ps[REPL[x]]||ps[ps.length-1]).pj});
  POOL.forEach(p=>p.vor=p.pj-repl[p.pos]);POOL.sort((a,b)=>b.vor-a.vor);POOL.forEach((p,i)=>p.rk=i+1);POOL_SEED=L.seed}return POOL}
const P=(L,id)=>pool(L).find(p=>p.id===id);
const owner=(L,pid)=>Object.keys(L.rosters).find(t=>L.rosters[t].includes(pid));
const free=L=>pool(L).filter(p=>!owner(L,p.id));
const draftDone=L=>L.picks.length>=L.teams.length*ROUNDS;
const onClock=L=>draftDone(L)?null:L.order[snakeTeam(L.picks.length,L.teams.length)];
function need(L,tid,pos){
  const have=L.rosters[tid].map(id=>P(L,id).pos).filter(x=>x===pos).length;
  const cap={QB:2,RB:5,WR:5,TE:2}[pos],min={QB:1,RB:2,WR:2,TE:1}[pos];
  return have>=cap?0:have<min?1.35:1;
}
function botPick(L,tid){
  const left=ROUNDS-L.rosters[tid].length,f=free(L);
  /* make sure the starting slots can be filled before taking depth */
  const must=POS.filter(p=>{const have=L.rosters[tid].map(id=>P(L,id).pos).filter(x=>x===p).length;return have<{QB:1,RB:2,WR:2,TE:1}[p]});
  const mustN=must.reduce((s,p)=>s+({QB:1,RB:2,WR:2,TE:1}[p]-L.rosters[tid].map(id=>P(L,id).pos).filter(x=>x===p).length),0);
  const cand=mustN>=left?f.filter(p=>must.includes(p.pos)):f;
  const R=rng(hash(L.seed,'bp',L.picks.length));
  let best=null,bv=-1;cand.slice(0,40).forEach(p=>{const v=(p.vor+3)*need(L,tid,p.pos)*(0.92+R()*0.16);if(v>bv){bv=v;best=p}});
  return best||f[0];
}
function makePick(L,pid){const tid=onClock(L);if(!tid||owner(L,pid))return false;L.rosters[tid].push(pid);L.picks.push({t:tid,p:pid});return true}
function runBots(L){while(!draftDone(L)){const tid=onClock(L);if(L.teams.find(t=>t.id===tid).me)break;makePick(L,botPick(L,tid).id)}if(draftDone(L))L.teams.forEach(t=>{if(!L.lineups[t.id])L.lineups[t.id]=bestLineup(L,t.id)})}
function autoDraftMe(L){while(!draftDone(L)){const tid=onClock(L);makePick(L,botPick(L,tid).id)}L.teams.forEach(t=>{L.lineups[t.id]=bestLineup(L,t.id)})}
function bestLineup(L,tid){
  const ps=L.rosters[tid].map(id=>P(L,id)).sort((a,b)=>b.pj-a.pj),used=new Set(),slots=[];
  SLOTS.forEach(s=>{const p=ps.find(x=>!used.has(x.id)&&(s==='FLEX'?FLEX_OK.includes(x.pos):x.pos===s));slots.push(p?p.id:null);if(p)used.add(p.id)});
  return slots;
}
function fits(slot,p){return p&&(slot==='FLEX'?FLEX_OK.includes(p.pos):p.pos===slot)}
function teamPts(L,tid,wk){
  const lu=(L.results[wk]&&L.results[wk].lu&&L.results[wk].lu[tid])||L.lineups[tid]||[];
  return r1(lu.reduce((s,id)=>s+(id?score(FF_DATA.week(P(L,id),wk,L.seed),L.ppr):0),0));
}
function matchupsFor(L,wk){if(wk<=REG_WEEKS)return L.sched[wk-1]||[];return (L.playoffs[wk]||[])}
function standings(L){
  const s=Object.fromEntries(L.teams.map(t=>[t.id,{id:t.id,w:0,l:0,t:0,pf:0,pa:0}]));
  for(let wk=1;wk<=Math.min(REG_WEEKS,L.week-1);wk++){const r=L.results[wk];if(!r)continue;
    r.m.forEach(([a,b,pa,pb])=>{s[a].pf+=pa;s[b].pf+=pb;s[a].pa+=pb;s[b].pa+=pa;
      if(pa>pb){s[a].w++;s[b].l++}else if(pb>pa){s[b].w++;s[a].l++}else{s[a].t++;s[b].t++}})}
  return Object.values(s).map(x=>Object.assign(x,{pf:r1(x.pf),pa:r1(x.pa)})).sort((a,b)=>(b.w+b.t/2)-(a.w+a.t/2)||b.pf-a.pf);
}
function playWeek(L){
  if(L.champ||!draftDone(L))return;
  const wk=L.week;
  L.teams.forEach(t=>{if(!t.me)L.lineups[t.id]=bestLineup(L,t.id)});
  if(wk===REG_WEEKS+1){const st=standings(L);L.playoffs[wk]=[[st[0].id,st[3].id],[st[1].id,st[2].id]]}
  const lu=Object.fromEntries(L.teams.map(t=>[t.id,(L.lineups[t.id]||[]).slice()]));
  L.results[wk]={lu,m:[]};
  const m=matchupsFor(L,wk).map(([a,b])=>{let pa=teamPts(L,a,wk),pb=teamPts(L,b,wk);
    if(wk>REG_WEEKS&&pa===pb){const st=standings(L);if(st.findIndex(x=>x.id===a)<st.findIndex(x=>x.id===b))pa+=0.1;else pb+=0.1}  /* playoff tie: higher seed */
    return [a,b,r1(pa),r1(pb)]});
  L.results[wk].m=m;
  const top=L.teams.map(t=>[t.id,teamPts(L,t.id,wk)]).sort((x,y)=>y[1]-x[1])[0];
  L.results[wk].high=top;
  if(wk===REG_WEEKS+1)L.playoffs[wk+1]=[m.map(([a,b,pa,pb])=>pa>pb?a:b)];
  if(wk===LAST_WEEK){const [a,b,pa,pb]=m[0];L.champ=pa>pb?a:b}
  L.week=Math.min(LAST_WEEK+1,wk+1);
}
function addDrop(L,tid,addId,dropId){
  if(owner(L,addId)||!L.rosters[tid].includes(dropId))return false;
  const r=L.rosters[tid];r[r.indexOf(dropId)]=addId;
  const lu=L.lineups[tid]||[];const i=lu.indexOf(dropId);if(i>=0)lu[i]=fits(SLOTS[i],P(L,addId))?addId:null;
  L.log.unshift({wk:L.week,t:tid,add:addId,drop:dropId});return true;
}

/* expose the engine for the tests in drafts/rngc/ */
window.RNGCFF={score,roundRobin,snakeTeam,newLeague,pool,makePick,runBots,autoDraftMe,bestLineup,playWeek,standings,teamPts,addDrop,draftDone,onClock,free,owner,DEMO,SLOTS,ROUNDS,REG_WEEKS,LAST_WEEK};

/* ---------- state ---------- */
let L=null,V={tab:'team',pos:'ALL',swap:null,wk:null,fa:'ALL'};
try{const raw=localStorage.getItem(KEY);if(raw)L=JSON.parse(raw)}catch(e){L=null}
const saveL=()=>{try{L?localStorage.setItem(KEY,JSON.stringify(L)):localStorage.removeItem(KEY)}catch(e){}};
const tn=id=>(L.teams.find(t=>t.id===id)||{}).n||'';
const me=()=>L.teams.find(t=>t.me);
const rerender=()=>{if(typeof renderGames==='function')renderGames()};
const note=m=>{if(typeof toast==='function')toast(m)};

/* ---------- styles ---------- */
(function(){const s=document.createElement('style');s.textContent=`
.ffx .sponsor{display:flex;align-items:center;gap:10px;padding:10px 14px;margin-top:12px;font-size:13px;color:var(--muted);border-style:dashed}
.ffx .sponsor b{color:var(--text);font-weight:600}
.ffx .hero{margin-top:16px;padding:18px;background:linear-gradient(135deg,rgba(213,218,225,.14),rgba(213,218,225,.02) 60%),var(--panel)}
.ffx .hero h2{font-family:var(--display);font-size:30px;font-weight:800;text-transform:uppercase;line-height:1}
.ffx .hero p{color:var(--muted);margin-top:6px;font-size:15px}
.ffx .acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.ffx .perks{display:grid;gap:8px;margin-top:12px}
.ffx .perk{display:flex;gap:10px;align-items:flex-start;font-size:14px}
.ffx .perk i{font-size:20px;color:var(--silver-2)}
.ffx .perk small{display:block;color:var(--muted)}
.ffx .tag{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:2px 7px;border-radius:999px;border:1px solid var(--line);color:var(--muted);margin-left:6px;vertical-align:middle}
.ffx .slot{display:grid;grid-template-columns:52px 1fr auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--line);width:100%;text-align:left}
.ffx .slot:first-child{border-top:0}
.ffx .slot .s{font-family:var(--display);font-weight:800;font-size:15px;color:var(--muted);text-align:center;border:1px solid var(--line);border-radius:8px;padding:4px 0}
.ffx .slot.sel{background:var(--panel-2)}
.ffx .slot.can .s{border-color:var(--silver-2);color:var(--text)}
.ffx .slot b{display:block;font-size:16px;font-weight:600}
.ffx .slot small{color:var(--muted);font-size:12px}
.ffx .slot .pt{font-family:var(--display);font-weight:800;font-size:20px;text-align:right;font-variant-numeric:tabular-nums}
.ffx .slot .pt small{display:block;font-family:var(--body);font-weight:600;font-size:11px}
.ffx .clock{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:14px;margin-top:12px}
.ffx .clock b{font-family:var(--display);font-size:22px;text-transform:uppercase}
.ffx .plist{max-height:520px;overflow-y:auto}
.ffx .prow{display:grid;grid-template-columns:34px 1fr auto auto;gap:10px;align-items:center;padding:9px 0;border-top:1px solid var(--line)}
.ffx .prow:first-child{border-top:0}
.ffx .prow .rk{color:var(--muted);font-variant-numeric:tabular-nums;font-size:13px;text-align:right}
.ffx .prow b{display:block;font-weight:600}
.ffx .prow small{color:var(--muted);font-size:12px}
.ffx .prow .pj{font-variant-numeric:tabular-nums;color:var(--muted);font-size:13px}
.ffx .prow .btn{min-height:38px;padding:0 14px;font-size:14px}
.ffx .picks{display:flex;gap:6px;overflow-x:auto;padding:4px 0 8px;scrollbar-width:none}
.ffx .picks .pk{flex:none;min-width:120px;padding:8px 10px;font-size:12px}
.ffx .picks .pk b{display:block;font-size:14px}
.ffx .picks .pk.mine{border-color:var(--silver-2)}
.ffx .champ{text-align:center;padding:22px 14px;margin-top:12px;background:linear-gradient(135deg,rgba(213,218,225,.22),rgba(213,218,225,.04) 70%),var(--panel)}
.ffx .champ i{font-size:44px}
.ffx .champ b{display:block;font-family:var(--display);font-size:28px;text-transform:uppercase;margin-top:6px}
.ffx .wkbar{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:8px 0}
.ffx .wkbar .chip{min-height:36px}
.ffx .grid2{display:grid;gap:12px}
@media (min-width:900px){.ffx .grid2{grid-template-columns:1fr 1fr}}
.ffx select.field{appearance:none}
.ffx .ftable td b{font-size:16px}
@media (max-width:520px){.ffx .ftable .pa{display:none}}
.ffx label.lb{display:block;font-size:13px;color:var(--muted);margin:12px 0 6px;font-weight:600}
`;document.head.appendChild(s)})();

/* ---------- views ---------- */
const sponsorBar=()=>`<div class="card sponsor"><i class="ph-bold ph-megaphone"></i><span><b>League sponsor slot open.</b> A club partner's name goes here, on the weekly high-score prize and on the trophy.</span></div>`;
const demoNote=()=>`<div class="card privacy"><i class="ph-bold ph-info"></i><span>${h(FF_DATA.label)}. Saved on this phone only until the club database is built. The app never holds league money: dues and prizes, if any, are set by the commissioner and handled outside the app.</span></div>`;

function landing(){
  return `<div class="ffx">
   <div class="card hero"><h2>RNGC Fantasy League</h2>
    <p>The club's own fantasy football, right here next to the Raiders schedule. Draft against other members, set your lineup each week, and play for the Raider Bowl.</p>
    <div class="acts"><button class="btn" data-ff="setup"><i class="ph-bold ph-play"></i> Start a demo league</button>
    <button class="btn ghost ${S.ffJoin?'on':''}" id="ffJoin">${S.ffJoin?'<i class="ph-bold ph-check"></i> On the list for 2027':'<i class="ph-bold ph-plus"></i> Join the 2027 club league'}</button></div></div>
   <h2 class="sec">How it works</h2>
   <div class="card perks">
    <div class="perk"><i class="ph-bold ph-users-three"></i><span>8, 10 or 12 teams, one per member<small>Chapters can run their own league; the best chapter teams meet in the club playoff.</small></span></div>
    <div class="perk"><i class="ph-bold ph-shuffle"></i><span>Snake draft, 13 rounds<small>QB, 2 RB, 2 WR, TE, FLEX and 6 bench. Auto-pick if you step away.</small></span></div>
    <div class="perk"><i class="ph-bold ph-chart-line-up"></i><span>Half PPR by default<small>Standard and full PPR too. 14-week season, top 4 make the playoffs, final in week 16.</small></span></div>
    <div class="perk"><i class="ph-bold ph-trophy"></i><span>Raider Bowl<small>Weekly high score and the champion get the prize the commissioner sets.</small></span></div>
   </div>
   ${sponsorBar()}${demoNote()}</div>`;
}
function setupSheet(){
  const nm=(typeof S!=='undefined'&&S.name)||'';
  openSheet(`<h2 class="sec" style="margin-top:6px">New demo league</h2><p class="sub">Fictional players, simulated weeks. Takes about two minutes to play a full season.</p>
   <div class="ffx"><label class="lb" for="ffN">League name</label><input class="field" id="ffN" maxlength="40" value="RNGC Fantasy League">
   <label class="lb" for="ffT">Your team name</label><input class="field" id="ffT" maxlength="28" value="${h(nm?nm.split(' ')[0]+'\'s Raiders':'Just Win Baby')}">
   <label class="lb" for="ffS">Teams</label><select class="field" id="ffS"><option>8</option><option selected>10</option><option>12</option></select>
   <label class="lb" for="ffP">Scoring</label><select class="field" id="ffP">${Object.entries(SCORING).map(([k,v])=>`<option value="${k}" ${k==='half'?'selected':''}>${v.label}</option>`).join('')}</select>
   <div class="acts"><button class="btn full" data-ff="create" style="width:100%"><i class="ph-bold ph-shuffle"></i> Go to the draft</button></div></div>`);
}
function draftView(){
  const n=L.teams.length,pk=L.picks.length,tid=onClock(L),mine=me().id===tid,rd=Math.floor(pk/n)+1;
  const f=free(L).filter(p=>V.pos==='ALL'||p.pos===V.pos).slice(0,60);
  const posChip=k=>`<button class="chip" data-ffpos="${k}" aria-pressed="${V.pos===k}">${k==='ALL'?'All':k}</button>`;
  const recent=L.picks.slice(-n).reverse();
  const myR=L.rosters[me().id].map(id=>P(L,id));
  return `<div class="ffx"><div class="card clock"><div><small class="sub" style="margin:0;display:block">Round ${rd} of ${ROUNDS} - pick ${pk+1} of ${n*ROUNDS}</small><b>${mine?'You are on the clock':h(tn(tid))+' is picking'}</b></div>
    <div class="acts" style="margin:0"><button class="btn small ghost" data-ff="autodraft"><i class="ph-bold ph-lightning"></i> Auto-draft the rest</button></div></div>
   ${recent.length?`<div class="picks">${recent.map(x=>{const p=P(L,x.p);return `<div class="card pk ${x.t===me().id?'mine':''}"><b>${h(p.n)}</b>${p.pos} ${p.tm}<br><small>${h(tn(x.t))}</small></div>`}).join('')}</div>`:''}
   <div class="grid2"><div><div class="seg" style="margin-top:4px">${['ALL',...POS].map(posChip).join('')}</div>
    <div class="card plist" style="margin-top:10px">${f.map(p=>`<div class="prow"><span class="rk">${p.rk}</span><span><b>${h(p.n)}</b><small>${p.pos} - ${p.tm}</small></span><span class="pj">${p.pj.toFixed(1)}</span>
     <button class="btn small ${mine?'':'ghost'}" data-ffdraft="${p.id}" ${mine?'':'disabled'}>Draft</button></div>`).join('')}</div>
    <p class="sub" style="margin-top:8px">Number on the right: average points a week, ${h(SCORING[L.ppr].label)}.</p></div>
   <div><h2 class="sec" style="margin-top:4px">Your roster <span class="tag">${myR.length}/${ROUNDS}</span></h2>
    <div class="card">${myR.length?myR.map(p=>`<div class="prow"><span class="rk">${p.pos}</span><span><b>${h(p.n)}</b><small>${p.tm}</small></span><span class="pj">${p.pj.toFixed(1)}</span><span></span></div>`).join(''):'<p class="sub" style="margin:0">No picks yet. Need 1 QB, 2 RB, 2 WR and 1 TE to start.</p>'}</div></div></div>
   ${demoNote()}</div>`;
}
function weekLabel(wk){return wk<=REG_WEEKS?'Week '+wk:wk===REG_WEEKS+1?'Semifinal':'Raider Bowl'}
function teamView(){
  const t=me(),wk=Math.min(L.week,LAST_WEEK),played=!!L.results[wk];
  const lu=L.lineups[t.id]||bestLineup(L,t.id);L.lineups[t.id]=lu;
  const bench=L.rosters[t.id].filter(id=>!lu.includes(id));
  const row=(slot,id,i,isBench)=>{const p=id?P(L,id):null;
    const sel=V.swap&&((V.swap.i===i&&!isBench)||(V.swap.b===id&&isBench));
    const can=V.swap&&!sel&&(isBench?(V.swap.i!=null&&fits(SLOTS[V.swap.i],p)):(V.swap.b!=null&&fits(slot,P(L,V.swap.b))));
    const st=p&&L.week>1?FF_DATA.week(p,L.week-1,L.seed):null;
    return `<button class="slot ${sel?'sel':''} ${can?'can':''}" ${isBench?`data-ffb="${id}"`:`data-ffs="${i}"`}><span class="s">${isBench?'BN':slot}</span>
     <span>${p?`<b>${h(p.n)}</b><small>${p.pos} - ${p.tm} - avg ${p.pj.toFixed(1)}</small>`:'<b>Empty</b><small>Tap a bench player to fill</small>'}</span>
     <span class="pt">${p&&st?score(st,L.ppr).toFixed(1):''}<small>${p&&st?'last wk':''}</small></span></button>`};
  return `<div class="ffx"><div class="tixhead" style="margin-top:14px"><div><h2 class="sec" style="margin:0">${h(t.n)}</h2><p class="sub" style="margin:2px 0 0">${L.champ?'Season over':weekLabel(wk)+' lineup'} - tap a starter, then a bench player to swap</p></div>
   <div class="acts" style="margin:0"><button class="btn small ghost" data-ff="best"><i class="ph-bold ph-magic-wand"></i> Best lineup</button></div></div>
   <div class="card">${SLOTS.map((s,i)=>row(s,lu[i],i,false)).join('')}</div>
   <h2 class="sec">Bench</h2><div class="card">${bench.map(id=>row('BN',id,null,true)).join('')||'<p class="sub" style="margin:0">Empty bench</p>'}</div>
   ${played?'':''}${demoNote()}</div>`;
}
function matchupView(){
  const last=Math.max(1,Math.min(L.week-1,LAST_WEEK)),wk=V.wk||last;
  const ms=L.results[wk]?L.results[wk].m:matchupsFor(L,wk).map(([a,b])=>[a,b,null,null]);
  const mine=ms.find(m=>m[0]===me().id||m[1]===me().id);
  const wkChip=w=>`<button class="chip" data-ffwk="${w}" aria-pressed="${w===wk}">${w<=REG_WEEKS?'Wk '+w:w===REG_WEEKS+1?'Semis':'Final'}</button>`;
  const avail=[];for(let w=1;w<=Math.min(LAST_WEEK,Math.max(L.week,1));w++)if(w<=REG_WEEKS||L.playoffs[w])avail.push(w);
  const side=(tid,pts)=>{const lu=(L.results[wk]&&L.results[wk].lu[tid])||L.lineups[tid]||[];
    return `<div class="card"><h3 class="cardh" style="margin:0 0 6px">${h(tn(tid))} <span class="tag">${pts==null?'proj':pts.toFixed(1)}</span></h3>${SLOTS.map((s,i)=>{const p=lu[i]?P(L,lu[i]):null;const st=p&&L.results[wk]?FF_DATA.week(p,wk,L.seed):null;
      return `<div class="slot"><span class="s">${s}</span><span><b>${p?h(p.n):'Empty'}</b><small>${p?statLine(p,st):''}</small></span><span class="pt">${st?score(st,L.ppr).toFixed(1):p?p.pj.toFixed(1):''}<small>${st?'':'proj'}</small></span></div>`}).join('')}</div>`};
  const high=L.results[wk]&&L.results[wk].high;
  return `<div class="ffx"><div class="wkbar">${avail.map(wkChip).join('')}</div>
   ${high?`<div class="card sponsor"><i class="ph-bold ph-medal"></i><span><b>${weekLabel(wk)} high score: ${h(tn(high[0]))}, ${high[1].toFixed(1)}.</b> Weekly prize slot open for a sponsor.</span></div>`:''}
   ${mine?`<div class="grid2" style="margin-top:12px">${side(mine[0],mine[2])}${side(mine[1],mine[3])}</div>`:`<p class="sub" style="margin-top:12px">${wk>REG_WEEKS?'Your season ended. Playoff games below.':'No game this week.'}</p>`}
   <h2 class="sec">All ${weekLabel(wk)} games</h2><div class="gstack">${ms.map(([a,b,pa,pb])=>`<div class="card mu"><div class="side"><b>${h(tn(a))}</b></div><div class="pts">${pa==null?'vs':pa.toFixed(1)+'-'+pb.toFixed(1)}<small>${pa==null?'upcoming':'final'}</small></div><div class="side r"><b>${h(tn(b))}</b></div></div>`).join('')||'<p class="sub">Set after the regular season.</p>'}</div></div>`;
}
function statLine(p,st){
  if(!st)return p.pos+' - '+p.tm;if(st.out)return 'Out this week';const b=[];
  if(st.passYd)b.push(st.passYd+' pass yds');if(st.passTd)b.push(st.passTd+' pass TD');if(st.int)b.push(st.int+' INT');
  if(st.rushYd)b.push(st.rushYd+' rush yds');if(st.rushTd)b.push(st.rushTd+' rush TD');if(st.rec)b.push(st.rec+' rec, '+(st.recYd||0)+' yds');if(st.recTd)b.push(st.recTd+' rec TD');if(st.fumLost)b.push('fumble lost');
  return b.join(', ')||'No stats';
}
function standingsView(){
  const st=standings(L);
  return `<div class="ffx"><div class="card" style="padding:4px 10px;margin-top:14px"><table class="ftable"><thead><tr><th>#</th><th>Team</th><th class="num">W-L</th><th class="num">PF</th><th class="num pa">PA</th></tr></thead><tbody>
   ${st.map((x,i)=>{const t=L.teams.find(y=>y.id===x.id);return `<tr class="${i===3?'cut':''} ${t.me?'me':''}"><td class="n">${i+1}</td><td><b>${h(t.n)}</b><small>${h(t.o)} - ${h(t.ch)}</small></td><td class="num">${x.w}-${x.l}${x.t?'-'+x.t:''}</td><td class="num">${x.pf.toFixed(1)}</td><td class="num pa">${x.pa.toFixed(1)}</td></tr>`}).join('')}
   </tbody></table></div><p class="sub" style="margin-top:8px">Top 4 after week ${REG_WEEKS} make the playoffs. Ties broken by points for.</p></div>`;
}
function faView(){
  const t=me(),f=free(L).filter(p=>V.fa==='ALL'||p.pos===V.fa).slice(0,40);
  const posChip=k=>`<button class="chip" data-fffa="${k}" aria-pressed="${V.fa===k}">${k==='ALL'?'All':k}</button>`;
  const mine=L.rosters[t.id].map(id=>P(L,id));
  if(V.add){const a=P(L,V.add);return `<div class="ffx"><h2 class="sec">Add ${h(a.n)} (${a.pos}). Drop who?</h2><div class="card">${mine.map(p=>`<div class="prow"><span class="rk">${p.pos}</span><span><b>${h(p.n)}</b><small>${p.tm} - avg ${p.pj.toFixed(1)}</small></span><span></span><button class="btn small ghost" data-ffdrop="${p.id}">Drop</button></div>`).join('')}</div>
   <div class="acts"><button class="btn ghost" data-ff="cancel">Cancel</button></div></div>`}
  return `<div class="ffx"><div class="seg">${['ALL',...POS].map(posChip).join('')}</div>
   <div class="card plist" style="margin-top:10px">${f.map(p=>`<div class="prow"><span class="rk">${p.rk}</span><span><b>${h(p.n)}</b><small>${p.pos} - ${p.tm}</small></span><span class="pj">${p.pj.toFixed(1)}</span><button class="btn small ghost" data-ffadd="${p.id}">Add</button></div>`).join('')}</div>
   ${L.log.length?`<h2 class="sec">League moves</h2><div class="card">${L.log.slice(0,8).map(x=>`<div class="prow"><span class="rk">W${x.wk}</span><span><b>${h(tn(x.t))}</b><small>Added ${h(P(L,x.add).n)}, dropped ${h(P(L,x.drop).n)}</small></span><span></span><span></span></div>`).join('')}</div>`:''}</div>`;
}
function seasonView(){
  const tabs=[['team','user-circle','My team'],['match','sword','Matchup'],['stand','list-numbers','Standings'],['fa','user-plus','Free agents']];
  const body=V.tab==='match'?matchupView():V.tab==='stand'?standingsView():V.tab==='fa'?faView():teamView();
  const st=standings(L),myRank=st.findIndex(x=>x.id===me().id)+1,myRec=st.find(x=>x.id===me().id);
  const champ=L.champ?`<div class="ffx"><div class="card champ"><i class="ph-fill ph-trophy"></i><b>${h(tn(L.champ))}</b><span class="sub">Raider Bowl champion${L.champ===me().id?'. That is you.':''}</span></div></div>`:'';
  const next=L.champ?'':`<button class="btn small" data-ff="play"><i class="ph-bold ph-play"></i> Play ${weekLabel(L.week)}</button><button class="btn small ghost" data-ff="simall"><i class="ph-bold ph-fast-forward"></i> Sim to the end</button>`;
  return `<div class="ffx"><div class="tixhead" style="margin-top:16px"><div><h2 class="sec" style="margin:0">${h(L.name)}</h2>
    <p class="sub" style="margin:2px 0 0">${h(me().n)} - ${myRec.w}-${myRec.l}${myRec.t?'-'+myRec.t:''}, ${ordinal(myRank)} of ${L.teams.length} - ${h(SCORING[L.ppr].label)} <span class="tag">Demo</span></p></div>
    <div class="acts" style="margin:0">${next}<button class="btn small ghost" data-ff="reset" title="Delete this demo league"><i class="ph-bold ph-trash"></i></button></div></div>
   ${champ}<div class="seg2" role="tablist">${tabs.map(([k,ic,t])=>`<button class="chip" data-fftab="${k}" aria-pressed="${V.tab===k}"><i class="ph-bold ph-${ic}"></i> ${t}</button>`).join('')}</div></div>${body}<div class="ffx">${sponsorBar()}</div>`;
}
const ordinal=n=>n+(['th','st','nd','rd'][(n%100-20)%10]||['th','st','nd','rd'][n%100]||'th');

/* replaces the placeholder in index.html */
window.ffHTML=function(){
  if(!L)return landing();
  try{pool(L);return draftDone(L)?seasonView():draftView()}
  catch(e){L=null;saveL();return landing()}
};

/* ---------- clicks ---------- */
document.addEventListener('click',e=>{
  const t=e.target;
  const a=t.closest('[data-ff]');
  if(a){const k=a.dataset.ff;
    if(k==='setup'){setupSheet();return}
    if(k==='create'){L=newLeague({name:$('#ffN').value.trim(),team:$('#ffT').value.trim(),size:$('#ffS').value,ppr:$('#ffP').value,owner:(S.name||'You'),ch:S.chapter&&S.chapter!=='All'?S.chapter:'National'});
      runBots(L);saveL();closeSheet();V={tab:'team',pos:'ALL',swap:null,wk:null,fa:'ALL'};rerender();note('Draft order set. '+(onClock(L)===me().id?'You pick first.':'Bots picked up to your turn.'));return}
    if(k==='autodraft'){autoDraftMe(L);saveL();rerender();note('Draft done. Lineup set to your best players.');return}
    if(k==='best'){L.lineups[me().id]=bestLineup(L,me().id);V.swap=null;saveL();rerender();note('Best lineup set');return}
    if(k==='play'){const wk=L.week;playWeek(L);saveL();V.tab='match';V.wk=wk;rerender();const r=L.results[wk];const m=r&&r.m.find(x=>x[0]===me().id||x[1]===me().id);
      if(m){const mine=m[0]===me().id?m[2]:m[3],them=m[0]===me().id?m[3]:m[2];note((mine>them?'Win':'Loss')+' '+mine.toFixed(1)+' to '+them.toFixed(1))}else note(weekLabel(wk)+' played');return}
    if(k==='simall'){while(!L.champ)playWeek(L);saveL();V.tab='stand';rerender();note('Season over. Champion: '+tn(L.champ));return}
    if(k==='reset'){if(confirm('Delete this demo league?')){L=null;saveL();rerender()}return}
    if(k==='cancel'){V.add=null;rerender();return}
  }
  const pos=t.closest('[data-ffpos]');if(pos){V.pos=pos.dataset.ffpos;rerender();return}
  const fa=t.closest('[data-fffa]');if(fa){V.fa=fa.dataset.fffa;rerender();return}
  const tb=t.closest('[data-fftab]');if(tb){V.tab=tb.dataset.fftab;V.swap=null;V.add=null;V.wk=null;rerender();return}
  const wk=t.closest('[data-ffwk]');if(wk){V.wk=+wk.dataset.ffwk;rerender();return}
  const dr=t.closest('[data-ffdraft]');if(dr&&L){if(onClock(L)!==me().id)return;makePick(L,dr.dataset.ffdraft);runBots(L);saveL();rerender();if(draftDone(L))note('Draft done. Lineup set to your best players.');return}
  const ad=t.closest('[data-ffadd]');if(ad){V.add=ad.dataset.ffadd;rerender();return}
  const dp=t.closest('[data-ffdrop]');if(dp&&V.add){const ok=addDrop(L,me().id,V.add,dp.dataset.ffdrop);const n=P(L,V.add).n;V.add=null;saveL();rerender();note(ok?'Added '+n:'That player was just taken');return}
  const sl=t.closest('[data-ffs]'),bn=t.closest('[data-ffb]');
  if((sl||bn)&&L){const lu=L.lineups[me().id];
    if(sl){const i=+sl.dataset.ffs;
      if(V.swap&&V.swap.b!=null){const p=P(L,V.swap.b);if(fits(SLOTS[i],p)){lu[i]=V.swap.b;V.swap=null;saveL()}else note(p.pos+' cannot play '+SLOTS[i])}
      else if(V.swap&&V.swap.i!=null&&V.swap.i!==i){const x=lu[V.swap.i],y=lu[i];if((!y||fits(SLOTS[V.swap.i],P(L,y)))&&(!x||fits(SLOTS[i],P(L,x)))){lu[V.swap.i]=y;lu[i]=x;saveL()}else note('Those two cannot trade spots');V.swap=null}
      else V.swap=V.swap&&V.swap.i===i?null:{i};}
    else{const id=bn.dataset.ffb;
      if(V.swap&&V.swap.i!=null){const p=P(L,id);if(fits(SLOTS[V.swap.i],p)){lu[V.swap.i]=id;V.swap=null;saveL()}else note(p.pos+' cannot play '+SLOTS[V.swap.i])}
      else V.swap=V.swap&&V.swap.b===id?null:{b:id};}
    rerender();return}
});
})();
