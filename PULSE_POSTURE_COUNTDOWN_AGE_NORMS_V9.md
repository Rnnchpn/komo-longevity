# KŌMØ Motion Online V9 — posture simplifiée, 6 tests, références par âge

## Pourquoi aucun résultat de posture ?

Deux problèmes cumulés dans la V8 :
- MediaPipe de profil masquait parfois le genou ou une cheville ; la validation exigeait trop de points et une immobilité trop stricte.
- Le calcul photographique n'était pas ajouté de façon fiable à `state.results[task.id]`, ce qui pouvait laisser la synthèse vide.

## Procédure patient corrigée
1. Caméra déjà activée depuis les épreuves précédentes. Placer l'appareil stable à hauteur du bassin, éclairage de côté suffisant ; se mettre **de profil**, épaules, hanche et cheville visibles.
2. Pulse indique la qualité du placement. Une fois le profil reconnu assez stable (~0,9 seconde), **3, 2, 1, Top !** démarre automatiquement, avec le haut-parleur si activé.
3. En cas de déplacement important ou de perte du profil, le décompte s'annule et se relance automatiquement dès que la posture est à nouveau exploitable.
4. L'image est capturée automatiquement dans le navigateur ; le résultat de **décalage photographique de surface** (%) apparaît immédiatement et est rattaché à la session, la synthèse et au PDF.
5. **Secours toujours visible : « Prendre une photo maintenant ».** Si le suivi MediaPipe n'a pas les repères nécessaires, placer au toucher les trois points **cou / haut du dos, bassin, cheville** sur la photo avant calcul. Le résultat manuel est identifié « à vérifier ».
6. Les repères automatiques restent modifiables si nécessaire, dans un volet discret « Modifier les repères ». Aucune photo n'est envoyée à un serveur.

**Limites :** la photo ne voit ni C7 ni S1 ; le résultat n'est PAS la SVA radiographique ni un diagnostic. Il ne faut pas l'interpréter comme une mesure en millimètres, un « Motion Age » ou un marqueur pronostique validé.

## Six tests de mouvement, sans « 10 secondes visibles »
STS 30 s, talons, unipodal gauche, unipodal droit, bras, posture. Le test de présence visible pendant 10 s, sans validité d'équilibre, est retiré des étapes, de la synthèse, du rapport PDF et des tests automatisés. La progression locale V8 est migrée : les épreuves déjà faites restent enregistrées après mise à jour.

## Références normatives vérifiées, conditionnelles et documentées
**Sit-to-Stand 30 s :** Rikli & Jones 1999, 7 183 adultes âgés de 60 à 94 ans ; plages P25–P75, par bandes de 5 ans et tableaux hommes/femmes. Sources : https://www.sralab.org/rehabilitation-measures/30-second-sit-stand-test . Pour afficher une comparaison, Pulse demande **l'âge exact dans la tranche déjà déclarée**, le tableau de référence choisi et l'attestation du protocole comparable (chaise ~43 cm, sans poussée des mains, bras croisés). Si le comptage webcam est incertain ou le protocole non confirmé, l'app montre la norme **sans** classer la performance. Comparaison descriptive : en dessous, dans, au-dessus de la plage centrale — aucun diagnostic.

**Unipodal :** Springer et al. 2007, 549 adultes, yeux ouverts, **meilleur de trois essais et plafond à 45 secondes** ; moyennes par décennies. Source : https://www.sralab.org/rehabilitation-measures/single-leg-stance-or-one-legged-stance-test . Pulse fait un seul essai **plafonné à 20 secondes**. Les normes sont données seulement **à titre de contexte**, sans comparaison individuel / seuil « normal » ni conclusion sur le risque de chute.

**Talons, bras, alignement sagittal photo :** aucun seuil d'âge de ces publications ne correspond au protocole webcam actuel. Les mesures sont restituées comme observations expérimentales sans classement.

Les références et limites sont indiquées dans la synthèse et le PDF final. Le Motion Score KŌMØ conserve strictement les exigences antérieures : STS vérifié, TUG 3 m, SPPB, normes P10/P90 pertinentes et validation ; aucune substitution par l'indice de questionnaire ou par les nouveaux chiffres.

## Vérifications techniques
- `scripts/pulse-profile-age-qa.mjs` : données posturales partielles, seuils de stabilité, variation, STS âge exact et groupe, refus des classifications non comparables, source normative et export PDF.
- `scripts/pulse-v14-qa.mjs` : six épreuves, sauvegarde posturale, décompte 3–2–1, accessibilité.
- `scripts/pulse-pdf-report-qa.mjs` : six observations.
- `scripts/build-all.mjs` : chaîne obligatoire avant déploiement.

**Tests encore nécessaires avec vraie webcam :** déclenchement automatique de la photo de profil à plusieurs mètres, secours manuel à trois repères, affichage et conservation dans synthèse/PDF, comparaison STS conditionnelle aux caractéristiques du protocole.
