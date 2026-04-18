import { describe, it, expect, vi } from "vitest";
import { errorHandler } from "../../src/middleware/errorMiddleware";
import { HttpError } from "../../src/utils/httpErrors";

describe("errorHandler middleware", () => {
	it("répond 400 avec le corps aligné sur sendError quand err est HttpError sans code", () => {
		const err = new HttpError(400, "Aucun champ à mettre à jour");
		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as any;

		errorHandler(err, {} as any, res, vi.fn());

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			error: "Aucun champ à mettre à jour",
		});
	});

	it("répond avec statusCode et code optionnel pour HttpError", () => {
		const err = new HttpError(409, "Conflit", "DUPLICATE");
		const res = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		} as any;

		errorHandler(err, {} as any, res, vi.fn());

		expect(res.status).toHaveBeenCalledWith(409);
		expect(res.json).toHaveBeenCalledWith({
			error: "Conflit",
			code: "DUPLICATE",
		});
	});
});
