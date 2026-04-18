"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
exports.sendError = sendError;
exports.isHttpError = isHttpError;
function sendError(res, status, message, code) {
    var body = code
        ? { error: message, code: code }
        : { error: message };
    res.status(status).json(body);
}
/** Erreur métier / client avec statut HTTP explicite (à gérer dans le middleware ou le catch du contrôleur). */
var HttpError = /** @class */ (function (_super) {
    __extends(HttpError, _super);
    function HttpError(statusCode, message, code) {
        var _this = _super.call(this, message) || this;
        _this.name = "HttpError";
        _this.statusCode = statusCode;
        _this.code = code;
        return _this;
    }
    return HttpError;
}(Error));
exports.HttpError = HttpError;
function isHttpError(err) {
    return err instanceof HttpError;
}
