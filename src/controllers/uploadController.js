const path = require('path');
const upload = require('../middlewares/upload');
const { compressImage } = require('../utils/compressImage');

// POST /api/upload - Sube una imagen de menú, la comprime a WebP y devuelve la URL pública
function subirImagen(req, res) {
  upload.single('image')(req, res, async err => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Error al subir la imagen' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }
    const result = await compressImage(req.file.path);
    const filename = result ? path.basename(result.compressed) : req.file.filename;
    res.json({ url: '/uploads/menu/' + filename });
  });
}

module.exports = { subirImagen };
