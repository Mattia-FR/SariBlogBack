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
// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString, tags), le frontend reçoit toujours des objets strictement conformes à l'interface Image.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.
var findGallery = function () { return __awaiter(void 0, void 0, void 0, function () {
    var images, imageIds, placeholders, tags_1, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, db_1.default.query("SELECT i.id, i.title, i.description, i.path, i.alt_descr, i.is_in_gallery,\n\t\t\ti.user_id, i.article_id, i.category_id, i.created_at, i.updated_at\n\t\t\tFROM images i\n\t\t\tWHERE i.is_in_gallery = TRUE\n\t\t\tORDER BY i.created_at DESC")];
            case 1:
                images = (_a.sent())[0];
                if (images.length === 0) {
                    return [2 /*return*/, []];
                }
                imageIds = images.map(function (image) { return image.id; });
                placeholders = imageIds.map(function () { return "?"; }).join(",");
                return [4 /*yield*/, db_1.default.query("SELECT it.image_id, t.id, t.name, t.slug\n\t\t\tFROM images_tags it\n\t\t\tLEFT JOIN tags t ON it.tag_id = t.id\n\t\t\tWHERE it.image_id IN (".concat(placeholders, ")"), imageIds)];
            case 2:
                tags_1 = (_a.sent())[0];
                // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                return [2 /*return*/, images.map(function (image) {
                        var _a, _b, _c;
                        return ({
                            id: image.id,
                            title: image.title,
                            description: image.description,
                            path: image.path,
                            alt_descr: image.alt_descr,
                            is_in_gallery: image.is_in_gallery,
                            user_id: image.user_id,
                            article_id: image.article_id,
                            category_id: (_a = image.category_id) !== null && _a !== void 0 ? _a : null,
                            created_at: (_b = (0, dateHelpers_1.toDateString)(image.created_at)) !== null && _b !== void 0 ? _b : "",
                            updated_at: (_c = (0, dateHelpers_1.toDateString)(image.updated_at)) !== null && _c !== void 0 ? _c : "",
                            tags: tags_1
                                // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                                .filter(function (t) { return t.image_id === image.id; })
                                // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                                .map(function (t) { return ({ id: t.id, name: t.name, slug: t.slug }); }),
                        });
                    })];
            case 3:
                err_1 = _a.sent();
                logger_1.default.error(err_1);
                throw err_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
var findById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, row, err_2;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT id, title, description, path, alt_descr, is_in_gallery, user_id, article_id, category_id, created_at, updated_at\n\t\t\tFROM images\n\t\t\tWHERE id = ?", [id])];
            case 1:
                rows = (_d.sent())[0];
                if (!rows[0])
                    return [2 /*return*/, null];
                row = rows[0];
                return [2 /*return*/, {
                        id: row.id,
                        title: row.title,
                        description: row.description,
                        path: row.path,
                        alt_descr: row.alt_descr,
                        is_in_gallery: row.is_in_gallery,
                        user_id: row.user_id,
                        article_id: row.article_id,
                        category_id: (_a = row.category_id) !== null && _a !== void 0 ? _a : null,
                        created_at: (_b = (0, dateHelpers_1.toDateString)(row.created_at)) !== null && _b !== void 0 ? _b : "",
                        updated_at: (_c = (0, dateHelpers_1.toDateString)(row.updated_at)) !== null && _c !== void 0 ? _c : "",
                    }];
            case 2:
                err_2 = _d.sent();
                logger_1.default.error(err_2);
                throw err_2;
            case 3: return [2 /*return*/];
        }
    });
}); };
var findByArticleId = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT id, title, description, path, alt_descr, is_in_gallery, user_id, article_id, category_id, created_at, updated_at\n\t\t\tFROM images \n\t\t\tWHERE article_id = ?", [id])];
            case 1:
                rows = (_a.sent())[0];
                // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                return [2 /*return*/, rows.map(function (row) {
                        var _a, _b, _c;
                        return ({
                            id: row.id,
                            title: row.title,
                            description: row.description,
                            path: row.path,
                            alt_descr: row.alt_descr,
                            is_in_gallery: row.is_in_gallery,
                            user_id: row.user_id,
                            article_id: row.article_id,
                            category_id: (_a = row.category_id) !== null && _a !== void 0 ? _a : null,
                            created_at: (_b = (0, dateHelpers_1.toDateString)(row.created_at)) !== null && _b !== void 0 ? _b : "",
                            updated_at: (_c = (0, dateHelpers_1.toDateString)(row.updated_at)) !== null && _c !== void 0 ? _c : "",
                        });
                    })];
            case 2:
                err_3 = _a.sent();
                logger_1.default.error(err_3);
                throw err_3;
            case 3: return [2 /*return*/];
        }
    });
}); };
var findByTagId = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT i.id, i.title, i.description, i.path, i.alt_descr, i.is_in_gallery, i.user_id, i.article_id, i.category_id, i.created_at, i.updated_at\n\t\t\tFROM images i\n\t\t\tINNER JOIN images_tags it ON i.id = it.image_id\n\t\t\tWHERE it.tag_id = ?", [id])];
            case 1:
                rows = (_a.sent())[0];
                // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                return [2 /*return*/, rows.map(function (row) {
                        var _a, _b, _c;
                        return ({
                            id: row.id,
                            title: row.title,
                            description: row.description,
                            path: row.path,
                            alt_descr: row.alt_descr,
                            is_in_gallery: row.is_in_gallery,
                            user_id: row.user_id,
                            article_id: row.article_id,
                            category_id: (_a = row.category_id) !== null && _a !== void 0 ? _a : null,
                            created_at: (_b = (0, dateHelpers_1.toDateString)(row.created_at)) !== null && _b !== void 0 ? _b : "",
                            updated_at: (_c = (0, dateHelpers_1.toDateString)(row.updated_at)) !== null && _c !== void 0 ? _c : "",
                        });
                    })];
            case 2:
                err_4 = _a.sent();
                logger_1.default.error(err_4);
                throw err_4;
            case 3: return [2 /*return*/];
        }
    });
}); };
var findByCategoryId = function (categoryId, page, limit, tagId) { return __awaiter(void 0, void 0, void 0, function () {
    var offset, tagJoin, countParams, countResult, total, listParams, images, imageIds, placeholders, tags_2, mapped, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                offset = (page - 1) * limit;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                tagJoin = tagId != null
                    ? "INNER JOIN images_tags tagf ON tagf.image_id = i.id AND tagf.tag_id = ?"
                    : "";
                countParams = tagId != null ? [tagId, categoryId] : [categoryId];
                return [4 /*yield*/, db_1.default.query(tagId != null
                        ? "SELECT COUNT(DISTINCT i.id) as total\n\t\t\tFROM images i\n\t\t\t".concat(tagJoin, "\n\t\t\tWHERE i.category_id = ? AND i.is_in_gallery = TRUE")
                        : "SELECT COUNT(*) as total\n\t\t\tFROM images i\n\t\t\tWHERE i.category_id = ? AND i.is_in_gallery = TRUE", countParams)];
            case 2:
                countResult = (_a.sent())[0];
                total = countResult[0].total;
                listParams = tagId != null
                    ? [tagId, categoryId, limit, offset]
                    : [categoryId, limit, offset];
                return [4 /*yield*/, db_1.default.query("SELECT i.id, i.title, i.description, i.path, i.alt_descr, i.is_in_gallery,\n\t\t\ti.user_id, i.article_id, i.category_id, i.created_at, i.updated_at\n\t\t\tFROM images i\n\t\t\t".concat(tagJoin, "\n\t\t\tWHERE i.category_id = ? AND i.is_in_gallery = TRUE\n\t\t\tORDER BY i.created_at DESC\n\t\t\tLIMIT ? OFFSET ?"), listParams)];
            case 3:
                images = (_a.sent())[0];
                if (images.length === 0) {
                    return [2 /*return*/, { images: [], total: total }];
                }
                imageIds = images.map(function (image) { return image.id; });
                placeholders = imageIds.map(function () { return "?"; }).join(",");
                return [4 /*yield*/, db_1.default.query("SELECT it.image_id, t.id, t.name, t.slug\n\t\t\tFROM images_tags it\n\t\t\tLEFT JOIN tags t ON it.tag_id = t.id\n\t\t\tWHERE it.image_id IN (".concat(placeholders, ")"), imageIds)];
            case 4:
                tags_2 = (_a.sent())[0];
                mapped = images.map(function (image) {
                    var _a, _b, _c;
                    return ({
                        id: image.id,
                        title: image.title,
                        description: image.description,
                        path: image.path,
                        alt_descr: image.alt_descr,
                        is_in_gallery: image.is_in_gallery,
                        user_id: image.user_id,
                        article_id: image.article_id,
                        category_id: (_a = image.category_id) !== null && _a !== void 0 ? _a : null,
                        created_at: (_b = (0, dateHelpers_1.toDateString)(image.created_at)) !== null && _b !== void 0 ? _b : "",
                        updated_at: (_c = (0, dateHelpers_1.toDateString)(image.updated_at)) !== null && _c !== void 0 ? _c : "",
                        tags: tags_2
                            // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                            .filter(function (t) { return t.image_id === image.id; })
                            // biome-ignore lint/suspicious/noExplicitAny: mysql2 query result typing
                            .map(function (t) { return ({ id: t.id, name: t.name, slug: t.slug }); }),
                    });
                });
                return [2 /*return*/, { images: mapped, total: total }];
            case 5:
                err_5 = _a.sent();
                logger_1.default.error(err_5);
                throw err_5;
            case 6: return [2 /*return*/];
        }
    });
}); };
var findImageOfTheDay = function () { return __awaiter(void 0, void 0, void 0, function () {
    var rows, today, startOfYear, dayOfYear, imageIndex, row, err_6;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT id, title, description, path, alt_descr, is_in_gallery, user_id, article_id, category_id, created_at, updated_at\n\t\t\tFROM images\n\t\t\tWHERE is_in_gallery = TRUE\n\t\t\tORDER BY id ASC")];
            case 1:
                rows = (_d.sent())[0];
                if (rows.length === 0) {
                    return [2 /*return*/, null];
                }
                today = new Date();
                startOfYear = new Date(today.getFullYear(), 0, 1);
                dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / 86400000);
                imageIndex = dayOfYear % rows.length;
                row = rows[imageIndex];
                return [2 /*return*/, {
                        id: row.id,
                        title: row.title,
                        description: row.description,
                        path: row.path,
                        alt_descr: row.alt_descr,
                        is_in_gallery: row.is_in_gallery,
                        user_id: row.user_id,
                        article_id: row.article_id,
                        category_id: (_a = row.category_id) !== null && _a !== void 0 ? _a : null,
                        created_at: (_b = (0, dateHelpers_1.toDateString)(row.created_at)) !== null && _b !== void 0 ? _b : "",
                        updated_at: (_c = (0, dateHelpers_1.toDateString)(row.updated_at)) !== null && _c !== void 0 ? _c : "",
                    }];
            case 2:
                err_6 = _d.sent();
                logger_1.default.error(err_6);
                throw err_6;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.default = {
    findGallery: findGallery,
    findById: findById,
    findByArticleId: findByArticleId,
    findByTagId: findByTagId,
    findByCategoryId: findByCategoryId,
    findImageOfTheDay: findImageOfTheDay,
};
