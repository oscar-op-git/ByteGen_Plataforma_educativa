import { Router } from "express"
import { ExpressAuth } from "@auth/express"
import Google from "@auth/express/providers/google"
import { env } from "../env.js";
import { register, logout, ping } from "../controllers/auth.controller.js";
import Credentials from "@auth/express/providers/credentials"

export const authRouter = Router()

authRouter.post('/register', register)
authRouter.post('/logout', logout)
authRouter.get('/ping', ping)

authRouter.use(
  "/",
  ExpressAuth({
    providers: [
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }),
      Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "Password", type: "password" },
        },
        // LOGIN SIN VERIFICACIÓN DE EMAIL: solo valida usuario/clave.
        authorize: async (credentials, req) => {
          const email = credentials?.email?.toString() || ""
          const password = credentials?.password?.toString() || ""
          if (!email || !password) throw new Error("Datos inválidos")

          // Prisma lookup
          const { prisma } = await import("../db/prisma.js")
          const { compare } = await import("bcryptjs")

          const user = await prisma.user.findFirst({ 
            where: { email },
            select: { id_user: true, passwordHash: true, role: true, email: true } 
          })
          if (!user) {
            // No se encuentra usuario
            throw new Error("Credenciales incorrectas")
          }

          return { 
            id: user.id_user.toString(), 
            email: user.email!, // Asumimos que el email no es null aquí
            role: user.role,
            // Agrega cualquier otro campo que necesites en el token/sesión
          } as any
        },
      }),
    ],
    secret: env.AUTH_SECRET,
    // Cookies httpOnly compartibles con tu FRONTEND_ORIGIN en dev:
    // (para prod pon secure:true y domain real)
    useSecureCookies: false,
    cookies: {
      sessionToken: {
        name: "authjs.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: false,
          domain: env.COOKIE_DOMAIN ? env.COOKIE_DOMAIN : "localhost", // si ya tienes env.COOKIE_DOMAIN cámbialo aquí
        },
      },
    },


    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.sub = (user as any).id
            ; (token as any).role = (user as any).role ?? "user"
        }
        return token
      },
      async session({ session, token }) {
        if (session.user) {
          ; (session.user as any).id = token.sub
            ; (session.user as any).role = (token as any).role ?? "user"
        }
        return session
      },
      async redirect({ url, baseUrl }) {
        // Permite redirecciones al front
        if (url.startsWith("http://localhost:5173")) return url;
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        return baseUrl; // fallback
      },
    },
    // ajustar cookies/redirects aquí (por frontend en otro dominio)
  })
)
