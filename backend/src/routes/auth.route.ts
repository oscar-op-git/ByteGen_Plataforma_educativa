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
    // ajustar cookies/redirects aquí (por frontend en otro dominio)
  })
)
