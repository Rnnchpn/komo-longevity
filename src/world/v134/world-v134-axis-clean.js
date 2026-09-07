const runtime=window.KomoWorldRuntime;
if(!runtime?.THREE||!runtime?.scene)throw new Error('KŌMØ V0.13.4 axis-clean runtime unavailable');
const {THREE,scene,player}=runtime;

const wp=new THREE.Vector3();
function capsuleCount(root){let n=0;root.traverse?.(o=>{if(o.geometry?.type==='CapsuleGeometry')n++});return n}
function isHumanoid(root){return !!root?.isGroup&&capsuleCount(root)>=5}
function inCentralHall(root){root.getWorldPosition(wp);return Math.abs(wp.x)<4.5&&wp.z>-28&&wp.z<10}
function nearSideConcierge(root){root.getWorldPosition(wp);return Math.abs(wp.x+8.15)<2.2&&Math.abs(wp.z+1.2)<2.2}

function clearCentralHumanoids(){
  scene.updateMatrixWorld(true);
  const victims=[];
  scene.traverse(o=>{
    if(o===player||!isHumanoid(o))return;
    const name=o.name||'';
    if(name.includes('FUNCTIONAL_BODY')||name.includes('TWIN'))return;
    if(inCentralHall(o))victims.push(o);
  });
  victims.forEach(o=>{o.visible=false;o.userData.komoAxisRemoved=true;o.name=o.name||'KOMO_LEGACY_HUMANOID_REMOVED'});

  // Remove the specific legacy Concierge label if it survived independently.
  scene.traverse(o=>{
    if(!o.isSprite)return;
    o.getWorldPosition(wp);
    if(Math.abs(wp.x)<1.2&&Math.abs(wp.z+4.7)<1.5&&wp.y>3.5&&wp.y<6.2)o.visible=false;
  });
  return victims.length;
}

function ensureSideConcierge(){
  scene.updateMatrixWorld(true);
  let existing=null;
  scene.traverse(o=>{if(!existing&&o!==player&&isHumanoid(o)&&nearSideConcierge(o)&&o.visible)existing=o});
  if(existing)return existing;

  const body=new THREE.MeshStandardMaterial({color:0x6f806f,roughness:.72,metalness:.02});
  const skin=new THREE.MeshStandardMaterial({color:0xbc8869,roughness:.72,metalness:0});
  const g=new THREE.Group();g.name='KOMO_V134_CONCIERGE_SIDE';g.position.set(-8.15,0,-1.2);g.rotation.y=.22;
  const capsule=(r,l,m,x,y,z)=>{const q=new THREE.Mesh(new THREE.CapsuleGeometry(r,l,6,10),m);q.position.set(x,y,z);g.add(q);return q};
  capsule(.42,.58,body,0,2.05,0);capsule(.54,1.00,body,0,3.08,0);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.42,18,14),skin);head.position.set(0,4.42,0);g.add(head);
  capsule(.14,.70,skin,-.68,3.08,0);capsule(.14,.70,skin,.68,3.08,0);
  capsule(.20,.76,body,-.28,1.18,0);capsule(.16,.72,body,-.28,.38,0);
  capsule(.20,.76,body,.28,1.18,0);capsule(.16,.72,body,.28,.38,0);
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  scene.add(g);
  return g;
}

function enforce(){clearCentralHumanoids();ensureSideConcierge()}
enforce();
[100,300,700,1300,2200,4000,7000].forEach(ms=>setTimeout(enforce,ms));
window.KomoV134AxisClean={version:'0.13.4-axis-clean',enforce};
