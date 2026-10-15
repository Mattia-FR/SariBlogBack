import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { ZodError, z } from "zod";
import { validate } from "../../src/middleware/validateMiddleware";

const schema = z.object({ name: z.string().trim().min(1) });

describe("validate", () => {
	it("remplace req.body par la donnée parsée et appelle next()", () => {
		const req = { body: { name: "  Alice  " } } as Request;
		const next = vi.fn() as NextFunction;
		validate(schema)(req, {} as Response, next);
		expect(req.body).toEqual({ name: "Alice" });
		expect(next).toHaveBeenCalledWith();
	});

	it("transmet la ZodError à errorHandler via next(err)", () => {
		const req = { body: { name: "" } } as Request;
		const next = vi.fn() as NextFunction;
		validate(schema)(req, {} as Response, next);
		expect(vi.mocked(next).mock.calls[0][0]).toBeInstanceOf(ZodError);
	});
});
