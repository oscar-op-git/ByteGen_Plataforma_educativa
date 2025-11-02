import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env, CORS_ORIGINS } from "./env.js";
import { errorHandler } from "./middlewares/error.js";
import { authRouter } from "./routes/auth.route.js";
import { customAuthRouter } from "./routes/custom-auth.route.js";
// 🔹 NUEVO: importa tus routers
import legacyRouter from './routes/index.js';           // tus rutas antiguas /users (createUser, etc.)
import roleRoutes from './routes/role.route.js';        // CRUD de roles
import userAdminRoutes from './routes/user.route.js';   // admin: listar usuarios + asignar/quitar rol


const app = express();

app.set("trust proxy", true);


app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.get("/health", (_req, res) => res.json({ ok: true }));

// Auth.js
app.use("/api/auth", authRouter);

// Custom auth (registro/login propio)
app.use("/api/custom", customAuthRouter);

//SUBI YO___MEJORAR
app.use('/api/roles', roleRoutes);            // -> GET /api/roles
app.use('/api/users', userAdminRoutes); // -> GET /api/manage/users


// Manejo de errores
app.use(errorHandler);

app.get("/", (_req, res) => res.send("API funcionando"));
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
