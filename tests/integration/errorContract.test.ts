import jwt from "jsonwebtoken";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import app from "../../src/app";

// Tests d'intégration du contrat d'erreur : l'application Express complète est montée,
// seule la base MySQL est simulée (aucune connexion réelle).
// vi.hoisted s'exécute avant les imports : les secrets JWT sont donc définis avant le chargement de l'app.
const { query, ACCESS_SECRET } = vi.hoisted(() => {
	process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
	process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
	return { query: vi.fn(), ACCESS_SECRET: "test-access-secret" };
});

vi.mock("../../src/model/db", () => ({
	default: { query, getConnection: vi.fn() },
	// La transaction exécute directement le callback avec une « connexion » qui délègue à `query`.
	withTransaction: (fn: (c: { query: typeof query }) => unknown) =>
		fn({ query }),
}));

vi.mock("../../src/utils/logger", () => ({
	default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
	morganStream: { write: vi.fn() },
}));

function editorToken() {
	return jwt.sign({ userId: 1, role: "editor" }, ACCESS_SECRET, {
		expiresIn: "5m",
	});
}

describe("Contrat d'erreur de l'API", () => {
	it("renvoie un 404 JSON pour une route /api inconnue", async () => {
		const res = await request(app).get("/api/nexiste-pas");
		expect(res.status).toBe(404);
		expect(res.body).toEqual({
			error: "Route introuvable",
			code: "ROUTE_NOT_FOUND",
		});
	});

	it("renvoie un 401 JSON sur une route admin sans token", async () => {
		const res = await request(app).get("/api/admin/articles");
		expect(res.status).toBe(401);
		expect(res.body.code).toBe("UNAUTHENTICATED");
	});

	it("renvoie un 400 INVALID_JSON pour un corps mal formé", async () => {
		const res = await request(app)
			.post("/api/auth/login")
			.set("Content-Type", "application/json")
			.send('{"identifier": ');
		expect(res.status).toBe(400);
		expect(res.body.code).toBe("INVALID_JSON");
	});

	it("renvoie un 400 VALIDATION_ERROR avec details sur un body invalide", async () => {
		const res = await request(app).post("/api/comments").send({});
		expect(res.status).toBe(400);
		expect(res.body.code).toBe("VALIDATION_ERROR");
		expect(Array.isArray(res.body.details)).toBe(true);
	});

	it("renvoie un 400 sur un paramètre de pagination invalide", async () => {
		const res = await request(app).get("/api/articles/published?limit=50");
		expect(res.status).toBe(400);
		expect(res.body.code).toBe("BAD_REQUEST");
	});

	it("renvoie un 500 générique quand un model lève une erreur inattendue", async () => {
		query.mockRejectedValueOnce(new Error("ECONNREFUSED 127.0.0.1:3306"));
		const res = await request(app).get("/api/categories");
		expect(res.status).toBe(500);
		expect(res.body).toEqual({
			error: "Erreur serveur",
			code: "INTERNAL_ERROR",
		});
	});

	it("traduit un ER_DUP_ENTRY en 409 métier", async () => {
		query.mockRejectedValueOnce(
			Object.assign(new Error("Duplicate entry"), { code: "ER_DUP_ENTRY" }),
		);
		const res = await request(app)
			.post("/api/admin/tags")
			.set("Authorization", `Bearer ${editorToken()}`)
			.send({ name: "Aquarelle" });
		expect(res.status).toBe(409);
		expect(res.body.code).toBe("TAG_TAKEN");
	});

	it("traduit une clé étrangère manquante en 404 sur la création de commentaire", async () => {
		query.mockRejectedValueOnce(
			Object.assign(new Error("FK"), { code: "ER_NO_REFERENCED_ROW_2" }),
		);
		const res = await request(app).post("/api/comments").send({
			article_id: 999,
			text: "Bravo",
			firstname: "Ada",
			lastname: "Lovelace",
			email: "ada@example.com",
		});
		expect(res.status).toBe(404);
		expect(res.body.error).toBe("Article introuvable");
	});
});
