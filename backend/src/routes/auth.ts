import { Router } from "express";
import { ExpressAuth } from "@auth/express";
import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { User as AuthUser } from "@auth/core/types";

import { env, IS_PROD, COOKIE_SECURE } from "../env.js";
import { prisma } from "../utils/prisma.js";

import {
  registerController,
  verifyEmailController,
  resendVerificationController,
} from "../controllers/auth.controller.js";
import { resendVerificationLimiter } from "../middlewares/rateLimit.js";

export const authRouter = Router();

/**
 * Endpoints custom (registro/verify/resend) – mismo router de Auth.js
 * Quedan en /api/auth/*
 */
authRouter.post("/register", registerController);
authRouter.get("/verify", verifyEmailController);
authRouter.post("/resend-verification", resendVerificationLimiter, resendVerificationController);

/**
 * Auth.js (OAuth + Credentials) usando sesiones en BD
 * IMPORTANTE: session.strategy = "database"
 */
const handler = ExpressAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,

  // Usa tus modelos Account/Session/User del schema.prisma
  adapter: PrismaAdapter(prisma),

  // ⇩⇩⇩ CAMBIO CLAVE: sesiones en BD (NO JWT)
  session: { strategy: "database" },

  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
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
            passwordHash: true, // mapeado a "password" en tu schema
            verified: true,
            emailVerified: true,
          },
        });

        if (!user || !user.passwordHash) return null;

        // Bloquear si no está verificado (usa tu doble señal verified + emailVerified)
        const isVerified = !!user.verified || !!user.emailVerified;
        if (!isVerified) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user.id),
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

  // Con estrategia "database" no necesitas callbacks jwt;
  // session callback no es obligatorio, pero puedes enriquecer session.user si quieres.
  callbacks: {
    async signIn() { return true; },
    async session({ session, user }) {
      if (session.user && user) session.user.id = String(user.id);
      return session;
    },
  },

  events: {
    async signIn(m) { console.log('[auth] signIn event userId=', m.user?.id); },
    async session(m) { console.log('[auth] session event userId=', m.session?.user?.id); },
  },


  // Usamos cookies por defecto de Auth.js (no renombramos)
  cookies: {
    // No sobrescribimos sessionToken: dejamos el nombre por defecto
    callbackUrl: { name: "authjs.callback-url", options: { sameSite: "lax", path: "/" } },
    csrfToken: { name: "authjs.csrf-token", options: { sameSite: "lax", path: "/" } },
  },
});

authRouter.use(handler);
