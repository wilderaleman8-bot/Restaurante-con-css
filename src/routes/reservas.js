const router = require('express').Router();
const supabase = require('../lib/supabaseClient');

router.post('/', async (req, res) => {
  const { nombre, apellido, personas, fecha, mensaje } = req.body;

  if (!nombre || !apellido || !personas || !fecha) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const { error } = await supabase.from('reservas').insert([{
    nombre,
    apellido,
    personas,
    fecha_reserva: fecha,
    mensaje
  }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Reserva guardada correctamente' });
});

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('reservas').select('*').order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
