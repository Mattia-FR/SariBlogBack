-- Configuration du charset
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Table des articles de blog
CREATE TABLE articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  image VARCHAR(255),
  status ENUM("draft","published") DEFAULT "draft",
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des illustrations
CREATE TABLE illustrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  description TEXT,
  image VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255),
  is_in_gallery BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des tags
CREATE TABLE tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de liaison illustrations <-> tags
CREATE TABLE illustration_tags (
  illustration_id INT,
  tag_id INT,
  PRIMARY KEY (illustration_id, tag_id),
  FOREIGN KEY (illustration_id) REFERENCES illustrations(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de liaison articles <-> tags
CREATE TABLE article_tags (
  article_id INT,
  tag_id INT,
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des messages de contact
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  subject VARCHAR(150),
  message TEXT NOT NULL,
  sender_ip VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table pour la page "à propos"
CREATE TABLE about (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content TEXT NOT NULL,
  image VARCHAR(255),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =================================================================
-- TAGS (10 tags)
-- =================================================================
INSERT INTO tags (name, slug) VALUES
("Aquarelle", "aquarelle"),
("Portrait", "portrait"),
("Abstrait", "abstrait"),
("Croquis", "croquis"),
("Numérique", "numerique"),
("Encre", "encre"),
("Animaux", "animaux"),
("Paysage", "paysage"),
("Fantasy", "fantasy"),
("Minimaliste", "minimaliste");

-- =================================================================
-- ARTICLES (32 articles variés)
-- =================================================================
INSERT INTO articles (title, slug, excerpt, content, image, status) VALUES
("Premiers croquis de 2025", "premiers-croquis-2025", "Un aperçu des premiers croquis de l'année.", "L'année 2025 commence avec une série de croquis spontanés réalisés au petit matin. Ces esquisses rapides me permettent d'explorer de nouvelles poses et expressions. J'aime particulièrement travailler avec l'encre de Chine pour ses contrastes nets et sa fluidité. Chaque trait compte, chaque ligne raconte une histoire. Ces premiers croquis de l'année posent les bases de mes projets à venir.", "article1.jpg", "published"),
("Travail en cours : aquarelle florale", "aquarelle-florale", "Présentation d'une aquarelle en cours.", "Cette aquarelle florale est un défi technique que je me suis lancé. Travailler la transparence des pétales tout en gardant la vivacité des couleurs demande une maîtrise particulière de l'eau et de la peinture. J'expérimente avec différents papiers aquarelle pour trouver la texture parfaite. Le processus est lent, contemplatif, chaque couche de couleur apporte sa nuance. Un travail en cours qui me passionne.", "article2.jpg", "draft"),
("Exposition virtuelle annoncée", "exposition-virtuelle", "Annonce de l'exposition virtuelle.", "Je suis ravie de vous annoncer ma première exposition virtuelle ! \"Entre rêve et réalité\" présentera une sélection de mes œuvres les plus récentes, mêlant techniques traditionnelles et explorations numériques. L'exposition sera accessible en ligne du 15 février au 15 mars 2025. Une occasion unique de découvrir mes univers fantasy et mes recherches minimalistes dans un espace immersif.", "article3.jpg", "published"),
("Exploration numérique", "exploration-numerique", "Mes premiers essais sur tablette.", "Découvrir l'art numérique a été une révélation. Ma tablette graphique m'ouvre des possibilités infinies : des couleurs impossibles à obtenir avec des pigments traditionnels, des textures inédites, des effets de lumière magiques. J'explore particulièrement l'art abstrait et minimaliste dans ce nouveau médium. Chaque session de travail numérique est une aventure, une découverte de nouveaux outils et techniques.", "article4.jpg", "published"),
("Un mois de croquis", "un-mois-de-croquis", "Retour sur mes croquis quotidiens.", "Le défi du croquis quotidien transforme ma pratique artistique. Chaque jour, 30 minutes consacrées à l'observation et au dessin. Des portraits de passants dans le métro, des animaux au parc, des objets du quotidien. Cette discipline m'apprend la rapidité, l'essentiel, la justesse du trait. Un mois de croquis quotidiens, c'est un mois de progression visible, d'amélioration constante. Une habitude que je compte bien garder.", "article5.jpg", "published"),
("Animaux en aquarelle", "animaux-en-aquarelle", "Quelques essais sur le thème animalier.", "Peindre les animaux à l'aquarelle, c'est capturer leur âme et leur mouvement. Chaque espèce a sa propre texture de poils, ses reflets particuliers, son regard unique. J'aime particulièrement travailler sur les portraits d'animaux, où chaque détail compte : la brillance des yeux, la douceur du pelage, l'expression du museau. L'aquarelle permet de rendre cette délicatesse avec une transparence et une légèreté incomparables.", "article6.jpg", "published"),
("Série minimaliste", "serie-minimaliste", "Une recherche autour des formes simples.", "Cette série minimaliste naît d'un besoin de simplicité et d'épurement. Comment dire le maximum avec le minimum ? Comment une ligne, une forme, une couleur peuvent-elles raconter une émotion ? J'explore les formes géométriques, les contrastes nets, les espaces vides qui parlent autant que les pleins. Un travail de recherche sur l'essence même de l'art, sur ce qui fait qu'une œuvre touche sans artifice.", "article7.jpg", "draft"),
("Travail à l'encre", "travail-a-encre", "Études d'ombres et de lumière.", "L'encre de Chine, c'est l'art du contraste et de la suggestion. Avec seulement du noir et du blanc, je dois créer toute la palette des gris, toute la profondeur des ombres. Chaque trait d'encre est définitif, chaque geste compte. J'étudie particulièrement les jeux d'ombre et de lumière, comment une simple ligne peut suggérer un volume, comment l'absence de trait peut créer la lumière. Un médium exigeant mais si expressif.", "article8.jpg", "published"),
("Paysages abstraits", "paysages-abstraits", "Quand les montagnes deviennent lignes.", "Transformer un paysage en abstraction, c'est en extraire l'essence émotionnelle. Ces montagnes ne sont plus des montagnes, mais des lignes de force, des rythmes, des contrastes. L'abstraction me permet de jouer avec les couleurs, les formes, les textures pour créer une impression plutôt qu'une représentation fidèle. Chaque paysage abstrait raconte une émotion, un moment, une atmosphère plutôt qu'un lieu précis.", "article9.jpg", "published"),
("Fantaisie et couleurs", "fantaisie-couleurs", "Exploration des univers imaginaires.", "L'univers fantasy me permet de libérer complètement ma créativité. Dragons, elfes, mondes magiques : tout est possible, tout est permis. J'explore particulièrement les couleurs vives, les contrastes saisissants, les atmosphères oniriques. Chaque illustration fantasy est un voyage dans un monde imaginaire, une invitation au rêve et à l'évasion. Un domaine où la technique numérique révèle tout son potentiel créatif.", "article10.jpg", "published"),
("Atelier improvisé", "atelier-improvise", "Un dimanche d'expérimentations.", "Parfois, le meilleur atelier est celui qu'on improvise. Ce dimanche pluvieux, j'ai sorti tous mes matériaux et laissé libre cours à l'expérimentation. Aquarelle sur papier mouillé, encre sur carton, pastels sur toile : mélanger les techniques, tester de nouveaux supports, oser l'inattendu. Ces moments d'improvisation sont souvent les plus riches en découvertes. L'art naît parfois de l'accident, de l'expérimentation, de l'audace.", "article11.jpg", "published"),
("Retour d'expo", "retour-expo", "Quelques réflexions après une visite.", "Visiter une exposition, c'est se nourrir, s'inspirer, se questionner. Cette dernière visite m'a particulièrement marquée par la diversité des approches artistiques. Chaque artiste raconte son histoire, explore sa technique, partage sa vision. Ces moments d'immersion dans l'art des autres enrichissent ma propre pratique. L'art est un dialogue constant, une conversation entre créateurs à travers le temps et l'espace.", "article12.jpg", "draft"),
("Techniques d'aquarelle humide sur humide", "techniques-aquarelle-humide", "Exploration des techniques d'aquarelle avec papier mouillé.", "La technique humide sur humide transforme complètement l'approche de l'aquarelle. En mouillant le papier avant d'appliquer la peinture, les couleurs se mélangent naturellement, créant des effets de transparence et de fluidité impossibles à obtenir autrement. Cette méthode demande une maîtrise du timing et de la quantité d'eau, mais les résultats sont toujours surprenants et poétiques.", "article13.jpg", "published"),
("Portrait au fusain : capturer l'essence", "portrait-fusain-essence", "Apprendre à dessiner des portraits expressifs au fusain.", "Le fusain offre une liberté d'expression unique pour les portraits. Sa texture granuleuse et sa capacité à créer des dégradés subtils permettent de capturer non seulement les traits, mais aussi l'émotion et la personnalité du modèle. J'explore différentes techniques : estompage, hachures, contrastes nets pour créer des portraits qui vivent et respirent.", "article14.jpg", "published"),
("Carnet de voyage artistique", "carnet-voyage-artistique", "Documenter ses voyages à travers le dessin et l'aquarelle.", "Un carnet de voyage artistique, c'est bien plus qu'un simple journal. C'est capturer l'instant, l'atmosphère, les couleurs d'un lieu. Chaque page raconte une histoire, chaque croquis fixe un souvenir. J'aime mélanger techniques rapides et aquarelles détaillées, textes et images, pour créer un récit visuel de mes explorations.", "article15.jpg", "published"),
("Art abstrait : libérer l'émotion", "art-abstrait-liberer-emotion", "Comment l'abstraction permet d'exprimer des émotions pures.", "L'art abstrait me fascine par sa capacité à toucher directement l'émotion, sans passer par la représentation. Une ligne peut exprimer la colère, une couleur la mélancolie, une forme la joie. J'explore comment libérer l'émotion pure à travers des compositions abstraites, en laissant l'intuition guider mes gestes et mes choix chromatiques.", "article16.jpg", "published"),
("Techniques mixtes : fusionner les médiums", "techniques-mixtes-fusionner", "Combiner aquarelle, encre et pastels dans une même œuvre.", "Les techniques mixtes ouvrent des possibilités créatives infinies. Combiner aquarelle et encre, pastels et crayons, numérique et traditionnel : chaque médium apporte sa texture, sa transparence, son expressivité. J'expérimente ces fusions pour créer des œuvres riches et complexes, où chaque technique révèle son potentiel unique.", "article17.jpg", "published"),
("Dessin d'observation : l'art de voir", "dessin-observation-art-voir", "Développer son regard à travers l'observation et le croquis.", "Dessiner d'observation, c'est apprendre à voir vraiment. Au-delà de la technique, c'est développer une sensibilité au monde qui nous entoure. Chaque session de dessin d'observation affine mon regard, m'apprend à percevoir les proportions, les ombres, les détails qui font la singularité d'un objet ou d'un visage.", "article18.jpg", "published"),
("Couleurs complémentaires en peinture", "couleurs-complementaires-peinture", "Utiliser les contrastes chromatiques pour dynamiser ses œuvres.", "Les couleurs complémentaires créent des contrastes saisissants qui dynamisent une composition. Rouge et vert, bleu et orange, jaune et violet : ces associations opposées sur le cercle chromatique génèrent une tension visuelle fascinante. J'explore comment utiliser ces contrastes pour créer de l'énergie et de la profondeur dans mes peintures.", "article19.jpg", "published"),
("Art numérique : nouveaux horizons", "art-numerique-nouveaux-horizons", "Découvrir les possibilités créatives du digital art.", "L'art numérique révolutionne ma pratique artistique. Tablette graphique, logiciels de peinture, effets impossibles à obtenir avec des médiums traditionnels : chaque outil numérique ouvre de nouveaux horizons créatifs. J'explore particulièrement les textures numériques, les effets de lumière, les compositions impossibles qui défient les lois de la physique.", "article20.jpg", "published"),
("Croquis urbains : capturer la ville", "croquis-urbains-capturer-ville", "Dessiner la vie urbaine et l'architecture dans la rue.", "Les croquis urbains capturent l'énergie et le mouvement de la ville. Architecture, passants, atmosphères : chaque coin de rue raconte une histoire. J'aime m'installer dans un café, sur un banc, et dessiner la vie qui défile. Ces croquis spontanés sont des instantanés de l'urbanité, des témoignages de la diversité humaine.", "article21.jpg", "published"),
("Peinture à l'huile : redécouvrir la tradition", "peinture-huile-redecouvrir-tradition", "Explorer les techniques classiques de la peinture à l'huile.", "La peinture à l'huile, médium des maîtres, offre une richesse et une profondeur incomparables. Ses temps de séchage lents permettent de travailler les détails, de superposer les couches, de créer des effets de transparence subtils. Je redécouvre cette technique traditionnelle avec un regard contemporain, explorant comment l'adapter à ma sensibilité artistique actuelle.", "article22.jpg", "published"),
("Illustration jeunesse : raconter en images", "illustration-jeunesse-raconter-images", "Créer des illustrations qui parlent aux enfants et aux adultes.", "L'illustration jeunesse demande une approche particulière : simplicité et richesse, clarté et poésie. Chaque image doit raconter une histoire, éveiller l'imagination, toucher l'émotion. J'explore comment créer des illustrations qui parlent autant aux enfants qu'aux adultes, avec des couleurs vives, des compositions claires et une touche de magie.", "article23.jpg", "published"),
("Art thérapeutique : guérir par la création", "art-therapeutique-guerir-creation", "Comment l'art peut devenir un outil de bien-être et de guérison.", "L'art thérapeutique révèle le pouvoir guérisseur de la création. Peindre, dessiner, modeler : ces gestes simples peuvent apaiser l'âme, libérer les émotions, retrouver un équilibre intérieur. J'explore comment l'art peut devenir un outil de bien-être, une méditation active, un dialogue avec soi-même à travers la matière et la couleur.", "article24.jpg", "published"),
("Nature morte : poésie des objets quotidiens", "nature-morte-poesie-objets", "Transformer les objets du quotidien en compositions poétiques.", "La nature morte élève les objets quotidiens au rang d'œuvre d'art. Une pomme, un livre, un vase : chaque objet raconte une histoire, chaque composition crée une atmosphère. J'aime explorer comment la lumière transforme ces objets simples, comment les ombres et les reflets créent une poésie visuelle qui transcende la banalité du quotidien.", "article25.jpg", "published"),
("Art conceptuel : l'idée au centre", "art-conceptuel-idee-centre", "Explorer l'art où l'idée prime sur la technique.", "L'art conceptuel place l'idée au centre de la création. Au-delà de la technique et de l'esthétique, c'est le concept, le message, la réflexion qui importent. J'explore comment développer une pratique artistique où l'idée guide la forme, où chaque œuvre pose une question, provoque une réflexion, engage un dialogue avec le spectateur.", "article26.jpg", "published"),
("Techniques de gravure : l'art de l'empreinte", "techniques-gravure-art-empreinte", "Découvrir la gravure et ses multiples possibilités expressives.", "La gravure offre une approche unique de l'image : l'empreinte, la répétition, la texture. Linogravure, gravure sur bois, eau-forte : chaque technique apporte sa singularité. J'explore ces méthodes traditionnelles avec un regard contemporain, créant des œuvres où la texture et l'empreinte deviennent des éléments expressifs à part entière.", "article27.jpg", "published"),
("Art collaboratif : créer ensemble", "art-collaboratif-creer-ensemble", "L'art comme moyen de rencontre et de partage créatif.", "L'art collaboratif transforme la création en aventure collective. Travailler avec d'autres artistes, partager des techniques, fusionner des univers : ces collaborations enrichissent ma pratique et ouvrent de nouvelles perspectives. Chaque projet collaboratif est une découverte, un échange, une création qui dépasse la somme des individualités.", "article28.jpg", "published"),
("Sculpture en papier : l'art du pli", "sculpture-papier-art-pli", "Explorer la sculpture en papier et l'origami artistique.", "La sculpture en papier révèle la poésie du pli et de la forme. Origami, kirigami, papier mâché : chaque technique transforme une feuille plane en volume expressif. J'explore comment le papier peut devenir sculpture, comment les plis créent des ombres et des reliefs, comment cette matière fragile peut exprimer force et délicatesse.", "article29.jpg", "published"),
("Art environnemental : créer avec la nature", "art-environnemental-creer-nature", "Intégrer les éléments naturels dans la création artistique.", "L'art environnemental dialogue avec la nature, l'intègre, la transforme. Land art, installations éphémères, œuvres qui se dégradent naturellement : ces pratiques questionnent notre rapport à l'environnement. J'explore comment créer avec les éléments naturels, comment l'art peut devenir un acte écologique, une célébration de la beauté du monde.", "article30.jpg", "published"),
("Art performance : le corps comme médium", "art-performance-corps-medium", "Explorer l'art performance et l'expression corporelle.", "L'art performance utilise le corps comme médium d'expression. Mouvement, geste, présence : chaque performance est unique, éphémère, vivante. J'explore comment le corps peut devenir pinceau, comment le mouvement peut créer des traces, comment la présence peut transformer un espace en œuvre d'art éphémère et puissante.", "article31.jpg", "published"),
("Art textile : tisser des histoires", "art-textile-tisser-histoires", "Découvrir l'art textile et ses multiples techniques créatives.", "L'art textile mêle tradition et innovation, technique et créativité. Broderie, tissage, teinture naturelle : chaque technique raconte une histoire, chaque fibre porte une émotion. J'explore comment le textile peut devenir support artistique, comment les fils peuvent dessiner, comment les textures peuvent exprimer des sentiments et des idées.", "article32.jpg", "published");

-- =================================================================
-- ILLUSTRATIONS (32 illustrations)
-- =================================================================
INSERT INTO illustrations (title, description, image, alt_text, is_in_gallery) VALUES
("Portrait de Yuki", "Portrait numérique d'une jeune femme.", "illu1.jpg", "Portrait féminin", TRUE),
("Montagne abstraite", "Acrylique sur toile", "illu2.jpg", "Peinture abstraite montagne", TRUE),
("Doodle rapide", "Petit dessin sans prétention", "illu3.jpg", "Croquis doodle", FALSE),
("Chouette en aquarelle", "Illustration animalière", "illu4.jpg", "Chouette en aquarelle", TRUE),
("Forêt onirique", "Paysage imaginaire en numérique", "illu5.jpg", "Forêt fantasy", TRUE),
("Minimal lines", "Recherche graphique minimaliste", "illu6.jpg", "Formes simples", TRUE),
("Portrait à l'encre", "Visage en noir et blanc", "illu7.jpg", "Portrait encre", TRUE),
("Chat joueur", "Dessin rapide d'un chat", "illu8.jpg", "Chat croquis", FALSE),
("Paysage marin", "Aquarelle bleu et vert", "illu9.jpg", "Mer abstraite", TRUE),
("Dragon rouge", "Illustration fantasy numérique", "illu10.jpg", "Dragon fantasy", TRUE),
("Carnet de croquis", "Page de carnet griffonnée", "illu11.jpg", "Croquis carnet", FALSE),
("Cascade lumineuse", "Peinture numérique colorée", "illu12.jpg", "Cascade fantasy", TRUE),
("Aquarelle humide sur humide", "Technique d'aquarelle avec papier mouillé", "illu13.jpg", "Aquarelle technique humide", TRUE),
("Portrait au fusain expressif", "Visage dessiné au fusain avec émotion", "illu14.jpg", "Portrait fusain émotion", TRUE),
("Page de carnet de voyage", "Croquis et aquarelle de voyage", "illu15.jpg", "Carnet voyage artistique", FALSE),
("Composition abstraite émotionnelle", "Formes et couleurs exprimant l'émotion", "illu16.jpg", "Art abstrait émotion", TRUE),
("Techniques mixtes expérimentales", "Combinaison aquarelle, encre et pastels", "illu17.jpg", "Techniques mixtes", TRUE),
("Croquis d'observation détaillé", "Dessin d'observation précis et expressif", "illu18.jpg", "Dessin observation", FALSE),
("Contraste de couleurs complémentaires", "Peinture utilisant les couleurs opposées", "illu19.jpg", "Couleurs complémentaires", TRUE),
("Création numérique innovante", "Art digital avec effets spéciaux", "illu20.jpg", "Art numérique créatif", TRUE),
("Scène urbaine croquée", "Vie de rue capturée en croquis", "illu21.jpg", "Croquis urbain", FALSE),
("Peinture à l'huile traditionnelle", "Œuvre classique en peinture à l'huile", "illu22.jpg", "Peinture huile classique", TRUE),
("Illustration jeunesse colorée", "Image pour enfants pleine de magie", "illu23.jpg", "Illustration jeunesse", TRUE),
("Art thérapeutique apaisant", "Création artistique pour le bien-être", "illu24.jpg", "Art thérapeutique", FALSE),
("Nature morte poétique", "Composition d'objets du quotidien", "illu25.jpg", "Nature morte poétique", TRUE),
("Installation conceptuelle", "Œuvre d'art conceptuel minimaliste", "illu26.jpg", "Art conceptuel", TRUE),
("Gravure sur linoléum", "Empreinte de gravure traditionnelle", "illu27.jpg", "Gravure linoléum", TRUE),
("Collaboration artistique", "Œuvre créée à plusieurs mains", "illu28.jpg", "Art collaboratif", TRUE),
("Sculpture en papier plié", "Origami artistique en volume", "illu29.jpg", "Sculpture papier", TRUE),
("Installation naturelle éphémère", "Land art intégré à l'environnement", "illu30.jpg", "Art environnemental", TRUE),
("Performance artistique en mouvement", "Corps en action créative", "illu31.jpg", "Art performance", FALSE),
("Tissage artistique coloré", "Création textile expressive", "illu32.jpg", "Art textile", TRUE);

-- =================================================================
-- LIAISONS ARTICLES ↔ TAGS (articles 1-32)
-- =================================================================
INSERT INTO article_tags (article_id, tag_id) VALUES
(1, 4), (1, 6), (1, 2), -- croquis + encre + portrait
(2, 1), (2, 8), -- aquarelle + paysage
(3, 5), (3, 9), (3, 10), -- numérique + fantasy + minimaliste
(4, 5), (4, 3), (4, 10), -- numérique + abstrait + minimaliste
(5, 4), (5, 2), (5, 7), -- croquis + portrait + animaux
(6, 1), (6, 7), (6, 2), -- aquarelle + animaux + portrait
(7, 10), (7, 3), (7, 5), -- minimaliste + abstrait + numérique
(8, 6), (8, 2), (8, 4), -- encre + portrait + croquis
(9, 3), (9, 8), (9, 1), (9, 5), -- abstrait + paysage + aquarelle + numérique
(10, 9), (10, 5), (10, 3), (10, 1), -- fantasy + numérique + abstrait + aquarelle
(11, 1), (11, 6), (11, 4), (11, 5), (11, 3), -- aquarelle + encre + croquis + numérique + abstrait
(12, 2), (12, 3), (12, 5), -- portrait + abstrait + numérique
(13, 1), (13, 8), -- aquarelle + paysage
(14, 2), (14, 4), (14, 6), -- portrait + croquis + encre
(15, 4), (15, 1), (15, 8), -- croquis + aquarelle + paysage
(16, 3), (16, 10), -- abstrait + minimaliste
(17, 1), (17, 6), (17, 3), -- aquarelle + encre + abstrait
(18, 4), (18, 2), -- croquis + portrait
(19, 1), (19, 3), (19, 5), -- aquarelle + abstrait + numérique
(20, 5), (20, 3), (20, 10), -- numérique + abstrait + minimaliste
(21, 4), (21, 8), -- croquis + paysage
(22, 1), (22, 2), (22, 8), -- aquarelle + portrait + paysage
(23, 2), (23, 9), (23, 5), -- portrait + fantasy + numérique
(24, 3), (24, 10), (24, 1), -- abstrait + minimaliste + aquarelle
(25, 3), (25, 10), (25, 2), -- abstrait + minimaliste + portrait
(26, 3), (26, 10), (26, 5), -- abstrait + minimaliste + numérique
(27, 6), (27, 3), (27, 10), -- encre + abstrait + minimaliste
(28, 5), (28, 3), (28, 1), -- numérique + abstrait + aquarelle
(29, 10), (29, 3), (29, 5), -- minimaliste + abstrait + numérique
(30, 8), (30, 3), (30, 1), -- paysage + abstrait + aquarelle
(31, 2), (31, 3), (31, 5), -- portrait + abstrait + numérique
(32, 1), (32, 3), (32, 10); -- aquarelle + abstrait + minimaliste

-- =================================================================
-- LIAISONS ILLUSTRATIONS ↔ TAGS (illustrations 1-32)
-- =================================================================
INSERT INTO illustration_tags (illustration_id, tag_id) VALUES
(1, 2), (1, 5), (1, 10), -- portrait + numérique + minimaliste
(2, 3), (2, 8), (2, 1), -- abstrait + paysage + aquarelle
(3, 4), (3, 6), -- croquis + encre
(4, 1), (4, 7), (4, 2), -- aquarelle + animaux + portrait
(5, 5), (5, 9), (5, 8), (5, 3), -- numérique + fantasy + paysage + abstrait
(6, 10), (6, 3), (6, 5), -- minimaliste + abstrait + numérique
(7, 6), (7, 2), (7, 4), (7, 10), -- encre + portrait + croquis + minimaliste
(8, 4), (8, 7), (8, 6), -- croquis + animaux + encre
(9, 1), (9, 8), (9, 3), (9, 5), -- aquarelle + paysage + abstrait + numérique
(10, 5), (10, 9), (10, 3), (10, 1), -- numérique + fantasy + abstrait + aquarelle
(11, 4), (11, 6), (11, 2), -- croquis + encre + portrait
(12, 5), (12, 9), (12, 8), (12, 3), (12, 1), -- numérique + fantasy + paysage + abstrait + aquarelle
(13, 1), (13, 8), -- aquarelle + paysage
(14, 2), (14, 6), (14, 4), -- portrait + encre + croquis
(15, 4), (15, 1), (15, 8), -- croquis + aquarelle + paysage
(16, 3), (16, 10), (16, 5), -- abstrait + minimaliste + numérique
(17, 1), (17, 6), (17, 3), -- aquarelle + encre + abstrait
(18, 4), (18, 2), (18, 6), -- croquis + portrait + encre
(19, 1), (19, 3), (19, 5), -- aquarelle + abstrait + numérique
(20, 5), (20, 3), (20, 10), -- numérique + abstrait + minimaliste
(21, 4), (21, 8), (21, 2), -- croquis + paysage + portrait
(22, 1), (22, 2), (22, 8), -- aquarelle + portrait + paysage
(23, 2), (23, 9), (23, 5), -- portrait + fantasy + numérique
(24, 3), (24, 10), (24, 1), -- abstrait + minimaliste + aquarelle
(25, 3), (25, 10), (25, 2), -- abstrait + minimaliste + portrait
(26, 3), (26, 10), (26, 5), -- abstrait + minimaliste + numérique
(27, 6), (27, 3), (27, 10), -- encre + abstrait + minimaliste
(28, 5), (28, 3), (28, 1), -- numérique + abstrait + aquarelle
(29, 10), (29, 3), (29, 5), -- minimaliste + abstrait + numérique
(30, 8), (30, 3), (30, 1), -- paysage + abstrait + aquarelle
(31, 2), (31, 3), (31, 5), -- portrait + abstrait + numérique
(32, 1), (32, 3), (32, 10); -- aquarelle + abstrait + minimaliste

-- =================================================================
-- MESSAGES DE CONTACT (10 messages variés)
-- =================================================================
INSERT INTO messages (name, email, subject, message, sender_ip, is_read) VALUES
("Alice Dupont", "alice@example.com", "Félicitations", "J'adore vos illustrations !", "192.168.1.10", TRUE),
("Jean Martin", "jean@example.com", "Commande portrait", "Puis-je commander un portrait personnalisé ?", "192.168.1.11", FALSE),
("Lucie Bernard", "lucie@example.com", "Collaboration", "Souhaitez-vous collaborer sur un projet ?", "192.168.1.12", FALSE),
("Paul Henry", "paul@example.com", "Technique utilisée ?", "Avec quels pinceaux réalisez-vous vos aquarelles ?", "192.168.1.13", TRUE),
("Clara Vidal", "clara@example.com", "Exposition", "Où puis-je voir vos œuvres en vrai ?", "192.168.1.14", FALSE),
("Olivier Robert", "olivier@example.com", "Impression", "Est-ce possible d'acheter des tirages ?", "192.168.1.15", TRUE),
("Mélanie Laurent", "melanie@example.com", "Cours de dessin", "Donnez-vous des cours particuliers ?", "192.168.1.16", FALSE),
("David Moreau", "david@example.com", "Inspiration", "Vos croquis m'inspirent beaucoup, merci !", "192.168.1.17", TRUE),
("Sophie Petit", "sophie@example.com", "Commande aquarelle", "J'aimerais commander une aquarelle florale.", "192.168.1.18", FALSE),
("Karim B.", "karim@example.com", "Numérique", "Superbes explorations digitales !", "192.168.1.19", TRUE);

-- =================================================================
-- ABOUT (1 seule entrée)
-- =================================================================
INSERT INTO about (content, image) VALUES
("Illustratrice passionnée par le mélange des techniques traditionnelles et numériques, je navigue entre aquarelle, encre de Chine, croquis spontanés et explorations digitales. Mon univers artistique se nourrit de la nature, de la fantasy et de l'abstraction, créant des œuvres qui oscillent entre réalisme et onirisme. Formée aux arts plastiques, j'ai développé au fil des années une approche hybride qui mêle la spontanéité du croquis traditionnel à la précision de l'art numérique. Chaque technique apporte sa propre richesse : l'aquarelle pour sa transparence et sa fluidité, l'encre pour ses contrastes saisissants, le numérique pour ses possibilités infinies. Mes inspirations puisent dans la beauté des paysages, la complexité des portraits, la magie des univers fantasy et l'épurement des formes minimalistes. J'aime explorer comment une même émotion peut s'exprimer à travers différents médiums, comment une ligne peut raconter une histoire, comment une couleur peut évoquer un souvenir. Mon processus créatif se nourrit d'observations quotidiennes, de croquis spontanés, d'expérimentations techniques. Je crois en l'importance de la pratique régulière, du défi artistique, de la sortie de zone de confort. Chaque œuvre est une exploration, chaque projet une nouvelle aventure. À travers ce blog, je partage mes découvertes, mes techniques, mes réflexions sur l'art et la création. Un espace où tradition et modernité se rencontrent, où chaque technique trouve sa place dans un univers artistique en perpétuelle évolution.", "portrait.jpg");