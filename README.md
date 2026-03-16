# Sariblog Backend API

> API REST d'un CMS blog/portfolio développé pour ma sœur illustratrice.
> Premier projet fullstack complet réalisé en solo sur 3 mois.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.1-black.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Endpoints](#-api-endpoints) (auth, publics, admin)
- [Base de données](#-base-de-données)
- [Tests](#-tests)
- [Sécurité](#-sécurité)
- [Contribution](#-contribution)
- [Licence](#-licence)

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

- **Images** : Galerie d'images avec filtrage (5 endpoints publics) + CRUD admin avec upload (5 endpoints)
  - Public : galerie, image du jour, par tag, par article, par ID
  - Admin : liste, par ID, création (upload fichier), modification, suppression

- **Tags** : Système de tags multi-entités (3 endpoints publics) + CRUD admin (5 endpoints)
  - Public : liste complète, tags par article, tags par image
  - Admin : liste, par ID, création, modification, suppression

- **Catégories** : Catégories d'images avec ordre d'affichage (2 endpoints publics) + CRUD admin (5 endpoints)
  - Public : liste complète, par slug
  - Admin : liste, par ID, création, modification, suppression

- **Commentaires** : Système de commentaires modérés (1 endpoint public) + modération admin (5 endpoints)
  - Public : commentaires approuvés d'un article (avec infos utilisateur)
  - Admin : liste, par statut, par ID, mise à jour statut, suppression

- **Utilisateurs** : Profils publics (3 endpoints) + profil connecté (1 endpoint)
  - Liste, artiste principale, par ID ; `/users/me` pour l'utilisateur connecté

- **Messages** : Formulaire de contact (1 endpoint public) + gestion admin (5 endpoints)
  - Public : création de message (avec optionalAuth pour lier l'utilisateur si connecté)
  - Admin : liste, par statut, par ID, mise à jour statut, suppression

- **Authentification** : JWT avec refresh (3 endpoints)
  - Login, refresh (cookie), logout

- **Dashboard** : Statistiques admin (1 endpoint)

**Total : 55 endpoints (22 publics, 1 authentifié `/users/me`, 32 admin sous `/api/admin`)**

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
| **Validation** | Zod | 4.1.x |
| **Upload** | Multer | 2.1.0 |
| **Rate limiting** | express-rate-limit | 8.2.1 |
| **Utilitaires** | dotenv, cookie-parser, slugify | - |
| **Sécurité HTTP** | Helmet | 8.1.0 |
| **CORS** | cors | 2.8.5 |
| **Dev** | Nodemon, ts-node | 3.1.x / 10.9.x |

## 📁 Architecture

```
Back/
├── src/
│   ├── app.ts                       # Configuration Express (middlewares, CORS, static files)
│   ├── config/
│   │   ├── argon2.ts                # Options de hashage Argon2 (OWASP)
│   │   ├── helmet.ts                # Configuration Helmet (sécurité HTTP)
│   │   ├── multer.ts                # Upload d'images (20 MB max, nommage UUID)
│   │   └── rateLimit.ts             # Rate limiters (login, messages, commentaires)
│   ├── controller/
│   │   ├── articlesController.ts    # Articles publics (4 handlers)
│   │   ├── categoriesController.ts  # Catégories publiques (2 handlers)
│   │   ├── commentsController.ts    # Commentaires (1 handler)
│   │   ├── imagesController.ts      # Images (5 handlers)
│   │   ├── messagesController.ts    # Formulaire contact (1 handler)
│   │   ├── authController.ts        # Authentification (login, refresh, logout)
│   │   ├── tagsController.ts        # Tags (3 handlers)
│   │   ├── usersController.ts       # Utilisateurs (4 handlers)
│   │   └── admin/
│   │       ├── articlesAdminController.ts    # CRUD articles (6 handlers)
│   │       ├── categoriesAdminController.ts  # CRUD catégories (5 handlers)
│   │       ├── commentsAdminController.ts    # Modération commentaires (5 handlers)
│   │       ├── dashboardAdminController.ts   # Statistiques (1 handler)
│   │       ├── imagesAdminController.ts      # CRUD images + upload (5 handlers)
│   │       ├── messagesAdminController.ts    # Gestion messages (5 handlers)
│   │       └── tagsAdminController.ts        # CRUD tags (5 handlers)
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
│   │       └── tagsAdminModel.ts
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
│   │       └── tagsAdminRouter.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts        # requireAuth, optionalAuth (JWT)
│   │   ├── errorMiddleware.ts       # Gestionnaire d'erreurs global (Zod, Multer, 500)
│   │   ├── roleMiddleware.ts        # requireRole, requireEditor, requireAdmin
│   │   └── validateMiddleware.ts    # validate(zodSchema) — parse req.body
│   ├── schemas/
│   │   ├── authSchemas.ts           # loginSchema (Zod)
│   │   ├── commentSchemas.ts
│   │   └── messageSchemas.ts
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
│       ├── dateHelpers.ts
│       ├── imageUrl.ts
│       └── slug.ts
├── uploads/
│   └── images/                      # Fichiers images (servis statiquement)
├── tests/
│   └── api.http                     # Tests REST Client (VS Code)
├── index.ts                         # Point d'entrée (port 4242)
├── init.ts                          # Script d'initialisation DB (npm run db:init)
├── seeds.ts                         # Données de test
├── schema.sql                       # Schéma complet (10 tables)
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
IMAGE_BASE_URL=http://localhost:4242

# JWT (obligatoire pour l'auth) : générer deux secrets avec :
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ACCESS_TOKEN_SECRET=une_longue_chaîne_aléatoire_secrète_1
REFRESH_TOKEN_SECRET=une_autre_longue_chaîne_aléatoire_secrète_2
```

> ⚠️ **Important** : Les variables `DB_*`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ALLOWED_ORIGIN` et `IMAGE_BASE_URL` sont **obligatoires** pour le bon fonctionnement.

4. **Créer et initialiser la base de données**

```bash
# Créer la base de données
mysql -u votre_utilisateur -p -e "CREATE DATABASE sariblog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importer le schéma (tables uniquement)
mysql -u votre_utilisateur -p sariblog < schema.sql

# Injecter les données de test
npm run db:init
```

Le fichier `schema.sql` contient les 10 tables avec leurs relations. Le script `npm run db:init` (`init.ts` + `seeds.ts`) insère les données de test.

5. **Démarrer le serveur**

```bash
# Mode développement (avec hot reload)
npm run dev
```

Le serveur démarre sur **http://localhost:4242**

Vous pouvez tester l'API en accédant à `http://localhost:4242/` qui retourne un message de confirmation.

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
| `GET` | `/articles/published` | Liste des articles publiés (`?limit=N`, max 20) | Public |
| `GET` | `/articles/published/id/:id` | Article publié par ID (avec contenu complet) | Public |
| `GET` | `/articles/published/slug/:slug` | Article publié par slug (avec contenu complet) | Public |

### Images (`/api/images`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/images/image-of-the-day` | Image du jour (change automatiquement) | Public |
| `GET` | `/images/gallery` | Galerie d'images publiques (`is_in_gallery = TRUE`) | Public |
| `GET` | `/images/article/:articleId` | Images associées à un article | Public |
| `GET` | `/images/tag/:tagId` | Images filtrées par tag | Public |
| `GET` | `/images/:id` | Image par ID (détails complets) | Public |

### Utilisateurs (`/api/users`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/users` | Liste tous les utilisateurs (sans mots de passe) | Public |
| `GET` | `/users/artist` | Profil de l'artiste principale (sans mot de passe) | Public |
| `GET` | `/users/me` | Profil de l'utilisateur connecté | Authentifié |
| `GET` | `/users/:id` | Profil utilisateur par ID (sans mot de passe) | Public |

### Tags (`/api/tags`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/tags` | Liste tous les tags | Public |
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

### Messages (`/api/messages`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `POST` | `/messages` | Créer un message via formulaire de contact (optionalAuth : lie l'utilisateur si connecté) | Public |

### Admin (`/api/admin`) — protégé (JWT + rôle éditeur ou admin)

Toutes les routes ci-dessous nécessitent le header `Authorization: Bearer <accessToken>` et un rôle **admin** ou **editor**.

#### Articles admin (`/api/admin/articles`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/articles` | Liste tous les articles (tous statuts) |
| `GET` | `/admin/articles/slug/:slug` | Article par slug (tous statuts) |
| `GET` | `/admin/articles/:id` | Article par ID (détails complets) |
| `POST` | `/admin/articles` | Créer un article |
| `PATCH` | `/admin/articles/:id` | Modifier un article |
| `DELETE` | `/admin/articles/:id` | Supprimer un article |

#### Images admin (`/api/admin/images`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/images` | Liste toutes les images |
| `GET` | `/admin/images/:id` | Image par ID |
| `POST` | `/admin/images` | Créer une image (`multipart/form-data`, champ `image`) |
| `PATCH` | `/admin/images/:id` | Modifier les métadonnées d'une image |
| `DELETE` | `/admin/images/:id` | Supprimer une image |

#### Tags admin (`/api/admin/tags`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/tags` | Liste tous les tags |
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
| `GET` | `/admin/comments` | Liste tous les commentaires |
| `GET` | `/admin/comments/status/:status` | Commentaires par statut (`pending`, `approved`, `rejected`, `spam`) |
| `GET` | `/admin/comments/:id` | Commentaire par ID |
| `PATCH` | `/admin/comments/:id/status` | Mettre à jour le statut |
| `DELETE` | `/admin/comments/:id` | Supprimer un commentaire |

#### Messages admin (`/api/admin/messages`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/messages` | Liste tous les messages |
| `GET` | `/admin/messages/status/:status` | Messages par statut (`unread`, `read`, `archived`) |
| `GET` | `/admin/messages/:id` | Message par ID |
| `PATCH` | `/admin/messages/:id/status` | Mettre à jour le statut |
| `DELETE` | `/admin/messages/:id` | Supprimer un message |

#### Dashboard admin (`/api/admin/dashboard`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/dashboard/stats` | Statistiques globales (articles, images, messages, commentaires) |

### Fichiers statiques

| URL | Description |
|-----|-------------|
| `/uploads/images/*` | Fichiers images uploadés (servis statiquement) |

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

# Récupérer la galerie d'images
curl http://localhost:4242/api/images/gallery

# Récupérer le profil de l'artiste principale
curl http://localhost:4242/api/users/artist

# Récupérer les catégories
curl http://localhost:4242/api/categories

# Récupérer les tags d'un article
curl http://localhost:4242/api/tags/article/1

# Route admin (avec token)
curl -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" http://localhost:4242/api/admin/articles

# Statistiques du dashboard
curl -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" http://localhost:4242/api/admin/dashboard/stats
```

## 🗄️ Base de données

### Structure

**10 tables** avec relations (foreign keys) :

| Table | Description | Relations |
|-------|-------------|-----------|
| `users` | Utilisateurs (2 données de test) | - |
| `articles` | Articles de blog (10 données de test) | `users`, `images` (featured_image) |
| `images` | Galerie d'images (14 données de test) | `users`, `articles` |
| `tags` | Tags multi-entités (10 données de test) | - |
| `categories` | Catégories d'images (5 données de test) | - |
| `comments` | Commentaires sur articles (10 données de test) | `users`, `articles` |
| `messages` | Messages de contact (10 données de test) | `users` |
| `articles_tags` | Relation N-N articles ↔ tags | `articles`, `tags` |
| `images_tags` | Relation N-N images ↔ tags | `images`, `tags` |
| `images_categories` | Relation N-N images ↔ catégories | `images`, `categories` |

### Caractéristiques

- **Statuts d'articles** : `draft`, `published`, `archived`
- **Rôles utilisateurs** : `admin`, `editor`
- **Statuts de commentaires** : `pending`, `approved`, `rejected`, `spam`
- **Statuts de messages** : `unread`, `read`, `archived`
- **Encodage** : UTF-8 (utf8mb4_unicode_ci)
- **Moteur** : InnoDB (support des transactions et foreign keys)

### Données de test

Le fichier `seeds.ts` (injecté via `npm run db:init`) inclut :
- 2 utilisateurs (1 admin, 1 éditrice — l'artiste principale)
- 10 articles (9 publiés, 1 brouillon)
- 14 images (galerie et illustrations d'articles)
- 10 tags (aquarelle, fantasy, portrait, etc.)
- 5 catégories (portraits, aquarelle, paysages, fantasy, croquis & esquisses)
- 10 commentaires (8 approuvés, 1 spam, 1 rejeté)
- 10 messages de contact
- Relations articles-tags, images-tags et images-catégories

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
- **Authentification JWT** : Access token (Bearer) + refresh token (cookie HttpOnly) ; secrets en variables d'environnement
- **Rôles** : Middlewares `requireAuth`, `requireEditor`, `requireAdmin` pour protéger les routes admin
- **CORS** : Activé avec `credentials: true`, origine contrôlée via `ALLOWED_ORIGIN`
- **Helmet** : Headers de sécurité HTTP configurés (CSP stricte, frameAncestors, crossOriginResourcePolicy)
- **Validation des entrées** : Schémas Zod pour auth, messages et commentaires (`src/schemas/`)
- **Rate limiting** : 3 limiteurs distincts (`loginLimiter`, `messagesLimiter`, `commentsLimiter`) — 5 requêtes par IP par tranche de 15 min
- **Upload sécurisé** : Multer avec taille max 20 MB et nommage UUID des fichiers (`src/config/multer.ts`)
- **Exclusion des mots de passe** : Les mots de passe ne sont jamais retournés dans les réponses API

## 📝 Scripts disponibles

```bash
# Démarrage en mode développement (avec hot reload)
npm run dev

# Initialiser la base de données (création du schéma + injection des données de test)
npm run db:init
```

## 👤 Auteur

**MattiaFR**

- GitHub : [@Mattia-FR](https://github.com/Mattia-FR)
- Dépôt Backend : [SariBlogBack](https://github.com/Mattia-FR/SariBlogBack)
- Dépôt Frontend : [SariBlogFront](https://github.com/Mattia-FR/SariBlogFront)

## 📄 Licence

Ce projet est sous licence ISC.
