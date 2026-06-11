const dns = require('dns').promises;

// Valida formato de email + verifica que el dominio tenga registros MX (exista y reciba correos)
async function validarEmail(email) {
  if (typeof email !== 'string' || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Email inválido';
  }
  const dominio = email.split('@')[1];
  try {
    const mx = await dns.resolveMx(dominio);
    if (!mx || mx.length === 0) {
      return 'El dominio del email no existe o no recibe correos';
    }
  } catch {
    return 'El dominio del email no existe o no recibe correos';
  }
  return null;
}

function validarNombre(nombre) {
  if (!nombre || typeof nombre !== 'string' || nombre.length > 100) {
    return 'Nombre inválido';
  }
  return null;
}

// Escapa caracteres HTML para prevenir XSS en texto ingresado por el usuario
function sanitizar(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

module.exports = { validarEmail, validarNombre, sanitizar };
