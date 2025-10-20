const jwt = require("jsonwebtoken");
const authController = require("../../../src/controller/authController");
const userModel = require("../../../src/model/userModel");

// Mock du modèle utilisateur
jest.mock("../../../src/model/userModel");

describe("AuthController", () => {
	let req, res;

	beforeEach(() => {
		req = {
			body: {},
			user: null,
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
			success: jest.fn(),
			error: jest.fn(),
		};
		jest.clearAllMocks();
	});

	describe("login", () => {
		it("devrait connecter un utilisateur avec des identifiants valides", async () => {
			const mockUser = {
				id: 1,
				username: "testuser",
				email: "test@test.com",
				password_hash: "hashed_password",
				role: "admin",
				is_active: true,
				last_login: null,
				created_at: "2024-01-01T00:00:00.000Z",
			};

			req.body = {
				email: "test@test.com",
				password: "password123",
			};

			userModel.findByEmail.mockResolvedValue(mockUser);
			userModel.verifyPassword.mockResolvedValue(true);
			userModel.updateLastLogin.mockResolvedValue();

			await authController.login(req, res);

			expect(userModel.findByEmail).toHaveBeenCalledWith("test@test.com");
			expect(userModel.verifyPassword).toHaveBeenCalledWith(
				"password123",
				"hashed_password",
			);
			expect(userModel.updateLastLogin).toHaveBeenCalledWith(1);
			expect(res.success).toHaveBeenCalledWith(
				{
					user: {
						id: 1,
						username: "testuser",
						email: "test@test.com",
						role: "admin",
						is_active: true,
						last_login: null,
						created_at: "2024-01-01T00:00:00.000Z",
					},
					token: expect.any(String),
				},
				"Connexion réussie",
			);
		});

		it("devrait rejeter la connexion avec un email inexistant", async () => {
			req.body = {
				email: "nonexistent@test.com",
				password: "password123",
			};

			userModel.findByEmail.mockResolvedValue(null);

			await authController.login(req, res);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "INVALID_CREDENTIALS",
					message: "Email ou mot de passe incorrect",
				},
			});
		});

		it("devrait rejeter la connexion avec un mot de passe incorrect", async () => {
			const mockUser = {
				id: 1,
				username: "testuser",
				email: "test@test.com",
				password_hash: "hashed_password",
				role: "admin",
				is_active: true,
				last_login: null,
				created_at: "2024-01-01T00:00:00.000Z",
			};

			req.body = {
				email: "test@test.com",
				password: "wrongpassword",
			};

			userModel.findByEmail.mockResolvedValue(mockUser);
			userModel.verifyPassword.mockResolvedValue(false);

			await authController.login(req, res);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "INVALID_CREDENTIALS",
					message: "Email ou mot de passe incorrect",
				},
			});
		});

		it("devrait gérer les erreurs de connexion", async () => {
			req.body = {
				email: "test@test.com",
				password: "password123",
			};

			userModel.findByEmail.mockRejectedValue(new Error("Database error"));

			await authController.login(req, res);

			expect(res.error).toHaveBeenCalledWith(
				"Erreur lors de la connexion",
				500,
			);
		});
	});

	describe("verifyToken", () => {
		it("devrait vérifier un token valide", async () => {
			const mockUser = {
				id: 1,
				username: "testuser",
				email: "test@test.com",
				password_hash: "hashed_password",
				role: "admin",
				is_active: true,
				last_login: null,
				created_at: "2024-01-01T00:00:00.000Z",
			};

			req.user = mockUser;

			await authController.verifyToken(req, res);

			expect(res.success).toHaveBeenCalledWith(
				{
					user: {
						id: 1,
						username: "testuser",
						email: "test@test.com",
						role: "admin",
						is_active: true,
						last_login: null,
						created_at: "2024-01-01T00:00:00.000Z",
					},
				},
				"Token valide",
			);
		});

		it("devrait gérer les erreurs de vérification", async () => {
			req.user = null;

			await authController.verifyToken(req, res);

			expect(res.error).toHaveBeenCalledWith(
				"Erreur lors de la vérification du token",
				500,
			);
		});
	});

	describe("logout", () => {
		it("devrait permettre la déconnexion", async () => {
			await authController.logout(req, res);

			expect(res.success).toHaveBeenCalledWith(null, "Déconnexion réussie");
		});

		it("devrait gérer les erreurs de déconnexion", async () => {
			// Simuler une erreur
			res.success.mockImplementation(() => {
				throw new Error("Logout error");
			});

			await authController.logout(req, res);

			expect(res.error).toHaveBeenCalledWith(
				"Erreur lors de la déconnexion",
				500,
			);
		});
	});
});
