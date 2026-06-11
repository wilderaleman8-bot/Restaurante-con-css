const supabase = require('../lib/supabaseClient');
const { sanitizar } = require('../utils/validation');
const cache = require('../utils/cache');

// POST /api/opiniones - Crea una opinión con validación de longitud y sanitización XSS
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

  const { data: newOpinion, error } = await supabase.from('opiniones').insert([{
    usuario_id,
    nombre: sanitizar(nombre),
    apellido: sanitizar(apellido),
    comentario: sanitizar(comentario)
  }]).select('id').single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  cache.clear('opiniones:'); // Invalida caché para que el listado se refresque
  const io = req.app.get('io');
  if (io) io.emit('new-opinion', { id: newOpinion.id, nombre, apellido });

  res.status(201).json({ message: 'Opinión guardada correctamente' });
}

// GET /api/opiniones - Lista opiniones paginadas con caché en memoria (60s)
async function listar(req, res) {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const from = page * limit;
  const to = from + limit - 1;
  const cacheKey = `opiniones:${page}:${limit}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    res.set('Cache-Control', 'public, max-age=60');
    return res.json(cached);
  }

  const { data, error } = await supabase
    .from('opiniones')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  cache.set(cacheKey, data);
  res.set('Cache-Control', 'public, max-age=60');
  res.json(data);
}

module.exports = { crear, listar };
