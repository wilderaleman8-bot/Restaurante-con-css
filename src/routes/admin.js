const router = require('express').Router();
const { verificarToken, verificarAdmin } = require('../middlewares/auth');
const { listarPedidos, listarReservas, listarUsuarios, actualizarPedido, listarValoracionesStats } = require('../controllers/adminController');

router.use(verificarToken, verificarAdmin);

router.get('/pedidos', listarPedidos);
router.get('/reservas', listarReservas);
router.get('/usuarios', listarUsuarios);
router.patch('/pedidos/:id', actualizarPedido);
router.get('/valoraciones', listarValoracionesStats);

module.exports = router;
