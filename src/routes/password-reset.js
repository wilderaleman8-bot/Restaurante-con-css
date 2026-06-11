const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { solicitar, verificar, cambiar } = require('../controllers/passwordResetController');

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Demasiadas solicitudes de recuperación. Intenta de nuevo en 1 hora.' }
});

router.post('/solicitar', resetLimiter, solicitar);
router.post('/verificar', verificar);
router.post('/cambiar', cambiar);

module.exports = router;
