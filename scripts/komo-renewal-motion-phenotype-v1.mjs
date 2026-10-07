import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const site = join(root, 'site');
const encoded = join(root, 'src', 'assets', 'site2026', 'renewal');
const images = join(site, 'assets', 'images');

const assets = [
  ['motion-tiny.b64', 'komo-motion-closed-renewal.webp'],
  ['phenotype-tiny.b64', 'komo-phenotype-closed-renewal.webp'],
  ['two-cases-tiny.b64', 'komo-two-cases-renewal.webp']
];

await mkdir(images, { recursive: true });
for (const [source, target] of assets) {
  const b64 = (await readFile(join(encoded, source), 'utf8')).replace(/\s+/g, '');
  await writeFile(join(images, target), Buffer.from(b64, 'base64'));
}

const copy = {
  en: {
    metaTitle: 'KŌMØ Longevity — Motion · Phenotype · Pulse',
    metaDescription: 'KŌMØ is a portable personal longevity studio combining functional movement, phenotype assessment and longitudinal follow-up through Pulse.',
    nav: ['Motion','Phenotype','Method','Pulse','Professionals','Book'],
    heroEy: 'KŌMØ LONGEVITY · PERSONAL LONGEVITY STUDIO',
    heroTitle: 'Measure what shapes<br><em>how you age.</em>',
    heroLead: 'Two portable assessment cases. One personal longevity baseline. KŌMØ brings functional movement and phenotype measurement into a single longitudinal trajectory.',
    heroPrimary: 'Book a KŌMØ assessment', heroSecondary: 'For professionals',
    heroProof: ['MOTION · FUNCTION', 'PHENOTYPE · BIOLOGY', 'PULSE · TRAJECTORY'],
    twoEy: 'THE TWO KŌMØ CASES', twoTitle: 'Two cases.<br><em>One view of your longevity.</em>',
    twoLead: 'The body does not age in one dimension. KŌMØ separates what must be measured, then reconnects it into one readable baseline.',
    motionSub: 'How your body moves.',
    motionIntro: 'A portable functional assessment layer designed to objectify physical capacity rather than infer it from age alone.',
    motion: [
      ['Locomotion','Gait and functional movement'],
      ['Strength & power','Force-producing capacity and functional performance'],
      ['Balance','Postural stability and control'],
      ['Mobility','Functional range and movement capacity'],
      ['Symmetry','Right–left functional differences'],
      ['Performance','Integrated physical capacity']
    ],
    phenotypeSub: 'How your body presents today.',
    phenotypeIntro: 'A structured phenotype layer combining body composition, external phenotype and biological context when relevant.',
    phenotype: [
      ['Body composition','Muscle, fat, distribution and anthropometric phenotype'],
      ['Metabolic context','Clinical and biological context when available and indicated'],
      ['Skin health','Texture, hydration, pigmentation and visible ageing markers'],
      ['Hair & scalp','Density, scalp characteristics and hair phenotype'],
      ['Personalized care profile','Results translated into a structured individual care strategy']
    ],
    statementEy:'THE KŌMØ BASELINE',
    statement:'We don’t start with age.<br><em>We start with phenotype and function.</em>',
    flow:['Motion','Phenotype','Biology','Individual context','Personal longevity baseline'],
    methodEy:'THE KŌMØ METHOD', methodTitle:'Measure. Understand.<br><em>Act. Reassess.</em>',
    methodLead:'A baseline is useful only if it can guide action and be reproduced over time.',
    method:[
      ['01','Measure','Motion, Phenotype, questionnaires and biology when clinically indicated.'],
      ['02','Understand','Structure the data to identify the most relevant modifiable dimensions.'],
      ['03','Act','Build an individualized trajectory across movement, recovery, nutrition, care and prevention.'],
      ['04','Reassess','Repeat comparable measures and objectify change over time.']
    ],
    pulseEy:'KŌMØ PULSE', pulseTitle:'Every measurement becomes<br><em>a trajectory.</em>',
    pulseLead:'Pulse is the digital continuity layer of Motion and Phenotype. It brings the baseline, priorities, protocol and reassessments into one longitudinal view.',
    pulseRows:[
      ['Your baseline','Motion + Phenotype'],
      ['Your results','Structured measurements and analyses'],
      ['Your priorities','One to three understandable priorities'],
      ['Your protocol','Individualized actions and checkpoints'],
      ['Your reassessment','Comparable results over time']
    ],
    studioEy:'THE PERSONAL LONGEVITY STUDIO', studioTitle:'The lab comes<br><em>to you.</em>',
    studioLead:'KŌMØ is designed to travel. The two cases can be deployed in a private residence, yacht, hotel, chalet, spa or partner clinic, with professional and medical supervision according to context and indication.',
    studioQuote:'A longevity studio that fits into two cases.',
    places:['PRIVATE RESIDENCE','YACHT','HOTEL','CHALET','SPA','PARTNER CLINIC'],
    pathsEy:'TWO WAYS TO ENTER KŌMØ',
    individual:['FOR INDIVIDUALS','Know your baseline.','Book a KŌMØ assessment and build a personal reference for what comes next.','Book an assessment'],
    professional:['FOR PROFESSIONALS','Deploy the studio.','Bring KŌMØ Motion, Phenotype and Pulse into a clinic, hotel, yacht, spa or private environment.','Deploy KŌMØ'],
    scienceEy:'SCIENCE & METHOD', scienceTitle:'Measured,<br><em>not assumed.</em>',
    scienceLead:'KŌMØ distinguishes direct measurement, contextual data and clinical interpretation. Longitudinal comparison matters more than a single isolated number.',
    science:[
      ['Motion','Functional and neuromuscular phenotype'],
      ['Phenotype','Body composition and external phenotype'],
      ['Biology','Biomarkers when relevant and clinically appropriate'],
      ['Questionnaires','Symptoms, lifestyle, recovery and context'],
      ['Longitudinal data','Response to intervention and reassessment']
    ],
    scienceNote:'KŌMØ does not present a consumer score as a diagnosis. Clinical interpretation and medical decisions remain the responsibility of qualified professionals.',
    founderEy:'FOUNDER · CLINICAL ORIGIN', founderTitle:'Built from clinical<br><em>movement science.</em>',
    founderName:'Dr Renan Chapon, MD', founderRole:'Founder · KŌMØ Longevity',
    founderBody:'KŌMØ was developed from a clinical interest in spine, locomotion and functional movement analysis: translating complex measurement into a portable, repeatable and understandable longevity infrastructure.',
    finalEy:'KŌMØ LONGEVITY', finalTitle:'Your longevity has a baseline.<br><em>Let’s measure it.</em>',
    finalCta:'Book KŌMØ', finalPlaces:'Cannes · Monaco · Saint-Tropez · Gstaad · Private destinations',
    footer:'Motion · Phenotype · Pulse'
  },
  fr: {
    metaTitle: 'KŌMØ Longevity — Motion · Phenotype · Pulse',
    metaDescription: 'KŌMØ est un studio personnel de longévité mobile réunissant mesure fonctionnelle, phénotype et suivi longitudinal dans Pulse.',
    nav: ['Motion','Phenotype','Méthode','Pulse','Professionnels','Réserver'],
    heroEy: 'KŌMØ LONGEVITY · PERSONAL LONGEVITY STUDIO',
    heroTitle: 'Mesurer ce qui façonne<br><em>votre façon de vieillir.</em>',
    heroLead: 'Deux valises d’évaluation portables. Une baseline personnelle de longévité. KŌMØ réunit fonction et phénotype dans une trajectoire longitudinale unique.',
    heroPrimary: 'Réserver une évaluation KŌMØ', heroSecondary: 'Pour les professionnels',
    heroProof: ['MOTION · FONCTION', 'PHENOTYPE · BIOLOGIE', 'PULSE · TRAJECTOIRE'],
    twoEy: 'LES DEUX VALISES KŌMØ', twoTitle: 'Deux valises.<br><em>Une lecture unifiée de votre longévité.</em>',
    twoLead: 'Le corps ne vieillit pas selon une seule dimension. KŌMØ sépare ce qui doit être mesuré, puis le reconnecte dans une baseline lisible.',
    motionSub: 'Comment votre corps bouge.',
    motionIntro: 'Une couche d’évaluation fonctionnelle portable conçue pour objectiver les capacités physiques plutôt que les déduire de l’âge.',
    motion: [
      ['Locomotion','Marche et mouvement fonctionnel'],
      ['Force & puissance','Capacité de production de force et performance fonctionnelle'],
      ['Équilibre','Stabilité et contrôle postural'],
      ['Mobilité','Amplitude fonctionnelle et capacité de mouvement'],
      ['Symétrie','Différences fonctionnelles droite–gauche'],
      ['Performance','Capacité physique intégrée']
    ],
    phenotypeSub: 'Comment votre corps se présente aujourd’hui.',
    phenotypeIntro: 'Une lecture structurée du phénotype associant composition corporelle, phénotype externe et contexte biologique lorsque pertinent.',
    phenotype: [
      ['Composition corporelle','Muscle, masse grasse, distribution et phénotype anthropométrique'],
      ['Contexte métabolique','Contexte clinique et biologique lorsqu’il est disponible et indiqué'],
      ['Santé cutanée','Texture, hydratation, pigmentation et marqueurs visibles du vieillissement'],
      ['Cheveux & cuir chevelu','Densité, caractéristiques du cuir chevelu et phénotype capillaire'],
      ['Profil de soins personnalisé','Résultats transformés en stratégie individuelle structurée']
    ],
    statementEy:'LA BASELINE KŌMØ',
    statement:'Nous ne commençons pas par l’âge.<br><em>Nous commençons par le phénotype et la fonction.</em>',
    flow:['Motion','Phenotype','Biologie','Contexte individuel','Personal longevity baseline'],
    methodEy:'LA MÉTHODE KŌMØ', methodTitle:'Mesurer. Comprendre.<br><em>Agir. Réévaluer.</em>',
    methodLead:'Une baseline n’a d’intérêt que si elle guide l’action et peut être reproduite dans le temps.',
    method:[
      ['01','Mesurer','Motion, Phenotype, questionnaires et biologie lorsqu’elle est cliniquement indiquée.'],
      ['02','Comprendre','Structurer les données pour identifier les dimensions modifiables les plus pertinentes.'],
      ['03','Agir','Construire une trajectoire individualisée : mouvement, récupération, nutrition, soins et prévention.'],
      ['04','Réévaluer','Répéter des mesures comparables et objectiver l’évolution dans le temps.']
    ],
    pulseEy:'KŌMØ PULSE', pulseTitle:'Chaque mesure devient<br><em>une trajectoire.</em>',
    pulseLead:'Pulse est la couche de continuité digitale de Motion et Phenotype. Il réunit baseline, priorités, protocole et réévaluations dans une seule lecture longitudinale.',
    pulseRows:[
      ['Votre baseline','Motion + Phenotype'],
      ['Vos résultats','Mesures et analyses structurées'],
      ['Vos priorités','Une à trois priorités compréhensibles'],
      ['Votre protocole','Actions individualisées et checkpoints'],
      ['Votre réévaluation','Résultats comparables dans le temps']
    ],
    studioEy:'THE PERSONAL LONGEVITY STUDIO', studioTitle:'Le laboratoire vient<br><em>à vous.</em>',
    studioLead:'KŌMØ est conçu pour voyager. Les deux valises peuvent être déployées en résidence privée, yacht, hôtel, chalet, spa ou clinique partenaire, avec supervision professionnelle et médicale selon le contexte et l’indication.',
    studioQuote:'Un studio de longévité qui tient dans deux valises.',
    places:['RÉSIDENCE PRIVÉE','YACHT','HÔTEL','CHALET','SPA','CLINIQUE PARTENAIRE'],
    pathsEy:'DEUX FAÇONS D’ENTRER DANS KŌMØ',
    individual:['POUR LES PARTICULIERS','Connaître votre baseline.','Réservez une évaluation KŌMØ et créez une référence personnelle pour la suite.','Réserver une évaluation'],
    professional:['POUR LES PROFESSIONNELS','Déployer le studio.','Intégrez KŌMØ Motion, Phenotype et Pulse dans une clinique, un hôtel, un yacht, un spa ou un environnement privé.','Déployer KŌMØ'],
    scienceEy:'SCIENCE & MÉTHODE', scienceTitle:'Mesuré,<br><em>pas supposé.</em>',
    scienceLead:'KŌMØ distingue mesure directe, données contextuelles et interprétation clinique. La comparaison longitudinale compte davantage qu’un chiffre isolé.',
    science:[
      ['Motion','Phénotype fonctionnel et neuromusculaire'],
      ['Phenotype','Composition corporelle et phénotype externe'],
      ['Biologie','Biomarqueurs lorsque pertinents et cliniquement appropriés'],
      ['Questionnaires','Symptômes, mode de vie, récupération et contexte'],
      ['Données longitudinales','Réponse à l’intervention et réévaluation']
    ],
    scienceNote:'KŌMØ ne présente pas un score grand public comme un diagnostic. L’interprétation clinique et les décisions médicales restent sous la responsabilité des professionnels qualifiés.',
    founderEy:'FONDATEUR · ORIGINE CLINIQUE', founderTitle:'Né de la science clinique<br><em>du mouvement.</em>',
    founderName:'Dr Renan Chapon, MD', founderRole:'Fondateur · KŌMØ Longevity',
    founderBody:'KŌMØ est né d’un intérêt clinique pour le rachis, la locomotion et l’analyse fonctionnelle du mouvement : transformer une mesure complexe en infrastructure de longévité portable, reproductible et compréhensible.',
    finalEy:'KŌMØ LONGEVITY', finalTitle:'Votre longévité a une baseline.<br><em>Mesurons-la.</em>',
    finalCta:'Réserver KŌMØ', finalPlaces:'Cannes · Monaco · Saint-Tropez · Gstaad · Destinations privées',
    footer:'Motion · Phenotype · Pulse'
  },
  es: {
    metaTitle: 'KŌMØ Longevity — Motion · Phenotype · Pulse',
    metaDescription: 'KŌMØ es un estudio personal de longevidad móvil que integra función, fenotipo y seguimiento longitudinal en Pulse.',
    nav: ['Motion','Phenotype','Método','Pulse','Profesionales','Reservar'],
    heroEy: 'KŌMØ LONGEVITY · PERSONAL LONGEVITY STUDIO',
    heroTitle: 'Medir lo que determina<br><em>cómo envejeces.</em>',
    heroLead: 'Dos maletas portátiles de evaluación. Una baseline personal de longevidad. KŌMØ integra función y fenotipo en una única trayectoria longitudinal.',
    heroPrimary: 'Reservar una evaluación KŌMØ', heroSecondary: 'Para profesionales',
    heroProof: ['MOTION · FUNCIÓN', 'PHENOTYPE · BIOLOGÍA', 'PULSE · TRAYECTORIA'],
    twoEy: 'LAS DOS MALETAS KŌMØ', twoTitle: 'Dos maletas.<br><em>Una visión integrada de tu longevidad.</em>',
    twoLead: 'El cuerpo no envejece en una sola dimensión. KŌMØ separa lo que debe medirse y lo reconecta en una baseline legible.',
    motionSub: 'Cómo se mueve tu cuerpo.',
    motionIntro: 'Una capa portátil de evaluación funcional para objetivar capacidad física en lugar de inferirla solo por la edad.',
    motion: [['Locomoción','Marcha y movimiento funcional'],['Fuerza & potencia','Capacidad de producir fuerza y rendimiento funcional'],['Equilibrio','Estabilidad y control postural'],['Movilidad','Rango funcional y capacidad de movimiento'],['Simetría','Diferencias funcionales derecha–izquierda'],['Rendimiento','Capacidad física integrada']],
    phenotypeSub: 'Cómo se presenta tu cuerpo hoy.',
    phenotypeIntro: 'Una lectura estructurada del fenotipo que combina composición corporal, fenotipo externo y contexto biológico cuando es pertinente.',
    phenotype: [['Composición corporal','Músculo, grasa, distribución y fenotipo antropométrico'],['Contexto metabólico','Contexto clínico y biológico cuando está disponible e indicado'],['Salud cutánea','Textura, hidratación, pigmentación y marcadores visibles del envejecimiento'],['Cabello & cuero cabelludo','Densidad, características del cuero cabelludo y fenotipo capilar'],['Perfil de cuidado personalizado','Resultados transformados en una estrategia individual estructurada']],
    statementEy:'LA BASELINE KŌMØ', statement:'No empezamos por la edad.<br><em>Empezamos por el fenotipo y la función.</em>',
    flow:['Motion','Phenotype','Biología','Contexto individual','Personal longevity baseline'],
    methodEy:'EL MÉTODO KŌMØ', methodTitle:'Medir. Comprender.<br><em>Actuar. Reevaluar.</em>',
    methodLead:'Una baseline solo es útil si guía la acción y puede reproducirse con el tiempo.',
    method:[['01','Medir','Motion, Phenotype, cuestionarios y biología cuando esté clínicamente indicada.'],['02','Comprender','Estructurar los datos para identificar las dimensiones modificables más relevantes.'],['03','Actuar','Construir una trayectoria individualizada de movimiento, recuperación, nutrición, cuidado y prevención.'],['04','Reevaluar','Repetir medidas comparables y objetivar la evolución en el tiempo.']],
    pulseEy:'KŌMØ PULSE', pulseTitle:'Cada medición se convierte<br><em>en una trayectoria.</em>',
    pulseLead:'Pulse es la capa digital de continuidad de Motion y Phenotype: baseline, prioridades, protocolo y reevaluaciones en una sola lectura longitudinal.',
    pulseRows:[['Tu baseline','Motion + Phenotype'],['Tus resultados','Mediciones y análisis estructurados'],['Tus prioridades','Una a tres prioridades comprensibles'],['Tu protocolo','Acciones individualizadas y checkpoints'],['Tu reevaluación','Resultados comparables en el tiempo']],
    studioEy:'THE PERSONAL LONGEVITY STUDIO', studioTitle:'El laboratorio viene<br><em>a ti.</em>',
    studioLead:'KŌMØ está diseñado para viajar. Las dos maletas pueden desplegarse en residencia privada, yate, hotel, chalet, spa o clínica asociada, con supervisión profesional y médica según el contexto y la indicación.',
    studioQuote:'Un estudio de longevidad que cabe en dos maletas.',
    places:['RESIDENCIA PRIVADA','YATE','HOTEL','CHALET','SPA','CLÍNICA ASOCIADA'],
    pathsEy:'DOS FORMAS DE ENTRAR EN KŌMØ',
    individual:['PARA PARTICULARES','Conoce tu baseline.','Reserva una evaluación KŌMØ y crea una referencia personal para lo que viene después.','Reservar una evaluación'],
    professional:['PARA PROFESIONALES','Despliega el estudio.','Integra KŌMØ Motion, Phenotype y Pulse en una clínica, hotel, yate, spa o entorno privado.','Desplegar KŌMØ'],
    scienceEy:'CIENCIA & MÉTODO', scienceTitle:'Medido,<br><em>no supuesto.</em>',
    scienceLead:'KŌMØ distingue medición directa, datos contextuales e interpretación clínica. La comparación longitudinal importa más que un número aislado.',
    science:[['Motion','Fenotipo funcional y neuromuscular'],['Phenotype','Composición corporal y fenotipo externo'],['Biología','Biomarcadores cuando sean pertinentes y clínicamente apropiados'],['Cuestionarios','Síntomas, estilo de vida, recuperación y contexto'],['Datos longitudinales','Respuesta a la intervención y reevaluación']],
    scienceNote:'KŌMØ no presenta una puntuación de consumo como diagnóstico. La interpretación clínica y las decisiones médicas corresponden a profesionales cualificados.',
    founderEy:'FUNDADOR · ORIGEN CLÍNICO', founderTitle:'Nacido de la ciencia clínica<br><em>del movimiento.</em>',
    founderName:'Dr Renan Chapon, MD', founderRole:'Fundador · KŌMØ Longevity',
    founderBody:'KŌMØ nace del interés clínico por la columna, la locomoción y el análisis funcional del movimiento: transformar una medición compleja en una infraestructura de longevidad portátil, reproducible y comprensible.',
    finalEy:'KŌMØ LONGEVITY', finalTitle:'Tu longevidad tiene una baseline.<br><em>Vamos a medirla.</em>',
    finalCta:'Reservar KŌMØ', finalPlaces:'Cannes · Monaco · Saint-Tropez · Gstaad · Destinos privados',
    footer:'Motion · Phenotype · Pulse'
  }
};

const style = `<style id="komo-renewal-motion-phenotype-v1">
:root{--kr-bg:#0c0c0b;--kr-paper:#eee9df;--kr-warm:#d8cec0;--kr-stone:#918578;--kr-line:rgba(255,255,255,.16);--kr-darkline:rgba(20,18,15,.16);--kr-gold:#c7a276}
html{scroll-behavior:smooth}.kr-page{background:var(--kr-bg);color:#f5f0e7;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.kr-page *{box-sizing:border-box}.kr-page a{color:inherit}.kr-shell{width:min(1240px,calc(100% - 64px));margin:0 auto}
.kr-header{position:fixed;z-index:1000;top:0;left:0;right:0;height:76px;display:flex;align-items:center;gap:28px;padding:0 max(28px,calc((100vw - 1380px)/2));background:linear-gradient(180deg,rgba(9,9,8,.82),rgba(9,9,8,.28));backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,255,255,.08);color:white}.kr-brand{display:flex;align-items:baseline;gap:10px;text-decoration:none;font-size:24px;letter-spacing:.2em;font-weight:400}.kr-brand small{font-size:8px;letter-spacing:.2em;opacity:.65}.kr-nav{display:flex;align-items:center;gap:24px;margin-left:auto}.kr-nav a{text-decoration:none;font-size:10px;letter-spacing:.12em;text-transform:uppercase;opacity:.82}.kr-nav a:hover{opacity:1}.kr-nav .kr-book{border:1px solid rgba(255,255,255,.34);border-radius:999px;padding:10px 15px;opacity:1}.kr-lang{display:flex;gap:8px;font-size:9px;letter-spacing:.1em}.kr-lang a{text-decoration:none;opacity:.55}.kr-lang a[aria-current="page"]{opacity:1}.kr-mobile{display:none;margin-left:auto}.kr-mobile summary{list-style:none;cursor:pointer;font-size:10px;letter-spacing:.14em}.kr-mobile summary::-webkit-details-marker{display:none}.kr-mobile div{position:absolute;top:76px;left:0;right:0;padding:25px 28px;background:#0e0e0c;border-top:1px solid rgba(255,255,255,.08);display:grid;gap:18px}.kr-mobile a{text-decoration:none;font-size:12px;letter-spacing:.1em;text-transform:uppercase}
.kr-hero{position:relative;min-height:100svh;display:flex;align-items:flex-end;overflow:hidden}.kr-hero-media{position:absolute;inset:0}.kr-hero-media img{width:100%;height:100%;object-fit:cover;object-position:center 58%;filter:saturate(.82) contrast(1.03)}.kr-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,8,7,.82) 0%,rgba(8,8,7,.52) 42%,rgba(8,8,7,.1) 74%),linear-gradient(0deg,rgba(8,8,7,.75) 0%,transparent 55%)}.kr-hero-content{position:relative;z-index:1;padding:150px 0 74px;max-width:820px}.kr-ey{margin:0 0 22px;font-size:10px;font-weight:700;letter-spacing:.19em;text-transform:uppercase;color:#cdbba4}.kr-hero h1,.kr-h2{margin:0;font-family:"Iowan Old Style",Baskerville,Georgia,serif;font-weight:400;letter-spacing:-.052em;line-height:.95}.kr-hero h1{font-size:clamp(56px,7.2vw,104px);max-width:10ch}.kr-hero h1 em,.kr-h2 em{font-style:italic;color:#dac7ad}.kr-lead{margin:28px 0 0;max-width:680px;font-size:clamp(17px,1.55vw,21px);line-height:1.62;color:rgba(245,240,231,.76)}.kr-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:34px}.kr-btn{display:inline-flex;min-height:48px;align-items:center;justify-content:center;padding:0 20px;border-radius:999px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.05em}.kr-btn-primary{background:#f3eee5;color:#14120f}.kr-btn-ghost{border:1px solid rgba(255,255,255,.3);color:#fff}.kr-proof{display:flex;flex-wrap:wrap;gap:8px;margin-top:36px}.kr-proof span{padding:9px 12px;border:1px solid rgba(255,255,255,.16);border-radius:999px;font-size:9px;letter-spacing:.14em;color:rgba(255,255,255,.72)}
.kr-section{padding:clamp(80px,10vw,140px) 0}.kr-paper{background:var(--kr-paper);color:#171512}.kr-paper .kr-ey{color:#776a5a}.kr-paper .kr-h2 em{color:#8b6e51}.kr-paper .kr-lead{color:#675f56}.kr-h2{font-size:clamp(44px,6.2vw,82px)}.kr-section-head{display:grid;grid-template-columns:1fr .72fr;gap:70px;align-items:end}.kr-section-head .kr-lead{margin:0}
.kr-cases{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:54px}.kr-case{background:#171614;border:1px solid rgba(255,255,255,.08);overflow:hidden}.kr-case-media{aspect-ratio:4/5;overflow:hidden;background:#151410}.kr-case-media img{display:block;width:100%;height:100%;object-fit:cover}.kr-case-body{padding:34px}.kr-case-kicker{font-size:10px;letter-spacing:.16em;color:#c8ae8d}.kr-case h3{margin:13px 0 0;font:400 clamp(38px,4vw,58px)/1 Georgia,serif;letter-spacing:-.045em}.kr-case-sub{margin:11px 0 0;font:italic 21px/1.3 Georgia,serif;color:#d7c3a9}.kr-case-intro{margin:18px 0 26px;max-width:57ch;font-size:13px;line-height:1.65;color:rgba(255,255,255,.59)}.kr-measures{margin:0;padding:0;list-style:none;border-top:1px solid rgba(255,255,255,.12)}.kr-measures li{display:grid;grid-template-columns:minmax(120px,.42fr) 1fr;gap:18px;padding:15px 0;border-bottom:1px solid rgba(255,255,255,.1)}.kr-measures b{font-size:11px;letter-spacing:.03em}.kr-measures span{font-size:11px;line-height:1.5;color:rgba(255,255,255,.56)}
.kr-statement{background:#0a0a09;text-align:center;padding:clamp(100px,13vw,190px) 0}.kr-statement .kr-h2{max-width:1050px;margin:0 auto}.kr-flow{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:9px;margin-top:52px}.kr-flow span{padding:11px 14px;border:1px solid rgba(255,255,255,.17);font-size:9px;letter-spacing:.13em;text-transform:uppercase}.kr-flow i{font-style:normal;opacity:.38}
.kr-method{display:grid;grid-template-columns:repeat(4,1fr);margin-top:50px;border-top:1px solid var(--kr-darkline);border-bottom:1px solid var(--kr-darkline)}.kr-step{padding:26px 24px 34px;border-right:1px solid var(--kr-darkline)}.kr-step:last-child{border-right:0}.kr-step b{font-size:10px;color:#846e56}.kr-step h3{margin:62px 0 12px;font:400 29px/1 Georgia,serif}.kr-step p{margin:0;font-size:12px;line-height:1.65;color:#6c645b}
.kr-pulse{background:#101714}.kr-pulse-grid{display:grid;grid-template-columns:.92fr 1.08fr;gap:90px;align-items:start}.kr-pulse-list{border-top:1px solid rgba(255,255,255,.16)}.kr-pulse-row{display:grid;grid-template-columns:.55fr 1fr;gap:22px;padding:22px 0;border-bottom:1px solid rgba(255,255,255,.12)}.kr-pulse-row b{font-size:12px}.kr-pulse-row span{font-size:12px;color:rgba(255,255,255,.57)}
.kr-studio{position:relative;min-height:760px;display:flex;align-items:flex-end;overflow:hidden}.kr-studio>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.72)}.kr-studio:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(8,8,7,.91),rgba(8,8,7,.08) 70%)}.kr-studio-copy{position:relative;z-index:1;padding:90px 0;max-width:800px}.kr-studio-quote{margin:32px 0 0;font:italic clamp(28px,3.5vw,48px)/1.08 Georgia,serif;color:#eadbc7}.kr-places{display:flex;gap:8px;flex-wrap:wrap;margin-top:32px}.kr-places span{font-size:9px;letter-spacing:.12em;padding:9px 11px;border:1px solid rgba(255,255,255,.18)}
.kr-paths{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:44px}.kr-path{min-height:410px;padding:36px;display:flex;flex-direction:column;background:white;border:1px solid var(--kr-darkline)}.kr-path:last-child{background:#1b1b18;color:#f3eee5}.kr-path .kr-case-kicker{color:#856c52}.kr-path h3{margin:70px 0 14px;font:400 clamp(38px,4.2vw,58px)/1 Georgia,serif;letter-spacing:-.045em}.kr-path p{margin:0;max-width:46ch;font-size:13px;line-height:1.65;color:#6b635b}.kr-path:last-child p{color:rgba(255,255,255,.6)}.kr-path a{margin-top:auto;padding-top:38px;text-decoration:none;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.kr-science-grid{display:grid;grid-template-columns:repeat(5,1fr);margin-top:48px;border-top:1px solid rgba(255,255,255,.16);border-bottom:1px solid rgba(255,255,255,.16)}.kr-science-card{padding:25px 19px 32px;border-right:1px solid rgba(255,255,255,.12)}.kr-science-card:last-child{border-right:0}.kr-science-card b{display:block;margin-top:50px;font:400 25px/1 Georgia,serif}.kr-science-card span{display:block;margin-top:12px;font-size:11px;line-height:1.5;color:rgba(255,255,255,.55)}.kr-note{margin:28px 0 0;max-width:920px;font-size:10px;line-height:1.65;color:rgba(255,255,255,.45)}
.kr-founder{background:#d7cec1;color:#1a1713}.kr-founder-grid{display:grid;grid-template-columns:.7fr 1.3fr;gap:80px;align-items:start}.kr-founder-id{padding-top:8px}.kr-founder-id b{font:400 30px/1.1 Georgia,serif}.kr-founder-id span{display:block;margin-top:8px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#76695a}.kr-founder .kr-h2 em{color:#856e56}.kr-founder p{max-width:690px;font-size:14px;line-height:1.75;color:#5d554d}
.kr-final{position:relative;min-height:720px;display:flex;align-items:center;text-align:center;overflow:hidden}.kr-final img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.72)}.kr-final:after{content:"";position:absolute;inset:0;background:rgba(7,7,6,.68)}.kr-final-copy{position:relative;z-index:1;width:100%;padding:100px 0}.kr-final .kr-h2{max-width:1050px;margin:0 auto}.kr-final .kr-actions{justify-content:center}.kr-final-places{margin-top:34px;font-size:10px;letter-spacing:.14em;color:rgba(255,255,255,.55)}
.kr-footer{padding:34px max(28px,calc((100vw - 1240px)/2));background:#080807;color:rgba(255,255,255,.58);border-top:1px solid rgba(255,255,255,.09);display:flex;align-items:center;gap:24px}.kr-footer strong{color:#fff;font-weight:500;letter-spacing:.15em}.kr-footer span{font-size:10px;letter-spacing:.12em}.kr-footer a{margin-left:auto;text-decoration:none;font-size:10px}
@media(max-width:1000px){.kr-nav{display:none}.kr-mobile{display:block}.kr-section-head,.kr-pulse-grid,.kr-founder-grid{grid-template-columns:1fr;gap:30px}.kr-cases,.kr-paths{grid-template-columns:1fr}.kr-method{grid-template-columns:1fr 1fr}.kr-step:nth-child(2){border-right:0}.kr-step:nth-child(-n+2){border-bottom:1px solid var(--kr-darkline)}.kr-science-grid{grid-template-columns:1fr 1fr}.kr-science-card{border-bottom:1px solid rgba(255,255,255,.12)}.kr-science-card:nth-child(even){border-right:0}}
@media(max-width:640px){.kr-shell{width:min(100% - 30px,1240px)}.kr-header{height:66px;padding:0 15px}.kr-brand{font-size:20px}.kr-brand small,.kr-lang{display:none}.kr-mobile div{top:66px}.kr-hero h1{font-size:clamp(50px,16vw,70px)}.kr-hero-content{padding-bottom:48px}.kr-proof{display:grid}.kr-section{padding:72px 0}.kr-h2{font-size:clamp(42px,13vw,61px)}.kr-case-body{padding:25px 20px}.kr-measures li{grid-template-columns:1fr;gap:5px}.kr-method{grid-template-columns:1fr}.kr-step,.kr-step:nth-child(2){border-right:0;border-bottom:1px solid var(--kr-darkline)}.kr-step:last-child{border-bottom:0}.kr-step h3{margin-top:28px}.kr-science-grid{grid-template-columns:1fr}.kr-science-card{border-right:0}.kr-studio{min-height:700px}.kr-path{min-height:340px;padding:28px 22px}.kr-footer{align-items:flex-start;flex-direction:column}.kr-footer a{margin-left:0}}
</style>`;

function href(locale, page='') {
  const prefix = locale === 'en' ? '' : '/' + locale;
  if (!page) return prefix ? prefix + '/' : '/';
  return prefix + '/' + page + '/';
}
function header(c, locale) {
  const links = [
    ['#motion',c.nav[0]],['#phenotype',c.nav[1]],['#method',c.nav[2]],['#pulse',c.nav[3]],
    [href(locale,'partners'),c.nav[4]]
  ];
  const langs = [['fr','FR','/'],['en','EN','/en/'],['es','ES','/es/']];
  return `<header class="kr-header"><a class="kr-brand" href="${href(locale)}">KŌMØ <small>LONGEVITY</small></a><nav class="kr-nav">${links.map(([u,l])=>`<a href="${u}">${l}</a>`).join('')}<a class="kr-book" href="${href(locale,'contact')}">${c.nav[5]}</a></nav><div class="kr-lang">${langs.map(([id,l,u])=>`<a href="${u}" ${id===locale?'aria-current="page"':''}>${l}</a>`).join('')}</div><details class="kr-mobile"><summary>MENU</summary><div>${links.map(([u,l])=>`<a href="${u}">${l}</a>`).join('')}<a href="${href(locale,'contact')}">${c.nav[5]}</a></div></details></header>`;
}
const measureList = (items) => `<ul class="kr-measures">${items.map(([a,b])=>`<li><b>${a}</b><span>${b}</span></li>`).join('')}</ul>`;
function main(c, locale) {
  return `<main class="kr-page">
<section class="kr-hero"><div class="kr-hero-media"><img src="/assets/images/komo-two-cases-renewal.webp" alt="KŌMØ Motion and Phenotype portable longevity cases" width="420" height="525" loading="eager" fetchpriority="high"></div><div class="kr-shell kr-hero-content"><p class="kr-ey">${c.heroEy}</p><h1>${c.heroTitle}</h1><p class="kr-lead">${c.heroLead}</p><div class="kr-actions"><a class="kr-btn kr-btn-primary" href="${href(locale,'contact')}">${c.heroPrimary}</a><a class="kr-btn kr-btn-ghost" href="${href(locale,'partners')}">${c.heroSecondary}</a></div><div class="kr-proof">${c.heroProof.map(x=>`<span>${x}</span>`).join('')}</div></div></section>

<section class="kr-section" id="motion"><div class="kr-shell"><div class="kr-section-head"><div><p class="kr-ey">${c.twoEy}</p><h2 class="kr-h2">${c.twoTitle}</h2></div><p class="kr-lead">${c.twoLead}</p></div><div class="kr-cases">
<article class="kr-case"><div class="kr-case-media"><img src="/assets/images/komo-motion-closed-renewal.webp" alt="KŌMØ Motion closed aluminium case" width="420" height="525" loading="lazy"></div><div class="kr-case-body"><span class="kr-case-kicker">KŌMØ MOTION</span><h3>Motion</h3><p class="kr-case-sub">${c.motionSub}</p><p class="kr-case-intro">${c.motionIntro}</p>${measureList(c.motion)}</div></article>
<article class="kr-case" id="phenotype"><div class="kr-case-media"><img src="/assets/images/komo-phenotype-closed-renewal.webp" alt="KŌMØ Phenotype closed aluminium case" width="420" height="525" loading="lazy"></div><div class="kr-case-body"><span class="kr-case-kicker">KŌMØ PHENOTYPE</span><h3>Phenotype</h3><p class="kr-case-sub">${c.phenotypeSub}</p><p class="kr-case-intro">${c.phenotypeIntro}</p>${measureList(c.phenotype)}</div></article>
</div></div></section>

<section class="kr-statement"><div class="kr-shell"><p class="kr-ey">${c.statementEy}</p><h2 class="kr-h2">${c.statement}</h2><div class="kr-flow">${c.flow.map((x,i)=>`${i?'<i>→</i>':''}<span>${x}</span>`).join('')}</div></div></section>

<section class="kr-section kr-paper" id="method"><div class="kr-shell"><div class="kr-section-head"><div><p class="kr-ey">${c.methodEy}</p><h2 class="kr-h2">${c.methodTitle}</h2></div><p class="kr-lead">${c.methodLead}</p></div><div class="kr-method">${c.method.map(([n,t,b])=>`<article class="kr-step"><b>${n}</b><h3>${t}</h3><p>${b}</p></article>`).join('')}</div></div></section>

<section class="kr-section kr-pulse" id="pulse"><div class="kr-shell kr-pulse-grid"><div><p class="kr-ey">${c.pulseEy}</p><h2 class="kr-h2">${c.pulseTitle}</h2><p class="kr-lead">${c.pulseLead}</p></div><div class="kr-pulse-list">${c.pulseRows.map(([a,b])=>`<div class="kr-pulse-row"><b>${a}</b><span>${b}</span></div>`).join('')}<div class="kr-actions"><a class="kr-btn kr-btn-ghost" href="${href(locale,'pulse')}">KŌMØ Pulse →</a></div></div></div></section>

<section class="kr-studio"><img src="/assets/images/komo-two-cases-renewal.webp" alt="KŌMØ portable longevity studio" width="420" height="525" loading="lazy"><div class="kr-shell kr-studio-copy"><p class="kr-ey">${c.studioEy}</p><h2 class="kr-h2">${c.studioTitle}</h2><p class="kr-lead">${c.studioLead}</p><p class="kr-studio-quote">${c.studioQuote}</p><div class="kr-places">${c.places.map(x=>`<span>${x}</span>`).join('')}</div></div></section>

<section class="kr-section kr-paper"><div class="kr-shell"><p class="kr-ey">${c.pathsEy}</p><div class="kr-paths"><article class="kr-path"><span class="kr-case-kicker">${c.individual[0]}</span><h3>${c.individual[1]}</h3><p>${c.individual[2]}</p><a href="${href(locale,'contact')}">${c.individual[3]} →</a></article><article class="kr-path"><span class="kr-case-kicker">${c.professional[0]}</span><h3>${c.professional[1]}</h3><p>${c.professional[2]}</p><a href="${href(locale,'partners')}">${c.professional[3]} →</a></article></div></div></section>

<section class="kr-section"><div class="kr-shell"><div class="kr-section-head"><div><p class="kr-ey">${c.scienceEy}</p><h2 class="kr-h2">${c.scienceTitle}</h2></div><p class="kr-lead">${c.scienceLead}</p></div><div class="kr-science-grid">${c.science.map(([a,b])=>`<article class="kr-science-card"><b>${a}</b><span>${b}</span></article>`).join('')}</div><p class="kr-note">${c.scienceNote}</p></div></section>

<section class="kr-section kr-founder"><div class="kr-shell kr-founder-grid"><div class="kr-founder-id"><p class="kr-ey">${c.founderEy}</p><b>${c.founderName}</b><span>${c.founderRole}</span></div><div><h2 class="kr-h2">${c.founderTitle}</h2><p>${c.founderBody}</p><div class="kr-actions"><a class="kr-btn" style="border:1px solid rgba(20,18,15,.25)" href="${href(locale,'science')}">Science & method →</a></div></div></div></section>

<section class="kr-final"><img src="/assets/images/komo-two-cases-renewal.webp" alt="KŌMØ Motion and Phenotype" width="420" height="525" loading="lazy"><div class="kr-shell kr-final-copy"><p class="kr-ey">${c.finalEy}</p><h2 class="kr-h2">${c.finalTitle}</h2><div class="kr-actions"><a class="kr-btn kr-btn-primary" href="${href(locale,'contact')}">${c.finalCta}</a></div><p class="kr-final-places">${c.finalPlaces}</p></div></section>
</main>`;
}
function footer(c, locale) {
  return `<footer class="kr-footer"><strong>KŌMØ</strong><span>${c.footer}</span><a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a></footer>`;
}

async function patch(locale, relative) {
  const file = join(site, relative);
  let html = await readFile(file, 'utf8');
  const c = copy[locale];
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${c.metaTitle}</title>`);
  if (/<meta[^>]+name=["']description["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta[^>]+name=["']description["'][^>]*>/i, `<meta name="description" content="${c.metaDescription}">`);
  }
  html = html.replace(/<header\b[^>]*>[\s\S]*?<\/header>/i, header(c, locale));
  html = html.replace(/<main\b[^>]*>[\s\S]*?<\/main>/i, main(c, locale));
  html = html.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/i, footer(c, locale));
  if (html.includes('komo-renewal-motion-phenotype-v1')) {
    html = html.replace(/<style id="komo-renewal-motion-phenotype-v1">[\s\S]*?<\/style>/i, style);
  } else {
    html = html.replace('</head>', `<link rel="preload" as="image" href="/assets/images/komo-two-cases-renewal.webp" type="image/webp" fetchpriority="high">\n${style}\n</head>`);
  }
  await writeFile(file, html);
}

await patch('en', 'index.html');
await patch('fr', join('fr','index.html'));
await patch('es', join('es','index.html'));
console.log('KŌMØ renewal v1 applied — Motion · Phenotype · Pulse.');
