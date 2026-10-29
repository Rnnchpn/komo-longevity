// Patient-facing, non-medical instructions for experimental webcam observations.
export const TEST_GUIDES={
 sts:{
  purpose:"Observer votre capacité à vous relever puis à vous rasseoir pendant 30 secondes, à votre rythme.",
  setup:"Chaise solide contre un mur, pieds à plat au sol, caméra fixe de trois-quarts profil : tête, bassin, genoux et pieds visibles.",
  steps:[
   "Asseyez-vous normalement, pieds posés au sol. Gardez un appui si vous en avez besoin.",
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
 balance:{
  purpose:"Vérifier simplement si votre silhouette reste visible pendant 10 secondes en position debout sécurisée.",
  setup:"Debout, yeux ouverts, près d'un support solide. Ne prenez pas de position difficile ni d'appui précaire.",
  steps:[
   "Placez-vous debout près d'un support, yeux ouverts, pieds dans une position confortable.",
   "Dites « C’est parti » après avoir vérifié la visibilité du corps.",
   "Restez dans une position confortable pendant 10 secondes. Vous pouvez vous appuyer à tout moment."
  ],
  measured:"La webcam calcule la durée où elle voit votre corps : elle ne mesure ni les oscillations posturales ni un risque de chute.",
  audio:"Test de visibilité en position debout. Placez-vous près d'un support stable, les yeux ouverts. Gardez une position confortable, sans chercher à vous mettre en difficulté. Dites c'est parti et restez visible pendant dix secondes. Ce test ne mesure pas votre équilibre de manière médicale."
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
