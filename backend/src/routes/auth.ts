// src/routes/auth.ts (handler completo, mínimo viable y estable)
import { Router } from "express";
import { Auth } from "@auth/core";
import { authConfig } from "../auth.config.js";

export const authRouter = Router();

authRouter.post("/_log", (_req, res) => res.status(204).end());

authRouter.use(async (req, res) => {
  const origin = process.env.AUTH_URL || `http://localhost:${process.env.PORT ?? 3000}`;
  const url = new URL(req.originalUrl, origin);

  console.log("[auth] incoming:", req.method, url.pathname + url.search);

  // A) ?provider=google -> /api/auth/signin/google
  if (url.pathname === "/api/auth/signin" && url.searchParams.has("provider")) {
    const provider = url.searchParams.get("provider")!;
    url.pathname = `/api/auth/signin/${provider}`;
    console.log("[auth] normalized (A):", url.pathname + url.search);
  }

  // B) /api/auth/signin/google -> /api/auth/signin?provider=google
  if (url.pathname.startsWith("/api/auth/signin/")) {
    const provider = url.pathname.split("/").pop();
    if (provider && provider !== "signin") {
      url.pathname = "/api/auth/signin";
      if (!url.searchParams.has("provider")) url.searchParams.set("provider", provider);
      console.log("[auth] normalized (B):", url.pathname + "?" + url.searchParams.toString());
    }
  }

  // 303: fuerza GET SOLO si el POST NO trae csrfToken (petición inválida desde UI)
  if (
    req.method === "POST" &&
    (url.pathname === "/api/auth/signin" || url.pathname.startsWith("/api/auth/signin/"))
  ) {
    const ct = String(req.headers["content-type"] || "").toLowerCase();
    let hasCsrf = false;
    if (ct.includes("application/x-www-form-urlencoded") && req.body && typeof req.body === "object") {
      // express.json no parsea urlencoded; si usas solo express.json(), req.body puede venir vacío.
      // Si tienes express.urlencoded({ extended: true }), aquí ya estará el objeto parseado.
      hasCsrf = "csrfToken" in (req.body as Record<string, unknown>);
    }
    if (!hasCsrf) {
      const location = url.pathname + (url.search || "");
      console.log("[auth] force GET via 303 ->", location);
      return res.redirect(303, location);
    }
  }

  // Headers Web
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) headers.set(k, v.join(", "));
    else if (typeof v === "string") headers.set(k, v);
  }

  // Body Web
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

  const request = new Request(url, { method: req.method, headers, body, redirect: "manual" });
  const response = await Auth(request, authConfig);

  // Set-Cookie correcto (array)
  const anyHeaders = response.headers as any;
  const setCookies: string[] | undefined =
    typeof anyHeaders.getSetCookie === "function" ? anyHeaders.getSetCookie() : undefined;
  if (Array.isArray(setCookies) && setCookies.length) {
    res.setHeader("set-cookie", setCookies);
    // console.log("[auth] set-cookie ->", setCookies); // útil para depurar
  }

  // Resto de headers
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "set-cookie") res.setHeader(key, value);
  });

  const text = await response.text();
  res.status(response.status).send(text);
});
