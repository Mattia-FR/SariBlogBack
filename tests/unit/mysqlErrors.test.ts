import { describe, expect, it } from "vitest";
import {
	duplicateKeyName,
	isDuplicateEntry,
	isMissingReference,
	isRowStillReferenced,
} from "../../src/utils/mysqlErrors";

// Forme d'une erreur mysql2 : seul `code` est utilisé pour la détection.
function mysqlError(code: string, sqlMessage = "") {
	return Object.assign(new Error(sqlMessage), { code, sqlMessage });
}

describe("mysqlErrors", () => {
	it("détecte un doublon par son code, pas par le texte", () => {
		expect(isDuplicateEntry(mysqlError("ER_DUP_ENTRY"))).toBe(true);
		expect(isDuplicateEntry(new Error("Duplicate entry 'x'"))).toBe(false);
	});

	it("détecte une clé étrangère manquante", () => {
		expect(isMissingReference(mysqlError("ER_NO_REFERENCED_ROW_2"))).toBe(true);
		expect(isMissingReference(mysqlError("ER_DUP_ENTRY"))).toBe(false);
	});

	it("détecte une ligne encore référencée", () => {
		expect(isRowStillReferenced(mysqlError("ER_ROW_IS_REFERENCED_2"))).toBe(
			true,
		);
	});

	it("ignore les valeurs qui ne sont pas des erreurs", () => {
		expect(isDuplicateEntry(null)).toBe(false);
		expect(isDuplicateEntry("ER_DUP_ENTRY")).toBe(false);
	});

	it("extrait le nom de la contrainte UNIQUE violée", () => {
		const err = mysqlError(
			"ER_DUP_ENTRY",
			"Duplicate entry 'abc' for key 'articles.uk_articles_slug'",
		);
		expect(duplicateKeyName(err)).toBe("uk_articles_slug");
	});
});
