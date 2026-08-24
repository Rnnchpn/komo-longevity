# KŌMØ Pulse — protocole de recette bêta

Date cible : 25 août 2026

## Périmètre autorisé

- Création de compte, confirmation par e-mail et connexion.
- Profil personnel avec informations fictives ou non cliniques.
- KŌMØ Loco Check.
- Navigation patient et demande d'accès professionnel.
- Aucun dossier clinique réel, import MyoCare réel, paiement réel ou donnée directement identifiante de santé.

## Pré-requis avant une ouverture élargie

- Activer dans Supabase Auth la **protection contre les mots de passe compromis**.
- Activer **Vercel Web Analytics** pour rendre opérationnels les événements déjà intégrés au site public.
- Vérifier que les URL de redirection Auth autorisées contiennent exactement `https://pulse.komolongevity.com`.
- Conserver Motion, Clinical, MyoCare et les paiements en accès contrôlé jusqu'aux validations correspondantes.

## Matrice d'authentification

Pour Gmail, Outlook et iCloud :

1. Créer un compte neuf.
2. Vérifier le délai de réception et les courriers indésirables.
3. Ouvrir le lien de confirmation sur mobile et ordinateur.
4. Vérifier la redirection vers Pulse et l'ouverture de session.
5. Se déconnecter puis se reconnecter.
6. Tester le renvoi de confirmation.
7. Tester « mot de passe oublié », le lien reçu et le nouveau mot de passe.
8. Vérifier le comportement d'un lien expiré ou déjà utilisé.

## Parcours fonctionnels

- Patient : inscription → confirmation → profil → Loco Check → résultat → retour au tableau de bord.
- Professionnel : entrée dédiée → identification de la demande → absence d'accès aux données patient sans rôle.
- Administrateur : accès par rôle uniquement, aucune URL « secrète » utilisée comme protection.
- Langues : français et anglais sur l'ensemble de l'authentification et des messages d'erreur.
- Mobile : Safari iPhone et Chrome Android.

## Critères bloquants

- E-mail absent ou confirmation ne créant pas une session valide.
- Accès croisé entre patient, professionnel ou administrateur.
- Persistance incorrecte du consentement ou du résultat.
- Affichage d'une fonction Clinical, MyoCare ou paiement comme active alors qu'elle ne l'est pas.
- Envoi d'une donnée de santé ou d'une adresse e-mail vers l'analytics.
- Erreur bloquante sur mobile.

## Décision d'ouverture

Une première invitation peut être adressée à 5–10 testeurs de confiance lorsque tous les critères bloquants sont levés. Toute collecte de données cliniques réelles reste conditionnée à l'audit juridique, RGPD, sécurité et hébergement applicable.
