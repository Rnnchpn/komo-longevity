const runtime=window.KomoWorldRuntime;
if(!runtime?.THREE||!runtime?.scene||!runtime?.player)throw new Error('KŌMØ V0.13.5 axis-clean runtime unavailable');

const {THREE,scene,player}=runtime;
const wp=new THREE.Vector3();

function capsuleCount(root){
  let count=0;
  root.traverse?.(o=>{if(o.geometry?.type==='CapsuleGeometry')count++});
  return count;
}

function isHumanoid(root){
  return !!root?.isGroup&&capsuleCount(root)>=5;
}

function shouldHide(root){
  if(root===player)return false;
  const name=(root.name||'').toUpperCase();
  if(name.includes('TWIN')||name.includes('FUNCTIONAL_BODY'))return false;
  root.getWorldPosition(wp);
  const inReception=Math.abs(wp.x+8.15)<4.5&&wp.z>-5.5&&wp.z<3.5;
  const inCentralArrival=Math.abs(wp.x)<6.0&&wp.z>-10&&wp.z<38;
  return inReception||inCentralArrival;
}

function enforce(){
  scene.updateMatrixWorld(true);
  let hidden=0;
  scene.traverse(root=>{
    if(!isHumanoid(root)||!root.visible||!shouldHide(root))return;
    root.visible=false;
    root.userData.komoReceptionAvatarRemoved=true;
    hidden++;
  });
  return hidden;
}

const hidden=enforce();

window.KomoV135AxisClean={
  version:'0.13.5-no-reception-avatar',
  hidden,
  enforce
};
