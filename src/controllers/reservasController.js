const supabase = require('../lib/supabaseClient');

async function crear(req, res) {
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
  if (isNaN(numPersonas) || numPersonas < 1 || numPersonas > 15) {
    return res.status(400).json({ error: 'Número de personas inválido (máximo 15)' });
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

  const io = req.app.get('io');
  if (io) io.emit('new-reservation', { nombre, apellido, personas: numPersonas, fecha });

  res.status(201).json({ message: 'Reserva guardada correctamente' });
}

async function listar(req, res) {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const from = page * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('reservas')
    .select('*')
    .order('created_at', { ascending: false });

  if (req.usuario.rol !== 'admin') {
    query = query.eq('usuario_id', req.usuario.id);
  }

  const { data, error } = await query.range(from, to);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
}

module.exports = { crear, listar };
