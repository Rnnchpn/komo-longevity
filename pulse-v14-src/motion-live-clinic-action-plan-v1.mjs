// Evidence-informed, conditional home-action blueprint for a nonmedical Motion passport.
// Outputs are educational proposals for the operator to validate; not prescriptions.
const num=(answers,key)=>Object.hasOwn(answers,key)&&/^[0-4]$/.test(String(answers[key]))?Number(answers[key]):null;
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const label=(n)=>n===null?'Non renseigné':String(n).replace('.',',');
export function buildClinicActionPlan(answers={},measures=[],balance=null,questionnaire={},options={}){
 const strengthLow=num(answers,'strengthDays')!==null&&num(answers,'strengthDays')>=2;
 const bendingConcern=num(answers,'bend')!==null&&num(answers,'bend')>=2;
 const symptomBend=bendingConcern&&num(answers,'pain')!==null&&num(answers,'pain')>=1;
 const recoveryConcern=['sleep','stress','recovered'].some(k=>num(answers,k)!==null&&num(answers,k)>=2);
 const balanceLimited=balance&&balance.min<10;
 const ageGroup=answers.ageBand||null;
 const older=ageGroup==='70-79'||ageGroup==='80plus';
 const active65=older||ageGroup==='60-69'; // range spans 60–69: threshold >=65 not known
 const results=Object.fromEntries(measures.map(m=>[m.id,m]));
 const complete=questionnaire.complete===true;
 const axis=[
  {id:'mobility',short:'Mobilité',value:questionnaire.groups?.find(g=>g.id==='mobility')?.score??null},
  {id:'comfort',short:'Confort',value:questionnaire.groups?.find(g=>g.id==='comfort')?.score??null},
  {id:'recovery',short:'Récupération',value:questionnaire.groups?.find(g=>g.id==='recovery')?.score??null},
  {id:'activity',short:'Activité',value:questionnaire.groups?.find(g=>g.id==='activity')?.score??null}
 ].map(a=>({...a,value:finite(a.value)?Math.max(0,Math.min(100,a.value)):null}));
 const emphasis=complete?axis.filter(a=>a.value!==null).sort((a,b)=>a.value-b.value).slice(0,2).map(a=>a.id):[];
 const headline=complete?(strengthLow?'Capacités mesurées et renforcement à structurer':
   recoveryConcern?'Capacités mesurées et récupération à soutenir':
   'Consolider les capacités fonctionnelles'):'Mesures physiques disponibles — questionnaire à compléter';
 const strengths=[];
 if(results.sts?.measured)strengths.push(label(results.sts.value)+' levers / 30 s');
 if(results.two_step?.measured)strengths.push('Two-Step : '+label(results.two_step.value)+' cm'+
  (results.two_step.twoStepIndex!==null?' (indice '+label(results.two_step.twoStepIndex)+')':''));
 if(balance&&balance.tenSecondBoth)strengths.push('équilibre au moins 10 s des deux côtés');
 const highlights=[
  {label:'Point d’appui',value:strengths.length?strengths.join(' · '):'Mesures à compléter'},
  {label:'À travailler',value:strengthLow?'renforcement régulier':bendingConcern?'flexion fonctionnelle':recoveryConcern?'récupération':'routine de mouvement'},
  {label:'Suivi',value:'réévaluation à 6 semaines'}
 ];
 const exercises=[
  {key:'chair',title:'Lever de chaise',purpose:'Force / autonomie',dose:'2 × 6–10 répétitions',
   frequency:'2 jours/semaine',instructions:'Chaise stable adossée au mur, se lever et s’asseoir lentement, sans précipitation.',
   progression:'Ajouter 2 répétitions puis une 3e série si réalisation aisée.',
   caution:'Arrêter si douleur significative, malaise ou instabilité.',
   relevance:results.sts?.measured?'Levers observés : '+label(results.sts.value)+' en 30 s.':'Capacité initiale à vérifier.'},
  {key:'calves',title:'Élévations des talons',purpose:'Endurance des mollets',dose:'2 × 8–12 répétitions',
   frequency:'2 jours/semaine',instructions:'Debout face à un plan stable, monter sur les pointes et redescendre lentement.',
   progression:'Augmenter progressivement les répétitions avant de diminuer l’aide des mains.',
   caution:'Maintenir une prise d’appui stable ; éviter en cas de douleur ou perte d’équilibre.',
   relevance:results.heels?.measured?'Élévations observées (ancien protocole) : '+label(results.heels.value)+'.':
    'Exercice éducatif proposé indépendamment du Two-Step Test, à adapter selon la stabilité.'},
  {key:'hinge',title:'Charnière de hanches',purpose:'Flexion fonctionnelle',dose:'2 × 6–8 mouvements',
   frequency:'3 jours/semaine',instructions:'Mains sur les hanches, basculer doucement le bassin en gardant le dos confortable, puis se redresser.',
   progression:'Ajouter une tâche légère de prise d’objet à hauteur adaptée seulement si indolore.',
   caution:'Sans flexion forcée ni charge lourde ; adapter en cas de pathologie rachidienne ou douleur.',
   relevance:bendingConcern?'Difficulté déclarée de ramassage : vérifier la technique.':'Entretien fonctionnel non spécifique.'},
  {key:'balance',title:balanceLimited?'Équilibre assisté':'Équilibre d’entretien',purpose:'Contrôle postural',
   dose:balanceLimited?'3 × 10–15 s par côté':'2 × 15–20 s par côté',
   frequency:'3 jours/semaine',
   instructions:'Près d’un plan de travail stable, lever un pied avec possibilité de poser immédiatement la main.',
   progression:'Améliorer la qualité et la régularité, sans dépasser les limites de sécurité.',
   caution:'Ne jamais pratiquer seul sans appui si risque de chute. Ne pas ajouter les yeux fermés.',
   relevance:balance?'Gauche '+label(balance.left)+' s · droit '+label(balance.right)+' s (plafond 30 s).':'Durée de référence à obtenir.'},
  {key:'walk',title:'Marche régulière',purpose:'Endurance / activité quotidienne',
   dose:'15–25 min à allure confortable',frequency:'4–5 jours/semaine',
   instructions:'Marche en terrain sûr, à une intensité permettant de parler normalement.',
   progression:'Augmenter d’environ 5 min lorsque les séances sont bien tolérées.',
   caution:'Adapter selon essoufflement, fatigue, symptômes et capacité réelle.',
   relevance:'Le questionnaire ne mesure pas la vitesse de marche ni le niveau d’effort réel.'}
 ];
 const timeline=[
  {weeks:'Semaines 1–2',title:'Installation',focus:'Apprendre les gestes',
   tasks:['2 séances de renforcement de 15–20 min','Marche régulière sans fatigue excessive','Noter douleur, fatigue et adhésion']},
  {weeks:'Semaines 3–4',title:'Progression',focus:'Augmenter progressivement',
   tasks:['2–3 séances de 20–25 min','+2 répétitions si aisance et sécurité','Maintenir les exercices d’équilibre avec appui']},
  {weeks:'Semaines 5–6',title:'Consolidation',focus:'Installer la routine',
   tasks:['2–3 séances de 25–30 min selon tolérance','Marche jusqu’à 30 min si bien tolérée','Recontrôle des six tests dans les mêmes conditions']}
 ];
 const food=[
  {title:'Protéines alimentaires',level:'Priorité nutritionnelle',
   text:active65?'Chez les plus de 65 ans en bonne santé, la littérature ESPEN propose environ 1,0–1,2 g/kg/j. Vérifier âge exact, poids, apports et fonction rénale avant de chiffrer.':
    'Favoriser un apport protéique suffisant et réparti dans la journée ; l’objectif pondéral dépend du contexte et des apports.',
   action:'Repérer une source de protéines aux repas ; complément protéiné seulement si les apports alimentaires sont insuffisants.'},
  {title:'Alimentation & hydratation',level:'Socle quotidien',
   text:'Repas variés, fruits et légumes, féculents, sources de calcium, bonnes graisses et hydratation adaptée.',
   action:'Privilégier les aliments plutôt qu’un empilement de gélules.'}
 ];
 const supplements=[
  {id:'protein',name:'Protéines en poudre',status:'Si apports insuffisants',
   benefit:'Peuvent aider à atteindre l’apport protéique cible ; pas de bénéfice supplémentaire automatique si l’alimentation couvre les besoins.',
   guard:'À discuter selon poids, alimentation et fonction rénale. Pas de dose individuelle sans ces informations.'},
  {id:'creatine',name:'Créatine monohydrate',status:strengthLow?'Option à discuter':'Non prioritaire',
   benefit:'Associée à un renforcement progressif, un gain additionnel modeste de force est possible chez certains adultes âgés.',
   guard:'Option clinique, pas une prescription automatique. Une dose étudiée courante est 3 g/j ; vérifier traitements, pathologie rénale, hydratation et contre-indications.'},
  {id:'vitd',name:'Vitamine D',status:'Selon besoins / indications',
   benefit:'Maintenir les apports nutritionnels recommandés : 600 UI/j de 50 à 70 ans, 800 UI/j au-delà de 70 ans (toutes sources).',
   guard:'Éviter doses élevées systématiques ou bilan sanguin de routine sans indication. Adapter selon carence, ostéoporose, malabsorption ou contexte médical.'},
  {id:'b12',name:'Vitamine B12',status:'Seulement si risque ou carence',
   benefit:'À envisager notamment si régime végétalien, malabsorption ou certaines prises médicamenteuses et signes évocateurs.',
   guard:'Pas de supplémentation systématique sur la base du Motion Score ou de la fatigue seule.'},
  {id:'omega3',name:'Oméga‑3',status:'Alimentation d’abord',
   benefit:'Favoriser le poisson gras et les sources alimentaires adaptées ; bénéfice de gélules sur la force musculaire non établi.',
   guard:'Pas de supplémentation standard pour la longévité locomotrice ; précautions selon traitements et contexte.'}
 ];
 const monitoring=[
  {name:'Levers en 30 s',value:results.sts?.measured?label(results.sts.value):'—',unit:'répétitions'},
  {name:'Appui gauche / droit',value:balance?label(balance.left)+' / '+label(balance.right):'—',unit:'secondes'},
  {name:'Two-Step Test',value:results.two_step?.measured?
   label(results.two_step.value)+(results.two_step.twoStepIndex!==null?' (indice '+label(results.two_step.twoStepIndex)+')':''):
   '—',unit:'cm'},
  {name:'Récupération',value:recoveryConcern?'à explorer':'à documenter',unit:'autoévaluation'}
 ];
 return {version:'KOMO_CLINIC_HOME_PLAN_V1',headline,axis,highlights,emphasis,
  exercises,timeline,food,supplements,monitoring,
  provisional:true,simulated:options.simulated===true,
  review:'Proposition éducative à adapter et valider par un professionnel selon diagnostic, symptômes, traitements, autonomie, risque de chute et contre-indications.',
  safeguards:'En cas de douleur progressive, essoufflement anormal, malaise, chute ou faiblesse nouvelle, interrompre et demander un avis adapté.',
  references:[
   {title:'OMS — activité et renforcement',url:'https://www.who.int/initiatives/behealthy/physical-activity/'},
   {title:'ESPEN — apport protéique de la personne âgée',url:'https://pubmed.ncbi.nlm.nih.gov/24814383/'},
   {title:'Créatine et résistance chez les sujets âgés — méta-analyse',url:'https://pubmed.ncbi.nlm.nih.gov/42712402/'},
   {title:'Endocrine Society 2024 — vitamine D',url:'https://www.endocrine.org/clinical-practice-guidelines/vitamin-d-for-prevention-of-disease'},
   {title:'Oméga‑3 et fonction musculaire — synthèse',url:'https://pubmed.ncbi.nlm.nih.gov/42735611/'}
  ]};
}
export function clinicRadarMarkup(plan){
 const values=plan.axis.map(a=>a.value);
 if(values.some(v=>!finite(v)))return '<p class="moc-radar-unavailable">Diagramme disponible après les 22 réponses.</p>';
 const cx=150,cy=137,rad=90;
 const angles=[-Math.PI/2,0,Math.PI/2,Math.PI];
 const pt=(i,v)=>[cx+rad*v/100*Math.cos(angles[i]),cy+rad*v/100*Math.sin(angles[i])];
 const path=v=>v.map((x,i)=>pt(i,x).map(z=>z.toFixed(1)).join(',')).join(' ');
 const rings=[25,50,75,100].map(v=>'<polygon points="'+path([v,v,v,v])+'" fill="none" stroke="#d7d3c9" stroke-width="1"/>').join('');
 const axes=angles.map((_,i)=>{const a=pt(i,100);return '<line x1="'+cx+'" y1="'+cy+'" x2="'+a[0]+'" y2="'+a[1]+'" stroke="#d7d3c9" stroke-width="1"/>'}).join('');
 const titles=[
  {x:150,y:23,anchor:'middle'},
  {x:256,y:138,anchor:'start'},
  {x:150,y:252,anchor:'middle'},
  {x:44,y:138,anchor:'end'}
 ];
 return '<svg class="moc-radar-svg" viewBox="0 0 310 278" role="img" aria-label="Diagramme à quatre axes : '+
 plan.axis.map(a=>a.short+' '+a.value+' sur 100').join(', ')+'">'+rings+axes+
 '<polygon points="'+path(values)+'" fill="#b9cbb8" fill-opacity=".48" stroke="#284d3b" stroke-width="2.6" stroke-linejoin="round"/>'+
 values.map((v,i)=>{const [x,y]=pt(i,v);return '<circle cx="'+x+'" cy="'+y+'" r="4.2" fill="#284d3b" stroke="#fff" stroke-width="1.5"/>'}).join('')+
 plan.axis.map((a,i)=>'<text x="'+titles[i].x+'" y="'+titles[i].y+'" text-anchor="'+titles[i].anchor+'" font-size="12" font-weight="600" fill="#334b3d">'+a.short+'</text>'+
 '<text x="'+titles[i].x+'" y="'+(titles[i].y+14)+'" text-anchor="'+titles[i].anchor+'" font-size="11" fill="#89765b">'+a.value+'/100</text>').join('')+
 '</svg>';
}
