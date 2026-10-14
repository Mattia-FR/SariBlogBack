import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { requestId } from "../../src/middleware/requestIdMiddleware";

describe("requestId", () => {
	it("pose req.requestId, envoie le header X-Request-Id et appelle next()", () => {
		const req = {} as Request;
		const res = {
			setHeader: vi.fn(),
		} as unknown as Response;
		const next = vi.fn() as NextFunction;

		requestId(req, res, next);

		expect(req.requestId).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
		);
		expect(res.setHeader).toHaveBeenCalledWith("X-Request-Id", req.requestId);
		expect(next).toHaveBeenCalledWith();
	});
});
