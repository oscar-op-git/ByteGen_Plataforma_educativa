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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authConfig = void 0;
var credentials_1 = require("@auth/core/providers/credentials");
var google_1 = require("@auth/core/providers/google");
var prisma_adapter_1 = require("@auth/prisma-adapter");
var client_1 = require("@prisma/client");
var bcrypt_1 = require("bcrypt");
var zod_1 = require("zod");
var prisma = new client_1.PrismaClient();
function requiredEnv(name) {
    var v = process.env[name];
    if (!v)
        throw new Error("[Auth] Falta la variable de entorno ".concat(name));
    return v;
}
var AUTH_SECRET = requiredEnv("AUTH_SECRET");
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
var CredentialsSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
var providers = __spreadArray([
    (0, credentials_1.default)({
        name: "Credentials",
        credentials: { email: {}, password: {} },
        authorize: function (raw) {
            return __awaiter(this, void 0, void 0, function () {
                var parsed, _a, email, password, user, ok;
                var _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            parsed = CredentialsSchema.safeParse(raw);
                            if (!parsed.success)
                                return [2 /*return*/, null];
                            _a = parsed.data, email = _a.email, password = _a.password;
                            return [4 /*yield*/, prisma.user.findUnique({ where: { email: email } })];
                        case 1:
                            user = _d.sent();
                            if (!(user === null || user === void 0 ? void 0 : user.passwordHash))
                                return [2 /*return*/, null];
                            return [4 /*yield*/, bcrypt_1.default.compare(password, user.passwordHash)];
                        case 2:
                            ok = _d.sent();
                            if (!ok)
                                return [2 /*return*/, null];
                            return [2 /*return*/, {
                                    id: user.id, // <-- STRING (nuevo PK)
                                    name: (_b = user.name) !== null && _b !== void 0 ? _b : null,
                                    email: (_c = user.email) !== null && _c !== void 0 ? _c : null,
                                    // image: user.image ?? null, // opcional
                                }];
                    }
                });
            });
        },
    })
], (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
    ? [
        (0, google_1.default)({
            clientId: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: false,
        }),
    ]
    : []), true);
exports.authConfig = {
    adapter: (0, prisma_adapter_1.PrismaAdapter)(prisma),
    secret: AUTH_SECRET,
    trustHost: true,
    session: { strategy: "jwt" }, // puedes pasar a "database" si quieres usar auth_session
    providers: providers,
    callbacks: {
        jwt: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var token = _b.token, user = _b.user;
                return __generator(this, function (_c) {
                    //"" Cuando hay logfdsffsdfsfsfin, gguarda el id del ususario en el JWT""
                    if (user === null || user === void 0 ? void 0 : user.id)
                        token.sub = user.id;
                    return [2 /*return*/, token];
                });
            });
        },
        session: function (_a) {
            return __awaiter(this, arguments, void 0, function (_b) {
                var id;
                var _c, _d;
                var session = _b.session, token = _b.token, user = _b.user;
                return __generator(this, function (_e) {
                    id = (_c = user === null || user === void 0 ? void 0 : user.id) !== null && _c !== void 0 ? _c : ((_d = token === null || token === void 0 ? void 0 : token.sub) !== null && _d !== void 0 ? _d : null);
                    if (session.user && id)
                        session.user.id = id;
                    return [2 /*return*/, session];
                });
            });
        },
    },
};
