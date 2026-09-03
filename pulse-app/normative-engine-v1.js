const VERSION='komo-motion-interpretation-v2.0.0';
const REFERENCE_VERSION='komo-motion-sensor-reference-2026-09-v1';

export const SOURCES={
  LSI_90:{
    id:'LSI_90',
    title:'Lower-limb rehabilitation literature — Limb Symmetry Index',
    url:'https://pubmed.ncbi.nlm.nih.gov/41273162/',
    use:'LSI ≥90% as a commonly used clinical benchmark; not a Myodev-specific normative standard.'
  }
};

const MUSCLE_LABEL={VL:'Quadriceps',BF:'Ischio-jambiers',GM:'Gastrocnémiens'};

function num(v){if(v===null||v===undefined||v==='')return null;const x=Number(v);return Number.isFinite(x)?x:null}
function round(v,d=1){const x=num(v);if(x===null)return null;const p=10**d;return Math.round(x*p)/p}
function mean(rows){const vals=(rows||[]).map(r=>num(r?.value)).filter(v=>v!==null);return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null}
function metricRows(d,code,muscle='',side=''){return(d?.myodev_metrics||[]).filter(x=>x.metric_code===code&&x.qc_status==='valid'&&(!muscle||x.muscle_code===muscle)&&(!side||x.side===side))}
function metricValue(d,code,muscle='',side=''){return mean(metricRows(d,code,muscle,side))}
function finding(o){return{status:'descriptive',severity:0,referenceType:'descriptive',rank:0,sourceIds:[],protocolTriggers:[],...o}}
function statusLabel(s){return({favorable:'Zone favorable',watch:'À surveiller',priority:'Priorité',descriptive:'Descriptif',review:'À vérifier'})[s]||'Descriptif'}
function sourceMeta(ids){return(ids||[]).map(id=>SOURCES[id]).filter(Boolean)}
function lsiStatus(x){return x>=90?'favorable':x>=85?'watch':'priority'}
function lsiMessage(x){return x>=90?'La symétrie droite / gauche se situe dans la zone favorable du benchmark utilisé pour le suivi.':x>=85?'Une asymétrie modérée persiste et mérite d’être suivie avec le même protocole.':'L’écart droite / gauche constitue la principale priorité neuromusculaire de ce bilan.'}

function scoreSymmetry(d){
  const s=d?.score||{},dom=s.domain_scores||{},sig=s.muscle_signature?.symmetry||{};
  const x=num(dom.neuromuscular_symmetry)??num(sig.score_0_100)??num(sig.mean_LSI_pct)??metricValue(d,'LSI_pct');
  if(x===null)return null;
  const status=lsiStatus(x);
  return finding({
    id:'neuromuscular_symmetry',domain:'muscle',title:'Symétrie neuromusculaire',
    rawValue:x,displayValue:`${round(x,1).toFixed(1)} %`,status,
    severity:status==='priority'?2:status==='watch'?1:0,rank:status==='priority'?100:status==='watch'?75:45,
    referenceType:'clinical_benchmark',referenceLabel:'Benchmark de suivi : LSI ≥90 %. À interpréter selon la tâche et le contexte.',
    reference:{cutoff:90,direction:'higher_is_better'},patientMessage:lsiMessage(x),
    clinicianMessage:`LSI global capteurs ${round(x,1)} %.`,sourceIds:['LSI_90'],
    protocolTriggers:status==='favorable'?[]:['muscle_asymmetry','targeted_strength_control']
  });
}

function muscleSymmetry(d){
  const sig=d?.score?.muscle_signature?.symmetry||{},fromScore=sig.per_muscle_score_0_100||{};
  const out=[];
  for(const code of ['VL','BF','GM']){
    const x=num(fromScore?.[code])??metricValue(d,'LSI_pct',code);
    if(x===null)continue;
    const status=lsiStatus(x),label=MUSCLE_LABEL[code]||code;
    out.push(finding({
      id:`lsi_${code.toLowerCase()}`,domain:'muscle',title:`${label} · symétrie`,rawValue:x,
      displayValue:`${round(x,1).toFixed(1)} %`,status,severity:status==='priority'?2:status==='watch'?1:0,
      rank:status==='priority'?92:status==='watch'?67:34,referenceType:'clinical_benchmark',
      referenceLabel:'LSI ≥90 % utilisé comme benchmark de suivi, non comme diagnostic isolé.',
      reference:{cutoff:90,direction:'higher_is_better'},patientMessage:lsiMessage(x),
      clinicianMessage:`${label} LSI ${round(x,1)} %.`,sourceIds:['LSI_90'],
      protocolTriggers:status==='favorable'?[]:['targeted_strength_control']
    }));
  }
  return out;
}

function activationFindings(d){
  const out=[];
  for(const code of ['VL','BF','GM']){
    const label=MUSCLE_LABEL[code]||code;
    const left=metricValue(d,'activation_pctMVC',code,'LEFT'),right=metricValue(d,'activation_pctMVC',code,'RIGHT');
    if(left===null&&right===null)continue;
    const display=left!==null&&right!==null?`G ${round(left,1)} · D ${round(right,1)} %MVC`:`${round(left??right,1)} %MVC`;
    out.push(finding({
      id:`activation_${code.toLowerCase()}`,domain:'muscle',title:`${label} · activation`,
      rawValue:{left,right},displayValue:display,rank:18,referenceType:'descriptive',
      referenceLabel:'Mesure capteur descriptive ; comparaison longitudinale avec protocole identique.',
      patientMessage:'Cette mesure décrit le recrutement musculaire pendant la tâche et sert surtout à suivre votre évolution.',
      clinicianMessage:`Activation ${label} : ${display}.`
    }));
  }
  return out;
}

function optionalEmg(d){
  const out=[];
  const cci=metricValue(d,'CCI_pct'),fatigue=metricValue(d,'fatigue_drift_pct');
  if(cci!==null)out.push(finding({id:'emg_cci',domain:'muscle',title:'Coactivation musculaire',rawValue:cci,displayValue:`${round(cci,1)} %`,rank:15,referenceLabel:'Mesure descriptive ; aucune norme universelle KŌMØ/Myodev n’est appliquée.',patientMessage:'La coactivation est conservée pour le suivi lorsque l’export la fournit.',clinicianMessage:'CCI descriptif.'}));
  if(fatigue!==null)out.push(finding({id:'emg_fatigue',domain:'muscle',title:'Fatigabilité',rawValue:fatigue,displayValue:`${round(fatigue,1)} %`,rank:15,referenceLabel:'Mesure descriptive ; aucune valeur-seuil universelle n’est appliquée.',patientMessage:'Cette mesure est utilisée pour comparer les bilans successifs avec le même protocole.',clinicianMessage:'Fatigue drift descriptif.'}));
  return out;
}

function gaitSensor(d){
  const metrics=[
    ['gait_speed_m_s','Vitesse de marche capteur',v=>`${round(v,2).toFixed(2)} m/s`],
    ['cadence_spm','Cadence',v=>`${round(v,0)} pas/min`],
    ['double_support_pct','Double appui',v=>`${round(v,1)} %`],
    ['gait_stance_symmetry_pct','Symétrie du temps d’appui',v=>`${round(v,1)} %`],
    ['gait_step_length_symmetry_pct','Symétrie de longueur de pas',v=>`${round(v,1)} %`]
  ];
  return metrics.map(([code,title,fmt],i)=>{
    const x=metricValue(d,code);if(x===null)return null;
    return finding({id:code,domain:'gait_sensor',title,rawValue:x,displayValue:fmt(x),rank:14-i,referenceType:'descriptive',referenceLabel:'Mesure Myodev descriptive ; suivie avec le même protocole d’acquisition.',patientMessage:'Cette valeur décrit votre marche au moment du bilan et prendra surtout son sens dans la trajectoire.',clinicianMessage:`${title} : ${fmt(x)}.`});
  }).filter(Boolean);
}

function consistency(d){
  const issues=[];
  const accepted=(d?.myocare_imports||[]).filter(x=>x.status==='accepted');
  const invalid=(d?.myodev_metrics||[]).filter(x=>x.qc_status==='invalid').length;
  const suspect=(d?.myodev_metrics||[]).filter(x=>x.qc_status==='suspect').length;
  if(!accepted.length)issues.push({id:'myodev_import_missing',severity:'high',title:'Import capteurs absent',message:'Aucun import Myodev accepté n’est disponible pour ce bilan Motion.'});
  if(invalid>0)issues.push({id:'sensor_qc_invalid',severity:'high',title:'Contrôle qualité capteurs',message:`${invalid} mesure(s) capteur sont marquées invalides et doivent être revues avant interprétation.`});
  else if(suspect>0)issues.push({id:'sensor_qc_suspect',severity:'moderate',title:'Contrôle qualité capteurs',message:`${suspect} mesure(s) capteur sont marquées suspectes ; elles n’entrent pas dans les calculs validés.`});
  return issues;
}

const PLAN_LIBRARY={
  muscle_asymmetry:{domain:'Symétrie neuromusculaire',goal:'Réduire l’écart droite / gauche',actions:['Identifier le côté et les groupes musculaires les plus déficitaires','Programmer un travail unilatéral individualisé','Répéter le même protocole Myodev lors du contrôle'],recheck:'6–8 semaines'},
  targeted_strength_control:{domain:'Contrôle neuromusculaire',goal:'Améliorer la contribution du côté déficitaire',actions:['Renforcement ciblé du membre déficitaire','Travail de contrôle moteur et qualité du mouvement','Progression adaptée au contexte et à la tolérance'],recheck:'6–8 semaines'}
};

function buildPlan(findings,issues){
  const triggers=[...new Set(findings.flatMap(f=>f.protocolTriggers||[]))];
  const highIssue=issues.some(i=>i.severity==='high');
  const priorities=triggers.map(t=>PLAN_LIBRARY[t]).filter(Boolean).filter((x,i,a)=>a.findIndex(y=>y.domain===x.domain)===i).slice(0,3);
  return{
    status:highIssue?'review_required':'draft_to_validate',
    label:highIssue?'Revue professionnelle requise':'Plan KŌMØ proposé — à valider par le professionnel',
    safetyGate:highIssue?'Le contrôle qualité ou la disponibilité des données capteurs doit être vérifié avant de transformer le bilan en plan.':'Le plan est construit à partir des mesures capteurs validées et reste à adapter au contexte individuel.',
    priorities,
    followUp:priorities.length?'Répéter le même protocole capteur pour mesurer l’évolution.':'Aucune priorité automatique n’est déclenchée par les mesures validées de ce bilan.'
  };
}

export function interpretDossier(dossier){
  const findings=[scoreSymmetry(dossier),...muscleSymmetry(dossier),...activationFindings(dossier),...optionalEmg(dossier),...gaitSensor(dossier)].filter(Boolean);
  const issues=consistency(dossier),sorted=[...findings].sort((a,b)=>b.rank-a.rank);
  const strengths=sorted.filter(f=>f.status==='favorable').slice(0,3);
  const priorities=sorted.filter(f=>['priority','watch','review'].includes(f.status)).slice(0,3);
  return{
    engineVersion:VERSION,referenceVersion:REFERENCE_VERSION,
    context:{scorePolicy:'sensor_only',questionnaires:'preassessment_context_only',legacyManualTests:'retired'},
    findings:sorted,consistencyIssues:issues,
    summary:{strengths,priorities,descriptive:sorted.filter(f=>f.status==='descriptive')},
    carePlan:buildPlan(sorted,issues),sources:Object.values(SOURCES),generatedAt:new Date().toISOString()
  };
}

export function levelLabel(status){return statusLabel(status)}
export function sourceList(ids){return sourceMeta(ids)}

if(typeof window!=='undefined')window.KomoNormativeEngine={version:VERSION,referenceVersion:REFERENCE_VERSION,interpretDossier,levelLabel,sourceList,SOURCES};
