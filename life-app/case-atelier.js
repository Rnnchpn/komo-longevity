(()=>{
  const H=document.getElementById('case-atelier'); if(!H)return;
  const T=(fr,en)=>document.documentElement.lang==='fr'?fr:en;
  const euro=n=>new Intl.NumberFormat(document.documentElement.lang==='fr'?'fr-FR':'en-GB',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const LEATHERS={
    signature:{fr:'Signature',en:'Signature',base:15000,noteFr:'Veau pleine fleur grainé, résistant et sobre.',noteEn:'Full-grain grained calf leather, durable and understated.'},
    heritage:{fr:'Heritage',en:'Heritage',base:16500,noteFr:'Pleine fleur sélectionnée, grain naturel et patine expressive.',noteEn:'Selected full-grain leather with a natural grain and evolving patina.'},
    atelier:{fr:'Atelier',en:'Atelier',base:18500,noteFr:'Sélection supérieure, finition semi-aniline et travail artisanal.',noteEn:'Higher-selection leather, semi-aniline finish and hand craftsmanship.'},
    bespoke:{fr:'Bespoke',en:'Bespoke',base:null,noteFr:'Couleur, grain et détails développés sur demande.',noteEn:'Colour, grain and detailing developed to order.'}
  };
  const COLORS={
    obsidian:{fr:'Obsidian',en:'Obsidian',hex:'#191918'},graphite:{fr:'Graphite',en:'Graphite',hex:'#4a4c49'},
    sand:{fr:'Riviera Sand',en:'Riviera Sand',hex:'#c9c0b0'},sage:{fr:'KŌMØ Sage',en:'KŌMØ Sage',hex:'#7c897d'},
    navy:{fr:'Mediterranean Navy',en:'Mediterranean Navy',hex:'#26384d'},cognac:{fr:'Cognac',en:'Cognac',hex:'#95572f'},
    bordeaux:{fr:'Bordeaux',en:'Bordeaux',hex:'#6f2f2f'},ivory:{fr:'Ivory',en:'Ivory',hex:'#e5dfd4'}
  };
  const CASE_IMAGES={
    obsidian:'assets/case01/obsidian.webp',
    graphite:'assets/case01/graphite.webp',
    sand:'assets/case01/riviera-sand.webp',
    sage:'assets/case01/sage.webp',
    navy:'assets/case01/navy.webp',
    cognac:'assets/case01/cognac.webp',
    bordeaux:'assets/case01/bordeaux.webp',
    ivory:'assets/case01/ivory.webp'
  };
  const preloadCaseImages=()=>Object.values(CASE_IMAGES).forEach(src=>{const img=new Image();img.decoding='async';img.src=src;});
  if('requestIdleCallback' in window) requestIdleCallback(preloadCaseImages); else setTimeout(preloadCaseImages,120);

  const INTERIORS={
    sand:{fr:'Sand',en:'Sand',hex:'#c8b9a5'},graphite:{fr:'Graphite',en:'Graphite',hex:'#4e514e'},
    sage:{fr:'Sage',en:'Sage',hex:'#899388'},navy:{fr:'Navy',en:'Navy',hex:'#253648'},cognac:{fr:'Cognac',en:'Cognac',hex:'#9a6847'}
  };
  const STITCHING={tonal:{fr:'Ton sur ton',en:'Tonal',delta:0},contrast:{fr:'Contrastée',en:'Contrast',delta:180},signature:{fr:'Signature KŌMØ',en:'KŌMØ Signature',delta:250}};
  const HARDWARE={
    silver:{fr:'Argent satiné',en:'Satin Silver',delta:0,hex:'linear-gradient(135deg,#7e817e,#e8e6df,#8f9290)'},
    champagne:{fr:'Champagne',en:'Champagne',delta:250,hex:'linear-gradient(135deg,#9f8b61,#e8d7a8,#a89268)'},
    black:{fr:'Black PVD',en:'Black PVD',delta:250,hex:'linear-gradient(135deg,#111,#4a4b4b,#171717)'},
    titanium:{fr:'Titane sombre',en:'Dark Titanium',delta:350,hex:'linear-gradient(135deg,#454746,#8b8d8a,#3d3f3e)'}
  };
  const PERSONAL={none:{fr:'Aucune',en:'None',delta:0},initials:{fr:'Initiales',en:'Initials',delta:180},name:{fr:'Nom / établissement',en:'Name / venue',delta:240},custom:{fr:'Sur mesure',en:'Custom',delta:null}};
  let saved=null; try{saved=JSON.parse(localStorage.getItem('komo-case01-config')||'null')}catch(e){}
  const A=Object.assign({leather:'signature',exterior:'obsidian',interior:'sand',stitching:'tonal',hardware:'silver',personalisation:'none',inscription:''},saved||{});
  const total=()=>{
    const l=LEATHERS[A.leather],p=PERSONAL[A.personalisation];
    if(!l||l.base===null||!p||p.delta===null)return null;
    return l.base+STITCHING[A.stitching].delta+HARDWARE[A.hardware].delta+p.delta;
  };
  const payload=()=>({leather:A.leather,exterior:A.exterior,interior:A.interior,stitching:A.stitching,hardware:A.hardware,personalisation:A.personalisation,inscription:(A.inscription||'').trim().slice(0,40)});
  const canCheckout=()=>total()!==null && !(A.personalisation!=='none'&&!A.inscription.trim());

  function swatches(source,name,current){
    return Object.entries(source).map(function(pair){
      const k=pair[0],v=pair[1];
      return '<label class="case01-swatch-wrap" title="'+esc(T(v.fr,v.en))+'"><input type="radio" name="'+name+'" value="'+k+'" '+(k===current?'checked':'')+'><span class="case01-swatch" style="--sw:'+v.hex+'"></span><small>'+esc(T(v.fr,v.en))+'</small></label>';
    }).join('');
  }
  function pills(source,name,current){
    return Object.entries(source).map(function(pair){
      const k=pair[0],v=pair[1],extra=Number.isFinite(v.delta)&&v.delta>0?' <small>+'+euro(v.delta)+'</small>':'';
      return '<label class="case01-pill-wrap"><input type="radio" name="'+name+'" value="'+k+'" '+(k===current?'checked':'')+'><span>'+esc(T(v.fr,v.en))+extra+'</span></label>';
    }).join('');
  }
  function leatherCards(){
    return Object.entries(LEATHERS).map(function(pair){
      const k=pair[0],v=pair[1],price=v.base===null?T('Sur devis','On request'):euro(v.base);
      return '<label><input type="radio" name="leather" value="'+k+'" '+(k===A.leather?'checked':'')+'><span><b>'+T(v.fr,v.en)+'</b><small>'+price+'</small><em>'+T(v.noteFr,v.noteEn)+'</em></span></label>';
    }).join('');
  }
  function hardwareCards(){
    return Object.entries(HARDWARE).map(function(pair){
      const k=pair[0],v=pair[1],extra=v.delta?' · +'+euro(v.delta):'';
      return '<label><input type="radio" name="hardware" value="'+k+'" '+(k===A.hardware?'checked':'')+'><span style="--metal:'+v.hex+'"></span><small>'+T(v.fr,v.en)+extra+'</small></label>';
    }).join('');
  }
  function visual(){
    const colour=COLORS[A.exterior]||COLORS.obsidian;
    const src=CASE_IMAGES[A.exterior]||CASE_IMAGES.obsidian;
    const alt='KŌMØ CASE 01 — '+T(colour.fr,colour.en);
    return '<div class="case01-stage case01-stage-real">'+
      '<img class="case01-hero-image" src="'+src+'" alt="'+esc(alt)+'" width="550" height="412" decoding="async" fetchpriority="high">'+
      '<span class="case01-render-chip">'+T('APERÇU EXTÉRIEUR','EXTERIOR PREVIEW')+'</span>'+
      '<div class="case01-caption"><span>KŌMØ CASE 01</span><b>'+T(LEATHERS[A.leather].fr,LEATHERS[A.leather].en)+' · '+T(colour.fr,colour.en)+'</b></div>'+
    '</div>';
  }
  function summary(){
    const p=total();
    return 'KŌMØ CASE 01\n'+T('Cuir','Leather')+': '+T(LEATHERS[A.leather].fr,LEATHERS[A.leather].en)+'\n'+T('Extérieur','Exterior')+': '+T(COLORS[A.exterior].fr,COLORS[A.exterior].en)+'\n'+T('Intérieur','Interior')+': '+T(INTERIORS[A.interior].fr,INTERIORS[A.interior].en)+'\n'+T('Coutures','Stitching')+': '+T(STITCHING[A.stitching].fr,STITCHING[A.stitching].en)+'\n'+T('Métal','Hardware')+': '+T(HARDWARE[A.hardware].fr,HARDWARE[A.hardware].en)+'\n'+T('Personnalisation','Personalisation')+': '+T(PERSONAL[A.personalisation].fr,PERSONAL[A.personalisation].en)+'\n'+T('Inscription','Inscription')+': '+(A.inscription||'—')+'\n2 iPads · 6 '+T('capteurs','sensors')+' · 1 '+T('trépied','tripod')+'\n'+(p!==null?T('Prix','Price')+': '+euro(p)+' '+T('HT','excl. VAT'):T('Prix: sur devis','Price: on request'));
  }
  function render(){
    const price=total(),needs=A.personalisation!=='none',ready=canCheckout();
    H.innerHTML='<div class="case01-shell"><header class="case01-head"><div><p class="eyebrow">KŌMØ LIFE · CASE 01</p><h2>KŌMØ CASE 01<br><em>'+T('Configurée par vous.','Configured by you.')+'</em></h2></div><p>'+T('Un seul attaché-case. Une architecture fixe. Une infinité de configurations en cuir, couleurs, métaux et détails.','One attaché-case. One fixed architecture. An open field of leather, colour, hardware and detailing choices.')+'</p></header><div class="case01-layout"><div class="case01-left">'+visual()+'<div class="case01-specs"><span><b>02</b>iPads '+T('intégrés','integrated')+'</span><span><b>06</b>'+T('capteurs KŌMØ','KŌMØ sensors')+'</span><span><b>01</b>'+T('trépied voyage','travel tripod')+'</span><span><b>01</b>'+T('compartiment caché','hidden compartment')+'</span></div><div class="case01-proof"><p>'+T('UNE PLATEFORME. PLUSIEURS EXPRESSIONS.','ONE PLATFORM. MANY EXPRESSIONS.')+'</p><h3>'+T('L’architecture technique ne change jamais. Seule votre Case change.','The technical architecture never changes. Only your Case does.')+'</h3></div></div><form class="case01-config" onsubmit="return false"><div class="case01-tabs"><button type="button" class="on">'+T('Configurer','Configure')+'</button><button type="button" data-case-details>'+T('Détails','Details')+'</button><button type="button" data-case-included>'+T('Inclus','What’s included')+'</button></div><fieldset><legend><i>01</i>'+T('Collection cuir','Leather collection')+'</legend><div class="case01-leathers">'+leatherCards()+'</div></fieldset><fieldset><legend><i>02</i>'+T('Couleur extérieure','Exterior colour')+' <strong>'+T(COLORS[A.exterior].fr,COLORS[A.exterior].en)+'</strong></legend><div class="case01-swatches">'+swatches(COLORS,'exterior',A.exterior)+'</div></fieldset><fieldset><legend><i>03</i>'+T('Intérieur','Interior')+' <strong>'+T(INTERIORS[A.interior].fr,INTERIORS[A.interior].en)+'</strong></legend><div class="case01-swatches compact">'+swatches(INTERIORS,'interior',A.interior)+'</div></fieldset><fieldset><legend><i>04</i>'+T('Coutures','Stitching')+'</legend><div class="case01-pills">'+pills(STITCHING,'stitching',A.stitching)+'</div></fieldset><fieldset><legend><i>05</i>'+T('Métal','Hardware')+' <strong>'+T(HARDWARE[A.hardware].fr,HARDWARE[A.hardware].en)+'</strong></legend><div class="case01-hardware">'+hardwareCards()+'</div></fieldset><fieldset><legend><i>06</i>'+T('Personnalisation','Personalisation')+'</legend><div class="case01-pills">'+pills(PERSONAL,'personalisation',A.personalisation)+'</div>'+(needs?'<label class="case01-inscription">'+T('Inscription','Inscription')+'<input name="inscription" maxlength="40" value="'+esc(A.inscription)+'" placeholder="'+T('Initiales, nom ou établissement','Initials, name or venue')+'"></label>':'')+'</fieldset><div class="case01-order"><div class="case01-order-summary"><span>'+T('Votre configuration','Your configuration')+'</span><strong>'+(price===null?T('Sur devis','On request'):euro(price)+' '+T('HT','excl. VAT'))+'</strong><small>'+(price===null?T('Notre atelier vous contacte pour finaliser les matières et le prix.','Our atelier will contact you to finalise materials and pricing.'):T('TVA et livraison calculées au checkout selon destination.','VAT and delivery calculated at checkout according to destination.'))+'</small></div><button type="button" class="case01-primary" data-case-order '+(ready?'':(price===null?'data-quote="1"':'disabled'))+'>'+(price===null?T('Demander une configuration Bespoke','Request a Bespoke configuration'):T('Commander cette Case','Order this Case'))+'</button><button type="button" class="case01-secondary" data-case-save>'+T('Sauvegarder ma configuration','Save configuration')+'</button><p class="case01-status" data-case-status aria-live="polite"></p></div></form></div><div class="case01-editorial"><article><p>'+T('MATIÈRES EXCEPTIONNELLES','EXCEPTIONAL MATERIALS')+'</p><h3>'+T('Un toucher que vous ressentez. Un standard que vous reconnaissez.','A touch you feel. A standard you recognise.')+'</h3></article><article><p>'+T('PRÉCISION ARTISANALE','PRECISION CRAFTSMANSHIP')+'</p><h3>'+T('Conçue comme un instrument. Finie comme un objet de maroquinerie.','Engineered like an instrument. Finished like a piece of leather craft.')+'</h3></article><article><p>CLINICS · HOSPITALITY · PRIVATE</p><h3>'+T('La même architecture, configurée pour chaque environnement.','The same architecture, configured for every environment.')+'</h3></article></div></div>';
    if(new URLSearchParams(location.search).get('checkout')==='success'){const s=H.querySelector('[data-case-status]');if(s)s.textContent=T('Commande enregistrée. Nous vous recontactons pour la validation finale.','Order received. We will contact you for final configuration approval.');}
  }
  function quote(){location.href='mailto:contact@komolongevity.com?subject='+encodeURIComponent('KŌMØ CASE 01 — Bespoke')+'&body='+encodeURIComponent(summary())}
  async function order(){
    const status=H.querySelector('[data-case-status]');
    if(A.leather==='bespoke'||A.personalisation==='custom'){quote();return}
    if(!canCheckout()){if(status)status.textContent=T('Ajoutez l’inscription souhaitée avant de poursuivre.','Add the requested inscription before continuing.');return}
    if(status)status.textContent=T('Ouverture du paiement sécurisé…','Opening secure checkout…');
    try{if(!window.KomoLifeCheckout?.start)throw new Error('checkout_unavailable');await window.KomoLifeCheckout.start([{sku:'KL-CASE01-001',size:'Configured',quantity:1,configuration:payload()}],0)}
    catch(error){console.error('[case01]',error);if(status)status.textContent=T('Paiement momentanément indisponible. Préparation de votre configuration par email.','Checkout temporarily unavailable. Preparing your configuration by email.');setTimeout(quote,900)}
  }
  H.addEventListener('change',e=>{const n=e.target.name,v=e.target.value;if(['leather','exterior','interior','stitching','hardware','personalisation'].includes(n)){A[n]=v;if(n==='personalisation'&&v==='none')A.inscription='';render()}});
  H.addEventListener('input',e=>{if(e.target.name==='inscription')A.inscription=e.target.value});
  H.addEventListener('click',e=>{
    if(e.target.closest('[data-case-order]'))order();
    if(e.target.closest('[data-case-save]')){localStorage.setItem('komo-case01-config',JSON.stringify(A));const s=H.querySelector('[data-case-status]');if(s)s.textContent=T('Configuration sauvegardée sur cet appareil.','Configuration saved on this device.')}
    if(e.target.closest('[data-case-details]')){const s=H.querySelector('[data-case-status]');if(s)s.textContent=T('CASE 01 — attaché-case cuir, architecture intérieure fixe, fabrication à la commande.','CASE 01 — leather attaché-case, fixed internal architecture, made to order.')}
    if(e.target.closest('[data-case-included]')){const s=H.querySelector('[data-case-status]');if(s)s.textContent=T('2 iPads · 6 capteurs · 1 trépied · compartiment accessoires · intégration KŌMØ.','2 iPads · 6 sensors · 1 tripod · accessories compartment · KŌMØ integration.')}
  });
  new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  render();
})();