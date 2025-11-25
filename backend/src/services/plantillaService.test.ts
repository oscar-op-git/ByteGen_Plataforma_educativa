// src/services/plantillaService.test.ts
import { listPlantillas } from './plantillaService.js';

jest.mock('../utils/prisma.js', () => ({
  prisma: {
    plantilla: {
      findMany: jest.fn(),
    },
  },
}));

import { prisma } from '../utils/prisma.js';
const prismaMock = prisma as any;

describe('listPlantillas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('consulta plantillas y mapea userName correctamente', async () => {
    prismaMock.plantilla.findMany.mockResolvedValue([
      {
        id_plantilla: 1,
        es_borrador: false,
        json: { foo: 'bar' },
        nombre: 'Plantilla 1',
        user_id: 'u1',
        user: {
          id: 'u1',
          name: 'Oscar',
          email: 'oscar@example.com',
        },
      },
      {
        id_plantilla: 2,
        es_borrador: true,
        json: null,
        nombre: 'Plantilla 2',
        user_id: 'u2',
        user: {
          id: 'u2',
          name: null,
          email: 'anon@example.com',
        },
      },
      {
        id_plantilla: 3,
        es_borrador: false,
        json: {},
        nombre: 'Plantilla 3',
        user_id: 'u3',
        user: null,
      },
    ]);

    const result = await listPlantillas();

    expect(prismaMock.plantilla.findMany).toHaveBeenCalledWith({
      orderBy: { id_plantilla: 'asc' },
      select: {
        id_plantilla: true,
        es_borrador: true,
        json: true,
        nombre: true,
        user_id: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    expect(result).toEqual([
      {
        id_plantilla: 1,
        es_borrador: false,
        json: { foo: 'bar' },
        nombre: 'Plantilla 1',
        user_id: 'u1',
        userName: 'Oscar',
      },
      {
        id_plantilla: 2,
        es_borrador: true,
        json: null,
        nombre: 'Plantilla 2',
        user_id: 'u2',
        userName: 'anon@example.com',
      },
      {
        id_plantilla: 3,
        es_borrador: false,
        json: {},
        nombre: 'Plantilla 3',
        user_id: 'u3',
        userName: null,
      },
    ]);
  });
});
