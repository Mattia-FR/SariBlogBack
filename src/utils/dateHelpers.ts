// Convertit une Date ou null en ISO string ou null

export function toDateString(value: Date | string | null): string | null {
	if (!value) return null;
	return value instanceof Date ? value.toISOString() : String(value);
}
