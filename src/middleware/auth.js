// Middleware de autenticación mediante JSON Web Tokens
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Genera un token JWT con los datos del usuario, válido por 7 días
function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol || 'cliente' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verifica que la petición incluya un token JWT válido en el header Authorization
function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  // Extrae el token del formato "Bearer <token>"
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;  // Adjunta los datos del usuario a la petición
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Verifica que el usuario autenticado tenga rol de administrador
function verificarAdmin(req, res, next) {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
}

module.exports = { generarToken, verificarToken, verificarAdmin };
