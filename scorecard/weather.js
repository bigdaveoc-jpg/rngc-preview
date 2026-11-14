/* Weather on the hole screen (David, Nov 14 2026: "also need to get weather condition while in game").
   A strip under the yards: temperature, sky, wind speed and gusts, which way the wind hits you on THIS hole (into you,
   helping, across and which way), rain chance for the next 3 hours, and about how long the hole plays with that wind.
   Source: the US National Weather Service (free, no key): the nearest station's latest reading for wind, the hourly
   forecast for the rest. Kept 10 minutes on the phone; tap the strip to refresh. US courses only.
   Ball marks save the wind at that moment so Where my ball goes can compare drives into the wind and with it. */
(function(){
'use strict';
const TTL=10*60e3,KEY='rngc-wx',NWS='https://api.weather.gov';
const DIRS=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
const r0=Math.round;
let mem=null,busy=null,failAt=0;
const lsGet=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};

/* where the course is: the hole map's green, else the course's own spot, else where the phone is */
function spot(n){try{const m=CO().maps&&(CO().maps[n]||CO().maps[1]);if(m&&m.gc)return m.gc;const c=CO();if(c&&c.lat!=null)return[c.lat,c.lng]}catch(e){}
  const f=window.RNGC_FIX;return f?[f.lat,f.lng]:null}
const keyOf=p=>p[0].toFixed(2)+','+p[1].toFixed(2);
const j=u=>fetch(u,{headers:{Accept:'application/geo+json'}}).then(r=>{if(!r.ok)throw new Error('weather '+r.status);return r.json()});
const mph=v=>v==null?null:v*0.621371;   /* NWS readings come in km/h */
const fFromC=c=>c==null?null:c*9/5+32;

async function load(p){const k=keyOf(p),pts=lsGet(KEY+':pt:'+k);let pt=pts;
  if(!pt||Date.now()-pt.at>30*864e5){const r=await j(`${NWS}/points/${p[0].toFixed(4)},${p[1].toFixed(4)}`);pt={hourly:r.properties.forecastHourly,stations:r.properties.observationStations,at:Date.now()};lsSet(KEY+':pt:'+k,pt)}
  const [fc,st]=await Promise.all([j(pt.hourly),pt.st?Promise.resolve(pt.st):j(pt.stations).then(r=>{const ids=(r.features||[]).slice(0,3).map(f=>f.properties.stationIdentifier);pt.st=ids;lsSet(KEY+':pt:'+k,pt);return ids}).catch(()=>[])]);
  const now=Date.now(),per=(fc.properties.periods||[]).filter(x=>new Date(x.endTime).getTime()>now),cur=per[0];if(!cur)throw new Error('no forecast');
  const fw=String(cur.windSpeed||'').match(/\d+/g)||[],w={t:now,src:'forecast',temp:cur.temperature,sky:cur.shortForecast||'',
    wind:fw.length?+fw[fw.length-1]:0,gust:null,dir:DIRS.indexOf(cur.windDirection)*22.5,rain:Math.max(0,...per.slice(0,3).map(x=>(x.probabilityOfPrecipitation||{}).value||0))};
  if(w.dir<0)w.dir=null;
  for(const id of st||[]){try{const o=(await j(`${NWS}/stations/${id}/observations/latest`)).properties,age=now-new Date(o.timestamp).getTime();
    if(age>90*60e3||!o.windSpeed||o.windSpeed.value==null)continue;
    w.wind=r0(mph(o.windSpeed.value));w.dir=o.windDirection&&o.windDirection.value!=null?o.windDirection.value:w.dir;w.gust=o.windGust&&o.windGust.value!=null?r0(mph(o.windGust.value)):null;
    if(o.temperature&&o.temperature.value!=null)w.temp=r0(fFromC(o.temperature.value));if(o.textDescription)w.sky=o.textDescription;w.src=id;w.obsAge=r0(age/60e3);break}catch(e){}}
  return w}
function get(n,force){const p=spot(n);if(!p)return Promise.reject(new Error('no spot'));const k=keyOf(p);
  if(!mem){const c=lsGet(KEY);if(c&&c.k===k)mem=c}
  if(!force&&mem&&mem.k===k&&Date.now()-mem.t<TTL)return Promise.resolve(mem);
  if(busy)return busy;if(!force&&Date.now()-failAt<60e3)return Promise.reject(new Error('wait'));
  busy=load(p).then(w=>{w.k=k;mem=w;lsSet(KEY,w);busy=null;return w}).catch(e=>{busy=null;failAt=Date.now();throw e});return busy}

/* the wind on this hole: bearing tee to green, then how the wind meets it */
function bearing(m){if(!m||!m.tc||!m.gc)return null;const[a,b]=m.tc,[c,d]=m.gc,kx=Math.cos(a*Math.PI/180);return(Math.atan2((d-b)*kx,c-a)*180/Math.PI+360)%360}
function onHole(w,n){const m=CO().maps&&CO().maps[n],hb=bearing(m);if(w.dir==null||hb==null||!w.wind)return null;
  const rel=((w.dir-hb)%360+360)%360,rad=rel*Math.PI/180,head=w.wind*Math.cos(rad),cross=w.wind*Math.sin(rad);
  /* wind comes FROM w.dir; head>0 = in your face; cross>0 = from your right, so it pushes the ball left */
  const a=Math.abs(head),c=Math.abs(cross);let say;
  if(w.wind<4)say='barely any wind';
  else if(a>=c*1.7)say=head>0?'into you':'helping';
  else if(c>=a*1.7)say=cross>0?'across, right to left':'across, left to right';
  else say=(head>0?'into you':'helping')+', '+(cross>0?'right to left':'left to right');
  return{rel,head,cross,say,blow:(rel+180)%360}}
/* rule of thumb: into the wind costs about 1% a mph, wind behind gives back about half that */
const playsLike=(yds,head)=>r0(yds*(1+(head>0?head*0.01:head*0.005)));

const ico=s=>/thunder/i.test(s)?'cloud-lightning':/snow/i.test(s)?'snowflake':/rain|shower|drizzle/i.test(s)?'cloud-rain':/fog|haze|smoke/i.test(s)?'cloud-fog':/overcast|mostly cloudy|cloudy/i.test(s)?'cloud':/partly|few clouds|mostly sunny/i.test(s)?'cloud-sun':/clear|sunny|fair/i.test(s)?'sun':'cloud-sun';
function body(w,n){const hw=onHole(w,n),ty=(TEE().y||[])[n-1];
  return `<span class="wxa"${hw?` style="transform:rotate(${hw.blow}deg)"`:''} aria-hidden="true">${hw?'<i class="ph-bold ph-arrow-up"></i>':`<i class="ph-bold ph-${ico(w.sky)}"></i>`}</span>
   <span class="wxt"><b>${w.temp!=null?w.temp+'°':''} ${esc(w.sky)}</b><span>Wind ${w.wind} mph${w.gust&&w.gust>w.wind+3?', gusts '+w.gust:''}${hw?' · <b>'+hw.say+'</b>':''}${w.rain>=10?' · rain '+w.rain+'%':''}</span></span>
   ${hw&&ty&&Math.abs(playsLike(ty,hw.head)-ty)>=3?`<span class="wxp"><b>${playsLike(ty,hw.head)}</b><small>plays like</small></span>`:''}`}
window.wxStrip=function(n){if(!spot(n))return'';const fresh=mem&&Date.now()-mem.t<TTL;
  if(!fresh)setTimeout(()=>get(n).then(()=>fill(n)).catch(()=>{const el=$('#wx');if(el&&!mem)el.innerHTML='<span class="wxt"><span>Weather not available right now. Tap to try again.</span></span>'}),0);
  return `<button type="button" class="card wx" id="wx" data-wx="${n}" aria-label="Weather and wind. Tap to refresh">${mem?body(mem,n):'<span class="wxt"><span>Getting the weather...</span></span>'}</button>`};
function fill(n){const el=$('#wx');if(el&&mem)el.innerHTML=body(mem,n)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-wx]');if(!b)return;const n=+b.dataset.wx;b.classList.add('wxbusy');
  get(n,true).then(()=>{fill(n);b.classList.remove('wxbusy')}).catch(()=>{b.classList.remove('wxbusy')})});

/* for ball marks: the wind on that hole right now, from what's already loaded (no extra call) */
window.wxNow=function(n){if(!mem||Date.now()-mem.t>30*60e3)return null;const hw=onHole(mem,n);
  return{w:mem.wind,g:mem.gust,f:mem.temp,h:hw?+hw.head.toFixed(1):null,c:hw?+hw.cross.toFixed(1):null}};
window.RNGCWX={onHole,playsLike,bearing};

const st=document.createElement('style');st.textContent=`
.wx{display:flex;align-items:center;gap:12px;width:100%;padding:10px 14px;margin-top:10px;text-align:left;color:inherit;font:inherit;cursor:pointer}
.wx .wxa{flex:none;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--panel-2);border:1px solid var(--line);font-size:22px;transition:transform .4s var(--ease)}
.wx .wxt{flex:1;min-width:0;display:flex;flex-direction:column;line-height:1.3}.wx .wxt>b{font-size:15px}.wx .wxt>span{font-size:14px;color:var(--muted)}.wx .wxt>span b{color:var(--text,inherit)}
.wx .wxp{flex:none;text-align:center;line-height:1}.wx .wxp b{display:block;font-family:var(--display);font-size:28px}.wx .wxp small{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.wx.wxbusy{opacity:.6}
`;document.head.appendChild(st);
})();
