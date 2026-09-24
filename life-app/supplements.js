const FORMULA_GROUPS = [
  {
    id: 'llp',
    label: { en: 'LLP™ Samples', fr: 'Samples LLP™' },
    kicker: { en: '6 proprietary formulas', fr: '6 formules propriétaires' },
    intro: {
      en: 'The locomotor core of the range — six formulas developed around movement, recovery, connective tissue and neuromuscular function.',
      fr: 'Le cœur locomoteur de la gamme — six formules développées autour du mouvement, de la récupération, des tissus conjonctifs et de la fonction neuromusculaire.'
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
    label: { en: 'The Basics', fr: 'Les essentiels' },
    kicker: { en: '10 universal formulas', fr: '10 formules universelles' },
    intro: {
      en: 'A restrained daily layer: micronutrients, omega-3, creatine, collagen, sleep and microbiome support.',
      fr: 'Une base quotidienne volontairement simple : micronutriments, oméga-3, créatine, collagène, sommeil et microbiote.'
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
    label: { en: 'Clinical Protocols', fr: 'Protocoles cliniques' },
    kicker: { en: '5 professional packs', fr: '5 packs professionnels' },
    intro: {
      en: 'Curated combinations from the catalogue, shown inside Life as a professional pathway rather than an open self-prescription layer.',
      fr: 'Des associations issues du catalogue, présentées dans Life comme un parcours professionnel et non comme une couche d’auto-prescription.'
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
  return `
    <article class="formula-card${clinical ? ' formula-card-clinical' : ''}">
      <div class="formula-card-top">
        <span class="formula-code">${esc(item.code)}</span>
        <span class="formula-price">${esc(price)}</span>
      </div>
      <div class="formula-mark" aria-hidden="true"><span></span><b>${esc(item.code.split(' ').pop())}</b></div>
      <h3>${esc(item.name)}</h3>
      <p class="formula-focus">${esc(focus)}</p>
      <details>
        <summary>${l === 'fr' ? 'Voir les détails' : 'View details'}</summary>
        <div class="formula-detail">
          <p>${esc(item.formula)}</p>
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
      <strong>${l === 'fr' ? 'Information importante' : 'Important information'}</strong>
      <p>${l === 'fr'
        ? 'Les informations ci-dessus reprennent le catalogue 2026. Les compléments alimentaires ne remplacent ni une alimentation équilibrée ni une prise en charge médicale. Les protocoles cliniques nécessitent une évaluation professionnelle et doivent être revus en fonction des traitements, antécédents, grossesse, fonction rénale/hépatique et contexte péri-opératoire.'
        : 'The information above reflects the 2026 catalogue. Food supplements do not replace a balanced diet or medical care. Clinical protocols require professional review and should be reconciled with medications, medical history, pregnancy, renal/hepatic function and peri-operative context.'}</p>
    </div>`;
  mount.querySelectorAll('[data-formula-group]').forEach(button => {
    button.addEventListener('click', () => {
      activeGroup = button.dataset.formulaGroup;
      render();
      document.getElementById('formulas')?.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
    });
  });
}

render();
new MutationObserver(mutations => {
  if(mutations.some(mutation => mutation.attributeName === 'data-lang')) render();
}).observe(root, {attributes:true});
