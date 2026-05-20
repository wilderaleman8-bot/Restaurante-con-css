const nodemailer = require('nodemailer');

async function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

async function sendEmail({ to, subject, html }) {
  const transporter = await createTransporter();
  const from = process.env.SMTP_FROM || '"Sabores Ancestrales" <noreply@saboresancestrales.com>';

  const info = await transporter.sendMail({ from, to, subject, html });

  if (!process.env.SMTP_HOST) {
    console.log('Correo de prueba (Ethereal) URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
}

module.exports = { sendEmail };
