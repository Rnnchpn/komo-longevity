import {TEST_GUIDES} from './test-guides.mjs';
// Presentation for a single guided Motion Online test.
const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function motionMarkup(task,index,total){
 const t=task;
 const guide=TEST_GUIDES[t.id];
 const guidance='<section class="test-guide" aria-label="Comprendre le test">'+
  '<div class="test-guide-heading"><div><span class="overline">COMMENT FONCTIONNE CE TEST ?</span><h2>Un mouvement simple, <em>expliqué étape par étape.</em></h2></div>'+
  '<div class="test-guide-buttons"><button class="guide-audio-btn" type="button" id="read-guidance">🔊 Écouter les consignes</button><button class="guide-audio-btn" type="button" id="distance-view" aria-pressed="false">⛶ Mode à distance</button></div></div>'+
  '<div class="guide-columns"><div class="guide-highlight"><strong>Objectif du test</strong><p>'+escapeText(guide.purpose)+'</p>'+
  '<strong>Comment se placer</strong><p>'+escapeText(guide.setup)+'</p></div>'+
  '<ol class="guide-steps">'+guide.steps.map((step,i)=>'<li><span>'+String(i+1).padStart(2,'0')+'</span><p>'+escapeText(step)+'</p></li>').join('')+'</ol></div>'+
  '<p class="guide-measure"><strong>Ce que la caméra mesure :</strong> '+escapeText(guide.measured)+'</p>'+
  '<p class="guide-audio-status" id="guide-audio-status" role="status"></p></section>';
 return '<section class="paper motion-workspace"><div class="motion-heading"><div><span class="overline">ÉTAPE 03 · CAPTURE '+(index+1)+' / '+total+'</span><h1>'+escapeText(t.name)+'<em>.</em></h1><p>'+escapeText(t.instruction)+'</p></div>'+
 '<span class="pose-tag">ANALYSE CORPORELLE · 33 POINTS</span></div>'+guidance+
 '<div class="test-grid live-capture-layout"><div class="camera pose-camera"><div class="camera-screen" id="camera-screen">'+
 '<video id="live-video" autoplay playsinline muted hidden></video><canvas id="pose-canvas" aria-hidden="true" hidden></canvas>'+
 '<div id="camera-off" class="camera-off"><span>◎</span><strong>Activez votre caméra</strong><small>Le squelette apparaîtra sur votre silhouette.</small></div>'+
 '<div class="camera-hud" id="camera-hud" hidden><span class="camera-hud-dot"></span><strong id="pose-quality">Recherche du corps…</strong><span>33 POINTS</span></div>'+
 '<div class="voice-hud" id="voice-hud" hidden>🎙 <span id="voice-hud-text">Micro activé</span></div>'+
 '<div class="countdown-cover" id="countdown-cover" hidden><span>PRÉPAREZ-VOUS</span><strong id="countdown-value">3</strong><small>Le test démarre à TOP !</small></div>'+
 '<div class="camera-live-score" id="camera-live-score" hidden><b id="camera-reps">0</b><span id="camera-live-label">'+(t.id==='balance'?'secondes visibles':t.id==='posture'?'images analysées':'répétitions')+'</span></div>'+
 '</div><div class="pose-consent"><label><input type="checkbox" id="pose-consent"><span>J’accepte l’analyse locale de ma silhouette pour ce test et le chargement du moteur MediaPipe, susceptible de transmettre des statistiques techniques à Google. Aucune vidéo n’est envoyée ni sauvegardée.</span></label></div>'+
 '<div class="voice-setup"><label class="voice-optin"><input type="checkbox" id="voice-consent"><span>J’autorise le microphone pour commander le test à distance. La reconnaissance vocale dépend de mon navigateur et peut transmettre ma voix à son fournisseur ; KŌMØ ne conserve aucun audio ni transcription.</span></label>'+ 
 '<div class="voice-controls"><button type="button" id="toggle-voice" disabled>🎙 Activer les commandes vocales</button><span id="voice-state" role="status">Microphone désactivé</span></div>'+ 
 '<p class="voice-phrases">Dites : <strong>« C’est parti »</strong> pour lancer · <strong>« Stop »</strong> pour arrêter · <strong>« Recommencer »</strong> pour refaire le test.</p>'+ 
 '<label class="sound-optin"><input id="sound-enabled" type="checkbox" checked><span>🔊 Haut-parleur : départ 3, 2, 1, Top ! · temps restant · clic à chaque répétition validée</span></label></div>'+ 
 '<div class="camera-actions"><button type="button" id="start-camera" disabled>Activer ma webcam</button><button type="button" id="stop-camera" disabled>Éteindre la caméra</button></div>'+
 '<p class="subtle" id="camera-message" role="status">Placez-vous suffisamment loin pour montrer le corps entier, caméra fixe et stable.</p></div>'+
 '<div class="test-controller live-controller"><div class="test-stat"><span class="overline">TEMPS RESTANT</span><strong class="time" id="time">'+t.seconds+'</strong><small>secondes</small></div>'+
 '<div class="test-stat"><span class="overline">'+(t.id==='balance'?'TEMPS VISIBLE':t.id==='posture'?'IMAGES POSTURALES VALIDES':'RÉPÉTITIONS DÉTECTÉES')+'</span><strong class="live-value" id="value">0</strong><small>automatique · exploratoire</small></div>'+
 '<div class="test-start"><button class="action go-live" type="button" id="start-test" disabled>C’est parti →</button><button class="action secondary" type="button" id="halt-test" hidden>Arrêter le test</button><button class="action secondary" type="button" id="redo-test" hidden>Recommencer</button>'+
 '<small id="motion-status" role="status">Activez la caméra et placez-vous entièrement dans le cadre.</small></div></div></div>'+
 '<div class="posture-results" id="posture-results" hidden><strong>Observation posturale frontale · prototype</strong><div class="posture-data" id="posture-data"></div><p>Valeurs en projection 2D, sensibles à l’inclinaison et à la perspective de la caméra. Aucune conclusion médicale ne peut en être tirée.</p></div>'+ 
 '<div class="motion-disclaimer"><strong>Prototype de mesure non validé médicalement.</strong> La webcam estime les articulations et les cycles de mouvement ; les valeurs peuvent être erronées si le cadrage ou l’éclairage sont insuffisants. Aucun diagnostic n’est réalisé. Aucune vidéo n’est enregistrée.</div>'+
 (t.id==='posture'?'':'<div class="manual-review"><span>Corriger le résultat si nécessaire</span><div><button type="button" id="minus" aria-label="Diminuer la valeur">−</button><strong id="manual-value">0</strong><button type="button" id="plus" aria-label="Augmenter la valeur">+</button></div></div>')+
 '<div class="actions"><button class="action secondary" type="button" id="back">← Retour</button><button class="action secondary" type="button" id="skip">Ne pas faire ce test</button>'+
 '<button class="action" type="button" id="go">'+(index===total-1?'Voir ma synthèse →':'Test suivant →')+'</button></div><p id="message" class="message" role="status"></p></section>';
}
