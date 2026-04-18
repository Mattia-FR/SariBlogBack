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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
var argon2_1 = __importDefault(require("argon2"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var usersModel_1 = __importDefault(require("../model/usersModel"));
var httpErrors_1 = require("../utils/httpErrors");
var logger_1 = __importDefault(require("../utils/logger"));
function login(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, identifier, password, ACCESS_SECRET, REFRESH_SECRET, user, isValid, accessToken, refreshToken, _, userWithoutPassword, publicUser, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    _a = req.body, identifier = _a.identifier, password = _a.password;
                    ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
                    REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
                    if (!ACCESS_SECRET || !REFRESH_SECRET) {
                        logger_1.default.error("JWT secrets non définis");
                        (0, httpErrors_1.sendError)(res, 500, "JWT secrets non définis");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, usersModel_1.default.findByIdentifier(identifier)];
                case 1:
                    user = _b.sent();
                    if (!user) {
                        return [2 /*return*/, res.sendStatus(401)];
                    }
                    return [4 /*yield*/, argon2_1.default.verify(user.password, password)];
                case 2:
                    isValid = _b.sent();
                    if (!isValid) {
                        return [2 /*return*/, res.sendStatus(401)];
                    }
                    accessToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, ACCESS_SECRET, { expiresIn: "15m" });
                    refreshToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, REFRESH_SECRET, { expiresIn: "7d" });
                    // 5. Stockage du refresh token en DB
                    return [4 /*yield*/, usersModel_1.default.saveRefreshToken(user.id, refreshToken)];
                case 3:
                    // 5. Stockage du refresh token en DB
                    _b.sent();
                    // 6. Envoi cookie httpOnly
                    res.cookie("refreshToken", refreshToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                        maxAge: 7 * 24 * 60 * 60 * 1000,
                    });
                    _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                    publicUser = userWithoutPassword;
                    // 8. Réponse
                    res.json({
                        accessToken: accessToken,
                        user: publicUser,
                    });
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _b.sent();
                    logger_1.default.error("Erreur lors de la connexion :", err_1);
                    (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la connexion");
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function refresh(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var refreshToken, REFRESH_SECRET, ACCESS_SECRET, ACCESS_EXPIRES_IN, payload, user, newAccessToken, err_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
                    if (!refreshToken) {
                        return [2 /*return*/, res.sendStatus(401)];
                    }
                    REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
                    ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
                    ACCESS_EXPIRES_IN = (process.env.ACCESS_TOKEN_EXPIRES_IN ||
                        "15m");
                    if (!REFRESH_SECRET || !ACCESS_SECRET) {
                        logger_1.default.error("JWT secrets non définis");
                        (0, httpErrors_1.sendError)(res, 500, "JWT secrets non définis");
                        return [2 /*return*/];
                    }
                    payload = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
                    // Validation du payload
                    if (!payload.userId || !payload.role) {
                        return [2 /*return*/, res.sendStatus(401)];
                    }
                    return [4 /*yield*/, usersModel_1.default.findByIdWithRefreshToken(payload.userId)];
                case 1:
                    user = _b.sent();
                    if (!user || user.refresh_token !== refreshToken) {
                        return [2 /*return*/, res.sendStatus(401)];
                    }
                    newAccessToken = jsonwebtoken_1.default.sign({
                        userId: payload.userId,
                        role: payload.role,
                    }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
                    // 6. Renvoyer le nouvel access token
                    res.status(200).json({
                        accessToken: newAccessToken,
                    });
                    return [3 /*break*/, 3];
                case 2:
                    err_2 = _b.sent();
                    // Token invalide, expiré, ou erreur DB
                    if (err_2 instanceof jsonwebtoken_1.default.JsonWebTokenError ||
                        err_2 instanceof jsonwebtoken_1.default.TokenExpiredError) {
                        return [2 /*return*/, res.sendStatus(401)];
                    }
                    logger_1.default.error("Erreur lors du refresh:", err_2);
                    (0, httpErrors_1.sendError)(res, 500, "Erreur lors du refresh");
                    return [2 /*return*/];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function logout(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var refreshToken, REFRESH_SECRET, payload, err_3, err_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken;
                    if (!refreshToken) {
                        // Pas de token = déjà déconnecté, retourner 200 quand même
                        return [2 /*return*/, res.sendStatus(200)];
                    }
                    REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;
                    if (!REFRESH_SECRET) {
                        logger_1.default.error("REFRESH_TOKEN_SECRET non défini");
                        (0, httpErrors_1.sendError)(res, 500, "REFRESH_TOKEN_SECRET non défini");
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    payload = jsonwebtoken_1.default.verify(refreshToken, REFRESH_SECRET);
                    // 3. Supprimer le refresh token de la DB
                    return [4 /*yield*/, usersModel_1.default.deleteRefreshToken(payload.userId)];
                case 2:
                    // 3. Supprimer le refresh token de la DB
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _b.sent();
                    return [3 /*break*/, 4];
                case 4:
                    // 4. Supprimer le cookie (en le remettant avec expiration passée)
                    res.cookie("refreshToken", "", {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                        maxAge: 0, // Expire immédiatement
                    });
                    // 5. Réponse
                    return [2 /*return*/, res.sendStatus(200)];
                case 5:
                    err_4 = _b.sent();
                    logger_1.default.error("Erreur lors de la déconnexion :", err_4);
                    (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la déconnexion");
                    return [2 /*return*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
