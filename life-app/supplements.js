const FORMULA_GROUPS = [
  {
    id: 'llp',
    label: { en: 'Targeted Formulas', fr: 'Formules ciblées' },
    kicker: { en: '6 formulas', fr: '6 formules' },
    intro: {
      en: 'Movement · Recovery · Connective tissue · Neuromuscular function',
      fr: 'Mouvement · Récupération · Tissus conjonctifs · Fonction neuromusculaire'
    },
    items: [
      { code:'SAMPLE 01', name:'Motion Formula', price:'€68 / month', priceFr:'68 € / mois', focus:{en:'Joint mobility · Spinal disc · Lubrication',fr:'Mobilité articulaire · Disque spinal · Lubrification'}, formula:'UC-II® 40 mg · Boswellia 30% AKBA 200 mg · Hyaluronic Acid 120 mg · Glucosamine Sulfate 500 mg · Vitamin C 200 mg · Manganese 2 mg', use:{en:'60 capsules · 2 capsules / morning — fasting',fr:'60 gélules · 2 gélules le matin — à jeun'} },
      { code:'SAMPLE 02', name:'Recovery Elixir', price:'€62 / month', priceFr:'62 € / mois', focus:{en:'Muscle recovery · Sleep · Stress resilience',fr:'Récupération musculaire · Sommeil · Résilience au stress'}, formula:'Magnesium Bisglycinate 1,540 mg · KSM-66® 300 mg · Vitamin D3 2,000 IU · Vitamin K2 MK-7 150 mcg · L-Glutamine 500 mg · Glycine 300 mg', use:{en:'90 capsules · 3 capsules / evening — before bed',fr:'90 gélules · 3 gélules le soir — avant le coucher'} },
      { code:'SAMPLE 03', name:'Fascia Essence', price:'€58 / month', priceFr:'58 € / mois', focus:{en:'Connective tissue · Fascial elasticity · Structural collagen',fr:'Tissu conjonctif · Élasticité fasciale · Collagène structurel'}, formula:'OptiMSM® 1,500 mg · Vitamin C 400 mg · Bamboo Silica 40 mg · Zinc Bisglycinate 15 mg · Copper 1 mg · L-Proline 500 mg', use:{en:'90 capsules · 3 capsules / day — with a meal',fr:'90 gélules · 3 gélules / jour — avec un repas'} },
      { code:'SAMPLE 04', name:'Tensegrity Ritual', price:'€72 / month', priceFr:'72 € / mois', focus:{en:'Global tone · Mitochondria · Nervous balance',fr:'Tonus global · Mitochondries · Équilibre nerveux'}, formula:'KSM-66® 300 mg · Rhodiola SHR-5 200 mg · CoQ10 Ubiquinol 100 mg · Vitamin B6 P5P 25 mg · Methylcobalamin 500 mcg · 5-MTHF Folate 400 mcg', use:{en:'90 capsules · 3 capsules / morning — with a meal',fr:'90 gélules · 3 gélules le matin — avec un repas'} },
      { code:'SAMPLE 05', name:'Axis Restore', price:'€78 / month', priceFr:'78 € / mois', focus:{en:'Spinal support · Neuroprotection · Recovery context',fr:'Soutien spinal · Neuroprotection · Contexte de récupération'}, formula:'Omega-3 EPA 1,000 mg + DHA 600 mg (TG, IFOS) · BCM-95® Curcumin 500 mg · R-ALA 300 mg · Vitamin D3 1,000 IU · BioPerine® 5 mg', use:{en:'90 softgels · 3 softgels / day — with a fatty meal',fr:'90 capsules molles · 3 / jour — avec un repas contenant des lipides'} },
      { code:'SAMPLE 06', name:'Ground Formula', price:'€65 / month', priceFr:'65 € / mois', focus:{en:'Proprioception · Neuromuscular connection · Postural stability',fr:'Proprioception · Connexion neuromusculaire · Stabilité posturale'}, formula:'Magtein® 2,000 mg · Lion\'s Mane 8:1 500 mg · Phosphatidylserine 200 mg · Thiamine B1 50 mg · Vitamin B6 P5P 20 mg · Methylcobalamin B12 250 mcg', use:{en:'120 capsules · 4 capsules / day — AM (2) + PM (2)',fr:'120 gélules · 4 / jour — matin (2) + soir (2)'} }
    ]
  },
  {
    id: 'basics',
    label: { en: 'Essentials', fr: 'Essentiels' },
    kicker: { en: '10 daily essentials', fr: '10 essentiels quotidiens' },
    intro: {
      en: 'Micronutrients · Omega-3 · Creatine · Collagen · Sleep · Microbiome',
      fr: 'Micronutriments · Oméga-3 · Créatine · Collagène · Sommeil · Microbiote'
    },
    items: [
      { code:'BASIC 01', name:'Daily Foundation', price:'€38 / month', priceFr:'38 € / mois', focus:{en:'45 bioactive micronutrients',fr:'45 micronutriments bioactifs'}, formula:'Methylfolate · Methylcobalamin · P5P · Natural fat-soluble vitamins · Chelated minerals', use:{en:'2 capsules / day — with a meal',fr:'2 gélules / jour — avec un repas'} },
      { code:'BASIC 02', name:'D3 + K2', price:'~€11 / month', priceFr:'~11 € / mois', focus:{en:'Vitamin D3 + K2 MK-7',fr:'Vitamine D3 + K2 MK-7'}, formula:'Vitamin D3 Cholecalciferol 5,000 IU · Vitamin K2 MK-7 200 mcg', use:{en:'1 capsule / day — with a fatty meal',fr:'1 gélule / jour — avec un repas contenant des lipides'} },
      { code:'BASIC 03', name:'Pure Magnesium', price:'€30 / month', priceFr:'30 € / mois', focus:{en:'Magnesium bisglycinate',fr:'Magnésium bisglycinate'}, formula:'Magnesium Bisglycinate 300 mg elemental', use:{en:'2 capsules / evening',fr:'2 gélules le soir'} },
      { code:'BASIC 04', name:'Pure Omega-3', price:'€42 / month', priceFr:'42 € / mois', focus:{en:'EPA + DHA · triglyceride form',fr:'EPA + DHA · forme triglycéride'}, formula:'EPA 800 mg + DHA 800 mg · IFOS certified', use:{en:'2 softgels / day — with a meal',fr:'2 capsules molles / jour — avec un repas'} },
      { code:'BASIC 05', name:'Creatine', price:'~€11 / month', priceFr:'~11 € / mois', focus:{en:'Creatine monohydrate',fr:'Créatine monohydrate'}, formula:'Creatine Monohydrate Creapure® 3 g', use:{en:'Neutral powder · 1 serving / day',fr:'Poudre neutre · 1 portion / jour'} },
      { code:'BASIC 06', name:'Vitamin C', price:'~€9 / month', priceFr:'~9 € / mois', focus:{en:'Vitamin C · collagen cofactor',fr:'Vitamine C · cofacteur du collagène'}, formula:'Ascorbic Acid + Buffered Sodium Ascorbate 1,000 mg', use:{en:'1 capsule / day',fr:'1 gélule / jour'} },
      { code:'BASIC 07', name:'Sleep Formula', price:'€54 / month', priceFr:'54 € / mois', focus:{en:'Sleep onset · Deep sleep quality',fr:'Endormissement · Qualité du sommeil profond'}, formula:'Magtein® Magnesium L-Threonate 1,000 mg · L-Theanine 200 mg · Apigenin 50 mg', use:{en:'3 capsules — 30 min before bed',fr:'3 gélules — 30 min avant le coucher'} },
      { code:'BASIC 08', name:'Collagen', price:'€46 / month', priceFr:'46 € / mois', focus:{en:'Discs · Ligaments · Tendons · Skin',fr:'Disques · Ligaments · Tendons · Peau'}, formula:'Hydrolysed Collagen Peptides 5,000 mg · Vitamin C 200 mg', use:{en:'Neutral powder · 1 scoop / day',fr:'Poudre neutre · 1 mesure / jour'} },
      { code:'BASIC 09', name:'Probiotic', price:'€40 / month', priceFr:'40 € / mois', focus:{en:'Gut microbiome · Intestinal support',fr:'Microbiote intestinal · Soutien digestif'}, formula:'Lactobacillus rhamnosus GG + L. reuteri DSM 17938 + Bifidobacterium longum · 10 billion CFU', use:{en:'1 capsule / day — fasting',fr:'1 gélule / jour — à jeun'} },
      { code:'BASIC 10', name:'Zinc + Copper', price:'~€7 / month', priceFr:'~7 € / mois', focus:{en:'Zinc + copper · two-ingredient formula',fr:'Zinc + cuivre · formule à deux ingrédients'}, formula:'Zinc Bisglycinate 25 mg · Copper Bisglycinate 1 mg', use:{en:'1 capsule / day — evening with a meal',fr:'1 gélule / jour — le soir avec un repas'} }
    ]
  },
  {
    id: 'clinical',
    label: { en: 'Professional Packs', fr: 'Packs professionnels' },
    kicker: { en: '5 clinician-led packs', fr: '5 packs encadrés' },
    intro: {
      en: 'Structured combinations available after professional review.',
      fr: 'Associations structurées disponibles après évaluation professionnelle.'
    },
    clinical: true,
    items: [
      { code:'PROTOCOL 01', name:'Chronic Low Back Pain', price:'€146 / month', priceFr:'146 € / mois', focus:{en:'Sample 01 + Sample 02 + Basic 04',fr:'Sample 01 + Sample 02 + Basic 04'}, formula:'90 days recommended · 3 products', use:{en:'Professional review before use',fr:'Évaluation professionnelle avant utilisation'} },
      { code:'PROTOCOL 02', name:'Degenerative Disc Disease', price:'€169 / month', priceFr:'169 € / mois', focus:{en:'Sample 01 + Sample 05 + Basic 02 + Basic 04',fr:'Sample 01 + Sample 05 + Basic 02 + Basic 04'}, formula:'90 days minimum · 4 products', use:{en:'Professional review before use',fr:'Évaluation professionnelle avant utilisation'} },
      { code:'PROTOCOL 03', name:'Disc Herniation / Sciatica', price:'€210 / month', priceFr:'210 € / mois', focus:{en:'Sample 05 + Sample 06 + Sample 02 + Basic 04',fr:'Sample 05 + Sample 06 + Sample 02 + Basic 04'}, formula:'90 days recommended · 4 products', use:{en:'Professional review before use',fr:'Évaluation professionnelle avant utilisation'} },
      { code:'PROTOCOL 04', name:'Pre-Operative', price:'€179 / month', priceFr:'179 € / mois', focus:{en:'Sample 02 + Sample 03 + Basic 01 + Basic 02 + Basic 04',fr:'Sample 02 + Sample 03 + Basic 01 + Basic 02 + Basic 04'}, formula:'4–6 weeks before surgery · 5 products', use:{en:'Professional review required; peri-operative medication and supplement reconciliation is essential',fr:'Évaluation professionnelle requise ; la conciliation péri-opératoire des médicaments et compléments est indispensable'} },
      { code:'PROTOCOL 05', name:'Post-Operative', price:'€255 / month', priceFr:'255 € / mois', focus:{en:'Sample 05 + Sample 06 + Sample 03 + Basic 02 + Basic 04 + Basic 08',fr:'Sample 05 + Sample 06 + Sample 03 + Basic 02 + Basic 04 + Basic 08'}, formula:'90 days minimum · 6 products', use:{en:'Professional review before use',fr:'Évaluation professionnelle avant utilisation'} }
    ]
  }
];


const UTILITY_COPY = {
  'SAMPLE 01': {
    why:{en:'Built for the mobility axis: a compact formula when joint comfort and movement quality are the priority.',fr:'Pensée pour l’axe mobilité : une formule compacte lorsque le confort articulaire et la qualité du mouvement sont prioritaires.'},
    when:{en:'Best positioned after a movement assessment identifies mobility as a practical priority.',fr:'À positionner lorsque le bilan de mouvement identifie la mobilité comme priorité pratique.'}
  },
  'SAMPLE 02': {
    why:{en:'A recovery layer for people whose training, travel or workload leaves recovery behind performance.',fr:'Une couche de récupération lorsque l’entraînement, les voyages ou la charge de travail dépassent les capacités de récupération.'},
    when:{en:'Useful when sleep, recovery or perceived fatigue is the limiting part of the trajectory.',fr:'Pertinente lorsque le sommeil, la récupération ou la fatigue perçue limitent la trajectoire.'}
  },
  'SAMPLE 03': {
    why:{en:'Designed around connective-tissue support rather than energy or stimulation.',fr:'Conçue autour du soutien des tissus conjonctifs, plutôt que de l’énergie ou de la stimulation.'},
    when:{en:'Fits a trajectory focused on tissue resilience, loading tolerance and long-term movement quality.',fr:'S’intègre à une trajectoire centrée sur la résilience tissulaire, la tolérance à la charge et la qualité du mouvement à long terme.'}
  },
  'SAMPLE 04': {
    why:{en:'A broader resilience formula for people who need a systemic layer rather than a single-joint solution.',fr:'Une formule de résilience plus globale pour les personnes qui ont besoin d’un soutien systémique plutôt que d’une réponse centrée sur une seule articulation.'},
    when:{en:'Considered when energy, stress load and global tone are more relevant than one isolated locomotor domain.',fr:'À envisager lorsque l’énergie, la charge de stress et le tonus global comptent davantage qu’un domaine locomoteur isolé.'}
  },
  'SAMPLE 05': {
    why:{en:'A higher-intensity locomotor support layer combining omega-3 and antioxidant-oriented ingredients.',fr:'Une couche de soutien locomoteur plus intensive associant oméga-3 et ingrédients à orientation antioxydante.'},
    when:{en:'Reserved for trajectories where a clinician considers a broader recovery context relevant.',fr:'Réservée aux trajectoires où un professionnel juge pertinent un contexte de récupération plus large.'}
  },
  'SAMPLE 06': {
    why:{en:'Built around the neuromuscular axis: coordination, proprioception and the nervous-system side of movement.',fr:'Construite autour de l’axe neuromusculaire : coordination, proprioception et composante nerveuse du mouvement.'},
    when:{en:'Relevant when balance, coordination or movement confidence is a greater priority than pure strength.',fr:'Pertinente lorsque l’équilibre, la coordination ou la confiance dans le mouvement priment sur la force pure.'}
  },
  'BASIC 01': {
    why:{en:'A simple baseline for people who want one daily micronutrient foundation instead of multiple overlapping products.',fr:'Une base simple pour ceux qui souhaitent un socle micronutritionnel quotidien plutôt qu’une accumulation de produits redondants.'},
    when:{en:'The starting point when the objective is nutritional coverage, not a targeted locomotor intervention.',fr:'Le point de départ lorsque l’objectif est la couverture nutritionnelle, et non une intervention locomotrice ciblée.'}
  },
  'BASIC 02': {
    why:{en:'A focused D3 + K2 option when vitamin D status is part of the plan.',fr:'Une option ciblée D3 + K2 lorsque le statut en vitamine D fait partie de la stratégie.'},
    when:{en:'Ideally guided by context and, when appropriate, biological measurement rather than automatic year-round use.',fr:'Idéalement guidée par le contexte et, lorsque pertinent, par une mesure biologique plutôt que par une prise automatique toute l’année.'}
  },
  'BASIC 03': {
    why:{en:'A single-purpose magnesium option for people who do not need a multi-ingredient recovery blend.',fr:'Une option magnésium simple pour ceux qui n’ont pas besoin d’un mélange de récupération multi-ingrédients.'},
    when:{en:'Useful when simplicity, evening routine and magnesium intake are the actual priority.',fr:'Utile lorsque la simplicité, la routine du soir et l’apport en magnésium sont la véritable priorité.'}
  },
  'BASIC 04': {
    why:{en:'A clean omega-3 foundation designed to make EPA/DHA intake explicit and measurable.',fr:'Une base oméga-3 claire pour rendre l’apport en EPA/DHA explicite et quantifiable.'},
    when:{en:'Fits when dietary intake is low or when omega-3 is deliberately included in a broader plan.',fr:'S’intègre lorsque l’apport alimentaire est faible ou lorsque les oméga-3 sont volontairement intégrés à une stratégie plus large.'}
  },
  'BASIC 05': {
    why:{en:'One of the most pragmatic performance-and-ageing basics: simple, inexpensive and easy to track.',fr:'Un des essentiels les plus pragmatiques pour la performance et le vieillissement : simple, économique et facile à suivre.'},
    when:{en:'Useful when strength, training capacity or preservation of lean function is part of the objective.',fr:'Utile lorsque la force, la capacité d’entraînement ou la préservation de la fonction maigre font partie de l’objectif.'}
  },
  'BASIC 06': {
    why:{en:'A straightforward vitamin C option, kept separate so it can be used only when the plan actually calls for it.',fr:'Une option vitamine C volontairement simple, séparée pour n’être utilisée que lorsque la stratégie le justifie.'},
    when:{en:'Most coherent when dietary intake or a connective-tissue plan makes it relevant.',fr:'Plus cohérente lorsque l’alimentation ou une stratégie orientée tissus conjonctifs la rendent pertinente.'}
  },
  'BASIC 07': {
    why:{en:'A dedicated evening formula for people whose main bottleneck is sleep rather than daytime energy.',fr:'Une formule du soir dédiée lorsque le principal facteur limitant est le sommeil plutôt que l’énergie diurne.'},
    when:{en:'Use only when sleep is an identified priority; sleep hygiene and medical causes still come first.',fr:'À utiliser seulement lorsque le sommeil est une priorité identifiée ; l’hygiène de sommeil et les causes médicales restent prioritaires.'}
  },
  'BASIC 08': {
    why:{en:'A practical collagen layer for people whose plan includes tendon, ligament, skin or connective-tissue support.',fr:'Une couche collagène pratique lorsque la stratégie inclut tendons, ligaments, peau ou tissus conjonctifs.'},
    when:{en:'Most useful when paired with a clear loading, nutrition or recovery objective rather than taken in isolation.',fr:'Plus utile lorsqu’elle accompagne un objectif clair de charge, nutrition ou récupération plutôt qu’en prise isolée.'}
  },
  'BASIC 09': {
    why:{en:'A microbiome-oriented option kept distinct from the locomotor formulas.',fr:'Une option orientée microbiote, volontairement séparée des formules locomotrices.'},
    when:{en:'Relevant only when digestive context or a specific professional recommendation makes it useful.',fr:'Pertinente uniquement lorsque le contexte digestif ou une recommandation professionnelle spécifique le justifie.'}
  },
  'BASIC 10': {
    why:{en:'A narrow zinc-and-copper formula designed to avoid turning a targeted mineral need into a large multinutrient stack.',fr:'Une formule zinc-cuivre ciblée pour éviter de transformer un besoin minéral précis en empilement de micronutriments.'},
    when:{en:'Best used when there is a reason to target these minerals, not as a universal add-on.',fr:'À utiliser lorsqu’il existe une raison de cibler ces minéraux, et non comme ajout systématique.'}
  },
  'PROTOCOL 01': {
    why:{en:'A clinician-curated combination intended to organise several support layers into one coherent plan.',fr:'Une association structurée par un professionnel afin d’organiser plusieurs couches de soutien dans un plan cohérent.'},
    when:{en:'Only after clinical review; it is a pathway template, not a diagnosis-driven self-treatment pack.',fr:'Uniquement après évaluation clinique ; il s’agit d’un cadre de parcours, pas d’un pack d’auto-traitement fondé sur un diagnostic.'}
  },
  'PROTOCOL 02': {
    why:{en:'A structured professional pathway combining mobility-focused and foundational products.',fr:'Un parcours professionnel structuré associant produits orientés mobilité et socle nutritionnel.'},
    when:{en:'Used only when the clinician considers the full combination appropriate to the person and their treatments.',fr:'Utilisé uniquement lorsque le professionnel juge l’association adaptée à la personne et à ses traitements.'}
  },
  'PROTOCOL 03': {
    why:{en:'A professional recovery-and-neuromuscular combination rather than a single-product solution.',fr:'Une association professionnelle orientée récupération et axe neuromusculaire plutôt qu’une solution monoproduit.'},
    when:{en:'Requires individual review, particularly for medication, neurological symptoms and clinical red flags.',fr:'Nécessite une évaluation individuelle, notamment des traitements, symptômes neurologiques et signes d’alerte clinique.'}
  },
  'PROTOCOL 04': {
    why:{en:'A peri-operative preparation framework designed to make supplement use explicit before surgery.',fr:'Un cadre de préparation péri-opératoire conçu pour rendre l’usage des compléments explicite avant une chirurgie.'},
    when:{en:'Must be reconciled with the surgical and anaesthetic plan; some supplements may need to be stopped before surgery.',fr:'Doit être concilié avec le plan chirurgical et anesthésique ; certains compléments peuvent devoir être interrompus avant l’intervention.'}
  },
  'PROTOCOL 05': {
    why:{en:'A post-operative support framework intended to sit around rehabilitation, nutrition and medical follow-up — never replace them.',fr:'Un cadre de soutien post-opératoire destiné à accompagner la rééducation, la nutrition et le suivi médical — jamais à les remplacer.'},
    when:{en:'Only after the operating team has confirmed that the combination is appropriate.',fr:'Uniquement après validation de l’association par l’équipe en charge de l’intervention.'}
  }
};

const PROCESS_STEPS = [
  {n:'01',en:['Measure','Start with the person: movement, symptoms, habits and, when relevant, biological context.'],fr:['Mesurer','Partir de la personne : mouvement, symptômes, habitudes et, lorsque pertinent, contexte biologique.']},
  {n:'02',en:['Prioritise','Identify the limiting domain instead of adding supplements by habit.'],fr:['Prioriser','Identifier le domaine réellement limitant au lieu d’ajouter des compléments par habitude.']},
  {n:'03',en:['Support','Choose the smallest useful layer: foundation, targeted formula or clinician-led protocol.'],fr:['Soutenir','Choisir la couche utile la plus simple : base, formule ciblée ou protocole encadré.']},
  {n:'04',en:['Reassess','Track tolerance, adherence and the functional objective; keep only what remains useful.'],fr:['Réévaluer','Suivre tolérance, adhésion et objectif fonctionnel ; ne conserver que ce qui reste utile.']}
];

const root = document.documentElement;
const mount = document.querySelector('[data-formula-catalog]');
let activeGroup = 'llp';

function esc(value=''){
  return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character]));
}

function lang(){ return root.dataset.lang === 'fr' ? 'fr' : 'en'; }

function productCard(item, clinical){
  const l = lang();
  const price = l === 'fr' ? item.priceFr : item.price;
  const focus = item.focus[l];
  const action = clinical
    ? (l === 'fr' ? 'PRENDRE RENDEZ-VOUS' : 'BOOK A REVIEW')
    : (l === 'fr' ? 'COMMANDER' : 'ORDER');
  const subject = encodeURIComponent(`KŌMØ Life — ${item.code} — ${item.name}`);
  return `
    <article class="formula-card${clinical ? ' formula-card-clinical' : ''}">
      <div class="formula-card-top">
        <span class="formula-code">${esc(item.code)}</span>
        <span class="formula-price">${esc(price)}</span>
      </div>
      <div class="formula-mark" aria-hidden="true"><span></span><b>${esc(item.code.split(' ').pop())}</b></div>
      <h3>${esc(item.name)}</h3>
      <p class="formula-focus">${esc(focus)}</p>
      <a class="formula-buy" href="mailto:contact@komolongevity.com?subject=${subject}">${action}</a>
      <details>
        <summary>${l === 'fr' ? 'DÉTAILS' : 'DETAILS'}</summary>
        <div class="formula-detail">
          <span class="formula-detail-label">${l === 'fr' ? 'Composition' : 'Formula'}</span>
          <p>${esc(item.formula)}</p>
          <span class="formula-detail-label">${l === 'fr' ? 'Format' : 'Format'}</span>
          <p class="formula-use">${esc(item.use[l])}</p>
        </div>
      </details>
    </article>`;
}

function render(){
  if(!mount) return;
  const l = lang();
  const group = FORMULA_GROUPS.find(entry => entry.id === activeGroup) || FORMULA_GROUPS[0];
  mount.innerHTML = `
    <div class="formula-shop-head">
      <p>${l === 'fr' ? 'ACHETER PAR CATÉGORIE' : 'SHOP BY CATEGORY'}</p>
      <span>${l === 'fr' ? 'Prix mensuels indicatifs · détails disponibles sur chaque produit' : 'Indicative monthly pricing · details available on each product'}</span>
    </div>
    <div class="formula-tabs" role="tablist" aria-label="${l === 'fr' ? 'Catégories de compléments' : 'Supplement categories'}">
      ${FORMULA_GROUPS.map(entry => `<button type="button" class="${entry.id === activeGroup ? 'is-active' : ''}" data-formula-group="${entry.id}" role="tab" aria-selected="${entry.id === activeGroup}">${esc(entry.label[l])}</button>`).join('')}
    </div>
    <div class="formula-group-intro">
      <p>${esc(group.kicker[l])}</p>
      <h3>${esc(group.label[l])}</h3>
      <span>${esc(group.intro[l])}</span>
    </div>
    <div class="formula-grid">
      ${group.items.map(item => productCard(item, group.clinical)).join('')}
    </div>
    <div class="formula-legal">
      <strong>${l === 'fr' ? 'INFORMATION' : 'INFORMATION'}</strong>
      <p>${l === 'fr'
        ? 'Compléments alimentaires. Ne remplacent ni une alimentation équilibrée ni un suivi médical. Les packs professionnels nécessitent une évaluation préalable et une vérification des traitements, antécédents et contre-indications.'
        : 'Food supplements. Not a substitute for a balanced diet or medical care. Professional packs require prior review of medications, medical history and contraindications.'}</p>
    </div>`;
  mount.querySelectorAll('[data-formula-group]').forEach(button => {
    button.addEventListener('click', () => {
      activeGroup = button.dataset.formulaGroup;
      render();
    });
  });
}

render();
new MutationObserver(mutations => {
  if(mutations.some(mutation => mutation.attributeName === 'data-lang')) render();
}).observe(root, {attributes:true});
