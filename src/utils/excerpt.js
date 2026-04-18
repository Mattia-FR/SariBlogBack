"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excerptFromPlainText = excerptFromPlainText;
/** Nombre de mots max avant troncature (cartes liste / blog). */
var DEFAULT_MAX_WORDS = 40;
/**
 * Produit un extrait en texte brut : normalise les espaces, tronque après maxWords mots, ajoute … si tronqué.
 */
function excerptFromPlainText(text, maxWords) {
    if (maxWords === void 0) { maxWords = DEFAULT_MAX_WORDS; }
    var normalized = text.trim().replace(/\s+/g, " ");
    if (!normalized) {
        return null;
    }
    var words = normalized.split(" ");
    if (words.length <= maxWords) {
        return normalized;
    }
    return "".concat(words.slice(0, maxWords).join(" "), "\u2026");
}
