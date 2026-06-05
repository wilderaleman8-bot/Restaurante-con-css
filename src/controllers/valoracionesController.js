const supabase = require('../lib/supabaseClient');
const { sanitizar } = require('../utils/validation');

async function crear(req, res) {
  const { nombre, apellido, calificacion, comentario, usuario_id } = req.body;

  if (!nombre || !apellido) {
    return res.status(400).json({ error: 'Nombre y apellido son obligatorios' });
  }
  if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
    return res.status(400).json({ error: 'Calificación inválida (1-5)' });
  }
  if (typeof comentario === 'string' && comentario.length > 2000) {
    return res.status(400).json({ error: 'El comentario no puede exceder 2000 caracteres' });
  }

  const { error } = await supabase.from('valoraciones').insert([
    { usuario_id, nombre: sanitizar(nombre), apellido: sanitizar(apellido), calificacion, comentario: comentario ? sanitizar(comentario) : null }
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Valoración guardada correctamente' });
}

async function listar(req, res) {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('valoraciones')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
}

module.exports = { crear, listar };
