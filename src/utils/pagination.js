// Helper de paginación — extrae page/limit de req.query y calcula el rango para Supabase
const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 100;

function getPagination(req) {
  const page = Math.max(0, parseInt(req.query.page) || 0);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit) || DEFAULT_LIMIT));
  const from = page * limit;
  const to = from + limit - 1;
  return { page, limit, from, to };
}

// Aplica .order() + .range() a una query de Supabase para paginación estándar
function paginateQuery(query, req, orderColumn = 'created_at', ascending = false) {
  const { from, to } = getPagination(req);
  return query
    .order(orderColumn, { ascending })
    .range(from, to);
}

module.exports = { getPagination, paginateQuery };