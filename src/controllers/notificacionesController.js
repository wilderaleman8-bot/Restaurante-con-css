const webpush = require('web-push');

const vapidPublic = process.env.VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(
    'mailto:saboresancestrales@gmail.com',
    vapidPublic,
    vapidPrivate
  );
}

const subscriptions = [];

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