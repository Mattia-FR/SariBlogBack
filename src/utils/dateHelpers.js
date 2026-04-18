"use strict";
// Convertit une Date ou null en ISO string ou null
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDateString = toDateString;
function toDateString(value) {
    if (!value)
        return null;
    return value instanceof Date ? value.toISOString() : String(value);
}
