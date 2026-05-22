const router = require('express').Router();
const { crear, listar } = require('../controllers/valoracionesController');

router.post('/', crear);
router.get('/', listar);

module.exports = router;
