import crypto from "node:crypto";

/** HMAC-SHA256 du refresh JWT — seule l'empreinte est stockée en DB. */
export function hashRefreshToken(token: string): string {
	const secret = process.env.REFRESH_TOKEN_SECRET;
	if (!secret) {
		throw new Error("JWT secrets non définis");
	}
	return crypto.createHmac("sha256", secret).update(token).digest("hex");
}
