const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { verificarToken } = require('../middlewares/auth');
const { crear, listar } = require('../controllers/reservasController');

const reservasLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Demasiadas reservas. Intenta de nuevo en 1 minuto.' }
});

router.post('/', reservasLimiter, crear);
router.get('/', verificarToken, listar);

module.exports = router;
