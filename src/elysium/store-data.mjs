// ELYSIUM retail catalogue. Editorial offerings are not statements of signed partner agreements.
const img=(id)=>'https://images.unsplash.com/'+id+'?auto=format&fit=crop&w=1100&q=82';
const product=(id,en,fr,kind,tag,image,copyEn,copyFr,priceEn='Private quotation',priceFr='Sur devis')=>({
 id,en,fr,kind,tag,image:img(image),copyEn,copyFr,priceEn,priceFr
});
export const WORLDS=[
{
slug:'longevity',no:'01',icon:'◈',name:'Longevity',full:'KŌMØ Longevity',eyebrow:'THE MOVEMENT ATELIER',
subtitleEn:'The luxury of knowing yourself.',subtitleFr:'Le luxe de mieux se connaître.',
copyEn:'A private approach to locomotor longevity. Discover your functional abilities at home or aboard your yacht, then continue the journey with Pulse.',
copyFr:'Une approche privée de la longévité locomotrice. Mesurez vos capacités fonctionnelles à distance ou à bord et poursuivez votre trajectoire avec Pulse.',
image:img('photo-1530549387789-4c1017266635'),background:'linear-gradient(115deg,#202b2d,#0b1619)',
products:[
product('motion-vip','The Private Motion Experience','Bilan Motion Signature à bord','PRIVATE ASSESSMENT','ON BOARD / PRIVATE RESIDENCE','photo-1518837695005-2083093ee35b',
'A personalised non-medical functional assessment of movement, balance, strength and mobility, arranged aboard or in a private residence. Individual quotation.','Un bilan fonctionnel non médical personnalisé : mouvement, équilibre, force et mobilité, organisé à bord ou dans une résidence privée. Devis personnalisé.'),
product('motion-online','Online Motion Passport','Passeport Motion en ligne','ONLINE EXPERIENCE','DIGITAL / BOOK ONLINE','photo-1506126613408-eca07ce68773',
'A guided online Motion Check with a personal functional report and follow-up direction. Booking through KŌMØ Pulse.','Un Motion Check guidé en ligne avec passeport fonctionnel personnalisé et orientation pour le suivi. Réservation via KŌMØ Pulse.','€49','49 €'),
product('pulse-continuity','Pulse Private Follow-Up','Suivi privé Pulse','PRIVATE PROGRAMME','MOVEMENT / FOLLOW-UP','photo-1571019613454-1cb2f99b2d8b',
'A tailored movement follow-up with priorities, daily exercises and re-assessment planning according to your measured capacity.','Un suivi du mouvement sur mesure avec priorités, exercices quotidiens et programmation de réévaluations selon les capacités mesurées.')
]},
{
slug:'aesthetic',no:'02',icon:'✧',name:'Aesthetic',full:'KŌMØ Aesthetic',eyebrow:'THE BEAUTY ATELIER',
subtitleEn:'Beauty, with discretion.',subtitleFr:'La beauté, dans la discrétion.',
copyEn:'Refined aesthetic journeys and carefully coordinated private appointments with independent licensed professionals.',
copyFr:'Des parcours esthétiques raffinés et des rendez-vous privés coordonnés auprès de professionnels indépendants habilités.',
image:img('photo-1540555700478-4be289fbecef'),background:'linear-gradient(135deg,#40342d,#161513)',
products:[
product('aesthetic-consultation','Private Aesthetic Consultation','Consultation esthétique privée','PRIVATE CONSULTATION','MEDICAL / PARTNER','photo-1611930022073-b7a4ba5fcccd','A discreet introduction to an authorised aesthetic professional for assessment and individual treatment options.','Une mise en relation confidentielle avec un professionnel de l’esthétique habilité pour une évaluation et des options individualisées.'),
product('skin-ritual','Bespoke Skin Ritual','Rituel de soin personnalisé','BEAUTY EXPERIENCE','SKIN / CARE','photo-1556228578-0d85b1a4d571','A thoughtful skin-care experience selected around individual preferences and expert guidance.','Une expérience de soin cutané construite autour des préférences personnelles et des conseils d’experts.'),
product('aesthetic-concierge','Beauty Appointment Concierge','Conciergerie esthétique','CONCIERGE','PRIVATE / APPOINTMENTS','photo-1596462502278-27bfdc403348','Private coordination of aesthetic consultations and related appointments, subject to professional assessment.','Coordination privée des consultations et rendez-vous esthétiques, sous réserve de l’évaluation des professionnels.')
]},
{
slug:'iv-drip',no:'03',icon:'✚',name:'IV Drip',full:'KŌMØ IV Drip',eyebrow:'THE CLINICAL COORDINATION',
subtitleEn:'Care with clear boundaries.',subtitleFr:'Le soin, avec un cadre rigoureux.',
copyEn:'An independent medical pathway for infusion-related enquiries where clinically indicated; no infusion is marketed as a proven longevity treatment.',
copyFr:'Un parcours de coordination médicale indépendant lorsque l’indication d’une perfusion est établie ; aucune perfusion n’est présentée comme un traitement de longévité.',
image:img('photo-1576091160399-112ba8d25d1d'),background:'linear-gradient(135deg,#2a3738,#101b1e)',
products:[
product('medical-orientation','Medical Suitability Assessment','Évaluation médicale préalable','MEDICAL REFERRAL','LICENCED PROFESSIONAL','photo-1576091160550-2173dba999ef','Referral to an appropriately authorised physician to assess the appropriateness and safety of any proposed intravenous treatment.','Orientation vers un médecin habilité afin d’évaluer la pertinence et la sécurité d’un traitement intraveineux.'),
product('clinical-coordination','Independent Clinical Coordination','Coordination de soins indépendante','CLINICAL COORDINATION','MEDICAL / INDEPENDENT','photo-1584982751601-97dcc096659c','Scheduling and coordination with authorised healthcare providers when a physician determines a medical indication.','Coordination avec des professionnels autorisés lorsqu’une indication médicale est établie par un médecin.'),
product('private-care-logistics','Private Care Logistics','Logistique médicale privée','CONCIERGE','ON REQUEST / SUPERVISED','photo-1579684385127-1ef15d508118','Discreet scheduling and logistics for independently prescribed care, subject to local requirements and medical monitoring.','Organisation logistique discrète de soins prescrits indépendamment, selon les obligations locales et la surveillance requise.')
]},
{
slug:'cosmetic-supplements',no:'04',icon:'◒',name:'Cosmetic & Supplements',full:'KŌMØ Cosmetic & Supplements',eyebrow:'THE DAILY ESSENTIALS',
subtitleEn:'Considered rituals, beautifully chosen.',subtitleFr:'Des essentiels choisis avec exigence.',
copyEn:'A curated retail selection of cosmetic essentials, beauty products and traceable supplements, without unsupported clinical or anti-ageing promises.',
copyFr:'Une sélection de cosmétiques, d’essentiels de beauté et de compléments traçables, sans promesse clinique ni anti-âge non démontrée.',
image:img('photo-1608248543803-ba4f8c70ae0b'),background:'linear-gradient(135deg,#4a4237,#1b201a)',
products:[
product('signature-skincare','Signature Skincare Selection','Sélection de soins signature','CURATED PRODUCTS','SKINCARE / SELECTION','photo-1601049541289-9b1b7bbbfe19','A private edit of refined skincare products, selected for quality, composition and traceability.','Une sélection privée de soins cutanés raffinés, choisis pour leur qualité, composition et traçabilité.'),
product('beauty-essentials','Private Beauty Essentials','Essentiels beauté privés','CURATED PRODUCTS','PERSONAL / DELIVERY','photo-1596462502278-27bfdc403348','Premium daily cosmetic essentials curated around preferences and practical delivery requests.','Des essentiels cosmétiques premium choisis selon vos préférences et demandes de livraison.'),
product('supplement-edit','Supplement Sourcing Edit','Sélection de compléments','PRODUCT INFORMATION','COMPLIANCE / TRACEABILITY','photo-1471864190281-a93a3070b6de','Regulatory-compliant product information and sourcing, without disease-treatment or lifespan-extension claims.','Information et sourcing conformes des produits, sans allégation thérapeutique ni promesse de prolongation de la vie.')
]},
{
slug:'life',no:'05',icon:'∞',name:'Life',full:'KŌMØ Life',eyebrow:'THE SOCIAL SALON',
subtitleEn:'The rare art of connection.',subtitleFr:'L’art rare de la rencontre.',
copyEn:'Invitation-led experiences, culture and private introductions. Social and dating services are opt-in for verified adults, entirely separate from health records.',
copyFr:'Expériences sur invitation, culture et introductions privées. Les rencontres et le dating sont facultatifs pour adultes vérifiés, sans aucun lien avec les données de santé.',
image:img('photo-1511795409834-ef04bbd61622'),background:'linear-gradient(135deg,#604839,#221b1b)',
products:[
product('private-salon','The Private Salon','Le Salon Privé','PRIVATE INVITATION','EVENTS / SOCIAL','photo-1511795409834-ef04bbd61622','Intimate curated gatherings and private occasions for selected groups and invited members.','Des réceptions en petit comité et événements privés organisés pour des groupes sélectionnés.'),
product('introductions','Curated Introductions','Introductions choisies','OPT-IN SOCIAL','ADULTS / CONSENT','photo-1529156069898-49953e39b3ac','Optional introductions for consenting verified adults. No Motion Score or health information is used to match members.','Mises en relation facultatives entre adultes consentants et vérifiés, sans utilisation du Motion Score ni de données médicales.'),
product('cultural-access','Art & Cultural Experiences','Expériences culturelles privées','CULTURAL EXPERIENCES','ART / PRIVATE ACCESS','photo-1579783902614-a3fb3927b6a5','Private cultural visits, intimate art experiences and bespoke social itineraries upon request.','Visites culturelles privées, expériences artistiques intimistes et itinéraires personnalisés sur demande.')
]},
{
slug:'gastronomy',no:'06',icon:'✦',name:'Gastronomy',full:'KŌMØ Gastronomy',eyebrow:'THE TABLE COLLECTION',
subtitleEn:'An exceptional taste for life.',subtitleFr:'Le goût d’une vie d’exception.',
copyEn:'Private chefs, memorable tables and considered tasting experiences across Monaco and the Riviera, on land or at anchor.',
copyFr:'Chefs privés, tables mémorables et dégustations choisies entre Monaco et la Riviera, à terre ou au mouillage.',
image:img('photo-1414235077428-338989a2e8c0'),background:'linear-gradient(135deg,#4d3327,#1f1b16)',
products:[
product('chef-onboard','Private Chef on Board','Chef privé à bord','BESPOKE DINING','YACHT / VILLA','photo-1577219491135-ce391730fb2c','An exceptional private dining experience created for your yacht, residence or villa, subject to chef availability.','Une expérience gastronomique créée à bord d’un yacht, dans une résidence ou une villa, selon la disponibilité du chef.'),
product('private-table','The Exceptional Table','La Table d’Exception','PRIVATE TABLE','RIVIERA / RESERVATIONS','photo-1414235077428-338989a2e8c0','Access enquiries for distinctive tables and intimate private dining rooms with bespoke service.','Demandes pour des tables remarquables et des salons privés avec une prestation sur mesure.'),
product('cellar','The Private Cellar','La Cave Privée','TASTING EXPERIENCE','ADULTS / CULTURE','photo-1510812431401-41d2bd2722f3','Wine and spirits tasting as an adult-only cultural and gastronomic experience, never advertised for health benefits.','Dégustation de vins et spiritueux réservée aux adultes dans une démarche culturelle et gastronomique, sans bénéfice de santé allégué.')
]},
{
slug:'high-luxury',no:'07',icon:'◇',name:'High Luxury',full:'KŌMØ High Luxury',eyebrow:'THE RARE OBJECTS COLLECTION',
subtitleEn:'An eye for the extraordinary.',subtitleFr:'Le regard de l’exception.',
copyEn:'Exceptional watches, gemstones and high jewellery sourced discreetly, subject to provenance and independent verification.',
copyFr:'Montres d’exception, gemmes et haute joaillerie recherchées dans la discrétion, sous réserve de provenance et vérification indépendante.',
image:img('photo-1523275335684-37898b6baf30'),background:'linear-gradient(135deg,#454039,#111313)',
products:[
product('timepieces','Exceptional Timepieces','Garde-temps d’exception','PRIVATE SOURCING','HOROLOGY / AUTHENTICATION','photo-1523275335684-37898b6baf30','Private sourcing of prestigious watches; availability, authenticity and provenance checked before any transaction.','Recherche privée de montres prestigieuses, avec disponibilité, authenticité et provenance vérifiées avant toute transaction.'),
product('gemstones','Rare Gemstones','Gemmes rares','PRIVATE SOURCING','GEMSTONES / VERIFICATION','photo-1515562141207-7a88fb7ce338','Individual requests for rare gemstones and bespoke gemmology introductions, subject to verification.','Demandes individuelles pour pierres précieuses rares et mise en relation gemmologique, sous réserve de vérification.'),
product('jewellery','High Jewellery Appointment','Rendez-vous haute joaillerie','PRIVATE SOURCING','JEWELLERY / PRIVATE','photo-1617038220319-276d3cfab638','Private introductions for distinctive jewellery houses and exceptional collectible pieces.','Mises en relation privées avec des maisons de joaillerie et pièces de collection exceptionnelles.')
]},
{
slug:'service',no:'08',icon:'⌁',name:'Service',full:'KŌMØ Service',eyebrow:'THE PRIVATE CONCIERGE',
subtitleEn:'Everything considered.',subtitleFr:'Chaque détail compte.',
copyEn:'One discreet point of contact for yachting, residences, reservations and exceptionally considered requests.',
copyFr:'Un interlocuteur discret pour l’univers du yachting, les résidences, réservations et demandes les plus singulières.',
image:img('photo-1519046904884-53103b34b206'),background:'linear-gradient(135deg,#26343a,#0d1c20)',
products:[
product('yacht-concierge','Yacht Concierge','Conciergerie yacht','PRIVATE SERVICES','CAPTAINS / OWNER OFFICE','photo-1567899378494-47b22a2ae96a','Discreet onboard service coordination with owners, captain and chief stew, respecting yacht operational protocols.','Coordination discrète des services à bord auprès du propriétaire, du capitaine et du chief stew, dans le respect des procédures du yacht.'),
product('villa-residence','Private Residence Concierge','Conciergerie villa & résidence','PRIVATE SERVICES','VILLA / RESIDENCE','photo-1600607687920-4e2a09cf159d','Exceptional requests and tailored residence services, arranged with selected local providers.','Demandes d’exception et prestations personnalisées en résidence avec des prestataires locaux sélectionnés.'),
product('destination','Destination Atelier','Atelier Destinations','PRIVATE SERVICES','RIVIERA / TRAVEL','photo-1500534623283-312aade485b7','Thoughtful concierge planning for travel, stays, private appointments and exclusive occasions.','Conciergerie personnalisée pour voyages, séjours, rendez-vous privés et occasions exclusives.')
]},
{
slug:'team',no:'09',icon:'☼',name:'Team',full:'KŌMØ Team',eyebrow:'THE PRIVATE MOVEMENT TEAM',
subtitleEn:'The people behind your potential.',subtitleFr:'Les experts au service du mouvement.',
copyEn:'Qualified coaches, Pilates instructors and movement experts, delivering tailored sessions in your home, studio or yacht.',
copyFr:'Coachs qualifiés, instructeurs de Pilates et experts du mouvement pour des séances sur mesure à domicile, en studio ou à bord.',
image:img('photo-1571019613454-1cb2f99b2d8b'),background:'linear-gradient(135deg,#3f4236,#161a15)',
products:[
product('private-coach','Private Performance Coach','Coach personnel privé','PERSONAL COACHING','ON BOARD / VILLA','photo-1571019613454-1cb2f99b2d8b','A personal movement and fitness session with a suitably qualified coach at your preferred location.','Une séance de coaching et remise en forme avec un professionnel qualifié sur votre lieu de choix.'),
product('pilates','Pilates On Board','Pilates à bord','MOVEMENT EXPERIENCE','YACHT / RESIDENCE','photo-1518611012118-696072aa579a','Personal Pilates sessions with an instructor in a suitable space aboard or at home.','Séances individuelles de Pilates encadrées par un instructeur dans un espace adapté à bord ou à domicile.'),
product('mobility','Mobility & Balance Atelier','Atelier mobilité & équilibre','MOVEMENT EXPERIENCE','FUNCTIONAL / PERSONALISED','photo-1517836357463-d25dfeac3438','An individual mobility and balance session for wellbeing and movement. Medical rehabilitation remains separate and licensed.','Séance individuelle de mobilité et équilibre. La rééducation thérapeutique demeure distincte et relève de professionnels habilités.')
]}
];
export const WORLD_BY_SLUG=Object.fromEntries(WORLDS.map(w=>[w.slug,w]));
