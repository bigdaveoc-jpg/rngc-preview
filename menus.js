/* No sideways scrolling menus on phones (David, Nov 12 2026: "having to scroll right, I don't like that").
   After any page draws, each menu row that doesn't fit the screen is changed:
   - page menus (Home sections, Events, Members, Settings...): one full-width button with the section you're on;
     tap it and a sheet lists every section, like the side menu on a computer.
   - filter rows (forum topics, shop categories, member lists): the tabs wrap onto a second line.
   Rows that already fit are left alone. The original buttons stay (hidden), so every tap runs the same code as before. */
(function(){
const css=`.pm-hide{display:none!important}
@media(max-width:699px){.pm-long{display:none}}
.pm-wrap.pm-wrap{flex-wrap:wrap;overflow:visible;row-gap:12px}
.pm-even.pm-even{gap:6px}
.pm-even.pm-even > *{flex:1 1 0!important;min-width:0!important;justify-content:center;text-align:center;white-space:normal!important;line-height:1.15}
.pm-switch{display:flex;align-items:center;gap:10px;width:100%;margin-top:14px;padding:12px 14px;border:1px solid var(--line,#2a2f37);border-radius:12px;
  background:var(--panel,#16191e);color:var(--text,#eef0f3);text-align:left;cursor:pointer}
.pm-switch small{display:block;font:600 11px var(--body,Barlow,sans-serif);letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#9aa2ae)}
.pm-switch b{display:block;font:800 19px/1.15 var(--display,'Barlow Condensed',sans-serif);letter-spacing:.04em;text-transform:uppercase}
.pm-switch span{flex:1;min-width:0}
.pm-switch i{font-size:20px;color:var(--silver,#d5dae1)}
.pm-switch:active{opacity:.75}
.pm-list{display:grid;gap:2px;margin-top:6px}
.pm-list button{display:flex;align-items:center;gap:12px;width:100%;min-height:50px;padding:0 14px;border-radius:10px;color:var(--muted,#9aa2ae);
  font:600 17px var(--body,Barlow,sans-serif);text-align:left;cursor:pointer}
.pm-list button i{font-size:20px;width:22px;text-align:center}
.pm-list button[aria-current="true"]{background:var(--panel-2,#1d2127);color:var(--text,#eef0f3)}
.pm-list button:active{opacity:.7}
.pm-head{font:800 22px var(--display,'Barlow Condensed',sans-serif);text-transform:uppercase;letter-spacing:.03em;margin:4px 4px 6px}`;
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
  const sw=document.createElement('button');sw.type='button';sw.className='pm-switch';sw.setAttribute('aria-haspopup','dialog');
  sw.innerHTML=`<span><small>${esc(area?area+' sections':'Sections')}</small><b>${esc(label(cur))}</b></span><i class="ph-bold ph-caret-down"></i>`;
  sw.addEventListener('click',()=>open(r,area));
  r.parentNode.insertBefore(sw,r);
}
function open(r,area){
  const bs=btns(r);
  if(typeof openSheet!=='function')return;
  openSheet(`<div class="pm-head">${esc(area||'Sections')}</div><div class="pm-list" role="menu">${bs.map((b,i)=>{
    const on=b.getAttribute('aria-pressed')==='true'||b.getAttribute('aria-selected')==='true';const ic=b.querySelector('i');
    return `<button type="button" role="menuitem" data-pmi="${i}" aria-current="${on}">${ic?ic.outerHTML:''}${esc(label(b))}</button>`}).join('')}</div>`);
  const sh=document.getElementById('sheet');
  sh.querySelectorAll('[data-pmi]').forEach(x=>x.addEventListener('click',()=>{const b=bs[+x.dataset.pmi];if(typeof closeSheet==='function')closeSheet();if(b&&b.isConnected)b.click()}));
}
let t=null;
function undo(r){r.classList.remove('pm-hide','pm-wrap','pm-even');delete r.dataset.pm;const p=r.previousElementSibling;if(p&&p.classList.contains('pm-switch'))p.remove()}
/* a row the page itself hides now (wider screen) drops its switcher; a row that fits again goes back to normal */
function recheck(){document.querySelectorAll('[data-pm]').forEach(r=>{const was=r.dataset.pm;r.classList.remove('pm-hide','pm-wrap','pm-even');
  const keep=r.offsetParent&&r.scrollWidth>r.clientWidth+2;
  if(keep)r.classList.add(was==='switch'?'pm-hide':was==='wrap'?'pm-wrap':'pm-even');else undo(r)})}
function run(){t=null;if(innerWidth>=1000){document.querySelectorAll('[data-pm]').forEach(undo);mo.takeRecords();return}   /* computers keep the side menu look as is */
  recheck();document.querySelectorAll('.view.on '+ROWS.split(', ').join(', .view.on ')).forEach(fix);mo.takeRecords()}   /* our own changes don't re-trigger */
function soon(){if(!t)t=setTimeout(run,30)}
function reset(){document.querySelectorAll('[data-pm]').forEach(undo);soon()}
const views=document.querySelector('.views')||document.body;
const mo=new MutationObserver(ms=>{if(ms.some(m=>m.type==='attributes'||[...m.addedNodes].some(n=>n.nodeType===1&&!n.classList.contains('pm-switch'))))soon()});
mo.observe(views,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
let w=innerWidth;addEventListener('resize',()=>{if(innerWidth!==w){w=innerWidth;reset()}});
soon();
window.RNGCMENUS={run,reset};
})();
