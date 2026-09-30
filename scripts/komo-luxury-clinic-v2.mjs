import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site=join(process.cwd(),'site');
const A='/assets/site2026/generated';

async function exists(fp){try{await access(fp);return true}catch{return false}}
async function patch(rel,fn){
  const fp=join(site,rel); if(!(await exists(fp))) return;
  let html=await readFile(fp,'utf8');
  html=fn(html);
  await writeFile(fp,html,'utf8');
}

const css=`
<style id="komo-luxury-clinic-v2-style">
.kl-clinical{padding:clamp(76px,9vw,118px) 0;background:#f2ece2;color:#171a17}
.kl-clinical-grid{display:grid;grid-template-columns:minmax(0,1.12fr) minmax(360px,.88fr);gap:clamp(42px,7vw,90px);align-items:center}
.kl-clinical-media{margin:0;min-height:560px;border-radius:28px;overflow:hidden;background:#cbb79e;box-shadow:0 34px 90px rgba(70,50,32,.13)}
.kl-clinical-media img{display:block;width:100%;height:100%;min-height:560px;object-fit:cover}
.kl-clinical-copy .kt-h2{max-width:650px}.kl-clinical-copy .kt-copy{max-width:620px}
.kl-clinical-list{margin-top:28px;border-top:1px solid rgba(50,43,35,.14)}
.kl-clinical-row{display:grid;grid-template-columns:160px 1fr;gap:22px;padding:17px 0;border-bottom:1px solid rgba(50,43,35,.11)}
.kl-clinical-row strong{font-size:11px}.kl-clinical-row span{color:#666258;font-size:11px;line-height:1.55}
.kl-address{margin-top:16px;color:rgba(255,255,255,.62);font-size:10px;line-height:1.55}
.kp-footer .kl-address{color:rgba(30,32,28,.58)}
.kl-contact-address{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:28px auto 0;max-width:1180px;padding:0 24px}
.kl-contact-address article{padding:24px;border:1px solid rgba(46,39,31,.13);border-radius:18px;background:#f7f1e7}
.kl-contact-address strong{display:block;font:400 25px/1 "Iowan Old Style",Baskerville,Georgia,serif}
.kl-contact-address p{margin:10px 0 0;color:#625d54;font-size:11px;line-height:1.55}
@media(max-width:900px){.kl-clinical-grid{grid-template-columns:1fr}.kl-clinical-media,.kl-clinical-media img{min-height:0}.kl-clinical-media img{aspect-ratio:4/3}.kl-contact-address{grid-template-columns:1fr}}
@media(max-width:620px){.kl-clinical-row{grid-template-columns:1fr;gap:6px}.kl-clinical-media{border-radius:20px}}
</style>`;

function injectStyle(html){
  if(!html.includes('komo-luxury-clinic-v2-style')) html=html.replace('</head>',css+'\n</head>');
  return html;
}

function removeCaseFromMenus(html){
  html=html
    .replace(/<a class="kt-menu-link" href="\/fr\/case\/equipment\/">KŌMØ Case<\/a>/g,'')
    .replace(/<a class="kt-menu-link" href="\/case\/equipment\/">KŌMØ Case<\/a>/g,'')
    .replace(/<a class="kt-menu-link" href="\/es\/case\/equipment\/">KŌMØ Case<\/a>/g,'')
    .replace(/<a href="\/fr\/#case">Case<\/a>/g,'')
    .replace(/<a href="\/#case">Case<\/a>/g,'')
    .replace(/<a href="\/es\/#case">Case<\/a>/g,'');
  return html;
}

function addAddressToFooter(html,lang){
  if(html.includes('45 boulevard de la Croisette')) return html;
  const line=lang==='en'
    ? 'KŌMØ SAS · Registered office · 45 boulevard de la Croisette · 06400 Cannes · France'
    : lang==='es'
      ? 'KŌMØ SAS · Domicilio social · 45 boulevard de la Croisette · 06400 Cannes · Francia'
      : 'KŌMØ SAS · Siège social · 45 boulevard de la Croisette · 06400 Cannes · France';

  if(html.includes('<footer class="kp-footer">')){
    html=html.replace(/(<footer class="kp-footer">[\s\S]*?<div class="kp-footer-grid"><div>[\s\S]*?<p>[^<]*<\/p>)/,
      `$1<p class="kl-address">${line}</p>`);
  }else if(html.includes('<footer class="footer">')){
    html=html.replace(/(<p class="footer-copy">[^<]*<\/p>)/,`$1<p class="kl-address">${line}</p>`);
  }else if(html.includes('<footer>')){
    html=html.replace(/<footer>/,`<footer><div class="kl-address" style="max-width:1180px;margin:0 auto;padding:24px">${line}</div>`);
  }
  return html;
}

function addClinicalFeature(html){
  if(html.includes('id="komo-clinical-feature"')) return html;
  const marker='<section class="kc-section kc-section--deep" id="how-it-works">';
  if(!html.includes(marker)) return html;
  const section=`<section class="kl-clinical" id="komo-clinical-feature"><div class="kt-shell kl-clinical-grid">
    <figure class="kl-clinical-media"><img src="${A}/komo-clinical-premium.webp" alt="Consultation KŌMØ Clinical et lecture intégrée des résultats" loading="lazy"></figure>
    <div class="kl-clinical-copy"><p class="kt-ey">KŌMØ CLINICAL</p><h2 class="kt-h2">L’évaluation médicale intégrée</h2><p class="kt-copy">Clinical associe la consultation médicale à l’analyse du mouvement, des questionnaires personnalisés et, selon l’indication, jusqu’à 150 biomarqueurs. Les données fonctionnelles et biologiques sont réunies dans une restitution unique afin de replacer la mobilité dans une lecture plus globale de la santé.</p>
      <div class="kl-clinical-list">
        <div class="kl-clinical-row"><strong>Consultation</strong><span>Antécédents, symptômes, traitements, objectifs et examen clinique orienté.</span></div>
        <div class="kl-clinical-row"><strong>Mouvement</strong><span>Marche, posture, équilibre, force, mobilité et activité musculaire.</span></div>
        <div class="kl-clinical-row"><strong>Biomarqueurs</strong><span>Jusqu’à 150 biomarqueurs intégrés lorsque le protocole médical le justifie.</span></div>
        <div class="kl-clinical-row"><strong>Restitution</strong><span>Résultats compréhensibles, recommandations et suivi dans Pulse.</span></div>
      </div>
      <div class="kt-btns"><a class="kt-btn kt-btn--dark" href="/fr/clinical/">Découvrir Clinical</a></div>
    </div>
  </div></section>`;
  return html.replace(marker,section+marker);
}

function deGadget(html){
  return html
    .replaceAll('KŌMØ Case · six capteurs Myodev · Pulse','KŌMØ Motion · Clinical · Pulse')
    .replaceAll('Une session KŌMØ Case / Pulse en conditions réelles montre le parcours de mesure dans votre environnement.','Une session KŌMØ en conditions réelles permet de présenter le protocole de mesure, la restitution et le suivi dans Pulse.')
    .replaceAll('La KŌMØ Case peut équiper le partenaire lorsque le volume d’activité justifie une installation permanente.','Une installation technique permanente peut être étudiée lorsque le volume d’activité justifie un déploiement sur site.')
    .replaceAll('KŌMØ Case pour partenaires','Intégration professionnelle')
    .replaceAll('Motion · Clinical · Case · Pulse · Network','Motion · Clinical · Pulse · Network')
    .replace(/<a href="\/fr\/case\/"[^>]*><small>01 · Système portable<\/small><strong>Case →<\/strong><\/a>/g,'')
    .replace(/<a href="\/case\/"[^>]*><small>01 · Portable system<\/small><strong>Case →<\/strong><\/a>/g,'')
    .replace(/<a href="\/es\/case\/"[^>]*><small>01 · Sistema portátil<\/small><strong>Case →<\/strong><\/a>/g,'');
}

const frPages=[
 'index.html','fr/motion/index.html','fr/clinical/index.html','fr/signature/index.html','fr/experience/index.html','fr/yachting/index.html','fr/world/index.html',
 'fr/partners/index.html','fr/contact/index.html','fr/a-propos/index.html','fr/science/index.html','fr/methode/index.html','fr/network/index.html',
 'fr/legal/index.html','fr/privacy/index.html','fr/terms/index.html','fr/medical-information/index.html','fr/intellectual-property/index.html','fr/cgv/index.html'
];
const enPages=['en/index.html','motion/index.html','clinical/index.html','signature/index.html','experience/index.html','en/yachting/index.html','en/world/index.html','partners/index.html','contact/index.html','about/index.html','science/index.html'];
const esPages=['es/index.html','es/motion/index.html','es/clinical/index.html','es/signature/index.html','es/experience/index.html','es/yachting/index.html','es/world/index.html','es/partners/index.html','es/contact/index.html','es/sobre/index.html','es/science/index.html'];

for(const rel of frPages) await patch(rel,html=>addAddressToFooter(deGadget(removeCaseFromMenus(injectStyle(html))),'fr'));
for(const rel of enPages) await patch(rel,html=>addAddressToFooter(deGadget(removeCaseFromMenus(injectStyle(html))),'en'));
for(const rel of esPages) await patch(rel,html=>addAddressToFooter(deGadget(removeCaseFromMenus(injectStyle(html))),'es'));

// Homepage: make Clinical as visually important as Motion.
await patch('index.html',html=>{
  html=addClinicalFeature(html);
  html=html.replace('href="/fr/contact/?intent=motion">Découvrir Motion</a>','href="/fr/motion/">Découvrir Motion</a>');
  return html;
});

// Contact page: remove gadget-first framing and expose company domicile without presenting it as a clinic address.
await patch('fr/contact/index.html',html=>{
  html=html
    .replace('KŌMØ RIVIERA · DEMANDE PROFESSIONNELLE','KŌMØ LONGEVITY · CANNES')
    .replace('Demandez une démo KŌMØ<br><em>pour votre établissement.</em>','Contacter KŌMØ Longevity')
    .replace('Centres médicaux et de longévité, hôtels premium, fitness, performance et partenaires privés : décrivez où et comment vous souhaitez déployer KŌMØ. Nous préparerons la démonstration et le modèle d’intégration pertinents.','Pour un bilan Motion, une demande Clinical, un programme privé ou un partenariat professionnel, contactez l’équipe KŌMØ. Les demandes de santé sensibles ne doivent pas être transmises par ce formulaire public.')
    .replace('Demander une démo →','Écrire à KŌMØ →')
    .replace('AVANT LA DÉMONSTRATION','CONTACT')
    .replace('Ce que nous vous demanderons.','Informations utiles')
    .replace('Quatre informations concrètes pour préparer une démonstration KŌMØ pertinente dès le premier échange.','Pour les demandes professionnelles, quelques informations sur votre structure permettent de préparer un échange adapté.')
    .replace('KŌMØ PRO · ONBOARDING PARTENAIRE','PARTENARIATS PROFESSIONNELS')
    .replace('Votre établissement.<br><em>Votre activité. La bonne suite.</em>','Présenter votre projet KŌMØ')
    .replace('Cette demande professionnelle courte nous donne les éléments utiles pour préparer une démonstration ou une proposition de partenariat adaptée.','Ce formulaire est réservé aux demandes de partenariat, de pilote et de déploiement professionnel.');
  if(!html.includes('kl-contact-address')){
    const anchor='</section><section class="rvc-contact-brief">';
    const block=`</section><div class="kl-contact-address"><article><strong>Contact</strong><p><a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a><br>Motion · Clinical · Signature · Yachting</p></article><article><strong>Siège social</strong><p>KŌMØ SAS<br>45 boulevard de la Croisette<br>06400 Cannes · France</p></article></div><section class="rvc-contact-brief">`;
    html=html.replace(anchor,block);
  }
  return html;
});

// Professional page: services first, installation second.
await patch('fr/partners/index.html',html=>{
  html=html
    .replace('Notre modèle B2B commence par des consultations et des journées KŌMØ opérées sur votre site. Vous voyez la demande, vos équipes comprennent le service, puis nous construisons le modèle récurrent et seulement ensuite le déploiement permanent.','KŌMØ intervient d’abord comme service opéré : bilans Motion, Clinical lorsque cela est indiqué, restitution dans Pulse et suivi. Un déploiement technique permanent n’est étudié qu’après validation de l’usage et du volume.')
    .replace('<div><b>05</b><span>Installation</span></div>','<div><b>05</b><span>Déploiement si nécessaire</span></div>');
  return html;
});

// Legal information: make the registered office explicit.
await patch('fr/legal/index.html',html=>{
  if(html.includes('45 boulevard de la Croisette')) return html;
  const mainEnd='</main>';
  const block=`<section style="padding:40px 24px;background:#f4eee4"><div style="max-width:1180px;margin:0 auto"><strong>KŌMØ SAS</strong><p>Siège social : 45 boulevard de la Croisette, 06400 Cannes, France.</p></div></section>`;
  return html.replace(mainEnd,block+mainEnd);
});

console.log('[komo-luxury-clinic-v2] PASS · registered office, clinical visual hierarchy and service-first positioning applied; Case removed from public foreground.');
