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
var logger_1 = __importDefault(require("../utils/logger"));
var messagesAdminModel_1 = __importDefault(require("./admin/messagesAdminModel"));
var db_1 = __importDefault(require("./db"));
var findById = messagesAdminModel_1.default.findById;
// J'ai choisi d'utiliser any pour les résultats bruts de MySQL afin de simplifier le Model et rester concentré sur la logique métier.
// Le message renvoyé après création passe par messagesAdminModel.findById, qui applique toDateString ; le frontend reçoit donc un objet conforme à l'interface Message.
// Ce choix est donc sécurisé côté métier, lisible, et maintenable, tout en évitant des typages MySQL trop complexes qui n'apporteraient rien pour ce projet.
var create = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var result, newMessage, err_1;
    var _a, _b, _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 3, , 4]);
                return [4 /*yield*/, db_1.default.query("INSERT INTO messages (firstname, lastname, email, username, ip, subject, text, user_id)\n\t\t\tVALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
                        (_a = data.firstname) !== null && _a !== void 0 ? _a : null,
                        (_b = data.lastname) !== null && _b !== void 0 ? _b : null,
                        data.email,
                        (_c = data.username) !== null && _c !== void 0 ? _c : null,
                        (_d = data.ip) !== null && _d !== void 0 ? _d : null,
                        data.subject,
                        data.text,
                        (_e = data.user_id) !== null && _e !== void 0 ? _e : null,
                    ])];
            case 1:
                result = (_f.sent())[0];
                return [4 /*yield*/, findById(result.insertId)];
            case 2:
                newMessage = _f.sent();
                if (!newMessage) {
                    throw new Error("Impossible de récupérer le message créé");
                }
                return [2 /*return*/, newMessage];
            case 3:
                err_1 = _f.sent();
                logger_1.default.error(err_1);
                throw err_1;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.default = {
    create: create,
};
