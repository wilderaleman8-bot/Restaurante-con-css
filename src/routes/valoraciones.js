const router = require('express').Router();
const supabase = require('../lib/supabaseClient');

/**
 * RUTA: POST /api/valoraciones
 * DESCRIPCIÓN: Guarda la calificación numérica y el comentario de un cliente.
 */
router.post('/', async (req, res) => {
  const { calificacion, comentario, usuario_id } = req.body;

  // Validación de la calificación (debe ser un número entre 1 y 5)
  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return res.status(400).json({ error: 'Faltan datos obligatorios o calificación inválida' });
  }

  // Inserción en la tabla 'valoraciones'
  const { error } = await supabase.from('valoraciones').insert([
    { usuario_id, calificacion, comentario }
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Valoración guardada correctamente' });
});

/**
 * RUTA: GET /api/valoraciones
 * DESCRIPCIÓN: Obtiene el listado de todas las valoraciones.
 */
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('valoraciones').select('*').order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
