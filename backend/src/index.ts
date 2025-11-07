// backend/src/index.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./env.js";
import { errorHandler } from "./middlewares/error.js";
import { authRouter } from "./routes/auth.route.js";
import { prisma } from "./utils/prisma.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Health check
// Health check
app.get("/health", (_req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

/**
 * 🔁 Rutas de redirección a FRONTEND
 * Auth.js redirige a "http://localhost:3000/home"
 * aquí lo mandamos a "http://localhost:5173/home"
 */
const redirectToFrontend =
  (path: string) => (req: express.Request, res: express.Response) => {
    const query = req.url.split("?")[1];
    const target = `${env.FRONTEND_ORIGIN}${path}${query ? `?${query}` : ""}`;
    return res.redirect(target);
  };

// Cuando el backend reciba /home, va al /home de React
app.get("/home", redirectToFrontend("/home"));

// opcionalmente también /login, por si Auth.js manda ahí algo
app.get("/login", redirectToFrontend("/login"));

// Auth routes
app.use("/api/auth", authRouter);

// Root endpoint (lo puedes dejar como está)
app.get("/", (_req, res) => {
  res.json({ 
    message: "EduMaster API v1.0",
    docs: "/api/docs" 
  });
});