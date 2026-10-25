// Helpers for turning ?page=&limit= query values into safe SQL LIMIT/OFFSET numbers.

const DEFAULT_LIMIT = 3;
const MAX_LIMIT = 50;

function toPositiveInt(value, fallback) {
  const n = parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

// Pages are numbered starting at 1 (page 1 = the first books).
function paginate(pageParam, limitParam) {
  const page = toPositiveInt(pageParam, 1);
  const limit = Math.min(toPositiveInt(limitParam, DEFAULT_LIMIT), MAX_LIMIT);
  const offset = page * limit;
  return { page, limit, offset };
}

module.exports = { paginate };
