import { readFile, writeFile } from 'node:fs/promises';

const path='pulse-app/pulse-free-continuity-v2.js';
let src=await readFile(path,'utf8');

const cssNeedle='.kfree-v2-motion{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center;padding:20px 30px;border-top:1px solid rgba(40,50,42,.09);background:#fff}';
const cssInsert=`.kfree-v2-meaning{padding:4px 30px 24px}.kfree-v2-meaning-panel{padding:22px;border-radius:20px;background:#ebe7dc;border:1px solid rgba(40,50,42,.08)}.kfree-v2-meaning-head{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:start;margin-bottom:16px}.kfree-v2-meaning-head .eyebrow{margin:0 0 5px;color:#657267}.kfree-v2-meaning-head h3{margin:0 0 6px;font-size:22px;letter-spacing:-.025em;color:#29352c}.kfree-v2-meaning-head p{margin:0;max-width:760px;color:#697169;font-size:12px;line-height:1.6}.kfree-v2-status{display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:999px;background:#dce5da;color:#314135;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}.kfree-v2-status:before{content:'';width:7px;height:7px;border-radius:50%;background:#627d67}.kfree-v2-readings{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.kfree-v2-reading{padding:15px 16px;border-radius:16px;background:rgba(255,255,255,.72);border:1px solid rgba(40,50,42,.07)}.kfree-v2-reading b{display:block;margin-bottom:5px;font-size:10px;color:#344137}.kfree-v2-reading p{margin:0;color:#707770;font-size:10px;line-height:1.55}.kfree-v2-next{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px}.kfree-v2-next div{padding:14px 16px;border-top:1px solid rgba(40,50,42,.13)}.kfree-v2-next span{display:block;margin-bottom:5px;font-size:8px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#697a6c}.kfree-v2-next strong{display:block;margin-bottom:4px;font-size:12px;color:#2f3c32}.kfree-v2-next small{color:#747b74;font-size:9px;line-height:1.45}
${cssNeedle}`;
if(!src.includes('.kfree-v2-meaning{')){
  if(!src.includes(cssNeedle))throw new Error('[pulse-free-interpretation-v1] CSS anchor missing');
  src=src.replace(cssNeedle,cssInsert);
}

const fnNeedle='function motion(rq){';
const interpretation=`function interpretation(r){
  const qDifficulty=r.q===null?null:Math.max(0,Math.round(100-r.q));
  const favorable=r.level===0;
  const qGood=r.q!==null&&qDifficulty<7;
  const twoGood=r.two!==null&&r.two>=1.3;
  const chairValue=r.chair===null?'Votre valeur de Chair Stand est enregistrée.':Math.round(r.chair)+' levers en 30 s : une mesure simple de votre force-endurance fonctionnelle des membres inférieurs.';
  const title=favorable?'Vos premiers résultats sont favorables.':'Votre première référence mérite une surveillance.';
  const lead=favorable?'Sur ce dépistage, aucun signal fonctionnel important n’apparaît dans les éléments qui déterminent le Niveau Free. Vous disposez maintenant d’un point de départ mesurable à conserver dans le temps.':'Pulse Free sert ici de signal de repérage. Il ne pose pas de diagnostic, mais indique qu’un approfondissement professionnel peut être utile.';
  const qText=r.q===null?'Questionnaire enregistré.':qGood?'Aucune difficulté significative déclarée dans le questionnaire KŌMØ ('+qDifficulty+' point'+(qDifficulty>1?'s':'')+' de difficulté).':'Le questionnaire fait remonter des difficultés fonctionnelles à suivre.';
  const twoText=r.two===null?'Two-Step enregistré.':twoGood?'Ratio '+r.two.toFixed(2)+' : zone favorable dans le repère KŌMØ Free, au-dessus de 1,30.':'Ratio '+r.two.toFixed(2)+' : valeur à replacer dans votre contexte fonctionnel.';
  return '<div class="kfree-v2-meaning"><div class="kfree-v2-meaning-panel"><div class="kfree-v2-meaning-head"><div><p class="eyebrow">CE QUE VOS RÉSULTATS SIGNIFIENT</p><h3>'+esc(title)+'</h3><p>'+esc(lead)+'</p></div><span class="kfree-v2-status">'+(favorable?'Ensemble favorable':'À approfondir')+'</span></div><div class="kfree-v2-readings"><div class="kfree-v2-reading"><b>Questionnaire · perception fonctionnelle</b><p>'+esc(qText)+'</p></div><div class="kfree-v2-reading"><b>Chair Stand · force-endurance</b><p>'+esc(chairValue)+' Ce test reste affiché comme valeur de référence et n’entre pas dans le calcul du Niveau Free.</p></div><div class="kfree-v2-reading"><b>Two-Step · capacité locomotrice</b><p>'+esc(twoText)+'</p></div></div><div class="kfree-v2-next"><div><span>01 · Référence</span><strong>Conserver ce point de départ</strong><small>Pulse garde cette première mesure pour la comparer à vos prochaines évaluations.</small></div><div><span>02 · Motion</span><strong>Voir plus finement le mouvement</strong><small>Le bilan professionnel ajoute l’acquisition Myodev / MyoCare et approfondit la marche et la fonction musculaire.</small></div><div><span>03 · Suivi</span><strong>Mesurer l’évolution</strong><small>My KŌMØ permet ensuite de suivre les changements et de comparer les références successives.</small></div></div></div></div>';
}

${fnNeedle}`;
if(!src.includes('function interpretation(r){')){
  if(!src.includes(fnNeedle))throw new Error('[pulse-free-interpretation-v1] function anchor missing');
  src=src.replace(fnNeedle,interpretation);
}

const cardNeedle='${metrics(r)}${motion(rq)}';
const cardReplacement='${metrics(r)}${interpretation(r)}${motion(rq)}';
if(!src.includes(cardReplacement)){
  if(!src.includes(cardNeedle))throw new Error('[pulse-free-interpretation-v1] card anchor missing');
  src=src.replace(cardNeedle,cardReplacement);
}

const mobileNeedle='@media(max-width:820px){.kfree-v2-head,.kfree-v2-motion{grid-template-columns:1fr}.kfree-v2-metrics,.kfree-v2-libgrid{grid-template-columns:1fr}.kfree-v2-head,.kfree-v2-motion{padding:22px}.kfree-v2-metrics{padding:18px 22px}.kfree-v2-level{width:92px;height:92px}}';
const mobileReplacement='@media(max-width:820px){.kfree-v2-head,.kfree-v2-motion,.kfree-v2-meaning-head{grid-template-columns:1fr}.kfree-v2-metrics,.kfree-v2-libgrid,.kfree-v2-readings,.kfree-v2-next{grid-template-columns:1fr}.kfree-v2-head,.kfree-v2-motion{padding:22px}.kfree-v2-metrics{padding:18px 22px}.kfree-v2-meaning{padding:2px 22px 20px}.kfree-v2-level{width:92px;height:92px}.kfree-v2-status{justify-self:start}}';
if(src.includes(mobileNeedle))src=src.replace(mobileNeedle,mobileReplacement);

await writeFile(path,src);
console.log('[pulse-free-interpretation-v1] patient-friendly Free interpretation applied');
