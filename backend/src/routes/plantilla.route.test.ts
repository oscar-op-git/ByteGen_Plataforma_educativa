// src/routes/plantilla.route.test.ts
import express from 'express';
import request from 'supertest';

// 👉 Mock: requireAuth pasa directo
jest.mock('../middlewares/requireAuth.js', () => ({
  requireAuth: (_req: any, _res: any, next: any) => next(),
}));

// 👉 Mock: controlador de plantillas
jest.mock('../controllers/plantilla.controller.js', () => ({
  getPlantillas: (_req: any, res: any) => {
    return res.status(200).json({
      ok: true,
      source: 'controller',
    });
  },
}));

import plantillaRouter from './plantilla.route.js';

describe('plantillaRouter', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/plantillas', plantillaRouter);

  test('GET /api/plantillas responde con lo que devuelve el controlador', async () => {
    const res = await request(app).get('/api/plantillas');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      ok: true,
      source: 'controller',
    });
  });
});
