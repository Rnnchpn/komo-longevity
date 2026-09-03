import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const site = join(root, 'site');
const images = '/assets/images/real-case/';

const locales = {
  fr: {
    home: join(site, 'fr', 'index.html'),
    partnersPage: join(site, 'fr', 'partners', 'index.html'),
    contactPage: join(site, 'fr', 'contact', 'index.html'),
    paths: { home: '/fr/', case: '/fr/case/', partners: '/fr/partners/', contact: '/fr/contact/?intent=demo', method: '/fr/methode/', pulse: 'https://pulse.komolongevity.com/' },
    homeMeta: ['KŌMØ Case — Mesurer la mobilité. La suivre dans Pulse.', 'KŌMØ Case associe six capteurs Myodev, des tests fonctionnels et KŌMØ Pulse pour rendre la mobilité mesurable, lisible et suivie dans le temps.'],
    partnersMeta: ['KŌMØ Riviera — Demande de démonstration professionnelle', 'Démonstrations KŌMØ Case sur la Riviera pour centres médicaux, longévité, hôtels premium, fitness et performance.'],
    contactMeta: ['Demander une démo KŌMØ — Riviera', 'Présentez votre établissement, votre ville, votre activité et le type de partenariat KŌMØ que vous souhaitez explorer.'],
    hero: {
      eyebrow: 'KŌMØ CASE · POWERED BY MYODEV',
      title: 'La mobilité devient<br><em>mesurable. Puis actionnable.</em>',
      lead: 'Une Case, un protocole, six capteurs et Pulse pour transformer une session locomotrice en repères simples à comprendre, suivre et utiliser.',
      demo: 'Demander une démo', case: 'Découvrir la Case',
      caption: 'KŌMØ Case réelle · six capteurs Myodev · deux iPads · trépied.',
      alt: 'KŌMØ Case ouverte avec les six capteurs, une tablette et le trépied.'
    },
    path: {
      eyebrow: 'DE LA CASE AU PLAN', title: 'Le parcours se comprend<br><em>en cinq secondes.</em>',
      lead: 'Le matériel sert une séquence claire : acquérir, lire, puis donner une suite adaptée au contexte de la personne et du lieu.',
      steps: [
        ['01', 'Case', 'Le système réel, portable et préparé pour la session.'],
        ['02', 'Mesure', 'Tests fonctionnels et acquisition avec les six capteurs.'],
        ['03', 'Motion Score', 'Une synthèse visuelle des dimensions mesurées.'],
        ['04', 'Pulse', 'Résultats, sessions et trajectoire réunis au même endroit.'],
        ['05', 'Plan', 'Priorités contextualisées par le professionnel ou le programme.']
      ]
    },
    kit: {
      eyebrow: 'LE SYSTÈME RÉEL', title: 'Une Case.<br><em>Tout ce qui compte sur place.</em>',
      copy: 'La Case contient le matériel de terrain nécessaire à une acquisition structurée. Aucun rendu, aucune promesse abstraite : voici le système réellement utilisé.',
      imageAlt: 'Gros plan réel des six capteurs Myodev dans la KŌMØ Case.',
      imageCaption: 'Les six capteurs Myodev, prêts pour la session.',
      contents: [['06', 'capteurs Myodev'], ['02', 'iPads'], ['01', 'trépied'], ['01', 'workflow Pulse']],
      poweredTitle: 'Powered by Myodev.',
      poweredCopy: 'Myodev fournit les capteurs et Myocare traite la composante musculaire selon les indicateurs disponibles. KŌMØ organise ensuite le protocole, les autres dimensions et leur continuité dans Pulse.'
    },
    session: {
      eyebrow: 'UNE SESSION RÉELLE', title: 'Le capteur est porté.<br><em>La mesure reste humaine.</em>',
      copy: 'La tablette accompagne l’acquisition. Le protocole garde les conditions de mesure, les tests fonctionnels et le contexte explicites.',
      caption: 'Acquisition réelle : capteurs portés et tablette opérateur.',
      alt: 'Personne équipée de capteurs Myodev pendant une acquisition avec tablette opérateur.'
    },
    boundary: {
      eyebrow: 'PREUVES · MÉTHODE · LIMITES', title: 'Une technologie réelle.<br><em>Des responsabilités distinctes.</em>',
      motion: ['KŌMØ Motion', 'Mesure fonctionnelle et restitution non médicale dans les contextes appropriés.'],
      clinical: ['KŌMØ Clinical', 'Interprétation, indication et décisions de soin restent sous la responsabilité du médecin autorisé à exercer.'],
      note: 'Le Motion Score est une synthèse méthodologique KŌMØ en validation progressive. Il ne constitue ni un diagnostic, ni un avis médical, ni une décision de soin.',
      method: 'Voir la méthode et les limites'
    },
    final: { eyebrow: 'RIVIERA · DÉMONSTRATIONS PRIVÉES', title: 'Voir la Case.<br><em>Dans votre lieu.</em>', copy: 'Centres médicaux et de longévité, hôtels premium, performance et partenaires privés : une démonstration commence par votre contexte.', cta: 'Demander une démonstration' },
    partners: {
      eyebrow: 'KŌMØ RIVIERA · PROFESSIONAL DEPLOYMENT', title: 'Déployer KŌMØ<br><em>dans un lieu qui vous ressemble.</em>',
      lead: 'KŌMØ Case rend une évaluation locomotrice premium déployable dans les centres médicaux, la longévité, l’hospitality et la performance. La démonstration part de votre activité, pas d’un catalogue générique.',
      demo: 'Demander une démo', case: 'Voir la Case',
      caption: 'Système KŌMØ Case réel, prêt pour une session sur site.', alt: 'KŌMØ Case ouverte, vue de face, avec les six capteurs Myodev et une tablette.',
      territory: 'Cannes → Antibes → Nice → Monaco → Saint-Tropez',
      territoryNote: 'Séquence de déploiement Riviera · démonstrations privées sur rendez-vous.',
      sectorsEy: 'POUR QUELS LIEUX ?', sectorsTitle: 'Quatre secteurs.<br><em>Une même exigence de mesure.</em>',
      sectors: [
        ['Centres médicaux & longévité', 'Pour structurer un bilan locomoteur et un suivi dans un parcours de santé adapté.'],
        ['Hôtels, spas & private clubs', 'Pour ajouter une expérience de mobilité premium, avec une frontière médicale claire.'],
        ['Fitness, sport & performance', 'Pour objectiver les références fonctionnelles et suivre les progrès dans le temps.'],
        ['Conciergerie & formats privés', 'Pour déployer une session mobile dans un lieu sélectionné, avec un protocole stable.']
      ],
      demoEy: 'COMMENT SE DÉROULE UNE DÉMO ?', demoTitle: 'Quatre temps.<br><em>Une lecture immédiate.</em>',
      demoSteps: [
        ['01', 'Votre contexte', 'Établissement, activité, équipe et ambition de l’offre.'],
        ['02', 'La Case en action', 'Présentation du matériel réel, des capteurs et du protocole.'],
        ['03', 'Mesure & Pulse', 'Lecture du flux d’acquisition, de la restitution et du suivi.'],
        ['04', 'Plan d’intégration', 'Pilote, acquisition ou déploiement multi-sites selon votre contexte.']
      ],
      integrationEy: 'INTÉGRATION SUR SITE', integrationTitle: 'Pas de laboratoire à installer.<br><em>Un protocole à rendre fiable.</em>',
      integrationCopy: 'Nous définissons la zone de mesure, le rôle de l’opérateur, la séquence de la session, la restitution et le lien avec Pulse. L’objectif est une expérience cohérente pour l’équipe comme pour la personne évaluée.',
      integrationItems: [['Format', 'Une Case mobile, préparée avant chaque session.'], ['Équipe', 'Onboarding opérateur et cadre d’utilisation adapté au lieu.'], ['Parcours', 'Mesure, restitution et continuité dans Pulse.']],
      proofEy: 'TECHNOLOGIE & CADRE', proofTitle: 'Le réel avant le marketing.',
      proofCopy: 'Powered by Myodev. Les capteurs sont fournis par Myodev. KŌMØ n’efface pas l’origine des données : Myocare traite sa composante musculaire, tandis que Pulse organise la session et la continuité du parcours.',
      proofNote: 'Motion ne diagnostique pas. Lorsqu’un acte, une interprétation ou une décision médicale est envisagé, le cadre Clinical et la responsabilité du médecin s’appliquent.',
      finalEy: 'UN PREMIER ÉCHANGE', finalTitle: 'Votre établissement.<br><em>La bonne forme de déploiement.</em>', finalCopy: 'Demandez une démonstration : nous vous rappellerons avec les questions utiles, pas avec un formulaire générique.', finalCta: 'Demander une démo KŌMØ'
    },
    contact: { eyebrow: 'AVANT LA DÉMONSTRATION', title: 'Ce que nous vous demanderons.', lead: 'Quatre informations concrètes pour préparer une démonstration KŌMØ pertinente dès le premier échange.', items: [['Établissement', 'Nom et type de structure.'], ['Ville', 'Pour organiser la séquence Riviera ou une autre implantation.'], ['Activité', 'Médical, longévité, hospitality, fitness, performance ou format privé.'], ['Partenariat', 'Demande de démo, pilote, acquisition, multi-sites ou distribution.']], note: 'Aucune donnée patient ni donnée de santé ne doit être transmise dans ce formulaire public.' }
  },
  en: {
    home: join(site, 'index.html'),
    partnersPage: join(site, 'partners', 'index.html'),
    contactPage: join(site, 'contact', 'index.html'),
    paths: { home: '/', case: '/case/', partners: '/partners/', contact: '/contact/?intent=demo', method: '/method/', pulse: 'https://pulse.komolongevity.com/' },
    homeMeta: ['KŌMØ Case — Measure mobility. Follow it in Pulse.', 'KŌMØ Case brings together six Myodev sensors, functional testing and KŌMØ Pulse to make mobility measurable, understandable and trackable over time.'],
    partnersMeta: ['KŌMØ Riviera — Professional demo request', 'Private KŌMØ Case demonstrations on the French Riviera for medical centres, longevity, premium hospitality, fitness and performance.'],
    contactMeta: ['Request a KŌMØ demo — Riviera', 'Tell us about your establishment, city, activity and the KŌMØ partnership format you would like to explore.'],
    hero: {
      eyebrow: 'KŌMØ CASE · POWERED BY MYODEV', title: 'Mobility becomes<br><em>measurable. Then actionable.</em>',
      lead: 'One Case, one protocol, six sensors and Pulse to turn a locomotor session into reference points that can be understood, followed and used.', demo: 'Request a demo', case: 'Discover the Case',
      caption: 'The real KŌMØ Case · six Myodev sensors · two iPads · tripod.', alt: 'Open KŌMØ Case with six sensors, a tablet and tripod.'
    },
    path: { eyebrow: 'CASE TO PLAN', title: 'The journey makes sense<br><em>in five seconds.</em>', lead: 'The equipment serves a clear sequence: acquire, understand, then shape the next step around the person and the setting.', steps: [['01','Case','The real portable system, ready for the session.'],['02','Measure','Functional tests and six-sensor acquisition.'],['03','Motion Score','A visual synthesis of the measured dimensions.'],['04','Pulse','Sessions, results and trajectory in one place.'],['05','Plan','Priorities contextualised by the professional or programme.']] },
    kit: { eyebrow: 'THE REAL SYSTEM', title: 'One Case.<br><em>Everything that matters on site.</em>', copy: 'The Case holds the field equipment needed for a structured acquisition. No artificial rendering, no abstract promise: this is the system used in the real session.', imageAlt: 'Real close-up of the six Myodev sensors inside the KŌMØ Case.', imageCaption: 'The six Myodev sensors, ready for the session.', contents: [['06','Myodev sensors'],['02','iPads'],['01','tripod'],['01','Pulse workflow']], poweredTitle: 'Powered by Myodev.', poweredCopy: 'Myodev supplies the sensors and Myocare processes the muscle component according to the available indicators. KŌMØ then structures the protocol, the other dimensions and their continuity in Pulse.' },
    session: { eyebrow: 'A REAL SESSION', title: 'Sensors are worn.<br><em>Measurement stays human.</em>', copy: 'The tablet supports the acquisition. The protocol keeps the measurement conditions, functional testing and context explicit.', caption: 'Real acquisition: worn sensors and operator tablet.', alt: 'Person wearing Myodev sensors during an acquisition with an operator tablet.' },
    boundary: { eyebrow: 'EVIDENCE · METHOD · BOUNDARIES', title: 'Real technology.<br><em>Distinct responsibilities.</em>', motion: ['KŌMØ Motion','Non-medical functional measurement and feedback in appropriate settings.'], clinical: ['KŌMØ Clinical','Interpretation, indication and care decisions remain the responsibility of the licensed physician.'], note: 'Motion Score is a KŌMØ methodological synthesis undergoing progressive validation. It is not a diagnosis, medical advice or a care decision.', method: 'See the method and boundaries' },
    final: { eyebrow: 'RIVIERA · PRIVATE DEMONSTRATIONS', title: 'See the Case.<br><em>In your setting.</em>', copy: 'Medical and longevity centres, premium hospitality, performance and private partners: a demonstration begins with your context.', cta: 'Request a demonstration' },
    partners: {
      eyebrow: 'KŌMØ RIVIERA · PROFESSIONAL DEPLOYMENT', title: 'Deploy KŌMØ<br><em>in a setting that fits you.</em>', lead: 'KŌMØ Case makes a premium locomotor assessment deployable across medical centres, longevity, hospitality and performance. The demonstration starts with your activity, not a generic catalogue.', demo: 'Request a demo', case: 'See the Case', caption: 'The real KŌMØ Case system, ready for an on-site session.', alt: 'Open KŌMØ Case with six Myodev sensors and tablet, front view.', territory: 'Cannes → Antibes → Nice → Monaco → Saint-Tropez', territoryNote: 'Riviera deployment sequence · private demonstrations by appointment.',
      sectorsEy: 'WHO IS IT FOR?', sectorsTitle: 'Four sectors.<br><em>One measurement standard.</em>', sectors: [['Medical & longevity centres','To structure a locomotor assessment and follow-up in an appropriate health pathway.'],['Hotels, spas & private clubs','To add a premium mobility experience with a clear medical boundary.'],['Fitness, sport & performance','To objectify functional reference points and follow progress over time.'],['Concierge & private formats','To deploy a mobile session in a selected setting with a stable protocol.']],
      demoEy: 'WHAT HAPPENS IN A DEMO?', demoTitle: 'Four moments.<br><em>Immediate clarity.</em>', demoSteps: [['01','Your context','Establishment, activity, team and offer ambition.'],['02','The Case in action','The real equipment, sensors and protocol.'],['03','Measurement & Pulse','Acquisition, feedback and follow-up flow.'],['04','Integration plan','Pilot, acquisition or multi-site deployment for your context.']],
      integrationEy: 'ON-SITE INTEGRATION', integrationTitle: 'No laboratory to install.<br><em>A protocol to make reliable.</em>', integrationCopy: 'We define the measurement area, the operator role, the session sequence, the feedback and the link with Pulse. The aim is a coherent experience for the team and the person being assessed.', integrationItems: [['Format','One mobile Case, prepared before every session.'],['Team','Operator onboarding and an appropriate use framework.'],['Pathway','Measurement, feedback and continuity in Pulse.']],
      proofEy: 'TECHNOLOGY & BOUNDARY', proofTitle: 'Reality before marketing.', proofCopy: 'Powered by Myodev. Myodev supplies the sensors. KŌMØ keeps data origins visible: Myocare handles its muscle component, while Pulse structures the session and the continuity of the pathway.', proofNote: 'Motion does not diagnose. When a medical act, interpretation or decision is involved, the Clinical framework and physician responsibility apply.', finalEy: 'A FIRST CONVERSATION', finalTitle: 'Your setting.<br><em>The right deployment model.</em>', finalCopy: 'Request a demonstration: we will come back with the useful questions, not a generic form.', finalCta: 'Request a KŌMØ demo'
    },
    contact: { eyebrow: 'BEFORE THE DEMONSTRATION', title: 'What we will ask you.', lead: 'Four concrete details are enough to prepare a relevant KŌMØ demonstration from the first exchange.', items: [['Establishment','Name and type of organisation.'],['City','To plan the Riviera sequence or another location.'],['Activity','Medical, longevity, hospitality, fitness, performance or private format.'],['Partnership','Demo request, pilot, acquisition, multi-site or distribution.']], note: 'Do not submit patient names or health data through this public form.' }
  },
  es: {
    home: join(site, 'es', 'index.html'),
    partnersPage: join(site, 'es', 'partners', 'index.html'),
    contactPage: join(site, 'es', 'contact', 'index.html'),
    paths: { home: '/es/', case: '/es/case/', partners: '/es/partners/', contact: '/es/contact/?intent=demo', method: '/es/metodo/', pulse: 'https://pulse.komolongevity.com/' },
    homeMeta: ['KŌMØ Case — Medir la movilidad. Seguirla en Pulse.', 'KŌMØ Case reúne seis sensores Myodev, pruebas funcionales y KŌMØ Pulse para hacer la movilidad medible, comprensible y seguida en el tiempo.'],
    partnersMeta: ['KŌMØ Riviera — Solicitud de demo profesional', 'Demostraciones privadas de KŌMØ Case en la Riviera Francesa para centros médicos, longevidad, hospitality premium, fitness y rendimiento.'],
    contactMeta: ['Solicitar una demo KŌMØ — Riviera', 'Cuéntanos tu establecimiento, ciudad, actividad y el formato de partnership KŌMØ que quieres explorar.'],
    hero: { eyebrow: 'KŌMØ CASE · POWERED BY MYODEV', title: 'La movilidad se vuelve<br><em>medible. Y accionable.</em>', lead: 'Una Case, un protocolo, seis sensores y Pulse para transformar una sesión locomotora en referencias simples de comprender, seguir y utilizar.', demo: 'Solicitar una demo', case: 'Descubrir la Case', caption: 'KŌMØ Case real · seis sensores Myodev · dos iPads · trípode.', alt: 'KŌMØ Case abierta con seis sensores, una tableta y trípode.' },
    path: { eyebrow: 'DE LA CASE AL PLAN', title: 'El recorrido se entiende<br><em>en cinco segundos.</em>', lead: 'El material sirve una secuencia clara: adquirir, comprender y definir el siguiente paso según la persona y el contexto.', steps: [['01','Case','El sistema real y portátil, preparado para la sesión.'],['02','Medir','Pruebas funcionales y adquisición con seis sensores.'],['03','Motion Score','Una síntesis visual de las dimensiones medidas.'],['04','Pulse','Sesiones, resultados y trayectoria reunidos.'],['05','Plan','Prioridades contextualizadas por el profesional o programa.']] },
    kit: { eyebrow: 'EL SISTEMA REAL', title: 'Una Case.<br><em>Todo lo importante en el lugar.</em>', copy: 'La Case contiene el material de campo necesario para una adquisición estructurada. Sin render artificial ni promesa abstracta: es el sistema utilizado en la sesión real.', imageAlt: 'Primer plano real de los seis sensores Myodev dentro de la KŌMØ Case.', imageCaption: 'Los seis sensores Myodev, preparados para la sesión.', contents: [['06','sensores Myodev'],['02','iPads'],['01','trípode'],['01','workflow Pulse']], poweredTitle: 'Powered by Myodev.', poweredCopy: 'Myodev suministra los sensores y Myocare procesa el componente muscular según los indicadores disponibles. KŌMØ organiza después el protocolo, las demás dimensiones y su continuidad en Pulse.' },
    session: { eyebrow: 'UNA SESIÓN REAL', title: 'Los sensores se llevan.<br><em>La medición sigue siendo humana.</em>', copy: 'La tableta acompaña la adquisición. El protocolo mantiene explícitas las condiciones, las pruebas funcionales y el contexto.', caption: 'Adquisición real: sensores llevados y tableta del operador.', alt: 'Persona con sensores Myodev durante una adquisición con tableta del operador.' },
    boundary: { eyebrow: 'EVIDENCIA · MÉTODO · LÍMITES', title: 'Tecnología real.<br><em>Responsabilidades distintas.</em>', motion: ['KŌMØ Motion','Medición funcional y restitución no médica en contextos apropiados.'], clinical: ['KŌMØ Clinical','La interpretación, indicación y decisiones asistenciales son responsabilidad del médico autorizado.'], note: 'Motion Score es una síntesis metodológica KŌMØ en validación progresiva. No es un diagnóstico, consejo médico ni decisión de cuidado.', method: 'Ver método y límites' },
    final: { eyebrow: 'RIVIERA · DEMOSTRACIONES PRIVADAS', title: 'Ver la Case.<br><em>En tu lugar.</em>', copy: 'Centros médicos y de longevidad, hospitality premium, rendimiento y partners privados: una demostración empieza por tu contexto.', cta: 'Solicitar una demostración' },
    partners: { eyebrow: 'KŌMØ RIVIERA · DESPLIEGUE PROFESIONAL', title: 'Desplegar KŌMØ<br><em>en un lugar que encaje contigo.</em>', lead: 'KŌMØ Case hace desplegable una evaluación locomotora premium en centros médicos, longevidad, hospitality y rendimiento. La demostración parte de tu actividad, no de un catálogo genérico.', demo: 'Solicitar una demo', case: 'Ver la Case', caption: 'Sistema KŌMØ Case real, preparado para una sesión in situ.', alt: 'KŌMØ Case abierta con seis sensores Myodev y tableta, vista frontal.', territory: 'Cannes → Antibes → Nice → Monaco → Saint-Tropez', territoryNote: 'Secuencia de despliegue Riviera · demostraciones privadas con cita.', sectorsEy: '¿PARA QUÉ LUGARES?', sectorsTitle: 'Cuatro sectores.<br><em>Un mismo estándar de medición.</em>', sectors: [['Centros médicos y de longevidad','Para estructurar una evaluación locomotora y seguimiento en un recorrido de salud adecuado.'],['Hoteles, spas y private clubs','Para añadir una experiencia de movilidad premium con un límite médico claro.'],['Fitness, deporte y rendimiento','Para objetivar referencias funcionales y seguir el progreso en el tiempo.'],['Concierge y formatos privados','Para desplegar una sesión móvil en un lugar seleccionado con protocolo estable.']], demoEy: '¿CÓMO ES UNA DEMO?', demoTitle: 'Cuatro tiempos.<br><em>Claridad inmediata.</em>', demoSteps: [['01','Tu contexto','Establecimiento, actividad, equipo y ambición de la oferta.'],['02','La Case en acción','Material real, sensores y protocolo.'],['03','Medición y Pulse','Flujo de adquisición, restitución y seguimiento.'],['04','Plan de implantación','Piloto, adquisición o multi-sede según tu contexto.']], integrationEy: 'INTEGRACIÓN IN SITU', integrationTitle: 'No hace falta instalar un laboratorio.<br><em>Hace falta un protocolo fiable.</em>', integrationCopy: 'Definimos el área de medición, el rol del operador, la secuencia de la sesión, la restitución y el enlace con Pulse. El objetivo es una experiencia coherente para el equipo y la persona evaluada.', integrationItems: [['Formato','Una Case móvil, preparada antes de cada sesión.'],['Equipo','Onboarding del operador y marco de uso adecuado.'],['Recorrido','Medición, restitución y continuidad en Pulse.']], proofEy: 'TECNOLOGÍA Y MARCO', proofTitle: 'Lo real antes que el marketing.', proofCopy: 'Powered by Myodev. Myodev suministra los sensores. KŌMØ mantiene visible el origen de los datos: Myocare trata su componente muscular, mientras Pulse estructura la sesión y la continuidad del recorrido.', proofNote: 'Motion no diagnostica. Cuando existe un acto, interpretación o decisión médica, se aplican el marco Clinical y la responsabilidad del médico.', finalEy: 'UNA PRIMERA CONVERSACIÓN', finalTitle: 'Tu establecimiento.<br><em>El modelo de despliegue adecuado.</em>', finalCopy: 'Solicita una demostración: volveremos con las preguntas útiles, no con un formulario genérico.', finalCta: 'Solicitar una demo KŌMØ' },
    contact: { eyebrow: 'ANTES DE LA DEMOSTRACIÓN', title: 'Lo que te preguntaremos.', lead: 'Cuatro datos concretos permiten preparar una demostración KŌMØ relevante desde el primer intercambio.', items: [['Establecimiento','Nombre y tipo de organización.'],['Ciudad','Para organizar la secuencia Riviera u otra implantación.'],['Actividad','Médica, longevidad, hospitality, fitness, rendimiento o formato privado.'],['Partnership','Solicitud de demo, piloto, compra, multi-sede o distribución.']], note: 'No envíes nombres de pacientes ni datos de salud mediante este formulario público.' }
  }
};

const style = `<style id="riviera-commercial-v1-style">
:root{--rvc-ink:#0c0e0d;--rvc-forest:#172019;--rvc-paper:#f6f3ed;--rvc-stone:#e9e3d8;--rvc-sage:#98aa9d;--rvc-sage-deep:#52665a;--rvc-gold:#d7b67d;--rvc-line:rgba(16,20,17,.15);--rvc-white-line:rgba(255,255,255,.17)}
.rvc{background:var(--rvc-paper);color:var(--rvc-ink);overflow:clip;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.rvc-shell{width:min(calc(100% - 56px),1280px);margin:auto}.rvc *{box-sizing:border-box}.rvc a{color:inherit}.rvc-ey{margin:0 0 16px;color:var(--rvc-sage-deep);font-size:10px;font-weight:850;letter-spacing:.16em;text-transform:uppercase}.rvc-title{margin:0;font:400 clamp(44px,6.1vw,86px)/.91 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.06em;text-wrap:balance}.rvc-title em{font-style:normal;color:var(--rvc-sage-deep)}.rvc-copy{margin:0;color:#646960;font:400 clamp(16px,1.32vw,19px)/1.6 "Iowan Old Style",Baskerville,Georgia,serif}.rvc-btn{display:inline-flex;min-height:52px;align-items:center;justify-content:center;gap:10px;padding:0 20px;border:1px solid var(--rvc-ink);border-radius:999px;background:var(--rvc-ink);color:#fff!important;text-decoration:none;font-size:10px;font-weight:850;letter-spacing:.06em;text-transform:uppercase;transition:transform .18s ease,background .18s ease}.rvc-btn:hover{transform:translateY(-2px);background:#263229}.rvc-btn--light{border-color:#f8f6f0;background:#f8f6f0;color:var(--rvc-ink)!important}.rvc-link{display:inline-flex;align-items:center;min-height:42px;border-bottom:1px solid currentColor;text-decoration:none;font-size:10px;font-weight:850;letter-spacing:.06em;text-transform:uppercase}.rvc-home-hero{padding:clamp(52px,7vw,108px) 0 clamp(64px,8vw,120px);background:radial-gradient(circle at 80% 20%,rgba(152,170,157,.22),transparent 29%),linear-gradient(145deg,#151b17,#080a09 78%);color:#f9f7f1}.rvc-home-hero .rvc-ey{color:#c8d5cc}.rvc-home-hero .rvc-title em{color:var(--rvc-sage)}.rvc-home-hero .rvc-copy{color:rgba(255,255,255,.73)}.rvc-hero-grid{display:grid;grid-template-columns:.86fr 1.14fr;gap:clamp(42px,7vw,108px);align-items:center}.rvc-hero-actions{display:flex;gap:13px;flex-wrap:wrap;margin-top:28px}.rvc-hero-actions .rvc-link{color:#fff}.rvc-hero-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin:42px 0 0;padding:0;border-top:1px solid var(--rvc-white-line);border-bottom:1px solid var(--rvc-white-line);list-style:none}.rvc-hero-facts li{min-height:86px;padding:17px 16px 16px 0;border-right:1px solid var(--rvc-white-line);display:flex;flex-direction:column;justify-content:space-between}.rvc-hero-facts li+li{padding-left:16px}.rvc-hero-facts li:last-child{border-right:0}.rvc-hero-facts strong{font-size:20px;letter-spacing:-.05em}.rvc-hero-facts span{color:rgba(255,255,255,.58);font-size:9px;line-height:1.4}.rvc-photo{position:relative;margin:0;overflow:hidden;border-radius:26px;background:#dcd6ca;box-shadow:0 32px 90px rgba(0,0,0,.24)}.rvc-photo img{width:100%;height:100%;display:block;object-fit:cover}.rvc-photo figcaption{position:absolute;left:14px;right:14px;bottom:14px;padding:11px 13px;border:1px solid rgba(255,255,255,.4);border-radius:14px;background:rgba(10,13,11,.72);backdrop-filter:blur(14px);color:rgba(255,255,255,.83);font-size:9px;line-height:1.4}.rvc-photo--hero{aspect-ratio:1.04}.rvc-photo--hero img{object-position:50% 72%}.rvc-home-path,.rvc-kit,.rvc-session,.rvc-boundary,.rvc-final,.rvc-partner-sectors,.rvc-partner-demo,.rvc-partner-integration,.rvc-partner-proof{padding:clamp(70px,9vw,130px) 0}.rvc-section-head{display:grid;grid-template-columns:.92fr 1.08fr;gap:clamp(36px,8vw,112px);align-items:end;margin-bottom:clamp(34px,5vw,64px)}.rvc-path-grid{display:grid;grid-template-columns:repeat(5,1fr);border-top:1px solid var(--rvc-ink);border-bottom:1px solid var(--rvc-ink)}.rvc-path-step{min-height:250px;padding:22px 22px 22px 0;border-right:1px solid var(--rvc-line);display:flex;flex-direction:column;justify-content:space-between}.rvc-path-step+li{padding-left:22px}.rvc-path-step:last-child{border-right:0}.rvc-path-step span,.rvc-number{color:var(--rvc-sage-deep);font-size:9px;font-weight:850;letter-spacing:.13em}.rvc-path-step h3{margin:45px 0 8px;font:400 clamp(29px,3.2vw,42px)/.95 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.045em}.rvc-path-step p{margin:0;color:#6a6e68;font-size:12px;line-height:1.58}.rvc-kit{background:var(--rvc-stone)}.rvc-kit-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(38px,7vw,94px);align-items:center}.rvc-kit-photo{aspect-ratio:1;box-shadow:none;border-radius:22px}.rvc-kit-photo img{object-position:center}.rvc-kit-copy .rvc-copy{margin-top:22px}.rvc-kit-contents{display:grid;grid-template-columns:1fr 1fr;margin:36px 0 0;border-top:1px solid var(--rvc-ink);border-bottom:1px solid var(--rvc-line)}.rvc-kit-contents div{min-height:104px;padding:16px 16px 15px 0;border-right:1px solid var(--rvc-line);border-bottom:1px solid var(--rvc-line)}.rvc-kit-contents div:nth-child(even){padding-left:16px;border-right:0}.rvc-kit-contents div:nth-child(n+3){border-bottom:0}.rvc-kit-contents strong{display:block;font-size:31px;letter-spacing:-.06em}.rvc-kit-contents span{display:block;margin-top:8px;color:#666c65;font-size:9px;text-transform:uppercase;letter-spacing:.09em}.rvc-powered{margin-top:28px;padding:23px;border-left:2px solid var(--rvc-sage-deep);background:rgba(255,255,255,.42)}.rvc-powered h3{margin:0 0 9px;font-size:18px}.rvc-powered p{margin:0;color:#61675f;font-size:13px;line-height:1.58}.rvc-session{background:#111512;color:#fff}.rvc-session .rvc-ey{color:#bed0c2}.rvc-session .rvc-title em{color:var(--rvc-sage)}.rvc-session .rvc-copy{color:rgba(255,255,255,.7)}.rvc-session-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(42px,8vw,112px);align-items:center}.rvc-session-photo{aspect-ratio:4/3}.rvc-session-photo img{object-position:50% 50%}.rvc-boundary-grid{display:grid;grid-template-columns:.86fr 1.14fr;gap:clamp(40px,7vw,108px);align-items:end}.rvc-boundary-cards{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--rvc-ink);border-bottom:1px solid var(--rvc-ink)}.rvc-boundary-card{min-height:230px;padding:23px 25px 23px 0;display:flex;flex-direction:column;justify-content:space-between}.rvc-boundary-card+article{padding-left:25px;border-left:1px solid var(--rvc-line)}.rvc-boundary-card small{color:var(--rvc-sage-deep);font-size:9px;font-weight:850;letter-spacing:.12em}.rvc-boundary-card h3{margin:37px 0 9px;font:400 34px/.95 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.04em}.rvc-boundary-card p{margin:0;color:#666b65;font-size:12px;line-height:1.6}.rvc-boundary-note{margin:20px 0 0;color:#636862;font-size:12px;line-height:1.55}.rvc-boundary .rvc-link{margin-top:21px}.rvc-final{background:radial-gradient(circle at 78% 25%,rgba(152,170,157,.17),transparent 30%),#0d110f;color:#fff}.rvc-final .rvc-ey{color:#cbd8cf}.rvc-final .rvc-title em{color:var(--rvc-sage)}.rvc-final-grid{display:grid;grid-template-columns:1fr .8fr;gap:clamp(40px,8vw,120px);align-items:end}.rvc-final .rvc-copy{color:rgba(255,255,255,.66)}.rvc-final .rvc-btn{margin-top:25px}.rvc-partner-hero{padding:clamp(58px,8vw,116px) 0 0;background:#0b0f0d;color:#fff}.rvc-partner-hero .rvc-ey{color:#c3d2c8}.rvc-partner-hero .rvc-title em{color:var(--rvc-sage)}.rvc-partner-hero .rvc-copy{color:rgba(255,255,255,.7)}.rvc-partner-hero .rvc-link{color:#fff}.rvc-partner-photo{aspect-ratio:5/4}.rvc-partner-photo img{object-position:center 70%}.rvc-territory{margin-top:clamp(42px,6vw,80px);padding:21px 0;border-top:1px solid var(--rvc-white-line);background:rgba(255,255,255,.03)}.rvc-territory .rvc-shell{display:flex;align-items:center;justify-content:space-between;gap:24px}.rvc-territory strong{font-size:clamp(18px,2.5vw,32px);letter-spacing:-.045em}.rvc-territory span{color:rgba(255,255,255,.55);font-size:10px;text-align:right}.rvc-partner-sectors{background:var(--rvc-paper)}.rvc-sector-grid{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--rvc-ink);border-bottom:1px solid var(--rvc-ink)}.rvc-sector{min-height:270px;padding:21px 22px 22px 0;border-right:1px solid var(--rvc-line);display:flex;flex-direction:column;justify-content:space-between}.rvc-sector+article{padding-left:22px}.rvc-sector:last-child{border-right:0}.rvc-sector span{color:var(--rvc-sage-deep);font-size:9px;font-weight:850;letter-spacing:.12em}.rvc-sector h3{margin:45px 0 10px;font:400 31px/.98 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.04em}.rvc-sector p{margin:0;color:#686d66;font-size:12px;line-height:1.58}.rvc-partner-demo{background:#e7dfd2}.rvc-demo-grid{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--rvc-ink);border-bottom:1px solid var(--rvc-ink)}.rvc-demo-step{min-height:242px;padding:21px 22px 22px 0;border-right:1px solid var(--rvc-line)}.rvc-demo-step+article{padding-left:22px}.rvc-demo-step:last-child{border-right:0}.rvc-demo-step h3{margin:48px 0 8px;font:400 31px/.97 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.04em}.rvc-demo-step p{margin:0;color:#636963;font-size:12px;line-height:1.6}.rvc-partner-integration{background:#111512;color:#fff}.rvc-partner-integration .rvc-ey{color:#bfd0c3}.rvc-partner-integration .rvc-title em{color:var(--rvc-sage)}.rvc-partner-integration .rvc-copy{color:rgba(255,255,255,.69)}.rvc-integration-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(40px,8vw,110px);align-items:center}.rvc-integration-photo{aspect-ratio:4/3}.rvc-integration-photo img{object-position:center}.rvc-integration-list{margin:31px 0 0;padding:0;border-top:1px solid var(--rvc-white-line);list-style:none}.rvc-integration-list li{display:grid;grid-template-columns:92px 1fr;gap:15px;padding:15px 0;border-bottom:1px solid var(--rvc-white-line);font-size:12px;line-height:1.55}.rvc-integration-list span{color:var(--rvc-sage);font-size:9px;font-weight:850;letter-spacing:.1em;text-transform:uppercase}.rvc-partner-proof{background:var(--rvc-stone)}.rvc-proof-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(38px,7vw,94px);align-items:center}.rvc-proof-photo{aspect-ratio:1}.rvc-proof-photo img{object-position:center}.rvc-proof-copy .rvc-copy{margin-top:22px}.rvc-proof-note{margin:24px 0 0;padding-top:18px;border-top:1px solid var(--rvc-line);color:#666b65;font-size:12px;line-height:1.58}.rvc-contact-brief{padding:58px 0;background:#e8e1d5;color:var(--rvc-ink)}.rvc-contact-brief-grid{display:grid;grid-template-columns:.75fr 1.25fr;gap:clamp(34px,7vw,96px);align-items:end}.rvc-contact-brief h2{margin:0;font:400 clamp(35px,4.7vw,58px)/.95 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.05em}.rvc-contact-brief p{margin:16px 0 0;color:#626861;font:400 16px/1.6 "Iowan Old Style",Baskerville,Georgia,serif}.rvc-contact-brief-list{display:grid;grid-template-columns:1fr 1fr;margin:0;padding:0;border-top:1px solid var(--rvc-ink);border-bottom:1px solid var(--rvc-line);list-style:none}.rvc-contact-brief-list li{min-height:100px;padding:16px 18px 16px 0;border-right:1px solid var(--rvc-line);border-bottom:1px solid var(--rvc-line)}.rvc-contact-brief-list li:nth-child(even){padding-left:18px;border-right:0}.rvc-contact-brief-list li:nth-child(n+3){border-bottom:0}.rvc-contact-brief-list strong{display:block;font-size:15px}.rvc-contact-brief-list span{display:block;margin-top:9px;color:#646a63;font-size:11px;line-height:1.45}.rvc-contact-note{grid-column:2;margin:3px 0 0!important;font-size:12px!important}
@media(max-width:980px){.rvc-shell{width:min(calc(100% - 40px),820px)}.rvc-hero-grid,.rvc-section-head,.rvc-kit-grid,.rvc-session-grid,.rvc-boundary-grid,.rvc-final-grid,.rvc-integration-grid,.rvc-proof-grid,.rvc-contact-brief-grid{grid-template-columns:1fr}.rvc-hero-grid{gap:28px}.rvc-photo--hero{max-width:720px}.rvc-path-grid,.rvc-sector-grid,.rvc-demo-grid{grid-template-columns:1fr 1fr}.rvc-path-step:nth-child(2),.rvc-sector:nth-child(2),.rvc-demo-step:nth-child(2){border-right:0}.rvc-path-step:nth-child(-n+2),.rvc-sector:nth-child(-n+2),.rvc-demo-step:nth-child(-n+2){border-bottom:1px solid var(--rvc-line)}.rvc-path-step:nth-child(3),.rvc-sector:nth-child(3),.rvc-demo-step:nth-child(3){padding-left:0}.rvc-path-step:last-child{border-top:1px solid var(--rvc-line);padding-left:0}.rvc-boundary-cards{max-width:720px}.rvc-contact-note{grid-column:auto}}
@media(max-width:640px){.rvc-shell{width:min(calc(100% - 28px),820px)}.rvc-home-hero,.rvc-home-path,.rvc-kit,.rvc-session,.rvc-boundary,.rvc-final,.rvc-partner-sectors,.rvc-partner-demo,.rvc-partner-integration,.rvc-partner-proof{padding:58px 0}.rvc-partner-hero{padding-top:48px}.rvc-title{font-size:43px;line-height:.94}.rvc-copy{font-size:15px;line-height:1.56}.rvc-hero-actions{display:grid;gap:11px}.rvc-hero-actions .rvc-btn,.rvc-hero-actions .rvc-link{width:100%;justify-content:center}.rvc-hero-facts{grid-template-columns:1fr}.rvc-hero-facts li,.rvc-hero-facts li+li{min-height:0;padding:14px 0;border-right:0;border-bottom:1px solid var(--rvc-white-line)}.rvc-hero-facts li:last-child{border-bottom:0}.rvc-photo{border-radius:18px}.rvc-photo--hero{aspect-ratio:4/5}.rvc-section-head{gap:17px;margin-bottom:29px}.rvc-path-grid,.rvc-sector-grid,.rvc-demo-grid,.rvc-boundary-cards,.rvc-contact-brief-list{grid-template-columns:1fr}.rvc-path-step,.rvc-path-step+li,.rvc-path-step:last-child,.rvc-sector,.rvc-sector+article,.rvc-demo-step,.rvc-demo-step+article,.rvc-boundary-card,.rvc-boundary-card+article{min-height:0;padding:18px 0;border-right:0;border-left:0;border-bottom:1px solid var(--rvc-line);border-top:0}.rvc-path-step h3,.rvc-sector h3,.rvc-demo-step h3,.rvc-boundary-card h3{margin:22px 0 7px;font-size:30px}.rvc-path-step:last-child,.rvc-sector:last-child,.rvc-demo-step:last-child,.rvc-boundary-card:last-child{border-bottom:0}.rvc-kit-contents{grid-template-columns:1fr 1fr;margin-top:27px}.rvc-kit-contents div{min-height:86px}.rvc-kit-contents strong{font-size:27px}.rvc-session-photo,.rvc-integration-photo{aspect-ratio:4/5}.rvc-territory{margin-top:34px}.rvc-territory .rvc-shell{display:block}.rvc-territory strong{display:block;font-size:22px;line-height:1.3}.rvc-territory span{display:block;margin-top:10px;text-align:left}.rvc-contact-brief{padding:45px 0}.rvc-contact-brief-grid{gap:22px}.rvc-contact-brief-list li,.rvc-contact-brief-list li:nth-child(even),.rvc-contact-brief-list li:nth-child(n+3){min-height:0;padding:15px 0;border-right:0;border-bottom:1px solid var(--rvc-line)}.rvc-contact-brief-list li:last-child{border-bottom:0}}
@media(prefers-reduced-motion:reduce){.rvc-btn{transition:none}}
</style>`;

function esc(value = '') {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function photo(src, alt, caption, className) {
  const priority = /(?:--hero|partner-photo)/.test(className);
  return `<figure class="rvc-photo ${className}"><img src="${images}${src}" alt="${esc(alt)}" ${priority ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} decoding="async"><figcaption>${esc(caption)}</figcaption></figure>`;
}

function pathSteps(items) {
  return `<ol class="rvc-path-grid">${items.map(([number, title, copy]) => `<li class="rvc-path-step"><span>${number}</span><div><h3>${esc(title)}</h3><p>${esc(copy)}</p></div></li>`).join('')}</ol>`;
}

function home(c) {
  const p = c.paths;
  const kit = c.kit.contents.map(([number, label]) => `<div><strong>${esc(number)}</strong><span>${esc(label)}</span></div>`).join('');
  const facts = [['01', 'KŌMØ Case'], ['06', c.kit.contents[0][1]], ['01', c.path.steps[3][1]]];
  return `<main id="main" class="rvc rvc-home">
  <section class="rvc-home-hero"><div class="rvc-shell rvc-hero-grid"><div><p class="rvc-ey">${esc(c.hero.eyebrow)}</p><h1 class="rvc-title">${c.hero.title}</h1><p class="rvc-copy" style="margin-top:24px">${esc(c.hero.lead)}</p><div class="rvc-hero-actions"><a class="rvc-btn rvc-btn--light" href="${p.contact}">${esc(c.hero.demo)} <span aria-hidden="true">↗</span></a><a class="rvc-link" href="${p.case}">${esc(c.hero.case)} <span aria-hidden="true">→</span></a></div><ul class="rvc-hero-facts">${facts.map(([number,label]) => `<li><strong>${esc(number)}</strong><span>${esc(label)}</span></li>`).join('')}</ul></div>${photo('komo-case-angle.jpeg', c.hero.alt, c.hero.caption, 'rvc-photo--hero')}</div></section>
  <section class="rvc-home-path" id="measure"><div class="rvc-shell"><div class="rvc-section-head"><div><p class="rvc-ey">${esc(c.path.eyebrow)}</p><h2 class="rvc-title">${c.path.title}</h2></div><p class="rvc-copy">${esc(c.path.lead)}</p></div>${pathSteps(c.path.steps)}</div></section>
  <section class="rvc-kit" id="case"><div class="rvc-shell rvc-kit-grid">${photo('komo-six-myodev-sensors.jpeg', c.kit.imageAlt, c.kit.imageCaption, 'rvc-kit-photo')}<div class="rvc-kit-copy"><p class="rvc-ey">${esc(c.kit.eyebrow)}</p><h2 class="rvc-title">${c.kit.title}</h2><p class="rvc-copy">${esc(c.kit.copy)}</p><div class="rvc-kit-contents">${kit}</div><aside class="rvc-powered"><h3>${esc(c.kit.poweredTitle)}</h3><p>${esc(c.kit.poweredCopy)}</p></aside></div></div></section>
  <section class="rvc-session"><div class="rvc-shell rvc-session-grid"><div><p class="rvc-ey">${esc(c.session.eyebrow)}</p><h2 class="rvc-title">${c.session.title}</h2><p class="rvc-copy" style="margin-top:23px">${esc(c.session.copy)}</p></div>${photo('komo-motion-tablet.jpeg', c.session.alt, c.session.caption, 'rvc-session-photo')}</div></section>
  <section class="rvc-boundary" id="score"><div class="rvc-shell rvc-boundary-grid"><div><p class="rvc-ey">${esc(c.boundary.eyebrow)}</p><h2 class="rvc-title">${c.boundary.title}</h2></div><div><div class="rvc-boundary-cards"><article class="rvc-boundary-card"><small>01 · MOTION</small><div><h3>${esc(c.boundary.motion[0])}</h3><p>${esc(c.boundary.motion[1])}</p></div></article><article class="rvc-boundary-card"><small>02 · CLINICAL</small><div><h3>${esc(c.boundary.clinical[0])}</h3><p>${esc(c.boundary.clinical[1])}</p></div></article></div><p class="rvc-boundary-note">${esc(c.boundary.note)}</p><a class="rvc-link" href="${p.method}">${esc(c.boundary.method)} <span aria-hidden="true">→</span></a></div></div></section>
  <section class="rvc-final" id="pulse"><div class="rvc-shell rvc-final-grid"><div><p class="rvc-ey">${esc(c.final.eyebrow)}</p><h2 class="rvc-title">${c.final.title}</h2></div><div><p class="rvc-copy">${esc(c.final.copy)}</p><a class="rvc-btn rvc-btn--light" href="${p.contact}">${esc(c.final.cta)} <span aria-hidden="true">↗</span></a></div></div></section>
  </main>`;
}

function partnerSectors(items) {
  return `<div class="rvc-sector-grid">${items.map(([title, copy], index) => `<article class="rvc-sector"><span>0${index + 1}</span><div><h3>${esc(title)}</h3><p>${esc(copy)}</p></div></article>`).join('')}</div>`;
}

function partnerSteps(items) {
  return `<div class="rvc-demo-grid">${items.map(([number, title, copy]) => `<article class="rvc-demo-step"><span class="rvc-number">${number}</span><h3>${esc(title)}</h3><p>${esc(copy)}</p></article>`).join('')}</div>`;
}

function partners(c) {
  const p = c.paths, x = c.partners;
  const integration = x.integrationItems.map(([label, copy]) => `<li><span>${esc(label)}</span><div>${esc(copy)}</div></li>`).join('');
  return `<main id="main" class="rvc rvc-partners">
  <section class="rvc-partner-hero"><div class="rvc-shell rvc-hero-grid"><div><p class="rvc-ey">${esc(x.eyebrow)}</p><h1 class="rvc-title">${x.title}</h1><p class="rvc-copy" style="margin-top:24px">${esc(x.lead)}</p><div class="rvc-hero-actions"><a class="rvc-btn rvc-btn--light" href="${p.contact}">${esc(x.demo)} <span aria-hidden="true">↗</span></a><a class="rvc-link" href="${p.case}">${esc(x.case)} <span aria-hidden="true">→</span></a></div></div>${photo('komo-case-open.jpeg', x.alt, x.caption, 'rvc-partner-photo')}</div><div class="rvc-territory"><div class="rvc-shell"><strong>${esc(x.territory)}</strong><span>${esc(x.territoryNote)}</span></div></div></section>
  <section class="rvc-partner-sectors"><div class="rvc-shell"><div class="rvc-section-head"><div><p class="rvc-ey">${esc(x.sectorsEy)}</p><h2 class="rvc-title">${x.sectorsTitle}</h2></div><p class="rvc-copy">${esc(x.lead)}</p></div>${partnerSectors(x.sectors)}</div></section>
  <section class="rvc-partner-demo"><div class="rvc-shell"><div class="rvc-section-head"><div><p class="rvc-ey">${esc(x.demoEy)}</p><h2 class="rvc-title">${x.demoTitle}</h2></div><p class="rvc-copy">${esc(x.demo)} · KŌMØ Case · Myodev · Pulse</p></div>${partnerSteps(x.demoSteps)}</div></section>
  <section class="rvc-partner-integration"><div class="rvc-shell rvc-integration-grid">${photo('komo-motion-tablet.jpeg', c.session.alt, c.session.caption, 'rvc-integration-photo')}<div><p class="rvc-ey">${esc(x.integrationEy)}</p><h2 class="rvc-title">${x.integrationTitle}</h2><p class="rvc-copy" style="margin-top:22px">${esc(x.integrationCopy)}</p><ul class="rvc-integration-list">${integration}</ul></div></div></section>
  <section class="rvc-partner-proof"><div class="rvc-shell rvc-proof-grid">${photo('komo-six-myodev-sensors.jpeg', c.kit.imageAlt, c.kit.imageCaption, 'rvc-proof-photo')}<div class="rvc-proof-copy"><p class="rvc-ey">${esc(x.proofEy)}</p><h2 class="rvc-title">${esc(x.proofTitle)}</h2><p class="rvc-copy">${esc(x.proofCopy)}</p><p class="rvc-proof-note">${esc(x.proofNote)}</p></div></div></section>
  <section class="rvc-final"><div class="rvc-shell rvc-final-grid"><div><p class="rvc-ey">${esc(x.finalEy)}</p><h2 class="rvc-title">${x.finalTitle}</h2></div><div><p class="rvc-copy">${esc(x.finalCopy)}</p><a class="rvc-btn rvc-btn--light" href="${p.contact}">${esc(x.finalCta)} <span aria-hidden="true">↗</span></a></div></div></section>
  </main>`;
}

function contactBrief(c) {
  return `<section class="rvc-contact-brief"><div class="shell rvc-contact-brief-grid"><div><p class="rvc-ey">${esc(c.contact.eyebrow)}</p><h2>${esc(c.contact.title)}</h2><p>${esc(c.contact.lead)}</p></div><ul class="rvc-contact-brief-list">${c.contact.items.map(([title, copy]) => `<li><strong>${esc(title)}</strong><span>${esc(copy)}</span></li>`).join('')}</ul><p class="rvc-contact-note">${esc(c.contact.note)}</p></div></section>`;
}

function setMeta(html, [title, description]) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${esc(description)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${esc(description)}">`);
}

function replaceMain(html, next) {
  if (!/<main\b[^>]*>[\s\S]*?<\/main>/i.test(html)) throw new Error('[riviera-commercial] main element not found');
  return html.replace(/<main\b[^>]*>[\s\S]*?<\/main>/i, next);
}

function addStyle(html) {
  html = html
    .replace(/<style id="riviera-commercial-v1-style">[\s\S]*?<\/style>/gi, '')
    .replaceAll('komo-case-hero-final.avif', 'real-case/komo-case-angle.jpeg')
    .replaceAll('komo-case-hero-fallback.jpeg', 'real-case/komo-case-angle.jpeg')
    .replaceAll('komo-case-overview.jpeg', 'real-case/komo-case-open.jpeg')
    .replaceAll('komo-case-muscle.jpeg', 'real-case/komo-six-myodev-sensors.jpeg')
    .replaceAll('komo-case-hero-final', 'komo-case-angle');
  return html.replace('</head>', `${style}</head>`);
}

function homeNavigation(html, c) {
  const p = c.paths;
  const links = c.home.endsWith('/fr/index.html')
    ? [['Case', p.case], ['Méthode', p.method], ['Pulse', p.pulse], ['Professionnels', p.partners], ['Contact', p.contact]]
    : c.home.endsWith('/es/index.html')
      ? [['Case', p.case], ['Método', p.method], ['Pulse', p.pulse], ['Profesionales', p.partners], ['Contacto', p.contact]]
      : [['Case', p.case], ['Method', p.method], ['Pulse', p.pulse], ['Professionals', p.partners], ['Contact', p.contact]];
  const nav = links.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
  html = html.replace(/<nav class="kp-nav">[\s\S]*?<\/nav>/i, `<nav class="kp-nav">${nav}</nav>`);
  html = html.replace(/(<details class="kp-menu">[\s\S]*?<nav>)[\s\S]*?(<\/nav>[\s\S]*?<\/details>)/i, `$1${nav}$2`);
  return html.replace(/<a class="kp-mini"[^>]*>[\s\S]*?<\/a>/i, `<a class="kp-mini" href="${p.contact}">${esc(c.hero.demo)} →</a>`);
}

for (const c of Object.values(locales)) {
  let homeHtml = await readFile(c.home, 'utf8');
  homeHtml = setMeta(homeHtml, c.homeMeta);
  homeHtml = replaceMain(homeHtml, home(c));
  homeHtml = homeNavigation(homeHtml, c);
  homeHtml = addStyle(homeHtml);
  await writeFile(c.home, homeHtml, 'utf8');

  let partnerHtml = await readFile(c.partnersPage, 'utf8');
  partnerHtml = setMeta(partnerHtml, c.partnersMeta);
  partnerHtml = replaceMain(partnerHtml, partners(c));
  partnerHtml = addStyle(partnerHtml);
  await writeFile(c.partnersPage, partnerHtml, 'utf8');

  let contactHtml = await readFile(c.contactPage, 'utf8');
  contactHtml = setMeta(contactHtml, c.contactMeta);
  contactHtml = contactHtml.replace(/<section class="rvc-contact-brief"[\s\S]*?<\/section>/i, '');
  if (!contactHtml.includes('class="professional-enquiry"')) throw new Error('[riviera-commercial] professional contact form missing');
  contactHtml = contactHtml.replace('<section class="professional-enquiry"', `${contactBrief(c)}<section class="professional-enquiry"`);
  contactHtml = addStyle(contactHtml);
  await writeFile(c.contactPage, contactHtml, 'utf8');
}

// Existing Case and Clinical pages remain useful product references.  Replace
// their former visual placeholders with the supplied, documented photographs.
const evidencePages = [
  join(site, 'case', 'index.html'), join(site, 'fr', 'case', 'index.html'), join(site, 'es', 'case', 'index.html'),
  join(site, 'clinical', 'index.html'), join(site, 'fr', 'clinical', 'index.html'), join(site, 'es', 'clinical', 'index.html'),
  join(site, 'partners', 'motion', 'index.html'), join(site, 'fr', 'partners', 'motion', 'index.html'), join(site, 'es', 'partners', 'motion', 'index.html')
];
for (const file of evidencePages) {
  let html;
  try { html = await readFile(file, 'utf8'); } catch { continue; }
  html = html
    .replaceAll('/assets/images/komo-case-hero-final.avif', `${images}komo-case-angle.jpeg`)
    .replaceAll('/assets/images/komo-case-hero-fallback.jpeg', `${images}komo-case-angle.jpeg`)
    .replaceAll('/assets/images/komo-case-overview.jpeg', `${images}komo-case-open.jpeg`)
    .replaceAll('/assets/images/komo-case-muscle.jpeg', `${images}komo-six-myodev-sensors.jpeg`);
  await writeFile(file, html, 'utf8');
}

console.log('[riviera-commercial-v1] real product photography, conversion home, Riviera partner landing and demo-qualified contact flow applied');
