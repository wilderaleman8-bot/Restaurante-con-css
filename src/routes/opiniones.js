const router = require('express').Router();
const supabase = require('../lib/supabaseClient');

/**
 * RUTA: POST /api/opiniones
 * DESCRIPCIÓN: Guarda la opinión de un cliente.
 */
router.post('/', async (req, res) => {
  const { nombre, apellido, comentario, usuario_id } = req.body;

  // Validación de campos
  if (!nombre || !apellido || !comentario) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // Inserción en la tabla 'opiniones'
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

/**
 * RUTA: GET /api/opiniones
 * DESCRIPCIÓN: Obtiene todas las opiniones de los clientes.
 */
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('opiniones').select('*').order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
