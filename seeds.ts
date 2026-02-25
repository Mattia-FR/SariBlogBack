import type { Connection } from "mysql2/promise";

export async function runSeeds(connection: Connection): Promise<void> {
	// ============================================
	// USERS (1 admin + 1 éditeur + 5 subscribers)
	// Mots de passe hashés avec Argon2id :
	//   admin        → Reve42
	//   sari.eliott  → Serenite26
	//   marie.dubois → Aventure54
	//   pierre.martin → Equilibre10
	//   sophie.bernard → Lueur29
	//   lucas.roux   → Echo77
	//   emma.lucas   → Infini00
	// ============================================
	await connection.query(`
    INSERT INTO users (username, email, password, firstname, lastname, role, bio, bio_short) VALUES
    ("admin", "admin@sariblog.com", "$argon2id$v=19$m=65536,t=3,p=4$2eNt3aySYfYyyervEcFtiQ$6wM6Qj0SggDgPTd0Ycnl5KJYZcIjeiRg87Tm2AZTUfI", NULL, NULL, "admin", NULL, NULL),
    ("sari.eliott", "sari.eliott@sariblog.com", "$argon2id$v=19$m=65536,t=3,p=4$wkio5piGN9BZtJAdkecJ3Q$tgbsy5tWsPXS5/bs7apwAqRGzupLzIay/rudaEMlPWU", "Sari", "Eliott", "editor", "Illustratrice et autrice visuelle spécialisée en aquarelle et illustration numérique. Son travail explore des univers poétiques et fantasy, entre narration visuelle et recherche d'atmosphères. Elle partage régulièrement son processus créatif, ses projets personnels et des tutoriels destinés aux artistes en devenir.", "Illustratrice aquarelle & numérique, univers poétiques et fantasy"),
    ("marie.dubois", "marie.dubois@example.com", "$argon2id$v=19$m=65536,t=3,p=4$24NWnxaZlg/vEexp8Ye5lA$RHylTbrzv+uTW9FU7rzbNzk39pnTieKqvTisUc0D+Sw", "Marie", "Dubois", "subscriber", NULL, NULL),
    ("pierre.martin", "pierre.martin@example.com", "$argon2id$v=19$m=65536,t=3,p=4$XQl79zwa6gatYl2hPNNg7Q$v/bP9N/f43A81EkKdc/abchYtdo4FaqFt9h9W47FF0I", "Pierre", "Martin", "subscriber", NULL, NULL),
    ("sophie.bernard", "sophie.bernard@example.com", "$argon2id$v=19$m=65536,t=3,p=4$5O77aH8f1ja8zzWfR8TY4Q$g3B66HUiuT8VNjGgQAtibiG75SXI125k/3f3bPNWBVA", "Sophie", "Bernard", "subscriber", NULL, NULL),
    ("lucas.roux", "lucas.roux@example.com", "$argon2id$v=19$m=65536,t=3,p=4$cZ8vo8j1zJtRb75XjycMKg$mYEVFVQTOlQRGoTeGbblXQKbfQDjI/0vollW0UeV/So", "Lucas", "Roux", "subscriber", NULL, NULL),
    ("emma.lucas", "emma.lucas@example.com", "$argon2id$v=19$m=65536,t=3,p=4$PgYC4hQgj76Rw6Kt1tjbOA$2cEjNYvBDNQ553TmlTpEVvxZFwdvC+FnI/pBwFzN5Tc", "Emma", "Lucas", "subscriber", NULL, NULL)
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
    ("L'art du portrait numérique : Techniques avancées", "art-portrait-numerique-techniques", "Méthodes avancées pour créer des portraits numériques stylisés et expressifs.", "Le portrait numérique offre des possibilités infinies. Cet article approfondit les techniques avancées : l'utilisation des calques de couleur, les modes de fusion, les pinceaux personnalisés, le traitement des textures, et le stylisation. Nous explorerons aussi comment créer une identité visuelle forte dans vos portraits et développer votre style personnel.", "published", 2, NULL, "2024-07-05 12:00:00", 289)
  `);

	// ============================================
	// IMAGES
	// ============================================
	await connection.query(`
    INSERT INTO images (title, description, path, alt_descr, is_in_gallery, user_id, article_id) VALUES
    ("Portrait féminin aquarelle", "Portrait expressif réalisé à l'aquarelle avec des tons pastels doux", "/uploads/images/portrait-aquarelle.jpg", "Portrait de femme à l'aquarelle", TRUE, 1, 1),
    ("Matériel aquarelle", "Présentation du matériel nécessaire pour débuter en aquarelle", "/uploads/images/materiel-aquarelle.jpg", "Matériel d'aquarelle pour débutants", FALSE, 1, 1),
    ("Paysage fantastique numérique", "Paysage onirique avec montagnes flottantes et couleurs vives", "/uploads/images/paysage-fantasy.jpg", "Illustration de paysage fantastique", TRUE, 2, 2),
    ("Croquis préparatoire", "Premier croquis du processus créatif montrant les étapes de conception", "/uploads/images/croquis-preparatoire.jpg", "Croquis préparatoire d'illustration", FALSE, 2, 2),
    ("Dragon volant", "Créature fantastique ailée dans un style détaillé", "/uploads/images/dragon-volant.jpg", "Illustration de dragon en vol", TRUE, 1, 5),
    ("Détail écailles dragon", "Détail technique montrant le travail des écailles et textures", "/uploads/images/detail-eccailles-dragon.jpg", "Détail des écailles de dragon", FALSE, 1, 5),
    ("Portrait au crayon", "Croquis de portrait réalisé au crayon graphite avec un rendu réaliste", "/uploads/images/portrait-crayon.jpg", "Croquis de portrait au crayon", FALSE, 2, 3),
    ("Forêt enchantée", "Illustration numérique d'une forêt magique avec des lumières féeriques", "/uploads/images/foret-enchantee.jpg", "Forêt magique illustrée", TRUE, 2, 4),
    ("Personnage fantasy", "Création de personnage pour un univers fantasy avec armure détaillée", "/uploads/images/personnage-fantasy.jpg", "Personnage de fantasy armé", TRUE, 1, NULL),
    ("Paysage aquarelle", "Vue de campagne réalisée à l'aquarelle avec technique humide sur humide", "/uploads/images/paysage-aquarelle.jpg", "Paysage bucolique à l'aquarelle", FALSE, 2, NULL),
    ("Esquisse de créature", "Croquis rapide d'une créature mythologique au style dynamique", "/uploads/images/esquisse-creature.jpg", "Esquisse de créature fantastique", TRUE, 1, 7),
    ("Croquis expressif", "Série de croquis rapides montrant différentes techniques de dessin", "/uploads/images/croquis-expressif.jpg", "Collection de croquis expressifs", FALSE, 1, 7),
    ("Portrait numérique", "Portrait stylisé réalisé numériquement avec palette de couleurs moderne", "/uploads/images/portrait-numerique.jpg", "Portrait stylisé numérique", TRUE, 2, 10),
    ("Aquarelle botanique", "Illustration de plantes et fleurs à l'aquarelle avec précision scientifique", "/uploads/images/botanique-aquarelle.jpg", "Illustration botanique aquarelle", TRUE, 1, NULL)
  `);

	// ============================================
	// ARTICLES - étape 2 : résolution de la dépendance circulaire
	// On peut maintenant relier les articles à leur image à la une
	// ============================================
	await connection.query(
		"UPDATE articles SET featured_image_id = 1  WHERE id = 1",
	);
	await connection.query(
		"UPDATE articles SET featured_image_id = 3  WHERE id = 2",
	);
	await connection.query(
		"UPDATE articles SET featured_image_id = 6  WHERE id = 3",
	);
	await connection.query(
		"UPDATE articles SET featured_image_id = 7  WHERE id = 4",
	);
	await connection.query(
		"UPDATE articles SET featured_image_id = 5  WHERE id = 5",
	);
	await connection.query(
		"UPDATE articles SET featured_image_id = 11 WHERE id = 7",
	);
	await connection.query(
		"UPDATE articles SET featured_image_id = 13 WHERE id = 10",
	);

	// ============================================
	// RELATIONS : Articles <-> Tags
	// ============================================
	await connection.query(`
    INSERT INTO articles_tags (article_id, tag_id) VALUES
    (1, 1), (1, 7),
    (2, 6),
    (3, 3), (3, 7),
    (4, 2), (4, 5), (4, 7),
    (5, 5), (5, 7),
    (6, 5), (6, 6),
    (7, 10),
    (8, 5), (8, 8),
    (9, 1), (9, 7),
    (10, 2), (10, 3), (10, 7)
  `);

	// ============================================
	// RELATIONS : Images <-> Tags
	// ============================================
	await connection.query(`
    INSERT INTO images_tags (image_id, tag_id) VALUES
    (1, 1), (1, 3),
    (3, 2), (3, 4), (3, 5),
    (5, 2), (5, 5),
    (7, 3), (7, 10),
    (8, 2), (8, 4), (8, 5),
    (9, 2), (9, 5),
    (10, 1), (10, 4),
    (11, 5), (11, 10),
    (13, 2), (13, 3),
    (14, 1)
  `);

	// ============================================
	// RELATIONS : Images <-> Categories
	// ============================================
	await connection.query(`
    INSERT INTO images_categories (image_id, category_id) VALUES
    (1, 1), (1, 2),
    (3, 3), (3, 4),
    (5, 4),
    (8, 3), (8, 4),
    (9, 4),
    (11, 4), (11, 5),
    (13, 1),
    (14, 2)
  `);

	// ============================================
	// MESSAGES
	// ============================================
	await connection.query(`
    INSERT INTO messages (firstname, lastname, email, ip, subject, text, status, user_id) VALUES
    ("Jean", "Dupont", "jean.dupont@example.com", "192.168.1.100", "Question sur votre tutoriel aquarelle", "Bonjour, j'ai lu votre article sur l'aquarelle et j'aimerais en savoir plus sur les techniques de lavis. Pourriez-vous m'aider ?", "unread", NULL),
    ("Marie", "Dubois", "marie.dubois@example.com", "192.168.1.101", "Demande de commission", "Bonjour, je suis éditrice et nous recherchons une illustratrice pour un livre jeunesse. Vos œuvres nous intéressent beaucoup. Pourrions-nous discuter ?", "read", 3),
    ("Thomas", "Lefebvre", "thomas.lefebvre@example.com", "192.168.1.102", "Demande de prix", "Bonjour, j'adore vos illustrations fantasy ! Pourriez-vous me donner une estimation pour un portrait personnalisé ?", "unread", NULL),
    ("Julie", "Garcia", "julie.garcia@example.com", "192.168.1.103", "Proposition d'exposition", "Excellente galerie ! J'organise une exposition d'illustration numérique et j'aimerais vous y inviter. Seriez-vous intéressée ?", "read", NULL),
    ("Antoine", "Petit", "antoine.petit@example.com", "192.168.1.104", "Demande d'information", "Bonjour, pourriez-vous me donner plus d'informations sur vos créneaux disponibles pour une commande ? Je suis intéressé par une illustration personnalisée.", "unread", NULL),
    ("Laura", "Robert", "laura.robert@example.com", "192.168.1.105", "Proposition de collaboration", "Bonjour, je suis autrice de fantasy et j'aimerais collaborer avec vous sur des illustrations pour mon prochain roman. Êtes-vous ouverte à cela ?", "read", NULL),
    ("Nicolas", "Richard", "nicolas.richard@example.com", "192.168.1.106", "Félicitations pour votre travail", "Bravo pour votre magnifique portfolio ! Vos illustrations sont vraiment inspirantes et pleines de poésie. Continuez ainsi !", "archived", NULL),
    ("Sophie", "Bernard", "sophie.bernard@example.com", "192.168.1.107", "Question sur les techniques", "J'ai une question sur votre technique de portrait numérique. Pourriez-vous m'expliquer comment vous travaillez les textures ?", "unread", 5),
    ("Maxime", "Simon", "maxime.simon@example.com", "192.168.1.108", "Demande de workshop", "Bonjour, j'anime des ateliers d'illustration et j'aimerais vous inviter à donner un workshop. Êtes-vous intéressée ?", "read", NULL),
    ("Sarah", "Michel", "sarah.michel@example.com", "192.168.1.109", "Remerciement", "Un grand merci pour tous vos tutoriels ! Ils m'ont beaucoup aidé dans mon apprentissage de l'illustration numérique.", "archived", NULL)
  `);

	// ============================================
	// COMMENTS
	// ============================================
	await connection.query(`
    INSERT INTO comments (text, status, user_id, article_id) VALUES
    ("Excellent tutoriel ! L'aquarelle m'a toujours intimidée mais vos explications sont très claires. Merci !", "approved", 3, 1),
    ("J'adore voir votre processus créatif ! C'est fascinant de suivre la transformation de l'esquisse à l'œuvre finale.", "approved", 4, 2),
    ("Super article sur les portraits ! Pourriez-vous faire une suite sur les expressions faciales ?", "approved", 5, 3),
    ("Cet article sur les paysages fantasy est une source d'inspiration ! J'ai déjà essayé quelques techniques.", "approved", 6, 4),
    ("Votre tutoriel sur le dragon est génial ! Les étapes sont bien détaillées, je vais m'y mettre.", "approved", 7, 5),
    ("Spam comment with promotional links and unwanted content.", "spam", 4, 3),
    ("Je trouve que certaines palettes de couleurs sont difficiles à maîtriser. Avez-vous des conseils pour les débutants ?", "approved", 4, 6),
    ("Merci pour ces astuces sur les croquis ! J'ai déjà appliqué plusieurs techniques et je vois la différence.", "approved", 5, 7),
    ("This is a test comment that should be rejected.", "rejected", 6, 2),
    ("Votre série de portraits fantasy est magnifique ! Où peut-on voir l'ensemble de la série ?", "approved", 7, 8)
  `);
}
