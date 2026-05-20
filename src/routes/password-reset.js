const router = require('express').Router();
const supabase = require('../lib/supabaseClient');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmail } = require('../services/email');

router.post('/solicitar', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'El email es obligatorio' });
  }

  const { data: usuario, error: userError } = await supabase
    .from('usuarios')
    .select('id, email, nombre')
    .eq('email', email)
    .single();

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
        <h2>Recuperación de contraseña</h2>
        <p>Hola <strong>${usuario.nombre}</strong>,</p>
        <p>Has solicitado restablecer tu contraseña en <strong>Sabores Ancestrales</strong>.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña. Este enlace expira en 1 hora.</p>
        <p><a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#6B4C3B;color:#fff;text-decoration:none;border-radius:6px;">Restablecer contraseña</a></p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
        <p>— Equipo Sabores Ancestrales</p>
      `
    });
  } catch (emailError) {
    console.error('Error enviando correo:', emailError);
  }

  res.json({ message: 'Si el email existe, recibirás un enlace de recuperación.' });
});

router.post('/verificar', async (req, res) => {
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
});

router.post('/cambiar', async (req, res) => {
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
});

module.exports = router;
