import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Auth } from "@auth/core";
import { authConfig } from "./auth.config.js";

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

// ====== AUTH.JS (Express 5: usar app.use con prefijo) ======
app.use("/api/auth", async (req, res) => {
  // Usa AUTH_URL para construir la URL base (recomendado con proxies)
  const baseUrl =
    process.env.AUTH_URL || `http://localhost:${process.env.PORT ?? 4000}`;
  const url = new URL(req.originalUrl, baseUrl);

  // Normaliza headers a Web Headers
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) headers.set(k, v.join(","));
    else if (typeof v === "string") headers.set(k, v);
  }

  // Construcción de body compatible (Auth.js espera Web Request)
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  let body: BodyInit | null = null;

  if (hasBody) {
    const ct = (req.headers["content-type"] || "").toLowerCase();
    if (ct.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(
        (req.body as Record<string, string>) ?? {}
      );
      body = params.toString();
      if (!headers.get("content-type")) {
        headers.set(
          "content-type",
          "application/x-www-form-urlencoded; charset=utf-8"
        );
      }
    } else if (ct.includes("application/json")) {
      body =
        typeof req.body === "string"
          ? (req.body as BodyInit)
          : JSON.stringify(req.body ?? {});
      if (!headers.get("content-type")) {
        headers.set("content-type", "application/json; charset=utf-8");
      }
    } else {
      body = typeof req.body === "string" ? (req.body as BodyInit) : null;
    }
  }

  const request = new Request(url, {
    method: req.method,
    headers,
    body, // BodyInit | null (nunca undefined)
    redirect: "manual",
  });

  const response = await Auth(request, authConfig);

  // Propaga headers y status
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const text = await response.text();
  res.status(response.status).send(text);
});

// ====== SERVER ======
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
