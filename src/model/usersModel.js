"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dateHelpers_1 = require("../utils/dateHelpers");
var logger_1 = __importDefault(require("../utils/logger"));
var db_1 = __importDefault(require("./db"));
// J’ai choisi d’utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString), le frontend reçoit toujours des objets strictement conformes aux interfaces User et UserWithPassword.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n’apporteraient rien pour ce projet.
var findAll = function () { return __awaiter(void 0, void 0, void 0, function () {
    var rows, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT id, username, email, firstname, lastname, role, \n\t\t\tavatar, bio, bio_short, created_at, updated_at \n\t\t\tFROM users")];
            case 1:
                rows = (_a.sent())[0];
                // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                return [2 /*return*/, rows.map(function (row) {
                        var _a, _b;
                        return ({
                            id: row.id,
                            username: row.username,
                            email: row.email,
                            firstname: row.firstname,
                            lastname: row.lastname,
                            role: row.role,
                            avatar: row.avatar,
                            bio: row.bio,
                            bio_short: row.bio_short,
                            created_at: (_a = (0, dateHelpers_1.toDateString)(row.created_at)) !== null && _a !== void 0 ? _a : "",
                            updated_at: (_b = (0, dateHelpers_1.toDateString)(row.updated_at)) !== null && _b !== void 0 ? _b : "",
                        });
                    })];
            case 2:
                err_1 = _a.sent();
                logger_1.default.error(err_1);
                throw err_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
var findById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, row, err_2;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT id, username, email, firstname, lastname, role, \n\t\t\tavatar, bio, bio_short, created_at, updated_at \n\t\t\tFROM users \n\t\t\tWHERE id = ?", [id])];
            case 1:
                rows = (_c.sent())[0];
                if (!rows[0])
                    return [2 /*return*/, null];
                row = rows[0];
                return [2 /*return*/, {
                        id: row.id,
                        username: row.username,
                        email: row.email,
                        firstname: row.firstname,
                        lastname: row.lastname,
                        role: row.role,
                        avatar: row.avatar,
                        bio: row.bio,
                        bio_short: row.bio_short,
                        created_at: (_a = (0, dateHelpers_1.toDateString)(row.created_at)) !== null && _a !== void 0 ? _a : "",
                        updated_at: (_b = (0, dateHelpers_1.toDateString)(row.updated_at)) !== null && _b !== void 0 ? _b : "",
                    }];
            case 2:
                err_2 = _c.sent();
                logger_1.default.error(err_2);
                throw err_2;
            case 3: return [2 /*return*/];
        }
    });
}); };
var findByEmail = function (email) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, row, err_3;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT * FROM users WHERE email = ?", [email])];
            case 1:
                rows = (_c.sent())[0];
                if (!rows[0])
                    return [2 /*return*/, null];
                row = rows[0];
                return [2 /*return*/, {
                        id: row.id,
                        username: row.username,
                        email: row.email,
                        firstname: row.firstname,
                        lastname: row.lastname,
                        role: row.role,
                        avatar: row.avatar,
                        bio: row.bio,
                        bio_short: row.bio_short,
                        password: row.password,
                        created_at: (_a = (0, dateHelpers_1.toDateString)(row.created_at)) !== null && _a !== void 0 ? _a : "",
                        updated_at: (_b = (0, dateHelpers_1.toDateString)(row.updated_at)) !== null && _b !== void 0 ? _b : "",
                    }];
            case 2:
                err_3 = _c.sent();
                logger_1.default.error(err_3);
                throw err_3;
            case 3: return [2 /*return*/];
        }
    });
}); };
var findByIdentifier = function (identifier) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, row, err_4;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT * FROM users WHERE email = ? OR username = ?", [identifier, identifier])];
            case 1:
                rows = (_c.sent())[0];
                if (!rows[0])
                    return [2 /*return*/, null];
                row = rows[0];
                return [2 /*return*/, {
                        id: row.id,
                        username: row.username,
                        email: row.email,
                        firstname: row.firstname,
                        lastname: row.lastname,
                        role: row.role,
                        avatar: row.avatar,
                        bio: row.bio,
                        bio_short: row.bio_short,
                        password: row.password,
                        created_at: (_a = (0, dateHelpers_1.toDateString)(row.created_at)) !== null && _a !== void 0 ? _a : "",
                        updated_at: (_b = (0, dateHelpers_1.toDateString)(row.updated_at)) !== null && _b !== void 0 ? _b : "",
                    }];
            case 2:
                err_4 = _c.sent();
                logger_1.default.error(err_4);
                throw err_4;
            case 3: return [2 /*return*/];
        }
    });
}); };
var create = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var existing, duplicate, result, newUser, err_5;
    var _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 4, , 5]);
                return [4 /*yield*/, db_1.default.query("SELECT id, email, username FROM users WHERE email = ? OR username = ?", [data.email, data.username])];
            case 1:
                existing = (_g.sent())[0];
                if (existing.length > 0) {
                    duplicate = existing[0];
                    if (duplicate.email === data.email) {
                        throw new Error("EMAIL_EXISTS");
                    }
                    if (duplicate.username === data.username) {
                        throw new Error("USERNAME_EXISTS");
                    }
                }
                return [4 /*yield*/, db_1.default.query("INSERT INTO users (username, email, password, firstname, lastname, role, avatar, bio, bio_short)\n\t\t\tVALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
                        data.username,
                        data.email,
                        data.password,
                        (_a = data.firstname) !== null && _a !== void 0 ? _a : null,
                        (_b = data.lastname) !== null && _b !== void 0 ? _b : null,
                        (_c = data.role) !== null && _c !== void 0 ? _c : "editor",
                        (_d = data.avatar) !== null && _d !== void 0 ? _d : null,
                        (_e = data.bio) !== null && _e !== void 0 ? _e : null,
                        (_f = data.bio_short) !== null && _f !== void 0 ? _f : null,
                    ])];
            case 2:
                result = (_g.sent())[0];
                return [4 /*yield*/, findById(result.insertId)];
            case 3:
                newUser = _g.sent();
                if (!newUser) {
                    throw new Error("Impossible de récupérer l'utilisateur créé");
                }
                return [2 /*return*/, newUser];
            case 4:
                err_5 = _g.sent();
                logger_1.default.error(err_5);
                throw err_5;
            case 5: return [2 /*return*/];
        }
    });
}); };
var deleteOne = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var result, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("DELETE FROM users WHERE id = ?", [id])];
            case 1:
                result = (_a.sent())[0];
                return [2 /*return*/, result.affectedRows > 0];
            case 2:
                err_6 = _a.sent();
                logger_1.default.error(err_6);
                throw err_6;
            case 3: return [2 /*return*/];
        }
    });
}); };
var findArtist = function () { return __awaiter(void 0, void 0, void 0, function () {
    var rows, row, err_7;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT id, username, email, firstname, lastname, role,\n\t\t\tavatar, bio, bio_short, created_at, updated_at\n\t\t\tFROM users\n\t\t\tWHERE role = 'editor'\n\t\t\tORDER BY id ASC\n\t\t\tLIMIT 1")];
            case 1:
                rows = (_c.sent())[0];
                if (!rows[0])
                    return [2 /*return*/, null];
                row = rows[0];
                return [2 /*return*/, {
                        id: row.id,
                        username: row.username,
                        email: row.email,
                        firstname: row.firstname,
                        lastname: row.lastname,
                        role: row.role,
                        avatar: row.avatar,
                        bio: row.bio,
                        bio_short: row.bio_short,
                        created_at: (_a = (0, dateHelpers_1.toDateString)(row.created_at)) !== null && _a !== void 0 ? _a : "",
                        updated_at: (_b = (0, dateHelpers_1.toDateString)(row.updated_at)) !== null && _b !== void 0 ? _b : "",
                    }];
            case 2:
                err_7 = _c.sent();
                logger_1.default.error(err_7);
                throw err_7;
            case 3: return [2 /*return*/];
        }
    });
}); };
var saveRefreshToken = function (userId, refreshToken) { return __awaiter(void 0, void 0, void 0, function () {
    var err_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("UPDATE users SET refresh_token = ? WHERE id = ?", [
                        refreshToken,
                        userId,
                    ])];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                err_8 = _a.sent();
                logger_1.default.error(err_8);
                throw err_8;
            case 3: return [2 /*return*/];
        }
    });
}); };
var findByIdWithRefreshToken = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var users, err_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT refresh_token FROM users WHERE id = ?", [id])];
            case 1:
                users = (_a.sent())[0];
                if (!users[0])
                    return [2 /*return*/, null];
                return [2 /*return*/, { refresh_token: users[0].refresh_token }];
            case 2:
                err_9 = _a.sent();
                logger_1.default.error(err_9);
                throw err_9;
            case 3: return [2 /*return*/];
        }
    });
}); };
var deleteRefreshToken = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var err_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("UPDATE users SET refresh_token = NULL WHERE id = ?", [
                        userId,
                    ])];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                err_10 = _a.sent();
                logger_1.default.error(err_10);
                throw err_10;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.default = {
    findAll: findAll,
    findById: findById,
    findByEmail: findByEmail,
    findByIdentifier: findByIdentifier,
    findArtist: findArtist,
    create: create,
    deleteOne: deleteOne,
    saveRefreshToken: saveRefreshToken,
    findByIdWithRefreshToken: findByIdWithRefreshToken,
    deleteRefreshToken: deleteRefreshToken,
};
