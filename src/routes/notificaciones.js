const router = require('express').Router();
const { suscribir } = require('../controllers/notificacionesController');
const { verificarToken } = require('../middlewares/auth');

router.post('/suscribir', verificarToken, suscribir);

module.exports = router;