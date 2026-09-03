import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const site = join(root, 'site');

const pages = [
  {
    file: join(site, 'fr', 'index.html'), lang: 'fr',
    nav: [['Case','#case'],['Mesure','#measure'],['Motion Score','#score'],['Pulse','#pulse'],['Professionnels','/fr/partners/'],['Science','/fr/methode/']],
    eyebrow:'KŌMØ · LOCOMOTOR LONGEVITY',
    statement:'Votre mobilité n’est pas un instant.<br><em>C’est une trajectoire.</em>',
    statementCopy:'KŌMØ transforme un bilan locomoteur en un système de mesure simple à déployer, lisible à interpréter et répétable dans le temps.',
    caseEy:'KŌMØ CASE · LE SYSTÈME', caseTitle:'Une valise.<br><em>Une nouvelle façon de mesurer.</em>',
    caseCopy:'KŌMØ Case réunit six capteurs, une interface Pulse et un protocole fonctionnel dans un système portable conçu pour le cabinet, la clinique et les centres de longévité.',
    facts:[['01','valise','Système portable'],['06','capteurs','Acquisition instrumentée'],['04','étapes','Préparer · Mesurer · Interpréter · Suivre'],['01','Pulse','Continuité des résultats']],
    measureEy:'UNE VUE PLUS COMPLÈTE', measureTitle:'Voir le mouvement<br><em>comme un système.</em>',
    measureCopy:'Un signal isolé raconte peu. KŌMØ organise plusieurs dimensions de la fonction locomotrice dans une lecture cohérente, avec le niveau scientifique derrière l’interface.',
    measures:[['Muscle','Activation et symétrie'],['Marche','Vitesse, cadence et stabilité'],['Posture','Alignement et organisation'],['Fonction','Tests standardisés'],['Expérience','Mobilité vécue et contexte'],['Suivi','Évolution dans le temps']],
    scoreEy:'KŌMØ MOTION SCORE', scoreTitle:'Le résultat doit être compris<br><em>en moins de trente secondes.</em>',
    scoreCopy:'Le Motion Score synthétise la session sans remplacer l’examen clinique. L’objectif n’est pas de produire un verdict, mais de rendre visibles les priorités et leur évolution.',
    scoreLabels:['Mouvement','Muscle','Posture','Fonction'],
    scoreNote:'Aperçu d’interface — données illustratives.',
    flowEy:'CASE → PULSE', flowTitle:'Mesurer une fois.<br><em>Comprendre dans le temps.</em>',
    flow:[['01','Préparer','Profil, objectif et contexte avant la session.'],['02','Mesurer','Tests fonctionnels et acquisition par les six capteurs.'],['03','Interpréter','Restitution structurée par domaine et synthèse globale.'],['04','Suivre','Nouvelles sessions, résultats et trajectoire dans Pulse.']],
    pulseEy:'KŌMØ PULSE', pulseTitle:'La valise mesure.<br><em>Pulse donne la continuité.</em>',
    pulseCopy:'Le patient retrouve ses sessions, ses résultats et sa trajectoire. Le professionnel retrouve ses patients et conserve un parcours cohérent d’une évaluation à l’autre.',
    pulseCta:'Accéder à KŌMØ Pulse →',
    useEy:'UN SYSTÈME · PLUSIEURS CONTEXTES', useTitle:'Conçu pour les personnes.<br><em>Déployé par les professionnels.</em>',
    uses:[['Pour les personnes','Comprendre sa mobilité, visualiser ses priorités et suivre son évolution.','Créer mon espace Pulse →','https://pulse.komolongevity.com/?intent=signup'],['Pour les professionnels','Déployer un bilan standardisé en cabinet, centre de longévité, performance ou hospitality.','Découvrir KŌMØ Pro →','/fr/partners/']],
    proofEy:'SCIENCE INVISIBLE · RIGUEUR VISIBLE', proofTitle:'Des mesures connues.<br><em>Une nouvelle orchestration.</em>',
    proofCopy:'KŌMØ s’appuie sur des mesures fonctionnelles et instrumentales publiées. Le choix de leur combinaison, leur restitution et le Motion Score restent des choix méthodologiques KŌMØ en cours de validation progressive.',
    proofCta:'Voir la méthode et les preuves →', proofHref:'/fr/methode/',
    finalEy:'KŌMØ · LONGEVITY IN MOTION', finalTitle:'Créer le standard de la<br><em>longévité locomotrice.</em>',
    finalCopy:'Case pour mesurer. Motion Score pour comprendre. Pulse pour suivre.',
    finalCase:'Découvrir la Case', finalPulse:'Accéder à Pulse', finalPro:'Je suis professionnel',
    beta:'Version bêta · accès anticipé. Le Loco Check est disponible ; les parcours Motion et Clinical sont activés progressivement avec les professionnels partenaires.'
  },
  {
    file: join(site, 'index.html'), lang: 'en',
    nav: [['Case','#case'],['Measure','#measure'],['Motion Score','#score'],['Pulse','#pulse'],['Professionals','/partners/'],['Science','/method/']],
    eyebrow:'KŌMØ · LOCOMOTOR LONGEVITY',
    statement:'Mobility is not a snapshot.<br><em>It is a trajectory.</em>',
    statementCopy:'KŌMØ turns a locomotor assessment into a measurement system that is portable, interpretable and repeatable over time.',
    caseEy:'KŌMØ CASE · THE SYSTEM', caseTitle:'One case.<br><em>A new way to measure.</em>',
    caseCopy:'KŌMØ Case brings six sensors, the Pulse interface and a functional protocol into one portable system for clinics, practices and longevity centres.',
    facts:[['01','case','Portable system'],['06','sensors','Instrumented acquisition'],['04','steps','Prepare · Measure · Interpret · Follow'],['01','Pulse','Longitudinal continuity']],
    measureEy:'THE COMPLETE PICTURE', measureTitle:'See movement<br><em>as a system.</em>',
    measureCopy:'A single signal says little. KŌMØ organises several dimensions of locomotor function into one coherent view, with scientific depth behind a simple interface.',
    measures:[['Muscle','Activation and symmetry'],['Gait','Speed, cadence and stability'],['Posture','Alignment and organisation'],['Function','Standardised tests'],['Experience','Daily mobility and context'],['Follow-up','Change over time']],
    scoreEy:'KŌMØ MOTION SCORE', scoreTitle:'Results should make sense<br><em>in under thirty seconds.</em>',
    scoreCopy:'Motion Score synthesises the session without replacing clinical examination. The goal is not a verdict, but a clear view of priorities and change over time.',
    scoreLabels:['Movement','Muscle','Posture','Function'], scoreNote:'Interface preview — illustrative data.',
    flowEy:'CASE → PULSE', flowTitle:'Measure once.<br><em>Understand over time.</em>',
    flow:[['01','Prepare','Profile, goal and context before the session.'],['02','Measure','Functional tests and six-sensor acquisition.'],['03','Interpret','Domain-level readout and global synthesis.'],['04','Follow','New sessions, results and trajectory in Pulse.']],
    pulseEy:'KŌMØ PULSE', pulseTitle:'The Case measures.<br><em>Pulse creates continuity.</em>',
    pulseCopy:'Patients find their sessions, results and trajectory. Professionals manage their patients and keep the assessment pathway coherent over time.',
    pulseCta:'Open KŌMØ Pulse →',
    useEy:'ONE SYSTEM · MULTIPLE SETTINGS', useTitle:'Designed for people.<br><em>Deployed by professionals.</em>',
    uses:[['For people','Understand mobility, see priorities and follow progress over time.','Create my Pulse space →','https://pulse.komolongevity.com/?intent=signup'],['For professionals','Deploy a standardised assessment in practices, longevity centres, performance or hospitality.','Discover KŌMØ Pro →','/partners/']],
    proofEy:'INVISIBLE SCIENCE · VISIBLE RIGOUR', proofTitle:'Established measures.<br><em>A new orchestration.</em>',
    proofCopy:'KŌMØ uses published functional and instrumental measures. Their combination, presentation and the Motion Score are KŌMØ methodological choices undergoing progressive validation.',
    proofCta:'Explore the method and evidence →', proofHref:'/method/',
    finalEy:'KŌMØ · LONGEVITY IN MOTION', finalTitle:'Building the standard for<br><em>locomotor longevity.</em>',
    finalCopy:'Case to measure. Motion Score to understand. Pulse to follow.',
    finalCase:'Discover the Case', finalPulse:'Open Pulse', finalPro:'I am a professional',
    beta:'Beta · early access. Loco Check is available now; Motion and Clinical pathways are progressively enabled with partner professionals.'
  },
  {
    file: join(site, 'es', 'index.html'), lang: 'es',
    nav: [['Case','#case'],['Medición','#measure'],['Motion Score','#score'],['Pulse','#pulse'],['Profesionales','/es/partners/'],['Ciencia','/es/metodo/']],
    eyebrow:'KŌMØ · LONGEVIDAD LOCOMOTORA',
    statement:'La movilidad no es una instantánea.<br><em>Es una trayectoria.</em>',
    statementCopy:'KŌMØ transforma una evaluación locomotora en un sistema de medición portátil, interpretable y repetible a lo largo del tiempo.',
    caseEy:'KŌMØ CASE · EL SISTEMA', caseTitle:'Una maleta.<br><em>Una nueva forma de medir.</em>',
    caseCopy:'KŌMØ Case reúne seis sensores, la interfaz Pulse y un protocolo funcional en un sistema portátil para consultas, clínicas y centros de longevidad.',
    facts:[['01','maleta','Sistema portátil'],['06','sensores','Adquisición instrumentada'],['04','etapas','Preparar · Medir · Interpretar · Seguir'],['01','Pulse','Continuidad longitudinal']],
    measureEy:'UNA VISIÓN MÁS COMPLETA', measureTitle:'Ver el movimiento<br><em>como un sistema.</em>',
    measureCopy:'Una señal aislada dice poco. KŌMØ organiza varias dimensiones de la función locomotora en una lectura coherente, con profundidad científica detrás de una interfaz sencilla.',
    measures:[['Músculo','Activación y simetría'],['Marcha','Velocidad, cadencia y estabilidad'],['Postura','Alineación y organización'],['Función','Pruebas estandarizadas'],['Experiencia','Movilidad diaria y contexto'],['Seguimiento','Evolución en el tiempo']],
    scoreEy:'KŌMØ MOTION SCORE', scoreTitle:'El resultado debe entenderse<br><em>en menos de treinta segundos.</em>',
    scoreCopy:'Motion Score sintetiza la sesión sin sustituir el examen clínico. El objetivo no es emitir un veredicto, sino hacer visibles las prioridades y su evolución.',
    scoreLabels:['Movimiento','Músculo','Postura','Función'], scoreNote:'Vista previa de interfaz — datos ilustrativos.',
    flowEy:'CASE → PULSE', flowTitle:'Medir una vez.<br><em>Comprender en el tiempo.</em>',
    flow:[['01','Preparar','Perfil, objetivo y contexto antes de la sesión.'],['02','Medir','Pruebas funcionales y adquisición con seis sensores.'],['03','Interpretar','Lectura por dominios y síntesis global.'],['04','Seguir','Nuevas sesiones, resultados y trayectoria en Pulse.']],
    pulseEy:'KŌMØ PULSE', pulseTitle:'La Case mide.<br><em>Pulse crea continuidad.</em>',
    pulseCopy:'El paciente encuentra sus sesiones, resultados y trayectoria. El profesional gestiona a sus pacientes y mantiene un recorrido coherente entre evaluaciones.',
    pulseCta:'Acceder a KŌMØ Pulse →',
    useEy:'UN SISTEMA · VARIOS CONTEXTOS', useTitle:'Diseñado para las personas.<br><em>Desplegado por profesionales.</em>',
    uses:[['Para las personas','Comprender la movilidad, visualizar prioridades y seguir la evolución.','Crear mi espacio Pulse →','https://pulse.komolongevity.com/?intent=signup'],['Para profesionales','Desplegar una evaluación estandarizada en consulta, centro de longevidad, rendimiento u hospitality.','Descubrir KŌMØ Pro →','/es/partners/']],
    proofEy:'CIENCIA INVISIBLE · RIGOR VISIBLE', proofTitle:'Medidas conocidas.<br><em>Una nueva orquestación.</em>',
    proofCopy:'KŌMØ utiliza medidas funcionales e instrumentales publicadas. Su combinación, presentación y el Motion Score son decisiones metodológicas KŌMØ en validación progresiva.',
    proofCta:'Ver el método y la evidencia →', proofHref:'/es/metodo/',
    finalEy:'KŌMØ · LONGEVITY IN MOTION', finalTitle:'Crear el estándar de la<br><em>longevidad locomotora.</em>',
    finalCopy:'Case para medir. Motion Score para comprender. Pulse para seguir.',
    finalCase:'Descubrir la Case', finalPulse:'Acceder a Pulse', finalPro:'Soy profesional',
    beta:'Versión beta · acceso anticipado. Loco Check está disponible; Motion y Clinical se activan progresivamente con profesionales asociados.'
  }
];

const CSS = `<style id="homepage-whoop-product-v2-style">
:root{--kw-black:#080908;--kw-ink:#151716;--kw-ivory:#f3f0e8;--kw-paper:#faf8f3;--kw-sage:#93aa9f;--kw-sage-dark:#5f756c;--kw-beige:#d9c4a2;--kw-line:rgba(21,23,22,.14);--kw-white-line:rgba(255,255,255,.14)}
.kb-status{display:none!important}.kw{font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:var(--kw-ink)}.kw-shell{width:min(calc(100% - 56px),1440px);margin:auto}.kw-ey{margin:0 0 18px;color:var(--kw-sage-dark);font-size:9px;font-weight:850;letter-spacing:.17em;text-transform:uppercase}.kw-title{margin:0;font-size:clamp(48px,6.8vw,104px);line-height:.88;letter-spacing:-.067em;font-weight:700;text-wrap:balance}.kw-title em{font-style:normal;color:var(--kw-sage-dark)}.kw-copy{margin:0;max-width:680px;color:#686b67;font-size:clamp(16px,1.35vw,20px);line-height:1.58}.kw-btn{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 21px;border-radius:10px;background:var(--kw-ink);color:#fff!important;text-decoration:none;font-size:10px;font-weight:850;letter-spacing:.05em;text-transform:uppercase}.kw-btn--light{background:var(--kw-beige);color:#111!important}.kw-link{display:inline-flex;align-items:center;min-height:52px;padding:0 4px;border-bottom:1px solid currentColor;text-decoration:none;font-size:10px;font-weight:850;letter-spacing:.04em;text-transform:uppercase}
.kw-statement{padding:clamp(82px,11vw,170px) 0;background:var(--kw-paper)}.kw-statement__grid{display:grid;grid-template-columns:1.2fr .8fr;gap:clamp(50px,9vw,150px);align-items:end}.kw-statement .kw-title{font-size:clamp(58px,8vw,122px)}
.kw-case{padding:clamp(72px,9vw,130px) 0;background:var(--kw-black);color:#fff}.kw-case .kw-ey{color:var(--kw-beige)}.kw-case .kw-title em{color:var(--kw-sage)}.kw-case .kw-copy{color:rgba(255,255,255,.66)}.kw-case__head{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(42px,8vw,120px);align-items:end;margin-bottom:clamp(42px,6vw,78px)}.kw-case__stage{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(310px,.65fr);overflow:hidden;border:1px solid var(--kw-white-line);border-radius:28px;background:#111311}.kw-case__image{min-height:680px;display:grid;place-items:center;background:#eeeae1;overflow:hidden}.kw-case__image img{width:100%;height:100%;object-fit:contain;display:block}.kw-facts{display:grid;grid-template-columns:1fr}.kw-fact{min-height:170px;padding:26px;border-bottom:1px solid var(--kw-white-line);display:flex;flex-direction:column;justify-content:space-between}.kw-fact:last-child{border-bottom:0}.kw-fact b{font-size:clamp(38px,4vw,58px);line-height:1;letter-spacing:-.05em}.kw-fact small{color:var(--kw-sage);font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.kw-fact span{color:rgba(255,255,255,.58);font-size:11px;line-height:1.45}
.kw-measure{padding:clamp(82px,10vw,144px) 0;background:var(--kw-ivory)}.kw-measure__head{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(40px,8vw,120px);align-items:end;margin-bottom:56px}.kw-measure-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.kw-measure-card{position:relative;min-height:360px;padding:28px;border:1px solid var(--kw-line);border-radius:22px;background:rgba(255,255,255,.48);overflow:hidden;display:flex;flex-direction:column;justify-content:space-between}.kw-measure-card:nth-child(2),.kw-measure-card:nth-child(5){background:#dfe6df}.kw-measure-card:nth-child(3),.kw-measure-card:nth-child(6){background:#e7dccb}.kw-measure-card strong{font-size:clamp(29px,3vw,42px);letter-spacing:-.045em}.kw-measure-card p{margin:0;color:#666a65;font-size:12px}.kw-wave{height:104px;display:flex;align-items:end;gap:5px}.kw-wave i{display:block;flex:1;max-width:12px;border-radius:999px 999px 2px 2px;background:rgba(21,23,22,.65);transform-origin:bottom}.kw-wave i:nth-child(1){height:24%}.kw-wave i:nth-child(2){height:64%}.kw-wave i:nth-child(3){height:44%}.kw-wave i:nth-child(4){height:82%}.kw-wave i:nth-child(5){height:57%}.kw-wave i:nth-child(6){height:96%}.kw-wave i:nth-child(7){height:69%}.kw-wave i:nth-child(8){height:38%}.kw-wave i:nth-child(9){height:74%}.kw-wave i:nth-child(10){height:51%}
.kw-score{padding:clamp(82px,10vw,150px) 0;background:#111312;color:#fff}.kw-score .kw-ey{color:var(--kw-beige)}.kw-score .kw-title em{color:var(--kw-sage)}.kw-score .kw-copy{color:rgba(255,255,255,.63)}.kw-score__grid{display:grid;grid-template-columns:.82fr 1.18fr;gap:clamp(48px,8vw,130px);align-items:center}.kw-score-card{position:relative;min-height:620px;padding:34px;border:1px solid var(--kw-white-line);border-radius:30px;background:radial-gradient(circle at 50% 33%,rgba(147,170,159,.18),transparent 30%),linear-gradient(160deg,#181b19,#0d0f0e);box-shadow:0 30px 90px rgba(0,0,0,.34)}.kw-score-head{display:flex;justify-content:space-between;gap:20px;color:rgba(255,255,255,.52);font-size:9px;letter-spacing:.12em;text-transform:uppercase}.kw-score-orb{width:min(320px,62%);aspect-ratio:1;margin:48px auto 42px;border-radius:50%;display:grid;place-items:center;text-align:center;border:1px solid rgba(147,170,159,.42);box-shadow:inset 0 0 0 22px rgba(147,170,159,.055),0 0 70px rgba(147,170,159,.10)}.kw-score-orb b{display:block;font-size:clamp(70px,8vw,112px);line-height:.78;letter-spacing:-.08em}.kw-score-orb span{display:block;margin-top:12px;color:var(--kw-sage);font-size:9px;letter-spacing:.14em;text-transform:uppercase}.kw-score-bars{display:grid;gap:15px}.kw-score-row{display:grid;grid-template-columns:100px 1fr 34px;gap:14px;align-items:center;font-size:10px;color:rgba(255,255,255,.68)}.kw-score-row i{height:3px;background:rgba(255,255,255,.12);border-radius:999px;overflow:hidden}.kw-score-row i:before{content:'';display:block;height:100%;width:var(--v);background:var(--kw-sage);border-radius:inherit}.kw-score-note{margin:20px 0 0;color:rgba(255,255,255,.35);font-size:8px;text-align:right}
.kw-flow{padding:clamp(82px,10vw,142px) 0;background:var(--kw-paper)}.kw-flow__head{display:grid;grid-template-columns:1fr 1fr;gap:clamp(42px,8vw,120px);align-items:end;margin-bottom:52px}.kw-flow-list{border-top:1px solid var(--kw-ink)}.kw-flow-step{display:grid;grid-template-columns:90px .65fr 1.35fr;gap:28px;align-items:center;padding:32px 0;border-bottom:1px solid var(--kw-line)}.kw-flow-step>span{color:var(--kw-sage-dark);font-size:10px;font-weight:850;letter-spacing:.12em}.kw-flow-step h3{margin:0;font-size:clamp(31px,3vw,44px);letter-spacing:-.045em}.kw-flow-step p{margin:0;color:#737670;font-size:13px;line-height:1.55}
.kw-pulse{position:relative;padding:clamp(82px,10vw,146px) 0;background:#d9c4a2;overflow:hidden}.kw-pulse:after{content:'PULSE';position:absolute;right:-2vw;bottom:-3vw;color:rgba(255,255,255,.28);font-size:clamp(120px,23vw,340px);font-weight:900;line-height:.72;letter-spacing:-.09em;pointer-events:none}.kw-pulse__grid{position:relative;z-index:1;display:grid;grid-template-columns:1fr .86fr;gap:clamp(44px,8vw,120px);align-items:end}.kw-pulse .kw-title{font-size:clamp(54px,7.2vw,108px)}.kw-pulse .kw-title em{color:#597066}.kw-pulse .kw-copy{color:#4d4b46}.kw-pulse-actions{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-top:28px}
.kw-use{padding:clamp(82px,10vw,144px) 0;background:var(--kw-ivory)}.kw-use__head{max-width:980px;margin-bottom:52px}.kw-use-grid{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--kw-ink);border-bottom:1px solid var(--kw-ink)}.kw-use-card{min-height:420px;padding:36px 42px 36px 0;display:flex;flex-direction:column;justify-content:space-between}.kw-use-card+ .kw-use-card{padding-left:42px;border-left:1px solid var(--kw-line)}.kw-use-card small{color:var(--kw-sage-dark);font-size:9px;font-weight:850;letter-spacing:.13em;text-transform:uppercase}.kw-use-card h3{margin:80px 0 18px;font-size:clamp(40px,4.6vw,66px);line-height:.92;letter-spacing:-.055em}.kw-use-card p{margin:0;max-width:520px;color:#727570;font-size:13px;line-height:1.6}.kw-use-card a{margin-top:28px;align-self:flex-start;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:3px;font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.04em}
.kw-proof{padding:clamp(76px,9vw,130px) 0;background:#e4e7e2}.kw-proof__grid{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(48px,8vw,130px);align-items:end}.kw-proof .kw-copy{margin-top:28px}.kw-proof .kw-link{margin-top:24px}
.kw-final{padding:clamp(86px,11vw,170px) 0;background:var(--kw-black);color:#fff}.kw-final .kw-ey{color:var(--kw-beige)}.kw-final .kw-title{font-size:clamp(58px,8.6vw,130px)}.kw-final .kw-title em{color:var(--kw-sage)}.kw-final__bottom{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:end;margin-top:54px;padding-top:28px;border-top:1px solid var(--kw-white-line)}.kw-final p{margin:0;color:rgba(255,255,255,.62);font-size:16px}.kw-final-actions{display:flex;justify-content:flex-end;gap:12px;flex-wrap:wrap}.kw-beta{margin:34px 0 0;padding-top:18px;border-top:1px solid var(--kw-white-line);color:rgba(255,255,255,.35);font-size:9px;line-height:1.5}
@media(max-width:980px){.kw-shell{width:min(calc(100% - 40px),860px)}.kw-statement__grid,.kw-case__head,.kw-score__grid,.kw-flow__head,.kw-pulse__grid,.kw-proof__grid{grid-template-columns:1fr}.kw-case__stage{grid-template-columns:1fr}.kw-case__image{min-height:0;aspect-ratio:1024/1151}.kw-facts{grid-template-columns:1fr 1fr}.kw-fact:nth-child(2){border-right:0}.kw-fact{border-right:1px solid var(--kw-white-line)}.kw-fact:nth-child(even){border-right:0}.kw-measure-grid{grid-template-columns:1fr 1fr}.kw-score__grid{gap:40px}.kw-score-card{max-width:720px}.kw-use-grid{grid-template-columns:1fr}.kw-use-card+ .kw-use-card{padding-left:0;border-left:0;border-top:1px solid var(--kw-line)}.kw-final__bottom{grid-template-columns:1fr}.kw-final-actions{justify-content:flex-start}}
@media(max-width:620px){.kw-shell{width:min(calc(100% - 28px),860px)}.kw-statement,.kw-case,.kw-measure,.kw-score,.kw-flow,.kw-pulse,.kw-use,.kw-proof,.kw-final{padding:64px 0}.kw-title,.kw-statement .kw-title,.kw-pulse .kw-title,.kw-final .kw-title{font-size:47px;line-height:.91}.kw-copy{font-size:15px}.kw-case__head,.kw-measure__head{margin-bottom:30px}.kw-case__stage{border-radius:20px}.kw-facts{grid-template-columns:1fr}.kw-fact{min-height:118px;padding:20px;border-right:0}.kw-fact b{font-size:42px}.kw-measure-grid{grid-template-columns:1fr}.kw-measure-card{min-height:270px;padding:22px}.kw-wave{height:74px}.kw-score-card{min-height:520px;padding:22px;border-radius:22px}.kw-score-orb{width:70%;margin:38px auto 34px}.kw-score-row{grid-template-columns:76px 1fr 28px;gap:9px}.kw-flow-step{grid-template-columns:34px 1fr;gap:12px;padding:22px 0}.kw-flow-step p{grid-column:2}.kw-pulse:after{font-size:42vw;bottom:-1vw}.kw-pulse-actions{display:grid}.kw-pulse-actions .kw-btn,.kw-pulse-actions .kw-link{width:100%;justify-content:center}.kw-use-card{min-height:300px;padding:26px 0}.kw-use-card h3{margin:52px 0 14px;font-size:42px}.kw-final__bottom{margin-top:34px}.kw-final-actions{display:grid}.kw-final-actions .kw-btn,.kw-final-actions .kw-link{width:100%;justify-content:center}}
</style>`;

function navHtml(p){return p.nav.map(([t,h])=>`<a href="${h}">${t}</a>`).join('')}
function waves(){return '<div class="kw-wave" aria-hidden="true">'+Array.from({length:10},()=>'<i></i>').join('')+'</div>'}
function story(p){
  const measureCards=p.measures.map(([t,b])=>`<article class="kw-measure-card"><div><strong>${t}</strong><p>${b}</p></div>${waves()}</article>`).join('');
  const facts=p.facts.map(([n,t,b])=>`<div class="kw-fact"><small>${t}</small><b>${n}</b><span>${b}</span></div>`).join('');
  const flow=p.flow.map(([n,t,b])=>`<article class="kw-flow-step"><span>${n}</span><h3>${t}</h3><p>${b}</p></article>`).join('');
  const uses=p.uses.map(([t,b,cta,href],i)=>`<article class="kw-use-card"><div><small>${i===0?'01':'02'}</small><h3>${t}</h3><p>${b}</p></div><a href="${href}">${cta}</a></article>`).join('');
  const bars=p.scoreLabels.map((t,i)=>`<div class="kw-score-row"><span>${t}</span><i style="--v:${[84,79,88,82][i]}%"></i><b>${[84,79,88,82][i]}</b></div>`).join('');
  return `<div class="kw">
<section class="kw-statement"><div class="kw-shell kw-statement__grid"><div><p class="kw-ey">${p.eyebrow}</p><h2 class="kw-title">${p.statement}</h2></div><p class="kw-copy">${p.statementCopy}</p></div></section>
<section class="kw-case" id="case"><div class="kw-shell"><div class="kw-case__head"><div><p class="kw-ey">${p.caseEy}</p><h2 class="kw-title">${p.caseTitle}</h2></div><p class="kw-copy">${p.caseCopy}</p></div><div class="kw-case__stage"><div class="kw-case__image"><picture><source srcset="/assets/images/komo-case-hero-final.avif" type="image/avif"><img src="/assets/images/komo-case-hero-fallback.jpeg" alt="KŌMØ Case" loading="lazy" decoding="async"></picture></div><div class="kw-facts">${facts}</div></div></div></section>
<section class="kw-measure" id="measure"><div class="kw-shell"><div class="kw-measure__head"><div><p class="kw-ey">${p.measureEy}</p><h2 class="kw-title">${p.measureTitle}</h2></div><p class="kw-copy">${p.measureCopy}</p></div><div class="kw-measure-grid">${measureCards}</div></div></section>
<section class="kw-score" id="score"><div class="kw-shell kw-score__grid"><div><p class="kw-ey">${p.scoreEy}</p><h2 class="kw-title">${p.scoreTitle}</h2><p class="kw-copy" style="margin-top:28px">${p.scoreCopy}</p></div><div class="kw-score-card"><div class="kw-score-head"><span>KŌMØ PULSE</span><span>MOTION / SESSION</span></div><div class="kw-score-orb"><div><b>84</b><span>Motion Score</span></div></div><div class="kw-score-bars">${bars}</div><p class="kw-score-note">${p.scoreNote}</p></div></div></section>
<section class="kw-flow"><div class="kw-shell"><div class="kw-flow__head"><div><p class="kw-ey">${p.flowEy}</p><h2 class="kw-title">${p.flowTitle}</h2></div><p class="kw-copy">${p.statementCopy}</p></div><div class="kw-flow-list">${flow}</div></div></section>
<section class="kw-pulse" id="pulse"><div class="kw-shell kw-pulse__grid"><div><p class="kw-ey">${p.pulseEy}</p><h2 class="kw-title">${p.pulseTitle}</h2></div><div><p class="kw-copy">${p.pulseCopy}</p><div class="kw-pulse-actions"><a class="kw-btn" href="https://pulse.komolongevity.com/">${p.pulseCta}</a><a class="kw-link" href="#score">Motion Score →</a></div></div></div></section>
<section class="kw-use"><div class="kw-shell"><div class="kw-use__head"><p class="kw-ey">${p.useEy}</p><h2 class="kw-title">${p.useTitle}</h2></div><div class="kw-use-grid">${uses}</div></div></section>
<section class="kw-proof"><div class="kw-shell kw-proof__grid"><div><p class="kw-ey">${p.proofEy}</p><h2 class="kw-title">${p.proofTitle}</h2></div><div><p class="kw-copy">${p.proofCopy}</p><a class="kw-link" href="${p.proofHref}">${p.proofCta}</a></div></div></section>
<section class="kw-final"><div class="kw-shell"><p class="kw-ey">${p.finalEy}</p><h2 class="kw-title">${p.finalTitle}</h2><div class="kw-final__bottom"><p>${p.finalCopy}</p><div class="kw-final-actions"><a class="kw-btn kw-btn--light" href="#case">${p.finalCase}</a><a class="kw-btn" href="https://pulse.komolongevity.com/">${p.finalPulse}</a><a class="kw-link" href="${p.uses[1][3]}">${p.finalPro}</a></div></div><p class="kw-beta">${p.beta}</p></div></section>
</div>`;
}

for (const p of pages) {
  let html = await readFile(p.file, 'utf8');
  if (!html.includes('class="kpf-hero"')) throw new Error(`[homepage-whoop-product-v2] ${p.lang}: hero not found`);
  const heroMarker = html.indexOf('class="kpf-hero"');
  const heroEnd = html.indexOf('</section>', heroMarker) + '</section>'.length;
  // The product-home pass can run after either the historical compact home or
  // the current Riviera hero.  The compact home carried a disclaimer section;
  // the latter does not.  In that case the rest of <main> is the safe boundary
  // for this legacy rebuild.
  const disclaimerAt = html.indexOf('<section class="kb-disclaimer"', heroEnd);
  const storyEnd = disclaimerAt >= 0 ? disclaimerAt : html.indexOf('</main>', heroEnd);
  if (heroEnd < '</section>'.length || storyEnd < 0) throw new Error(`[homepage-whoop-product-v2] ${p.lang}: boundaries not found`);
  let hero = html.slice(html.lastIndexOf('<section', heroMarker), heroEnd);
  hero = hero.replace(/<aside class="kb-status"[\s\S]*?<\/aside>/i, '');
  hero = hero.replace(/<div class="kpf-actions kb-hero-actions">[\s\S]*?<\/div>/i, `<div class="kpf-actions"><a class="kpf-btn" href="#case">${p.finalCase}</a><a class="kpf-link" href="https://pulse.komolongevity.com/">${p.finalPulse} →</a></div>`);
  const heroStart = html.lastIndexOf('<section', heroMarker);
  html = html.slice(0, heroStart) + hero + story(p) + html.slice(storyEnd);
  html = html.replace(/<nav class="kp-nav">[\s\S]*?<\/nav>/i, `<nav class="kp-nav">${navHtml(p)}</nav>`);
  html = html.replace(/(<details class="kp-menu">[\s\S]*?<nav>)[\s\S]*?(<\/nav>[\s\S]*?<\/details>)/i, `$1${navHtml(p)}$2`);
  if (!html.includes('homepage-whoop-product-v2-style')) html = html.replace('</head>', `${CSS}</head>`);
  await writeFile(p.file, html);
  console.log(`[homepage-whoop-product-v2] rebuilt ${p.lang} homepage`);
}
