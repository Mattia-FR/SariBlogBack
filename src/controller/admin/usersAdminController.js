"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.updateMePassword = exports.updateMeProfile = exports.readMe = void 0;
var argon2_1 = __importDefault(require("argon2"));
var argon2_2 = require("../../config/argon2");
var usersAdminModel_1 = __importDefault(require("../../model/admin/usersAdminModel"));
var usersModel_1 = __importDefault(require("../../model/usersModel"));
var httpErrors_1 = require("../../utils/httpErrors");
var imageUrl_1 = require("../../utils/imageUrl");
var logger_1 = __importDefault(require("../../utils/logger"));
/** Enrichit un utilisateur avec l'URL complète de son avatar (User → User avec avatarUrl). */
function enrichUserWithAvatarUrl(user) {
    var avatarUrl = (0, imageUrl_1.buildImageUrl)(user.avatar);
    if (avatarUrl) {
        return __assign(__assign({}, user), { avatarUrl: avatarUrl });
    }
    return user;
}
// Récupère l'utilisateur connecté (req.user fourni par le middleware requireAuth).
// GET /admin/users/me
var readMe = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!req.user || !req.user.userId) {
                    (0, httpErrors_1.sendError)(res, 401, "Non authentifié");
                    return [2 /*return*/];
                }
                userId = req.user.userId;
                return [4 /*yield*/, usersModel_1.default.findById(userId)];
            case 1:
                user = _a.sent();
                if (!user) {
                    (0, httpErrors_1.sendError)(res, 404, "Utilisateur non trouvé");
                    return [2 /*return*/];
                }
                res.status(200).json(enrichUserWithAvatarUrl(user));
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération de l'utilisateur connecté (admin) :", error_1);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération de l'utilisateur connecté");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readMe = readMe;
var updateMeProfile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, username, email, firstname, lastname, avatar, bio, bio_short, data, user, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                if (!req.user || !req.user.userId) {
                    (0, httpErrors_1.sendError)(res, 401, "Non authentifié");
                    return [2 /*return*/];
                }
                userId = req.user.userId;
                _a = req.body, username = _a.username, email = _a.email, firstname = _a.firstname, lastname = _a.lastname, avatar = _a.avatar, bio = _a.bio, bio_short = _a.bio_short;
                data = {};
                if (username !== undefined)
                    data.username = username;
                if (email !== undefined)
                    data.email = email;
                if (firstname !== undefined)
                    data.firstname = firstname;
                if (lastname !== undefined)
                    data.lastname = lastname;
                if (avatar !== undefined)
                    data.avatar = avatar;
                if (bio !== undefined)
                    data.bio = bio;
                if (bio_short !== undefined)
                    data.bio_short = bio_short;
                return [4 /*yield*/, usersAdminModel_1.default.updateMeProfile(userId, data)];
            case 1:
                user = _b.sent();
                if (!user) {
                    (0, httpErrors_1.sendError)(res, 404, "Utilisateur non trouvé");
                    return [2 /*return*/];
                }
                res.status(200).json(enrichUserWithAvatarUrl(user));
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                if ((0, httpErrors_1.isHttpError)(error_2)) {
                    (0, httpErrors_1.sendError)(res, error_2.statusCode, error_2.message, error_2.code);
                    return [2 /*return*/];
                }
                logger_1.default.error("Erreur lors de la mise à jour du profil (admin) :", error_2);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la mise à jour du profil");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateMeProfile = updateMeProfile;
var updateMePassword = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, password, hashedPassword, success, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!req.user || !req.user.userId) {
                    (0, httpErrors_1.sendError)(res, 401, "Non authentifié");
                    return [2 /*return*/];
                }
                userId = req.user.userId;
                password = req.body.password;
                if (typeof password !== "string" || password.trim().length === 0) {
                    (0, httpErrors_1.sendError)(res, 400, "Mot de passe invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, argon2_1.default.hash(password, argon2_2.argon2Options)];
            case 1:
                hashedPassword = _a.sent();
                return [4 /*yield*/, usersAdminModel_1.default.updateMePassword(userId, hashedPassword)];
            case 2:
                success = _a.sent();
                if (success === false) {
                    (0, httpErrors_1.sendError)(res, 404, "Utilisateur non trouvé");
                    return [2 /*return*/];
                }
                res.sendStatus(204);
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                logger_1.default.error("Erreur lors de la mise à jour du mot de passe (admin) :", error_3);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la mise à jour du mot de passe");
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateMePassword = updateMePassword;
