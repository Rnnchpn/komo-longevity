import assert from 'node:assert/strict';
import {testStatus,completedTests,testNavigatorMarkup,completedTestMarkup,mountTestNavigation,TERMINAL_TEST_STATUSES} from '../pulse-v14-src/online/session/test-navigation.js';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
const read=p=>readFileSync(join(process.cwd(),p),'utf8');
const app=read('pulse-v14-src/online/session/app.js');
const movement=read('pulse-v14-src/online/session/motion-controller.js');
const posture=read('pulse-v14-src/online/session/profile-photo.js');
const unipodal=read('pulse-v14-src/online/session/unipodal-controller.js');
const report=read('pulse-v14-src/online/session/intake-report.js');
const tests=[
 {id:'sts',name:'Se relever de la chaise',unit:'répétitions'},
 {id:'heels',name:'Élévations sur les pointes',unit:'répétitions'},
 {id:'unipodal_left',name:'Équilibre unipodal gauche',unit:'secondes'},
 {id:'unipodal_right',name:'Équilibre unipodal droit',unit:'secondes'},
 {id:'arms',name:'Mobilité des bras',unit:'mouvements'},
 {id:'posture',name:'Photo de profil',unit:'%'}
];
const results={
 sts:{status:'done',value:14,source:'webcam'},
 heels:{status:'review',value:9,source:'corrigé manuellement'},
 unipodal_left:{status:'skipped',value:0}
};
assert.equal(tests.length,6);
assert.equal(completedTests(tests,results),3);
assert.equal(testStatus(results.sts).code,'done');
assert.equal(testStatus(results.heels).code,'review');
assert.equal(testStatus(results.unipodal_left).code,'skipped');
assert.equal(testStatus(null).code,'todo');
assert.equal(TERMINAL_TEST_STATUSES.has('pending'),false);
const html=testNavigatorMarkup(tests,results,2);
assert.equal((html.match(/data-motion-test=/g)||[]).length,6);
assert.ok(html.includes('3 / 6 enregistrés'));
assert.ok(html.includes('aria-current="step"'));
const summaryNav=testNavigatorMarkup(tests,results,null);
assert.equal((summaryNav.match(/data-motion-test=/g)||[]).length,6);
assert.ok(!summaryNav.includes('aria-current="step"'));
assert.ok(completedTestMarkup(tests[0],results.sts).includes('14 répétitions'));
assert.ok(completedTestMarkup(tests[2],results.unipodal_left).includes('Aucune mesure enregistrée'));
assert.ok(completedTestMarkup(tests[0],results.sts).includes('redo-stored-test'));
assert.ok(completedTestMarkup(tests[0],results.sts).includes('stop-review-camera'));
const injection=testNavigatorMarkup([{id:'test',name:'<img src=x onerror=alert(1)>',unit:'x'}],{},null);
assert.ok(!injection.includes('<img '),'test name must be HTML escaped');
const buttons=[0,1,2,3,4,5].map(i=>({dataset:{motionTest:String(i)}}));
const info={textContent:''};
const root={
 querySelector:()=>info,
 querySelectorAll:()=>buttons
};
const visited=[];
mountTestNavigation(root,tests,results,i=>{visited.push(i);return i===4?false:true;},2);
buttons[0].onclick();buttons[2].onclick();buttons[4].onclick();
assert.deepEqual(visited,[0,4],'current test must not cause a second navigation');
assert.ok(info.textContent.includes('Arrêtez le test'));
assert.ok(app.includes('state.task=index'),'app must navigate by stable test array index');
assert.ok(app.includes("delete state.results[t.id]"),'result must be cleared only after explicit retake');
assert.ok(app.includes('if(existing)'),'completed results must be read-only before retake');
assert.ok(app.includes('state.sessionActive||state.countdownActive'),'block jump during measurement');
assert.ok(app.includes('state.answers.safety!==\'no\''),'cannot bypass safety gate');
assert.ok(app.includes("blocked?'':testNavigatorMarkup"),'suspended patient cannot jump to tests from report');
assert.ok(app.includes('mountTestNavigation(root,TESTS,state.results,jumpToTest,null)'),'review available from final report');
assert.ok(movement.includes("record.status='review';state.results[task.id]=record"),'manual count corrections must be flagged for review');
assert.ok(unipodal.includes("record.status='skipped';record.value=0;record.source='non réalisé';state.results[task.id]=record"),'skipped unilateral tests must persist');
assert.ok(posture.includes('state.results[task.id]=record'),'photo results must be captured in session');
assert.ok(report.includes('downloadMotionPdf(payload)'),'existing PDF remains available');
console.log('[pulse-test-navigation-qa] six tests, revisits, retakes, safety and result persistence passed');
