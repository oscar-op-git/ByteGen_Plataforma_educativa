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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
var express_1 = require("express");
var core_1 = require("@auth/core");
var auth_config_js_1 = require("../auth.config.js");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.use(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var baseUrl, url, headers, _i, _a, _b, k, v, hasBody, body, ct, params, request, response, text;
    var _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                baseUrl = process.env.AUTH_URL || "http://localhost:".concat((_c = process.env.PORT) !== null && _c !== void 0 ? _c : 4000);
                url = new URL(req.originalUrl, baseUrl);
                headers = new Headers();
                for (_i = 0, _a = Object.entries(req.headers); _i < _a.length; _i++) {
                    _b = _a[_i], k = _b[0], v = _b[1];
                    if (Array.isArray(v))
                        headers.set(k, v.join(", "));
                    else if (typeof v === "string")
                        headers.set(k, v);
                }
                hasBody = req.method !== "GET" && req.method !== "HEAD";
                body = null;
                if (hasBody) {
                    ct = String(req.headers["content-type"] || "").toLowerCase();
                    if (ct.includes("application/x-www-form-urlencoded")) {
                        params = new URLSearchParams((_d = req.body) !== null && _d !== void 0 ? _d : {});
                        body = params.toString();
                        if (!headers.has("content-type")) {
                            headers.set("content-type", "application/x-www-form-urlencoded; charset=utf-8");
                        }
                    }
                    else if (ct.includes("application/json")) {
                        body = typeof req.body === "string" ? req.body : JSON.stringify((_e = req.body) !== null && _e !== void 0 ? _e : {});
                        if (!headers.has("content-type")) {
                            headers.set("content-type", "application/json; charset=utf-8");
                        }
                    }
                    else {
                        body = typeof req.body === "string" ? req.body : null;
                    }
                }
                request = new Request(url, {
                    method: req.method,
                    headers: headers,
                    body: body, // ✅ BodyInit | null
                    redirect: "manual", // satisface el tipo RequestRedirect
                });
                return [4 /*yield*/, (0, core_1.Auth)(request, auth_config_js_1.authConfig)];
            case 1:
                response = _f.sent();
                // Propaga headers y status
                response.headers.forEach(function (value, key) { return res.setHeader(key, value); });
                return [4 /*yield*/, response.text()];
            case 2:
                text = _f.sent();
                res.status(response.status).send(text);
                return [2 /*return*/];
        }
    });
}); });
