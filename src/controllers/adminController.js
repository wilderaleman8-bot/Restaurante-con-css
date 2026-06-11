const supabase = require('../lib/supabaseClient');
const { enviarAUsuario } = require('./notificacionesController');

// GET /api/admin/pedidos - Lista todos los pedidos con datos del usuario (paginado)
async function listarPedidos(req, res) {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('pedidos')
    .select('*, usuario:usuario_id(id, nombre, email)', { count: 'exact', head: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  res.set('X-Total-Count', count);
  res.json(data);
}

// GET /api/admin/reservas - Lista todas las reservas con datos del usuario (paginado)
async function listarReservas(req, res) {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('reservas')
    .select('*, usuario:usuario_id(id, nombre, email)')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// GET /api/admin/usuarios - Lista todos los usuarios (paginado, sin contraseñas)
async function listarUsuarios(req, res) {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, email, rol, image_path, created_at')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// PATCH /api/admin/pedidos/:id - Admin cambia estado de un pedido y notifica al usuario
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
    .select('id, status, usuario_id')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Pedido no encontrado' });

  const io = req.app.get('io');
  if (io) io.emit('order-status', { id: data.id, status: data.status });

  const mensajes = {
    preparando: { titulo: '👨‍🍳 Tu pedido está en cocina', cuerpo: 'Ya estamos preparando tu orden.' },
    servido: { titulo: '🍽️ Tu pedido está listo', cuerpo: 'Puedes pasar a recogerlo. ¡Buen provecho!' },
    cancelado: { titulo: '❌ Pedido cancelado', cuerpo: 'Tu pedido ha sido cancelado.' }
  };
  const msg = mensajes[status];
  if (msg) enviarAUsuario(data.usuario_id, msg.titulo, msg.cuerpo, '/menu.html');

  res.json({ message: 'Estado actualizado', id: data.id, status: data.status });
}

// GET /api/admin/valoraciones - Estadísticas: total, promedio y conteo por estrella
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

// GET /api/admin/opiniones - Lista todas las opiniones (paginado)
async function listarOpiniones(req, res) {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('opiniones')
    .select('*, usuario:usuario_id(id, nombre, email)')
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// GET /api/admin/valoraciones/todas - Lista todas las valoraciones completas (paginado)
async function listarValoracionesFull(req, res) {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('valoraciones')
    .select('*, usuario:usuario_id(id, nombre, email)')
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

// GET /api/admin/reportes - Genera stats: totales, ventas, platillos populares
async function reportes(req, res) {
  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const today = new Date().toISOString().slice(0, 10);

  const totalOrders = pedidos.length;
  const ordersToday = pedidos.filter(o => (o.created_at || '').slice(0, 10) === today);
  const completedOrders = pedidos.filter(o => o.status === 'servido');

  const totalRevenue = completedOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const revenueToday = ordersToday
    .filter(o => o.status !== 'cancelado')
    .reduce((sum, o) => sum + parseFloat(o.total || 0), 0);

  const byStatus = { pendiente: 0, preparando: 0, servido: 0, cancelado: 0 };
  pedidos.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });

  // Cuenta cuántas veces se ha pedido cada platillo
  const itemCount = {};
  pedidos.forEach(o => {
    if (Array.isArray(o.detalle)) {
      o.detalle.forEach(d => {
        const name = d.nombre || d.name || '?';
        itemCount[name] = (itemCount[name] || 0) + (d.cantidad || 1);
      });
    }
  });

  const popularItems = Object.entries(itemCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  res.json({
    totalOrders,
    ordersToday: ordersToday.length,
    completedOrders: completedOrders.length,
    totalRevenue,
    revenueToday,
    byStatus,
    popularItems
  });
}

// PATCH /api/admin/usuarios/:id - Cambia el rol de un usuario (admin/cliente)
async function actualizarUsuario(req, res) {
  const { id } = req.params;
  const { rol } = req.body;

  if (!['admin', 'cliente'].includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  const { data, error } = await supabase
    .from('usuarios')
    .update({ rol })
    .eq('id', id)
    .select('id, nombre, email, rol')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Usuario no encontrado' });

  res.json(data);
}

// DELETE /api/admin/opiniones/:id
async function eliminarOpinion(req, res) {
  const { id } = req.params;
  const { error } = await supabase.from('opiniones').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Opinión eliminada' });
}

// DELETE /api/admin/valoraciones/:id
async function eliminarValoracion(req, res) {
  const { id } = req.params;
  const { error } = await supabase.from('valoraciones').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Valoración eliminada' });
}

// DELETE /api/admin/reservas/:id
async function eliminarReserva(req, res) {
  const { id } = req.params;
  const { error } = await supabase.from('reservas').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Reserva eliminada' });
}

// DELETE /api/admin/usuarios/:id
async function eliminarUsuario(req, res) {
  const { id } = req.params;
  const { error } = await supabase.from('usuarios').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Usuario eliminado' });
}

module.exports = { listarPedidos, listarReservas, listarUsuarios, actualizarPedido, listarValoracionesStats, listarOpiniones, listarValoracionesFull, reportes, actualizarUsuario, eliminarOpinion, eliminarValoracion, eliminarReserva, eliminarUsuario };
