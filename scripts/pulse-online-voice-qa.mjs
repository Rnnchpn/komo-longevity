import assert from 'node:assert/strict';
import {parseVoiceCommand,normalizeSpeech} from '../pulse-v14-src/online/session/voice-commands.mjs';
import {createVoiceControl} from '../pulse-v14-src/online/session/voice-control.js';

const expected=[
 ["C'est parti",'start'],["c’est parti !",'start'],["Komo, c'est parti",'start'],
 ["Démarre le test",'start'],["Commence le test",'start'],
 ["Stop",'stop'],["arrête le test",'stop'],["Pause",'stop'],
 ["Recommencer",'redo'],["KOMO, recommence",'redo'],
 ["test suivant",'next'],["suivant",'next'],
 ["J'ai dit c'est parti mais attendons",null],["c'est un parti",null],
 ["arrête mon téléphone",null],["on va peut-être recommencer",null],
 ["Il reste trente secondes",null],["commence à marcher",null],["stoppé",null],
 ["",null]
];
for(const [text,value] of expected)assert.equal(parseVoiceCommand(text),value,'parser: '+text);
assert.equal(normalizeSpeech('  ARRÊTE ! '),'arrete');
const originalWindow=globalThis.window,originalDocument=globalThis.document;
const commands=[],statuses=[];
class FakeRecognizer{
 constructor(){FakeRecognizer.latest=this;this.started=false;}
 start(){this.started=true;}
 abort(){this.started=false;}
 deliver(text){
   const r={isFinal:true,0:{transcript:text}};
   this.onresult?.({resultIndex:0,results:[r]});
 }
}
globalThis.window={SpeechRecognition:FakeRecognizer};
globalThis.document={hidden:false};
try{
 const control=createVoiceControl({onCommand:command=>commands.push(command),onStatus:(text,state)=>statuses.push(state)});
 assert.equal(control.supported,true);
 assert.equal(control.enable(),true);
 const recognizer=FakeRecognizer.latest;
 recognizer.deliver('Je suis prêt');
 assert.deepEqual(commands,[]);
 recognizer.deliver("C'est parti");
 assert.deepEqual(commands,['start']);
 assert.equal(control.isEnabled(),true);
 control.disable();
 assert.equal(control.isEnabled(),false);
 assert.equal(recognizer.onresult,null);
 assert.ok(statuses.includes('off'));

 const denied=createVoiceControl({onCommand:()=>{},onStatus:(text,state)=>statuses.push(state)});
 denied.enable();
 FakeRecognizer.latest.onerror?.({error:'not-allowed'});
 assert.equal(denied.isEnabled(),false);
 assert.ok(statuses.includes('error'));
 denied.destroy();
 control.destroy();
}finally{
 globalThis.window=originalWindow;globalThis.document=originalDocument;
}
console.log('[pulse-online-voice-qa] '+expected.length+' phrase checks, opt-in, abort & permission error passed');
