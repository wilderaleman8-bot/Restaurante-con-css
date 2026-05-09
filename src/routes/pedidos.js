const router = require('express').Router();
const supabase = require('../lib/supabaseClient');

/**
 * RUTA: POST /api/pedidos
 * DESCRIPCIÓN: Crea un nuevo pedido en la base de datos de Supabase.
 */
router.post('/', async (req, res) => {
  const { detalle, total, metodo_pago, card_last4, card_exp, card_brand, usuario_id } = req.body;

  // Validación básica de campos obligatorios
  if (!detalle || !total || !metodo_pago) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  // Inserción en la tabla 'pedidos' de Supabase
  const { error } = await supabase.from('pedidos').insert([{
    usuario_id, // Puede ser null si el usuario no está logueado
    detalle: typeof detalle === 'object' ? detalle : { detalle }, // Asegura formato JSON
    total,
    metodo_pago,
    card_last4,
    card_exp,
    card_brand
  }]);

  // Manejo de errores de la base de datos
  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Pedido creado correctamente' });
});

/**
 * RUTA: GET /api/pedidos
 * DESCRIPCIÓN: Obtiene la lista de todos los pedidos ordenados por fecha de creación.
 */
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;
