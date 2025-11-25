// src/middlewares/requireAuth.test.ts
import express from 'express';
import request from 'supertest';
import cookieParser from 'cookie-parser'; //  IMPORTANTE

// 👉 Mock de prisma.session (no queremos BD real)
jest.mock('../utils/prisma.js', () => ({
    prisma: {
        session: {
            findUnique: jest.fn(),
        },
    },
}));

// 👉 Evitar que el setInterval real se quede vivo en los tests
jest.spyOn(global as any, 'setInterval').mockImplementation(() => 0 as any);

import { prisma } from '../utils/prisma.js';
import { requireAuth, requireVerified, requireAdmin } from './requireAuth.js';

const prismaMock = prisma as any;

describe('requireAuth middleware', () => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());

    app.get('/protected', requireAuth, (req: any, res) => {
        return res.json({ user: req.user });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('sin cookie → 401 No autenticado', async () => {
        const res = await request(app).get('/protected');

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('No autenticado');
        expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
    });

    test('cookie con sesión inexistente → 401 Sesión expirada', async () => {
        prismaMock.session.findUnique.mockResolvedValue(null);

        const res = await request(app)
            .get('/protected')
            .set('Cookie', ['authjs.session-token=token123']);

        expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
            where: { sessionToken: 'token123' },
            select: expect.any(Object),
        });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Sesión expirada');
    });

    test('cookie con sesión expirada → 401 Sesión expirada', async () => {
        prismaMock.session.findUnique.mockResolvedValue({
            expires: new Date(Date.now() - 1000),
            user: {
                id: '1',
                email: 'test@example.com',
                name: 'Test',
                verified: true,
                emailVerified: null,
                isAdmin: false,
                id_role_role: 2,
                role: { description: 'editor' },
            },
        });

        const res = await request(app)
            .get('/protected')
            .set('Cookie', ['authjs.session-token=tokenExp']);

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Sesión expirada');
    });

    test('sesión válida → 200 y user poblado', async () => {
        prismaMock.session.findUnique.mockResolvedValue({
            expires: new Date(Date.now() + 60 * 60 * 1000),
            user: {
                id: '1',
                email: 'test@example.com',
                name: 'Test User',
                verified: false,
                emailVerified: new Date(),
                isAdmin: true,
                id_role_role: 3,
                role: { description: 'admin' },
            },
        });

        const res = await request(app)
            .get('/protected')
            .set('Cookie', ['authjs.session-token=tokenOK']);

        expect(res.status).toBe(200);
        expect(res.body.user).toEqual({
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
            verified: true, // por verified || emailVerified
            isAdmin: true,
            roleId: 3,
            roleName: 'admin',
        });
    });
});

describe('requireVerified middleware', () => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());

    app.get('/only-verified', requireVerified, (req: any, res) => {
        return res.json({ user: req.user });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('usuario no verificado → 403 Cuenta no verificada', async () => {
        prismaMock.session.findUnique.mockResolvedValue({
            expires: new Date(Date.now() + 60 * 60 * 1000),
            user: {
                id: '1',
                email: 'test@example.com',
                name: 'Test',
                verified: false,
                emailVerified: null,
                isAdmin: false,
                id_role_role: 2,
                role: { description: 'editor' },
            },
        });

        const res = await request(app)
            .get('/only-verified')
            .set('Cookie', ['authjs.session-token=tokenNoVer']);

        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Cuenta no verificada');
    });

    test('usuario verificado → pasa y responde 200', async () => {
        prismaMock.session.findUnique.mockResolvedValue({
            expires: new Date(Date.now() + 60 * 60 * 1000),
            user: {
                id: '1',
                email: 'test@example.com',
                name: 'Test',
                verified: true,
                emailVerified: null,
                isAdmin: false,
                id_role_role: 2,
                role: { description: 'editor' },
            },
        });

        const res = await request(app)
            .get('/only-verified')
            .set('Cookie', ['authjs.session-token=tokenVer']);

        expect(res.status).toBe(200);
        expect(res.body.user.id).toBe('1');
    });
});

describe('requireAdmin middleware', () => {
    const app = express();
    app.use(express.json());
    app.use(cookieParser()); 

    app.get('/only-admin', requireAdmin, (req: any, res) => {
        return res.json({ user: req.user });
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('usuario no admin → 403 Acceso denegado', async () => {
        prismaMock.session.findUnique.mockResolvedValue({
            expires: new Date(Date.now() + 60 * 60 * 1000),
            user: {
                id: '1',
                email: 'test@example.com',
                name: 'Test',
                verified: true,
                emailVerified: null,
                isAdmin: false,
                id_role_role: 2,
                role: { description: 'editor' },
            },
        });

        const res = await request(app)
            .get('/only-admin')
            .set('Cookie', ['authjs.session-token=tokenNoAdmin']);

        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Acceso denegado');
    });

    test('usuario admin → 200 y user devuelto', async () => {
        prismaMock.session.findUnique.mockResolvedValue({
            expires: new Date(Date.now() + 60 * 60 * 1000),
            user: {
                id: '1',
                email: 'admin@example.com',
                name: 'Admin',
                verified: true,
                emailVerified: null,
                isAdmin: true,
                id_role_role: 1,
                role: { description: 'admin' },
            },
        });

        const res = await request(app)
            .get('/only-admin')
            .set('Cookie', ['authjs.session-token=tokenAdmin']);

        expect(res.status).toBe(200);
        expect(res.body.user.isAdmin).toBe(true);
        expect(res.body.user.roleName).toBe('admin');
    });
});
