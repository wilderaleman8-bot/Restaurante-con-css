const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { verificarToken } = require('../middlewares/auth');
const { crear, listar, obtenerEstado, actualizarEstado } = require('../controllers/pedidosController');

const pedidosLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Demasiados pedidos. Intenta de nuevo en 1 minuto.' }
});

router.post('/', pedidosLimiter, crear);
router.get('/', verificarToken, listar);
router.get('/:id', obtenerEstado);
router.patch('/:id', verificarToken, actualizarEstado);

module.exports = router;
