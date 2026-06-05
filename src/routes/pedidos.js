const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth');
const { crear, listar, actualizarEstado } = require('../controllers/pedidosController');

router.post('/', crear);
router.get('/', verificarToken, listar);
router.patch('/:id', verificarToken, actualizarEstado);

module.exports = router;
