"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.argon2Options = void 0;
var argon2_1 = __importDefault(require("argon2"));
/**
 * Options de hashage Argon2 conformes aux recommandations OWASP
 * https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */
exports.argon2Options = {
    type: argon2_1.default.argon2id, // Version la plus sécurisée (hybride)
    memoryCost: 19 * Math.pow(2, 10), // 19 MB de RAM (19 * 1024 = 19,456 KB)
    timeCost: 2, // 2 itérations
    parallelism: 1, // 1 thread
};
