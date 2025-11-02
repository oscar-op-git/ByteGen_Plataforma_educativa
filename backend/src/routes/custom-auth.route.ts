// backend/src/routes/custom-auth.route.ts
import { Router } from "express";
import {
  registerController,
  verifyEmailController,
  resendVerificationController,
} from "../controllers/auth.controller.js";
import { resendVerificationLimiter } from "../middlewares/rateLimit.js"; // renombra el archivo
import { loginController } from "../controllers/login.controller.js";

export const customAuthRouter = Router();

customAuthRouter.post("/register", registerController);
customAuthRouter.post("/login", loginController); // ✅ nuevo endpoint
customAuthRouter.get("/verify", verifyEmailController);
customAuthRouter.post("/resend-verification", resendVerificationLimiter, resendVerificationController);
