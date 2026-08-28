const PDF_ENGINE_URLS=[
  'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];
let enginePromise=null;

function toast(message){
  const el=document.querySelector('#toast');
  if(!el)return;
  el.textContent=message;
  el.hidden=false;
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>{el.hidden=true},4200);
}

function safeFile(value){
  return String(value||'patient')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-zA-Z0-9_-]+/g,'_')
    .replace(/^_+|_+$/g,'')
    .slice(0,72)||'patient';
}

function loadScript(src){
  return new Promise((resolve,reject)=>{
    if(typeof window.html2pdf==='function')return resolve();
    const existing=[...document.scripts].find(s=>s.src===src);
    if(existing){
      existing.addEventListener('load',resolve,{once:true});
      existing.addEventListener('error',()=>reject(new Error('script_load_failed')),{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src=src;
    script.async=true;
    script.crossOrigin='anonymous';
    script.onload=resolve;
    script.onerror=()=>reject(new Error('script_load_failed'));
    document.head.appendChild(script);
  });
}

async function ensureEngine(){
  if(typeof window.html2pdf==='function')return window.html2pdf;
  if(enginePromise)return enginePromise;
  enginePromise=(async()=>{
    let lastError=null;
    for(const src of PDF_ENGINE_URLS){
      try{
        await loadScript(src);
        if(typeof window.html2pdf==='function')return window.html2pdf;
      }catch(error){lastError=error}
    }
    throw lastError||new Error('pdf_engine_unavailable');
  })();
  try{return await enginePromise}
  catch(error){enginePromise=null;throw error}
}

function ensureStyles(){
  if(document.querySelector('#komoPdfV3Style'))return;
  const style=document.createElement('style');
  style.id='komoPdfV3Style';
  style.textContent=`
    .komo-pdf-v3-stage{
      position:fixed!important;
      left:0!important;
      top:0!important;
      width:190mm!important;
      min-height:1px!important;
      background:#fff!important;
      color:#26372d!important;
      pointer-events:none!important;
      z-index:-2147483000!important;
      overflow:visible!important;
      opacity:1!important;
      visibility:visible!important;
      font-family:'DM Sans',Arial,sans-serif!important;
    }
    .komo-pdf-v3-stage *{box-sizing:border-box!important}
    .komo-pdf-v3-cover{padding:10mm 9mm 7mm;border-bottom:1px solid #dedbd3;background:#fff}
    .komo-pdf-v3-brand{display:flex;align-items:center;justify-content:space-between;gap:10mm}
    .komo-pdf-v3-brand strong{font-family:Manrope,Arial,sans-serif;font-size:18px;letter-spacing:.16em;color:#26372d}
    .komo-pdf-v3-brand span{font-size:8px;letter-spacing:.13em;text-transform:uppercase;color:#738077;font-weight:700}
    .komo-pdf-v3-title{margin:5mm 0 0;font-family:Manrope,Arial,sans-serif;font-size:21px;line-height:1.1;letter-spacing:-.035em;color:#26372d}
    .komo-pdf-v3-meta{margin:2.5mm 0 0;font-size:8px;color:#7b837d}
    .komo-pdf-v3-content{padding:7mm 7mm 8mm;background:#fff}
    .komo-pdf-v3-stage .hero{border:1px solid #e1ddd5!important;border-radius:7mm!important;padding:7mm!important;box-shadow:none!important;background:#fff!important;margin:0 0 5mm!important}
    .komo-pdf-v3-stage .hero h1{font-size:29px!important;margin:2mm 0 1mm!important}
    .komo-pdf-v3-stage .actions,.komo-pdf-v3-stage .report-nav,.komo-pdf-v3-stage .sticky-actions,.komo-pdf-v3-stage .no-print,.komo-pdf-v3-stage button{display:none!important}
    .komo-pdf-v3-stage .result-hero{display:grid!important;grid-template-columns:48mm 1fr!important;gap:3.5mm!important;margin:0 0 4mm!important}
    .komo-pdf-v3-stage .big-score{min-height:44mm!important;border-radius:6mm!important;padding:6mm!important;background:#26372d!important;color:#fff!important;break-inside:avoid!important}
    .komo-pdf-v3-stage .big-score strong{font-size:48px!important;margin-top:3mm!important}
    .komo-pdf-v3-stage .domain-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:2.5mm!important}
    .komo-pdf-v3-stage .domain{border-radius:4mm!important;padding:4mm!important;box-shadow:none!important;break-inside:avoid!important}
    .komo-pdf-v3-stage .domain strong{font-size:21px!important}
    .komo-pdf-v3-stage .grid{display:block!important;margin-top:0!important}
    .komo-pdf-v3-stage .card{display:block!important;margin:0 0 4mm!important;border:1px solid #e1ddd5!important;border-radius:5mm!important;padding:5mm!important;box-shadow:none!important;background:#fff!important}
    .komo-pdf-v3-stage .card h2{font-size:17px!important;margin:1.5mm 0 3mm!important}
    .komo-pdf-v3-stage .section-note{font-size:8px!important;max-width:70mm!important}
    .komo-pdf-v3-stage .clinical-note{border-radius:3mm!important;padding:4mm!important;font-size:9px!important;line-height:1.48!important;break-inside:avoid!important}
    .komo-pdf-v3-stage .summary-grid,.komo-pdf-v3-stage .muscle-kpis,.komo-pdf-v3-stage .audit{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:2.2mm!important}
    .komo-pdf-v3-stage .summary,.komo-pdf-v3-stage .muscle-kpi,.komo-pdf-v3-stage .audit>div{padding:3.2mm!important;border-radius:3.2mm!important;break-inside:avoid!important}
    .komo-pdf-v3-stage .question-grid{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:2.5mm!important}
    .komo-pdf-v3-stage .question{padding:3.5mm!important;border-radius:3.5mm!important;break-inside:avoid!important}
    .komo-pdf-v3-stage details{display:block!important}
    .komo-pdf-v3-stage details>summary{font-size:7px!important;margin-top:2mm!important}
    .komo-pdf-v3-stage .answer-row{font-size:7px!important;grid-template-columns:1fr!important;gap:1mm!important}
    .komo-pdf-v3-stage .table-wrap{overflow:visible!important;border-radius:3mm!important}
    .komo-pdf-v3-stage .rtable{width:100%!important;min-width:0!important;table-layout:fixed!important}
    .komo-pdf-v3-stage .rtable th{font-size:6.4px!important;padding:2mm!important;word-break:break-word!important}
    .komo-pdf-v3-stage .rtable td{font-size:7px!important;padding:2mm!important;word-break:break-word!important;overflow-wrap:anywhere!important}
    .komo-pdf-v3-stage .muscle-row{grid-template-columns:42mm 1fr 1fr!important;padding:3mm!important;break-inside:avoid!important}
    .komo-pdf-v3-stage .pdf-note{font-size:7.5px!important;break-inside:avoid!important}
    .komo-pdf-v3-stage .question,.komo-pdf-v3-stage .domain,.komo-pdf-v3-stage .summary,.komo-pdf-v3-stage .muscle-kpi,.komo-pdf-v3-stage .muscle-row,.komo-pdf-v3-stage .clinical-note,.komo-pdf-v3-stage .import-row{page-break-inside:avoid!important;break-inside:avoid!important}
  `;
  document.head.appendChild(style);
}

function buildStage(){
  const source=document.querySelector('#dossierRoot');
  if(!source||source.classList.contains('loading'))throw new Error('Dossier en cours de chargement.');
  ensureStyles();
  const clone=source.cloneNode(true);
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
  clone.querySelectorAll('.actions,.report-nav,.sticky-actions,.no-print,button').forEach(el=>el.remove());
  clone.querySelectorAll('details').forEach(el=>{el.open=true});
  const patientName=source.querySelector('.hero h1')?.textContent?.trim()||'Patient KŌMØ';
  const synthetic=/données synthétiques/i.test(source.textContent||'');
  const today=new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'long',year:'numeric'}).format(new Date());
  const stage=document.createElement('section');
  stage.className='komo-pdf-v3-stage';
  stage.innerHTML=`
    <header class="komo-pdf-v3-cover">
      <div class="komo-pdf-v3-brand"><strong>KŌMØ</strong><span>PULSE · MOTION REPORT · CONFIDENTIEL</span></div>
      <h1 class="komo-pdf-v3-title">Bilan de mobilité & analyse musculaire</h1>
      <p class="komo-pdf-v3-meta">${patientName} · Rapport généré le ${today}${synthetic?' · DONNÉES SYNTHÉTIQUES — DÉMONSTRATION':''}</p>
    </header>
    <div class="komo-pdf-v3-content"></div>`;
  stage.querySelector('.komo-pdf-v3-content').appendChild(clone);
  document.body.appendChild(stage);
  return {stage,patientName,synthetic};
}

function decorate(pdf,synthetic){
  const count=pdf.internal.getNumberOfPages();
  const width=pdf.internal.pageSize.getWidth();
  const height=pdf.internal.pageSize.getHeight();
  for(let page=1;page<=count;page++){
    pdf.setPage(page);
    pdf.setDrawColor(222,219,211);
    pdf.setLineWidth(.2);
    pdf.line(10,height-10,width-10,height-10);
    pdf.setFont('helvetica','normal');
    pdf.setFontSize(6.5);
    pdf.setTextColor(111,123,114);
    pdf.text('KŌMØ Pulse · Compte-rendu professionnel · Document confidentiel',10,height-6);
    pdf.text(`Page ${page}/${count}`,width-10,height-6,{align:'right'});
    if(synthetic){
      pdf.setFont('helvetica','bold');
      pdf.setFontSize(6.1);
      pdf.setTextColor(127,91,44);
      pdf.text('DONNÉES SYNTHÉTIQUES — DÉMONSTRATION',width/2,height-6,{align:'center'});
    }
  }
}

async function exportPdf(button){
  const original=button.textContent;
  let stage=null;
  try{
    button.disabled=true;
    button.textContent='Génération du PDF…';
    toast('Création du compte-rendu PDF…');
    const html2pdf=await ensureEngine();
    const built=buildStage();
    stage=built.stage;
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const rect=stage.getBoundingClientRect();
    const text=(stage.innerText||'').trim();
    if(rect.width<500||stage.scrollHeight<500||text.length<200){
      throw new Error(`Matrice PDF invalide (${Math.round(rect.width)}×${stage.scrollHeight}, ${text.length} caractères).`);
    }
    const stamp=new Date().toISOString().slice(0,10);
    const filename=`KOMO_Motion_Report_${safeFile(built.patientName)}_${stamp}.pdf`;
    const worker=html2pdf().set({
      margin:[7,9,14,9],
      filename,
      image:{type:'jpeg',quality:.99},
      html2canvas:{
        scale:2,
        useCORS:true,
        allowTaint:false,
        backgroundColor:'#ffffff',
        logging:false,
        scrollX:0,
        scrollY:0,
        windowWidth:Math.max(1200,stage.scrollWidth+40),
        windowHeight:Math.max(900,Math.min(stage.scrollHeight+40,5000))
      },
      jsPDF:{unit:'mm',format:'a4',orientation:'portrait',compress:true},
      pagebreak:{mode:['css','legacy'],avoid:['.question','.domain','.summary','.muscle-kpi','.muscle-row','.clinical-note','.import-row']}
    }).from(stage).toPdf();
    await worker.get('pdf').then(pdf=>decorate(pdf,built.synthetic));
    await worker.save();
    toast(`PDF exporté : ${filename}`);
  }catch(error){
    console.error('[dossier-pdf-export-v3]',error);
    toast(`Export PDF impossible : ${error?.message||'Erreur inconnue'}`);
  }finally{
    stage?.remove();
    button.disabled=false;
    button.textContent=original;
  }
}

document.addEventListener('click',event=>{
  const button=event.target?.closest?.('#pdfBtn');
  if(!button)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  exportPdf(button);
},true);
