const jwt = require("jsonwebtoken");
const {
	authenticateToken,
	requireRole,
} = require("../../../src/middleware/auth");
const userModel = require("../../../src/model/userModel");

// Mock du modèle utilisateur
jest.mock("../../../src/model/userModel");

describe("Middleware d'authentification", () => {
	let req;
	let res;
	let next;

	beforeEach(() => {
		req = {
			headers: {},
			user: null,
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
		next = jest.fn();
		jest.clearAllMocks();
	});

	describe("authenticateToken", () => {
		it("devrait rejeter une requête sans token", async () => {
			await authenticateToken(req, res, next);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "NO_TOKEN",
					message: "Token d'accès requis",
				},
			});
			expect(next).not.toHaveBeenCalled();
		});

		it("devrait rejeter un token invalide", async () => {
			req.headers.authorization = "Bearer invalid-token";

			await authenticateToken(req, res, next);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "INVALID_TOKEN",
					message: "Token invalide",
				},
			});
		});

		it("devrait accepter un token valide", async () => {
			const token = jwt.sign(
				{ userId: 1, email: "test@test.com", role: "admin" },
				process.env.JWT_SECRET,
			);
			req.headers.authorization = `Bearer ${token}`;

			// Mock de l'utilisateur trouvé
			userModel.findById.mockResolvedValue({
				id: 1,
				email: "test@test.com",
				role: "admin",
			});

			await authenticateToken(req, res, next);

			expect(req.user).toBeDefined();
			expect(req.user.id).toBe(1);
			expect(next).toHaveBeenCalled();
		});
	});

	describe("requireRole", () => {
		it("devrait rejeter un utilisateur sans rôle admin", () => {
			req.user = { role: "editor" };
			const middleware = requireRole(["admin"]);

			middleware(req, res, next);

			expect(res.status).toHaveBeenCalledWith(403);
			expect(res.json).toHaveBeenCalledWith({
				success: false,
				error: {
					code: "INSUFFICIENT_PERMISSIONS",
					message: "Permissions insuffisantes",
				},
			});
		});

		it("devrait accepter un utilisateur avec le bon rôle", () => {
			req.user = { role: "admin" };
			const middleware = requireRole(["admin"]);

			middleware(req, res, next);

			expect(next).toHaveBeenCalled();
		});
	});
});
