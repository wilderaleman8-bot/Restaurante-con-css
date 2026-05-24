const supabase = require('../lib/supabaseClient');

async function crear(req, res) {
  const { nombre, apellido, comentario, usuario_id } = req.body;

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
}

async function listar(req, res) {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('opiniones')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
}

module.exports = { crear, listar };
