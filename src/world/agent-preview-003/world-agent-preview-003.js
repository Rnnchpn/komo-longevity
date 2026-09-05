import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const runtime=window.KomoWorldRuntime;
if(!runtime?.scene||!runtime?.player) throw new Error('KŌMØ Agent Preview 003 runtime unavailable');
const {scene}=runtime;

const STONE=new THREE.MeshStandardMaterial({color:0xe7dcc8,roughness:.58,metalness:.01});
const STONE_DEEP=new THREE.MeshStandardMaterial({color:0xc8b99f,roughness:.68,metalness:.01});
const SAGE=new THREE.MeshStandardMaterial({color:0x1f332a,roughness:.5,metalness:.05});
const SAGE_SOFT=new THREE.MeshStandardMaterial({color:0x6f8373,roughness:.56,metalness:.04});
const BRONZE=new THREE.MeshStandardMaterial({color:0xa47f55,roughness:.34,metalness:.48});
const WARM=new THREE.MeshStandardMaterial({color:0xffddb0,emissive:0xffbf70,emissiveIntensity:2.2,roughness:.28});
const GLASS=new THREE.MeshPhysicalMaterial({color:0xaec0b4,roughness:.14,transparent:true,opacity:.15,transmission:.28,depthWrite:false});
const DARK_GLASS=new THREE.MeshPhysicalMaterial({color:0x24372e,roughness:.18,transparent:true,opacity:.34,transmission:.18,depthWrite:false});

function addBox(group,w,h,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m}
function addText(group,text,{x=0,y=0,z=0,w=4,h=.52,font=24,bg='rgba(24,37,31,.9)',fg='#f3ecdf'}={}){
  const c=document.createElement('canvas');c.width=900;c.height=180;const ctx=c.getContext('2d');
  ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(18,18,864,144,30);ctx.fill();
  ctx.strokeStyle='rgba(229,203,157,.24)';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=fg;ctx.font=`600 ${font}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,450,90);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:false}));s.scale.set(w,h,1);s.position.set(x,y,z);group.add(s);return s;
}
function groupAt(x,z,t=.18){return scene.children.find(o=>o.isGroup&&Math.abs(o.position.x-x)<t&&Math.abs(o.position.z-z)<t)||null}

// Hall-side Twin threshold: deeper, clearer and more architectural.
const oldPortal=groupAt(-11,-24.45);
if(oldPortal){
  const g=new THREE.Group();g.name='KOMO_AGENT003_TWIN_THRESHOLD';g.position.set(-11,0,-24.45);scene.add(g);
  addBox(g,8.8,.22,3.6,STONE,0,.14,1.15);
  addBox(g,.52,7.6,.9,SAGE,-3.95,3.8,0);
  addBox(g,.52,7.6,.9,SAGE,3.95,3.8,0);
  addBox(g,8.4,.52,.9,SAGE,0,7.35,0);
  addBox(g,.065,6.5,.10,WARM,-3.64,3.8,.52);
  addBox(g,.065,6.5,.10,WARM,3.64,3.8,.52);
  addBox(g,7.4,.065,.10,WARM,0,7.02,.52);
  addBox(g,6.9,5.7,.08,DARK_GLASS,0,3.65,.46);
  addText(g,'TWIN LAB',{x:0,y:7.9,z:.65,w:3.7,h:.58,font:27,bg:'rgba(23,35,29,.94)'});
  addText(g,'YOUR BODY · ACROSS TIME',{x:0,y:6.42,z:.66,w:4.1,h:.42,font:17,bg:'rgba(23,35,29,.75)',fg:'#dec69f'});
  const ring=new THREE.Mesh(new THREE.RingGeometry(1.8,1.92,96),new THREE.MeshBasicMaterial({color:0xe0c390,transparent:true,opacity:.48,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(0,.27,1.12);g.add(ring);
  const light=new THREE.PointLight(0xffce91,8,18,2);light.position.set(0,5.8,2.4);g.add(light);
}

// Twin Lab interior enhancement. Existing Twin remains the truth-bearing object.
const lab=groupAt(-42,-3);
if(lab){
  const g=new THREE.Group();g.name='KOMO_AGENT003_TWIN_INTERIOR';lab.add(g);

  // Entry runway from player spawn toward the Functional Twin.
  addBox(g,5.8,.06,7.2,STONE,0,.07,-5.15);
  addBox(g,.05,.075,7.0,BRONZE,-2.86,.105,-5.15);
  addBox(g,.05,.075,7.0,BRONZE,2.86,.105,-5.15);
  [-7.7,-5.7,-3.7].forEach(z=>{
    addBox(g,7.0,.10,.14,BRONZE,0,6.85,z);
    addBox(g,.12,6.4,.14,BRONZE,-3.45,3.4,z);
    addBox(g,.12,6.4,.14,BRONZE,3.45,3.4,z);
  });

  // Central podium and concentric architecture around the Functional Twin.
  const podium=new THREE.Mesh(new THREE.CylinderGeometry(3.35,3.55,.34,96),STONE_DEEP);podium.position.set(0,.17,0);podium.receiveShadow=true;g.add(podium);
  const ring1=new THREE.Mesh(new THREE.TorusGeometry(3.15,.08,12,96),BRONZE);ring1.rotation.x=Math.PI/2;ring1.position.y=.34;g.add(ring1);
  const ring2=new THREE.Mesh(new THREE.TorusGeometry(4.6,.055,12,96),new THREE.MeshBasicMaterial({color:0x9fb6a4,transparent:true,opacity:.42}));ring2.rotation.x=Math.PI/2;ring2.position.y=.25;g.add(ring2);

  // Layered ceiling rings create a strong focal axis without post-processing.
  [2.1,2.65,3.2].forEach((r,i)=>{const tor=new THREE.Mesh(new THREE.TorusGeometry(r,.055,10,96),i===1?WARM:BRONZE);tor.rotation.x=Math.PI/2;tor.position.set(0,6.7+i*.52,0);g.add(tor)});

  // Side data fins. Text describes provenance only — never patient values.
  const leftX=-6.2,rightX=6.2;
  [leftX,rightX].forEach(x=>{
    addBox(g,2.8,6.3,.22,SAGE,x,3.3,.4);
    addBox(g,.06,5.7,.05,WARM,x>0?x-1.43:x+1.43,3.3,.55);
  });
  const left=['MYODEV','TESTS FONCTIONNELS','MARCHE','FORCE','POSTURE'];
  const right=['WEARABLES','SOMMEIL','ACTIVITÉ','REHAB','MOTION SCORE'];
  left.forEach((t,i)=>addText(g,t,{x:leftX,y:5.5-i*.9,z:.62,w:2.05,h:.3,font:14,bg:'rgba(18,30,24,.78)'}));
  right.forEach((t,i)=>addText(g,t,{x:rightX,y:5.5-i*.9,z:.62,w:2.05,h:.3,font:14,bg:'rgba(18,30,24,.78)'}));

  // Rear halo and translucent wall push the visual depth behind the body.
  addBox(g,13.8,7.2,.10,GLASS,0,3.7,5.7);
  const rear=new THREE.Mesh(new THREE.TorusGeometry(3.6,.10,16,112),BRONZE);rear.position.set(0,3.8,5.45);g.add(rear);
  const rearInner=new THREE.Mesh(new THREE.TorusGeometry(3.08,.04,12,112),WARM);rearInner.position.set(0,3.8,5.38);g.add(rearInner);
  addText(g,'FUNCTIONAL DIGITAL TWIN',{x:0,y:7.85,z:5.3,w:4.9,h:.56,font:22,bg:'rgba(20,32,26,.88)'});
  addText(g,'THE TWIN IS THE TRUTH LAYER',{x:0,y:1.0,z:5.35,w:4.7,h:.38,font:15,bg:'rgba(20,32,26,.72)',fg:'#d8c19a'});

  // Low-cost lighting: warm accents + cool sage fill.
  [[-5.4,5.5,-2.5],[5.4,5.5,-2.5],[-4.8,4.4,4.2],[4.8,4.4,4.2]].forEach(([x,y,z],i)=>{const l=new THREE.PointLight(i<2?0xffc98b:0xa9c2af,i<2?6.8:4.2,16,2);l.position.set(x,y,z);g.add(l)});

  addText(g,'ENTRÉE · VOTRE CORPS À TRAVERS LE TEMPS',{x:0,y:5.9,z:-7.65,w:5.2,h:.45,font:17,bg:'rgba(22,34,28,.86)'});
}

// Refine the contextual action copy without altering the action itself.
const watch=setInterval(()=>{
  const app=document.querySelector('#app');
  if(!app) return;
  const zone=app.dataset.zone;
  if(zone==='atrium'){
    const title=document.querySelector('#interaction-title');
    const copy=document.querySelector('#interaction-copy');
    if(title?.textContent?.toLowerCase().includes('twin')){
      title.textContent=document.documentElement.lang==='en'?'Enter the Twin Lab':'Entrer dans le Twin Lab';
      if(copy)copy.textContent=document.documentElement.lang==='en'?'Explore your Functional Digital Twin':'Découvrir votre jumeau fonctionnel';
    }
  }
},350);
setTimeout(()=>clearInterval(watch),180000);

window.KomoAgentPreview003={version:'003',threshold:true,twinInterior:true,clinicalWrite:false};
