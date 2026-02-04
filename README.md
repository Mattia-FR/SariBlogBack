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
- Découverte de Zod, Helmet, Argon2, Slugify, Cookie-parser

**Fonctionnalités :**
- Articles de blog avec statuts (draft, published, archived)
- Galerie d'images avec système de tags et image du jour
- Commentaires modérés
- Profils utilisateurs (dont artiste principale)
- Système de tags multi-catégories
- Formulaire de contact et gestion des messages

> **Note** : Ce dépôt contient uniquement le backend. Le frontend est disponible dans un [dépôt séparé](https://github.com/Mattia-FR/SariBlogFront).

## ✨ Fonctionnalités

### ✅ Implémentées

- **Articles** : Consultation des articles publiés (4 endpoints publics) + CRUD admin (6 endpoints)
  - Public : preview homepage, liste paginée publiés, par ID, par slug
  - Admin : liste tous statuts, par slug/ID, création, modification, suppression

- **Images** : Galerie d'images avec filtrage (5 endpoints)
  - Galerie publique, image du jour, par tag, par article, par ID

- **Tags** : Système de tags multi-catégories (3 endpoints)
  - Liste complète, tags par article, tags par image

- **Commentaires** : Système de commentaires modérés (1 endpoint)
  - Commentaires approuvés d'un article (avec infos utilisateur)

- **Utilisateurs** : Profils publics (3 endpoints) + profil connecté (1 endpoint)
  - Liste, artiste principale, par ID ; `/users/me` pour l'utilisateur connecté

- **Messages** : Formulaire de contact (1 endpoint public) + gestion admin (5 endpoints)
  - Public : création de message (avec optionalAuth pour lier l'utilisateur si connecté)
  - Admin : liste, par statut, par ID, mise à jour statut, suppression

- **Authentification** : JWT avec refresh (4 endpoints)
  - Login, signup, refresh (cookie), logout

**Total : 33 endpoints (21 publics + auth, 1 authentifié `/users/me`, 11 admin sous `/api/admin`)**

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
│   │   ├── helmet.ts                # Configuration Helmet (sécurité HTTP)
│   │   └── argon2.ts                # Options de hashage Argon2 (OWASP)
│   ├── controller/
│   │   ├── articlesController.ts    # Articles publics (4 handlers)
│   │   ├── imagesController.ts      # Images (5 handlers)
│   │   ├── usersController.ts       # Utilisateurs (4 handlers)
│   │   ├── tagsController.ts        # Tags (3 handlers)
│   │   ├── commentsController.ts    # Commentaires (1 handler)
│   │   ├── messagesController.ts    # Formulaire contact (1 handler)
│   │   ├── authController.ts        # Authentification (login, signup, refresh, logout)
│   │   └── admin/
│   │       ├── articlesAdminController.ts  # CRUD articles (6 handlers)
│   │       └── messagesAdminController.ts  # Gestion messages (5 handlers)
│   ├── model/
│   │   ├── db.ts                    # Pool de connexions MySQL
│   │   ├── articlesModel.ts
│   │   ├── imagesModel.ts
│   │   ├── usersModel.ts
│   │   ├── tagsModel.ts
│   │   ├── commentsModel.ts
│   │   ├── messagesModel.ts
│   │   └── admin/
│   │       └── articlesAdminModel.ts
│   ├── router/
│   │   ├── index.ts                 # Router principal (préfixe /api)
│   │   ├── articlesRouter.ts        # Routes publiques articles
│   │   ├── imagesRouter.ts
│   │   ├── usersRouter.ts
│   │   ├── tagsRouter.ts
│   │   ├── commentsRouter.ts
│   │   ├── messagesRouter.ts
│   │   ├── authRouter.ts            # Auth (login, signup, refresh, logout)
│   │   └── admin/
│   │       ├── index.ts             # Montage sous /api/admin (protégé)
│   │       ├── articlesAdminRouter.ts
│   │       └── messagesAdminRouter.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts        # requireAuth, optionalAuth (JWT)
│   │   └── roleMiddleware.ts        # requireEditor, requireAdmin
│   ├── types/
│   │   ├── articles.ts
│   │   ├── images.ts
│   │   ├── users.ts
│   │   ├── tags.ts
│   │   ├── comments.ts
│   │   ├── messages.ts
│   │   └── auth.ts
│   └── utils/
│       ├── imageUrl.ts
│       └── slug.ts
├── uploads/
│   └── images/                      # Fichiers images (servis statiquement)
├── tests/
│   └── api.http                     # Tests REST Client (VS Code)
├── database.sql                     # Schéma complet + données de test
├── index.ts                         # Point d'entrée (port 4242)
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

# JWT (obligatoire pour l'auth) : générer deux secrets avec :
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
ACCESS_TOKEN_SECRET=une_longue_chaîne_aléatoire_secrète_1
REFRESH_TOKEN_SECRET=une_autre_longue_chaîne_aléatoire_secrète_2
```

> ⚠️ **Important** : Les variables `DB_*` et les deux secrets JWT (`ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`) sont **obligatoires** pour le bon fonctionnement (auth et démarrage).

4. **Créer et importer la base de données**

```bash
# Créer la base de données
mysql -u votre_utilisateur -p -e "CREATE DATABASE sariblog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importer le schéma et les données de test
mysql -u votre_utilisateur -p sariblog < database.sql
```

Le fichier `database.sql` contient :
- Le schéma complet (8 tables avec relations)
- Les données de test (7 utilisateurs, 10 articles, 14 images, 10 tags, etc.)

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
| `POST` | `/auth/signup` | Inscription (username, email, password, firstname, lastname) | Public |
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

#### Messages admin (`/api/admin/messages`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/messages` | Liste tous les messages |
| `GET` | `/admin/messages/status/:status` | Messages par statut (`unread`, `read`, `archived`) |
| `GET` | `/admin/messages/:id` | Message par ID |
| `PATCH` | `/admin/messages/:id/status` | Mettre à jour le statut |
| `DELETE` | `/admin/messages/:id` | Supprimer un message |

### Fichiers statiques

| URL | Description |
|-----|-------------|
| `/uploads/images/*` | Fichiers images uploadés (servis statiquement) |

### Exemples de requêtes

```bash
# Connexion (récupérer l'accessToken pour les routes admin)
curl -X POST http://localhost:4242/api/auth/login -H "Content-Type: application/json" -d "{\"identifier\":\"admin@example.com\",\"password\":\"votre_mot_de_passe\"}"

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

# Récupérer les tags d'un article
curl http://localhost:4242/api/tags/article/1

# Route admin (avec token)
curl -H "Authorization: Bearer VOTRE_ACCESS_TOKEN" http://localhost:4242/api/admin/articles
```

## 🗄️ Base de données

### Structure

**8 tables** avec relations (foreign keys) :

| Table | Description | Relations |
|-------|-------------|-----------|
| `users` | Utilisateurs (7 données de test) | - |
| `articles` | Articles de blog (10 données de test) | `users`, `images` (featured_image) |
| `images` | Galerie d'images (14 données de test) | `users`, `articles` |
| `tags` | Tags multi-catégories (10 données de test) | - |
| `comments` | Commentaires sur articles (10 données de test) | `users`, `articles` |
| `messages` | Messages de contact (10 données de test) | `users` |
| `articles_tags` | Relation N-N articles ↔ tags | `articles`, `tags` |
| `images_tags` | Relation N-N images ↔ tags | `images`, `tags` |

### Caractéristiques

- **Statuts d'articles** : `draft`, `published`, `archived`
- **Rôles utilisateurs** : `admin`, `editor`, `subscriber`
- **Statuts de commentaires** : `pending`, `approved`, `rejected`, `spam`
- **Statuts de messages** : `unread`, `read`, `archived`
- **Encodage** : UTF-8 (utf8mb4_unicode_ci)
- **Moteur** : InnoDB (support des transactions et foreign keys)

### Données de test

Le fichier `database.sql` inclut :
- 7 utilisateurs (1 admin, 1 éditeur, 5 abonnés)
- 10 articles (9 publiés, 1 brouillon)
- 14 images (galerie et illustrations d'articles)
- 10 tags (aquarelle, fantasy, portrait, etc.)
- 10 commentaires (8 approuvés, 1 spam, 1 rejeté)
- 10 messages de contact
- Relations articles-tags et images-tags

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

- **Hashage des mots de passe** : Argon2id (options OWASP dans `src/config/argon2.ts`)
- **Authentification JWT** : Access token (Bearer) + refresh token (cookie HttpOnly) ; secrets en variables d'environnement
- **Rôles** : Middlewares `requireAuth`, `requireEditor`, `requireAdmin` pour protéger les routes admin
- **CORS** : Activé pour les requêtes cross-origin
- **Helmet** : Headers de sécurité HTTP configurés
- **Validation** : Schémas Zod pour les entrées (auth, etc.)
- **Exclusion des mots de passe** : Les mots de passe ne sont jamais retournés dans les réponses API

## 📝 Scripts disponibles

```bash
# Démarrage en mode développement (avec hot reload)
npm run dev
```

## 👤 Auteur

**MattiaFR**

- GitHub : [@Mattia-FR](https://github.com/Mattia-FR)
- Dépôt Backend : [SariBlogBack](https://github.com/Mattia-FR/SariBlogBack)
- Dépôt Frontend : [SariBlogFront](https://github.com/Mattia-FR/SariBlogFront)

## 📄 Licence

Ce projet est sous licence ISC.
