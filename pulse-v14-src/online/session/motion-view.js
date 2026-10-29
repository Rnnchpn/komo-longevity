// Presentation for a single guided Motion Online test.
const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function motionMarkup(task,index,total){
 const t=task;
 return '<section class="paper motion-workspace"><div class="motion-heading"><div><span class="overline">ÉTAPE 03 · CAPTURE '+(index+1)+' / '+total+'</span><h1>'+escapeText(t.name)+'<em>.</em></h1><p>'+escapeText(t.instruction)+'</p></div>'+
 '<span class="pose-tag">ANALYSE CORPORELLE · 33 POINTS</span></div>'+
 '<div class="test-grid live-capture-layout"><div class="camera pose-camera"><div class="camera-screen" id="camera-screen">'+
 '<video id="live-video" autoplay playsinline muted hidden></video><canvas id="pose-canvas" aria-hidden="true" hidden></canvas>'+
 '<div id="camera-off" class="camera-off"><span>◎</span><strong>Activez votre caméra</strong><small>Le squelette apparaîtra sur votre silhouette.</small></div>'+
 '<div class="camera-hud" id="camera-hud" hidden><span class="camera-hud-dot"></span><strong id="pose-quality">Recherche du corps…</strong><span>33 POINTS</span></div>'+
 '<div class="camera-live-score" id="camera-live-score" hidden><b id="camera-reps">0</b><span id="camera-live-label">'+(t.id==='balance'?'secondes visibles':'répétitions')+'</span></div>'+
 '</div><div class="camera-actions"><button type="button" id="start-camera">Activer ma webcam</button><button type="button" id="stop-camera" disabled>Éteindre la caméra</button></div>'+
 '<p class="subtle" id="camera-message" role="status">Placez-vous suffisamment loin pour montrer le corps entier, caméra fixe et stable.</p></div>'+
 '<div class="test-controller live-controller"><div class="test-stat"><span class="overline">TEMPS RESTANT</span><strong class="time" id="time">'+t.seconds+'</strong><small>secondes</small></div>'+
 '<div class="test-stat"><span class="overline">'+(t.id==='balance'?'TEMPS VISIBLE':'RÉPÉTITIONS DÉTECTÉES')+'</span><strong class="live-value" id="value">0</strong><small>automatique · exploratoire</small></div>'+
 '<div class="test-start"><button class="action go-live" type="button" id="start-test" disabled>C’est parti →</button><button class="action secondary" type="button" id="redo-test" hidden>Recommencer</button>'+
 '<small id="motion-status" role="status">Activez la caméra et placez-vous entièrement dans le cadre.</small></div></div></div>'+
 '<div class="motion-disclaimer"><strong>Prototype de mesure non validé médicalement.</strong> La webcam estime les articulations et les cycles de mouvement ; les valeurs peuvent être erronées si le cadrage ou l’éclairage sont insuffisants. Aucun diagnostic n’est réalisé. Aucune vidéo n’est enregistrée.</div>'+
 '<div class="manual-review"><span>Corriger le résultat si nécessaire</span><div><button type="button" id="minus" aria-label="Diminuer la valeur">−</button><strong id="manual-value">0</strong><button type="button" id="plus" aria-label="Augmenter la valeur">+</button></div></div>'+
 '<div class="actions"><button class="action secondary" type="button" id="back">← Retour</button><button class="action secondary" type="button" id="skip">Ne pas faire ce test</button>'+
 '<button class="action" type="button" id="go">'+(index===total-1?'Voir ma synthèse →':'Test suivant →')+'</button></div><p id="message" class="message" role="status"></p></section>';
}
