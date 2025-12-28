-- ============================================
-- MPD MySQL - Blog CMS
-- ============================================

-- ============================================
-- PARTIE 0 : NETTOYAGE (Suppression des tables existantes)
-- ============================================
-- Désactivation temporaire des vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS = 0;

-- Suppression des tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS articles_tags;
DROP TABLE IF EXISTS images_tags;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS images;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS users;

-- Réactivation des vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- PARTIE 1 : SCHÉMA DE LA BASE DE DONNÉES
-- ============================================

-- Table: Users
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    role ENUM('admin', 'editor', 'subscriber') DEFAULT 'subscriber',
    avatar VARCHAR(255),
    bio TEXT,
    bio_short VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Messages (Formulaire de contact)
CREATE TABLE messages (
    id INT UNSIGNED AUTO_INCREMENT,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    ip VARCHAR(45),
    subject VARCHAR(200) NOT NULL,
    text TEXT NOT NULL,
    status ENUM('unread', 'read', 'archived') DEFAULT 'unread',
    user_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    CONSTRAINT pk_messages PRIMARY KEY (id),
    CONSTRAINT fk_messages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Articles
CREATE TABLE articles (
    id INT UNSIGNED AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    views INT UNSIGNED DEFAULT 0,
    featured_image_id INT UNSIGNED,
    INDEX idx_status (status),
    INDEX idx_published (published_at),
    INDEX idx_views (views),
    CONSTRAINT pk_articles PRIMARY KEY (id),
    CONSTRAINT uk_articles_slug UNIQUE (slug),
    CONSTRAINT fk_articles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Comments
CREATE TABLE comments (
    id INT UNSIGNED AUTO_INCREMENT,
    text TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'spam') DEFAULT 'pending',
    user_id INT UNSIGNED NOT NULL,
    article_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    CONSTRAINT pk_comments PRIMARY KEY (id),
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: Images
CREATE TABLE images (
    id INT UNSIGNED AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    path VARCHAR(255) NOT NULL,
    alt_descr VARCHAR(255),
    is_in_gallery BOOLEAN DEFAULT FALSE,
    user_id INT UNSIGNED NOT NULL,
    article_id INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_gallery (is_in_gallery),
    CONSTRAINT pk_images PRIMARY KEY (id),
    CONSTRAINT fk_images_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_images_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FOREIGN KEY CIRCULAIRE : articles.featured_image_id -> images.id
-- ============================================
-- Cette foreign key est ajoutée APRÈS la création de la table images car :
--   - La table articles est créée en premier (ligne 65)
--   - La table images est créée ensuite (ligne 103)
--   - On ne peut pas créer une foreign key vers une table qui n'existe pas encore
--   - C'est pourquoi on l'ajoute avec ALTER TABLE après la création de images
-- 
-- Note : Cette dépendance circulaire est gérée lors de l'insertion des données
--        (voir commentaires lignes 197-202 et 235-242)
ALTER TABLE articles
    ADD CONSTRAINT fk_articles_featured_image FOREIGN KEY (featured_image_id) REFERENCES images(id) ON DELETE SET NULL;

-- Table: Tags
CREATE TABLE tags (
    id INT UNSIGNED AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_tags PRIMARY KEY (id),
    CONSTRAINT uk_tags_name UNIQUE (name),
    CONSTRAINT uk_tags_slug UNIQUE (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de jonction: Articles_Tags
CREATE TABLE articles_tags (
    article_id INT UNSIGNED NOT NULL,
    tag_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tag (tag_id),
    CONSTRAINT pk_articles_tags PRIMARY KEY (article_id, tag_id),
    CONSTRAINT fk_articles_tags_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    CONSTRAINT fk_articles_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de jonction: Images_Tags
CREATE TABLE images_tags (
    image_id INT UNSIGNED NOT NULL,
    tag_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tag (tag_id),
    CONSTRAINT pk_images_tags PRIMARY KEY (image_id, tag_id),
    CONSTRAINT fk_images_tags_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    CONSTRAINT fk_images_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PARTIE 2 : DONNÉES DE TEST
-- Portfolio/Blog d'Illustratrice
-- ============================================

-- ============================================
-- USERS (1 admin + 1 éditeur + 5 subscribers)
-- ============================================
-- Note : Les mots de passe sont hashés avec Argon2id
-- admin: Reve42
-- sari.elliot: Serenite26
-- marie.dubois: Aventure54
-- pierre.martin: Equilibre10
-- sophie.bernard: Lueur29
-- lucas.roux: Echo77
-- emma.lucas: Infini00
INSERT INTO users (username, email, password, firstname, lastname, role, bio, bio_short) VALUES
("admin", "admin@sariblog.com", "$argon2id$v=19$m=65536,t=3,p=4$wrXitaVJXKscrLnTKHAoRg$CG3SGKZbaExxKFUrCI24b8KXxeK9EEoVxcKJqltP+8E", NULL, NULL, "admin"),
("sari.elliot", "sari.elliot@sariblog.com", "...", "Sari", "Elliot", "editor", "Illustratrice et autrice visuelle spécialisée en aquarelle et illustration numérique. Son travail explore des univers poétiques et fantasy, entre narration visuelle et recherche d’atmosphères. Elle partage régulièrement son processus créatif, ses projets personnels et des tutoriels destinés aux artistes en devenir.", "Illustratrice aquarelle & numérique, univers poétiques et fantasy"
),
("marie.dubois", "marie.dubois@example.com", "$argon2id$v=19$m=65536,t=3,p=4$Pbx61m9Llp/t2INf0ceQUg$5RI+M6uXUAFVGNxGR6mDuhAgXi8iAzBGZcyxRlhdhKk", "Marie", "Dubois", "subscriber"),
("pierre.martin", "pierre.martin@example.com", "$argon2id$v=19$m=65536,t=3,p=4$KccoPcAP1pjFg8/Wf6nrtQ$v+4xm1M7L6KejIsuY7XWgZvDPGQ5liPPzpq3Ddm6h+I", "Pierre", "Martin", "subscriber"),
("sophie.bernard", "sophie.bernard@example.com", "$argon2id$v=19$m=65536,t=3,p=4$DomqBvS4eYFUolGt8ZHWfg$a5Lp1160MtP+l5Q12KFQQkEOLHtVFijwJKpHIG9k+3U", "Sophie", "Bernard", "subscriber"),
("lucas.roux", "lucas.roux@example.com", "$argon2id$v=19$m=65536,t=3,p=4$e1oqHbQdmF4HX25/M2ZyMg$80dg3f1YuntvgLUmAPwVZxa3iiIUJpcCGWa80fPA1U8", "Lucas", "Roux", "subscriber"),
("emma.lucas", "emma.lucas@example.com", "$argon2id$v=19$m=65536,t=3,p=4$1/fsq6Cbcu/E1j2RHisFwg$DRSwab7yQyqRjqr9txyJHd09NCYpvd7xl3AdwridGEc", "Emma", "Lucas", "subscriber");

-- ============================================
-- TAGS (10 tags)
-- ============================================
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
("Croquis", "croquis");

-- ============================================
-- ARTICLES (10 articles)
-- ============================================
-- Note : user_id alterne entre admin (1) et éditeur (2)
-- 
-- ⚠️ GESTION DES DÉPENDANCES CIRCULAIRES :
-- Les articles ont une foreign key vers images (featured_image_id)
-- Les images ont une foreign key vers articles (article_id)
-- Pour résoudre cette dépendance circulaire, on procède en 3 étapes :
--   1. Insérer les articles avec featured_image_id = NULL
--   2. Insérer les images (qui peuvent maintenant référencer les articles existants)
--   3. Mettre à jour les articles pour ajouter les featured_image_id (voir ligne 235)
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
("L'art du portrait numérique : Techniques avancées", "art-portrait-numerique-techniques", "Méthodes avancées pour créer des portraits numériques stylisés et expressifs.", "Le portrait numérique offre des possibilités infinies. Cet article approfondit les techniques avancées : l'utilisation des calques de couleur, les modes de fusion, les pinceaux personnalisés, le traitement des textures, et le stylisation. Nous explorerons aussi comment créer une identité visuelle forte dans vos portraits et développer votre style personnel.", "published", 2, NULL, "2024-07-05 12:00:00", 289);

-- ============================================
-- IMAGES (14 illustrations)
-- ============================================
-- Note : user_id alterne entre admin (1) et éditeur (2)
-- Si une image est liée à un article (article_id), elle a le même user_id que l'article
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
("Aquarelle botanique", "Illustration de plantes et fleurs à l'aquarelle avec précision scientifique", "/uploads/images/botanique-aquarelle.jpg", "Illustration botanique aquarelle", TRUE, 1, NULL);

-- ============================================
-- MISE À JOUR : Résolution de la dépendance circulaire
-- ============================================
-- Maintenant que les images sont insérées, on peut mettre à jour les articles
-- pour ajouter les featured_image_id qui référencent les images.
-- Cette étape complète la résolution de la dépendance circulaire entre articles et images.
UPDATE articles SET featured_image_id = 1 WHERE id = 1;
UPDATE articles SET featured_image_id = 3 WHERE id = 2;
UPDATE articles SET featured_image_id = 6 WHERE id = 3;
UPDATE articles SET featured_image_id = 7 WHERE id = 4;
UPDATE articles SET featured_image_id = 5 WHERE id = 5;
UPDATE articles SET featured_image_id = 11 WHERE id = 7;
UPDATE articles SET featured_image_id = 13 WHERE id = 10;

-- ============================================
-- RELATIONS : Articles_Tags
-- ============================================
INSERT INTO articles_tags (article_id, tag_id) VALUES
(1, 1), (1, 7),          -- Aquarelle débutants -> Aquarelle, Tutoriel
(2, 6),                  -- Processus créatif -> Processus créatif
(3, 3), (3, 7),          -- Portrait émotion -> Portrait, Tutoriel
(4, 2), (4, 5), (4, 7),  -- Paysages fantasy -> Illustration numérique, Fantasy, Tutoriel
(5, 5), (5, 7),          -- Dragon -> Fantasy, Tutoriel
(6, 5), (6, 6),          -- Palette fantasy -> Fantasy, Processus créatif
(7, 10),                 -- Astuces croquis -> Croquis
(8, 5), (8, 8),          -- Série portraits -> Fantasy, Projet personnel
(9, 1), (9, 7),          -- Botanique aquarelle -> Aquarelle, Tutoriel
(10, 2), (10, 3), (10, 7);  -- Portrait numérique -> Illustration numérique, Portrait, Tutoriel

-- ============================================
-- RELATIONS : Images_Tags
-- ============================================
INSERT INTO images_tags (image_id, tag_id) VALUES
(1, 1), (1, 3),          -- Portrait féminin aquarelle -> Aquarelle, Portrait
(3, 2), (3, 4), (3, 5),  -- Paysage fantastique numérique -> Illustration numérique, Paysage, Fantasy
(5, 2), (5, 5),          -- Dragon volant -> Illustration numérique, Fantasy
(7, 3), (7, 10),         -- Portrait au crayon -> Portrait, Croquis
(8, 2), (8, 4), (8, 5),  -- Forêt enchantée -> Illustration numérique, Paysage, Fantasy
(9, 2), (9, 5),          -- Personnage fantasy -> Illustration numérique, Fantasy
(10, 1), (10, 4),        -- Paysage aquarelle -> Aquarelle, Paysage
(11, 5), (11, 10),       -- Esquisse de créature -> Fantasy, Croquis
(13, 2), (13, 3),        -- Portrait numérique -> Illustration numérique, Portrait
(14, 1);                 -- Aquarelle botanique -> Aquarelle

-- ============================================
-- MESSAGES (10 messages de contact)
-- ============================================
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
("Sarah", "Michel", "sarah.michel@example.com", "192.168.1.109", "Remerciement", "Un grand merci pour tous vos tutoriels ! Ils m'ont beaucoup aidé dans mon apprentissage de l'illustration numérique.", "archived", NULL);

-- ============================================
-- COMMENTS (10 commentaires)
-- ============================================
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
("Votre série de portraits fantasy est magnifique ! Où peut-on voir l'ensemble de la série ?", "approved", 7, 8);
