const router = require('express').Router();
const { verificarToken, verificarAdmin } = require('../middlewares/auth');
const { listar, listarAdmin, crear, actualizar, eliminar, seed } = require('../controllers/platillosController');

router.get('/', listar);
router.get('/admin', verificarToken, verificarAdmin, listarAdmin);
router.post('/', verificarToken, verificarAdmin, crear);
router.put('/:id', verificarToken, verificarAdmin, actualizar);
router.delete('/:id', verificarToken, verificarAdmin, eliminar);
router.post('/seed', verificarToken, verificarAdmin, seed);

module.exports = router;
