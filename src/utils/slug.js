"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSlug = buildSlug;
var slugify_1 = __importDefault(require("slugify"));
/**
 * Génère un slug URL-safe à partir d'une chaîne.
 * - minuscules
 * - suppression des accents
 * - suppression des caractères spéciaux
 * - espaces remplacés par des tirets
 *
 * @param value - Texte source (ex. titre d'article)
 */
function buildSlug(value) {
    return (0, slugify_1.default)(value, {
        lower: true,
        strict: true,
    });
}
