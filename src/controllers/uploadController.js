const upload = require('../middlewares/upload');

function subirImagen(req, res) {
  upload.single('image')(req, res, err => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Error al subir la imagen' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }
    res.json({ url: '/uploads/menu/' + req.file.filename });
  });
}

module.exports = { subirImagen };
