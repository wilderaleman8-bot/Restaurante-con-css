const router = require('express').Router();
const supabase = require('../lib/supabaseClient');

router.post('/', async (req, res) => {
  const { nombre, apellido, personas, fecha, mensaje, usuario_id } = req.body;

  if (!nombre || !apellido || !personas || !fecha) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  if (typeof nombre !== 'string' || nombre.length > 100) {
    return res.status(400).json({ error: 'Nombre inválido' });
  }
  if (typeof apellido !== 'string' || apellido.length > 100) {
    return res.status(400).json({ error: 'Apellido inválido' });
  }
  const numPersonas = parseInt(personas, 10);
  if (isNaN(numPersonas) || numPersonas < 1 || numPersonas > 50) {
    return res.status(400).json({ error: 'Número de personas inválido (1-50)' });
  }
  const fechaDate = new Date(fecha);
  if (isNaN(fechaDate.getTime())) {
    return res.status(400).json({ error: 'Fecha inválida' });
  }

  const { error } = await supabase.from('reservas').insert([{
    usuario_id,
    nombre,
    apellido,
    personas: numPersonas,
    fecha_reserva: fecha,
    mensaje: typeof mensaje === 'string' ? mensaje.slice(0, 500) : mensaje
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
