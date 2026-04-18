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
exports.destroy = exports.edit = exports.add = exports.readById = void 0;
var categoriesAdminModel_1 = __importDefault(require("../../model/admin/categoriesAdminModel"));
var httpErrors_1 = require("../../utils/httpErrors");
var logger_1 = __importDefault(require("../../utils/logger"));
var slug_1 = require("../../utils/slug");
// Récupère une catégorie par ID.
// GET /admin/categories/:id
var readById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var categoryId, category, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                categoryId = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(categoryId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, categoriesAdminModel_1.default.findById(categoryId)];
            case 1:
                category = _a.sent();
                if (!category) {
                    (0, httpErrors_1.sendError)(res, 404, "Catégorie non trouvée");
                    return [2 /*return*/];
                }
                res.status(200).json(category);
                return [3 /*break*/, 3];
            case 2:
                err_1 = _a.sent();
                logger_1.default.error("Erreur lors de la récupération de la catégorie par ID (admin) :", err_1);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la récupération de la catégorie");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.readById = readById;
// Crée une catégorie. Body : name (requis), slug (optionnel), display_order (optionnel, défaut : dernière position).
// POST /admin/categories
var add = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var name_1, slugProvided, slug, display_order, data, newCategory, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                name_1 = typeof req.body.name === "string" ? req.body.name.trim() : "";
                if (!name_1) {
                    (0, httpErrors_1.sendError)(res, 400, "Le nom est requis");
                    return [2 /*return*/];
                }
                slugProvided = req.body.slug && typeof req.body.slug === "string"
                    ? req.body.slug.trim()
                    : "";
                slug = void 0;
                if (slugProvided) {
                    slug = (0, slug_1.buildSlug)(slugProvided);
                    if (!slug) {
                        (0, httpErrors_1.sendError)(res, 400, "Slug invalide");
                        return [2 /*return*/];
                    }
                }
                else {
                    slug = (0, slug_1.buildSlug)(name_1);
                }
                display_order = typeof req.body.display_order === "number" &&
                    Number.isInteger(req.body.display_order)
                    ? req.body.display_order
                    : undefined;
                data = { name: name_1, slug: slug, display_order: display_order };
                return [4 /*yield*/, categoriesAdminModel_1.default.create(data)];
            case 1:
                newCategory = _a.sent();
                res.status(201).json(newCategory);
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                logger_1.default.error("Erreur lors de la création de la catégorie (admin) :", err_2);
                if (err_2 instanceof Error && err_2.message.includes("Duplicate entry")) {
                    (0, httpErrors_1.sendError)(res, 409, "Une catégorie avec ce nom ou ce slug existe déjà");
                    return [2 /*return*/];
                }
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la création de la catégorie");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.add = add;
// Met à jour une catégorie. Body : name, slug et/ou display_order (optionnels, mise à jour partielle).
// PATCH /admin/categories/:id
var edit = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var categoryId, data, _a, name_2, slug, display_order, trimmed, trimmed, sanitized, updatedCategory, err_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                categoryId = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(categoryId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                data = {};
                _a = req.body, name_2 = _a.name, slug = _a.slug, display_order = _a.display_order;
                if (name_2 !== undefined) {
                    trimmed = typeof name_2 === "string" ? name_2.trim() : "";
                    if (trimmed)
                        data.name = trimmed;
                }
                if (slug !== undefined) {
                    trimmed = typeof slug === "string" ? slug.trim() : "";
                    if (trimmed) {
                        sanitized = (0, slug_1.buildSlug)(trimmed);
                        if (!sanitized) {
                            (0, httpErrors_1.sendError)(res, 400, "Slug invalide");
                            return [2 /*return*/];
                        }
                        data.slug = sanitized;
                    }
                }
                if (display_order !== undefined) {
                    if (typeof display_order === "number" &&
                        Number.isInteger(display_order)) {
                        data.display_order = display_order;
                    }
                }
                if (Object.keys(data).length === 0) {
                    (0, httpErrors_1.sendError)(res, 400, "Au moins un champ (name, slug ou display_order) doit être fourni et valide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, categoriesAdminModel_1.default.update(categoryId, data)];
            case 1:
                updatedCategory = _b.sent();
                if (!updatedCategory) {
                    (0, httpErrors_1.sendError)(res, 404, "Catégorie non trouvée");
                    return [2 /*return*/];
                }
                res.status(200).json(updatedCategory);
                return [3 /*break*/, 3];
            case 2:
                err_3 = _b.sent();
                logger_1.default.error("Erreur lors de la mise à jour de la catégorie (admin) :", err_3);
                if (err_3 instanceof Error && err_3.message.includes("Duplicate entry")) {
                    (0, httpErrors_1.sendError)(res, 409, "Une catégorie avec ce nom ou ce slug existe déjà");
                    return [2 /*return*/];
                }
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la mise à jour de la catégorie");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.edit = edit;
// Supprime une catégorie par ID.
// DELETE /admin/categories/:id
var destroy = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var categoryId, deleted, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                categoryId = Number.parseInt(req.params.id, 10);
                if (Number.isNaN(categoryId)) {
                    (0, httpErrors_1.sendError)(res, 400, "ID invalide");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, categoriesAdminModel_1.default.deleteOne(categoryId)];
            case 1:
                deleted = _a.sent();
                if (!deleted) {
                    (0, httpErrors_1.sendError)(res, 404, "Catégorie non trouvée");
                    return [2 /*return*/];
                }
                res.sendStatus(204);
                return [3 /*break*/, 3];
            case 2:
                err_4 = _a.sent();
                logger_1.default.error("Erreur lors de la suppression de la catégorie (admin) :", err_4);
                (0, httpErrors_1.sendError)(res, 500, "Erreur lors de la suppression de la catégorie");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.destroy = destroy;
