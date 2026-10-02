import {supabase,getSession,getProfile,connectPulse,onSession} from '/world/komo-world-auth-v1.js?v=1';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const state={session:null,profile:null,access:{tier:'public',founding:false,entitlements:[]},entitlements:new Set(),products:[],category:'all',selected:null,bag:[]};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const has=c=>state.entitlements.has(c);
const member=()=>['one','echelon'].includes(state.access.tier);
const money=c=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(c||0)/100);
function toast(m){const e=$('#lifeToast');e.textContent=m;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2400)}
async function analytics(event_name,entity_type=null,entity_id=null,metadata={}){
 try{let anon=localStorage.getItem('komo_anon_v1');if(!anon){anon=crypto.randomUUID();localStorage.setItem('komo_anon_v1',anon)}await supabase.from('komo_product_analytics').insert({user_id:state.session?.user?.id||null,anonymous_id:anon,event_name,surface:'life',entity_type,entity_id,metadata})}catch{}
}
function loadBag(){try{state.bag=JSON.parse(localStorage.getItem('komo_life_bag_v1')||'[]');if(!Array.isArray(state.bag))state.bag=[]}catch{state.bag=[]}}
function saveBag(){localStorage.setItem('komo_life_bag_v1',JSON.stringify(state.bag));$('#bagCount').textContent=state.bag.reduce((n,x)=>n+x.quantity,0)}
async function load(){
 state.session=await getSession();state.profile=state.session?.user?await getProfile():null;
 if(state.session?.user){const {data}=await supabase.rpc('komo_world_access_snapshot');state.access=data||{tier:'public',founding:false,entitlements:[]}}else state.access={tier:'public',founding:false,entitlements:[]};
 state.entitlements=new Set(state.access.entitlements||[]);
 const {data,error}=await supabase.from('life_products').select('id,sku,slug,name,category,collection_name,description,editorial_copy,price_cents,currency,image_path,availability,visibility,one_edition,echelon_edition,variants,demo,sort_order').order('sort_order');
 if(error)console.warn('[Life products]',error);state.products=data||[];renderIdentity();renderProducts();saveBag();
 const q=new URLSearchParams(location.search),slug=q.get('product');if(slug){const p=state.products.find(x=>x.slug===slug);if(p)openProduct(p,false)}
 if(q.get('orders')==='1')openOrders();
}
function renderIdentity(){
 const b=$('#lifeAccess');b.className=state.access.tier==='echelon'?'echelon':state.access.tier==='one'?'one':'';
 b.textContent=state.access.tier==='echelon'?(state.access.founding?'FOUNDING ECHELON':'ECHELON'):state.access.tier==='one'?(state.access.founding?'FOUNDING ONE':'ONE'):state.session?.user?'SIGNED IN':'PUBLIC';
}
function badge(p){
 let a='<span class="product-badge">'+(p.demo?'DEMO':'KŌMØ LIFE')+'</span>';
 if(p.echelon_edition)a+='<span class="product-badge echelon">ECHELON EDITION</span>';else if(p.one_edition)a+='<span class="product-badge member">ONE EDITION</span>';
 if(p.availability==='coming_soon')a+='<span class="product-badge">COMING SOON</span>';
 return a;
}
function visibleProducts(){return state.category==='all'?state.products:state.products.filter(p=>p.category===state.category)}
function renderProducts(){
 const list=visibleProducts(),root=$('#lifeProducts');
 root.innerHTML=list.length?list.map(p=>'<button class="product-card" data-product="'+p.id+'"><div class="product-visual"><img src="'+esc(p.image_path||'')+'" alt="'+esc(p.name)+'"><div class="product-badges">'+badge(p)+'</div></div><div class="product-meta"><p>'+esc(p.collection_name)+' · '+esc(p.category.toUpperCase())+'</p><h3>'+esc(p.name)+'</h3><footer><span>'+money(p.price_cents)+'</span><span>'+esc(p.availability==='demo'?'DEMO PRODUCT':p.availability.replaceAll('_',' ').toUpperCase())+'</span></footer></div></button>').join(''):'<div class="product-empty">No products are being surfaced in this edit.</div>';
 $$('[data-product]').forEach(b=>b.onclick=()=>openProduct(state.products.find(p=>p.id===b.dataset.product)));
}
function openProduct(p,push=true){
 state.selected=p;analytics('product_viewed','life_product',p.id,{category:p.category,visibility:p.visibility,demo:p.demo});
 const variants=Array.isArray(p.variants)?p.variants:[];
 let v=variants.map((x,i)=>'<label class="variant"><span>'+esc(x.name||'Option')+'</span><select data-variant="'+i+'">'+(x.values||[]).map(y=>'<option>'+esc(y)+'</option>').join('')+'</select></label>').join('');
 const canAdd=p.availability!=='coming_soon'&&p.availability!=='sold_out';
 $('#productSheet').innerHTML='<div class="product-detail"><div class="product-detail-media"><button class="product-close" data-product-close>×</button><img src="'+esc(p.image_path||'')+'" alt="'+esc(p.name)+'"><div class="product-badges">'+badge(p)+'</div></div><div class="product-detail-copy"><span class="ey">'+esc(p.collection_name)+' · '+esc(p.category.toUpperCase())+'</span><h2>'+esc(p.name)+'</h2><strong class="price">'+money(p.price_cents)+'</strong><p>'+esc(p.description)+'</p><p>'+esc(p.editorial_copy)+'</p>'+v+'<button class="product-cta" '+(!canAdd?'disabled':'')+' data-add-bag>'+(!canAdd?'COMING SOON':'ADD TO BAG')+'</button><p class="product-honesty">'+(p.demo?'DEMO PRODUCT · This V1 item is for ecosystem demonstration until KŌMØ confirms commercial availability.':'Availability shown is current.')+'</p></div></div>';
 $('#productModal').classList.add('open');$('#productModal').setAttribute('aria-hidden','false');
 $$('[data-product-close]').forEach(x=>x.onclick=closeProduct);$('[data-add-bag]')?.addEventListener('click',()=>addBag(p));
 if(push)history.replaceState({},'',location.pathname+'?product='+encodeURIComponent(p.slug));
}
function closeProduct(){$('#productModal').classList.remove('open');$('#productModal').setAttribute('aria-hidden','true');history.replaceState({},'',location.pathname)}
function addBag(p){
 const variant={};$$('[data-variant]').forEach((s,i)=>variant[(p.variants?.[i]?.name)||('Option '+i)]=s.value);
 const key=p.id+'|'+JSON.stringify(variant),found=state.bag.find(x=>x.key===key);
 if(found)found.quantity=Math.min(20,found.quantity+1);else state.bag.push({key,product_id:p.id,quantity:1,variant});
 saveBag();analytics('product_added_to_bag','life_product',p.id,{quantity:1});toast('Added to bag');closeProduct();
}
function bagItem(x){
 const p=state.products.find(p=>p.id===x.product_id);if(!p)return'';return '<div class="bag-item"><img src="'+esc(p.image_path||'')+'" alt=""><div><b>'+esc(p.name)+'</b><small>'+x.quantity+' × '+money(p.price_cents)+(Object.keys(x.variant||{}).length?' · '+esc(Object.values(x.variant).join(' / ')):'')+'</small></div><button data-remove="'+esc(x.key)+'">×</button></div>';
}
function openBag(){
 $('#bagDrawer').classList.add('open');$('#bagDrawer').setAttribute('aria-hidden','false');
 const root=$('#bagBody');root.className='bag-body';
 const total=state.bag.reduce((sum,x)=>{const p=state.products.find(p=>p.id===x.product_id);return sum+(p?.price_cents||0)*x.quantity},0);
 root.innerHTML=state.bag.length?state.bag.map(bagItem).join('')+'<div class="bag-summary"><div class="bag-total"><b>SUBTOTAL</b><strong>'+money(total)+'</strong></div><p>Shipping and payment are not charged in this V1. Checkout creates an order request only.</p><button data-checkout>CONTINUE</button></div>':'<div class="product-empty">Your bag is empty.</div>';
 $$('[data-remove]').forEach(b=>b.onclick=()=>{state.bag=state.bag.filter(x=>x.key!==b.dataset.remove);saveBag();openBag()});
 $('[data-checkout]')?.addEventListener('click',checkout);
}
function closeBag(){$('#bagDrawer').classList.remove('open');$('#bagDrawer').setAttribute('aria-hidden','true')}
async function checkout(){
 if(!state.bag.length)return;
 if(!state.session?.user){await connectPulse();toast('Sign in with your KŌMØ identity to continue');return}
 if(!has('life.order.create')){toast('KŌMØ ONE is required to create a Life order in this V1');return}
 closeBag();openCheckout();
}
function openCheckout(){
 const p=state.profile||{};$('#checkoutSheet').innerHTML='<button class="checkout-close" data-checkout-close>×</button><span class="ey">KŌMØ LIFE · CHECKOUT V1</span><h2>Shipping details.</h2><p>No payment is collected in this V1. Submitting creates a real order request linked to your KŌMØ identity.</p><form class="checkout-form" id="lifeCheckoutForm"><label class="full"><span>NAME</span><input name="name" value="'+esc(p.display_name||[p.first_name,p.last_name].filter(Boolean).join(' '))+'" required></label><label class="full"><span>ADDRESS</span><input name="line1" required></label><label class="full"><span>ADDRESS LINE 2</span><input name="line2"></label><label><span>POSTCODE</span><input name="postal_code" required></label><label><span>CITY</span><input name="city" value="'+esc(p.city||'')+'" required></label><label class="full"><span>COUNTRY</span><input name="country" value="'+esc(p.country||'')+'" required></label><label class="full"><span>NOTE</span><textarea name="note"></textarea></label><button type="submit">CREATE ORDER REQUEST</button><div class="checkout-note">Payment status will remain <b>NOT CONFIGURED</b>. KŌMØ will not represent this request as a paid order.</div></form>';
 $('#checkoutModal').classList.add('open');$('#checkoutModal').setAttribute('aria-hidden','false');$$('[data-checkout-close]').forEach(x=>x.onclick=closeCheckout);$('#lifeCheckoutForm').addEventListener('submit',submitOrder);
}
function closeCheckout(){$('#checkoutModal').classList.remove('open');$('#checkoutModal').setAttribute('aria-hidden','true')}
async function submitOrder(e){
 e.preventDefault();const f=new FormData(e.currentTarget),shipping={name:String(f.get('name')||'').trim(),line1:String(f.get('line1')||'').trim(),line2:String(f.get('line2')||'').trim(),postal_code:String(f.get('postal_code')||'').trim(),city:String(f.get('city')||'').trim(),country:String(f.get('country')||'').trim()};
 const items=state.bag.map(x=>({product_id:x.product_id,quantity:x.quantity,variant:x.variant||{}}));
 const {data,error}=await supabase.rpc('life_create_order_v1',{p_items:items,p_shipping:shipping,p_note:String(f.get('note')||'').trim()||null});
 if(error){toast('Order request could not be created');return}
 analytics('order_created','life_order',data.order_id,{total_cents:data.total_cents,payment_status:data.payment_status});
 state.bag=[];saveBag();$('#checkoutSheet').innerHTML='<div class="order-confirm"><span class="ey">ORDER REQUEST RECEIVED</span><h3>'+esc(data.order_number)+'</h3><p>Your KŌMØ Life request has been recorded. Total: '+money(data.total_cents)+'. <b>No payment has been collected.</b></p><a href="/home/?you=1">VIEW IN YOU →</a></div>';toast('Order request created');
}
async function openOrders(){
 if(!state.session?.user){await connectPulse();return}
 if(!has('life.orders.view'))return;
 const {data}=await supabase.from('life_orders').select('id,order_number,status,payment_status,total_cents,currency,created_at').eq('user_id',state.session.user.id).order('created_at',{ascending:false}).limit(20);
 $('#checkoutSheet').innerHTML='<button class="checkout-close" data-checkout-close>×</button><span class="ey">YOU · ORDERS</span><h2>Your Life orders.</h2><p>Orders and requests linked to your KŌMØ identity.</p>'+((data||[]).length?(data||[]).map(o=>'<div class="order-confirm" style="margin-top:8px"><span class="ey">'+esc(o.status.toUpperCase())+' · '+esc(o.payment_status.toUpperCase())+'</span><h3>'+esc(o.order_number)+'</h3><p>'+money(o.total_cents)+' · '+new Date(o.created_at).toLocaleDateString()+'</p></div>').join(''):'<div class="product-empty">No Life orders yet.</div>');
 $('#checkoutModal').classList.add('open');$$('[data-checkout-close]').forEach(x=>x.onclick=closeCheckout);
}
$$('[data-category]').forEach(b=>b.onclick=()=>{state.category=b.dataset.category;$$('[data-category]').forEach(x=>x.classList.toggle('active',x===b));renderProducts()});
$('#lifeBag').onclick=openBag;$$('[data-bag-close]').forEach(x=>x.onclick=closeBag);$$('[data-product-close]').forEach(x=>x.onclick=closeProduct);$$('[data-checkout-close]').forEach(x=>x.onclick=closeCheckout);
$('#lifeAccess').onclick=()=>location.href='/home/?you=1';
onSession(()=>load());loadBag();load().then(()=>analytics('life_opened'));
