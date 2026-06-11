const webpush = require('web-push');

const vapidPublic = process.env.VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

// Configura VAPID para push notifications si están definidas las claves en .env
if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(
    'mailto:saboresancestrales@gmail.com',
    vapidPublic,
    vapidPrivate
  );
}

// Almacén en memoria de suscripciones push (se pierde al reiniciar el servidor)
const subscriptions = [];

// POST /api/notificaciones/suscribir - Guarda o actualiza una suscripción push del cliente
async function suscribir(req, res) {
  const { subscription, usuario_id } = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Suscripción inválida' });
  }
  const idx = subscriptions.findIndex(s => s.endpoint === subscription.endpoint);
  const entry = { endpoint: subscription.endpoint, keys: subscription.keys, usuario_id: usuario_id || null };
  if (idx >= 0) subscriptions[idx] = entry;
  else subscriptions.push(entry);
  res.json({ message: 'Suscripto correctamente' });
}

// Envía notificación push a todas las suscripciones de un usuario.
// Si el endpoint devuelve 410 (ya no existe), lo elimina del arreglo.
async function enviarAUsuario(usuarioId, titulo, cuerpo, url) {
  if (!vapidPublic || !vapidPrivate) return;
  const userSubs = subscriptions.filter(s => s.usuario_id === usuarioId);
  const payload = JSON.stringify({ titulo, cuerpo, url });
  for (const sub of userSubs) {
    try {
      await webpush.sendNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth }
      }, payload);
    } catch (err) {
      if (err.statusCode === 410) {
        const idx = subscriptions.indexOf(sub);
        if (idx >= 0) subscriptions.splice(idx, 1);
      }
    }
  }
}

module.exports = { suscribir, enviarAUsuario, getVapidPublicKey: () => vapidPublic };