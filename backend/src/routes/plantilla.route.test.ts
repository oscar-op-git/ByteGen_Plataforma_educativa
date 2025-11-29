// 👇 Los mocks SIEMPRE primero
jest.mock('../middlewares/requireAuth.js', () => ({
  requireAuth: (req: any, _res: any, next: any) => {
    req.user = { id: '1', email: 'test@example.com' };
    next();
  },
}));

jest.mock('../controllers/plantilla.controller.js', () => ({
  getPlantillas: jest.fn((req: any, res: any) => {
    return res.json([
      {
        id_plantilla: 1,
        nombre: 'Plantilla 1',
        json: '{}',
        es_borrador: false,
        user_id: '1',
        userName: 'Test User',
      },
    ]);
  }),
  getPlantilla: jest.fn((req: any, res: any) => {
    return res.json({
      id_plantilla: 1,
      nombre: 'Plantilla 1',
      json: '{}',
      es_borrador: false,
      user_id: '1',
      userName: 'Test User',
    });
  }),
  createPlantilla: jest.fn((req: any, res: any) => {
    return res.status(201).json({ id_plantilla: 99 });
  }),
  updatePlantilla: jest.fn((req: any, res: any) => {
    return res.json({ ok: true });
  }),
  deletePlantilla: jest.fn((req: any, res: any) => {
    return res.status(204).end();
  }),
}));

// 👇 Después de los jest.mock, recién importamos
import request from 'supertest';
import express from 'express';
import plantillaRouter from './plantilla.route.js';
import * as plantillaController from '../controllers/plantilla.controller.js';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/plantillas', plantillaRouter);
  return app;
}

describe('Rutas de plantillas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/plantillas responde 200 y llama al controller', async () => {
    const app = createApp();

    const res = await request(app).get('/api/plantillas');

    expect(res.status).toBe(200);
    expect(plantillaController.getPlantillas).toHaveBeenCalled();
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id_plantilla).toBe(1);
  });

  test('GET /api/plantillas/:id responde 200 y llama al controller', async () => {
    const app = createApp();

    const res = await request(app).get('/api/plantillas/1');

    expect(res.status).toBe(200);
    expect(plantillaController.getPlantilla).toHaveBeenCalled();
    expect(res.body.id_plantilla).toBe(1);
  });

  test('POST /api/plantillas crea y llama a createPlantilla', async () => {
    const app = createApp();

    const res = await request(app)
      .post('/api/plantillas')
      .send({ nombre: 'Nueva', json: '{}' });

    expect(res.status).toBe(201);
    expect(plantillaController.createPlantilla).toHaveBeenCalled();
  });
});
