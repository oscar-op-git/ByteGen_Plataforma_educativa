// backend/src/utils/sendEmail.ts
import nodemailer, { Transporter } from "nodemailer";
import { env } from "../env.js";

let transporter: Transporter | null = null;
let transporterVerified = false;

function assertEmailEnv() {
  const missing: string[] = [];
  if (!env.SMTP_HOST) missing.push("SMTP_HOST");
  if (!env.SMTP_PORT) missing.push("SMTP_PORT");
  if (env.SMTP_SECURE === undefined || env.SMTP_SECURE === null) missing.push("SMTP_SECURE");
  if (!env.SMTP_USER) missing.push("SMTP_USER");
  if (!env.SMTP_PASS) missing.push("SMTP_PASS");
  if (!env.MAIL_FROM) missing.push("MAIL_FROM");
  if (missing.length) {
    throw new Error(
      `Email no configurado correctamente. Faltan variables: ${missing.join(", ")}`
    );
  }
}

function getTransporter(): Transporter {
  if (transporter) return transporter;

  assertEmailEnv();
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST!,
    port: Number(env.SMTP_PORT ?? 465),
    secure: env.SMTP_SECURE ?? true, // 465 => true, 587 => false
    auth: {
      user: env.SMTP_USER!,
      pass: env.SMTP_PASS!,
    },
  });

  return transporter;
}

async function ensureVerified() {
  if (transporterVerified) return;
  const t = getTransporter();
  try {
    await t.verify();
    transporterVerified = true;
    if (process.env.NODE_ENV !== "production") {
      console.log("[mail] Transporter verificado y listo para enviar");
    }
  } catch (err) {
    console.error("[mail] Error verificando transporter:", err);
    throw new Error("No se pudo verificar el transporte SMTP. Revisa credenciales/puerto/secure.");
  }
}

function verificationTemplate(name: string, verifyUrl: string) {
  const safeName = name || "Usuario";
  return {
    subject: "Verifica tu cuenta en EduMaster",
    text: `Hola ${safeName}, verifica tu cuenta aquí: ${verifyUrl}\nEste enlace expira en 1 hora.`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6">
        <h2>Confirma tu correo</h2>
        <p>Hola ${safeName},</p>
        <p>Gracias por registrarte en <b>EduMaster</b>. Haz clic para activar tu cuenta:</p>
        <p><a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;border-radius:6px;border:1px solid #333;text-decoration:none">Verificar mi cuenta</a></p>
        <p>Si no puedes hacer clic, copia este enlace:</p>
        <p style="word-break:break-all">${verifyUrl}</p>
        <p><small>Este enlace expira en 1 hora.</small></p>
      </div>
    `,
  };
}

export async function sendVerificationEmail(to: string, name: string, verifyUrl: string) {
  await ensureVerified();
  const t = getTransporter();
  const { subject, text, html } = verificationTemplate(name, verifyUrl);

  await t.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });
}
