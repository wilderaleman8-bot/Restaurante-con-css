const router = require('express').Router();
const { solicitar, verificar, cambiar } = require('../controllers/passwordResetController');

router.post('/solicitar', solicitar);
router.post('/verificar', verificar);
router.post('/cambiar', cambiar);

module.exports = router;
