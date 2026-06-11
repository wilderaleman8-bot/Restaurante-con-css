// Caché en memoria simple con TTL. Útil para reducir llamadas a Supabase en endpoints públicos.
const store = new Map();
const DEFAULT_TTL = 60_000; // 60 segundos

// Retorna el valor si no ha expirado, o null si no existe / expiró
function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

// Guarda un valor con expiración automática
function set(key, data, ttl = DEFAULT_TTL) {
  store.set(key, { data, expiry: Date.now() + ttl });
}

// Limpia entradas que empiecen con un prefijo (útil al crear/editar registros)
function clear(prefix) {
  if (!prefix) { store.clear(); return; }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

module.exports = { get, set, clear };
