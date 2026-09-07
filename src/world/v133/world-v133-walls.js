const runtime=window.KomoWorldRuntime;
if(!runtime?.THREE||!runtime?.hall||!runtime?.leftWall||!runtime?.rightWall||!runtime?.backWall)throw new Error('KŌMØ V0.13.3 wall runtime unavailable');
const {THREE,hall,leftWall,rightWall,backWall}=runtime;

function stoneTexture(){
  const c=document.createElement('canvas');c.width=c.height=1024;const x=c.getContext('2d');
  x.fillStyle='#e8ddca';x.fillRect(0,0,1024,1024);
  for(let i=0;i<36;i++){
    const y=Math.random()*1024,h=70+Math.random()*180;
    const g=x.createLinearGradient(0,y,1024,y+h);g.addColorStop(0,'rgba(168,144,111,.035)');g.addColorStop(.5,'rgba(255,255,255,.035)');g.addColorStop(1,'rgba(138,118,91,.025)');x.fillStyle=g;x.fillRect(0,y,1024,h);
  }
  x.lineCap='round';
  for(let i=0;i<42;i++){
    x.strokeStyle=`rgba(126,108,84,${.025+Math.random()*.04})`;x.lineWidth=.7+Math.random()*1.6;x.beginPath();
    let y=Math.random()*1024;x.moveTo(-30,y);
    for(let s=0;s<10;s++){y+=-18+Math.random()*36;x.lineTo(s*120,y)}x.stroke();
  }
  for(let i=0;i<9000;i++){
    const v=130+Math.random()*95|0;x.fillStyle=`rgba(${v},${Math.max(0,v-8)},${Math.max(0,v-18)},${.008+Math.random()*.022})`;const s=.4+Math.random()*1.3;x.fillRect(Math.random()*1024,Math.random()*1024,s,s);
  }
  // Large slab joints are part of the material, not a tiled-grid effect.
  x.strokeStyle='rgba(119,100,76,.11)';x.lineWidth=2;
  [256,512,768].forEach(px=>{x.beginPath();x.moveTo(px,0);x.lineTo(px,1024);x.stroke()});
  [340,682].forEach(py=>{x.beginPath();x.moveTo(0,py);x.lineTo(1024,py);x.stroke()});
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2.1,1.15);t.anisotropy=4;return t;
}
function bumpTexture(){
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#808080';x.fillRect(0,0,512,512);
  for(let i=0;i<5000;i++){const v=105+Math.random()*46|0;x.fillStyle=`rgb(${v},${v},${v})`;const s=.6+Math.random()*1.5;x.fillRect(Math.random()*512,Math.random()*512,s,s)}
  x.strokeStyle='rgba(100,100,100,.24)';x.lineWidth=1;for(let i=0;i<18;i++){x.beginPath();let y=Math.random()*512;x.moveTo(-10,y);for(let s=0;s<8;s++){y+=-7+Math.random()*14;x.lineTo(s*76,y)}x.stroke()}
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2.1,1.15);return t;
}
function sageTexture(){
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#294036';x.fillRect(0,0,512,512);
  for(let i=0;i<160;i++){const y=Math.random()*512;x.strokeStyle=`rgba(229,238,229,${.008+Math.random()*.018})`;x.lineWidth=.4+Math.random();x.beginPath();x.moveTo(0,y);x.bezierCurveTo(140,y+Math.random()*10-5,340,y+Math.random()*10-5,512,y+Math.random()*10-5);x.stroke()}
  for(let i=0;i<3000;i++){x.fillStyle=`rgba(0,0,0,${.008+Math.random()*.018})`;x.fillRect(Math.random()*512,Math.random()*512,1,1)}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(1.4,1.8);t.anisotropy=4;return t;
}
const wallStone=new THREE.MeshStandardMaterial({map:stoneTexture(),bumpMap:bumpTexture(),bumpScale:.045,color:0xf0e5d4,roughness:.76,metalness:.01});
const stoneInset=new THREE.MeshStandardMaterial({map:stoneTexture(),color:0xd6c8b2,roughness:.83,metalness:.01});
const sage=new THREE.MeshStandardMaterial({map:sageTexture(),color:0x2c4439,roughness:.63,metalness:.025});
const bronze=new THREE.MeshStandardMaterial({color:0x9b744c,roughness:.36,metalness:.56});
const bronzeDark=new THREE.MeshStandardMaterial({color:0x6f5439,roughness:.43,metalness:.48});
const plinth=new THREE.MeshStandardMaterial({color:0x9b907e,roughness:.88,metalness:.01});

leftWall.material=wallStone;rightWall.material=wallStone;backWall.material=wallStone;

const g=new THREE.Group();g.name='KOMO_V133_SOLID_WALLS';hall.add(g);
function box(w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}

// Heavy continuous stone base gives the Hall visual weight in first person.
box(.28,.72,33.0,plinth,-23.32,.40,0);box(.28,.72,33.0,plinth,23.32,.40,0);box(46.8,.72,.28,plinth,0,.40,-16.33);
box(.24,.18,32.8,bronzeDark,-23.20,.82,0);box(.24,.18,32.8,bronzeDark,23.20,.82,0);box(46.5,.18,.24,bronzeDark,0,.82,-16.20);

// Side walls: large stone fields with deep reveals, not thin portal frames.
const sideZ=[-12.7,-6.35,0,6.35,12.7];
sideZ.forEach((z,i)=>{
  const leftMat=i===3?sage:(i%2?stoneInset:wallStone);
  const rightMat=i===1?sage:(i%2?stoneInset:wallStone);
  box(.18,7.35,5.55,leftMat,-23.26,4.82,z);
  box(.18,7.35,5.55,rightMat,23.26,4.82,z);
  // inset surround creates visible wall thickness and shadow line
  box(.12,7.72,.16,bronze,-23.10,4.82,z-2.93);box(.12,7.72,.16,bronze,-23.10,4.82,z+2.93);
  box(.12,7.72,.16,bronze,23.10,4.82,z-2.93);box(.12,7.72,.16,bronze,23.10,4.82,z+2.93);
});

// Pilasters create a real architectural rhythm and strong scale cues.
[-15.75,-9.45,-3.15,3.15,9.45,15.75].forEach(z=>{
  box(.42,8.55,.42,wallStone,-23.02,4.72,z);box(.42,8.55,.42,wallStone,23.02,4.72,z);
  box(.08,7.95,.48,bronze,-22.78,4.72,z);box(.08,7.95,.48,bronze,22.78,4.72,z);
});

// Continuous upper cornice locks walls and ceiling together without changing the ceiling itself.
box(.38,.38,33.0,stoneInset,-23.15,8.75,0);box(.38,.38,33.0,stoneInset,23.15,8.75,0);box(46.6,.38,.38,stoneInset,0,8.75,-16.15);
box(.12,.10,32.8,bronze,-22.92,8.50,0);box(.12,.10,32.8,bronze,22.92,8.50,0);box(46.3,.10,.12,bronze,0,8.50,-15.92);

// Rear wall: one continuous mineral plane with restrained vertical seams around destination facades.
[-18,-9,0,9,18].forEach(x=>box(.12,7.45,.18,bronze,x,4.75,-16.10));
box(46.0,1.05,.18,sage,0,7.83,-16.10);
box(45.6,.09,.20,bronze,0,7.18,-15.99);

// Corner returns remove the 'open cardboard box' effect when turning in FPS.
box(1.10,8.2,1.10,wallStone,-22.92,4.60,-16.05);box(1.10,8.2,1.10,wallStone,22.92,4.60,-16.05);

window.KomoV133Walls={version:'0.13.3',solid:true,textured:true,naturalHorizontalLook:true};
