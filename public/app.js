let currentPage = 1;
let totalPages = 1;
let cart = [];

const $ = (id) => document.getElementById(id);
const tbody = $('books');

function params(page) {
  const p = new URLSearchParams({
    page,
    limit: $('size').value,
    sort: $('sort').value,
  });
  if ($('q').value.trim()) p.set('q', $('q').value.trim());
  return p.toString();
}

async function loadPage(page) {
  $('error').textContent = '';
  try {
    const res = await fetch(`/api/books?${params(page)}`);
    if (!res.ok) throw new Error('Request failed');
    const data = await res.json();

    currentPage = data.page;
    totalPages = data.totalPages;

    tbody.innerHTML = '';
    for (const book of data.books) {
      const tr = document.createElement('tr');
      for (const text of [book.id, book.title, book.author, `₹${book.price}`, book.stock]) {
        const td = document.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
      }
      const actions = document.createElement('td');
      const buy = document.createElement('button');
      buy.textContent = 'Buy';
      buy.addEventListener('click', () => buyBook(book.id));
      const add = document.createElement('button');
      add.textContent = 'Add to cart';
      add.style.marginLeft = '0.3rem';
      add.addEventListener('click', () => addToCart(book));
      actions.append(buy, add);
      tr.appendChild(actions);
      tbody.appendChild(tr);
    }

    $('status').textContent = `Page ${currentPage} of ${totalPages}`;
    $('prev').disabled = currentPage <= 1;
    $('next').disabled = currentPage >= totalPages;
  } catch (err) {
    $('error').textContent = 'Could not load books. Is the server running?';
  }
}

async function buyBook(id) {
  $('msg').textContent = '';
  try {
    const res = await fetch(`/api/books/${id}/buy`, { method: 'POST' });
    const data = await res.json();
    $('msg').textContent = data.ok ? 'Thanks for your order!' : (data.error || 'Could not buy');
  } catch {
    $('msg').textContent = 'Could not buy.';
  }
  loadPage(currentPage);
}

function addToCart(book) {
  cart.push(book);
  renderCart();
}

async function renderCart() {
  const list = $('cart-items');
  list.textContent = cart.length ? cart.map((b) => b.title).join(', ') : 'Nothing yet.';
  if (!cart.length) { $('cart-total').textContent = '0.00'; return; }
  try {
    const res = await fetch('/api/cart/total', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: cart.map((b) => b.id) }),
    });
    const data = await res.json();
    $('cart-total').textContent = '₹' + data.total;
  } catch {
    $('cart-total').textContent = '?';
  }
}

$('prev').addEventListener('click', () => loadPage(currentPage - 1));
$('next').addEventListener('click', () => loadPage(currentPage + 1));
$('search-btn').addEventListener('click', () => loadPage(1));
$('q').addEventListener('keydown', (e) => { if (e.key === 'Enter') loadPage(1); });
$('sort').addEventListener('change', () => loadPage(1));
$('size').addEventListener('change', () => loadPage(1));
$('cart-clear').addEventListener('click', () => { cart = []; renderCart(); });

const hintBtn = $('hint-btn');
hintBtn.addEventListener('click', async () => {
  const question = $('hint-q').value.trim();
  if (question.length < 3) {
    $('hint-reply').textContent = 'Type your question first.';
    return;
  }
  hintBtn.disabled = true;
  $('hint-reply').textContent = 'Thinking...';
  try {
    const res = await fetch('/api/hint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    $('hint-reply').textContent = data.hint || data.error || 'No answer, try again.';
    if (typeof data.remaining === 'number') {
      $('hint-left').textContent = `${data.remaining} hint${data.remaining === 1 ? '' : 's'} left`;
      if (data.remaining === 0) return;
    }
    if (res.ok) $('hint-q').value = '';
  } catch {
    $('hint-reply').textContent = 'Could not reach the hint bot.';
  }
  hintBtn.disabled = false;
});

loadPage(1);
