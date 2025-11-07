import { Router } from "express";
import { ExpressAuth } from "@auth/express";
import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { User as AuthUser } from "@auth/core/types";
import { env } from "../env.js";
import { prisma } from "../utils/prisma.js";
import {
  registerController,
  verifyEmailController,
  resendVerificationController,
} from "../controllers/auth.controller.js";
import { 
  resendVerificationLimiter, 
  registerLimiter,
  loginLimiter 
} from "../middlewares/rateLimit.js";

export const authRouter = Router();

// ============================================
// ENDPOINTS CUSTOM (registro/verificación)
// IMPORTANTE: Estos deben ir ANTES de montar Auth.js
// ============================================
authRouter.post("/register", registerLimiter, registerController);
authRouter.get("/verify", verifyEmailController);
authRouter.post("/resend-verification", resendVerificationLimiter, resendVerificationController);

// ============================================
// AUTH.JS CONFIGURATION
// ============================================
const handler = ExpressAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  
  session: { 
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // actualizar cada 24h
  },

  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // ✅ Vinculación automática de cuentas
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (creds): Promise<AuthUser | null> => {
        const email = creds?.email?.toString().trim().toLowerCase();
        const password = creds?.password?.toString() || "";

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true,
            verified: true,
            emailVerified: true,
          },
        });

        if (!user || !user.passwordHash) return null;

        // ✅ Verificar que el usuario esté verificado
        const isVerified = !!user.verified || !!user.emailVerified;
        if (!isVerified) {
          throw new Error("Debes verificar tu correo antes de iniciar sesión");
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email ?? null,
          name: user.name ?? null,
          image: user.image ?? null,
        };
      },
    }),
  ],

  pages: {
    signIn: `/login`,
    error: `/login`,
    verifyRequest: `/check-email`,
    newUser: `/home`,
  },

  callbacks: {
    async signIn({ user, account }) {
      // ✅ Usuarios de OAuth se marcan como verificados automáticamente
      if (account?.provider === "google") {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            verified: true,
            emailVerified: new Date()
          },
        });
      }
      return true;
    },

    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
  },

  events: {
    async signIn(message) {
      console.log('✅ [auth] Usuario autenticado:', message.user?.email);
    },
    async signOut(message) {
      console.log('👋 [auth] Usuario cerró sesión');
    },
  },

  cookies: {
    sessionToken: {
      name: `authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: env.NODE_ENV === 'production',
      },
    },
  },
});

// Rate limit para endpoints de Auth.js
authRouter.use("/signin", loginLimiter);
authRouter.use("/callback/credentials", loginLimiter);

// Mount Auth.js handlers
authRouter.use(handler);

// ============================================
// LOG DE RUTAS REGISTRADAS (solo en desarrollo)
// ============================================
if (env.NODE_ENV === 'development') {
  console.log('\n🔐 [Auth Routes] Registered:');
  console.log('   GET  /api/auth/signin');
  console.log('   POST /api/auth/signin');
  console.log('   GET  /api/auth/callback/:provider');
  console.log('   POST /api/auth/callback/:provider');
  console.log('   GET  /api/auth/signout');
  console.log('   POST /api/auth/signout');
  console.log('   GET  /api/auth/session');
  console.log('   GET  /api/auth/csrf');
  console.log('   GET  /api/auth/providers');
  console.log('\n📝 [Custom Routes] Registered:');
  console.log('   POST /api/auth/register');
  console.log('   GET  /api/auth/verify');
  console.log('   POST /api/auth/resend-verification');
  console.log('   POST /api/auth/login');
  console.log('');
}
