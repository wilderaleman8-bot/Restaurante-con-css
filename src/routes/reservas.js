const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth');
const { crear, listar } = require('../controllers/reservasController');

router.post('/', crear);
router.get('/', verificarToken, listar);

module.exports = router;
