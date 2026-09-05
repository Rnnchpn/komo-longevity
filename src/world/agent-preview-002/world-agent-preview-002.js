import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';

const runtime=window.KomoWorldRuntime;
if(!runtime?.scene||!runtime?.player) throw new Error('KŌMØ Agent Preview 002 runtime unavailable');
const {scene,player}=runtime;
const inherited=window.KomoV122?.materials||{};

const STONE=inherited.STONE_LIGHT||new THREE.MeshStandardMaterial({color:0xeee3cf,roughness:.56,metalness:.01});
const STONE_DEEP=inherited.STONE_DEEP||new THREE.MeshStandardMaterial({color:0xc9b99e,roughness:.68,metalness:.01});
const BRONZE=inherited.BRONZE||new THREE.MeshStandardMaterial({color:0xa98559,metalness:.52,roughness:.32});
const SAGE=new THREE.MeshStandardMaterial({color:0x21362d,roughness:.50,metalness:.03});
const SAGE_SOFT=new THREE.MeshStandardMaterial({color:0x50685a,roughness:.72,metalness:.01});
const DARK=new THREE.MeshStandardMaterial({color:0x17251f,roughness:.46,metalness:.07});
const WARM=new THREE.MeshStandardMaterial({color:0xffe0b3,emissive:0xffbd6d,emissiveIntensity:2.6,roughness:.28});
const LEAF=new THREE.MeshStandardMaterial({color:0x667c67,roughness:.92,metalness:0});

const g=new THREE.Group();
g.name='KOMO_AGENT_PREVIEW_002_GRAPHIC_PASS';
scene.add(g);

function add(geo,mat,x,y,z,parent=g){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function box(w,h,d,mat,x,y,z,parent=g){return add(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent)}
function cyl(r1,r2,h,seg,mat,x,y,z,parent=g){return add(new THREE.CylinderGeometry(r1,r2,h,seg),mat,x,y,z,parent)}
function label(text,{w=3.4,h=.48,font=20,bg='rgba(25,39,32,.90)',fg='#f3eadc'}={}){
  const c=document.createElement('canvas');c.width=900;c.height=170;const ctx=c.getContext('2d');
  ctx.fillStyle=bg;ctx.beginPath();ctx.roundRect(20,20,860,130,28);ctx.fill();
  ctx.strokeStyle='rgba(224,197,147,.20)';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=fg;ctx.font=`600 ${font}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,450,85);
  const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthTest:true,depthWrite:false}));s.scale.set(w,h,1);g.add(s);return s;
}

// Premium lateral concierge alcove. It stays completely outside the central navigation axis (x > -4.6).
box(7.05,4.85,.30,SAGE,-8.25,2.48,-2.95);
box(.22,4.95,3.30,STONE_DEEP,-11.67,2.48,-1.38);
box(.18,4.95,3.30,STONE,-4.92,2.48,-1.38);
box(7.15,.18,3.42,STONE,-8.27,4.90,-1.40);

// Bronze architectural frame and warm linear lights.
box(.08,4.20,.10,BRONZE,-11.25,2.55,-2.72);
box(.08,4.20,.10,BRONZE,-5.28,2.55,-2.72);
box(6.05,.08,.10,BRONZE,-8.26,4.61,-2.72);
box(5.60,.055,.055,WARM,-8.15,4.48,-1.08);
box(5.35,.035,.08,WARM,-8.15,1.58,.20);

// Stone landing with a tiny bronze reveal; lifted to avoid z-fighting.
box(7.0,.09,3.15,STONE,-8.25,.39,-1.35);
box(6.35,.018,2.62,DARK,-8.25,.447,-1.35);
box(6.48,.010,2.75,BRONZE,-8.25,.462,-1.35);
box(6.12,.016,2.40,STONE,-8.25,.475,-1.35);

// Side seating / luggage ledge makes the concierge read as hospitality rather than admin.
box(2.05,.46,.72,SAGE_SOFT,-10.25,.70,.14);
box(2.16,.12,.82,STONE,-10.25,.99,.14);

// Mediterranean planting as a low-cost premium depth cue.
const planter=new THREE.Group();planter.position.set(-5.72,0,-.15);g.add(planter);
cyl(.62,.72,.72,20,STONE,0,.72,0,planter);
cyl(.08,.12,1.58,9,DARK,0,1.68,0,planter);
for(let i=0;i<5;i++){
  const leaf=new THREE.Mesh(new THREE.IcosahedronGeometry(.52,1),LEAF);
  const a=i/5*Math.PI*2;leaf.position.set(Math.cos(a)*.35,2.38+(i%2)*.12,Math.sin(a)*.26);leaf.scale.set(.65,1.05,.58);leaf.castShadow=true;planter.add(leaf);
}

// Refined signage inside the architecture rather than floating over the main route.
const concierge=label('KŌMŌ CONCIERGE',{w:3.1,h:.44,font:19,bg:'rgba(19,31,26,.96)'});concierge.position.set(-8.15,3.65,-2.72);
const assist=label('TWIN · ARENA · FITNESS',{w:2.9,h:.36,font:15,bg:'rgba(19,31,26,.72)',fg:'#d9c7a6'});assist.position.set(-8.15,3.05,-2.68);

// Warm light kept local to avoid mobile overdraw and preserve the deeper Hall contrast.
const warm1=new THREE.PointLight(0xffca86,4.6,10,2);warm1.position.set(-8.1,3.65,-.5);g.add(warm1);
const warm2=new THREE.PointLight(0xffddb0,2.5,7,2);warm2.position.set(-5.7,2.7,-1.1);g.add(warm2);

// Subtle floor cue: this marks the concierge destination without invading the central axis.
const ring=new THREE.Mesh(new THREE.RingGeometry(.90,1.02,48),new THREE.MeshBasicMaterial({color:0xb89567,transparent:true,opacity:.42,side:THREE.DoubleSide}));
ring.rotation.x=-Math.PI/2;ring.position.set(-8.15,.505,.25);g.add(ring);

// Contextual micro-copy only when the player is actually near the alcove.
const badge=document.createElement('div');
badge.id='agent002-concierge-hint';
badge.textContent='CONCIERGE · ORIENTATION';
Object.assign(badge.style,{position:'fixed',left:'50%',bottom:'118px',transform:'translateX(-50%)',zIndex:'115',padding:'8px 12px',border:'1px solid rgba(255,255,255,.30)',borderRadius:'999px',background:'rgba(24,37,31,.70)',backdropFilter:'blur(14px)',color:'#f2eadc',font:'700 9px/1 system-ui,sans-serif',letterSpacing:'.14em',opacity:'0',transition:'opacity .2s',pointerEvents:'none'});
document.body.appendChild(badge);
function tick(){
  const d=Math.hypot(player.position.x+8.15,player.position.z-0.25);
  badge.style.opacity=d<7?'1':'0';
  requestAnimationFrame(tick);
}
tick();

window.KomoAgentPreview002={version:'agent-preview-002',group:g};
