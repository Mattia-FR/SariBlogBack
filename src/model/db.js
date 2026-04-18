"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var promise_1 = __importDefault(require("mysql2/promise"));
var _a = process.env, DB_HOST = _a.DB_HOST, DB_USER = _a.DB_USER, DB_PASSWORD = _a.DB_PASSWORD, DB_NAME = _a.DB_NAME, DB_PORT = _a.DB_PORT;
// Validation des variables d'environnement
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error("Variables d'environnement de base de données manquantes");
}
var pool = promise_1.default.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT ? Number.parseInt(DB_PORT, 10) : 3306,
});
exports.default = pool;
