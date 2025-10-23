// backend/src/services/auth.service.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Módulo nativo de Node.js
import { sendVerificationEmail } from '../utils/sendEmail'; // Lo crearemos en el Paso 4

const prisma = new PrismaClient();

// Definimos el tipo de datos que esperamos del formulario
interface RegisterUserData {
  nombreCompleto: string;
  email: string;
  password: string;
}

export const registerUserService = async (data: RegisterUserData) => {
  const { nombreCompleto, email, password } = data;

  // 1. Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('El correo electrónico ya está en uso');
  }

  // 2. Hashear la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Dividir el nombre completo
  const [firstName, ...lastNameParts] = nombreCompleto.split(' ');
  const lastName = lastNameParts.join(' ') || ''; // Maneja nombres sin apellido

  // 4. Generar token de verificación (usaremos la tabla que ya tienes)
  const emailToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // Token expira en 1 hora

  // 5. Crear usuario y token en una transacción
  // Esto asegura que si una operación falla, la otra también se revierte.
  let createdUser;
  try {
    createdUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: nombreCompleto,
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase(),
          password: hashedPassword,
          verified: false, // El usuario no está verificado aún
          // Asignar un rol por defecto si es necesario
          // id_role_role: 1 // (Ej. 1 = 'estudiante')
        }
      });

      // Usamos la tabla 'auth_verification_token'
      await tx.auth_verification_token.create({
        data: {
          identifier: user.email,
          token: emailToken, // ¡Aquí deberías hashear el token! (por seguridad)
          expires: expires
        }
      });
      
      return user;
    });

  } catch (error) {
    console.error(error);
    throw new Error('No se pudo crear el usuario');
  }


  // 6. Enviar el correo de verificación
  const verificationUrl = `${process.env.FRONTEND_URL}/verificar-email?token=${emailToken}`;
  
  await sendVerificationEmail(
    createdUser.email, 
    createdUser.name || 'Usuario', 
    verificationUrl
  );

  // No devolvemos la contraseña
  const { password: _, ...userWithoutPassword } = createdUser;
  return userWithoutPassword;
};

// --- SERVICIO DE VERIFICACIÓN DE EMAIL ---

export const verifyEmailService = async (token: string) => {
  
  // (Mejora de seguridad: deberías hashear el token que buscas)
  const verificationToken = await prisma.auth_verification_token.findFirst({
    where: { 
      token: token,
      expires: { gt: new Date() } // 'gt' = greater than (asegura que no ha expirado)
    }
  });

  if (!verificationToken) {
    throw new Error('Token inválido o expirado');
  }

  // 1. Marcar al usuario como verificado
  const updatedUser = await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: {
      verified: true,
      emailVerified: new Date()
    }
  });

  // 2. Borrar el token para que no se use de nuevo
  await prisma.auth_verification_token.delete({
    where: {
      token: token,
      identifier: verificationToken.identifier
    }
  });

  return updatedUser;
};