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
// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Grâce aux transformations (toDateString) et au mapping explicite après jointure users, le frontend reçoit toujours des objets strictement conformes à l'interface Comment.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.
// biome-ignore lint/suspicious/noExplicitAny: mysql2 row
var mapRowToComment = function (row) {
    var _a, _b, _c, _d, _e, _f;
    var firstname = row.user_firstname != null && row.user_firstname !== ""
        ? row.user_firstname
        : ((_a = row.guest_firstname) !== null && _a !== void 0 ? _a : null);
    var lastname = row.user_lastname != null && row.user_lastname !== ""
        ? row.user_lastname
        : ((_b = row.guest_lastname) !== null && _b !== void 0 ? _b : null);
    return {
        id: row.id,
        text: row.text,
        created_at: (_c = (0, dateHelpers_1.toDateString)(row.created_at)) !== null && _c !== void 0 ? _c : "",
        status: row.status,
        user_id: row.user_id,
        username: (_d = row.username) !== null && _d !== void 0 ? _d : null,
        avatar: (_e = row.avatar) !== null && _e !== void 0 ? _e : null,
        firstname: firstname,
        lastname: lastname,
        email: (_f = row.email) !== null && _f !== void 0 ? _f : null,
    };
};
var findById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var rows, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT\n\t\t\t\tc.id,\n\t\t\t\tc.text,\n\t\t\t\tc.created_at,\n\t\t\t\tc.status,\n\t\t\t\tc.user_id,\n\t\t\t\tu.username,\n\t\t\t\tu.avatar,\n\t\t\t\tu.firstname   AS user_firstname,\n\t\t\t\tu.lastname    AS user_lastname,\n\t\t\t\tc.firstname   AS guest_firstname,\n\t\t\t\tc.lastname    AS guest_lastname,\n\t\t\t\tc.email\n\t\t\tFROM comments c\n\t\t\tLEFT JOIN users u ON c.user_id = u.id\n\t\t\tWHERE c.id = ?", [id])];
            case 1:
                rows = (_a.sent())[0];
                if (!rows[0])
                    return [2 /*return*/, null];
                return [2 /*return*/, mapRowToComment(rows[0])];
            case 2:
                err_1 = _a.sent();
                logger_1.default.error(err_1);
                throw err_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
var findAllPaginated = function (page, limit, status) { return __awaiter(void 0, void 0, void 0, function () {
    var offset, whereClause, countParams, listParams, countResult, total, rows, comments, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                offset = (page - 1) * limit;
                whereClause = status ? "WHERE c.status = ?" : "";
                countParams = status ? [status] : [];
                listParams = status ? [status, limit, offset] : [limit, offset];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, db_1.default.query("SELECT COUNT(*) as total FROM comments c ".concat(whereClause), countParams)];
            case 2:
                countResult = (_a.sent())[0];
                total = countResult[0].total;
                return [4 /*yield*/, db_1.default.query("SELECT\n\t\t\t\tc.id,\n\t\t\t\tc.text,\n\t\t\t\tc.created_at,\n\t\t\t\tc.status,\n\t\t\t\tc.user_id,\n\t\t\t\tu.username,\n\t\t\t\tu.avatar,\n\t\t\t\tu.firstname   AS user_firstname,\n\t\t\t\tu.lastname    AS user_lastname,\n\t\t\t\tc.firstname   AS guest_firstname,\n\t\t\t\tc.lastname    AS guest_lastname,\n\t\t\t\tc.email\n\t\t\tFROM comments c\n\t\t\tLEFT JOIN users u ON c.user_id = u.id\n\t\t\t".concat(whereClause, "\n\t\t\tORDER BY c.created_at DESC\n\t\t\tLIMIT ? OFFSET ?"), listParams)];
            case 3:
                rows = (_a.sent())[0];
                comments = rows.map(function (row) { return mapRowToComment(row); });
                return [2 /*return*/, { comments: comments, total: total }];
            case 4:
                err_2 = _a.sent();
                logger_1.default.error(err_2);
                throw err_2;
            case 5: return [2 /*return*/];
        }
    });
}); };
/** Totaux pour les onglets (tous statuts confondus). */
var findTabCounts = function () { return __awaiter(void 0, void 0, void 0, function () {
    var rows, r, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("SELECT\n\t\t\t\tCOUNT(*) AS total,\n\t\t\t\tCOALESCE(SUM(c.status = 'pending'), 0) AS pending,\n\t\t\t\tCOALESCE(SUM(c.status = 'approved'), 0) AS approved,\n\t\t\t\tCOALESCE(SUM(c.status = 'rejected'), 0) AS rejected,\n\t\t\t\tCOALESCE(SUM(c.status = 'spam'), 0) AS spam\n\t\t\tFROM comments c")];
            case 1:
                rows = (_a.sent())[0];
                r = rows[0];
                return [2 /*return*/, {
                        total: Number(r.total),
                        pending: Number(r.pending),
                        approved: Number(r.approved),
                        rejected: Number(r.rejected),
                        spam: Number(r.spam),
                    }];
            case 2:
                err_3 = _a.sent();
                logger_1.default.error(err_3);
                throw err_3;
            case 3: return [2 /*return*/];
        }
    });
}); };
var updateStatus = function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
    var status_1, result, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                status_1 = data.status;
                return [4 /*yield*/, db_1.default.query("UPDATE comments SET status = ? WHERE id = ?", [status_1, id])];
            case 1:
                result = (_a.sent())[0];
                if (result.affectedRows === 0) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, findById(id)];
            case 2:
                err_4 = _a.sent();
                logger_1.default.error(err_4);
                throw err_4;
            case 3: return [2 /*return*/];
        }
    });
}); };
var deleteOne = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var result, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, db_1.default.query("DELETE FROM comments WHERE id = ?", [id])];
            case 1:
                result = (_a.sent())[0];
                return [2 /*return*/, result.affectedRows > 0];
            case 2:
                err_5 = _a.sent();
                logger_1.default.error(err_5);
                throw err_5;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.default = {
    findAllPaginated: findAllPaginated,
    findTabCounts: findTabCounts,
    findById: findById,
    updateStatus: updateStatus,
    deleteOne: deleteOne,
};
