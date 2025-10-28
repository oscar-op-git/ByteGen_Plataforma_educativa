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

app.set("trust proxy", true);


app.use(
  cors({
    origin: CORS_ORIGINS,
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

// Manejo de errores
app.use(errorHandler);

app.get("/", (_req, res) => res.send("API funcionando"));
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
