# KŌMØ Motion Online — Parcours de restitution individuelle
**Décision produit :** 49 € = bilan Online autonome + premier passeport immédiat + créneau de restitution vidéo individuelle inclus **mais facultatif**. Ne pas demander au client d'attendre un intervenant après le dernier test.

## Quand intervient KŌMØ ?
Le créneau est réservé **avant les tests**, à l'étape Acuity. Au moment du règlement, le client sait quand il pourra échanger avec l'équipe. Le bilan autonome peut être effectué à tout moment avant le créneau. Les résultats exploratoires deviennent lisibles dans Pulse dès leur achèvement. L'échange vidéo sert à expliquer, à vérifier les limites des mesures, à répondre aux questions et à orienter la suite, sans constituer une téléconsultation médicale.

L'intervenant se connecte **à l'heure indiquée par Acuity**, jamais automatiquement à la fin du dernier exercice. En cas de test incomplet, il aide le client à comprendre les résultats disponibles et à planifier la suite ; il ne déclare pas validées des mesures non obtenues. En cas de signal de sécurité ou de gêne importante, aucune prescription ni exercice autonome risqué n'est délivré.

**Absence du client à la vidéo :** le passeport initial reste accessible. Ne pas afficher « validé par un expert » si l'échange ou une revue réelle n'ont pas eu lieu. Suivre les règles d'annulation propres aux CGV, sans promettre de remboursement ou de nouveau créneau automatique.

## Configuration Acuity à faire par l'administrateur

### 1. Type de rendez-vous
- Vérifier l'exactitude de l'ID **99940918**, du prix **49 €** et du créneau réservé, sa durée réelle et le calendrier des intervenants.
- Libellé commercial recommandé : **Motion Online — bilan et restitution individuelle**.
- Description : « Réservez votre échange individuel. Après le règlement, effectuez les questionnaires et tests guidés depuis Pulse avant le rendez-vous. Vous recevrez aussitôt votre premier passeport. Au créneau choisi, nous relirons ensemble les résultats et les prochaines étapes. L'échange est inclus mais facultatif. Prestation fonctionnelle non médicale. »
- Éviter l'expression « téléconsultation médicale » ou toute présentation comme un acte médical.

### 2. Visioconférence
- Acuity > Intégrations > Zoom ou Google Meet ; lier le calendrier et **activer la vidéo sur le type de rendez-vous Online**. Ce réglage n'est pas activé par le code de Pulse.
- Vérifier l'e-mail de confirmation et les rappels. **%location%** doit afficher le lien vidéo. Un rendez-vous antérieur à la configuration vidéo peut ne pas recevoir de lien rétroactivement.
- Activer notifications administrateur pour nouvelle réservation, report, annulation, et rappels appropriés.
- Paramétrer les disponibilités de l'équipe pour que seuls les horaires où un intervenant est réellement présent soient commercialisés.

### 3. Confirmation Acuity — texte proposé
**Objet :** KŌMØ — votre bilan Online et votre rendez-vous

Bonjour %first%,

Votre réservation KŌMØ Motion Online est confirmée pour le **%date% à %time%**.

**1. Réalisez votre bilan dès maintenant :**
https://pulse.komolongevity.com/online/activate/?appointment=%appointmentID%

Utilisez la même adresse e-mail que pour votre réservation. Prévoyez une chaise stable, de la place et un appareil avec caméra.

**2. Vos premiers résultats** seront accessibles dès que vos questionnaires et vos tests seront terminés, dans votre espace Pulse.

**3. Votre échange individuel** aura lieu au créneau ci-dessus. Si la visioconférence est configurée, rejoignez-nous ici : %location%

Cet échange est inclus mais facultatif. Vous n'avez pas à rester connecté en attendant à la fin des tests. Il ne s'agit pas d'une consultation médicale.

À bientôt,
L'équipe KŌMØ

**Vérifier les balises à l'aide de l'aperçu et d'un vrai e-mail de test :** `%appointmentID%` est réservé aux confirmations, reports et suivis selon la documentation Acuity ; `%date%`, `%time%`, `%location%` sont utilisables pour les rendez-vous.

### 4. Rappel la veille (pas de %appointmentID% dans un rappel)
**Objet :** KŌMØ — votre échange individuel approche

Bonjour %first%,

Votre échange KŌMØ est prévu **%date% à %time%**.

Si vous ne l'avez pas encore fait, réalisez votre bilan avant l'échange depuis votre espace Pulse :
https://pulse.komolongevity.com/

Votre lien de visioconférence, s'il a été configuré : %location%

L'échange est facultatif ; votre premier passeport reste accessible sans cet entretien.

### 5. E-mail après le créneau
**Objet :** KŌMØ — retrouvez votre passeport

Bonjour %first%,

Votre passeport Motion et vos priorités de mouvement sont disponibles dans votre espace sécurisé :
https://pulse.komolongevity.com/#passport

Vous pouvez y retrouver votre premier rapport, votre programme Pulse Daily lorsque adapté, et suivre votre progression. Un nouveau bilan comparatif peut être envisagé après 4 à 6 semaines, dans des conditions comparables.

L'équipe KŌMØ

## Vérifications avant ouverture
1. Tester avec un vrai rendez-vous et une adresse contrôlée les notifications Acuity, le lien d'activation, le lien Zoom/Meet et les fuseaux horaires.
2. Ne pas activer `PULSE_ONLINE_PAID_SESSION_ENABLED` avant validation du paiement réel et des dossiers.
3. **Accès opérateur réalisé :** ouvrir `https://pulse.komolongevity.com/online/restitutions/` avec un compte `account_roles.role=admin`. La RLS patient `motion_online_sessions_select_owner` n'a pas été modifiée. Le serveur `motion-online-operator` vérifie le rôle administrateur et journalise chaque accès aux dossiers dans `motion_online_operator_audit` ; il échoue sans journalisation. Aucun compte `professional` ordinaire n'y accède. Les identifiants Acuity ne sont jamais exposés au navigateur. Cet accès doit être validé avec un administrateur réel avant la commercialisation.
4. Tester l'expérience sur mobile, y compris navigateur qui refuse la caméra, questionnaire incomplet et rendez-vous passé.
