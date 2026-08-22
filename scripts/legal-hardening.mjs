import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const siteDir = join(root, 'site');
const origin = 'https://komolongevity.com';
const legalSlugs = ['legal', 'privacy', 'cookies', 'terms', 'medical-information', 'intellectual-property'];
const locales = ['en', 'fr', 'es'];

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const legalCopy = {
  en: {
    language: 'English',
    labels: {
      legal: 'Legal notice', privacy: 'Privacy', cookies: 'Cookies', terms: 'Terms of use',
      'medical-information': 'Medical information', 'intellectual-property': 'Intellectual property'
    },
    footerLabel: 'Legal & privacy',
    back: 'Back to KŌMØ',
    updated: 'Last updated: 22 August 2026',
    contactPrivacy: 'Your message is used only to reply to your request. Please do not include medical or health information in this form.',
    privacyLink: 'Read our privacy notice',
    contactDirectoryTitle: 'One address. The right conversation.',
    contactDirectoryLead: 'All enquiries currently reach the same KŌMØ inbox so nothing is lost during the company set-up phase.',
    contactRoutes: [
      ['General enquiries', 'General enquiry'],
      ['Clinical & scientific', 'Clinical and scientific enquiry'],
      ['Partners & KŌMØ Case', 'Partner and KŌMØ Case enquiry'],
      ['Press & media', 'Press and media enquiry']
    ],
    social: 'Instagram · @komo_longevity',
    checkLink: 'Read the medical-information notice',
    pages: {
      legal: {
        title: 'Legal notice',
        description: 'Publisher, hosting, publication responsibility and legal information for the KŌMØ public website.',
        intro: 'KŌMØ is being prepared as an international locomotor-longevity brand. This page identifies the current public-site framework while the operating company is being incorporated.',
        sections: [
          ['Publisher', '<strong>KŌMØ</strong> is currently a project in legal structuring. The public website is published on a pre-incorporation basis by <strong>Dr Renan Chapon</strong>. Contact: <a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a>.<br><br>The final operating-company details — legal name, corporate form, share capital, registered office, RCS/RNE identifiers and VAT number where applicable — will be published as soon as registration is complete and before that company operates any online commercial service.'],
          ['Publication director', 'Dr Renan Chapon.'],
          ['Hosting', '<strong>Vercel Inc.</strong><br>440 N Barranca Ave #4133, Covina, CA 91723, United States<br>Telephone: +1 559 288 7060<br><a href="https://vercel.com" target="_blank" rel="noreferrer">vercel.com</a>'],
          ['Current scope of the website', 'The public website is informational. It currently provides no online checkout, paid subscription or autonomous medical consultation. KŌMØ Pulse and any future service involving identifiable health data will be governed by separate technical, contractual and data-protection documentation before activation.'],
          ['Regulated activity', 'Any medical act, clinical interpretation, prescription or healthcare decision presented within the KŌMØ ecosystem remains within the remit and responsibility of an appropriately authorised healthcare professional and organisation. The public website itself does not create a doctor–patient relationship.'],
          ['Contact', 'For general, scientific, partnership or press enquiries: <a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a>. Please do not send health records or medical data to this address.']
        ]
      },
      privacy: {
        title: 'Privacy notice',
        description: 'How the KŌMØ public website handles contact information, technical data and language preferences.',
        intro: 'The public KŌMØ website is deliberately designed to minimise personal-data collection. Health information is not collected through the public KŌMØ Check.',
        sections: [
          ['Who is responsible?', 'Until the operating company is registered, the public-site project is managed by Dr Renan Chapon under the KŌMØ name. Privacy enquiries can be sent to <a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a>. This information will be updated when the operating company becomes the controller.'],
          ['KŌMØ Check', 'The public KŌMØ Check is calculated locally in the visitor’s browser. Answers, test values and the resulting educational reading are not transmitted to KŌMØ, are not linked to an account and are not stored by the public website.'],
          ['Contact form and email', 'The contact form opens the visitor’s own email application with a pre-filled message. The public website does not store the form fields in a database. Once the visitor chooses to send the email, the message is processed by the relevant email providers. Please do not include health or medical information. Non-contractual correspondence is retained only for the time needed to handle the request and, as a general rule, no longer than 12 months after the last useful exchange unless a legal, contractual or dispute-related reason requires longer retention.'],
          ['Legal bases', 'Handling an ordinary enquiry may rely on KŌMØ’s legitimate interest in responding to messages reasonably addressed to it. Where a request is made with a view to entering into a contract or partnership, processing may also be necessary to take pre-contractual steps at the requester’s initiative. Consent will be sought separately where the law requires it, for example for future email marketing.'],
          ['Technical hosting data', 'Like most web hosts, Vercel may process limited technical information needed to serve, secure and operate the website, such as IP address, request metadata and security logs, under its own infrastructure and contractual framework. No advertising profile is created by KŌMØ from these data in the current public build.'],
          ['Language preference', 'When a visitor changes language, the site stores the selected locale in local storage under a functional preference key. This is used only to remember the interface language.'],
          ['Recipients and transfers', 'KŌMØ limits access to messages to people who need them to respond to the request. Technical hosting is provided by Vercel Inc. in the United States; where personal data are involved, transfers are subject to the safeguards provided in Vercel’s data-protection framework. Email delivery may also involve the visitor’s and KŌMØ’s respective email providers.'],
          ['Your rights', 'Subject to the conditions of applicable law, you may request access, rectification, erasure, restriction or objection regarding personal data actually held by KŌMØ. Contact <a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a>. In France, you may also lodge a complaint with the CNIL.'],
          ['Future Pulse environment', 'The public site must not be used to transmit health data. Before KŌMØ Pulse stores identifiable health or clinical information, its controller/processor roles, security, hosting, retention, patient information and any required impact assessment will be documented separately.']
        ]
      },
      cookies: {
        title: 'Cookies & local storage',
        description: 'Current use of cookies and local storage on the KŌMØ public website.',
        intro: 'The current public build is intentionally light: no advertising cookies, retargeting pixels or non-essential analytics are intentionally deployed by KŌMØ.',
        sections: [
          ['Functional language preference', 'The site may store the selected language in the browser’s local storage so the interface can remember a choice explicitly made by the visitor. This preference is functional and is not used for advertising or cross-site tracking.'],
          ['No marketing banner by design', 'Because the current build does not intentionally deploy non-essential advertising or profiling trackers, KŌMØ does not display a consent banner solely for the language preference. If non-exempt analytics, advertising or social-media trackers are added later, they will be blocked until the required consent has been obtained.'],
          ['Browser controls', 'Visitors can clear local storage and cookies at any time through their browser settings. Clearing the language preference may simply cause the site to return to its default language.'],
          ['Third-party links', 'Following an external link — for example to Instagram, a scientific source or a partner website — takes the visitor to a separate service governed by that service’s own privacy and cookie settings.']
        ]
      },
      terms: {
        title: 'Terms of use',
        description: 'Conditions governing access to and use of the public KŌMØ website.',
        intro: 'These terms govern the informational public website. They are not sales terms and do not govern a future paid KŌMØ service, which will have its own applicable contract before launch.',
        sections: [
          ['Informational purpose', 'Content is provided to explain KŌMØ, locomotor longevity, its method, research direction and future services. It may evolve as protocols, evidence and the company structure develop.'],
          ['No medical consultation online', 'The website does not provide an individual diagnosis, prognosis, prescription or autonomous care decision. Information cannot replace history-taking, examination or professional judgement where these are required.'],
          ['KŌMØ Check', 'The public KŌMØ Check is an educational self-observation tool. It should only be performed when the stated safety conditions are met. A reassuring result does not rule out a health problem, and a threshold result does not establish a diagnosis.'],
          ['Accuracy and updates', 'KŌMØ aims to distinguish established evidence, methodological choices and areas still under validation. Despite reasonable care, public information may become outdated or contain errors; important clinical or commercial decisions should be verified in the appropriate professional context.'],
          ['External services', 'Links to third-party websites are provided for convenience or source attribution. KŌMØ does not control and is not responsible for the availability, security, content or policies of those independent services.'],
          ['Acceptable use', 'Users must not attempt to interfere with the website, bypass security, extract protected content at scale, impersonate KŌMØ or use the site in a way that infringes applicable law or third-party rights.'],
          ['Governing framework', 'These terms are intended to operate under French law to the extent applicable, without restricting any mandatory rights that a user may have under applicable consumer or data-protection law.']
        ]
      },
      'medical-information': {
        title: 'Medical information & safety',
        description: 'Clinical boundary, safety principles and validation status for public KŌMØ information and the KŌMØ Check.',
        intro: 'KŌMØ aims to make locomotor longevity understandable without confusing education, measurement and medical decision-making.',
        sections: [
          ['Public-site intended purpose', 'The public website and public KŌMØ Check are intended to provide education, orientation and a personal functional reference. They are not intended to provide an autonomous diagnosis, prognosis, treatment recommendation or medical decision.'],
          ['Safety first', 'Do not perform physical self-tests if you have new weakness, severe or acute pain, dizziness, instability, a recent significant injury, a risk of falling or any condition that makes the task unsafe. Stop immediately if symptoms occur. Seek appropriate professional or emergency care for sudden, severe or concerning symptoms.'],
          ['What a score can and cannot mean', 'A score or threshold is a structured representation of the information entered or measured. It does not identify the cause of a limitation and must not be interpreted in isolation from symptoms, examination, medical history and measurement conditions.'],
          ['Clinical pathway', 'When KŌMØ is used within a clinical setting, the healthcare professional remains responsible for indication, measurement conditions, interpretation, complementary investigations and any care decision.'],
          ['Progressive validation', 'KŌMØ distinguishes published evidence supporting individual tests or concepts from KŌMØ-specific methodological choices and from elements still requiring prospective validation. Research-stage claims should not be treated as established clinical facts.'],
          ['Emergency information', 'This website is not an emergency service and is not monitored for urgent medical messages. In an emergency or for acute concerning symptoms, use the locally appropriate emergency medical service.']
        ]
      },
      'intellectual-property': {
        title: 'Intellectual property',
        description: 'Intellectual-property principles applying to the KŌMØ brand, website, content and method.',
        intro: 'KŌMØ is building a scientific, technological and brand asset base. This page clarifies the rights attached to the public materials without claiming ownership of third-party work.',
        sections: [
          ['KŌMØ materials', 'Subject to applicable rights and registrations, the KŌMØ name, visual identity, original copy, diagrams, interfaces, product architecture, KŌMØ Case presentation, Pulse presentation and original methodological materials may be protected by copyright, trademark, design, database, trade-secret or other intellectual-property rules. Access to the website does not grant a licence to reproduce or commercially exploit them.'],
          ['Permitted sharing', 'Links to public KŌMØ pages may be shared. Short quotations may be used where permitted by law, provided the source is clearly identified and the use does not suggest endorsement or affiliation.'],
          ['Scientific sources', 'Scientific publications, validated questionnaires, external protocols and third-party trademarks remain the property of their respective authors or rights holders. KŌMØ identifies or links to sources where appropriate and does not claim ownership of those external works.'],
          ['Partners and technology', 'Names and technologies of partners — including Myodev where referenced — remain subject to their respective rights. “Powered by” or partnership language does not transfer ownership between the parties.'],
          ['Requests', 'For permissions, media assets or rights questions, contact <a href="mailto:contact@komolongevity.com?subject=Intellectual%20property%20request">contact@komolongevity.com</a>.']
        ]
      }
    }
  },
  fr: {
    language: 'Français',
    labels: {
      legal: 'Mentions légales', privacy: 'Confidentialité', cookies: 'Cookies', terms: 'Conditions d’utilisation',
      'medical-information': 'Informations médicales', 'intellectual-property': 'Propriété intellectuelle'
    },
    footerLabel: 'Juridique & confidentialité',
    back: 'Retour à KŌMØ',
    updated: 'Dernière mise à jour : 22 août 2026',
    contactPrivacy: 'Votre message est utilisé uniquement pour répondre à votre demande. N’indiquez aucune donnée médicale ou de santé dans ce formulaire.',
    privacyLink: 'Lire notre politique de confidentialité',
    contactDirectoryTitle: 'Une adresse. La bonne conversation.',
    contactDirectoryLead: 'Toutes les demandes arrivent actuellement dans la même boîte KŌMØ afin de ne rien perdre pendant la phase de constitution de la société.',
    contactRoutes: [
      ['Demandes générales', 'Demande générale'],
      ['Clinique & scientifique', 'Demande clinique et scientifique'],
      ['Partenaires & KŌMØ Case', 'Partenariat et KŌMØ Case'],
      ['Presse & médias', 'Presse et médias']
    ],
    social: 'Instagram · @komo_longevity',
    checkLink: 'Lire les informations médicales et de sécurité',
    pages: {
      legal: {
        title: 'Mentions légales',
        description: 'Éditeur, hébergement, responsabilité de publication et informations juridiques du site public KŌMØ.',
        intro: 'KŌMØ est en cours de structuration comme marque internationale de longévité locomotrice. Cette page décrit le cadre actuel du site public pendant la constitution de la société d’exploitation.',
        sections: [
          ['Éditeur', '<strong>KŌMØ</strong> est actuellement un projet en cours de structuration juridique. Le site public est édité à titre de préfiguration par le <strong>Dr Renan Chapon</strong>. Contact : <a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a>.<br><br>Les informations définitives de la société d’exploitation — dénomination sociale, forme juridique, capital social, siège, identifiants RCS/RNE et numéro de TVA le cas échéant — seront publiées dès l’immatriculation et avant que cette société n’opère un service marchand en ligne.'],
          ['Directeur de la publication', 'Dr Renan Chapon.'],
          ['Hébergement', '<strong>Vercel Inc.</strong><br>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br>Téléphone : +1 559 288 7060<br><a href="https://vercel.com" target="_blank" rel="noreferrer">vercel.com</a>'],
          ['Périmètre actuel du site', 'Le site public est informatif. Il ne propose actuellement ni paiement en ligne, ni abonnement payant, ni consultation médicale autonome. KŌMØ Pulse et tout futur service traitant des données de santé identifiables disposeront d’une documentation technique, contractuelle et de protection des données distincte avant activation.'],
          ['Activité réglementée', 'Tout acte médical, interprétation clinique, prescription ou décision de soins présenté dans l’écosystème KŌMØ demeure dans le champ de compétence et sous la responsabilité d’un professionnel et d’une organisation de santé dûment autorisés. Le site public ne crée pas à lui seul une relation médecin–patient.'],
          ['Contact', 'Pour toute demande générale, scientifique, partenariat ou presse : <a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a>. N’envoyez pas de dossier médical ni de donnée de santé à cette adresse.']
        ]
      },
      privacy: {
        title: 'Politique de confidentialité',
        description: 'Traitement des demandes de contact, données techniques et préférence de langue sur le site public KŌMØ.',
        intro: 'Le site public KŌMØ est volontairement conçu pour minimiser la collecte de données personnelles. Le KŌMØ Check public ne transmet pas de données de santé à KŌMØ.',
        sections: [
          ['Qui est responsable ?', 'Jusqu’à l’immatriculation de la société d’exploitation, le projet de site public est géré par le Dr Renan Chapon sous le nom KŌMØ. Les demandes relatives à la confidentialité peuvent être adressées à <a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a>. Cette information sera mise à jour lorsque la société d’exploitation deviendra responsable du traitement.'],
          ['KŌMØ Check', 'Le KŌMØ Check public est calculé localement dans le navigateur du visiteur. Les réponses, valeurs de tests et la lecture éducative produite ne sont pas transmises à KŌMØ, ne sont pas rattachées à un compte et ne sont pas enregistrées par le site public.'],
          ['Formulaire de contact et email', 'Le formulaire de contact ouvre l’application de messagerie du visiteur avec un message prérempli. Le site public n’enregistre pas les champs du formulaire dans une base de données. Lorsque le visiteur choisit d’envoyer l’email, le message est traité par les fournisseurs de messagerie concernés. N’y indiquez aucune donnée médicale ou de santé. Les correspondances non contractuelles sont conservées uniquement le temps nécessaire au traitement de la demande et, en règle générale, au plus 12 mois après le dernier échange utile, sauf obligation légale, contractuelle ou besoin lié à un contentieux.'],
          ['Bases juridiques', 'Le traitement d’une demande ordinaire peut reposer sur l’intérêt légitime de KŌMØ à répondre aux messages qui lui sont raisonnablement adressés. Lorsqu’une demande vise la conclusion d’un contrat ou d’un partenariat, le traitement peut également être nécessaire à des mesures précontractuelles prises à l’initiative du demandeur. Un consentement distinct sera recueilli lorsque la loi l’exige, notamment pour une future prospection commerciale par email.'],
          ['Données techniques d’hébergement', 'Comme la plupart des hébergeurs web, Vercel peut traiter des informations techniques limitées nécessaires pour servir, sécuriser et exploiter le site, notamment l’adresse IP, des métadonnées de requête et des journaux de sécurité, dans le cadre de sa propre infrastructure et de ses engagements contractuels. KŌMØ ne construit aucun profil publicitaire à partir de ces données dans la version publique actuelle.'],
          ['Préférence de langue', 'Lorsque le visiteur change de langue, le site mémorise la locale choisie dans le stockage local du navigateur, uniquement afin de conserver cette préférence d’interface.'],
          ['Destinataires et transferts', 'KŌMØ limite l’accès aux messages aux personnes qui en ont besoin pour répondre à la demande. L’hébergement technique est assuré par Vercel Inc. aux États-Unis ; lorsque des données personnelles sont concernées, les transferts relèvent des garanties prévues dans le cadre de protection des données de Vercel. L’acheminement des emails peut également impliquer les fournisseurs de messagerie respectifs du visiteur et de KŌMØ.'],
          ['Vos droits', 'Sous réserve des conditions prévues par la réglementation applicable, vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou vous opposer au traitement des données effectivement détenues par KŌMØ. Contact : <a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a>. En France, vous pouvez également introduire une réclamation auprès de la CNIL.'],
          ['Futur environnement Pulse', 'Le site public ne doit pas être utilisé pour transmettre des données de santé. Avant que KŌMØ Pulse ne conserve des informations de santé ou cliniques identifiables, les rôles responsable/sous-traitants, la sécurité, l’hébergement, les durées de conservation, l’information des personnes et toute analyse d’impact requise seront documentés séparément.']
        ]
      },
      cookies: {
        title: 'Cookies & stockage local',
        description: 'Utilisation actuelle des cookies et du stockage local sur le site public KŌMØ.',
        intro: 'La version publique actuelle est volontairement légère : KŌMØ n’y déploie intentionnellement aucun cookie publicitaire, pixel de retargeting ou outil d’analyse non essentiel.',
        sections: [
          ['Préférence fonctionnelle de langue', 'Le site peut enregistrer la langue choisie dans le stockage local du navigateur afin de mémoriser un choix explicitement effectué par le visiteur. Cette préférence est fonctionnelle et n’est utilisée ni pour la publicité ni pour un suivi intersites.'],
          ['Pas de bandeau marketing par conception', 'La version actuelle ne déployant intentionnellement aucun traceur publicitaire ou de profilage non essentiel, KŌMØ n’affiche pas de bandeau de consentement uniquement pour la préférence linguistique. Si des outils d’analytics non exemptés, de publicité ou de réseaux sociaux sont ajoutés ultérieurement, ils seront bloqués avant l’obtention du consentement requis.'],
          ['Contrôles du navigateur', 'Le visiteur peut effacer à tout moment le stockage local et les cookies depuis les réglages de son navigateur. La suppression de la préférence de langue peut simplement ramener le site à sa langue par défaut.'],
          ['Liens externes', 'Le fait de suivre un lien externe — par exemple vers Instagram, une source scientifique ou un partenaire — conduit vers un service distinct soumis à ses propres règles de confidentialité et de cookies.']
        ]
      },
      terms: {
        title: 'Conditions d’utilisation',
        description: 'Conditions applicables à l’accès et à l’utilisation du site public KŌMØ.',
        intro: 'Ces conditions régissent le site public informatif. Elles ne constituent pas des CGV et ne régissent pas un futur service payant KŌMØ, qui disposera de son propre contrat applicable avant son lancement.',
        sections: [
          ['Objet informatif', 'Le contenu présente KŌMØ, la longévité locomotrice, sa méthode, sa direction scientifique et ses futurs services. Il peut évoluer avec les protocoles, les preuves disponibles et la structuration de la société.'],
          ['Pas de consultation médicale en ligne', 'Le site ne fournit pas de diagnostic individuel, de pronostic, de prescription ni de décision de soins autonome. L’information ne remplace ni l’interrogatoire, ni l’examen clinique, ni le jugement professionnel lorsqu’ils sont nécessaires.'],
          ['KŌMØ Check', 'Le KŌMØ Check public est un outil éducatif d’auto-observation. Il ne doit être réalisé que lorsque les conditions de sécurité indiquées sont réunies. Un résultat rassurant n’exclut pas un problème de santé et l’atteinte d’un seuil ne pose pas de diagnostic.'],
          ['Exactitude et mises à jour', 'KŌMØ s’efforce de distinguer les données établies, les choix méthodologiques et les éléments restant en validation. Malgré cette exigence, une information publique peut devenir obsolète ou comporter une erreur ; toute décision clinique ou commerciale importante doit être vérifiée dans le cadre professionnel approprié.'],
          ['Services externes', 'Les liens vers des sites tiers sont fournis pour faciliter l’accès à une source ou un partenaire. KŌMØ ne contrôle pas et n’est pas responsable de la disponibilité, de la sécurité, du contenu ou des politiques de ces services indépendants.'],
          ['Usage acceptable', 'Il est interdit de tenter de perturber le site, contourner ses mécanismes de sécurité, extraire à grande échelle des contenus protégés, usurper l’identité de KŌMØ ou utiliser le site d’une manière portant atteinte à la loi ou aux droits de tiers.'],
          ['Droit applicable', 'Ces conditions ont vocation à s’inscrire dans le cadre du droit français lorsqu’il est applicable, sans priver l’utilisateur des droits impératifs dont il bénéficie au titre notamment du droit de la consommation ou de la protection des données.']
        ]
      },
      'medical-information': {
        title: 'Informations médicales & sécurité',
        description: 'Frontière clinique, principes de sécurité et statut de validation des informations publiques KŌMØ et du KŌMØ Check.',
        intro: 'KŌMØ cherche à rendre la longévité locomotrice compréhensible sans confondre information, mesure et décision médicale.',
        sections: [
          ['Finalité du site public', 'Le site public et le KŌMØ Check public ont une finalité d’information, d’orientation et de repère fonctionnel personnel. Ils ne sont pas destinés à fournir de manière autonome un diagnostic, un pronostic, une recommandation thérapeutique ou une décision médicale.'],
          ['La sécurité avant tout', 'Ne réalisez pas les auto-tests physiques en cas de faiblesse nouvelle, douleur intense ou aiguë, vertige, instabilité, traumatisme récent significatif, risque de chute ou toute situation rendant le test dangereux. Arrêtez immédiatement en cas de symptôme. En présence de symptômes soudains, sévères ou inquiétants, sollicitez sans attendre les soins professionnels ou urgents appropriés.'],
          ['Ce qu’un score peut et ne peut pas signifier', 'Un score ou un seuil est une représentation structurée des informations saisies ou mesurées. Il n’identifie pas à lui seul la cause d’une limitation et ne doit pas être interprété indépendamment des symptômes, de l’examen, des antécédents et des conditions de mesure.'],
          ['Parcours clinique', 'Lorsque KŌMØ est utilisé dans un cadre clinique, le professionnel de santé demeure responsable de l’indication, des conditions de mesure, de l’interprétation, des examens complémentaires et de toute décision de prise en charge.'],
          ['Validation progressive', 'KŌMØ distingue les données publiées soutenant les tests ou concepts individuels, les choix méthodologiques propres à KŌMØ et les éléments nécessitant encore une validation prospective. Les éléments au stade de recherche ne doivent pas être présentés comme des faits cliniques établis.'],
          ['Urgences', 'Ce site n’est pas un service d’urgence et les messages adressés à KŌMØ ne sont pas surveillés pour une prise en charge urgente. En cas d’urgence ou de symptôme aigu inquiétant, utilisez le service médical d’urgence approprié à votre localisation.']
        ]
      },
      'intellectual-property': {
        title: 'Propriété intellectuelle',
        description: 'Principes de propriété intellectuelle applicables à la marque, au site, aux contenus et à la méthode KŌMØ.',
        intro: 'KŌMØ construit un patrimoine scientifique, technologique et de marque. Cette page clarifie les droits attachés aux contenus publics sans revendiquer les travaux de tiers.',
        sections: [
          ['Éléments KŌMØ', 'Sous réserve des droits et enregistrements applicables, le nom KŌMØ, l’identité visuelle, les textes originaux, diagrammes, interfaces, architecture produit, présentation de la KŌMØ Case, présentation de Pulse et documents méthodologiques originaux peuvent être protégés par le droit d’auteur, le droit des marques, des dessins et modèles, des bases de données, du secret des affaires ou d’autres régimes de propriété intellectuelle. L’accès au site ne confère aucune licence de reproduction ou d’exploitation commerciale.'],
          ['Partage autorisé', 'Les liens vers les pages publiques KŌMØ peuvent être partagés. De courtes citations peuvent être utilisées lorsque la loi le permet, sous réserve d’identifier clairement la source et de ne pas laisser croire à une validation ou affiliation inexistante.'],
          ['Sources scientifiques', 'Les publications scientifiques, questionnaires validés, protocoles externes et marques de tiers demeurent la propriété de leurs auteurs ou titulaires respectifs. KŌMØ identifie ou renvoie vers les sources lorsque cela est pertinent et ne revendique pas la propriété de ces œuvres externes.'],
          ['Partenaires & technologies', 'Les noms et technologies de partenaires — notamment Myodev lorsqu’il est cité — demeurent soumis aux droits de leurs titulaires respectifs. Une mention « Powered by » ou de partenariat n’opère aucun transfert de propriété entre les parties.'],
          ['Demandes', 'Pour une autorisation, des ressources médias ou une question relative aux droits : <a href="mailto:contact@komolongevity.com?subject=Demande%20propri%C3%A9t%C3%A9%20intellectuelle">contact@komolongevity.com</a>.']
        ]
      }
    }
  },
  es: {
    language: 'Español',
    labels: {
      legal: 'Aviso legal', privacy: 'Privacidad', cookies: 'Cookies', terms: 'Condiciones de uso',
      'medical-information': 'Información médica', 'intellectual-property': 'Propiedad intelectual'
    },
    footerLabel: 'Legal y privacidad',
    back: 'Volver a KŌMØ',
    updated: 'Última actualización: 22 de agosto de 2026',
    contactPrivacy: 'Tu mensaje se utiliza únicamente para responder a tu solicitud. No incluyas información médica o de salud en este formulario.',
    privacyLink: 'Leer nuestra política de privacidad',
    contactDirectoryTitle: 'Una dirección. La conversación adecuada.',
    contactDirectoryLead: 'Todas las solicitudes llegan actualmente al mismo buzón de KŌMØ para no perder nada durante la fase de constitución de la sociedad.',
    contactRoutes: [
      ['Consultas generales', 'Consulta general'],
      ['Clínica y ciencia', 'Consulta clínica y científica'],
      ['Socios y KŌMØ Case', 'Socios y KŌMØ Case'],
      ['Prensa y medios', 'Prensa y medios']
    ],
    social: 'Instagram · @komo_longevity',
    checkLink: 'Leer la información médica y de seguridad',
    pages: {
      legal: {
        title: 'Aviso legal',
        description: 'Editor, alojamiento, responsabilidad de publicación e información legal del sitio público KŌMØ.',
        intro: 'KŌMØ se está estructurando como marca internacional de longevidad locomotora. Esta página describe el marco actual del sitio público durante la constitución de la sociedad operativa.',
        sections: [
          ['Editor', '<strong>KŌMØ</strong> es actualmente un proyecto en proceso de estructuración jurídica. El sitio público se edita en fase preconstitución por el <strong>Dr Renan Chapon</strong>. Contacto: <a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a>.<br><br>Los datos definitivos de la sociedad operativa — razón social, forma jurídica, capital, domicilio social, registros empresariales e identificación fiscal cuando proceda — se publicarán en cuanto finalice la inscripción y antes de que dicha sociedad opere un servicio comercial online.'],
          ['Director de publicación', 'Dr Renan Chapon.'],
          ['Alojamiento', '<strong>Vercel Inc.</strong><br>440 N Barranca Ave #4133, Covina, CA 91723, Estados Unidos<br>Teléfono: +1 559 288 7060<br><a href="https://vercel.com" target="_blank" rel="noreferrer">vercel.com</a>'],
          ['Alcance actual del sitio', 'El sitio público es informativo. Actualmente no ofrece pago online, suscripción de pago ni consulta médica autónoma. KŌMØ Pulse y cualquier futuro servicio que trate datos de salud identificables tendrán documentación técnica, contractual y de protección de datos separada antes de activarse.'],
          ['Actividad regulada', 'Todo acto médico, interpretación clínica, prescripción o decisión asistencial presentada dentro del ecosistema KŌMØ permanece bajo la competencia y responsabilidad de un profesional y una organización sanitaria debidamente autorizados. El sitio público no crea por sí mismo una relación médico–paciente.'],
          ['Contacto', 'Para consultas generales, científicas, de colaboración o prensa: <a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a>. No envíes historias clínicas ni datos de salud a esta dirección.']
        ]
      },
      privacy: {
        title: 'Política de privacidad',
        description: 'Tratamiento de consultas, datos técnicos y preferencia de idioma en el sitio público KŌMØ.',
        intro: 'El sitio público KŌMØ está diseñado deliberadamente para minimizar la recogida de datos personales. El KŌMØ Check público no transmite datos de salud a KŌMØ.',
        sections: [
          ['¿Quién es responsable?', 'Hasta que se registre la sociedad operativa, el proyecto del sitio público está gestionado por el Dr Renan Chapon bajo el nombre KŌMØ. Las consultas de privacidad pueden dirigirse a <a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a>. Esta información se actualizará cuando la sociedad operativa pase a ser responsable del tratamiento.'],
          ['KŌMØ Check', 'El KŌMØ Check público se calcula localmente en el navegador. Las respuestas, valores de las pruebas y la lectura educativa resultante no se transmiten a KŌMØ, no se vinculan a una cuenta y no se almacenan en el sitio público.'],
          ['Formulario de contacto y email', 'El formulario abre la aplicación de correo del visitante con un mensaje precompletado. El sitio público no guarda los campos en una base de datos. Cuando el visitante decide enviar el correo, el mensaje es tratado por los proveedores de correo correspondientes. No incluyas información médica o de salud. La correspondencia no contractual se conserva solo durante el tiempo necesario para gestionar la solicitud y, como regla general, no más de 12 meses desde el último intercambio útil, salvo obligación legal, contractual o necesidad relacionada con un litigio.'],
          ['Bases jurídicas', 'La gestión de una consulta ordinaria puede basarse en el interés legítimo de KŌMØ en responder a mensajes razonablemente dirigidos a la marca. Cuando la solicitud se realiza con vistas a un contrato o colaboración, el tratamiento también puede ser necesario para adoptar medidas precontractuales a iniciativa del solicitante. Se solicitará un consentimiento separado cuando la ley lo exija, por ejemplo para futura prospección comercial por email.'],
          ['Datos técnicos de alojamiento', 'Como la mayoría de los alojamientos web, Vercel puede tratar información técnica limitada necesaria para servir, proteger y operar el sitio, como dirección IP, metadatos de solicitud y registros de seguridad, dentro de su infraestructura y marco contractual. KŌMØ no crea perfiles publicitarios con estos datos en la versión pública actual.'],
          ['Preferencia de idioma', 'Cuando el visitante cambia de idioma, el sitio guarda la locale elegida en el almacenamiento local del navegador únicamente para recordar esta preferencia de interfaz.'],
          ['Destinatarios y transferencias', 'KŌMØ limita el acceso a los mensajes a quienes necesitan responder a la solicitud. El alojamiento técnico lo presta Vercel Inc. en Estados Unidos; cuando existen datos personales, las transferencias se encuadran en las garantías previstas por el marco de protección de datos de Vercel. La entrega del email también puede implicar a los proveedores de correo del visitante y de KŌMØ.'],
          ['Tus derechos', 'Con sujeción a la normativa aplicable, puedes solicitar acceso, rectificación, supresión, limitación u oposición respecto de los datos que KŌMØ realmente conserve. Contacto: <a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a>. En Francia también puedes presentar una reclamación ante la CNIL.'],
          ['Futuro entorno Pulse', 'El sitio público no debe utilizarse para transmitir datos de salud. Antes de que KŌMØ Pulse almacene información sanitaria o clínica identificable, se documentarán por separado los roles de responsable/encargados, seguridad, alojamiento, plazos de conservación, información a las personas y cualquier evaluación de impacto requerida.']
        ]
      },
      cookies: {
        title: 'Cookies y almacenamiento local',
        description: 'Uso actual de cookies y almacenamiento local en el sitio público KŌMØ.',
        intro: 'La versión pública actual es deliberadamente ligera: KŌMØ no despliega intencionadamente cookies publicitarias, píxeles de retargeting ni analítica no esencial.',
        sections: [
          ['Preferencia funcional de idioma', 'El sitio puede guardar el idioma seleccionado en el almacenamiento local del navegador para recordar una elección realizada expresamente por el visitante. Esta preferencia es funcional y no se utiliza para publicidad ni seguimiento entre sitios.'],
          ['Sin banner de marketing por diseño', 'Como la versión actual no despliega intencionadamente rastreadores publicitarios o de perfilado no esenciales, KŌMØ no muestra un banner de consentimiento solo para la preferencia de idioma. Si posteriormente se añaden analíticas no exentas, publicidad o rastreadores de redes sociales, se bloquearán hasta obtener el consentimiento requerido.'],
          ['Controles del navegador', 'El visitante puede borrar el almacenamiento local y las cookies en cualquier momento desde la configuración de su navegador. Borrar la preferencia de idioma puede simplemente devolver el sitio a su idioma predeterminado.'],
          ['Enlaces externos', 'Seguir un enlace externo — por ejemplo a Instagram, una fuente científica o un socio — lleva a un servicio separado sometido a sus propias políticas de privacidad y cookies.']
        ]
      },
      terms: {
        title: 'Condiciones de uso',
        description: 'Condiciones aplicables al acceso y uso del sitio público KŌMØ.',
        intro: 'Estas condiciones regulan el sitio público informativo. No son condiciones de venta y no regulan un futuro servicio de pago KŌMØ, que tendrá su propio contrato antes del lanzamiento.',
        sections: [
          ['Finalidad informativa', 'El contenido presenta KŌMØ, la longevidad locomotora, su método, dirección científica y futuros servicios. Puede evolucionar con los protocolos, la evidencia disponible y la estructuración societaria.'],
          ['Sin consulta médica online', 'El sitio no proporciona un diagnóstico individual, pronóstico, prescripción ni decisión asistencial autónoma. La información no sustituye anamnesis, exploración clínica ni juicio profesional cuando estos son necesarios.'],
          ['KŌMØ Check', 'El KŌMØ Check público es una herramienta educativa de autoobservación. Solo debe realizarse cuando se cumplen las condiciones de seguridad indicadas. Un resultado tranquilizador no excluye un problema de salud y alcanzar un umbral no establece un diagnóstico.'],
          ['Exactitud y actualizaciones', 'KŌMØ procura diferenciar datos establecidos, decisiones metodológicas y elementos aún en validación. A pesar de ello, la información pública puede quedar obsoleta o contener errores; cualquier decisión clínica o comercial importante debe verificarse en el contexto profesional adecuado.'],
          ['Servicios externos', 'Los enlaces a sitios de terceros se proporcionan por conveniencia o atribución de fuentes. KŌMØ no controla ni responde de la disponibilidad, seguridad, contenido o políticas de esos servicios independientes.'],
          ['Uso aceptable', 'No está permitido intentar interferir con el sitio, eludir su seguridad, extraer masivamente contenido protegido, suplantar a KŌMØ o utilizar el sitio de forma que infrinja la ley o derechos de terceros.'],
          ['Marco aplicable', 'Estas condiciones pretenden operar bajo el derecho francés cuando resulte aplicable, sin limitar derechos imperativos que el usuario pueda tener conforme a la normativa de consumo o protección de datos.']
        ]
      },
      'medical-information': {
        title: 'Información médica y seguridad',
        description: 'Límite clínico, seguridad y estado de validación de la información pública KŌMØ y del KŌMØ Check.',
        intro: 'KŌMØ pretende hacer comprensible la longevidad locomotora sin confundir educación, medición y decisión médica.',
        sections: [
          ['Finalidad del sitio público', 'El sitio público y el KŌMØ Check público tienen una finalidad de educación, orientación y referencia funcional personal. No están destinados a proporcionar de forma autónoma un diagnóstico, pronóstico, recomendación terapéutica o decisión médica.'],
          ['La seguridad primero', 'No realices auto-pruebas físicas si tienes debilidad nueva, dolor intenso o agudo, mareo, inestabilidad, traumatismo reciente significativo, riesgo de caída o cualquier situación que haga la tarea insegura. Detente inmediatamente si aparecen síntomas. Ante síntomas súbitos, graves o preocupantes, solicita atención profesional o urgente adecuada.'],
          ['Qué puede y qué no puede significar un score', 'Un score o umbral es una representación estructurada de la información introducida o medida. No identifica por sí solo la causa de una limitación y no debe interpretarse al margen de síntomas, exploración, antecedentes y condiciones de medición.'],
          ['Recorrido clínico', 'Cuando KŌMØ se utiliza en un entorno clínico, el profesional sanitario sigue siendo responsable de la indicación, condiciones de medición, interpretación, pruebas complementarias y cualquier decisión asistencial.'],
          ['Validación progresiva', 'KŌMØ distingue la evidencia publicada que sustenta pruebas o conceptos individuales, las decisiones metodológicas propias de KŌMØ y los elementos que aún requieren validación prospectiva. Las afirmaciones en fase de investigación no deben tratarse como hechos clínicos establecidos.'],
          ['Urgencias', 'Este sitio no es un servicio de urgencias y los mensajes enviados a KŌMØ no se monitorizan para atención urgente. En caso de urgencia o síntomas agudos preocupantes, utiliza el servicio médico de emergencia apropiado en tu ubicación.']
        ]
      },
      'intellectual-property': {
        title: 'Propiedad intelectual',
        description: 'Principios de propiedad intelectual aplicables a la marca, sitio, contenidos y método KŌMØ.',
        intro: 'KŌMØ está construyendo un patrimonio científico, tecnológico y de marca. Esta página aclara los derechos sobre los materiales públicos sin atribuirse obras de terceros.',
        sections: [
          ['Materiales KŌMØ', 'Con sujeción a los derechos y registros aplicables, el nombre KŌMØ, identidad visual, textos originales, diagramas, interfaces, arquitectura de producto, presentación de KŌMØ Case, presentación de Pulse y materiales metodológicos originales pueden estar protegidos por derechos de autor, marcas, diseños, bases de datos, secretos comerciales u otras normas de propiedad intelectual. El acceso al sitio no concede licencia para reproducirlos o explotarlos comercialmente.'],
          ['Compartir de forma permitida', 'Se pueden compartir enlaces a las páginas públicas KŌMØ. Pueden utilizarse citas breves cuando la ley lo permita, identificando claramente la fuente y sin sugerir una validación o afiliación inexistente.'],
          ['Fuentes científicas', 'Las publicaciones científicas, cuestionarios validados, protocolos externos y marcas de terceros siguen perteneciendo a sus respectivos autores o titulares. KŌMØ identifica o enlaza las fuentes cuando corresponde y no reclama la propiedad de esas obras externas.'],
          ['Socios y tecnología', 'Los nombres y tecnologías de socios — incluido Myodev cuando se menciona — permanecen sujetos a los derechos de sus respectivos titulares. Una mención “Powered by” o de colaboración no transfiere propiedad entre las partes.'],
          ['Solicitudes', 'Para autorizaciones, recursos de prensa o cuestiones de derechos: <a href="mailto:contact@komolongevity.com?subject=Solicitud%20de%20propiedad%20intelectual">contact@komolongevity.com</a>.']
        ]
      }
    }
  }
};

const localeRoot = (locale) => locale === 'en' ? '' : `/${locale}`;
const pageHref = (locale, slug) => `${localeRoot(locale)}/${slug}/`;
const homeHref = (locale) => locale === 'en' ? '/' : `/${locale}/`;

async function listHtmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listHtmlFiles(full));
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

function localeFromPath(file) {
  const rel = relative(siteDir, file).split(sep).join('/');
  if (rel.startsWith('fr/')) return 'fr';
  if (rel.startsWith('es/')) return 'es';
  return 'en';
}

function legalNav(locale) {
  const c = legalCopy[locale];
  return `<nav class="legal-links" aria-label="${escapeHtml(c.footerLabel)}">${legalSlugs.map((slug) => `<a href="${pageHref(locale, slug)}">${escapeHtml(c.labels[slug])}</a>`).join('')}</nav>`;
}

function legalMain(locale, slug) {
  const c = legalCopy[locale];
  const page = c.pages[slug];
  const nav = `<div class="legal-page-nav">${legalSlugs.map((item) => `<a href="${pageHref(locale, item)}"${item === slug ? ' aria-current="page"' : ''}>${escapeHtml(c.labels[item])}</a>`).join('')}</div>`;
  const sections = page.sections.map(([heading, body]) => `<section class="legal-section"><h2>${escapeHtml(heading)}</h2><div class="legal-rich">${body}</div></section>`).join('');
  return `<main id="main"><section class="legal-hero"><div class="shell"><p class="eyebrow">KŌMØ · ${escapeHtml(c.labels[slug])}</p><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.intro)}</p><div class="legal-meta"><span>${escapeHtml(c.updated)}</span><a href="${homeHref(locale)}">${escapeHtml(c.back)} →</a></div></div></section><section class="legal-body"><div class="shell legal-layout"><aside>${nav}</aside><article>${sections}</article></div></section></main>`;
}

function rewriteHead(html, locale, slug) {
  const c = legalCopy[locale];
  const page = c.pages[slug];
  const canonical = `${origin}${pageHref(locale, slug)}`;
  const alternates = locales.map((loc) => `<link rel="alternate" hreflang="${loc}" href="${origin}${pageHref(loc, slug)}">`).join('\n  ');
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)} — KŌMØ</title>`);
  html = html.replace(/<meta name="description" content="[\s\S]*?">/, `<meta name="description" content="${escapeHtml(page.description)}">`);
  html = html.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`);
  html = html.replace(/\s*<link rel="alternate" hreflang="(?:en|fr|es)" href="[^"]*">/g, '');
  html = html.replace(/<link rel="alternate" hreflang="x-default" href="[^"]*">/, `${alternates}\n  <link rel="alternate" hreflang="x-default" href="${origin}${pageHref('en', slug)}">`);
  html = html.replace(/<meta property="og:title" content="[\s\S]*?">/, `<meta property="og:title" content="${escapeHtml(page.title)} — KŌMØ">`);
  html = html.replace(/<meta property="og:description" content="[\s\S]*?">/, `<meta property="og:description" content="${escapeHtml(page.description)}">`);
  html = html.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonical}">`);
  html = html.replace(/<body data-page="[^"]*">/, `<body data-page="${slug}">`);
  html = html.replace(/<main id="main">[\s\S]*?<\/main>/, legalMain(locale, slug));
  html = html.replace(/<a class="button mobile-cta"[\s\S]*?<\/a>\s*<\/body>/, '</body>');
  return html;
}

function hardenFooter(html, locale) {
  if (html.includes('class="legal-links"')) return html;
  return html.replace(/(<div class="footer-bottom">)([\s\S]*?)(<\/div>)/, `$1$2${legalNav(locale)}$3`);
}

function hardenContact(html, locale) {
  const c = legalCopy[locale];
  const routeMarkup = `<div class="contact-directory"><h3>${escapeHtml(c.contactDirectoryTitle)}</h3><p>${escapeHtml(c.contactDirectoryLead)}</p>${c.contactRoutes.map(([label, subject]) => `<a href="mailto:contact@komolongevity.com?subject=${encodeURIComponent(subject)}"><span>${escapeHtml(label)}</span><strong>contact@komolongevity.com</strong></a>`).join('')}<a class="contact-social" href="https://www.instagram.com/komo_longevity/" target="_blank" rel="noreferrer">${escapeHtml(c.social)} ↗</a></div>`;
  html = html.replace(/(<a class="contact-mail" href="mailto:[^"]+">[\s\S]*?<\/a>)/, `$1${routeMarkup}`);
  html = html.replace(/<label class="field" style="grid-template-columns:auto 1fr;align-items:start;gap:\.6rem"><input type="checkbox" name="consent" required style="min-height:auto;width:auto;margin-top:\.28rem"><span>[\s\S]*?<\/span><\/label>/, `<p class="privacy-note">${escapeHtml(c.contactPrivacy)} <a href="${pageHref(locale, 'privacy')}">${escapeHtml(c.privacyLink)}.</a></p>`);
  return html;
}

function hardenCheck(html, locale) {
  const c = legalCopy[locale];
  return html.replace(/(<p class="check-privacy">[\s\S]*?<\/p>)/, `$1<p class="check-legal-link"><a href="${pageHref(locale, 'medical-information')}">${escapeHtml(c.checkLink)} →</a></p>`);
}

async function createLegalPages() {
  for (const locale of locales) {
    const templatePath = locale === 'en' ? join(siteDir, 'index.html') : join(siteDir, locale, 'index.html');
    const template = await readFile(templatePath, 'utf8');
    for (const slug of legalSlugs) {
      const target = locale === 'en' ? join(siteDir, slug, 'index.html') : join(siteDir, locale, slug, 'index.html');
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, rewriteHead(template, locale, slug));
    }
  }
}

async function hardenAllHtml() {
  const files = await listHtmlFiles(siteDir);
  for (const file of files) {
    const locale = localeFromPath(file);
    const rel = relative(siteDir, file).split(sep).join('/');
    let html = await readFile(file, 'utf8');
    html = hardenFooter(html, locale);
    if (rel === 'contact/index.html' || rel === 'fr/contact/index.html' || rel === 'es/contact/index.html') html = hardenContact(html, locale);
    if (rel === 'check/index.html' || rel === 'fr/check/index.html' || rel === 'es/check/index.html') html = hardenCheck(html, locale);
    await writeFile(file, html);
  }
}

async function hardenCss() {
  const cssPath = join(siteDir, 'assets', 'css', 'site.css');
  let css = await readFile(cssPath, 'utf8');
  css = css.replace(/^@import url\([^\n]+\);\s*/m, '');
  css = css.replace("--sans: 'DM Sans', Arial, sans-serif;", "--sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;");
  css = css.replace("--display: 'Playfair Display', Georgia, serif;", "--display: 'Iowan Old Style', 'Baskerville', 'Times New Roman', serif;");
  css = css.replace("--mono: 'DM Mono', monospace;", "--mono: 'SFMono-Regular', Consolas, 'Liberation Mono', monospace;");
  css += `\n\n/* Production & legal hardening — generated after the main build */\n.legal-links{display:flex;flex-wrap:wrap;gap:.55rem 1rem;align-items:center;font-size:.66rem}.legal-links a{color:var(--ink-soft);text-decoration:none}.legal-links a:hover{text-decoration:underline}.legal-hero{padding:clamp(4rem,8vw,7rem) 0 clamp(2.6rem,5vw,4.5rem);border-bottom:1px solid var(--line);background:linear-gradient(180deg,#f3f0e8 0%,var(--paper) 100%)}.legal-hero h1{max-width:900px;margin:0;font:500 clamp(3rem,7vw,6.8rem)/.92 var(--display);letter-spacing:-.06em}.legal-hero>div>p:not(.eyebrow){max-width:760px;margin:1.4rem 0 0;color:var(--ink-soft);font-size:clamp(1.04rem,1.6vw,1.25rem)}.legal-meta{display:flex;flex-wrap:wrap;justify-content:space-between;gap:1rem;margin-top:2rem;padding-top:1.2rem;border-top:1px solid var(--line);color:var(--ink-soft);font:500 .68rem var(--mono);letter-spacing:.03em}.legal-body{padding:clamp(3rem,6vw,6rem) 0}.legal-layout{display:grid;grid-template-columns:minmax(190px,.28fr) minmax(0,.72fr);gap:clamp(2rem,6vw,7rem);align-items:start}.legal-page-nav{position:sticky;top:98px;display:grid;border-top:1px solid var(--line)}.legal-page-nav a{padding:.78rem 0;border-bottom:1px solid var(--line);color:var(--ink-soft);font-size:.78rem}.legal-page-nav a[aria-current=page]{color:var(--sea);font-weight:700}.legal-section{padding:0 0 2.5rem;margin:0 0 2.5rem;border-bottom:1px solid var(--line)}.legal-section:last-child{border-bottom:0}.legal-section h2{margin:0 0 .9rem;font:500 clamp(1.65rem,2.7vw,2.45rem)/1 var(--display);letter-spacing:-.04em}.legal-rich{max-width:790px;color:var(--ink-soft);font-size:.98rem}.legal-rich a{text-decoration:underline;text-underline-offset:3px}.contact-directory{display:grid;gap:.55rem;margin-top:2rem;padding-top:1.6rem;border-top:1px solid rgba(255,255,255,.2)}.contact-directory h3{margin:0;color:#fff;font:500 1.35rem/1.1 var(--display)}.contact-directory>p{margin:0 0 .4rem}.contact-directory>a{display:grid;gap:.14rem;padding:.65rem 0;border-bottom:1px solid rgba(255,255,255,.13);color:#fff}.contact-directory>a span{font-size:.78rem}.contact-directory>a strong{font-size:.7rem;font-weight:500;color:rgba(255,255,255,.68)}.contact-directory .contact-social{display:block;border:0;color:#fff;font-size:.78rem}.privacy-note{padding:1rem 1.1rem;border:1px solid var(--line);border-radius:12px;background:var(--paper);color:var(--ink-soft);font-size:.78rem}.privacy-note a{text-decoration:underline}.check-legal-link{margin:.55rem 0 0;font-size:.74rem}.check-legal-link a{text-decoration:underline;text-underline-offset:3px}@media(max-width:780px){.legal-layout{grid-template-columns:1fr}.legal-page-nav{position:static}.footer-bottom{align-items:flex-start;gap:1rem}.legal-links{width:100%}}\n`;
  await writeFile(cssPath, css);
}

async function updateSitemap() {
  const sitemapPath = join(siteDir, 'sitemap.xml');
  let xml = await readFile(sitemapPath, 'utf8');
  const additions = locales.flatMap((locale) => legalSlugs.map((slug) => `${origin}${pageHref(locale, slug)}`));
  const missing = additions.filter((url) => !xml.includes(`<loc>${url}</loc>`));
  if (missing.length) xml = xml.replace('</urlset>', `${missing.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>`);
  await writeFile(sitemapPath, xml);
}

await createLegalPages();
await hardenAllHtml();
await hardenCss();
await updateSitemap();
console.log('Applied KŌMØ production & legal hardening.');
