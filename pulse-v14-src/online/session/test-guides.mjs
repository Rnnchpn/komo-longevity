// Patient-facing, non-medical instructions for experimental webcam observations.
export const TEST_GUIDES={
 sts:{
  purpose:"Observer votre capacité à vous relever puis à vous rasseoir pendant 30 secondes, à votre rythme.",
  setup:"Chaise solide contre un mur, pieds à plat au sol, caméra fixe de trois-quarts profil : tête, bassin, genoux et pieds visibles.",
  steps:[
   "Asseyez-vous pieds à plat, bras croisés si cela vous est possible. Une aide des mains reste possible pour la sécurité, mais empêche une comparaison normative standard.",
   "Quand la silhouette est détectée, dites « C’est parti ». Restez assis pendant le début du décompte.",
   "Relevez-vous, puis rasseyez-vous. Répétez à votre rythme pendant 30 secondes. Arrêtez si une gêne survient."
  ],
  measured:"Pulse estime le nombre de levers complets grâce au mouvement de vos genoux. Le résultat dépend du cadrage et ne mesure pas votre force.",
  audio:"Test du lever de chaise. Placez une chaise stable contre un mur, de trois-quarts profil devant la caméra. Assurez-vous que la tête, le bassin, les genoux et les pieds sont visibles. Asseyez-vous, pieds à plat au sol. Lorsque votre silhouette est détectée, dites : c'est parti. Relevez-vous puis rasseyez-vous pendant trente secondes, à votre rythme. Arrêtez en cas de douleur ou de malaise."
 },
 heels:{
  purpose:"Observer des mouvements d'élévation et de descente sur les pointes de pieds pendant 20 secondes.",
  setup:"Debout, de profil devant une caméra stable, avec un plan de travail solide à portée de main. Pieds et bassin visibles.",
  steps:[
   "Tenez-vous debout et gardez un appui stable à portée de main.",
   "Dites « C’est parti » lorsque la silhouette est bien visible.",
   "Montez doucement sur les pointes des pieds puis redescendez. N'essayez pas d'aller vite et arrêtez si vous perdez l'équilibre."
  ],
  measured:"Le logiciel repère un déplacement vertical apparent du bassin, pas la force des mollets. Ce compteur expérimental peut être erroné.",
  audio:"Test sur la pointe des pieds. Mettez-vous debout, de profil, près d'un support stable. Vérifiez que vos pieds et votre bassin sont visibles. Dites c'est parti, puis montez doucement sur les pointes de pieds et redescendez pendant vingt secondes. Restez près de l'appui et arrêtez si vous ne vous sentez pas stable."
 },
 posture:{
  purpose:"Documenter en photographie la position sagittale apparente du cou et du bassin, sans prétendre mesurer la SVA radiographique.",
  setup:"Téléphone ou ordinateur posé et immobile, à hauteur du bassin. Placez-vous de profil (90°), à distance suffisante pour montrer les pieds.",
  steps:[
   "Tenez-vous naturellement de profil, sans chercher à vous redresser ni à corriger votre posture.",
   "Placez-vous et restez tranquille : dès que le profil est reconnu, Pulse prononce « 3, 2, 1, Top ! » et prend la photo automatiquement.",
   "La photo s’affiche aussitôt. Vous pouvez continuer directement ou ouvrir « Modifier les repères » si nécessaire."
  ],
  measured:"Un indice photographique en pourcentage : distance horizontale apparente entre un repère cervico-thoracique superficiel et un repère pelvien superficiel, divisée par la hauteur apparente épaule–cheville. Ni C7 ni S1 ne sont détectés par la webcam : ce n'est pas une SVA en millimètres et cela ne permet pas de diagnostiquer une scoliose.",
  audio:"Photo de profil. Tournez-vous de profil à la caméra, avec vos pieds dans le cadre. Restez naturellement immobile. Quand votre position sera correcte, le décompte trois, deux, un, Top démarrera automatiquement. La photo sera prise sans toucher à l’ordinateur. Ce n’est pas une S V A radiographique."
 },
 unipodal_left:{
  purpose:"Observer la durée visible de maintien sur le pied gauche, jusqu’à vingt secondes, sans chercher une performance maximale.",
  setup:"Debout face à la caméra, jambes et chevilles visibles, yeux ouverts. Placez une main à portée d'une table ou rampe fixe ; ne levez jamais le pied si cela semble dangereux.",
  steps:[
   "Restez près du support, pieds au sol, puis préparez l’appui gauche.",
   "Soulevez légèrement le pied droit ; le chronomètre démarre automatiquement lorsque la position semble tenue.",
   "Reposez votre pied dès que vous le souhaitez : le chronomètre s'arrête. Vous pouvez utiliser l'appui à tout moment."
  ],
  measured:"Temps apparent pendant lequel un pied reste visiblement levé. Ce n'est pas un score validé d'équilibre, et une caméra unique ne détecte pas toutes les pertes d'appui ou les prises de support.",
  audio:"Équilibre sur le pied gauche. Tenez-vous près d’un appui stable, les yeux ouverts. Soulevez légèrement le pied droit quand vous êtes prêt. Le chronomètre part automatiquement. Reposez le pied pour terminer. Ne vous mettez jamais en difficulté."
 },
 unipodal_right:{
  purpose:"Observer la durée visible de maintien sur le pied droit, jusqu’à vingt secondes.",
  setup:"Debout face à la caméra, jambes et chevilles visibles, yeux ouverts, à portée d’un appui fixe.",
  steps:[
   "Placez-vous près du support, puis préparez l’appui droit.",
   "Soulevez doucement le pied gauche ; le chronomètre démarre automatiquement lorsque la position est détectée.",
   "Reposez le pied ou utilisez l'appui dès que nécessaire ; aucune performance n’est imposée."
  ],
  measured:"Temps apparent en appui droit avec pied gauche visible en l'air ; le résultat est approximatif et ne permet aucune conclusion clinique sur le risque de chute.",
  audio:"Équilibre sur le pied droit. Debout près d’un appui stable, les yeux ouverts. Soulevez légèrement le pied gauche : le chronomètre démarre automatiquement. Reposez le pied quand vous le souhaitez. La sécurité passe avant toute mesure."
 },
 arms:{
  purpose:"Observer combien de fois vous levez les deux bras puis les redescendez en 20 secondes.",
  setup:"Face à la caméra, épaules et mains visibles, espace libre autour des bras. Ne forcez pas l'amplitude.",
  steps:[
   "Placez-vous debout ou assis confortablement, face à la caméra, bras le long du corps.",
   "Dites « C’est parti » lorsque les épaules et les poignets sont visibles.",
   "Levez doucement les deux bras puis ramenez-les vers le bas. Répétez sans douleur pendant 20 secondes."
  ],
  measured:"Pulse repère les poignets au-dessus puis au-dessous des épaules pour compter les cycles ; ce n'est pas une mesure précise d'amplitude articulaire.",
  audio:"Test de mobilité des bras. Placez-vous face à la caméra, les mains visibles et les bras le long du corps. Dites c'est parti. Levez doucement les deux bras puis redescendez-les, pendant vingt secondes. Ne forcez jamais un mouvement douloureux."
 }
};
