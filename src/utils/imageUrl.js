"use strict";
/**
 * Utilitaire partagé pour construire l'URL complète d'une image ou d'un avatar
 * à partir du path stocké en base (ex. /uploads/images/xxx.jpg).
 * Utilisé par les controllers images, users et articles pour un enrichissement cohérent.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IMAGE_BASE_URL = void 0;
exports.buildImageUrl = buildImageUrl;
var IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || "http://localhost:4242";
exports.IMAGE_BASE_URL = IMAGE_BASE_URL;
/**
 * Retourne l'URL complète (base + path) si path est défini, sinon undefined.
 * Gère les cas base terminant par / et path commençant par / pour éviter le double slash.
 * @param path - Chemin relatif (ex. /uploads/images/xxx.jpg) ou null/undefined
 */
function buildImageUrl(path) {
    if (path == null || path === "") {
        return undefined;
    }
    var base = IMAGE_BASE_URL.replace(/\/$/, "");
    var normalizedPath = path.startsWith("/") ? path : "/".concat(path);
    return "".concat(base).concat(normalizedPath);
}
