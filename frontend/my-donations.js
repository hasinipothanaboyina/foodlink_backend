/**
 * FoodLink AI - My Donations Page Logic
 * Paginated, filterable donation history.
 * Depends on script.js being loaded first (provides apiCall, getToken, openDonationModal).
 */

let currentPage = 1;
let currentStatus = 'all';
const PAGE_SIZE = 10;

function openDonationModal(id) {
  const modalBody = document.getElementById('donationModalBody');
  const modalOverlay = document.getElementById('donationModalOverlay');
  if (modalBody && modalOverlay) {
    const donation = window.latestDonations.find(d => d.id === id);
    if (donation) {
      const isDropoff = donation.delivery_method === 'donor_delivers';
      const mapQuery = isDropoff 
        ? encodeURIComponent((donation.ngo_name || '') + ' ' + (donation.ngo_address || ''))
        : encodeURIComponent(donation.address || '');
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
      
      modalBody.innerHTML = `
        <p><strong>Status:</strong> ${donation.status.replace('_', ' ')}</p>
        <p><strong>Food:</strong> ${donation.quantity}x ${donation.food_type}</p>
        <p><strong>NGO:</strong> ${donation.ngo_name || 'Pending Match'}</p>
        <p><strong>Distance:</strong> ${donation.distance_km != null ? Number(donation.distance_km).toFixed(1) + ' km' : '—'}</p>
        <p><strong>Delivery:</strong> ${isDropoff ? 'You will drop off' : 'NGO will pick up'}</p>
        <a href="${mapUrl}" target="_blank" class="btn btn-outline" style="margin-top: 1rem; display: inline-flex; width: 100%; justify-content: center;"><i class="fa-solid fa-location-arrow"></i> Get Directions</a>
      `;
      modalOverlay.style.display = 'flex';
    }
  }
}

async function loadDonationsPage(page = 1, status = 'all') {
  const tbody = document.getElementById('allDonationsTableBody');
  const summary = document.getElementById('resultsSummary');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">Loading...</td></tr>';

  try {
    const query = `?page=${page}&limit=${PAGE_SIZE}&status=${status}`;
    const data = await apiCall(`/donations/my${query}`);
    window.latestDonations = data.donations || [];

    if (!data.donations || data.donations.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">No donations found for this filter. <a href="donate.html" style="color:var(--primary)">Make a donation!</a></td></tr>';
      renderPagination(data.pagination);
      if (summary) summary.textContent = '';
      return;
    }

    const statusBadge = {
      pending: 'badge-pending',
      matched: 'badge-matched',
      in_transit: 'badge-matched',
      completed: 'badge-completed',
      cancelled: 'badge-pending',
    };

    tbody.innerHTML = data.donations.map((d) => `
      <tr>
        <td>#FL-${d.id}</td>
        <td>${d.quantity}x ${d.food_type}</td>
        <td><strong>${d.ngo_name || (d.status === 'pending' ? 'No NGOs available' : 'Finding match...')}</strong></td>
        <td>${d.distance_km != null ? Number(d.distance_km).toFixed(1) + ' km' : '—'}</td>
        <td><span class="badge ${statusBadge[d.status] || 'badge-pending'}">${d.status.replace('_', ' ')}</span></td>
        <td>${new Date(d.created_at).toLocaleDateString()}</td>
        <td><a href="#" class="view-donation-btn" data-id="${d.id}" style="color:var(--primary);font-weight:500;">View</a></td>
      </tr>
    `).join('');

    document.querySelectorAll('.view-donation-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openDonationModal(parseInt(btn.dataset.id));
      });
    });

    if (summary && data.pagination) {
      const { total, page: p, limit } = data.pagination;
      const start = (p - 1) * limit + 1;
      const end = Math.min(p * limit, total);
      summary.textContent = `Showing ${start}-${end} of ${total}`;
    }

    renderPagination(data.pagination);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:red;">Failed to load donations. Please login.</td></tr>';
  }
}

function renderPagination(pagination) {
  const container = document.getElementById('paginationControls');
  if (!container || !pagination) return;

  const { page, totalPages } = pagination;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <button id="prevPageBtn" class="btn btn-outline" ${page <= 1 ? 'disabled' : ''} style="padding: 0.5rem 1rem;">
      <i class="fa-solid fa-chevron-left"></i> Prev
    </button>
    <span style="color: var(--text-muted);">Page ${page} of ${totalPages}</span>
    <button id="nextPageBtn" class="btn btn-outline" ${page >= totalPages ? 'disabled' : ''} style="padding: 0.5rem 1rem;">
      Next <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;

  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadDonationsPage(currentPage, currentStatus);
    }
  });

  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadDonationsPage(currentPage, currentStatus);
    }
  });
}

async function loadImpactStats() {
  try {
    const data = await apiCall('/donations/my-stats');
    if (data) {
      document.getElementById('impactMeals').textContent = Math.round(data.mealsProvided).toLocaleString();
      document.getElementById('impactTotal').textContent = data.totalDonations.toLocaleString();
      document.getElementById('impactCO2').textContent = Math.round(data.co2Saved).toLocaleString();
      
      // Badges gamification logic
      const badgeIcon = document.getElementById('badgeIcon');
      const donorBadge = document.getElementById('donorBadge');
      if (badgeIcon && donorBadge) {
        if (data.totalDonations >= 50) {
          donorBadge.textContent = 'Platinum Hero';
          donorBadge.style.color = '#1e3a8a';
          badgeIcon.style.color = '#1e40af';
          badgeIcon.className = 'fa-solid fa-crown';
          badgeIcon.parentElement.style.background = 'rgba(255,255,255,0.6)';
          badgeIcon.parentElement.parentElement.style.background = 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)';
          badgeIcon.parentElement.parentElement.style.borderColor = '#60a5fa';
        } else if (data.totalDonations >= 20) {
          donorBadge.textContent = 'Gold Donor';
          badgeIcon.className = 'fa-solid fa-award';
        } else if (data.totalDonations >= 5) {
          donorBadge.textContent = 'Silver Donor';
          donorBadge.style.color = '#374151';
          badgeIcon.style.color = '#4b5563';
          badgeIcon.className = 'fa-solid fa-medal';
          badgeIcon.parentElement.parentElement.style.background = 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)';
          badgeIcon.parentElement.parentElement.style.borderColor = '#9ca3af';
        } else if (data.totalDonations > 0) {
          donorBadge.textContent = 'Bronze Donor';
          donorBadge.style.color = '#78350f';
          badgeIcon.style.color = '#92400e';
          badgeIcon.parentElement.parentElement.style.background = 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)';
          badgeIcon.parentElement.parentElement.style.borderColor = '#fb923c';
        } else {
          donorBadge.textContent = 'Starter';
        }
      }
    }
  } catch(err) {
    console.error('Could not load impact stats', err);
  }
}

async function loadSosAlerts() {
  try {
    const ngos = await apiCall('/donations/sos-ngos');
    const container = document.getElementById('sosAlertsContainer');
    const list = document.getElementById('sosNgosList');
    
    if (ngos && ngos.length > 0 && container && list) {
      container.style.display = 'block';
      list.innerHTML = ngos.map(ngo => `
        <div style="background: white; padding: 1rem; border-radius: var(--radius-sm); box-shadow: 0 2px 5px rgba(0,0,0,0.05); border-left: 4px solid #ef4444;">
          <h4 style="margin: 0 0 0.25rem 0; color: #b91c1c;">${ngo.name}</h4>
          <p style="margin: 0 0 0.5rem 0; font-size: 0.85rem; color: #4b5563;"><i class="fa-solid fa-location-dot"></i> ${ngo.city} - ${ngo.address}</p>
          <a href="donate.html?ngo=${ngo.id}" class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: #ef4444; border-color: #ef4444; width: 100%; justify-content: center;">Donate Now</a>
        </div>
      `).join('');
    }
  } catch(err) {
    console.error('Could not load SOS alerts', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDonationsPage(currentPage, currentStatus);
  loadImpactStats();
  loadSosAlerts();

  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      currentStatus = statusFilter.value;
      currentPage = 1;
      loadDonationsPage(currentPage, currentStatus);
    });
  }

  const modalOverlay = document.getElementById('donationModalOverlay');
  const closeModalBtn = document.getElementById('closeDonationModal');
  if (modalOverlay && closeModalBtn) {
    closeModalBtn.addEventListener('click', () => { modalOverlay.style.display = 'none'; });
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.style.display = 'none';
    });
  }

  const donorLogoutBtn = document.getElementById('donorLogoutBtn');
  if (donorLogoutBtn) {
    donorLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('foodlink_token');
      localStorage.removeItem('foodlink_user');
      window.location.href = 'index.html';
    });
  }
});
