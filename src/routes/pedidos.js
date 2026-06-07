const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth');
const { crear, listar, obtenerEstado, actualizarEstado } = require('../controllers/pedidosController');

router.post('/', crear);
router.get('/', verificarToken, listar);
router.get('/:id', obtenerEstado);
router.patch('/:id', verificarToken, actualizarEstado);

module.exports = router;
