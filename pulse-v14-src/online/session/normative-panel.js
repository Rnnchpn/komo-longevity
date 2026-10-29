import {normativeSummary,SOURCES} from './reference-norms.mjs';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function resultMarkup(summary){
 const s=summary.sts,ref=s.reference;
 const cls=['within','below','above'].includes(s.status)?'norm-indicator '+s.status:'norm-indicator neutral';
 const message=s.comparison||'Comparaison non disponible';
 const range=ref?('Intervalle central '+ref.lower+'–'+ref.upper+' levers / 30 s · '+ref.age+' ans'):'Plage centrale disponible pour les 60–94 ans, par âge et groupe de référence.';
 return '<div class="norm-reference-result"><div><span class="overline">30 S · LEVER DE CHAISE</span><strong class="'+cls+'">'+esc(message)+'</strong><p>'+esc(range)+'</p><p>'+esc(s.reason)+'</p></div>'+
 '<a href="'+SOURCES.sts.url+'" target="_blank" rel="noopener noreferrer">Source : Rikli & Jones, 1999 ↗</a></div>'+
 '<div class="norm-reference-result"><div><span class="overline">APPUI UNIPODAL · GAUCHE ET DROIT</span>'+
 '<strong class="norm-indicator neutral">Référence descriptive uniquement</strong>'+
 '<p>'+ (summary.unipodal[0].expected===null?'Pas de tranche comparable pour l’âge renseigné.':
 'Référence '+esc(summary.unipodal[0].age)+' ans : meilleur de 3 essais, moyenne '+summary.unipodal[0].expected+' s.')+'</p>'+
 '<p>'+esc(summary.unipodal[0].reason)+'</p></div>'+
 '<a href="'+SOURCES.unipodal.url+'" target="_blank" rel="noopener noreferrer">Source : Springer et al., 2007 ↗</a></div>'+
 '<div class="norm-reference-result"><span class="overline">AUTRES OBSERVATIONS</span>'+
 '<p>Talons, bras et photographie sagittale : aucune plage clinique applicable à ces estimations webcam. Elles restent descriptives.</p></div>';
}
export function normPanelMarkup(answers={},results={}){
 const existing=results.sts?.normative||{};
 const age=Number.isInteger(existing.exactAge)&&existing.exactAge>=60&&existing.exactAge<=94?String(existing.exactAge):'';
 const cohort=['men','women'].includes(existing.cohort)?existing.cohort:'';
 const isEligible=['60-69','70-79','80plus'].includes(answers.ageBand);
 return '<section class="age-norms-panel"><h2>Vos résultats comparés à votre âge</h2>'+
 '<p>Un repère scientifique quand le test est comparable au protocole publié. Une mesure webcam ne suffit pas à diagnostiquer un problème.</p>'+
 '<div class="norm-comparison-options">'+
 '<label><span>Âge exact (facultatif, 60–94 ans)</span><input type="number" min="60" max="94" step="1" id="norm-exact-age" inputmode="numeric" placeholder="Ex. 67" value="'+age+'" '+(isEligible?'':'disabled')+'></label>'+
 '<label><span>Groupe de référence publié (facultatif)</span><select id="norm-cohort">'+
 '<option value="">Aucune comparaison</option><option value="men" '+(cohort==='men'?'selected':'')+'>Table hommes</option>'+
 '<option value="women" '+(cohort==='women'?'selected':'')+'>Table femmes</option></select></label>'+
 '</div><label class="norm-confirmation"><input type="checkbox" id="norm-sts-protocol" '+(existing.protocolConfirmed?'checked':'')+'>'+
 '<span>Je confirme : chaise de 43 cm environ, bras croisés contre le torse, aucun appui des mains pendant les 30 secondes.</span></label>'+
 '<p class="norm-note">Les plages du Sit-to-Stand sont des percentiles P25–P75 publiés pour des adultes de 60–94 ans. L’âge exact et la table de référence sont demandés uniquement pour éviter de comparer des groupes incompatibles. Ce choix reste local au navigateur.</p>'+
 '<div id="norm-interpretation" aria-live="polite">'+resultMarkup(normativeSummary(answers,results,existing))+'</div></section>';
}
export function bindNormPanel(root,answers,results,onChange=()=>{}){
 const age=root.querySelector('#norm-exact-age'),cohort=root.querySelector('#norm-cohort'),protocol=root.querySelector('#norm-sts-protocol'),display=root.querySelector('#norm-interpretation');
 if(!age||!cohort||!protocol||!display)return;
 const redraw=()=>{
  const parsed=age.value.trim()===''?null:Number(age.value);
  const value={exactAge:Number.isInteger(parsed)&&parsed>=60&&parsed<=94?parsed:null,
   cohort:['men','women'].includes(cohort.value)?cohort.value:'',
   protocolConfirmed:protocol.checked};
  if(!results.sts)results.sts={status:'pending',value:null,source:'webcam'};
  results.sts.normative=value;
  display.innerHTML=resultMarkup(normativeSummary(answers,results,value));
  onChange();
 };
 age.onchange=redraw;cohort.onchange=redraw;protocol.onchange=redraw;
 age.oninput=redraw;
}
