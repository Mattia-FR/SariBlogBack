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
exports.destroy = exports.editStatus = exports.readById = exports.browseAll = void 0;
var commentsAdminModel_1 = __importDefault(require("../../model/admin/commentsAdminModel"));
var httpErrors_1 = require("../../utils/httpErrors");
var logger_1 = __importDefault(require("../../utils/logger"));
// Liste paginée des commentaires. Query : page, limit (1–20), status optionnel (pending | approved | rejected | spam).
// GET /admin/comments?page=1&limit=10&status=pending
var browseAll = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var page, limit, status_1, statusRaw, s, _a, _b, comments, total, counts, err_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                page = Number.parseInt(req.query.page, 10) || 1;
                limit = Number.parseInt(req.query.limit, 10) || 10;
                if (page < 1) {
                    (0, httpErrors_1.sendError)(res, 400, "Le paramètre page doit être un nombre positif");
                    return [2 /*return*/];
                }
                if (limit < 1 || limit > 20) {
                    (0, httpErrors_1.sendError)(res, 400, "Le paramètre limit doit être entre 1 et 20");
                    return [2 /*return*/];
                }
                statusRaw = req.query.status;
                if (statusRaw !== undefined && statusRaw !== "") {
                    s = String(statusRaw);
                    if (!["pending", "approved", "rejected", "spam"].includes(s)) {
                        (0, httpErrors_1.sendError)(res, 400, "Statut de filtre invalide");
                        return [2 /*return*/];
                    }
                    status_1 = s;
                }
                return [4 /*yield*/, Promise.all([
                        commentsAdminModel_1.default.findAllPaginated(page, limit, status_1),
                        commentsAdminModel_1.default.findTabCounts(),
                    ])];
            case 1:
                _a = _c.sent(), _b = _a[0], comments = _b.comments, total = _b.total, counts = _a[1];
                res.status(200).json({
                    comments: comments,
                    total: total,
                    page: page,
                    limit: limit,
                    counts: counts,
                });
                return [3 /*break*/, 3];
            case 2:
                err_1 = _c.sent();
                logger_1.default.error("Erreur lors de la récupération de tous les commentaires :", err_1);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération des commentaires");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.browseAll = browseAll;
// Récupère un commentaire par ID
// GET /comments/:id
var readById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var commentId, comment, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                commentId = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(commentId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, commentsAdminModel_1.default.findById(commentId)];
            case 1:
                comment = _a.sent();
                if (!comment) {
                    (0, httpErrors_1.sendError)(res, 404, "Commentaire non trouvé");
                    return [2 /*return*/];
                }
                res.status(200).json(comment);
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération du commentaire par ID :", err_2);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération du commentaire");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readById = readById;
// Met à jour le statut d'un commentaire
// PATCH /comments/:id/status
var editStatus = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var commentId, status_2, updatedComment, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                commentId = Number.parseInt(req.params.id, 10);
                status_2 = req.body.status;
                if (Number.isNaN(commentId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                if (!["pending", "approved", "rejected", "spam"].includes(status_2)) {
                    (0, httpErrors_1.sendError)(res, 400, "Statut invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, commentsAdminModel_1.default.updateStatus(commentId, { status: status_2 })];
            case 1:
                updatedComment = _a.sent();
                if (!updatedComment) {
                    (0, httpErrors_1.sendError)(res, 404, "Commentaire non trouvé");
                    return [2 /*return*/];
                }
                res.status(200).json(updatedComment);
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                logger_1.default.error("Erreur lors de la mise à jour du statut :", err_3);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la mise à jour du statut du commentaire");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.editStatus = editStatus;
// Supprime un commentaire
// DELETE /comments/:id
var destroy = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var commentId, deleted, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                commentId = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(commentId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, commentsAdminModel_1.default.deleteOne(commentId)];
            case 1:
                deleted = _a.sent();
                if (!deleted) {
                    (0, httpErrors_1.sendError)(res, 404, "Commentaire non trouvé");
                    return [2 /*return*/];
                }
                res.sendStatus(204);
                return [3 /*break*/, 3];
            case 2:
                err_4 = _a.sent();
                logger_1.default.error("Erreur lors de la suppression du commentaire :", err_4);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la suppression du commentaire");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.destroy = destroy;
