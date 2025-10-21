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
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const providers: AuthConfig["providers"] = [
  Credentials({
    name: "Credentials",
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = CredentialsSchema.safeParse(raw);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;

      // Prisma Client: modelo User (camelCase -> prisma.user)
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return null;

      return {
        id: user.id, // <-- STRING (nuevo PK)
        name: user.name ?? null,
        email: user.email ?? null,
        // image: user.image ?? null, // opcional
      };
    },
  }),
  ...(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          allowDangerousEmailAccountLinking: false,
        }),
      ]
    : []),
];

export const authConfig: AuthConfig = {
  basePath: "/api/auth",
  adapter: PrismaAdapter(prisma),
  secret: AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" }, // puedes pasar a "database" si quieres usar auth_session
  providers,
  callbacks: {
    async jwt({ token, user }) {
      //"" Cuando hay logfdsffsdfsfsfin, gguarda el id del ususario en el JWT""
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token, user }) {
      // Si usas JWT: token.sub; si usas DB: user.id
      const id = user?.id ?? (token?.sub ?? null);
      if (session.user && id) (session.user as any).id = id;
      return session;
    },
  },
};
