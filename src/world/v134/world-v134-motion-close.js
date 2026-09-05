const app=document.querySelector('#app');
if(!app)throw new Error('KŌMØ V0.13.4 motion close fix could not attach');

const style=document.createElement('style');
style.textContent=`
  #motion-camera .motion-camera-head{position:relative;z-index:1000;pointer-events:auto}
  #motion-camera #motion-close{position:relative;z-index:1002;pointer-events:auto;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
  #motion-camera #setup-toggle{position:relative;z-index:1002;pointer-events:auto;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
  #motion-camera:not(.open){display:none!important;pointer-events:none!important}
`;
document.head.appendChild(style);

function getCamera(){return document.querySelector('#motion-camera')}
function getSetup(){return document.querySelector('#motion-camera .camera-setup')}

function releaseStream(){
  try{
    const video=document.querySelector('#motion-video');
    const stream=video?.srcObject;
    stream?.getTracks?.().forEach(track=>{try{track.stop()}catch{}});
    if(video){try{video.pause()}catch{};try{video.srcObject=null}catch{}}
  }catch(e){console.warn('[V0.13.4] camera stream cleanup skipped',e)}
}

function forceVisualClose(){
  const camera=getCamera();if(!camera)return;
  camera.classList.remove('open');
  camera.removeAttribute('data-setup-good');
  delete app.dataset.motionCamera;
  document.querySelector('#motion-result')?.classList.remove('open');
  getSetup()?.classList.remove('minimized');
  requestAnimationFrame(()=>releaseStream());
}

function collapseSetup(){
  const setup=getSetup();if(!setup)return;
  setup.classList.toggle('minimized');
  const toggle=document.querySelector('#setup-toggle');
  if(toggle)toggle.textContent=setup.classList.contains('minimized')?'+':'−';
}

function install(){
  const camera=getCamera(),close=document.querySelector('#motion-close'),toggle=document.querySelector('#setup-toggle');
  if(!camera||!close)return false;
  if(close.dataset.v134CloseBound==='1')return true;
  close.dataset.v134CloseBound='1';

  // Capture phase: visually close first. The legacy V0.9 handler may then perform its normal cleanup.
  const closeNow=e=>{
    if(e.type==='pointerup'&&e.pointerType==='mouse'&&e.button!==0)return;
    forceVisualClose();
  };
  close.addEventListener('pointerup',closeNow,{capture:true});
  close.addEventListener('touchend',closeNow,{capture:true,passive:true});
  close.addEventListener('click',closeNow,{capture:true});

  // Separate collapse control for the framing assistant.
  if(toggle&&!toggle.dataset.v134ToggleBound){
    toggle.dataset.v134ToggleBound='1';
    // Replace the older onclick to avoid a double toggle on iOS.
    toggle.onclick=null;
    toggle.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();collapseSetup()});
  }

  // Opening again must always restore a clean visible state.
  new MutationObserver(()=>{
    if(camera.classList.contains('open')){
      getSetup()?.classList.remove('minimized');
      const t=document.querySelector('#setup-toggle');if(t)t.textContent='−';
    }
  }).observe(camera,{attributes:true,attributeFilter:['class']});
  return true;
}

if(!install()){
  const timer=setInterval(()=>{if(install())clearInterval(timer)},80);
  setTimeout(()=>clearInterval(timer),10000);
}

// Escape remains useful on desktop and as a safety fallback.
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&getCamera()?.classList.contains('open'))forceVisualClose()});

window.KomoV134MotionClose={version:'0.13.4',close:forceVisualClose,collapseSetup};
