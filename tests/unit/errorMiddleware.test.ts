import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { errorHandler } from "../../src/middleware/errorMiddleware";
import { HttpError } from "../../src/utils/httpErrors";
import logger from "../../src/utils/logger";

// Je remplace le logger pour vérifier la journalisation sans polluer la sortie des tests.
vi.mock("../../src/utils/logger", () => ({
	default: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

// Fabrique un couple req/res minimal : res.status() et res.json() sont chaînables et espionnés.
function setup(headersSent = false, requestId?: string) {
	const req = {
		method: "GET",
		originalUrl: "/api/test",
		...(requestId !== undefined ? { requestId } : {}),
	} as Request;
	const res = {
		headersSent,
		status: vi.fn().mockReturnThis(),
		json: vi.fn().mockReturnThis(),
	} as unknown as Response;
	const next = vi.fn() as NextFunction;
	return { req, res, next };
}

function run(err: unknown, requestId?: string) {
	const { req, res, next } = setup(false, requestId);
	errorHandler(err, req, res, next);
	return {
		status: vi.mocked(res.status).mock.calls[0]?.[0],
		body: vi.mocked(res.json).mock.calls[0]?.[0],
	};
}

describe("errorHandler", () => {
	it("traduit une HttpError avec son statut, son message et son code", () => {
		const { status, body } = run(
			new HttpError(409, "Slug déjà pris", "ARTICLE_SLUG_TAKEN"),
		);
		expect(status).toBe(409);
		expect(body).toEqual({
			error: "Slug déjà pris",
			code: "ARTICLE_SLUG_TAKEN",
		});
	});

	it("déduit le code d'une HttpError à partir du statut", () => {
		expect(run(new HttpError(404, "Absent")).body).toEqual({
			error: "Absent",
			code: "NOT_FOUND",
		});
	});

	it("renvoie 400 VALIDATION_ERROR avec les détails Zod", () => {
		const result = z.object({ name: z.string() }).safeParse({});
		const { status, body } = run(result.error);
		expect(status).toBe(400);
		expect(body.code).toBe("VALIDATION_ERROR");
		expect(body.details[0].path).toEqual(["name"]);
	});

	it("renvoie 400 INVALID_JSON pour un corps JSON mal formé", () => {
		const err = Object.assign(new SyntaxError("Unexpected token"), {
			type: "entity.parse.failed",
		});
		expect(run(err)).toEqual({
			status: 400,
			body: { error: "JSON invalide", code: "INVALID_JSON" },
		});
	});

	it("traduit les limites Multer", () => {
		expect(run({ code: "LIMIT_FILE_SIZE" })).toEqual({
			status: 400,
			body: { error: "Fichier trop volumineux", code: "FILE_TOO_LARGE" },
		});
	});

	it("traduit une clé étrangère MySQL manquante en 400 INVALID_REFERENCE", () => {
		const { status, body } = run({ code: "ER_NO_REFERENCED_ROW_2" });
		expect(status).toBe(400);
		expect(body.code).toBe("INVALID_REFERENCE");
	});

	it("traduit une ligne encore référencée en 409", () => {
		expect(run({ code: "ER_ROW_IS_REFERENCED_2" }).status).toBe(409);
	});

	it("renvoie 500 générique sans exposer le message interne", () => {
		const { status, body } = run(new Error("Connexion MySQL perdue : mdp=xyz"));
		expect(status).toBe(500);
		expect(body).toEqual({ error: "Erreur serveur", code: "INTERNAL_ERROR" });
		expect(JSON.stringify(body)).not.toContain("mdp");
	});

	it("journalise les 5xx en error et les 4xx en warn", () => {
		run(new Error("boom"));
		expect(logger.error).toHaveBeenCalledTimes(1);
		run(new HttpError(404, "Absent"));
		expect(logger.warn).toHaveBeenCalledTimes(1);
	});

	it("préfixe les logs avec le requestId quand il est présent", () => {
		const rid = "11111111-2222-4333-8444-555555555555";
		run(new Error("boom"), rid);
		expect(logger.error).toHaveBeenCalledWith(
			`[${rid}] GET /api/test → 500`,
			expect.any(Error),
		);
		run(new HttpError(404, "Absent"), rid);
		expect(logger.warn).toHaveBeenCalledWith(
			`[${rid}] GET /api/test → 404 NOT_FOUND: Absent`,
		);
	});

	it("délègue à Express si les en-têtes sont déjà envoyés", () => {
		const { req, res, next } = setup(true);
		const err = new Error("trop tard");
		errorHandler(err, req, res, next);
		expect(next).toHaveBeenCalledWith(err);
		expect(res.status).not.toHaveBeenCalled();
	});
});
