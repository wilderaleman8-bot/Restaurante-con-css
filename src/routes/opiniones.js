const router = require('express').Router();
const supabase = require('../lib/supabaseClient');

router.post('/', async (req, res) => {
  const { nombre, apellido, comentario } = req.body;

  if (!nombre || !apellido || !comentario) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const { error } = await supabase.from('opiniones').insert([{
    nombre,
    apellido,
    comentario
  }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Opinión guardada correctamente' });
});

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('opiniones').select('*').order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
