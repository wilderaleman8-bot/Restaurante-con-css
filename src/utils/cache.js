const store = new Map();
const DEFAULT_TTL = 60_000;

function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

function set(key, data, ttl = DEFAULT_TTL) {
  store.set(key, { data, expiry: Date.now() + ttl });
}

function clear(prefix) {
  if (!prefix) { store.clear(); return; }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

module.exports = { get, set, clear };
