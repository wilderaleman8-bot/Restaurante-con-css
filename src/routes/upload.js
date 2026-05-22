const router = require('express').Router();
const { verificarToken, verificarAdmin } = require('../middlewares/auth');
const { subirImagen } = require('../controllers/uploadController');

router.post('/', verificarToken, verificarAdmin, subirImagen);

module.exports = router;
