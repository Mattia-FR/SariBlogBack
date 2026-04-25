import type { Connection } from "mysql2/promise";

export async function runSeeds(connection: Connection): Promise<void> {
	// ============================================
	// USERS (1 admin + 1 éditeur)
	// Mots de passe hashés avec Argon2id :
	//   admin        → Reve42
	//   sari.eliott  → Serenite26
	// ============================================
	await connection.query(`
    INSERT INTO users (username, email, password, firstname, lastname, role, bio, bio_short) VALUES
    ("admin", "admin@sariblog.com", "$argon2id$v=19$m=65536,t=3,p=4$2eNt3aySYfYyyervEcFtiQ$6wM6Qj0SggDgPTd0Ycnl5KJYZcIjeiRg87Tm2AZTUfI", NULL, NULL, "admin", NULL, NULL),
    ("sari.eliott", "sari.eliott@sariblog.com", "$argon2id$v=19$m=65536,t=3,p=4$wkio5piGN9BZtJAdkecJ3Q$tgbsy5tWsPXS5/bs7apwAqRGzupLzIay/rudaEMlPWU", "Sari", "Eliott", "editor", "Illustratrice et autrice visuelle spécialisée en aquarelle et illustration numérique. Son travail explore des univers poétiques et fantasy, entre narration visuelle et recherche d'atmosphères. Elle partage régulièrement son processus créatif, ses projets personnels et des tutoriels destinés aux artistes en devenir.", "Illustratrice aquarelle & numérique, univers poétiques et fantasy")
  `);

	// ============================================
	// TAGS
	// ============================================
	await connection.query(`
    INSERT INTO tags (name, slug) VALUES
    ("Aquarelle", "aquarelle"),
    ("Illustration numérique", "illustration-numerique"),
    ("Portrait", "portrait"),
    ("Paysage", "paysage"),
    ("Fantasy", "fantasy"),
    ("Processus créatif", "processus-creatif"),
    ("Tutoriel", "tutoriel"),
    ("Projet personnel", "projet-personnel"),
    ("Commande", "commande"),
    ("Croquis", "croquis")
  `);

	// ============================================
	// CATEGORIES
	// ============================================
	await connection.query(`
    INSERT INTO categories (name, slug, display_order) VALUES
    ("Portraits", "portraits", 1),
    ("Aquarelle", "aquarelle", 2),
    ("Paysages", "paysages", 3),
    ("Fantasy", "fantasy", 4),
    ("Croquis & esquisses", "croquis-esquisses", 5)
  `);

	// ============================================
	// ARTICLES - étape 1 : sans featured_image_id
	// (dépendance circulaire avec images, résolue après)
	// ============================================
	await connection.query(`
    INSERT INTO articles (title, slug, excerpt, content, status, user_id, featured_image_id, published_at, views) VALUES
    ("Découvrir l'aquarelle : Guide pour débutants", "decouvrir-aquarelle-guide-debutants", "Premiers pas avec l'aquarelle : matériel, techniques de base et exercices pratiques pour commencer.", "L'aquarelle est une technique fascinante qui permet de créer des œuvres aux couleurs lumineuses et transparentes. Cet article vous guide dans vos premiers pas : choix du matériel, compréhension de l'eau et des pigments, techniques de base comme le lavis et le mouillé sur mouillé. Nous explorerons aussi les erreurs courantes à éviter et des exercices pratiques pour progresser rapidement.", "published", 1, NULL, "2024-01-15 10:00:00", 245),
    ("Mon processus créatif : De l'esquisse à l'illustration finale", "processus-creatif-esquisse-illustration", "Plongez dans mon workflow créatif, du premier croquis au rendu numérique final.", "Chaque illustration a son histoire. Dans cet article, je partage mon processus de création étape par étape : la recherche d'inspiration, les croquis initiaux, la composition, le choix de la palette de couleurs, et le travail de rendu. Découvrez comment une simple idée se transforme en œuvre finale, avec des exemples tirés de mes projets récents.", "published", 2, NULL, "2024-02-10 14:30:00", 189),
    ("Techniques de portrait : Capturer l'émotion", "techniques-portrait-emotion", "Apprenez à créer des portraits expressifs qui transmettent les émotions et la personnalité.", "Réaliser un portrait qui vit et respire nécessite de maîtriser plusieurs aspects : la structure du visage, la gestion des valeurs, la captation de l'expression, et le traitement des détails. Cet article approfondit ces techniques, que vous travailliez à l'aquarelle, au crayon ou en numérique. Nous verrons comment donner vie à vos portraits et créer une connexion émotionnelle avec le spectateur.", "published", 1, NULL, "2024-03-05 09:15:00", 312),
    ("Créer des paysages fantastiques en numérique", "paysages-fantastiques-numerique", "Tutoriel complet pour illustrer des environnements oniriques et épiques.", "Les paysages fantastiques offrent une liberté créative immense. Dans ce tutoriel, je vous montre comment créer des environnements magiques : l'utilisation des lumières, la gestion de l'atmosphère, les techniques de peinture numérique, et la création d'éléments fantastiques. Apprenez à construire des mondes qui transportent le spectateur dans votre univers imaginaire.", "published", 2, NULL, "2024-03-20 11:00:00", 156),
    ("Tutoriel : Peindre un dragon étape par étape", "tutoriel-peindre-dragon", "Guide détaillé pour créer une illustration de dragon de la conception au rendu final.", "Les dragons sont des créatures mythiques fascinantes à illustrer. Ce tutoriel vous accompagne dans la création complète d'un dragon : l'étude de l'anatomie reptilienne, la composition dynamique, le travail des écailles et textures, et les effets de lumière. Chaque étape est illustrée avec des exemples pour vous guider dans votre propre création.", "published", 1, NULL, "2024-04-12 16:45:00", 278),
    ("La palette de couleurs en illustration fantasy", "palette-couleurs-fantasy", "Découvrez comment choisir et utiliser les couleurs pour créer une ambiance fantastique.", "Les couleurs sont essentielles pour établir l'ambiance d'une illustration fantasy. Cet article explore les palettes de couleurs efficaces : les couleurs chaudes pour la magie, les teintes froides pour les scènes nocturnes, les contrastes pour le drame, et l'harmonie chromatique. Nous verrons comment les couleurs influencent l'émotion et guident le regard du spectateur.", "published", 2, NULL, "2024-05-01 13:20:00", 421),
    ("10 Astuces pour améliorer vos croquis", "astuces-ameliorer-croquis", "Conseils pratiques pour développer votre technique de dessin et rendre vos croquis plus expressifs.", "Le croquis est la base de toute bonne illustration. Cet article partage 10 astuces pour améliorer rapidement vos croquis : la gestion de la ligne, la construction des formes, l'observation, le geste rapide, la simplification, et l'expressivité. Que vous travailliez d'observation ou d'imagination, ces conseils vous aideront à développer votre main et votre œil.", "published", 1, NULL, "2024-05-18 10:30:00", 534),
    ("Projet personnel : Série de portraits fantastiques", "projet-personnel-portraits-fantasy", "Présentation de ma dernière série de portraits de personnages fantasy avec making-of.", "Je suis ravie de présenter ma nouvelle série de portraits fantasy ! Dans cet article, je partage le processus créatif derrière ces œuvres : l'inspiration tirée de la mythologie, les recherches de personnages, les choix esthétiques, et les défis rencontrés. Découvrez les croquis préparatoires, les études de couleurs, et les illustrations finales de cette série qui explore différents archétypes fantastiques.", "published", 2, NULL, "2024-06-10 15:00:00", 367),
    ("Réaliser une illustration botanique à l'aquarelle", "illustration-botanique-aquarelle", "Techniques spécialisées pour illustrer les plantes et fleurs avec précision et beauté.", "L'illustration botanique allie précision scientifique et sens esthétique. Cet article couvre les techniques spécifiques pour peindre les plantes à l'aquarelle : l'observation détaillée, la gestion des textures, la représentation des volumes, et le rendu des couleurs naturelles. Apprenez à capturer la beauté de la nature avec minutie et élégance.", "draft", 1, NULL, NULL, 0),
    ("L'art du portrait numérique : Techniques avancées", "art-portrait-numerique-techniques", "Méthodes avancées pour créer des portraits numériques stylisés et expressifs.", "Le portrait numérique offre des possibilités infinies. Cet article approfondit les techniques avancées : l'utilisation des calques de couleur, les modes de fusion, les pinceaux personnalisés, le traitement des textures, et le stylisation. Nous explorerons aussi comment créer une identité visuelle forte dans vos portraits et développer votre style personnel.", "published", 2, NULL, "2024-07-05 12:00:00", 289),
    ("Composer une scène narrative en illustration", "composer-scene-narrative-illustration", "Structurer une image pour raconter une histoire en un seul regard.", "Une illustration narrative doit guider le regard et installer un contexte clair. Dans cet article, nous travaillons la hiérarchie visuelle, la mise en scène des personnages et la lisibilité de l'action. Vous verrez comment choisir les éléments clés, simplifier l'arrière-plan et renforcer la narration avec la lumière.", "published", 1, NULL, "2024-07-12 10:15:00", 198),
    ("Étude des mains : méthode simple et efficace", "etude-mains-methode-simple", "Des repères pratiques pour dessiner des mains plus naturelles.", "Les mains sont souvent perçues comme difficiles, mais elles deviennent accessibles avec une approche structurée. Nous verrons les volumes principaux, les axes de mouvement, des poses fréquentes et des exercices rapides. L'objectif est d'améliorer la justesse sans perdre l'expressivité du trait.", "published", 2, NULL, "2024-07-18 09:45:00", 243),
    ("Peindre une ambiance nocturne en aquarelle", "ambiance-nocturne-aquarelle", "Créer des nocturnes lumineux sans perdre la transparence des couleurs.", "La nuit en aquarelle demande une gestion précise des contrastes et de l'eau. Cet article montre comment préparer une palette adaptée, réserver les zones de lumière et construire des ombres profondes. Vous apprendrez à obtenir une atmosphère douce et crédible avec peu de pigments.", "published", 1, NULL, "2024-07-25 18:20:00", 176),
    ("Design de personnage : du concept à la fiche finale", "design-personnage-concept-fiche-finale", "Méthode complète pour concevoir un personnage cohérent.", "Concevoir un personnage, c'est relier silhouette, personnalité et fonction narrative. Nous avançons de l'idée initiale vers une fiche claire : recherches de formes, variations de costumes, palette et accessoires. Un processus utile pour les univers fantasy comme pour les projets éditoriaux.", "published", 2, NULL, "2024-08-02 11:10:00", 332),
    ("Choisir ses pinceaux numériques sans se disperser", "choisir-pinceaux-numeriques-sans-dispersion", "Une sélection raisonnée de pinceaux pour gagner en régularité.", "Accumuler des centaines de pinceaux ralentit souvent la progression. Ici, je propose une trousse minimale et polyvalente pour croquis, rendu et texture. Vous verrez comment adapter chaque brosse à votre intention visuelle et garder une identité graphique cohérente.", "published", 1, NULL, "2024-08-08 14:00:00", 221),
    ("Workflow client : réussir une commande d'illustration", "workflow-client-commande-illustration", "Organisation, validations et communication pour les projets commandés.", "Une commande réussie repose sur un cadre clair dès le départ. Nous passons en revue le brief, les étapes de validation, la gestion des retours et la livraison des fichiers. L'article donne des modèles simples pour sécuriser le planning et préserver la qualité créative.", "published", 2, NULL, "2024-08-14 16:30:00", 307),
    ("Croquis quotidiens : routine de 20 minutes", "croquis-quotidiens-routine-20-minutes", "Mettre en place une pratique courte mais efficace chaque jour.", "Une routine courte et régulière vaut mieux qu'une longue session occasionnelle. Je détaille un programme de 20 minutes : échauffement, étude ciblée et mini-composition. Cette méthode aide à gagner en fluidité et à renforcer la mémoire visuelle.", "published", 1, NULL, "2024-08-21 08:40:00", 412),
    ("Créer de la profondeur avec la perspective atmosphérique", "profondeur-perspective-atmospherique", "Donner de l'espace à vos paysages avec quelques réglages clés.", "La perspective atmosphérique repose sur la perte de contraste, la désaturation et le flou progressif. Cet article montre comment hiérarchiser les plans et calibrer les couleurs selon la distance. Le résultat : des paysages plus lisibles et immersifs.", "published", 2, NULL, "2024-08-29 12:25:00", 265),
    ("Illustrer la pluie : textures et lumière", "illustrer-pluie-textures-lumiere", "Techniques pour rendre une scène pluvieuse crédible et vivante.", "La pluie transforme les matières et la perception des volumes. Nous travaillons les reflets au sol, les silhouettes dans la brume et les effets de contre-jour. Des astuces simples permettent d'obtenir un rendu convaincant sans surcharger l'image.", "published", 1, NULL, "2024-09-04 17:10:00", 191),
    ("Anatomie simplifiée pour artistes fantasy", "anatomie-simplifiee-artistes-fantasy", "Des bases anatomiques fiables pour styliser sans perdre la cohérence.", "Styliser un personnage ne signifie pas ignorer l'anatomie. Nous abordons les masses principales, les proportions utiles et les points d'articulation essentiels. Avec ces repères, vous pourrez exagérer les formes tout en gardant des poses crédibles.", "published", 2, NULL, "2024-09-11 10:05:00", 358),
    ("Palette limitée : peindre avec 4 couleurs", "palette-limitee-peindre-4-couleurs", "Exercice pratique pour améliorer harmonie et intention colorée.", "Travailler avec une palette réduite renforce la cohérence de vos images. Cet article propose plusieurs combinaisons de 4 couleurs et des études rapides pour tester les ambiances. Une contrainte idéale pour progresser sur les valeurs et les contrastes.", "published", 1, NULL, "2024-09-18 13:50:00", 274),
    ("Concevoir des créatures hybrides crédibles", "concevoir-creatures-hybrides-credibles", "Fusionner plusieurs références animales avec logique.", "Créer une créature hybride demande un socle anatomique solide. Nous verrons comment choisir les espèces de référence, aligner les structures osseuses et tester différentes silhouettes. L'objectif est d'obtenir des designs originaux qui restent plausibles.", "published", 2, NULL, "2024-09-26 15:35:00", 329),
    ("Color script : planifier l'émotion d'une série", "color-script-planifier-emotion-serie", "Utiliser les couleurs pour rythmer une narration visuelle.", "Le color script aide à répartir les ambiances et les tensions sur une suite d'images. Je partage une méthode simple pour définir des dominantes par scène et anticiper les transitions émotionnelles. Un outil très utile pour les projets longs.", "published", 1, NULL, "2024-10-03 11:55:00", 208),
    ("Dessiner des cheveux dynamiques", "dessiner-cheveux-dynamiques", "Volume, direction et lumière pour des coiffures vivantes.", "Les cheveux gagnent en impact quand on pense en mèches principales et non en détails isolés. Cet article traite du flux des formes, des plans de lumière et des erreurs fréquentes. Vous pourrez simplifier votre approche tout en gardant du caractère.", "published", 2, NULL, "2024-10-10 09:30:00", 236),
    ("Préparer ses fichiers pour l'impression", "preparer-fichiers-pour-impression", "Résolution, profils colorimétriques et marges à vérifier.", "Passer du numérique à l'impression nécessite quelques réglages techniques indispensables. Nous passons en revue DPI, mode colorimétrique, fond perdu et export final. Une checklist pratique pour éviter les mauvaises surprises au tirage.", "published", 1, NULL, "2024-10-17 14:45:00", 183),
    ("Études de lumière au coucher du soleil", "etudes-lumiere-coucher-soleil", "Capturer des ambiances chaudes avec des contrastes maîtrisés.", "Le coucher du soleil combine lumière rasante, teintes chaudes et ombres longues. Je propose des exercices ciblés pour analyser les transitions de température et placer les points focaux. De quoi enrichir rapidement vos scènes extérieures.", "published", 2, NULL, "2024-10-24 18:05:00", 259),
    ("Storyboard rapide pour illustrateurs", "storyboard-rapide-illustrateurs", "Construire une séquence claire avant l'illustration détaillée.", "Le storyboard n'est pas réservé à l'animation. En illustration, il permet de valider rythme, cadrage et lisibilité d'une série. Nous verrons un format simple en vignettes pour tester plusieurs options en peu de temps.", "published", 1, NULL, "2024-10-31 10:20:00", 146),
    ("Créer une bibliothèque de textures maison", "creer-bibliotheque-textures-maison", "Organiser ses textures pour accélérer le rendu final.", "Une bibliothèque de textures bien classée accélère la production sans uniformiser le style. Cet article explique comment capturer, nettoyer, nommer et réutiliser vos textures. Vous gagnerez du temps tout en gardant le contrôle artistique.", "published", 2, NULL, "2024-11-07 12:40:00", 215),
    ("Retouche finale : quand s'arrêter ?", "retouche-finale-quand-sarreter", "Repères pour finaliser une illustration sans la surtravailler.", "Savoir s'arrêter est une compétence clé en illustration. Nous explorons des critères concrets de finition : lisibilité, contraste, intention et cohérence des détails. Une méthode en étapes aide à décider objectivement du dernier coup de pinceau.", "published", 1, NULL, "2024-11-14 16:00:00", 301),
    ("Bilan annuel : progrès, erreurs et objectifs", "bilan-annuel-progres-erreurs-objectifs", "Retour d'expérience sur une année de pratique artistique.", "Faire un bilan structuré permet d'identifier ce qui fonctionne vraiment dans sa progression. Je partage mes réussites, mes erreurs récurrentes et les axes de travail pour l'année suivante. Un article utile pour construire une pratique durable et motivante.", "draft", 2, NULL, NULL, 0)
  `);

	// ============================================
	// IMAGES (2 par article, ids 1–60 sur base vide)
	// ============================================
	await connection.query(`
    INSERT INTO images (title, description, path, alt_descr, is_in_gallery, user_id, article_id, category_id) VALUES
    ("Visuel principal — Guide aquarelle débutants", "Illustration d'accompagnement pour l'article.", "/uploads/images/portrait-aquarelle.jpg", "Image principale : Guide aquarelle débutants", TRUE, 1, 1, 2),
    ("Détail — Guide aquarelle débutants", "Vue complémentaire (croquis ou zoom).", "/uploads/images/materiel-aquarelle.jpg", "Détail : Guide aquarelle débutants", FALSE, 1, 1, NULL),
    ("Visuel principal — Processus créatif", "Illustration d'accompagnement pour l'article.", "/uploads/images/paysage-fantasy.jpg", "Image principale : Processus créatif", TRUE, 2, 2, 5),
    ("Détail — Processus créatif", "Vue complémentaire (croquis ou zoom).", "/uploads/images/croquis-preparatoire.jpg", "Détail : Processus créatif", FALSE, 2, 2, NULL),
    ("Visuel principal — Portrait et émotion", "Illustration d'accompagnement pour l'article.", "/uploads/images/portrait-crayon.jpg", "Image principale : Portrait et émotion", TRUE, 1, 3, 1),
    ("Détail — Portrait et émotion", "Vue complémentaire (croquis ou zoom).", "/uploads/images/etude-portrait-emotion.jpg", "Détail : Portrait et émotion", FALSE, 1, 3, NULL),
    ("Visuel principal — Paysage fantastique numérique", "Illustration d'accompagnement pour l'article.", "/uploads/images/foret-enchantee.jpg", "Image principale : Paysage fantastique numérique", TRUE, 2, 4, 3),
    ("Détail — Paysage fantastique numérique", "Vue complémentaire (croquis ou zoom).", "/uploads/images/ambiance-paysage-fantasy.jpg", "Détail : Paysage fantastique numérique", FALSE, 2, 4, NULL),
    ("Visuel principal — Tutoriel dragon", "Illustration d'accompagnement pour l'article.", "/uploads/images/dragon-volant.jpg", "Image principale : Tutoriel dragon", TRUE, 1, 5, 4),
    ("Détail — Tutoriel dragon", "Vue complémentaire (croquis ou zoom).", "/uploads/images/detail-eccailles-dragon.jpg", "Détail : Tutoriel dragon", FALSE, 1, 5, NULL),
    ("Visuel principal — Palette fantasy", "Illustration d'accompagnement pour l'article.", "/uploads/images/palette-fantasy.jpg", "Image principale : Palette fantasy", TRUE, 2, 6, 4),
    ("Détail — Palette fantasy", "Vue complémentaire (croquis ou zoom).", "/uploads/images/harmonies-couleurs-fantasy.jpg", "Détail : Palette fantasy", FALSE, 2, 6, NULL),
    ("Visuel principal — Astuces croquis", "Illustration d'accompagnement pour l'article.", "/uploads/images/esquisse-creature.jpg", "Image principale : Astuces croquis", TRUE, 1, 7, 5),
    ("Détail — Astuces croquis", "Vue complémentaire (croquis ou zoom).", "/uploads/images/croquis-expressif.jpg", "Détail : Astuces croquis", FALSE, 1, 7, NULL),
    ("Visuel principal — Série portraits fantasy", "Illustration d'accompagnement pour l'article.", "/uploads/images/personnage-fantasy.jpg", "Image principale : Série portraits fantasy", TRUE, 2, 8, 1),
    ("Détail — Série portraits fantasy", "Vue complémentaire (croquis ou zoom).", "/uploads/images/serie-portraits-fantasy.jpg", "Détail : Série portraits fantasy", FALSE, 2, 8, NULL),
    ("Visuel principal — Botanique aquarelle", "Illustration d'accompagnement pour l'article.", "/uploads/images/botanique-aquarelle.jpg", "Image principale : Botanique aquarelle", TRUE, 1, 9, 2),
    ("Détail — Botanique aquarelle", "Vue complémentaire (croquis ou zoom).", "/uploads/images/details-botanique-aquarelle.jpg", "Détail : Botanique aquarelle", FALSE, 1, 9, NULL),
    ("Visuel principal — Portrait numérique avancé", "Illustration d'accompagnement pour l'article.", "/uploads/images/portrait-numerique.jpg", "Image principale : Portrait numérique avancé", TRUE, 2, 10, 1),
    ("Détail — Portrait numérique avancé", "Vue complémentaire (croquis ou zoom).", "/uploads/images/rendu-portrait-numerique.jpg", "Détail : Portrait numérique avancé", FALSE, 2, 10, NULL),
    ("Visuel principal — Scène narrative", "Illustration d'accompagnement pour l'article.", "/uploads/images/scene-narrative.jpg", "Image principale : Scène narrative", TRUE, 1, 11, 4),
    ("Détail — Scène narrative", "Vue complémentaire (croquis ou zoom).", "/uploads/images/composition-scene-narrative.jpg", "Détail : Scène narrative", FALSE, 1, 11, NULL),
    ("Visuel principal — Étude des mains", "Illustration d'accompagnement pour l'article.", "/uploads/images/etude-mains.jpg", "Image principale : Étude des mains", TRUE, 2, 12, 5),
    ("Détail — Étude des mains", "Vue complémentaire (croquis ou zoom).", "/uploads/images/croquis-mains.jpg", "Détail : Étude des mains", FALSE, 2, 12, NULL),
    ("Visuel principal — Nocturne aquarelle", "Illustration d'accompagnement pour l'article.", "/uploads/images/nocturne-aquarelle.jpg", "Image principale : Nocturne aquarelle", TRUE, 1, 13, 2),
    ("Détail — Nocturne aquarelle", "Vue complémentaire (croquis ou zoom).", "/uploads/images/lumieres-nocturnes-aquarelle.jpg", "Détail : Nocturne aquarelle", FALSE, 1, 13, NULL),
    ("Visuel principal — Design de personnage", "Illustration d'accompagnement pour l'article.", "/uploads/images/design-personnage.jpg", "Image principale : Design de personnage", TRUE, 2, 14, 4),
    ("Détail — Design de personnage", "Vue complémentaire (croquis ou zoom).", "/uploads/images/variations-design-personnage.jpg", "Détail : Design de personnage", FALSE, 2, 14, NULL),
    ("Visuel principal — Pinceaux numériques", "Illustration d'accompagnement pour l'article.", "/uploads/images/pinceaux-numeriques.jpg", "Image principale : Pinceaux numériques", TRUE, 1, 15, 5),
    ("Détail — Pinceaux numériques", "Vue complémentaire (croquis ou zoom).", "/uploads/images/tests-pinceaux-numeriques.jpg", "Détail : Pinceaux numériques", FALSE, 1, 15, NULL),
    ("Visuel principal — Commande illustration", "Illustration d'accompagnement pour l'article.", "/uploads/images/workflow-commande.jpg", "Image principale : Commande illustration", TRUE, 2, 16, 4),
    ("Détail — Commande illustration", "Vue complémentaire (croquis ou zoom).", "/uploads/images/etapes-commande-illustration.jpg", "Détail : Commande illustration", FALSE, 2, 16, NULL),
    ("Visuel principal — Routine croquis 20 min", "Illustration d'accompagnement pour l'article.", "/uploads/images/routine-croquis.jpg", "Image principale : Routine croquis 20 min", TRUE, 1, 17, 5),
    ("Détail — Routine croquis 20 min", "Vue complémentaire (croquis ou zoom).", "/uploads/images/echauffement-croquis.jpg", "Détail : Routine croquis 20 min", FALSE, 1, 17, NULL),
    ("Visuel principal — Perspective atmosphérique", "Illustration d'accompagnement pour l'article.", "/uploads/images/perspective-atmospherique.jpg", "Image principale : Perspective atmosphérique", TRUE, 2, 18, 3),
    ("Détail — Perspective atmosphérique", "Vue complémentaire (croquis ou zoom).", "/uploads/images/plans-profondeur.jpg", "Détail : Perspective atmosphérique", FALSE, 2, 18, NULL),
    ("Visuel principal — Pluie textures lumière", "Illustration d'accompagnement pour l'article.", "/uploads/images/pluie-textures-lumiere.jpg", "Image principale : Pluie textures lumière", TRUE, 1, 19, 3),
    ("Détail — Pluie textures lumière", "Vue complémentaire (croquis ou zoom).", "/uploads/images/reflets-scene-pluie.jpg", "Détail : Pluie textures lumière", FALSE, 1, 19, NULL),
    ("Visuel principal — Anatomie fantasy", "Illustration d'accompagnement pour l'article.", "/uploads/images/anatomie-fantasy.jpg", "Image principale : Anatomie fantasy", TRUE, 2, 20, 4),
    ("Détail — Anatomie fantasy", "Vue complémentaire (croquis ou zoom).", "/uploads/images/etude-anatomie-fantasy.jpg", "Détail : Anatomie fantasy", FALSE, 2, 20, NULL),
    ("Visuel principal — Palette quatre couleurs", "Illustration d'accompagnement pour l'article.", "/uploads/images/palette-quatre-couleurs.jpg", "Image principale : Palette quatre couleurs", TRUE, 1, 21, 2),
    ("Détail — Palette quatre couleurs", "Vue complémentaire (croquis ou zoom).", "/uploads/images/etude-palette-limitee.jpg", "Détail : Palette quatre couleurs", FALSE, 1, 21, NULL),
    ("Visuel principal — Créatures hybrides", "Illustration d'accompagnement pour l'article.", "/uploads/images/creatures-hybrides.jpg", "Image principale : Créatures hybrides", TRUE, 2, 22, 4),
    ("Détail — Créatures hybrides", "Vue complémentaire (croquis ou zoom).", "/uploads/images/silhouettes-creatures-hybrides.jpg", "Détail : Créatures hybrides", FALSE, 2, 22, NULL),
    ("Visuel principal — Color script", "Illustration d'accompagnement pour l'article.", "/uploads/images/color-script.jpg", "Image principale : Color script", TRUE, 1, 23, 4),
    ("Détail — Color script", "Vue complémentaire (croquis ou zoom).", "/uploads/images/planches-color-script.jpg", "Détail : Color script", FALSE, 1, 23, NULL),
    ("Visuel principal — Cheveux dynamiques", "Illustration d'accompagnement pour l'article.", "/uploads/images/cheveux-dynamiques.jpg", "Image principale : Cheveux dynamiques", TRUE, 2, 24, 1),
    ("Détail — Cheveux dynamiques", "Vue complémentaire (croquis ou zoom).", "/uploads/images/meches-cheveux-dynamiques.jpg", "Détail : Cheveux dynamiques", FALSE, 2, 24, NULL),
    ("Visuel principal — Fichiers impression", "Illustration d'accompagnement pour l'article.", "/uploads/images/fichiers-impression.jpg", "Image principale : Fichiers impression", TRUE, 1, 25, 5),
    ("Détail — Fichiers impression", "Vue complémentaire (croquis ou zoom).", "/uploads/images/checklist-impression.jpg", "Détail : Fichiers impression", FALSE, 1, 25, NULL),
    ("Visuel principal — Lumière coucher soleil", "Illustration d'accompagnement pour l'article.", "/uploads/images/lumiere-coucher-soleil.jpg", "Image principale : Lumière coucher soleil", TRUE, 2, 26, 3),
    ("Détail — Lumière coucher soleil", "Vue complémentaire (croquis ou zoom).", "/uploads/images/etude-lumiere-chaude.jpg", "Détail : Lumière coucher soleil", FALSE, 2, 26, NULL),
    ("Visuel principal — Storyboard illustrateurs", "Illustration d'accompagnement pour l'article.", "/uploads/images/storyboard-illustrateurs.jpg", "Image principale : Storyboard illustrateurs", TRUE, 1, 27, 5),
    ("Détail — Storyboard illustrateurs", "Vue complémentaire (croquis ou zoom).", "/uploads/images/vignettes-storyboard.jpg", "Détail : Storyboard illustrateurs", FALSE, 1, 27, NULL),
    ("Visuel principal — Bibliothèque textures", "Illustration d'accompagnement pour l'article.", "/uploads/images/bibliotheque-textures.jpg", "Image principale : Bibliothèque textures", TRUE, 2, 28, 3),
    ("Détail — Bibliothèque textures", "Vue complémentaire (croquis ou zoom).", "/uploads/images/classement-textures.jpg", "Détail : Bibliothèque textures", FALSE, 2, 28, NULL),
    ("Visuel principal — Retouche finale", "Illustration d'accompagnement pour l'article.", "/uploads/images/retouche-finale.jpg", "Image principale : Retouche finale", TRUE, 1, 29, 3),
    ("Détail — Retouche finale", "Vue complémentaire (croquis ou zoom).", "/uploads/images/controles-retouche-finale.jpg", "Détail : Retouche finale", FALSE, 1, 29, NULL),
    ("Visuel principal — Bilan annuel créatif", "Illustration d'accompagnement pour l'article.", "/uploads/images/bilan-annuel-creatif.jpg", "Image principale : Bilan annuel créatif", TRUE, 2, 30, 5),
    ("Détail — Bilan annuel créatif", "Vue complémentaire (croquis ou zoom).", "/uploads/images/objectifs-progression-annuelle.jpg", "Détail : Bilan annuel créatif", FALSE, 2, 30, NULL)
  `);

	// ============================================
	// ARTICLES - étape 2 : résolution de la dépendance circulaire
	// ============================================
	await connection.query(`
    UPDATE articles SET featured_image_id = CASE id WHEN 1 THEN 1 WHEN 2 THEN 3 WHEN 3 THEN 5 WHEN 4 THEN 7 WHEN 5 THEN 9 WHEN 6 THEN 11 WHEN 7 THEN 13 WHEN 8 THEN 15 WHEN 9 THEN 17 WHEN 10 THEN 19 WHEN 11 THEN 21 WHEN 12 THEN 23 WHEN 13 THEN 25 WHEN 14 THEN 27 WHEN 15 THEN 29 WHEN 16 THEN 31 WHEN 17 THEN 33 WHEN 18 THEN 35 WHEN 19 THEN 37 WHEN 20 THEN 39 WHEN 21 THEN 41 WHEN 22 THEN 43 WHEN 23 THEN 45 WHEN 24 THEN 47 WHEN 25 THEN 49 WHEN 26 THEN 51 WHEN 27 THEN 53 WHEN 28 THEN 55 WHEN 29 THEN 57 WHEN 30 THEN 59 END WHERE id BETWEEN 1 AND 30
  `);

	// ============================================
	// RELATIONS : Articles <-> Tags
	// ============================================
	await connection.query(`
    INSERT INTO articles_tags (article_id, tag_id) VALUES
    (1, 1),
    (1, 7),
    (2, 6),
    (3, 3),
    (3, 7),
    (4, 2),
    (4, 5),
    (4, 7),
    (5, 5),
    (5, 7),
    (6, 5),
    (6, 6),
    (7, 10),
    (8, 5),
    (8, 8),
    (9, 1),
    (9, 7),
    (10, 2),
    (10, 3),
    (10, 7),
    (11, 2),
    (11, 5),
    (11, 7),
    (12, 7),
    (12, 10),
    (13, 1),
    (13, 7),
    (14, 5),
    (14, 6),
    (15, 2),
    (15, 10),
    (16, 6),
    (16, 8),
    (17, 10),
    (17, 6),
    (18, 2),
    (18, 4),
    (18, 7),
    (19, 2),
    (19, 7),
    (20, 5),
    (20, 7),
    (21, 1),
    (21, 6),
    (22, 5),
    (22, 10),
    (23, 2),
    (23, 6),
    (24, 3),
    (24, 10),
    (25, 2),
    (25, 8),
    (26, 1),
    (26, 4),
    (27, 10),
    (27, 7),
    (28, 2),
    (28, 6),
    (29, 2),
    (29, 7),
    (30, 6),
    (30, 10)
  `);

	// ============================================
	// RELATIONS : Images <-> Tags
	// ============================================
	await connection.query(`
    INSERT INTO images_tags (image_id, tag_id) VALUES
    (1, 1),
    (2, 1),
    (1, 7),
    (2, 7),
    (3, 6),
    (4, 6),
    (5, 3),
    (6, 3),
    (5, 7),
    (6, 7),
    (7, 2),
    (8, 2),
    (7, 5),
    (8, 5),
    (7, 7),
    (8, 7),
    (9, 5),
    (10, 5),
    (9, 7),
    (10, 7),
    (11, 5),
    (12, 5),
    (11, 6),
    (12, 6),
    (13, 10),
    (14, 10),
    (15, 5),
    (16, 5),
    (15, 8),
    (16, 8),
    (17, 1),
    (18, 1),
    (17, 7),
    (18, 7),
    (19, 2),
    (20, 2),
    (19, 3),
    (20, 3),
    (19, 7),
    (20, 7),
    (21, 2),
    (22, 2),
    (21, 5),
    (22, 5),
    (21, 7),
    (22, 7),
    (23, 7),
    (24, 7),
    (23, 10),
    (24, 10),
    (25, 1),
    (26, 1),
    (25, 7),
    (26, 7),
    (27, 5),
    (28, 5),
    (27, 6),
    (28, 6),
    (29, 2),
    (30, 2),
    (29, 10),
    (30, 10),
    (31, 6),
    (32, 6),
    (31, 8),
    (32, 8),
    (33, 10),
    (34, 10),
    (33, 6),
    (34, 6),
    (35, 2),
    (36, 2),
    (35, 4),
    (36, 4),
    (35, 7),
    (36, 7),
    (37, 2),
    (38, 2),
    (37, 7),
    (38, 7),
    (39, 5),
    (40, 5),
    (39, 7),
    (40, 7),
    (41, 1),
    (42, 1),
    (41, 6),
    (42, 6),
    (43, 5),
    (44, 5),
    (43, 10),
    (44, 10),
    (45, 2),
    (46, 2),
    (45, 6),
    (46, 6),
    (47, 3),
    (48, 3),
    (47, 10),
    (48, 10),
    (49, 2),
    (50, 2),
    (49, 8),
    (50, 8),
    (51, 1),
    (52, 1),
    (51, 4),
    (52, 4),
    (53, 10),
    (54, 10),
    (53, 7),
    (54, 7),
    (55, 2),
    (56, 2),
    (55, 6),
    (56, 6),
    (57, 2),
    (58, 2),
    (57, 7),
    (58, 7),
    (59, 6),
    (60, 6),
    (59, 10),
    (60, 10)
  `);

	// ============================================
	// MESSAGES
	// ============================================
	await connection.query(`
    INSERT INTO messages (firstname, lastname, email, ip, subject, text, status, user_id) VALUES
    ("Jean", "Dupont", "jean.dupont@example.com", "192.168.1.100", "Question sur votre tutoriel aquarelle", "Bonjour, j'ai lu votre article sur l'aquarelle et j'aimerais en savoir plus sur les techniques de lavis. Pourriez-vous m'aider ?", "unread", NULL),
    ("Marie", "Dubois", "marie.dubois@example.com", "192.168.1.101", "Demande de commission", "Bonjour, je suis éditrice et nous recherchons une illustratrice pour un livre jeunesse. Vos œuvres nous intéressent beaucoup. Pourrions-nous discuter ?", "read", NULL),
    ("Thomas", "Lefebvre", "thomas.lefebvre@example.com", "192.168.1.102", "Demande de prix", "Bonjour, j'adore vos illustrations fantasy ! Pourriez-vous me donner une estimation pour un portrait personnalisé ?", "unread", NULL),
    ("Julie", "Garcia", "julie.garcia@example.com", "192.168.1.103", "Proposition d'exposition", "Excellente galerie ! J'organise une exposition d'illustration numérique et j'aimerais vous y inviter. Seriez-vous intéressée ?", "read", NULL),
    ("Antoine", "Petit", "antoine.petit@example.com", "192.168.1.104", "Demande d'information", "Bonjour, pourriez-vous me donner plus d'informations sur vos créneaux disponibles pour une commande ? Je suis intéressé par une illustration personnalisée.", "unread", NULL),
    ("Laura", "Robert", "laura.robert@example.com", "192.168.1.105", "Proposition de collaboration", "Bonjour, je suis autrice de fantasy et j'aimerais collaborer avec vous sur des illustrations pour mon prochain roman. Êtes-vous ouverte à cela ?", "read", NULL),
    ("Nicolas", "Richard", "nicolas.richard@example.com", "192.168.1.106", "Félicitations pour votre travail", "Bravo pour votre magnifique portfolio ! Vos illustrations sont vraiment inspirantes et pleines de poésie. Continuez ainsi !", "archived", NULL),
    ("Sophie", "Bernard", "sophie.bernard@example.com", "192.168.1.107", "Question sur les techniques", "J'ai une question sur votre technique de portrait numérique. Pourriez-vous m'expliquer comment vous travaillez les textures ?", "unread", NULL),
    ("Maxime", "Simon", "maxime.simon@example.com", "192.168.1.108", "Demande de workshop", "Bonjour, j'anime des ateliers d'illustration et j'aimerais vous inviter à donner un workshop. Êtes-vous intéressée ?", "read", NULL),
    ("Sarah", "Michel", "sarah.michel@example.com", "192.168.1.109", "Remerciement", "Un grand merci pour tous vos tutoriels ! Ils m'ont beaucoup aidé dans mon apprentissage de l'illustration numérique.", "archived", NULL)
  `);

	// ============================================
	// COMMENTS
	// ============================================
	await connection.query(`
    INSERT INTO comments (text, status, user_id, article_id, firstname, lastname, email) VALUES
    ("Excellent tutoriel ! L'aquarelle m'a toujours intimidée mais vos explications sont très claires. Merci !", "approved", NULL, 1, "Marie", "Dubois", "marie.dubois@example.com"),
    ("J'adore voir votre processus créatif ! C'est fascinant de suivre la transformation de l'esquisse à l'œuvre finale.", "approved", NULL, 2, "Pierre", "Martin", "pierre.martin@example.com"),
    ("Super article sur les portraits ! Pourriez-vous faire une suite sur les expressions faciales ?", "approved", NULL, 3, "Sophie", "Bernard", "sophie.bernard@example.com"),
    ("Cet article sur les paysages fantasy est une source d'inspiration ! J'ai déjà essayé quelques techniques.", "approved", NULL, 4, "Lucas", "Roux", "lucas.roux@example.com"),
    ("Votre tutoriel sur le dragon est génial ! Les étapes sont bien détaillées, je vais m'y mettre.", "approved", NULL, 5, "Emma", "Lucas", "emma.lucas@example.com"),
    ("Spam comment with promotional links and unwanted content.", "spam", NULL, 3, "Spam", "User", "spam@example.com"),
    ("Je trouve que certaines palettes de couleurs sont difficiles à maîtriser. Avez-vous des conseils pour les débutants ?", "approved", NULL, 6, "Pierre", "Martin", "pierre.martin@example.com"),
    ("Merci pour ces astuces sur les croquis ! J'ai déjà appliqué plusieurs techniques et je vois la différence.", "approved", NULL, 7, "Sophie", "Bernard", "sophie.bernard@example.com"),
    ("This is a test comment that should be rejected.", "rejected", NULL, 2, "Test", "Reject", "reject@example.com"),
    ("Votre série de portraits fantasy est magnifique ! Où peut-on voir l'ensemble de la série ?", "approved", NULL, 8, "Emma", "Lucas", "emma.lucas@example.com")
  `);
}
