"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
var zod_1 = require("zod");
var httpErrors_1 = require("../utils/httpErrors");
var logger_1 = __importDefault(require("../utils/logger"));
function errorHandler(err, _req, res, _next) {
    logger_1.default.error("Erreur:", err);
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            error: "Données invalides",
            details: err.issues,
        });
    }
    var error = err;
    if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Fichier trop volumineux" });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ error: "Fichier non autorisé" });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ error: "Trop de fichiers envoyés" });
    }
    if (err instanceof httpErrors_1.HttpError) {
        var body = err.code
            ? { error: err.message, code: err.code }
            : { error: err.message };
        return res.status(err.statusCode).json(body);
    }
    res.status(500).json({ error: "Erreur serveur" });
}
