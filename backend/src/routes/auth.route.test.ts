// src/routes/auth.route.test.ts
import express from 'express';
import request from 'supertest';

// 🔹 Mock: rate limits (para que no molesten en tests)
jest.mock('../middlewares/rateLimit.js', () => ({
  registerLimiter: (_req: any, _res: any, next: any) => next(),
  resendVerificationLimiter: (_req: any, _res: any, next: any) => next(),
  loginLimiter: (_req: any, _res: any, next: any) => next(),
}));

// 🔹 Mock: controllers (solo para probar routing)
jest.mock('../controllers/auth.controller.js', () => ({
  registerController: (req: any, res: any) => {
    return res.status(201).json({
      ok: true,
      route: 'register',
      body: req.body,
    });
  },
  verifyEmailController: (req: any, res: any) => {
    return res.status(200).json({
      ok: true,
      route: 'verify',
      token: req.query.token ?? null,
    });
  },
  resendVerificationController: (req: any, res: any) => {
    return res.status(200).json({
      ok: true,
      route: 'resend',
      body: req.body,
    });
  },
}));

// 🔹 Mock: Auth.js y sus providers (para evitar cargar ESM real)

// @auth/express → exporta { ExpressAuth }
jest.mock('@auth/express', () => ({
  ExpressAuth: () => {
    // devolvemos un "handler" que solo llama next()
    return (_req: any, _res: any, next: any) => next();
  },
}));

// @auth/core/providers/google → default export
jest.mock('@auth/core/providers/google', () => ({
  __esModule: true,
  default: () => ({}),
}));

// @auth/core/providers/credentials → default export
jest.mock('@auth/core/providers/credentials', () => ({
  __esModule: true,
  default: () => ({}),
}));

// @auth/prisma-adapter → exporta { PrismaAdapter }
jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: () => ({}),
}));

// ⚠️ Importamos después de definir los mocks
import { authRouter } from './auth.route.js';

describe('authRouter (Express + routing)', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);

  test('POST /api/auth/register responde 201 y pasa el body', async () => {
    const payload = {
      nombreCompleto: 'Test User',
      email: 'test@example.com',
      password: 'supersegura',
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.route).toBe('register');
    expect(res.body.body).toEqual(payload);
  });

  test('GET /api/auth/verify responde 200 y lee token de query', async () => {
    const res = await request(app)
      .get('/api/auth/verify')
      .query({ token: 'abc123' });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.route).toBe('verify');
    expect(res.body.token).toBe('abc123');
  });

  test('POST /api/auth/resend-verification responde 200', async () => {
    const payload = { email: 'test@example.com' };

    const res = await request(app)
      .post('/api/auth/resend-verification')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.route).toBe('resend');
    expect(res.body.body).toEqual(payload);
  });
});
