import { describe, expect, it } from "vitest";
import { HttpError } from "../../src/utils/httpErrors";
import {
	parseIdList,
	parseIdParam,
	parseOptionalIdQuery,
	parsePaginationParams,
} from "../../src/utils/requestParams";

// Vérifie qu'un appel lève bien une HttpError 400 (et pas une erreur générique → 500).
function expectBadRequest(fn: () => unknown) {
	try {
		fn();
	} catch (err) {
		expect(err).toBeInstanceOf(HttpError);
		expect((err as HttpError).statusCode).toBe(400);
		return;
	}
	throw new Error("Une HttpError 400 était attendue");
}

describe("parseIdParam", () => {
	it("accepte un entier positif", () => {
		expect(parseIdParam("42")).toBe(42);
	});

	it.each(["abc", "0", "-3", ""])("refuse %j en 400", (value) => {
		expectBadRequest(() => parseIdParam(value));
	});
});

describe("parseOptionalIdQuery", () => {
	it("renvoie undefined si absent ou vide", () => {
		expect(parseOptionalIdQuery(undefined, "tagId")).toBeUndefined();
		expect(parseOptionalIdQuery("", "tagId")).toBeUndefined();
	});

	it("refuse une valeur invalide", () => {
		expectBadRequest(() => parseOptionalIdQuery("x", "tagId"));
	});
});

describe("parsePaginationParams", () => {
	it("applique les valeurs par défaut", () => {
		expect(parsePaginationParams({})).toEqual({ page: 1, limit: 10 });
		expect(parsePaginationParams({}, 9)).toEqual({ page: 1, limit: 9 });
	});

	it("lit page et limit", () => {
		expect(parsePaginationParams({ page: "3", limit: "20" })).toEqual({
			page: 3,
			limit: 20,
		});
	});

	it("refuse une page négative et une limite hors bornes", () => {
		expectBadRequest(() => parsePaginationParams({ page: "-1" }));
		expectBadRequest(() => parsePaginationParams({ limit: "21" }));
	});
});

describe("parseIdList", () => {
	it("convertit et déduplique", () => {
		expect(parseIdList(["1", 2, 2, "1"])).toEqual([1, 2]);
	});

	it("refuse une valeur qui n'est pas une liste ou un identifiant invalide", () => {
		expectBadRequest(() => parseIdList("1,2"));
		expectBadRequest(() => parseIdList([1, "abc"]));
	});
});
