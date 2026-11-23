// Analyse de posture sur photo de profil (23/11/2026).
// Détecte les points du corps (MediaPipe Pose, modèle « heavy », exécuté hors ligne dans Chrome sans interface),
// puis calcule les angles de l'alignement de profil. La photo n'est jamais envoyée ailleurs ni enregistrée dans PULSE :
// seules les mesures le sont, après relecture du praticien.
//
//   node scripts/posture/pulse-posture.mjs <photo> [--out <dossier>] [--mp <dossier @mediapipe/pose>]
//
// Sorties : <dossier>/posture.json (points, angles, contrôles de qualité) et <dossier>/posture-annotee.png
// (points et lignes tracés sur la photo, pour vérifier la détection à l'œil avant tout enregistrement).
// Angles en degrés par rapport à la verticale de l'image ; positif = vers l'avant (sens du regard).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const args=process.argv.slice(2);
const opt=(name,def)=>{const i=args.indexOf(name);return i>=0?args[i+1]:def};
const photo=args.find(a=>!a.startsWith('--')&&args[args.indexOf(a)-1]!=='--out'&&args[args.indexOf(a)-1]!=='--mp');
if(!photo||!fs.existsSync(photo)){console.error('Usage : node scripts/posture/pulse-posture.mjs <photo> [--out dossier]');process.exit(2)}
const OUT=opt('--out','/tmp/posture');fs.mkdirSync(OUT,{recursive:true});
const MP=opt('--mp','/home/claude/tools/mediapipe-pose');
const TOOLS=process.env.PULSE_TOOLS||'/home/claude/tools';
const require=createRequire(path.join(TOOLS,'package.json'));
const puppeteer=require('puppeteer-core');

const ext=path.extname(photo).toLowerCase();
const mime=ext==='.png'?'image/png':ext==='.webp'?'image/webp':ext==='.heic'?'image/heic':'image/jpeg';
const dataUrl='data:'+mime+';base64,'+fs.readFileSync(photo).toString('base64');

const PAGE=`<!doctype html><meta charset="utf-8"><body><canvas id="c"></canvas>
<script src="/mp/pose.js"></script><script>
window.detect=async(src)=>{
 const img=new Image();img.src=src;await img.decode();
 const pose=new Pose({locateFile:f=>'/mp/'+f});
 pose.setOptions({modelComplexity:2,smoothLandmarks:false,enableSegmentation:false,minDetectionConfidence:0.5,minTrackingConfidence:0.5});
 const r=await new Promise((res,rej)=>{pose.onResults(res);pose.send({image:img}).catch(rej)});
 window.__img=img;
 return {w:img.naturalWidth,h:img.naturalHeight,lm:r.poseLandmarks||null};
};
window.draw=(pts,facing)=>{
 const img=window.__img,c=document.getElementById('c'),x=c.getContext('2d');c.width=img.naturalWidth;c.height=img.naturalHeight;
 x.drawImage(img,0,0);const s=Math.max(2,Math.round(img.naturalWidth/300));
 x.strokeStyle='rgba(255,255,255,.9)';x.setLineDash([s*4,s*3]);x.lineWidth=s;
 x.beginPath();x.moveTo(pts.ankle[0],0);x.lineTo(pts.ankle[0],img.naturalHeight);x.stroke();x.setLineDash([]);
 x.strokeStyle='#1f8a5b';x.lineWidth=s*1.5;x.beginPath();
 ['ear','shoulder','hip','knee','ankle'].forEach((k,i)=>{const p=pts[k];i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1])});x.stroke();
 for(const [k,p] of Object.entries(pts)){x.fillStyle=k==='nose'?'#f0b429':'#d64545';x.beginPath();x.arc(p[0],p[1],s*3,0,7);x.fill();
  x.fillStyle='#fff';x.font=(s*9)+'px sans-serif';x.fillText(k,p[0]+s*5,p[1]-s*3);}
 x.fillStyle='#fff';x.font=(s*10)+'px sans-serif';x.fillText('regard : '+(facing>0?'vers la droite':'vers la gauche'),s*6,s*14);
 return c.toDataURL('image/png');
};
</script>`;

const server=http.createServer((req,res)=>{
 const u=decodeURIComponent(new URL(req.url,'http://x').pathname);
 if(u==='/'){res.writeHead(200,{'content-type':'text/html'});return res.end(PAGE)}
 if(u.startsWith('/mp/')){const f=path.join(MP,path.basename(u));if(fs.existsSync(f)){
  const t=f.endsWith('.js')?'text/javascript':f.endsWith('.wasm')?'application/wasm':'application/octet-stream';
  res.writeHead(200,{'content-type':t});return res.end(fs.readFileSync(f))}}
 res.writeHead(404);res.end();
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,
 args:['--no-sandbox','--no-proxy-server','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
let result;
try{
 const page=await browser.newPage();
 page.on('pageerror',e=>console.error('page:',e.message));
 await page.goto(base+'/',{waitUntil:'load'});
 const det=await page.evaluate(src=>window.detect(src),dataUrl);
 if(!det.lm){result={ok:false,error:'aucune personne détectée'};}
 else{
  const W=det.w,H=det.h,P=i=>[det.lm[i].x*W,det.lm[i].y*H,det.lm[i].visibility??0];
  // Côté vu par l'appareil : celui dont les points sont les plus visibles.
  const L={ear:7,shoulder:11,hip:23,knee:25,ankle:27,heel:29,toe:31},R={ear:8,shoulder:12,hip:24,knee:26,ankle:28,heel:30,toe:32};
  // Côté tourné vers l'appareil : le plus proche (profondeur z la plus petite), à visibilité égale.
  const depth=m=>['ear','shoulder','hip','knee','ankle'].reduce((a,k)=>a+(det.lm[m[k]].z??0),0);
  const side=depth(R)<=depth(L)?'right':'left',M=side==='right'?R:L;
  const pts=Object.fromEntries(Object.entries(M).map(([k,i])=>[k,P(i)]));pts.nose=P(0);
  // Sens du regard : le nez et les orteils sont devant l'oreille et le talon.
  const facing=Math.sign((pts.nose[0]-pts.ear[0])+(pts.toe[0]-pts.heel[0]))||1;
  const deg=r=>r*180/Math.PI;
  // Angle du segment a→b par rapport à la verticale ascendante, positif si b est devant a.
  const lean=(a,b)=>deg(Math.atan2((b[0]-a[0])*facing,a[1]-b[1]));
  const angleAt=(a,b,c)=>{const v1=[a[0]-b[0],a[1]-b[1]],v2=[c[0]-b[0],c[1]-b[1]];
   return deg(Math.acos((v1[0]*v2[0]+v1[1]*v2[1])/(Math.hypot(...v1)*Math.hypot(...v2))));};
  // Genou : flexion = 180 − angle hanche-genou-cheville ; négatif si le genou passe derrière la ligne hanche-cheville.
  const kneeSide=(()=>{const [h,k,a]=[pts.hip,pts.knee,pts.ankle];const t=(k[1]-h[1])/(a[1]-h[1]||1);
   const xLine=h[0]+(a[0]-h[0])*t;return Math.sign((k[0]-xLine)*facing)||1})();
  const knee=(180-angleAt(pts.hip,pts.knee,pts.ankle))*kneeSide;
  const r1=x=>Math.round(x*10)/10;
  const measures={pp_head_forward_deg:r1(lean(pts.shoulder,pts.ear)),pp_trunk_lean_deg:r1(lean(pts.hip,pts.shoulder)),
   pp_hip_shift_deg:r1(lean(pts.ankle,pts.hip)),pp_knee_flex_deg:r1(knee),pp_global_lean_deg:r1(lean(pts.ankle,pts.ear)),pp_side:side};
  const keyVis=['ear','shoulder','hip','knee','ankle'].map(k=>[k,Math.round(pts[k][2]*100)/100]);
  const bodyH=Math.max(...Object.values(pts).map(p=>p[1]))-Math.min(...Object.values(pts).map(p=>p[1]));
  const checks={
   points_visibles:keyVis.every(([,v])=>v>=0.5),visibilite:Object.fromEntries(keyVis),
   corps_entier:pts.ankle[1]<H*0.98&&pts.ear[1]>H*0.02,taille_dans_image_pct:Math.round(bodyH/H*100),
   profil_strict:Math.abs(det.lm[11].x-det.lm[12].x)*W<bodyH*0.08
  };
  const png=await page.evaluate((p,f)=>window.draw(p,f),pts,facing);
  fs.writeFileSync(path.join(OUT,'posture-annotee.png'),Buffer.from(png.split(',')[1],'base64'));
  result={ok:true,image:{w:W,h:H},side,facing:facing>0?'droite':'gauche',measures,checks,
   points:Object.fromEntries(Object.entries(pts).map(([k,p])=>[k,[Math.round(p[0]),Math.round(p[1])]]))};
 }
}finally{await browser.close();server.close();}
fs.writeFileSync(path.join(OUT,'posture.json'),JSON.stringify(result,null,1));
console.log(JSON.stringify(result,null,1));
