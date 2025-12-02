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

// edpoints personalizados
authRouter.post("/register", registerLimiter, registerController);
authRouter.get("/verify", verifyEmailController);
authRouter.post("/resend-verification", resendVerificationLimiter, resendVerificationController);

//------agregando cookies de produccion--------.
const isProd = env.NODE_ENV === "production";

// configuración de Auth.js
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
      allowDangerousEmailAccountLinking: true, // Permitir vinculación de cuentas con el mismo email
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

        // Verificar si el email está confirmado
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
    signIn: `${env.FRONTEND_ORIGIN}/login`,
    error: `${env.FRONTEND_ORIGIN}/login`,
    verifyRequest: `${env.FRONTEND_ORIGIN}/check-email`,
    newUser: `${env.FRONTEND_ORIGIN}/home`,
  },

  callbacks: {
    async signIn({ user, account }) {
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

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      try {
        const parsed = new URL(url);
        const frontendOrigin = env.FRONTEND_ORIGIN;

        if (parsed.origin === baseUrl) {
          return url;
        }

        if (parsed.origin === frontendOrigin) {
          return url;
        }
      } catch (e) {
        console.error('[auth redirect] URL inválida:', url, e);
      }
      return `${env.FRONTEND_ORIGIN}/login`;
    },

    async session({ session, user }) {
      // session.user viene de Auth.js, `user` es lo que devuelve el adapter
      if (!session.user || !user) return session;

      // Cargamos de Prisma la info completa + rol
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id as string },
        select: {
          id: true,
          email: true,
          name: true,
          verified: true,
          emailVerified: true,
          isAdmin: true,
          id_role_role: true,
          role: {
            select: {
              id_role: true,
              description: true,
            },
          },
        },
      });

      if (!dbUser) return session;

      session.user.id = dbUser.id;
      session.user.email = dbUser.email ?? session.user.email;
      session.user.name = dbUser.name ?? session.user.name;

      // Campos extra que quieres usar en el frontend:
      (session.user as any).verified =
        dbUser.verified ?? !!dbUser.emailVerified;
      (session.user as any).isAdmin = dbUser.isAdmin;
      (session.user as any).roleId = dbUser.id_role_role;
      (session.user as any).roleName = dbUser.role?.description ?? null;

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
        sameSite: isProd ? "none" : "lax",
        path: '/',
        secure: isProd,
        domain: isProd ? env.COOKIE_DOMAIN : undefined,
      },
    },
    csrfToken: {
      name: "authjs.csrf-token",
      options: {
        httpOnly: true,
        path: "/",
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        domain: isProd ? env.COOKIE_DOMAIN : undefined,
      },
    },
  },
});

// Limitar intentos de login
authRouter.use("/signin", loginLimiter);
authRouter.use("/callback/credentials", loginLimiter);

authRouter.use(handler);
