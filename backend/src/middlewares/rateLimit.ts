import rateLimit from "express-rate-limit";

export const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    error: 'Demasiados intentos',
    message: 'Has superado el límite de intentos. Intenta más tarde.' 
  }
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiados registros',
    message: 'Has intentado registrarte muchas veces. Intenta más tarde.'
  }
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Demasiados intentos de login',
    message: 'Has intentado iniciar sesión demasiadas veces. Intenta más tarde.'
  }
});