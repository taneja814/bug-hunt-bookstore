// Practice checks for students. Run with:  npm test
// Light checks for tickets 1 to 4 so you know you're on track. The organisers' real
// checks are tougher, and ticket 5 has no practice check on purpose.

const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function getJson(url, opts) {
  const res = await fetch(BASE + url, opts);
  return { status: res.status, body: await res.json().catch(() => ({})) };
}
const ids = (r) => (r.body.books || []).map((b) => b.id);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function walk(extra) {
  const rows = [];
  for (let p = 1; p <= 12; p++) {
    const r = await getJson(`/api/books?limit=1&page=${p}${extra ? '&' + extra : ''}`);
    if (r.status !== 200) return null;
    if (!(r.body.books || []).length) break;
    rows.push(...r.body.books);
  }
  return rows;
}

const checks = [
  ['Ticket 1: browsing pages', async () => same(ids(await getJson('/api/books?page=1&limit=3')), [1, 2, 3])],
  ['Ticket 2: sorting by price', async () => {
    const rows = await walk('sort=price');
    if (!rows || rows.length < 9) return false;
    const p = rows.map((b) => parseFloat(b.price));
    return p.every((v, i) => i === 0 || p[i - 1] <= v);
  }],
  ['Ticket 3: searching', async () => {
    const r = await getJson('/api/books?limit=1&q=' + encodeURIComponent("Midnight's"));
    return r.status === 200 && r.body.total === 1;
  }],
  ['Ticket 4: cart total', async () => {
    const r = await getJson('/api/cart/total', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [1, 2, 3] }),
    });
    return r.status === 200 && Math.round(parseFloat(r.body.total) * 100) === 104800;
  }],
];

(async () => {
  try {
    const health = await fetch(`${BASE}/api/health`);
    if (!health.ok) throw new Error('health check failed');
  } catch {
    console.log('Cannot reach the app. Is the server running? (try: npm start)');
    return;
  }

  let passed = 0;
  for (const [name, fn] of checks) {
    let ok = false;
    try { ok = await fn(); } catch { ok = false; }
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
    if (ok) passed++;
  }
  console.log('      Ticket 5: no practice check, reproduce it yourself');
  console.log(`\n${passed} of ${checks.length} practice checks passing.`);
  console.log('Fixed something? Run:  npm run submit   (push after every ticket you fix)');
})();
