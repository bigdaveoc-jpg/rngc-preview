/* Club policies, one time (David, Nov 12 2026): a signed-in member agrees once to the Terms, Privacy policy and
   Raider Bucks rules. The club server keeps who agreed, to which version and when (GET /terms/me, POST /terms/accept).
   A new version on the server asks again. Guests and the demo never see it. No signal: the app doesn't block,
   it asks on the next open. */
(function(){
const CLUB_API='https://rngc-club.137.184.188.41.sslip.io';
const api=()=>{try{const o=/^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&localStorage.getItem('rngc-club-api');if(o)return o.replace(/\/$/,'')}catch(e){}return CLUB_API};
const tok=()=>{try{return localStorage.getItem('rngc-auth-token')||''}catch(e){return ''}};
const call=(path,body)=>fetch(api()+path,{method:body?'POST':'GET',cache:'no-store',
  headers:Object.assign({Authorization:'Bearer '+tok()},body?{'Content-Type':'application/json'}:{}),body:body?JSON.stringify(body):undefined})
  .then(async r=>{const j=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(j.error||'The club server had a problem.'),{status:r.status});return j});

const css=`#rgTerms{position:fixed;inset:0;z-index:9500;display:grid;place-items:center;overflow-y:auto;background:rgba(5,5,6,.94);
  padding:24px 16px calc(24px + env(safe-area-inset-bottom));font-family:var(--body,Barlow,system-ui,sans-serif);color:var(--text,#eef0f3)}
#rgTerms[hidden]{display:none}
#rgTerms .box{width:100%;max-width:440px;background:var(--panel,#16191e);border:1px solid var(--line,#2a2f37);border-radius:16px;padding:22px 20px}
#rgTerms img{width:52px;height:52px;display:block;margin:0 auto 10px}
#rgTerms h2{font:800 26px/1.05 var(--display,'Barlow Condensed',sans-serif);text-transform:uppercase;letter-spacing:.03em;text-align:center;margin:0 0 6px}
#rgTerms .lede{color:var(--muted,#9aa2ae);text-align:center;margin:0 0 14px}
#rgTerms ul{list-style:none;margin:0 0 14px;padding:0}
#rgTerms li{display:flex;gap:10px;padding:8px 0;border-top:1px solid var(--line,#2a2f37);font-size:15px;line-height:1.4}
#rgTerms li i{font-size:20px;color:var(--silver,#d5dae1);flex:none;margin-top:1px}
#rgTerms .links{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:15px;margin:0 0 14px}
#rgTerms .links a{color:var(--silver,#d5dae1);text-decoration:underline}
#rgTerms label{display:flex;gap:12px;align-items:flex-start;cursor:pointer;font-size:15px;line-height:1.4;padding:10px 0}
#rgTerms input{width:24px;height:24px;flex:none;margin:0;accent-color:#d5dae1}
#rgTerms .go{display:flex;align-items:center;justify-content:center;width:100%;min-height:50px;margin-top:8px;border:0;border-radius:999px;
  background:var(--silver,#d5dae1);color:var(--on-silver,#0a0b0d);font:700 17px var(--body,Barlow,sans-serif);cursor:pointer}
#rgTerms .go:disabled{opacity:.45;cursor:not-allowed}
#rgTerms .err{color:#ffb3b5;min-height:1.4em;margin-top:8px;font-size:15px;text-align:center}
#rgTerms .out{display:block;margin:6px auto 0;padding:10px;color:var(--muted,#9aa2ae);font-size:15px;background:none;border:0;text-decoration:underline;cursor:pointer}`;

let box=null,ver='',busy=false;
function build(){if(box)return box;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  box=document.createElement('div');box.id='rgTerms';box.hidden=true;box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','rgTermsH');
  box.innerHTML=`<div class="box"><img src="/assets/logo/rngc-ball-static.svg" alt="">
   <h2 id="rgTermsH">Club rules</h2><p class="lede">One quick thing before you jump in. You only do this once.</p>
   <ul>
    <li><i class="ph-bold ph-coins"></i><span>Raider Bucks are club points with no cash value. They can't be bought, sold or cashed out.</span></li>
    <li><i class="ph-bold ph-hand-coins"></i><span>Side games are a tally. Players settle up; the club never holds money.</span></li>
    <li><i class="ph-bold ph-shield-check"></i><span>We don't sell your info. Other members see your name, chapter and the city you pick.</span></li>
   </ul>
   <div class="links"><a href="/terms/" target="_blank" rel="noopener">Terms of use</a><a href="/privacy/" target="_blank" rel="noopener">Privacy policy</a><a href="/bucks-rules/" target="_blank" rel="noopener">Raider Bucks rules</a></div>
   <label><input type="checkbox" id="rgTermsOk"><span>I'm 18 or older and I agree to the Terms of use, Privacy policy and Raider Bucks rules.</span></label>
   <button class="go" id="rgTermsGo" type="button" disabled>Agree and continue</button>
   <div class="err" id="rgTermsErr" role="alert"></div>
   <button class="out" id="rgTermsOut" type="button">Not now, sign me out</button></div>`;
  document.body.appendChild(box);
  const ok=box.querySelector('#rgTermsOk'),go=box.querySelector('#rgTermsGo'),err=box.querySelector('#rgTermsErr');
  ok.onchange=()=>{go.disabled=!ok.checked||busy};
  go.onclick=()=>{if(!ok.checked||busy)return;busy=true;go.disabled=true;go.textContent='Saving';err.textContent='';
    call('/terms/accept',{version:ver}).then(()=>{hide();if(typeof toast==='function')toast('Thanks. Welcome to the club app.')})
     .catch(x=>{if(x.status===409){busy=false;go.textContent='Agree and continue';ok.checked=false;check();return}
       err.textContent=x.status===401?'Your sign-in ran out. Sign in again.':'We can\'t reach the club server. Check your signal and try again.'})
     .finally(()=>{busy=false;go.textContent='Agree and continue';go.disabled=!ok.checked})};
  box.querySelector('#rgTermsOut').onclick=async()=>{hide();try{if(typeof signOutReal==='function')await signOutReal();else localStorage.removeItem('rngc-auth-token')}catch(e){}location.reload()};
  return box}
function show(){build();box.hidden=false;document.documentElement.style.overflow='hidden';setTimeout(()=>{const c=box.querySelector('#rgTermsOk');if(c)c.focus()},50)}
function hide(){if(box)box.hidden=true;document.documentElement.style.overflow=''}

let last=0;
function check(){if(!tok()||!api())return hide();if(Date.now()-last<3000)return;last=Date.now();
  call('/terms/me').then(j=>{ver=j.version;j.ok?hide():show()}).catch(x=>{if(x.status===401)hide()})}  /* offline: don't block */

/* ask after a fresh sign-in, on open, and when the app comes back to the front */
if(typeof window.signedIn==='function'){const orig=window.signedIn;window.signedIn=function(){const r=orig.apply(this,arguments);last=0;setTimeout(check,400);return r}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')check()});
setTimeout(check,800);
window.RNGCTERMS={check};
})();
