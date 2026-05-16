const router = require('express').Router();
const supabase = require('../lib/supabaseClient');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const { generarToken } = require('../middleware/auth');

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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

router.post('/registro', upload.single('image'), async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  if (typeof nombre !== 'string' || nombre.length > 100) {
    return res.status(400).json({ error: 'Nombre inválido' });
  }
  if (typeof email !== 'string' || email.length > 255 || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  let imagePath = null;
  if (req.file) {
    imagePath = req.file.filename;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('usuarios')
    .insert([{ nombre, email, password: hashedPassword, image_path: imagePath }])
    .select('id, nombre, email, image_path')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const token = generarToken(data);
  res.status(201).json({ message: 'Usuario creado correctamente', usuario: data, token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, image_path, password')
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
  res.json({ message: 'Login exitoso', usuario, token });
});

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('usuarios').select('id, nombre, email, created_at');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
