# Sariblog Backend API

> API REST d'un CMS blog/portfolio développé pour ma sœur illustratrice.
> Premier projet fullstack complet réalisé en solo sur 3 mois.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1-black.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [API Endpoints](#-api-endpoints) (auth, publics, admin)
- [Base de données](#-base-de-données)
- [Tests](#-tests)
- [Sécurité](#-sécurité)
- [Scripts disponibles](#-scripts-disponibles)

## 🎯 À propos

API REST d'un CMS blog/portfolio développé pour ma sœur illustratrice. Premier projet fullstack complet réalisé en solo sur 3 mois, servant également de support pour ma validation du titre RNCP de développeur web.

**Objectifs d'apprentissage :**
- Architecture backend complète (MVC, API REST)
- Système d'authentification JWT sécurisé
- Gestion de base de données relationnelle (MySQL)
- Découverte de Zod, Helmet, Argon2, Slugify, Cookie-parser, Multer, express-rate-limit

**Fonctionnalités :**
- Articles de blog avec statuts (draft, published, archived)
- Galerie d'images avec système de tags, catégories et image du jour
- Commentaires modérés
- Profils utilisateurs (dont artiste principale)
- Système de tags multi-entités (articles et images)
- Catégories d'images avec ordre d'affichage
- Formulaire de contact et gestion des messages

> **Note** : Ce dépôt contient uniquement le backend. Le frontend est disponible dans un [dépôt séparé](https://github.com/Mattia-FR/SariBlogFront).

## ✨ Fonctionnalités

### ✅ Implémentées

- **Articles** : Consultation des articles publiés (4 endpoints publics) + CRUD admin (6 endpoints)
  - Public : preview homepage, liste paginée publiés, par ID, par slug
  - Admin : liste tous statuts, par slug/ID, création, modification, suppression

- **Images** : Galerie d'images avec filtrage (6 endpoints publics) + CRUD admin avec upload (5 endpoints)
  - Public : galerie, image du jour, par tag, par catégorie, par article, par ID
  - Admin : liste, par ID, création (upload fichier), modification, suppression

- **Tags** : Système de tags multi-entités (4 endpoints publics) + CRUD admin (7 endpoints)
  - Public : tags des articles publiés, par catégorie (galerie), par article, par image
  - Admin : liste, `used-on-articles`, `used-on-images`, par ID, création, modification, suppression

- **Catégories** : Catégories d'images avec ordre d'affichage (2 endpoints publics) + CRUD admin (5 endpoints)
  - Public : liste complète, par slug
  - Admin : liste, par ID, création, modification, suppression

- **Commentaires** : Système de commentaires modérés (2 endpoints publics) + modération admin (4 endpoints)
  - Public : liste des commentaires approuvés d'un article ; création d'un commentaire (modération ensuite)
  - Admin : liste paginée (filtre `?status=` optionnel), par ID, mise à jour statut, suppression

- **Utilisateurs** : Artiste principale (1 endpoint public) + profil connecté (3 endpoints admin)
  - Public : profil de l'artiste principale (`GET /api/users/artist`)
  - Admin : `GET/PATCH /api/admin/users/me`, `PATCH /api/admin/users/me/password`

- **Messages** : Formulaire de contact (1 endpoint public) + gestion admin (4 endpoints)
  - Public : création de message (visiteur)
  - Admin : liste paginée (filtre `?status=` optionnel), par ID, mise à jour statut, suppression

- **Authentification** : JWT avec refresh (3 endpoints)
  - Login, refresh (cookie), logout

- **Dashboard** : Statistiques admin (1 endpoint)

**Total : 58 endpoints (23 routes publiques incluant `/api/auth`, 35 sous `/api/admin` avec JWT + rôle éditeur ou admin)**

## 🛠️ Technologies

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| **Runtime** | Node.js | 18+ |
| **Language** | TypeScript | 5.7.3 |
| **Framework** | Express | 5.1.0 |
| **Base de données** | MySQL | 8.0+ |
| **Driver DB** | mysql2 | 3.15.3 |
| **Sécurité** | Argon2 | 0.44.0 |
| **Auth** | jsonwebtoken | 9.0.3 |
| **Validation** | Zod | 4.1.12 |
| **Upload** | Multer | 2.1.0 |
| **Traitement images** | sharp | 0.35.5 |
| **Détection MIME** | file-type | 22.1.1 |
| **Rate limiting** | express-rate-limit | 8.2.1 |
| **Logging** | winston, winston-daily-rotate-file, morgan | 3.19.x / 5.0.x / 1.12.x |
| **Utilitaires** | dotenv, cookie-parser, slugify | - |
| **Sécurité HTTP** | Helmet | 8.1.0 |
| **CORS** | cors | 2.8.5 |
| **Dev** | Nodemon, ts-node, Vitest, Supertest | 3.1.x / 10.9.x / 4.1.x / 7.3.x |

## 📁 Architecture

```
Back/
├── src/
│   ├── app.ts                       # Configuration Express (middlewares, CORS, static files)
│   ├── config/
│   │   ├── argon2.ts                # Options de hashage Argon2 (OWASP)
│   │   ├── helmet.ts                # Configuration Helmet (sécurité HTTP)
│   │   ├── imageConstraints.ts      # MIME autorisés, taille max (20 MB)
│   │   ├── multer.ts                # Upload disque (UUID.tmp, filtre MIME)
│   │   └── rateLimit.ts             # Rate limiters (login, messages, commentaires)
│   ├── controller/
│   │   ├── articlesController.ts    # Articles publics (handlers utilisés par articlesRouter)
│   │   ├── categoriesController.ts  # Catégories publiques (2 handlers)
│   │   ├── commentsController.ts    # Commentaires publics (liste + création)
│   │   ├── imagesController.ts      # Images publiques (handlers galerie, filtres, etc.)
│   │   ├── messagesController.ts    # Formulaire contact (1 handler)
│   │   ├── authController.ts        # Authentification (login, refresh, logout)
│   │   ├── tagsController.ts        # Tags publics
│   │   ├── usersController.ts       # Artiste principale (1 handler)
│   │   └── admin/
│   │       ├── articlesAdminController.ts    # CRUD articles (6 handlers)
│   │       ├── categoriesAdminController.ts  # CRUD catégories (5 handlers)
│   │       ├── commentsAdminController.ts    # Modération commentaires (4 handlers)
│   │       ├── dashboardAdminController.ts   # Statistiques (1 handler)
│   │       ├── imagesAdminController.ts      # CRUD images + upload (5 handlers)
│   │       ├── messagesAdminController.ts    # Gestion messages (4 handlers)
│   │       ├── tagsAdminController.ts        # CRUD tags (7 routes)
│   │       └── usersAdminController.ts       # Profil connecté / mot de passe (3 handlers)
│   ├── model/
│   │   ├── db.ts                    # Pool de connexions MySQL
│   │   ├── articlesModel.ts
│   │   ├── categoriesModel.ts
│   │   ├── commentsModel.ts
│   │   ├── imagesModel.ts
│   │   ├── messagesModel.ts
│   │   ├── tagsModel.ts
│   │   ├── usersModel.ts
│   │   └── admin/
│   │       ├── articlesAdminModel.ts
│   │       ├── categoriesAdminModel.ts
│   │       ├── commentsAdminModel.ts
│   │       ├── imagesAdminModel.ts
│   │       ├── messagesAdminModel.ts
│   │       ├── tagsAdminModel.ts
│   │       └── usersAdminModel.ts
│   ├── router/
│   │   ├── index.ts                 # Router principal (préfixe /api)
│   │   ├── articlesRouter.ts        # Routes publiques articles
│   │   ├── authRouter.ts            # Auth (login, refresh, logout)
│   │   ├── categoriesRouter.ts      # Routes publiques catégories
│   │   ├── commentsRouter.ts
│   │   ├── imagesRouter.ts
│   │   ├── messagesRouter.ts
│   │   ├── tagsRouter.ts
│   │   ├── usersRouter.ts
│   │   └── admin/
│   │       ├── index.ts                    # Montage sous /api/admin (protégé)
│   │       ├── articlesAdminRouter.ts
│   │       ├── categoriesAdminRouter.ts
│   │       ├── commentsAdminRouter.ts
│   │       ├── dashboardAdminRouter.ts
│   │       ├── imagesAdminRouter.ts
│   │       ├── messagesAdminRouter.ts
│   │       ├── tagsAdminRouter.ts
│   │       └── usersAdminRouter.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts        # requireAuth (JWT Bearer)
│   │   ├── errorMiddleware.ts       # Gestionnaire d'erreurs global (Zod, Multer, 500)
│   │   ├── requestIdMiddleware.ts   # Injection requestId + header X-Request-Id
│   │   ├── roleMiddleware.ts        # requireRole, requireEditor
│   │   └── validateMiddleware.ts    # validate(zodSchema) — parse req.body
│   ├── schemas/
│   │   ├── articleSchemas.ts
│   │   ├── authSchemas.ts           # loginSchema (Zod)
│   │   ├── categorySchemas.ts
│   │   ├── commentSchemas.ts
│   │   ├── common.ts
│   │   ├── imageSchemas.ts
│   │   ├── messageSchemas.ts
│   │   ├── tagSchemas.ts
│   │   └── userSchemas.ts
│   ├── types/
│   │   ├── articles.ts
│   │   ├── auth.ts
│   │   ├── categories.ts
│   │   ├── comments.ts
│   │   ├── images.ts
│   │   ├── messages.ts
│   │   ├── tags.ts
│   │   └── users.ts
│   └── utils/
│       ├── assertAllowedImageFile.ts # Vérification magic bytes (file-type)
│       ├── dateHelpers.ts
│       ├── excerpt.ts               # Génération d'extraits texte (tronqués à N mots)
│       ├── hashRefreshToken.ts      # Empreinte HMAC-SHA256 du refresh token
│       ├── httpErrors.ts            # HttpError, isHttpError, sendError
│       ├── imageUrl.ts
│       ├── logger.ts                # Winston (+ rotation fichier en prod)
│       ├── mysqlErrors.ts
│       ├── processUploadedImage.ts  # Conversion Sharp → WebP + miniature
│       ├── publishedAt.ts           # Calcul de published_at à la création d'article
│       ├── requestParams.ts         # Pagination / parsing query
│       └── slug.ts
├── uploads/
│   └── images/                      # Fichiers images (servis statiquement)
├── tests/
│   ├── api.http                     # Tests REST Client (VS Code)
│   ├── integration/                 # Tests d'intégration Supertest
│   └── unit/                        # Tests unitaires Vitest
├── vitest.config.mts
├── index.ts                         # Point d'entrée (port 4242)
├── init.ts                          # Script d'initialisation DB (npm run db:init)
├── seeds.ts                         # Données de test
├── schema.sql                       # Schéma complet (9 tables)
├── package.json
├── tsconfig.json
├── .env.sample
└── README.md
```

### Principes d'architecture

- **Séparation des responsabilités** : Modèles → Contrôleurs → Routers
- **TypeScript strict** : Typage complet pour la sécurité du code
- **Pool de connexions** : Gestion optimisée des connexions MySQL
- **Structure modulaire** : Un module par entité métier ; routes admin regroupées sous `/api/admin` avec authentification JWT et rôles (éditeur / admin)

## 🚀 Installation

### Prérequis

- **Node.js** : version 18 ou supérieure
- **MySQL** : version 8.0 ou supérieure
- **npm** : version 9+

### Étapes d'installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/Mattia-FR/SariBlogBack.git
cd SariBlogBack
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Copiez `.env.sample` vers `.env` et renseignez les valeurs :

```env
DB_HOST=localhost
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_NAME=sariblog
DB_PORT=3306
PORT=4242

ALLOWED_ORIGIN=http://localhost:5173

# Niveaux Winston : error | warn | info | http | verbose | debug | silly
LOG_LEVEL=info
# En production (NODE_ENV=production) : logs aussi dans logs/app-*.log (rotation 7j / 20m)

# Origine publique du backend (URLs images + CSP Helmet) — fallback http://localhost:4242 si absent
IMAGE_BASE_URL=http://localhost:4242

# JWT (obligatoire pour l'auth) : générer deux secrets avec :
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ACCESS_TOKEN_SECRET=une_longue_chaîne_aléatoire_secrète_1
REFRESH_TOKEN_SECRET=une_autre_longue_chaîne_aléatoire_secrète_2

# Durées de vie des tokens (format jwt) ; défauts 15m / 7d si absentes
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

> ⚠️ **Important** : `DB_*`, `PORT`, `ACCESS_TOKEN_SECRET` et `REFRESH_TOKEN_SECRET` sont **obligatoires**. `ALLOWED_ORIGIN` est fortement recommandé (CORS). `IMAGE_BASE_URL` a un fallback local si absent.

4. **Initialiser la base de données**

> **Attention** : `npm run db:init` exécute [`init.ts`](init.ts), qui **supprime la base** portant le nom `DB_NAME` si elle existe, la recrée, applique `schema.sql` puis injecte les données de test via `seeds.ts`. Ajustez `DB_NAME` dans `.env` en conséquence.

```bash
npm run db:init
```

Le fichier `schema.sql` contient les 9 tables avec leurs relations. Aucune étape `mysql` manuelle n’est nécessaire : tout est fait par le script.

5. **Démarrer le serveur**

```bash
# Mode développement (avec hot reload)
npm run dev
```

Le serveur démarre sur **http://localhost:4242**

Vous pouvez tester l'API en accédant à `http://localhost:4242/` : la racine renvoie une chaîne de confirmation (message défini dans [`index.ts`](index.ts)).

## 📡 API Endpoints

**Base URL** : `http://localhost:4242/api`

### Authentification (`/api/auth`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `POST` | `/auth/login` | Connexion (identifier + password) ; retourne accessToken, définit cookie refreshToken | Public |
| `POST` | `/auth/refresh` | Rafraîchir l'access token (utilise le cookie refreshToken) | Public (cookie) |
| `POST` | `/auth/logout` | Déconnexion (invalide le refresh token, supprime le cookie) | Public |

Pour les routes protégées, envoyer le header : `Authorization: Bearer <accessToken>`.

### Articles (`/api/articles`) — publics

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/articles/homepage-preview` | 4 derniers articles publiés (enrichis avec images et tags) | Public |
| `GET` | `/articles/published` | Liste paginée des articles publiés. Query : `page`, `limit` (1–20), `tagId` optionnel. Réponse : `{ articles, total, page, limit }` | Public |
| `GET` | `/articles/published/id/:id` | Article publié par ID (avec contenu complet) | Public |
| `GET` | `/articles/published/slug/:slug` | Article publié par slug (avec contenu complet) | Public |

### Images (`/api/images`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/images/image-of-the-day` | Image du jour (change automatiquement) | Public |
| `GET` | `/images/homepage-preview` | 6 dernières œuvres de la galerie (tags + `categorySlug`) | Public |
| `GET` | `/images/gallery` | Galerie d'images publiques (`is_in_gallery = TRUE`) | Public |
| `GET` | `/images/article/:articleId` | Images associées à un article | Public |
| `GET` | `/images/tag/:tagId` | Images filtrées par tag | Public |
| `GET` | `/images/category/:categoryId` | Images de la galerie pour une catégorie (`?page`, `?limit`, max 20) | Public |
| `GET` | `/images/:id` | Image par ID (détails complets) | Public |

### Utilisateurs (`/api/users`) — public

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/users/artist` | Profil de l'artiste principale (sans mot de passe) | Public |

### Tags (`/api/tags`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/tags/published-articles` | Tags utilisés sur au moins un article publié | Public |
| `GET` | `/tags/category/:categoryId` | Tags utilisés sur la galerie d'une catégorie | Public |
| `GET` | `/tags/article/:articleId` | Tags associés à un article | Public |
| `GET` | `/tags/image/:imageId` | Tags associés à une image | Public |

### Catégories (`/api/categories`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/categories` | Liste toutes les catégories (triées par `display_order`) | Public |
| `GET` | `/categories/:slug` | Catégorie par slug | Public |

### Commentaires (`/api/comments`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/comments/article/:articleId` | Commentaires approuvés d'un article (avec infos utilisateur) | Public |
| `POST` | `/comments` | Créer un commentaire (statut initial `pending`, modération côté admin) | Public |

### Messages (`/api/messages`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `POST` | `/messages` | Créer un message via formulaire de contact | Public |

### Admin (`/api/admin`) — protégé (JWT + rôle éditeur ou admin)

Toutes les routes ci-dessous nécessitent le header `Authorization: Bearer <accessToken>` et un rôle **admin** ou **editor**.

#### Articles admin (`/api/admin/articles`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/articles` | Liste paginée (tous statuts). Query : `page`, `limit` (1–20, défaut 10), `tagId` optionnel. Réponse : `{ articles, total, page, limit }`. |
| `GET` | `/admin/articles/slug/:slug` | Article par slug (tous statuts) |
| `GET` | `/admin/articles/:id` | Article par ID (détails complets) |
| `POST` | `/admin/articles` | Créer un article |
| `PATCH` | `/admin/articles/:id` | Modifier un article |
| `DELETE` | `/admin/articles/:id` | Supprimer un article |

#### Images admin (`/api/admin/images`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/images` | Liste paginée (`page`, `limit` 1–20, `tagId` optionnel) → `{ images, total, page, limit }` |
| `GET` | `/admin/images/:id` | Image par ID |
| `POST` | `/admin/images` | Créer une image (`multipart/form-data`, champ `image` ; champs texte optionnels dont `article_id`, `category_id`, `tag_ids` comme JSON) |
| `PATCH` | `/admin/images/:id` | Modifier les métadonnées (`title`, `description`, `alt_descr`, `is_in_gallery`, `article_id`, `category_id`, `tag_ids`, etc.) |
| `DELETE` | `/admin/images/:id` | Supprimer une image |

#### Tags admin (`/api/admin/tags`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/tags` | Liste tous les tags |
| `GET` | `/admin/tags/used-on-articles` | Tags liés à au moins un article (filtre liste articles admin) |
| `GET` | `/admin/tags/used-on-images` | Tags liés à au moins une image (filtre liste images) |
| `GET` | `/admin/tags/:id` | Tag par ID |
| `POST` | `/admin/tags` | Créer un tag |
| `PATCH` | `/admin/tags/:id` | Modifier un tag |
| `DELETE` | `/admin/tags/:id` | Supprimer un tag |

#### Catégories admin (`/api/admin/categories`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/categories` | Liste toutes les catégories |
| `GET` | `/admin/categories/:id` | Catégorie par ID |
| `POST` | `/admin/categories` | Créer une catégorie |
| `PATCH` | `/admin/categories/:id` | Modifier une catégorie |
| `DELETE` | `/admin/categories/:id` | Supprimer une catégorie |

#### Commentaires admin (`/api/admin/comments`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/comments` | Liste paginée. Query : `page`, `limit` (1–20, défaut 10), `status` optionnel (`pending` \| `approved` \| `rejected` \| `spam`). Réponse : `{ comments, total, page, limit, counts }` avec `counts` : `{ total, pending, approved, rejected, spam }`. |
| `GET` | `/admin/comments/:id` | Commentaire par ID |
| `PATCH` | `/admin/comments/:id/status` | Mettre à jour le statut |
| `DELETE` | `/admin/comments/:id` | Supprimer un commentaire |

#### Messages admin (`/api/admin/messages`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/messages` | Liste paginée des messages. Query : `page`, `limit` (1–20, défaut 10), `status` optionnel (`unread` \| `read` \| `archived`). Réponse : `{ messages, total, page, limit, counts }` où `counts` est `{ total, unread, read, archived }` pour les onglets admin. |
| `GET` | `/admin/messages/:id` | Message par ID |
| `PATCH` | `/admin/messages/:id/status` | Mettre à jour le statut |
| `DELETE` | `/admin/messages/:id` | Supprimer un message |

#### Utilisateurs admin (`/api/admin/users`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/users/me` | Profil de l'utilisateur connecté |
| `PATCH` | `/admin/users/me` | Mettre à jour le profil connecté |
| `PATCH` | `/admin/users/me/password` | Changer le mot de passe du compte connecté |

#### Dashboard admin (`/api/admin/dashboard`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/dashboard/stats` | Statistiques globales (articles, images, messages, commentaires) |

### Fichiers statiques

| URL | Description |
|-----|-------------|
| `/uploads/images/*` | Fichiers images uploadés (servis statiquement via `/uploads`) |

### Exemples de requêtes

```bash
# Connexion (récupérer l'accessToken pour les routes admin)
curl -X POST http://localhost:4242/api/auth/login -H "Content-Type: application/json" -d "{\"identifier\":\"admin@sariblog.com\",\"password\":\"votre_mot_de_passe\"}"

# Récupérer les 4 derniers articles pour la homepage
curl http://localhost:4242/api/articles/homepage-preview

# Récupérer un article publié par slug
curl http://localhost:4242/api/articles/published/slug/decouvrir-aquarelle-guide-debutants

# Récupérer l'image du jour
curl http://localhost:4242/api/images/image-of-the-day

# Aperçu homepage (6 dernières œuvres)
curl http://localhost:4242/api/images/homepage-preview

# Récupérer la galerie d'images
curl http://localhost:4242/api/images/gallery

# Récupérer le profil de l'artiste principale
curl http://localhost:4242/api/users/artist

# Récupérer les catégories
curl http://localhost:4242/api/categories

# Récupérer les tags d'un article
curl http://localhost:4242/api/tags/article/1

# Route admin (avec token)
curl -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" "http://localhost:4242/api/admin/articles?page=1&limit=10"

# Statistiques du dashboard
curl -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" http://localhost:4242/api/admin/dashboard/stats

# Profil utilisateur connecté (admin)
curl -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" http://localhost:4242/api/admin/users/me
```

## 🗄️ Base de données

### Structure

**9 tables** avec relations (foreign keys) :

| Table | Description | Relations |
|-------|-------------|-----------|
| `users` | Utilisateurs (2 données de test) | - |
| `articles` | Articles de blog (30 données de test) | `users`, `images` (featured_image) |
| `images` | Galerie d'images (60 données de test) | `users`, `articles`, `categories` (`category_id`) |
| `tags` | Tags multi-entités (10 données de test) | - |
| `categories` | Catégories d'images (5 données de test) | - |
| `comments` | Commentaires sur articles (13 données de test) | `users` (nullable), `articles` |
| `messages` | Messages de contact (10 données de test) | - |
| `articles_tags` | Relation N-N articles ↔ tags | `articles`, `tags` |
| `images_tags` | Relation N-N images ↔ tags | `images`, `tags` |

### Caractéristiques

- **Statuts d'articles** : `draft`, `published`, `archived`
- **Rôles utilisateurs** : `admin`, `editor`
- **Statuts de commentaires** : `pending`, `approved`, `rejected`, `spam`
- **Statuts de messages** : `unread`, `read`, `archived`
- **Catégorie d'image** : relation 1-N via `images.category_id` (pas de table de jointure)
- **Encodage** : UTF-8 (utf8mb4_unicode_ci)
- **Moteur** : InnoDB (support des transactions et foreign keys)

### Données de test

Le fichier `seeds.ts` (injecté via `npm run db:init`) inclut :
- 2 utilisateurs (1 admin, 1 éditrice — l'artiste principale)
- 30 articles (28 publiés, 2 brouillons)
- 60 images (galerie et illustrations d'articles)
- 10 tags (aquarelle, fantasy, portrait, etc.)
- 5 catégories (portraits, aquarelle, paysages, fantasy, croquis & esquisses)
- 13 commentaires (11 approuvés, 1 spam, 1 rejeté)
- 10 messages de contact
- Relations articles-tags et images-tags ; catégories liées via `images.category_id`

## 🧪 Tests

### Tests REST Client (VS Code)

Le projet inclut un fichier `tests/api.http` avec des tests pour tous les endpoints.

**Utilisation** :

1. Installer l'extension **REST Client** dans VS Code
2. Démarrer le serveur : `npm run dev` dans `Back/`
3. Ouvrir `tests/api.http`
4. Pour les routes admin : exécuter d'abord la requête **POST /auth/login**, copier l'`accessToken` de la réponse et le coller dans la variable `@accessToken` en tête de fichier
5. Cliquer sur "Send Request" au-dessus de chaque requête

Le fichier contient :
- Tests pour tous les endpoints (auth, publics, admin)
- Variables globales (`@baseUrl`, `@adminUrl`, `@accessToken`)
- Exemples de codes HTTP (200, 401, 403, 404)

### Tests unitaires et d'intégration (Vitest)

```bash
npm test          # exécution unique
npm run test:watch  # mode surveillance
```

- **Unitaires** : `tests/unit/` (utils, middlewares, upload, etc.)
- **Intégration** : `tests/integration/errorContract.test.ts` (contrat JSON d'erreur via Supertest)
- **Configuration** : `vitest.config.mts`

### Exemple de test

```http
### Variables
@baseUrl = http://localhost:4242/api

### Récupérer les articles de la homepage
GET {{baseUrl}}/articles/homepage-preview
```

## 🔐 Sécurité

### ✅ Implémenté

- **Hashage des mots de passe** : Argon2id (options OWASP dans `src/config/argon2.ts` — memoryCost 19 MB, timeCost 2)
- **Authentification JWT** : Access token (Bearer) + refresh token (cookie HttpOnly, `secure: true`, `sameSite: "strict"`) ; secrets en variables d'environnement
- **Refresh token en DB** : seule l'empreinte HMAC-SHA256 (`hashRefreshToken`) est stockée dans `users.refresh_token` ; le cookie conserve le JWT brut
- **Déploiement (hash refresh)** : après mise en prod de ce changement, invalider les sessions existantes une fois : `UPDATE users SET refresh_token = NULL;` (sinon les JWT encore en clair en DB ne matcheront plus → 401 au refresh → re-login)
- **Cookie secure** : `secure: true` partout — sur HTTP local (sans HTTPS), le navigateur peut refuser le cookie refresh ; privilégier HTTPS ou un reverse proxy local si besoin
- **Rôles** : Middlewares `requireAuth`, `requireEditor` pour protéger les routes admin
- **CORS** : Activé avec `credentials: true`, origine contrôlée via `ALLOWED_ORIGIN`
- **Helmet** : Headers de sécurité HTTP configurés (CSP stricte, frameAncestors, crossOriginResourcePolicy)
- **Validation des entrées** : Schémas Zod pour auth, messages, commentaires et CRUD admin (articles, images, tags, catégories, users) dans `src/schemas/`
- **Rate limiting** : 3 limiteurs distincts (`loginLimiter`, `messagesLimiter`, `commentsLimiter`) — 5 requêtes par IP par tranche de 15 min
- **Upload sécurisé** : Multer (20 MB max, fichier `UUID.tmp`) + whitelist MIME (`imageConstraints.ts`) + vérification magic bytes (`file-type`) + conversion Sharp en WebP et miniature `-thumb.webp`
- **Corrélation des logs** : middleware `requestId` (header `X-Request-Id`) ; Morgan → Winston ; en production, rotation fichier (`logs/app-*.log`, 7j / 20m)
- **Exclusion des mots de passe** : Les mots de passe ne sont jamais retournés dans les réponses API

## 📝 Scripts disponibles

```bash
# Démarrage en mode développement (avec hot reload)
npm run dev

# Compilation TypeScript
npm run build

# Initialiser la base de données (suppression/recréation de DB_NAME, schéma + données de test)
npm run db:init

# Tests (Vitest)
npm test
npm run test:watch

# Formatage / lint (scripts présents ; nécessitent @biomejs/biome, non listé dans package.json)
npm run format
npm run lint

# Vérification ad hoc
npm run check
```

## 👤 Auteur

**MattiaFR**

- GitHub : [@Mattia-FR](https://github.com/Mattia-FR)
- Dépôt Backend : [SariBlogBack](https://github.com/Mattia-FR/SariBlogBack)
- Dépôt Frontend : [SariBlogFront](https://github.com/Mattia-FR/SariBlogFront)
