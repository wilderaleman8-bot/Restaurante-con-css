const supabase = require('../lib/supabaseClient');
const { sanitizar } = require('../utils/validation');
const cache = require('../utils/cache');
const { getPagination } = require('../utils/pagination');

// POST /api/valoraciones - Crea una valoración (1-5 estrellas) con validación y sanitización
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

  const { data: newVal, error } = await supabase.from('valoraciones').insert([
    { usuario_id, nombre: sanitizar(nombre), apellido: sanitizar(apellido), calificacion, comentario: comentario ? sanitizar(comentario) : null }
  ]).select('id').single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  cache.clear('valoraciones:'); // Refresca la caché de valoraciones
  const io = req.app.get('io');
  if (io) io.emit('new-valoracion', { id: newVal.id, calificacion });

  res.status(201).json({ message: 'Valoración guardada correctamente' });
}

// GET /api/valoraciones - Lista valoraciones paginadas con caché en memoria (60s)
async function listar(req, res) {
  const { from, to, page, limit } = getPagination(req);
  const cacheKey = `valoraciones:${page}:${limit}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    res.set('Cache-Control', 'public, max-age=60');
    return res.json(cached);
  }

  const { data, error } = await supabase
    .from('valoraciones')
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
