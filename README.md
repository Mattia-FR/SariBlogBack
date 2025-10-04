# SariBlog Backend

API REST sécurisée développée avec Node.js et Express.js pour le blog artistique SariBlog.

## 🎯 Vue d'ensemble

SariBlog est une plateforme complète pour une illustratrice, combinant un blog d'articles artistiques et une galerie d'illustrations. Ce dépôt contient le **backend** de l'application, fournissant une API REST complète pour la gestion du contenu artistique. Il intègre un système d'authentification robuste, des middlewares de sécurité avancés et une architecture modulaire pour une maintenabilité optimale.

### Fonctionnalités principales

- **API REST complète** : Endpoints pour articles, illustrations, messages, tags
- **Système d'authentification** : JWT avec hashage Argon2 sécurisé
- **Interface d'administration** : API pour la gestion du contenu
- **Upload d'images** : Gestion sécurisée des fichiers
- **Base de données MySQL** : Structure relationnelle avec tags
- **Sécurité avancée** : Rate limiting, CORS, validation des données

## 🏗️ Architecture du projet

Ce projet fait partie d'une architecture **full-stack** :

- **Backend** (ce dépôt) : Node.js + Express.js + MySQL
- **Frontend** : React 19 + TypeScript + Vite (dépôt séparé)
- **Base de données** : MySQL avec relations many-to-many pour les tags

### Installation et démarrage

#### Prérequis
- **Node.js** (version 18+)
- **MySQL** (version 8+)

#### Installation
```bash
# Cloner le dépôt
git clone [URL_DU_REPO_BACKEND]
cd SariBlogBack

# Installer les dépendances
npm install

# Configuration de la base de données
mysql -u root -p
CREATE DATABASE sariblog;
USE sariblog;
mysql -u root -p sariblog < database.sql

# Configuration des variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrer le serveur
npm run dev
```

Le backend sera accessible sur `http://localhost:3000`

> **Note** : Le frontend SariBlog doit être configuré pour pointer vers cette API pour fonctionner correctement.

## 🏗️ Architecture API REST

L'API suit les principes REST avec une structure claire et cohérente :

```
src/
├── app.js                    # Configuration Express principale
├── controller/               # Contrôleurs métier
│   ├── articlesController.js
│   ├── illustrationsController.js
│   ├── aboutController.js
│   ├── contactController.js
│   ├── authController.js
│   ├── uploadController.js
│   ├── adminAboutController.js
│   ├── adminArticlesController.js
│   ├── adminIllustrationsController.js
│   ├── adminMessagesController.js
│   └── adminTagsController.js
├── model/                    # Modèles de données
│   ├── db.js                 # Connexion base de données
│   ├── articlesModel.js
│   ├── illustrationsModel.js
│   ├── aboutModel.js
│   ├── contactModel.js
│   ├── userModel.js
│   ├── adminAboutModel.js
│   ├── adminArticlesModel.js
│   ├── adminIllustrationsModel.js
│   ├── adminMessagesModel.js
│   └── adminTagsModel.js
├── router/                   # Routes API
│   ├── index.js              # Routeur principal
│   ├── articlesRouter.js
│   ├── illustrationsRouter.js
│   ├── aboutRouter.js
│   ├── contactRouter.js
│   ├── authRouter.js
│   ├── uploadRouter.js
│   ├── adminAboutRouter.js
│   ├── adminArticlesRouter.js
│   ├── adminIllustrationsRouter.js
│   ├── adminMessagesRouter.js
│   └── adminTagsRouter.js
├── middleware/               # Middlewares
│   ├── auth.js               # Authentification JWT
│   ├── security.js           # Sécurité (Helmet, CORS, Rate limiting)
│   ├── validation/           # Validation des données avec Zod
│   │   ├── index.js          # Point d'entrée validation
│   │   ├── middleware/       # Middleware de validation
│   │   │   ├── base.js       # Validation de base (pagination, ID, slug)
│   │   │   ├── body.js       # Validation du body
│   │   │   └── params.js     # Validation des paramètres
│   │   └── schemas/          # Schémas Zod
│   │       ├── articles.js   # Schémas articles
│   │       ├── auth.js       # Schémas authentification
│   │       ├── contact.js    # Schémas contact
│   │       ├── illustrations.js # Schémas illustrations
│   │       ├── about.js      # Schémas about
│   │       ├── tags.js       # Schémas tags
│   │       ├── upload.js     # Schémas upload
│   │       └── base.js       # Schémas de base
│   ├── upload.js             # Upload de fichiers
│   ├── errorHandler.js       # Gestion des erreurs
│   └── response.js           # Réponses standardisées
└── public/images/            # Images statiques
```

### Endpoints API

#### 📝 Articles
```
GET    /api/articles          # Liste paginée des articles
GET    /api/articles/:slug    # Article par slug
GET    /api/articles/latest   # Derniers articles
```

#### 🎨 Illustrations
```
GET    /api/illustrations     # Liste des illustrations
GET    /api/illustrations/:id # Illustration par ID
GET    /api/gallery           # Galerie avec filtres
```

#### ℹ️ À propos
```
GET    /api/about             # Contenu page "À propos"
```

#### 📧 Contact
```
POST   /api/contact           # Envoi de message
```

#### 🔐 Authentification
```
POST   /api/auth/login        # Connexion utilisateur
POST   /api/auth/logout       # Déconnexion
GET    /api/auth/verify       # Vérifier le token
```

#### 👨‍💼 Administration
```
# Articles
GET    /api/admin/articles    # Liste articles admin
GET    /api/admin/articles/:id # Lire un article admin
POST   /api/admin/articles    # Créer article
PUT    /api/admin/articles/:id # Modifier article
DELETE /api/admin/articles/:id # Supprimer article
GET    /api/admin/articles/tags # Obtenir tous les tags
GET    /api/admin/articles/:id/tags # Obtenir les tags d'un article

# Illustrations
GET    /api/admin/illustrations
POST   /api/admin/illustrations
PUT    /api/admin/illustrations/:id
DELETE /api/admin/illustrations/:id

# Messages
GET    /api/admin/messages    # Liste des messages
PUT    /api/admin/messages/:id # Marquer comme lu
DELETE /api/admin/messages/:id # Supprimer message

# Tags
GET    /api/admin/tags        # Gestion des tags
POST   /api/admin/tags
PUT    /api/admin/tags/:id
DELETE /api/admin/tags/:id

# Upload
GET    /api/admin/upload      # Lister les images
GET    /api/admin/upload/info/:filename # Informations d'une image
POST   /api/admin/upload/single # Upload d'une image
POST   /api/admin/upload/multiple # Upload de plusieurs images
DELETE /api/admin/upload/:filename # Supprimer une image
```

## 🗄️ Base de données MySQL

### Schéma de base de données

```sql
-- Articles de blog
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

-- Illustrations
CREATE TABLE illustrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  description TEXT,
  image VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255),
  is_in_gallery BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tags
CREATE TABLE tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE
);

-- Relations Many-to-Many
CREATE TABLE article_tags (
  article_id INT,
  tag_id INT,
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE illustration_tags (
  illustration_id INT,
  tag_id INT,
  PRIMARY KEY (illustration_id, tag_id),
  FOREIGN KEY (illustration_id) REFERENCES illustrations(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Messages de contact
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

-- Page "À propos"
CREATE TABLE about (
  id INT PRIMARY KEY AUTO_INCREMENT,
  content TEXT NOT NULL,
  image VARCHAR(255),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Utilisateurs admin
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'editor') DEFAULT 'editor',
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Relations et contraintes

- **Articles ↔ Tags** : Relation many-to-many via `article_tags`
- **Illustrations ↔ Tags** : Relation many-to-many via `illustration_tags`
- **Cascade DELETE** : Suppression en cascade des relations
- **Index uniques** : Sur les slugs et emails pour éviter les doublons
- **Charset UTF8MB4** : Support complet des caractères Unicode

## 🔐 Système d'authentification

### JWT (JSON Web Tokens)

```javascript
// Structure du token JWT
{
  "userId": 1,
  "username": "admin",
  "role": "admin",
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Middleware d'authentification

```javascript
// middleware/auth.js
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};
```

### Hashage des mots de passe

Utilisation d'**Argon2** [[memory:8650344]] pour le hashage sécurisé :

```javascript
// Hashage lors de la création
const hashedPassword = await argon2.hash(password, {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1
});

// Vérification lors de la connexion
const isValid = await argon2.verify(hashedPassword, password);
```

### Rôles et permissions

- **Admin** : Accès complet à toutes les fonctionnalités
- **Editor** : Gestion du contenu (articles, illustrations, messages)

## 🛡️ Middleware de sécurité

### Système de validation Zod

Le backend utilise un système de validation complet avec **Zod** :

#### Structure des schémas
```javascript
// validation/schemas/base.js
const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

const idSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const slugSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers and hyphens"),
});
```

#### Middleware de validation générique
```javascript
// validation/middleware/body.js
const createValidationMiddleware = (schema, errorCode = "VALIDATION_ERROR") => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: errorCode,
            message: "Validation failed",
            details: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
              received: err.received,
            })),
          },
        });
      }
      next(error);
    }
  };
};
```

### Configuration Helmet

```javascript
// middleware/security.js
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], // Seulement depuis ton domaine
      imgSrc: ["'self'", "data:", "https:", "http://localhost:4242"], // Images autorisées
      scriptSrc: ["'self'"], // Scripts seulement depuis ton domaine
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Désactivé pour éviter les conflits
  crossOriginResourcePolicy: false,
});
```

### Rate Limiting

```javascript
// Rate limit global de sécurité
const globalSafetyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // 2000 requêtes par IP - très permissif, juste pour éviter les abus extrêmes
  message: {
    success: false,
    error: {
      code: "GLOBAL_RATE_LIMIT_EXCEEDED",
      message: "Trop de requêtes globales, veuillez réessayer plus tard.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit pour l'authentification
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives de connexion par IP - empêche les attaques par force brute
  message: {
    success: false,
    error: {
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      message: "Trop de tentatives de connexion, veuillez réessayer plus tard.",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

### CORS (Cross-Origin Resource Sharing)

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Validation des données

Utilisation de **Zod** pour la validation avec un système complet :

```javascript
// validation/schemas/articles.js
const articleSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255, "Le titre est trop long"),
  excerpt: z.string().max(500, "L'extrait est trop long").optional(),
  content: z.string().min(1, "Le contenu est requis"),
  image: z.string().max(255, "Le nom de l'image est trop long").optional(),
  status: z.enum(["draft", "published"], {
    errorMap: () => ({ message: "Le statut doit être 'draft' ou 'published'" }),
  }).optional(),
  tagIds: z.array(z.coerce.number().int().positive()).optional().default([]),
});

// validation/schemas/auth.js
const loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

// validation/schemas/contact.js
const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email("Format d'email invalide"),
  subject: z.string().max(150).optional().default(""),
  message: z.string().min(10).max(1000),
});

// validation/schemas/illustrations.js
const illustrationSchema = z.object({
  title: z.string().max(255, "Le titre est trop long").optional(),
  description: z.string().max(1000, "La description est trop longue").optional(),
  image: z.string().max(255, "Le nom de l'image est trop long"),
  alt_text: z.string().max(255, "Le texte alternatif est trop long").optional(),
  is_in_gallery: z.boolean().optional().default(false),
  tagIds: z.array(z.coerce.number().int().positive()).optional().default([]),
});

// validation/schemas/tags.js
const tagSchema = z.object({
  name: z.string().min(1, "Le nom du tag est requis").max(50, "Le nom du tag est trop long"),
});

// validation/schemas/about.js
const aboutSchema = z.object({
  content: z.string().min(1, "Le contenu est requis").max(5000, "Le contenu est trop long"),
  image: z.string().max(255, "Le nom de l'image est trop long").optional(),
});

// Schéma pour modifier seulement le contenu
const aboutContentSchema = z.object({
  content: z.string().min(1, "Le contenu est requis").max(5000, "Le contenu est trop long"),
});

// Schéma pour modifier seulement l'image
const aboutImageSchema = z.object({
  image: z.string().max(255, "Le nom de l'image est trop long"),
});

// validation/schemas/upload.js
const filenameSchema = z.object({
  filename: z.string().min(1, "Le nom de fichier est requis").max(255, "Le nom de fichier est trop long"),
});
```

### Middleware de validation spécialisés

```javascript
// validation/middleware/body.js
const validateArticle = createValidationMiddleware(
  schemas.article,
  "ARTICLE_VALIDATION_ERROR",
);

const validateContact = createValidationMiddleware(
  schemas.contact,
  "CONTACT_VALIDATION_ERROR",
);

const validateLogin = createValidationMiddleware(
  schemas.login,
  "LOGIN_VALIDATION_ERROR",
);

const validateIllustration = createValidationMiddleware(
  schemas.illustration,
  "ILLUSTRATION_VALIDATION_ERROR",
);

const validateTag = createValidationMiddleware(
  schemas.tag,
  "TAG_VALIDATION_ERROR",
);

// Validation pour la page "À propos" (avec logique conditionnelle)
const validateAbout = (req, res, next) => {
  try {
    // Déterminer quel schéma utiliser selon la route
    let schema;
    if (req.path.includes("/content")) {
      schema = schemas.aboutContent;
    } else if (req.path.includes("/image")) {
      schema = schemas.aboutImage;
    } else {
      schema = schemas.about;
    }

    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "ABOUT_VALIDATION_ERROR",
          message: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            received: err.received,
          })),
        },
      });
    }
    next(error);
  }
};

// Validation pour les utilisateurs
const validateUser = createValidationMiddleware(
  schemas.user,
  "USER_VALIDATION_ERROR",
);

// Validation pour la modification d'utilisateurs
const validateUserUpdate = createValidationMiddleware(
  schemas.userUpdate,
  "USER_UPDATE_VALIDATION_ERROR",
);

// Validation pour le changement de mot de passe
const validatePasswordChange = createValidationMiddleware(
  schemas.passwordChange,
  "PASSWORD_CHANGE_VALIDATION_ERROR",
);

// validation/middleware/base.js
const validatePagination = (req, res, next) => {
  try {
    const validatedQuery = schemas.pagination.parse(req.query);
    req.query = validatedQuery;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PAGINATION",
          message: "Invalid pagination parameters",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            received: err.received,
          })),
        },
      });
    }
    next(error);
  }
};

const validateId = (req, res, next) => {
  try {
    const validatedParams = schemas.id.parse(req.params);
    req.params = validatedParams;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ID",
          message: "Invalid ID parameter",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            received: err.received,
          })),
        },
      });
    }
    next(error);
  }
};

// Middleware de validation des slugs
const validateSlug = (req, res, next) => {
  try {
    const validatedParams = schemas.slug.parse(req.params);
    req.params = validatedParams;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_SLUG",
          message: "Invalid slug parameter",
          details: error.errors
            ? error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
                received: err.received,
              }))
            : [],
        },
      });
    }
    next(error);
  }
};

// validation/middleware/params.js
const validateFilename = (req, res, next) => {
  try {
    const validatedParams = schemas.filename.parse(req.params);
    req.params = validatedParams;
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_FILENAME",
          message: "Nom de fichier invalide",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
            received: err.received,
          })),
        },
      });
    }
    next(error);
  }
};
```

### Middleware de réponse standardisée

```javascript
// middleware/response.js
const standardResponse = (req, res, next) => {
  // Méthode pour les réponses de succès
  res.success = (data, message = null) => {
    res.json({
      success: true,
      data,
      ...(message && { message }),
    });
  };

  // Méthode pour les réponses d'erreur
  res.error = (message = "Error", statusCode = 500) => {
    res.status(statusCode).json({
      success: false,
      error: {
        code: "ERROR",
        message,
      },
    });
  };

  next();
};

// Middleware de cache pour les endpoints publics
const cacheHeaders = (req, res, next) => {
  const path = req.path;
  
  if (path === "/api/about") {
    res.set("Cache-Control", "public, max-age=3600"); // 1 heure
  } else if (path.startsWith("/api/articles") || path.startsWith("/api/illustrations")) {
    res.set("Cache-Control", "public, max-age=300"); // 5 minutes
  }
  
  // ETag pour la validation de cache
  res.set("ETag", `"${Date.now()}"`);
  next();
};
```

### Upload sécurisé

```javascript
// middleware/upload.js
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Générer un nom unique : timestamp + nom original
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, extension);
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, "-");
      cb(null, `${sanitizedName}-${uniqueSuffix}${extension}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Types MIME autorisés
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Type de fichier non autorisé. Seuls les formats JPEG, PNG, GIF et WebP sont acceptés."), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // 1 fichier à la fois
  },
});

// Middleware pour upload d'image unique
const uploadSingle = upload.single("image");

// Middleware pour upload de plusieurs images
const uploadMultiple = upload.array("images", 5); // Max 5 images

// Middleware pour gérer les erreurs d'upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: {
          code: "FILE_TOO_LARGE",
          message: "Le fichier est trop volumineux. Taille maximale : 5MB",
        },
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: {
          code: "TOO_MANY_FILES",
          message: "Trop de fichiers. Maximum : 5 fichiers",
        },
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        error: {
          code: "UNEXPECTED_FILE",
          message: "Champ de fichier inattendu",
        },
      });
    }
  }
  
  if (err.message.includes("Type de fichier non autorisé")) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_FILE_TYPE",
        message: err.message,
      },
    });
  }
  
  next(err);
};
```

## 📊 Logging et monitoring

### Winston Logger

```javascript
// Configuration des logs
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

### Morgan (HTTP Logging)

```javascript
// Configuration simple de Morgan pour le logging HTTP
app.use(morgan("combined"));
```

## 🚀 Scripts de développement

```bash
# Développement
npm run dev          # Serveur avec nodemon (auto-reload)
npm run migrate      # Migration de la base de données

# Production
node index.js        # Serveur de production
```

## 🔧 Configuration

### Variables d'environnement

```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=sariblog

# JWT
JWT_SECRET=votre_secret_jwt_super_securise

# CORS
FRONTEND_URL=http://localhost:5173

# Port (optionnel, par défaut 3000)
PORT=3000
```

## 📈 Performance et optimisation

### Compression

```javascript
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

### Cache des images statiques

```javascript
app.use('/images', express.static(path.join(__dirname, '../public/images'), {
  maxAge: '1d', // Cache 1 jour
  etag: true,
  lastModified: true
}));
```

## 🧪 Tests et validation

### Validation des entrées

- **Zod schemas** pour tous les endpoints
- **Sanitization** des données utilisateur
- **Type checking** avec TypeScript (si utilisé)

### Gestion des erreurs

```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // Log de l'erreur
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Erreur de validation
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: err.details,
      },
    });
  }

  // Erreur de base de données
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_ENTRY",
        message: "Resource already exists",
      },
    });
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  });
};
```

## 🚀 Déploiement

### Préparation production

```bash
# Installation des dépendances
npm ci --only=production

# Migration de la base de données
npm run migrate

# Démarrage du serveur
node index.js
```

### Variables d'environnement production

```env
NODE_ENV=production
DB_HOST=votre_host_production
JWT_SECRET=secret_production_super_securise
FRONTEND_URL=https://votre-domaine.com
```

## 📚 Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MySQL2** - Driver base de données
- **JWT** - Authentification
- **Argon2** - Hashage des mots de passe
- **Zod** - Validation des données
- **Multer** - Upload de fichiers
- **Winston** - Logging
- **Helmet** - Sécurité HTTP
- **CORS** - Gestion CORS
- **Morgan** - Logging HTTP
- **Compression** - Compression des réponses

## 🔗 Intégration avec le Frontend

Cette API REST est consommée par le frontend SariBlog (dépôt séparé) :

- **CORS configuré** pour `http://localhost:5173` (développement)
- **Authentification JWT** : Tokens partagés entre frontend et backend
- **Upload d'images** : Endpoint `/api/admin/upload` pour les fichiers
- **Réponses standardisées** : Format JSON cohérent pour toutes les réponses

### Configuration CORS
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

*Backend sécurisé développé avec Node.js, Express.js et MySQL pour une API robuste et performante.*
