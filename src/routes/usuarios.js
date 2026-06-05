const router = require('express').Router();
const { verificarToken } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { registro, login, listar, logout } = require('../controllers/usuariosController');

router.post('/registro', upload.single('image'), registro);
router.post('/login', login);
router.post('/logout', logout);
router.get('/', verificarToken, listar);

module.exports = router;
