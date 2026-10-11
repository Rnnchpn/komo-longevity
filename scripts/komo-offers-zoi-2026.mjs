import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { dirname, join } from "node:path";

// Commercial offer layer, deliberately separate from Pulse, patient records and payment.
// KŌMØ uses Zoī's clear tier -> assessment -> debrief -> follow-up pattern,
// not its wording, design or proprietary clinical examination packages.
const SITE = join(process.cwd(), "site");
const BASE = "https://komolongevity.com";
const ADDRESS = "Résidence Antinéa, 8 avenue Reine Astrid, 06400 Cannes, France";
const PENDING = "[À COMPLÉTER AVANT MISE EN VENTE]";
const CSS = [
  ":root{--cm-bg:#f8f7f3;--cm-ink:#17201b;--cm-muted:#58665c;--cm-line:#d9ded7;--cm-green:#234c3d;--cm-cream:#e9eee5}",
  "*{box-sizing:border-box}html{scroll-behavior:smooth}body.cm{margin:0;background:var(--cm-bg);color:var(--cm-ink);font-family:Inter,Arial,Helvetica,sans-serif;line-height:1.55}",
  ".cm .wrap{max-width:1170px;margin:auto;padding:0 22px}.cm .mast{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:22px 0;border-bottom:1px solid var(--cm-line)}",
  ".cm .logo{font-weight:800;letter-spacing:.22em;font-size:19px;text-decoration:none;color:inherit}.cm a{color:inherit}.cm .nav{display:flex;gap:23px;align-items:center;flex-wrap:wrap;font-size:12px}.cm .nav a{text-decoration:none}",
  ".cm .pill{display:inline-block;border:1px solid var(--cm-line);border-radius:40px;padding:12px 20px;text-decoration:none;font-size:12px;font-weight:700}",
  ".cm .pill.dark{background:var(--cm-ink);color:white;border-color:var(--cm-ink)}.cm .ey{font-size:11px;letter-spacing:.2em;text-transform:uppercase;font-weight:700;color:#567465}",
  ".cm h1,.cm h2,.cm h3{font-family:Georgia,'Times New Roman',serif;font-weight:400;letter-spacing:-.038em;line-height:1.07}.cm h1{font-size:clamp(42px,6vw,80px);margin:17px 0}.cm h2{font-size:clamp(31px,4.5vw,55px);margin:12px 0}.cm h3{font-size:32px;margin:13px 0}",
  ".cm .lead{font-size:clamp(17px,2vw,21px);max-width:700px;color:var(--cm-muted)}.cm .hero{padding:85px 0 66px;background:linear-gradient(120deg,#f8f7f3,#e9eee7)}",
  ".cm .row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.cm .section{padding:70px 0}.cm .section.muted{background:#eef0e8}.cm .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px;margin-top:40px}",
  ".cm .grid.plans{grid-template-columns:repeat(4,minmax(0,1fr))}.cm .card{border:1px solid var(--cm-line);border-radius:19px;background:#fff;padding:31px;display:flex;flex-direction:column;min-height:490px}.cm .card.featured{background:#193c2f;color:white;border-color:#193c2f}.cm .card.featured .sub{color:#d8e3d9}",
  ".cm .cardlinks{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.cm .textlink{font-size:12px;text-underline-offset:4px;font-weight:700}.cm .spec{padding:15px 18px;border-top:1px solid var(--cm-line);display:grid;grid-template-columns:180px 1fr;gap:14px}.cm .spec strong{font-size:13px}.cm .spec span{font-size:13px;color:var(--cm-muted)}.cm .small-ey{color:#9fb6a6;text-transform:uppercase;font-size:10px;font-weight:800;letter-spacing:.13em}.cm .highlight{padding:28px 32px;background:#e5eee7;border-radius:20px}.cm .photo-note{font-size:12px;color:var(--cm-muted);margin:9px 0}.cm .price{font-size:24px;font-family:Georgia,serif;margin-top:10px}.cm .sub{font-size:13px;color:var(--cm-muted);line-height:1.75}.cm ul{padding-left:19px}.cm li{margin:10px 0;font-size:13px}.cm .card .actions{margin-top:auto;padding-top:21px}",
  ".cm .steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;border-top:1px solid var(--cm-line);margin-top:33px}.cm .step{padding:25px 21px 16px;border-right:1px solid var(--cm-line)}.cm .step:last-child{border:0}.cm .step b{font-size:11px;color:#52705d}.cm .step h3{font-size:25px}",
  ".cm .two{display:grid;grid-template-columns:1fr 1fr;gap:44px;align-items:center}.cm .two img{width:100%;height:auto;max-height:470px;object-fit:contain;border-radius:20px}",
  ".cm .faq details{border-bottom:1px solid var(--cm-line);padding:18px 0}.cm .faq summary{cursor:pointer;font-weight:600}.cm .faq p{font-size:14px;color:var(--cm-muted)}",
  ".cm .legal{padding:70px 0;max-width:890px}.cm .legal section{padding:24px 0;border-bottom:1px solid var(--cm-line)}.cm .legal h2{font:normal 28px/1.2 Georgia,serif}.cm .legal p,.cm .legal li{font-size:14px;line-height:1.8}",
  ".cm .note{padding:18px;border:1px solid #cccfbb;border-radius:12px;background:#f6f3e8;font-size:13px}.cm .footer{padding:40px 0;border-top:1px solid var(--cm-line);font-size:12px;color:#556358}",
  ".cm .footlinks{display:flex;flex-wrap:wrap;gap:12px 23px;margin:15px 0}.cm .footlinks a{text-decoration:none}.cm .cta-band{padding:54px 0;background:#173729;color:white}",
  "@media(max-width:800px){.cm .grid,.cm .grid.plans,.cm .two{grid-template-columns:1fr}.cm .steps{grid-template-columns:1fr 1fr}.cm .nav{gap:12px}.cm .hero{padding:55px 0}}",
  "@media(max-width:500px){.cm .steps{grid-template-columns:1fr}.cm .step{border-right:0;border-bottom:1px solid var(--cm-line)}.cm .card{min-height:0}}"
].join("");
const FOOTLINKS = [
  ["Offres", "/fr/check-ups/"], ["La valise Motion", "/fr/motion-case/"],
  ["CGV particuliers", "/fr/cgv/"], ["CGV professionnels", "/fr/cgv-pro/"],
  ["Mentions légales", "/fr/legal/"], ["Confidentialité", "/fr/privacy/"], ["Contact", "/fr/contact/"]
];
const footLinks = () => FOOTLINKS.map(([text, href]) => "<a href='" + href + "'>" + text + "</a>").join("");
const nav = () => "<nav class='nav' aria-label='Navigation principale'><a href='/'>Accueil</a><a href='/fr/check-ups/'>Les bilans</a><a href='/fr/motion-case/'>Motion Case Pro</a><a class='pill dark' href='/fr/contact/'>Demander un rendez-vous</a></nav>";
const layout = (title, description, body) => [
  "<!doctype html><html lang='fr'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>",
  "<title>", title, " — KŌMØ Longevity</title><meta name='description' content='", description, "'>",
  "<meta name='robots' content='index,follow'><style>", CSS, "</style></head><body class='cm'>",
  "<header class='wrap mast'><a class='logo' href='/'>KŌMØ</a>", nav(), "</header>",
  "<main id='main'>", body, "</main><footer class='footer'><div class='wrap'><strong>KŌMØ Longevity</strong><p>", ADDRESS,
  "</p><div class='footlinks'>", footLinks(), "</div><p>Évaluations fonctionnelles non médicales. Aucun diagnostic ni acte de soin n'est fourni dans les bilans Motion. ",
  "Les prestations médicales éventuelles relèvent exclusivement de professionnels habilités et de contrats distincts.</p></div></footer></body></html>"
].join("");
const cards = [
  {
    slug:"motion", audience:"Pour mesurer votre mobilité", eyebrow:"01 · LE MOUVEMENT", title:"Motion", price:"300 € TTC · tarif de référence",
    description:"Un état des lieux instrumenté de vos capacités locomotrices, avec une restitution claire.",
    features:["Questionnaire et objectifs fonctionnels","Marche, équilibre, force et contrôle du mouvement selon protocole et matériel disponible","Restitution et rapport fonctionnel","Accès aux résultats dans KŌMØ Pulse selon la formule convenue"],
    action:"Demander un bilan Motion"
  },
  {
    slug:"phenotype", audience:"Pour mesurer votre profil physique", eyebrow:"02 · LE PHÉNOTYPE",title:"Phenotype",price:"Sur devis",
    description:"Une photographie descriptive de votre composition corporelle et d'indicateurs physiques non médicaux.",
    features:["Analyse de composition corporelle selon équipement disponible","Indicateurs cutanés et capillaires selon modules retenus","Habitudes de vie et objectifs","Synthèse descriptive et suivi selon devis, sans examen biologique ni diagnostic"],
    action:"Découvrir Phenotype"
  },
  {
    slug:"complete", audience:"Pour une vision fonctionnelle plus globale", eyebrow:"03 · LE BILAN COMBINÉ",title:"Complete",price:"Sur devis",
    description:"Réunir la mesure locomotrice et le phénotype dans un parcours unique, avec un rapport intégré.",
    features:["Évaluation Motion et modules Phenotype","Restitution de vos indicateurs fonctionnels et physiques","Une à trois priorités de progression non thérapeutiques","Checkpoint et Pulse selon la formule souscrite"],
    action:"Composer mon bilan Complete"
  },
  {
    slug:"private", audience:"Pour une expérience dans votre environnement", eyebrow:"04 · SUR MESURE",title:"Private",price:"Sur devis personnalisé",
    description:"Un bilan choisi parmi ces formats, installé dans le lieu de votre choix : villa, hôtel, chalet ou yacht.",
    features:["Déplacement et installation du laboratoire mobile","Contenu de bilan choisi selon espace et objectifs","Restitution privée et rapport","Devis intégrant matériel, logistique et déplacements"],
    action:"Organiser un bilan privé"
  }
]
const cardHtml = (c, i) => [
  "<article class='card",i===2?" featured":"", "'><div class='ey'>",c.eyebrow,"</div><h3>",c.title,"</h3><div class='price'>",c.price,
  "</div><p class='sub'>",c.description,"</p><ul>",c.features.map(s=>"<li>"+s+"</li>").join(""),
  "</ul><div class='actions cardlinks'><a class='pill ",i===2?"":"dark","' href='/fr/contact/'>",c.action," ↗</a><a class='textlink' href='/fr/check-ups/",c.slug,"/'>Détail du bilan →</a></div></article>"
].join("");
const offerSection = () => [
  "<section class='section' id='bilans'><div class='wrap'><p class='ey'>KŌMØ · LES ÉVALUATIONS</p>",
  "<h2>Choisissez votre bilan.</h2><p class='lead'>Quatre formats, une même méthode : mesurer, comprendre et suivre votre mobilité. ",
  "Chaque prestation est définie dans un devis détaillé avant confirmation.</p><div class='grid plans'>",
  cards.map(cardHtml).join(""),"</div><p class='sub'>Le tarif Motion de 300 € TTC est une référence commerciale à confirmer. ",
  "Le prix contractuel, les options et les frais de déplacement sont ceux de votre devis accepté. Aucune commande payante n'est activée sur cette page.</p>",
  "</div></section>"
].join("");
const steps = [
  ["01","Choisir","Sélectionnez le niveau d'exploration adapté à vos objectifs."],
  ["02","Mesurer","Réalisez des tests fonctionnels reproductibles avec le matériel disponible."],
  ["03","Comprendre","Recevez une restitution, un rapport et des priorités concrètes."],
  ["04","Suivre","Comparez vos résultats lors d'une réévaluation, avec Pulse si inclus."]
];
const methodSection = () => [
  "<section class='section muted'><div class='wrap'><p class='ey'>VOTRE PARCOURS</p><h2>Des données au mouvement.</h2>",
  "<div class='steps'>",steps.map(s=>"<article class='step'><b>"+s[0]+"</b><h3>"+s[1]+"</h3><p class='sub'>"+s[2]+"</p></article>").join(""),"</div></div></section>"
].join("");
const proSection = () => [
  "<section class='section' id='motion-case'><div class='wrap two'><div><p class='ey'>KŌMØ CASE · POUR LES PROFESSIONNELS</p>",
  "<h2>Le Motion Lab. Dans une valise.</h2><p class='lead'>Un dispositif mobile pour déployer des bilans fonctionnels instrumentés dans une structure partenaire.</p>",
  "<p class='sub'>Configuration cible sous réserve de confirmation technique et contractuelle : deux plateformes de force VALD ForceDecks, un dynamomètre VALD DynaMo, une solution de capture du mouvement HumanTrak, iPad et accessoires adaptés. ",
  "Les références exactes et le contenu livré seront fixés dans la fiche technique et le devis.</p>",
  "<p class='sub'>Acquisition ou location du matériel, formation opérationnelle, méthode KŌMØ et licence Pulse Pro : des composantes distinctes, configurées pour chaque partenaire.</p>",
  "<div class='row'><a class='pill dark' href='/fr/motion-case/'>Découvrir Motion Case Pro ↗</a><a class='pill' href='/fr/contact/'>Demander une démonstration</a></div></div>",
  "<div><img src='/assets/images/real-case/komo-case-open.jpeg' alt='Photographie d’un prototype antérieur de laboratoire mobile KŌMØ' loading='lazy'><p class='photo-note'>Photographie d’un prototype antérieur, non contractuelle. Le modèle final VALD fera l’objet de visuels et d’une fiche technique dédiés.</p></div>",
  "</div></section>"
].join("");
const offersPage = layout("Nos bilans fonctionnels", "Découvrez les bilans KŌMØ Motion, Phenotype, Complete et Private, ainsi que notre laboratoire mobile.", [
  "<section class='hero'><div class='wrap'><p class='ey'>KŌMØ LONGEVITY · CANNES & MOBILE</p><h1>Comprendre votre mouvement.<br>Changer votre trajectoire.</h1>",
  "<p class='lead'>Une évaluation fonctionnelle instrumentée, des résultats lisibles et une progression suivie dans le temps. ",
  "À Cannes ou sur votre lieu de séjour.</p><div class='row'><a class='pill dark' href='#bilans'>Voir les bilans</a><a class='pill' href='/fr/contact/'>Parler à notre équipe</a></div></div></section>",
  offerSection(), methodSection(),proSection(),
  "<section class='section muted'><div class='wrap faq'><h2>Questions fréquentes.</h2>",
  "<details><summary>Est-ce une consultation médicale ?</summary><p>Non. Motion est une évaluation fonctionnelle non médicale et ne pose aucun diagnostic. Toute consultation, prescription, imagerie, biologie ou intervention médicale éventuelle relève d'un professionnel habilité et d'un contrat distinct.</p></details>",
  "<details><summary>Le bilan peut-il être réalisé sur un yacht ?</summary><p>Oui, sous réserve d'une zone de test adaptée, de la sécurité, de la disponibilité du matériel et d'un devis logistique accepté.</p></details>",
  "<details><summary>Les résultats sont-ils suivis ?</summary><p>Un rapport fonctionnel est fourni selon la formule souscrite. L'accès à Pulse et la durée du suivi sont détaillés dans le devis.</p></details>",
  "<details><summary>Puis-je réserver et payer ici ?</summary><p>La demande de rendez-vous ne constitue pas une commande. Une proposition écrite et les conditions contractuelles applicables vous seront remises avant tout engagement.</p></details></div></section>",
  "<section class='cta-band'><div class='wrap'><h2>Votre premier bilan commence ici.</h2><div class='row'><a class='pill' href='/fr/contact/'>Demander un rendez-vous ↗</a><a class='pill' href='/fr/cgv/'>Lire les CGV</a></div></div></section>"
].join(""));
const proPage = layout("Motion Case Pro", "Achat ou location d'un laboratoire mobile de mesures fonctionnelles et accès KŌMØ Pulse Pro sur devis.", [
  "<section class='hero'><div class='wrap'><p class='ey'>KŌMØ · B2B</p><h1>Motion Case Pro.<br>Un laboratoire qui voyage.</h1>",
  "<p class='lead'>Proposez des évaluations fonctionnelles instrumentées dans votre centre, hôtel, studio, club privé ou structure de sport.</p>",
  "<div class='row'><a class='pill dark' href='/fr/contact/'>Demander une démonstration</a><a class='pill' href='/fr/cgv-pro/'>Voir les conditions B2B</a></div></div></section>",
  proSection(),
  "<section class='section muted'><div class='wrap'><h2>Une solution complète, sans matériel superflu.</h2><div class='grid'>",
  [
    ["Équipement","Plateformes de force, DynaMo, HumanTrak, iPad et accessoires selon configuration retenue."],
    ["Méthode & formation","Installation, protocole fonctionnel et formation des équipes selon votre périmètre d'activité."],
    ["Logiciel","Accès Pulse Pro, modules et support aux conditions du contrat de licence souscrit."]
  ].map(x=>"<article class='card' style='min-height:220px'><h3>"+x[0]+"</h3><p class='sub'>"+x[1]+"</p></article>").join(""),
  "</div><div class='highlight' style='margin-top:32px'><p class='ey'>DÉPLOIEMENT PROFESSIONNEL</p><h3>Trois formules d’exploitation.</h3><div class='grid'>",
  [["Acheter", "Acquisition de la Case et accompagnement d’intégration, selon devis."],["Louer", "Mise à disposition sur durée convenue, avec conditions d’entretien et de restitution."],["Tester", "Déploiement ponctuel ou pilote avant un engagement matériel durable."]].map(x=>"<article style='padding:4px 0'><strong>"+x[0]+"</strong><p class='sub'>"+x[1]+"</p></article>").join(""),
  "</div><p class='sub'>Vente, location, formation et abonnement logiciel sont chiffrés séparément. Aucun revenu futur ni indication médicale ne sont garantis.</p></div></div></section>"
].join(""));

const perOfferDetails = {
  motion: {
    headline:"Votre mouvement devient mesurable.",
    intro:"Marche, équilibre, force et fonction musculaire : un repère quantifié pour comprendre vos capacités actuelles et les comparer dans le temps.",
    suited:"Vous souhaitez documenter votre condition fonctionnelle, reprendre une activité ou suivre objectivement l'évolution de vos performances quotidiennes.",
    assessment:"Bilan fonctionnel adapté à vos capacités et à l'environnement, à l'aide des instruments disponibles. Les tests précis et leur faisabilité sont confirmés avant la séance.",
    output:"Restitution descriptive, rapport Motion et priorités de mouvement non thérapeutiques. Un accès Pulse peut être inclus selon le devis.",
    follow:"Un nouveau bilan peut permettre une comparaison longitudinale selon un protocole comparable.",
    boundary:"Aucun acte médical, aucune prescription et aucun diagnostic. En présence de symptômes ou d'une pathologie, une consultation auprès d'un professionnel habilité peut être nécessaire."
  },
  phenotype: {
    headline:"Comprendre votre profil physique.",
    intro:"Des mesures descriptives de composition corporelle et des indicateurs physiques sélectionnés pour compléter votre perception de votre condition.",
    suited:"Vous souhaitez disposer de repères physiques reproductibles et suivre des changements au fil de vos routines.",
    assessment:"Composition corporelle selon les équipements disponibles, indicateurs cutanés ou capillaires et questionnaire d'habitudes de vie, dans la mesure retenue au devis.",
    output:"Synthèse descriptive et visualisation des indicateurs effectivement relevés.",
    follow:"Un nouveau passage permet de comparer les mesures dans des conditions méthodologiques similaires.",
    boundary:"Ce bilan ne comprend ni prélèvement, ni analyse biologique, ni dépistage, ni interprétation médicale. Les appareils et modules définitifs sont précisés avant vente."
  },
  complete: {
    headline:"Deux regards complémentaires sur votre condition.",
    intro:"La combinaison du bilan locomoteur Motion avec des mesures Phenotype, pour une lecture descriptive intégrée.",
    suited:"Vous préférez une photographie plus large, articulant performance fonctionnelle, mouvement et profil physique.",
    assessment:"Les tests Motion et les modules Phenotype indiqués dans le devis, en une session ou plusieurs selon le contexte.",
    output:"Rapport combiné, restitution et une à trois priorités fonctionnelles et comportementales non médicales.",
    follow:"Un point d'étape avec répétition de mesures peut être organisé selon vos objectifs et la formule choisie.",
    boundary:"Ce programme n'est pas un check-up médical complet : il n'inclut pas d'imagerie médicale, de biologie ou de consultation médicale."
  },
  private: {
    headline:"Le laboratoire vient à vous.",
    intro:"Villa, hôtel, yacht ou chalet : choisissez un bilan Motion, Phenotype ou Complete, et nous organisons son déploiement dans votre environnement.",
    suited:"Vous souhaitez une intervention privée ou un format réservé à un groupe restreint.",
    assessment:"Le programme choisi est adapté à la surface disponible, à la stabilité du lieu, à la confidentialité et aux conditions de sécurité.",
    output:"Restitution dans les conditions du bilan retenu, avec modalités de partage et de confidentialité définies avant la session.",
    follow:"Organisation possible de rendez-vous successifs ou d'un suivi longitudinal selon contrat.",
    boundary:"L'éligibilité du site, le matériel réellement transporté, les frais et les conditions d'annulation font partie du devis. Aucune prestation médicale à bord n'est incluse."
  }
};
function detailPage(c) {
  const d=perOfferDetails[c.slug];
  return layout(c.title+" — bilan détaillé",c.description,[
    "<section class='hero'><div class='wrap'><p class='ey'>KŌMØ · BILAN "+c.title.toUpperCase()+"</p><h1>"+d.headline+"</h1><p class='lead'>"+d.intro+"</p>",
    "<div class='row'><a class='pill dark' href='/fr/contact/'>Demander un devis ou un rendez-vous ↗</a><a class='pill' href='/fr/check-ups/'>Comparer les bilans</a></div></div></section>",
    "<section class='section'><div class='wrap two'><div><p class='ey'>APERÇU</p><h2>"+c.title+"</h2><p class='lead'>"+c.price+"</p><p class='sub'>"+c.description+"</p>",
    "<p class='note'>La formule exacte et ses conditions de paiement sont précisées sur votre devis. Il n'y a pas de paiement en ligne sur cette page.</p></div>",
    "<div class='highlight'><p class='ey'>POUR QUI ?</p><h3>Ce bilan vous correspond si…</h3><p>"+d.suited+"</p></div></div></section>",
    "<section class='section muted'><div class='wrap'><h2>Ce que comprend votre bilan.</h2><div class='spec'><strong>Avant la session</strong><span>Recueil de vos objectifs et définition du périmètre de mesure.</span></div>",
    "<div class='spec'><strong>Les mesures</strong><span>"+d.assessment+"</span></div>",
    "<div class='spec'><strong>Votre restitution</strong><span>"+d.output+"</span></div>",
    "<div class='spec'><strong>La suite</strong><span>"+d.follow+"</span></div></div></section>",
    "<section class='section'><div class='wrap'><p class='ey'>TRANSPARENCE</p><h2>Ce que le bilan ne fait pas.</h2><p class='lead'>"+d.boundary+"</p><div class='row'><a class='pill dark' href='/fr/contact/'>Organiser ce bilan</a><a class='pill' href='/fr/cgv/'>Conditions générales</a></div></div></section>"
  ].join(""));
}
const legalSections = [
  ["1. Identité et champ d'application",
    "Les présentes conditions ont vocation à encadrer les prestations fonctionnelles non médicales vendues aux consommateurs par l'entité exploitant la marque KŌMØ Longevity. Adresse déclarée : "+ADDRESS+". Dénomination juridique exacte, forme sociale, capital, numéro SIREN, immatriculation RCS, numéro de TVA le cas échéant, email et téléphone : "+PENDING+". L'identité juridique définitive figurera sur chaque devis et facture. La version applicable est celle acceptée lors de la commande."],
  ["2. Description des services",
    "Motion est une prestation d'évaluation fonctionnelle de la mobilité, de l'équilibre, de la force et du mouvement, selon un protocole détaillé dans le devis. Phenotype et Complete comprennent uniquement les modules de mesure non médicaux énoncés dans le devis. Private désigne un format de déplacement, avec un contenu de bilan expressément choisi. Les prestations ne constituent ni un diagnostic ni un traitement médical. Aucun résultat de performance, bénéfice thérapeutique ou amélioration déterminée n'est garanti."],
  ["3. Devis, commande et conclusion du contrat",
    "La demande de rendez-vous par le site n'est pas une commande. Le consommateur reçoit préalablement un devis précisant l'identité du vendeur, le contenu exact, le lieu, les prérequis, le délai ou la date, le prix TTC et les frais de déplacement, les modalités de paiement et d'annulation. La commande est conclue après acceptation expresse du devis et des présentes conditions. Tout futur paiement en ligne devra afficher clairement une commande avec obligation de paiement."],
  ["4. Prix, facturation et règlement",
    "Les prix sont indiqués en euros toutes taxes comprises lorsque la TVA est applicable. Le prix Motion de 300 € TTC indiqué sur les pages d'offres est un tarif de référence non ferme avant émission d'un devis. Le devis accepté fixe le prix final, les taxes, les frais de déplacement, l'échéancier de paiement et l'émetteur de facture. Aucun encaissement n'est effectué à partir du seul formulaire de contact."],
  ["5. Réalisation des prestations",
    "Les évaluations sont réalisées sur rendez-vous, dans le lieu et les conditions convenus. Le client signale les obstacles matériels, les limitations fonctionnelles susceptibles d'affecter la sécurité des exercices et toute difficulté à réaliser les tests. Le prestataire peut adapter ou interrompre la session pour des raisons de sécurité et proposer un report ou un remboursement approprié en cas d'impossibilité non imputable au client. Les mesures sont dépendantes du matériel, du protocole et des conditions d'exécution."],
  ["6. Report, annulation et absence",
    "Les délais de report, les éventuels frais autorisés et les conditions de remboursement sont détaillés dans le devis avant sa signature, sans préjudice du droit légal de rétractation. Aucun frais automatique d'annulation n'est créé par cette version de travail. En cas d'annulation du fait du prestataire, le client se voit proposer un report ou le remboursement des sommes correspondant aux services non exécutés, selon ses droits."],
  ["7. Droit de rétractation des consommateurs",
    "Pour un contrat de services conclu à distance, le consommateur dispose en principe de 14 jours à compter de sa conclusion pour se rétracter sans motif. Il peut notifier sa décision par une déclaration dénuée d'ambiguïté ou par le formulaire type ci-dessous. En cas de commencement de la prestation avant l'expiration du délai, une demande expresse du consommateur doit être recueillie et le montant proportionnel des prestations exécutées peut être dû en cas de rétractation. La perte du droit de rétractation après exécution complète ne s'applique que dans les conditions prévues par le Code de la consommation, avec les consentements et reconnaissances requis. Une fonctionnalité de rétractation en ligne doit être prévue pour tout contrat conclu en ligne soumis à cette obligation depuis le 19 juin 2026."],
  ["8. Droit de rétractation : formulaire type",
    "À l'attention de KŌMØ Longevity, "+ADDRESS+" ; adresse électronique de notification : "+PENDING+". Je vous notifie par la présente ma rétractation du contrat portant sur la prestation suivante : [désignation]. Commandée le : [date]. Nom du consommateur : [nom]. Adresse : [adresse]. Date : [date]. Signature uniquement en cas d'envoi papier : [signature]."],
  ["9. Limites non médicales et recours aux professionnels",
    "L'évaluation Motion ne remplace pas un avis médical. Elle ne comprend ni consultation, ni examen clinique médical, ni prescription, ni injection, ni interprétation diagnostique. Les prestations sanitaires proposées par un partenaire sont conclues directement avec un professionnel ou établissement habilité, dans un contrat et sous une responsabilité distincts. En présence d'un symptôme aigu ou inquiétant, le client doit recourir aux services de soins appropriés."],
  ["10. Pulse, compte et services numériques",
    "Lorsqu'un accès Pulse est inclus, le devis précise les fonctionnalités, la durée d'accès, les restrictions et les éventuels frais d'abonnement ultérieurs. La création d'un compte n'entraîne pas à elle seule une souscription payante. L'accès est personnel. Des indisponibilités techniques ponctuelles peuvent survenir ; elles sont traitées sans supprimer les droits impératifs du consommateur."],
  ["11. Données personnelles et confidentialité",
    "Les données personnelles sont traitées conformément à la politique de confidentialité accessible depuis le site. Les données de santé ou assimilées requièrent une information spécifique, des bases légales appropriées et les mesures de sécurité applicables. Les demandes médicales sensibles ne doivent pas être envoyées au formulaire commercial public. Le client conserve l'exercice de ses droits conformément au RGPD."],
  ["12. Responsabilité",
    "KŌMØ répond de la bonne exécution des obligations contractuelles conformément au droit applicable. Les caractéristiques et limites des mesures sont présentées avant leur réalisation. Les clauses des présentes conditions n'ont pas pour effet d'exclure les garanties légales ni de limiter les droits impératifs des consommateurs."],
  ["13. Réclamations et médiation",
    "Pour toute réclamation, le client peut utiliser le formulaire de contact du site ou les coordonnées de réclamation qui doivent être renseignées avant la première vente : "+PENDING+". Après démarche écrite préalable et en cas de différend non résolu, le consommateur peut recourir gratuitement à un médiateur de la consommation compétent. Nom du médiateur, adresse et site internet : "+PENDING+". Aucun médiateur n'est désigné ici sans convention d'adhésion vérifiée."],
  ["14. Droit applicable et règlement des litiges",
    "Les présentes conditions sont soumises au droit français dans le respect des règles impératives protégeant le consommateur, notamment lorsqu'il réside dans un autre État. Les litiges sont portés devant les juridictions compétentes selon les règles légales, sans clause attributive abusive. Les éventuelles prestations conclues hors établissement ou hors du territoire français nécessitent une information contractuelle adaptée."],
  ["15. Entrée en vigueur et conservation",
    "Version de préparation : 11 octobre 2026. Cette page doit être validée et actualisée avec les informations légales manquantes avant l'ouverture de commandes payantes. Une copie durable des conditions effectivement acceptées sera remise au client avec la confirmation contractuelle."]
];
const legalPage = layout("Conditions générales de vente — particuliers","Conditions générales de vente des évaluations fonctionnelles non médicales KŌMØ Longevity.",[
  "<div class='wrap legal'><p class='ey'>INFORMATIONS CONTRACTUELLES</p><h1>Conditions générales de vente</h1>",
  "<p class='lead'>Prestations fonctionnelles proposées aux particuliers.</p>",
  "<p class='note'><strong>Version de préparation — non encore opposable.</strong> Le siège est renseigné, mais les informations juridiques d'immatriculation, les coordonnées de contact et le médiateur agréé restent à compléter. Aucun paiement ne doit être ouvert avant cette validation.</p>",
  legalSections.map(([h,p])=>"<section><h2>"+h+"</h2><p>"+p+"</p></section>").join(""),
  "<p><a class='pill' href='/fr/contact/'>Contacter KŌMØ</a> <a class='pill' href='/fr/cgv-pro/'>CGV professionnels</a></p></div>"
].join(""));
const proLegalSections = [
  ["1. Identité des parties","Le fournisseur est l'entité exploitant KŌMØ Longevity, sise "+ADDRESS+". Dénomination sociale, SIREN, capital, TVA, contacts et forme juridique : "+PENDING+". Les parties sont identifiées dans le devis et/ou le bon de commande."],
  ["2. Objet","Ces conditions concernent exclusivement des ventes ou locations professionnelles de KŌMØ Motion Case, prestations de formation, déploiement de protocole fonctionnel et licences Pulse Pro. Elles ne concernent pas les consommateurs ; les conditions particulières signées et les spécifications contractuelles prévalent en cas de contradiction."],
  ["3. Offre et contenu","Les matériels annoncés (notamment plateformes de force, dynamométrie, capture du mouvement, tablette et accessoires) sont indicatifs avant commande. Seuls le modèle exact, les quantités, licences constructeur, accessoires et prestations figurant dans la proposition acceptée engagent le vendeur. Aucune certification médicale, marquage réglementaire ou fonction diagnostique non documentée n'est alléguée."],
  ["4. Prix et règlement","Les prix professionnels sont établis sur devis en euros HT, TVA en sus le cas échéant. L'échéancier, les acomptes, les conditions de livraison, les taxes et les frais de transport sont précisés avant commande. Les pénalités de retard, l'indemnité forfaitaire pour frais de recouvrement et les éventuelles garanties doivent être chiffrées conformément au droit applicable dans la version contractuelle définitive : "+PENDING+"."],
  ["5. Livraison et réception","Les délais, lieu de livraison, conditions de transfert des risques, procédure de réception, disponibilité des pièces et éventuels frais de retour sont définis dans le bon de commande ou contrat de location. Tout retard ou réserve est traité conformément aux dispositions applicables et aux stipulations écrites acceptées."],
  ["6. Location et maintenance","Si la Case est louée, le contrat particulier détermine durée, loyer, dépôt de garantie éventuel, état contradictoire, assurance, consommables, maintenance, perte, casse et restitution. Aucun transfert de propriété n'est opéré par la seule location."],
  ["7. Pulse Pro et propriété intellectuelle","La vente du matériel n'emporte aucun transfert de propriété des logiciels, algorithmes, marques ou méthodes KŌMØ. La licence Pulse Pro fait l'objet de conditions séparées précisant utilisateurs, durée, prix, fonctions, support, traitement de données et réversibilité."],
  ["8. Formation et responsabilité de l'opérateur","La formation prépare à l'usage du matériel selon son mode d'emploi et le protocole autorisé. Le client professionnel demeure responsable de ses autorisations d'exercice, compétences, assurances, locaux, sécurité des tests, information des personnes évaluées et respect du cadre réglementaire applicable."],
  ["9. Garanties, conformité et litiges","Les garanties commerciales éventuelles sont décrites dans l'offre et s'ajoutent aux garanties légales obligatoires. Les responsabilités, plafonds éventuellement licites, droit applicable et juridiction compétente seront stipulés dans le contrat professionnel final sans masquer une obligation essentielle. Version de préparation du 11 octobre 2026 : ne pas signer ni encaisser en l'état."]
];
const proLegalPage = layout("Conditions générales — professionnels","Conditions précontractuelles B2B : vente ou location Motion Case, formation et licence Pulse Pro.",[
  "<div class='wrap legal'><p class='ey'>KŌMØ PRO</p><h1>Conditions générales B2B</h1><p class='lead'>Équipement, déploiement, formation et logiciels.</p>",
  "<p class='note'><strong>Version à finaliser.</strong> Les CGV professionnelles ne deviennent contractuelles qu'après identification du vendeur, chiffrage exact, définition des garanties et acceptation du devis/contrat.</p>",
  proLegalSections.map(([h,p])=>"<section><h2>"+h+"</h2><p>"+p+"</p></section>").join(""),
  "<p><a class='pill dark' href='/fr/contact/'>Demander une proposition</a></p></div>"
].join(""));
async function write(relative, html) {
  const target = join(SITE, relative);
  await mkdir(dirname(target),{recursive:true});
  await writeFile(target, html, "utf8");
}
const stripCSS = [
  "#komo-commerce-footer{border-top:1px solid #d7ded8;background:#f8f7f3;color:#213c2e;padding:27px 22px;font:12px/1.8 Arial,sans-serif}",
  "#komo-commerce-footer .cmf-wrap{max-width:1160px;margin:auto}#komo-commerce-footer .cmf-links{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px}",
  "#komo-commerce-footer a{color:inherit;text-decoration:underline;text-underline-offset:3px}"
].join("");
const strip = "<div id='komo-commerce-footer'><div class='cmf-wrap'><strong>KŌMØ Longevity</strong> · "+ADDRESS+
  "<div class='cmf-links'>"+footLinks()+"</div><p>Les bilans Motion sont des évaluations fonctionnelles non médicales. Informations tarifaires à confirmer par devis.</p></div></div>";
async function patchHome(relative) {
  const fp = join(SITE,relative);
  try { await access(fp); } catch { return; }
  let html = await readFile(fp,"utf8");
  if(html.includes("komo-commerce-footer")) return;
  const isFrench = relative === "index.html" || relative === "fr/index.html";
  if(!isFrench) return;
  const embedded = offerSection()+methodSection()+proSection();
  // Replace the former generic offer carousel rather than duplicating it.
  const genericOffers = /<section class="kt-z-section" id="komo-offers">[\s\S]*?(?=<section class="kt-z-section kt-z-section--sand">)/;
  if(genericOffers.test(html)){
    html = html.replace(genericOffers, "<div id='komo-commerce-offers' class='cm'>"+embedded+"</div>");
  } else if(html.includes("</main>")) {
    html = html.replace("</main>","<div id='komo-commerce-offers' class='cm'>"+embedded+"</div></main>");
  }
  // Link the first hero discovery action to the commercial selection page.
  html = html.replace(/(<a class="kt-btn kt-btn--light" href=")\/fr\/(?:signature|motion|offers)\/("[^>]*>)/,"$1/fr/check-ups/$2");
  html = html.replace("</head>","<style id='komo-commerce-v1-style'>"+CSS+stripCSS+"</style></head>");
  html = html.replace("</body>",strip+"</body>");
  await writeFile(fp,html,"utf8");
}
await write("fr/check-ups/index.html",offersPage);
for(const offer of cards) await write("fr/check-ups/"+offer.slug+"/index.html",detailPage(offer));
await write("fr/motion-case/index.html",proPage);
await write("fr/cgv/index.html",legalPage);
await write("fr/cgv-pro/index.html",proLegalPage);
await patchHome("index.html");
await patchHome("fr/index.html");
const sitemapPath=join(SITE,"sitemap.xml");
try{
  let xml=await readFile(sitemapPath,"utf8");
  for(const path of ["/fr/check-ups/","/fr/check-ups/motion/","/fr/check-ups/phenotype/","/fr/check-ups/complete/","/fr/check-ups/private/","/fr/motion-case/","/fr/cgv/","/fr/cgv-pro/"]){
    if(!xml.includes(BASE+path)) xml=xml.replace("</urlset>","<url><loc>"+BASE+path+"</loc></url></urlset>");
  }
  await writeFile(sitemapPath,xml,"utf8");
}catch{}
console.log("[komo-offers-zoi-2026] PASS: commercial offerings, professional Case, B2C+B2B terms, French footer.");
