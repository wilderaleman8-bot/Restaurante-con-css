const router = require('express').Router();
const supabase = require('../lib/supabaseClient');

router.post('/', async (req, res) => {
  const { detalle, total, metodo_pago, card_last4, card_exp, card_brand, usuario_id } = req.body;

  if (!detalle || !total || !metodo_pago) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  const { error } = await supabase.from('pedidos').insert([{
    usuario_id,
    detalle: typeof detalle === 'object' ? detalle : { detalle },
    total,
    metodo_pago,
    card_last4,
    card_exp,
    card_brand
  }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Pedido creado correctamente' });
});

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
