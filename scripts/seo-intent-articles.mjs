import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const mediaRoot = join(root, 'site', 'assets', 'media');

const articles = [
  {
    slug:'marche-plus-lente',
    title:'Pourquoi je marche plus lentement qu’avant ?',
    seoTitle:'Pourquoi je marche plus lentement qu’avant ? Mobilité et vieillissement | KŌMØ Library',
    description:'Pourquoi la marche peut-elle ralentir avec l’âge ? Vitesse, longueur du pas, équilibre, puissance musculaire et contexte : comprendre sans réduire la mobilité à un seul chiffre.',
    meta:'MARCHE · MOBILITÉ · 6 MIN',
    dek:'La vitesse de marche peut évoluer progressivement avec l’âge, mais elle dépend de plusieurs systèmes à la fois : puissance musculaire, équilibre, amplitude, coordination, confiance et coût énergétique.',
    takeaways:[
      'La vitesse de marche est une mesure fonctionnelle simple, mais son interprétation dépend du protocole et du contexte.',
      'Avec l’âge, les études décrivent souvent des pas plus courts, une vitesse plus basse et davantage de temps en double appui.',
      'Un ralentissement récent ou marqué mérite d’être replacé dans l’histoire de la personne plutôt que considéré comme « normal » par principe.'
    ],
    sections:[
      ['La marche est un résultat de tout le système','Marcher demande de produire une propulsion, déplacer le centre de masse, contrôler les appuis et adapter en permanence l’équilibre. La vitesse finale dépend donc du muscle, des articulations, du système sensoriel, de la coordination et du contexte. Une revue systématique récente confirme que les tests de vitesse de marche habituelle ou rapide sont largement utilisés chez les adultes âgés et peuvent être reproductibles, tout en soulignant l’importance du protocole de mesure.'],
      ['Pourquoi les pas peuvent devenir plus courts','Une revue de la littérature sur la marche des adultes âgés décrit une tendance vers une vitesse plus lente, des pas plus courts, une base d’appui plus large et davantage de double appui. Ces adaptations peuvent contribuer à la stabilité, mais elles ne disent pas à elles seules pourquoi une personne ralentit.'],
      ['Ce que KŌMØ cherche à comprendre','KŌMØ ne traite pas la vitesse comme un verdict. Elle est rapprochée de la cadence, du lever de chaise, de l’équilibre, de la posture et, lorsque le cadre le permet, de mesures instrumentées. L’objectif est de distinguer un changement global de capacité d’un simple choix de rythme.'],
      ['Quand demander un avis professionnel','Un changement brutal, une faiblesse nouvelle, des chutes répétées, un essoufflement inhabituel, un malaise, une douleur importante ou des signes neurologiques associés justifient une évaluation médicale plutôt qu’une simple auto-mesure. Pour un changement progressif sans signe d’alerte, documenter sa mobilité de façon reproductible peut constituer un bon point de départ.']
    ],
    pull:'La vitesse est facile à mesurer. Comprendre pourquoi elle change demande de regarder l’ensemble du mouvement.',
    established:'La vitesse de marche est une mesure fonctionnelle largement étudiée ; les paramètres de marche évoluent en moyenne avec l’âge.',
    komo:'Vitesse, cadence, fonction des membres inférieurs, équilibre et posture sont interprétés ensemble.',
    research:'La meilleure combinaison de paramètres pour caractériser une trajectoire individuelle reste à valider prospectivement.',
    sources:[
      ['Measurement properties of the usual and fast gait speed tests in community-dwelling older adults. Age Ageing. 2024','https://pubmed.ncbi.nlm.nih.gov/38517125/'],
      ['The effect of aging on gait parameters in able-bodied older subjects: a literature review. 2015','https://pubmed.ncbi.nlm.nih.gov/26210370/']
    ],
    related:[['Walking is Data','/media/walking-is-data'],['The Biomechanics of Aging','/media/biomechanics-aging'],['Faire le KŌMØ Check','/fr/check/']],
    faq:[['Est-il normal de marcher plus lentement avec l’âge ?','Une diminution moyenne de vitesse est observée dans de nombreuses études, mais un changement individuel doit être interprété selon son rythme d’apparition, le contexte et les autres capacités fonctionnelles.'],['Comment mesurer sa vitesse de marche ?','Un protocole standardisé est préférable : distance définie, allure précisée, même surface et mêmes conditions lors des mesures répétées.']]
  },
  {
    slug:'difficulte-se-relever-chaise',
    title:'Pourquoi ai-je plus de mal à me relever d’une chaise ?',
    seoTitle:'Difficulté à se relever d’une chaise : que mesure ce geste ? | KŌMØ Library',
    description:'Se relever d’une chaise demande force, puissance, équilibre et coordination. Comprendre pourquoi ce geste devient plus difficile et comment l’évaluer sans en faire un diagnostic isolé.',
    meta:'FONCTION · MUSCLE · 6 MIN',
    dek:'Se lever d’une chaise paraît simple, mais ce geste combine force des membres inférieurs, déplacement du centre de masse, équilibre, mobilité articulaire et coordination.',
    takeaways:[
      'La force des membres inférieurs contribue fortement à la capacité de se relever, mais elle n’est pas la seule composante.',
      'Le Five Times Sit-to-Stand permet de standardiser cinq levers successifs et de suivre une performance fonctionnelle.',
      'Comparer dans le temps exige de conserver la même chaise, les mêmes consignes et les mêmes conditions.'
    ],
    sections:[
      ['Un geste quotidien très exigeant','Pour se relever, le tronc se projette vers l’avant, le centre de masse se déplace au-dessus des pieds puis les hanches et les genoux produisent l’extension nécessaire. Des travaux biomécaniques montrent que force des membres inférieurs et contrôle de l’équilibre contribuent à cette tâche.'],
      ['Pourquoi cela peut devenir plus difficile','Une baisse de force ou de puissance, une mobilité limitée, une stratégie de protection liée à la douleur, un trouble d’équilibre ou une coordination moins efficace peuvent modifier le geste. Cela signifie qu’un temps plus long ne permet pas, à lui seul, d’identifier une cause.'],
      ['Le test de cinq levers','Le Five Times Sit-to-Stand est couramment utilisé pour objectiver la performance assis-debout. Une revue systématique a montré que les protocoles varient entre études et rappelle l’importance de standardiser hauteur de chaise, usage des bras, rythme demandé et chronométrage.'],
      ['Quand demander un avis professionnel','Si la difficulté apparaît brutalement, s’accompagne d’une faiblesse d’un côté, d’une douleur importante, de chutes, d’un malaise ou d’une perte d’autonomie rapide, une évaluation professionnelle est préférable. Pour une évolution progressive, mesurer le geste dans des conditions reproductibles peut aider à objectiver la trajectoire.']
    ],
    pull:'Le lever de chaise ne teste pas un muscle. Il teste une capacité fonctionnelle complète.',
    established:'Force et équilibre participent au lever ; les tests répétés de lever sont largement utilisés en évaluation fonctionnelle.',
    komo:'Le lever de chaise est rapproché de la marche, de l’équilibre et d’autres mesures plutôt qu’interprété seul.',
    research:'L’intégration optimale de ces performances dans un score locomoteur longitudinal nécessite une validation dédiée.',
    sources:[
      ['What is the optimal chair stand test protocol for older adults? A systematic review. 2019','https://pubmed.ncbi.nlm.nih.gov/30907166/'],
      ['The relative importance of strength and balance in chair rise. J Am Geriatr Soc. 1996','https://pubmed.ncbi.nlm.nih.gov/8951313/']
    ],
    related:[['Le test de lever de chaise','/media/test-lever-chaise'],['Sarcopénie : la force avant la masse','/media/sarcopenie-force-musculaire'],['Faire le KŌMØ Check','/fr/check/']],
    faq:[['Pourquoi utilise-t-on parfois les bras pour se relever ?','L’usage des bras peut compenser une demande plus importante pour les membres inférieurs. C’est pourquoi les protocoles de test précisent s’ils sont autorisés ou non.'],['Un temps lent au test de chaise signifie-t-il une sarcopénie ?','Non. Le test décrit une performance fonctionnelle. La sarcopénie repose sur un cadre d’évaluation plus large.']]
  },
  {
    slug:'marche-asymetrique',
    title:'Pourquoi ma marche peut-elle devenir asymétrique ?',
    seoTitle:'Marche asymétrique : pourquoi un côté peut-il être différent ? | KŌMØ Library',
    description:'Une marche asymétrique peut concerner le temps d’appui, la longueur du pas ou la propulsion. Comprendre ce que l’asymétrie mesure et pourquoi elle doit être interprétée dans son contexte.',
    meta:'MARCHE · BIOMÉCANIQUE · 6 MIN',
    dek:'Nos deux côtés ne sont jamais parfaitement identiques. Mais lorsqu’une différence devient visible ou augmente, il est utile de distinguer variation normale, adaptation et changement fonctionnel.',
    takeaways:[
      'L’asymétrie peut concerner plusieurs paramètres : temps d’appui, longueur de pas, forces, cinématique ou activation musculaire.',
      'Chez les adultes âgés, certaines asymétries temporelles sont associées à des performances fonctionnelles, mais leur origine n’est pas unique.',
      'Une asymétrie récente ou nettement progressive doit être interprétée avec l’examen clinique et l’histoire de la personne.'
    ],
    sections:[
      ['Il n’existe pas une seule asymétrie','Deux jambes peuvent différer par la durée d’appui, la longueur du pas, la propulsion ou la stratégie articulaire. Une valeur dite « asymétrique » n’a donc de sens que si l’on sait précisément quel paramètre est mesuré et dans quelles conditions.'],
      ['Vieillissement, adaptation et fonction','Une revue systématique consacrée aux adultes âgés a trouvé que les asymétries, notamment temporelles, étaient surtout reliées à certains résultats fonctionnels ; la relation avec la performance musculaire restait moins claire. Une autre revue décrit avec l’âge des modifications moyennes de longueur de pas, largeur d’appui et symétrie.'],
      ['Pourquoi la répétition compte','Une seule traversée peut être influencée par l’environnement, l’attention ou une hésitation. Des mesures répétées, réalisées dans des conditions comparables, sont plus utiles pour savoir si une asymétrie est stable, variable ou en progression.'],
      ['Quand demander un avis professionnel','Une asymétrie nouvelle accompagnée de faiblesse, engourdissement, douleur importante, chute du pied, trouble soudain de l’équilibre ou autre signe neurologique doit être évaluée rapidement. Une asymétrie plus ancienne et stable peut également mériter une analyse si elle limite la marche ou s’aggrave.']
    ],
    pull:'Une différence droite-gauche est une information. Elle n’est pas, à elle seule, un diagnostic.',
    established:'Les asymétries de marche peuvent être quantifiées dans plusieurs domaines spatiotemporels, cinématiques et cinétiques.',
    komo:'KŌMØ privilégie la comparaison bilatérale et longitudinale dans un protocole défini.',
    research:'Les seuils individuels les plus pertinents pour distinguer adaptation et dégradation fonctionnelle restent dépendants du contexte.',
    sources:[
      ['Is muscular and functional performance related to gait symmetry in older adults? A systematic review. 2019','https://pubmed.ncbi.nlm.nih.gov/31220618/'],
      ['The effect of aging on gait parameters in able-bodied older subjects. 2015','https://pubmed.ncbi.nlm.nih.gov/26210370/']
    ],
    related:[['Walking is Data','/media/walking-is-data'],['The Biomechanics of Aging','/media/biomechanics-aging'],['Équilibre et vieillissement','/media/equilibre-vieillissement']],
    faq:[['Une marche asymétrique est-elle toujours anormale ?','Non. Une certaine variabilité entre les côtés existe. Ce sont l’importance, la persistance, l’évolution et le contexte clinique qui donnent du sens à la mesure.'],['Peut-on voir une asymétrie sans laboratoire de marche ?','Certaines différences sont visibles à l’œil nu, mais leur quantification fiable demande un protocole et parfois des outils instrumentés.']]
  },
  {
    slug:'tester-mobilite-chez-soi',
    title:'Comment tester sa mobilité chez soi ?',
    seoTitle:'Comment tester sa mobilité chez soi ? Marche, lever et équilibre | KŌMØ Library',
    description:'Quels tests simples peuvent documenter la mobilité à domicile ? Marche, lever de chaise, questionnaire fonctionnel : ce qu’ils mesurent, leurs limites et quand préférer une évaluation supervisée.',
    meta:'PRÉVENTION · TESTS · 7 MIN',
    dek:'Quelques tests simples peuvent donner un premier repère sur la mobilité. Leur intérêt vient surtout d’un protocole clair, de la répétition dans le temps et d’une interprétation prudente.',
    takeaways:[
      'Il n’existe pas un test unique capable de résumer toute la mobilité.',
      'Marche, transfert assis-debout, équilibre et questionnaire fonctionnel explorent des dimensions différentes.',
      'Un test à domicile est un repère éducatif : il ne remplace pas une évaluation professionnelle lorsqu’un problème est présent.'
    ],
    sections:[
      ['Mesurer plusieurs dimensions','Une revue systématique a identifié de nombreux tests de mobilité chez les adultes âgés, portant notamment sur la marche, l’équilibre et les transferts. La littérature sur l’évaluation fonctionnelle utilise fréquemment la vitesse de marche, le Timed Up and Go, le lever de chaise, la force de préhension ou des batteries combinées.'],
      ['Pourquoi KŌMØ Check utilise plusieurs observations','Un questionnaire fonctionnel renseigne sur la vie réelle ; une observation de lever documente une capacité des membres inférieurs ; le Two-Step explore une expression fonctionnelle du déplacement. Ces éléments ne posent pas de diagnostic, mais créent un premier repère commun.'],
      ['La sécurité passe avant le score','Un test ne doit pas être tenté si l’environnement n’est pas sûr, si l’on se sent instable, si une douleur aiguë est présente ou si l’on a besoin d’une aide humaine pour éviter une chute. Dans ce cas, une évaluation supervisée est plus adaptée.'],
      ['Ce qui rend le suivi utile','Le meilleur intérêt d’une auto-évaluation est souvent longitudinal : refaire la même tâche dans les mêmes conditions permet de voir une tendance. Les comparaisons entre personnes sont beaucoup plus fragiles lorsque les protocoles diffèrent.']
    ],
    pull:'Chez soi, le bon objectif n’est pas de se diagnostiquer. C’est d’obtenir un premier repère reproductible.',
    established:'Plusieurs tests validés explorent des dimensions différentes de la mobilité ; aucun test isolé ne couvre toute la fonction.',
    komo:'KŌMØ Check combine questionnaire et observations fonctionnelles simples dans un cadre éducatif.',
    research:'La valeur prédictive d’un score composite grand public doit être établie avant toute utilisation clinique.',
    sources:[
      ['A Systematic Review of Thirty-One Assessment Tests to Evaluate Mobility in Older Adults. 2019','https://pubmed.ncbi.nlm.nih.gov/31321227/'],
      ['Physical Functional Assessment in Older Adults. 2021','https://pubmed.ncbi.nlm.nih.gov/33575703/'],
      ['Japanese Orthopaedic Association — Locomotive Syndrome','https://locomo-joa.jp/en/']
    ],
    related:[['Faire le KŌMØ Check','/fr/check/'],['Locomotive Syndrome','/media/locomotive-syndrome'],['Le test de lever de chaise','/media/test-lever-chaise']],
    faq:[['Peut-on évaluer sa mobilité sans matériel ?','Oui, certaines observations fonctionnelles demandent peu de matériel. Elles restent toutefois dépendantes des consignes, de la sécurité et du protocole.'],['Le KŌMØ Check est-il un diagnostic ?','Non. Il fournit un repère éducatif de mobilité et ne remplace pas un examen ou une décision médicale.']]
  },
  {
    slug:'posture-penchee-en-avant',
    title:'Pourquoi peut-on se pencher davantage en avant en marchant ?',
    seoTitle:'Posture penchée en avant : équilibre sagittal et compensations | KŌMØ Library',
    description:'Pourquoi le tronc peut-il se projeter vers l’avant ? Comprendre l’équilibre sagittal, le bassin, les genoux et les compensations sans réduire la posture à un seul angle.',
    meta:'POSTURE · RACHIS · 7 MIN',
    dek:'Une posture plus inclinée vers l’avant peut résulter de plusieurs stratégies. Le corps utilise le rachis, le bassin, les hanches, les genoux et les chevilles pour conserver l’équilibre global.',
    takeaways:[
      'L’équilibre sagittal est dynamique : le corps peut compenser une modification du rachis par le bassin et les membres inférieurs.',
      'Une posture « droite » sur une photo ne résume pas le coût musculaire nécessaire pour la maintenir.',
      'Une modification progressive doit être comprise dans le mouvement, la marche et le contexte clinique.'
    ],
    sections:[
      ['L’alignement n’est pas seulement une affaire de colonne','Les travaux sur l’équilibre sagittal décrivent une chaîne de compensations qui peut impliquer extension de segments rachidiens, rétroversion du bassin, modifications des hanches, flexion des genoux et ajustements de cheville. L’objectif mécanique est de conserver le centre de masse dans une zone compatible avec la station debout et la marche.'],
      ['Le coût invisible de la compensation','Deux personnes peuvent sembler relativement équilibrées tout en mobilisant des stratégies différentes. Une posture compensée peut demander davantage d’activité musculaire et modifier la mécanique de la marche. C’est l’une des idées derrière le concept de cône d’économie.'],
      ['Pourquoi regarder la marche','Une revue systématique avec méta-analyse a retrouvé chez les adultes âgés des différences de mouvements du tronc et du bassin associées notamment à une vitesse de marche plus lente et à une longueur de pas plus courte. La posture statique et la marche apportent donc des informations complémentaires.'],
      ['Quand demander un avis professionnel','Une posture qui change rapidement, une difficulté croissante à regarder devant soi, une faiblesse, des troubles neurologiques, une douleur importante ou une limitation marquée de la marche justifient une évaluation professionnelle. Une simple photographie ne permet pas d’identifier l’origine d’une posture penchée.']
    ],
    pull:'L’alignement visible est une photo. La compensation est un processus.',
    established:'Le maintien de l’équilibre sagittal peut mobiliser des mécanismes compensatoires du rachis, du bassin et des membres inférieurs.',
    komo:'La posture est rapprochée de la marche et de la fonction, plutôt que réduite à un angle isolé.',
    research:'La quantification du coût fonctionnel des compensations dans une trajectoire de vieillissement reste un domaine de recherche actif.',
    sources:[
      ['Compensatory mechanisms contributing to keep the sagittal balance of the spine. 2013','https://pubmed.ncbi.nlm.nih.gov/24052406/'],
      ['Sagittal balance: from theory to clinical practice. 2022','https://pubmed.ncbi.nlm.nih.gov/35839102/'],
      ['Do older adults present altered pelvic and trunk movement pattern during gait? Systematic review with meta-analysis. 2021','https://pubmed.ncbi.nlm.nih.gov/33707165/']
    ],
    related:[['The Cone of Economy','/media/cone-of-economy'],['The Biomechanics of Aging','/media/biomechanics-aging'],['Walking is Data','/media/walking-is-data']],
    faq:[['Une posture penchée en avant vient-elle toujours du dos ?','Non. Le rachis, le bassin, les hanches, les genoux et les chevilles peuvent tous participer à la stratégie globale.'],['Une photo de profil suffit-elle pour analyser la posture ?','Non. Une photo peut documenter un aspect statique, mais elle ne mesure ni les compensations dynamiques ni le coût musculaire du maintien de la posture.']]
  }
];

const css = `:root{--ink:#121410;--paper:#f4f0e8;--soft:#e9e3d8;--sage:#59685d;--line:rgba(18,20,16,.14);--muted:#626a63;--max:960px}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}a{color:inherit}.shell{width:min(calc(100% - 28px),var(--max));margin:auto}h1,h2,.pull{font-family:Iowan Old Style,Baskerville,Georgia,serif;font-weight:400}.top{position:sticky;top:0;z-index:20;background:rgba(244,240,232,.94);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}.topin{height:60px;display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{font-size:11px;font-weight:800;letter-spacing:.15em;text-decoration:none}.back{font-size:11px;text-decoration:none;color:var(--muted)}.hero{padding:64px 0 30px}.meta{margin:0 0 14px;font-size:10px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:var(--sage)}h1{font-size:clamp(46px,7vw,78px);line-height:.93;letter-spacing:-.052em;margin:0;max-width:920px}.dek{font-size:20px;line-height:1.5;color:#383e39;max-width:790px;margin:22px 0 0}.hero-cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.btn{display:inline-flex;min-height:44px;align-items:center;padding:0 16px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:800;background:var(--ink);color:#fff}.btn.alt{background:transparent;color:var(--ink);border:1px solid var(--line)}.takeaways{margin-top:34px;border-top:1px solid var(--ink);border-bottom:1px solid var(--line)}.takeaway{display:grid;grid-template-columns:52px 1fr;gap:18px;padding:15px 0;border-bottom:1px solid var(--line);font-size:14px;line-height:1.55}.takeaway:last-child{border-bottom:0}.takeaway b{font-size:10px;letter-spacing:.12em;color:var(--sage)}.article{padding:30px 0 70px}.copy{max-width:730px;margin:auto}.copy p{font-size:16.5px;line-height:1.8;color:#343a35}.copy h2{font-size:39px;line-height:1.03;margin:48px 0 14px;letter-spacing:-.025em}.pull{font-size:33px;line-height:1.12;padding:24px 0;margin:34px 0;border-top:1px solid var(--ink);border-bottom:1px solid var(--ink)}.evidence{margin:30px 0;border-top:1px solid var(--ink)}.evidence div{display:grid;grid-template-columns:150px 1fr;gap:18px;padding:14px 0;border-bottom:1px solid var(--line);font-size:13px;line-height:1.55}.evidence b{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--sage)}.refs{margin-top:44px}.refs a{display:block;padding:14px 0;border-top:1px solid var(--line);text-decoration:none;font-size:13px;line-height:1.5}.faq{margin-top:44px;border-top:1px solid var(--ink)}.faq details{border-bottom:1px solid var(--line);padding:15px 0}.faq summary{cursor:pointer;font-weight:700;font-size:14px}.faq p{font-size:14px;margin:10px 0 0}.related{padding:40px 0;background:var(--soft)}.related h2{font-size:32px;margin:0 0 12px}.links{border-top:1px solid var(--ink)}.links a{display:block;padding:14px 0;border-bottom:1px solid var(--line);text-decoration:none;font-size:13px}@media(max-width:620px){.hero{padding:44px 0 24px}h1{font-size:46px}.dek{font-size:18px}.hero-cta .btn{width:100%;justify-content:center}.takeaway{grid-template-columns:36px 1fr;gap:10px}.copy p{font-size:15.5px}.copy h2{font-size:33px;margin-top:42px}.pull{font-size:28px}.evidence div{grid-template-columns:1fr;gap:5px}}`;

for (const a of articles) {
  const url = `https://komolongevity.com/media/${a.slug}`;
  const jsonLd = {
    '@context':'https://schema.org',
    '@graph':[
      {'@type':'Article',headline:a.title,description:a.description,datePublished:'2026-08-22',dateModified:'2026-08-22',author:{'@type':'Organization',name:'KŌMØ'},publisher:{'@type':'Organization',name:'KŌMØ'},mainEntityOfPage:url,isPartOf:{'@type':'CollectionPage',name:'KŌMØ Library',url:'https://komolongevity.com/media'}},
      {'@type':'FAQPage',mainEntity:a.faq.map(([q,ans])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:ans}}))}
    ]
  };
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/><title>${a.seoTitle}</title><meta name="description" content="${a.description}"/><link rel="canonical" href="${url}"/><meta name="robots" content="index,follow"/><meta property="og:type" content="article"/><meta property="og:title" content="${a.title}"/><meta property="og:description" content="${a.description}"/><meta property="og:url" content="${url}"/><meta property="og:image" content="https://komolongevity.com/assets/og-komo.svg"/><meta name="twitter:card" content="summary_large_image"/><script type="application/ld+json">${JSON.stringify(jsonLd)}</script><style>${css}</style></head><body><header class="top"><div class="shell topin"><a class="brand" href="/media">KŌMØ LIBRARY</a><a class="back" href="/media">Tous les contenus ↗</a></div></header><main><section class="hero"><div class="shell"><p class="meta">${a.meta}</p><h1>${a.title}</h1><p class="dek">${a.dek}</p><div class="hero-cta"><a class="btn" href="/fr/check/">Faire le KŌMØ Check →</a><a class="btn alt" href="/media">Explorer la Library</a></div><div class="takeaways">${a.takeaways.map((t,i)=>`<div class="takeaway"><b>0${i+1}</b><span>${t}</span></div>`).join('')}</div></div></section><article class="article"><div class="copy">${a.sections.map(([h,p])=>`<h2>${h}</h2><p>${p}</p>`).join('')}<div class="pull">${a.pull}</div><div class="evidence"><div><b>Établi</b><span>${a.established}</span></div><div><b>KŌMØ</b><span>${a.komo}</span></div><div><b>À démontrer</b><span>${a.research}</span></div></div><div class="faq"><h2>Questions fréquentes</h2>${a.faq.map(([q,ans])=>`<details><summary>${q}</summary><p>${ans}</p></details>`).join('')}</div><div class="refs"><h2>Sources</h2>${a.sources.map(([label,href])=>`<a href="${href}" target="_blank" rel="noreferrer">${label} ↗</a>`).join('')}</div></div></article><section class="related"><div class="shell"><h2>Continuer</h2><div class="links">${a.related.map(([label,href])=>`<a href="${href}">${label} →</a>`).join('')}</div></div></section></main></body></html>`;
  const dir = join(mediaRoot, a.slug);
  await mkdir(dir, {recursive:true});
  await writeFile(join(dir,'index.html'), html, 'utf8');
}

console.log(`[seo-intent-articles] generated ${articles.length} search-intent articles.`);
