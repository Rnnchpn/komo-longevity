const runtime=window.KomoWorldRuntime;
if(!runtime?.THREE||!runtime?.scene)throw new Error('KŌMØ V0.13.4 door runtime unavailable');
const {THREE,scene}=runtime;

const stone=new THREE.MeshStandardMaterial({color:0xe8dece,roughness:.78,metalness:.01});
const sage=new THREE.MeshStandardMaterial({color:0x263b31,roughness:.55,metalness:.03});
const sageDark=new THREE.MeshStandardMaterial({color:0x17271f,roughness:.48,metalness:.05});
const bronze=new THREE.MeshStandardMaterial({color:0xa37a4f,roughness:.34,metalness:.58});
const glass=new THREE.MeshPhysicalMaterial({color:0x50675b,roughness:.18,metalness:0,transparent:true,opacity:.38,transmission:.07,depthWrite:false});
const warm=new THREE.MeshStandardMaterial({color:0xffd6a0,emissive:0xffbd74,emissiveIntensity:2.1,roughness:.28});

function box(g,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
function textTexture(title,subtitle){
  const c=document.createElement('canvas');c.width=1200;c.height=420;const x=c.getContext('2d');
  x.clearRect(0,0,c.width,c.height);
  x.fillStyle='rgba(21,34,28,.96)';x.fillRect(0,0,c.width,c.height);
  x.strokeStyle='rgba(214,181,128,.55)';x.lineWidth=5;x.strokeRect(7,7,c.width-14,c.height-14);
  x.textAlign='center';x.textBaseline='middle';
  x.fillStyle='#f2eadf';x.font='600 120px Georgia';x.fillText(title,c.width/2,170);
  x.fillStyle='#d5b783';x.font='600 34px Arial';x.fillText(subtitle.toUpperCase(),c.width/2,305);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function sign(g,title,subtitle,y,w=6.4){
  const m=new THREE.MeshBasicMaterial({map:textTexture(title,subtitle),side:THREE.DoubleSide});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(w,2.0),m);p.position.set(0,y,.73);g.add(p);return p
}

const doors={};
function buildDoor({id,x,z,rot=0,width=6.4,height=5.1,title,subtitle,variant='sage'}){
  const g=new THREE.Group();g.name=`KOMO_V134_${id.toUpperCase()}_DOOR`;g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);
  const main=variant==='light'?stone:(variant==='arena'?sageDark:sage);
  // Real architectural surround.
  box(g,.62,height+1.05,.78,stone,-width/2-.31,(height+1.05)/2,0);
  box(g,.62,height+1.05,.78,stone,width/2+.31,(height+1.05)/2,0);
  box(g,width+.62,.62,.78,stone,0,height+.72,0);
  box(g,width+.88,.12,.88,bronze,0,.18,0);
  box(g,.07,height+.2,.10,warm,-width/2-.01,height/2+.18,.46);
  box(g,.07,height+.2,.10,warm,width/2+.01,height/2+.18,.46);
  // Two substantial closed leaves.
  const leafW=width/2-.06;
  const left=box(g,leafW,height,.46,main,-leafW/2-.03,height/2+.22,.43);
  const right=box(g,leafW,height,.46,main,leafW/2+.03,height/2+.22,.43);
  // Inset smoked panels and bronze handles.
  const insetMat=variant==='light'?glass:glass;
  box(left,leafW*.64,height*.55,.08,insetMat,0,.25,.27);
  box(right,leafW*.64,height*.55,.08,insetMat,0,.25,.27);
  box(left,.08,.72,.12,bronze,leafW*.36,-.05,.31);
  box(right,.08,.72,.12,bronze,-leafW*.36,-.05,.31);
  sign(g,title,subtitle,height+1.95,Math.max(6.1,width+.4));
  const light=new THREE.PointLight(0xffc98d,variant==='arena'?7:4.5,11,2);light.position.set(0,height*.70,2.1);g.add(light);
  const d={id,g,left,right,width,height,rot,x,z,open:false,busy:false,closedLeft:left.position.x,closedRight:right.position.x,travel:leafW*.82};
  doors[id]=d;return d
}

buildDoor({id:'twin',x:-11,z:-24.08,width:6.7,height:5.0,title:'TWIN LAB',subtitle:'Votre jumeau fonctionnel',variant:'sage'});
buildDoor({id:'rehab',x:0,z:-24.08,width:6.3,height:5.0,title:'REHAB',subtitle:'Programme fonctionnel',variant:'light'});
buildDoor({id:'arena',x:12.5,z:-14.62,rot:-.14,width:7.2,height:5.35,title:'ARENA',subtitle:'Défis · clubs · saison 01',variant:'arena'});

function easeOut(t){return 1-Math.pow(1-t,3)}
function animateDoor(d,toOpen,duration=430){
  const fromL=d.left.position.x,fromR=d.right.position.x;
  const targetL=toOpen?d.closedLeft-d.travel:d.closedLeft;
  const targetR=toOpen?d.closedRight+d.travel:d.closedRight;
  const start=performance.now();
  return new Promise(resolve=>{
    const tick=now=>{
      const p=Math.min(1,(now-start)/duration),e=easeOut(p);
      d.left.position.x=THREE.MathUtils.lerp(fromL,targetL,e);
      d.right.position.x=THREE.MathUtils.lerp(fromR,targetR,e);
      if(p<1)requestAnimationFrame(tick);else{d.open=toOpen;resolve()}
    };requestAnimationFrame(tick)
  })
}
async function openAndEnter(id,enter){
  const d=doors[id];if(!d||d.busy)return;
  d.busy=true;
  if(!d.open)await animateDoor(d,true,430);
  setTimeout(()=>{try{enter?.()}catch(e){console.error('[V0.13.4] destination callback failed',e)}},80);
  setTimeout(async()=>{await animateDoor(d,false,360);d.busy=false},id==='rehab'?2100:900);
}

// Approximate collision in world coordinates while doors are shut.
function blocked(p,mode){
  if(mode!=='world')return false;
  for(const d of Object.values(doors)){
    if(d.open||d.busy&&d.open)continue;
    const dx=p.x-d.x,dz=p.z-d.z;
    const c=Math.cos(-d.rot),s=Math.sin(-d.rot);
    const lx=dx*c-dz*s,lz=dx*s+dz*c;
    if(Math.abs(lx)<d.width/2+.42&&Math.abs(lz)<.62)return true;
  }
  return false;
}

// Keep old prototype-like destination groups hidden if any late material pass revives them.
function suppressLegacy(){
  for(const o of scene.children){
    if(!o?.isGroup)continue;
    const n=o.name||'';
    if(n.startsWith('KOMO_V134_'))continue;
    const near=(x,z,r)=>Math.hypot(o.position.x-x,o.position.z-z)<r;
    if(near(-11,-24.45,.55)||near(0,-24.45,.55)||near(12.5,-14.8,.55)){
      if(!n.startsWith('KOMO_V131_'))o.visible=false;
    }
  }
}
suppressLegacy();setTimeout(suppressLegacy,800);

window.KomoV134Doors={version:'0.13.4',doors,openAndEnter,blocked,axisClear:true};
