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
:root{--muted:#c3c9d2}
.htop{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center;padding:8px 10px;margin-top:10px}
.htop .hmapb{display:flex;align-items:center;gap:8px;min-height:56px;background:none;border:0;padding:0 8px 0 0;border-right:1px solid var(--line);text-align:left;color:var(--text)}
.htop .hmapb .mini{width:24px;height:44px;flex:none;border-radius:4px;overflow:hidden;background:var(--rough)}
.htop .hmapb .mini svg{width:100%;height:100%;display:block}
.htop .hmapb span{font-size:13px;font-weight:700;line-height:1.15;max-width:86px}
.htop .hmapb em{display:block;font-style:normal;font-size:12px;color:var(--muted);font-weight:600;margin-top:2px}
.htop .yn b{font-size:26px}.htop .yn div:nth-child(2) b{font-size:36px}.htop .yn span{font-size:11px}
.htop .ysub{grid-column:1/-1;margin-top:0;min-height:28px;font-size:12px}
.stopen{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:48px;margin-top:10px;font-size:15px;font-weight:700}
.note{font-size:14px;line-height:1.4}
.tiles .card small{font-size:12px;color:var(--muted)}
.whyest{padding:12px 14px;margin-top:8px;font-size:14px;line-height:1.45}
.teel{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.teel button{min-height:58px;border:1px solid var(--line);border-radius:8px;background:var(--panel-2);text-align:left;padding:8px 12px}
.teel button b{display:block;font-size:16px}
.teel button span{display:block;font-size:13px;color:var(--muted);margin-top:2px}
.teel button[aria-pressed=true]{background:var(--silver);border-color:var(--silver);color:var(--on-silver)}
.teel button[aria-pressed=true] span{color:var(--on-silver);opacity:.85}
.sublbl{font-size:12px;color:var(--muted);font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin:8px 0 4px}
.hlp{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;min-height:0;border-radius:50%;border:1px solid var(--muted);font-size:12px;font-weight:800;color:var(--text);vertical-align:middle;margin-left:4px;text-transform:none;letter-spacing:0;font-family:var(--body);padding:0}
.tiles span .hlp{width:18px;height:18px;font-size:11px;margin-left:2px}
.yline{padding:10px 12px;margin-top:10px}
.yn{display:grid;grid-template-columns:repeat(3,1fr);text-align:center;align-items:end}
.yn b{display:block;font-family:var(--display);font-size:32px;line-height:1}
.yn div:nth-child(2) b{font-size:46px}
.yn span{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:700}
.ysub{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px;color:var(--muted);margin-top:6px;min-height:36px}
.betl{display:flex;align-items:center;gap:10px;padding:10px 12px;margin-top:8px;font-size:15px;min-height:48px}
.betl span{flex:1}
.betl em{font-style:normal;font-size:13px;color:var(--muted);white-space:nowrap}
.sthead{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:15px}
.sthead span{font-size:13px}
.statc .r{margin-top:6px}
.wl{padding:16px;margin-top:14px}
.wl h2{font-size:28px;margin-bottom:6px}
.wl .field{font-size:18px;min-height:52px}
.wlco{display:flex;align-items:center;gap:12px;width:100%;padding:14px;text-align:left;margin-top:4px;min-height:64px}
.wlco span{flex:1}.wlco b{display:block;font-size:17px}.wlco small{display:block;color:var(--muted);font-size:14px}
.note{font-size:14px}
.hmeta span{font-size:12px}
.run span,.prow .who span,.saved{font-size:13px}
.strip button{font-size:11px}
.hole .stick{padding-top:6px}
.saved{margin-top:4px}
.paper col.c0{width:56px}
.paper td:first-child{overflow:hidden;text-overflow:ellipsis}
@media (max-width:420px){.paper col.c0{width:50px}}
.hd{grid-template-columns:100px 1fr}
.hmap{width:100px;height:min(56dvh,440px)}
.gzoom{background:var(--rough);border-radius:10px;overflow:hidden;aspect-ratio:1;position:relative}
.gzoom svg{width:100%;height:100%;display:block}
.gzoom small{position:absolute;left:8px;bottom:6px;font-size:12px;color:#fff;font-weight:700;text-shadow:0 1px 2px #000}
.hd2{margin-top:12px}
.tiles .card small{font-size:12px}
.coach{padding:12px 14px;margin-top:12px}
.coach .gbig{font-family:var(--display);font-weight:800;font-size:30px;line-height:1;margin-top:8px}
.coach .muted{font-size:14px;margin-top:4px}
.coach .r{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.gbar{height:10px;border-radius:5px;background:var(--panel-2);margin-top:10px;overflow:hidden}
.gbar i{display:block;height:100%;background:var(--silver)}
.tip{color:var(--text)}
.ptsr{margin-top:6px}.ptsr th{padding:6px 4px;text-align:left;width:44px}.ptsr td{text-align:center;padding:6px 1px;font-weight:700;font-size:16px}
.big.ghost,.prow .sc.ghost{color:#9aa2ae}
body.sun .big.ghost,body.sun .prow .sc.ghost{color:#7d848f}
.prow .sc.ghost{text-decoration:underline dotted 2px;text-underline-offset:6px}
.hole .hhead{margin-top:8px}
.hole .hnum{font-size:78px}
.statc{padding:10px 12px}
.statc .r{margin-top:4px;gap:5px}
.statc .r>span{width:42px}
.statc .chip2{min-height:36px;padding:0 9px}
.hint1{font-size:15px;color:var(--text);margin-top:8px;text-align:center}
.prow .who span{color:var(--text);font-size:15px}
.of18{font-size:14px;color:var(--muted);font-family:var(--body);margin-left:1px}
.hdr{display:grid;gap:10px;align-content:start}
.hdr .hlist{gap:8px}.hdr .hlist li{font-size:14px}
.teey{display:grid;grid-template-columns:repeat(3,1fr);text-align:center;background:var(--panel-2);border-radius:10px;padding:8px 4px 6px}
.teey b{display:block;font-family:var(--display);font-size:24px;line-height:1}
.teey div:nth-child(2) b{font-size:30px}
.teey span{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700}
.teey small{grid-column:1/-1;font-size:12px;color:var(--muted);margin-top:4px}
.betst{display:block;font-size:13px;color:var(--muted);margin-top:2px}
.paper col.c0{width:66px}
.prow .sc small.parlab{display:block;font-family:var(--body);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:-2px}
.legend{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;font-size:13px;color:var(--muted);margin-top:10px}
.legend .mk{width:22px;height:22px;font-size:13px}
body.bigt #app,body.bigt #sheet{zoom:1.13}
.solol{display:flex;gap:10px;align-items:center;padding:10px 12px;margin-top:8px;font-size:15px;line-height:1.35}
.solol i{font-size:20px;color:var(--silver-2)}
.where .trow b.u{color:var(--under)}.where .trow b.o{color:var(--over)}
.recs{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.recs .card{padding:10px 12px}.recs b{display:block;font-family:var(--display);font-size:26px;line-height:1}.recs span{display:block;font-size:12px;color:var(--muted);margin-top:3px}
.newbest{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.newbest span{background:var(--silver);color:var(--on-silver);font-weight:800;font-size:13px;padding:5px 10px;border-radius:6px}
.mk.bo{border-width:1px;border-color:rgba(214,170,120,.5);color:var(--text)}
body.sun .mk.bo{border-color:#b48a5a}
.hole.grp .hnum{font-size:64px}.hole.grp .hhead{margin-top:8px}
.hole.grp .prow{padding:5px 0}.hole.grp .prow button.pm{height:48px}.hole.grp .prow .sc{font-size:40px}
.hole.grp .entry{padding:12px 14px 10px;margin-top:8px}.entry .allpar{min-height:44px;margin-bottom:4px!important}
[hidden]{display:none!important}.sstrip.apr{align-items:center;gap:5px;margin-bottom:6px}.apl{font-size:13px;color:var(--muted);margin-right:2px}.ylive{color:var(--text);font-weight:700}.ylive i{color:#7fd18b}.qpick{margin:2px 0 10px}.qpick button{min-height:48px}.qphint{font-size:13px;margin:6px 0 0;text-align:center}.prow .parlab{letter-spacing:.04em;line-height:1.15;margin-top:2px}.sstrip.one{flex-wrap:nowrap;gap:10px}.sstrip.one .sg>div{gap:4px}.sstrip.one .sg{min-width:0}.sstrip.one .chip2{min-width:30px;padding:0 6px}#liveBtn{width:auto;padding:0 10px;display:flex;gap:6px;font-size:18px}#liveBtn span{font-size:15px;font-weight:600}.run>span{display:block;line-height:1.25}.mk.bo{background:rgba(214,170,120,.22)}.mk.d{background:rgba(214,100,80,.55);color:#fff}body.sun .mk.d{background:rgba(214,100,80,.3);color:#7a2a1a}.sstrip.one .sg:last-child{margin-left:auto}.livecode{font-family:var(--display);font-size:56px;font-weight:800;letter-spacing:.14em;text-align:center;margin:14px 0 4px}button.solol{width:100%;text-align:left;color:var(--text)}.sstrip{display:flex;flex-wrap:wrap;gap:6px 10px;justify-content:space-between;margin:0 0 6px}.sstrip.s2{justify-content:flex-start;gap:6px;align-items:center}.sopen{display:flex;align-items:center;gap:6px;margin:0 0 6px;min-height:36px;font-size:15px}.sstrip .sg>span{display:block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 3px 2px}.sstrip .sg>div{display:flex;gap:4px}.sstrip .chip2{min-height:38px;min-width:31px;padding:0 6px;font-size:15px}
.prow .sc{display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none!important}.prow .sc small.parlab{font-size:10px;margin-top:3px;letter-spacing:.06em}
.mk.d{background:rgba(214,120,90,.3)}.hole .stick{background:var(--bg);border-top:1px solid var(--line);margin-top:6px;padding-top:8px}.hole .stick::before{content:none}
.sggrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px}.sggrid .fmtc{margin:0;padding:10px 12px;text-align:left;min-height:64px}.sggrid .fmtc b{font-size:15px}.sggrid .fmtc span{font-size:13px;line-height:1.3}
.hlp{position:relative}.hlp::after{content:'';position:absolute;inset:-11px}
.entry:has(.quick) .big{font-size:84px;min-height:74px}.entry:has(.quick) .stepper button.pm{height:62px}.entry:has(.quick) .quick{margin-top:10px}
@media (max-height:560px){.hole .hnum{font-size:60px}.hole .hhead{margin-top:6px}.entry:has(.quick) .big{font-size:68px;min-height:60px}.entry:has(.quick) .stepper button.pm{height:54px}.hole .strip{margin-top:8px}.hole>.sopen{margin-top:8px}}
.solol{padding:7px 10px;font-size:14px;margin-top:8px}.hint1{margin:6px 0 0;font-size:14px}.hole.grp .strip{margin-top:8px}.hole.grp .strip button{height:34px}.hole.grp .hnum{font-size:56px}
.statc{padding:8px 12px!important;margin-top:8px}.statc .r{margin-top:4px!important;gap:5px}.statc .chip2{min-height:36px;padding:0 9px}
.htop{margin-top:8px;padding:6px 10px}.htop .ysub{min-height:22px}
details.whyd>summary{cursor:pointer;color:var(--silver-2);font-size:15px;font-weight:700;min-height:40px;display:flex;align-items:center;gap:6px;list-style:none}
details.whyd>summary::-webkit-details-marker{display:none}
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
const trBetName=b=>b.type==='skins'?'Skins '+money(b.amt):b.type==='nassau'?'Nassau '+money(b.amt)+' each way':(b.label||b.name||'Side bet');
function trShare(btn,text){const done=t=>{btn.innerHTML='<i class="ph-bold ph-check"></i> '+t;setTimeout(()=>btn.innerHTML=btn.dataset.l,2200)};btn.dataset.l=btn.dataset.l||btn.innerHTML;
  if(navigator.share){navigator.share({text}).catch(()=>{});return}
  try{navigator.clipboard.writeText(text).then(()=>done('Copied, paste it in your group text'),()=>done('Copy failed'))}catch(e){done('Copy failed')}}
/* a tee is a women's tee by name, or when its men's rating beats a longer men's tee by more than a stroke (mixed-up data) */
function trIsW(c,t){if(/· W$/.test(t.name))return true;const yd=x=>trSum(x.y||[]),me=yd(t);if(!me)return false;
  return c.tees.some(o=>o!==t&&!/· W$/.test(o.name)&&yd(o)>me+150&&t.rating>o.rating+1)}
function trSettle(led,nm){const pos=[],neg=[],tx=[];for(const[pid,v]of Object.entries(led)){if(v>0.004)pos.push({pid,v});else if(v<-0.004)neg.push({pid,v:-v})}
  pos.sort((a,b)=>b.v-a.v);neg.sort((a,b)=>b.v-a.v);let i=0,j=0;
  while(i<neg.length&&j<pos.length){const x=Math.min(neg[i].v,pos[j].v);tx.push(`${nm(neg[i].pid)} pays ${nm(pos[j].pid)} ${money(x)}`);neg[i].v-=x;pos[j].v-=x;if(neg[i].v<.005)i++;if(pos[j].v<.005)j++}
  return tx}

/* ---------- a finished round, boiled down for history and stats ---------- */
function trSummary(m,scores,st,led){const c=COURSES[m.course],tee=c.tees.find(t=>t.id===m.cfg.tee)||c.tees[0];
  const out={id:m.id,kind:m.kind,group:m.group||null,name:m.name,date:m.date,course:m.course,cname:c.name,tee:tee.name,rating:tee.rating,slope:tee.slope,est:!!(c.est||(c.custom&&tee.slope===113&&tee.rating===trSum(c.par))),
    par:c.par.slice(),si:c.si.slice(),format:m.cfg.format,hcp:!!m.cfg.hcp,sg:m.cfg.sg||null,players:[],money:led||{},demo:!!m.demo};
  for(const p of m.players){const s=scores[p.id]||{},hs=Object.keys(s).map(Number).filter(h=>s[h]!=null).sort((a,b)=>a-b);
    const ch=trCh(p.hcp,tee,c.par),gross=trSum(hs.map(h=>s[h])),par=trSum(hs.map(h=>c.par[h-1]));
    /* net uses the same playing handicap as the card: course handicap x the format's allowance, so the review card and the saved round match */
    const al=m.cfg.allow!=null?m.cfg.allow:((FORMATS[m.cfg.format]||{}).allow||100),ph0=Math.round(ch*al/100);
    const pl={id:p.id,name:p.name,hcp:p.hcp,ch,ph:ph0,scores:s,holes:hs.length,gross,par,net:gross-trSum(hs.map(h=>trSt(ph0,c.si[h-1])))};
    /* score differential, World Handicap System: net double bogey cap per hole, then 113/slope x (score - rating) */
    if(hs.length===18){const ags=trSum(hs.map(h=>Math.min(s[h],c.par[h-1]+2+trSt(ch,c.si[h-1]))));pl.ags=ags;pl.diff=Math.round(113/tee.slope*(ags-tee.rating)*10)/10}
    else if(hs.length===9&&p.hcp!=null){const ags=trSum(hs.map(h=>Math.min(s[h],c.par[h-1]+2+trSt(ch,c.si[h-1])))),d9=113/tee.slope*(ags-tee.rating/2);
      pl.ags=ags;pl.d9=Math.round(d9*10)/10;pl.x9=Math.round((p.hcp*0.52+1.2)*10)/10;pl.diff=Math.round((d9+p.hcp*0.52+1.2)*10)/10}
    if(m.cfg.format==='stableford'){const ph=m.cfg.hcp?Math.round(ch*(FORMATS.stableford.allow||95)/100):0;pl.pts=trSum(hs.map(h=>stbl(s[h]-trSt(ph,c.si[h-1]),c.par[h-1])))}
    if(p.id==='me'){const sv=st||{},mix={e:0,b:0,p:0,bo:0,d:0};let pt=0,pn=0,fw=0,fwn=0,gir=0,ud=0,udn=0,ss=0,sn=0,pen=0,gp=0,fwl=0,fwr=0;const ap={s:0,l:0,lf:0,r:0},sh={};
      for(const h of hs){const x=sv[h]||{},pr=c.par[h-1],d=s[h]-pr;mix[d<=-2?'e':d===-1?'b':d===0?'p':d===1?'bo':'d']++;
        if(x.putts!=null){pt+=x.putts;pn++;sh[h]=[x.putts,x.fw||0,x.pen||0];if(s[h]-x.putts<=pr-2){gir++;gp+=x.putts}else{udn++;if(s[h]<=pr)ud++}pen+=x.pen||0}
        if(x.sand){sn++;if(s[h]<=pr)ss++}
        if(x.ap&&ap[x.ap]!=null)ap[x.ap]++;
        if(pr>3&&x.fw){fwn++;if(x.fw==='hit')fw++;else if(x.fw==='l')fwl++;else fwr++}}
      Object.assign(pl,{putts:pt,pn,fw,fwn,gir,mix,ud,udn,ss,sn,pen,gp,fwl,fwr,ap,sh})}
    out.players.push(pl)}
  return out}

/* handicap estimate: WHS table, how many of your best differentials count for 3 to 20 rounds */
const TR_WHS=[[3,1,-2],[4,1,-1],[5,1,0],[6,2,-1],[8,2,0],[11,3,0],[14,4,0],[16,5,0],[18,6,0],[19,7,0],[20,8,0]];
const trMine=()=>G.rounds.filter(r=>r.kind!=='event').map(r=>({r,p:r.players.find(p=>p.id==='me')})).filter(x=>x.p&&x.p.holes).sort((a,b)=>b.r.date-a.r.date);
function trEst(){const d=trMine().filter(x=>x.p.diff!=null&&!x.r.est&&x.p.par>=(x.p.holes===9?33:66)).map(x=>x.p.diff).slice(0,20),n=d.length,skip=trMine().filter(x=>x.r.est&&x.p.holes===18).length;if(n<3)return{n,skip,v:null};
  const row=TR_WHS.find(x=>n<=x[0]),best=d.slice().sort((a,b)=>a-b).slice(0,row[1]);
  return{n,k:row[1],adj:row[2],v:Math.min(54,Math.round((trAvg(best)+row[2])*10)/10)}}
function trWinner(r){const full=r.players.filter(p=>p.holes===18);if(full.length<2)return null;
  if(r.format==='stableford'&&full.every(p=>p.pts!=null)){const hi=Math.max(...full.map(p=>p.pts)),w=full.filter(p=>p.pts===hi);return w.length===1?w[0]:null}const lo=Math.min(...full.map(p=>p.net-p.par)),w=full.filter(p=>p.net-p.par===lo);return w.length===1?w[0]:null}
function trStandings(g,rs){const m={};
  for(const r of rs){const w=trWinner(r);
    for(const p of r.players){const x=m[p.id]||(m[p.id]={id:p.id,name:p.name,n:0,w:0,nets:[],pts:[],money:0});x.n++;if(p.holes===18)x.nets.push(p.net-p.par);if(p.holes===18&&p.pts!=null&&r.format==='stableford')x.pts.push(p.pts);if(w&&w.id===p.id)x.w++;if((r.cur||'usd')!=='rb')x.money+=(r.money||{})[p.id]||0}}   /* Raider Bucks rounds live in the wallet, not the cash table */
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
function trTabs(cur){return `<div class="seg" role="group" aria-label="Golf sections">${[['me','My golf'],['log','Play log'],['groups','Groups'],['events','Events'],...(EMBED?[['courses','Courses']]:[])].filter(([k])=>k!=='groups'||G.groups.length||cur==='groups').map(([k,l])=>`<button data-tab="${k}" aria-pressed="${k===cur}">${l}</button>`).join('')}</div>`}
function trWire(){document.querySelectorAll('.joinlive').forEach(b=>b.onclick=()=>{const c=prompt('Live round code from your scorekeeper (5 letters and numbers)');if(c)trJoin(c)});document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{if(b.dataset.tab==='courses'){try{parent.postMessage({golfCourses:1},location.origin)}catch(e){}return}location.hash='#/'+b.dataset.tab});
  document.querySelectorAll('[data-round]').forEach(b=>b.onclick=()=>location.hash='#/round/'+b.dataset.round)}

function hub(h){$('#app').className='wrap';
  if(!G.setup){if(G.rounds.some(r=>!r.demo))G.setup=true;else if(!h.startsWith('welcome')&&!h.startsWith('events'))return trWelcome()}
  const[a,b]=h.split('/');
  if(EMBED)try{parent.postMessage({golf:a==='group'||a==='new'&&b?'groups':a==='round'||a===''||a==='new'?'me':a},location.origin)}catch(e){}
  if(a==='groups')return trGroups();
  if(a==='group'&&b)return trGroup(b);
  if(a==='events')return trEvents();
  if(a==='new')return trNew(b||null);
  if(a==='round'&&b)return trRound(b);
  if(a==='log')return trLog(b||'all');
  if(a==='welcome')return trWelcome();
  return trMe()}

function trRoundState(id){try{return JSON.parse(localStorage.getItem('rngc-scorecard-v2:'+id)||'{}')}catch(e){return{}}}
function trMeHoles(id){const s=trRoundState(id);return((s.scores||{})['g|players']||{}).me||{}}
const trThru=id=>Object.values(trMeHoles(id)).filter(v=>v!=null).length;
function trNextHole(id){const m=trMeHoles(id);for(let h=1;h<=18;h++)if(m[h]==null)return h;return 18}

function trMe(){const my=trMine(),full=my.filter(x=>x.p.holes===18&&x.p.par>=66),nines=my.filter(x=>x.p.holes>=9&&x.p.holes<18).length,est=trEst();
  const live=Object.values(G.live).filter(l=>COURSES[l.course]).sort((a,b)=>b.date-a.date);
  const grossA=full.map(x=>x.p.gross),best=full.slice().sort((a,b)=>a.p.gross-b.p.gross)[0];
  const S_=k=>trSum(my.map(x=>x.p[k]||0));
  const fullPutts=full.filter(x=>x.p.pn===18).map(x=>x.p.putts),pt=S_('putts'),pn=S_('pn');
  const fw=S_('fw'),fwn=S_('fwn'),gir=S_('gir'),ud=S_('ud'),udn=S_('udn'),ss=S_('ss'),sn=S_('sn'),pen=S_('pen');
  const mixR=full.filter(x=>x.p.mix),mix={e:0,b:0,p:0,bo:0,d:0};for(const x of mixR)for(const k in mix)mix[k]+=x.p.mix[k];
  const n=mixR.length||1,mixT=trSum(Object.values(mix))||1;
  const MIXL=[['e','Eagles','var(--under)',1],['b','Birdies','var(--under)',.6],['p','Pars','var(--silver-2)',.75],['bo','Bogeys','var(--over)',.55],['d','Doubles+','var(--over)',1]];
  const tile=(v,l,s,h)=>`<div class="card"><b>${v}</b><span>${l}${h?' '+hlp(h):''}</span><small>${s}</small></div>`;
  const notT='tap Drive or Putts on a hole to start',few=(n,v)=>n>=1?v:'-',fewS=(n,t)=>n>=5?t:t+' · small sample';
  $('#app').innerHTML=trBar('My golf',G.me.name+' · handicap '+trHc(G.me.hcp))+trTabs('me')+`
   ${live.map(l=>`<section class="card ev" style="padding:14px;margin-top:14px"><span class="tag rngc">In progress</span><h2 style="font-size:24px;margin:6px 0 2px">${esc(l.name)}</h2>
     <div class="muted">${esc(COURSES[l.course].name)} · ${esc(l.dateTxt)} · thru ${trThru(l.id)}</div>
     <div class="row2"><a class="btn" href="./?r=${l.id}#/hole/${trNextHole(l.id)}">Keep scoring</a><button class="btn ghost" data-drop="${l.id}">Throw it out</button></div></section>`).join('')}
   ${G.groups.some(g=>!g.demo)?`<div class="row2" style="margin-top:14px"><a class="btn" href="#/new"><i class="ph-bold ph-flag"></i> Start a round</a><a class="btn ghost" href="#/groups"><i class="ph-bold ph-users-three"></i> Group round</a></div>`
     :`<a class="btn block" style="margin-top:14px" href="#/new"><i class="ph-bold ph-flag"></i> Start a round</a><p class="muted" style="text-align:center;margin:8px 0 0;font-size:15px">With friends? <a class="linkbtn" href="#/groups" style="margin:0;min-height:40px">Group round</a> · <button class="linkbtn joinlive" style="margin:0;min-height:40px">Join a live round</button></p>`}
   ${TR_TOK()?'<button class="btn ghost block" data-bringguest style="margin-top:10px"><i class="ph-bold ph-ticket"></i> Bring a guest: 72 hours of golf, free</button>':''}
   ${grossA.length||best||mixR.length?`<div class="lbl">Scoring</div>
   <div class="tiles">
    ${tile(grossA.length?Math.round(trAvg(grossA)):'-','Avg score',grossA.length?'last '+grossA.length+' full 18s':'18 holes')}
    ${tile(best?best.p.gross:'-','Best',best?toPar(best.p.gross-best.p.par)+' · '+trDay(best.r.date):'-')}
    ${tile(mixR.length?trOne((mix.b+mix.e)/n):'-','Birdies','per round')}</div>`:''}
   ${trCoach(my,full)}
   <div class="lbl">Handicap ${hlp('index')}</div>
   ${est.v==null?`<div class="tiles">${G.me.hcp!=null?`<button class="card" id="editMe"><b>${trHc(G.me.hcp)}</b><span>Your handicap</span><small>you entered it · tap to change</small></button>`:`<button class="card" id="editMe"><b>${est.v==null?'-':trHc(est.v)}</b><span>Your handicap</span><small>${est.v==null?(3-est.n)+' more full round'+(3-est.n===1?'':'s'):'worked out by the app'}</small></button>`}</div><p class="note"><i class="ph-bold ph-info"></i><span>${G.me.hcp!=null?'That\'s the handicap you entered. ':''}Play ${3-est.n} more full 18-hole round${3-est.n===1?'':'s'} and the app works out ${G.me.hcp!=null?'its own number to check it':'your handicap'}.${est.skip?' '+est.skip+' of your rounds were on courses with no rating on file, so they don\'t count.':''}</span></p>`:`<div class="tiles">${G.me.hcp!=null?`<button class="card" id="editMe"><b>${trHc(G.me.hcp)}</b><span>Your handicap</span><small>you entered it · tap to change</small></button>`:`<button class="card" id="editMe"><b>${est.v==null?'-':trHc(est.v)}</b><span>Your handicap</span><small>${est.v==null?(3-est.n)+' more full round'+(3-est.n===1?'':'s'):'worked out by the app'}</small></button>`}
    <button class="card" id="estBtn">${(()=>{const g=G.me.hcp!=null&&est.v!=null?est.v-G.me.hcp:null;return g==null?`<b>${est.n}</b><span>Rounds for handicap</span><small>${est.n<3?(3-est.n)+' more to get your handicap':est.n<20?'best '+(est.k||0)+' count':'best 8 of 20'}</small>`:`<b><i class="ph-bold ph-${g<=-1?'trend-down':g>=1?'trend-up':'equals'}"></i></b><span>${g<=-1?'Heading down':g>=1?'Heading up':'Steady'}</span><small>your rounds work out to ${trHc(est.v)}</small>`})()}</button>
    <div class="card"><b>${my.length}</b><span>Rounds</span><small>${full.length} full 18${full.length===1?'':'s'}${nines?' · '+nines+' nine'+(nines===1?'':'s'):''}</small></div></div>`+trHcLine(est)+`<details class="whyd"><summary><i class="ph-bold ph-caret-right"></i> How it's worked out</summary>${trWhy(est)}</details>`}
   ${est.v!=null&&est.n>=20&&est.v!==G.me.hcp?`<button class="btn ghost block" id="useEst" style="margin-top:8px">Use ${trHc(est.v)} as my handicap</button>`:''}
   <div class="lbl">Your stats ${hlp('tracked')}</div>
   ${pn<9&&fwn<5?`<p class="note"><i class="ph-bold ph-chart-bar"></i><span>${pn?`Only ${pn} hole${pn===1?'':'s'} tracked so far, so no stats yet.`:'Want putts, fairways and greens?'} Tap Track my stats on the hole screen. Skip it and you still get score, handicap and the play log.</span></p>`:''}
   <div class="tiles"${pn<9&&fwn<5?' hidden':''}>
    ${fullPutts.length?tile(trOne(trAvg(fullPutts)),'Putts','per round · '+fullPutts.length+' rounds'):tile(few(pn,trOne(pt/pn)),'Putts a hole',pn?fewS(pn,pn+' holes tracked'):notT)}
    ${tile(few(fwn,trPct(fw,fwn)),'Fairways',fwn?fewS(fwn,fw+' of '+fwn+' tracked'):notT,'fw')}
    ${tile(few(pn,trPct(gir,pn)),'Greens hit',pn?fewS(pn,gir+' of '+pn+' on in time for 2 putts'):notT,'gir')}
    ${tile(few(udn,trPct(ud,udn)),'Saved par',udn?fewS(udn,ud+' of '+udn+' missed greens, still made par'):notT,'scr')}
    ${tile(sn?trPct(ss,sn):'-','Sand saves',sn?ss+' of '+sn+' bunkers':'tap Bunker on a hole','sand')}
    ${tile(few(pn,trOne(pen/pn*18)),'Penalties',pn?fewS(pn,'per 18 holes'):notT)}</div>
   ${pn&&pn<trSum(my.map(x=>x.p.holes))?`<p class="note"><i class="ph-bold ph-info"></i><span>Stats count only the holes you tracked. Tap Drive and Putts on the hole screen to fill them in.</span></p>`:''}
   ${(()=>{const so=full.filter(x=>x.r.kind!=='group'&&x.r.kind!=='event'&&x.p.ph!=null).map(x=>trVs(x.p.scores,x.r.par,x.r.si,x.p.ph).up);if(so.length<2)return'';const w=so.filter(u=>u>0).length,l=so.filter(u=>u<0).length,hv=so.length-w-l;
     return `<div class="lbl">Matches vs the course</div><div class="tiles"><div class="card"><b>${w}</b><span>Won</span><small>net beat par more holes</small></div><div class="card"><b>${l}</b><span>Lost</span><small>par won more</small></div><div class="card"><b>${hv}</b><span>Halved</span><small>${so.length} solo 18s</small></div></div>`})()}
   ${trWhere(my,full)}
   ${trSG(my)||trScratch(my,full)}${trTrends(my)}
   ${trRecords(full)}
   ${mixR.length?`<section class="card" style="padding:12px 14px;margin-top:8px"><b style="font-size:15px">A typical round</b><div class="mix" aria-hidden="true">${MIXL.map(([k,,c,o])=>`<i style="width:${mix[k]/mixT*100}%;background:${c};opacity:${o}"></i>`).join('')}</div>
     <div class="mixl">${MIXL.map(([k,l])=>`<span><b>${trOne(mix[k]/n)}</b> ${l}</span>`).join('')}</div></section>`:''}
   ${full.length>=2?`<section class="card" style="padding:12px 14px;margin-top:8px"><b style="font-size:15px">Last ${Math.min(10,full.length)} rounds</b>${trSpark(full.slice(0,10).reverse().map(x=>x.p.gross))}</section>`:''}
   <div class="lbl" style="display:flex;justify-content:space-between;align-items:center">Recent rounds <a class="linkbtn" href="#/log" style="margin:0;text-transform:none;letter-spacing:0">Full play log</a></div>
   <section class="card tcard">${my.length?my.slice(0,12).map(({r,p})=>trRow(r,p)).join('')
     :'<div class="trow"><span class="muted">No rounds yet. Start one and it lands here.</span></div>'}</section>
   ${G.rounds.some(r=>r.demo)?`<p class="note"><i class="ph-bold ph-flask"></i><span>These are sample rounds so you can see how it works. <button class="linkbtn" id="clearDemo" style="margin:0;min-height:0">Clear samples</button></span></p>`:''}
   <div style="height:28px"></div>`;
  trWire();
  $('#editMe').onclick=trEditMe;{const eb=$('#estBtn');if(eb)eb.onclick=trEstSheet}
  document.querySelectorAll('[data-goal]').forEach(b=>b.onclick=()=>{G.me.goal=+b.dataset.goal;gsave();trMe()});
  document.querySelectorAll('[data-sgb]').forEach(b=>b.onclick=()=>{(G.pref||(G.pref={})).sgb=b.dataset.sgb;gsave();const y=scrollY;trMe();scrollTo(0,y)});
  const ge=$('#goalEd');if(ge)ge.onclick=()=>{G.me.goal=null;gsave();trMe()};
  const ue=$('#useEst');if(ue)ue.onclick=()=>{trSetMe(G.me.name,est.v);trMe()};
  document.querySelectorAll('[data-drop]').forEach(b=>b.onclick=()=>{if(confirm('Throw out this round? Its scores are deleted.')){delete G.live[b.dataset.drop];try{localStorage.removeItem('rngc-scorecard-v2:'+b.dataset.drop)}catch(e){}gsave();trMe()}});
  const cd=$('#clearDemo');if(cd)cd.onclick=()=>{if(confirm('Clear the sample rounds and the sample group? Your own rounds stay.')){G.rounds=G.rounds.filter(r=>!r.demo);G.groups=G.groups.filter(g=>!g.demo);gsave();trMe()}}}

/* plain verdicts: an average of rounds normally runs about 3 over the handicap, a single round anywhere from -2 to +6 */
const trDayVs=g=>g<0?'better than':g<=4?'a normal day for':'a tough day for';
/* one line: which number to trust */
function trPlay(){const d=trMine().filter(x=>x.p.diff!=null&&!x.r.est&&x.p.holes===18&&x.p.par>=66).slice(0,5);return{n:d.length,rows:d,v:d.length?Math.round(trAvg(d.map(x=>x.p.diff))*10)/10:null}}
function trHcLine(est){const h=G.me.hcp,g=h!=null&&est.v!=null?Math.round((est.v-h)*10)/10:null;return `<p class="note"><i class="ph-bold ph-check-circle"></i><span>${h==null?`<b>${trHc(est.v)}</b> is your handicap from your ${est.n} rounds here, worked out the World Handicap way. Got an official GHIN handicap? Tap it to use that instead.`:`<b>${trHc(h)}</b> is your official handicap, and handicaps here use it. ${g<=-1?`Your rounds here work out to ${trHc(est.v)}, so expect it to drop as you post them.`:g>=1?`Your rounds here work out to ${trHc(est.v)}, so it may go up as you post them.`:`Your rounds here back it up.`}`}</span></p>`}
/* match vs the course: each hole your net score beats, ties or loses to par */
function trVs(sc,par,si,ph){let up=0,t=0;for(let h=1;h<=18;h++){if(sc[h]==null)continue;const n=sc[h]-trSt(ph,si[h-1]);up+=n<par[h-1]?1:n>par[h-1]?-1:0;t++}return{up,t}}
const trVsTxt=up=>up===0?'tied':Math.abs(up)+(up>0?' up':' down');
const trVsEnd=up=>up>0?`You beat the course, ${up} up`:up<0?`The course won, ${-up} down`:`You tied the course`;
/* why the estimate is what it is, in plain words, with the rounds that count */
function trWhy(est){const rows=trMine().filter(x=>x.p.diff!=null&&!x.r.est&&x.p.par>=(x.p.holes===9?33:66)).slice(0,20),used=rows.slice().sort((a,b)=>a.p.diff-b.p.diff).slice(0,est.k);
  const gap=G.me.hcp!=null?Math.round((est.v-G.me.hcp)*10)/10:null;
  return `<section class="card whyest"><b>Why ${trHc(est.v)}${G.me.hcp!=null?' and not '+trHc(G.me.hcp):''}:</b> ${est.n<20?`you have ${est.n} rated rounds in the app. With that few, the handicap rule counts only your best ${est.k}${est.adj?', minus '+Math.abs(est.adj):''}, so an early estimate reads lower than your real handicap. It settles once you log 20 rounds, when it counts your best 8 like GHIN does.`:`it averages your best 8 of your last 20 rounds here, the same way GHIN works it out.`}${est.v<0?' A + means better than scratch.':''}${gap!=null&&Math.abs(gap)>=1&&est.n>=20?` Your rounds here say you're about ${Math.abs(gap)} ${gap<0?'better':'worse'} than your handicap.`:''}
   <table class="stbl" style="margin-top:6px"><thead><tr><th>Counts</th><th>Score</th><th>Course</th><th>Rating</th></tr></thead><tbody>${used.map(x=>`<tr><td>${trDay(x.r.date)}<br><span class="muted" style="font-size:12px">${esc(x.r.cname)}</span></td><td>${x.p.gross}${x.p.d9!=null?' for 9':''}</td><td>${x.r.rating}/${x.r.slope}</td><td><b>${x.p.diff}</b></td></tr>`).join('')}</tbody></table>
   <div class="muted" style="margin-top:6px;font-size:14px">Keep posting to GHIN; that's your official index.</div></section>`}

/* solo golfers: a goal to chase, are you getting better, and one tip from your own numbers */
const TR_GOALS=[120,110,100,95,90,85,80,75,72];
function trCoach(my,full){const g=G.me.goal,sc=full.map(x=>x.p.gross),avg=sc.length?trAvg(sc):null;
  const sugg=avg==null?100:TR_GOALS.filter(v=>v<avg).sort((a,b)=>b-a)[0]||72;
  const hit=g?full.filter(x=>x.p.gross<g).length:0,low=sc.length?Math.min(...sc):null;
  const goal=g?`<section class="card coach"><div class="sthead"><b><i class="ph-bold ph-target"></i> Goal: break ${g}</b><button class="linkbtn" id="goalEd" style="margin:0;min-height:32px">Change</button></div>
     ${hit?`<p class="gbig">${hit} time${hit===1?'':'s'} so far 🎯</p><p class="muted">Best ${low}.</p>${TR_GOALS.some(v=>v<g)?`<div class="r"><button class="chip2" data-goal="${TR_GOALS.filter(v=>v<g).sort((a,b)=>b-a)[0]}">Next goal: break ${TR_GOALS.filter(v=>v<g).sort((a,b)=>b-a)[0]}</button></div>`:''}`
      :low!=null?`<p class="gbig">${low-g+1} shot${low-g+1===1?'':'s'} to go</p><p class="muted">You need ${g-1} or better. Best so far ${low}, average ${Math.round(avg)}.</p><div class="gbar"><i style="width:${Math.max(6,Math.min(94,100-(low-g+1)*6))}%"></i></div>`
      :`<p class="muted">Play a full 18 and the app tracks it here.</p>`}</section>`
   :`<section class="card coach"><div class="sthead"><b><i class="ph-bold ph-target"></i> Pick a goal</b></div><p class="muted">Something to chase every round. ${avg!=null?'Your average is '+Math.round(avg)+', so break '+sugg+' is a good one.':'Break '+sugg+' is a good first goal.'}</p>
     <div class="r">${TR_GOALS.filter(v=>v>=sugg-10&&v<=sugg+10).slice(0,4).map(v=>`<button class="chip2" data-goal="${v}" aria-pressed="${v===sugg}">Break ${v}</button>`).join('')}</div></section>`;
  /* trend: last 5 full rounds against the 5 before */
  let trend='';if(sc.length>=6){const a=trAvg(sc.slice(0,5)),b=trAvg(sc.slice(5,10)),d=Math.round((b-a)*10)/10;
    trend=`<p class="note"><i class="ph-bold ph-trend-${d>0?'up':'down'}"></i><span>${d>=1?`You're getting better: your last 5 average ${Math.round(a)}, ${d} better than the 5 before.`:d<=-1?`Last 5 average ${Math.round(a)}, ${Math.abs(d)} worse than the 5 before. Everybody has a stretch like this.`:`Steady: your last 5 average ${Math.round(a)}, same as the 5 before.`}</span></p>`}
  return goal+trend+trTip(my,full)}
function trTip(my,full){const S_=k=>trSum(my.map(x=>x.p[k]||0)),pn=S_('pn'),pt=S_('putts'),fwn=S_('fwn'),fw=S_('fw'),pen=S_('pen'),udn=S_('udn'),ud=S_('ud');
  const mixR=full.filter(x=>x.p.mix),dpr=mixR.length?trSum(mixR.map(x=>x.p.mix.d))/mixR.length:null,tips=[];
  /* each candidate scored as strokes a round it likely costs against a steady player */
  if(pn>=4)tips.push([(pt/pn-1.8)*18,`You average ${trOne(pt/pn)} putts a hole, about ${Math.round(pt/pn*18)} a round. Ten minutes on 3 to 6 footers before you tee off is the quickest way to save strokes.`]);
  if(fwn>=4)tips.push([(.55-fw/fwn)*14*.6,`You hit ${fw} of ${fwn} fairways tracked. On tight holes, take a hybrid or 3-wood off the tee and play from the short grass.`]);
  if(dpr!=null)tips.push([dpr*.8,`Doubles cost you the most: about ${trOne(dpr)} a round. In trouble, punch out sideways to the fairway and aim for the middle of the green.`]);
  if(pn>=4)tips.push([pen/pn*18,`About ${trOne(pen/pn*18)} penalty shots a round. Aim at the safe side of the hole and take water out of play.`]);
  if(udn>=4)tips.push([(.3-ud/udn)*udn/Math.max(1,my.length)*1.2,`You saved par ${ud} of ${udn} times after missing a green. A bucket of chips and short pitches a week pays off.`]);
  tips.sort((a,b)=>b[0]-a[0]);
  const t=tips.length?tips[0][1]:'Tap Putts on the hole screen for a round or two and the app picks a tip from your own numbers.';
  return `<p class="note tip"><i class="ph-bold ph-lightbulb"></i><span><b>Tip for next round:</b> ${t}</span></p>`}

/* one round as a row: course, date, who, tees, then score, to par, points and money */
function trRow(r,p){const m=(r.money||{}).me,pts=p&&p.pts!=null&&r.format==='stableford';
  const who=r.kind==='event'?esc(r.team||'Club event'):r.players.filter(x=>x.id!=='me').map(x=>esc(first(x.name))).join(', ')||'Solo';
  return `<button class="rrow" data-round="${r.id}"><div><b>${esc(r.kind==='event'?r.name:r.cname)}</b><span>${trDay(r.date)}${r.date?' '+new Date(r.date).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):''} · ${who}</span>
   ${m||(r.bets&&r.bets.length)?`<span class="${m>0?'under':m<0?'over':''}" style="display:block;font-weight:700">${r.bets&&r.bets.length?esc(r.bets[0].replace(' each way',''))+(r.bets.length>1?' +'+(r.bets.length-1):'')+': ':'Side bets: '}${m>0?'won ':m<0?'lost ':'even'}${m?money(Math.abs(m)):''}</span>`:''}
   ${r.note?`<span style="display:block;font-style:italic">${esc(r.note.length>70?r.note.slice(0,70)+'...':r.note)}</span>`:''}</div>
   <div class="sc">${p?(pts?p.pts+'<small>points · '+p.gross+'</small>':`<span class="${cls(p.gross-p.par)}">${p.gross}</span><small>${toPar(p.gross-p.par)}${r.hcp&&p.net!=null?' · '+(x=>x==='E'?'even':x)(toPar(p.net-p.par))+' with handicap':''}${p.holes<18?' · '+p.holes+' holes':''}${p.pn&&p.pn===p.holes?' · '+p.putts+' putts':''}</small>`):`${esc(r.result||'-')}<small>${r.pos?'place '+r.pos:'event'}</small>`}</div></button>`}

/* ---------- plain-words help for golf terms ---------- */
const GLOSS={index:['Handicap','Your skill as a number. A 15 shoots about 15 over par on a normal course on a good day. Lower is better. Your official one comes from GHIN; type it in here.'],
 est:['App estimate','The app works out your handicap from your own rounds here, the same way GHIN does, so you can see where you are heading.'],
 diff:['Handicap diff','How one round rates. It takes your score, caps any blow-up hole at net double bogey, then adjusts for how hard the course and tees are: (adjusted score - course rating) x 113 / slope.'],
 net:['Net and gross','Gross is every shot you hit. Net takes off your handicap strokes, so a 20 and a 5 can play a fair game. The dots on a hole show where you get a stroke.'],
 stableford:['Stableford','Points instead of strokes: bogey 1, par 2, birdie 3, eagle 4, worse than bogey 0. A blow-up hole only costs you that hole. Most points wins.'],
 skins:['Side games','Skins: low score on a hole wins it, ties carry over to the next hole. Nassau: three bets in one, front 9, back 9 and all 18.'],
 gir:['Greens in regulation','You hit the green with 2 shots to spare for par: on in 1 on a par 3, 2 on a par 4, 3 on a par 5. The app works it out from your score and putts.'],
 fw:['Fairways','Tap where your tee shot ended on every par 4 and 5. Par 3s don\'t count.'],
 scr:['Scrambling','You missed the green but still made par or better. Shows your short game.'],
 sand:['Sand saves','You were in a greenside bunker and still made par or better. Tap Bunker on the hole to count it.'],
 tracked:['Tracked holes','Stats only count holes where you tapped Drive or Putts, so a few holes tracked gives a rough number. Track all 18 for the real picture.']};
const hlp=k=>`<button class="hlp" data-help="${k}" aria-label="What does this mean?">?</button>`;
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-help]');if(!b)return;e.preventDefault();e.stopPropagation();const[t,d]=GLOSS[b.dataset.help]||['',''];
  $('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">${esc(t)}</h2><p style="font-size:17px;line-height:1.5;margin-top:8px">${esc(d)}</p><button class="btn block" style="margin-top:16px" id="closeSheet">Got it</button>`;trOpen()},true);
const trHc=v=>v==null?'-':v<0?'+'+Math.abs(v):String(v);

/* how the app estimate is figured, round by round */
function trEstSheet(){const est=trEst(),rows=trMine().filter(x=>x.p.diff!=null&&!x.r.est).slice(0,20),keep=new Set(rows.map((x,i)=>[x.p.diff,i]).sort((a,b)=>a[0]-b[0]).slice(0,est.k||0).map(x=>x[1]));
  const left=trMine().filter(x=>x.r.est&&x.p.holes===18).length;
  $('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">How your estimate is figured</h2>
   ${est.v==null?`<p style="font-size:16px;margin-top:8px">Play ${3-est.n} more full 18-hole round${3-est.n===1?'':'s'} on a regular course and the estimate shows up here.</p>`:
   `<p style="font-size:16px;line-height:1.45;margin-top:8px">Your last ${est.n} full rounds. The app keeps your best ${est.k} differentials (marked), averages them${est.adj?' and takes off '+Math.abs(est.adj):''}. That gives <b>${trHc(est.v)}</b>. With 20 rounds it uses the best 8, like GHIN.</p>`}
   <section class="card" style="padding:4px 12px;margin-top:10px"><table class="stbl"><thead><tr><th>Round</th><th>Score</th><th>Tees</th><th>Diff</th></tr></thead><tbody>
    ${rows.map((x,i)=>`<tr${keep.has(i)?' style="font-weight:800"':''}><td>${trDay(x.r.date)}<br><span class="muted" style="font-size:12px">${esc(x.r.cname)}</span></td><td>${x.p.gross}${x.p.ags!=null&&x.p.ags!==x.p.gross?`<br><span class="muted" style="font-size:12px">adj ${x.p.ags}</span>`:''}</td><td>${x.r.rating}/${x.r.slope}</td><td>${keep.has(i)?'<i class="ph-fill ph-check-circle"></i> ':''}${x.p.diff}</td></tr>`).join('')||'<tr><td colspan="4" class="muted">No full rounds yet</td></tr>'}</tbody></table></section>
   <p class="note"><i class="ph-bold ph-info"></i><span>Each diff = (adjusted score - course rating) x 113 / slope. Adjusted caps a hole at net double bogey.${left?' '+left+' round'+(left===1?'':'s')+' on courses with no rating on file are left out.':''} A guide, not your official GHIN index.</span></p>
   <button class="btn block" style="margin-top:12px" id="closeSheet">Close</button>`;trOpen()}

/* ---------- first open: who you are, your tees, your home course ---------- */
function trWelcome(){const sm=trSiteMe(),d=Object.assign({tees:'mid',w:false},G.pref||{}),home=G.home&&COURSES[G.home]?COURSES[G.home]:G.homeInfo;
  $('#app').innerHTML=trBar('Welcome','RNGC golf · set up in 30 seconds')+`
   <section class="card wl"><h2>Let's get you set up</h2>
    <div class="lbl" style="margin-top:0">Text size</div>
    <div class="teel" role="group" aria-label="Text size" style="grid-template-columns:repeat(3,1fr)"><button data-big="0" aria-pressed="${!G.big}"><b>Regular</b><span>&nbsp;</span></button><button data-big="1" id="wlBig" aria-pressed="${!!G.big&&!(G.pref||{}).sun}"><b style="font-size:19px">Bigger text</b><span>easier to read</span></button><button data-big="2" id="wlBright" aria-pressed="${!!G.big&&!!(G.pref||{}).sun}"><b style="font-size:19px">Bigger + bright</b><span>best in the sun</span></button></div>
    ${sm?`<div class="lbl">You</div><p style="font-size:18px;margin:0 0 10px"><b>${esc(sm.name)}</b> <span class="muted" style="font-size:15px">· signed in${sm.ghin?' · GHIN '+esc(sm.ghin):''}</span></p><input type="hidden" id="wlName" value="${esc(sm.name)}">`
     :`<label class="inl"><span>Your name</span><input class="field" id="wlName" maxlength="24" placeholder="Like Mike R." value="${esc(G.me.name==='You'?'':G.me.name)}" autocomplete="off"></label>`}
    <label class="inl"><span>Handicap</span><input class="field" id="wlIdx" type="number" inputmode="decimal" step="0.1" placeholder="Don't know it? Leave blank" value="${G.me.set?G.me.hcp:''}"></label>
    <p class="note" style="margin-top:4px"><i class="ph-bold ph-info"></i><span>Blank is fine. After 3 rounds the app works out your handicap from your scores.</span></p>
    <div class="lbl">Home course</div>
    <button class="card wlco" id="wlCo"><i class="ph-bold ph-flag-pennant"></i><span>${home?`<b>${esc(home.name)}</b><small>${esc(home.city||'')}</small>`:'<b>Pick your home course</b><small>Search 1,600+ courses in CA, NV and AZ</small>'}</span><i class="ph-bold ph-caret-right"></i></button>
    <div class="lbl">Tees you usually play</div>
    <div class="teel" role="group" aria-label="Tee set"><button data-ww="0" aria-pressed="${d.w===false}"><b>Men's tees</b></button><button data-ww="1" aria-pressed="${d.w===true}"><b>Women's tees</b></button></div>
    <div class="teel" role="group" aria-label="Tees" style="grid-template-columns:repeat(3,1fr);margin-top:6px">${[['back','Longest',d.w?'5,800+ yds':'6,700+ yds'],['mid','Middle',d.w?'5,200 to 5,800':'6,000 to 6,700'],['fwd','Shortest',d.w?'under 5,200':'under 6,000']].map(([k,l,y])=>`<button data-wt="${k}" aria-pressed="${d.tees===k}"><b>${l}</b><span>${y}</span></button>`).join('')}</div>
    <p class="muted" style="font-size:14px;margin-top:6px">Rough length of a whole round. Not sure? Pick Middle. You choose the exact tee at the course every round.</p>
   </section>
   <div class="stick" style="z-index:5"><button class="btn block" id="wlGo">Let's play <i class="ph-bold ph-arrow-right"></i></button>
    <button class="linkbtn" id="wlDemo" style="display:block;margin:10px auto 0">Just looking? See it with sample rounds</button></div>`;
  const keep=()=>{const n=$('#wlName').value.trim(),i=$('#wlIdx').value;if(n)G.me.name=n;if(i!==''){G.me.hcp=trIdx(i);G.me.set=true}G.pref=d};
  document.querySelectorAll('[data-wt]').forEach(b=>b.onclick=()=>{keep();d.tees=b.dataset.wt;trWelcome()});
  document.querySelectorAll('[data-ww]').forEach(b=>b.onclick=()=>{keep();d.w=b.dataset.ww==='1';trWelcome()});
  document.querySelectorAll('[data-big]').forEach(b=>b.onclick=()=>{keep();G.big=b.dataset.big!=='0';d.sun=b.dataset.big==='2';G.pref=d;trBig();gsave();trWelcome()});
  $('#wlCo').onclick=()=>{keep();trFind(null,(id,info)=>{G.home=COURSES[id]?id:null;G.homeInfo=info;if(COURSES[id])trRecent(id);closeSheet();trWelcome()})};
  $('#wlGo').onclick=()=>{keep();if(!G.me.set)G.me.hcp=18;trSetMe(G.me.name||'You',G.me.hcp);G.setup=true;gsave();location.hash='#/me';route();scrollTo(0,0)};
  $('#wlDemo').onclick=()=>{keep();G.setup=true;trSeed();location.hash='#/me';route()}}

function trSpark(v){const W=320,H=60,lo=Math.min(...v),hi=Math.max(...v),sp=Math.max(1,hi-lo),x=i=>10+i*(W-20)/Math.max(1,v.length-1),y=s=>10+(s-lo)/sp*(H-20);
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Scores, oldest to newest: ${v.join(', ')}"><polyline fill="none" stroke="var(--silver-2)" stroke-width="2" points="${v.map((s,i)=>x(i)+','+y(s)).join(' ')}"/>${v.map((s,i)=>`<circle cx="${x(i)}" cy="${y(s)}" r="4" fill="var(--silver)"/>`).join('')}</svg>
   <div class="mixl" style="justify-content:space-between"><span>Low <b>${lo}</b></span><span>High <b>${hi}</b></span><span>Last <b>${v[v.length-1]}</b></span></div>`}

function trEditMe(){$('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">You</h2>
  <label class="inl"><span>Name</span><input class="field" id="meName" maxlength="24" value="${esc(G.me.name)}" autocomplete="off"></label>
  <label class="inl"><span>Handicap</span><input class="field" id="meIdx" type="number" inputmode="decimal" step="0.1" min="-5" max="54" value="${G.me.hcp}"></label>
  <button class="btn block" style="margin-top:14px" id="meSave">Save</button><button class="btn ghost block" style="margin-top:8px" id="closeSheet">Cancel</button>`;
  trOpen();$('#meSave').onclick=()=>{const i=parseFloat($('#meIdx').value);trSetMe($('#meName').value.trim()||'You',isNaN(i)?G.me.hcp:trIdx(i));closeSheet();route()}}

/* ---------- groups ---------- */
function trGroups(){
  $('#app').innerHTML=trBar('My golf',G.me.name+' · handicap '+G.me.hcp)+trTabs('groups')+`
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
  const man=g.members.find(m=>m.id===g.manager)||g.members[0],STB=rs.filter(r=>r.format==='stableford').length>rs.length/2;
  $('#app').innerHTML=trBar(g.name,g.members.length+' players · '+rs.length+' round'+(rs.length===1?'':'s'),trBack('#/groups'))+`
   <a class="btn block" style="margin-top:12px" href="#/new/${g.id}"><i class="ph-bold ph-flag"></i> Start a round with this group</a>
   <div class="lbl">Season table</div>
   ${tbl.length?`<section class="card" style="padding:4px 12px"><table class="stbl"><thead><tr><th>Player</th><th>Rounds</th><th>Wins</th><th>${STB?'Avg pts':'Avg net'}</th><th>Money</th></tr></thead><tbody>
     ${tbl.map(x=>`<tr><td>${esc(first(nm(x.id)))}</td><td>${x.n}</td><td>${x.w}</td><td>${STB?(x.pts.length?trOne(trAvg(x.pts)):'-'):x.nets.length?toPar(Math.round(trAvg(x.nets)*10)/10):'-'}</td><td class="${x.money>0?'under':x.money<0?'over':''}">${x.money>0?'+':''}${money(x.money)}</td></tr>`).join('')}</tbody></table></section>
     <p class="note"><i class="ph-bold ph-info"></i><span>${STB?'Avg pts is your average Stableford points. ':''}A win is the low net score of the round, or the most points in a Stableford round, ties count for nobody. Money adds up the side bets from each round below, tap a round to see its bets.</span></p>
     <button class="btn ghost block" id="shareT" style="margin-top:8px"><i class="ph-bold ph-share-fat"></i> Send the season money to the group</button>`
    :'<section class="card tcard"><div class="trow"><span class="muted">No rounds yet. Start one and the table fills in.</span></div></section>'}
   <div class="lbl">Members</div>
   <section class="card tcard">${g.members.map(m=>`<div class="trow"><div><b>${esc(m.name)}${m.id===g.manager?' <span class="tag rngc">Manager</span>':''}${m.id==='me'?' <span class="tag">You</span>':''}</b>
     ${mgr&&m.id!=='me'?`<button class="linkbtn" data-rm="${m.id}">Remove</button> <button class="linkbtn" data-mg="${m.id}">Make manager</button>`:''}</div>
     <label class="idxbox"><span>Index</span><input class="field idx" type="number" inputmode="decimal" step="0.1" min="-5" max="54" value="${m.hcp}" data-gi="${m.id}" ${mgr||m.id==='me'?'':'disabled'} aria-label="${esc(m.name)} handicap"></label></div>`).join('')}
    ${mgr?`<button class="btn ghost block" style="margin:10px 0" id="addM"><i class="ph-bold ph-user-plus"></i> Add a member</button>`:''}</section>
   <p class="note"><i class="ph-bold ph-lock-simple"></i><span>${mgr?'You manage this group, so you can add and remove people and fix anyone\'s handicap.':esc(first(man.name))+' manages this group. You can fix your own handicap. <button class="linkbtn" id="takeBack" style="margin:0;min-height:0">Preview: take it back</button>'}</span></p>
   <div class="lbl">Rounds</div>
   <section class="card tcard">${rs.length?rs.map(r=>{const w=trWinner(r);return `<button class="rrow" data-round="${r.id}"><div><b>${trDay(r.date)} · ${esc(r.cname)}</b><span>${r.players.map(p=>esc(first(nm(p.id)))+' '+p.gross).join(' · ')}</span>${r.money&&Object.keys(r.money).length?`<span style="display:block">${r.bets&&r.bets.length?esc(r.bets.join(' + '))+': ':'Bets: '}${r.players.map(p=>{const v=r.money[p.id]||0;return esc(first(nm(p.id)))+' '+(v>0?'+':'')+money(v)}).join(' · ')}</span>`:''}</div><div class="sc" style="font-size:20px">${w?esc(first(nm(w.id))):'-'}<small>${w?(r.format==='stableford'&&w.pts!=null?'most points':'low net'):'net tie'}</small></div></button>`}).join('')
     :'<div class="trow"><span class="muted">None yet</span></div>'}${rs.some(r=>r.money&&Object.keys(r.money).length)?`<div class="trow"><span><b>These ${rs.length} rounds add up to</b><br><span class="muted">${tbl.map(x=>esc(first(nm(x.id)))+' '+(x.money>0?'+':'')+money(x.money)).join(' · ')}, same as the season table. Wins count low net only; money comes from the bets, so a player can win money without a win.</span></span></div>`:''}</section>
   ${mgr?`<button class="linkbtn" id="delG" style="margin:16px 0 28px">Delete this group</button>`:'<div style="height:28px"></div>'}`;
  const shT=$('#shareT');if(shT)shT.onclick=()=>trShare(shT,`${g.name} season money, ${rs.length} round${rs.length===1?'':'s'}\n${tbl.map(x=>first(nm(x.id))+'  '+(x.money>0?'+':'')+money(x.money)+'  ('+x.w+' win'+(x.w===1?'':'s')+')').join('\n')}\n\nFrom the RNGC golf app. A tally only.`);
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
  $('#app').innerHTML=trBar('My golf',G.me.name+' · handicap '+G.me.hcp)+trTabs('events')+`
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
/* the tee a golfer usually plays: G.pref.tees back / mid / fwd, men's or women's set */
function trPrefTee(c){const p=G.pref||{tees:'mid',w:false},all=c.tees,ts=all.filter(t=>trIsW(c,t)===!!p.w);const L=ts.length?ts:all;if(p.w&&!ts.length)return all[all.length-1].id;
  return (p.tees==='back'?L[0]:p.tees==='fwd'?L[L.length-1]:L[Math.floor((L.length-1)/2)]).id}
function trRecent(id){G.recent=[id,...(G.recent||[]).filter(x=>x!==id)].slice(0,8)}
const GAMES={none:['No bet',null],sk2:['Skins $2',{type:'skins',amt:2}],sk5:['Skins $5',{type:'skins',amt:5}],na5:['Nassau $5',{type:'nassau',amt:5}],na10:['Nassau $10',{type:'nassau',amt:10}]};
function trNew(gid){const g=gid?G.groups.find(x=>x.id===gid):null;
  if(!NR||NR.gid!==(g?g.id:null)){const co=(G.recent||[]).find(k=>COURSES[k])||(G.home&&COURSES[G.home]?G.home:'chimera');
    NR={gid:g?g.id:null,course:co,tee:null,who:g?g.members.slice(0,4).map(m=>m.id):['me'],guests:[],format:g&&g.format?g.format:'stroke',hcp:true,game:g&&g.game||'none',sg:(G.pref||{}).sg||'course'}}
  if(!COURSES[NR.course])NR.course='chimera';
  const c=COURSES[NR.course];if(!NR.tee||!c.tees.find(t=>t.id===NR.tee))NR.tee=((G.lastTee||{})[NR.course]&&c.tees.find(t=>t.id===G.lastTee[NR.course]))?G.lastTee[NR.course]:trPrefTee(c);
  const pool=g?g.members:[{id:'me',name:G.me.name,hcp:G.me.hcp}],count=NR.who.length+NR.guests.length;
  const pw=!!(G.pref||{}).w,tees=c.tees.map(x=>({...x,w:trIsW(c,x)})),tg=[["Men's tees",tees.filter(t=>!t.w)],["Women's tees",tees.filter(t=>t.w)]].filter(x=>x[1].length);
  if(pw)tg.reverse();const selW=(tees.find(t=>t.id===NR.tee)||{}).w,noW=pw&&!tees.some(t=>t.w);
  const teeBtns=ts=>`<div class="teel">${ts.map(x=>{const yd=trSum(x.y||[]);return `<button data-tee="${x.id}" data-w="${x.w?1:0}" aria-pressed="${x.id===NR.tee}"><b>${esc(x.name.replace(/ · W$/,''))}</b><span>${yd?yd.toLocaleString()+' yds':'Yards not set'}</span></button>`}).join('')}</div>`;
  const canNassau=count===2||count===4;if(!canNassau&&NR.game.startsWith('na'))NR.game='none';if(count<2)NR.game='none';
  $('#app').innerHTML=trBar(g?g.name:'New round',g?'Group round':'Just you, or bring a guest',trBack(g?'#/group/'+g.id:'#/me'))+`
   <div class="lbl">Course</div>
   <div class="chips2">${trCoChips().map(([k,v])=>`<button class="chip2" data-co="${k}" aria-pressed="${k===NR.course}">${esc(v.name)}</button>`).join('')}<button class="chip2" id="findCo"><i class="ph-bold ph-magnifying-glass"></i> Find a course</button><button class="chip2" id="addCo"><i class="ph-bold ph-plus"></i> Add your own</button></div>
   <p style="font-size:16px;margin-top:8px"><b>Playing ${esc(c.name)}</b>${c.city?`<span class="muted"> · ${esc(c.city)}${c.n9?' · 9 holes, played twice for 18':''}</span>`:''}</p>
   <div class="lbl">Your tees</div>
   ${noW?`<section class="card whyest" style="margin-bottom:8px"><b>No women's ratings on file here.</b> The ratings below are for men, so your handicap diff would be off. <button class="linkbtn" id="ownTee" style="margin:4px 0 0;min-height:0;display:block">Enter your tee's rating and slope</button><span class="muted" style="font-size:13px">It's printed on the scorecard, like 70.1 / 121.</span></section>`:''}
   ${tg.length?`${tg.length>1||noW?`<div class="sublbl">${tg[0][0]}</div>`:''}${teeBtns(tg[0][1])}`:''}
   ${tg.length>1?`<details class="moretees" ${(pw?!selW:selW)?'open':''}><summary>${tg[1][0]} (${tg[1][1].length})</summary>${teeBtns(tg[1][1])}</details>`:''}
   <div class="lbl">Who's playing · ${count} of 4</div>
   <div class="chips2">${pool.map(p=>`<button class="chip2" data-pl="${p.id}" aria-pressed="${NR.who.includes(p.id)}">${esc(first(p.name))} <span style="font-weight:500;opacity:.7">${trHc(p.hcp)}</span></button>`).join('')}${NR.guests.map((p,i)=>`<button class="chip2" data-ug="${i}" aria-pressed="true" aria-label="Remove ${esc(p.name)}">${esc(first(p.name))} <span style="font-weight:500;opacity:.7">${trHc(p.hcp)}</span> <i class="ph-bold ph-x"></i></button>`).join('')}${count<4?`<button class="chip2" id="addG"><i class="ph-bold ph-plus"></i> Add a guest</button>`:''}</div>
   ${NR.guests.length&&TR_TOK()?`<button class="linkbtn" data-bringguest style="display:block;margin:8px 0 0"><i class="ph-bold ph-ticket"></i> Give ${esc(first(NR.guests[0].name))}${NR.guests.length>1?' and the group':''} 72 hours of golf in the app</button>`:''}
   ${count===1?`<div class="lbl">Your game today</div>
   <div class="sggrid">${TR_SG.map(([k,l,,sh])=>`<button class="card fmtc" data-sg="${k}" aria-pressed="${(NR.sg||'course')===k}"><b>${l}</b><span>${sh}</span></button>`).join('')}</div>
   <details class="moretees"${NR.format!=='stroke'||!NR.hcp?' open':''}><summary>Scoring: ${NR.format==='stableford'?'points':'total strokes'}, ${NR.hcp?'handicap on':'handicap off'} · change</summary>`:''}
   <div class="lbl">Game ${hlp('stableford')}</div>
   <div class="fmt">${['stroke','stableford'].map(k=>`<button class="card fmtc" data-f="${k}" aria-pressed="${NR.format===k}" style="margin-bottom:8px"><b>${FORMATS[k].name}</b><span>${FORMATS[k].desc}</span></button>`).join('')}</div>
   <div class="lbl">Handicaps ${hlp('net')}</div>
   <div class="seg" role="group" aria-label="Handicaps"><button data-h="0" aria-pressed="${!NR.hcp}">Gross, no strokes</button><button data-h="1" aria-pressed="${NR.hcp}">Net, with strokes</button></div>
   <p class="muted" style="font-size:14px;margin-top:6px">${NR.hcp?'Net: your handicap strokes come off, so players of any level have a fair shot.':'Gross: just the strokes you took, no handicap.'}</p>
   ${count===1?`<p class="muted" style="font-size:14px;margin:8px 0 0">Playing with a buddy who isn't on the app? Tap Add a guest above for skins or a Nassau.</p></details>`:''}
   ${count>1?`<div class="lbl">Side game ${hlp('skins')}</div>
   <div class="chips2">${Object.entries(GAMES).filter(([k])=>canNassau||!k.startsWith('na')).map(([k,[l]])=>`<button class="chip2" data-game="${k}" aria-pressed="${NR.game===k}">${l}</button>`).join('')}</div>
   ${NR.game.startsWith('na')?`<p class="note"><i class="ph-bold ph-info"></i><span>${count===4?(()=>{const nm=[...NR.who.map(id=>{const p=pool.find(x=>x.id===id);return p?first(p.name):'?'}),...NR.guests.map(p=>first(p.name))];return esc(nm[0]+' & '+nm[2]+' vs '+nm[1]+' & '+nm[3])+', better ball. '})():''}Front 9, back 9 and overall, ${NR.hcp?'net':'gross'}. Change sides from the coin button on the first tee.</span></p>`:''}
   <p class="note"><i class="ph-bold ph-coins"></i><span>The app keeps the money as you score. More bets from the coin button on any hole.</span></p>`:''}
   ${c.custom||c.stdsi?`<p class="note"><i class="ph-bold ph-info"></i><span>${esc(c.name)} uses a standard handicap hole order until its real card is loaded.</span></p>`:''}
   ${c.est?`<p class="note"><i class="ph-bold ph-info"></i><span>No rating or slope on file for this course yet, so handicaps use par and 113 and the round stays out of your handicap estimate.</span></p>`:''}
   <div style="height:96px"></div><div class="stick"><button class="btn block" id="goR">Tee off <i class="ph-bold ph-arrow-right"></i></button></div>`;
  document.querySelectorAll('[data-co]').forEach(b=>b.onclick=()=>{NR.course=b.dataset.co;NR.tee=null;trNew(gid)});
  document.querySelectorAll('[data-tee]').forEach(b=>b.onclick=()=>{NR.tee=b.dataset.tee;trNew(gid)});
  document.querySelectorAll('[data-pl]').forEach(b=>b.onclick=()=>{const id=b.dataset.pl;if(id==='me')return;const i=NR.who.indexOf(id);
    if(i>=0)NR.who.splice(i,1);else if(count<4)NR.who.push(id);trNew(gid)});
  document.querySelectorAll('[data-ug]').forEach(b=>b.onclick=()=>{NR.guests.splice(+b.dataset.ug,1);trNew(gid)});
  document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{NR.format=b.dataset.f;trNew(gid)});
  document.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{NR.hcp=b.dataset.h==='1';trNew(gid)});
  document.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>{NR.game=b.dataset.game;trNew(gid)});
  document.querySelectorAll('[data-sg]').forEach(b=>b.onclick=()=>{NR.sg=b.dataset.sg;(G.pref||(G.pref={})).sg=NR.sg;gsave();trNew(gid)});
  $('#addCo').onclick=()=>trAddCourse(gid);$('#findCo').onclick=()=>trFind(gid);
  const ot=$('#ownTee');if(ot)ot.onclick=()=>{const base=tees.find(t=>t.id===NR.tee)||tees[tees.length-1];
    $('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">Your tee at ${esc(c.name)}</h2>
     <p class="muted" style="margin:4px 0 10px">Off the scorecard, the women's rating and slope for the tee you play.</p>
     <input class="field" id="otN" placeholder="Tee name, like Red" value="${esc(base.name.replace(/ · W$/,''))}" autocomplete="off">
     <div class="trrow2" style="margin-top:8px"><input class="field" id="otR" type="number" inputmode="decimal" step="0.1" placeholder="Rating, like 70.1"><input class="field" id="otS" type="number" inputmode="numeric" placeholder="Slope, like 121"></div>
     <button class="btn block" style="margin-top:12px" id="otSave">Save for this course</button><button class="btn ghost block" style="margin-top:8px" id="closeSheet">Cancel</button>`;
    trOpen();$('#otR').focus();
    $('#otSave').onclick=()=>{const rt=parseFloat($('#otR').value),sl=parseInt($('#otS').value);if(!(rt>50&&rt<85)){$('#otR').focus();return}if(!(sl>=55&&sl<=155)){$('#otS').focus();return}
      const t={id:'my'+Date.now().toString(36),name:($('#otN').value.trim()||'My tee')+' · W',rating:rt,slope:sl,y:(base.y||[]).slice()};
      const mt=(G.myTees||(G.myTees={}));(mt[NR.course]||(mt[NR.course]=[])).push(t);c.tees.push(t);NR.tee=t.id;gsave();closeSheet();trNew(gid)}};
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
    cfg:{format:NR.format,tee:NR.tee,hcp:NR.hcp,allow:FORMATS[NR.format].allow,ctp:[],ld:0,skins:'off',buyin:0,sg:ps.length===1?NR.sg||'course':null},players:ps,
    bench:g?g.members.filter(p=>p.id!=='me'&&!NR.who.includes(p.id)).map(p=>({id:p.id,name:p.name,hcp:p.hcp,club:''})):[]};
  trRecent(NR.course);(G.lastTee||(G.lastTee={}))[NR.course]=NR.tee;if(g){g.format=NR.format;g.game=NR.game}
  const gm=GAMES[NR.game]&&GAMES[NR.game][1];
  if(gm&&ps.length>1){const b={...gm,net:NR.hcp};if(b.type==='skins')b.carry=true;
    if(b.type==='nassau'){const ids=ps.map(p=>p.id);b.a=ids.length===4?[ids[0],ids[2]]:[ids[0]];b.b=ids.length===4?[ids[1],ids[3]]:[ids[1]]}
    try{localStorage.setItem('rngc-scorecard-v2:'+id,JSON.stringify({bets:{g:[b]}}))}catch(e){}}
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
      G.courses[id]=co;COURSES[id]=co;trRecent(id);gsave();NR.course=id;NR.tee='main';closeSheet();trNew(gid)}};
  draw()}

/* ---------- course library: every course in California, Nevada and Arizona ----------
   courses/index.json lists them all; courses/c/<id>.json holds the card, tees and hole maps (built by tools/courses/build_courses.py).
   Data: OpenGolfAPI and OpenStreetMap contributors, ODbL 1.0. A picked course is kept on the phone so it works with no signal. */
let LIB=null,LIBP=null;const FQ={q:'',st:'',near:null};
function trLib(){if(LIB)return Promise.resolve(LIB);
  if(!LIBP)LIBP=fetch('courses/index.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(j=>{LIB=j;return j}).catch(e=>{LIBP=null;throw e});return LIBP}
function trCoChips(){const rec=(G.recent||[]).filter(k=>COURSES[k]).slice(0,5),out=rec.map(k=>[k,COURSES[k]]);   /* your latest courses first */
  if(!out.length)out.push(G.home&&COURSES[G.home]?[G.home,COURSES[G.home]]:['chimera',COURSES.chimera]);
  const i=out.findIndex(([k])=>k===NR.course);if(i>0)out.unshift(out.splice(i,1)[0]);else if(i<0&&COURSES[NR.course])out.unshift([NR.course,COURSES[NR.course]]);return out}
const trMi=(a,b,c,d)=>{const r=Math.PI/180,x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 7918*Math.asin(Math.sqrt(x))};
const trFold=t=>t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function greenSvg(n){const m=CO().maps&&CO().maps[n];if(!m)return'';const[gx,gy]=m.greenAt,R=Math.max(38,m.depth/YD*1.6);
  const fill={fairway:'#3f7a4c',green:'#6fbf7a',tee:'#57935f',bunker:'#e4d6ac',water:'#3f78b5'};
  const sh=m.shapes.filter(([k])=>k!=='tee').map(([k,d])=>`<path d="${d}" fill="${fill[k]}" fill-rule="evenodd"${k==='bunker'?' stroke="#c9b98c" stroke-width=".4"':''}/>`).join('');
  return `<svg viewBox="${gx-R} ${gy-R} ${2*R} ${2*R}" role="img" aria-label="Close-up of the green on hole ${n}">${sh}<circle cx="${gx}" cy="${gy}" r="${R/40}" fill="#0a0b0d"/><line x1="${gx}" y1="${gy}" x2="${gx}" y2="${gy-R/4}" stroke="#0a0b0d" stroke-width="${R/70}"/><path d="M${gx} ${gy-R/4}l${R/8} ${R/22}-${R/8} ${R/22}z" fill="#e25c5c"/></svg><small>Green, ${m.depth} yds deep</small>`}
const trHomeLL=()=>G.homeInfo&&G.homeInfo.lat?[G.homeInfo.lat,G.homeInfo.lng]:null;
function trFind(gid,cb){FQ.cb=cb||null;
  $('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">${cb?'Pick your home course':'Find a course'}</h2>
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
    const ref=FQ.near||(!words.length&&!FQ.st?trHomeLL():null);
    if(ref)rs=rs.map(c=>[c,trMi(ref[0],ref[1],c[4],c[5])]).sort((a,b)=>a[1]-b[1]);
    else rs=rs.map(c=>[c,null]).sort((a,b)=>((b[0][6]>=18)-(a[0][6]>=18))||(b[0][7]-a[0][7])||(b[0][8]-a[0][8])||a[0][1].localeCompare(b[0][1]));
    const n=rs.length;rs=rs.slice(0,40);
    const rec=!words.length&&!cb?(G.recent||[]).filter(k=>COURSES[k]):[];
    box.innerHTML=(rec.length?`<div class="sublbl">Your courses</div>${rec.map(k=>`<button class="rrow" data-pick="${esc(k)}"><div><b>${esc(COURSES[k].name)}</b><span>${esc(COURSES[k].city||'')}</span></div><em>played</em></button>`).join('')}<div class="sublbl" style="margin-top:12px">${FQ.near?'Closest to you':ref?'Closest to your home course':'All courses'}</div>`:'')+(n?`<p class="muted" style="font-size:13px">${n.toLocaleString()} course${n===1?'':'s'}${!rec.length&&ref&&!FQ.near?' · closest to your home course first':''}${n>40?', showing 40':''}</p>`:`<p class="muted">No course by that name. Try the city, or add your own.</p>`)+
     rs.map(([c,d])=>`<button class="rrow" data-pick="${esc(c[0])}"><div><b>${esc(c[1])}</b><span>${esc(c[2]?c[2]+', ':'')}${c[3]}${c[6]?' · '+c[6]+' holes':''}</span><div style="margin-top:3px"><span class="ctag ${c[7]===2?'ok':''}">${c[7]===2?'Full card':c[7]===1?'Pars only':'Card needed'}</span>${c[8]?'<span class="ctag ok">Hole maps</span>':''}</div></div><em>${d!=null?(d<10?d.toFixed(1):Math.round(d))+' mi':''}</em></button>`).join('');
    box.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>trPick(b.dataset.pick,gid,b,cb))};
  trLib().then(list).catch(()=>{$('#fqL').innerHTML='<p class="muted">The course list needs a signal the first time. Try again in a moment, or add your own.</p>'})}
function trPick(id,gid,btn,cb){const row=LIB&&LIB.courses.find(c=>c[0]===id),info=row?{name:row[1],city:(row[2]?row[2]+', ':'')+row[3],lat:row[4],lng:row[5]}:(COURSES[id]?{name:COURSES[id].name,city:COURSES[id].city,lat:COURSES[id].lat,lng:COURSES[id].lng}:null);
  if(COURSES[id]){if(cb)return cb(id,info);NR.course=id;NR.tee=null;trRecent(id);closeSheet();trNew(gid);return}
  if(btn)btn.style.opacity=.5;
  fetch('courses/c/'+encodeURIComponent(id)+'.json').then(r=>{if(!r.ok)throw new Error(r.status);return r.json()}).then(d=>{
    if(d.app){const co=Object.assign(d.app,{lat:d.lat,lng:d.lng,phone:d.phone||'',web:d.website||''});G.courses[id]=co;COURSES[id]=co;gsave();if(cb)return cb(id,info);NR.course=id;NR.tee=null;trRecent(id);closeSheet();trNew(gid);return}
    if(cb)return cb(id,info);trAddCourse(gid,{lib:id,name:d.name,city:((d.city||'')+', '+d.state).replace(/^, /,''),pp:d.pp||null})})
   .catch(()=>{if(btn)btn.style.opacity=1;if(cb&&info)return cb(id,info);if(row)trAddCourse(gid,{lib:id,name:row[1],city:(row[2]?row[2]+', ':'')+row[3]})})}

/* ---------- a saved round ---------- */
/* signed in to the club site: the golf tab already knows who you are */
function trSiteMe(){try{const s=JSON.parse(localStorage.getItem('rngc-site-v2')||'{}');if(!s.member||s.demo||!s.name)return null;return{name:String(s.name).slice(0,24),ghin:(s.cfg&&s.cfg.my&&s.cfg.my.ghin)||null}}catch(e){return null}}
function trBig(){document.body.classList.toggle('bigt',!!G.big);document.body.classList.toggle('sun',!!(G.pref||{}).sun&&!location.hash.startsWith('#/tv'))}
trBig();
{const sm=trSiteMe();if(sm&&G.me.name!==sm.name)trSetMe(sm.name,G.me.hcp)}

/* solo games: what a golfer playing alone plays against */
const TR_SG=[['course','Beat par, hole by hole','Each hole, beat par with your handicap and you win it. Tie par and the hole is even.','Win a hole when you beat par with your free strokes.'],['best','Beat my best here','See how you stand against your best round at this course, hole by hole.','Race your best round at this course.'],['pts','Score points','Points each hole, with your handicap: 2 for par, 3 for a birdie. 36 points means you played to your handicap.','2 points for par, 3 for a birdie.'],['none','Just my score','No game, just keep score.','No game. Just keep score.']];
/* hole screen: you against your best round at this course, and how you usually play this hole */
function trSoloLine(n){if(!CASUAL||!LIVE)return'';const t=myTeam();if(!ids(t).includes('me'))return'';
  const cid=LIVE.course,mine=trMine().filter(x=>x.r.course===cid&&x.p.holes===18);
  const done=order(t.start).filter(h=>mySc('me',h)!=null),hs=mine.map(x=>x.p.scores[n]).filter(v=>v!=null);
  const par=CO().par[n-1],avg=hs.length?trAvg(hs):null,low=hs.length?Math.min(...hs):null;
  const holeTxt=hs.length>=2?`This hole: you average <b>${trOne(avg)}</b>${avg-par>=.95?', play it safe':avg-par<=.35?', a good chance to score':''}, best ${low}.`:'';
  const solo=players(t).length===1,vm=solo?trVs(Object.fromEntries(order(t.start).map(h=>[h,mySc('me',h)])),CO().par,CO().si,playHcp(idx('me'))):null;
  const sg=solo?(CFG().sg||'course'):null;
  if(sg==='none')return holeTxt?`<div class="card solol"><i class="ph-bold ph-target"></i><span>${holeTxt}</span></div>`:'';
  if(sg==='pts'){const ph=playHcp(idx('me'));let pt=0,th=0;for(const h of done){pt+=stbl(mySc('me',h)-strokesOn(ph,h),CO().par[h-1]);th++}const pace=th>=3?Math.round(pt/th*18):null;
    return `<div class="card solol"><i class="ph-bold ph-target"></i><span>Points goal: <b class="${pace!=null&&pace>=36?'under':pace!=null&&pace<30?'over':''}">${pt} point${pt===1?'':'s'}</b> thru ${th}${pace!=null?`, on pace for ${pace}`:''}. 36 means you played to your handicap. Net par = 2, net birdie = 3.${holeTxt?' '+holeTxt:''}</span></div>`}
  const vsTxt=solo&&sg==='course'?(vm.t?`Beat par: <b class="${vm.up>0?'under':vm.up<0?'over':''}">${trVsTxt(vm.up)}</b> thru ${vm.t}. `:`Beat par to win a hole. Your handicap counts. `):'';
  if(!mine.length)return vsTxt?`<div class="card solol"><i class="ph-bold ph-sword"></i><span>${vsTxt}${holeTxt}</span></div>`:holeTxt?`<div class="card solol"><i class="ph-bold ph-target"></i><span>${holeTxt}</span></div>`:`<div class="card solol"><i class="ph-bold ph-flag"></i><span>First round at this course on the app. Today sets your mark to beat.</span></div>`;
  const best=mine.slice().sort((a,b)=>a.p.gross-b.p.gross)[0],bs=best.p.scores;
  const both=done.filter(h=>bs[h]!=null),d=trSum(both.map(h=>mySc('me',h)))-trSum(both.map(h=>bs[h]));
  const vs=both.length?`vs your best here, ${best.p.gross} on ${trDay(best.r.date)}: <b class="${d<0?'under':d>0?'over':''}">${d===0?'even':Math.abs(d)+(d<0?' better':' behind')}</b> thru ${both.length}.`:`Your best here is ${best.p.gross}. Beat it today.`;
  return `<div class="card solol"><i class="ph-bold ph-target"></i><span>${vsTxt}${vs}${holeTxt?' '+holeTxt:''}</span></div>`}

/* where your strokes go: par 3s, 4s and 5s, tee shot misses, putts on greens you hit, your toughest hole */
function trWhere(my,full){if(full.length<2)return'';const by={3:[],4:[],5:[]};
  for(const{r,p}of full)for(let h=1;h<=18;h++){const v=p.scores[h],pr=r.par[h-1];if(v!=null&&by[pr])by[pr].push(v-pr)}
  const S_=k=>trSum(my.map(x=>x.p[k]||0)),fwl=S_('fwl'),fwr=S_('fwr'),fwn=S_('fwn'),gp=S_('gp'),gir=S_('gir');
  const row=(l,v,sub)=>`<div class="trow"><span>${l}${sub?`<br><span class="muted" style="font-size:13px">${sub}</span>`:''}</span><b class="${v>0.05?'o':v<-0.05?'u':''}">${v>0?'+':''}${trOne(v)}</b></div>`;
  const pt=[3,4,5].filter(k=>by[k].length).map(k=>[k,trAvg(by[k])]),worst=pt.slice().sort((a,b)=>b[1]-a[1])[0];
  /* toughest hole at the course you play most */
  const cc={};for(const x of full)cc[x.r.course]=(cc[x.r.course]||[]).concat([x]);const top=Object.values(cc).sort((a,b)=>b.length-a.length)[0];
  let tough='';if(top&&top.length>=2){const hh=[];for(let h=1;h<=18;h++){const v=top.map(x=>x.p.scores[h]-x.r.par[h-1]).filter(v=>!isNaN(v));if(v.length)hh.push([h,trAvg(v)])}
    const w=hh.sort((a,b)=>b[1]-a[1])[0];if(w)tough=`<div class="trow"><span>Toughest hole at ${esc(top[0].r.cname)}<br><span class="muted" style="font-size:13px">over ${top.length} rounds</span></span><b class="o">#${w[0]} · +${trOne(w[1])}</b></div>`}
  return `<div class="lbl">Where your strokes go</div><section class="card tcard where">
   ${pt.map(([k,v])=>row(`Par ${k}s`,v,`average to par${worst&&worst[0]===k&&v>0.3?' · your costliest':''}`)).join('')}
   ${fwn>=6?`<div class="trow"><span>Missed fairways<br><span class="muted" style="font-size:13px">${fwl+fwr} of ${fwn} tee shots</span></span><b>${fwl>=fwr*1.5?'Mostly left':fwr>=fwl*1.5?'Mostly right':'Both sides'} · ${fwl}L ${fwr}R</b></div>`:''}
   ${(()=>{const a={s:0,l:0,lf:0,r:0};for(const x of my)if(x.p.ap)for(const k in a)a[k]+=x.p.ap[k]||0;const t=a.s+a.l+a.lf+a.r;if(t<5)return'';const top=Object.entries(a).sort((p,q)=>q[1]-p[1])[0],nm={s:'short',l:'long',lf:'left',r:'right'};return `<div class="trow"><span>Missed greens<br><span class="muted" style="font-size:13px">${t} approach misses tracked · ${a.s} short, ${a.l} long, ${a.lf} left, ${a.r} right</span></span><b>${top[1]>=t*.45?'Mostly '+nm[top[0]]:'All around'}</b></div>`})()}
   ${gir>=4?`<div class="trow"><span>Putts on greens you hit<br><span class="muted" style="font-size:13px">tour pros average about 1.8</span></span><b>${trOne(gp/gir)}</b></div>`:''}
   ${tough}</section>`}

/* strokes lost to a scratch golfer: rough tour-stat benchmarks per par type, plus putting, so the gap has a name */
function trScratch(my,full){if(full.length<3)return'';const base={3:.15,4:.05,5:-.25},lost={3:0,4:0,5:0};
  for(const{r,p}of full)for(let h=1;h<=18;h++){const v=p.scores[h],pr=r.par[h-1];if(v!=null&&base[pr]!=null)lost[pr]+=v-pr-base[pr]}
  const n=full.length,rows=[[`Par 3s`,lost[3]/n,'tee shots into the green'],[`Par 4s`,lost[4]/n,'drive plus approach'],[`Par 5s`,lost[5]/n,'scratch players birdie about 1 in 4']];
  const pn=trSum(my.map(x=>x.p.pn||0)),pt=trSum(my.map(x=>x.p.pn?x.p.putts||0:0));
  const putt=pn>=18?(pt/pn-1.64)*18:null,tot=rows.reduce((a,x)=>a+x[1],0),big=rows.slice().sort((a,b)=>b[1]-a[1])[0];
  const row=(l,v,sub)=>`<div class="trow"><span>${l}<br><span class="muted" style="font-size:13px">${sub}</span></span><b class="${v>0.05?'o':v<-0.05?'u':''}">${v>0?'+':''}${trOne(v)}</b></div>`;
  return `<div class="lbl">You vs a scratch golfer</div><section class="card tcard where">
   <p class="muted" style="font-size:14px;margin:0 0 4px">Strokes a round you give up next to a scratch golfer on the same holes. Your biggest gap is the place to practice.</p>
   ${rows.map(([l,v,sub])=>row(l+(big&&big[0]===l&&v>0.5?' · biggest gap':''),v,sub)).join('')}
   ${putt!=null?row('Putting',putt,`${trOne(pt/pn)} putts a hole vs about 1.6 for scratch · part of the totals above`):''}
   <div class="trow"><span><b>Total</b><br><span class="muted" style="font-size:13px">over ${n} full rounds</span></span><b>${tot>0?'+':''}${trOne(tot)}</b></div></section>`}

/* strokes gained, estimated from the hole stats a golfer taps (fairway, putts, penalties), split into tee, approach, short game and putting.
   Each baseline: average over par by par type, fairways hit, putts on greens hit, putts after a missed green, shots to get on from around the green. */
const TR_SGB={tour:{l:'Tour pro',nm:'tour pro',o:{3:.05,4:.03,5:-.45},fw:.6,pg:1.78,pm:1.4,ag:1.05},scr:{l:'Scratch',nm:'scratch golfer',o:{3:.25,4:.15,5:-.1},fw:.57,pg:1.85,pm:1.5,ag:1.12},
  h10:{l:'10 handicap',nm:'10 handicap',o:{3:.7,4:.75,5:.65},fw:.47,pg:1.98,pm:1.65,ag:1.3},h20:{l:'20 handicap',nm:'20 handicap',o:{3:1.2,4:1.4,5:1.3},fw:.38,pg:2.1,pm:1.8,ag:1.5}};
const TR_SGL=[['Off the tee','drives on par 4s and 5s, penalties'],['Approach','getting on the green in regulation'],['Around the green','chips and pitches after a missed green'],['Putting','putts against the baseline for where you were']];
function trSgB(){const b=(G.pref||{}).sgb;if(TR_SGB[b])return b;const h=G.me.hcp!=null?G.me.hcp:(trEst().v);return h==null?'h20':h<=7?'scr':h<=16?'h10':'h20'}
function trSgHole(b,par,sc,pt,fw,pen){const B=TR_SGB[b],reach=sc-pt,gir=reach<=par-2;pen=pen||0;
  let tee=0;if(par>3){if(fw==='hit')tee=.3*(1-B.fw);else if(fw)tee=-.3*B.fw;tee-=pen}
  const putt=(gir?B.pg:B.pm)-pt,arg=gir?0:B.ag-Math.max(1,reach-pen-(par-2)),tot=par+(B.o[par]!=null?B.o[par]:B.o[4])-sc;
  return [tee,tot-tee-arg-putt,arg,putt]}
function trSgAgg(list,b){const s=[0,0,0,0];let n=0;for(const{r,p}of list){if(!p.sh)continue;for(const h in p.sh){const sc=p.scores[h],pr=r.par[h-1],[pt,fw,pen]=p.sh[h];if(sc==null||pt==null||!pr)continue;
  const v=trSgHole(b,pr,sc,pt,fw,pen);for(let i=0;i<4;i++)s[i]+=v[i];n++}}return{n,v:n?s.map(x=>x/n*18):null}}
const trSgF=v=>(v>0.05?'+':'')+(Math.abs(v)<0.05?'0.0':trOne(v));
function trSG(my){const b=trSgB(),L=my.slice(0,20),all=trSgAgg(L,b);if(all.n<18)return'';const last=trSgAgg(L.slice(0,1),b),B=TR_SGB[b];
  const tot=all.v.reduce((a,x)=>a+x,0),worst=all.v.indexOf(Math.min(...all.v)),best=all.v.indexOf(Math.max(...all.v));
  const row=(i)=>`<div class="trow"><span>${TR_SGL[i][0]}${i===worst&&all.v[i]<-0.3?' · <b class="o">practice here</b>':i===best&&all.v[i]>0.3?' · <b class="u">your strength</b>':''}<br><span class="muted" style="font-size:13px">${TR_SGL[i][1]}${last.n>=9&&L.length>1?' · last round '+trSgF(last.v[i]):''}</span></span><b class="${all.v[i]>0.05?'u':all.v[i]<-0.05?'o':''}">${trSgF(all.v[i])}</b></div>`;
  const nm=['off the tee','on approach shots','around the green','putting'],lo=all.v[worst],hi=all.v[best];
  const plain=`<p style="font-size:16px;line-height:1.4;margin:0 0 6px">${lo<-0.3?`You lose the most strokes <b>${nm[worst]}</b>, about ${trOne(Math.abs(lo))} a round next to a ${B.nm}.`:`No one area costs you much next to a ${B.nm}.`}${hi>0.3&&best!==worst?` You're best ${nm[best]}.`:''}</p>`;
  const beg=(G.me.hcp!=null?G.me.hcp:trEst().v||30)>18;
  return `<div class="lbl">Where your strokes go</div><section class="card tcard where">${plain}
   ${beg?`<details class="whyd"><summary><i class="ph-bold ph-caret-right"></i> Show the numbers</summary>`:''}
   <p class="muted" style="font-size:14px;margin:0 0 6px">Strokes a round you gain (+) or lose (-) against a ${B.nm} on the same holes, from ${all.n} holes you tracked.</p>
   <div class="chips2" role="group" aria-label="Compare me to" style="margin:0 0 6px">${Object.entries(TR_SGB).map(([k,x])=>`<button class="chip2" data-sgb="${k}" aria-pressed="${k===b}">${x.l}</button>`).join('')}</div>
   ${[0,1,2,3].map(row).join('')}
   <div class="trow"><span><b>Total</b><br><span class="muted" style="font-size:13px">per 18 holes vs a ${B.nm}</span></span><b class="${tot>0.05?'u':tot<-0.05?'o':''}">${trSgF(tot)}</b></div>
   <p class="muted" style="font-size:13px;margin:6px 0 0">Worked out from fairways, putts and penalties you tap. Shot-by-shot tracking with distances would make it exact.</p>${beg?'</details>':''}</section>`}
function trRoundSG(r,me){if(!me.sh)return'';const b=trSgB(),a=trSgAgg([{r,p:me}],b);if(a.n<9)return'';const v=a.v.map(x=>x*a.n/18);
  return `<p class="note"><i class="ph-bold ph-chart-bar"></i><span>Strokes gained vs a ${TR_SGB[b].nm}, ${a.n} holes tracked: tee <b>${trSgF(v[0])}</b> · approach <b>${trSgF(v[1])}</b> · around the green <b>${trSgF(v[2])}</b> · putting <b>${trSgF(v[3])}</b>.</span></p>`}
/* does this round count toward the handicap the app works out: best k of the last 20 rated rounds */
function trCountsLine(r,me){if(me.diff==null||r.est||me.par<(me.holes===9?33:66))return'';const est=trEst();if(est.v==null)return`<p class="note"><i class="ph-bold ph-list-checks"></i><span>Today counts as a <b>${me.diff}</b> handicap round. ${3-est.n>0?(3-est.n)+' more round'+(3-est.n===1?'':'s')+' and the app works out your handicap.':''}</span></p>`;
  const rows=trMine().filter(x=>x.p.diff!=null&&!x.r.est&&x.p.par>=(x.p.holes===9?33:66)).slice(0,20),inW=rows.some(x=>x.r.id===r.id),used=new Set(rows.slice().sort((a,b)=>a.p.diff-b.p.diff).slice(0,est.k).map(x=>x.r.id));
  return `<p class="note"><i class="ph-bold ph-list-checks"></i><span>Handicap round <b>${me.diff}</b> · ${!inW?'older than your last 20, so it no longer counts':used.has(r.id)?`<b>counts</b>: one of your best ${est.k} of ${rows.length}, which work out to ${trHc(est.v)}`:`doesn't count: only your best ${est.k} of ${rows.length} do`}.</span></p>`}

/* stat trends: your last 5 rounds vs the 5 before, for the stats you track */
function trTrends(my){const t=my.filter(x=>x.p.pn||x.p.fwn);if(t.length<6)return'';const a=t.slice(0,5),b=t.slice(5,10);
  const rate=(L,f,g)=>{const n=trSum(L.map(x=>x.p[g]||0));return n?trSum(L.map(f))/n:null};
  const st=[['Putts a hole',L=>rate(L,x=>x.p.putts||0,'pn'),2,-1],['Fairways hit',L=>rate(L,x=>x.p.fw||0,'fwn'),'%',1],['Greens hit',L=>rate(L,x=>x.p.gir||0,'pn'),'%',1]];
  const rows=st.map(([l,f,u,good])=>{const now=f(a),was=f(b);if(now==null||was==null)return'';const d=now-was,better=d*good>0;
    const fmt=v=>u==='%'?Math.round(v*100)+'%':trOne(v);return `<div class="trow"><span>${l}<br><span class="muted" style="font-size:13px">was ${fmt(was)} the 5 rounds before</span></span><b class="${Math.abs(d)<(u==='%'?.03:.05)?'':better?'u':'o'}">${fmt(now)} ${Math.abs(d)<(u==='%'?.03:.05)?'· same':better?'· better':'· worse'}</b></div>`}).join('');
  return rows?`<div class="lbl">Trends · last 5 rounds</div><section class="card tcard where">${rows}</section>`:''}

/* personal bests */
function trRecs(list){if(!list.length)return null;const low=list.slice().sort((a,b)=>a.p.gross-b.p.gross)[0];
  const bir=list.filter(x=>x.p.mix).sort((a,b)=>(b.p.mix.b+b.p.mix.e)-(a.p.mix.b+a.p.mix.e))[0];
  const pf=list.filter(x=>x.p.pn===18).sort((a,b)=>a.p.putts-b.p.putts)[0];
  let streak=null;for(const x of list){let c=0,m=0;for(let h=1;h<=18;h++){const v=x.p.scores[h];if(v!=null&&v<=x.r.par[h-1]){c++;m=Math.max(m,c)}else c=0}if(!streak||m>streak.n)streak={n:m,x}}
  return{low,bir,pf,streak}}
function trRecords(full){const R=trRecs(full);if(!R||full.length<2)return'';const b=R.bir?R.bir.p.mix.b+R.bir.p.mix.e:0;
  return `<div class="lbl">Personal bests</div><div class="recs">
   <div class="card"><b>${R.low.p.gross}</b><span>Low round · ${esc(R.low.r.cname)}, ${trDay(R.low.r.date)}</span></div>
   <div class="card"><b>${b}</b><span>Most birdies in a round${b&&R.bir?' · '+trDay(R.bir.r.date):''}</span></div>
   <div class="card"><b>${R.streak?R.streak.n:0}</b><span>Pars or better in a row</span></div>
   <div class="card"><b>${R.pf?R.pf.p.putts:'-'}</b><span>${R.pf?'Fewest putts, 18 tracked':'Fewest putts: track all 18 once'}</span></div></div>`}
function trNewBests(r,me){if(me.holes!==18||me.par<66)return'';const prev=trMine().filter(x=>x.r.date<r.date&&x.p.holes===18&&x.p.par>=66);if(prev.length<2)return'';
  const R=trRecs(prev),out=[],b=me.mix?me.mix.b+me.mix.e:0;
  if(me.gross<R.low.p.gross)out.push('New low round');
  const here=prev.filter(x=>x.r.course===r.course);if(here.length&&me.gross<Math.min(...here.map(x=>x.p.gross))&&!out.length)out.push('Best ever at this course');
  if(R.bir&&b>R.bir.p.mix.b+R.bir.p.mix.e)out.push('Most birdies ever: '+b);
  if(R.pf&&me.pn===18&&me.putts<R.pf.p.putts)out.push('Fewest putts ever: '+me.putts);
  let c=0,m=0;for(let h=1;h<=18;h++){const v=me.scores[h];if(v!=null&&v<=r.par[h-1]){c++;m=Math.max(m,c)}else c=0}if(R.streak&&m>R.streak.n)out.push(m+' pars or better in a row, a record');
  return out.length?`<div class="newbest">${out.map(x=>`<span>🏆 ${esc(x)}</span>`).join('')}</div>`:''}

/* Stableford points hole by hole, with your strokes */
function trPtsRow(r,me){const ph=r.hcp?(me.ph!=null?me.ph:Math.round(me.ch*.95)):0,pt=h=>me.scores[h]==null?'':stbl(me.scores[h]-trSt(ph,r.si[h-1]),r.par[h-1]);
  const nine=a=>a.map(h=>`<td>${pt(h)}</td>`).join('');
  return `<section class="card" style="padding:10px 12px;margin-top:8px"><b style="font-size:15px">Points by hole</b>${r.hcp?' <span class="muted" style="font-size:13px">with your strokes</span>':''}
   <table class="stbl ptsr"><tr><th>1-9</th>${nine([1,2,3,4,5,6,7,8,9])}</tr><tr><th>10-18</th>${nine([10,11,12,13,14,15,16,17,18])}</tr></table></section>`}
/* a round as text you can send: score, to par, net, nines and stats */
function trRoundText(r,me){const s=me.scores,sum=a=>a.every(h=>s[h]!=null)?trSum(a.map(h=>s[h])):null,o=sum([1,2,3,4,5,6,7,8,9]),i=sum([10,11,12,13,14,15,16,17,18]);
  const b=me.mix?me.mix.b+me.mix.e:0;
  return `${r.cname}${r.tee&&r.tee!=='Tees'?', '+r.tee+' tees':''} · ${trDay(r.date)}\n`+
   (r.format==='stableford'&&me.pts!=null?`${me.pts} Stableford points, shot ${me.gross}\n`:`Shot ${me.gross} (${toPar(me.gross-me.par)})${r.hcp&&me.net!=null?', net '+me.net:''}${me.holes<18?' for '+me.holes+' holes':''}\n`)+
   (o!=null&&i!=null?`Front ${o} · Back ${i}\n`:'')+
   (b?`${b} birdie${b===1?'':'s'}\n`:'')+
   (me.pn===me.holes&&me.pn?`${me.putts} putts\n`:'')+
   (me.diff!=null?`Round rated ${trHc(me.diff)} for handicap\n`:'')+
   `\nFrom the RNGC golf app`}
function trRound(id){const r=G.rounds.find(x=>x.id===id);if(!r){location.hash='#/me';return}
  const me=r.players.find(p=>p.id==='me'),co={par:r.par,si:r.si},led=r.money||{};
  const back=r.kind==='event'?'#/events':r.group&&G.groups.some(g=>g.id===r.group)?'#/group/'+r.group:'#/me';
  const nmOf=pid=>{const p=r.players.find(x=>x.id===pid);return p?first(p.name):'?'},tx=trSettle(led,nmOf);
  const sub=trDay(r.date)+' · '+(r.kind==='event'?r.cname:(r.kind==='group'?r.name:'Solo'))+(r.tee&&r.tee!=='Tees'?' · '+r.tee+' tees':'');
  $('#app').innerHTML=trBar(r.kind==='event'?r.name:r.cname,sub,trBack(back))+`
   ${me?`<div class="sumrow">${r.format==='stableford'&&me.pts!=null?`<div class="card"><b>${me.pts}</b><span>Points</span></div><div class="card"><b>${me.gross}</b><span>Score ${toPar(me.gross-me.par)}</span></div>`:`<div class="card"><b>${me.gross}</b><span>Strokes</span></div><div class="card"><b class="${cls(me.gross-me.par)}">${toPar(me.gross-me.par)}</b><span>${(d=>d>0?'Over par':d<0?'Under par':'Par')(me.gross-me.par)}</span></div>`}${r.hcp&&me.net!=null&&r.format!=='stableford'?`<div class="card"><b class="${cls(me.net-me.par)}">${me.net}</b><span>After handicap</span></div>`:`<div class="card"><b>${me.holes}</b><span>Holes</span></div>`}</div>
     ${r.format==='stableford'&&me.pts!=null?trPtsRow(r,me):''}
     ${me.par<66&&me.holes===18?`<p class="note"><i class="ph-bold ph-info"></i><span>Short course, par ${me.par}. It's in your play log but stays out of your handicap read, average and goals.</span></p>`:''}
     ${me.diff!=null&&me.ags!=null&&me.d9==null&&me.par>=66?`<details class="moretees"><summary>How this round counts for your handicap</summary><p class="note"><i class="ph-bold ph-calculator"></i><span>You played like a <b>${trHc(me.diff)}</b> handicap today${G.me.hcp!=null?`, ${trDayVs(me.diff-G.me.hcp)} your ${trHc(G.me.hcp)} handicap`:''}.${r.est?' No rating on file for this course, so it stays out of your estimate.':''} <button class="linkbtn" data-math style="margin:0">How it's figured</button><span class="math" hidden> Your score with blow-up holes capped at double bogey plus your strokes: ${me.ags}. Tees rated ${r.rating} / ${r.slope}. (${me.ags} - ${r.rating}) x 113 / ${r.slope} = ${me.diff}.</span></span></p></details>`:''}
     ${trCountsLine(r,me)}${trRoundSG(r,me)}
     ${me.d9!=null?`<p class="note"><i class="ph-bold ph-calculator"></i><span>This 9 played like a <b>${trHc(me.diff)}</b> handicap${G.me.hcp!=null?`, ${trDayVs(me.diff-G.me.hcp)} your ${trHc(G.me.hcp)} handicap`:''}. <button class="linkbtn" data-math style="margin:0">How it's figured</button><span class="math" hidden> 9-hole round: adjusted ${me.ags} on tees rated ${r.rating/2} for 9, slope ${r.slope}. (${me.ags} - ${r.rating/2}) x 113 / ${r.slope} = ${me.d9}, plus ${me.x9} for the 9 you'd expect at your handicap = ${me.diff} for 18. That's the World Handicap rule for 9s, and it counts toward your estimate.</span></span></p>`:''}
     ${trNewBests(r,me)}
     ${r.sg==='pts'&&me.holes===18&&me.ph!=null?(()=>{let pt=0;for(let h=1;h<=18;h++)if(me.scores[h]!=null)pt+=Math.max(0,2-(me.scores[h]-trSt(me.ph,r.si[h-1])-r.par[h-1]));return `<p class="note"><i class="ph-bold ph-target"></i><span>Points goal: <b>${pt} points</b>. ${pt>=36?'You beat your handicap today.':pt>=32?'Close to your handicap.':'A tough day; 36 means playing to your handicap.'}</span></p>`})():''}
     ${(!r.sg||r.sg==='course')&&r.kind!=='group'&&r.kind!=='event'&&me.holes===18&&me.ph!=null?`<p class="note"><i class="ph-bold ph-sword"></i><span>Beat par game: <b>${trVsEnd(trVs(me.scores,r.par,r.si,me.ph).up)}</b>. Each hole is you against par, after your free strokes.</span></p>`:''}
     ${me.pn||me.fwn?`<div class="tiles"><div class="card"><b>${!me.pn?'-':me.pn===me.holes?me.putts:trOne(me.putts/me.pn)}</b><span>${me.pn===me.holes?'Putts':'Putts a hole'}</span><small>${me.pn} of ${me.holes} holes tracked</small></div><div class="card"><b>${me.fwn?me.fw+' of '+me.fwn:'-'}</b><span>Fairways</span><small>${me.fwn>=5?trPct(me.fw,me.fwn):me.fwn?'small sample':'tap Drive to track'}</small></div><div class="card"><b>${me.pn?me.gir+' of '+me.pn:'-'}</b><span>Greens hit</span><small>${me.pn>=5?trPct(me.gir,me.pn):me.pn?'small sample':'tap Putts to track'}</small></div></div>`:''}
     <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px"><button class="btn ghost" id="shareR"><i class="ph-bold ph-share-fat"></i> Share</button><a class="btn ghost" href="#/log"><i class="ph-bold ph-list-bullets"></i> My rounds</a></div>`
    :r.kind==='event'?`<div class="sumrow"><div class="card"><b>${esc(r.result||'-')}</b><span>${esc(r.format||'')}</span></div><div class="card"><b>${r.pos||'-'}</b><span>Place</span></div><div class="card"><b>${r.holes||'-'}</b><span>Holes</span></div></div>`:''}
   <div class="card paper" style="margin-top:10px">${paperTable(r.players.map(p=>({name:first(p.name),get:h=>p.scores[h],k:1})),co)}</div>
   ${Object.keys(led).length?`<div class="lbl">Side bets</div><section class="card tcard">${r.players.map(p=>{const v=led[p.id]||0;return `<div class="trow"><b>${esc(p.name)}</b><b class="${v>0?'under':v<0?'over':''}">${v>0?'+':''}${money(v)}</b></div>`}).join('')}</section>
     ${r.bets&&r.bets.length?`<p class="muted" style="font-size:14px;margin-top:6px">Game: ${esc(r.bets.join(' + '))}</p>`:''}
     ${(r.betLines||[]).map(x=>`<section class="card tcard" style="margin-top:8px"><div class="trow"><b>${esc(x.name)}</b></div><div class="trow"><span>${esc(x.line).replace(/ · /g,'<br>')}</span></div></section>`).join('')}
     ${r.skins&&r.skins.won.length?`<section class="card tcard" style="margin-top:8px"><div class="trow"><b>Skins hole by hole</b><span class="muted">${money(r.skins.amt)} a skin${r.skins.net?' · net':''}</span></div>${r.skins.won.map(w=>`<div class="trow"><span>Hole ${w.h}${w.n>1?' · '+w.n+' skins with carryover':''}</span><b>${esc(nmOf(w.pid))} +${money(w.amt)}</b></div>`).join('')}${r.skins.carry?`<div class="trow"><span class="muted">${r.skins.carry} skin${r.skins.carry===1?'':'s'} still carrying at the end, nobody won ${r.skins.carry===1?'it':'them'}</span></div>`:''}</section>`:''}
     ${tx.length?`<section class="card tcard" style="margin-top:8px"><div class="trow"><b>Settle up</b></div>${tx.map(x=>`<div class="trow"><span>${esc(x)}</span></div>`).join('')}</section>`:''}
     <button class="btn ghost block" id="shareS" style="margin-top:8px"><i class="ph-bold ph-share-fat"></i> Send the settle-up to the group</button>`:''}
   ${r.kind==='group'&&r.group&&G.groups.some(g=>g.id===r.group)?`<a class="btn block" style="margin-top:12px" href="#/new/${r.group}"><i class="ph-bold ph-arrow-counter-clockwise"></i> Play again with this crew</a>`:''}
   <div class="lbl">Notes</div>
   <textarea class="field" id="rNote" rows="3" maxlength="400" placeholder="Wind, new driver, what worked..." style="padding:10px 12px;min-height:84px">${esc(r.note||'')}</textarea>
   <div class="muted" style="font-size:13px;margin-top:6px">${r.kind==='event'?'':'Teed off '+new Date(r.date).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})+' · '}${esc(r.cname)}${COURSES[r.course]&&COURSES[r.course].city?', '+esc(COURSES[r.course].city):''}</div>
   <button class="linkbtn" id="delR" style="margin:36px 0 28px;color:#e07a6a">Delete this round</button>`;
  document.querySelectorAll('[data-math]').forEach(b=>b.onclick=()=>{const m=b.nextElementSibling;m.hidden=!m.hidden;b.textContent=m.hidden?"How it's figured":"Hide the math"});
  const shS=$('#shareS');if(shS)shS.onclick=()=>trShare(shS,`${r.cname}, ${trDay(r.date)}${r.bets&&r.bets.length?'\n'+r.bets.join(' + '):''}\n${r.players.map(p=>{const v=led[p.id]||0;return first(p.name)+' '+p.gross+'  '+(v>0?'+':'')+money(v)}).join('\n')}${tx.length?'\n\n'+tx.join('\n'):'\n\nAll square, nobody owes.'}\n\nFrom the RNGC golf app. A tally only, settle up among yourselves.`);
  const shR=$('#shareR');if(shR&&me)shR.onclick=()=>trShare(shR,trRoundText(r,me));
  $('#rNote').onchange=()=>{r.note=$('#rNote').value.trim();gsave()};
  $('#delR').onclick=()=>{if(confirm('Delete this round from your history? This can\'t be undone.')){G.rounds=G.rounds.filter(x=>x!==r);gsave();location.hash=back}}}

/* ---------- hooks the scorecard calls ---------- */
/* your own stats on each hole of a personal or group round: drive and putts; greens in regulation work themselves out */
/* ---------- on the hole screen: yards to the green and the money so far ---------- */
let trGpsId=null;
function trGpsStop(){if(trGpsId!=null){try{navigator.geolocation.clearWatch(trGpsId)}catch(e){}trGpsId=null}}
window.addEventListener('hashchange',()=>{if(!/^#\/hole\//.test(location.hash))trGpsStop()});
function holeTop(n){const m=CO().maps&&CO().maps[n];if(!m)return holeInfoBtn(n);const c=TEE().y[n-1]||m.yd,h=Math.round(m.depth/2),nt=holeNotes(n);
  return `<section class="card htop" aria-live="polite"><button class="hmapb" id="hinfo" aria-label="Hole ${n} map and details"><span class="mini">${holeSvg(n,false)}</span><span>${nt?esc(nt.sum):'Hole map'}<em>Map <i class="ph-bold ph-caret-right"></i></em></span></button><div class="yn"><div><b id="yF">${c-h}</b><span>Front</span></div><div><b id="yC">${c}</b><span>Center</span></div><div><b id="yB">${c+h}</b><span>Back</span></div></div>
   <div class="ysub"><span id="ySrc">${G.gps!==false?'Finding you...':'Yards to the green, from the tee'}</span>${G.gps!==false?'':'<button class="linkbtn" id="yGo" style="margin:0;min-height:36px"><i class="ph-bold ph-crosshair"></i> Live yards</button>'}</div></section>`}
function holeYardsWire(n){trGpsStop();const m=CO().maps&&CO().maps[n];if(!m)return;
  const go=$('#yGo');if(go)go.onclick=()=>{G.gps=true;gsave();hole(n)};
  if(G.gps===false||!('geolocation'in navigator))return;
  trGpsId=navigator.geolocation.watchPosition(p=>{window.RNGC_FIX={lat:p.coords.latitude,lng:p.coords.longitude,acc:p.coords.accuracy,t:Date.now()};const g=greenYards(n,p.coords.latitude,p.coords.longitude),src=$('#ySrc');if(!src)return;
    if(g.far){src.textContent=`Yards from the tee · you're ${g.mi} mi from the course`;return}
    if(g.center>(TEE().y[n-1]||m.yd)+20){src.textContent=`Yards from the tee · GPS shows you're not on this hole yet`;return}
    $('#yF').textContent=g.front;$('#yC').textContent=g.center;$('#yB').textContent=g.back;{const ty=TEE().y[n-1]||m.yd,dn=ty-g.center;if(dn>25)src.innerHTML=`<b class="ylive"><i class="ph-fill ph-map-pin"></i> From where you stand</b> · the hole is ${ty} from the tee`;else src.textContent=`Yards from the tee box · ${ty} tee to green`}},
   e=>{const src=$('#ySrc');if(src)src.textContent=e.code===1?'Location is off for this page, showing yards from the tee':'No GPS yet, showing yards from the tee';if(e.code===1){G.gps=false;gsave()}},{enableHighAccuracy:true,maximumAge:3000,timeout:20000})}
function betLine(){if(!CASUAL)return'';const bs=myBets();if(!bs.length)return'';const list=field(),led={};
  for(const b of bs){const r=settleBet(b,list);for(const[k,v]of Object.entries(r.led))led[k]=(led[k]||0)+v}
  const P=PEOPLE(),me=led.me||0,top=Object.entries(led).filter(([k])=>k!=='me').sort((a,b)=>b[1]-a[1])[0];
  const nl=bs.filter(b=>b.type==='nassau'||b.type==='skins').map(b=>settleBet(b,list).line).filter(Boolean).join(' · ');
  return `<a class="card betl" href="#/bets"><i class="ph-bold ph-coins"></i><span>Bets: you're <b class="${me>0?'under':me<0?'over':''}">${me>0?'+':''}${money(me)}</b>${top&&top[1]>0?` · ${esc(first(P[top[0]]?P[top[0]].name:'?'))} +${money(top[1])}`:''}${nl?`<small class="betst">${esc(nl)}</small>`:''}</span><em>Details <i class="ph-bold ph-caret-right"></i></em></a>`}

/* a custom bet with no winner yet: ask on the card before the round is saved */
function betWinPrompt(){if(!CASUAL)return'';const P=PEOPLE(),open=myBets().map((b,i)=>[b,i]).filter(([b])=>b.type==='custom'&&!b.winner);if(!open.length)return'';
  return open.map(([b,i])=>`<section class="card statc"><b style="font-size:15px">Who won "${esc(b.label||'Side bet')}"?</b><div class="r">${b.who.map(pid=>`<button class="chip2" data-bwin="${i}|${pid}">${esc(first(P[pid]?P[pid].name:'?'))}</button>`).join('')}</div></section>`).join('')}
function wireBetWin(){document.querySelectorAll('[data-bwin]').forEach(b=>b.onclick=()=>{const[i,pid]=b.dataset.bwin.split('|');myBets()[+i].winner=pid;save();review()})}

function statCard(n){return'';if(!CASUAL||F().entry!=='players'||!ids(myTeam()).includes('me'))return'';
  const v=S.st[n]||{},par=CO().par[n-1],sc=mySc('me',n),ro=canScore()?'':'disabled';
  const any=v.fw!=null||v.putts!=null||v.sand||v.pen;if(!S.stOpen&&!any)return `<button class="card stopen" id="stOpen"><i class="ph-bold ph-chart-bar"></i> Track my stats: drive, putts</button>`;
  const gir=sc!=null&&v.putts!=null?sc-v.putts<=par-2:null;
  return `<section class="card statc"><div class="sthead"><b>Your stats</b><span class="muted"><button class="linkbtn" id="stClose" style="margin:0 6px 0 0;min-height:32px">Hide</button>${gir!=null?' · '+(gir?'<i class="ph-fill ph-check-circle"></i> green in regulation':'missed the green'):''}</span></div>

   <p class="muted" style="font-size:13px;margin:2px 0 0">Drive and putts are in the bar at the bottom.</p>
   <div class="r"><span></span>${par>3?`<button class="chip2" data-qs="hit|2" aria-pressed="${v.fw==='hit'&&v.putts===2}" ${ro}>Fairway, 2 putts</button>`:''}<button class="chip2" data-sd="1" aria-pressed="${!!v.sand}" ${ro}>Bunker</button><button class="chip2" data-pen="1" aria-pressed="${!!v.pen}" ${ro}>${v.pen?'Penalty '+v.pen:'Penalty'}</button></div></section>`}
/* drive + putts pinned above the Next button so they never hide under it */
function statStrip(n){if(!CASUAL||F().entry!=='players'||!ids(myTeam()).includes('me'))return'';const v=S.st[n]||{},any=v.fw!=null||v.putts!=null||v.sand||v.pen;if(!S.stOpen&&!any)return`<button class="linkbtn sopen" id="stOpen"><i class="ph-bold ph-chart-bar"></i> Track my drive and putts</button>`;
  const par=CO().par[n-1],ro=canScore()?'':'disabled';
  const more=S.stMore||v.sand||v.pen||v.putts===0||v.ap;
  /* one short row so the bar never covers the scores; bunker, penalty and chip-ins sit behind the dots */
  return `<div class="sstrip one">${par>3?`<div class="sg"><span>Drive</span><div>${[['l','L','missed left'],['hit','Fwy','in the fairway'],['r','R','missed right']].map(([k,l,a])=>`<button class="chip2" data-fw="${k}" aria-pressed="${v.fw===k}" aria-label="Drive ${a}" ${ro}>${l}</button>`).join('')}</div></div>`:''}
   <div class="sg"><span>Putts</span><div>${[1,2,3,4].map(k=>`<button class="chip2" data-pt="${k}" aria-pressed="${v.putts===k}" aria-label="${k===4?'4 or more':k} putts" ${ro}>${k===4?'4+':k}</button>`).join('')}</div></div>
   <div class="sg"><span>More</span><div><button class="chip2" id="stMore" aria-expanded="${!!more}" aria-label="More stats: missed green, bunker, penalty, chip-in"><i class="ph-bold ph-dots-three"></i></button></div></div></div>
   ${more?`<div class="sstrip s2 apr"><span class="apl">Missed the green?</span>${[['s','Short'],['l','Long'],['lf','Left'],['r','Right']].map(([k,l])=>`<button class="chip2" data-ap="${k}" aria-pressed="${v.ap===k}" ${ro}>${l}</button>`).join('')}</div><div class="sstrip s2"><button class="chip2" data-pt="0" aria-pressed="${v.putts===0}" ${ro}>Chip-in</button><button class="chip2" data-sd="1" aria-pressed="${!!v.sand}" ${ro}>Bunker</button><button class="chip2" data-pen="1" aria-pressed="${!!v.pen}" ${ro}>${v.pen?'Penalty '+v.pen:'Penalty'}</button><button class="linkbtn" id="stClose" style="margin:0 0 0 auto;min-height:36px">Hide stats</button></div>`:''}`}
function wireStat(n){
  const sm=$('#stMore');if(sm)sm.onclick=()=>{S.stMore=!S.stMore;save();hole(n)};
  const so=$('#stOpen');if(so)so.onclick=()=>{S.stOpen=true;save();hole(n)};const sx=$('#stClose');if(sx)sx.onclick=()=>{S.stOpen=false;save();hole(n)};
  document.querySelectorAll('[data-fw]').forEach(b=>b.onclick=()=>{const v=S.st[n]||(S.st[n]={});v.fw=v.fw===b.dataset.fw?null:b.dataset.fw;save();buzz();hole(n)});
  document.querySelectorAll('[data-pt]').forEach(b=>b.onclick=()=>{const v=S.st[n]||(S.st[n]={}),k=+b.dataset.pt;v.putts=v.putts===k?null:k;save();buzz();hole(n);if(v.putts!=null&&window.HOLE_ADV)HOLE_ADV()});
  document.querySelectorAll('[data-qs]').forEach(b=>b.onclick=()=>{const v=S.st[n]||(S.st[n]={}),[fw,pt]=b.dataset.qs.split('|');if(fw)v.fw=fw;v.putts=+pt;save();buzz();hole(n);if(window.HOLE_ADV)HOLE_ADV()});
  document.querySelectorAll('[data-ap]').forEach(b=>b.onclick=()=>{const v=S.st[n]||(S.st[n]={});v.ap=v.ap===b.dataset.ap?null:b.dataset.ap;save();buzz();hole(n)});
  document.querySelectorAll('[data-sd]').forEach(b=>b.onclick=()=>{const v=S.st[n]||(S.st[n]={});v.sand=!v.sand;save();buzz();hole(n)});
  document.querySelectorAll('[data-pen]').forEach(b=>b.onclick=()=>{const v=S.st[n]||(S.st[n]={});v.pen=((v.pen||0)+1)%3;save();buzz();hole(n)})}

/* a personal or group round goes into history with its side-bet money */
function finishRound(){const t=myTeam(),miss=order(t.start).filter(h=>!holeDone(h));
  if(miss.length&&!confirm(miss.length===9&&(miss[0]===10||miss[0]===1)&&miss[8]===miss[0]+8?`Save as a 9-hole round? Holes ${miss[0]}-${miss[8]} stay blank, and it still counts toward your handicap.`:`Save this round with ${18-miss.length} holes? Still blank: ${miss.join(', ')}.`))return;
  gfresh();const live=G.live[RID]||LIVE,list=field(),led={};
  for(const b of myBets()){const r=settleBet(b,list);for(const[k,v]of Object.entries(r.led))led[k]=(led[k]||0)+v}
  const m={...live,cfg:CFG(),players:players(t).map(p=>({id:p.id,name:p.name,hcp:idx(p.id)}))};
  const sm=trSummary(m,S.scores[scoreKey(t.id)]||{},S.st,led);sm.bets=myBets().map(trBetName);sm.cur=curNow();
  /* skins hole by hole, so the parking-lot argument settles itself */
  sm.betLines=myBets().filter(b=>b.type!=='skins').map(b=>({name:trBetName(b),line:settleBet(b,list).line}));
  for(const b of myBets())if(b.type==='skins'){const r=settleBet(b,list);sm.skins={amt:b.amt,net:!!b.net,won:(r.won||[]).map(w=>({h:w.h,pid:w.pid,n:w.n,amt:w.amt})),carry:r.carry||0}}
  G.rounds.unshift(sm);delete G.live[RID];
  /* Raider Bucks: side-bet result and the round bonus go to the wallet once (keyed by round) */
  if(window.RNGCBUCKS&&!live.follow){const v=Math.round(led.me||0);if(sm.cur==='rb'&&v)RNGCBUCKS.bet(sm.id,v,sm.cname||'round');RNGCBUCKS.earn('round',sm.id)}
  const me=sm.players.find(p=>p.id==='me');if(me&&me.hcp!==G.me.hcp&&!live.follow)trSetMe(G.me.name,me.hcp);const fin=S.share&&!live.follow?trLivePush(true):null;
  if(live.group){const g=G.groups.find(x=>x.id===live.group);if(g)for(const p of m.players){const gm=g.members.find(x=>x.id===p.id);if(gm)gm.hcp=p.hcp}}
  gsave();try{localStorage.removeItem(KEY)}catch(e){}
  const go=()=>{location.href='./#/round/'+sm.id};if(fin){Promise.race([fin,new Promise(r=>setTimeout(r,2500))]).then(go)}else go()}

/* a turned-in event card also lands under Club events */
function logEvent(){try{gfresh();const t=myTeam(),e=EV(),c=CO(),P=PEOPLE(),raw=S.scores[scoreKey(t.id)]||{},u=ranked(field()).find(x=>x.mine)||{};
  if(window.RNGCBUCKS)RNGCBUCKS.earn('event',S.event||'event');
  const pl=Object.entries(raw).map(([w,s])=>{const hs=Object.keys(s).filter(h=>s[h]!=null);
    return{id:w,name:w==='team'?'Team':(P[w]?P[w].name:'Player'),scores:s,holes:hs.length,gross:trSum(hs.map(h=>s[h])),par:trSum(hs.map(h=>c.par[h-1]))}});
  G.rounds=G.rounds.filter(r=>r.id!=='ev-'+e.id);
  G.rounds.unshift({id:'ev-'+e.id,kind:'event',name:e.name,date:Date.now(),cname:c.name,tee:TEE().name,format:F().name,team:t.name,result:String(showScore(u)),pos:u.pos||null,holes:u.thru||0,par:c.par.slice(),si:c.si.slice(),players:pl,money:{}});
  gsave()}catch(err){}}

/* ---------- play log: every round, where and when ---------- */
let LOGCO='';
function trLog(f){const all=G.rounds.slice().sort((a,b)=>b.date-a.date),rs=all.filter(r=>(f==='all'||r.kind===f)&&(!LOGCO||r.cname===LOGCO)),cos=[...new Set(all.map(r=>r.cname))].sort();
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
  const score=r=>{const p=meP(r);return p?`${p.gross}<small>${toPar(p.gross-p.par)}${p.holes<18?' · '+p.holes+' holes':''}</small>`:`${esc(r.result||'-')}<small>${r.pos?'place '+r.pos:'event'}</small>`};
  $('#app').innerHTML=trBar('Play log',G.me.name+' · every round, where and when',trBack('#/me'))+`
   ${new Set(all.map(r=>r.kind)).size>1||f!=='all'?`<div class="seg" role="group" aria-label="Which rounds">${[['all','All'],['solo','Solo'],['group','Group'],['event','Events']].map(([k,l])=>`<button data-lf="${k}" aria-pressed="${k===f}">${l}</button>`).join('')}</div>`:''}
   ${cos.length>1?`<select class="field" id="lfCo" aria-label="Course" style="margin-top:8px"><option value="">All courses</option>${cos.map(c=>`<option ${c===LOGCO?'selected':''}>${esc(c)}</option>`).join('')}</select>`:''}
   <div class="tiles" style="margin-top:12px"><div class="card"><b>${rs.length}</b><span>Rounds</span><small>${rs.filter(r=>new Date(r.date).getFullYear()===yr).length} this year</small></div>
    <div class="card"><b>${W.length}</b><span>Courses</span><small>${W.length?'Most at '+esc(W[0][0].split(' ')[0]):'-'}</small></div>
    <div class="card"><b>${holes}</b><span>Holes</span><small>played</small></div></div>
   ${Object.entries(byMonth).map(([k,list])=>`<div class="lbl">${esc(k)} · ${list.length} round${list.length===1?'':'s'}</div>
    <section class="card tcard">${list.map(r=>trRow(r,meP(r))).join('')}</section>`).join('')}
   <div class="lbl">Where you play</div>
   ${W.length?`<section class="card" style="padding:4px 12px"><table class="stbl"><thead><tr><th>Course</th><th>Rounds</th><th>Avg</th><th>Best</th><th>Last</th></tr></thead><tbody>
     ${W.map(([n,w])=>`<tr><td>${esc(n)}</td><td>${w.n}</td><td>${w.g.length?Math.round(trAvg(w.g)):'-'}</td><td>${w.g.length?Math.min(...w.g):'-'}</td><td>${new Date(w.last).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</td></tr>`).join('')}</tbody></table></section>`
    :'<section class="card tcard"><div class="trow"><span class="muted">No rounds yet.</span></div></section>'}
   <div class="lbl">When you play · ${esc(fav)}s most</div>
   <section class="card" style="padding:12px 14px"><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;align-items:end;height:96px">
     ${months.map(m=>`<div style="display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end"><b style="font-size:13px">${m.n||''}</b><i style="display:block;width:70%;height:${m.n/mx*60}px;min-height:${m.n?4:1}px;background:${m.n?'var(--silver-2)':'var(--line)'};border-radius:3px"></i><span class="muted" style="font-size:12px">${m.l}</span></div>`).join('')}</div></section>
   <p class="note"><i class="ph-bold ph-info"></i><span>Tap a round for the full card, side bets and notes.</span></p><div style="height:28px"></div>`;
  trWire();document.querySelectorAll('[data-lf]').forEach(b=>b.onclick=()=>location.hash='#/log/'+b.dataset.lf);const lc=$('#lfCo');if(lc)lc.onchange=()=>{LOGCO=lc.value;trLog(f)}}

/* ---------- live rounds: the scorekeeper shares, buddies follow on their own phones ---------- */
const TR_LOCAL=/^(localhost|127\.0\.0\.1)$/.test(location.hostname);
const TR_RELAY=(()=>{try{const o=TR_LOCAL&&localStorage.getItem('rngc-relay');if(o)return o}catch(e){}return /^(localhost|127\.0\.0\.1)$/.test(location.hostname)?'http://localhost:8795':'https://rngc-live.137.184.188.41.sslip.io'})();
/* no relay host yet on the public preview: hide sharing there rather than show a button that fails */
const TR_LIVE_OK=!/example\.invalid/.test(TR_RELAY);
const trCode=()=>{const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';let c='';for(let i=0;i<5;i++)c+=A[Math.floor(Math.random()*A.length)];return c};
/* on a buddy's phone the scorekeeper becomes __host and the buddy becomes me, so the round reads as theirs */
/* member guest pass (David, Nov 13 2026): a signed-in member hands a playing partner 72 hours of golf with one link or a
   QR on this phone. The link opens the club app with golf only; from a live round it also drops them into the round. */
const TR_TOK=()=>{try{return localStorage.getItem('rngc-auth-token')||''}catch(e){return ''}};
const TR_CLUB=(()=>{try{const o=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&localStorage.getItem('rngc-club-api');if(o)return o.replace(/\/$/,'')}catch(e){}return 'https://rngc-club.137.184.188.41.sslip.io'})();
function trClub(path,body){return fetch(TR_CLUB+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+TR_TOK()},body:JSON.stringify(body||{})})
  .then(async r=>{const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Could not reach the club server.');return j})}
const trSite=()=>location.origin+location.pathname.replace(/scorecard\/?[^/]*$/,'');
let trGuestCode=null;
function trGuestLink(join){const mk=trGuestCode&&trGuestCode.exp>Date.now()+86400e3?Promise.resolve(trGuestCode):trClub('/pass/invite').then(r=>trGuestCode=r);
  return mk.then(r=>trSite()+'?guest='+r.code+(join?'&join='+join:''))}
function trBringGuest(){
  $('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">Bring a guest</h2>
   <p class="muted" style="font-size:15px;margin-top:4px">Give a buddy who isn't a member 72 hours of golf in the club app: scorecard, side games, GPS and stats. No card, no sign-up. They get golf only.</p>
   <div id="gqr" style="background:#fff;padding:12px;max-width:240px;margin:14px auto 0;min-height:60px;color:#111;text-align:center">Making the pass...</div>
   <p class="muted" style="text-align:center;font-size:14px;margin:8px 0 0">They scan it with the phone camera, or you text them the link. One link works for your whole group.</p>
   <button class="btn block" id="gqShare" style="margin-top:12px" disabled><i class="ph-bold ph-share-fat"></i> Text the link</button>
   <button class="btn ghost block" style="margin-top:8px" id="closeSheet">Done</button>`;
  $('#scrim').classList.add('on');$('#sheet').classList.add('on');$('#closeSheet').onclick=()=>{closeSheet();route()};
  trGuestLink().then(url=>{const sh=$('#gqShare');sh.disabled=false;sh.onclick=()=>trShare(sh,`I got you 72 hours of golf in the Raider Nation Golf Club app. Tap to start: ${url}`);
    const lq=window.parent&&window.parent!==window&&window.parent.loadQR?window.parent.loadQR():null;
    const box=$('#gqr');if(!lq){box.textContent=url;box.style.fontSize='13px';return}
    lq.then(qr=>{const q=qr(0,'M');q.addData(url);q.make();box.innerHTML=q.createSvgTag({cellSize:5,margin:0,scalable:true})}).catch(()=>{box.textContent=url})})
  .catch(e=>{const box=$('#gqr');if(box){box.textContent=e.message;box.style.fontSize='14px'}})}
const trSwap=(o,pid)=>{let j=JSON.stringify(o).split('"me"').join('"\u0001"');if(pid)j=j.split('"'+pid+'"').join('"me"');return JSON.parse(j.split('"\u0001"').join('"__host"'))};
let trPushT=null;
function trLivePush(now){if(!CASUAL||!S.share||LIVE.follow)return;clearTimeout(trPushT);
  const go=()=>{const body=JSON.stringify({live:{...LIVE,group:null},course:COURSES[LIVE.course],s:{cfg:S.cfg,scores:S.scores,bets:S.bets,hcp:S.hcp,roster:S.roster,guests:S.guests,ctp:S.ctp,ld:S.ld,keeper:S.keeper},at:S.hole,host:G.me.name,done:!!now&&now!=='open'});
    return fetch(TR_RELAY+'/live/'+S.share,{method:'PUT',headers:{'Content-Type':'application/json'},body,keepalive:body.length<60000}).catch(()=>{})};
  if(now)return go();trPushT=setTimeout(go,400)}
if(CASUAL&&!LIVE.follow){const _sv=save;save=function(){_sv();trLivePush()}}
const liveBtn=()=>!TR_LIVE_OK?'':`<button class="ib" id="liveBtn" aria-label="${S.share?'Live round, code '+S.share:'Share this round live'}" title="Share live"><i class="ph-${S.share?'fill':'bold'} ph-broadcast"></i><span>${S.share?'Live':'Share'}</span></button>`;
function trLiveCard(i){if(!CASUAL)return'';
  if(LIVE.follow)return `<div class="card solol"><i class="ph-fill ph-broadcast"></i><span><b>Live from ${esc(first(LIVE.host||'the scorekeeper'))}'s phone.</b> ${esc(first(LIVE.host||'They'))} keeps score; your card, the standings and the bets update every few seconds.</span></div>`;
  if(!TR_LIVE_OK||i!==0||S.share||players(myTeam()).length<2||!canScore())return'';
  return `<button class="card solol" id="liveCard"><i class="ph-bold ph-broadcast"></i><span><b>Let your buddies follow live.</b> They see every score and the bet money on their own phones. Tap to share.</span></button>`}
function trShareLive(){if(!S.share){S.share=trCode();save()}trLivePush('open');
  let url=location.origin+location.pathname+'?join='+S.share,gtxt='';
  if(TR_TOK())trGuestLink(S.share).then(u=>{url=u;gtxt=' Non-members get 72 hours of golf in the club app.'}).catch(()=>{});
  $('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">Your round is live</h2>
   <p class="muted" style="font-size:15px;margin-top:4px">Buddies open the link, tap their name, and see every score, the standings and the bet money as you enter them. You keep score; they follow. When you save the round, it lands in their play log too.</p>
   <div class="livecode" id="liveCode">${S.share}</div>
   <p class="muted" style="text-align:center;font-size:14px;margin:0">Or they tap Join a live round in the golf app and enter this code.</p>
   <button class="btn block" id="lvShare" style="margin-top:12px"><i class="ph-bold ph-share-fat"></i> Send the link</button>
   <button class="btn ghost block" style="margin-top:8px" id="closeSheet">Done</button>`;
  $('#scrim').classList.add('on');$('#sheet').classList.add('on');$('#closeSheet').onclick=()=>{closeSheet();route()};
  const sh=$('#lvShare');sh.onclick=()=>trShare(sh,`Follow our round live, code ${S.share}.${gtxt} ${url}`)}
/* buddy side: pull the round every few seconds */
let trFollowV=0,trTouch=0;
/* relay data comes from anyone with a round code: strip anything that could become page code (security review, Nov 13) */
function trClean(x,d){d=d||0;if(d>12)return null;if(typeof x==='string')return x.replace(/[<>"`]/g,'').replace(/'/g,'’').replace(/javascript:/gi,'');
  if(typeof x==='number')return isFinite(x)?x:0;if(typeof x==='boolean'||x==null)return x;if(Array.isArray(x))return x.map(v=>trClean(v,d+1));
  if(typeof x==='object'){const o={};for(const k of Object.keys(x)){if(k==='__proto__'||k==='constructor'||k==='prototype')continue;o[trClean(k,d+1)]=trClean(x[k],d+1)}return o}return null}
function trFollowTick(){fetch(TR_RELAY+'/live/'+LIVE.follow,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{j=trClean(j);if(!j||j.v<=trFollowV)return;trFollowV=j.v;
  const d=trSwap({s:j.s,players:j.live.players},LIVE.followMe);
  Object.assign(S,d.s,{me:LIVE.followMe?'me':'__watch',team:'g'});LIVE.players=d.players;TEAMS[0].players=d.players;if(G.live[RID])G.live[RID].players=d.players;gsave();
  try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}
  if(j.done&&LIVE.followMe){const c=window.confirm;window.confirm=()=>true;try{finishRound()}finally{window.confirm=c}return}
  if($('#sheet').classList.contains('on'))return;const h=location.hash;
  if(h.startsWith('#/hole')&&j.at&&Date.now()-trTouch>15000&&+h.split('/')[2]!==j.at){location.hash='#/hole/'+j.at;return}
  route()}).catch(()=>{})}
if(CASUAL&&LIVE.follow){trFollowTick();setInterval(trFollowTick,3000);document.addEventListener('pointerdown',()=>trTouch=Date.now(),true)}
function trJoin(code){code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length!==5){alert('Live round codes are 5 letters and numbers.');return}
  fetch(TR_RELAY+'/live/'+code,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(j=>{j=trClean(j);if(!j||!j.live){alert('No live round with code '+code+'. Check the code with your scorekeeper.');return}
   const ps=j.live.players;
   $('#sheet').innerHTML=`<div class="grab"></div><h2 style="font-size:26px">Join ${esc(first(j.host||'your buddy'))}'s round</h2>
    <p class="muted" style="font-size:15px;margin-top:4px">${esc(j.course?j.course.name:'')} · ${ps.length} players · ${esc(first(j.host||''))} keeps score. Who are you?</p>
    ${ps.filter(p=>p.id!=='me').map(p=>`<button class="btn ghost block" data-joinme="${esc(p.id)}" style="margin-top:8px">${esc(p.name)}</button>`).join('')}
    <button class="linkbtn" data-joinme="" style="display:block;margin:12px auto 0">I'm just watching</button>`;
   $('#scrim').classList.add('on');$('#sheet').classList.add('on');
   document.querySelectorAll('[data-joinme]').forEach(b=>b.onclick=()=>{const pid=b.dataset.joinme,rid='f'+code.toLowerCase();
     if(j.course&&/^[\w-]{1,80}$/.test(j.live.course||'')&&!COURSES[j.live.course]){COURSES[j.live.course]=j.course;(G.courses||(G.courses={}))[j.live.course]=j.course}
     const d=trSwap({players:ps,s:j.s},pid);
     G.live[rid]={...j.live,id:rid,kind:'group',group:null,players:d.players,bench:[],follow:code,followMe:pid||null,host:j.host||''};gsave();
     try{localStorage.setItem('rngc-scorecard-v2:'+rid,JSON.stringify({...d.s,me:pid?'me':'__watch',team:'g'}))}catch(e){}
     location.href='./?r='+rid+'#/hole/'+(j.at||1)})}).catch(()=>alert('Could not reach the live service. Check your signal and try again.'))}
{const jq=new URLSearchParams(location.search).get('join');if(jq&&!CASUAL)setTimeout(()=>trJoin(jq),400)}

/* history rows and round pages show each round in its own currency (dollars or Raider Bucks) */
{const _row=trRow;trRow=function(r,p){const pc=window.__cur;window.__cur=r.cur||'usd';try{return _row(r,p)}finally{window.__cur=pc}};
 const _rd=trRound;trRound=function(id){const r=G.rounds.find(x=>x.id===id);window.__cur=(r&&r.cur)||'usd';return _rd(id)}}
/* saved library courses pick up new hole maps quietly when there's signal (a course is kept on the phone when picked) */
function trLibRefresh(){try{if(navigator.onLine===false)return}catch(e){}
  Object.keys(G.courses||{}).forEach(id=>{const co=G.courses[id];if(!co||!co.lib)return;
    fetch('courses/c/'+encodeURIComponent(id)+'.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(d=>{if(!d||!d.app)return;
      const nu=d.app.maps||null;if(JSON.stringify(co.maps||null)===JSON.stringify(nu))return;
      if(nu)co.maps=nu;else delete co.maps;if(COURSES[id]&&COURSES[id]!==co)COURSES[id].maps=co.maps;gsave();
      if(/^#\/hole\//.test(location.hash))route()   /* open hole screen redraws with the new map */
    }).catch(()=>{})})}
setTimeout(trLibRefresh,1200);
/* also check when the app comes back to the front (phones keep it open for days), at most every 5 minutes */
{let _lr=Date.now();document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&Date.now()-_lr>3e5){_lr=Date.now();trLibRefresh()}})}
route();

document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-bringguest]'))trBringGuest()});
