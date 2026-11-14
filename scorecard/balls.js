/* Ball marks (David, Nov 14 2026): "when finding your ball, make it easy to mark via GPS where the ball landed and keep a
   history of where my balls land to find patterns".

   On the hole screen: one tap on Mark my ball when you walk up to it. The phone's GPS spot is saved with the distance
   from where the shot started (the tee for the first mark on a hole, your last mark after that), how far left or right
   of the line to the middle of the green it finished, the yards left, and the lie read off the hole map. Tap the club
   if you want, or skip it. The marks stay on this phone with My golf.
   My golf > Where my ball goes: drives, the usual miss, approaches short or long, yards by club, each hole's map with
   your balls on it, and the recent list. Loads after tracker.js. */
(function(){
'use strict';
const MAX=3000,SESSION_MS=45*60e3,FW_HALF=15;
const CLUBS=[['dr','Driver'],['w','Wood'],['hy','Hybrid'],['li','4-5 iron'],['mi','6-7 iron'],['si','8-9 iron'],['wg','Wedge']];
const LIES={fairway:'Fairway',rough:'Rough',bunker:'Bunker',green:'Green',water:'Water',tee:'Tee box'};
const LIE_C={fairway:'#62c184',rough:'#c9a27a',bunker:'#e4d6ac',green:'#9be3a6',water:'#5aa0e6',tee:'#9aa2ae'};
const clubName=k=>(CLUBS.find(c=>c[0]===k)||[,''])[1];
const list=()=>G.balls||(G.balls=[]);
const courseId=()=>{try{return EV().course||''}catch(e){return''}};
const mapOf=n=>{try{const c=CO();return c&&c.maps&&c.maps[n]||null}catch(e){return null}};
const r0=v=>Math.round(v);
const side=v=>Math.abs(v)<1?'center':r0(Math.abs(v))+(v>0?' R':' L');
const sideW=v=>Math.abs(v)<1?'dead center':r0(Math.abs(v))+' yds '+(v>0?'right':'left');
const dayOf=t=>new Date(t).toLocaleDateString('en-US',{month:'short',day:'numeric'});
const H=s=>esc(String(s));

/* ---------- geometry on the hole map (map units are meters; YD turns them into yards) ---------- */
function teeStart(n,m){const pts=m.line.split(' ').map(p=>p.split(',').map(Number)),t=pts[0],g=m.greenAt;
  const ty=(TEE().y||[])[n-1]||m.yd,shift=(m.yd-ty)/YD,dx=g[0]-t[0],dy=g[1]-t[1],L=Math.hypot(dx,dy)||1;
  return[t[0]+dx/L*shift,t[1]+dy/L*shift]}
let ctx=null;
function lieAt(m,x,y){try{ctx=ctx||document.createElement('canvas').getContext('2d');const hit=k=>m.shapes.some(([kk,d])=>kk===k&&ctx.isPointInPath(new Path2D(d),x,y,'evenodd'));
  for(const k of['water','bunker','green','tee','fairway'])if(hit(k))return k}catch(e){}return 'rough'}
function measure(o,p,g){const ax=g[0]-o[0],ay=g[1]-o[1],A=Math.hypot(ax,ay)||1,ux=ax/A,uy=ay/A,vx=p[0]-o[0],vy=p[1]-o[1];
  return{d:Math.hypot(vx,vy)*YD,off:(vx*-uy+vy*ux)*YD,long:(vx*ux+vy*uy-A)*YD,tg:Math.hypot(g[0]-p[0],g[1]-p[1])*YD,aim:A*YD}}
function session(n){const c=courseId(),b=list();let last=null;
  for(let i=b.length-1;i>=0;i--)if(b[i].c===c){last=b[i];break}
  if(!last||last.h!==n||Date.now()-last.t>=SESSION_MS)return[];
  return b.filter(x=>x.c===c&&x.h===n&&x.k===last.k)}

/* ---------- the GPS fix: use the hole screen's if it's fresh and sharp, otherwise ask the phone ---------- */
function getFix(){const f=window.RNGC_FIX;if(f&&Date.now()-f.t<8000&&f.acc<=12)return Promise.resolve(f);
  return new Promise((ok,no)=>{if(!('geolocation'in navigator)){no(new Error('This phone has no GPS in the browser.'));return}
    navigator.geolocation.getCurrentPosition(p=>{const fx={lat:p.coords.latitude,lng:p.coords.longitude,acc:p.coords.accuracy,t:Date.now()};window.RNGC_FIX=fx;ok(fx)},
      e=>no(new Error(e.code===1?'Location is off for this page. Turn it on in your phone settings to mark balls.':'No GPS signal yet. Try again in a moment.')),
      {enableHighAccuracy:true,maximumAge:0,timeout:15000})})}

async function mark(n,btn){const m=mapOf(n);if(!m||!m.tc)return;
  if(btn){btn.disabled=true;btn.innerHTML='<i class="ph-bold ph-crosshair"></i> Finding your ball...'}
  try{const f=await getFix(),p=holeLocal(m,f.lat,f.lng);if(!p)throw new Error('This hole has no map spot to measure from.');
    const g=m.greenAt,ty=(TEE().y||[])[n-1]||m.yd,fromG=Math.hypot(g[0]-p[0],g[1]-p[1])*YD;
    if(fromG>Math.max(ty,m.yd)+90)throw new Error(fromG>3000?`GPS shows you're not at the course, so nothing was saved. Mark it when you're standing at your ball on hole ${n}.`:`GPS puts you about ${r0(fromG)} yds from the hole ${n} green, so it isn't saved. Mark it once you're at your ball on hole ${n}.`);
    const prev=session(n),last=prev[prev.length-1],o=last?[last.x,last.y]:teeStart(n,m),me=measure(o,p,g);
    const b={id:'b'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),c:courseId(),h:n,par:CO().par[n-1],k:last?last.k:Date.now().toString(36),
      shot:prev.length+1,t:Date.now(),lat:+f.lat.toFixed(7),lng:+f.lng.toFixed(7),acc:r0(f.acc*YD),ox:+o[0].toFixed(1),oy:+o[1].toFixed(1),x:+p[0].toFixed(1),y:+p[1].toFixed(1),
      d:r0(me.d),off:+me.off.toFixed(1),long:+me.long.toFixed(1),tg:r0(me.tg),aim:r0(me.aim),lie:lieAt(m,p[0],p[1]),club:null,wx:typeof wxNow==='function'?wxNow(n):null};
    list().push(b);if(list().length>MAX)G.balls=list().slice(-MAX);gsave();
    if(navigator.vibrate)try{navigator.vibrate(18)}catch(e){}
    sheet(b);refreshCard(n)}
  catch(err){if(btn){btn.disabled=false;btn.innerHTML=btnLabel()}alertBox(err.message)}}
const btnLabel=()=>'<i class="ph-fill ph-map-pin-plus"></i> Mark my ball';
function alertBox(t){const s=$('#sheet');s.innerHTML=`<div class="grab"></div><h2 style="font-size:24px;margin:0 0 6px">Ball not marked</h2><p class="muted" style="margin:0 0 14px">${H(t)}</p><button class="btn block" id="bkOk">OK</button>`;trOpen();$('#bkOk').onclick=closeSheet}

/* the sheet right after a mark: the numbers, the lie (fix it if the map got it wrong) and the club (optional) */
function sheet(b){const s=$('#sheet');
  const draw=()=>{s.innerHTML=`<div class="grab"></div><div style="display:flex;align-items:baseline;gap:10px"><h2 style="font-size:26px;margin:0">Ball marked</h2><span class="muted">Hole ${b.h} · shot ${b.shot}</span></div>
   <div class="bknums"><div><b>${b.d}</b><span>Yards</span></div><div><b>${side(b.off)}</b><span>${b.shot===1&&b.par>=4?'Off the line':'Left / right'}</span></div><div><b>${b.tg}</b><span>To the middle</span></div></div>
   <p class="muted bksrc">${b.shot===1?'From the tee':'From your last ball'}${b.acc>=4?' · GPS give or take '+b.acc+' yds':''}</p>
   <div class="lbl" style="margin-top:12px">Lie</div><div class="bkchips">${Object.keys(LIES).filter(k=>k!=='tee').map(k=>`<button class="chip2" data-bklie="${k}" aria-pressed="${b.lie===k}">${LIES[k]}</button>`).join('')}</div>
   <div class="lbl">Club <span style="text-transform:none;letter-spacing:0;font-weight:500">optional</span></div><div class="bkchips">${CLUBS.map(([k,l])=>`<button class="chip2" data-bkclub="${k}" aria-pressed="${b.club===k}">${l}</button>`).join('')}</div>
   <div class="bkacts"><button class="btn ghost" id="bkUndo"><i class="ph-bold ph-arrow-counter-clockwise"></i> Undo</button><button class="btn" id="bkDone">Done</button></div>`;
    s.querySelectorAll('[data-bklie]').forEach(x=>x.onclick=()=>{b.lie=x.dataset.bklie;gsave();draw()});
    s.querySelectorAll('[data-bkclub]').forEach(x=>x.onclick=()=>{b.club=b.club===x.dataset.bkclub?null:x.dataset.bkclub;gsave();draw()});
    $('#bkUndo').onclick=()=>{G.balls=list().filter(x=>x!==b);gsave();closeSheet();refreshCard(b.h)};
    $('#bkDone').onclick=()=>{closeSheet();refreshCard(b.h)}};
  draw();trOpen()}

/* ---------- on the hole screen ---------- */
window.ballCard=function(n){const m=mapOf(n);if(!m||!m.tc)return'';const ss=session(n);
  return `<section class="card ballc" id="ballc"><button class="btn block bkgo" data-ballmark="${n}">${btnLabel()}</button>
   ${ss.length?`<div class="bkrow">${ss.map(b=>`<span><b>${b.shot}</b> ${b.d} yds · ${side(b.off)} · ${H(LIES[b.lie]||'')}${b.club?' · '+H(clubName(b.club)):''}</span>`).join('')}</div>`
     :`<p class="muted bkhint">At your ball, tap it. Distance, left or right and the lie get saved.</p>`}
   <a class="bklink" href="#/balls"><i class="ph-bold ph-chart-scatter"></i> Where my ball goes</a></section>`};
function refreshCard(n){const c=$('#ballc');if(c){const w=document.createElement('div');w.innerHTML=window.ballCard(n);if(w.firstElementChild)c.replaceWith(w.firstElementChild)}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-ballmark]');if(b){e.preventDefault();mark(+b.dataset.ballmark,b)}});

/* your balls on the big hole map: this round's shots joined up, older ones faint */
window.ballDots=function(n,mini){const c=courseId(),ss=session(n),cur=new Set(ss.map(b=>b.id));
  const old=list().filter(b=>b.c===c&&b.h===n&&!cur.has(b.id)).slice(-60);let o='';const r=mini?9:3.2;
  for(const b of old)o+=`<circle cx="${b.x}" cy="${b.y}" r="${r}" fill="${LIE_C[b.lie]||'#fff'}" fill-opacity=".55" stroke="#0a0b0d" stroke-width="${mini?2.5:.8}"/>`;
  for(const b of ss)o+=`<line x1="${b.ox}" y1="${b.oy}" x2="${b.x}" y2="${b.y}" stroke="#fff" stroke-width="1.3" stroke-dasharray="3 3"/><circle cx="${b.x}" cy="${b.y}" r="${r+1}" fill="#fff" stroke="#0a0b0d" stroke-width="1.2"/>`;
  return o};

/* ---------- My golf > Where my ball goes ---------- */
const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
function missLine(xs,what,fix){const n=xs.length;if(n<4)return'';const R=xs.filter(v=>v>5).length,L=xs.filter(v=>v<-5).length;
  const big=R>=L?['right',R,avg(xs.filter(v=>v>5))]:['left',L,-avg(xs.filter(v=>v<-5))];if(big[1]<n*.5)return`<p class="bkpat"><i class="ph-bold ph-check-circle"></i><span>No strong left or right pattern on ${what} yet. Misses split ${L} left, ${R} right, ${n-L-R} on line.</span></p>`;
  return `<p class="bkpat"><i class="ph-bold ph-arrow-${big[0]==='right'?'right':'left'}"></i><span><b>${big[1]} of ${n} ${what} finish ${big[0]}</b>, about ${r0(big[2])} yds on average.${fix?' '+fix.replace('{s}',big[0]==='right'?'left':'right'):''}</span></p>`}
function plot(sh){const W=320,Hh=250,maxD=Math.max(...sh.map(b=>b.d),200),minD=Math.min(...sh.map(b=>b.d),maxD-120),lo=Math.max(0,Math.floor((minD-20)/50)*50),hi=Math.ceil((maxD+10)/50)*50,X=v=>W/2+Math.max(-60,Math.min(60,v))/60*(W/2-16),Y=d=>Hh-14-(d-lo)/(hi-lo)*(Hh-30);
  let g=`<rect x="${X(-FW_HALF)}" y="0" width="${X(FW_HALF)-X(-FW_HALF)}" height="${Hh}" fill="var(--rough)" opacity=".9"/><line x1="${W/2}" y1="0" x2="${W/2}" y2="${Hh}" stroke="var(--muted)" stroke-dasharray="4 4" stroke-width="1"/>`;
  for(let d=lo;d<=hi;d+=50)g+=`<line x1="0" y1="${Y(d)}" x2="${W}" y2="${Y(d)}" stroke="var(--line)"/><text x="4" y="${Y(d)-3}" font-size="11" fill="var(--muted)">${d}</text>`;
  g+=`<text x="${W-4}" y="${Hh-4}" font-size="11" fill="var(--muted)" text-anchor="end">right</text><text x="${18}" y="${Hh-4}" font-size="11" fill="var(--muted)">left</text>`;
  for(const b of sh)g+=`<circle cx="${X(b.off)}" cy="${Y(b.d)}" r="5" fill="${LIE_C[b.lie]||'#fff'}" stroke="#0a0b0d" stroke-width="1.2"/>`;
  const ax=X(avg(sh.map(b=>b.off))),ay=Y(avg(sh.map(b=>b.d)));g+=`<circle cx="${ax}" cy="${ay}" r="9" fill="none" stroke="var(--silver)" stroke-width="2"/>`;
  return `<svg class="bkplot" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Where your drives finish: distance up, left and right across">${g}</svg>`}
const legend=()=>`<div class="bkleg">${['fairway','rough','bunker','green','water'].map(k=>`<span><i style="background:${LIE_C[k]}"></i>${LIES[k]}</span>`).join('')}<span><i class="ring"></i>Your average</span></div>`;
window.trBalls=function(){const b=list(),c=courseId();
  const tee=b.filter(x=>x.shot===1&&x.par>=4),app=b.filter(x=>!(x.shot===1&&x.par>=4)&&x.aim>=40&&x.aim<=260),p3=b.filter(x=>x.shot===1&&x.par===3);
  const fw=tee.filter(x=>x.lie==='fairway').length,gr=app.concat(p3).filter(x=>x.lie==='green').length,apn=app.length+p3.length;
  const shortN=app.concat(p3).filter(x=>x.long<-5).length,longN=app.concat(p3).filter(x=>x.long>5).length;
  const tile=(v,l,s)=>`<div class="card"><b>${v}</b><span>${l}</span><small>${s}</small></div>`;
  const byClub=CLUBS.map(([k,l])=>{const s=b.filter(x=>x.club===k);return s.length?{l,n:s.length,d:avg(s.map(x=>x.d)),off:avg(s.map(x=>x.off)),sp:s.length>1?Math.sqrt(avg(s.map(x=>(x.off-avg(s.map(y=>y.off)))**2))):0}:null}).filter(Boolean);
  const holes={};for(const x of b)if(x.c===c)(holes[x.h]=holes[x.h]||[]).push(x);
  $('#app').className='wrap';
  $('#app').innerHTML=trBar('Where my ball goes',b.length?b.length+' ball'+(b.length===1?'':'s')+' marked':'Ball marks from GPS',trBack('#/me'))+`
   ${!b.length?`<section class="card tcard"><div class="trow"><span>No balls marked yet. On the hole screen, walk up to your ball and tap <b>Mark my ball</b>. Each mark saves the distance, left or right, the yards left and the lie. After a few rounds your patterns show up here.</span></div></section>`:`
   ${tee.length?`<div class="lbl">Off the tee · par 4s and 5s</div>
   <div class="tiles">${tile(r0(avg(tee.map(x=>x.d))),'Avg drive',tee.length+' marked')}${tile(r0(fw/tee.length*100)+'%','Fairways',fw+' of '+tee.length)}${tile(side(avg(tee.map(x=>x.off))),'Avg finish','from the middle')}</div>
   <section class="card bkcard">${plot(tee.slice(-80))}${legend()}</section>
   ${missLine(tee.map(x=>x.off),'drives','Try aiming a little {s} of where you aim now.')}
   ${(()=>{const into=tee.filter(x=>x.wx&&x.wx.h!=null&&x.wx.h>=5),help=tee.filter(x=>x.wx&&x.wx.h!=null&&x.wx.h<=-5);if(into.length<3||help.length<3)return'';
     return `<p class="bkpat"><i class="ph-bold ph-wind"></i><span>Into the wind your drives go <b>${r0(avg(into.map(x=>x.d)))}</b>, with it <b>${r0(avg(help.map(x=>x.d)))}</b>. ${into.length+help.length} windy drives.</span></p>`})()}`:''}
   ${apn?`<div class="lbl">Into the green</div>
   <div class="tiles">${tile(r0(gr/apn*100)+'%','Greens',gr+' of '+apn+' shots')}${tile(shortN,'Short','of '+apn)}${tile(longN,'Long','of '+apn)}</div>
   ${apn>=4&&shortN>=apn*.5?`<p class="bkpat"><i class="ph-bold ph-arrow-down"></i><span><b>${shortN} of ${apn} approaches finish short</b>, about ${r0(-avg(app.concat(p3).filter(x=>x.long<-5).map(x=>x.long)))} yds. Try one more club.</span></p>`
     :apn>=4&&longN>=apn*.5?`<p class="bkpat"><i class="ph-bold ph-arrow-up"></i><span><b>${longN} of ${apn} approaches finish long</b>, about ${r0(avg(app.concat(p3).filter(x=>x.long>5).map(x=>x.long)))} yds. Try one less club.</span></p>`:''}
   ${missLine(app.concat(p3).map(x=>x.off),'approaches','')}`:''}
   <div class="lbl">Yards by club</div>
   ${byClub.length?`<section class="card tcard">${byClub.map(r=>`<div class="trow"><span>${H(r.l)}<br><span class="muted" style="font-size:13px">${r.n} shot${r.n===1?'':'s'}${r.n>1?' · spread '+r0(r.sp)+' yds':''}</span></span><b>${r0(r.d)} <span class="muted" style="font-size:13px;font-weight:500">${side(r.off)}</span></b></div>`).join('')}</section>`
     :`<p class="note"><i class="ph-bold ph-golf"></i><span>Tap the club after you mark a ball and your real yards for each club show up here.</span></p>`}
   ${Object.keys(holes).length?`<div class="lbl">Your balls on each hole</div><div class="bkholes">${Object.keys(holes).sort((a,z)=>a-z).map(h=>{const m=mapOf(+h),xs=holes[h];if(!m)return'';
     return `<div class="card bkhole"><svg viewBox="${m.vb.join(' ')}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Hole ${h} with your balls">${holeSvg(+h,false).replace(/^<svg[^>]*>|<\/svg>$/g,'')}${ballDots(+h,true)}</svg><b>Hole ${h}</b><small>${xs.length} ball${xs.length===1?'':'s'}${xs.some(x=>x.shot===1&&x.par>=4)?' · '+xs.filter(x=>x.shot===1&&x.par>=4&&x.lie==='fairway').length+' of '+xs.filter(x=>x.shot===1&&x.par>=4).length+' fairways':''}</small></div>`}).join('')}</div>`:''}
   <div class="lbl">Recent</div><section class="card tcard">${b.slice(-15).reverse().map(x=>`<div class="trow"><span>Hole ${x.h} · shot ${x.shot}<br><span class="muted" style="font-size:13px">${dayOf(x.t)} · ${H(LIES[x.lie]||'')}${x.club?' · '+H(clubName(x.club)):''}</span></span><b>${x.d} <span class="muted" style="font-size:13px;font-weight:500">${side(x.off)}</span></b><button class="ib" data-bkdel="${x.id}" aria-label="Delete this ball"><i class="ph-bold ph-x"></i></button></div>`).join('')}</section>
   <p class="note"><i class="ph-bold ph-info"></i><span>Yards come from your phone's GPS and the course map, so give or take a few. Marks are saved on this phone.</span></p>`}`;
  document.querySelectorAll('[data-bkdel]').forEach(x=>x.onclick=()=>{if(!confirm('Delete this ball mark?'))return;G.balls=list().filter(y=>y.id!==x.dataset.bkdel);gsave();window.trBalls()});
  scrollTo(0,0)};
window.ballLink=()=>`<a class="card bkopen" href="#/balls"><i class="ph-bold ph-chart-scatter"></i><span><b>Where my ball goes</b><small>${list().length?list().length+' balls marked · your misses and yards by club':'Mark your ball on the hole screen to see your patterns'}</small></span><i class="ph-bold ph-caret-right"></i></a>`;

const st=document.createElement('style');st.textContent=`
.ballc{padding:12px;margin-top:10px}.ballc .bkgo{min-height:52px;font-size:17px}
.bkrow{display:flex;flex-direction:column;gap:4px;margin-top:10px;font-size:14px}.bkrow b{display:inline-flex;width:22px;height:22px;align-items:center;justify-content:center;border-radius:50%;background:var(--silver);color:var(--on-silver);font-size:12px;margin-right:4px}
.bkhint{font-size:14px;margin:8px 0 0}.bklink{display:inline-flex;align-items:center;gap:6px;margin-top:8px;font-size:14px;font-weight:600;color:var(--silver-2);min-height:36px}
.bknums{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;text-align:center}.bknums b{display:block;font-family:var(--display);font-size:38px;line-height:1}.bknums span{font-size:13px;color:var(--muted)}
.bksrc{font-size:13px;text-align:center;margin:6px 0 0}.bkchips{display:flex;flex-wrap:wrap;gap:6px}
.bkacts{display:grid;grid-template-columns:1fr 2fr;gap:8px;margin-top:16px}
.bkcard{padding:10px}.bkplot{width:100%;height:auto;display:block}
.bkleg{display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--muted);margin-top:6px}.bkleg i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:-1px;border:1px solid #0a0b0d}.bkleg i.ring{background:none;border:2px solid var(--silver)}
.bkpat{display:flex;gap:8px;font-size:15px;margin:10px 0 0;line-height:1.35}.bkpat i{font-size:20px;flex:none;margin-top:1px}
.bkholes{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:8px}.bkhole{padding:8px;text-align:center}.bkhole svg{width:100%;height:150px;display:block;background:var(--rough);border-radius:8px}.bkhole b{display:block;margin-top:6px;font-size:14px}.bkhole small{color:var(--muted);font-size:12px}
.bkopen{display:flex;align-items:center;gap:12px;padding:12px 14px;margin-top:12px}.bkopen>i:first-child{font-size:26px}.bkopen span{flex:1}.bkopen b{display:block}.bkopen small{color:var(--muted);font-size:13px}
.tcard .trow .ib{min-width:40px;min-height:40px;margin-left:6px}
`;document.head.appendChild(st);
/* tracker.js draws the first screen before this file loads: draw again where the ball pieces show */
if(/^#\/(hole|balls|me)?(\/|$)/.test(location.hash)&&typeof route==='function')route();
})();
