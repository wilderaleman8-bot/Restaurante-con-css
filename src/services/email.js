const nodemailer = require('nodemailer');

// Crea transporter SMTP con credenciales reales, o usa Ethereal (entorno de prueba) como fallback
async function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
  }

  // Fallback a Ethereal (servicio de correos de prueba) si no hay config SMTP
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

// Envía un correo. Si usa Ethereal, imprime la URL de previsualización en consola.
async function sendEmail({ to, subject, html }) {
  const transporter = await createTransporter();
  const from = process.env.SMTP_FROM || '"Sabores Ancestrales" <saboresancestrales@gmail.com>';

  const info = await transporter.sendMail({ from, to, subject, html });

  if (!process.env.SMTP_HOST) {
    console.log('Correo de prueba (Ethereal) URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
}

module.exports = { sendEmail };
