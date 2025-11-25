// src/login.test.ts
import express from 'express';
import request from 'supertest';
import bcrypt from 'bcryptjs';

// 🔹 Mocks de prisma
jest.mock('./utils/prisma.js', () => {
    return {
        prisma: {
            user: {
                findUnique: jest.fn(),
            },
            session: {
                create: jest.fn(),
            },
        },
    };
});

// 🔹 Mock de env (solo lo que usa /api/login)
jest.mock('./env.js', () => ({
    env: {
        NODE_ENV: 'test',
    },
}));

// 🔹 Mock de rateLimit loginLimiter (para no limitar en test)
jest.mock('./middlewares/rateLimit.js', () => ({
    loginLimiter: (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from './utils/prisma.js';
import { env } from './env.js';
import { loginLimiter } from './middlewares/rateLimit.js';

jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
}));

const bcryptCompareMock = bcrypt.compare as jest.Mock;

describe('POST /api/login (lógica de login)', () => {
    const app = express();
    app.use(express.json());

    // 🚨 Copiamos la ruta desde tu index.ts, pero usando los mocks
    app.post('/api/login', loginLimiter, async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    error: 'Datos incompletos',
                    message: 'Email y contraseña son obligatorios',
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            const user = await prisma.user.findUnique({
                where: { email: normalizedEmail },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    passwordHash: true,
                    verified: true,
                    emailVerified: true,
                    id_role_role: true,
                    isAdmin: true,
                    role: {
                        select: {
                            id_role: true,
                            description: true,
                        },
                    },
                },
            });

            if (!user || !user.passwordHash) {
                return res.status(401).json({
                    error: 'Credenciales inválidas',
                    message: 'Email o contraseña incorrectos',
                });
            }

            const isVerified = !!user.verified || !!user.emailVerified;
            if (!isVerified) {
                return res.status(403).json({
                    error: 'Cuenta no verificada',
                    message: 'Debes verificar tu correo antes de iniciar sesión',
                });
            }

            const passwordValid = await bcrypt.compare(password, user.passwordHash);
            if (!passwordValid) {
                return res.status(401).json({
                    error: 'Credenciales inválidas',
                    message: 'Email o contraseña incorrectos',
                });
            }

            const sessionToken = 'fake-session-token-test';
            const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            await prisma.session.create({
                data: {
                    sessionToken,
                    userId: user.id,
                    expires,
                },
            });

            res.cookie('authjs.session-token', sessionToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                expires,
            });

            return res.status(200).json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    isAdmin: user.isAdmin,
                    roleId: user.id_role_role,
                    roleName: user.role?.description ?? null,
                },
            });
        } catch (error) {
            console.error('❌ Login error:', error);
            return res.status(500).json({
                error: 'Error interno',
                message: 'Ocurrió un error al iniciar sesión',
            });
        }
    });

    const prismaMock = prisma as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('falta email o password → 400', async () => {
        const res = await request(app)
            .post('/api/login')
            .send({ email: 'test@example.com' }); // sin password

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Datos incompletos');
    });

    test('usuario no existe → 401', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/login')
            .send({ email: 'test@example.com', password: '12345678' });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Credenciales inválidas');
    });

    test('usuario no verificado → 403', async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            name: 'Test',
            passwordHash: 'hash',
            verified: false,
            emailVerified: null,
            id_role_role: 2,
            isAdmin: false,
            role: { id_role: 2, description: 'editor' },
        });

        const res = await request(app)
            .post('/api/login')
            .send({ email: 'test@example.com', password: '12345678' });

        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Cuenta no verificada');
    });

    test('password incorrecta → 401', async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            name: 'Test',
            passwordHash: 'hash',
            verified: true,
            emailVerified: new Date(),
            id_role_role: 2,
            isAdmin: false,
            role: { id_role: 2, description: 'editor' },
        });

        bcryptCompareMock.mockResolvedValue(false);

        const res = await request(app)
            .post('/api/login')
            .send({ email: 'test@example.com', password: 'wrongpass' });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Credenciales inválidas');
    });

    test('login correcto → 200, crea sesión y setea cookie', async () => {
        prismaMock.user.findUnique.mockResolvedValue({
            id: '1',
            email: 'test@example.com',
            name: 'Test',
            passwordHash: 'hash',
            verified: true,
            emailVerified: new Date(),
            id_role_role: 2,
            isAdmin: true,
            role: { id_role: 2, description: 'admin' },
        });

        prismaMock.session.create.mockResolvedValue({});
        bcryptCompareMock.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/login')
            .send({ email: 'test@example.com', password: 'correcta' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user.email).toBe('test@example.com');
        expect(prismaMock.session.create).toHaveBeenCalledTimes(1);

        const headerValue = res.headers['set-cookie'];

        // 1. Inicializamos 'cookies' como un array vacío
        let cookies: string[] = [];

        if (headerValue) {
            if (Array.isArray(headerValue)) {
                // 2. Si ya es un array de strings (lo que queremos)
                cookies = headerValue;
            } else if (typeof headerValue === 'string') {
                // 3. Si es un solo string, lo convertimos a un array de un elemento
                cookies = [headerValue];
            }
        }
        const hasSessionCookie = cookies.some((c: string) =>
            c.includes('authjs.session-token')
        );
        expect(hasSessionCookie).toBe(true);
    });
});
