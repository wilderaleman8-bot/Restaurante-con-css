const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { crear, listar } = require('../controllers/opinionesController');

const opinionesLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: 'Demasiadas opiniones. Intenta de nuevo en 1 minuto.' }
});

router.post('/', opinionesLimiter, crear);
router.get('/', listar);

module.exports = router;
