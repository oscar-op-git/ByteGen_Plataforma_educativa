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
app.get("/health", (_req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

// ============================================
// LOGIN CUSTOM (fuera de /api/auth para evitar conflicto con Auth.js)
// ============================================
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

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        verified: true,
        emailVerified: true,
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

    // Crear sesión manualmente
    const sessionToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    // Establecer cookie
    res.cookie("authjs.session-token", sessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires,
    });

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      error: "Error interno",
      message: "Ocurrió un error al iniciar sesión",
    });
  }
});

// Auth routes (Auth.js + custom auth endpoints)
app.use("/api/auth", authRouter);

// Root endpoint
app.get("/", (_req, res) => {
  res.json({ 
    message: "EduMaster API v1.0",
    docs: "/api/docs" 
  });
});

// Error handler (debe ir al final)
app.use(errorHandler);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    message: 'El endpoint solicitado no existe'
  });
});

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🚀 EduMaster API Server Running    ║
╠═══════════════════════════════════════╣
║  Environment: ${env.NODE_ENV.padEnd(23)} ║
║  Port: ${PORT.toString().padEnd(30)} ║
║  URL: http://localhost:${PORT.toString().padEnd(17)} ║
╚═══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});