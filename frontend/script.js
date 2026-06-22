/**
 * FoodLink AI - Frontend Logic (Connected to Backend)
 * Replace your existing script.js with this file
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api'; // Your backend URL

// Helper to get the JWT token stored after login
function getToken() {
  return localStorage.getItem('foodlink_token');
}

// Helper to make authenticated API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${endpoint}`, options);
  return res.json();
}

// ─── ON PAGE LOAD ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── Mobile Navigation Toggle ─────────────────────────────────────────────
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-xmark');
    });
  }

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  });

  // ── LOGIN FORM (auth.html) ────────────────────────────────────────────────
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const data = await apiCall('/auth/login', 'POST', { email, password });

        if (data.token) {
          // Save token and user info in localStorage
          localStorage.setItem('foodlink_token', data.token);
          localStorage.setItem('foodlink_user', JSON.stringify(data.user));
          alert(`Welcome back, ${data.user.name}!`);
          window.location.href = 'dashboard.html';
        } else {
          alert(data.message || 'Login failed. Check your credentials.');
        }
      } catch (err) {
        alert('Cannot connect to server. Make sure your backend is running on port 5000.');
      }
    });
  }

  // ── REGISTER FORM (if you add one) ───────────────────────────────────────
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const role = document.getElementById('role')?.value || 'donor';

      try {
        const data = await apiCall('/auth/register', 'POST', { name, email, password, role });
        alert(data.message);
        if (data.userId) window.location.href = 'auth.html';
      } catch (err) {
        alert('Cannot connect to server.');
      }
    });
  }

  // ── GEOLOCATION (donate.html) ─────────────────────────────────────────────
  const getLocationBtn = document.getElementById('getLocationBtn');
  const addressInput = document.getElementById('address');
  const mapPlaceholder = document.getElementById('mapPlaceholder');

  // Store coordinates for backend submission
  window.donationCoords = { lat: null, lng: null };

  if (getLocationBtn && addressInput) {
    getLocationBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert('Geolocation not supported by your browser.');
        return;
      }

      getLocationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating...';

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.donationCoords = { lat: latitude, lng: longitude };

          setTimeout(() => {
            addressInput.value = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
            addressInput.removeAttribute('readonly');
            getLocationBtn.innerHTML = '<i class="fa-solid fa-check"></i> Acquired';
            getLocationBtn.classList.replace('btn-outline', 'btn-primary');
            if (mapPlaceholder) mapPlaceholder.style.display = 'flex';
          }, 800);
        },
        () => {
          alert('Unable to get location. Please type your address manually.');
          getLocationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Locate Me';
          addressInput.removeAttribute('readonly');
          addressInput.focus();
        }
      );
    });
  }

  // ── DONATION FORM SUBMIT (donate.html) ────────────────────────────────────
  const donationForm = document.getElementById('donationForm');
  const loadingOverlay = document.getElementById('loadingOverlay');

  if (donationForm && loadingOverlay) {
    donationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loadingOverlay.style.display = 'flex';

      const donationData = {
        food_type: document.getElementById('foodType').value,
        quantity: parseInt(document.getElementById('quantity').value),
        pickup_by: document.getElementById('expiryTime').value,
        address: document.getElementById('address').value,
        description: document.getElementById('description').value,
        latitude: window.donationCoords.lat,
        longitude: window.donationCoords.lng,
      };

      try {
        const data = await apiCall('/donations', 'POST', donationData);

        if (data.donationId) {
          const ngoInfo = data.matchedNGO
            ? `<strong>${data.matchedNGO.name}</strong> (${data.matchedNGO.distance} away)`
            : 'We are finding the best NGO for you shortly.';

          loadingOverlay.innerHTML = `
            <i class="fa-solid fa-circle-check" style="font-size:4rem;color:var(--primary);margin-bottom:1rem;"></i>
            <h2 style="margin-bottom:0.5rem;">${data.matchedNGO ? 'Match Found!' : 'Donation Submitted!'}</h2>
            <p style="color:var(--text-muted);">Your donation will be picked up by ${ngoInfo}.</p>
            <button onclick="window.location.href='dashboard.html'" class="btn btn-primary" style="margin-top:1.5rem;">
              Go to Dashboard
            </button>
          `;
        } else {
          loadingOverlay.style.display = 'none';
          alert(data.message || 'Failed to submit donation. Please login first.');
        }
      } catch (err) {
        loadingOverlay.style.display = 'none';
        alert('Cannot connect to server. Is the backend running?');
      }
    });
  }

  // ── DASHBOARD (dashboard.html) ────────────────────────────────────────────
  const donationsTableBody = document.getElementById('donationsTableBody');
  if (donationsTableBody) {
    loadMyDonations().then(() => {
      showRealNotificationBanner();
    });
    loadNotificationsList();
  }

  // ── Notifications dropdown toggle ───────────────────────────────────────
  const notifLink = document.getElementById('notificationsLink');
  const notifPanel = document.getElementById('notificationsPanel');
  if (notifLink && notifPanel) {
    notifLink.addEventListener('click', (e) => {
      e.preventDefault();
      notifPanel.style.display = notifPanel.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', (e) => {
      if (!notifPanel.contains(e.target) && e.target !== notifLink && !notifLink.contains(e.target)) {
        notifPanel.style.display = 'none';
      }
    });
  }

  // ── Donation detail modal close handlers ────────────────────────────────
  const modalOverlay = document.getElementById('donationModalOverlay');
  const closeModalBtn = document.getElementById('closeDonationModal');
  if (modalOverlay && closeModalBtn) {
    closeModalBtn.addEventListener('click', () => { modalOverlay.style.display = 'none'; });
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.style.display = 'none';
    });
  }

  // Show logged-in user's name on dashboard
  const userProfile = document.querySelector('.user-profile');
  if (userProfile) {
    const user = JSON.parse(localStorage.getItem('foodlink_user') || '{}');
    if (user.name) {
      userProfile.innerHTML = `
        <div style="width:35px;height:35px;border-radius:50%;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;">
          ${user.name.charAt(0).toUpperCase()}
        </div>
        ${user.name}
      `;
    }
  }
});

// ─── SHOW BANNER ONLY IF THERE'S REAL RECENT ACTIVITY (last 5 min) ───────────
function showRealNotificationBanner() {
  const banner = document.getElementById('notificationBanner');
  if (!banner || !window.latestDonations || window.latestDonations.length === 0) return;

  const mostRecent = window.latestDonations[0];
  const createdAt = new Date(mostRecent.created_at);
  const isRecent = Date.now() - createdAt.getTime() < 5 * 60 * 1000; // within 5 minutes

  if (isRecent && (mostRecent.status === 'matched' || mostRecent.status === 'in_transit')) {
    document.getElementById('notifBannerTitle').textContent =
      mostRecent.status === 'matched' ? 'Donation Matched!' : 'Donation Picked Up!';
    document.getElementById('notifBannerText').textContent =
      `Your ${mostRecent.food_type} (#FL-${mostRecent.id}) is headed to ${mostRecent.ngo_name || 'an NGO partner'}.`;

    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 5000);
  }
}

// ─── NOTIFICATIONS LIST (sidebar dropdown) ───────────────────────────────────
async function loadNotificationsList() {
  const listEl = document.getElementById('notificationsList');
  const badge = document.getElementById('notifCountBadge');
  if (!listEl) return;

  try {
    const data = await apiCall('/donations/my');
    const donations = data.donations || [];

    // "Notifications" = donations with status updates worth surfacing
    const relevant = donations.filter((d) => d.status !== 'pending').slice(0, 8);

    if (badge) {
      if (relevant.length > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = relevant.length;
      } else {
        badge.style.display = 'none';
      }
    }

    if (relevant.length === 0) {
      listEl.innerHTML = '<p style="padding: 1rem; color: var(--text-muted); text-align:center;">No notifications yet.</p>';
      return;
    }

    const statusText = {
      matched: 'Matched with',
      in_transit: 'Picked up by',
      completed: 'Delivered via',
      cancelled: 'Cancelled',
    };

    listEl.innerHTML = relevant.map((d) => `
      <div style="padding: 0.8rem 1rem; border-bottom: 1px solid var(--border);">
        <p style="font-size: 0.9rem; font-weight: 500;">
          #FL-${d.id}: ${statusText[d.status] || d.status} ${d.ngo_name || ''}
        </p>
        <p style="font-size: 0.8rem; color: var(--text-muted);">
          ${d.quantity}x ${d.food_type} — ${new Date(d.created_at).toLocaleDateString()}
        </p>
      </div>
    `).join('');
  } catch (err) {
    listEl.innerHTML = '<p style="padding: 1rem; color: var(--text-muted); text-align:center;">Failed to load.</p>';
  }
}

// ─── DONATION DETAIL MODAL ────────────────────────────────────────────────
function openDonationModal(donationId) {
  const overlay = document.getElementById('donationModalOverlay');
  const body = document.getElementById('donationModalBody');
  if (!overlay || !body) return;

  const donation = (window.latestDonations || []).find((d) => d.id === donationId);
  if (!donation) return;

  const statusLabel = {
    pending: 'Pending Match',
    matched: 'Matched — Waiting Pickup',
    in_transit: 'In Transit',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  body.innerHTML = `
    <div><strong>Donation ID:</strong> #FL-${donation.id}</div>
    <div><strong>Food Type:</strong> ${donation.food_type}</div>
    <div><strong>Quantity:</strong> ${donation.quantity} meals</div>
    <div><strong>Status:</strong> ${statusLabel[donation.status] || donation.status}</div>
    <div><strong>Matched NGO:</strong> ${donation.ngo_name || 'Not yet matched'}</div>
    <div><strong>Distance:</strong> ${donation.distance_km != null ? donation.distance_km.toFixed(1) + ' km' : '—'}</div>
    <div><strong>Pickup Address:</strong> ${donation.address || '—'}</div>
    <div><strong>Must be picked up by:</strong> ${donation.pickup_by ? new Date(donation.pickup_by).toLocaleString() : '—'}</div>
    ${donation.description ? `<div><strong>Notes:</strong> ${donation.description}</div>` : ''}
    <div><strong>Submitted:</strong> ${new Date(donation.created_at).toLocaleString()}</div>
  `;

  overlay.style.display = 'flex';
}

// ─── LOAD DONATIONS ON DASHBOARD ─────────────────────────────────────────────
async function loadMyDonations() {
  const tbody = document.getElementById('donationsTableBody');
  if (!tbody) return;

  try {
    const data = await apiCall('/donations/my');
    window.latestDonations = data.donations || [];

    if (!data.donations || data.donations.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No donations yet. <a href="donate.html" style="color:var(--primary)">Make your first donation!</a></td></tr>';
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
        <td><strong>${d.ngo_name || 'Finding match...'}</strong></td>
        <td>${d.distance_km != null ? d.distance_km.toFixed(1) + ' km' : '—'}</td>
        <td><span class="badge ${statusBadge[d.status] || 'badge-pending'}">${d.status.replace('_', ' ')}</span></td>
        <td><a href="#" class="view-donation-btn" data-id="${d.id}" style="color:var(--primary);font-weight:500;">View</a></td>
      </tr>
    `).join('');

    document.querySelectorAll('.view-donation-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openDonationModal(parseInt(btn.dataset.id));
      });
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Failed to load donations. Please login.</td></tr>';
  }
}