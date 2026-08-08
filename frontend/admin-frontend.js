/**
 * FoodLink AI - Admin Panel Logic
 * Loads real platform stats, pending NGO approvals, and recent activity
 * from the backend admin API. Requires an admin-role JWT token.
 */

const ADMIN_API_BASE = 'https://foodlink-backend-6qny.onrender.com/api';
// Uploaded documents are served from the server root (not under /api),
// so build their URL from the same origin the API calls use.
const ADMIN_ORIGIN = window.location.protocol === 'file:' ? 'https://foodlink-backend-6qny.onrender.com' : window.location.origin;

function getAdminToken() {
  return localStorage.getItem('foodlink_token');
}

async function adminApiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAdminToken()}`,
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${ADMIN_API_BASE}${endpoint}`, options);
  return res.json();
}

// ─── LOAD STATS ─────────────────────────────────────────────────────────────
async function loadAdminStats() {
  try {
    const stats = await adminApiCall('/admin/stats');

    if (stats.message) {
      // auth error (e.g. token expired, not admin)
      document.getElementById('adminSubtitle').textContent = stats.message;
      return;
    }

    document.getElementById('statMeals').textContent = stats.totalMealsDonated.toLocaleString();
    document.getElementById('statUsers').textContent = stats.totalUsers.toLocaleString();
    document.getElementById('statNgos').textContent = stats.approvedNgos.toLocaleString();
    document.getElementById('statPendingNgos').textContent = stats.pendingNgos.toLocaleString();
    document.getElementById('statFailed').textContent = stats.failedMatches.toLocaleString();
    
    // New volunteer stats
    const volEl = document.getElementById('statVolunteers');
    if (volEl) volEl.textContent = stats.totalVolunteers != null ? stats.totalVolunteers.toLocaleString() : '—';
    
    const workEl = document.getElementById('statVolunteerWork');
    if (workEl) workEl.textContent = stats.activeVolunteerTasks != null ? stats.activeVolunteerTasks.toLocaleString() : '—';

    document.getElementById('adminSubtitle').textContent =
      `Live data — ${stats.totalDonations.toLocaleString()} total donations processed.`;
  } catch (err) {
    document.getElementById('adminSubtitle').textContent = 'Cannot connect to server. Is the backend running?';
  }
}

// ─── LOAD PENDING NGO APPROVALS ────────────────────────────────────────────
async function loadPendingNGOs() {
  const tbody = document.getElementById('pendingNgosBody');
  if (!tbody) return;

  try {
    const data = await adminApiCall('/admin/ngos/pending');

    if (!data.ngos || data.ngos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">No pending approvals.</td></tr>';
      return;
    }

    tbody.innerHTML = data.ngos.map((ngo) => `
      <tr style="border-color: #334155;">
        <td>${ngo.name}</td>
        <td>${ngo.registered_by || 'Unknown'}</td>
        <td>${ngo.capacity} meals</td>
        <td>${ngo.accepted_types}</td>
        <td>
          ${ngo.document_url
            ? `<a href="${ADMIN_ORIGIN}${ngo.document_url}" target="_blank" style="color: var(--primary); font-weight: 500;"><i class="fa-solid fa-file-lines"></i> View</a>`
            : `<span style="color: #f43f5e; font-size: 0.85rem;">Not provided</span>`}
        </td>
        <td>
          <button class="btn btn-primary approve-ngo-btn" data-id="${ngo.id}" style="padding: 0.4rem 1rem; font-size: 0.85rem;">
            <i class="fa-solid fa-check"></i> Approve
          </button>
        </td>
      </tr>
    `).join('');

    // Attach approve handlers
    document.querySelectorAll('.approve-ngo-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const ngoId = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = 'Approving...';

        try {
          const result = await adminApiCall(`/ngos/${ngoId}/approve`, 'PATCH');
          if (result.message && result.message.includes('approved')) {
            await loadPendingNGOs();
            await loadAdminStats();
          } else {
            alert(result.message || 'Failed to approve NGO.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Approve';
          }
        } catch (err) {
          alert('Cannot connect to server.');
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Approve';
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#f43f5e;">Failed to load pending NGOs.</td></tr>';
  }
}

// ─── LOAD APPROVED NGOS ───────────────────────────────────────────────────────
async function loadApprovedNGOs() {
  const tbody = document.getElementById('approvedNgosBody');
  if (!tbody) return;

  try {
    const data = await adminApiCall('/admin/ngos/approved');

    if (!data.ngos || data.ngos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No approved NGO partners.</td></tr>';
      return;
    }

    tbody.innerHTML = data.ngos.map((ngo) => `
      <tr style="border-color: #334155;" data-ngo='${JSON.stringify(ngo).replace(/'/g, "&apos;")}'>
        <td>${ngo.name}</td>
        <td>${ngo.city || 'Unknown'}</td>
        <td>${ngo.capacity} meals</td>
        <td><span style="color: #10b981; font-weight:600;">ACTIVE</span></td>
        <td>
          <button class="btn btn-outline view-ngo-btn" data-id="${ngo.id}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; margin-right: 0.3rem;">
            <i class="fa-solid fa-eye"></i> View
          </button>
          <button class="btn btn-primary remove-ngo-btn" data-id="${ngo.id}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: #f43f5e; border-color: #f43f5e;">
            <i class="fa-solid fa-trash"></i> Remove
          </button>
        </td>
      </tr>
    `).join('');

    // Attach View handlers
    document.querySelectorAll('.view-ngo-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const tr = e.target.closest('tr');
        const ngo = JSON.parse(tr.dataset.ngo);
        openNgoModal(ngo);
      });
    });

    // Attach Remove handlers
    document.querySelectorAll('.remove-ngo-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to permanently remove this NGO?')) return;
        const ngoId = btn.dataset.id;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
          const result = await adminApiCall(`/admin/ngos/${ngoId}`, 'DELETE');
          if (result.message && result.message.includes('removed')) {
            await loadApprovedNGOs();
            await loadAdminStats();
          } else {
            alert(result.message || 'Failed to remove NGO.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-trash"></i> Remove';
          }
        } catch (err) {
          alert('Cannot connect to server.');
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-trash"></i> Remove';
        }
      });
    });

  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#f43f5e;">Failed to load approved NGOs.</td></tr>';
  }
}

// ─── NGO DETAILS MODAL ──────────────────────────────────────────────────────
async function openNgoModal(ngo) {
  const modal = document.getElementById('ngoDetailsModal');
  const nameEl = document.getElementById('modalNgoName');
  const contentEl = document.getElementById('modalNgoContent');
  const issuesEl = document.getElementById('modalNgoIssues');

  nameEl.textContent = ngo.name;
  
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${ngo.latitude},${ngo.longitude}`;
  
  contentEl.innerHTML = `
    <p><strong>City:</strong> ${ngo.city || 'Unknown'}</p>
    <p><strong>Address:</strong> ${ngo.address || 'Not provided'}</p>
    <p><strong>Location:</strong> <a href="${mapUrl}" target="_blank" style="color:var(--primary);"><i class="fa-solid fa-map-location-dot"></i> View on Map</a></p>
    <p><strong>Capacity:</strong> ${ngo.capacity} meals</p>
    <p><strong>Accepted Types:</strong> ${ngo.accepted_types}</p>
    <p><strong>Registered By:</strong> ${ngo.registered_by || 'Unknown'} (${ngo.contact_email || 'N/A'})</p>
    <p><strong>Document:</strong> ${ngo.document_url ? `<a href="${ADMIN_ORIGIN}${ngo.document_url}" target="_blank" style="color:var(--primary);">View Uploaded Document</a>` : 'Not provided'}</p>
    <p><strong>Registered On:</strong> ${new Date(ngo.created_at).toLocaleString()}</p>
  `;

  issuesEl.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted);">Loading reports...</p>';
  modal.style.display = 'flex';

  try {
    const data = await adminApiCall(`/admin/ngos/${ngo.id}/issues`);
    if (!data.issues || data.issues.length === 0) {
      issuesEl.innerHTML = '<p style="font-size: 0.85rem; color: #10b981;">No issues reported for this NGO.</p>';
    } else {
      issuesEl.innerHTML = data.issues.map(i => `
        <div style="margin-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
          <p style="margin:0; font-size: 0.85rem;"><strong>Issue #${i.id}</strong> - ${i.category}</p>
          <p style="margin:0; font-size: 0.85rem; color: var(--text-muted);">${i.description}</p>
          <p style="margin:0; font-size: 0.75rem; color: ${i.status === 'open' ? '#f43f5e' : '#10b981'};">${i.status.toUpperCase()}</p>
        </div>
      `).join('');
    }
  } catch (e) {
    issuesEl.innerHTML = '<p style="font-size: 0.85rem; color: #f43f5e;">Failed to load issues.</p>';
  }
}

// Attach modal close
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('closeNgoModalBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('ngoDetailsModal').style.display = 'none';
    });
  }
  const closeVolBtn = document.getElementById('closeVolModalBtn');
  if (closeVolBtn) {
    closeVolBtn.addEventListener('click', () => {
      document.getElementById('volDetailsModal').style.display = 'none';
    });
  }
});

// ─── LOAD RECENT LOGS ───────────────────────────────────────────────────────
async function loadSystemLogs() {
  const tbody = document.getElementById('systemLogsBody');
  if (!tbody) return;

  try {
    const data = await adminApiCall('/admin/logs');

    const rows = [];

    (data.donationLogs || []).forEach((d) => {
      const time = new Date(d.created_at).toLocaleTimeString();
      const statusColor = d.status === 'cancelled' ? '#f43f5e' : d.status === 'pending' ? '#f59e0b' : '#10b981';
      const mapUrl = d.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.address)}` : '#';
      const addressHtml = d.delivery_method === 'ngo_pickup'
        ? `<br><a href="${mapUrl}" target="_blank" style="font-size: 0.8rem; color: var(--primary); text-decoration: none;"><i class="fa-solid fa-map-location-dot"></i> Donor Address: ${d.address || 'Pending'}</a>`
        : '';

      rows.push(`
        <tr style="border-color: #334155;">
          <td>${time}</td>
          <td>Donation Submitted</td>
          <td>#FL-${d.id}: ${d.quantity}x ${d.food_type} ${d.ngo_name ? '→ ' + d.ngo_name : ''} ${addressHtml}</td>
          <td><span style="color: ${statusColor};">${d.status.toUpperCase()}</span></td>
        </tr>
      `);
    });

    (data.ngoLogs || []).forEach((n) => {
      const time = new Date(n.created_at).toLocaleTimeString();
      rows.push(`
        <tr style="border-color: #334155;">
          <td>${time}</td>
          <td>NGO Registration</td>
          <td>"${n.name}"</td>
          <td><span style="color: ${n.approved ? '#10b981' : '#f59e0b'};">${n.approved ? 'APPROVED' : 'PENDING'}</span></td>
        </tr>
      `);
    });

    tbody.innerHTML = rows.length
      ? rows.join('')
      : '<tr><td colspan="4" style="text-align:center;color:#94a3b8;">No recent activity.</td></tr>';
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#f43f5e;">Failed to load logs.</td></tr>';
  }
}

// ─── LOAD USERS ─────────────────────────────────────────────────────────────
async function loadUsers() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  try {
    const data = await adminApiCall('/admin/users');
    if (data.message) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#f43f5e;">Error: ${data.message}</td></tr>`;
      return;
    }
    if (!data.users || data.users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No users found.</td></tr>';
      return;
    }
    tbody.innerHTML = data.users.map((u) => `
      <tr style="border-color: #334155;">
        <td>${u.id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>${new Date(u.created_at).toLocaleDateString()}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#f43f5e;">Failed to load users.</td></tr>';
  }
}

// ─── LOAD VOLUNTEERS ────────────────────────────────────────────────────────
async function loadVolunteers() {
  const tbody = document.getElementById('volunteersTableBody');
  if (!tbody) return;
  try {
    const data = await adminApiCall('/admin/volunteers');
    if (data.message) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#f43f5e;">Error: ${data.message}</td></tr>`;
      return;
    }
    if (!data.volunteers || data.volunteers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No volunteers found.</td></tr>';
      return;
    }
    tbody.innerHTML = data.volunteers.map((v) => `
      <tr style="border-color: #334155;">
        <td>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            ${v.photo_url 
              ? `<img src="${ADMIN_ORIGIN}${v.photo_url}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;">` 
              : `<div style="width:30px; height:30px; border-radius:50%; background:var(--primary); color:white; display:flex; align-items:center; justify-content:center; font-size:0.8rem;">${v.name.charAt(0)}</div>`}
            <div>
              <strong>${v.name}</strong><br>
              <small style="color:var(--text-muted);">${v.email}</small>
            </div>
          </div>
        </td>
        <td>${v.city || 'Unknown'}</td>
        <td>${v.vehicle_type} (${v.vehicle_number})</td>
        <td>₹${v.earnings}</td>
        <td>
          <button class="btn btn-outline view-volunteer-btn" data-vol='${JSON.stringify(v).replace(/'/g, "&apos;")}' style="padding: 0.3rem 0.6rem; font-size: 0.8rem; margin-right: 0.3rem;">
            <i class="fa-solid fa-eye"></i> View
          </button>
          <button class="btn btn-primary remove-volunteer-btn" data-id="${v.id}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: #f43f5e; border-color: #f43f5e;">
            <i class="fa-solid fa-trash"></i> Remove
          </button>
        </td>
      </tr>
    `).join('');

    // Attach View handlers
    document.querySelectorAll('.view-volunteer-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const vol = JSON.parse(btn.dataset.vol);
        const modal = document.getElementById('volDetailsModal');
        
        document.getElementById('modalVolNameTag').textContent = vol.name;
        document.getElementById('modalVolEmail').textContent = vol.email;
        
        const photoEl = document.getElementById('modalVolPhoto');
        const initEl = document.getElementById('modalVolInitials');
        if (vol.photo_url) {
            photoEl.src = `${ADMIN_ORIGIN}${vol.photo_url}`;
            photoEl.style.display = 'block';
            initEl.style.display = 'none';
        } else {
            photoEl.style.display = 'none';
            initEl.textContent = vol.name.charAt(0);
            initEl.style.display = 'flex';
        }

        document.getElementById('modalVolContent').innerHTML = `
            <p><strong>City:</strong> ${vol.city || '-'}</p>
            <p><strong>Age:</strong> ${vol.age || '-'}</p>
            <p><strong>Gender:</strong> ${vol.gender || '-'}</p>
            <p><strong>Phone:</strong> ${vol.phone || '-'}</p>
            <p><strong>Vehicle:</strong> ${vol.vehicle_type} (${vol.vehicle_number})</p>
            <p><strong>Earnings:</strong> ₹${vol.earnings || 0}</p>
            <p><strong>Status:</strong> ${vol.status}</p>
            <p><strong>Registered:</strong> ${new Date(vol.created_at).toLocaleDateString()}</p>
        `;
        modal.style.display = 'flex';
      });
    });

    // Attach Remove handlers
    document.querySelectorAll('.remove-volunteer-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to permanently remove this Volunteer and their account?')) return;
        const volId = btn.dataset.id;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
          const result = await adminApiCall(`/admin/volunteers/${volId}`, 'DELETE');
          if (result.message && result.message.includes('removed')) {
            await loadVolunteers();
          } else {
            alert(result.message || 'Failed to remove volunteer.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-trash"></i> Remove';
          }
        } catch (err) {
          alert('Cannot connect to server.');
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-trash"></i> Remove';
        }
      });
    });

  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#f43f5e;">Failed to load volunteers.</td></tr>';
  }
}

// ─── LOAD ISSUES (Real Database) ────────────────────────────────────────────
async function loadIssues() {
  const tbody = document.getElementById('issuesTableBody');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">Loading...</td></tr>';

  try {
    const data = await adminApiCall('/admin/issues');

    // Show migration hint if the table doesn't exist yet
    if (data.hint) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#f59e0b; padding:1.5rem;">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <strong>Database table missing.</strong><br>
        <span style="font-size:0.85rem;">Run <code>backend/db/migration_add_reported_issues.sql</code> in MySQL Workbench, then refresh.</span>
      </td></tr>`;
      return;
    }

    const issues = data.issues || [];

    if (issues.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">No reported issues. ✅</td></tr>';
      return;
    }

    tbody.innerHTML = issues.map((i) => {
      let photoHtml = '';
      if (i.photo_url) {
          const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:5000' : '';
          photoHtml = `<br><a href="${API_BASE}${i.photo_url}" target="_blank" style="font-size:0.8rem; color:var(--primary); text-decoration:none;"><i class="fa-solid fa-image"></i> View Photo</a>`;
      }
      return `
      <tr style="border-color: #334155;" id="issue-row-${i.id}">
        <td>#ISSUE-${i.id}</td>
        <td>${i.reported_by}</td>
        <td>${i.category}</td>
        <td>${i.description} ${photoHtml}</td>
        <td id="issue-status-${i.id}">
          <span style="color: ${i.status === 'open' ? '#f43f5e' : '#10b981'}; font-weight:600;">
            ${i.status === 'open' ? '⚠️ OPEN' : '✅ RESOLVED'}
          </span>
        </td>
        <td>
          ${i.status === 'open'
            ? `<button class="btn btn-primary resolve-issue-btn" data-id="${i.id}" style="padding:0.3rem 0.8rem; font-size:0.8rem;">
                 <i class="fa-solid fa-check"></i> Resolve
               </button>`
            : `<span style="color:#64748b; font-size:0.85rem;">Done</span>`
          }
        </td>
      </tr>
      `;
    }).join('');

    // Attach resolve button handlers — calls real backend API to save in DB
    document.querySelectorAll('.resolve-issue-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
          const result = await adminApiCall(`/admin/issues/${id}/resolve`, 'PATCH');
          if (result.message && result.message.includes('resolved')) {
            // Update the status cell immediately without reload
            const statusCell = document.getElementById(`issue-status-${id}`);
            if (statusCell) {
              statusCell.innerHTML = '<span style="color:#10b981; font-weight:600;">✅ RESOLVED</span>';
            }
            btn.outerHTML = '<span style="color:#64748b; font-size:0.85rem;">Done</span>';
          } else {
            alert(result.message || 'Failed to resolve issue.');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Resolve';
          }
        } catch (err) {
          alert('Cannot connect to server.');
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Resolve';
        }
      });
    });
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#f43f5e;">Failed to load issues. Is the backend running?</td></tr>';
  }
}

// ─── LOGOUT & INITIALIZATION ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('foodlink_token');
      localStorage.removeItem('foodlink_user');
      window.location.href = 'auth.html';
    });
  }

  // Tab switching logic
  const tabs = ['overview', 'users', 'ngos', 'volunteers', 'issues'];
  tabs.forEach(tab => {
    const tabLink = document.getElementById(`tab-${tab}`);
    if (tabLink) {
      tabLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Update active class on links
        tabs.forEach(t => document.getElementById(`tab-${t}`)?.classList.remove('active'));
        tabLink.classList.add('active');

        // Update visible views
        document.querySelectorAll('.admin-view').forEach(view => view.style.display = 'none');
        document.getElementById(`view-${tab}`).style.display = 'block';

        // Load specific data
        if (tab === 'users') loadUsers();
        if (tab === 'volunteers') loadVolunteers();
        if (tab === 'ngos') {
          // Default to Pending view
          document.getElementById('section-pending-ngos').style.display = 'block';
          document.getElementById('section-approved-ngos').style.display = 'none';
          document.getElementById('btn-show-pending-ngos').classList.replace('btn-outline', 'btn-primary');
          document.getElementById('btn-show-approved-ngos').classList.replace('btn-primary', 'btn-outline');
          loadPendingNGOs();
        }
        if (tab === 'issues') loadIssues();
        if (tab === 'overview') {
          loadAdminStats();
          loadSystemLogs();
        }
      });
    }
  });

  loadAdminStats();
  loadSystemLogs();

  // Sub-tabs for NGOs
  const btnPending = document.getElementById('btn-show-pending-ngos');
  const btnApproved = document.getElementById('btn-show-approved-ngos');
  const secPending = document.getElementById('section-pending-ngos');
  const secApproved = document.getElementById('section-approved-ngos');

  if (btnPending && btnApproved) {
    btnPending.addEventListener('click', () => {
      secPending.style.display = 'block';
      secApproved.style.display = 'none';
      btnPending.classList.replace('btn-outline', 'btn-primary');
      btnApproved.classList.replace('btn-primary', 'btn-outline');
      loadPendingNGOs();
    });
    btnApproved.addEventListener('click', () => {
      secPending.style.display = 'none';
      secApproved.style.display = 'block';
      btnApproved.classList.replace('btn-outline', 'btn-primary');
      btnPending.classList.replace('btn-primary', 'btn-outline');
      loadApprovedNGOs();
    });
  }
});