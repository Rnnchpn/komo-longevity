// KŌMØ Motion Online V1 — Préflight only.
// No health data, identity, image, metrics or checklist values leave this page.
// This page does not infer whether an Acuity booking or Pulse account exists.
'use strict';

const checks = [...document.querySelectorAll('[data-preflight-check]')];
const cameraStart = document.getElementById('camera-start');
const cameraStop = document.getElementById('camera-stop');
const cameraPreview = document.getElementById('camera-preview');
const cameraPlaceholder = document.getElementById('camera-placeholder');
const cameraStatus = document.getElementById('camera-status');
const cameraLabel = document.getElementById('camera-label');
const outcomeMessage = document.getElementById('outcome-message');
const outcomeStatus = document.getElementById('outcome-status');
const outcomeDetail = document.getElementById('outcome-detail');
const outcomeSeal = document.getElementById('outcome-seal');
const progress = document.getElementById('readiness-progress');
const progressFill = document.getElementById('readiness-fill');
const progressCounter = document.getElementById('readiness-counter');

let stream = null;
let cameraVerified = false;
let opening = false;
let requestSequence = 0;
let released = false;

function renderReadiness() {
  const completed = checks.reduce((sum, check) => sum + Number(check.checked), 0);
  const total = completed + Number(cameraVerified);
  const ready = total === 5;
  progress.setAttribute('aria-valuenow', String(total));
  progressFill.style.width = (total * 20) + '%';
  progressCounter.textContent = total + ' / 5 vérifications';
  outcomeStatus.textContent = ready ? 'Préparation technique terminée' : 'Préparation en cours';
  outcomeMessage.textContent = ready
    ? 'Votre environnement et votre caméra ont été vérifiés sur cet appareil. Aucun test physique n’a encore été réalisé. Le jour du rendez-vous, l’opérateur vérifiera avec vous que les exercices peuvent être effectués en sécurité.'
    : 'Cochez les quatre points de préparation et vérifiez la caméra. Cette page ne confirme pas de réservation et ne réalise aucun bilan de santé.';
  outcomeDetail.textContent = ready
    ? 'Pensez à éteindre la caméra avant la visioconférence.'
    : 'Les tests physiques seront guidés par votre opérateur.';
  outcomeSeal.textContent = ready ? '✓' : '◇';
  document.querySelector('.outcome').classList.toggle('is-ready', ready);
}

function setCameraMessage(message, type = '') {
  cameraStatus.textContent = message;
  cameraStatus.classList.toggle('is-error', type === 'error');
  cameraStatus.classList.toggle('is-good', type === 'good');
}

function stopCamera(message = 'Caméra éteinte. Vous pouvez la relancer pour refaire le test.') {
  requestSequence++;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  cameraPreview.pause();
  cameraPreview.srcObject = null;
  cameraPreview.hidden = true;
  cameraPlaceholder.hidden = false;
  cameraLabel.hidden = true;
  cameraStop.disabled = true;
  cameraStart.disabled = false;
  cameraStart.textContent = 'Tester ma caméra ↗';
  opening = false;
  if (!released) setCameraMessage(message, cameraVerified ? 'good' : '');
  renderReadiness();
}

async function startCamera() {
  if (opening || stream || released) return;
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    setCameraMessage('Caméra indisponible dans ce navigateur. Ouvrez la page en HTTPS avec Chrome, Safari ou Firefox à jour.', 'error');
    return;
  }
  opening = true;
  const thisRequest = ++requestSequence;
  cameraStart.disabled = true;
  cameraStart.textContent = 'Autorisation en cours…';
  setCameraMessage('Votre navigateur va vous demander la permission d’utiliser la caméra. Le micro reste désactivé.');
  let acquired = null;
  try {
    acquired = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 15, max: 24 }
      }
    });
    // If the user navigated away or stopped during the permission prompt, discard it.
    if (thisRequest !== requestSequence || released || document.hidden) {
      acquired.getTracks().forEach(t => t.stop());
      return;
    }
    stream = acquired;
    cameraPreview.srcObject = stream;
    cameraPlaceholder.hidden = true;
    cameraPreview.hidden = false;
    cameraLabel.hidden = false;
    cameraStop.disabled = false;
    cameraStart.disabled = true;
    cameraStart.textContent = 'Caméra en cours d’utilisation';
    await cameraPreview.play();
    if (thisRequest !== requestSequence || released || document.hidden) {
      stopCamera();
      return;
    }
    // This confirms only device access, not reliable whole-body landmark detection.
    if (!cameraPreview.videoWidth || !cameraPreview.videoHeight) {
      throw new Error('CameraPreviewEmpty');
    }
    cameraVerified = true;
    setCameraMessage('Caméra active : vérifiez votre cadrage, puis éteignez-la. Aucun flux vidéo n’est envoyé à KŌMØ.', 'good');
    renderReadiness();
  } catch (error) {
    if (thisRequest !== requestSequence || released) return;
    stopCamera();
    if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
      setCameraMessage('Accès refusé. Autorisez la caméra depuis les paramètres du navigateur, puis réessayez.', 'error');
    } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
      setCameraMessage('Aucune caméra détectée. Branchez-en une ou utilisez un autre appareil.', 'error');
    } else if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
      setCameraMessage('La caméra est utilisée par une autre application. Fermez Zoom ou Meet et réessayez.', 'error');
    } else {
      setCameraMessage('Impossible d’ouvrir la caméra. Réessayez avec un navigateur à jour ; vous pouvez aussi prévenir votre opérateur.', 'error');
    }
  } finally {
    if (thisRequest === requestSequence) opening = false;
  }
}

checks.forEach(check => check.addEventListener('change', renderReadiness));
cameraStart.addEventListener('click', startCamera);
cameraStop.addEventListener('click', () => stopCamera());
document.addEventListener('visibilitychange', () => {
  if (document.hidden && (stream || opening)) stopCamera('Caméra automatiquement éteinte lorsque vous quittez l’onglet.');
});
window.addEventListener('pagehide', () => {
  released = true;
  stopCamera();
});
renderReadiness();
