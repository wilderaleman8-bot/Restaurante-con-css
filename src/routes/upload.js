const router = require('express').Router();
const upload = require('../middleware/upload');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

router.post('/', verificarToken, verificarAdmin, (req, res) => {
  upload.single('image')(req, res, err => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Error al subir la imagen' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }
    res.json({ url: '/uploads/menu/' + req.file.filename });
  });
});

module.exports = router;
