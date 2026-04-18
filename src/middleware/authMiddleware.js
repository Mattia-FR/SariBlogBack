"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var httpErrors_1 = require("../utils/httpErrors");
var logger_1 = __importDefault(require("../utils/logger"));
function requireAuth(req, res, next) {
    // 1. Lire le token depuis le header Authorization
    var authHeader = req.headers.authorization;
    if (!authHeader) {
        return (0, httpErrors_1.sendError)(res, 401, "Non authentifié");
    }
    // Format attendu : "Bearer <token>"
    var parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return (0, httpErrors_1.sendError)(res, 401, "Format Authorization invalide");
    }
    var token = parts[1];
    if (!token) {
        return (0, httpErrors_1.sendError)(res, 401, "Token manquant");
    }
    // 2. Vérifier que le secret existe
    var ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
    if (!ACCESS_SECRET) {
        logger_1.default.error("ACCESS_TOKEN_SECRET non défini");
        return (0, httpErrors_1.sendError)(res, 500, "JWT secrets non définis");
    }
    try {
        // 3. Vérification + décodage du JWT
        var payload = jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
        // Validation du payload
        if (!payload.userId || !payload.role) {
            return (0, httpErrors_1.sendError)(res, 401, "Token invalide");
        }
        // 4. On attache l'utilisateur à la requête
        req.user = {
            userId: payload.userId,
            role: payload.role,
        };
        next();
    }
    catch (err) {
        // Token invalide, expiré, ou erreur de vérification
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError ||
            err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return (0, httpErrors_1.sendError)(res, 401, "Token invalide ou expiré");
        }
        logger_1.default.error("Erreur lors de la vérification du token :", err);
        return (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la vérification du token");
    }
}
// Middleware d'authentification optionnel : vérifie le token si présent
// mais ne bloque pas la requête si absent ou invalide
// Permet d'avoir req.user disponible si l'utilisateur est connecté
function optionalAuth(req, res, next) {
    // 1. Lire le token depuis le header Authorization
    var authHeader = req.headers.authorization;
    // Si pas de header, on continue sans authentification
    if (!authHeader) {
        return next();
    }
    // Format attendu : "Bearer <token>"
    var parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        // Format invalide, on continue sans authentification
        return next();
    }
    var token = parts[1];
    if (!token) {
        // Token manquant, on continue sans authentification
        return next();
    }
    // 2. Vérifier que le secret existe
    var ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
    if (!ACCESS_SECRET) {
        logger_1.default.error("ACCESS_TOKEN_SECRET non défini");
        // On continue sans authentification plutôt que de bloquer
        return next();
    }
    try {
        // 3. Vérification + décodage du JWT
        var payload = jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
        // Validation du payload
        if (payload.userId && payload.role) {
            // 4. On attache l'utilisateur à la requête
            req.user = {
                userId: payload.userId,
                role: payload.role,
            };
        }
    }
    catch (err) {
        // Token invalide ou expiré : on continue sans authentification
        // Pas de log d'erreur car c'est normal pour les visiteurs non connectés
    }
    // On continue toujours, même si l'authentification a échoué
    next();
}
