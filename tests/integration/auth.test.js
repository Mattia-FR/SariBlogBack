const request = require("supertest");
const app = require("../../src/app");
const userModel = require("../../src/model/userModel");
const db = require("../../src/model/db");

// Mock de la base de données
jest.mock("../../src/model/db");

describe("Intégration - Authentification", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("POST /api/auth/login", () => {
		it("devrait permettre la connexion avec des identifiants valides", async () => {
			const mockUser = {
				id: 1,
				username: "testuser",
				email: "test@test.com",
				password_hash: "$argon2id$v=19$m=65536,t=3,p=4$hash", // Hash argon2 valide
				role: "admin",
				is_active: true,
				last_login: null,
				created_at: "2024-01-01T00:00:00.000Z",
			};

			// Mock de findByEmail
			userModel.findByEmail.mockResolvedValue(mockUser);
			// Mock de verifyPassword
			userModel.verifyPassword.mockResolvedValue(true);
			// Mock de updateLastLogin
			userModel.updateLastLogin.mockResolvedValue();

			const response = await request(app)
				.post("/api/auth/login")
				.send({
					email: "test@test.com",
					password: "password123",
				});

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.user).toEqual({
				id: 1,
				username: "testuser",
				email: "test@test.com",
				role: "admin",
				is_active: true,
				last_login: null,
				created_at: "2024-01-01T00:00:00.000Z",
			});
			expect(response.body.data.token).toBeDefined();
			expect(response.body.message).toBe("Connexion réussie");
		});

		it("devrait rejeter la connexion avec un email inexistant", async () => {
			userModel.findByEmail.mockResolvedValue(null);

			const response = await request(app)
				.post("/api/auth/login")
				.send({
					email: "nonexistent@test.com",
					password: "password123",
				});

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
			expect(response.body.error.message).toBe(
				"Email ou mot de passe incorrect",
			);
		});

		it("devrait rejeter la connexion avec un mot de passe incorrect", async () => {
			const mockUser = {
				id: 1,
				username: "testuser",
				email: "test@test.com",
				password_hash: "$argon2id$v=19$m=65536,t=3,p=4$hash",
				role: "admin",
				is_active: true,
				last_login: null,
				created_at: "2024-01-01T00:00:00.000Z",
			};

			userModel.findByEmail.mockResolvedValue(mockUser);
			userModel.verifyPassword.mockResolvedValue(false);

			const response = await request(app)
				.post("/api/auth/login")
				.send({
					email: "test@test.com",
					password: "wrongpassword",
				});

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
		});

		it("devrait valider les données d'entrée", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({
					email: "invalid-email",
					password: "",
				});

			expect(response.status).toBe(400);
			expect(response.body.success).toBe(false);
		});
	});

	describe("POST /api/auth/verify", () => {
		it("devrait vérifier un token valide", async () => {
			const mockUser = {
				id: 1,
				username: "testuser",
				email: "test@test.com",
				password_hash: "$argon2id$v=19$m=65536,t=3,p=4$hash",
				role: "admin",
				is_active: true,
				last_login: null,
				created_at: "2024-01-01T00:00:00.000Z",
			};

			// Générer un token valide
			const jwt = require("jsonwebtoken");
			const token = jwt.sign(
				{ userId: 1, email: "test@test.com", role: "admin" },
				process.env.JWT_SECRET,
				{ expiresIn: "24h" },
			);

			userModel.findById.mockResolvedValue(mockUser);

			const response = await request(app)
				.post("/api/auth/verify")
				.set("Authorization", `Bearer ${token}`);

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.user).toEqual({
				id: 1,
				username: "testuser",
				email: "test@test.com",
				role: "admin",
				is_active: true,
				last_login: null,
				created_at: "2024-01-01T00:00:00.000Z",
			});
		});

		it("devrait rejeter un token invalide", async () => {
			const response = await request(app)
				.post("/api/auth/verify")
				.set("Authorization", "Bearer invalid-token");

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.error.code).toBe("INVALID_TOKEN");
		});

		it("devrait rejeter une requête sans token", async () => {
			const response = await request(app).post("/api/auth/verify");

			expect(response.status).toBe(401);
			expect(response.body.success).toBe(false);
			expect(response.body.error.code).toBe("NO_TOKEN");
		});
	});

	describe("POST /api/auth/logout", () => {
		it("devrait permettre la déconnexion", async () => {
			const response = await request(app).post("/api/auth/logout");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.message).toBe("Déconnexion réussie");
		});
	});
});
