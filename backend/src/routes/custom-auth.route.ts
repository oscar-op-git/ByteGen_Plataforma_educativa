// backend/src/routes/custom-auth.route.ts
import { Router } from "express";
import {
  registerController,
  verifyEmailController,
  resendVerificationController,
} from "../controllers/auth.controller.js";
import { resendVerificationLimiter } from "../middlewares/rateLimit.js"; // renombra el archivo

export const customAuthRouter = Router();

customAuthRouter.post("/register", registerController);
customAuthRouter.get("/verify", verifyEmailController);
customAuthRouter.post("/resend-verification", resendVerificationLimiter, resendVerificationController);
