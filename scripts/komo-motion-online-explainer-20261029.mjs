import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
// Purely editorial home content, injected after existing offer and UI owners.
const copy={
fr:{
 h:'Vous connaissez votre âge.<br><em>Et vos capacités de mouvement ?</em>',
 intro:'Se relever, tenir debout, bouger les bras : ces gestes du quotidien offrent des repères complémentaires sur votre mobilité. KŌMØ Motion Online les observe avec méthode pour vous aider à comprendre votre point de départ, sans diagnostic ni promesse de prédire votre longévité.',
 why:'Pourquoi observer ces capacités ?', how:'Comment se déroule le bilan ?',
 dimensions:[
 ['Se relever','Un mouvement essentiel de la vie quotidienne, observable avec un test simple.'],
 ['Tenir en équilibre','La stabilité debout donne des indications sur le contrôle postural, dans les limites de la vidéo.'],
 ['Bouger librement','Des gestes et une posture visibles permettent une description fonctionnelle, pas une mesure radiographique.'],
 ['Comprendre votre ressenti','Mobilité, activité, sommeil et difficultés perçues complètent ce qui est observable à l’écran.']],
 steps:[['01','Réserver','30 minutes à distance, tarif annoncé de 49 €.'],['02','Se préparer','Questionnaires, espace dégagé, appareil avec caméra et consignes de sécurité.'],['03','Faire les tests','Des mouvements simples devant la caméra, selon les conditions de sécurité et la qualité de la vidéo.'],['04','Faire le point','Échange de restitution sur les observations obtenues, leurs limites et les prochaines étapes.']],
 nextTitle:'Un point de départ. Une suite concrète.',
 next:'L’intérêt d’un bilan est aussi de disposer d’une référence pour comparer vos capacités à distance de quelques semaines. Selon vos objectifs, une nouvelle évaluation ou un bilan instrumenté en présentiel à Paris ou à Cannes pourra être envisagé.',
 note:'Bilan fonctionnel non médical. Aucun diagnostic, prescription, âge biologique ou score de longévité validé n’est délivré. La disponibilité des résultats dépend des tests réalisés et de leur qualité.',
 cta:'Découvrir le bilan · 49 €', label:'KŌMØ · MOTION ONLINE'
},
en:{
 h:'You know your age.<br><em>How well do you know your movement?</em>',
 intro:'Standing up, keeping your balance and moving your arms are everyday actions that offer complementary signs of functional mobility. Motion Online helps establish a structured starting point without diagnosis or lifespan prediction.',
 why:'Why observe these abilities?',how:'How does it work?',
 dimensions:[['Standing up','An essential daily action, observed through a simple task.'],['Balance','Standing stability can inform a description of postural control, within the limits of video.'],['Movement','Visible movement and posture can be described, not used for radiographic assessment.'],['Your perspective','Answers about mobility, activity, sleep and everyday difficulties add context.']],
 steps:[['01','Book','A 30-minute remote appointment listed at €49.'],['02','Prepare','Questionnaires, clear space, camera and safety instructions.'],['03','Move','Simple camera-guided movements when safe and technically feasible.'],['04','Review','Feedback on observations, limitations and potential next steps.']],
 nextTitle:'A starting point, with a next step.',
 next:'A baseline may be revisited a few weeks later. Depending on your goals, you may request a reassessment or an instrumented session in Paris or Cannes, subject to availability.',
 note:'Non-medical functional assessment. No diagnosis, prescription, biological age or validated longevity score. Results depend on completed tests and observation quality.',
 cta:'Explore Motion Online · €49',label:'KŌMØ · MOTION ONLINE'
},
es:{
 h:'Conoces tu edad.<br><em>¿Y tu capacidad de movimiento?</em>',
 intro:'Levantarse, mantener el equilibrio y mover los brazos son gestos cotidianos que ayudan a describir la movilidad funcional. Motion Online permite establecer un punto de partida estructurado, sin diagnóstico ni predicción de longevidad.',
 why:'¿Por qué observar estas capacidades?',how:'¿Cómo funciona?',
 dimensions:[['Levantarse','Un gesto esencial que puede observarse con una prueba sencilla.'],['Equilibrio','La estabilidad de pie permite describir aspectos del control postural, con límites.'],['Movimiento','Los movimientos y la postura visibles no sustituyen mediciones radiográficas.'],['Tu perspectiva','La movilidad, actividad, sueño y dificultades percibidas ofrecen contexto.']],
 steps:[['01','Reservar','Una cita a distancia de 30 minutos, anunciada a 49 €.'],['02','Prepararse','Cuestionarios, espacio libre, cámara y consejos de seguridad.'],['03','Realizar los gestos','Movimientos sencillos cuando sea seguro y técnicamente posible.'],['04','Revisar','Explicación de las observaciones, límites y posibles siguientes pasos.']],
 nextTitle:'Un punto de partida y próximos pasos.',
 next:'Es útil repetir la evaluación unas semanas después. Según tus objetivos, puedes solicitar otra evaluación o una sesión instrumental en París o Cannes, según disponibilidad.',
 note:'Evaluación funcional no médica. Sin diagnóstico, prescripción, edad biológica ni puntuación de longevidad validada. Los resultados dependen de las pruebas completadas.',
 cta:'Descubrir Motion Online · 49 €',label:'KŌMØ · MOTION ONLINE'
}};
const style=`<style id="komo-online-explainer-style">
.komo-online-explainer{background:#faf8f2;color:#243127;padding:clamp(64px,8vw,112px) 0;border-top:1px solid #e3e4da}
.koe-shell{width:min(1110px,calc(100% - 42px));margin:auto}
.koe-label{font-size:10px;letter-spacing:.18em;font-weight:800;color:#829589;margin:0 0 22px}
.komo-online-explainer h2{font:400 clamp(37px,5vw,68px)/1.03 Georgia,serif;letter-spacing:-.052em;max-width:890px;margin:0}
.komo-online-explainer h2 em{color:#738776;font-weight:400}
.koe-intro{font-size:clamp(15px,1.5vw,18px);line-height:1.72;color:#58665b;max-width:830px;margin:28px 0 49px}
.komo-online-explainer h3{font:400 clamp(27px,3.4vw,41px)/1.14 Georgia,serif;letter-spacing:-.035em;margin:0 0 24px}
.koe-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px;margin-bottom:60px}
.koe-cell{border-top:1px solid #acb9ac;padding:19px 8px 5px 0}
.koe-cell strong{display:block;font:400 23px/1.15 Georgia,serif;letter-spacing:-.03em;margin:0 0 12px}
.koe-cell p{margin:0;color:#566259;font-size:13px;line-height:1.62}
.koe-steps{padding:25px 24px 18px;background:#e9ede6;border-radius:22px}
.koe-number{display:block;color:#809581;font:800 11px/1 ui-sans-serif,system-ui;margin-bottom:20px}
.koe-next{border-top:1px solid #bdcabe;padding-top:28px;display:grid;grid-template-columns:1.5fr 1fr;align-items:end;gap:40px}
.koe-next p{font-size:14px;line-height:1.72;color:#5c695e;max-width:720px;margin:0}
.koe-next a{justify-self:end;border-radius:99px;background:#203a29;color:#fff!important;padding:16px 24px;font:700 13px ui-sans-serif,system-ui;text-decoration:none}
.koe-note{font-size:11px;line-height:1.65;color:#737c73;max-width:910px;margin:25px 0 0}
@media(max-width:850px){.koe-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.koe-next{grid-template-columns:1fr}.koe-next a{justify-self:start}}
@media(max-width:530px){.koe-shell{width:calc(100% - 30px)}.koe-grid{gap:12px;margin-bottom:42px}.koe-cell strong{font-size:20px}.koe-cell p{font-size:12px}.koe-steps{padding:17px 14px 9px}}
</style>`;
function card(title,desc,number=''){return '<article class="koe-cell">'+(number?'<small class="koe-number">'+number+'</small>':'')+'<strong>'+title+'</strong><p>'+desc+'</p></article>';}
function render(c){return '<section class="komo-online-explainer" id="motion-online-explained" aria-labelledby="koe-title"><div class="koe-shell"><p class="koe-label">'+c.label+'</p><h2 id="koe-title">'+c.h+'</h2><p class="koe-intro">'+c.intro+'</p><h3>'+c.why+'</h3><div class="koe-grid">'+c.dimensions.map(x=>card(...x)).join('')+'</div><h3>'+c.how+'</h3><div class="koe-grid koe-steps">'+c.steps.map(x=>card(x[1],x[2],x[0])).join('')+'</div><div class="koe-next"><div><h3>'+c.nextTitle+'</h3><p>'+c.next+'</p></div><a href="#solutions">'+c.cta+'</a></div><p class="koe-note">'+c.note+'</p></div></section>';}
for (const [path,lang] of [['index.html','fr'],['fr/index.html','fr'],['en/index.html','en'],['es/index.html','es']]){
 const file=join(process.cwd(),'site',path);let html=await readFile(file,'utf8');
 if(html.includes('id="motion-online-explained"'))continue;
 const target='<section class="ko-services"';
 if(!html.includes(target))throw new Error('[online-explainer] expected offer cards missing: '+path);
 html=html.replace(target,render(copy[lang])+'\n'+target);
 html=html.replace('</head>',style+'\n</head>');
 await writeFile(file,html,'utf8');console.log('[online-explainer] PASS '+path);
}