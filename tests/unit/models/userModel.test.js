const argon2 = require("argon2");
const userModel = require("../../../src/model/userModel");
const db = require("../../../src/model/db");

// Mock de la base de données
jest.mock("../../../src/model/db");

describe("UserModel", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("create", () => {
		it("devrait créer un nouvel utilisateur avec succès", async () => {
			const userData = {
				username: "testuser",
				email: "test@test.com",
				password: "password123",
				role: "editor",
			};

			// Mock de l'insertion en base
			db.execute.mockResolvedValue([{ insertId: 1 }]);

			const result = await userModel.create(userData);

			expect(db.execute).toHaveBeenCalledWith(
				expect.stringContaining("INSERT INTO users"),
				["testuser", "test@test.com", expect.any(String), "editor"],
			);
			expect(result).toEqual({
				id: 1,
				username: "testuser",
				email: "test@test.com",
				role: "editor",
				created_at: expect.any(String),
			});
		});

		it("devrait utiliser le rôle par défaut 'editor'", async () => {
			const userData = {
				username: "testuser",
				email: "test@test.com",
				password: "password123",
			};

			db.execute.mockResolvedValue([{ insertId: 1 }]);

			await userModel.create(userData);

			expect(db.execute).toHaveBeenCalledWith(
				expect.stringContaining("INSERT INTO users"),
				["testuser", "test@test.com", expect.any(String), "editor"],
			);
		});
	});

	describe("findByEmail", () => {
		it("devrait retourner un utilisateur existant", async () => {
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

			db.execute.mockResolvedValue([[mockUser]]);

			const result = await userModel.findByEmail("test@test.com");

			expect(db.execute).toHaveBeenCalledWith(
				expect.stringContaining("SELECT"),
				["test@test.com"],
			);
			expect(result).toEqual(mockUser);
		});

		it("devrait retourner null si l'utilisateur n'existe pas", async () => {
			db.execute.mockResolvedValue([[]]);

			const result = await userModel.findByEmail("nonexistent@test.com");

			expect(result).toBeNull();
		});
	});

	describe("findById", () => {
		it("devrait retourner un utilisateur par ID", async () => {
			const mockUser = {
				id: 1,
				username: "testuser",
				email: "test@test.com",
				role: "admin",
				is_active: true,
				last_login: null,
				created_at: "2024-01-01T00:00:00.000Z",
			};

			db.execute.mockResolvedValue([[mockUser]]);

			const result = await userModel.findById(1);

			expect(db.execute).toHaveBeenCalledWith(
				expect.stringContaining("SELECT"),
				[1],
			);
			expect(result).toEqual(mockUser);
		});
	});

	describe("verifyPassword", () => {
		it("devrait vérifier un mot de passe correct", async () => {
			const password = "password123";
			const hash = await argon2.hash(password);

			const result = await userModel.verifyPassword(password, hash);

			expect(result).toBe(true);
		});

		it("devrait rejeter un mot de passe incorrect", async () => {
			const password = "password123";
			const wrongPassword = "wrongpassword";
			const hash = await argon2.hash(password);

			const result = await userModel.verifyPassword(wrongPassword, hash);

			expect(result).toBe(false);
		});
	});

	describe("updateLastLogin", () => {
		it("devrait mettre à jour la dernière connexion", async () => {
			db.execute.mockResolvedValue([{ affectedRows: 1 }]);

			await userModel.updateLastLogin(1);

			expect(db.execute).toHaveBeenCalledWith(
				expect.stringContaining("UPDATE users"),
				[1],
			);
		});
	});

	describe("findAll", () => {
		it("devrait retourner une liste d'utilisateurs avec pagination", async () => {
			const mockUsers = [
				{
					id: 1,
					username: "user1",
					email: "user1@test.com",
					role: "admin",
					is_active: true,
					last_login: null,
					created_at: "2024-01-01T00:00:00.000Z",
					updated_at: null,
				},
				{
					id: 2,
					username: "user2",
					email: "user2@test.com",
					role: "editor",
					is_active: true,
					last_login: null,
					created_at: "2024-01-02T00:00:00.000Z",
					updated_at: null,
				},
			];

			db.execute.mockResolvedValue([mockUsers]);

			const result = await userModel.findAll(10, 0);

			expect(db.execute).toHaveBeenCalledWith(
				expect.stringContaining("SELECT"),
			);
			expect(result).toEqual(mockUsers);
		});

		it("devrait utiliser des valeurs par défaut pour limit et offset", async () => {
			db.execute.mockResolvedValue([[]]);

			await userModel.findAll();

			expect(db.execute).toHaveBeenCalledWith(
				expect.stringContaining("LIMIT 10 OFFSET 0"),
			);
		});
	});

	describe("countAll", () => {
		it("devrait compter le nombre total d'utilisateurs", async () => {
			db.execute.mockResolvedValue([[{ total: 5 }]]);

			const result = await userModel.countAll();

			expect(db.execute).toHaveBeenCalledWith(
				"SELECT COUNT(*) as total FROM users",
			);
			expect(result).toBe(5);
		});
	});

	describe("update", () => {
		it("devrait mettre à jour un utilisateur", async () => {
			const updateData = {
				username: "newusername",
				email: "newemail@test.com",
				role: "admin",
				is_active: true,
			};

			const updatedUser = {
				id: 1,
				username: "newusername",
				email: "newemail@test.com",
				role: "admin",
				is_active: true,
				last_login: null,
				created_at: "2024-01-01T00:00:00.000Z",
			};

			db.execute.mockResolvedValue([{ affectedRows: 1 }]);
			// Mock de findById pour le retour
			jest.spyOn(userModel, "findById").mockResolvedValue(updatedUser);

			const result = await userModel.update(1, updateData);

			expect(db.execute).toHaveBeenCalledWith(
				expect.stringContaining("UPDATE users"),
				["newusername", "newemail@test.com", "admin", true, 1],
			);
			expect(result).toEqual(updatedUser);
		});
	});

	describe("deactivate", () => {
		it("devrait désactiver un utilisateur", async () => {
			db.execute.mockResolvedValue([{ affectedRows: 1 }]);

			const result = await userModel.deactivate(1);

			expect(db.execute).toHaveBeenCalledWith(
				expect.stringContaining("UPDATE users"),
				[1],
			);
			expect(result).toEqual({ id: 1, is_active: false });
		});

		it("devrait lever une erreur si l'utilisateur n'existe pas", async () => {
			db.execute.mockResolvedValue([{ affectedRows: 0 }]);

			await expect(userModel.deactivate(999)).rejects.toThrow(
				"Utilisateur non trouvé",
			);
		});
	});

	describe("changePassword", () => {
		it("devrait changer le mot de passe d'un utilisateur", async () => {
			const newPassword = "newpassword123";
			db.execute.mockResolvedValue([{ affectedRows: 1 }]);

			const result = await userModel.changePassword(1, newPassword);

			expect(db.execute).toHaveBeenCalledWith(
				expect.stringContaining("UPDATE users"),
				[expect.any(String), 1], // Le hash du mot de passe
			);
			expect(result).toEqual({ id: 1 });
		});
	});

	describe("getStats", () => {
		it("devrait retourner les statistiques des utilisateurs", async () => {
			const mockStats = {
				total: 10,
				active_count: 8,
				inactive_count: 2,
				admin_count: 2,
				editor_count: 8,
			};

			db.execute.mockResolvedValue([[mockStats]]);

			const result = await userModel.getStats();

			expect(db.execute).toHaveBeenCalledWith(
				expect.stringContaining("SELECT"),
			);
			expect(result).toEqual(mockStats);
		});
	});
});
