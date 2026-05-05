const router = require('express').Router();
const supabase = require('../lib/supabaseClient');

router.post('/', async (req, res) => {
  const { nombre, apellido, calificacion, comentario } = req.body;

  if (!nombre || !apellido || !Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return res.status(400).json({ error: 'Faltan datos obligatorios o calificación inválida' });
  }

  const { error } = await supabase.from('valoraciones').insert([
    { nombre, apellido, calificacion, comentario }
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Valoración guardada correctamente' });
});

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('valoraciones').select('*').order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
