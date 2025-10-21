import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Auth } from "@auth/core";
import { authConfig } from "./auth.config.js";
//import { Request, type RequestInit as UndiciRequestInit } from "undici";

const app = express();

// ====== CONFIG ======
app.set("trust proxy", 1);

// CORS: ajusta tu origen del frontend
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true, // necesario para cookies de sesión
  })
);

app.use(express.json());
app.use(cookieParser());

// ====== RUTAS DE PRUEBA ======
app.get("/", (_req, res) => {
  res.send("API funcionando");
});

app.get("/api/courses", (_req, res) => {
  res.json([
    { id: 1, title: "React Básico" },
    { id: 2, title: "Node.js Avanzado" },
  ]);
});

app.use("/api/auth", async (req, res) => {
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) headers.set(k, v.join(","));
    else if (typeof v === "string") headers.set(k, v);
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  let body: string | undefined = undefined;

  if (hasBody) {
    const ct = (req.headers["content-type"] || "").toLowerCase();
    if (ct.includes("application/x-www-form-urlencoded")) {
      body = new URLSearchParams((req.body as Record<string, string>) ?? {}).toString();
      if (!headers.get("content-type")) headers.set("content-type", "application/x-www-form-urlencoded; charset=utf-8");
    } else if (ct.includes("application/json")) {
      body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
      if (!headers.get("content-type")) headers.set("content-type", "application/json; charset=utf-8");
    }
  }

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
    ...(body !== undefined ? { body } : {}),
  };

  const request = new Request(url, init);
  const response = await Auth(request, authConfig);

  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.status(response.status).send(await response.text());
});

// ====== SERVER ======
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
