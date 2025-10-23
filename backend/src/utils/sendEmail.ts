// backend/src/utils/sendEmail.ts
import nodemailer from 'nodemailer';

// 1. Configurar el "Transporte" de Nodemailer
// Usamos las variables de entorno
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// 2. Función para enviar el email
export const sendVerificationEmail = async (to: string, name: string, url: string) => {
  const mailOptions = {
    from: `EduMasterCrack <${process.env.MAIL_FROM}>`,
    to: to,
    subject: '¡Bienvenido! Verifica tu cuenta',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>¡Hola, ${name}!</h2>
        <p>Gracias por registrarte en EduMasterCrack. Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
        <p>
          <a href="${url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verificar mi cuenta
          </a>
        </p>
        <p>Si no te registraste, por favor ignora este mensaje.</p>
        <p>El enlace expirará en 1 hora.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo de verificación enviado. ID del mensaje:', info.messageId);
    // Para Ethereal: puedes ver el email en la URL de preview
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error al enviar el correo de verificación:', error);
    throw new Error('No se pudo enviar el correo de verificación');
  }
};