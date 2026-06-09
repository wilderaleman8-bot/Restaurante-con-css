const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { crear, listar } = require('../controllers/valoracionesController');

const valoracionesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Demasiadas valoraciones. Intenta de nuevo en 1 minuto.' }
});

router.post('/', valoracionesLimiter, crear);
router.get('/', listar);

module.exports = router;
