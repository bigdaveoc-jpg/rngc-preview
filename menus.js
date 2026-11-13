/* No sideways scrolling menus on phones (David, Nov 12 2026: "having to scroll right, I don't like that").
   After any page draws, each menu row that doesn't fit the screen is changed:
   - page menus (Home sections, Events, Members, Settings...): one full-width button with the section you're on;
     tap it and a list drops down from the button with every section (David, Nov 13: drop down from the button, not up from the bottom).
   - filter rows (forum topics, shop categories, member lists): the tabs wrap onto a second line.
   Rows that already fit are left alone. The original buttons stay (hidden), so every tap runs the same code as before. */
(function(){
const css=`.pm-hide{display:none!important}
@media(max-width:699px){.pm-long{display:none}}
.pm-wrap.pm-wrap{flex-wrap:wrap;overflow:visible;row-gap:12px}
.pm-even.pm-even{gap:6px}
.pm-even.pm-even > *{flex:1 1 0!important;min-width:0!important;justify-content:center;text-align:center;white-space:normal!important;line-height:1.15}
.pm-dd{position:relative;margin-top:14px;z-index:5}
.pm-dd.open{z-index:45}
.pm-switch{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px 12px 16px;border:1px solid var(--line,#2a2f37);border-radius:14px;
  background:linear-gradient(180deg,var(--panel-2,#1d2127),var(--panel,#16191e));color:var(--text,#eef0f3);text-align:left;cursor:pointer;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06);transition:border-color .2s,border-radius .2s}
.pm-switch small{display:block;font:600 11px var(--body,Barlow,sans-serif);letter-spacing:.14em;text-transform:uppercase;color:var(--muted,#9aa2ae)}
.pm-switch b{display:block;font:800 20px/1.15 var(--display,'Barlow Condensed',sans-serif);letter-spacing:.04em;text-transform:uppercase}
.pm-switch span{flex:1;min-width:0}
.pm-switch i{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.06);font-size:16px;color:var(--silver,#d5dae1);
  transition:transform .25s var(--ease,ease)}
.pm-dd.open .pm-switch{border-color:rgba(213,218,225,.35)}
.pm-dd.open .pm-switch i{transform:rotate(180deg)}
.pm-switch:active{opacity:.8}
.pm-panel{position:absolute;left:0;right:0;top:calc(100% + 6px);padding:6px;border:1px solid rgba(213,218,225,.18);border-radius:14px;
  background:var(--bg-2,#111317);box-shadow:0 18px 40px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.4);
  transform-origin:top center;opacity:0;visibility:hidden;transform:translateY(-8px) scaleY(.94);
  transition:opacity .18s ease,transform .24s var(--ease,ease),visibility 0s .24s;max-height:min(72vh,560px);overflow-y:auto;overscroll-behavior:contain}
.pm-dd.open .pm-panel{opacity:1;visibility:visible;transform:none;transition:opacity .18s ease,transform .26s var(--ease,ease),visibility 0s}
.pm-panel button{display:flex;align-items:center;gap:12px;width:100%;min-height:46px;padding:0 12px;border-radius:10px;color:var(--muted,#9aa2ae);
  font:600 17px var(--body,Barlow,sans-serif);text-align:left;cursor:pointer;position:relative;
  opacity:0;transform:translateY(-4px);transition:background .15s,color .15s,opacity .2s,transform .2s}
.pm-dd.open .pm-panel button{opacity:1;transform:none;transition-delay:calc(var(--n,0) * 18ms)}
.pm-panel button + button{margin-top:2px}
.pm-panel button i{font-size:20px;width:22px;text-align:center}
.pm-panel button .pm-ok{margin-left:auto;font-size:16px;color:var(--silver,#d5dae1);opacity:0}
.pm-panel button[aria-current="true"]{background:rgba(255,255,255,.07);color:var(--text,#eef0f3)}
.pm-panel button[aria-current="true"]::before{content:"";position:absolute;left:0;top:12px;bottom:12px;width:3px;border-radius:3px;background:var(--silver,#d5dae1)}
.pm-panel button[aria-current="true"] .pm-ok{opacity:1}
.pm-panel button:hover{background:rgba(255,255,255,.04);color:var(--text,#eef0f3)}
.pm-panel button:active{background:rgba(255,255,255,.1)}
@media(prefers-reduced-motion:reduce){.pm-panel,.pm-panel button,.pm-switch i{transition:none!important;transform:none!important}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

const ROWS='.subchips, .seg, .chips, .cats';
const isMenu=r=>r.classList.contains('subchips')||(r.classList.contains('seg')&&r.getAttribute('role')==='tablist');
const btns=r=>[...r.children].filter(c=>c.tagName==='BUTTON'||c.tagName==='A');
const label=b=>(b.textContent||'').replace(/\s+/g,' ').trim();
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PAGE={home:'Home',events:'Events',golf:'Golf',games:'Games',members:'Members',settings:'Settings',courses:'Courses',forum:'Forum'};

function fix(r){
  if(r.dataset.pm||r.closest('.sheet,#rgTerms,.pm-list')||!r.offsetParent)return;
  const bs=btns(r);if(bs.length<2||r.scrollWidth<=r.clientWidth+2)return;
  if(!isMenu(r)){r.classList.add('pm-wrap');r.dataset.pm='wrap';return}
  if(bs.length<=3){r.classList.add('pm-even');if(r.scrollWidth<=r.clientWidth+2){r.dataset.pm='even';return}r.classList.remove('pm-even')}   /* 3 or fewer: share the row evenly */
  r.dataset.pm='switch';r.classList.add('pm-hide');
  const cur=bs.find(b=>b.getAttribute('aria-pressed')==='true'||b.getAttribute('aria-selected')==='true')||bs[0];
  const v=r.closest('.view'),area=v?PAGE[v.id.replace('v-','')]||'':'';
  const sw=document.createElement('button');sw.type='button';sw.className='pm-switch';sw.setAttribute('aria-haspopup','menu');
  sw.innerHTML=`<span><small>${esc(area?area+' sections':'Sections')}</small><b>${esc(label(cur))}</b></span><i class="ph-bold ph-caret-down"></i>`;
  const dd=document.createElement('div');dd.className='pm-dd';
  const pn=document.createElement('div');pn.className='pm-panel';pn.setAttribute('role','menu');pn.id='pm-'+(++uid);sw.setAttribute('aria-controls',pn.id);sw.setAttribute('aria-expanded','false');
  dd.append(sw,pn);
  sw.addEventListener('click',e=>{e.stopPropagation();dd.classList.contains('open')?shut(dd):open(r,dd)});
  r.parentNode.insertBefore(dd,r);
}
let uid=0,cur=null;
function shut(dd){if(!dd)return;dd.classList.remove('open');const sw=dd.querySelector('.pm-switch');if(sw)sw.setAttribute('aria-expanded','false');if(cur===dd)cur=null}
function open(r,dd){
  if(cur&&cur!==dd)shut(cur);
  const bs=btns(r),pn=dd.querySelector('.pm-panel'),sw=dd.querySelector('.pm-switch');
  pn.innerHTML=bs.map((b,i)=>{
    const on=b.getAttribute('aria-pressed')==='true'||b.getAttribute('aria-selected')==='true';const ic=b.querySelector('i');
    return `<button type="button" role="menuitem" data-pmi="${i}" style="--n:${i}" aria-current="${on}">${ic?ic.outerHTML:''}<span>${esc(label(b))}</span><i class="ph-bold ph-check pm-ok"></i></button>`}).join('');
  pn.querySelectorAll('[data-pmi]').forEach(x=>x.addEventListener('click',e=>{e.stopPropagation();const b=bs[+x.dataset.pmi];
    const lb=sw.querySelector('b');if(lb&&b)lb.textContent=label(b);shut(dd);if(b&&b.isConnected)b.click()}));
  void pn.offsetWidth;dd.classList.add('open');sw.setAttribute('aria-expanded','true');cur=dd;
  /* keep the whole list on screen: nudge the page down if the list runs past the bottom */
  requestAnimationFrame(()=>{const v=dd.closest('.view');if(!v)return;const pr=pn.getBoundingClientRect(),vr=v.getBoundingClientRect();
    const over=pr.top+pn.scrollHeight-vr.bottom+12;if(over>0)v.scrollBy({top:over,behavior:'smooth'})});
}
document.addEventListener('pointerdown',e=>{if(cur&&!cur.contains(e.target))shut(cur)},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&cur){const sw=cur.querySelector('.pm-switch');shut(cur);if(sw)sw.focus()}});
let t=null;
function undo(r){r.classList.remove('pm-hide','pm-wrap','pm-even');delete r.dataset.pm;const p=r.previousElementSibling;if(p&&p.classList.contains('pm-dd')){if(cur===p)cur=null;p.remove()}}
/* a row the page itself hides now (wider screen) drops its switcher; a row that fits again goes back to normal */
function recheck(){document.querySelectorAll('[data-pm]').forEach(r=>{const was=r.dataset.pm;r.classList.remove('pm-hide','pm-wrap','pm-even');
  const keep=r.offsetParent&&r.scrollWidth>r.clientWidth+2;
  if(keep)r.classList.add(was==='switch'?'pm-hide':was==='wrap'?'pm-wrap':'pm-even');else undo(r)})}
function run(){t=null;if(innerWidth>=1000){document.querySelectorAll('[data-pm]').forEach(undo);mo.takeRecords();return}   /* computers keep the side menu look as is */
  recheck();document.querySelectorAll('.view.on '+ROWS.split(', ').join(', .view.on ')).forEach(fix);mo.takeRecords()}   /* our own changes don't re-trigger */
function soon(){if(!t)t=setTimeout(run,30)}
function reset(){document.querySelectorAll('[data-pm]').forEach(undo);soon()}
const views=document.querySelector('.views')||document.body;
const mo=new MutationObserver(ms=>{if(ms.some(m=>m.type==='attributes'||[...m.addedNodes].some(n=>n.nodeType===1&&!n.classList.contains('pm-dd')&&!n.closest('.pm-dd'))))soon()});
mo.observe(views,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
let w=innerWidth;addEventListener('resize',()=>{if(innerWidth!==w){w=innerWidth;reset()}});
soon();
window.RNGCMENUS={run,reset};
})();
