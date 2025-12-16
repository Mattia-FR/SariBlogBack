# Sariblog Backend API

API REST pour un blog/portfolio CMS destiné à une illustratrice. Gestion d'articles, images (galerie), tags multi-catégories, commentaires et utilisateurs.

> 🚧 **En développement actif** - Sprint 01 : `s01/feature_articles_model`  
> 📦 **Repository GitHub** : `git@github.com:Mattia-FR/SariBlogBack.git`

---

## 📊 État du projet

### Fonctionnalités disponibles

- ✅ **Consultation des articles publiés** (6 endpoints dont preview homepage)
- ✅ **Galerie d'images avec filtrage par tags** (4 endpoints)
- ✅ **Système de tags multi-catégories** (3 endpoints)
- ✅ **Commentaires approuvés sur articles** (1 endpoint)
- ✅ **Profils utilisateurs publics** (2 endpoints)
- ❌ **Formulaire de contact** (modèle Messages non implémenté)
- ❌ **Authentification JWT** (non implémenté)
- ❌ **CRUD admin complet** (non implémenté)

### Progression

| Module | Lecture | Écriture | Routes |
|--------|---------|----------|--------|
| Articles | ✅ 6 fonctions | ❌ | ✅ 6 routes |
| Images | ✅ 5 fonctions | ❌ | ✅ 4 routes |
| Users | ✅ 7 fonctions (CRUD complet) | ✅ | ⚠️ 2 routes publiques |
| Tags | ✅ 3 fonctions | ❌ | ✅ 3 routes |
| Comments | ✅ 1 fonction | ❌ | ✅ 1 route |
| Messages | ❌ | ❌ | ❌ |

**Total : 16 endpoints publics disponibles**

---

## 🛠️ Technologies

- **Runtime** : Node.js + TypeScript (CommonJS)
- **Framework** : Express 5.1.0
- **Base de données** : MySQL (via mysql2/promise avec pool)
- **Sécurité** : Argon2 (hashing des mots de passe)
- **Validation** : Zod 4.1.12 (installé, non encore utilisé)
- **CORS** : cors 2.8.5 (activé)
- **Dev** : Nodemon + ts-node

---

## 📁 Architecture du projet

```
Back/
├── src/
│   ├── app.ts              # Configuration Express (CORS, JSON, static files)
│   ├── controller/         # 5 contrôleurs (16 handlers)
│   │   ├── articlesController.ts   (6 handlers)
│   │   ├── imagesController.ts     (4 handlers)
│   │   ├── usersController.ts      (2 handlers)
│   │   ├── tagsController.ts       (3 handlers)
│   │   └── commentsController.ts   (1 handler)
│   ├── model/              # Modèles DB (lecture seule sauf Users)
│   │   ├── db.ts                   (Pool MySQL)
│   │   ├── articlesModel.ts        (6 fonctions)
│   │   ├── imagesModel.ts          (5 fonctions)
│   │   ├── usersModel.ts           (7 fonctions CRUD)
│   │   ├── tagsModel.ts            (3 fonctions)
│   │   └── commentsModel.ts        (1 fonction)
│   ├── router/             # Routers Express
│   │   ├── index.ts                (Router principal avec préfixe /api)
│   │   ├── articlesRouter.ts       (6 routes)
│   │   ├── imagesRouter.ts         (4 routes)
│   │   ├── usersRouter.ts          (2 routes)
│   │   ├── tagsRouter.ts           (3 routes)
│   │   └── commentsRouter.ts       (1 route)
│   ├── types/              # Définitions TypeScript
│   │   ├── articles.ts
│   │   ├── images.ts
│   │   ├── users.ts
│   │   ├── tags.ts
│   │   └── comments.ts
│   └── middleware/         # ⚠️ Vide (auth à implémenter)
├── uploads/images/         # Fichiers uploadés (servis statiquement)
├── tests/
│   └── api.http            # Tests REST Client (très complet)
├── database.sql            # Schéma complet + données sample
├── generate-argon2-hashes.ts  # Utilitaire hashage
├── migrate-sample.ts       # Utilitaire migration
├── index.ts                # Point d'entrée (port 4242)
├── package.json
└── tsconfig.json
```

---

## 🗄️ Base de données

### Structure

**8 tables** avec relations (foreign keys) :
- `users` - Utilisateurs (7 sample)
- `articles` - Articles de blog (10 sample)
- `images` - Galerie d'images (14 sample)
- `tags` - Tags multi-catégories (10 sample)
- `comments` - Commentaires sur articles (10 sample)
- `messages` - Messages de contact (10 sample)
- `articles_tags` - Relation N-N articles ↔ tags
- `images_tags` - Relation N-N images ↔ tags

### Caractéristiques

- **Statuts d'articles** : `draft`, `published`, `archived`
- **Rôles utilisateurs** : `admin`, `editor`, `subscriber`
- **Statuts de commentaires** : `pending`, `approved`, `rejected`, `spam`
- **Données de test** : Utilisateurs, articles publiés, images, commentaires approuvés

---

## 🚀 Installation

### Prérequis

- Node.js (version 18+)
- MySQL ou MariaDB
- npm ou pnpm

### Installation

```bash
# Installation des dépendances
npm install
```

### Configuration

Créer un fichier `.env` à la racine du dossier `Back/` :

```env
PORT=4242
DB_HOST=localhost
DB_USER=votre_utilisateur
DB_PASSWORD=votre_mot_de_passe
DB_NAME=sariblog
DB_PORT=3306
```

> ⚠️ **Important** : Les variables `DB_HOST`, `DB_USER`, `DB_PASSWORD` et `DB_NAME` sont **obligatoires**. Le serveur refusera de démarrer si elles sont manquantes.

### Import de la base de données

```bash
# Créer la base de données
mysql -u votre_utilisateur -p -e "CREATE DATABASE sariblog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importer le schéma et les données de test
mysql -u votre_utilisateur -p sariblog < database.sql
```

Le fichier `database.sql` contient :
- Le schéma complet (8 tables)
- Les données de test (7 users, 10 articles, 14 images, 10 tags, etc.)
- Les relations entre tables

### Démarrage

```bash
# Mode développement (avec Nodemon + ts-node)
npm run dev
```

Le serveur démarre sur **http://localhost:4242**

---

## 📡 API Endpoints

**Base URL** : `http://localhost:4242/api`

### Articles (`/api/articles`) - 6 endpoints

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/articles/homepage-preview` | 4 derniers articles pour homepage (enrichis avec images et tags) | Public |
| `GET` | `/articles/published` | Liste des articles publiés (avec param `?limit=N`, max 20) | Public |
| `GET` | `/articles/published/:slug` | Article publié par slug (avec content) | Public |
| `GET` | `/articles` | Liste tous les articles (tous statuts, sans content) | Admin |
| `GET` | `/articles/:id` | Article par ID (tous statuts, avec content) | Admin |
| `GET` | `/articles/slug/:slug` | Article par slug (tous statuts, avec content) | Admin |

### Images (`/api/images`) - 4 endpoints

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/images/gallery` | Galerie d'images (`is_in_gallery = TRUE`) | Public |
| `GET` | `/images/:id` | Image par ID | Public |
| `GET` | `/images/article/:articleId` | Images associées à un article | Public |
| `GET` | `/images/tag/:tagId` | Images filtrées par tag | Public |

### Users (`/api/users`) - 2 endpoints

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/users` | Liste tous les utilisateurs (sans password) | Public |
| `GET` | `/users/:id` | Profil utilisateur par ID (sans password) | Public |

### Tags (`/api/tags`) - 3 endpoints

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/tags` | Liste tous les tags | Public |
| `GET` | `/tags/article/:articleId` | Tags associés à un article | Public |
| `GET` | `/tags/image/:imageId` | Tags associés à une image | Public |

### Comments (`/api/comments`) - 1 endpoint

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| `GET` | `/comments/article/:articleId` | Commentaires approuvés d'un article (avec infos utilisateur) | Public |

### Fichiers statiques

| URL | Description |
|-----|-------------|
| `/uploads/images/*` | Fichiers images uploadés |

---

## 🧪 Tests

Le projet inclut un fichier `tests/api.http` avec des tests REST Client pour tous les endpoints disponibles.

### Utilisation avec REST Client (VS Code)

1. Installer l'extension **REST Client** dans VS Code
2. Ouvrir `Back/tests/api.http`
3. Cliquer sur "Send Request" au-dessus de chaque requête

Le fichier contient :
- Tests pour tous les endpoints (16 routes)
- Tests d'erreurs (404, validation)
- Variables globales (`@baseUrl`)

---

## 📝 Scripts disponibles

```bash
# Démarrage en mode développement (avec hot reload)
npm run dev

# Tests (non implémenté)
npm test

# Utilitaires
ts-node generate-argon2-hashes.ts  # Génération de hash Argon2
ts-node migrate-sample.ts          # Migration de données
```

---

## 🔐 Sécurité

- ✅ **Passwords** : Hashés avec Argon2 (algorithme recommandé)
- ✅ **CORS** : Activé pour les requêtes cross-origin
- ✅ **Validation des variables d'environnement** : Le serveur refuse de démarrer si les variables DB sont manquantes
- ❌ **Authentification JWT** : Non implémentée
- ❌ **Validation des données (Zod)** : Installé mais non utilisé
- ❌ **Rate limiting** : Non implémenté
- ❌ **Protection CSRF** : Non implémentée

---

## 📌 Notes importantes

### Stratégie de développement

**Objectif actuel** : Finir la partie publique avant la partie admin

### Modèles en lecture seule

Les modèles `articlesModel`, `imagesModel`, `tagsModel` et `commentsModel` ne contiennent **que des fonctions de lecture**. Seul `usersModel` est complet avec CRUD (7 fonctions).

### TODO / Roadmap

#### À court terme (partie publique)
- [ ] Module Messages (formulaire de contact)
- [ ] Validation avec Zod
- [ ] Gestion d'erreurs centralisée

#### À moyen terme (partie admin)
- [ ] Middleware d'authentification JWT
- [ ] CRUD complet pour articles (create, update, delete)
- [ ] CRUD complet pour images (upload, update, delete)
- [ ] Modération des commentaires
- [ ] Gestion des messages de contact
- [ ] Protection des routes admin

#### À long terme
- [ ] Tests unitaires et d'intégration
- [ ] Logger professionnel (Morgan/Winston)
- [ ] Rate limiting
- [ ] Upload d'images avec validation

### Middleware vide

Le dossier `src/middleware/` existe mais est **vide**. Il contiendra l'authentification JWT plus tard.

### Logging basique

Un middleware de logging très simple est en place (`console.log` des requêtes). Prévu pour être remplacé par Morgan ou Winston.

---

## 👤 Auteur

**MattiaFR**

- GitHub : `git@github.com:Mattia-FR/SariBlogBack.git`
- Branche actuelle : `s01/feature_articles_model`

---

## 📄 Licence

ISC

