const supabase = require('../lib/supabaseClient');

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

  const io = req.app.get('io');
  if (io) io.emit('new-order', { id: data.id, total: req.body.total, metodo_pago: req.body.metodo_pago, status: 'pendiente' });

  res.status(201).json({ message: 'Pedido creado correctamente', id: data.id, status: 'pendiente' });
}

async function listar(req, res) {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100));
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
}

async function actualizarEstado(req, res) {
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

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const io = req.app.get('io');
  if (io) io.emit('order-status', { id: data.id, status: data.status });

  res.json({ message: 'Estado actualizado', id: data.id, status: data.status });
}

module.exports = { crear, listar, actualizarEstado };
