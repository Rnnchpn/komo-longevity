import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'src/pages/motion-cannes-booking-200.html');
const folder=join(root,'site/fr/reserver-motion-cannes');
await mkdir(folder,{recursive:true});
let html=await readFile(source,'utf8');
const required=[
 'KŌMØ Motion Cannes — Bilan fonctionnel 60 min · 200 €',
 'id="bookingForm"',
 'mailto:contact@komolongevity.com',
 '200 €',
 '60 min',
 'non médical',
 'politique de confidentialité'
];
if(!required.every(x=>html.includes(x)))throw Error('booking page incomplete');
if(!html.includes('form.addEventListener')||!html.includes('reportValidity()'))throw Error('booking form not functional');
html=html.replace(',"availability":"https://schema.org/PreOrder"','');
await writeFile(join(folder,'index.html'),html,'utf8');
// Short print-friendly route for posters, QR codes, and social bios.
const short=join(root,'site/motion-cannes');
await mkdir(short,{recursive:true});
await writeFile(join(short,'index.html'),'<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=/fr/reserver-motion-cannes/"><title>KŌMØ Motion Cannes</title><link rel="canonical" href="https://komolongevity.com/fr/reserver-motion-cannes/"></head><body><p><a href="/fr/reserver-motion-cannes/">Découvrir KŌMØ Motion à Cannes — 200 € / 60 min</a></p></body></html>','utf8');
// Offer bridge from the French Motion method page, after the existing build pipeline.
const motionPath=join(root,'site/fr/motion/index.html');
let motion=await readFile(motionPath,'utf8').catch(()=>null);
if(motion&&!motion.includes('data-motion-cannes-booking-200')){
  const teaser='<section data-motion-cannes-booking-200 style="background:#102f38;color:#f9f9f3;padding:clamp(50px,7vw,95px) 22px;text-align:center"><div style="max-width:780px;margin:auto"><p style="font-size:10px;letter-spacing:.2em;color:#bddbd2">CANNES · PALM BEACH · BILAN INDÉPENDANT</p><h2 style="font:500 clamp(36px,5vw,62px)/1.07 Georgia,serif;letter-spacing:-.04em;margin:20px 0">Votre mouvement. Mesuré.</h2><p style="font-size:14px;line-height:1.7;color:#c4d6d1">Un bilan fonctionnel présentiel de 60 minutes. Marche, équilibre, capacité assis-debout et mobilité. 200 € · Synthèse personnalisée · Non médical.</p><a href="/fr/reserver-motion-cannes/" style="display:inline-block;margin-top:24px;padding:17px 26px;background:#f4eee3;color:#143a42;text-decoration:none;font-size:12px;font-weight:800;letter-spacing:.1em">DÉCOUVRIR ET DEMANDER UN CRÉNEAU ↗</a></div></section>';
  if(motion.includes('</main>'))motion=motion.replace('</main>',teaser+'</main>');
  else if(motion.includes('<footer'))motion=motion.replace('<footer',teaser+'<footer');
  if(motion.includes('data-motion-cannes-booking-200'))await writeFile(motionPath,motion,'utf8');
}
console.log('[motion-cannes-booking] French booking request page and short alias built');
