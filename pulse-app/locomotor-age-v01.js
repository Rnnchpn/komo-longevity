const VERSION='komo-locomotor-age-v0.2.0-retired';

/**
 * Motion Score v0.6 is sensor-only. The former locomotor-age prototype used
 * manual 4 m gait speed, 30 s Chair Stand and single-leg stance, which are no
 * longer part of KŌMØ Motion. Keep the public API stable but fail closed until
 * a future age model is validated from approved sensor-derived inputs.
 */
export function computeLocomotorAge(){
  return{
    version:VERSION,
    status:'not_calculable',
    age:null,
    ageBand:null,
    interval:null,
    deltaYears:null,
    confidence:0,
    confidenceLabel:'none',
    experimental:true,
    retired:true,
    reason:'L’âge locomoteur est temporairement retiré pendant la validation du nouveau modèle basé sur les mesures capteurs.',
    source:null
  };
}

export const LOCOMOTOR_AGE_VERSION=VERSION;
export const LOCOMOTOR_AGE_REFERENCE=null;
