const supabase = require('../lib/supabaseClient');
const { enviarAUsuario } = require('./notificacionesController');
const { getPagination } = require('../utils/pagination');

// POST /api/pedidos - Crea un pedido con validación de datos y método de pago
async function crear(req, res) {
  const { detalle, total, metodo_pago, card_last4, card_exp, card_brand, usuario_id } = req.body;

  if (!detalle || total === undefined || !metodo_pago) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }
  if (!Array.isArray(detalle) || detalle.length === 0) {
    return res.status(400).json({ error: 'El detalle debe ser un arreglo no vacío' });
  }
  if (typeof total !== 'number' || total <= 0) {
    return res.status(400).json({ error: 'Total inválido' });
  }
  const metodosValidos = ['efectivo', 'tarjeta'];
  if (!metodosValidos.includes(metodo_pago)) {
    return res.status(400).json({ error: 'Método de pago inválido' });
  }
  if (metodo_pago === 'tarjeta') {
    if (!card_last4 || !card_exp || !card_brand) {
      return res.status(400).json({ error: 'Datos de tarjeta incompletos' });
    }
  }

  const { data, error } = await supabase.from('pedidos').insert([{
    usuario_id,
    detalle,
    total,
    metodo_pago,
    card_last4,
    card_exp,
    card_brand
  }]).select('id').single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Notifica en tiempo real a admin vía Socket.IO
  const io = req.app.get('io');
  if (io) io.emit('new-order', { id: data.id, total: req.body.total, metodo_pago: req.body.metodo_pago, status: 'pendiente' });

  // Envía notificación push al usuario si está suscripto
  enviarAUsuario(usuario_id, '✅ Pedido confirmado', 'Tu pedido está en proceso. Te avisaremos cuando esté listo.', '/menu.html');

  res.status(201).json({ message: 'Pedido creado correctamente', id: data.id, status: 'pendiente' });
}

// GET /api/pedidos - Lista pedidos con paginación. Admin ve todos, clientes solo los suyos.
async function listar(req, res) {
  const { from, to } = getPagination(req);

  let query = supabase
    .from('pedidos')
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

// PATCH /api/pedidos/:id - Actualiza estado del pedido. Dispara notificaciones push y Socket.IO.
async function actualizarEstado(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  const estadosValidos = ['pendiente', 'preparando', 'servido', 'cancelado'];
  if (!estadosValidos.includes(status)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  const { data: pedido, error: fetchError } = await supabase
    .from('pedidos')
    .select('id, status, usuario_id')
    .eq('id', id)
    .single();

  if (fetchError || !pedido) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  // Solo el dueño del pedido o un admin pueden cambiar el estado
  if (req.usuario.rol !== 'admin' && pedido.usuario_id !== req.usuario.id) {
    return res.status(403).json({ error: 'No tienes permiso para actualizar este pedido' });
  }

  const { data, error } = await supabase
    .from('pedidos')
    .update({ status })
    .eq('id', id)
    .select('id, status, usuario_id')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

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

// GET /api/pedidos/:id - Obtiene estado de un pedido (endpoint público, sin token)
async function obtenerEstado(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('pedidos')
    .select('id, status, total, metodo_pago, created_at')
    .eq('id', id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  res.json(data);
}

module.exports = { crear, listar, obtenerEstado, actualizarEstado };
