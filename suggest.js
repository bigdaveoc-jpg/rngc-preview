/* Suggestion chat (David, Nov 24 2026: "need to have a suggestion pop chat window for ross, so he can suggest what they
   want changed"). Club leaders (admins and chapter presidents) get a small Suggest button over the app. It opens one
   running chat with the build team: type what you'd like changed, the screen you were on rides along, and each
   suggestion shows where it stands (Sent, Working on it, Done, Not now). Team replies land here and ping the phone.
   Square corners only (no pill shapes, David Nov 19). Hidden on the golf hole screen so it never covers a score. */
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
const TABS={home:'Home',events:'Events',golf:'Golf',courses:'Courses',games:'Games',forum:'Forum',members:'Members',shop:'Shop',settings:'Settings'};
const STATUS={new:'Sent',doing:'Working on it',done:'Done',no:'Not now'};
function screen(){let t='';try{t=(typeof S!=='undefined'&&S.tab)||''}catch(e){}
  let h=location.hash||'';try{if(t==='golf'){const f=document.getElementById('golfFrame');if(f)h=f.contentWindow.location.hash||h}}catch(e){}
  return (t?'#'+t:'')+(h&&h!=='#'+t?h.replace(/^#/,'/'):'')}
function screenName(p){if(!p)return '';const t=(p.match(/^#(\w+)/)||[])[1];return TABS[t]||t||''}
function when(ms){const d=new Date(ms),n=new Date();const tm=d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
  return d.toDateString()===n.toDateString()?tm:d.toLocaleDateString([], {month:'short',day:'numeric'})+' '+tm}

const css=`#rgSugBtn{position:fixed;right:14px;bottom:calc(62px + max(8px,env(safe-area-inset-bottom)) + 14px);z-index:45;display:flex;align-items:center;gap:7px;
  min-height:44px;padding:0 14px;border:1px solid var(--silver-2,#aeb5bf);border-radius:6px;background:rgba(17,19,23,.94);color:var(--text,#eef0f3);
  font:700 15px var(--body,Barlow,system-ui,sans-serif);letter-spacing:.02em;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.45)}
#rgSugBtn i{font-size:20px;color:var(--silver,#d5dae1)}
#rgSugBtn b{min-width:20px;height:20px;padding:0 5px;border-radius:4px;background:#e0a526;color:#0a0b0d;font:800 12px/20px var(--body,Barlow,sans-serif);text-align:center}
#rgSugBtn[hidden],#rgSugBtn b[hidden],#rgSug[hidden]{display:none}
body.golffull #rgSugBtn{display:none}
@media (min-width:1000px){#rgSugBtn{bottom:22px;right:22px}}
#rgSug{position:fixed;inset:0;z-index:9400;background:rgba(5,5,6,.6);display:flex;align-items:flex-end;justify-content:center;
  font-family:var(--body,Barlow,system-ui,sans-serif);color:var(--text,#eef0f3)}
#rgSug .box{width:100%;max-width:520px;height:min(86vh,720px);display:flex;flex-direction:column;background:var(--bg-2,#111317);
  border:1px solid var(--line,#2a2f37);border-bottom:0;border-radius:6px 6px 0 0;padding-bottom:env(safe-area-inset-bottom)}
@media (min-width:1000px){#rgSug{align-items:flex-end;justify-content:flex-end;padding:0 22px 22px;background:rgba(5,5,6,.35)}
  #rgSug .box{width:400px;height:600px;border-bottom:1px solid var(--line,#2a2f37);border-radius:6px}}
#rgSug .hd{display:flex;align-items:center;gap:10px;padding:14px 14px 12px 16px;border-bottom:1px solid var(--line,#2a2f37)}
#rgSug .hd h2{flex:1;margin:0;font:800 22px/1 var(--display,'Barlow Condensed',sans-serif);text-transform:uppercase;letter-spacing:.03em}
#rgSug .x{width:44px;height:44px;border:1px solid var(--line,#2a2f37);border-radius:6px;background:none;color:var(--text,#eef0f3);font-size:22px;cursor:pointer;display:grid;place-items:center}
#rgSug .list{flex:1;overflow-y:auto;padding:14px 14px 6px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}
#rgSug .hi{color:var(--muted,#9aa2ae);font-size:15px;line-height:1.45;margin:0 0 4px;padding:12px 14px;border:1px dashed var(--line,#2a2f37);border-radius:6px}
#rgSug .m{max-width:86%;padding:10px 12px;border-radius:6px;font-size:16px;line-height:1.4;white-space:pre-wrap;overflow-wrap:anywhere}
#rgSug .m.me{align-self:flex-end;background:#1c2027;border:1px solid var(--silver-2,#aeb5bf)}
#rgSug .m.team{align-self:flex-start;background:#15181d;border:1px solid var(--line,#2a2f37)}
#rgSug .m .who{display:block;font-size:13px;font-weight:700;color:var(--silver,#d5dae1);margin-bottom:3px}
#rgSug .m .meta{display:block;margin-top:6px;font-size:13px;color:var(--muted,#9aa2ae);white-space:normal}
#rgSug .m .st{font-weight:700;color:var(--silver,#d5dae1)}
#rgSug .m .st.doing{color:#e0a526}#rgSug .m .st.done{color:#7fd492}
#rgSug .m.wait{opacity:.6}
#rgSug .ft{border-top:1px solid var(--line,#2a2f37);padding:10px 12px 12px}
#rgSug textarea{width:100%;min-height:76px;max-height:180px;resize:vertical;box-sizing:border-box;padding:10px 12px;border:1px solid var(--line,#2a2f37);border-radius:6px;
  background:var(--bg,#0a0b0d);color:var(--text,#eef0f3);font:16px/1.4 var(--body,Barlow,sans-serif)}
#rgSug textarea:focus{outline:2px solid var(--silver-2,#aeb5bf);outline-offset:1px}
#rgSug .row{display:flex;align-items:center;gap:10px;margin-top:8px}
#rgSug label{flex:1;display:flex;align-items:center;gap:8px;font-size:14px;color:var(--muted,#9aa2ae);cursor:pointer;min-height:44px}
#rgSug label input{width:20px;height:20px;margin:0;accent-color:#d5dae1}
#rgSug .go{min-height:44px;padding:0 22px;border:0;border-radius:6px;background:var(--silver,#d5dae1);color:var(--on-silver,#0a0b0d);font:700 16px var(--body,Barlow,sans-serif);cursor:pointer}
#rgSug .go:disabled{opacity:.45;cursor:not-allowed}
#rgSug .err{color:#ffb3b5;font-size:14px;min-height:0;margin-top:6px}
#rgSug .err:empty{display:none}`;

let btn=null,box=null,items=[],unread=0,busy=false,timer=null,lastPull=0;
function build(){if(btn)return;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  btn=document.createElement('button');btn.id='rgSugBtn';btn.type='button';btn.hidden=true;btn.setAttribute('aria-label','Suggest a change to the app');
  btn.innerHTML='<i class="ph-bold ph-chat-text" aria-hidden="true"></i><span>Suggest</span><b hidden></b>';
  btn.onclick=open;document.body.appendChild(btn);
  box=document.createElement('div');box.id='rgSug';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','rgSugH');
  box.innerHTML=`<div class="box"><div class="hd"><h2 id="rgSugH">Suggest a change</h2><button class="x" type="button" aria-label="Close"><i class="ph-bold ph-x"></i></button></div>
   <div class="list" aria-live="polite"></div>
   <div class="ft"><textarea id="rgSugT" maxlength="1500" placeholder="What would you like changed? Be as specific as you like."></textarea>
    <div class="row"><label><input type="checkbox" id="rgSugP" checked><span id="rgSugPL">Include the screen I'm on</span></label><button class="go" type="button" disabled>Send</button></div>
    <div class="err" role="alert"></div></div></div>`;
  document.body.appendChild(box);
  box.addEventListener('click',e=>{if(e.target===box)close()});
  box.querySelector('.x').onclick=close;
  const t=box.querySelector('textarea'),go=box.querySelector('.go');
  t.oninput=()=>{go.disabled=busy||!t.value.trim()};
  t.onkeydown=e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();send()}};
  go.onclick=send;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!box.hidden)close()})}

function paint(){if(!box)return;const L=box.querySelector('.list'),nm=(me()&&me().name||'').split(' ')[0];
  const hi=`<p class="hi">Hey${nm?' '+esc(nm):''}, tell us anything you'd like added, changed or fixed in the app. We read every one and answer right here.</p>`;
  L.innerHTML=hi+items.map(m=>{const meta=m.side==='me'
      ?`<span class="meta"><span class="st ${esc(m.status||'new')}">${m.wait?'Sending':(STATUS[m.status]||'Sent')}</span> · ${esc(when(m.at))}${screenName(m.page)?' · from '+esc(screenName(m.page)):''}</span>`
      :`<span class="meta">${esc(when(m.at))}</span>`;
    return `<div class="m ${m.side==='me'?'me':'team'}${m.wait?' wait':''}">${m.side==='team'?'<span class="who">App team</span>':''}${esc(m.body)}${meta}</div>`}).join('');
  L.scrollTop=L.scrollHeight}
function badge(){if(!btn)return;const b=btn.querySelector('b');b.hidden=!unread;b.textContent=unread>9?'9+':String(unread)}
function pull(){if(!leader())return Promise.resolve();lastPull=Date.now();
  return call('/suggest/mine').then(j=>{items=j.items||[];unread=box&&!box.hidden?0:(j.unread||0);badge();
    if(box&&!box.hidden){paint();if(j.unread)call('/suggest/seen',{}).catch(()=>{})}}).catch(()=>{})}
function open(){build();box.hidden=false;document.documentElement.style.overflow='hidden';
  const sn=screenName(screen());box.querySelector('#rgSugPL').textContent=sn?`Include the screen I'm on · ${sn}`:`Include the screen I'm on`;
  paint();unread=0;badge();pull();clearInterval(timer);timer=setInterval(pull,20000);
  setTimeout(()=>{const t=box.querySelector('textarea');if(t&&matchMedia('(min-width:1000px)').matches)t.focus()},60)}
function close(){if(!box)return;box.hidden=true;document.documentElement.style.overflow='';clearInterval(timer);timer=null;
  if(location.hash==='#suggest')try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
function send(){const t=box.querySelector('textarea'),go=box.querySelector('.go'),err=box.querySelector('.err'),text=t.value.trim();
  if(!text||busy)return;busy=true;go.disabled=true;err.textContent='';
  const page=box.querySelector('#rgSugP').checked?screen():'';
  const temp={side:'me',body:text,page,status:'new',at:Date.now(),wait:1};items.push(temp);paint();
  call('/suggest/send',{text,page}).then(r=>{temp.wait=0;temp.id=r.id;temp.at=r.at||temp.at;t.value='';paint();
      if(typeof toast==='function')toast('Sent. We\'ll answer here.');pull()})
    .catch(x=>{items=items.filter(i=>i!==temp);paint();
      err.textContent=x.status===401?'Your sign-in ran out. Sign in again.':x.status===429?'That\'s a lot at once. Give it a few minutes.':x.status===403?'Suggestions are for club leaders.':'We can\'t reach the club server. Check your signal and try again.'})
    .finally(()=>{busy=false;go.disabled=!t.value.trim()})}

/* show for leaders only; re-check after sign-in or sign-out, and when the app comes back to the front */
function check(){build();const ok=leader();btn.hidden=!ok;if(!ok){if(box&&!box.hidden)close();items=[];unread=0;badge();return}
  if(Date.now()-lastPull>60000)pull();if(location.hash==='#suggest'&&box.hidden)open()}
if(typeof window.signedIn==='function'){const orig=window.signedIn;window.signedIn=function(){const r=orig.apply(this,arguments);lastPull=0;setTimeout(check,500);return r}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
window.addEventListener('hashchange',()=>{if(location.hash==='#suggest')check()});
setInterval(()=>{if(!btn)return;if(btn.hidden===leader())check();else if(!btn.hidden&&document.visibilityState==='visible'&&Date.now()-lastPull>120000)pull()},3000);
setTimeout(check,900);
window.RNGCSUGGEST={open,check};
})();
