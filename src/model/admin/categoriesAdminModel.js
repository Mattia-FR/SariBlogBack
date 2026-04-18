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
var logger_1 = __importDefault(require("../../utils/logger"));
var db_1 = __importDefault(require("../db"));
// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce au mapping explicite, le frontend reçoit toujours des objets strictement conformes à l'interface Category.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.
var findById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, row, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT * FROM categories WHERE id = ?", [id])];
            case 1:
                rows = (_a.sent())[0];
                if (!rows[0])
                    return [2 /*return*/, null];
                row = rows[0];
                return [2 /*return*/, {
                        id: row.id,
                        name: row.name,
                        slug: row.slug,
                        display_order: row.display_order,
                        created_at: row.created_at,
                    }];
            case 2:
                err_1 = _a.sent();
                logger_1.default.error(err_1);
                throw err_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
var create = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, display_order, rows, result, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, db_1.default.getConnection()];
            case 1:
                connection = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 10, 12, 13]);
                return [4 /*yield*/, connection.beginTransaction()];
            case 3:
                _a.sent();
                display_order = void 0;
                if (!(data.display_order === undefined)) return [3 /*break*/, 5];
                return [4 /*yield*/, connection.query("SELECT COALESCE(MAX(display_order), -1) AS max_order FROM categories")];
            case 4:
                rows = (_a.sent())[0];
                display_order = rows[0].max_order + 1;
                return [3 /*break*/, 7];
            case 5:
                // Position fournie : on décale toutes les catégories à partir de cette position
                display_order = data.display_order;
                return [4 /*yield*/, connection.query("UPDATE categories\n\t\t\t\tSET display_order = display_order + 1\n\t\t\t\tWHERE display_order >= ?", [display_order])];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7: return [4 /*yield*/, connection.query("INSERT INTO categories (name, slug, display_order) VALUES (?, ?, ?)", [data.name, data.slug, display_order])];
            case 8:
                result = (_a.sent())[0];
                return [4 /*yield*/, connection.commit()];
            case 9:
                _a.sent();
                return [2 /*return*/, {
                        id: result.insertId,
                        name: data.name,
                        slug: data.slug,
                        display_order: display_order,
                        created_at: new Date().toISOString(),
                    }];
            case 10:
                err_2 = _a.sent();
                return [4 /*yield*/, connection.rollback()];
            case 11:
                _a.sent();
                logger_1.default.error(err_2);
                throw err_2;
            case 12:
                connection.release();
                return [7 /*endfinally*/];
            case 13: return [2 /*return*/];
        }
    });
}); };
var update = function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
    var connection, rows, currentOrder, newOrder, updates, values, result, err_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, db_1.default.getConnection()];
            case 1:
                connection = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 12, 14, 15]);
                return [4 /*yield*/, connection.beginTransaction()];
            case 3:
                _b.sent();
                if (!(data.display_order !== undefined)) return [3 /*break*/, 8];
                return [4 /*yield*/, connection.query("SELECT display_order FROM categories WHERE id = ?", [id])];
            case 4:
                rows = (_b.sent())[0];
                currentOrder = (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.display_order;
                newOrder = data.display_order;
                if (!(currentOrder !== undefined && currentOrder !== newOrder)) return [3 /*break*/, 8];
                if (!(newOrder > currentOrder)) return [3 /*break*/, 6];
                // La catégorie descend : on remonte celles qui sont entre les deux positions
                return [4 /*yield*/, connection.query("UPDATE categories\n\t\t\t\t\t\tSET display_order = display_order - 1\n\t\t\t\t\t\tWHERE id != ? AND display_order > ? AND display_order <= ?", [id, currentOrder, newOrder])];
            case 5:
                // La catégorie descend : on remonte celles qui sont entre les deux positions
                _b.sent();
                return [3 /*break*/, 8];
            case 6: 
            // La catégorie monte : on descend celles qui sont entre les deux positions
            return [4 /*yield*/, connection.query("UPDATE categories\n\t\t\t\t\t\tSET display_order = display_order + 1\n\t\t\t\t\t\tWHERE id != ? AND display_order >= ? AND display_order < ?", [id, newOrder, currentOrder])];
            case 7:
                // La catégorie monte : on descend celles qui sont entre les deux positions
                _b.sent();
                _b.label = 8;
            case 8:
                updates = [];
                values = [];
                if (data.name !== undefined) {
                    updates.push("name = ?");
                    values.push(data.name);
                }
                if (data.slug !== undefined) {
                    updates.push("slug = ?");
                    values.push(data.slug);
                }
                if (data.display_order !== undefined) {
                    updates.push("display_order = ?");
                    values.push(data.display_order);
                }
                values.push(id);
                return [4 /*yield*/, connection.query("UPDATE categories SET ".concat(updates.join(", "), " WHERE id = ?"), values)];
            case 9:
                result = (_b.sent())[0];
                return [4 /*yield*/, connection.commit()];
            case 10:
                _b.sent();
                if (result.affectedRows === 0)
                    return [2 /*return*/, null];
                return [4 /*yield*/, findById(id)];
            case 11: return [2 /*return*/, _b.sent()];
            case 12:
                err_3 = _b.sent();
                return [4 /*yield*/, connection.rollback()];
            case 13:
                _b.sent();
                logger_1.default.error(err_3);
                throw err_3;
            case 14:
                connection.release();
                return [7 /*endfinally*/];
            case 15: return [2 /*return*/];
        }
    });
}); };
var deleteOne = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var result, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("DELETE FROM categories WHERE id = ?", [id])];
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
exports.default = { findById: findById, create: create, update: update, deleteOne: deleteOne };
