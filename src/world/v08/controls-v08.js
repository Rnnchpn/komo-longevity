const storageKey='komo_world_controls_v08';
const labels={forward:'Move Forward',backward:'Move Backward',left:'Move Left',right:'Move Right',sprint:'Sprint',interact:'Interact'};
const defaults={forward:'w',backward:'s',left:'a',right:'d',sprint:'shift',interact:'e'};
const keyName=(key)=>({arrowup:'↑',arrowdown:'↓',arrowleft:'←',arrowright:'→',' ':'Space',escape:'Esc',shift:'Shift',control:'Ctrl',alt:'Alt'}[key]||(key&&key.length===1?key.toUpperCase():key));
const normalize=(event)=>event.key===' '?' ':event.key.toLowerCase();
function read(){try{return JSON.parse(localStorage.getItem(storageKey)||'{}')}catch{return{}}}
function write(data){localStorage.setItem(storageKey,JSON.stringify(data))}
const scroll=document.querySelector('#settings .settings-scroll');
if(scroll){
  const section=document.createElement('section');
  section.innerHTML='<span class="group-title">KEY BINDINGS</span><div id="binding-list-v08" class="bindings"></div><small class="binding-note-v08">Tap a key to remap it. The world reloads once to apply your new controls.</small>';
  scroll.prepend(section);
  const list=section.querySelector('#binding-list-v08');
  let listening=null;
  function render(){
    const saved=read();const bindings={...defaults,...(saved.bindings||{})};
    list.innerHTML=Object.entries(labels).map(([id,label])=>`<div class="binding-row"><span>${label}</span><button data-remap="${id}" class="${listening===id?'listening':''}">${listening===id?'Press key':keyName(bindings[id])}</button></div>`).join('');
    list.querySelectorAll('[data-remap]').forEach(button=>button.addEventListener('click',()=>{listening=button.dataset.remap;render()}));
  }
  window.addEventListener('keydown',event=>{
    if(!listening)return;
    event.preventDefault();event.stopImmediatePropagation();
    const saved=read();saved.preset='custom';saved.bindings={...defaults,...(saved.bindings||{}),[listening]:normalize(event)};write(saved);listening=null;render();
    const toast=document.querySelector('#toast');if(toast){toast.textContent='Control saved · reloading';toast.classList.add('show')}
    setTimeout(()=>location.reload(),420);
  },true);
  render();
}
