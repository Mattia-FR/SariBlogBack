"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishedAtForCreate = publishedAtForCreate;
/** À la création : brouillon/archivé → pas de date ; publié sans date explicite → maintenant. */
function publishedAtForCreate(status, explicit) {
    if (status !== "published") {
        return null;
    }
    if (explicit != null && explicit !== "") {
        return String(explicit);
    }
    return new Date().toISOString();
}
