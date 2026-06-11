const path = require('path');
const supabase = require('../lib/supabaseClient');
const bcrypt = require('bcrypt');
const { generarToken } = require('../middlewares/auth');
const { validarEmail, validarNombre, sanitizar } = require('../utils/validation');
const { compressImage } = require('../utils/compressImage');
const { sendEmail } = require('../services/email');

// Configuración de cookie segura para el token JWT
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};

// POST /api/usuarios/registro - Crea un nuevo usuario, comprime imagen si envía, envía email de bienvenida
async function registro(req, res) {
  const { nombre, email, password } = req.body;

  const errorNombre = validarNombre(nombre);
  if (errorNombre) return res.status(400).json({ error: errorNombre });

  const errorEmail = await validarEmail(email);
  if (errorEmail) return res.status(400).json({ error: errorEmail });

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  let imagePath = null;
  if (req.file) {
    const result = await compressImage(req.file.path);
    imagePath = result ? path.basename(result.compressed) : req.file.filename;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre: sanitizar(nombre), email: sanitizar(email), password: hashedPassword, image_path: imagePath, rol: 'cliente' }])
    .select('id, nombre, email, image_path, rol, token_version')
    .single();

  if (error) {
    console.error('Error creando usuario:', error);
    return res.status(500).json({ error: 'Error al crear el usuario' });
  }

  const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;

  // Envío asíncrono del email de bienvenida (no bloquea la respuesta)
  sendEmail({
    to: data.email,
    subject: '¡Bienvenido a Sabores Ancestrales!',
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
              <h2 style="margin:0 0 8px;color:#3a2a1e;font-size:20px;">¡Bienvenid@, ${data.nombre}!</h2>
              <p style="margin:0 0 18px;color:#6b5a4a;font-size:15px;line-height:1.5;">Nos alegra tenerte en nuestra familia. En <strong style="color:#3a2a1e;">Sabores Ancestrales</strong> celebramos las raíces culinarias de nuestra tierra con ingredientes frescos y recetas que han pasado de generación en generación.</p>
              <p style="margin:0 0 18px;color:#6b5a4a;font-size:15px;line-height:1.5;">Con tu cuenta ya puedes:</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr><td style="padding:4px 0;color:#6b5a4a;font-size:14px;">🍽️ &nbsp;Explorar nuestro menú interactivo</td></tr>
                <tr><td style="padding:4px 0;color:#6b5a4a;font-size:14px;">📅 &nbsp;Hacer reservas en línea</td></tr>
                <tr><td style="padding:4px 0;color:#6b5a4a;font-size:14px;">🛒 &nbsp;Pedir a domicilio con carrito de compras</td></tr>
                <tr><td style="padding:4px 0;color:#6b5a4a;font-size:14px;">⭐ &nbsp;Dejar opiniones y valoraciones</td></tr>
              </table>
              <table cellpadding="0" cellspacing="0"><tr><td style="background:#6B4C3B;border-radius:8px;">
                <a href="${baseUrl}/menu.html" style="display:inline-block;padding:14px 36px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">Explorar menú</a>
              </td></tr></table>
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
  }).catch(e => console.error('Error enviando correo de bienvenida:', e.message));

  const token = generarToken(data);
  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(201).json({ message: 'Usuario creado correctamente', usuario: data, token });
}

// POST /api/usuarios/login - Autentica por email/password, devuelve JWT y setea cookie httpOnly
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, image_path, rol, password, token_version')
    .eq('email', email)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }

  const passwordValida = await bcrypt.compare(password, data.password);
  if (!passwordValida) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }

  const { password: _, ...usuario } = data;
  const token = generarToken(data);
  res.cookie('token', token, COOKIE_OPTIONS);
  res.json({ message: 'Login exitoso', usuario, token });
}

// GET /api/usuarios - Lista usuarios (protegido)
async function listar(req, res) {
  const { data, error } = await supabase.from('usuarios').select('id, nombre, email, created_at');
  if (error) {
    console.error('Error listando usuarios:', error);
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
  res.json(data);
}

// POST /api/usuarios/logout - Invalida el token incrementando token_version en BD y limpia cookie
async function logout(req, res) {
  const header = req.headers.authorization;
  let token = null;
  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  if (token) {
    try {
      const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const { data: current } = await supabase
        .from('usuarios')
        .select('token_version')
        .eq('id', decoded.id)
        .single();
      if (current) {
        await supabase
          .from('usuarios')
          .update({ token_version: current.token_version + 1 })
          .eq('id', decoded.id);
      }
    } catch {
      // token inválido o ya expirado - igual limpiamos cookie
    }
  }
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Sesión cerrada' });
}

// GET /api/usuarios/me - Devuelve datos del usuario autenticado
async function perfil(req, res) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, image_path, rol, created_at')
    .eq('id', req.usuario.id)
    .single();

  if (error) {
    console.error('Error obteniendo perfil:', error);
    return res.status(500).json({ error: 'Error al obtener el perfil' });
  }
  if (!data) return res.status(404).json({ error: 'Usuario no encontrado' });

  res.json(data);
}

// PATCH /api/usuarios/me - Actualiza nombre, email y/o foto de perfil del usuario autenticado. Regenera token.
async function actualizarPerfil(req, res) {
  const { nombre, email } = req.body;
  const userId = req.usuario.id;

  if (nombre !== undefined) {
    const errorNombre = validarNombre(nombre);
    if (errorNombre) return res.status(400).json({ error: errorNombre });
  }

  if (email !== undefined) {
    const errorEmail = await validarEmail(email);
    if (errorEmail) return res.status(400).json({ error: errorEmail });

    const { data: existente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .neq('id', userId)
      .single();
    if (existente) return res.status(400).json({ error: 'El email ya está en uso' });
  }

  const updates = {};
  if (nombre !== undefined) updates.nombre = sanitizar(nombre);
  if (email !== undefined) updates.email = sanitizar(email);
  if (req.file) {
    const result = await compressImage(req.file.path);
    updates.image_path = result ? path.basename(result.compressed) : req.file.filename;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No hay campos para actualizar' });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', userId)
    .select('id, nombre, email, image_path, rol')
    .single();

  if (error) {
    console.error('Error actualizando perfil:', error);
    return res.status(500).json({ error: 'Error al actualizar el perfil' });
  }

  const token = generarToken({ ...data, token_version: req.usuario.token_version });

  res.json({ message: 'Perfil actualizado', usuario: data, token });
}

module.exports = { registro, login, listar, logout, perfil, actualizarPerfil };
