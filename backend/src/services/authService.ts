import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import { env } from "../env.js";
import { prisma } from "../utils/prisma.js";

interface RegisterUserData {
  nombreCompleto: string;
  email: string;
  password: string;
}

function buildVerifyUrl(rawToken: string) {
  const url = new URL("/api/auth/verify", env.API_BASE_URL);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

export const registerUserService = async (data: RegisterUserData) => {
  const { nombreCompleto, email, password } = data;
  const normalizedEmail = email.trim().toLowerCase();

  // Validar contraseña fuerte
  if (password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  const exists = await prisma.user.findUnique({ 
    where: { email: normalizedEmail } 
  });
  
  if (exists) {
    throw new Error("El correo electrónico ya está en uso");
  }

  const passwordHash = await bcrypt.hash(password, 12); // ✅ bcrypt rounds aumentados

  const [firstName, ...lastNameParts] = nombreCompleto.trim().split(/\s+/);
  const lastName = lastNameParts.join(" ");

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        name: nombreCompleto || null,
        first_name: firstName || null,
        last_name: lastName || null,
        email: normalizedEmail,
        passwordHash,
        verified: false,
        emailVerified: null,
      },
    });

    await tx.verificationToken.create({
      data: { 
        identifier: normalizedEmail, 
        token: tokenHash, 
        expires 
      },
    });

    return created;
  });

  const verifyUrl = buildVerifyUrl(rawToken);
  
  try {
    await sendVerificationEmail(user.email!, user.name ?? "Usuario", verifyUrl);
  } catch (emailError) {
    console.error("[authService] Error enviando email de verificación:", emailError);
    // No fallar el registro si falla el email, permitir reenvío
  }

  const { passwordHash: _hidden, ...clean } = user as any;
  return clean;
};

export const verifyEmailService = async (rawToken: string) => {
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const verificationToken = await prisma.verificationToken.findFirst({
    where: { 
      token: tokenHash, 
      expires: { gt: new Date() } 
    },
  });

  if (!verificationToken) {
    throw new Error("Token inválido o expirado");
  }

  const updatedUser = await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { 
      verified: true, 
      emailVerified: new Date() 
    },
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier: verificationToken.identifier },
  });

  return updatedUser;
};

export const resendVerificationService = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ 
    where: { email: normalizedEmail } 
  });

  if (!user) {
    throw new Error("No existe un usuario con ese correo");
  }

  if (user.verified) {
    throw new Error("El usuario ya está verificado");
  }

  await prisma.verificationToken.deleteMany({ 
    where: { identifier: normalizedEmail } 
  });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { 
      identifier: normalizedEmail, 
      token: tokenHash, 
      expires 
    },
  });

  const verifyUrl = buildVerifyUrl(rawToken);
  await sendVerificationEmail(user.email!, user.name ?? "Usuario", verifyUrl);

  return { ok: true };
};