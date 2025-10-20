# Tests Backend - SariBlog2

Ce dossier contient tous les tests unitaires et d'intégration pour le backend de SariBlog2.

## Structure des tests

```
tests/
├── setup.js                   # Configuration globale des tests
├── helpers/
│   └── testDb.js             # Utilitaires pour la base de données de test
├── unit/                     # Tests unitaires
│   ├── controllers/          # Tests des contrôleurs
│   ├── models/              # Tests des modèles
│   └── middleware/          # Tests des middlewares
└── integration/             # Tests d'intégration
    ├── auth.test.js         # Tests d'authentification
    └── articles.test.js     # Tests des articles
```

## Configuration

### Jest
Les tests utilisent **Jest** comme framework de test, configuré dans `jest.config.js`.

### Supertest
Pour tester les routes API, nous utilisons **Supertest** qui permet de tester les endpoints HTTP.

### Base de données de test
- Configuration séparée pour les tests
- Nettoyage automatique entre les tests
- Données de test pré-configurées

## Types de tests

### 1. Tests unitaires
- **Modèles** : Testent la logique de base de données
- **Contrôleurs** : Testent la logique métier
- **Middlewares** : Testent l'authentification et la validation

### 2. Tests d'intégration
- **Routes API** : Testent les endpoints complets
- **Authentification** : Testent le cycle complet d'auth
- **Base de données** : Testent les opérations CRUD

## Commandes de test

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch
npm run test:watch

# Lancer les tests avec couverture
npm run test:coverage

# Lancer un test spécifique
npm test -- auth.test.js

# Lancer les tests d'un dossier
npm test -- unit/
```

## Configuration de la base de données

### Variables d'environnement
```bash
# .env.test
NODE_ENV=test
JWT_SECRET=test-secret-key
DB_HOST=localhost
DB_USER=test_user
DB_PASSWORD=test_password
DB_NAME=sari_blog_test
```

### Initialisation
```javascript
// tests/helpers/testDb.js
const { connect, disconnect, cleanDatabase, seedDatabase } = require('./helpers/testDb');

beforeAll(async () => {
  await connect();
  await seedDatabase();
});

afterAll(async () => {
  await disconnect();
});

beforeEach(async () => {
  await cleanDatabase();
});
```

## Bonnes pratiques

### 1. Nommage des tests
```javascript
describe('UserModel', () => {
  describe('create', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      // test
    });
  });
});
```

### 2. Structure des tests
```javascript
describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      success: jest.fn(),
      error: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('devrait connecter un utilisateur', async () => {
    // Arrange
    req.body = { email: 'test@test.com', password: 'password' };
    userModel.findByEmail.mockResolvedValue(mockUser);
    userModel.verifyPassword.mockResolvedValue(true);

    // Act
    await authController.login(req, res);

    // Assert
    expect(res.success).toHaveBeenCalledWith(
      expect.objectContaining({
        user: expect.any(Object),
        token: expect.any(String),
      }),
      'Connexion réussie'
    );
  });
});
```

### 3. Mocks
```javascript
// Mock des modèles
jest.mock('../../src/model/userModel');

// Mock des dépendances externes
jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

// Mock de la base de données
jest.mock('../../src/model/db', () => ({
  execute: jest.fn(),
}));
```

### 4. Tests d'intégration
```javascript
describe('POST /api/auth/login', () => {
  it('devrait permettre la connexion', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@test.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });
});
```

## Exemples de tests

### Test de modèle
```javascript
describe('UserModel', () => {
  it('devrait créer un utilisateur', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123',
      role: 'editor',
    };

    db.execute.mockResolvedValue([{ insertId: 1 }]);

    const result = await userModel.create(userData);

    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO users'),
      ['testuser', 'test@test.com', expect.any(String), 'editor']
    );
    expect(result.id).toBe(1);
  });
});
```

### Test de middleware
```javascript
describe('authenticateToken', () => {
  it('devrait rejeter un token invalide', async () => {
    req.headers.authorization = 'Bearer invalid-token';

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token invalide',
      },
    });
  });
});
```

### Test d'intégration
```javascript
describe('GET /api/articles', () => {
  it('devrait retourner les articles', async () => {
    articlesModel.findAllPublished.mockResolvedValue([mockArticle]);
    articlesModel.countPublished.mockResolvedValue(1);

    const response = await request(app)
      .get('/api/articles')
      .query({ limit: 10, offset: 0 });

    expect(response.status).toBe(200);
    expect(response.body.data.articles).toHaveLength(1);
  });
});
```

## Couverture de code

La couverture de code est configurée pour inclure :
- Tous les fichiers `.js` dans `src/`
- Exclure les fichiers de test
- Exclure les fichiers de configuration

Objectif : **> 80%** de couverture de code.

## Debugging des tests

### 1. Tests qui échouent
```javascript
// Utiliser console.log pour debugger
console.log('Response:', response.body);

// Vérifier les mocks
expect(mockFunction).toHaveBeenCalledWith(expectedArgs);
```

### 2. Base de données
```javascript
// Vérifier l'état de la base de données
const users = await testDb.execute('SELECT * FROM users');
console.log('Users in DB:', users);
```

### 3. Tests d'intégration
```javascript
// Vérifier les headers
expect(response.headers['content-type']).toMatch(/json/);

// Vérifier le statut
expect(response.status).toBe(200);
```

## Sécurité des tests

### 1. Isolation des tests
- Chaque test utilise sa propre base de données
- Nettoyage automatique entre les tests
- Mocks pour éviter les appels externes

### 2. Données de test
- Utiliser des données fictives
- Ne pas utiliser de vraies données de production
- Chiffrer les mots de passe de test

### 3. Variables d'environnement
- Configuration séparée pour les tests
- Secrets de test différents de la production
- Base de données dédiée aux tests
