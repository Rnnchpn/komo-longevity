import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
const site=join(process.cwd(),'site');
const BOOK='https://app.acuityscheduling.com/schedule.php?owner=40696577';
const PULSE='https://pulse.komolongevity.com/';
const content=\`<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f4f1e9"><meta name="robots" content="index,follow">
<title>Votre parcours KŌMØ Motion — rendez-vous, Pulse et suivi</title><meta name="description" content="Découvrez votre parcours KŌMØ Motion en cinq étapes : réserver, accéder à Pulse, préparer votre bilan, le réaliser et suivre vos résultats.">
<link rel="canonical" href="https://komolongevity.com/parcours/">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#f5f2eb;--paper:#fffcf8;--ink:#1a2920;--sage:#e6ede6;--green:#254838;--muted:#66716b;--line:#dce3dc}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:"DM Sans",Arial,sans-serif}a{color:inherit;text-decoration:none}a:focus-visible{outline:3px solid #a7bea9;outline-offset:4px}
nav{display:flex;max-width:1200px;margin:auto;padding:22px 24px;align-items:center;justify-content:space-between;gap:14px}nav .logo{font-family:Manrope,sans-serif;font-size:31px;font-weight:600;letter-spacing:.1em}nav .right{display:flex;gap:20px;align-items:center;font-size:12px;font-weight:700}
a.button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;border-radius:30px;padding:13px 21px;font-size:13px;font-weight:700;background:var(--green);color:white}a.button.light{background:#fff;color:var(--green)}a.ghost{font-size:13px;font-weight:700;color:var(--green)}
main{max-width:1200px;margin:auto;padding:20px 24px 70px}.hero{display:grid;grid-template-columns:1fr .85fr;gap:22px;align-items:stretch}.intro{border-radius:30px;padding:clamp(30px,5vw,68px);background:var(--green);color:#fff;min-height:420px;display:flex;flex-direction:column;justify-content:center}.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.18em;font-weight:700;color:#a8c0ae}
h1{font:500 clamp(40px,5vw,72px)/1.04 Manrope,sans-serif;letter-spacing:-.06em;margin:20px 0}h1 em{font-style:normal;color:#cbded0}.intro p{font-size:16px;max-width:540px;line-height:1.7;color:#e2eee6}.actions{display:flex;flex-wrap:wrap;gap:15px;align-items:center;margin-top:25px}
.hero-visual{border-radius:30px;overflow:hidden;min-height:420px;background:linear-gradient(0deg,rgba(25,45,32,.64),transparent 57%),url('/assets/images/hero-mediterranean-motion-v1.webp') center/cover #648071;display:flex;align-items:flex-end;padding:38px;color:#fff}.hero-visual div{max-width:280px}.hero-visual strong{font:500 30px/1.1 Manrope}.hero-visual p{font-size:13px;line-height:1.7;color:#e2ebe5}
.label{font-size:11px;font-weight:750;text-transform:uppercase;letter-spacing:.13em;color:#69796e}h2{font:550 clamp(29px,4vw,43px)/1.1 Manrope;letter-spacing:-.045em}
.section-head{margin:55px 0 24px}.section-head p{max-width:680px;color:var(--muted);line-height:1.75}
.steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.steps article{background:var(--paper);border:1px solid var(--line);border-radius:21px;padding:23px;min-height:228px}
.steps b{color:#658b71;font:700 12px Manrope}.steps h3{font:600 20px/1.2 Manrope;letter-spacing:-.03em;margin:28px 0 9px}.steps p{color:var(--muted);font-size:12px;line-height:1.6;margin:0}
.bottom{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-top:22px}.bottom>article{padding:30px;border-radius:22px;background:#e5eee7}.bottom>article:last-child{background:#eee9e0}.bottom h3{font:600 23px Manrope;margin:9px 0}.bottom p{font-size:13px;line-height:1.65;color:#647168}
footer{border-top:1px solid var(--line);padding:30px 24px 45px;max-width:1200px;margin:auto;font-size:12px;color:var(--muted);display:flex;justify-content:space-between;gap:15px}
@media(max-width:980px){.hero{grid-template-columns:1fr}.steps{grid-template-columns:repeat(2,1fr)}.hero-visual{min-height:240px}.intro{min-height:340px}}@media(max-width:540px){nav .right{gap:11px;font-size:11px}main{padding:6px 16px 45px}nav{padding:16px}.intro{border-radius:23px;padding:30px 26px;min-height:330px}.hero-visual{min-height:210px;border-radius:23px;padding:25px}.steps{grid-template-columns:1fr}.steps article{min-height:140px}.steps h3{margin:15px 0 7px}.bottom{grid-template-columns:1fr}.bottom>article{padding:22px}footer{flex-direction:column}}
</style></head>
<body>
<nav aria-label="Navigation principale"><a href="/" class="logo" aria-label="KŌMØ, accueil">KŌMØ</a><div class="right"><a href="/">Site KŌMØ</a><a href="§{PULSE}">Mon espace Pulse</a></div></nav>
<main>
<section class="hero"><div class="intro"><span class="eyebrow">KŌMØ · Longevity in Motion</span><h1>Votre mouvement.<br><em>Un parcours limpide.</em></h1><p>Une consultation Motion, des mesures pertinentes et un suivi qui reste dans le même espace. Vous savez toujours quoi faire ensuite.</p><div class="actions"><a class="button light" href="§{BOOK}" rel="noopener noreferrer" target="_blank">Prendre rendez-vous</a><a class="ghost" style="color:#dbece0" href="§{PULSE}">J’ai déjà un accès Pulse →</a></div></div>
<div class="hero-visual" role="img" aria-label="Deux personnes marchant dans un environnement méditerranéen"><div><strong>Life is movement.</strong><p>Force, équilibre, marche, mobilité et trajectoire.</p></div></div></section>
<section class="section-head"><span class="label">Votre parcours KŌMØ Motion</span><h2>Cinq étapes, zéro confusion.</h2><p>Le site vous permet de découvrir l’offre et de réserver. Pulse est votre espace personnel sécurisé. Les informations se rejoignent dans votre dossier lorsque votre équipe a confirmé et associé votre rendez-vous.</p></section>
<section class="steps" aria-label="Les cinq étapes">
<article><b>01 · RÉSERVER</b><h3>Choisir son rendez-vous</h3><p>Depuis notre planning de réservation, choisissez le créneau de votre bilan Motion.</p></article>
<article><b>02 · SE CONNECTER</b><h3>Accéder à Pulse</h3><p>Votre équipe vous communique votre accès et relie votre dossier patient au bon rendez-vous.</p></article>
<article><b>03 · PRÉPARER</b><h3>Remplir les questionnaires</h3><p>Dans Pulse, renseignez votre mobilité et votre contexte. Vous pouvez reprendre vos réponses.</p></article>
<article><b>04 · MESURER</b><h3>Réaliser votre bilan</h3><p>Votre professionnel réalise les mesures pertinentes selon le protocole et les outils disponibles.</p></article>
<article><b>05 · SUIVRE</b><h3>Retrouver les résultats</h3><p>Les résultats vérifiés, le plan et les prochaines étapes apparaissent dans votre espace Pulse.</p></article>
</section>
<section class="bottom"><article><span class="label">JE DÉCOUVRE KŌMØ</span><h3>Je souhaite un bilan Motion.</h3><p>Un parcours sur rendez-vous, conçu pour mesurer et suivre votre mouvement.</p><a class="button" href="§{BOOK}" target="_blank" rel="noopener noreferrer">Réserver mon bilan →</a></article><article><span class="label">J’AI DÉJÀ UN COMPTE</span><h3>Je retrouve mon suivi.</h3><p>Accédez à vos questionnaires, rendez-vous enregistrés, résultats publiés et trajectoire.</p><a class="button" href="§{PULSE}">Ouvrir KŌMØ Pulse →</a></article></section>
<p style="margin:28px 4px 0;color:#727d73;font-size:12px;line-height:1.7">Important : une réservation réalisée sur le planning externe peut nécessiter une validation et une liaison par l’équipe avant d’apparaître dans Pulse. L’espace Motion ne fournit pas de diagnostic médical automatisé.</p>
</main><footer><span>© 2026 KŌMØ · Longevity in Motion</span><a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a></footer>
</body></html>\`.replaceAll('§{BOOK}',BOOK).replaceAll('§{PULSE}',PULSE);
await mkdir(join(site,'parcours'),{recursive:true});
await writeFile(join(site,'parcours','index.html'),content,'utf8');

const banner=\`<aside id="komo-pulse-journey-bridge" aria-label="Parcours Motion et Pulse" style="background:#e4ebe4;color:#213d2b;border-bottom:1px solid #cedbd0;padding:12px 20px;text-align:center;font:500 12px/1.6 'DM Sans',Arial,sans-serif"><strong style="margin-right:9px">Votre parcours KŌMØ Motion</strong><span>Réserver · Préparer dans Pulse · Mesurer · Suivre</span> <a href="/parcours/" style="display:inline-block;margin-left:16px;font-weight:700;text-decoration:underline;color:#244c34">Comprendre les étapes →</a> <a href="§{PULSE}" style="display:inline-block;margin-left:13px;font-weight:700;color:#244c34">Mon espace Pulse →</a></aside>\`.replace('§{PULSE}',PULSE);
for(const rel of ['index.html','pulse/index.html']){
 const path=join(site,rel);let html;
 try{html=await readFile(path,'utf8')}catch{continue}
 if(!html.includes('komo-pulse-journey-bridge')){
   const pattern=/<\/header\s*>/i;
   if(pattern.test(html)) html=html.replace(pattern,x=>x+banner);
   else if(/<main\b[^>]*>/i.test(html))html=html.replace(/<main\b[^>]*>/i,x=>x+banner);
   else html=html.replace(/<body\b[^>]*>/i,x=>x+banner);
 }
 // Clarify that an enrolled patient opens their actual account through Pulse.
 html=html.replace(/href=(["'])\/pulse\/connexion\/?\1/gi,\`href="$\{PULSE}"\`);
 html=html.replace(/href=(["'])\/pulse\/inscription\/?\1/gi,'href="/parcours/"');
 await writeFile(path,html,'utf8');
}
console.log('[komo-pulse-journey-bridge] published /parcours and linked homepage + public Pulse marketing page');