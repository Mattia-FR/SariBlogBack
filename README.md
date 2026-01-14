# Sariblog Backend API

> API REST pour un blog/portfolio CMS destiné à une illustratrice. Gestion d'articles, images (galerie), tags multi-catégories, commentaires et utilisateurs.

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
- [API Endpoints](#-api-endpoints)
- [Base de données](#-base-de-données)
- [Tests](#-tests)
- [Sécurité](#-sécurité)
- [Contribution](#-contribution)
- [Licence](#-licence)

## 🎯 À propos

**Sariblog Backend** est l'API REST du projet Sariblog, un système de gestion de contenu (CMS) conçu pour une illustratrice. Ce backend fournit tous les endpoints nécessaires pour gérer un blog/portfolio avec :

- Articles de blog avec statuts (draft, published, archived)
- Galerie d'images avec système de tags et image du jour
- Commentaires modérés
- Profils utilisateurs (dont artiste principale)
- Système de tags multi-catégories
- Formulaire de contact et gestion des messages

> **Note** : Ce dépôt contient uniquement le backend. Le frontend est disponible dans un [dépôt séparé](https://github.com/Mattia-FR/SariBlogFront).

## ✨ Fonctionnalités

### ✅ Implémentées

- **Articles** : Consultation des articles publiés (6 endpoints)
  - Preview pour homepage
  - Liste paginée des articles publiés
  - Récupération par slug ou ID
  - Enrichissement avec images et tags

- **Images** : Galerie d'images avec filtrage (5 endpoints)
  - Galerie publique
  - Image du jour
  - Filtrage par tag
  - Images associées aux articles
  - Récupération par ID

- **Tags** : Système de tags multi-catégories (3 endpoints)
  - Liste complète des tags
  - Tags par article
  - Tags par image

- **Commentaires** : Système de commentaires modérés (1 endpoint)
  - Commentaires approuvés uniquement
  - Informations utilisateur incluses

- **Utilisateurs** : Profils publics (3 endpoints)
  - Liste des utilisateurs
  - Profil de l'artiste principale
  - Profil détaillé par ID
  - Mots de passe exclus des réponses

- **Messages** : Formulaire de contact et gestion (6 endpoints)
  - Création de message (public)
  - Liste des messages (admin)
  - Liste par statut (admin)
  - Récupération par ID (admin)
  - Mise à jour du statut (admin)
  - Suppression (admin)

**Total : 24 endpoints disponibles (18 publics, 6 admin)**

## 🛠️ Technologies

| Catégorie | Technologie | Version |
|-----------|-----------|---------|
| **Runtime** | Node.js | 18+ |
| **Language** | TypeScript | 5.7.3 |
| **Framework** | Express | 5.1.0 |
| **Base de données** | MySQL | 8.0+ |
| **Driver DB** | mysql2 | 3.15.3 |
| **Sécurité** | Argon2 | 0.44.0 |
| **Sécurité HTTP** | Helmet | 8.1.0 |
| **CORS** | cors | 2.8.5 |
| **Dev** | Nodemon | 3.1.10 |
| **Dev** | ts-node | 10.9.2 |

## 📁 Architecture

```
Back/
├── src/
│   ├── app.ts                    # Configuration Express (middlewares, CORS, static files)
│   ├── config/
│   │   └── helmet.ts            # Configuration Helmet (sécurité HTTP)
│   ├── controller/              # Contrôleurs (24 handlers)
│   │   ├── articlesController.ts    (6 handlers)
│   │   ├── imagesController.ts      (5 handlers)
│   │   ├── usersController.ts       (3 handlers)
│   │   ├── tagsController.ts        (3 handlers)
│   │   ├── commentsController.ts    (1 handler)
│   │   └── messagesController.ts    (6 handlers)
│   ├── model/                   # Modèles d'accès aux données
│   │   ├── db.ts                # Pool de connexions MySQL
│   │   ├── articlesModel.ts     (6 fonctions - lecture seule)
│   │   ├── imagesModel.ts       (5 fonctions - lecture seule)
│   │   ├── usersModel.ts        (7 fonctions - CRUD complet)
│   │   ├── tagsModel.ts         (3 fonctions - lecture seule)
│   │   ├── commentsModel.ts     (1 fonction - lecture seule)
│   │   └── messagesModel.ts     (6 fonctions - CRUD complet)
│   ├── router/                  # Routers Express
│   │   ├── index.ts             # Router principal (préfixe /api)
│   │   ├── articlesRouter.ts    (6 routes)
│   │   ├── imagesRouter.ts      (5 routes)
│   │   ├── usersRouter.ts       (3 routes)
│   │   ├── tagsRouter.ts        (3 routes)
│   │   ├── commentsRouter.ts    (1 route)
│   │   └── messagesRouter.ts    (6 routes)
│   ├── types/                   # Définitions TypeScript
│   │   ├── articles.ts
│   │   ├── images.ts
│   │   ├── users.ts
│   │   ├── tags.ts
│   │   ├── comments.ts
│   │   └── messages.ts
│   └── middleware/              # Middlewares
├── uploads/
│   └── images/                  # Fichiers images uploadés (servis statiquement)
├── tests/
│   └── api.http                 # Tests REST Client (VS Code)
├── database.sql                 # Schéma complet + données de test
├── generate-argon2-hashes.ts    # Utilitaire de hashage Argon2
├── migrate-sample.ts            # Utilitaire de migration
├── index.ts                     # Point d'entrée (port 4242)
├── package.json
├── tsconfig.json
└── README.md
```

### Principes d'architecture

- **Séparation des responsabilités** : Modèles → Contrôleurs → Routers
- **TypeScript strict** : Typage complet pour la sécurité du code
- **Pool de connexions** : Gestion optimisée des connexions MySQL
- **Structure modulaire** : Un module par entité métier

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

Créez un fichier `.env` à la racine du projet :

```env
PORT=4242
DB_HOST=localhost
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_NAME=sariblog
DB_PORT=3306
```

> ⚠️ **Important** : Les variables `DB_HOST`, `DB_USER`, `DB_PASSWORD` et `DB_NAME` sont **obligatoires**. Le serveur refusera de démarrer si elles sont manquantes.

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

### Articles (`/api/articles`)

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/articles/homepage-preview` | 4 derniers articles publiés (enrichis avec images et tags) | Public |
| `GET` | `/articles/published` | Liste des articles publiés (`?limit=N`, max 20) | Public |
| `GET` | `/articles/published/:slug` | Article publié par slug (avec contenu complet) | Public |
| `GET` | `/articles` | Liste tous les articles (tous statuts, sans contenu) | Admin |
| `GET` | `/articles/:id` | Article par ID (tous statuts, avec contenu) | Admin |
| `GET` | `/articles/slug/:slug` | Article par slug (tous statuts, avec contenu) | Admin |

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
| `POST` | `/messages` | Créer un message via formulaire de contact | Public |
| `GET` | `/messages` | Liste tous les messages | Admin |
| `GET` | `/messages/status/:status` | Liste les messages par statut (`unread`, `read`, `archived`) | Admin |
| `GET` | `/messages/:id` | Récupère un message par ID | Admin |
| `PATCH` | `/messages/:id/status` | Met à jour le statut d'un message | Admin |
| `DELETE` | `/messages/:id` | Supprime un message | Admin |

### Fichiers statiques

| URL | Description |
|-----|-------------|
| `/uploads/images/*` | Fichiers images uploadés (servis statiquement) |

### Exemples de requêtes

```bash
# Récupérer les 4 derniers articles pour la homepage
curl http://localhost:4242/api/articles/homepage-preview

# Récupérer un article publié par slug
curl http://localhost:4242/api/articles/published/decouvrir-aquarelle-guide-debutants

# Récupérer l'image du jour
curl http://localhost:4242/api/images/image-of-the-day

# Récupérer la galerie d'images
curl http://localhost:4242/api/images/gallery

# Récupérer le profil de l'artiste principale
curl http://localhost:4242/api/users/artist

# Récupérer les tags d'un article
curl http://localhost:4242/api/tags/article/1
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
2. Ouvrir `tests/api.http`
3. Cliquer sur "Send Request" au-dessus de chaque requête

Le fichier contient :
- Tests pour tous les endpoints (24 routes)
- Tests d'erreurs (404, validation)
- Variables globales (`@baseUrl`)

### Exemple de test

```http
### Variables
@baseUrl = http://localhost:4242/api

### Récupérer les articles de la homepage
GET {{baseUrl}}/articles/homepage-preview
```

## 🔐 Sécurité

### ✅ Implémenté

- **Hashage des mots de passe** : Argon2id (algorithme recommandé par l'OWASP)
- **CORS** : Activé pour les requêtes cross-origin
- **Helmet** : Headers de sécurité HTTP configurés
- **Validation des variables d'environnement** : Le serveur refuse de démarrer si les variables DB sont manquantes
- **Exclusion des mots de passe** : Les mots de passe ne sont jamais retournés dans les réponses API

## 📝 Scripts disponibles

```bash
# Démarrage en mode développement (avec hot reload)
npm run dev

# Utilitaires
ts-node generate-argon2-hashes.ts  # Génération de hash Argon2
ts-node migrate-sample.ts          # Migration de données
```

## 👤 Auteur

**MattiaFR**

- GitHub : [@Mattia-FR](https://github.com/Mattia-FR)
- Dépôt Backend : [SariBlogBack](https://github.com/Mattia-FR/SariBlogBack)
- Dépôt Frontend : [SariBlogFront](https://github.com/Mattia-FR/SariBlogFront)

## 📄 Licence

Ce projet est sous licence ISC.