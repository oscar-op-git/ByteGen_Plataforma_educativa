import "dotenv/config";

const { AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

if (!AUTH_SECRET) throw new Error("Missing AUTH_SECRET");
if (!GOOGLE_CLIENT_ID)  throw new Error("Missing GOOGLE_CLIENT_ID");
if (!GOOGLE_CLIENT_SECRET) throw new Error("Missing GOOGLE_CLIENT_SECRET");

export const env = {
  AUTH_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ?? 'localhost',

  // Auth.js / JWT
  JWT_EXPIRES: process.env.JWT_EXPIRES ?? '7d',
  
} as const;
