import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const site = join(process.cwd(), 'site');

const css = `
<style id="komo-commercial-trajectory-v2-style">
:root{--kt-ink:#101512;--kt-paper:#f7f5ef;--kt-warm:#eee7dc;--kt-sage:#738c7d;--kt-sage2:#dce7df;--kt-blue:#dfe9f2;--kt-line:rgba(16,21,18,.14);--kt-muted:#69716b;--kt-dark:#0d1511}
.kt-shell{width:min(1180px,calc(100% - 44px));margin:0 auto}
.kt-home{background:var(--kt-paper);color:var(--kt-ink);font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.kt-home *{box-sizing:border-box}.kt-home a{color:inherit}
.kt-ey{margin:0 0 18px;font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#61766a}
.kt-title{margin:0;font-family:"Iowan Old Style",Baskerville,Georgia,serif;font-weight:400;letter-spacing:-.055em;line-height:.94;font-size:clamp(46px,7vw,88px)}
.kt-title em{font-style:italic;color:#60786b}.kt-h2{margin:0;font-family:"Iowan Old Style",Baskerville,Georgia,serif;font-weight:400;letter-spacing:-.045em;line-height:.98;font-size:clamp(38px,5.3vw,68px)}
.kt-h3{margin:0;font-family:"Iowan Old Style",Baskerville,Georgia,serif;font-weight:400;letter-spacing:-.035em;font-size:clamp(28px,3vw,40px);line-height:1}
.kt-lead{margin:24px 0 0;max-width:690px;font:400 clamp(18px,1.8vw,23px)/1.55 "Iowan Old Style",Baskerville,Georgia,serif;color:#465048}
.kt-copy{margin:16px 0 0;color:#5e675f;font-size:14px;line-height:1.7}
.kt-btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px}.kt-btn{display:inline-flex;align-items:center;justify-content:center;min-height:47px;padding:0 20px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:760;letter-spacing:.02em}.kt-btn--dark{background:#111915;color:#fff}.kt-btn--light{border:1px solid var(--kt-line);background:rgba(255,255,255,.72)}.kt-btn--ghost{border:1px solid rgba(255,255,255,.2);color:#fff}
.kt-hero{padding:clamp(76px,10vw,132px) 0 64px;background:radial-gradient(circle at 86% 8%,rgba(174,205,187,.5),transparent 33%),linear-gradient(145deg,#f8f6ef 0%,#edf3ee 56%,#e9e4d8 100%)}
.kt-hero-grid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(340px,.85fr);gap:clamp(42px,7vw,100px);align-items:center}
.kt-hero-card{padding:30px;border:1px solid rgba(16,21,18,.12);border-radius:28px;background:rgba(255,255,255,.6);box-shadow:0 34px 90px rgba(31,43,36,.11);backdrop-filter:blur(18px)}
.kt-hero-card strong{display:block;margin-bottom:22px;font-size:11px;letter-spacing:.14em;text-transform:uppercase}.kt-flow{display:grid;gap:0}.kt-flow-row{display:grid;grid-template-columns:30px 1fr auto;gap:12px;align-items:center;padding:15px 0;border-top:1px solid var(--kt-line)}.kt-flow-row:first-child{border-top:0}.kt-flow-row b{font-size:12px}.kt-flow-row span{font-size:11px;color:var(--kt-muted)}.kt-flow-row i{font-style:normal;font-size:9px;color:#60786b}
.kt-pricebar{display:flex;flex-wrap:wrap;gap:9px;margin-top:25px}.kt-pricebar span{padding:8px 11px;border-radius:999px;background:rgba(255,255,255,.58);border:1px solid rgba(16,21,18,.1);font-size:10px;color:#4e5c53}
.kt-section{padding:clamp(72px,9vw,122px) 0;border-top:1px solid var(--kt-line)}.kt-section--warm{background:var(--kt-warm)}.kt-section--sage{background:#e8efe9}.kt-section--dark{background:var(--kt-dark);color:#f7f5ef}.kt-section--dark .kt-ey{color:#9db5a6}.kt-section--dark .kt-copy,.kt-section--dark .kt-lead{color:rgba(247,245,239,.67)}
.kt-head{display:grid;grid-template-columns:minmax(0,.9fr) minmax(320px,.7fr);gap:40px;align-items:end}.kt-head .kt-copy{margin:0;max-width:590px}
.kt-doors{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:48px}.kt-door{min-height:360px;padding:27px;border:1px solid var(--kt-line);background:rgba(255,255,255,.62);border-radius:24px;display:flex;flex-direction:column}.kt-door--clinical{background:#122019;color:#f7f5ef}.kt-door--clinical .kt-copy,.kt-door--clinical .kt-kicker{color:rgba(247,245,239,.65)}.kt-kicker{font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#68756c}.kt-door .kt-h3{margin-top:55px}.kt-door .kt-copy{max-width:34ch}.kt-door-foot{margin-top:auto;padding-top:26px;display:flex;justify-content:space-between;gap:12px;align-items:end}.kt-door-foot b{font-size:13px}.kt-door-foot a{text-decoration:none;font-size:12px;font-weight:700}
.kt-journey{display:grid;grid-template-columns:repeat(6,1fr);margin-top:50px;border-top:1px solid var(--kt-line);border-bottom:1px solid var(--kt-line)}.kt-step{min-height:220px;padding:21px 18px 24px;border-right:1px solid var(--kt-line)}.kt-step:last-child{border-right:0}.kt-step span{font-size:9px;font-weight:800;color:#718176}.kt-step h3{margin:54px 0 12px;font:400 27px/1 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.04em}.kt-step p{margin:0;font-size:11px;line-height:1.55;color:#687169}
.kt-expgrid{display:grid;grid-template-columns:1.2fr .8fr .8fr;grid-template-rows:auto auto;gap:14px;margin-top:48px}.kt-exp{min-height:250px;border-radius:26px;padding:28px;background:#fff;border:1px solid var(--kt-line);display:flex;flex-direction:column}.kt-exp--yacht{grid-row:1/3;min-height:520px;background:linear-gradient(180deg,#183249,#0f2536);color:#fff}.kt-exp--yacht .kt-copy,.kt-exp--yacht .kt-kicker{color:rgba(255,255,255,.68)}.kt-exp .kt-h3{margin-top:42px}.kt-exp .kt-copy{max-width:38ch}.kt-exp a{margin-top:auto;padding-top:24px;text-decoration:none;font-size:12px;font-weight:700}
.kt-clinical-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(38px,7vw,90px);align-items:start}.kt-clinical-panel{padding:27px;border-radius:24px;background:rgba(255,255,255,.7);border:1px solid var(--kt-line)}.kt-list{list-style:none;padding:0;margin:10px 0 0}.kt-list li{display:grid;grid-template-columns:18px 1fr;gap:10px;padding:14px 0;border-top:1px solid var(--kt-line);font-size:12px;line-height:1.5}.kt-list li:first-child{border-top:0}.kt-list li:before{content:'•';color:#6f8979}
.kt-continuity{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:45px}.kt-cont-card{padding:28px;border-radius:24px;background:#fff;border:1px solid var(--kt-line)}.kt-cont-card--world{background:#e2e9f1}.kt-cont-card strong{display:block;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#66766b}.kt-cont-card .kt-h3{margin-top:38px}
.kt-pro-grid{display:grid;grid-template-columns:.86fr 1.14fr;gap:clamp(42px,8vw,100px);align-items:start}.kt-pipeline{border-top:1px solid rgba(255,255,255,.2);margin-top:10px}.kt-pipe{display:grid;grid-template-columns:48px 1fr;gap:15px;padding:20px 0;border-bottom:1px solid rgba(255,255,255,.12)}.kt-pipe b{font-size:10px;color:#9db5a6}.kt-pipe h3{margin:0 0 7px;font:400 25px/1 "Iowan Old Style",Baskerville,Georgia,serif}.kt-pipe p{margin:0;font-size:11px;line-height:1.55;color:rgba(255,255,255,.59)}
.kt-final{padding:clamp(76px,10vw,132px) 0;background:#d8e6dd}.kt-final-grid{display:grid;grid-template-columns:1fr auto;gap:40px;align-items:end}.kt-final .kt-h2{max-width:820px}
.kt-pagehero{padding:clamp(78px,9vw,120px) 0 64px;background:linear-gradient(145deg,#f8f6ef,#e8efe9)}.kt-pagehero .kt-lead{max-width:760px}.kt-pagebody{padding:70px 0 110px;background:var(--kt-paper)}.kt-pagegrid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:42px}.kt-pagecard{padding:28px;border-radius:24px;background:#fff;border:1px solid var(--kt-line)}.kt-pagecard .kt-h3{margin-top:36px}.kt-note{margin-top:20px;padding:16px 18px;border-left:2px solid #6f8979;background:#edf2ee;font-size:11px;line-height:1.6;color:#59645c}.kt-mini-flow{display:grid;grid-template-columns:repeat(5,1fr);margin-top:42px;border-top:1px solid var(--kt-line);border-bottom:1px solid var(--kt-line)}.kt-mini-flow div{padding:20px 16px;border-right:1px solid var(--kt-line)}.kt-mini-flow div:last-child{border-right:0}.kt-mini-flow b{font-size:9px;color:#6b8073}.kt-mini-flow span{display:block;margin-top:28px;font:400 22px/1 "Iowan Old Style",Baskerville,Georgia,serif}
@media(max-width:980px){.kt-hero-grid,.kt-head,.kt-clinical-grid,.kt-pro-grid,.kt-final-grid{grid-template-columns:1fr}.kt-doors{grid-template-columns:1fr}.kt-door{min-height:0}.kt-journey{grid-template-columns:repeat(3,1fr)}.kt-step:nth-child(3){border-right:0}.kt-expgrid{grid-template-columns:1fr 1fr}.kt-exp--yacht{grid-row:auto;grid-column:1/-1;min-height:360px}.kt-pagegrid{grid-template-columns:1fr}.kt-mini-flow{grid-template-columns:1fr}}
@media(max-width:650px){.kt-shell{width:min(100% - 28px,1180px)}.kt-hero{padding-top:58px}.kt-title{font-size:clamp(44px,14vw,64px)}.kt-hero-card{padding:21px;border-radius:20px}.kt-journey{grid-template-columns:1fr}.kt-step,.kt-step:nth-child(3){min-height:0;border-right:0;border-bottom:1px solid var(--kt-line)}.kt-step:last-child{border-bottom:0}.kt-step h3{margin-top:26px}.kt-expgrid,.kt-continuity{grid-template-columns:1fr}.kt-exp--yacht{grid-column:auto;min-height:320px}.kt-exp{min-height:240px}.kt-final .kt-btns{margin-top:0}.kt-mini-flow div{border-right:0;border-bottom:1px solid var(--kt-line)}.kt-mini-flow div:last-child{border-bottom:0}}
</style>`;

const localeData = {
  fr: {
    homeFiles: ['index.html','fr/index.html'],
    assessmentFile: 'fr/bilan/index.html',
    clinicalFile: 'fr/clinical/index.html',
    partnersFile: 'fr/partners/index.html',
    pulseFile: 'fr/pulse/index.html',
    paths: { assessment:'/fr/bilan/', clinical:'/fr/clinical/', experience:'/fr/experience/', partners:'/fr/partners/', contact:'/fr/contact/?intent=consultation', pulse:'https://pulse.komolongevity.com/', world:'/world/', method:'/fr/methode/' },
    metaTitle:'KŌMØ — Assessment, Clinical & Experiences | Longévité en mouvement',
    metaDescription:'KŌMØ propose une évaluation fonctionnelle complète, un parcours Clinical lorsqu’une lecture médicale est indiquée, puis un accompagnement continu à domicile, en hôtel, à bord ou en retreat.',
    heroEy:'KŌMØ · LONGÉVITÉ EN MOUVEMENT',
    heroTitle:'Comprendre votre corps.<br><em>Construire la suite.</em>',
    heroLead:'KŌMØ réunit évaluation du mouvement, restitution claire, lecture clinique lorsqu’elle est indiquée et accompagnement dans le temps. Une seule trajectoire, quel que soit le lieu où vous la vivez.',
    heroPrimary:'Demander une consultation',
    heroSecondary:'Découvrir KŌMØ Clinical',
    prices:['Assessment · 300 € tarif de référence','Clinical · 500 € tarif de référence','Yachting · du bilan individuel au programme privé'],
    flow:[['01','Avant','Profil & objectifs'],['02','Assessment','Mouvement & muscle'],['03','Résultats','Score & priorités'],['04','Équipe','Professionnels adaptés'],['05','Pulse','Suivi & réévaluation']],
    doors:[
      ['ASSESSMENT','KŌMØ Assessment','Votre porte d’entrée universelle : mouvement, marche, équilibre, force, mobilité, coordination et analyse musculaire selon le protocole.','300 €','Découvrir l’Assessment','assessment'],
      ['CLINICAL','KŌMØ Clinical','Quand une lecture médicale est utile : consultation, examen, interprétation et examens complémentaires uniquement lorsqu’ils sont indiqués.','500 €','Découvrir Clinical','clinical'],
      ['EXPERIENCES','KŌMØ Experiences','La même expertise délivrée dans votre environnement : à domicile, en hôtel, à bord d’un yacht ou pendant un retreat.','À la carte','Voir les expériences','experience']
    ],
    journeyEy:'UNE EXPÉRIENCE COMPLÈTE',
    journeyTitle:'Le bilan est le début.<br><em>Pas la fin.</em>',
    journeyLead:'Chaque consultation doit produire un résultat compréhensible, une action concrète et une prochaine étape. KŌMØ organise cette continuité autour de la personne.',
    journey:[['01','Avant','Profil, objectifs et contexte avant la venue.'],['02','Évaluer','Mesures fonctionnelles et musculaires structurées.'],['03','Comprendre','Restitution claire, Motion Score et priorités.'],['04','Agir','Plan et professionnels adaptés au besoin.'],['05','Suivre','Pulse garde résultats, programme et progression.'],['06','Réévaluer','On mesure de nouveau ce qui doit réellement changer.']],
    expEy:'KŌMØ EXPERIENCES',
    expTitle:'Nous venons à vous.<br><em>La méthode reste la même.</em>',
    expLead:'Yachting est notre première verticale de déploiement, pas une frontière de marque. KŌMØ doit être accessible à un particulier comme à un hôtel, une villa, un yacht ou un groupe en retreat.',
    experiences:[
      ['YACHTING','KŌMØ Yachting','Une expérience de longévité fonctionnelle délivrée à bord, du bilan individuel au programme privé : assessment, restitution, professionnels et suivi après le voyage.','Découvrir Yachting','/experience/'],
      ['HOME & VILLAS','Chez vous','Une consultation KŌMØ dans un environnement privé, avec la même qualité de protocole et de restitution.','Demander une consultation','contact'],
      ['HOSPITALITY','Hôtels & clubs','Des journées ou programmes KŌMØ opérés sur place avant toute installation permanente.','Pour les professionnels','partners'],
      ['RETREATS','Retreats','Plusieurs jours pour évaluer, agir et organiser la continuité au retour.','Découvrir les formats','experience']
    ],
    clinicalEy:'KŌMØ CLINICAL',
    clinicalTitle:'La profondeur médicale,<br><em>quand elle est nécessaire.</em>',
    clinicalLead:'Clinical revient au premier plan : ce n’est pas un “upgrade premium”, mais la voie médicale de KŌMØ lorsqu’une situation nécessite une consultation, un examen ou une décision clinique.',
    clinicalItems:['Consultation médicale et histoire fonctionnelle','Examen clinique selon le contexte','Biologie, imagerie ou examens complémentaires uniquement si indiqués','Plan de rééducation, exercice ou orientation vers le bon professionnel','Coordination et réévaluation dans le temps'],
    clinicalNote:'Les actes médicaux restent distincts des offres wellness et ne sont proposés que dans un cadre professionnel, réglementaire et territorial approprié.',
    teamTitle:'Une trajectoire entourée des bonnes personnes.',
    teamCopy:'Selon le programme et l’indication, KŌMØ peut coordonner médecin, kinésithérapeute, coach, infirmier ou autres professionnels. L’objectif n’est pas d’empiler des prestations : c’est de rendre l’étape suivante évidente et exécutable.',
    pulseTitle:'Pulse garde le fil.',
    pulseCopy:'Résultats, priorités, programme, professionnels, progression et prochaine réévaluation : Pulse devient l’espace de continuité après la consultation, pas un test gratuit à faire avant.',
    worldTitle:'World prolonge l’accompagnement.',
    worldCopy:'World reste une couche interactive optionnelle pour exercices guidés, rééducation virtuelle, contenus et engagement entre deux étapes lorsque le programme s’y prête.',
    proEy:'POUR LES PROFESSIONNELS',
    proTitle:'Vendez d’abord l’expérience.<br><em>La Case vient ensuite.</em>',
    proLead:'Pour un hôtel, une clinique, un club ou un opérateur, KŌMØ commence par des consultations réellement délivrées. Le matériel permanent n’arrive qu’après preuve d’usage.',
    pipeline:[['01','Pilot','KŌMØ vient sur place avec l’équipe et le matériel.'],['02','Paid sessions','Le partenaire mesure la demande réelle et la satisfaction.'],['03','Recurring programme','Des journées ou créneaux KŌMØ deviennent récurrents.'],['04','Train','L’équipe partenaire est formée au périmètre qui lui revient.'],['05','Deploy Case','La Case devient l’infrastructure d’un service déjà utilisé.']],
    finalTitle:'Votre première expérience KŌMØ peut commencer<br><em>par une seule consultation.</em>',
    finalCopy:'Particulier, hôtel, yacht, clinique ou club : nous commençons par le besoin réel, puis nous construisons le niveau d’accompagnement adapté.',
    finalCta:'Demander une consultation',
    nav:[['Assessment','assessment'],['Clinical','clinical'],['Experiences','experience'],['Professionnels','partners'],['Pulse','pulse']]
  },
  en: {
    homeFiles: ['en/index.html'],
    assessmentFile: 'assessment/index.html',
    clinicalFile: 'clinical/index.html',
    partnersFile: 'partners/index.html',
    pulseFile: 'pulse/index.html',
    paths: { assessment:'/assessment/', clinical:'/clinical/', experience:'/experience/', partners:'/partners/', contact:'/contact/?intent=consultation', pulse:'https://pulse.komolongevity.com/', world:'/world/', method:'/method/' },
    metaTitle:'KŌMØ — Assessment, Clinical & Experiences | Longevity in Motion',
    metaDescription:'KŌMØ combines a complete functional assessment, a Clinical pathway when medical interpretation is indicated, and longitudinal support at home, in hotels, onboard or on retreat.',
    heroEy:'KŌMØ · LONGEVITY IN MOTION',
    heroTitle:'Understand your body.<br><em>Build what comes next.</em>',
    heroLead:'KŌMØ brings together movement assessment, clear results, clinical interpretation when indicated and ongoing support. One trajectory, wherever you choose to experience it.',
    heroPrimary:'Request a consultation',
    heroSecondary:'Discover KŌMØ Clinical',
    prices:['Assessment · €300 reference price','Clinical · €500 reference price','Yachting · individual assessment to private programme'],
    flow:[['01','Before','Profile & goals'],['02','Assessment','Movement & muscle'],['03','Results','Score & priorities'],['04','Team','Right professionals'],['05','Pulse','Follow-up & reassessment']],
    doors:[
      ['ASSESSMENT','KŌMØ Assessment','The universal entry point: movement, gait, balance, strength, mobility, coordination and muscle analysis according to protocol.','€300','Discover Assessment','assessment'],
      ['CLINICAL','KŌMØ Clinical','When medical interpretation is useful: consultation, examination and additional investigations only when independently indicated.','€500','Discover Clinical','clinical'],
      ['EXPERIENCES','KŌMØ Experiences','The same expertise delivered around you: at home, in hotels, onboard a yacht or during a retreat.','Tailored','Explore experiences','experience']
    ],
    journeyEy:'A COMPLETE EXPERIENCE',
    journeyTitle:'The assessment is the beginning.<br><em>Not the end.</em>',
    journeyLead:'Every consultation should produce an understandable result, a concrete action and a visible next step. KŌMØ organises that continuity around the person.',
    journey:[['01','Before','Profile, goals and context before arrival.'],['02','Assess','Structured functional and muscular measurements.'],['03','Understand','Clear debrief, Motion Score and priorities.'],['04','Act','Plan and professionals matched to the need.'],['05','Follow','Pulse keeps results, programme and progress together.'],['06','Reassess','Repeat the signals that should actually change.']],
    expEy:'KŌMØ EXPERIENCES',
    expTitle:'We come to you.<br><em>The method stays consistent.</em>',
    expLead:'Yachting is our first major deployment vertical, not a boundary around the brand. KŌMØ should work for an individual, hotel, villa, yacht or retreat group.',
    experiences:[
      ['YACHTING','KŌMØ Yachting','Functional longevity delivered onboard, from one individual assessment to a private programme: assessment, debrief, professionals and follow-up after the voyage.','Explore Yachting','/experience/'],
      ['HOME & VILLAS','At home','A KŌMØ consultation in a private environment, with the same protocol and quality of debrief.','Request a consultation','contact'],
      ['HOSPITALITY','Hotels & clubs','KŌMØ days and programmes operated on site before any permanent equipment decision.','For professionals','partners'],
      ['RETREATS','Retreats','Several days to assess, act and organise continuity after the stay.','Explore formats','experience']
    ],
    clinicalEy:'KŌMØ CLINICAL',
    clinicalTitle:'Medical depth,<br><em>when it is needed.</em>',
    clinicalLead:'Clinical returns to the foreground. It is not a premium upsell; it is the medical KŌMØ pathway when consultation, examination or clinical decision-making is required.',
    clinicalItems:['Medical consultation and functional history','Clinical examination according to context','Biology, imaging or other investigations only when indicated','Rehabilitation, exercise or referral plan','Coordination and reassessment over time'],
    clinicalNote:'Medical acts remain distinct from wellness offers and are delivered only within the appropriate professional, regulatory and territorial framework.',
    teamTitle:'A trajectory surrounded by the right people.',
    teamCopy:'Depending on the programme and indication, KŌMØ can coordinate a physician, physiotherapist, coach, nurse or other professionals. The goal is not to stack services; it is to make the next step executable.',
    pulseTitle:'Pulse keeps the thread.',
    pulseCopy:'Results, priorities, programme, professionals, progress and the next reassessment: Pulse becomes the continuity space after the consultation, not a free test before it.',
    worldTitle:'World extends the support.',
    worldCopy:'World remains an optional interactive layer for guided exercise, virtual rehabilitation, education and engagement between steps when the programme calls for it.',
    proEy:'FOR PROFESSIONALS',
    proTitle:'Sell the experience first.<br><em>The Case comes later.</em>',
    proLead:'For a hotel, clinic, club or operator, KŌMØ starts with real consultations delivered on site. Permanent equipment follows demonstrated use.',
    pipeline:[['01','Pilot','KŌMØ arrives with the team and equipment.'],['02','Paid sessions','The partner measures real demand and client response.'],['03','Recurring programme','KŌMØ days or slots become recurring.'],['04','Train','The partner team is trained for its defined scope.'],['05','Deploy Case','The Case becomes infrastructure for a service already in use.']],
    finalTitle:'Your first KŌMØ experience can begin<br><em>with one consultation.</em>',
    finalCopy:'Individual, hotel, yacht, clinic or club: we start with the real need and build the right level of support around it.',
    finalCta:'Request a consultation',
    nav:[['Assessment','assessment'],['Clinical','clinical'],['Experiences','experience'],['Professionals','partners'],['Pulse','pulse']]
  },
  es: {
    homeFiles: ['es/index.html'],
    assessmentFile: 'es/evaluacion/index.html',
    clinicalFile: 'es/clinical/index.html',
    partnersFile: 'es/partners/index.html',
    pulseFile: 'es/pulse/index.html',
    paths: { assessment:'/es/evaluacion/', clinical:'/es/clinical/', experience:'/es/experience/', partners:'/es/partners/', contact:'/es/contact/?intent=consultation', pulse:'https://pulse.komolongevity.com/', world:'/world/', method:'/es/metodo/' },
    metaTitle:'KŌMØ — Assessment, Clinical & Experiences | Longevidad en movimiento',
    metaDescription:'KŌMØ combina evaluación funcional completa, un recorrido Clinical cuando se necesita interpretación médica y seguimiento continuo en casa, hoteles, a bordo o en retreats.',
    heroEy:'KŌMØ · LONGEVIDAD EN MOVIMIENTO',
    heroTitle:'Entender tu cuerpo.<br><em>Construir lo que sigue.</em>',
    heroLead:'KŌMØ reúne evaluación del movimiento, resultados claros, interpretación clínica cuando está indicada y acompañamiento en el tiempo. Una trayectoria, donde quieras vivirla.',
    heroPrimary:'Solicitar una consulta',
    heroSecondary:'Descubrir KŌMØ Clinical',
    prices:['Assessment · 300 € precio de referencia','Clinical · 500 € precio de referencia','Yachting · evaluación individual a programa privado'],
    flow:[['01','Antes','Perfil y objetivos'],['02','Assessment','Movimiento y músculo'],['03','Resultados','Score y prioridades'],['04','Equipo','Profesionales adecuados'],['05','Pulse','Seguimiento y reevaluación']],
    doors:[
      ['ASSESSMENT','KŌMØ Assessment','La puerta de entrada universal: movimiento, marcha, equilibrio, fuerza, movilidad, coordinación y análisis muscular según protocolo.','300 €','Descubrir Assessment','assessment'],
      ['CLINICAL','KŌMØ Clinical','Cuando hace falta lectura médica: consulta, exploración y pruebas complementarias solo cuando están indicadas.','500 €','Descubrir Clinical','clinical'],
      ['EXPERIENCES','KŌMØ Experiences','La misma experiencia en tu entorno: casa, hotel, yacht o retreat.','A medida','Ver experiencias','experience']
    ],
    journeyEy:'UNA EXPERIENCIA COMPLETA',
    journeyTitle:'La evaluación es el principio.<br><em>No el final.</em>',
    journeyLead:'Cada consulta debe producir un resultado comprensible, una acción concreta y un siguiente paso visible. KŌMØ organiza esa continuidad alrededor de la persona.',
    journey:[['01','Antes','Perfil, objetivos y contexto.'],['02','Evaluar','Medidas funcionales y musculares estructuradas.'],['03','Entender','Restitución clara, Motion Score y prioridades.'],['04','Actuar','Plan y profesionales adaptados.'],['05','Seguir','Pulse reúne resultados, programa y progreso.'],['06','Reevaluar','Repetir lo que realmente debe cambiar.']],
    expEy:'KŌMØ EXPERIENCES',
    expTitle:'Vamos donde estás.<br><em>El método se mantiene.</em>',
    expLead:'Yachting es nuestra primera gran vertical de despliegue, no un límite de la marca. KŌMØ debe funcionar para una persona, hotel, villa, yacht o grupo de retreat.',
    experiences:[
      ['YACHTING','KŌMØ Yachting','Longevidad funcional a bordo, desde una evaluación individual hasta un programa privado con seguimiento posterior.','Descubrir Yachting','/experience/'],
      ['HOME & VILLAS','En casa','Consulta KŌMØ en un entorno privado con el mismo protocolo y calidad de restitución.','Solicitar consulta','contact'],
      ['HOSPITALITY','Hoteles & clubs','Jornadas KŌMØ operadas in situ antes de decidir una instalación permanente.','Para profesionales','partners'],
      ['RETREATS','Retreats','Varios días para evaluar, actuar y organizar la continuidad.','Ver formatos','experience']
    ],
    clinicalEy:'KŌMØ CLINICAL',
    clinicalTitle:'Profundidad médica,<br><em>cuando hace falta.</em>',
    clinicalLead:'Clinical vuelve al primer plano. No es un upsell premium; es la vía médica de KŌMØ cuando se requiere consulta, exploración o decisión clínica.',
    clinicalItems:['Consulta médica e historia funcional','Exploración clínica según contexto','Biología, imagen u otras pruebas solo si están indicadas','Plan de rehabilitación, ejercicio o derivación','Coordinación y reevaluación'],
    clinicalNote:'Los actos médicos permanecen separados de las ofertas wellness y solo se realizan dentro del marco profesional, regulatorio y territorial apropiado.',
    teamTitle:'Una trayectoria con las personas adecuadas.',
    teamCopy:'Según programa e indicación, KŌMØ puede coordinar médico, fisioterapeuta, coach, enfermería u otros profesionales. El objetivo no es acumular servicios, sino hacer ejecutable el siguiente paso.',
    pulseTitle:'Pulse mantiene el hilo.',
    pulseCopy:'Resultados, prioridades, programa, profesionales, progreso y próxima reevaluación: Pulse es el espacio de continuidad después de la consulta, no un test gratuito previo.',
    worldTitle:'World prolonga el acompañamiento.',
    worldCopy:'World sigue como capa interactiva opcional para ejercicio guiado, rehabilitación virtual, educación y engagement cuando el programa lo requiere.',
    proEy:'PARA PROFESIONALES',
    proTitle:'Primero la experiencia.<br><em>La Case viene después.</em>',
    proLead:'Para hotel, clínica, club u operador, KŌMØ empieza con consultas reales in situ. El equipamiento permanente llega después de demostrar uso.',
    pipeline:[['01','Pilot','KŌMØ llega con equipo y material.'],['02','Paid sessions','El socio mide demanda real y respuesta.'],['03','Recurring programme','Las jornadas KŌMØ se vuelven recurrentes.'],['04','Train','Se forma al equipo socio en su ámbito.'],['05','Deploy Case','La Case se convierte en infraestructura de un servicio ya usado.']],
    finalTitle:'Tu primera experiencia KŌMØ puede empezar<br><em>con una consulta.</em>',
    finalCopy:'Persona, hotel, yacht, clínica o club: empezamos por la necesidad real y construimos el nivel de acompañamiento adecuado.',
    finalCta:'Solicitar una consulta',
    nav:[['Assessment','assessment'],['Clinical','clinical'],['Experiences','experience'],['Profesionales','partners'],['Pulse','pulse']]
  }
};

function meta(html, title, description){
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${description}">`);
  html = html.replace(/\s*<style id="komo-commercial-trajectory-v2-style">[\s\S]*?<\/style>\s*(?=<\/head>)/,'');
  return html.replace('</head>', css+'\n</head>');
}
function url(c,key){ return c.paths[key] || key; }
function nav(c){
  const links = c.nav.map(([label,key])=>`<a href="${url(c,key)}">${label}</a>`).join('');
  return links;
}
function patchNav(html,c){
  html = html.replace(/<nav class="kp-nav">[\s\S]*?<\/nav>/, `<nav class="kp-nav">${nav(c)}</nav>`);
  html = html.replace(/<details class="kp-menu">[\s\S]*?<\/details>/, `<details class="kp-menu"><summary>Menu</summary><nav>${nav(c)}</nav></details>`);
  html = html.replace(/<a class="kp-mini" href="[^"]*">[\s\S]*?<\/a>/, `<a class="kp-mini" href="${c.paths.contact}">${c.heroPrimary} →</a>`);
  return html;
}
function mainReplace(html, body){
  const replacement = `<main id="main" class="kt-home">${body}</main>`;
  if (/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/.test(html)) return html.replace(/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/, replacement);
  return html.replace('</header>', `</header>${replacement}`);
}
function home(c){
  const doors = c.doors.map(([kick,title,copy,price,cta,key],i)=>`<article class="kt-door ${i===1?'kt-door--clinical':''}"><span class="kt-kicker">${kick}</span><h3 class="kt-h3">${title}</h3><p class="kt-copy">${copy}</p><div class="kt-door-foot"><b>${price}</b><a href="${url(c,key)}">${cta} →</a></div></article>`).join('');
  const steps = c.journey.map(([n,t,p])=>`<article class="kt-step"><span>${n}</span><h3>${t}</h3><p>${p}</p></article>`).join('');
  const exps = c.experiences.map(([kick,title,copy,cta,key],i)=>`<article class="kt-exp ${i===0?'kt-exp--yacht':''}"><span class="kt-kicker">${kick}</span><h3 class="kt-h3">${title}</h3><p class="kt-copy">${copy}</p><a href="${url(c,key)}">${cta} →</a></article>`).join('');
  const flow = c.flow.map(([n,t,s])=>`<div class="kt-flow-row"><b>${n}</b><span><strong>${t}</strong><br>${s}</span><i>→</i></div>`).join('');
  const clinicalList = c.clinicalItems.map(x=>`<li>${x}</li>`).join('');
  const pipe = c.pipeline.map(([n,t,p])=>`<div class="kt-pipe"><b>${n}</b><div><h3>${t}</h3><p>${p}</p></div></div>`).join('');
  return `
<section class="kt-hero"><div class="kt-shell kt-hero-grid"><div><p class="kt-ey">${c.heroEy}</p><h1 class="kt-title">${c.heroTitle}</h1><p class="kt-lead">${c.heroLead}</p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.paths.contact}">${c.heroPrimary}</a><a class="kt-btn kt-btn--light" href="${c.paths.clinical}">${c.heroSecondary}</a></div><div class="kt-pricebar">${c.prices.map(x=>`<span>${x}</span>`).join('')}</div></div><aside class="kt-hero-card"><strong>KŌMØ JOURNEY</strong><div class="kt-flow">${flow}</div></aside></div></section>
<section class="kt-section"><div class="kt-shell"><div class="kt-head"><div><p class="kt-ey">ONE KŌMØ · THREE ENTRANCES</p><h2 class="kt-h2">Assessment.<br>Clinical. <em>Experiences.</em></h2></div><p class="kt-copy">${c.heroLead}</p></div><div class="kt-doors">${doors}</div></div></section>
<section class="kt-section kt-section--warm"><div class="kt-shell"><div class="kt-head"><div><p class="kt-ey">${c.journeyEy}</p><h2 class="kt-h2">${c.journeyTitle}</h2></div><p class="kt-copy">${c.journeyLead}</p></div><div class="kt-journey">${steps}</div></div></section>
<section class="kt-section"><div class="kt-shell"><div class="kt-head"><div><p class="kt-ey">${c.expEy}</p><h2 class="kt-h2">${c.expTitle}</h2></div><p class="kt-copy">${c.expLead}</p></div><div class="kt-expgrid">${exps}</div></div></section>
<section class="kt-section kt-section--sage"><div class="kt-shell kt-clinical-grid"><div><p class="kt-ey">${c.clinicalEy}</p><h2 class="kt-h2">${c.clinicalTitle}</h2><p class="kt-lead">${c.clinicalLead}</p><p class="kt-note">${c.clinicalNote}</p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.paths.clinical}">${c.heroSecondary}</a></div></div><div class="kt-clinical-panel"><ul class="kt-list">${clinicalList}</ul></div></div></section>
<section class="kt-section"><div class="kt-shell"><div class="kt-head"><div><p class="kt-ey">AFTER KŌMØ</p><h2 class="kt-h2">${c.teamTitle}</h2></div><p class="kt-copy">${c.teamCopy}</p></div><div class="kt-continuity"><article class="kt-cont-card"><strong>KŌMØ PULSE</strong><h3 class="kt-h3">${c.pulseTitle}</h3><p class="kt-copy">${c.pulseCopy}</p><div class="kt-btns"><a class="kt-btn kt-btn--light" href="${c.paths.pulse}">Pulse →</a></div></article><article class="kt-cont-card kt-cont-card--world"><strong>KŌMØ WORLD</strong><h3 class="kt-h3">${c.worldTitle}</h3><p class="kt-copy">${c.worldCopy}</p><div class="kt-btns"><a class="kt-btn kt-btn--light" href="${c.paths.world}">World →</a></div></article></div></div></section>
<section class="kt-section kt-section--dark"><div class="kt-shell kt-pro-grid"><div><p class="kt-ey">${c.proEy}</p><h2 class="kt-h2">${c.proTitle}</h2><p class="kt-lead">${c.proLead}</p><div class="kt-btns"><a class="kt-btn kt-btn--ghost" href="${c.paths.partners}">KŌMØ for Professionals →</a></div></div><div class="kt-pipeline">${pipe}</div></div></section>
<section class="kt-final"><div class="kt-shell kt-final-grid"><div><p class="kt-ey">START WITH THE REAL NEED</p><h2 class="kt-h2">${c.finalTitle}</h2><p class="kt-copy">${c.finalCopy}</p></div><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.paths.contact}">${c.finalCta}</a></div></div></section>`;
}
function pageHero(ey,title,lead,primary,href,secondary='',href2=''){
  return `<section class="kt-pagehero"><div class="kt-shell"><p class="kt-ey">${ey}</p><h1 class="kt-title">${title}</h1><p class="kt-lead">${lead}</p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${href}">${primary}</a>${secondary?`<a class="kt-btn kt-btn--light" href="${href2}">${secondary}</a>`:''}</div></div></section>`;
}
function assessment(c){
  const title = c===localeData.fr?'Une évaluation complète.<br><em>Une suite concrète.</em>':c===localeData.es?'Una evaluación completa.<br><em>Un siguiente paso concreto.</em>':'A complete assessment.<br><em>A concrete next step.</em>';
  const lead = c===localeData.fr?'KŌMØ Assessment est la porte d’entrée fonctionnelle : environ 30 minutes d’analyse structurée, puis une restitution plus complète pour comprendre les résultats et définir la suite.':c===localeData.es?'KŌMØ Assessment es la entrada funcional: alrededor de 30 minutos de análisis estructurado y una restitución más amplia para entender resultados y definir lo siguiente.':'KŌMØ Assessment is the functional entry point: around 30 minutes of structured analysis, followed by a fuller debrief to understand the results and define what comes next.';
  const labels = c===localeData.fr?[
    ['AVANT','Préparation','Objectifs, contexte, activité et éléments utiles avant la session.'],
    ['MESURE','Assessment','Marche, mobilité, équilibre, force, coordination et analyse musculaire selon protocole.'],
    ['RÉSULTATS','Restitution','Profil fonctionnel, Motion Score, priorités et explication humaine des résultats.'],
    ['SUITE','Plan','Professionnels, programme, suivi Pulse et réévaluation lorsque pertinent.']
  ]:c===localeData.es?[
    ['ANTES','Preparación','Objetivos, contexto, actividad y elementos útiles antes de la sesión.'],
    ['MEDIR','Assessment','Marcha, movilidad, equilibrio, fuerza, coordinación y análisis muscular según protocolo.'],
    ['RESULTADOS','Restitución','Perfil funcional, Motion Score, prioridades y explicación humana.'],
    ['SIGUIENTE','Plan','Profesionales, programa, Pulse y reevaluación cuando sea pertinente.']
  ]:[
    ['BEFORE','Preparation','Goals, context, activity and useful information before the session.'],
    ['MEASURE','Assessment','Gait, mobility, balance, strength, coordination and muscle analysis according to protocol.'],
    ['RESULTS','Debrief','Functional profile, Motion Score, priorities and a human explanation of the results.'],
    ['NEXT','Plan','Professionals, programme, Pulse follow-up and reassessment when relevant.']
  ];
  return pageHero('KŌMØ ASSESSMENT',title,lead,c.heroPrimary,c.paths.contact,c.heroSecondary,c.paths.clinical)+`<section class="kt-pagebody"><div class="kt-shell"><div class="kt-pagegrid">${labels.map(([e,t,p])=>`<article class="kt-pagecard"><span class="kt-kicker">${e}</span><h2 class="kt-h3">${t}</h2><p class="kt-copy">${p}</p></article>`).join('')}</div><p class="kt-note">${c===localeData.fr?'Assessment est une restitution fonctionnelle non médicale. Si une lecture médicale est nécessaire, KŌMØ Clinical prend le relais dans un cadre approprié.':c===localeData.es?'Assessment es una restitución funcional no médica. Si hace falta interpretación médica, KŌMØ Clinical toma el relevo dentro del marco apropiado.':'Assessment provides non-medical functional feedback. When medical interpretation is needed, KŌMØ Clinical takes over within the appropriate framework.'}</p></div></section>`;
}
function clinicalPage(c){
  const isFr=c===localeData.fr,isEs=c===localeData.es;
  const title=isFr?'Quand les données ont besoin<br><em>d’une lecture médicale.</em>':isEs?'Cuando los datos necesitan<br><em>lectura médica.</em>':'When data needs<br><em>medical interpretation.</em>';
  const lead=isFr?'KŌMØ Clinical associe l’évaluation fonctionnelle à une consultation médicale lorsque le contexte le justifie. Le médecin garde la responsabilité de l’indication, de l’interprétation et des décisions de soin.':isEs?'KŌMØ Clinical une la evaluación funcional con consulta médica cuando el contexto lo justifica. El médico mantiene la responsabilidad de indicación, interpretación y decisiones clínicas.':'KŌMØ Clinical combines functional assessment with medical consultation when the context warrants it. The physician remains responsible for indication, interpretation and care decisions.';
  const items=isFr?[
    ['01','Contexte','Histoire fonctionnelle, symptômes éventuels, objectifs et contraintes.'],
    ['02','Examen','Examen clinique ciblé selon l’indication.'],
    ['03','Mesures','Lecture du mouvement, du muscle et des tests fonctionnels dans leur contexte.'],
    ['04','Compléter','Biologie, imagerie ou autre examen uniquement s’il existe une indication indépendante.'],
    ['05','Plan','Rééducation, exercice, orientation, suivi ou autre prise en charge adaptée.']
  ]:isEs?[
    ['01','Contexto','Historia funcional, síntomas si existen, objetivos y limitaciones.'],
    ['02','Exploración','Exploración clínica dirigida según indicación.'],
    ['03','Medidas','Lectura de movimiento, músculo y pruebas funcionales en contexto.'],
    ['04','Completar','Biología, imagen u otras pruebas solo con indicación independiente.'],
    ['05','Plan','Rehabilitación, ejercicio, derivación y seguimiento apropiados.']
  ]:[
    ['01','Context','Functional history, possible symptoms, goals and constraints.'],
    ['02','Examination','Targeted clinical examination according to indication.'],
    ['03','Measurements','Movement, muscle and functional tests interpreted in context.'],
    ['04','Complete','Biology, imaging or other tests only when independently indicated.'],
    ['05','Plan','Rehabilitation, exercise, referral, follow-up or other appropriate care.']
  ];
  return pageHero('KŌMØ CLINICAL',title,lead,c.heroPrimary,c.paths.contact,'KŌMØ Assessment',c.paths.assessment)+`<section class="kt-pagebody"><div class="kt-shell"><div class="kt-mini-flow">${items.map(([n,t])=>`<div><b>${n}</b><span>${t}</span></div>`).join('')}</div><div class="kt-pagegrid">${items.map(([e,t,p])=>`<article class="kt-pagecard"><span class="kt-kicker">${e}</span><h2 class="kt-h3">${t}</h2><p class="kt-copy">${p}</p></article>`).join('')}</div><p class="kt-note">${c.clinicalNote}</p></div></section>`;
}
function partnersPage(c){
  const isFr=c===localeData.fr,isEs=c===localeData.es;
  const title=isFr?'Faites vivre KŌMØ<br><em>avant d’acheter du matériel.</em>':isEs?'Haz vivir KŌMØ<br><em>antes de comprar material.</em>':'Deliver KŌMØ first.<br><em>Buy hardware later.</em>';
  const lead=isFr?'Notre modèle B2B commence par des consultations et des journées KŌMØ opérées sur votre site. Vous voyez la demande, vos équipes comprennent le service, puis nous construisons le modèle récurrent et seulement ensuite le déploiement permanent.':isEs?'Nuestro modelo B2B empieza con consultas y jornadas KŌMØ operadas en tu centro. Primero se demuestra la demanda y después se construye el modelo recurrente y el despliegue permanente.':'Our B2B model starts with consultations and KŌMØ days operated in your setting. Demand is demonstrated first; recurring operations and permanent deployment follow.';
  const sectors=isFr?[
    ['Yachting','Programme à bord pour owners, guests ou crew selon le format.'],
    ['Hospitality','Journées KŌMØ et intégration dans l’expérience client.'],
    ['Clinical','Centres médicaux et longévité souhaitant structurer une offre locomotrice.'],
    ['Fitness & performance','Bilans, progression et continuité avec un cadre clair.']
  ]:isEs?[
    ['Yachting','Programas a bordo para owners, guests o crew según formato.'],
    ['Hospitality','Jornadas KŌMØ e integración en la experiencia del cliente.'],
    ['Clinical','Centros médicos y de longevidad que quieren estructurar una oferta locomotora.'],
    ['Fitness & performance','Evaluaciones, progreso y continuidad con un marco claro.']
  ]:[
    ['Yachting','Onboard programmes for owners, guests or crew according to format.'],
    ['Hospitality','KŌMØ days and integration into the guest experience.'],
    ['Clinical','Medical and longevity centres building a structured locomotor offer.'],
    ['Fitness & performance','Assessment, progression and continuity with clear governance.']
  ];
  const secondary=isFr?'Découvrir l’Assessment':isEs?'Descubrir Assessment':'Discover Assessment';
  return pageHero(c.proEy,title,lead,isFr?'Organiser un pilote':isEs?'Organizar un piloto':'Run a pilot',c.paths.contact,secondary,c.paths.assessment)+`<section class="kt-pagebody"><div class="kt-shell"><div class="kt-mini-flow">${c.pipeline.map(([n,t])=>`<div><b>${n}</b><span>${t}</span></div>`).join('')}</div><div class="kt-pagegrid">${sectors.map(([t,p])=>`<article class="kt-pagecard"><span class="kt-kicker">KŌMØ</span><h2 class="kt-h3">${t}</h2><p class="kt-copy">${p}</p></article>`).join('')}</div><p class="kt-note">${isFr?'La KŌMØ Case devient une infrastructure de déploiement une fois l’usage démontré. Elle n’est plus la première chose que nous essayons de vendre.':isEs?'La KŌMØ Case se convierte en infraestructura cuando el uso ya está demostrado; deja de ser el primer producto a vender.':'The KŌMØ Case becomes deployment infrastructure once real use has been demonstrated. It is no longer the first thing we try to sell.'}</p></div></section>`;
}
function experiencePage(c){
  const isFr=c===localeData.fr,isEs=c===localeData.es;
  const title=isFr?'Une même expérience.<br><em>Plusieurs lieux.</em>':isEs?'Una misma experiencia.<br><em>Varios lugares.</em>':'One experience.<br><em>Different settings.</em>';
  const lead=isFr?'KŌMØ se déplace avec la personne. Yachting ouvre la voie, mais la même qualité d’évaluation, de restitution et de suivi peut être délivrée à domicile, dans un hôtel ou pendant un retreat.':isEs?'KŌMØ se desplaza con la persona. Yachting abre el camino, pero la misma calidad puede vivir en casa, hotel o retreat.':'KŌMØ moves with the person. Yachting leads the launch, but the same standard of assessment, debrief and follow-up can be delivered at home, in hotels or during retreats.';
  const cards=c.experiences.map(([k,t,p,cta,key])=>`<article class="kt-pagecard"><span class="kt-kicker">${k}</span><h2 class="kt-h3">${t}</h2><p class="kt-copy">${p}</p><div class="kt-btns"><a class="kt-btn kt-btn--light" href="${url(c,key)}">${cta}</a></div></article>`).join('');
  return pageHero('KŌMØ EXPERIENCES',title,lead,c.heroPrimary,c.paths.contact,c.heroSecondary,c.paths.clinical)+`<section class="kt-pagebody"><div class="kt-shell"><div class="kt-pagegrid">${cards}</div><p class="kt-note">${c.clinicalNote}</p></div></section>`;
}

function pulsePage(c){
  const isFr=c===localeData.fr,isEs=c===localeData.es;
  const title=isFr?'Votre consultation continue<br><em>dans Pulse.</em>':isEs?'Tu consulta continúa<br><em>en Pulse.</em>':'Your consultation continues<br><em>in Pulse.</em>';
  const lead=isFr?'Pulse est l’espace personnel KŌMØ après votre consultation : résultats, priorités, programme, professionnels, progression et prochaine réévaluation restent réunis dans une seule trajectoire.':isEs?'Pulse es el espacio personal KŌMØ después de tu consulta: resultados, prioridades, programa, profesionales, progreso y próxima reevaluación en una sola trayectoria.':'Pulse is your personal KŌMØ space after consultation: results, priorities, programme, professionals, progress and the next reassessment stay together in one trajectory.';
  const cards=isFr?[
    ['VOS RÉSULTATS','Comprendre','Retrouvez votre restitution, vos repères fonctionnels, votre Motion Score et les éléments expliqués pendant la consultation.'],
    ['VOTRE PLAN','Agir','Les priorités et prochaines actions restent visibles, sans transformer Pulse en outil d’auto-diagnostic.'],
    ['VOTRE ÉQUIPE','Être accompagné','Retrouvez les professionnels qui interviennent dans votre trajectoire et les prochains rendez-vous utiles.'],
    ['VOTRE PROGRESSION','Réévaluer','Comparez les évaluations successives et mesurez ce qui évolue réellement dans le temps.']
  ]:isEs?[
    ['TUS RESULTADOS','Entender','Consulta tu restitución, referencias funcionales, Motion Score y los elementos explicados durante la consulta.'],
    ['TU PLAN','Actuar','Las prioridades y siguientes acciones siguen visibles sin convertir Pulse en autodiagnóstico.'],
    ['TU EQUIPO','Acompañamiento','Profesionales, próximos pasos y citas útiles reunidos en el mismo espacio.'],
    ['TU PROGRESO','Reevaluar','Compara evaluaciones sucesivas y mide lo que realmente cambia con el tiempo.']
  ]:[
    ['YOUR RESULTS','Understand','Return to your debrief, functional references, Motion Score and the elements explained during the consultation.'],
    ['YOUR PLAN','Act','Keep priorities and next actions visible without turning Pulse into a self-diagnosis tool.'],
    ['YOUR TEAM','Be supported','Find the professionals involved in your trajectory and the next useful appointments.'],
    ['YOUR PROGRESS','Reassess','Compare successive assessments and measure what actually changes over time.']
  ];
  const access=isFr?'Accéder à mon espace Pulse':isEs?'Acceder a mi espacio Pulse':'Open my Pulse space';
  const consult=isFr?'Demander une consultation':isEs?'Solicitar una consulta':'Request a consultation';
  const note=isFr?'Il n’existe plus de « test KŌMØ gratuit » comme porte d’entrée commerciale. Pulse prend sa valeur dans la continuité d’une vraie évaluation et de son accompagnement.':isEs?'El « test KŌMØ gratuito » ya no es una puerta de entrada comercial. Pulse cobra valor como continuidad de una evaluación real y su acompañamiento.':'The “free KŌMØ test” is no longer a commercial entry point. Pulse is valuable as the continuity layer after a real assessment and its follow-up.';
  return pageHero('KŌMØ PULSE',title,lead,access,'https://pulse.komolongevity.com/',consult,c.paths.contact)+
    `<section class="kt-pagebody"><div class="kt-shell"><div class="kt-pagegrid">${cards.map(([e,t,p])=>`<article class="kt-pagecard"><span class="kt-kicker">${e}</span><h2 class="kt-h3">${t}</h2><p class="kt-copy">${p}</p></article>`).join('')}</div><p class="kt-note">${note}</p></div></section>`;
}
function pageMeta(c,type){
  const isFr=c===localeData.fr,isEs=c===localeData.es;
  const map={
    assessment: isFr?['KŌMØ Assessment — Évaluation fonctionnelle et trajectoire','Évaluation du mouvement, de la marche, de l’équilibre, de la force et du muscle, suivie d’une restitution et d’un plan d’action.']:isEs?['KŌMØ Assessment — Evaluación funcional y trayectoria','Evaluación de movimiento, marcha, equilibrio, fuerza y músculo, con restitución y plan de acción.']:['KŌMØ Assessment — Functional assessment and trajectory','Movement, gait, balance, strength and muscle assessment followed by a clear debrief and action plan.'],
    clinical: isFr?['KŌMØ Clinical — Évaluation médicale de longévité locomotrice','KŌMØ Clinical associe évaluation fonctionnelle et consultation médicale lorsque l’indication le justifie, avec plan et suivi personnalisés.']:isEs?['KŌMØ Clinical — Evaluación médica de longevidad locomotora','KŌMØ Clinical combina evaluación funcional y consulta médica cuando está indicada, con plan y seguimiento personalizados.']:['KŌMØ Clinical — Medical locomotor longevity assessment','KŌMØ Clinical combines functional assessment with medical consultation when indicated, followed by a personalised plan and continuity.'],
    partners: isFr?['KŌMØ pour les professionnels — Pilotes, consultations et déploiement','Hôtels, yachts, cliniques et clubs : commencez par un pilote KŌMØ opéré sur site, mesurez l’usage, puis déployez le modèle adapté.']:isEs?['KŌMØ para profesionales — Pilotos, consultas y despliegue','Hoteles, yachts, clínicas y clubs: empieza con un piloto KŌMØ operado in situ y despliega después el modelo adecuado.']:['KŌMØ for Professionals — Pilots, consultations and deployment','Hotels, yachts, clinics and clubs: start with an operated KŌMØ pilot, prove usage, then deploy the right recurring model.'],
    experience: isFr?['KŌMØ Experiences — Yachting, Home, Hospitality & Retreats','Vivez l’expérience KŌMØ à bord, à domicile, en hôtel ou en retreat, avec la même exigence d’évaluation, de restitution et de suivi.']:isEs?['KŌMØ Experiences — Yachting, Home, Hospitality & Retreats','Vive KŌMØ a bordo, en casa, hotel o retreat con el mismo estándar de evaluación, restitución y seguimiento.']:['KŌMØ Experiences — Yachting, Home, Hospitality & Retreats','Experience KŌMØ onboard, at home, in hotels or on retreat with the same standard of assessment, debrief and follow-up.'],
    pulse: isFr?['KŌMØ Pulse — Vos résultats, votre plan, votre progression','Après votre consultation KŌMØ, Pulse réunit résultats, priorités, programme, professionnels, progression et prochaine réévaluation.']:isEs?['KŌMØ Pulse — Resultados, plan y progreso','Después de tu consulta KŌMØ, Pulse reúne resultados, prioridades, programa, profesionales, progreso y próxima reevaluación.']:['KŌMØ Pulse — Results, plan and progress','After your KŌMØ consultation, Pulse brings together results, priorities, programme, professionals, progress and your next reassessment.']
  };
  return map[type];
}
async function exists(fp){try{await access(fp);return true}catch{return false}}
async function patchExisting(relative,c,body,title,description){
  const fp=join(site,relative); if(!(await exists(fp))) return false;
  let html=await readFile(fp,'utf8'); html=meta(html,title,description); html=patchNav(html,c); html=mainReplace(html,body); await writeFile(fp,html,'utf8'); return true;
}
async function ensureExperience(relative,c){
  const fp=join(site,relative);
  if(await exists(fp)){const m=pageMeta(c,'experience');return patchExisting(relative,c,experiencePage(c),...m)}
  const source=join(site,c.homeFiles[0]);
  if(!(await exists(source))) return false;
  await mkdir(dirname(fp),{recursive:true});
  const m=pageMeta(c,'experience'); let html=await readFile(source,'utf8'); html=meta(html,...m); html=patchNav(html,c); html=mainReplace(html,experiencePage(c)); await writeFile(fp,html,'utf8'); return true;
}

for(const c of Object.values(localeData)){
  for(const homeFile of c.homeFiles) await patchExisting(homeFile,c,home(c),c.metaTitle,c.metaDescription);
  const assessmentMeta=pageMeta(c,'assessment'),clinicalMeta=pageMeta(c,'clinical'),partnersMeta=pageMeta(c,'partners'),pulseMeta=pageMeta(c,'pulse');
  await patchExisting(c.assessmentFile,c,assessment(c),...assessmentMeta);
  await patchExisting(c.clinicalFile,c,clinicalPage(c),...clinicalMeta);
  await patchExisting(c.partnersFile,c,partnersPage(c),...partnersMeta);
  await patchExisting(c.pulseFile,c,pulsePage(c),...pulseMeta);
}
await ensureExperience('fr/experience/index.html',localeData.fr);
await ensureExperience('es/experience/index.html',localeData.es);
await patchExisting('experience/index.html',localeData.en,experiencePage(localeData.en),...pageMeta(localeData.en,'experience'));

console.log('[komo-commercial-trajectory-v2] PASS · consultation-first, Clinical-first, experience-first commercial architecture applied; free-test entry removed from primary public journey.');
