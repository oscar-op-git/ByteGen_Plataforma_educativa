import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { env } from "./env.js";
import { errorHandler } from "./middlewares/error.js";
import { authRouter } from "./routes/auth.route.js";
import { prisma } from "./utils/prisma.js";
import { loginLimiter } from "./middlewares/rateLimit.js";
import userRouter from "./routes/user.route.js";
import roleRouter from "./routes/role.route.js";
import plantillaRouter from "./routes/plantilla.route.js";
import commentRouter from "./routes/comment.route.js";

const app = express();
//Controlares los tokens:
const isProd = env.NODE_ENV === "production";

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

// Solo logs en desarrollo
if (env.NODE_ENV === "development") {
  app.use(morgan("tiny")); 
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Login optimizado
app.post("/api/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Datos incompletos",
        message: "Email y contraseña son obligatorios",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Optimización: Una sola query con select específico
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        verified: true,
        emailVerified: true,
        id_role_role: true,
        isAdmin: true,
        role: {
          select: {
            id_role: true,
            description: true,
          },
        },
      },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "Email o contraseña incorrectos",
      });
    }

    const isVerified = !!user.verified || !!user.emailVerified;
    if (!isVerified) {
      return res.status(403).json({
        error: "Cuenta no verificada",
        message: "Debes verificar tu correo antes de iniciar sesión",
      });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({
        error: "Credenciales inválidas",
        message: "Email o contraseña incorrectos",
      });
    }

    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    res.cookie("authjs.session-token", sessionToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      domain: isProd ? env.COOKIE_DOMAIN : undefined,
      path: "/",
      expires,
    });

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        roleId: user.id_role_role,
        roleName: user.role?.description ?? null,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({
      error: "Error interno",
      message: "Ocurrió un error al iniciar sesión",
    });
  }
});



app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/roles", roleRouter);

app.use("/api/plantillas", plantillaRouter);
app.use("/api/comments", commentRouter);

app.get("/", (_req, res) => {
  res.json({ message: "EduMaster API" });
});

app.use(errorHandler);

app.use((_req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
  });
});

const PORT = env.PORT;

app.listen(PORT, () => {
  // Log simplificado
  console.log(`🚀 Server: http://localhost:${PORT}`);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});