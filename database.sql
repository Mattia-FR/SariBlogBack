-- Table des articles de blog
CREATE TABLE articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  image VARCHAR(255),
  status ENUM('draft','published') DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des illustrations
CREATE TABLE illustrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  description TEXT,
  image VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255),
  is_in_gallery BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table des tags
CREATE TABLE tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE
);

-- Table de liaison illustrations <-> tags
CREATE TABLE illustration_tags (
  illustration_id INT,
  tag_id INT,
  PRIMARY KEY (illustration_id, tag_id),
  FOREIGN KEY (illustration_id) REFERENCES illustrations(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Table de liaison articles <-> tags
CREATE TABLE article_tags (
  article_id INT,
  tag_id INT,
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

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
);

-- Table pour la page "à propos"
CREATE TABLE about (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content TEXT NOT NULL,
  image VARCHAR(255),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =================================================================
-- TAGS (10 tags)
-- =================================================================
INSERT INTO tags (name, slug) VALUES
('Aquarelle', 'aquarelle'),
('Portrait', 'portrait'),
('Abstrait', 'abstrait'),
('Croquis', 'croquis'),
('Numérique', 'numerique'),
('Encre', 'encre'),
('Animaux', 'animaux'),
('Paysage', 'paysage'),
('Fantasy', 'fantasy'),
('Minimaliste', 'minimaliste');

-- =================================================================
-- ARTICLES (12 articles variés)
-- =================================================================
INSERT INTO articles (title, slug, excerpt, content, image, status) VALUES
('Premiers croquis de 2025', 'premiers-croquis-2025', 'Un aperçu des premiers croquis de l\'année.', 'Texte long...', 'article1.jpg', 'published'),
('Travail en cours : aquarelle florale', 'aquarelle-florale', 'Présentation d\'une aquarelle en cours.', 'Texte long...', 'article2.jpg', 'draft'),
('Exposition virtuelle annoncée', 'exposition-virtuelle', 'Annonce de l\'exposition virtuelle.', 'Texte long...', 'article3.jpg', 'published'),
('Exploration numérique', 'exploration-numerique', 'Mes premiers essais sur tablette.', 'Texte long...', 'article4.jpg', 'published'),
('Un mois de croquis', 'un-mois-de-croquis', 'Retour sur mes croquis quotidiens.', 'Texte long...', 'article5.jpg', 'published'),
('Animaux en aquarelle', 'animaux-en-aquarelle', 'Quelques essais sur le thème animalier.', 'Texte long...', 'article6.jpg', 'published'),
('Série minimaliste', 'serie-minimaliste', 'Une recherche autour des formes simples.', 'Texte long...', 'article7.jpg', 'draft'),
('Travail à l\'encre', 'travail-a-encre', 'Études d\'ombres et de lumière.', 'Texte long...', 'article8.jpg', 'published'),
('Paysages abstraits', 'paysages-abstraits', 'Quand les montagnes deviennent lignes.', 'Texte long...', 'article9.jpg', 'published'),
('Fantaisie et couleurs', 'fantaisie-couleurs', 'Exploration des univers imaginaires.', 'Texte long...', 'article10.jpg', 'published'),
('Atelier improvisé', 'atelier-improvise', 'Un dimanche d\'expérimentations.', 'Texte long...', 'article11.jpg', 'published'),
('Retour d\'expo', 'retour-expo', 'Quelques réflexions après une visite.', 'Texte long...', 'article12.jpg', 'draft');

-- =================================================================
-- ILLUSTRATIONS (12 illustrations)
-- =================================================================
INSERT INTO illustrations (title, description, image, alt_text, is_in_gallery) VALUES
('Portrait de Yuki', 'Portrait numérique d\'une jeune femme.', 'illu1.jpg', 'Portrait féminin', TRUE),
('Montagne abstraite', 'Acrylique sur toile', 'illu2.jpg', 'Peinture abstraite montagne', TRUE),
('Doodle rapide', 'Petit dessin sans prétention', 'illu3.jpg', 'Croquis doodle', FALSE),
('Chouette en aquarelle', 'Illustration animalière', 'illu4.jpg', 'Chouette en aquarelle', TRUE),
('Forêt onirique', 'Paysage imaginaire en numérique', 'illu5.jpg', 'Forêt fantasy', TRUE),
('Minimal lines', 'Recherche graphique minimaliste', 'illu6.jpg', 'Formes simples', TRUE),
('Portrait à l\'encre', 'Visage en noir et blanc', 'illu7.jpg', 'Portrait encre', TRUE),
('Chat joueur', 'Dessin rapide d\'un chat', 'illu8.jpg', 'Chat croquis', FALSE),
('Paysage marin', 'Aquarelle bleu et vert', 'illu9.jpg', 'Mer abstraite', TRUE),
('Dragon rouge', 'Illustration fantasy numérique', 'illu10.jpg', 'Dragon fantasy', TRUE),
('Carnet de croquis', 'Page de carnet griffonnée', 'illu11.jpg', 'Croquis carnet', FALSE),
('Cascade lumineuse', 'Peinture numérique colorée', 'illu12.jpg', 'Cascade fantasy', TRUE);

-- =================================================================
-- LIAISONS ARTICLES ↔ TAGS
-- =================================================================
INSERT INTO article_tags (article_id, tag_id) VALUES
(1, 4), -- croquis
(2, 1), -- aquarelle
(3, 9), -- fantasy
(4, 5), -- numérique
(5, 4), -- croquis
(6, 1), (6, 7), -- aquarelle + animaux
(7, 10), -- minimaliste
(8, 6), -- encre
(9, 3), (9, 8), -- abstrait + paysage
(10, 9), -- fantasy
(11, 5), -- numérique
(12, 2); -- portrait

-- =================================================================
-- LIAISONS ILLUSTRATIONS ↔ TAGS
-- =================================================================
INSERT INTO illustration_tags (illustration_id, tag_id) VALUES
(1, 2), -- portrait
(2, 3), -- abstrait
(3, 4), -- croquis
(4, 1), (4, 7), -- aquarelle + animaux
(5, 5), (5, 9), -- numérique + fantasy
(6, 10), -- minimaliste
(7, 6), (7, 2), -- encre + portrait
(8, 4), (8, 7), -- croquis + animaux
(9, 1), (9, 8), -- aquarelle + paysage
(10, 5), (10, 9), -- numérique + fantasy
(11, 4), -- croquis
(12, 5), (12, 9); -- numérique + fantasy

-- =================================================================
-- MESSAGES DE CONTACT (10 messages variés)
-- =================================================================
INSERT INTO messages (name, email, subject, message, sender_ip, is_read) VALUES
('Alice Dupont', 'alice@example.com', 'Félicitations', 'J\'adore vos illustrations !', '192.168.1.10', TRUE),
('Jean Martin', 'jean@example.com', 'Commande portrait', 'Puis-je commander un portrait personnalisé ?', '192.168.1.11', FALSE),
('Lucie Bernard', 'lucie@example.com', 'Collaboration', 'Souhaitez-vous collaborer sur un projet ?','192.168.1.12', FALSE),
('Paul Henry', 'paul@example.com', 'Technique utilisée ?', 'Avec quels pinceaux réalisez-vous vos aquarelles ?', '192.168.1.13', TRUE),
('Clara Vidal', 'clara@example.com', 'Exposition', 'Où puis-je voir vos œuvres en vrai ?', '192.168.1.14', FALSE),
('Olivier Robert', 'olivier@example.com', 'Impression', 'Est-ce possible d\'acheter des tirages ?', '192.168.1.15', TRUE),
('Mélanie Laurent', 'melanie@example.com', 'Cours de dessin', 'Donnez-vous des cours particuliers ?', '192.168.1.16', FALSE),
('David Moreau', 'david@example.com', 'Inspiration', 'Vos croquis m\'inspirent beaucoup, merci !', '192.168.1.17', TRUE),
('Sophie Petit', 'sophie@example.com', 'Commande aquarelle', 'J\'aimerais commander une aquarelle florale.', '192.168.1.18', FALSE),
('Karim B.', 'karim@example.com', 'Numérique', 'Superbes explorations digitales !', '192.168.1.19', TRUE);

-- =================================================================
-- ABOUT (1 seule entrée)
-- =================================================================
INSERT INTO about (content, image) VALUES
('Illustratrice passionnée par le mélange des techniques traditionnelles (aquarelle, encre) et numériques. Inspirée par la nature et la fantasy.', 'portrait.jpg');
