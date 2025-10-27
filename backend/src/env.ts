import "dotenv/config";

const { AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

if (!AUTH_SECRET) throw new Error("Missing AUTH_SECRET");
if (!GOOGLE_CLIENT_ID)  throw new Error("Missing GOOGLE_CLIENT_ID");
if (!GOOGLE_CLIENT_SECRET) throw new Error("Missing GOOGLE_CLIENT_SECRET");

export const env = {
  AUTH_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} as const;