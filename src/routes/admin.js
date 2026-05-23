const router = require('express').Router();
const { verificarToken, verificarAdmin } = require('../middlewares/auth');
const { listarPedidos, listarReservas, listarUsuarios, actualizarPedido, listarValoracionesStats, listarOpiniones, listarValoracionesFull, reportes, actualizarUsuario, eliminarOpinion, eliminarValoracion } = require('../controllers/adminController');

router.use(verificarToken, verificarAdmin);

router.get('/pedidos', listarPedidos);
router.get('/reservas', listarReservas);
router.get('/usuarios', listarUsuarios);
router.patch('/pedidos/:id', actualizarPedido);
router.get('/valoraciones', listarValoracionesStats);
router.get('/opiniones', listarOpiniones);
router.get('/valoraciones/todas', listarValoracionesFull);
router.get('/reportes', reportes);
router.patch('/usuarios/:id', actualizarUsuario);
router.delete('/opiniones/:id', eliminarOpinion);
router.delete('/valoraciones/:id', eliminarValoracion);

module.exports = router;
