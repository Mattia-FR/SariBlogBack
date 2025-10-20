// Configuration globale pour les tests
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.DB_HOST = "localhost";
process.env.DB_USER = "test_user";
process.env.DB_PASSWORD = "test_password";
process.env.DB_NAME = "sari_blog_test";

// Mock de la base de données pour les tests unitaires
jest.mock("../src/model/db", () => ({
	execute: jest.fn(),
}));

// Mock d'argon2
jest.mock('argon2', () => ({
	hash: jest.fn().mockResolvedValue('mocked-hash'),
	verify: jest.fn().mockResolvedValue(true),
}));

// Mock des modèles
jest.mock('../src/model/userModel', () => ({
	findByEmail: jest.fn(),
	findById: jest.fn(),
	verifyPassword: jest.fn(),
	updateLastLogin: jest.fn(),
}));
