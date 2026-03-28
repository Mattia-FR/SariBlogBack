import { describe, it, expect } from "vitest";
import { buildSlug } from "../../src/utils/slug";

describe("buildSlug", () => {
  const cases: Array<{ input: string; expected: string }> = [
    { input: "Mon premier article", expected: "mon-premier-article" },
    { input: "Été à la plage", expected: "ete-a-la-plage" },
    { input: "Hello World!!!", expected: "hello-world" },
    { input: "", expected: "" },
    { input: "déjà-un-slug", expected: "deja-un-slug" },
    { input: "  espaces   autour  ", expected: "espaces-autour" },
    { input: "article--double--tiret", expected: "article-double-tiret" },
  ];

  for (const { input, expected } of cases) {
    it(`convertit "${input}" en "${expected}"`, () => {
      expect(buildSlug(input)).toBe(expected);
    });
  }

  it("est idempotent sur un slug déjà formé", () => {
    expect(buildSlug("deja-un-slug")).toBe("deja-un-slug");
  });
});

