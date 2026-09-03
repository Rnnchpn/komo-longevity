/*
 * KŌMØ Motion · retired manual-input surface.
 *
 * Since Motion Score v0.6, GLFS-25 belongs to the questionnaire / pre-bilan
 * only and manual Two-Step, Chair Stand, 4 m gait speed, single-leg stance and
 * Stand-Up values are not Motion inputs. This module intentionally renders no
 * form. It remains as a compatibility stub because older dossier builds may
 * still import it.
 */
function cleanup(){
  document.querySelector('#manualMotionInput')?.remove();
  document.querySelectorAll('[data-legacy-motion-manual]').forEach(el=>el.remove());
}

document.addEventListener('DOMContentLoaded',cleanup);
window.addEventListener('pageshow',cleanup);
window.addEventListener('komo:canonical-result-invalidated',cleanup);
setTimeout(cleanup,700);

window.KomoManualMotionInput={version:'retired-v2',retired:true,refresh:cleanup};
