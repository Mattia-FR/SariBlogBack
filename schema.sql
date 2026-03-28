-- ============================================
-- SCHÉMA DE LA BASE DE DONNÉES - Blog CMS
-- ============================================

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    role ENUM('admin', 'editor') DEFAULT 'editor',
    avatar VARCHAR(255),
    bio TEXT,
    bio_short VARCHAR(255),
    refresh_token TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE messages (
    id INT UNSIGNED AUTO_INCREMENT,
    firstname VARCHAR(50),
    lastname VARCHAR(50),
    email VARCHAR(100) NOT NULL,
    username VARCHAR(50),
    ip VARCHAR(45),
    subject VARCHAR(200) NOT NULL,
    text TEXT NOT NULL,
    status ENUM('unread', 'read', 'archived') DEFAULT 'unread',
    user_id INT UNSIGNED,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    CONSTRAINT pk_messages PRIMARY KEY (id),
    CONSTRAINT fk_messages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE articles (
    id INT UNSIGNED AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    user_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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

CREATE TABLE comments (
    id INT UNSIGNED AUTO_INCREMENT,
    text TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'spam') DEFAULT 'pending',
    user_id INT UNSIGNED NULL,
    article_id INT UNSIGNED NOT NULL,
    firstname VARCHAR(255) NULL,
    lastname VARCHAR(255) NULL,
    email VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    CONSTRAINT pk_comments PRIMARY KEY (id),
    CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_comments_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE images (
    id INT UNSIGNED AUTO_INCREMENT,
    title VARCHAR(255),
    description TEXT,
    path VARCHAR(255) NOT NULL,
    alt_descr VARCHAR(255),
    is_in_gallery BOOLEAN DEFAULT FALSE,
    user_id INT UNSIGNED NOT NULL,
    article_id INT UNSIGNED,
    category_id INT UNSIGNED NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_gallery (is_in_gallery),
    INDEX idx_images_category (category_id),
    CONSTRAINT pk_images PRIMARY KEY (id),
    CONSTRAINT fk_images_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_images_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Résolution de la dépendance circulaire articles <-> images
ALTER TABLE articles
    ADD CONSTRAINT fk_articles_featured_image FOREIGN KEY (featured_image_id) REFERENCES images(id) ON DELETE SET NULL;

CREATE TABLE tags (
    id INT UNSIGNED AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_tags PRIMARY KEY (id),
    CONSTRAINT uk_tags_name UNIQUE (name),
    CONSTRAINT uk_tags_slug UNIQUE (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE articles_tags (
    article_id INT UNSIGNED NOT NULL,
    tag_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tag (tag_id),
    CONSTRAINT pk_articles_tags PRIMARY KEY (article_id, tag_id),
    CONSTRAINT fk_articles_tags_article FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    CONSTRAINT fk_articles_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE images_tags (
    image_id INT UNSIGNED NOT NULL,
    tag_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tag (tag_id),
    CONSTRAINT pk_images_tags PRIMARY KEY (image_id, tag_id),
    CONSTRAINT fk_images_tags_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
    CONSTRAINT fk_images_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
    id INT UNSIGNED AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    display_order SMALLINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_categories PRIMARY KEY (id),
    CONSTRAINT uk_categories_name UNIQUE (name),
    CONSTRAINT uk_categories_slug UNIQUE (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE images
    ADD CONSTRAINT fk_images_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
