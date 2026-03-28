import { describe, it, expect, vi } from "vitest";
import { z, ZodError } from "zod";
import { validate } from "../../src/middleware/validateMiddleware";

describe("validate middleware", () => {
  it("parse req.body et appelle next() quand le body est valide", () => {
    const schema = z.object({
      identifier: z.string().trim().min(1),
    });

    const req = {
      body: { identifier: "  hello  " },
    } as any;
    const res = {} as any;
    const next = vi.fn();

    const middleware = validate(schema);
    middleware(req, res, next);

    expect(req.body).toEqual({ identifier: "hello" });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(); // pas d'argument
  });

  it("appelle next(err) avec une ZodError quand le body est invalide", () => {
    const schema = z.object({
      identifier: z.string().trim().min(1),
    });

    const req = {
      body: { identifier: "   " },
    } as any;
    const res = {} as any;
    const next = vi.fn();

    const middleware = validate(schema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ZodError);
  });
});

