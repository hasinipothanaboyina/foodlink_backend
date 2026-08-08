const user = JSON.parse(localStorage.getItem('foodlink_user') || '{}');
const token = localStorage.getItem('foodlink_token');

// Basic DOM elements
const volNameNav = document.getElementById('volNameNav');
const volInitials = document.getElementById('volInitials');

// Tabs
const tabOverview = document.getElementById('tab-overview');
const tabDeliveries = document.getElementById('tab-deliveries');
const tabNgoNetwork = document.getElementById('tab-ngo-network');
const tabVolNetwork = document.getElementById('tab-vol-network');
const tabReport = document.getElementById('tab-report');

// Sections
const secOverview = document.getElementById('section-overview');
const secDeliveries = document.getElementById('section-deliveries');
const secNgoNetwork = document.getElementById('section-ngo-network');
const secVolNetwork = document.getElementById('section-vol-network');
const secReport = document.getElementById('section-report');
const pageTitle = document.getElementById('pageTitle');

function showSection(section, title, activeTab) {
    [secOverview, secDeliveries, secNgoNetwork, secVolNetwork, secReport].forEach(s => {
        if(s) s.style.display = 'none';
    });
    [tabOverview, tabDeliveries, tabNgoNetwork, tabVolNetwork, tabReport].forEach(t => {
        if(t) t.classList.remove('active');
    });
    
    if(section) section.style.display = 'block';
    if(activeTab) activeTab.classList.add('active');
    pageTitle.textContent = title;
}

tabOverview.addEventListener('click', (e) => { e.preventDefault(); showSection(secOverview, 'Overview', tabOverview); loadOverview(); });
tabDeliveries.addEventListener('click', (e) => { e.preventDefault(); showSection(secDeliveries, 'Deliveries', tabDeliveries); loadDeliveries(); });
tabNgoNetwork.addEventListener('click', (e) => { e.preventDefault(); showSection(secNgoNetwork, 'NGO Partners', tabNgoNetwork); loadNgoNetwork(); });
tabVolNetwork.addEventListener('click', (e) => { e.preventDefault(); showSection(secVolNetwork, 'Volunteer Partners', tabVolNetwork); loadVolNetwork(); });
if(tabReport) tabReport.addEventListener('click', (e) => { e.preventDefault(); showSection(secReport, 'Report Issue', tabReport); });

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    if (user.name) {
        volNameNav.textContent = user.name;
        volInitials.textContent = user.name.charAt(0).toUpperCase();
        document.getElementById('pdName').textContent = user.name;
    }
    loadOverview();
});

// Logout
document.getElementById('volLogoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'index.html';
});

// Report Issue
document.getElementById('reportIssueForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitIssueBtn');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

    try {
        const formData = new FormData();
        formData.append('category', document.getElementById('issueCategory').value);
        formData.append('description', document.getElementById('issueDescription').value);
        
        const photoInput = document.getElementById('issuePhoto');
        if (photoInput.files.length > 0) {
            formData.append('photo', photoInput.files[0]);
        }

        const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:5000/api' : '/api';
        const res = await fetch(`${API_BASE}/issues/report`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to submit report');
        
        showToast(data.message || 'Issue reported successfully!', 'success');
        document.getElementById('reportIssueForm').reset();
        tabOverview.click();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
});

// Helper for authorized API calls
async function volApiCall(endpoint, method = 'GET', body = null) {
    const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:5000/api' : '/api';
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API Error');
    return data;
}

function showToast(msg, type='success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fa-solid ${type==='success'?'fa-check-circle':'fa-exclamation-circle'}"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ==========================================
// LOAD OVERVIEW
// ==========================================
async function loadOverview() {
    try {
        const data = await volApiCall('/volunteers/me');
        const v = data.volunteer;
        if (v) {
            document.getElementById('statEarnings').textContent = `₹${v.earnings || '0.00'}`;
            document.getElementById('statVehicle').textContent = v.vehicle_type || 'None';
            document.getElementById('statVehicleNo').textContent = v.vehicle_number || 'N/A';
            
            // Personal Details
            document.getElementById('pdCity').textContent = v.city || '-';
            document.getElementById('pdAge').textContent = v.age || '-';
            document.getElementById('pdGender').textContent = v.gender ? (v.gender.charAt(0).toUpperCase() + v.gender.slice(1)) : '-';
            document.getElementById('pdVehicleType').textContent = v.vehicle_type || '-';
            document.getElementById('pdVehicleNumber').textContent = v.vehicle_number || '-';
            
            // Photo (Top Nav and Personal Details)
            const navPhotoEl = document.getElementById('volPhoto');
            const navInitEl = document.getElementById('volInitials');
            const pdPhotoEl = document.getElementById('pdPhoto');
            const pdInitEl = document.getElementById('pdInitials');
            
            if (v.photo_url) {
                const API_ORIGIN = window.location.protocol === 'file:' ? 'http://localhost:5000' : window.location.origin;
                const photoSrc = `${API_ORIGIN}${v.photo_url}`;
                
                // Fallback gracefully if image was deleted by Render's ephemeral storage
                navPhotoEl.onerror = () => {
                    navPhotoEl.style.display = 'none';
                    navInitEl.style.display = 'flex';
                };
                pdPhotoEl.onerror = () => {
                    pdPhotoEl.style.display = 'none';
                    pdInitEl.style.display = 'flex';
                };

                navPhotoEl.src = photoSrc;
                navPhotoEl.style.display = 'block';
                navInitEl.style.display = 'none';
                
                pdPhotoEl.src = photoSrc;
                pdPhotoEl.style.display = 'block';
                pdInitEl.style.display = 'none';
            } else {
                navPhotoEl.style.display = 'none';
                navInitEl.style.display = 'flex';
                
                pdPhotoEl.style.display = 'none';
                pdInitEl.style.display = 'flex';
            }
        }

        const hist = await volApiCall('/donations/volunteer-history');
        const completed = hist.donations.filter(d => d.status === 'completed').length;
        document.getElementById('statRides').textContent = completed;
    } catch (e) {
        console.error(e);
    }
}

// ==========================================
// EDIT PROFILE LOGIC
// ==========================================
document.getElementById('editProfileBtn')?.addEventListener('click', async () => {
    try {
        const data = await volApiCall('/volunteers/me');
        const v = data.volunteer;
        if (v) {
            document.getElementById('editCity').value = v.city || '';
            document.getElementById('editAge').value = v.age || '';
            document.getElementById('editGender').value = v.gender || 'male';
            document.getElementById('editVehicleType').value = v.vehicle_type || 'bike';
            document.getElementById('editVehicleNumber').value = v.vehicle_number || '';
            document.getElementById('editProfileModal').style.display = 'flex';
        }
    } catch (err) {
        showToast('Failed to load profile details.', 'error');
    }
});

document.getElementById('closeEditModalBtn')?.addEventListener('click', () => {
    document.getElementById('editProfileModal').style.display = 'none';
});

document.getElementById('editProfileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveProfileBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

    const formData = new FormData();
    formData.append('city', document.getElementById('editCity').value);
    formData.append('age', document.getElementById('editAge').value);
    formData.append('gender', document.getElementById('editGender').value);
    formData.append('vehicle_type', document.getElementById('editVehicleType').value);
    formData.append('vehicle_number', document.getElementById('editVehicleNumber').value);
    
    const photoFile = document.getElementById('editPhoto').files[0];
    if (photoFile) {
        formData.append('photo', photoFile);
    }

    try {
        const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:5000/api' : '/api';
        const res = await fetch(`${API_BASE}/volunteers/me`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'API Error');

        showToast(data.message, 'success');
        document.getElementById('editProfileModal').style.display = 'none';
        
        // Update user photo in localStorage if needed, or just reload overview
        loadOverview(); 
    } catch (err) {
        showToast(err.message || 'Failed to save changes.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Save Changes';
    }
});

// ==========================================
// LOAD DELIVERIES
// ==========================================
async function loadDeliveries() {
    const grid = document.getElementById('pickupsGrid');
    const tbody = document.getElementById('pastDeliveriesTable');
    
    try {
        // Available Pickups
        const data = await volApiCall('/donations/volunteer-available');
        document.getElementById('loading').style.display = 'none';
        
        if (!data.donations || data.donations.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; color: var(--text-muted);">No pending deliveries right now! You are all caught up.</p>';
        } else {
            grid.innerHTML = data.donations.map(p => `
                <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem; box-shadow: var(--shadow-sm);">
                    <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom: 1rem;">
                        <h3 style="margin:0; font-size: 1.1rem;"><i class="fa-solid fa-box"></i> ${p.quantity}x ${p.food_type}</h3>
                        ${p.is_urgent ? '<span style="background: rgba(244,63,94,0.1); color: #f43f5e; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700;">URGENT</span>' : ''}
                    </div>
                    <div style="margin-bottom: 1rem;">
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.3rem;"><strong>Pick up from:</strong></p>
                        <p style="font-size: 0.95rem; margin-bottom: 0.2rem;">${p.address}</p>
                        <p style="font-size: 0.85rem; color: var(--text-muted);"><i class="fa-solid fa-phone"></i> ${p.donor_phone || 'Contact provided on claim'}</p>
                    </div>
                    <div style="margin-bottom: 1.5rem; padding-top: 1rem; border-top: 1px dashed var(--border);">
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.3rem;"><strong>Deliver to:</strong></p>
                        <p style="font-size: 0.95rem; margin-bottom: 0.2rem;">${p.ngo_name}</p>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">${p.ngo_address}, ${p.city}</p>
                    </div>
                    <div style="background: rgba(16,185,129,0.08); color: #10b981; padding: 0.5rem; border-radius: var(--radius-sm); font-size: 0.85rem; text-align: center; margin-bottom: 1rem; font-weight: 600;">
                        <i class="fa-solid fa-indian-rupee-sign"></i> 50 Reward
                    </div>
                    <button class="btn btn-primary claim-btn" data-id="${p.id}" style="width: 100%; justify-content: center;">
                        <i class="fa-solid fa-truck-fast"></i> Claim Delivery
                    </button>
                </div>
            `).join('');

            document.querySelectorAll('.claim-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.closest('button').dataset.id;
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Claiming...';
                    try {
                        const res = await volApiCall(`/donations/${id}/claim-delivery`, 'PATCH');
                        showToast(res.message, 'success');
                        loadDeliveries();
                    } catch (err) {
                        showToast(err.message, 'error');
                        btn.disabled = false;
                        btn.innerHTML = '<i class="fa-solid fa-truck-fast"></i> Claim Pickup';
                    }
                });
            });
        }

        // History
        const hist = await volApiCall('/donations/volunteer-history');
        if (!hist.donations || hist.donations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No deliveries yet.</td></tr>';
        } else {
            tbody.innerHTML = hist.donations.map(d => {
                const date = new Date(d.created_at).toLocaleDateString();
                const isCompleted = d.status === 'completed';
                const statusBadge = isCompleted 
                    ? `<span class="status-badge badge-completed">Completed</span>`
                    : `<span class="status-badge badge-in_transit">In Transit</span>`;
                
                const actionHtml = isCompleted
                    ? `<span style="color:#10b981; font-weight:600;">+ ₹50</span>`
                    : `<button class="btn btn-primary btn-sm complete-btn" data-id="${d.id}"><i class="fa-solid fa-check"></i> Complete</button>`;

                return `
                    <tr>
                        <td>${date}</td>
                        <td>${d.quantity}x ${d.food_type}</td>
                        <td>${d.ngo_name}</td>
                        <td>${statusBadge}</td>
                        <td>${actionHtml}</td>
                    </tr>
                `;
            }).join('');

            document.querySelectorAll('.complete-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.closest('button').dataset.id;
                    try {
                        const res = await volApiCall(`/donations/${id}/complete-delivery`, 'PATCH');
                        showToast(res.message, 'success');
                        loadDeliveries();
                        loadOverview();
                    } catch (err) {
                        showToast(err.message, 'error');
                    }
                });
            });
        }
    } catch (e) {
        console.error(e);
    }
}

// ==========================================
// LOAD NGO NETWORK
// ==========================================
async function loadNgoNetwork() {
    const grid = document.getElementById('ngoNetworkGrid');
    try {
        const data = await volApiCall('/volunteers/ngo-partners');
        grid.innerHTML = data.ngos.map(n => `
            <div style="background: var(--surface); padding: 1.2rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                    <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(59,130,246,0.1); color: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                        <i class="fa-solid fa-building-ngo"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0;">${n.name}</h4>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">${n.city}</div>
                    </div>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 1rem;">
                    <i class="fa-solid fa-location-dot"></i> ${n.address}
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

// ==========================================
// LOAD VOLUNTEER NETWORK
// ==========================================
async function loadVolNetwork() {
    const grid = document.getElementById('volNetworkGrid');
    try {
        const data = await volApiCall('/volunteers/volunteer-partners');
        grid.innerHTML = data.volunteers.map(v => `
            <div style="background: var(--surface); padding: 1.2rem; border-radius: var(--radius-md); border: 1px solid var(--border); text-align: center;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem; margin: 0 auto 1rem;">
                    ${v.name.charAt(0).toUpperCase()}
                </div>
                <h4 style="margin: 0 0 0.2rem;">${v.name}</h4>
                <div style="font-size: 0.85rem; color: var(--text-muted);"><i class="fa-solid fa-car"></i> ${v.vehicle_type || 'Vehicle'}</div>
            </div>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}
