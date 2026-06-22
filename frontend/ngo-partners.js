/**
 * FoodLink AI - NGO Partners Page Logic
 * Lists ALL approved NGOs as cards. Supports city filtering and
 * "near me" distance sorting via geolocation.
 * Depends on script.js being loaded first (provides apiCall, getToken).
 */

let allNgos = [];
let userCoords = null;

async function loadNgoPartners() {
  const grid = document.getElementById('ngoCardsGrid');
  if (!grid) return;

  try {
    const query = userCoords ? `?lat=${userCoords.lat}&lng=${userCoords.lng}` : '';
    const data = await apiCall(`/ngos${query}`);
    allNgos = data.ngos || [];

    populateCityFilter(allNgos);
    renderNgoCards(allNgos);
  } catch (err) {
    grid.innerHTML = '<p style="color: var(--text-muted);">Failed to load NGO partners. Make sure you are logged in and the backend is running.</p>';
  }
}

function populateCityFilter(ngos) {
  const cityFilter = document.getElementById('cityFilter');
  if (!cityFilter) return;

  const cities = [...new Set(ngos.map((n) => n.city || 'Unknown'))].sort();
  const currentValue = cityFilter.value;

  cityFilter.innerHTML = '<option value="all">All Cities</option>' +
    cities.map((c) => `<option value="${c}">${c}</option>`).join('');

  cityFilter.value = currentValue || 'all';
}

function renderNgoCards(ngos) {
  const grid = document.getElementById('ngoCardsGrid');
  if (!grid) return;

  const cityFilter = document.getElementById('cityFilter')?.value || 'all';
  const filtered = cityFilter === 'all' ? ngos : ngos.filter((n) => (n.city || 'Unknown') === cityFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color: var(--text-muted);">No NGOs found for this filter.</p>';
    return;
  }

  const typeLabels = {
    cooked: 'Cooked Meals',
    produce: 'Fresh Produce',
    packaged: 'Packaged Goods',
    bakery: 'Bakery / Bread',
  };

  grid.innerHTML = filtered.map((ngo) => {
    const types = (ngo.accepted_types || '').split(',').map((t) => typeLabels[t.trim()] || t.trim());
    const distanceHtml = ngo.distance_km != null
      ? `<div style="color: var(--primary); font-weight: 600; font-size: 0.9rem; margin-top: 0.5rem;"><i class="fa-solid fa-route"></i> ${Number(ngo.distance_km).toFixed(1)} km away</div>`
      : '';

    return `
      <div class="feature-card" style="text-align: left; padding: 1.5rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
          <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(16,185,129,0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;">
            <i class="fa-solid fa-building-ngo"></i>
          </div>
          <div>
            <h3 style="font-size: 1.1rem; margin-bottom: 0.2rem;">${ngo.name}</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem;"><i class="fa-solid fa-location-dot"></i> ${ngo.city || 'Unknown'}</p>
          </div>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem;">
          <strong>Capacity:</strong> ${ngo.capacity} meals
        </p>
        <p style="font-size: 0.9rem; color: var(--text-muted);">
          <strong>Accepts:</strong> ${types.join(', ')}
        </p>
        ${distanceHtml}
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  loadNgoPartners();

  const cityFilter = document.getElementById('cityFilter');
  if (cityFilter) {
    cityFilter.addEventListener('change', () => renderNgoCards(allNgos));
  }

  const findNearMeBtn = document.getElementById('findNearMeBtn');
  if (findNearMeBtn) {
    findNearMeBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Geolocation not supported by your browser.');
        return;
      }

      findNearMeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating...';

      navigator.geolocation.getCurrentPosition(
        (position) => {
          userCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
          findNearMeBtn.innerHTML = '<i class="fa-solid fa-check"></i> Sorted by Distance';
          document.getElementById('ngoSubtitle').textContent = 'NGOs sorted by distance from your location.';
          loadNgoPartners();
        },
        () => {
          alert('Unable to get your location.');
          findNearMeBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Sort by Distance from Me';
        }
      );
    });
  }
});
