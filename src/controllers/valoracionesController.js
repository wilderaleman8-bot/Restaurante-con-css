const supabase = require('../lib/supabaseClient');

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
    { usuario_id, nombre, apellido, calificacion, comentario }
  ]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Valoración guardada correctamente' });
}

async function listar(req, res) {
  const { data, error } = await supabase.from('valoraciones').select('*').order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
}

module.exports = { crear, listar };
