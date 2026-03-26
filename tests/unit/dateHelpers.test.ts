import { describe, it, expect } from "vitest";
import { toDateString } from "../../src/utils/dateHelpers";

describe("toDateString", () => {
  it("retourne null pour undefined", () => {
    expect(toDateString(undefined as unknown as Date | string | null)).toBe(
      null,
    );
  });

  it("retourne null pour null", () => {
    expect(toDateString(null)).toBe(null);
  });

  it("retourne null pour chaine vide", () => {
    expect(toDateString("")).toBe(null);
  });

  it("convertit une Date en ISO string", () => {
    const d = new Date("2025-06-15T12:00:00Z");
    expect(toDateString(d)).toBe("2025-06-15T12:00:00.000Z");
  });

  it("conserve une string non vide (pas de validation)", () => {
    expect(toDateString("2025-06-15")).toBe("2025-06-15");
    expect(toDateString("hello")).toBe("hello");
  });
});
