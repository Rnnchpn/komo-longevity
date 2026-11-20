# KŌMØ Motion Online V7 — rapport PDF téléchargeable

## Où apparaît le rapport
Après : questionnaires remplis par le participant → vérifications de sécurité → tests webcam → synthèse finale.

Le bloc **« Votre rapport Motion, en PDF »** en bas de la synthèse propose :
- **Télécharger mon rapport PDF** : création et téléchargement d’un véritable fichier PDF A4 multipage dans le navigateur via jsPDF 4.2.1.
- **Imprimer / Enregistrer en PDF** : possibilité de secours avec le dialogue d’impression du navigateur.
- **Copier la synthèse** : export JSON de démonstration conservé.

## Ce que contient le PDF
1. Couverture KŌMØ : date, identification *rapport de démonstration / non médical*.
2. Indice de profil déclaré /100 si toutes les 22 questions sont remplies ; 4 domaines (mobilité, confort, récupération, activité) et sujets à discuter.
3. Motion Score /100 **seulement s’il a été réellement calculé** avec STS 30 s, TUG 3 m, équilibre SPPB, références P10/P90, source et validation. Sinon, **NON CALCULABLE** et les conditions manquantes.
4. Sept observations webcam : lever de chaise, talons, visibilité debout, unipodal gauche/droit, bras et photo sagittale de surface. Les mesures incomplètes sont identifiées.
5. Limites scientifiques, version des algorithmes et date.
6. Appendice contenant chacune des 22 questions originales et les réponses exactes fournies.

## Protection des données
- La génération du document est **locale au navigateur** et ne transmet ni les réponses ni les résultats à un serveur PDF.
- Le moteur jsPDF est chargé au clic depuis un module JavaScript tiers ; le fichier et son contenu sont assemblés sur l’appareil.
- Aucune photographie individuelle n’est incluse ou envoyée dans la version initiale.
- Attention : le PDF est téléchargé dans les fichiers locaux de l’utilisateur ; il doit être protégé comme tout document contenant des réponses personnelles.
- Les informations et scores ne sont toujours pas persistés en Supabase dans la démonstration.
- Une fois un PDF téléchargé, la suppression de la session Pulse ne supprime pas le fichier local.

## Intégrité du score
- Jamais de Motion Score à partir des questionnaires seuls ; leur indice est un **autre résultat**.
- Une modification du calculateur (normes, mesures, cases de validation) invalide immédiatement le Motion Score précédent.
- L’export ne présente jamais un Motion Score s’il manque un élément requis ou si la séance est bloquée pour sécurité.
- Si le questionnaire est incomplet, l’indice déclaré n’est pas calculé.
- Aucune mention de GLFS-25 validé, de Motion Age ou de diagnostic.

## Vérifications techniques
- `scripts/pulse-pdf-report-qa.mjs` couvre la présence des 22 réponses, sept mesures, score calculable / absent, blocage sécurité, données partielles et présence du bouton.
- `scripts/pulse-v14-qa.mjs` exige que le module PDF soit syntaxiquement valide, disponible, utilisé par la synthèse et qu’il ne contienne pas de mécanisme d’envoi de données.
- `scripts/build-all.mjs` exécute ces contrôles avant chaque déploiement.

**À tester en navigateur connecté :** terminer la consultation test, cliquer « Télécharger mon rapport PDF », ouvrir le fichier téléchargé, inspecter la mise en page et vérifier les passages de page. Le build ne constitue pas une validation du téléchargement réel dans Chrome et Safari.
