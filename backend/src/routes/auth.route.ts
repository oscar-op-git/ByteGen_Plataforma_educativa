import { Router } from "express"
import { ExpressAuth } from "@auth/express"
import Google from "@auth/express/providers/google"
import { env } from "../env.js";

export const authRouter = Router()

authRouter.use(
  "/",
  ExpressAuth({
    providers: [
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }),
    ],
    secret: env.AUTH_SECRET,
    callbacks: {
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
