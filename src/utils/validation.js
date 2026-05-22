const dns = require('dns').promises;

async function validarEmail(email) {
  if (typeof email !== 'string' || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

module.exports = { validarEmail, validarNombre };
