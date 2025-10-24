import type { AuthConfig } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";

const prisma = new PrismaClient();

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`[Auth] Falta la variable de entorno ${name}`);
  return v;
}

const AUTH_SECRET = requiredEnv("AUTH_SECRET");
// Forzamos Google presentes para evitar estados a medias
const GOOGLE_CLIENT_ID = requiredEnv("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = requiredEnv("GOOGLE_CLIENT_SECRET");

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig: AuthConfig = {
  // Con router montado en /api/auth esto ayuda al parser interno
  basePath: "/api/auth",
  trustHost: true,
  secret: AUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = CredentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,                 // STRING (PK nuevo)
          name: user.name ?? null,
          email: user.email ?? null,
          // image: user.image ?? null,
        };
      },
    }),
    Google({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id; // asegura sub = id
      return token;
    },
    async session({ session, token, user }) {
      const id = user?.id ?? token?.sub ?? null;
      if (session.user && id) (session.user as any).id = id;
      return session;
    },
  },
};
