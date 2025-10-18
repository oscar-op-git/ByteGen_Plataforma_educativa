import express from 'express'
import cors from 'cors' //middleware que sirve para que el frontend llame desde otro origen al backend
import cookieParser from "cookie-parser";
import { Auth } from "@auth/core";
import { authConfig } from "./auth.config.js";

const app = express()

// Middlewares globales
app.use(cors()) // permite requests desde tu frontend (Vite). Por ahora acepta cualquier origen por defecto
app.use(express.json()) // parsea body JSON. Pone peticiones en lo pone en req.body

//Aqui van para la autenticación
app.use(cookieParser());
app.set("trust proxy", 1);




//-----------------------------
//AQUI ES DONDE IRÁN LA RUTAS
app.get('/', (_req, res) => {
  //ruta ejemplo
  res.send('API funcionando')
})
app.get('/api/courses', (_req, res) => {
  //ruta ejemplo
  res.json([
    { id: 1, title: 'React Básico' },
    { id: 2, title: 'Node.js Avanzado' },
  ])
})

// Endpoint universal de Auth.js
app.all("/api/auth/*", async (req, res) => {
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  // Normaliza headers a Headers
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (Array.isArray(v)) headers.set(k, v.join(","));
    else if (typeof v === "string") headers.set(k, v);
  }

  // Construye el body en función del método y content-type
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  let body: BodyInit | null = null;

  if (hasBody) {
    const ct = (req.headers["content-type"] || "").toLowerCase();

    if (ct.includes("application/x-www-form-urlencoded")) {
      // req.body es objeto -> conviértelo a form-encoded
      const params = new URLSearchParams(req.body as Record<string, string>);
      body = params.toString();
      if (!headers.get("content-type")) {
        headers.set("content-type", "application/x-www-form-urlencoded; charset=utf-8");
      }
    } else if (ct.includes("application/json")) {
      body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
      if (!headers.get("content-type")) {
        headers.set("content-type", "application/json; charset=utf-8");
      }
    } else {
      // Otros tipos: si no hay string, déjalo en null
      body = typeof req.body === "string" ? (req.body as BodyInit) : null;
    }
  }

  const request = new Request(url, {
    method: req.method,
    headers,
    body,               // ✅ nunca undefined, siempre BodyInit | null
    redirect: "manual",
  });

  const response = await Auth(request, authConfig);

  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  res.status(response.status).send(await response.text());
});


//-------------------------------

// Puerto desde .env o por defecto
const PORT = process.env.PORT || 4000

// Levanta servidor
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
