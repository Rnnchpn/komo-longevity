// Strict French voice command parser.
// Only final transcripts; never interpret arbitrary speech as a command.
export function normalizeSpeech(input=''){
 return String(input).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[’']/g,' ').replace(/[^a-z0-9 ]/g,' ')
   .replace(/\s+/g,' ').trim();
}
export function parseVoiceCommand(input){
 const phrase=normalizeSpeech(input).replace(/^(?:komo|k o m o|ok komo) /,'');
 if(['c est parti','allez c est parti','demarre le test','demarrer le test','commence le test','commencer le test'].includes(phrase))return 'start';
 if(['stop','stop le test','arrete','arrete le test','arreter le test','pause le test','pause'].includes(phrase))return 'stop';
 if(['recommence','recommencer','recommence le test','recommencer le test','on recommence'].includes(phrase))return 'redo';
 if(['suivant','test suivant','passer au test suivant'].includes(phrase))return 'next';
 return null;
}
