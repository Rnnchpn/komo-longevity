import {scoreIntake,questionnaireFocus,SCORING_GROUPS,QUESTIONNAIRE_VERSION,intakeProgress} from './intake-model.mjs';
import {calculateMotionScore,MOTION_ALGORITHM_VERSION} from './motion-score.mjs';
import {buildPdfReportData,downloadMotionPdf} from './pdf-report.js';
import {normPanelMarkup,bindNormPanel} from './normative-panel.js';
import {passportMarkup,roadmapMarkup,dailyProgramMarkup,bindDailyProgram} from './passport-view.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=(root,id)=>{const v=root.querySelector('#'+id)?.value?.trim();return v===''||v===undefined?null:Number(v);};
function domainCards(scored){
 return SCORING_GROUPS.map(g=>{
  const value=scored.domains[g.id];
  return '<div class="intake-result-card"><div><span>'+esc(g.title)+'</span><strong>'+ (value===null?'—':value.toFixed(1)+' / 100')+'</strong></div>'+
   '<div class="intake-result-track"><span style="width:'+(value??0)+'%"></span></div><small>Déclaratif · poids '+Math.round(g.weight*100)+' % dans l’indice questionnaire</small></div>';
 }).join('');
}
function measurementRows(results){
 const labels=[
  ['sts','Se relever de la chaise · 30 s','répétitions'],
  ['heels','Élévations des talons','répétitions'],
  ['unipodal_left','Unipodal gauche','secondes'],
  ['unipodal_right','Unipodal droit','secondes'],
  ['arms','Mouvements des bras','répétitions'],
  ['posture','Profil sagittal','% de hauteur apparente']
 ];
 return labels.map(([id,title,unit])=>{
  const r=results[id],done=r&&(r.status==='done'||r.status==='review');
  const value=done&&Number.isFinite(Number(r.value))?Number(r.value).toFixed(id.startsWith('unipodal')||id==='posture'?1:0)+' '+unit:'Non réalisé';
  const quality=r?.status==='review'?' · à vérifier':'';
  return '<div><span>'+esc(title)+'</span><strong>'+esc(value+quality)+'</strong></div>';
 }).join('');
}
function measureInput(id,label,placeholder,step='any',initial=null){
 return '<label class="motion-score-field"><span>'+esc(label)+'</span><input type="number" id="'+esc(id)+'" min="0" step="'+step+'" placeholder="'+esc(placeholder)+'"'+(initial===null?'':' value="'+Number(initial)+'"')+' inputmode="decimal"></label>';
}
export function reportMarkup(answers,results,blocked,persisted=false,program=null){
 const intake=scoreIntake(answers),p=intakeProgress(answers);
 const focus=questionnaireFocus(answers);
 const chosen=focus.map(f=>esc(f.label)+' ('+f.value+'/100)').join(' · ');
 const sts=results.sts;
 const stsOk=Boolean(sts?.status==='done'&&Number.isInteger(sts.value)&&sts.value>=0);
 return '<section class="paper online-report">'+passportMarkup(answers,results,blocked)+
 '<details class="report-method-details"><summary>Voir le détail des questionnaires et de leur calcul</summary>'+ '<span class="overline">SYNTHÈSE MOTION · QUESTIONNAIRE & OBSERVATIONS</span>'+ 
 '<h1>Votre profil en mouvement<em>.</em></h1>'+
 '<p>Cette restitution distingue vos <strong>réponses personnelles</strong> des mesures fonctionnelles. Les scores déclaratifs sont exploratoires et ne constituent pas des diagnostics.</p>'+
 (blocked?'<div class="notice danger"><strong>Tests interrompus par sécurité.</strong> Le questionnaire demeure informatif, mais aucun Motion Score global ne peut être établi.</div>':'')+
 '<div class="report-hero"><div><span>INDICE DE PROFIL DÉCLARÉ</span><strong>'+(intake.complete?intake.profileIndex.toFixed(1):'—')+'</strong><small>/ 100 · '+esc(QUESTIONNAIRE_VERSION)+'</small></div>'+
 '<p>'+(intake.complete?'Indice calculé à partir de vos réponses uniquement, avec quatre domaines pondérés. <strong>Il ne s’agit pas du Motion Score.</strong>':'Questionnaire incomplet : '+(p.total-p.completed)+' réponse(s) manquante(s).')+'</p></div>'+
 '<div class="intake-domain-grid">'+domainCards(intake)+'</div>'+
 (intake.complete?'<p class="report-context"><strong>Domaines à discuter en priorité :</strong> '+(chosen||'Aucune priorité différenciée')+'. Ils reflètent votre perception et ne traduisent pas à eux seuls une limitation objective.</p>':'')+
 '</details>'+ '<h2 class="report-section-title">Votre bilan webcam</h2><div class="result-list">'+measurementRows(results)+'</div>'+normPanelMarkup(answers,results)+
 '<section class="motion-score-zone"><div class="motion-score-heading"><span class="overline">MOTION SCORE · ALGORITHME DE RÉFÉRENCE</span><h2>Le score fonctionnel final</h2><p>Formule définie pour KŌMØ : <strong>40 % Sit-to-Stand · 35 % TUG 3 m · 25 % équilibre SPPB.</strong> Les questionnaires, la posture et l’unipodal ne modifient pas cette formule.</p></div>'+
 '<div class="motion-score-locked"><span id="score-status-icon">○</span><div><strong id="score-status">Motion Score indisponible : mesures complémentaires requises</strong><p id="score-hint">Le TUG standardisé et l’équilibre SPPB n’ont pas été mesurés automatiquement par la webcam. Aucune norme statistique n’a été inventée.</p></div><div class="motion-score-value"><strong id="motion-score-number">—</strong><span>/ 100</span></div></div>'+
 '<details class="motion-operator-details"><summary>Calculateur contrôlé · mode test administrateur</summary>'+
 '<p>Pour vérifier l’algorithme, renseignez uniquement des mesures issues de protocoles standardisés et un référentiel normatif documenté. <strong>Ne saisissez pas de valeurs fictives dans un vrai dossier patient.</strong></p>'+
 '<div class="motion-input-grid">'+
 measureInput('kms-sts','STS 30 s · répétitions (webcam à confirmer)',stsOk?String(sts.value):'Ex. 12','1',stsOk?sts.value:null)+
 measureInput('kms-tug','TUG 3 mètres · secondes','Temps validé')+
 measureInput('kms-sppb','Équilibre SPPB · 0 à 4','Score 0–4','1')+
 measureInput('kms-sts-p10','Référence STS · P10','P10 répétitions')+
 measureInput('kms-sts-p90','Référence STS · P90','P90 répétitions')+
 measureInput('kms-tug-p10','Référence TUG · P10','P10 secondes')+
 measureInput('kms-tug-p90','Référence TUG · P90','P90 secondes')+
 '</div><label class="motion-score-field"><span>Source des percentiles (population / tranche d’âge / publication)</span><input id="kms-source" type="text" maxlength="180" placeholder="Référence bibliographique du référentiel utilisé"></label>'+
 '<label class="motion-check"><input id="kms-sts-verified" type="checkbox"><span>Le résultat Sit-to-Stand a été revu et la méthode est jugée exploitable.</span></label>'+
 '<label class="motion-check"><input id="kms-verified" type="checkbox"><span>Le TUG et l’équilibre SPPB ont été réellement mesurés et validés selon leurs protocoles.</span></label>'+
 '<button type="button" class="action" id="compute-motion-score">Calculer avec les mesures vérifiées →</button>'+
 '<p class="message" id="kms-error" role="status"></p></details>'+
 '<p class="motion-score-disclaimer">Algorithme '+esc(MOTION_ALGORITHM_VERSION)+' · score exploratoire non cliniquement validé. S’il manque une mesure, une norme ou une vérification, le résultat reste volontairement vide. Aucun « Motion Age » n’est calculé.</p></section>'+
 roadmapMarkup(answers,results,blocked)+
 dailyProgramMarkup(answers,results,blocked,program)+
 '<p class="notice">'+(persisted?'Les réponses et mesures chiffrées de votre bilan sont conservées dans votre dossier Pulse privé. Le PDF est créé et téléchargé localement : il n’est pas encore archivé sur Pulse.':'Mode test : réponses et résultats de démonstration conservés pendant quatre heures au maximum dans cet onglet pour reprendre après actualisation ; aucune donnée n’est sauvegardée sur un serveur. Le bouton Quitter efface cette progression.')+'</p>'+
 '<div class="pdf-download-box"><div><strong>Votre rapport Motion, en PDF</strong><p>Questionnaires, sous-scores, observations webcam et Motion Score uniquement s’il a pu être calculé. Le fichier est créé localement et reste sur votre appareil.</p></div><button type="button" class="action" id="download-pdf">↓ Télécharger mon rapport PDF</button></div>'+
 '<div class="actions"><button type="button" class="action secondary" id="back">← Revoir mes réponses</button><button type="button" class="action secondary" id="print-report">Imprimer / Enregistrer en PDF</button><button type="button" class="action secondary" id="copy-report">Copier la synthèse</button><button type="button" class="action" id="restart">Recommencer la démonstration →</button></div><p id="report-message" class="message" role="status"></p></section>';
}
export function bindReport(root,answers,results,callbacks,blocked=false){
 bindDailyProgram(root,answers,results,blocked,callbacks.getProgram||(()=>null),callbacks.updateProgram||(()=>{}));
 bindNormPanel(root,answers,results,()=>callbacks.checkpoint?.());
 const stsRecord=results.sts;
 let computed=null;
 // Prevent a stale, previously computed score after changing a reference or input.
 root.querySelector('.motion-operator-details').addEventListener('input',()=>{
  computed=null;
  root.querySelector('#motion-score-number').textContent='—';
  root.querySelector('#score-status').textContent='Motion Score à recalculer après toute modification';
  root.querySelector('#score-hint').textContent='Validez de nouveau les mesures, normes et protocoles avant toute exportation.';
  root.querySelector('#kms-error').textContent='';
 });
 root.querySelector('.motion-operator-details').addEventListener('change',()=>{
  computed=null;
  root.querySelector('#motion-score-number').textContent='—';
  root.querySelector('#score-status').textContent='Motion Score à recalculer après toute modification';
  root.querySelector('#score-hint').textContent='Validez de nouveau les mesures, normes et protocoles avant toute exportation.';
  root.querySelector('#kms-error').textContent='';
 });
 root.querySelector('#compute-motion-score').onclick=()=>{
  const data={
   sts30:number(root,'kms-sts'),tug3m:number(root,'kms-tug'),sppbBalance:number(root,'kms-sppb'),
   stsP10:number(root,'kms-sts-p10'),stsP90:number(root,'kms-sts-p90'),
   tugP10:number(root,'kms-tug-p10'),tugP90:number(root,'kms-tug-p90'),
   normsSource:root.querySelector('#kms-source').value.trim(),
   stsVerified:root.querySelector('#kms-sts-verified').checked&&stsRecord?.status==='done',
   operatorVerified:root.querySelector('#kms-verified').checked
  };
  // A missing or skipped webcam result cannot be replaced with invented STS data.
  if(stsRecord?.status!=='done'||data.sts30!==stsRecord.value){
   data.stsVerified=false;
  }
  computed=blocked||!scoreIntake(answers).complete?
   {complete:false,score:null,missing:blocked?
    ['Tests interrompus par securite']:['Questionnaires incomplets'],version:MOTION_ALGORITHM_VERSION}:
   calculateMotionScore(data);
  const numberEl=root.querySelector('#motion-score-number');
  numberEl.textContent=computed.complete?String(computed.score):'—';
  root.querySelector('#score-status').textContent=computed.complete?'Motion Score calculé · vérification opérateur déclarée':'Motion Score incomplet';
  root.querySelector('#score-hint').textContent=computed.complete?
    'Force '+computed.subscores.strength+'/100 · Mobilité '+computed.subscores.mobility+'/100 · Équilibre '+computed.subscores.balance+'/100. Calcul démonstratif, sous réserve de la validité du référentiel.' :
    'Données manquantes : '+computed.missing.join(' · ');
  root.querySelector('#kms-error').textContent=computed.complete?'Résultat calculé. Non enregistré.':'Le score n’est pas disponible tant que toutes les conditions ne sont pas réunies.';
 };
 root.querySelector('#download-pdf').onclick=async()=>{
  const button=root.querySelector('#download-pdf');
  const message=root.querySelector('#report-message');
  if(button.disabled)return;
  button.disabled=true;button.textContent='Création du PDF…';
  message.textContent='Préparation du rapport sur votre appareil…';
  try{
   const payload=buildPdfReportData(answers,results,computed,blocked,new Date(),{mode:callbacks.isPaid?'PILOTE':'DEMONSTRATION',program:callbacks.getProgram?.()});
   const filename=await downloadMotionPdf(payload);
   message.textContent='Rapport PDF prêt : '+filename+'. Il n’a pas été téléversé sur Pulse.';
  }catch(error){
   message.textContent='La création du PDF a échoué. Vérifiez votre connexion au chargement initial du module, puis réessayez.';
  }finally{button.disabled=false;button.textContent='↓ Télécharger mon rapport PDF';}
 };
 root.querySelector('#print-report').onclick=()=>window.print();
 root.querySelector('#copy-report').onclick=async()=>{
  const profile=scoreIntake(answers);
  const testValues=Object.fromEntries(Object.entries(results).map(([key,val])=>[key,{value:val.value??null,status:val.status??'inconnu',quality:val.quality??null}]));
  const exportData={type:'KOMO_MOTION_ONLINE_DEMO',questionnaireVersion:profile.version,profileIndex:profile.profileIndex,
    domains:profile.domains,motionScore:computed?.complete?computed.score:null,
    motionAlgorithm:computed?.complete?computed.version:null,
    tests:testValues,notice:'Données de démonstration, non médicales, non sauvegardées.'};
  try{
   await navigator.clipboard.writeText(JSON.stringify(exportData,null,2));
   root.querySelector('#report-message').textContent='Synthèse copiée dans votre presse-papiers. Ne la collez pas dans un dossier réel sans contrôle des données.';
  }catch{
   root.querySelector('#report-message').textContent='Presse-papiers indisponible : consultez les résultats affichés.';
  }
 };
 root.querySelector('#back').onclick=callbacks.back;
 root.querySelector('#restart').onclick=callbacks.restart;
}
