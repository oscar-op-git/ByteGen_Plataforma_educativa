import { Router } from "express";
import { ExpressAuth } from "@auth/express";
import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { User as AuthUser } from "@auth/core/types";
import { env, COOKIE_SECURE, IS_PROD } from "../env.js";
import { prisma } from "../utils/prisma.js";

const COOKIE_NAME = "authjs.session-token";

const handler = ExpressAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,

  // Mantén adapter para OAuth (Google) → persiste User/Account
  adapter: PrismaAdapter(prisma),

  // 🔄 Cambiamos a JWT
  session: { strategy: "jwt" },

  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (creds): Promise<AuthUser | null> => {
        const email = creds?.email?.toString();
        const password = creds?.password?.toString() || "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email }, // asegúrate de normalizar en registro si usas lower-case
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            passwordHash: true, // o 'password' según tu schema
          }
        });

        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user.id),
          email: user.email ?? null,
          name: user.name ?? null,
          image: user.image ?? null
        };
      }
    })
  ],

  pages: {
    signIn: `/login`,
    error: `/login`,
    verifyRequest: `/check-email`,
    newUser: `/home` // o elimina esta línea si no quieres paso intermedio
  },

  callbacks: {
    async signIn() {
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string | undefined;
        session.user.name = token.name as string | null | undefined;
        session.user.email = token.email as string | null | undefined;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("http://localhost:5173")) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },

  cookies: {
    sessionToken: {
      name: COOKIE_NAME,
      options: {
        httpOnly: true,
        sameSite: "lax",   // con proxy al mismo origen va bien
        path: "/",
        secure: COOKIE_SECURE, // false en http local, true en https prod
        ...(IS_PROD && env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
      }
    },
    callbackUrl: { name: "authjs.callback-url", options: { sameSite: "lax", path: "/" } },
    csrfToken: { name: "authjs.csrf-token", options: { sameSite: "lax", path: "/" } }
  }
});

export const authRouter = Router();
authRouter.use(handler);
