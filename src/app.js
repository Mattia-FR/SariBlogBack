"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_path_1 = __importDefault(require("node:path"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var cors_1 = __importDefault(require("cors"));
var express_1 = __importDefault(require("express"));
var helmet_1 = require("./config/helmet");
var errorMiddleware_1 = require("./middleware/errorMiddleware");
var router_1 = __importDefault(require("./router"));
var logger_1 = __importDefault(require("./utils/logger"));
var app = (0, express_1.default)();
// Sécurité HTTP
app.use(helmet_1.helmetMiddleware);
// CORS
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGIN,
    credentials: true, // OBLIGATOIRE pour cookies
}));
// Parsing JSON
app.use(express_1.default.json());
// Parsing cookies
app.use((0, cookie_parser_1.default)());
// Logging
app.use(function (req, _res, next) {
    logger_1.default.info("".concat(req.method, " ").concat(req.url));
    next();
});
// Fichiers statiques
app.use("/uploads", express_1.default.static(node_path_1.default.join(__dirname, "../uploads")));
// API
app.use("/api", router_1.default);
// Middleware d'erreur
app.use(errorMiddleware_1.errorHandler);
exports.default = app;
