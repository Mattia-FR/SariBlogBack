// ========================================
// TYPES PUBLICS pour l'authentification
// ========================================

import type jwt from "jsonwebtoken";

/**
 * Payload des tokens JWT (access et refresh)
 * Contient les informations de l'utilisateur encodées dans le token
 */
export interface TokenPayload extends jwt.JwtPayload {
	userId: number;
	role: string;
}
