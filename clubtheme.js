/* Club themes (David, Nov 26 2026): "re-theme the entire app with the branding, color and feel of the other club.
   The main purpose of building this platform was to expand to other themes, clubs."
   One entry per club below. A club's entry sets the whole look: colors, logo, name, header, opening screen,
   the faint mark behind the pages, the phone's top bar color, and which tabs it hides. Raider Nation is the
   default (no entry needed: the app's own colors). Adding a club = add an entry and its logo file.
   Who sees a theme: a guest who picks that club on the event QR (guestpass.js), or anyone opening the link
   with ?club=<key> (kept on that phone until ?club=rngc). Loaded in the app and the golf scorecard. */
(function(){
var CLUBS={
  legends:{
    key:'legends', name:'Legends Golf Club', line1:'Legends', line2:'Golf Club', short:'Legends',
    logo:'assets/clubs/legends-gc.png',
    /* black and gold from their logo: warm blacks, gold accent, cream text */
    vars:{bg:'#0b0906','bg-2':'#120e08',panel:'#19140c','panel-2':'#221b10',line:'#3b2f1b',text:'#f7f0df',
      muted:'#b9ab8a',silver:'#f0c24f','silver-2':'#cfa64c','on-silver':'#170f02','silver-rgb':'240,194,79'},
    /* Bright mode on the course: cream paper, dark brown ink, gold buttons with dark letters */
    sun:{bg:'#f6f1e4',panel:'#fffdf7','panel-2':'#efe6cf',line:'#d9cba6',text:'#1b1408',muted:'#5b4e33',
      silver:'#2a1e08','silver-2':'#6b5520','on-silver':'#fff8e6','silver-rgb':'176,128,26'},
    page:'#070503', bar:'#0b0906',
    hide:['games']   /* no Raiders football */
  }
};
var KEY='rngc-theme',cur=null;
var root=/\/scorecard\//.test(location.pathname)?'../':'';
function pick(){
  var q=null;try{q=new URLSearchParams(location.search).get('club')}catch(e){}
  if(q){q=q.toLowerCase();try{CLUBS[q]?localStorage.setItem(KEY,q):localStorage.removeItem(KEY)}catch(e){}return CLUBS[q]||null}
  var k=null;try{k=localStorage.getItem(KEY)}catch(e){}
  return k&&CLUBS[k]||null;
}
function vs(o){var v='',k;for(k in o)v+='--'+k+':'+o[k]+';';return v}
function css(t){
  var v=vs(t.vars);
  var sel='html[data-club="'+t.key+'"]',logo=root+t.logo;
  return sel+'{'+v+'}'+
    sel+','+sel+' body:not(.sun){background:'+t.page+'}'+
    (t.sun?sel+' body.sun{'+vs(t.sun)+'background:var(--bg)}'+sel+':has(body.sun){background:'+t.sun.bg+'}':'')+
    sel+' .app{background:var(--bg)}'+
    /* gold metal on the main buttons */
    sel+' .btn:not(.ghost):not(.small.ghost){background:linear-gradient(180deg,#f7d97c,#e2ae3c 55%,#c8912a);color:#1b1408}'+
    /* the scorecard's small header mark */
    sel+' .bar img.logo{content:url("'+logo+'");width:64px;height:39px;object-fit:contain}'+
    /* the faint mark behind the pages: their logo, in color */
    sel+' .views::before{background-image:url("'+logo+'");filter:none;background-size:min(70%,480px) auto}'+
    sel+' .intro{background:radial-gradient(circle at 50% 42%,#1d160a,#050302 70%)}'+
    sel+' .intro .skip{color:#cdbb8e;border-color:#3b2f1b}'+
    sel+' .intro img.clublogo{width:min(80vw,520px);animation:clubIn 1.6s cubic-bezier(.16,1,.3,1) both}'+
    '@keyframes clubIn{from{opacity:0;transform:scale(.86);filter:brightness(2.2) blur(6px)}60%{filter:brightness(1.3) blur(0)}to{opacity:1;transform:none;filter:none}}'+
    sel+' .top .logo{object-fit:contain}'+'@media (max-width:999px){'+sel+' .top .logo{width:150px}}'+sel+' .brandtxt{visibility:hidden}'+   /* their logo carries the name */
    sel+' .gpmine>i,'+sel+' .nx-golf{--nxc:var(--silver);color:var(--silver)}'+
    sel+' #chapterChips,'+sel+' .topjoin,'+sel+' .subnav[data-for="home"]{display:none!important}'+   /* no Raider Nation chapters or join */
    (t.hide||[]).map(function(x){return sel+' .tab[data-tab="'+x+'"],'+sel+' .subnav[data-for="'+x+'"]{display:none!important}'}).join('');
}
function meta(n,val){var m=document.querySelector('meta[name="'+n+'"]');if(m)m.setAttribute('content',val)}
function dom(){
  var t=cur;if(!t)return;
  var lg=document.getElementById('hdrLogo');
  if(lg){lg.src=root+t.logo;lg.alt=t.name+' logo'}
  var b=document.querySelector('.brandtxt b');if(b)b.innerHTML=t.line1+'<em>'+t.line2+'</em>';
  var it=document.getElementById('intro');if(it)it.setAttribute('aria-label',t.name);
  document.title=root?t.short+' Golf':t.name;
}
function apply(t){
  cur=t;var h=document.documentElement,s=document.getElementById('clubThemeCss');
  if(!t){h.removeAttribute('data-club');if(s)s.remove();return}
  h.setAttribute('data-club',t.key);
  if(!s){s=document.createElement('style');s.id='clubThemeCss';(document.head||h).appendChild(s)}
  s.textContent=css(t);meta('theme-color',t.bar);meta('apple-mobile-web-app-title',t.short);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',dom,{once:true});else dom();
}
window.RNGCTHEME={
  clubs:CLUBS,
  key:function(){return cur?cur.key:'rngc'},
  cur:function(){return cur},
  logo:function(){return cur?root+cur.logo:null},
  /* set('legends') or set(null) for Raider Nation; reloads only when going back to Raider Nation */
  set:function(k){var t=k&&CLUBS[k]||null;if((t&&t.key)===(cur&&cur.key))return;
    try{t?localStorage.setItem(KEY,t.key):localStorage.removeItem(KEY)}catch(e){}
    if(!t&&cur){location.reload();return}
    apply(t);var f=document.getElementById('golfFrame');if(f&&f.contentWindow&&f.contentWindow.RNGCTHEME)try{f.contentWindow.RNGCTHEME.set(k)}catch(e){}}
};
apply(pick());
})();
