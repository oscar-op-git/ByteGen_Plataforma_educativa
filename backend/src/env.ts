/*import "dotenv/config";

const { AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

if (!AUTH_SECRET) throw new Error("Missing AUTH_SECRET");
if (!GOOGLE_CLIENT_ID)  throw new Error("Missing GOOGLE_CLIENT_ID");
if (!GOOGLE_CLIENT_SECRET) throw new Error("Missing GOOGLE_CLIENT_SECRET");

export const env = {
  AUTH_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} as const;*/
 // backend/src/env.ts
// src/env.ts
import "dotenv/config";

const must = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k}`); // ✅ CORREGIDO: template literal
  return v;
};

const num = (k: string, d: number) => (process.env[k] ? Number(process.env[k]) : d);

const bool = (k: string, d = false) =>
  process.env[k] ? ["true", "1", "yes", "on"].includes(process.env[k]!.toLowerCase()) : d;

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: num("PORT", 3000),
  
  // URLs base
  API_BASE_URL: process.env.API_BASE_URL ?? must("AUTH_URL"),
  APP_BASE_URL: process.env.APP_BASE_URL ?? must("FRONTEND_ORIGIN"),
  AUTH_URL: must("AUTH_URL"),
  FRONTEND_ORIGIN: must("FRONTEND_ORIGIN"),
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ?? "localhost",
  
  // DB
  DATABASE_URL: must("DATABASE_URL"),
  DIRECT_URL: must("DIRECT_URL"),
  
  // Auth
  AUTH_SECRET: must("AUTH_SECRET"),
  //JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "dev_access_secret_change_me",
  //ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL ?? "15m",
  //REFRESH_TTL_DAYS: num("REFRESH_TTL_DAYS", 7),
  
  // OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  
  // Email
  MAIL_PROVIDER: process.env.MAIL_PROVIDER ?? "smtp",
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  SMTP_SECURE: bool("SMTP_SECURE", true),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  MAIL_FROM: process.env.MAIL_FROM ?? process.env.EMAIL_FROM ?? "no-reply@edumaster.com",
} as const;

export const EMAIL_CONFIGURED = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
export const IS_PROD = (process.env.NODE_ENV ?? "development") === "production";
export const COOKIE_SECURE = IS_PROD;
export const CORS_ORIGINS = [
  env.FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
