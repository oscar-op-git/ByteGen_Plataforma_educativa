import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env, CORS_ORIGINS } from "./env.js";
import { errorHandler } from "./middlewares/error.js";
import { authRouter } from "./routes/auth.route.js";
import { customAuthRouter } from "./routes/custom-auth.route.js";

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Auth.js
app.use("/api/auth", authRouter);

// Custom auth (registro/login propio)
app.use("/api/custom", customAuthRouter);

// Manejo de errores
app.use(errorHandler);

// Si está detrás de un proxy (ej. Heroku, Nginx), confiar en el primer proxy,REVISAR ESTO
app.set("trust proxy", 1);

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT} (AUTH_URL=${env.AUTH_URL})`);
});
