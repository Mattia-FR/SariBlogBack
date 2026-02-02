import type jwt from "jsonwebtoken";

export interface TokenPayload extends jwt.JwtPayload {
	userId: number;
	role: string;
}
