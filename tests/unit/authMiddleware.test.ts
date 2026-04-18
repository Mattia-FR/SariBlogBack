import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import { requireAuth } from "../../src/middleware/authMiddleware";

function createRes() {
	const json = vi.fn();
	const status = vi.fn(() => ({ json }));
	return { status, json } as any;
}

describe("authMiddleware - requireAuth", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		delete process.env.ACCESS_TOKEN_SECRET;
	});

	afterEach(() => {
		vi.unstubAllEnvs?.();
	});

	it("renvoie 401 si le header Authorization est absent", () => {
		const req = { headers: {} } as any;
		const res = createRes();
		const next = vi.fn();

		requireAuth(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ error: "Non authentifié" });
		expect(next).not.toHaveBeenCalled();
	});

	it('renvoie 401 si le format Authorization n\'est pas "Bearer <token>"', () => {
		const req = { headers: { authorization: "Token abc" } } as any;
		const res = createRes();
		const next = vi.fn();

		requireAuth(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			error: "Format Authorization invalide",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("renvoie 401 si le token Bearer est vide", () => {
		const req = { headers: { authorization: "Bearer " } } as any;
		const res = createRes();
		const next = vi.fn();

		requireAuth(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ error: "Token manquant" });
		expect(next).not.toHaveBeenCalled();
	});

	it("renvoie 500 si ACCESS_TOKEN_SECRET n'est pas défini", () => {
		const req = { headers: { authorization: "Bearer abc" } } as any;
		const res = createRes();
		const next = vi.fn();

		requireAuth(req, res, next);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: "JWT secrets non définis" });
		expect(next).not.toHaveBeenCalled();
	});

	it("renvoie 401 si jwt.verify lève JsonWebTokenError", () => {
		process.env.ACCESS_TOKEN_SECRET = "secret";
		const req = { headers: { authorization: "Bearer abc" } } as any;
		const res = createRes();
		const next = vi.fn();

		vi.spyOn(jwt, "verify").mockImplementation(() => {
			throw new (jwt as any).JsonWebTokenError("invalid token");
		});

		requireAuth(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			error: "Token invalide ou expiré",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("renvoie 401 si jwt.verify lève TokenExpiredError", () => {
		process.env.ACCESS_TOKEN_SECRET = "secret";
		const req = { headers: { authorization: "Bearer abc" } } as any;
		const res = createRes();
		const next = vi.fn();

		vi.spyOn(jwt, "verify").mockImplementation(() => {
			// La signature exacte dépend de la version de jsonwebtoken.
			// On force un minimum compatible avec instanceof.
			throw new (jwt as any).TokenExpiredError("token expired", new Date());
		});

		requireAuth(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({
			error: "Token invalide ou expiré",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("renvoie 401 si le payload ne contient pas userId ou role", () => {
		process.env.ACCESS_TOKEN_SECRET = "secret";
		const req = { headers: { authorization: "Bearer abc" } } as any;
		const res = createRes();
		const next = vi.fn();

		vi.spyOn(jwt, "verify").mockReturnValue({ userId: 1 } as any);

		requireAuth(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ error: "Token invalide" });
		expect(next).not.toHaveBeenCalled();
	});

	it("affecte req.user et appelle next() si le token est valide", () => {
		process.env.ACCESS_TOKEN_SECRET = "secret";
		const req = { headers: { authorization: "Bearer abc" } } as any;
		const res = createRes();
		const next = vi.fn();

		vi.spyOn(jwt, "verify").mockReturnValue({
			userId: 123,
			role: "editor",
		} as any);

		requireAuth(req, res, next);

		expect(req.user).toEqual({ userId: 123, role: "editor" });
		expect(next).toHaveBeenCalledTimes(1);
		expect(res.status).not.toHaveBeenCalled();
	});
});
