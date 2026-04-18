"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentsLimiter = exports.messagesLimiter = exports.loginLimiter = void 0;
var express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limite de 5 requêtes par IP
    message: "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
});
exports.messagesLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limite de 5 requêtes par IP
    message: "Trop de messages. Veuillez réessayer plus tard.",
});
exports.commentsLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limite de 5 requêtes par IP
    message: "Trop de commentaires. Veuillez réessayer plus tard.",
});
