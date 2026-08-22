import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');
const mediaRoot = join(site, 'assets', 'media');
const mediaIndex = join(mediaRoot, 'index.html');
const sitemapPath = join(site, 'sitemap.xml');

const articles = [
  {
    n:'14', slug:'pas-plus-courts', topics:'marche biomecanique mobilite prevention', meta:'MARCHE · BIOMÉCANIQUE · 6 MIN',
    title:'Pourquoi mes pas deviennent-ils plus courts ?',
    seo:'Pourquoi mes pas deviennent-ils plus courts ? Marche et vieillissement | KŌMØ Library',
    desc:'Pourquoi la longueur du pas peut-elle diminuer avec l’âge ? Vitesse, équilibre, propulsion, stratégie de stabilité et biomécanique : comprendre les pas plus courts.',
    dek:'Des pas plus courts peuvent apparaître progressivement avec l’âge. Ils peuvent refléter une stratégie plus prudente, une propulsion différente ou une adaptation de l’équilibre — sans qu’un seul mécanisme explique tous les cas.',
    search:'pourquoi mes pas deviennent plus courts pas courts petits pas longueur du pas step length stride length marche vieillissement gait mobilité propulsion équilibre',
    take:['Les revues de la marche décrivent en moyenne une diminution de la longueur du pas et de la vitesse avec l’âge.','La longueur du pas dépend de la propulsion, des amplitudes articulaires, de l’équilibre et de la vitesse choisie.','Un changement individuel vaut davantage lorsqu’il est mesuré de façon répétée dans les mêmes conditions.'],
    sections:[
      ['Un paramètre simple, mais pas isolé','La longueur du pas correspond à la distance entre deux contacts successifs de pieds opposés. Elle varie naturellement avec la taille, la vitesse, le terrain et la consigne. Dans les études comparant différents âges, les adultes plus âgés présentent en moyenne une vitesse préférée et une longueur de pas plus faibles. Cela décrit une tendance de population, pas une règle individuelle.'],
      ['Pourquoi le corps peut raccourcir le pas','Un pas plus court peut réduire certaines exigences d’équilibre et s’intégrer à une stratégie de marche plus prudente. Il peut aussi accompagner une diminution de propulsion à la cheville, une modification des mouvements du tronc et du bassin ou une réduction de vitesse. Les mécanismes sont donc multiples et doivent être interprétés ensemble.'],
      ['Ce que la mesure peut apporter','La valeur d’une mesure augmente lorsqu’elle est répétée avec le même protocole : même allure, même surface et même distance. Une trajectoire de longueur de pas, rapprochée de la cadence et de la vitesse, est plus informative qu’une valeur ponctuelle comparée à une norme générique.'],
      ['Quand regarder plus loin','Si le raccourcissement des pas est récent, très asymétrique ou associé à une faiblesse nouvelle, des chutes, une douleur importante ou des signes neurologiques, une évaluation professionnelle est préférable à une simple auto-mesure.']
    ],
    pull:'La longueur du pas n’est pas une note. C’est une pièce du langage de la marche.',
    faq:[['Des pas plus courts signifient-ils forcément une perte de mobilité ?','Non. La longueur du pas dépend notamment de la vitesse, du contexte et de la morphologie. C’est surtout son évolution et son association à d’autres paramètres qui comptent.'],['Peut-on mesurer la longueur du pas chez soi ?','On peut obtenir un repère simple, mais la comparaison dans le temps exige un protocole constant. Une analyse instrumentée permet une mesure plus précise lorsqu’elle est indiquée.']],
    refs:[
      ['https://pubmed.ncbi.nlm.nih.gov/26210370/','Aboutorabi A, et al. The effect of aging on gait parameters in able-bodied older subjects: a literature review. Aging Clin Exp Res. 2016.'],
      ['https://pubmed.ncbi.nlm.nih.gov/29929161/','Herssens N, et al. Do spatiotemporal parameters and gait variability differ across the lifespan of healthy adults? A systematic review. Gait Posture. 2018.'],
      ['https://pubmed.ncbi.nlm.nih.gov/34204430/','Bytyçi I, Henein MY. Stride Length Predicts Adverse Clinical Events in Older Adults: A Systematic Review and Meta-Analysis. J Clin Med. 2021.']
    ]
  },
  {
    n:'15', slug:'escaliers-plus-difficiles', topics:'muscle mobilite prevention biomecanique', meta:'MOBILITÉ · MUSCLE · 7 MIN',
    title:'Pourquoi monter les escaliers devient-il plus difficile ?',
    seo:'Pourquoi monter les escaliers devient plus difficile avec l’âge ? | KŌMØ Library',
    desc:'Monter ou descendre des escaliers demande force, puissance, équilibre et réserve fonctionnelle. Comprendre pourquoi cette tâche peut devenir plus difficile avec l’âge.',
    dek:'L’escalier concentre plusieurs exigences en quelques secondes : soulever le corps, contrôler un appui unipodal, produire de la puissance et anticiper la marche suivante.',
    search:'escaliers difficiles monter escalier descendre escalier jambes faibles stair climbing stairs muscle force puissance équilibre vieillissement mobilité',
    take:['L’escalier impose des demandes mécaniques élevées aux extenseurs du genou et de la hanche.','La descente exige aussi un contrôle excentrique précis pour freiner le corps.','La difficulté perçue peut traduire une baisse de réserve disponible plutôt qu’une incapacité absolue.'],
    sections:[
      ['Pourquoi l’escalier est un test exigeant','Contrairement à la marche à plat, monter une marche impose de déplacer le centre de masse vers le haut. Cela augmente la demande sur les muscles des membres inférieurs tout en exigeant un contrôle de l’équilibre sur une base d’appui réduite. Une revue consacrée à la négociation des escaliers chez les personnes âgées souligne le caractère particulièrement exigeant de cette tâche quotidienne.'],
      ['La notion de réserve','Une étude biomécanique chez des adultes âgés en bonne santé a montré que les moments demandés aux extenseurs du genou pendant l’ascension et la descente pouvaient représenter une part très importante de leur capacité maximale mesurée. L’intérêt du résultat est surtout conceptuel : quand la capacité disponible diminue, la même marche d’escalier utilise une fraction plus grande de la réserve.'],
      ['Monter et descendre ne demandent pas exactement la même chose','L’ascension nécessite de produire du travail mécanique pour élever le corps. La descente demande davantage de freinage et de contrôle. Une personne peut donc se sentir limitée dans un sens plus que dans l’autre.'],
      ['Ce que l’on peut suivre','La vitesse d’ascension, le besoin de la rampe, la fluidité, la symétrie et la perception d’effort peuvent être suivis dans le temps. Ils ne doivent pas être transformés en diagnostic isolé, mais peuvent documenter une évolution fonctionnelle.']
    ],
    pull:'Une marche d’escalier révèle moins la force absolue que la part de réserve qu’il reste pour l’utiliser.',
    faq:[['Est-il normal d’utiliser davantage la rampe avec l’âge ?','Cela peut correspondre à une stratégie de sécurité ou de réduction de la demande mécanique. Une modification récente ou rapide mérite d’être replacée dans le contexte général.'],['Faut-il entraîner les escaliers directement ?','Cela dépend du niveau fonctionnel et de la sécurité. Le renforcement des membres inférieurs et l’entraînement de l’équilibre ont des effets documentés sur plusieurs mesures de mobilité.']],
    refs:[
      ['https://pubmed.ncbi.nlm.nih.gov/10811553/','Startzell JK, et al. Stair negotiation in older people: a review. J Am Geriatr Soc. 2000.'],
      ['https://pubmed.ncbi.nlm.nih.gov/21632255/','Samuel D, et al. The biomechanical functional demand placed on knee and hip muscles of older adults during stair ascent and descent. Gait Posture. 2011.'],
      ['https://pubmed.ncbi.nlm.nih.gov/35504310/','Liu CJ, et al. Role of Resistance Training in Mitigating Risk for Mobility Disability in Community-Dwelling Older Adults: A Systematic Review and Meta-analysis. Arch Phys Med Rehabil. 2022.']
    ]
  },
  {
    n:'16', slug:'moins-force-jambes', topics:'muscle mobilite prevention clinique', meta:'MUSCLE · MOBILITÉ · 7 MIN',
    title:'Pourquoi ai-je moins de force dans les jambes ?',
    seo:'Moins de force dans les jambes : causes fonctionnelles et vieillissement | KŌMØ Library',
    desc:'Pourquoi la force des jambes peut-elle diminuer avec l’âge ? Muscle, système neuromusculaire, activité physique et fonction : ce que l’on peut mesurer.',
    dek:'La force des jambes n’est pas uniquement une question de masse musculaire. Activation neuromusculaire, qualité du muscle, activité et vitesse de contraction participent aussi à la capacité fonctionnelle.',
    search:'moins force jambes jambes faibles faiblesse musculaire lower limb strength muscle vieillissement sarcopénie mobilité force quadriceps',
    take:['Le consensus EWGSOP2 place la faible force musculaire au premier plan de l’évaluation de la sarcopénie.','La quantité de muscle et la capacité à produire de la force sont liées, mais ne sont pas équivalentes.','Le renforcement progressif peut améliorer la force des membres inférieurs chez de nombreux adultes âgés.'],
    sections:[
      ['La force est une fonction du système neuromusculaire','Produire de la force nécessite du tissu musculaire, mais aussi une activation nerveuse efficace, une coordination des unités motrices et des propriétés mécaniques adaptées. C’est pourquoi la masse seule explique imparfaitement la performance.'],
      ['Ce que la sarcopénie a changé','Le consensus européen EWGSOP2 a explicitement déplacé l’attention vers la force musculaire : une faible force rend la sarcopénie probable dans son algorithme, la masse ou qualité musculaire servant ensuite à la confirmation. Cette hiérarchie ne signifie pas que toute faiblesse des jambes correspond à une sarcopénie.'],
      ['Mesurer dans une tâche réelle','Une mesure de force isolée peut être complétée par un lever de chaise, la marche, l’escalier ou d’autres tâches. Elles montrent comment la capacité disponible devient mouvement.'],
      ['La force peut-elle se travailler ?','Les revues d’essais contrôlés montrent que l’entraînement en résistance améliore la force des membres inférieurs chez les adultes âgés. Le choix de l’intensité, de la progression et des exercices doit être adapté au niveau initial et au contexte clinique.']
    ],
    pull:'La question utile n’est pas seulement « combien de muscle ? », mais « quelle capacité devient mouvement ? ».',
    faq:[['Une sensation de jambes faibles signifie-t-elle forcément une sarcopénie ?','Non. La sarcopénie répond à un cadre diagnostique précis. Une sensation de faiblesse peut avoir de nombreuses explications et doit être interprétée dans le contexte.'],['Quel test simple renseigne sur les jambes ?','Le lever de chaise est fréquemment utilisé comme tâche fonctionnelle des membres inférieurs, mais son protocole doit être standardisé.']],
    refs:[
      ['https://pubmed.ncbi.nlm.nih.gov/30312372/','Cruz-Jentoft AJ, et al. Sarcopenia: revised European consensus on definition and diagnosis. Age Ageing. 2019.'],
      ['https://pubmed.ncbi.nlm.nih.gov/35504310/','Liu CJ, et al. Role of Resistance Training in Mitigating Risk for Mobility Disability in Community-Dwelling Older Adults: A Systematic Review and Meta-analysis. Arch Phys Med Rehabil. 2022.'],
      ['https://pubmed.ncbi.nlm.nih.gov/23473702/','Steib S, et al. Systematic review of high-intensity progressive resistance strength training of the lower limb compared with other intensities in older adults. Arch Phys Med Rehabil. 2013.']
    ]
  },
  {
    n:'17', slug:'utiliser-bras-pour-se-relever', topics:'tests muscle mobilite biomecanique', meta:'FONCTION · BIOMÉCANIQUE · 6 MIN',
    title:'Pourquoi est-ce que je m’aide des bras pour me relever ?',
    seo:'Pourquoi utiliser les bras pour se relever d’une chaise ? | KŌMØ Library',
    desc:'S’aider des bras pour se relever peut réduire la demande sur les hanches et les genoux. Comprendre cette stratégie, la hauteur de chaise et le contrôle du mouvement.',
    dek:'Pousser sur les accoudoirs n’est pas un détail : c’est une stratégie mécanique qui peut réduire la demande imposée aux membres inférieurs.',
    search:'utiliser bras se relever chaise pousser accoudoirs chair rise armrests sit to stand difficulté lever force jambes biomécanique mobilité',
    take:['La hauteur de chaise, la position des pieds et l’usage des bras modifient fortement la mécanique du lever.','Utiliser les accoudoirs peut diminuer les moments demandés aux hanches et aux genoux.','Une nouvelle dépendance aux bras peut être un repère fonctionnel à suivre, sans constituer un diagnostic en soi.'],
    sections:[
      ['Se lever est un problème de mécanique','Pour quitter une chaise, le corps doit déplacer son centre de masse vers l’avant puis vers le haut. La position des pieds, la hauteur du siège et la stratégie du tronc changent la quantité de force nécessaire aux articulations.'],
      ['Pourquoi les bras aident réellement','Une revue classique des déterminants du sit-to-stand montre que les accoudoirs peuvent réduire fortement les moments nécessaires au niveau de la hanche. Une chaise plus haute réduit également la demande mécanique. Utiliser les bras est donc une vraie stratégie de compensation, pas seulement une habitude.'],
      ['Ce qui change avec l’âge','Une revue systématique récente a décrit chez les adultes âgés un lever souvent plus lent, davantage de flexion du tronc et des différences de contrôle neuromusculaire par rapport aux adultes plus jeunes. Les protocoles restent cependant hétérogènes, notamment sur l’usage des bras et la hauteur du siège.'],
      ['Pourquoi standardiser le test','Si l’on souhaite suivre la fonction, il faut conserver la même chaise, la même position des pieds et la même consigne. Passer d’un lever sans les bras à un lever avec appui modifie la tâche elle-même.']
    ],
    pull:'Les bras peuvent masquer une partie de la demande imposée aux jambes — ce qui en fait justement un signal fonctionnel intéressant.',
    faq:[['Est-ce grave de s’aider des bras pour se lever ?','Pas en soi. Cela peut être une stratégie efficace. Ce qui est informatif est surtout l’apparition récente du besoin ou son évolution dans le temps.'],['Une chaise basse est-elle un meilleur test ?','Pas nécessairement. Elle augmente la demande mécanique. Pour comparer des résultats, la standardisation est plus importante que de rendre le test artificiellement difficile.']],
    refs:[
      ['https://pubmed.ncbi.nlm.nih.gov/12201801/','Janssen WGM, et al. Determinants of the sit-to-stand movement: a review. Phys Ther. 2002.'],
      ['https://pubmed.ncbi.nlm.nih.gov/33915476/','van der Kruk E, et al. Compensation due to age-related decline in sit-to-stand and sit-to-walk: a systematic review. J Biomech. 2021.'],
      ['https://pubmed.ncbi.nlm.nih.gov/37639862/','Sadeh S, et al. Biomechanical and neuromuscular control characteristics of sit-to-stand transfer in young and older adults: a systematic review. Clin Biomech. 2023.']
    ]
  },
  {
    n:'18', slug:'vitesse-marche-normale-age', topics:'marche tests prevention mobilite', meta:'MARCHE · REPÈRES · 7 MIN',
    title:'Quelle vitesse de marche est normale à mon âge ?',
    seo:'Vitesse de marche normale selon l’âge : repères et limites | KŌMØ Library',
    desc:'Quelle est une vitesse de marche normale selon l’âge ? Les méta-analyses donnent des repères, mais sexe, protocole, distance et contexte modifient la valeur.',
    dek:'Il existe des valeurs de référence de vitesse de marche confortable, mais une norme n’est pas une frontière entre “normal” et “anormal”. Le protocole et la trajectoire individuelle comptent autant que le chiffre.',
    search:'vitesse marche normale âge age gait speed normal walking speed valeur référence mètre seconde m/s 60 ans 70 ans 80 ans mobilité',
    take:['Une méta-analyse récente confirme que la vitesse confortable varie avec l’âge et le sexe.','Les valeurs de référence dépendent aussi du protocole de mesure et de la consigne.','Pour une personne donnée, l’évolution répétée dans les mêmes conditions est souvent plus informative qu’un seuil universel.'],
    sections:[
      ['Oui, il existe des valeurs de référence','Des méta-analyses ont agrégé des mesures de vitesse de marche confortable chez des adultes apparemment en bonne santé. Elles montrent des différences selon l’âge et le sexe. Les auteurs de la revue la plus récente n’ont pas retrouvé de différence substantielle liée à la région géographique une fois les données stratifiées.'],
      ['Pourquoi nous n’affichons pas un chiffre unique','La distance testée, l’accélération avant le chronométrage, l’allure demandée, la surface et le mode de chronométrage peuvent modifier le résultat. Une valeur sortie de son protocole peut donc donner une fausse impression de précision.'],
      ['La trajectoire personnelle apporte une autre information','Mesurer sa vitesse à plusieurs mois d’intervalle dans des conditions reproductibles permet d’observer une trajectoire. Une diminution persistante peut alors être rapprochée du lever de chaise, de la longueur du pas, de l’équilibre ou de la posture.'],
      ['Un repère, pas un diagnostic','La vitesse de marche est une mesure fonctionnelle très étudiée, mais elle ne permet pas à elle seule d’identifier la cause d’une limitation. Un changement récent ou accompagné d’autres signes mérite une évaluation adaptée.']
    ],
    pull:'Une norme situe une personne dans une population. Une trajectoire raconte ce qui change chez elle.',
    faq:[['Pourquoi KŌMØ ne donne-t-il pas un seuil unique de “bonne” vitesse ?','Parce que la vitesse dépend du protocole, de l’âge, du sexe, de la morphologie et du contexte. Un seuil unique simplifierait excessivement la mesure.'],['Faut-il marcher le plus vite possible pendant le test ?','Cela dépend du protocole. Les tests de vitesse confortable et de vitesse rapide ne mesurent pas exactement la même chose et ne doivent pas être confondus.']],
    refs:[
      ['https://pubmed.ncbi.nlm.nih.gov/36528509/','Andrews AW, et al. Normal gait speed varies by age and sex but not by geographical region: a systematic review. J Physiother. 2023.'],
      ['https://pubmed.ncbi.nlm.nih.gov/21820535/','Bohannon RW, Andrews AW. Normal walking speed: a descriptive meta-analysis. Physiotherapy. 2011.'],
      ['https://pubmed.ncbi.nlm.nih.gov/38517125/','Measurement properties of the usual and fast gait speed tests in community-dwelling older adults. Age Ageing. 2024.']
    ]
  },
  {
    n:'19', slug:'trebuche-plus-souvent', topics:'marche equilibre prevention mobilite', meta:'MARCHE · ÉQUILIBRE · 7 MIN',
    title:'Pourquoi est-ce que je trébuche plus souvent ?',
    seo:'Pourquoi je trébuche plus souvent ? Marche, pied et équilibre | KŌMØ Library',
    desc:'Trébucher plus souvent peut impliquer la hauteur du pied pendant le pas, la variabilité de marche, l’attention et l’équilibre. Comprendre les mécanismes sans auto-diagnostic.',
    dek:'Pour ne pas accrocher le sol, le pied doit passer avec une marge verticale suffisante à chaque pas. Cette marge est petite et dépend d’une coordination précise de toute la jambe.',
    search:'pourquoi je trébuche souvent trébucher pied accroche sol toe clearance minimum foot clearance chute marche équilibre gait variability pas vieillissement',
    take:['La “minimum foot clearance” décrit la hauteur minimale du pied au-dessus du sol pendant la phase oscillante.','Une marge faible ou plus variable peut théoriquement augmenter la susceptibilité à accrocher un obstacle ou une irrégularité.','Les trébuchements répétés ont de nombreuses causes possibles et ne doivent pas être réduits à un seul paramètre de marche.'],
    sections:[
      ['Le pied passe très près du sol','Pendant la phase où la jambe avance, le pied atteint un point de garde au sol minimal. Une revue systématique s’est intéressée à cette “minimum foot clearance” chez les adultes âgés et chez ceux ayant une histoire de chute, car cette variable est directement liée au mécanisme du trébuchement.'],
      ['La variabilité compte aussi','La marche n’est jamais parfaitement identique d’un pas au suivant. Une certaine variabilité est normale. Les recherches sur la variabilité de marche montrent toutefois qu’elle peut apporter une information complémentaire sur la stabilité et le statut fonctionnel, même si les protocoles et la fiabilité varient selon les paramètres.'],
      ['Pourquoi un trébuchement n’a pas une cause unique','La vision, l’attention, la mobilité de cheville, la vitesse, la fatigue, l’environnement, les chaussures et la coordination peuvent tous intervenir. Il serait donc incorrect de conclure à partir du seul fait de trébucher que le pied “ne se lève plus assez”.'],
      ['Quand ne pas se contenter de mesurer','Des trébuchements nouveaux et fréquents, une faiblesse du pied ou de la jambe, une perte de sensibilité, des vertiges, des chutes ou d’autres signes neurologiques nécessitent une évaluation professionnelle.']
    ],
    pull:'Éviter un obstacle demande quelques centimètres de marge — et l’intégration de tout un système.',
    faq:[['Trébucher signifie-t-il que je manque forcément de force ?','Non. La force peut intervenir, mais la vision, la sensibilité, la mobilité articulaire, l’attention et la coordination sont également importantes.'],['Peut-on mesurer la garde au sol chez soi ?','Pas avec une précision clinique fiable. Cette variable est généralement mesurée avec des systèmes instrumentés d’analyse de la marche.']],
    refs:[
      ['https://pubmed.ncbi.nlm.nih.gov/20692163/','Barrett RS, et al. A systematic review of the effect of ageing and falls history on minimum foot clearance characteristics during level walking. Gait Posture. 2010.'],
      ['https://pubmed.ncbi.nlm.nih.gov/21920755/','Brach JS, et al. Gait variability in older adults: a structured review of testing protocol and clinimetric properties. Gait Posture. 2011.'],
      ['https://pubmed.ncbi.nlm.nih.gov/29929161/','Herssens N, et al. Do spatiotemporal parameters and gait variability differ across the lifespan of healthy adults? A systematic review. Gait Posture. 2018.']
    ]
  },
  {
    n:'20', slug:'ameliorer-mobilite-avec-age', topics:'prevention mobilite muscle equilibre marche', meta:'PRÉVENTION · MOBILITÉ · 8 MIN',
    title:'Comment préserver sa mobilité avec l’âge ?',
    seo:'Comment préserver et améliorer sa mobilité avec l’âge ? | KŌMØ Library',
    desc:'Force, équilibre, marche et entraînement multicomposant : ce que les revues systématiques montrent pour préserver la mobilité avec l’âge.',
    dek:'La mobilité n’est pas une qualité unique. Les données soutiennent surtout une approche combinant activité, renforcement, équilibre et tâches fonctionnelles adaptées au niveau de chacun.',
    search:'comment améliorer mobilité âge vieillissement préserver marcher mieux renforcer jambes équilibre exercice resistance training older adults mobilité longévité',
    take:['L’entraînement en résistance améliore la force des membres inférieurs et plusieurs mesures de mobilité chez les adultes âgés.','Les programmes associant équilibre, renforcement et exercices fonctionnels peuvent améliorer plusieurs dimensions de la capacité physique.','La meilleure stratégie dépend du niveau initial, des objectifs, de la sécurité et de la régularité.'],
    sections:[
      ['Il n’existe pas un exercice unique pour la mobilité','Marcher, se relever, tourner, monter une marche et récupérer un déséquilibre reposent sur des qualités différentes. Une stratégie de prévention cohérente travaille donc plusieurs dimensions plutôt qu’un seul indicateur.'],
      ['Le renforcement a une place solide','Une méta-analyse de 24 études portant sur 3 656 participants a retrouvé chez des adultes âgés présentant une limitation de mobilité des améliorations de force des membres inférieurs, de distance au test de marche de six minutes et de vitesse de marche habituelle avec l’entraînement en résistance par rapport aux groupes contrôles.'],
      ['L’équilibre doit lui aussi être entraîné','Une revue systématique des interventions communautaires chez les plus de 65 ans conclut que les exercices de renforcement, d’équilibre et les programmes multicomposants peuvent améliorer force, équilibre et mobilité, avec des effets également observés sur certains résultats liés aux chutes.'],
      ['Mesurer pour personnaliser','L’intérêt de mesurer la mobilité n’est pas de transformer l’exercice en compétition permanente. C’est d’identifier les dimensions les plus fragiles ou les plus importantes pour une personne, puis de vérifier que la trajectoire évolue dans la direction souhaitée.'],
      ['La régularité avant la sophistication','Les programmes les plus technologiques ne remplacent pas l’adhésion. Une stratégie simple, progressive, réalisable et répétée a davantage de valeur qu’un protocole parfait mais abandonné après quelques semaines.']
    ],
    pull:'Préserver la mobilité, c’est entretenir assez de réserve pour que les gestes ordinaires restent ordinaires.',
    faq:[['La marche seule suffit-elle pour préserver toute la mobilité ?','La marche est importante, mais elle ne sollicite pas de la même façon la force maximale, la puissance, l’équilibre réactif ou certaines amplitudes. Une approche multicomposant est souvent plus complète.'],['À quel âge faut-il commencer ?','La prévention n’a pas besoin d’attendre une limitation. Les principes d’activité, de force et d’équilibre peuvent être adaptés à de nombreux âges et niveaux, avec avis professionnel lorsque le contexte l’exige.']],
    refs:[
      ['https://pubmed.ncbi.nlm.nih.gov/35504310/','Liu CJ, et al. Role of Resistance Training in Mitigating Risk for Mobility Disability in Community-Dwelling Older Adults: A Systematic Review and Meta-analysis. Arch Phys Med Rehabil. 2022.'],
      ['https://pubmed.ncbi.nlm.nih.gov/37601180/','Sadaqa M, et al. Effectiveness of exercise interventions on fall prevention in ambulatory community-dwelling older adults: a systematic review. Front Public Health. 2023.'],
      ['https://pubmed.ncbi.nlm.nih.gov/41278596/','Effects of elastic band resistance training on lower limb strength and balance function in older adults: a systematic review and meta-analysis. 2025.']
    ]
  }
];

const esc = (s='') => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function articleHtml(a){
  const faqJson = a.faq.map(([q,r])=>({ '@type':'Question', name:q, acceptedAnswer:{'@type':'Answer', text:r} }));
  const schema = JSON.stringify({'@context':'https://schema.org','@graph':[
    {'@type':'Article',headline:a.title,description:a.desc,datePublished:'2026-08-22',dateModified:'2026-08-22',author:{'@type':'Organization',name:'KŌMØ'},publisher:{'@type':'Organization',name:'KŌMØ'},mainEntityOfPage:`https://komolongevity.com/media/${a.slug}`,isPartOf:{'@type':'CollectionPage',name:'KŌMØ Library',url:'https://komolongevity.com/media'}},
    {'@type':'FAQPage',mainEntity:faqJson}
  ]});
  const sectionHtml = a.sections.map(([h,p])=>`<h2>${h}</h2><p>${p}</p>`).join('');
  const refs = a.refs.map(([u,t])=>`<a href="${u}" target="_blank" rel="noreferrer">${t} ↗</a>`).join('');
  const faq = a.faq.map(([q,r])=>`<details><summary>${q}</summary><p>${r}</p></details>`).join('');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/><title>${esc(a.seo)}</title><meta name="description" content="${esc(a.desc)}"/><link rel="canonical" href="https://komolongevity.com/media/${a.slug}"/><meta name="robots" content="index,follow"/><meta property="og:type" content="article"/><meta property="og:title" content="${esc(a.title)}"/><meta property="og:description" content="${esc(a.desc)}"/><meta property="og:url" content="https://komolongevity.com/media/${a.slug}"/><meta property="og:image" content="https://komolongevity.com/assets/og-komo.svg"/><meta name="twitter:card" content="summary_large_image"/><script type="application/ld+json">${schema}</script><style>:root{--ink:#121410;--paper:#f4f0e8;--soft:#e9e3d8;--sage:#59685d;--line:rgba(18,20,16,.14);--muted:#626a63;--max:960px}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}a{color:inherit}.shell{width:min(calc(100% - 28px),var(--max));margin:auto}h1,h2,.pull{font-family:Iowan Old Style,Baskerville,Georgia,serif;font-weight:400}.top{position:sticky;top:0;z-index:20;background:rgba(244,240,232,.94);backdrop-filter:blur(16px);border-bottom:1px solid var(--line)}.topin{height:60px;display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{font-size:11px;font-weight:800;letter-spacing:.15em;text-decoration:none}.back{font-size:11px;text-decoration:none;color:var(--muted)}.hero{padding:64px 0 30px}.meta{margin:0 0 14px;font-size:10px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:var(--sage)}h1{font-size:clamp(46px,7vw,78px);line-height:.93;letter-spacing:-.052em;margin:0;max-width:920px}.dek{font-size:20px;line-height:1.5;color:#383e39;max-width:800px;margin:22px 0 0}.hero-cta{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.btn{display:inline-flex;min-height:44px;align-items:center;padding:0 16px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:800;background:var(--ink);color:#fff}.btn.alt{background:transparent;color:var(--ink);border:1px solid var(--line)}.takeaways{margin-top:34px;border-top:1px solid var(--ink);border-bottom:1px solid var(--line)}.takeaway{display:grid;grid-template-columns:52px 1fr;gap:18px;padding:15px 0;border-bottom:1px solid var(--line);font-size:14px;line-height:1.55}.takeaway:last-child{border-bottom:0}.takeaway b{font-size:10px;letter-spacing:.12em;color:var(--sage)}.article{padding:30px 0 70px}.copy{max-width:730px;margin:auto}.copy p{font-size:16.5px;line-height:1.8;color:#343a35}.copy h2{font-size:39px;line-height:1.03;margin:48px 0 14px;letter-spacing:-.025em}.pull{font-size:33px;line-height:1.12;padding:24px 0;margin:34px 0;border-top:1px solid var(--ink);border-bottom:1px solid var(--ink)}.evidence{margin:30px 0;border-top:1px solid var(--ink)}.evidence div{display:grid;grid-template-columns:150px 1fr;gap:18px;padding:14px 0;border-bottom:1px solid var(--line);font-size:13px;line-height:1.55}.evidence b{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--sage)}.refs{margin-top:44px}.refs a{display:block;padding:14px 0;border-top:1px solid var(--line);text-decoration:none;font-size:13px;line-height:1.5}.faq{margin-top:44px;border-top:1px solid var(--ink)}.faq details{border-bottom:1px solid var(--line);padding:15px 0}.faq summary{cursor:pointer;font-weight:700;font-size:14px}.faq p{font-size:14px;margin:10px 0 0}.related{padding:40px 0;background:var(--soft)}.related h2{font-size:32px;margin:0 0 12px}.links{border-top:1px solid var(--ink)}.links a{display:block;padding:14px 0;border-bottom:1px solid var(--line);text-decoration:none;font-size:13px}@media(max-width:620px){.hero{padding:44px 0 24px}h1{font-size:46px}.dek{font-size:18px}.hero-cta .btn{width:100%;justify-content:center}.takeaway{grid-template-columns:36px 1fr;gap:10px}.copy p{font-size:15.5px}.copy h2{font-size:33px;margin-top:42px}.pull{font-size:28px}.evidence div{grid-template-columns:1fr;gap:5px}}</style></head><body><header class="top"><div class="shell topin"><a class="brand" href="/media">KŌMØ LIBRARY</a><a class="back" href="/media">Tous les contenus ↗</a></div></header><main><section class="hero"><div class="shell"><p class="meta">${a.meta}</p><h1>${a.title}</h1><p class="dek">${a.dek}</p><div class="hero-cta"><a class="btn" href="/fr/check/">Faire le KŌMØ Check →</a><a class="btn alt" href="/media">Explorer la Library</a></div><div class="takeaways">${a.take.map((t,i)=>`<div class="takeaway"><b>0${i+1}</b><span>${t}</span></div>`).join('')}</div></div></section><article class="article"><div class="copy">${sectionHtml}<div class="pull">${a.pull}</div><div class="evidence"><div><b>Données établies</b><span>Les éléments décrits comme établis dans cet article sont issus des publications citées ci-dessous et restent dépendants des populations et protocoles étudiés.</span></div><div><b>Lecture KŌMØ</b><span>KŌMØ privilégie une interprétation multidimensionnelle et longitudinale de la mobilité plutôt qu’un seuil ou une mesure isolée.</span></div><div><b>Limite</b><span>Cette page est informative et ne remplace pas une évaluation médicale lorsqu’un changement est récent, marqué ou associé à d’autres signes.</span></div></div><div class="faq"><h2>Questions fréquentes</h2>${faq}</div><div class="refs"><h2>Références bibliographiques</h2>${refs}</div></div></article><section class="related"><div class="shell"><h2>Continuer</h2><div class="links"><a href="/fr/check/">Faire le KŌMØ Check →</a><a href="/media">Explorer tous les articles →</a><a href="/review">Lire KŌMØ Review →</a></div></div></section></main></body></html>`;
}

for (const a of articles) {
  const dir = join(mediaRoot, a.slug);
  await mkdir(dir, { recursive:true });
  await writeFile(join(dir,'index.html'), articleHtml(a), 'utf8');
}

try {
  let html = await readFile(mediaIndex,'utf8');
  const cards = articles.map(a=>`<a class="article-link" href="/media/${a.slug}" data-search-item data-topics="${a.topics}" data-search="${a.search}"><span class="number">${a.n}</span><div><h3>${a.title}</h3><p>${a.desc}</p></div><span class="meta meta-col">${a.meta.replace(/ · \d+ MIN/,'')} · ${a.meta.match(/(\d+) MIN/)?.[1] || '6'} min</span><span class="arrow">→</span></a>`).join('\n');
  if (!html.includes('/media/pas-plus-courts')) html = html.replace('</div></div></section>\n\n<section class="section" id="videos"', `${cards}\n</div></div></section>\n\n<section class="section" id="videos"`);
  html = html.replace('>15 contenus<','>22 contenus<');
  await writeFile(mediaIndex,html,'utf8');
} catch(e) { console.warn('[seo-final-cluster] media index:',e.message); }

try {
  let xml = await readFile(sitemapPath,'utf8');
  const urls = articles.map(a=>`https://komolongevity.com/media/${a.slug}`);
  const missing = urls.filter(u=>!xml.includes(`<loc>${u}</loc>`));
  if (missing.length) xml = xml.replace('</urlset>',`${missing.map(u=>`  <url><loc>${u}</loc><changefreq>monthly</changefreq></url>`).join('\n')}\n</urlset>`);
  await writeFile(sitemapPath,xml,'utf8');
} catch(e) { console.warn('[seo-final-cluster] sitemap:',e.message); }

console.log('[seo-final-cluster] KŌMØ Library now contains 20 articles, each with bibliography and FAQ schema.');
