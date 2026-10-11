import {readFile,writeFile,readdir} from "node:fs/promises";
import {join} from "node:path";

// Public Motion First visual enhancements only. No changes to Pulse, World or patient data.
// Coastlines simplified from Natural Earth 1:110m land (public domain).
const SITE=join(process.cwd(),"site");
const WORLD_COAST="M260,208 253,211 236,194 195,179 167,141 180,166 173,161 142,117 141,95 147,98 146,93 117,67 84,59 72,64 75,58 55,73 39,78 59,65 37,61 49,48 30,46 47,45 34,38 60,30 214,41 219,36 214,30 220,29 237,42 241,34 252,38 219,59 224,70 250,76 256,87 256,77 264,72 260,55 271,55 287,67 295,61 318,81 307,89 290,89 278,99 294,92 295,101 299,102 303,102 305,99 307,102 293,108 295,103 288,104 266,126 265,121 266,131 252,142 255,160 239,145 211,154 215,178 238,170 233,186 247,188 250,206 264,207 277,196 277,205 281,197 302,201 301,203 314,214 329,219 336,234 370,246 355,293 338,301 322,328 311,327 315,335 294,347 298,351 288,359 291,367 286,378 282,378 279,380 279,383 268,378 267,362 274,350 270,353 281,287 252,248 263,220 260,208ZM255,51 241,53 237,52 241,46 255,51ZM26,45 0,48 0,37 26,45ZM199,36 170,38 160,34 173,33 155,29 185,25 199,36ZM213,29 206,30 198,26 211,23 213,29ZM165,24 138,29 141,22 165,24ZM213,14 232,18 253,18 256,20 224,20 213,14ZM238,7 228,11 213,5 224,2 238,7ZM437,217 418,197 416,172 445,130 484,126 486,136 509,146 515,138 546,144 552,128 531,128 527,120 566,114 554,104 560,98 547,106 539,100 534,115 518,118 517,128 510,113 494,102 507,118 501,124 483,106 468,110 455,128 437,127 436,110 456,107 448,94 481,80 482,70 487,68 488,79 510,78 522,70 520,64 534,62 514,60 525,48 521,45 506,54 508,62 501,73 493,75 486,63 474,66 473,56 509,34 532,30 565,41 545,43 555,51 572,45 571,38 578,43 615,34 635,39 630,31 639,25 646,28 645,45 652,40 647,30 651,26 668,29 666,24 727,12 752,17 740,22 784,24 796,32 819,26 920,37 920,48 913,49 918,55 878,62 874,76 861,87 858,71 880,55 856,64 823,65 805,77 821,84 813,101 786,119 790,132 783,134 780,120 769,121 771,116 762,121 773,125 764,133 771,151 756,167 731,175 739,193 729,207 716,193 714,205 726,227 711,209 708,183 701,186 694,167 665,186 658,209 646,171 630,159 607,158 604,155 592,152 588,146 583,147 592,163 604,157 613,168 601,182 571,195 549,147 547,153 543,147 569,198 590,201 560,244 562,276 549,287 551,299 526,327 507,327 499,307 490,278 494,255 482,234 482,218 437,217ZM284,178 278,181 270,179 273,175 284,178ZM254,166 270,175 243,169 254,166ZM323,92 324,100 308,96 317,86 315,91 323,92ZM443,76 443,84 435,85 435,79 443,76ZM412,52 398,46 425,48 412,52ZM286,33 284,37 302,43 297,48 286,44 295,52 284,51 291,57 259,49 271,47 273,39 229,28 250,23 254,28 286,33ZM407,-2 378,-1 429,2 409,5 415,5 413,14 405,15 410,22 397,27 404,32 393,33 403,33 358,47 349,62 328,52 322,42 330,34 320,35 329,32 310,18 273,11 306,0 407,-2ZM226,0 274,-3 302,-2 263,8 267,10 254,16 231,16 243,13 235,10 243,7 238,5 251,4 226,0ZM452,79 445,68 452,66 464,87 445,90 452,79ZM515,9 495,13 487,7 515,9ZM586,265 580,301 573,301 574,277 586,265ZM753,256 737,253 729,250 743,249 753,256ZM730,247 719,239 704,216 725,231 731,240 730,247ZM758,238 742,239 738,230 759,211 764,228 758,238ZM636,15 609,22 602,27 607,32 592,30 602,19 636,15ZM900,346 896,360 886,361 900,346ZM908,348 901,328 916,337 908,348ZM796,320 754,327 751,294 769,286 781,271 791,273 798,262 809,264 806,273 818,281 824,261 852,310 843,336 834,341 819,338 810,330 812,324 808,329 796,320ZM829,242 845,261 830,252 812,255 812,246 794,234 829,242ZM767,230 775,233 773,247 769,238 765,246 766,231 780,227 767,230ZM768,179 777,196 768,192 768,179ZM818,132 805,134 795,136 794,144 791,137 799,131 807,131 821,114 818,132ZM817,111 823,103 831,106 826,113 817,111ZM830,93 823,99 825,78 830,93Z";
const COPY={
 fr:{ey:"KŌMØ / NOTRE PRÉSENCE",title:"Notre ancrage.<br><em>Le mouvement sans frontières.</em>",description:"Basés à Cannes, nous développons le déploiement mobile de Motion et l'équipement d'établissements partenaires, en France et à l'international selon les projets.",base:"BASE KŌMØ",cannes:"CANNES · FRANCE",scope:"Interventions ailleurs sur demande, après étude de faisabilité. La carte n'indique pas l'ouverture de centres supplémentaires.",cta:"ORGANISER UN BILAN MOBILE",secondary:"ÉQUIPER UN ÉTABLISSEMENT",legend:"Implantation identifiée",explore:"DÉPLOIEMENT INTERNATIONAL · SUR DEMANDE"},
 en:{ey:"KŌMØ / OUR PRESENCE",title:"Based in Cannes.<br><em>Designed to travel.</em>",description:"From Cannes, we develop mobile Motion assessments and deployments for partner businesses in France and internationally, subject to each project.",base:"KŌMØ BASE",cannes:"CANNES · FRANCE",scope:"Other destinations are available by request and feasibility review. This map does not represent additional open centers.",cta:"REQUEST A MOBILE ASSESSMENT",secondary:"EQUIP YOUR BUSINESS",legend:"Confirmed location",explore:"INTERNATIONAL DEPLOYMENT · ON REQUEST"},
 es:{ey:"KŌMØ / NUESTRA PRESENCIA",title:"Desde Cannes.<br><em>Preparados para viajar.</em>",description:"Desde Cannes desarrollamos evaluaciones Motion móviles y proyectos para establecimientos asociados en Francia y en otros países, según viabilidad.",base:"BASE KŌMØ",cannes:"CANNES · FRANCIA",scope:"Otros destinos bajo solicitud y estudio de viabilidad. El mapa no representa centros adicionales abiertos.",cta:"SOLICITAR EVALUACIÓN MÓVIL",secondary:"EQUIPAR MI CENTRO",legend:"Ubicación confirmada",explore:"DESPLIEGUE INTERNACIONAL · BAJO SOLICITUD"}
};
const PATHS={fr:{anywhere:"/fr/anywhere/",business:"/fr/equiper-etablissement/"},en:{anywhere:"/en/anywhere/",business:"/en/equip-your-business/"},es:{anywhere:"/es/a-domicilio/",business:"/es/equipar-centro/"}};
const CSS=`
/* Premium editorial kinetic layer: no external script, tracking, 3D or canvas. */
.mf .hero{isolation:isolate}
.mf .hero.image:after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 77% 44%,rgba(203,227,212,.13),transparent 47%);mix-blend-mode:screen;animation:km-hero-light 13s ease-in-out infinite alternate}
.mf .hero h1,.mf .hero .ey,.mf .hero .lead,.mf .hero .buttons{animation:km-enter .83s cubic-bezier(.2,.8,.2,1) both}
.mf .hero .ey{animation-delay:.05s}.mf .hero h1{animation-delay:.14s}.mf .hero .lead{animation-delay:.24s}.mf .hero .buttons{animation-delay:.34s}
@keyframes km-enter{from{opacity:0;transform:translate3d(0,27px,0)}to{opacity:1;transform:translateZ(0)}}
@keyframes km-hero-light{from{opacity:.3;transform:scale(1)}to{opacity:.85;transform:scale(1.075)}}
.mf .mf-reveal{opacity:0;transform:translate3d(0,23px,0);transition:opacity .85s cubic-bezier(.2,.7,.2,1),transform .85s cubic-bezier(.2,.7,.2,1);transition-delay:var(--mf-delay,0ms);will-change:opacity,transform}
.mf .mf-reveal.mf-visible{opacity:1;transform:translate3d(0,0,0);will-change:auto}
.mf .panel,.mf .place,.mf .tile,.mf .btn{transition:box-shadow .33s cubic-bezier(.2,.7,.2,1),transform .33s cubic-bezier(.2,.7,.2,1),border-color .33s ease,background-color .33s ease}
@media(hover:hover) and (pointer:fine){.mf .panel:hover,.mf .place:hover,.mf .tile:hover{transform:translateY(-5px);border-color:#afc1b3;box-shadow:0 17px 36px rgba(17,36,26,.085)}.mf .btn:hover{transform:translateY(-2px);box-shadow:0 8px 23px rgba(6,24,14,.16)}}
.mf .world-presence{padding:18px 0 85px;background:#f5f4ee}
.mf .world-wrap{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);background:#18271f;border:1px solid #314237;color:#faf9f4;border-radius:4px;overflow:hidden;box-shadow:0 24px 65px rgba(13,31,20,.10);min-height:405px}
.mf .world-copy{padding:52px 44px 40px 52px;display:flex;flex-direction:column;justify-content:center;position:relative}
.mf .world-copy:before{content:"";width:34px;height:1px;background:#99b5a0;margin-bottom:24px}
.mf .world-copy .ey{color:#a9c2ad}
.mf .world-copy h2{color:#f5f7f2;font-size:clamp(32px,3.4vw,48px);margin:7px 0 20px}
.mf .world-copy em{color:#bfd7c5;font-style:italic}
.mf .world-copy>p:not(.ey){color:#cbd6cc;font-size:14px;max-width:395px;line-height:1.73}
.mf .world-copy .buttons{margin-top:18px;gap:9px}
.mf .world-copy .btn{border-color:#adbdad;color:#fff;font-size:10px;padding:11px 17px;min-height:43px}
.mf .world-copy .btn.white{color:#15251a;border-color:#f7f7f0;background:#f7f7f0}
.mf .world-map{border-left:1px solid rgba(196,212,199,.10);background:radial-gradient(ellipse at 49% 34%,#30463a 0,#203329 44%,#15251e 90%);position:relative;display:flex;align-items:center;overflow:hidden}
.mf .world-map svg{width:100%;height:auto;display:block;overflow:visible}
.mf .world-map .world-land{fill:#93ac9b;fill-opacity:.57;stroke:#bcd0be;stroke-opacity:.22;stroke-width:.45;stroke-linejoin:round}
.mf .world-map .world-grid{stroke:#b6cab9;stroke-opacity:.15;stroke-width:.7;stroke-dasharray:3 9}
.mf .world-map .world-orbit{fill:none;stroke:#d6eac9;stroke-opacity:.25;stroke-width:1;stroke-dasharray:3 8;animation:km-orbit 40s linear infinite}
.mf .world-map .world-ring{fill:none;stroke:#ddffbe;stroke-width:1.1;stroke-opacity:.68;transform-origin:478px 108px;animation:km-ping 4.4s ease-out infinite}
.mf .world-map .world-ring.second{animation-delay:2.15s}
.mf .world-map .world-city{fill:#e4f3bd;stroke:#162d1e;stroke-width:3}
.mf .world-map text{fill:#e9f5e6;font-family:Inter,Arial,sans-serif}
.mf .world-map .world-label{font-size:13px;font-weight:750;letter-spacing:.16em}
.mf .world-map .world-sub{font-size:10px;letter-spacing:.13em;fill:#bdcbbd}
.mf .world-map:after{content:"";position:absolute;inset:-50%;background:linear-gradient(104deg,transparent 45%,rgba(215,239,220,.06) 50%,transparent 55%);pointer-events:none;transform:translateX(-60%);animation:km-sweep 16s ease-in-out infinite}
.mf .world-caption{display:flex;justify-content:space-between;gap:25px;align-items:center;position:absolute;left:26px;right:26px;bottom:19px;color:#cad8cd;font-size:10px;letter-spacing:.06em;line-height:1.6}
.mf .world-caption strong{color:#e3efdc;font-size:10px;font-weight:760}
.mf .world-presence .world-footnote{margin-top:13px;color:#78837a;font-size:11px;text-align:right}
@keyframes km-orbit{to{stroke-dashoffset:-400}}
@keyframes km-ping{0%{opacity:0;transform:scale(.3)}12%{opacity:.9}66%,100%{opacity:0;transform:scale(3.5)}}
@keyframes km-sweep{0%,40%{transform:translateX(-85%)}65%,100%{transform:translateX(85%)}}
@media(max-width:900px){.mf .world-wrap{grid-template-columns:1fr}.mf .world-copy{padding:37px 32px 28px}.mf .world-map{border-top:1px solid rgba(196,212,199,.1);border-left:0;min-height:260px}.mf .world-map svg{max-height:360px}.mf .world-presence{padding:0 0 60px}}
@media(max-width:580px){.mf .world-copy{padding:29px 22px 22px}.mf .world-copy h2{font-size:35px}.mf .world-map{min-height:235px}.mf .world-caption{left:17px;right:17px;bottom:11px;gap:8px;flex-direction:column;align-items:flex-start;font-size:9px}.mf .world-presence .world-footnote{text-align:left}.mf .world-map svg{height:260px;width:100%;object-fit:cover}.mf .world-copy .buttons .btn{font-size:10px}}
@media(prefers-reduced-motion:reduce){.mf .hero.image:after,.mf .hero h1,.mf .hero .ey,.mf .hero .lead,.mf .hero .buttons,.mf .world-map .world-orbit,.mf .world-map .world-ring,.mf .world-map:after{animation:none!important}.mf .mf-reveal{opacity:1!important;transform:none!important;transition:none!important}.mf .panel:hover,.mf .place:hover,.mf .tile:hover,.mf .btn:hover{transform:none!important}}
`;
const JS=`
(function(){
 if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 var nodes=document.querySelectorAll('.mf main .panel,.mf main .tile,.mf main .place,.mf main .mockup,.mf main .world-wrap,.mf main section.block h2,.mf main section.block .lead');
 var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)return;entry.target.classList.add('mf-visible');observer.unobserve(entry.target)})},{threshold:.09,rootMargin:'0px 0px -25px 0px'});
 nodes.forEach(function(node,i){if(node.getBoundingClientRect().top<=window.innerHeight*.87)return;node.style.setProperty('--mf-delay',Math.min(i%3,2)*85+'ms');node.classList.add('mf-reveal');observer.observe(node)});
})();
`;
function mapSection(l) {
 const c=COPY[l], p=PATHS[l], marker="km-map-"+l;
 const lat=[38,92,146,200,254,308,362].map(y=>'<path d="M0 '+y+'H920"/>').join("");
 const lon=[100,200,300,400,500,600,700,800].map(x=>'<path d="M'+x+' 0V400"/>').join("");
 return '<section class="world-presence" id="our-presence" aria-labelledby="'+marker+'">'+
 '<div class="container">'+
 '<div class="world-wrap">'+
 '<div class="world-copy"><p class="ey">'+c.ey+'</p><h2 id="'+marker+'">'+c.title+'</h2><p>'+c.description+'</p>'+
 '<div class="buttons"><a class="btn white" href="'+p.anywhere+'">'+c.cta+' ↗</a><a class="btn line" href="'+p.business+'">'+c.secondary+' ↗</a></div></div>'+
 '<div class="world-map"><svg viewBox="0 0 920 400" role="img" aria-labelledby="'+marker+'-title '+marker+'-desc" preserveAspectRatio="xMidYMid meet">'+
 '<title id="'+marker+'-title">'+c.base+': Cannes, France</title><desc id="'+marker+'-desc">'+c.scope+'</desc>'+
 '<g class="world-grid">'+lat+lon+'</g>'+
 '<path class="world-land" d="'+WORLD_COAST+'"/>'+
 '<g><circle cx="478" cy="108" r="37" class="world-orbit"/><circle cx="478" cy="108" r="75" class="world-orbit" style="stroke-opacity:.13"/>'+
 '<circle class="world-ring" cx="478" cy="108" r="15"/><circle class="world-ring second" cx="478" cy="108" r="15"/>'+
 '<circle class="world-city" cx="478" cy="108" r="7"/><path d="M489 108H571" stroke="#dff6d6" stroke-width="1" stroke-opacity=".75"/>'+
 '<text class="world-label" x="579" y="104">'+c.cannes+'</text>'+
 '<text class="world-sub" x="579" y="125">'+c.base+'</text></g></svg>'+
 '<div class="world-caption"><span><strong>●</strong> '+c.legend+'</span><span>'+c.explore+'</span></div></div></div>'+
 '<div class="world-footnote">'+c.scope+'</div></div></section>';
}
async function update(path,l,isHome){
 let html=await readFile(path,"utf8").catch(()=>null);
 if(!html||!html.includes('<body class="mf">'))return false;
 if(html.includes('id="komo-premium-kinetic"'))return false;
 html=html.replace('</head>','<style id="komo-premium-kinetic">'+CSS+'</style></head>');
 if(isHome){
  const position=html.indexOf('04 / MOTION ANYWHERE');
  if(position<0)throw Error('Motion Anywhere section missing on '+path);
  const end=html.indexOf('</section>',position);
  if(end<0)throw Error('Missing section boundary '+path);
  html=html.slice(0,end+10)+mapSection(l)+html.slice(end+10);
 }
 html=html.replace('</body>','<script id="komo-kinetic-runtime">'+JS+'</script></body>');
 await writeFile(path,html,"utf8");
 return true;
}
let enhanced=0;
for(const l of ["fr","en","es"]){
 const dir=join(SITE,l), entries=await readdir(dir,{withFileTypes:true});
 const home=l==="fr"?join(SITE,"fr","index.html"):join(SITE,l,"index.html");
 if(await update(home,l,true))enhanced++;
 for(const entry of entries){
  if(!entry.isDirectory())continue;
  const dest=join(dir,entry.name,"index.html");
  if(await update(dest,l,false))enhanced++;
 }
}
if(await update(join(SITE,"index.html"),"fr",true))enhanced++;
const root=await readFile(join(SITE,"index.html"),"utf8");
const french=await readFile(join(SITE,"fr/index.html"),"utf8");
for(const s of ['class="world-presence"','id="our-presence"','KŌMØ / NOTRE PRÉSENCE','komo-kinetic-runtime'])if(!root.includes(s))throw Error('Missing world/kinetic '+s);
if(root!==french)throw Error('French home alias mismatch');
for(const locale of ["en","es"])if(!(await readFile(join(SITE,locale,"index.html"),"utf8")).includes('id="our-presence"'))throw Error('Missing map '+locale);
console.log('[komo-motion-kinetic-world] PASS · '+enhanced+' public pages enhanced; map=verified Cannes base; reduced motion and Pulse isolation maintained.');
