/* RNGC hole view in Google 3D (David, Nov 16 2026: "google 3d is the way to go" after the demo page).
   The free aerial photo stays the default; a 3D button on the big hole view loads Google's 3D map only when tapped,
   so Google bills only the players who use it. One 3D map is made per page visit and moved from hole to hole.
   Camera heights are meters above sea level, so ground height comes from Open-Meteo (free, no key), kept per spot. */
(function(){
'use strict';
const ELEV_KEY='rngc-elev-v1';
let gm=null,lib=null,map=null,busy=0;
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
function bearing([a1,o1],[a2,o2]){const y=Math.sin(rad(o2-o1))*Math.cos(rad(a2)),x=Math.cos(rad(a1))*Math.sin(rad(a2))-Math.sin(rad(a1))*Math.cos(rad(a2))*Math.cos(rad(o2-o1));return (deg(Math.atan2(y,x))+360)%360}
function meters([a1,o1],[a2,o2]){const R=6371000,dl=rad(a2-a1),dn=rad(o2-o1),h=Math.sin(dl/2)**2+Math.cos(rad(a1))*Math.cos(rad(a2))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))}

function loadKey(){return window.RNGC_MAPS_KEY?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='../maps-key.js';s.onload=ok;s.onerror=()=>no(new Error('3D needs signal. Try again in a moment.'));document.head.appendChild(s)})}
function loadG(){return gm||(gm=loadKey().then(()=>new Promise((ok,no)=>{if(!window.RNGC_MAPS_KEY)return no(new Error('3D is not set up yet.'));
  if(window.google&&window.google.maps&&window.google.maps.importLibrary)return ok();
  window.__gm3=ok;window.gm_authFailure=()=>no(new Error('Google turned the 3D map down.'));
  const s=document.createElement('script');s.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(window.RNGC_MAPS_KEY)+'&v=beta&loading=async&callback=__gm3';
  s.async=true;s.onerror=()=>no(new Error('3D needs signal. Try again in a moment.'));document.head.appendChild(s)}))).catch(e=>{gm=null;throw e})}

/* ground height in meters for each [lat,lng], saved on the phone so a hole only asks once */
async function heights(pts){let c={};try{c=JSON.parse(localStorage.getItem(ELEV_KEY)||'{}')}catch(e){}
  const k=p=>p[0].toFixed(5)+','+p[1].toFixed(5),need=pts.filter(p=>c[k(p)]==null);
  if(need.length){try{const ac=new AbortController(),t=setTimeout(()=>ac.abort(),6000);
    const r=await fetch('https://api.open-meteo.com/v1/elevation?latitude='+need.map(p=>p[0].toFixed(6)).join(',')+'&longitude='+need.map(p=>p[1].toFixed(6)).join(','),{signal:ac.signal});
    clearTimeout(t);const j=await r.json();(j.elevation||[]).forEach((z,i)=>{if(isFinite(z))c[k(need[i])]=z});
    try{localStorage.setItem(ELEV_KEY,JSON.stringify(c))}catch(e){}}catch(e){}}
  return pts.map(p=>c[k(p)])}

/* behind the tee, looking down the hole at the green */
function teeCam(h){const hd=bearing(h.tee,h.green),L=meters(h.tee,h.green),f=.6;
  return {center:{lat:h.tee[0]+(h.green[0]-h.tee[0])*f,lng:h.tee[1]+(h.green[1]-h.tee[1])*f,altitude:h.gz},range:Math.max(220,L*.9),tilt:55,heading:hd}}

async function show(box,h){const my=++busy;
  box.innerHTML='<div class="h3wait"><i class="ph-bold ph-cube"></i> Loading 3D...</div>';
  try{await loadG();if(!lib)lib=await window.google.maps.importLibrary('maps3d');
    const [tz,gz]=await heights([h.tee,h.green]);if(my!==busy)return;
    h.tz=isFinite(tz)?tz:(isFinite(gz)?gz:0);h.gz=isFinite(gz)?gz:h.tz;
    const {Map3DElement,Marker3DElement}=lib,cam=teeCam(h);
    if(!map)map=new Map3DElement({...cam,mode:'SATELLITE',defaultUIHidden:true});
    else{try{map.stopCameraAnimation()}catch(e){}Object.assign(map,cam)}
    map.querySelectorAll('gmp-marker-3d').forEach(x=>x.remove());
    [[h.tee,'Tee'],[h.green,'Pin']].forEach(([p,l])=>map.append(new Marker3DElement({position:{lat:p[0],lng:p[1]},altitudeMode:'CLAMP_TO_GROUND',label:l})));
    box.innerHTML='<button class="h3fly" type="button"><i class="ph-bold ph-airplane-tilt"></i> Fly the hole</button><div class="h3hint">Drag to turn · pinch to zoom</div>';
    box.prepend(map);box.querySelector('.h3fly').onclick=()=>fly(h);
  }catch(e){if(my===busy)box.innerHTML=`<div class="h3wait">${String(e.message||'3D did not load. Try again.').replace(/[<&]/g,'')}</div>`}}

async function fly(h){if(!map)return;const my=++busy,hd=bearing(h.tee,h.green),L=meters(h.tee,h.green),wait=ms=>new Promise(r=>setTimeout(r,ms));
  try{map.stopCameraAnimation()}catch(e){}
  map.flyCameraTo({endCamera:{center:{lat:h.tee[0],lng:h.tee[1],altitude:h.tz},range:90,tilt:72,heading:hd},durationMillis:2200});await wait(2400);if(my!==busy)return;
  map.flyCameraTo({endCamera:{center:{lat:h.green[0],lng:h.green[1],altitude:h.gz},range:Math.max(140,L*.35),tilt:68,heading:hd},durationMillis:Math.min(7000,2500+L*8)});
  await wait(Math.min(7000,2500+L*8)+200);if(my!==busy)return;
  map.flyCameraAround({camera:{center:{lat:h.green[0],lng:h.green[1],altitude:h.gz},range:150,tilt:65,heading:hd},durationMillis:9000,rounds:1})}

function hide(){busy++;if(map){try{map.stopCameraAnimation()}catch(e){}map.remove()}}

window.RNGC3D={show,hide,can:m=>!!(m&&m.tc&&m.gc),_teeCam:teeCam};
})();
