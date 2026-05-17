// Rutas para el manejo de usuarios (registro, login, listado)
const router = require('express').Router();
const supabase = require('../lib/supabaseClient');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const dns = require('dns').promises;
const { generarToken } = require('../middleware/auth');

// Configuración de Multer: guarda imágenes de perfil en la carpeta uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // Tamaño máximo: 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// POST /api/usuarios/registro — Crea un nuevo usuario con imagen opcional
router.post('/registro', upload.single('image'), async (req, res) => {
  const { nombre, email, password } = req.body;

  // Validaciones de campos obligatorios
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  if (typeof nombre !== 'string' || nombre.length > 100) {
    return res.status(400).json({ error: 'Nombre inválido' });
  }
  if (typeof email !== 'string' || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  const dominio = email.split('@')[1];
  try {
    const mx = await dns.resolveMx(dominio);
    if (!mx || mx.length === 0) {
      return res.status(400).json({ error: 'El dominio del email no existe o no recibe correos' });
    }
  } catch {
    return res.status(400).json({ error: 'El dominio del email no existe o no recibe correos' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Si se subió una imagen, guarda el nombre del archivo
  let imagePath = null;
  if (req.file) {
    imagePath = req.file.filename;
  }

  // Encripta la contraseña antes de guardarla
  const hashedPassword = await bcrypt.hash(password, 10);

  // Inserta el usuario en la base de datos
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre, email, password: hashedPassword, image_path: imagePath }])
    .select('id, nombre, email, image_path')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Genera token JWT y responde con los datos del nuevo usuario
  const token = generarToken(data);
  res.status(201).json({ message: 'Usuario creado correctamente', usuario: data, token });
});

// POST /api/usuarios/login — Autentica un usuario y devuelve un token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  // Busca al usuario por email
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, image_path, password')
    .eq('email', email)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }

  // Compara la contraseña ingresada con la almacenada (encriptada)
  const passwordValida = await bcrypt.compare(password, data.password);
  if (!passwordValida) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }

  // Excluye la contraseña de la respuesta y devuelve el token
  const { password: _, ...usuario } = data;
  const token = generarToken(data);
  res.json({ message: 'Login exitoso', usuario, token });
});

// GET /api/usuarios — Lista todos los usuarios (sin contraseñas)
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('usuarios').select('id, nombre, email, created_at');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
