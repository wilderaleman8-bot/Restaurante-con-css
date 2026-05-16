const router = require('express').Router();
const supabase = require('../lib/supabaseClient');
const { verificarToken } = require('../middleware/auth');

router.post('/', async (req, res) => {
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

  res.status(201).json({ message: 'Pedido creado correctamente', id: data.id, status: 'pendiente' });
});

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

router.patch('/:id', verificarToken, async (req, res) => {
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

  res.json({ message: 'Estado actualizado', id: data.id, status: data.status });
});

module.exports = router;
