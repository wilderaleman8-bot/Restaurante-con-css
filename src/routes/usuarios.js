const router = require('express').Router();
const supabase = require('../lib/supabaseClient');
const multer = require('multer');
const path = require('path');

/**
 * CONFIGURACIÓN DE ALMACENAMIENTO (MULTER)
 * Define dónde y cómo se guardan las imágenes de perfil subidas.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta de destino
  },
  filename: (req, file, cb) => {
    // Genera un nombre único para evitar duplicados
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por archivo
  fileFilter: (req, file, cb) => {
    // Solo acepta archivos que sean imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

/**
 * RUTA: POST /api/usuarios/registro
 * DESCRIPCIÓN: Registra un nuevo usuario y guarda su foto de perfil.
 */
router.post('/registro', upload.single('image'), async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // Si se subió una imagen, guardamos su nombre de archivo
  let imagePath = null;
  if (req.file) {
    imagePath = req.file.filename;
  }

  // Insertar en Supabase y devolver los datos del usuario creado
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre, email, password, image_path: imagePath }])
    .select('id, nombre, email, image_path')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Usuario creado correctamente', usuario: data });
});

/**
 * RUTA: POST /api/usuarios/login
 * DESCRIPCIÓN: Verifica las credenciales del usuario.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  // Buscar usuario por email y contraseña
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, image_path')
    .eq('email', email)
    .eq('password', password)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
  }

  res.json({ message: 'Login exitoso', usuario: data });
});

/**
 * RUTA: GET /api/usuarios
 * DESCRIPCIÓN: Obtiene la lista básica de todos los usuarios registrados.
 */
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('usuarios').select('id, nombre, email, created_at');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
