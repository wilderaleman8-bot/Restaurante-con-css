const supabase = require('../lib/supabaseClient');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmail } = require('../services/email');

// POST /api/password-reset/solicitar - Genera un token de 1 hora y envía link por email
async function solicitar(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El email es obligatorio' });
  }

  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('id, email, nombre')
    .eq('email', email)
    .single();

  // Siempre responde el mismo mensaje por seguridad (no revela si el email existe)
  if (userError || !usuario) {
    return res.status(200).json({ message: 'Si el email existe, recibirás un enlace de recuperación.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  const { error: insertError } = await supabase
    .from('password_reset_tokens')
    .insert([{ usuario_id: usuario.id, token, expires_at: expiresAt.toISOString() }]);

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const resetLink = `${baseUrl}/resetear-password.html?token=${token}`;

  try {
    await sendEmail({
      to: usuario.email,
      subject: 'Recuperación de contraseña - Sabores Ancestrales',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#f4f1eb;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:30px 15px;">
            <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <tr><td style="background:#6B4C3B;padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:1px;">SABORES ANCESTRALES</h1>
                <p style="margin:6px 0 0;color:#d4c5b5;font-size:13px;">Restaurante Nicaragüense</p>
              </td></tr>
              <tr><td style="padding:36px 40px 28px;">
                <h2 style="margin:0 0 8px;color:#3a2a1e;font-size:20px;">Recuperación de contraseña</h2>
                <p style="margin:0 0 18px;color:#6b5a4a;font-size:15px;line-height:1.5;">Hola <strong style="color:#3a2a1e;">${usuario.nombre}</strong>,</p>
                <p style="margin:0 0 18px;color:#6b5a4a;font-size:15px;line-height:1.5;">Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong style="color:#3a2a1e;">Sabores Ancestrales</strong>.</p>
                <p style="margin:0 0 24px;color:#6b5a4a;font-size:15px;line-height:1.5;">Haz clic en el botón para crear una nueva contraseña. Este enlace expira en <strong>1 hora</strong>.</p>
                <table cellpadding="0" cellspacing="0"><tr><td style="background:#6B4C3B;border-radius:8px;">
                  <a href="${resetLink}" style="display:inline-block;padding:14px 36px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">Restablecer contraseña</a>
                </td></tr></table>
                <p style="margin:24px 0 0;color:#8a7a6a;font-size:13px;line-height:1.5;">Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá funcionando.</p>
              </td></tr>
              <tr><td style="background:#f8f5f0;padding:20px 40px;text-align:center;">
                <p style="margin:0;color:#8a7a6a;font-size:12px;">© 2025 Sabores Ancestrales &middot; Nicaragua</p>
                <p style="margin:4px 0 0;color:#a99988;font-size:11px;">Este es un correo automático, por favor no respondas a este mensaje.</p>
              </td></tr>
            </table>
            <p style="margin:16px 0 0;color:#a99988;font-size:11px;text-align:center;">Sabores Ancestrales &middot; Restaurante Nicaragüense</p>
          </td></tr></table>
        </body>
        </html>
      `
    });
  } catch (emailError) {
    console.error('Error enviando correo:', emailError);
  }

  res.json({ message: 'Si el email existe, recibirás un enlace de recuperación.' });
}

// POST /api/password-reset/verificar - Valida que un token sea válido, no usado y no expirado
async function verificar(req, res) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token requerido' });
  }

  const { data, error } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (error || !data) {
    return res.status(400).json({ error: 'Token inválido' });
  }

  if (data.used) {
    return res.status(400).json({ error: 'Este token ya ha sido utilizado' });
  }

  if (new Date(data.expires_at) < new Date()) {
    return res.status(400).json({ error: 'El token ha expirado. Solicita uno nuevo.' });
  }

  res.json({ message: 'Token válido', usuario_id: data.usuario_id });
}

// POST /api/password-reset/cambiar - Recibe token + nueva contraseña, actualiza en BD y marca token usado
async function cambiar(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const { data: tokenData, error: tokenError } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .single();

  if (tokenError || !tokenData) {
    return res.status(400).json({ error: 'Token inválido' });
  }

  if (tokenData.used) {
    return res.status(400).json({ error: 'Este token ya ha sido utilizado' });
  }

  if (new Date(tokenData.expires_at) < new Date()) {
    return res.status(400).json({ error: 'El token ha expirado. Solicita uno nuevo.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error: updateError } = await supabase
    .from('usuarios')
    .update({ password: hashedPassword })
    .eq('id', tokenData.usuario_id);

  if (updateError) {
    return res.status(500).json({ error: updateError.message });
  }

  const { error: markUsedError } = await supabase
    .from('password_reset_tokens')
    .update({ used: true })
    .eq('id', tokenData.id);

  if (markUsedError) {
    console.error('Error marcando token como usado:', markUsedError);
  }

  res.json({ message: 'Contraseña actualizada correctamente' });
}

module.exports = { solicitar, verificar, cambiar };
