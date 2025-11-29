// src/services/authService.test.ts
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Importamos lo que vamos a testear
import {
  registerUserService,
  verifyEmailService,
  resendVerificationService,
} from './authService.js';

// Importamos los módulos que vamos a mockear (para acceder a sus mocks)
import { prisma } from '../utils/prisma.js';
import { sendVerificationEmail } from '../utils/sendEmail.js';

//  Importante: los paths en jest.mock deben coincidir EXACTO con los de authService.ts
jest.mock('../utils/prisma.js', () => {
  const user = {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const verificationToken = {
    findFirst: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  };

  return {
    prisma: {
      user,
      verificationToken,
      $transaction: jest.fn(async (fn: any) =>
        // le pasamos un "tx" con las mismas colecciones mockeadas
        fn({ user, verificationToken })
      ),
    },
  };
});

jest.mock('../utils/sendEmail.js', () => ({
  sendVerificationEmail: jest.fn(),
}));

jest.mock('../env.js', () => ({
  env: {
    API_BASE_URL: 'http://test.local', // para buildVerifyUrl
    SMTP_HOST: 'smtp.test',
    SMTP_PORT: '465',
    SMTP_SECURE: true,
    SMTP_USER: 'user',
    SMTP_PASS: 'pass',
    MAIL_FROM: 'no-reply@test.local',
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
}));

describe('authService', () => {
  const prismaMock = prisma as any;
  const sendVerificationEmailMock = sendVerificationEmail as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('registerUserService registra usuario nuevo y envía email', async () => {
    // user no existe aún
    prismaMock.user.findUnique.mockResolvedValue(null);

    // simulamos el user creado
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      name: 'Juan Pérez',
      first_name: 'Juan',
      last_name: 'Pérez',
      email: 'juan@example.com',
      passwordHash: 'hashed-password',
      verified: false,
      emailVerified: null,
    });

    // no necesitamos return especial de verificationToken.create, basta con que no rompa
    prismaMock.verificationToken.create.mockResolvedValue({});

    // Controlamos randomBytes para que el token sea estable (opcional)
    const randomSpy = jest
      .spyOn(crypto, 'randomBytes')
      .mockReturnValue(Buffer.from('token-de-prueba', 'utf8') as any);

    const result = await registerUserService({
      nombreCompleto: 'Juan Pérez',
      email: '  JUAN@example.com ', // probamos normalización
      password: 'passwordFuerte',
    });

    // randomBytes se llamó
    expect(randomSpy).toHaveBeenCalled();

    // se buscó al usuario por email normalizado
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'juan@example.com' },
    });

    // se creó el usuario dentro de la transacción
    expect(prismaMock.user.create).toHaveBeenCalled();

    // no debe devolver passwordHash
    expect(result).toHaveProperty('email', 'juan@example.com');
    expect((result as any).passwordHash).toBeUndefined();

    // se envió email de verificación
    expect(sendVerificationEmailMock).toHaveBeenCalledTimes(1);
    const [to, name, verifyUrl] = sendVerificationEmailMock.mock.calls[0];
    expect(to).toBe('juan@example.com');
    expect(name).toBe('Juan Pérez');
    expect(verifyUrl).toContain('http://test.local/api/auth/verify');
    expect(verifyUrl).toContain('token=');

    randomSpy.mockRestore();
  });

  test('registerUserService lanza error si contraseña es débil', async () => {
    await expect(
      registerUserService({
        nombreCompleto: 'Test User',
        email: 'test@example.com',
        password: '123', // < 8
      })
    ).rejects.toThrow('La contraseña debe tener al menos 8 caracteres');

    // no se debe consultar la BD si ya falla por password débil
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  test('registerUserService lanza error si el email ya está en uso', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1 });

    await expect(
      registerUserService({
        nombreCompleto: 'Test User',
        email: 'test@example.com',
        password: 'passwordFuerte',
      })
    ).rejects.toThrow('El correo electrónico ya está en uso');

    // no crea usuario
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  test('verifyEmailService marca usuario verificado y borra tokens', async () => {
    const rawToken = 'mi-token';
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    prismaMock.verificationToken.findFirst.mockResolvedValue({
      identifier: 'user@example.com',
      token: tokenHash,
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });

    prismaMock.user.update.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      verified: true,
      emailVerified: new Date(),
    });

    prismaMock.verificationToken.deleteMany.mockResolvedValue({});

    const updatedUser = await verifyEmailService(rawToken);

    expect(prismaMock.verificationToken.findFirst).toHaveBeenCalledWith({
      where: {
        token: tokenHash,
        expires: { gt: expect.any(Date) },
      },
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: {
        verified: true,
        emailVerified: expect.any(Date),
      },
    });

    expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: 'user@example.com' },
    });

    expect(updatedUser).toHaveProperty('verified', true);
  });

  test('verifyEmailService lanza error si token es inválido o expirado', async () => {
    prismaMock.verificationToken.findFirst.mockResolvedValue(null);

    await expect(verifyEmailService('token-invalido')).rejects.toThrow(
      'Token inválido o expirado'
    );
  });

  test('resendVerificationService lanza error si usuario no existe', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      resendVerificationService('noexiste@example.com')
    ).rejects.toThrow('No existe un usuario con ese correo');
  });

  test('resendVerificationService lanza error si usuario ya está verificado', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      verified: true,
    });

    await expect(
      resendVerificationService('user@example.com')
    ).rejects.toThrow('El usuario ya está verificado');
  });

  test('resendVerificationService crea nuevo token y envía email', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      name: 'User Test',
      verified: false,
    });

    prismaMock.verificationToken.deleteMany.mockResolvedValue({});
    prismaMock.verificationToken.create.mockResolvedValue({});

    const randomSpy = jest
      .spyOn(crypto, 'randomBytes')
      .mockReturnValue(Buffer.from('token-resend', 'utf8') as any);

    const result = await resendVerificationService('user@example.com');

    expect(prismaMock.verificationToken.deleteMany).toHaveBeenCalledWith({
      where: { identifier: 'user@example.com' },
    });

    expect(prismaMock.verificationToken.create).toHaveBeenCalledWith({
      data: {
        identifier: 'user@example.com',
        token: expect.any(String), // hash
        expires: expect.any(Date),
      },
    });

    expect(sendVerificationEmailMock).toHaveBeenCalledTimes(1);
    const [to, name, verifyUrl] = sendVerificationEmailMock.mock.calls[0];
    expect(to).toBe('user@example.com');
    expect(name).toBe('User Test');
    expect(verifyUrl).toContain('token=');

    expect(result).toEqual({ ok: true });

    randomSpy.mockRestore();
  });
});
