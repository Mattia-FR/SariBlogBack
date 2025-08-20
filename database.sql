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
