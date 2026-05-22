const supabase = require('../lib/supabaseClient');

async function listarPedidos(req, res) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*, usuario:usuario_id(id, nombre, email)')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

async function listarReservas(req, res) {
  const { data, error } = await supabase
    .from('reservas')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

async function listarUsuarios(req, res) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, image_path, created_at')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

async function actualizarPedido(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const estadosValidos = ['pendiente', 'preparando', 'servido', 'cancelado'];
  if (!estadosValidos.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const { data, error } = await supabase
    .from('pedidos')
    .update({ status })
    .eq('id', id)
    .select('id, status')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Pedido no encontrado' });

  res.json({ message: 'Estado actualizado', id: data.id, status: data.status });
}

async function listarValoracionesStats(req, res) {
  const { data, error } = await supabase
    .from('valoraciones')
    .select('calificacion');

  if (error) return res.status(500).json({ error: error.message });

  const total = data.length;
  const promedio = total > 0
    ? (data.reduce((sum, v) => sum + v.calificacion, 0) / total).toFixed(2)
    : 0;

  const conteo = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  data.forEach(v => { conteo[v.calificacion]++; });

  res.json({ total, promedio: parseFloat(promedio), conteo });
}

module.exports = { listarPedidos, listarReservas, listarUsuarios, actualizarPedido, listarValoracionesStats };
