import { ExpressAuth } from '@auth/express';
import Google from '@auth/core/providers/google';
import Credentials from '@auth/core/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env, COOKIE_SECURE } from './env.js';
import type { User as AuthUser } from '@auth/core/types';

const prisma = new PrismaClient();

export const authHandler = ExpressAuth({
  secret: env.AUTH_SECRET,
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },

  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
        name: 'credentials',
        credentials: {
            email: { label: 'Email', type: 'text' },
            password: { label: 'Password', type: 'password' },
    },
    authorize: async (creds, _req): Promise<AuthUser | null> => {
        const email = creds?.email?.toString().toLowerCase();
        const password = creds?.password?.toString() || '';
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        if (!user.verified && !user.emailVerified) return null;

            // Ajusta tipos a AuthUser (email/name pueden ser null)
            const result: AuthUser = {
            id: user.id,
            email: user.email ?? null,
            name: user.name ?? null,
            image: user.image ?? null,
            };
            return result;
        },
    }),
  ],

  pages: {
    signIn: `${env.FRONTEND_ORIGIN}/login`,
    error: `${env.FRONTEND_ORIGIN}/login`,
    verifyRequest: `${env.FRONTEND_ORIGIN}/check-email`,
    newUser: `${env.FRONTEND_ORIGIN}/welcome`,
  },

  callbacks: {
    async signIn({ account }) {
      if (account?.provider === 'google') return true;
      return true;
    },
    async session({ session, user }) {
      if (session.user && user?.id) (session.user as any).id = user.id;
      return session;
    },
  },

  cookies: {
    sessionToken: {
      name: '__Secure-authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: COOKIE_SECURE,      // true en producción
        domain: env.COOKIE_DOMAIN,  // localhost en dev
      },
    },
    callbackUrl: {
      name: 'authjs.callback-url',
      options: { sameSite: 'lax', path: '/' },
    },
    csrfToken: {
      name: 'authjs.csrf-token',
      options: { sameSite: 'lax', path: '/' },
    },
  },
});
