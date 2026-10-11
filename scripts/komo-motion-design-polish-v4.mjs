import {readFile,writeFile,readdir} from "node:fs/promises";
import {join} from "node:path";

// KŌMØ V4. Enhances public static marketing pages after V3. Pulse data/auth not modified.
const SITE=join(process.cwd(),"site");
const T={
fr:{line:"La précision du mouvement.",ey:"THE ART OF MOTION",cta:"EXPLORER MOTION CASE",tech:"Pensé pour le terrain.",notes:"Le choix définitif des équipements, les licences, leurs dimensions et les services numériques sont précisés dans chaque proposition commerciale. Les illustrations montrent le fonctionnement envisagé du système.",photo:"Photographie d’un prototype précédent KŌMØ Motion.",detail:"DÉCOUVRIR LE SYSTÈME"},
en:{line:"The precision of movement.",ey:"THE ART OF MOTION",cta:"EXPLORE MOTION CASE",tech:"Designed for real places.",notes:"Equipment selection, supplier licences, dimensions and digital services are specified in each commercial proposal. Illustrations show the system's intended operation.",photo:"Photograph of an earlier KŌMØ Motion prototype.",detail:"EXPLORE THE SYSTEM"},
es:{line:"La precisión del movimiento.",ey:"THE ART OF MOTION",cta:"EXPLORAR MOTION CASE",tech:"Diseñado para cada entorno.",notes:"La selección de equipos, licencias, dimensiones y servicios digitales se especifica en cada propuesta comercial. Las ilustraciones muestran el funcionamiento previsto.",photo:"Fotografía de un prototipo anterior de KŌMØ Motion.",detail:"EXPLORAR EL SISTEMA"}
};
const edits=new Map([
 ["CONFIGURATION CIBLE V1 — À VALIDER","MOTION CASE / SYSTEM 01"],
 ["TARGET V1 CONFIGURATION — TO BE VERIFIED","MOTION CASE / SYSTEM 01"],
 ["CONFIGURACIÓN OBJETIVO V1 — POR VALIDAR","MOTION CASE / SYSTEM 01"],
 ["CONFIGURATION V1 À CONFIRMER","MOTION CASE · PORTABLE"],
 ["V1 CONFIGURATION TO CONFIRM","MOTION CASE · PORTABLE"],
 ["CONFIGURACIÓN V1 POR CONFIRMAR","MOTION CASE · PORTÁTIL"],
 ["SCHÉMA DE PRINCIPE · NON CONTRACTUEL","MOTION / SYSTEM ARCHITECTURE"],
 ["CONCEPT DIAGRAM · NON-CONTRACTUAL","MOTION / SYSTEM ARCHITECTURE"],
 ["ESQUEMA CONCEPTUAL · NO CONTRACTUAL","MOTION / SYSTEM ARCHITECTURE"],
 ["Photographie d’un prototype KŌMØ antérieur. Configuration finale VALD non encore photographiée ni contractuellement validée.",T.fr.photo],
 ["Photograph of an earlier KŌMØ prototype. Final VALD configuration has not yet been photographed or contractually validated.",T.en.photo],
 ["Fotografía de un prototipo anterior de KŌMØ. La configuración final VALD aún no se ha fotografiado ni validado contractualmente.",T.es.photo],
 ["Une configuration cible, pas une fiche définitive.",T.fr.tech],
 ["A target configuration, not final specifications.",T.en.tech],
 ["Configuración objetivo, no ficha definitiva.",T.es.tech],
 ["Licences fournisseurs, compatibilités, dimensions, poids et intégration Pulse à confirmer. L’intégration de tous les composants dans une unique valise n’est pas encore démontrée. Aucune toise portable.",T.fr.notes],
 ["Supplier licensing, compatibility, dimensions, weight and Pulse integration remain to be confirmed. Single-case physical packing is not yet demonstrated. No portable stadiometer.",T.en.notes],
 ["Licencias, compatibilidad, dimensiones, peso e integración Pulse pendientes. La integración física en una sola maleta aún no está demostrada. Sin tallímetro portátil.",T.es.notes],
 ["SPECIFICATION STATUS","SYSTEM / SPECIFICATIONS"],
 ["How can I measure human movement, anywhere?","One portable system. Multiple settings."],
 ["2 × VALD ForceDecks Mini (cible V1)","2 × VALD ForceDecks Mini"],
 ["VALD DynaMo Plus (cible V1)","VALD DynaMo Plus"],
 ["HumanTrak movement analysis (cible V1)","HumanTrak movement analysis"],
 ["Les visuels sont schématiques. Le conditionnement en une seule valise, les licences et l’intégration logicielle ne sont pas encore confirmés.","Schémas illustratifs. Les détails techniques et logiciels figurent dans la proposition commerciale."],
 ["All diagrams are conceptual. Single-case packing, supplier licences and software integrations remain unverified.","Illustrative diagrams. Technical and software details are specified in the commercial proposal."],
 ["Todos los esquemas son conceptuales. El embalaje en una única maleta, licencias e integración informática aún no están confirmados.","Esquemas ilustrativos. Los detalles técnicos y digitales se indican en la propuesta comercial."],
 ["Équipement envisagé. Formats, compatibilités et intégrations à confirmer.","La sélection des protocoles et équipements dépend de la prestation."],
 ["Proposed equipment. Dimensions, compatibility and integrations to be confirmed.","Equipment and protocols are selected for each use case."],
 ["Equipo previsto. Dimensiones, compatibilidad e integraciones por confirmar.","Equipos y protocolos seleccionados según el uso."],
 ["L’intégration technique avec le système KŌMØ reste à valider.","Les fonctions connectées dépendent de la configuration retenue."],
 ["Technical integration into the KŌMØ system has yet to be validated.","Connected functionality depends on the agreed configuration."],
 ["La integración técnica con KŌMØ aún debe validarse.","Las funciones conectadas dependen de la configuración contratada."],
 ["Une configuration cible, conçue pour une expérience claire et reproductible.","Une expérience conçue pour être claire et reproductible."],
 ["A target configuration designed for a clear, repeatable experience.","An experience designed to be clear and repeatable."],
 ["Una configuración objetivo pensada para una experiencia clara y repetible.","Una experiencia clara y repetible."],
 ["Une nouvelle manière de mesurer le mouvement.","Le mouvement, dans sa juste mesure."],
 ["A new way to assess movement.","Movement, in its element."],
 ["Una nueva forma de evaluar el movimiento.","El movimiento, en su medida."]
]);
const CSS="\nhtml{scroll-padding-top:100px}\nbody.mf{--paper:#f7f6f0;--ink:#17251b;--line:#d7ddd2;--green:#426a52;--dark:#142a1f;font-feature-settings:\"kern\" 1}\n.mf .container{max-width:1330px}.mf .ey{letter-spacing:.22em;font-weight:750}\n.mf h1,.mf h2,.mf h3{letter-spacing:-.055em}\n.mf .header{background:rgba(248,249,244,.91);border-bottom:1px solid rgba(39,59,45,.14);backdrop-filter:blur(22px) saturate(1.16);-webkit-backdrop-filter:blur(22px) saturate(1.16)}\n.mf .headerin{min-height:82px;max-width:1500px;padding-left:clamp(20px,3vw,48px);padding-right:clamp(20px,3vw,48px)}\n.mf .brand{letter-spacing:.28em;font-weight:800;font-size:23px}.mf .brand small{letter-spacing:.3em}\n.mf .nav{gap:clamp(8px,1.5vw,22px)}.mf .nav a{position:relative;letter-spacing:.08em;font-size:10px;transition:color .25s}\n.mf .nav a:after{content:\"\";position:absolute;bottom:-7px;height:1px;background:currentColor;left:0;right:100%;transition:right .35s cubic-bezier(.22,1,.36,1)}.mf .nav a:hover:after{right:0}\n.mf .btn{border-radius:2px;letter-spacing:.1em;font-weight:750;transition:background .3s,transform .3s,border-color .3s,box-shadow .3s}\n.mf .btn:hover{transform:translateY(-2px);box-shadow:0 9px 22px #0a241912}\n.mf .hero.image{min-height:min(830px,92svh);background:linear-gradient(100deg,rgba(12,29,19,.97) 0%,rgba(12,29,19,.89) 32%,rgba(12,29,19,.32) 74%,rgba(12,29,19,.12)),url('/assets/images/real-case/komo-case-open.jpeg') center 45%/cover no-repeat}\n.mf .hero:after{content:\"\";position:absolute;inset:0;pointer-events:none;background:linear-gradient(0deg,#0c211645 0%,transparent 32%),linear-gradient(90deg,transparent 98%,#e1e9dd30 100%);opacity:.8}\n.mf .hero .container{z-index:2;padding-top:clamp(110px,14svh,175px);padding-bottom:clamp(90px,12svh,150px)}\n.mf .hero h1{font-size:clamp(55px,8.2vw,123px);line-height:.99;max-width:940px;text-wrap:balance;letter-spacing:-.068em}\n.mf .hero .lead{max-width:625px;line-height:1.62;font-size:clamp(16px,1.5vw,21px)}\n.mf .hero .prototype{opacity:.72;letter-spacing:.03em;font-size:10px!important;max-width:400px}\n.mf .vx-hero-discover{right:clamp(25px,5vw,90px);bottom:37px;width:min(335px,31%);border-color:#cfdfcf65;background:rgba(17,44,28,.83);padding:22px 24px}\n.mf .vx-hero-discover:hover{transform:translateY(-5px)}\n.mf .v4-intro{background:#f7f6f0;border-bottom:1px solid #d9e1d6;position:relative;overflow:hidden;padding:48px 0 52px}\n.mf .v4-intro .container{display:grid;grid-template-columns:minmax(180px,.48fr) minmax(0,1.2fr) minmax(175px,.38fr);gap:clamp(25px,4vw,80px);align-items:center}\n.mf .v4-intro-ey{font-size:10px;letter-spacing:.24em;color:#51705a;font-weight:800;max-width:190px}\n.mf .v4-intro h2{font-size:clamp(27px,3.4vw,51px);margin:0;line-height:1.11;letter-spacing:-.05em}\n.mf .v4-intro-link{font-size:10px;letter-spacing:.1em;font-weight:750;text-decoration:none!important;border-bottom:1px solid #426a52;display:flex;justify-content:space-between;padding:13px 0;gap:12px;transition:padding .3s}\n.mf .v4-intro-link:hover{padding-left:7px}\n.mf .block{position:relative}.mf .block.light{background:#f8f9f4}.mf .block h2{max-width:980px}\n.mf .block .panel.white{background:#fcfdfa}\n.mf .panel{border-radius:0;box-shadow:none;border:1px solid #d7e0d5;position:relative;overflow:hidden;transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s,border-color .35s}\n.mf .panel:hover{transform:translateY(-6px);box-shadow:0 25px 50px -39px rgba(26,59,36,.32);border-color:#b3c8b6}\n.mf .panel:after{content:\"\";position:absolute;bottom:0;left:0;width:0;height:2px;background:#678972;transition:width .5s cubic-bezier(.22,1,.36,1)}.mf .panel:hover:after{width:100%}\n.mf .status{font-size:9px;background:none;color:#4b6c51;padding:0;border-radius:0;letter-spacing:.17em}\n.mf .three .panel h3{font-size:clamp(28px,2.8vw,42px);line-height:1.05}\n.mf .step{transition:padding .25s,color .25s}.mf .step:hover{padding-left:8px}\n.mf .place{transition:background .25s,transform .3s,border-color .3s}.mf .place:hover{transform:translateY(-3px);border-color:#adc4b0}\n.mf .photo{border:0;background:#eff1e9;max-height:600px;box-shadow:0 18px 35px #12362211}\n.mf .photo-caption{max-width:450px;font-size:10px;opacity:.68}\n.mf .vx-section{background:#e9eee6;padding:clamp(70px,9vw,135px) 0}\n.mf .vx-heading{grid-template-columns:1.23fr .77fr;gap:80px;margin-bottom:55px}\n.mf .vx-heading h2{font-size:clamp(45px,6.25vw,98px);line-height:.99}\n.mf .vx-showcase{min-height:620px;border:1px solid #bfcebd;box-shadow:0 40px 70px -56px #1633208a}\n.mf .vx-showcase-main{min-height:620px;background:radial-gradient(circle at 53% 34%,#eff4e9 0%,#dce7d9 52%,#cbd8ce 100%)}\n.mf .vx-showcase-main:after{content:\"MOTION\";position:absolute;left:50%;top:24%;transform:translate(-50%,-50%);font:400 clamp(110px,18vw,260px)/1 Georgia,serif;letter-spacing:-.1em;color:#234a2b08;pointer-events:none;white-space:nowrap;z-index:0}\n.mf .vx-showcase-top,.mf .vx-showcase-bottom{letter-spacing:.17em}\n.mf .vx-slide-container{z-index:1}.mf .vx-showcase-side{background:#fbfcf8}\n.mf .vx-tab{border-color:#d9e4d9;transition:color .2s,padding .25s,background .25s}\n.mf .vx-tab.is-current{background:#edf4ed;color:#214c2e;padding-right:12px}\n.mf .vx-primary{background:#193d2a}.mf .vx-primary:hover{background:#2d6141}\n.mf .vx-disclosure{margin-top:25px!important;font-size:10px!important;line-height:1.6!important}\n.mf .vx-pulse{border-radius:0;background:#e5ebe3;box-shadow:0 35px 50px -42px #132b1e40}\n.mf .world-presence{overflow:hidden}.mf .world-map{position:relative}\n.mf .world-city{filter:drop-shadow(0 0 10px #bbefb7)}\n.mf .vx-map-open{transition:background .3s}.mf .vx-map-open:hover{background:#31573a}\n.mf .foot{background:#10241a;padding-top:85px}\n.mf .foot .brand{font-size:clamp(32px,4.2vw,57px);color:#fff;letter-spacing:.2em}.mf .foot .brand small{font-size:9px;letter-spacing:.32em;margin-top:5px}.mf .footlast{border-color:#516e593e}\n.mf form{box-shadow:0 21px 50px #13341b0c;border-color:#dce5da}\n.mf form button[type=submit][hidden]{display:none!important}.mf .vx-continue[hidden]{display:none!important}\n.mf .formgrid>div,.mf .vx-extra>div{min-width:0}\n.mf form input:focus,.mf form select:focus{outline:2px solid #6a9770;outline-offset:1px}\n.mf [id]{scroll-margin-top:110px}\n.v4-scroll-progress{position:fixed;top:0;left:0;right:0;height:2px;background:transparent;pointer-events:none;z-index:99}\n.v4-scroll-progress>i{display:block;height:100%;width:100%;background:#6f9d76;transform:scaleX(0);transform-origin:0 50%;will-change:transform}\n@media(max-width:1050px){.mf .v4-intro .container{grid-template-columns:150px 1fr;gap:20px}.mf .v4-intro-link{grid-column:2;max-width:340px}.mf .vx-heading{gap:35px}}\n@media(max-width:760px){.mf .hero.image{min-height:750px;background-position:59% center}.mf .hero .container{padding-top:95px;padding-bottom:85px}.mf .hero h1{font-size:clamp(51px,12vw,80px)}.mf .v4-intro{padding:35px 0}.mf .v4-intro .container{display:block}.mf .v4-intro-ey{margin-bottom:16px}.mf .v4-intro h2{font-size:clamp(30px,8vw,45px);margin-bottom:18px}.mf .v4-intro-link{max-width:340px}.mf .vx-heading h2{font-size:clamp(43px,11vw,75px)}.mf .vx-hero-discover{position:relative;width:100%;bottom:auto;right:auto;margin:35px 0 0;max-width:360px}.mf .vx-section{padding:75px 0}.mf .vx-showcase-main{min-height:575px}.mf .foot{padding-top:58px}}\n@media(max-width:440px){.mf .headerin{padding-left:16px;padding-right:16px}.mf .hero .lead{font-size:15px}.mf .v4-intro h2{font-size:33px}.mf .vx-showcase-top,.mf .vx-showcase-bottom{font-size:8px}.mf .vx-showcase-main:after{font-size:118px;top:18%}}\n@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.mf .panel,.mf .place,.mf .btn,.mf .v4-intro-link{transition:none!important}.mf .panel:hover,.mf .place:hover,.mf .btn:hover{transform:none!important}.v4-scroll-progress{display:none}}\n";
const RUNTIME="\n(function(){\n if(window.matchMedia(\"(prefers-reduced-motion: reduce)\").matches)return;\n var bar=document.createElement(\"div\");bar.className=\"v4-scroll-progress\";bar.setAttribute(\"aria-hidden\",\"true\");bar.innerHTML=\"<i></i>\";document.body.appendChild(bar);\n var indicator=bar.firstElementChild,busy=false;\n function tick(){var max=document.documentElement.scrollHeight-window.innerHeight;var value=max>0?Math.min(1,Math.max(0,window.scrollY/max)):0;indicator.style.transform=\"scaleX(\"+value+\")\";busy=false;}\n window.addEventListener(\"scroll\",function(){if(!busy){busy=true;window.requestAnimationFrame(tick)}},{passive:true});\n window.addEventListener(\"resize\",tick,{passive:true});tick();\n})();\n";
function clean(html){let n=0;for(const [from,to] of edits){if(html.includes(from)){const z=html.split(from);n+=z.length-1;html=z.join(to)}}return {html,n};}
function strip(l){let c=T[l];return '<section class="v4-intro" aria-label="'+c.ey+'"><div class="container"><span class="v4-intro-ey">'+c.ey+'<br>KŌMØ / 01</span><h2>'+c.line+'</h2><a class="v4-intro-link" href="#motion-case-explorer">'+c.cta+' <span aria-hidden="true">↗</span></a></div></section>';}
function polish(html,l,type){
 const out=clean(html);html=out.html;
 if(type==="home"){
  let pos=html.indexOf('<section class="hero image">');if(pos<0)throw Error("Home hero missing "+l);
  let end=html.indexOf("</section>",pos);if(end<0)throw Error("Home hero close missing "+l);
  html=html.slice(0,end+10)+strip(l)+html.slice(end+10);
  if(!html.includes('id="our-presence"')||!html.includes('id="motion-case-explorer"'))throw Error("Home components missing "+l);
 }
 if(type==="case"&&!html.includes('id="motion-case-explorer"'))throw Error("Case explorer missing "+l);
 if(html.includes('id="komo-v4-polish"'))throw Error("Duplicate V4");
 html=html.replace("</head>",'<style id="komo-v4-polish">'+CSS+'</style></head>');
 html=html.replace("</body>",'<script id="komo-v4-runtime">'+RUNTIME+'</script></body>');
 return {html,n:out.n};
}
let pages=0,changes=0;
async function update(path,l,type){let s=await readFile(path,"utf8").catch(()=>null);if(!s||!s.includes('<body class="mf">'))return;
const p=polish(s,l,type);await writeFile(path,p.html,"utf8");pages++;changes+=p.n;}
for(const l of ["fr","en","es"]){
 const dir=join(SITE,l),entries=await readdir(dir,{withFileTypes:true});
 await update(join(dir,"index.html"),l,"home");
 for(const e of entries)if(e.isDirectory())await update(join(dir,e.name,"index.html"),l,e.name==="motion-case"?"case":"page");
}
await update(join(SITE,"index.html"),"fr","home");
const root=await readFile(join(SITE,"index.html"),"utf8");
const french=await readFile(join(SITE,"fr","index.html"),"utf8");
if(root!==french)throw Error("French alias mismatch");
for(const bad of ["CONFIGURATION CIBLE V1 — À VALIDER","CONFIGURATION V1 À CONFIRMER","V1 CONFIGURATION TO CONFIRM"])
if(root.includes(bad))throw Error("Obsolete badge "+bad);
for(const needed of ['id="komo-v4-polish"','class="v4-intro"','id="motion-case-explorer"','id="our-presence"'])
if(!root.includes(needed))throw Error("Missing V4 essential "+needed);
for(const l of ["fr","en","es"]){
 const hp=await readFile(join(SITE,l,"index.html"),"utf8");
 if(!hp.includes('v4-intro'))throw Error("Not localized "+l);
 const cp=await readFile(join(SITE,l,"motion-case","index.html"),"utf8");
 if(!cp.includes("SYSTEM / SPECIFICATIONS"))throw Error("Case details missing "+l);
}
console.log("[komo-motion-v4] PASS · "+pages+" localized marketing pages; "+changes+" copy refinements; hero / editorial strip / product / map / forms; Pulse isolated.");
