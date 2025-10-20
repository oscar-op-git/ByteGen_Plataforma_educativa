import { Router } from "express";
import { Auth } from "@auth/core";
import { authConfig } from "../auth.config.js";

export const authRouter = Router();

authRouter.use(async (req, res) => {
  const baseUrl = process.env.AUTH_URL || `http://localhost:${process.env.PORT ?? 4000}`;
  const url = new URL(req.originalUrl, baseUrl);

  // Construye Headers de forma segura (sin undefined)
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) headers.set(k, v.join(", "));
    else if (typeof v === "string") headers.set(k, v);
  }

  // Body debe ser BodyInit | null (nunca undefined)
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  let body: BodyInit | null = null;

  if (hasBody) {
    const ct = String(req.headers["content-type"] || "").toLowerCase();

    if (ct.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams((req.body as Record<string, string>) ?? {});
      body = params.toString();
      if (!headers.has("content-type")) {
        headers.set("content-type", "application/x-www-form-urlencoded; charset=utf-8");
      }
    } else if (ct.includes("application/json")) {
      body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
      if (!headers.has("content-type")) {
        headers.set("content-type", "application/json; charset=utf-8");
      }
    } else {
      body = typeof req.body === "string" ? req.body : null;
    }
  }

  const request = new Request(url, {
    method: req.method,
    headers,
    body,                     // ✅ BodyInit | null
    redirect: "manual",       // satisface el tipo RequestRedirect
  });

  const response = await Auth(request, authConfig);

  // Propaga headers y status
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const text = await response.text();
  res.status(response.status).send(text);
});
