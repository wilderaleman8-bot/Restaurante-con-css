const supabase = require('../lib/supabaseClient');
const bcrypt = require('bcrypt');
const { generarToken } = require('../middlewares/auth');
const { validarEmail, validarNombre } = require('../utils/validation');

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};

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
  if (req.file) imagePath = req.file.filename;

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre, email, password: hashedPassword, image_path: imagePath, rol: 'cliente' }])
    .select('id, nombre, email, image_path, rol')
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const token = generarToken(data);
  res.cookie('token', token, COOKIE_OPTIONS);
  res.status(201).json({ message: 'Usuario creado correctamente', usuario: data, token });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, image_path, rol, password')
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

async function listar(req, res) {
  const { data, error } = await supabase.from('usuarios').select('id, nombre, email, created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

async function logout(req, res) {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Sesión cerrada' });
}

module.exports = { registro, login, listar, logout };
