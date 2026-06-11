const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabaseClient');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Genera un JWT con los datos del usuario y su token_version (para invalidar sesiones al hacer logout)
function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, nombre: usuario.nombre, rol: usuario.rol || 'cliente', token_version: usuario.token_version || 0 },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Middleware: verifica el JWT desde Authorization header o cookie, y valida token_version contra la BD
async function verificarToken(req, res, next) {
  const header = req.headers.authorization;
  let token = null;

  if (header && header.startsWith('Bearer ')) {
    token = header.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verifica que el token_version coincida (invalida sesiones anteriores al hacer logout)
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('token_version')
      .eq('id', decoded.id)
      .single();

    if (!usuario || usuario.token_version !== decoded.token_version) {
      return res.status(401).json({ error: 'Sesión expirada. Inicia sesión nuevamente.' });
    }

    req.usuario = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    return res.status(500).json({ error: 'Error al verificar autenticación' });
  }
}

// Middleware: restringe acceso solo a usuarios con rol 'admin'
function verificarAdmin(req, res, next) {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
  }
  next();
}

module.exports = { generarToken, verificarToken, verificarAdmin };
