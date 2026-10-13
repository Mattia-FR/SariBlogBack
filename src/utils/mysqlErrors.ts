/**
 * Détection des erreurs MySQL par code structuré (mysql2 expose `err.code`),
 * jamais par le texte du message.
 */
type MysqlError = Error & {
	code?: string;
	errno?: number;
	sqlMessage?: string;
};

function hasCode(err: unknown, codes: string[]): err is MysqlError {
	return (
		typeof err === "object" &&
		err !== null &&
		typeof (err as MysqlError).code === "string" &&
		codes.includes((err as MysqlError).code as string)
	);
}

/** Violation d'une contrainte UNIQUE. */
export function isDuplicateEntry(err: unknown): err is MysqlError {
	return hasCode(err, ["ER_DUP_ENTRY"]);
}

/** Insertion / mise à jour vers une ligne parente inexistante. */
export function isMissingReference(err: unknown): err is MysqlError {
	return hasCode(err, ["ER_NO_REFERENCED_ROW_2", "ER_NO_REFERENCED_ROW"]);
}

/** Suppression d'une ligne encore référencée (ON DELETE RESTRICT). */
export function isRowStillReferenced(err: unknown): err is MysqlError {
	return hasCode(err, ["ER_ROW_IS_REFERENCED_2", "ER_ROW_IS_REFERENCED"]);
}

/**
 * Nom de la contrainte UNIQUE violée (ex. "uk_articles_slug").
 * MySQL ne l'expose que dans `sqlMessage` : "... for key 'articles.uk_articles_slug'".
 */
export function duplicateKeyName(err: MysqlError): string | null {
	const match = /for key '(?:[^.']+\.)?([^']+)'/.exec(err.sqlMessage ?? "");
	return match ? match[1] : null;
}
