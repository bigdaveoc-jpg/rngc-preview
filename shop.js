/* Club collection mock-up (David, Nov 12 2026): what the shop looks like with a print-and-ship vendor behind it
   (Printful main, Printify for golf balls and markers; see drafts/rngc/vendors.md in the BOSS repo).
   Drawn product pictures with the club shield stand in for the vendor's product photos, and the prices are samples.
   Nothing here takes money: "Buy" says checkout opens once the vendor is connected and keeps a "tell me" list on this
   phone; members can trade Raider Bucks for the same items (a request a club leader confirms).
   Loads after the main script and bucks.js; adds the collection to Home > Club shop.
   Connected mode: when the club server (CLUB_API in bucks.js) answers /shop/products, the real Printful products and
   their photos replace the drawings. Buy opens the product on the club's WordPress store (payment happens there), and
   a Raider Bucks trade asks for a shipping address; an admin's approval makes a draft order in Printful. */
(function(){
'use strict';
if(typeof shopHTML!=='function')return;

/* ---------- the catalog (sample prices; David sets real ones from vendor costs) ---------- */
const C={blk:['#25282e','#5d636d'],chr:['#3b4048','#5a606a'],slv:['#a7aeb8','#cfd4db'],wht:['#e9ecf0','#ffffff'],kha:['#b9a98a','#d3c6aa']};
const CN={blk:'Black',chr:'Charcoal',slv:'Silver',wht:'White',kha:'Khaki'};
const P=[
 {id:'cap',cat:'hats',n:'Structured club cap',d:'Embroidered shield, adjustable snapback.',usd:32,c:['blk','chr','wht'],art:'cap',v:'Printful'},
 {id:'rope',cat:'hats',n:'Rope golf cap',d:'Classic rope front, embroidered shield.',usd:34,c:['wht','blk','kha'],art:'cap',v:'Printful'},
 {id:'beanie',cat:'hats',n:'Cuffed beanie',d:'For the early tee times. Embroidered on the cuff.',usd:28,c:['blk','chr'],art:'beanie',v:'Printful'},
 {id:'polo',cat:'apparel',n:'Performance golf polo',d:'Moisture-wicking. Embroidered on the chest.',usd:52,c:['blk','wht','chr'],sizes:1,art:'polo',v:'Printful'},
 {id:'wpolo',cat:'apparel',n:'Women\'s golf polo',d:'Fitted cut, embroidered shield.',usd:52,c:['wht','blk'],sizes:1,art:'polo',v:'Printful'},
 {id:'qzip',cat:'apparel',n:'Quarter-zip pullover',d:'Mid-weight layer for cool mornings.',usd:68,c:['blk','chr'],sizes:1,art:'qzip',v:'Printful'},
 {id:'hoodie',cat:'apparel',n:'Game day hoodie',d:'Heavyweight fleece, printed shield.',usd:55,c:['blk','chr'],sizes:1,art:'hoodie',v:'Printful'},
 {id:'tee',cat:'apparel',n:'Club tee',d:'Soft cotton, printed shield.',usd:28,c:['blk','wht','chr'],sizes:1,art:'tee',v:'Printful'},
 {id:'ytee',cat:'apparel',n:'Youth tee',d:'For the next generation of the Nation.',usd:22,c:['blk','wht'],sizes:2,art:'tee',v:'Printful'},
 {id:'towel',cat:'golf',n:'Golf towel',d:'Tri-fold with grommet and clip.',usd:24,c:['blk','wht'],art:'towel',v:'Printful'},
 {id:'balls',cat:'golf',n:'Logo golf balls',d:'Printed with the club shield.',usd:30,c:['wht'],art:'balls',v:'Printify'},
 {id:'marker',cat:'golf',n:'Ball marker',d:'Engraved metal marker.',usd:15,c:['slv'],art:'marker',v:'Printify'},
 {id:'cover',cat:'golf',n:'Driver head cover',d:'Knit cover with pom.',usd:40,c:['blk','slv'],art:'cover',v:'Small batch'},
 {id:'tees',cat:'golf',n:'Club tees, 100 pack',d:'Printed wooden tees.',usd:12,c:['wht'],art:'tees',v:'Small batch'},
 {id:'flag',cat:'fan',n:'Pin flag',d:'Sign it at the Raider Cup.',usd:30,c:['blk'],art:'flag',v:'Printful'},
 {id:'tumbler',cat:'fan',n:'Insulated tumbler',d:'20 oz, keeps it cold through 18.',usd:34,c:['blk','slv'],art:'tumbler',v:'Printful'},
 {id:'koozie',cat:'fan',n:'Can koozie',d:'For the 19th hole.',usd:10,c:['blk'],art:'koozie',v:'Printify'},
 {id:'cooler',cat:'fan',n:'Cooler bag',d:'Fits a 12 pack and the tailgate.',usd:45,c:['blk'],art:'cooler',v:'Printful'},
 {id:'sticker',cat:'fan',n:'Shield sticker',d:'For the cart, the cooler and the bag.',usd:5,c:['blk'],art:'sticker',v:'Printful'}
];
const CATS=[['all','All'],['apparel','Apparel'],['hats','Hats'],['golf','Golf'],['fan','Fan gear']];
const RB_PER_USD=47;                                   /* sample: a $32 cap is about 1,500 Raider Bucks */
const rbOf=p=>Math.max(100,Math.round(p.usd*RB_PER_USD/50)*50);
const IC={cap:'baseball-cap',beanie:'baseball-cap',polo:'t-shirt',qzip:'t-shirt',hoodie:'t-shirt',tee:'t-shirt',towel:'flag',balls:'golf',marker:'coin',cover:'shield',tees:'golf',flag:'flag-pennant',tumbler:'coffee',koozie:'beer-bottle',cooler:'bag',sticker:'sticker'};

/* in the phone preview the Bucks store trades the same catalog (on the club server, its config decides) */
if(window.RNGCBUCKS&&!RNGCBUCKS.remote()){RNGCBUCKS.STORE.length=0;P.forEach(p=>RNGCBUCKS.STORE.push({id:p.id,n:p.n,b:rbOf(p),ic:IC[p.art]||'tag'}))}

/* ---------- drawn product pictures ---------- */
const SPRITE=`<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
 <linearGradient id="rgsv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f9"/><stop offset=".5" stop-color="#98a0ac"/><stop offset="1" stop-color="#e6e9ee"/></linearGradient>
 <symbol id="rgmark" viewBox="0 0 120 140"><path d="M60 3 L114 19 V76 C114 106 90 127 60 137 C30 127 6 106 6 76 V19 Z" fill="#0a0b0d" stroke="url(#rgsv)" stroke-width="5" stroke-linejoin="round"/>
  <g stroke="url(#rgsv)" stroke-linecap="round" fill="none"><path d="M32 44 L88 112" stroke-width="6"/><path d="M88 44 L32 112" stroke-width="6"/></g>
  <path d="M22 40 L36 33 L40 42 L27 49 Z" fill="url(#rgsv)"/><path d="M98 40 L84 33 L80 42 L93 49 Z" fill="url(#rgsv)"/>
  <path d="M60 24 V80" stroke="url(#rgsv)" stroke-width="4" stroke-linecap="round"/><path d="M60 24 L82 32 L60 41 Z" fill="url(#rgsv)"/>
  <circle cx="60" cy="80" r="9" fill="#0a0b0d" stroke="url(#rgsv)" stroke-width="4"/></symbol>
 <radialGradient id="rgbg" cx=".5" cy=".38" r=".75"><stop offset="0" stop-color="#262a31"/><stop offset="1" stop-color="#0b0c0e"/></radialGradient></defs></svg>`;
const mk=(x,y,w)=>`<use href="#rgmark" x="${x-w/2}" y="${y-w*7/12}" width="${w}" height="${w*7/6}"/>`;
function art(p,ck){
  const [f,s]=C[ck]||C.blk,o=`fill="${f}" stroke="${s}" stroke-width="2" stroke-linejoin="round"`,ln=`stroke="${s}" stroke-width="2" fill="none" stroke-linecap="round"`;
  const top=(sleeve,extra)=>`<path d="M62 52 L84 42 Q100 52 116 42 L138 52 L${sleeve?'176 120 L158 128 L142 92':'168 84 L150 102 L142 92'} L142 168 L58 168 L58 92 L${sleeve?'42 128 L24 120':'50 102 L32 84'} Z" ${o}/>${extra||''}`;
  const g={
   cap:`<path d="M48 118 Q48 62 100 58 Q152 62 152 118 Z" ${o}/><path d="M100 58 V118 M74 64 Q70 90 72 118 M126 64 Q130 90 128 118" ${ln} opacity=".55"/><circle cx="100" cy="58" r="4" fill="${s}"/><path d="M40 118 Q100 102 174 126 Q152 142 100 134 Q62 130 40 118 Z" ${o}/>${mk(100,92,30)}`,
   beanie:`<circle cx="100" cy="46" r="13" fill="${f}" stroke="${s}" stroke-width="2"/><path d="M54 128 Q54 60 100 58 Q146 60 146 128 Z" ${o}/><path d="M76 66 V126 M100 58 V126 M124 66 V126" ${ln} opacity=".4"/><rect x="50" y="116" width="100" height="34" rx="8" ${o}/>${mk(100,133,24)}`,
   polo:top(0,`<path d="M84 42 L100 66 L116 42 L110 38 L100 50 L90 38 Z" ${o}/><path d="M100 66 V96" ${ln}/><circle cx="100" cy="76" r="2" fill="${s}"/><circle cx="100" cy="88" r="2" fill="${s}"/>${mk(124,82,18)}`),
   qzip:top(1,`<path d="M84 42 Q100 50 116 42 L116 34 Q100 40 84 34 Z" ${o}/><path d="M100 46 V96" stroke="${s}" stroke-width="3"/><rect x="97" y="94" width="6" height="9" rx="2" fill="${s}"/>${mk(126,84,18)}`),
   hoodie:top(1,`<path d="M80 46 Q78 18 100 16 Q122 18 120 46 Q100 58 80 46 Z" ${o}/><path d="M94 52 V76 M106 52 V76" ${ln}/><path d="M74 130 H126 L132 158 H68 Z" ${o}/>${mk(100,98,40)}`),
   tee:top(0,`<path d="M86 44 Q100 58 114 44" ${ln}/>${mk(100,96,40)}`),
   towel:`<path d="M100 28 a7 7 0 1 1 0.1 0" fill="none" stroke="#c9ced6" stroke-width="3"/><path d="M68 42 H132 L138 166 H62 Z" ${o}/><path d="M66 150 H134" ${ln} opacity=".5"/><path d="M64 166 v8 M74 166 v8 M84 166 v8 M94 166 v8 M104 166 v8 M114 166 v8 M124 166 v8 M134 166 v8" ${ln}/><circle cx="100" cy="50" r="5" fill="#0b0c0e" stroke="${s}" stroke-width="2"/>${mk(100,104,46)}`,
   balls:[60,100,140].map((x,i)=>`<circle cx="${x}" cy="${i===1?96:112}" r="30" fill="#eef1f4" stroke="#c7ccd3" stroke-width="2"/>${Array.from({length:9},(_,k)=>`<circle cx="${x-14+(k%3)*14}" cy="${(i===1?96:112)-14+Math.floor(k/3)*14}" r="2.4" fill="#cfd4da"/>`).join('')}${i===1?mk(x,96,26):''}`).join(''),
   marker:`<circle cx="100" cy="100" r="54" fill="url(#rgsv)" stroke="#6d747e" stroke-width="3"/><circle cx="100" cy="100" r="46" fill="none" stroke="#6d747e" stroke-width="1.5"/>${mk(100,100,46)}`,
   cover:`<circle cx="100" cy="34" r="15" fill="${s}"/><path d="M64 166 Q60 90 74 60 Q100 40 126 60 Q140 90 136 166 Z" ${o}/><path d="M64 140 H136 M64 150 H136 M64 160 H136" ${ln} opacity=".5"/>${mk(100,98,42)}`,
   tees:[70,100,130].map((x,i)=>`<g transform="rotate(${(i-1)*12} ${x} 150)"><path d="M${x-12} 52 Q${x} 62 ${x+12} 52 L${x+4} 66 L${x+3} 150 L${x} 166 L${x-3} 150 L${x-4} 66 Z" fill="#f2f0ea" stroke="#cfcac0" stroke-width="2"/></g>`).join('')+mk(100,104,20),
   flag:`<path d="M56 30 V176" stroke="#c9ced6" stroke-width="4"/><path d="M58 34 H156 L144 70 L156 106 H58 Z" ${o}/>${mk(100,70,40)}<ellipse cx="56" cy="178" rx="18" ry="4" fill="#000" opacity=".5"/>`,
   tumbler:`<rect x="66" y="34" width="68" height="18" rx="6" fill="${s}"/><path d="M70 52 H130 L122 170 H78 Z" ${o}/>${mk(100,108,40)}`,
   koozie:`<rect x="70" y="40" width="60" height="12" rx="4" fill="#c9ced6"/><rect x="64" y="52" width="72" height="116" rx="10" ${o}/>${mk(100,110,40)}`,
   cooler:`<path d="M66 70 Q66 30 100 30 Q134 30 134 70" fill="none" stroke="${s}" stroke-width="7"/><rect x="40" y="66" width="120" height="100" rx="12" ${o}/><path d="M40 86 H160" ${ln}/>${mk(100,126,40)}`,
   sticker:`<rect x="46" y="40" width="108" height="120" rx="20" fill="#f4f6f9"/><path d="M154 132 L126 160 L154 160 Z" fill="#c9ced6"/>${mk(100,100,70)}`
  };
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${p.n} mock-up"><rect width="200" height="200" fill="url(#rgbg)"/>${g[p.art]||''}</svg>`;
}

/* ---------- styles ---------- */
(function(){const s=document.createElement('style');s.textContent=`
.rgx .mock{display:flex;gap:10px;align-items:flex-start;padding:12px 14px;margin-top:4px;font-size:14px;color:var(--muted);border-style:dashed}
.rgx .mock i{font-size:20px;color:var(--silver-2)}.rgx .mock b{color:var(--text)}
.rgx .cats{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin:12px 0 4px}.rgx .cats::-webkit-scrollbar{display:none}
.rgx .grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
@media (min-width:700px){.rgx .grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}}
.rgx .it{display:flex;flex-direction:column;padding:0;overflow:hidden;text-align:left;width:100%;transition:transform .18s var(--ease),border-color .2s}
.rgx .it:hover{border-color:var(--silver-2)}.rgx .it:active{transform:scale(.98)}
.rgx .it svg,.rgsheet svg{display:block;width:100%;height:auto;aspect-ratio:1/1}
.rgx .it .b{padding:10px 12px 12px}
.rgx .it b{display:block;font-size:15px;line-height:1.25}
.rgx .it .pr{display:flex;align-items:baseline;gap:8px;margin-top:6px;flex-wrap:wrap}
.rgx .it .usd{font-family:var(--display);font-size:22px;font-weight:800}
.rgx .it .rb{font-size:12px;color:var(--muted);font-weight:600}
.rgx .it .dots{display:flex;gap:4px;margin-top:6px}.rgx .it .dots i{width:12px;height:12px;border-radius:50%;border:1px solid var(--line)}
.rgsheet .art{max-width:320px;margin:0 auto;border-radius:var(--r);overflow:hidden}
.rgsheet h3{font-family:var(--display);font-size:26px;text-transform:uppercase;margin-top:12px;line-height:1.05}
.rgsheet .opt{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.rgsheet .opt .chip{min-height:40px}
.rgsheet .lbl{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-top:14px}
.rgsheet .acts{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}.rgsheet .acts .btn{flex:1;min-width:140px}
`;document.head.appendChild(s)})();
document.body.insertAdjacentHTML('beforeend',SPRITE);

/* ---------- page ---------- */
let cat='all',sel=null,LIVE=null,lsel=null;
const dot=k=>`<i style="background:${C[k][0]}"></i>`;
function collectionHTML(){
  if(LIVE)return liveHTML();
  const list=P.filter(p=>cat==='all'||p.cat===cat);
  const rbOn=!!window.RNGCBUCKS&&typeof S!=='undefined'&&S.member;
  return `<div class="rgx"><h3 class="shophead">The club collection</h3>
   <div class="card mock"><i class="ph-bold ph-paint-brush-household"></i><span><b>Mock-up.</b> A preview of the full collection once our print-and-ship partner is connected: each item made to order and shipped to your door. Pictures are drawings and prices are samples; checkout isn't open yet.</span></div>
   <div class="cats" role="tablist">${CATS.map(([k,t])=>`<button class="chip" data-rgcat="${k}" aria-pressed="${cat===k}">${t}</button>`).join('')}</div>
   <div class="grid">${list.map(p=>`<button class="card it" data-rgp="${p.id}">${art(p,p.c[0])}<div class="b"><b>${esc(p.n)}</b>
     <div class="pr"><span class="usd">$${p.usd}</span>${rbOn?`<span class="rb">or ${RNGCBUCKS.fmtN(rbOf(p))} RB</span>`:''}</div>
     ${p.c.length>1?`<div class="dots">${p.c.map(dot).join('')}</div>`:''}</div></button>`).join('')}</div></div>`;
}
function sheet(){
  const p=P.find(x=>x.id===sel.id),rbOn=!!window.RNGCBUCKS&&S.member,rb=rbOf(p),bal=rbOn?RNGCBUCKS.balance():0;
  const sizes=p.sizes===2?['YS','YM','YL','YXL']:p.sizes?['S','M','L','XL','2XL','3XL']:null;
  openSheet(`<div class="rgsheet"><div class="art">${art(p,sel.c)}</div><h3>${esc(p.n)}</h3><p class="sub" style="margin:4px 0 0">${esc(p.d)}</p>
   ${p.c.length>1?`<div class="lbl">Color: ${CN[sel.c]}</div><div class="opt">${p.c.map(k=>`<button class="chip" data-rgc="${k}" aria-pressed="${sel.c===k}">${CN[k]}</button>`).join('')}</div>`:''}
   ${sizes?`<div class="lbl">Size</div><div class="opt">${sizes.map(z=>`<button class="chip" data-rgz="${z}" aria-pressed="${sel.z===z}">${z}</button>`).join('')}</div>`:''}
   <div class="acts"><button class="btn" data-rgbuy><i class="ph-bold ph-shopping-cart"></i> Buy $${p.usd}</button>
    ${rbOn?`<button class="btn ghost" data-rgtrade ${bal<rb?'disabled':''}><i class="ph-bold ph-coins"></i> ${bal<rb?RNGCBUCKS.fmtN(rb-bal)+' RB to go':'Trade '+RNGCBUCKS.fmtN(rb)+' RB'}</button>`:''}</div>
   <p class="meta" style="margin-top:12px">Made to order and shipped to you${p.v==='Small batch'?' from the club\'s small batch':''}. Sample price.</p></div>`);
}
const _shop=window.shopHTML;
window.shopHTML=function(){
  const h=_shop(),i=h.indexOf('<h3 class="shophead">');
  return i<0?h+collectionHTML():h.slice(0,i)+collectionHTML()+h.slice(i);
};
const redraw=()=>{if(typeof S!=='undefined'&&S.tab==='home'&&S.hpage==='shop'&&typeof renderHome==='function'){const v=document.getElementById('v-home'),y=v?v.scrollTop:0;renderHome();if(v)v.scrollTop=y}};
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-rgcat]');if(c){cat=c.dataset.rgcat;redraw();return}
  const it=e.target.closest('[data-rgp]');if(it){const p=P.find(x=>x.id===it.dataset.rgp);sel={id:p.id,c:p.c[0],z:null};sheet();return}
  if(!sel)return;
  const cc=e.target.closest('[data-rgc]');if(cc){sel.c=cc.dataset.rgc;sheet();return}
  const z=e.target.closest('[data-rgz]');if(z){sel.z=z.dataset.rgz;sheet();return}
  const p=P.find(x=>x.id===sel.id);
  if(e.target.closest('[data-rgbuy]')){
    if(p.sizes&&!sel.z){toast('Pick a size');return}
    try{const w=JSON.parse(localStorage.getItem('rngc-shop-want')||'{}');w[p.id]=Date.now();localStorage.setItem('rngc-shop-want',JSON.stringify(w))}catch(err){}
    closeSheet();toast('Checkout opens soon. We saved your pick and will tell you when it\'s live.');return}
  if(e.target.closest('[data-rgtrade]')){
    if(p.sizes&&!sel.z){toast('Pick a size');return}
    if(!confirm('Trade '+RNGCBUCKS.fmtN(rbOf(p))+' Raider Bucks for the '+p.n.toLowerCase()+(sel.z?' ('+CN[sel.c]+', '+sel.z+')':'')+'? A club leader confirms and ships it.'))return;
    RNGCBUCKS.redeemAsync(p.id).then(r=>{closeSheet();toast(r.ok?'Requested. '+RNGCBUCKS.fmtN(RNGCBUCKS.balance())+' RB left.':r.why);redraw()});return}
});

/* ---------- connected: the club's Printful store ---------- */
const catOf=n=>/hat|cap|beanie|visor/i.test(n)?'hats':/polo|tee\b|t-shirt|shirt|hoodie|zip|pullover|jacket|crew/i.test(n)?'apparel':/ball|marker|towel|head ?cover|divot|tees/i.test(n)?'golf':'fan';
const uniq=a=>[...new Set(a.filter(Boolean))];
const pimg=u=>`<img src="${esc(u)}" alt="" loading="lazy" style="width:100%;aspect-ratio:1/1;object-fit:cover;background:#fff;display:block">`;
function liveHTML(){
  const list=LIVE.filter(p=>cat==='all'||catOf(p.name)===cat),rbOn=!!window.RNGCBUCKS&&typeof S!=='undefined'&&S.member;
  return `<div class="rgx"><h3 class="shophead">The club collection</h3>
   <div class="card mock"><i class="ph-bold ph-package"></i><span><b>Made to order</b> by our print partner and shipped to your door. Buy checks out on the club store${rbOn?'; members can also trade Raider Bucks':''}.</span></div>
   <div class="cats" role="tablist">${CATS.map(([k,t])=>`<button class="chip" data-rgcat="${k}" aria-pressed="${cat===k}">${t}</button>`).join('')}</div>
   <div class="grid">${list.map(p=>`<button class="card it" data-rlp="${esc(p.id)}">${pimg(p.image)}<div class="b"><b>${esc(p.name)}</b>
     <div class="pr"><span class="usd">$${Math.round(p.usd)}</span>${rbOn?`<span class="rb">or ${RNGCBUCKS.fmtN(p.rb)} RB</span>`:''}</div></div></button>`).join('')||'<p class="sub">Nothing in this group yet.</p>'}</div></div>`;
}
const lv=()=>{const p=LIVE.find(x=>x.id===lsel.id);const v=p.variants.find(x=>(x.color||'')===(lsel.c||'')&&(x.size||'')===(lsel.z||''))||null;return {p,v}};
function lsheet(){
  const {p,v}=lv(),colors=uniq(p.variants.map(x=>x.color)),sizes=uniq(p.variants.filter(x=>(x.color||'')===(lsel.c||'')).map(x=>x.size));
  const rbOn=!!window.RNGCBUCKS&&S.member,bal=rbOn?RNGCBUCKS.balance():0,img=(v&&v.image)||p.image,usd=v?v.usd:p.usd,rb=v?v.rb:p.rb;
  openSheet(`<div class="rgsheet"><div class="art">${pimg(img)}</div><h3>${esc(p.name)}</h3>
   ${colors.length>1?`<div class="lbl">Color${lsel.c?': '+esc(lsel.c):''}</div><div class="opt">${colors.map(k=>`<button class="chip" data-rlc="${esc(k)}" aria-pressed="${lsel.c===k}">${esc(k)}</button>`).join('')}</div>`:''}
   ${sizes.length>1?`<div class="lbl">Size</div><div class="opt">${sizes.map(z=>`<button class="chip" data-rlz="${esc(z)}" aria-pressed="${lsel.z===z}">${esc(z)}</button>`).join('')}</div>`:''}
   <div class="acts"><button class="btn" data-rlbuy><i class="ph-bold ph-shopping-cart"></i> Buy $${usd.toFixed(2).replace(/\.00$/,'')}</button>
    ${rbOn?`<button class="btn ghost" data-rltrade ${bal<rb?'disabled':''}><i class="ph-bold ph-coins"></i> ${bal<rb?RNGCBUCKS.fmtN(rb-bal)+' RB to go':'Trade '+RNGCBUCKS.fmtN(rb)+' RB'}</button>`:''}</div>
   <p class="meta" style="margin-top:12px">Made to order and shipped to you. Checkout is on the club store.</p></div>`);
}
const ST='AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');
function shipSheet(){
  const {p,v}=lv(),f=(id,l,ac,ex)=>`<label class="meta" for="${id}" style="display:block;margin:10px 0 4px">${l}</label><input class="field" id="${id}" autocomplete="${ac}" ${ex||''}>`;
  openSheet(`<div class="rgsheet"><h3 style="margin-top:0">Where should it go?</h3><p class="sub" style="margin:4px 0 8px">${esc(p.name)}${v.color||v.size?' - '+esc([v.color,v.size].filter(Boolean).join(', ')):''} for ${RNGCBUCKS.fmtN(v.rb)} RB. A club leader approves it, then it's made and shipped to you. We keep the address only until it ships.</p>
   <form id="rlShip">${f('shN','Name','name','maxlength="60" required')}${f('shA1','Street address','address-line1','maxlength="80" required')}${f('shA2','Apt or suite (optional)','address-line2','maxlength="80"')}${f('shC','City','address-level2','maxlength="40" required')}
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div><label class="meta" for="shS" style="display:block;margin:10px 0 4px">State</label><select class="field" id="shS" autocomplete="address-level1">${ST.map(x=>`<option ${x==='NV'?'selected':''}>${x}</option>`).join('')}</select></div>
   <div>${f('shZ','Zip','postal-code','inputmode="numeric" maxlength="10" required')}</div></div>
   <div class="acts"><button class="btn" type="submit"><i class="ph-bold ph-coins"></i> Trade ${RNGCBUCKS.fmtN(v.rb)} RB</button></div></form></div>`);
  const nm=$('#shN');if(nm&&S.name)nm.value=S.name;
}
document.addEventListener('click',e=>{
  if(!LIVE)return;
  const it=e.target.closest('[data-rlp]');if(it){const p=LIVE.find(x=>x.id===it.dataset.rlp);lsel={id:p.id,c:p.variants[0].color||'',z:''};
    const sz=uniq(p.variants.filter(x=>(x.color||'')===lsel.c).map(x=>x.size));if(sz.length<=1)lsel.z=sz[0]||'';lsheet();return}
  if(!lsel)return;
  const c=e.target.closest('[data-rlc]');if(c){lsel.c=c.dataset.rlc;const sz=uniq(LIVE.find(x=>x.id===lsel.id).variants.filter(x=>(x.color||'')===lsel.c).map(x=>x.size));if(!sz.includes(lsel.z))lsel.z=sz.length<=1?(sz[0]||''):'';lsheet();return}
  const z=e.target.closest('[data-rlz]');if(z){lsel.z=z.dataset.rlz;lsheet();return}
  if(e.target.closest('[data-rlbuy]')){const {p,v}=lv();if(!v){toast('Pick a size');return}if(p.buy)window.open(p.buy,'_blank','noopener');else toast('Checkout opens soon.');return}
  if(e.target.closest('[data-rltrade]')){const {v}=lv();if(!v){toast('Pick a size');return}shipSheet();return}
});
document.addEventListener('submit',e=>{
  if(!e.target||e.target.id!=='rlShip')return;e.preventDefault();
  const {v}=lv(),ship={name:$('#shN').value,address1:$('#shA1').value,address2:$('#shA2').value,city:$('#shC').value,state_code:$('#shS').value,zip:$('#shZ').value};
  RNGCBUCKS.redeemAsync('pf:'+v.id,{ship}).then(r=>{if(r.ok){closeSheet();toast('Requested. A club leader approves it, then it ships to you.');redraw()}else toast(r.why)});
});
if(window.RNGCBUCKS&&RNGCBUCKS.api())RNGCBUCKS.club('/shop/products').then(r=>{if(r&&Array.isArray(r.products)&&r.products.length){LIVE=r.products;redraw()}}).catch(()=>{});
})();
