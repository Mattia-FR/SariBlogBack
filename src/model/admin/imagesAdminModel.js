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
var dateHelpers_1 = require("../../utils/dateHelpers");
var logger_1 = __importDefault(require("../../utils/logger"));
var db_1 = __importDefault(require("../db"));
var imagesModel_1 = __importDefault(require("../imagesModel"));
var findById = imagesModel_1.default.findById;
// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString), le frontend reçoit toujours des objets strictement conformes à l'interface Image.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.
var findAllPaginated = function (page, limit, tagId) { return __awaiter(void 0, void 0, void 0, function () {
    var offset, tagJoin, countParams, countResult, total, listParams, rows, imageIds, placeholders, tagsRows_1, images, err_1;
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
                countParams = tagId != null ? [tagId] : [];
                return [4 /*yield*/, db_1.default.query(tagId != null
                        ? "SELECT COUNT(DISTINCT i.id) as total\n\t\t\tFROM images i\n\t\t\t".concat(tagJoin, "\n\t\t\tWHERE 1=1")
                        : "SELECT COUNT(*) as total FROM images i", countParams)];
            case 2:
                countResult = (_a.sent())[0];
                total = countResult[0].total;
                listParams = tagId != null ? [tagId, limit, offset] : [limit, offset];
                return [4 /*yield*/, db_1.default.query("SELECT i.id, i.title, i.description, i.path, i.alt_descr, i.is_in_gallery, i.user_id, i.article_id, i.category_id, i.created_at, i.updated_at\n\t\t\tFROM images i\n\t\t\t".concat(tagJoin, "\n\t\t\tORDER BY i.created_at DESC\n\t\t\tLIMIT ? OFFSET ?"), listParams)];
            case 3:
                rows = (_a.sent())[0];
                if (rows.length === 0) {
                    return [2 /*return*/, { images: [], total: total }];
                }
                imageIds = rows.map(function (row) { return row.id; });
                placeholders = imageIds.map(function () { return "?"; }).join(",");
                return [4 /*yield*/, db_1.default.query("SELECT it.image_id, t.id, t.name, t.slug\n\t\t\tFROM images_tags it\n\t\t\tLEFT JOIN tags t ON it.tag_id = t.id\n\t\t\tWHERE it.image_id IN (".concat(placeholders, ")"), imageIds)];
            case 4:
                tagsRows_1 = (_a.sent())[0];
                images = rows.map(function (row) {
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
                        tags: tagsRows_1
                            .filter(function (t) { return t.image_id === row.id; })
                            .map(function (t) { return ({
                            id: t.id,
                            name: t.name,
                            slug: t.slug,
                        }); }),
                    });
                });
                return [2 /*return*/, { images: images, total: total }];
            case 5:
                err_1 = _a.sent();
                logger_1.default.error(err_1);
                throw err_1;
            case 6: return [2 /*return*/];
        }
    });
}); };
var create = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var result, imageId_1, tagIds, values, created, err_2;
    var _a, _b, _c, _d, _e, _f;
    return __generator(this, function (_g) {
        switch (_g.label) {
            case 0:
                _g.trys.push([0, 5, , 6]);
                return [4 /*yield*/, db_1.default.query("INSERT INTO images (title, description, path, alt_descr, is_in_gallery, user_id, article_id, category_id)\n\t\t\tVALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
                        (_a = data.title) !== null && _a !== void 0 ? _a : null,
                        (_b = data.description) !== null && _b !== void 0 ? _b : null,
                        data.path,
                        (_c = data.alt_descr) !== null && _c !== void 0 ? _c : null,
                        (_d = data.is_in_gallery) !== null && _d !== void 0 ? _d : false,
                        data.user_id,
                        (_e = data.article_id) !== null && _e !== void 0 ? _e : null,
                        (_f = data.category_id) !== null && _f !== void 0 ? _f : null,
                    ])];
            case 1:
                result = (_g.sent())[0];
                imageId_1 = result.insertId;
                tagIds = Array.isArray(data.tag_ids) ? data.tag_ids : [];
                if (!(tagIds.length > 0)) return [3 /*break*/, 3];
                values = tagIds.map(function (tagId) { return [imageId_1, tagId]; });
                return [4 /*yield*/, db_1.default.query("INSERT INTO images_tags (image_id, tag_id) VALUES ?", [
                        values,
                    ])];
            case 2:
                _g.sent();
                _g.label = 3;
            case 3: return [4 /*yield*/, findById(imageId_1)];
            case 4:
                created = _g.sent();
                if (!created)
                    throw new Error("Impossible de récupérer l'image créée");
                return [2 /*return*/, created];
            case 5:
                err_2 = _g.sent();
                logger_1.default.error(err_2);
                throw err_2;
            case 6: return [2 /*return*/];
        }
    });
}); };
var update = function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
    var allowedFields, updates, values, _i, allowedFields_1, field, res, tagIds, tagValues, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                allowedFields = [
                    "title",
                    "description",
                    "path",
                    "alt_descr",
                    "is_in_gallery",
                    "article_id",
                    "category_id",
                ];
                updates = [];
                values = [];
                for (_i = 0, allowedFields_1 = allowedFields; _i < allowedFields_1.length; _i++) {
                    field = allowedFields_1[_i];
                    if (field in data) {
                        updates.push("".concat(field, " = ?"));
                        values.push(data[field]);
                    }
                }
                if (!(updates.length > 0)) return [3 /*break*/, 2];
                values.push(id);
                return [4 /*yield*/, db_1.default.query("UPDATE images SET ".concat(updates.join(", "), " WHERE id = ?"), values)];
            case 1:
                res = (_a.sent())[0];
                if (res.affectedRows === 0)
                    return [2 /*return*/, null];
                _a.label = 2;
            case 2:
                if (!("tag_ids" in data)) return [3 /*break*/, 5];
                tagIds = Array.isArray(data.tag_ids) ? data.tag_ids : [];
                return [4 /*yield*/, db_1.default.query("DELETE FROM images_tags WHERE image_id = ?", [id])];
            case 3:
                _a.sent();
                if (!(tagIds.length > 0)) return [3 /*break*/, 5];
                tagValues = tagIds.map(function (tagId) { return [id, tagId]; });
                return [4 /*yield*/, db_1.default.query("INSERT INTO images_tags (image_id, tag_id) VALUES ?", [tagValues])];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: return [2 /*return*/, findById(id)];
            case 6:
                err_3 = _a.sent();
                logger_1.default.error(err_3);
                throw err_3;
            case 7: return [2 /*return*/];
        }
    });
}); };
var deleteOne = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var result, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("DELETE FROM images WHERE id = ?", [id])];
            case 1:
                result = (_a.sent())[0];
                return [2 /*return*/, result.affectedRows > 0];
            case 2:
                err_4 = _a.sent();
                logger_1.default.error(err_4);
                throw err_4;
            case 3: return [2 /*return*/];
        }
    });
}); };
var countAll = function () { return __awaiter(void 0, void 0, void 0, function () {
    var rows, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT COUNT(*) as total FROM images")];
            case 1:
                rows = (_a.sent())[0];
                return [2 /*return*/, rows[0].total];
            case 2:
                err_5 = _a.sent();
                logger_1.default.error(err_5);
                throw err_5;
            case 3: return [2 /*return*/];
        }
    });
}); };
var countInGallery = function () { return __awaiter(void 0, void 0, void 0, function () {
    var rows, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT COUNT(*) as total FROM images WHERE is_in_gallery = TRUE")];
            case 1:
                rows = (_a.sent())[0];
                return [2 /*return*/, rows[0].total];
            case 2:
                err_6 = _a.sent();
                logger_1.default.error(err_6);
                throw err_6;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.default = {
    findAllPaginated: findAllPaginated,
    findById: findById,
    create: create,
    update: update,
    deleteOne: deleteOne,
    countAll: countAll,
    countInGallery: countInGallery,
};
