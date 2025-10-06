const request = require("supertest");
const app = require("../../src/app");
const articlesModel = require("../../src/model/articlesModel");
const jwt = require("jsonwebtoken");

// Mock du modèle articles
jest.mock("../../src/model/articlesModel");

describe("Intégration - Articles", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("GET /api/articles/latest", () => {
		it("devrait retourner les derniers articles publiés", async () => {
			const mockArticles = [
				{
					id: 1,
					title: "Article 1",
					slug: "article-1",
					excerpt: "Extrait 1",
					content: "Contenu 1",
					image: "image1.jpg",
					status: "published",
					created_at: "2024-01-01T00:00:00.000Z",
					updated_at: "2024-01-01T00:00:00.000Z",
				},
				{
					id: 2,
					title: "Article 2",
					slug: "article-2",
					excerpt: "Extrait 2",
					content: "Contenu 2",
					image: "image2.jpg",
					status: "published",
					created_at: "2024-01-02T00:00:00.000Z",
					updated_at: "2024-01-02T00:00:00.000Z",
				},
			];

			articlesModel.findLatestPublished.mockResolvedValue(mockArticles);

			const response = await request(app)
				.get("/api/articles/latest")
				.query({ limit: 2 });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.articles).toEqual(mockArticles);
			expect(articlesModel.findLatestPublished).toHaveBeenCalledWith("2");
		});

		it("devrait utiliser une limite par défaut", async () => {
			articlesModel.findLatestPublished.mockResolvedValue([]);

			await request(app).get("/api/articles/latest");

			expect(articlesModel.findLatestPublished).toHaveBeenCalledWith(
				undefined,
			);
		});
	});

	describe("GET /api/articles", () => {
		it("devrait retourner les articles avec pagination", async () => {
			const mockArticles = [
				{
					id: 1,
					title: "Article 1",
					slug: "article-1",
					excerpt: "Extrait 1",
					content: "Contenu 1",
					image: "image1.jpg",
					status: "published",
					created_at: "2024-01-01T00:00:00.000Z",
					updated_at: "2024-01-01T00:00:00.000Z",
				},
			];

			articlesModel.findAllPublished.mockResolvedValue(mockArticles);
			articlesModel.countPublished.mockResolvedValue(1);

			const response = await request(app)
				.get("/api/articles")
				.query({ limit: 10, offset: 0 });

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.articles).toEqual(mockArticles);
			expect(response.body.data.pagination).toEqual({
				limit: "10",
				offset: "0",
				totalCount: 1,
				totalPages: 1,
			});
		});
	});

	describe("GET /api/articles/:slug", () => {
		it("devrait retourner un article par slug", async () => {
			const mockArticle = {
				id: 1,
				title: "Article 1",
				slug: "article-1",
				excerpt: "Extrait 1",
				content: "Contenu 1",
				image: "image1.jpg",
				status: "published",
				created_at: "2024-01-01T00:00:00.000Z",
				updated_at: "2024-01-01T00:00:00.000Z",
			};

			articlesModel.findBySlug.mockResolvedValue(mockArticle);

			const response = await request(app).get("/api/articles/article-1");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data.article).toEqual(mockArticle);
			expect(articlesModel.findBySlug).toHaveBeenCalledWith("article-1");
		});

		it("devrait retourner 404 pour un article inexistant", async () => {
			articlesModel.findBySlug.mockResolvedValue(null);

			const response = await request(app).get("/api/articles/inexistant");

			expect(response.status).toBe(404);
			expect(response.body.success).toBe(false);
			expect(response.body.error.message).toBe("Article non trouvé");
		});
	});

	describe("Routes protégées - Admin", () => {
		let validToken;

		beforeEach(() => {
			// Générer un token valide pour les tests admin
			validToken = jwt.sign(
				{ userId: 1, email: "admin@test.com", role: "admin" },
				process.env.JWT_SECRET,
				{ expiresIn: "24h" },
			);
		});

		describe("GET /api/admin/articles", () => {
			it("devrait retourner les articles pour un admin", async () => {
				const mockArticles = [
					{
						id: 1,
						title: "Article 1",
						slug: "article-1",
						status: "published",
						created_at: "2024-01-01T00:00:00.000Z",
					},
				];

				// Mock du middleware d'authentification
				const userModel = require("../../src/model/userModel");
				userModel.findById.mockResolvedValue({
					id: 1,
					email: "admin@test.com",
					role: "admin",
				});

				// Mock du modèle articles
				articlesModel.findAll.mockResolvedValue(mockArticles);
				articlesModel.countAll.mockResolvedValue(1);

				const response = await request(app)
					.get("/api/admin/articles")
					.set("Authorization", `Bearer ${validToken}`)
					.query({ limit: 10, offset: 0 });

				expect(response.status).toBe(200);
				expect(response.body.success).toBe(true);
			});

			it("devrait rejeter l'accès sans token", async () => {
				const response = await request(app).get("/api/admin/articles");

				expect(response.status).toBe(401);
				expect(response.body.success).toBe(false);
				expect(response.body.error.code).toBe("NO_TOKEN");
			});

			it("devrait rejeter l'accès avec un rôle insuffisant", async () => {
				// Token avec rôle editor
				const editorToken = jwt.sign(
					{ userId: 2, email: "editor@test.com", role: "editor" },
					process.env.JWT_SECRET,
					{ expiresIn: "24h" },
				);

				const userModel = require("../../src/model/userModel");
				userModel.findById.mockResolvedValue({
					id: 2,
					email: "editor@test.com",
					role: "editor",
				});

				const response = await request(app)
					.get("/api/admin/articles")
					.set("Authorization", `Bearer ${editorToken}`);

				expect(response.status).toBe(403);
				expect(response.body.success).toBe(false);
				expect(response.body.error.code).toBe("INSUFFICIENT_PERMISSIONS");
			});
		});
	});
});
