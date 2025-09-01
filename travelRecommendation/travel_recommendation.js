/* travel.js — final version with Clear button logic */

const API_URL = './travel_recommendation_api.json';
let apiData = null;

async function loadData() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`Failed to load ${API_URL}`);
  apiData = await res.json();
  console.log('API data loaded:', apiData);
}

function makeCard({ name, imageUrl, description }, badgeText = '') {
  const fallback = `https://via.placeholder.com/600x360?text=${encodeURIComponent(name)}`;
  const badge = badgeText
    ? `<span style="position:absolute;top:10px;left:10px;background:#0ea5a3;color:#fff;padding:6px 10px;border-radius:999px;font-size:.8rem;">${badgeText}</span>`
    : '';
  const visitHref = `https://www.google.com/search?q=${encodeURIComponent(name)}`;

  return `
    <div class="card" style="background:rgba(0,0,0,.55);border-radius:14px;overflow:hidden;max-width:560px;">
      <div style="position:relative;">
        ${badge}
        <img src="${imageUrl}" alt="${name}" style="width:100%;height:320px;object-fit:cover"
             onerror="this.onerror=null;this.src='${fallback}'">
      </div>
      <div style="padding:14px;color:#fff;">
        <h3 style="margin:0 0 8px 0;font-size:1.05rem">${name}</h3>
        <p style="margin:0 0 12px 0;color:#d9e2ec;font-size:.95rem;line-height:1.5">${description}</p>
        <a href="${visitHref}" target="_blank" rel="noopener"
           style="display:inline-block;background:#0ea5a3;color:#fff;padding:8px 14px;border-radius:999px;text-decoration:none;">
          Visit
        </a>
      </div>
    </div>`;
}

function renderResults(cards) {
  const mount = document.getElementById('results');
  if (!mount) return;
  mount.style.display = 'grid';
  mount.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
  mount.style.gap = '18px';
  mount.style.marginTop = '14px';
  mount.innerHTML = cards.length
    ? cards.join('')
    : `<p style="color:#fff;background:rgba(0,0,0,.5);padding:10px;border-radius:8px">
         No results. Try “country”, “beach”, “temple”, or a place like “Japan”, “Sydney”.
       </p>`;
}

function clearResults() {
  const input = document.getElementById('searchInput');
  const mount = document.getElementById('results');
  if (input) input.value = '';
  if (mount) mount.innerHTML = '';
  input?.focus();
}

function searchData(q) {
  if (!apiData) return [];
  const query = q.toLowerCase().trim();
  const cards = [];

  if (query === 'beach' || query === 'beaches') {
    for (const b of apiData.beaches || []) cards.push(makeCard(b, 'Beach'));
    return cards;
  }
  if (query === 'temple' || query === 'temples') {
    for (const t of apiData.temples || []) cards.push(makeCard(t, 'Temple'));
    return cards;
  }
  if (query === 'country' || query === 'countries') {
    for (const country of apiData.countries || []) {
      for (const city of country.cities || []) cards.push(makeCard(city, country.name));
    }
    return cards;
  }

  for (const country of apiData.countries || []) {
    const countryMatch = country.name.toLowerCase().includes(query);
    for (const city of country.cities || []) {
      if (countryMatch || city.name.toLowerCase().includes(query)) {
        cards.push(makeCard(city, country.name));
      }
    }
  }
  for (const t of apiData.temples || []) {
    if (t.name.toLowerCase().includes(query)) cards.push(makeCard(t, 'Temple'));
  }
  for (const b of apiData.beaches || []) {
    if (b.name.toLowerCase().includes(query)) cards.push(makeCard(b, 'Beach'));
  }

  return cards;
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData().catch(err => console.error(err));

  const input = document.getElementById('searchInput');
  const btnSearch = document.getElementById('searchBtn');
  const btnReset = document.getElementById('resetBtn');

  btnSearch?.addEventListener('click', () => {
    const q = (input?.value || '').trim();
    if (!q) return renderResults([]);
    renderResults(searchData(q));
  });

  btnReset?.addEventListener('click', clearResults);
});
