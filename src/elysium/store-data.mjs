// ELYSIUM retail catalogue. Editorial offerings are not statements of signed partner agreements.
const img=(id)=>'https://images.unsplash.com/'+id+'?auto=format&fit=crop&w=1100&q=82';
const product=(id,en,fr,kind,tag,image,copyEn,copyFr,priceEn='Private quotation',priceFr='Sur devis')=>({
 id,en,fr,kind,tag,image:img(image),copyEn,copyFr,priceEn,priceFr
});
const medical=p=>({kind:'INDEPENDENT MEDICAL CARE',priceEn:'Physician quotation',priceFr:'Honoraires sur proposition du médecin',...p});
const LEGACY_WORLDS=[
{
slug:'longevity',no:'01',icon:'◈',name:'Longevity',full:'KŌMØ Longevity',eyebrow:'PRIVATE MEDICAL LONGEVITY',
subtitleEn:'By video, on board or in your residence.',subtitleFr:'En visioconférence, à bord ou en résidence privée.',
copyEn:'A curated pathway to independent medical consultations focused on prevention, assessment and follow-up. Choose a secure teleconsultation, a private medical appointment on board or in residence, or an in-person visit where offered. Medical decisions remain solely with the physician.',
copyFr:'Un parcours de consultations médicales indépendantes consacré à la prévention, à l’évaluation et au suivi. Téléconsultation sécurisée, rendez-vous privé à bord ou en résidence, ou consultation présentielle selon les disponibilités. Toute décision médicale relève exclusivement du médecin.',
image:img('photo-1530549387789-4c1017266635'),background:'linear-gradient(115deg,#202b2d,#0b1619)',
products:[
medical({
 id:'medical-longevity-online',en:'Online Consultation',fr:'Consultation en ligne',modeEn:'VIDEO CONSULTATION',modeFr:'EN VISIO',shortEn:'A private consultation with a physician, wherever you are.',shortFr:'Échangez avec un médecin, où que vous soyez.',
 tag:'01 · VIDEO CONSULTATION',glyph:'pulse',
 copyEn:'A private video consultation with an independent qualified physician to discuss your medical history, prevention priorities and appropriate follow-up. The doctor decides whether remote care is suitable.',
 copyFr:'Une consultation en visioconférence sécurisée avec un médecin indépendant habilité, pour aborder les antécédents, les priorités de prévention et le suivi adapté. Le médecin décide si la téléconsultation est indiquée.',
 detailEn:'Begin with a dedicated medical conversation. After availability and suitability are confirmed, the physician conducts the consultation on their compliant care platform, may propose examinations or follow-up and remains responsible for medical records and decisions.',
 detailFr:'Commencez par un échange médical dédié. Après confirmation de la disponibilité et de la pertinence du format, le médecin réalise la consultation sur sa plateforme de soins adaptée, peut proposer des examens ou un suivi et demeure responsable du dossier médical et de ses décisions.',
 pointsEn:['Secure video appointment with an authorised doctor','Medical history, prevention and personal priorities','Individual clinical plan at the physician’s discretion'],
 pointsFr:['Rendez-vous vidéo sécurisé avec un médecin habilité','Antécédents, prévention et priorités personnelles','Conduite à tenir médicale décidée par le praticien'],
 stepsEn:["Choose your date.","The physician confirms the appointment.","Consult on a secure medical platform."],
 stepsFr:["Choisissez votre date.","Le médecin confirme le rendez-vous.","Consultez sur une plateforme médicale sécurisée."],
 buttonEn:'VIEW THE ONLINE CONSULTATION',buttonFr:'DÉCOUVRIR LA TÉLÉCONSULTATION'
}),
medical({
 id:'medical-longevity-onboard',en:'Physician On Board',fr:'Médecin à bord',modeEn:'ON BOARD / RESIDENCE',modeFr:'À BORD / RÉSIDENCE',shortEn:'A physician visit on board or in your residence.',shortFr:'Un médecin se déplace sur votre yacht ou en résidence.',
 tag:'02 · YACHT / VILLA / RESIDENCE',glyph:'horizon',
 copyEn:'A discreet request for an independent physician to attend a yacht or private residence for a medical assessment, subject to the setting, local law and clinical safety requirements.',
 copyFr:'Une demande de déplacement d’un médecin indépendant sur un yacht ou en résidence privée pour une évaluation médicale, sous réserve du lieu, du droit applicable et des conditions de sécurité.',
 detailEn:'Designed for clients who favour privacy and continuity while travelling. The physician first assesses the medical purpose and whether the vessel or residence can provide a suitable setting. Examination, care, documentation and any prescriptions remain entirely within independent medical practice.',
 detailFr:'Pensée pour les clients recherchant confidentialité et continuité lors de leurs déplacements. Le médecin vérifie d’abord l’objet de la demande et si le yacht ou la résidence offre un cadre adapté. L’examen, les soins, les documents et les prescriptions relèvent de son exercice médical indépendant.',
 pointsEn:['Physician visit subject to medical suitability','Yacht, villa or residence by individual arrangement','Private logistics and separate physician quotation'],
 pointsFr:['Déplacement sous réserve de pertinence médicale','Yacht, villa ou résidence après organisation individuelle','Logistique discrète et honoraires distincts du médecin'],
 stepsEn:["Share the location and date.","Availability and suitability are checked.","The doctor confirms the visit and fees."],
 stepsFr:["Précisez le lieu et la date.","La disponibilité et la faisabilité sont vérifiées.","Le médecin confirme sa visite et ses honoraires."],
 buttonEn:'VIEW PRIVATE PHYSICIAN VISIT',buttonFr:'DÉCOUVRIR LA VISITE MÉDICALE À BORD'
}),
medical({
 id:'medical-longevity-clinic',en:'In-Person Consultation',fr:'Consultation en présentiel',modeEn:'PRIVATE APPOINTMENT',modeFr:'EN CABINET',shortEn:'A complete assessment with an independent physician.',shortFr:'Un bilan médical approfondi avec un médecin indépendant.',
 tag:'03 · IN PERSON / BY APPOINTMENT',glyph:'rings',
 copyEn:'An in-person consultation with an independent physician for a considered review of health, preventive priorities and any appropriate examinations or specialist referrals.',
 copyFr:'Une consultation en présentiel avec un médecin indépendant pour une analyse personnalisée de la santé, des priorités préventives et, si nécessaire, d’examens ou d’orientations spécialisées.',
 detailEn:'The medical consultation is scheduled with an authorised professional at an appropriate care location, subject to the available practitioner and city. Where helpful, KŌMØ Motion may be discussed as a separate non-medical functional measurement service, never as a substitute for medical examination.',
 detailFr:'La consultation est organisée auprès d’un professionnel habilité dans un lieu de soins adapté, selon les praticiens et les villes disponibles. Le bilan KŌMØ Motion peut être évoqué comme prestation fonctionnelle non médicale distincte, sans remplacer l’examen clinique.',
 pointsEn:['Independent physician consultation at an appropriate location','Personal medical assessment and possible investigations','Separate optional non-medical KŌMØ Motion assessment'],
 pointsFr:['Consultation par un médecin indépendant dans un lieu adapté','Évaluation médicale et examens éventuels selon indication','Bilan KŌMØ Motion non médical possible en complément séparé'],
 stepsEn:["Choose a location and date.","The physician confirms the appointment.","Meet the physician in person."],
 stepsFr:["Choisissez un lieu et une date.","Le médecin confirme le rendez-vous.","Rencontrez le médecin en consultation."],
 buttonEn:'EXPLORE THE MEDICAL CONSULTATION',buttonFr:'DÉCOUVRIR LA CONSULTATION MÉDICALE'
}),
medical({
 id:'medical-longevity-followup',en:'Medical Follow-Up',fr:'Suivi médical privé',modeEn:'ONGOING CARE',modeFr:'SUIVI',shortEn:'Individual care, organised over time.',shortFr:'Des rendez-vous et un suivi adaptés à votre situation.',
 tag:'04 · CONTINUITY / CARE PLAN',glyph:'trajectory',
 copyEn:'A follow-up pathway organised around the independent physician’s clinical recommendations, with appointments online or in person where appropriate.',
 copyFr:'Un parcours de suivi organisé autour des recommandations du médecin indépendant, avec des consultations en ligne ou en présentiel lorsque cela est pertinent.',
 detailEn:'A confidential organisational pathway for future medical appointments, review of clinician-requested examinations and continuity of care. KŌMØ may coordinate logistics; only the treating clinicians access and manage medical information.',
 detailFr:'Un parcours d’organisation confidentielle des consultations à venir, des résultats d’examens prescrits par le médecin et de la continuité des soins. KŌMØ coordonne uniquement la logistique ; seuls les soignants gèrent les données médicales.',
 pointsEn:['Individual medical follow-up determined by the doctor','Remote or in-person appointments as medically appropriate','Concierge assistance for scheduling, not clinical decisions'],
 pointsFr:['Suivi individuel déterminé par le médecin','Rendez-vous à distance ou en présentiel selon indication','Conciergerie pour les rendez-vous, sans décision clinique'],
 stepsEn:["Request a follow-up.","The doctor proposes a suitable plan.","Arrange your next appointments."],
 stepsFr:["Demandez un suivi.","Le médecin propose un parcours adapté.","Organisez les prochains rendez-vous."],
 buttonEn:'DISCOVER THE FOLLOW-UP PATHWAY',buttonFr:'DÉCOUVRIR LE PARCOURS DE SUIVI'
})
]
},
{
slug:'aesthetic',no:'02',icon:'✧',name:'Aesthetic',full:'KŌMØ Aesthetic',eyebrow:'PRIVATE AESTHETIC MEDICINE',
subtitleEn:'Medical consultations, online or in person.',subtitleFr:'Consultations médicales, en ligne ou sur place.',
copyEn:'Confidential medical aesthetic consultations and, where clinically appropriate, physician visits in a suitable private setting. All examinations, decisions and procedures belong to independent authorised doctors.',
copyFr:'Consultations de médecine esthétique confidentielles et, lorsque cela est médicalement approprié, déplacements d’un médecin dans un lieu privé adapté. Examens, décisions et actes relèvent de médecins indépendants habilités.',
image:img('photo-1540555700478-4be289fbecef'),background:'linear-gradient(135deg,#47342f,#1d1a1a)',
products:[
medical({
 id:'aesthetic-medical-video',en:'Online Aesthetic Consultation',fr:'Consultation en ligne',modeEn:'VIDEO CONSULTATION',modeFr:'EN VISIO',shortEn:'A private first consultation with an aesthetic physician.',shortFr:'Un premier échange avec un médecin esthétique.',
 tag:'01 · MEDICAL VIDEO CONSULTATION',glyph:'profile',
 copyEn:'An initial medical discussion with an independent aesthetic physician about expectations, medical suitability and the potential need for an in-person examination.',
 copyFr:'Un premier échange médical en visioconférence avec un médecin esthétique indépendant autour des attentes, de la pertinence des options et de la nécessité éventuelle d’un examen présentiel.',
 detailEn:'This secure preliminary consultation allows a medical professional to discuss your concerns and explain possible next steps. It does not guarantee a procedure, and a face-to-face clinical consultation may be essential before treatment.',
 detailFr:'Cette téléconsultation préalable sécurisée permet au médecin d’échanger sur les attentes et les suites possibles. Elle ne garantit aucun acte, et une consultation clinique en présence peut être indispensable avant tout traitement.',
 pointsEn:['Independent licensed aesthetic physician','Discussion of preferences and clinical suitability','In-person consultation arranged if needed'],
 pointsFr:['Médecin esthétique indépendant habilité','Discussion des attentes et de la pertinence médicale','Examen en présentiel organisé si nécessaire'],
 stepsEn:["Choose your date.","An aesthetic physician confirms.","Consult by secure video."],
 stepsFr:["Choisissez une date.","Le médecin esthétique confirme.","Consultez en vidéo sécurisée."],
 buttonEn:'VIEW AESTHETIC TELECONSULTATION',buttonFr:'DÉCOUVRIR LA TÉLÉCONSULTATION ESTHÉTIQUE'
}),
medical({
 id:'aesthetic-physician-onboard',en:'Aesthetic Physician On Board',fr:'Médecin à bord',modeEn:'ON BOARD / RESIDENCE',modeFr:'À BORD / RÉSIDENCE',shortEn:'A private medical consultation where you stay.',shortFr:'Une consultation médicale sur votre yacht ou en résidence.',
 tag:'02 · PRIVATE VISIT / ON BOARD',glyph:'constellation',
 copyEn:'Arrange an independent aesthetic physician’s visit to a yacht, villa or residence for a medical consultation, with any procedures strictly dependent on clinical and environmental suitability.',
 copyFr:'Demandez le déplacement d’un médecin esthétique indépendant à bord, en villa ou en résidence pour une consultation médicale ; tout acte éventuel dépend strictement de l’indication et de l’adaptation du lieu.',
 detailEn:'A confidential physician-led aesthetic consultation organised around your travel. The medical professional determines whether any examination or procedure can be carried out safely in the proposed location; some interventions must instead take place in an appropriately equipped medical setting.',
 detailFr:'Une consultation esthétique médicale confidentielle adaptée à votre déplacement. Le médecin détermine si un examen ou un acte peut être pratiqué en sécurité dans le lieu proposé ; certaines interventions imposent un établissement ou cabinet médical adapté.',
 pointsEn:['Yacht, private residence or villa on request','Independent medical evaluation before any intervention','Provider, safety, fee and venue confirmed separately'],
 pointsFr:['Yacht, résidence privée ou villa sur demande','Évaluation médicale préalable à tout geste éventuel','Prestataire, sécurité, honoraires et lieu validés séparément'],
 stepsEn:["Specify the location and date.","The doctor checks suitability.","The visit is confirmed if appropriate."],
 stepsFr:["Précisez le lieu et la date.","Le médecin vérifie les conditions de soins.","La visite est confirmée si adaptée."],
 buttonEn:'EXPLORE THE ON-BOARD PHYSICIAN VISIT',buttonFr:'DÉCOUVRIR LA VISITE MÉDICALE À BORD'
}),
medical({
 id:'aesthetic-medical-pathway',en:'Private Aesthetic Programme',fr:'Parcours esthétique privé',modeEn:'IN PERSON / FOLLOW-UP',modeFr:'EN PRÉSENTIEL / SUIVI',shortEn:'A tailored medical aesthetic assessment and follow-up.',shortFr:'Une consultation et un suivi esthétique personnalisés.',
 tag:'03 · CONSULTATION & FOLLOW-UP',glyph:'petals',
 copyEn:'An individual medical aesthetic journey with an independent doctor: assessment, suitable treatment options if clinically indicated, and follow-up appointments in an appropriate care setting.',
 copyFr:'Un parcours individualisé de médecine esthétique avec un médecin indépendant : consultation, options éventuelles adaptées après examen et rendez-vous de suivi dans un cadre de soins approprié.',
 detailEn:'The treating physician decides the timing, location, conditions and suitability of all medical procedures. ELYSIUM supports only the private scheduling and concierge logistics; no treatment is sold or promised in advance.',
 detailFr:'Le médecin traitant décide des délais, du lieu, des conditions et de l’indication de tout acte médical. ELYSIUM intervient uniquement pour les rendez-vous et la logistique privée ; aucun traitement n’est vendu ou promis à l’avance.',
 pointsEn:['In-person medical assessment where indicated','Individualised discussion of appropriate options','Post-consultation coordination and physician-led follow-up'],
 pointsFr:['Évaluation clinique en présence lorsque nécessaire','Discussion individualisée des options appropriées','Coordination et suivi assurés par le médecin'],
 stepsEn:["Request a private consultation.","The physician discusses suitable options.","Arrange follow-up if recommended."],
 stepsFr:["Demandez une consultation privée.","Le médecin présente les options adaptées.","Organisez le suivi si nécessaire."],
 buttonEn:'VIEW THE PRIVATE AESTHETIC PATHWAY',buttonFr:'DÉCOUVRIR LE PARCOURS ESTHÉTIQUE PRIVÉ'
})
]
},
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

/* ELYSIUM V8 · Eight customer-facing departments.
   Old offers are reused rather than discarded. Historic slugs redirect to these departments. */
const legacy=Object.fromEntries(LEGACY_WORLDS.map(w=>[w.slug,w]));
const fashion=(id,en,fr,copyEn,copyFr)=>({id,en,fr,kind:'CURATED LIFESTYLE',tag:'PRIVATE EDITION',copyEn,copyFr,shortEn:copyEn,shortFr:copyFr,priceEn:'On request',priceFr:'Sur demande'});
const dept=(slug,no,name,icon,eyebrow,subtitleFr,subtitleEn,products)=>({
 slug,no,name,full:'KŌMØ ELYSIUM · '+name,icon,eyebrow,subtitleFr,subtitleEn,
 copyFr:subtitleFr,copyEn:subtitleEn,image:'',background:'',products
});
export const WORLDS=[
 dept('medical-longevity','01','Medical Longevity','◈','PRIVATE MEDICAL LONGEVITY',
  'Consultations privées, Motion, esthétique et suivi.','Private care, Motion, aesthetics and follow-up.',
  [...legacy.longevity.products,...legacy.aesthetic.products,
   {...fashion('motion-functional-check','KŌMØ Motion','Bilan KŌMØ Motion',
    'Non-medical functional movement assessment, offered separately from consultations.',
    'Mesure fonctionnelle du mouvement, non médicale et distincte des consultations.'),kind:'FUNCTIONAL MEASUREMENT · NON MEDICAL',tag:'MOTION'}]),
 dept('iv-drip','02','IV Therapy','✚','PHYSICIAN-LED INFUSION',
  'Coordination des demandes de perfusion médicale.','Medical infusion consultations and coordination.',
  legacy['iv-drip'].products),
 dept('longevity-shop','03','Longevity Shop','◒','THE LONGEVITY EDIT',
  'Suppléments et cosmétiques sélectionnés.','A considered selection of supplements and cosmetics.',
  legacy['cosmetic-supplements'].products),
 dept('lifestyle','04','Lifestyle','∞','THE PRIVATE WARDROBE',
  'Vêtements, accessoires et pièces choisies.','Clothing, accessories and rare essentials.',
  [
   fashion('lifestyle-tailoring','Private Tailoring','Vestiaire sur mesure','Made-to-measure clothing and styling, by private request.','Création vestimentaire et accompagnement sur mesure.'),
   fashion('lifestyle-accessories','Private Accessories','Accessoires d’exception','Curated leather goods, travel accessories and personal objects.','Maroquinerie, accessoires de voyage et objets choisis.'),
   fashion('lifestyle-travel','Travel Edit','Sélection voyage','Exceptional pieces designed for travel and life on board.','Pièces remarquables pour le voyage et la vie à bord.')
  ]),
 dept('yachting','05','Yachting','⌁','YACHTING & PRIVATE BROKERAGE',
  'Yachts à vendre ou à louer, brokers et services à bord.','Yacht charter, brokerage and onboard services.',
  [
   fashion('yachting-charter','Private Charter','Location de yacht','Personalised yacht charter introductions through approved brokers.','Recherche de yacht à louer auprès de brokers vérifiés.'),
   fashion('yachting-purchase','Yacht Acquisition','Acquisition de yacht','Discreet introductions to brokers for yacht purchases.','Mise en relation confidentielle pour l’acquisition d’un yacht.'),
   fashion('yachting-crew','On Board Services','Services à bord','Crew, provisioning and yacht logistics organised on request.','Équipage, approvisionnement et logistique à bord sur demande.')
  ]),
 dept('experiences','06','Experiences','✦','THE RIVIERA EXPERIENCE',
  'Événements, gastronomie, rencontres et expériences privées.','Events, private dining and remarkable Riviera moments.',
  [...legacy.gastronomy.products,...legacy.life.products]),
 dept('high-luxury','07','High Luxury','◇','THE EXCEPTIONAL EDIT',
  'Gemmes, montres, art, automobiles et pièces rares.','Gemstones, watches, art, cars and rare objects.',
  [...legacy['high-luxury'].products,
   fashion('high-luxury-art','Private Art','Art & collections','Discreet sourcing of artworks, subject to provenance checks.','Recherche d’œuvres d’art, sous réserve de vérification de provenance.'),
   fashion('high-luxury-automotive','Automotive Collection','Automobiles de collection','Exceptional automobiles sourced through independent specialists.','Automobiles d’exception auprès de spécialistes indépendants.')]),
 dept('services','08','Services','☼','PRIVATE SERVICES & CONCIERGE',
  'Conciergerie, équipes et accompagnement privé.','Private concierge, teams and personal services.',
  [...legacy.service.products,...legacy.team.products])
];
export const WORLD_BY_SLUG=Object.fromEntries(WORLDS.map(w=>[w.slug,w]));
export const LEGACY_SLUGS={
 longevity:'medical-longevity',aesthetic:'medical-longevity','cosmetic-supplements':'longevity-shop',
 life:'experiences',gastronomy:'experiences',service:'services',team:'services'
};

