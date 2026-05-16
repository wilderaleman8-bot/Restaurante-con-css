// Rutas para gestionar las opiniones de los clientes
const router = require('express').Router();
const supabase = require('../lib/supabaseClient');

// POST /api/opiniones — Guarda una nueva opinión de un cliente
router.post('/', async (req, res) => {
  const { nombre, apellido, comentario, usuario_id } = req.body;

  // Validaciones de campos obligatorios
  if (!nombre || !apellido || !comentario) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  if (typeof nombre !== 'string' || nombre.length > 100) {
    return res.status(400).json({ error: 'Nombre inválido' });
  }
  if (typeof apellido !== 'string' || apellido.length > 100) {
    return res.status(400).json({ error: 'Apellido inválido' });
  }
  if (typeof comentario !== 'string' || comentario.length > 2000) {
    return res.status(400).json({ error: 'El comentario no puede exceder 2000 caracteres' });
  }

  const { error } = await supabase.from('opiniones').insert([{
    usuario_id,
    nombre,
    apellido,
    comentario
  }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Opinión guardada correctamente' });
});

// GET /api/opiniones — Obtiene todas las opiniones ordenadas de la más reciente a la más antigua
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('opiniones').select('*').order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
