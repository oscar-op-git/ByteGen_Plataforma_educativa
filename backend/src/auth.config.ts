import type { AuthConfig } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import Google from "@auth/core/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { z } from "zod";

const prisma = new PrismaClient();

// Helper para variables obligatorias
function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`[Auth] Falta la variable de entorno ${name}`);
  }
  return v;
}

//Aseguramos string, nunca undefined
const AUTH_SECRET: string = requiredEnv("AUTH_SECRET");

//Google necesita estas 2 variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Tipamos providers de forma segura para TS
const providers: AuthConfig["providers"] = [
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

      return { id: user.id, name: user.name ?? null, email: user.email ?? null };
    },
  }),
  // Agrega Google sólo si hay credenciales (evita errores en dev)
  ...(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: true,
        }),
      ]
    : []),
];

export const authConfig: AuthConfig = {
  adapter: PrismaAdapter(prisma),
  secret: AUTH_SECRET,       //ya no es string | undefined
  trustHost: true,
  session: { strategy: "jwt" }, // o "database" si usas la tabla Session
  providers,
  callbacks: {
    async session({ session, token, user }) {
      // Si usas JWT, el ID vendrá en token.sub; si usas DB, viene en user
      const id = user?.id ?? (token?.sub ?? null);
      if (session.user && id) (session.user as any).id = id;
      return session;
    },
  },
};
