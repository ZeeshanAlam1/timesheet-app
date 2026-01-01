// Configuration (loaded from config.js)
const API_BASE_URL = CONFIG.API_BASE_URL;
let authToken = null;
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    populateMonthYear();
});

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    document.getElementById('addLocationForm').addEventListener('submit', handleAddLocation);
}

// Authentication
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
        authToken = token;
        loadDashboard();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    
    btn.disabled = true;
    btn.innerHTML = '<div class="loading"></div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        if (data.user.role !== 'admin' && data.user.role !== 'manager') {
            throw new Error('Access denied. Admin or Manager role required.');
        }
        
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        
        showAlert('loginAlert', 'Login successful!', 'success');
        setTimeout(() => {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('dashboard').classList.add('active');
            loadDashboard();
        }, 500);
        
    } catch (error) {
        showAlert('loginAlert', error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Sign In';
    }
}

function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('loginForm').reset();
}

async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const user = await response.json();
        currentUser = user;
        
        document.getElementById('userName').textContent = user.name;
        
        await Promise.all([
            loadUsers(),
            loadLocations(),
            populateUserDropdowns()
        ]);
        
    } catch (error) {
        console.error('Dashboard load error:', error);
        logout();
    }
}

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Users Management
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const users = await response.json();
        const tbody = document.getElementById('usersTableBody');
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8">
                        <div class="empty-state">
                            <div class="empty-state-icon">👥</div>
                            <p>No users found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td><strong>${user.employeeId}</strong></td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge badge-${user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : 'success'}">${user.role}</span></td>
                <td>${user.department || '-'}</td>
                <td>
                    <span class="badge ${user.totpEnabled ? 'badge-success' : 'badge-warning'}">
                        ${user.totpEnabled ? 'Enabled' : 'Not Setup'}
                    </span>
                </td>
                <td>
                    <span class="badge ${user.isActive ? 'badge-success' : 'badge-error'}">
                        ${user.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-small btn-outline" onclick="viewUserDetails('${user._id}')">View</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Load users error:', error);
        showAlert('usersAlert', 'Failed to load users', 'error');
    }
}

async function populateUserDropdowns() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const users = await response.json();
        
        // Populate reporting manager dropdown
        const managerSelect = document.getElementById('newReportingManager');
        const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');
        managerSelect.innerHTML = '<option value="">None</option>' + 
            managers.map(m => `<option value="${m._id}">${m.name} (${m.employeeId})</option>`).join('');
        
        // Populate timesheet user dropdown
        const timesheetSelect = document.getElementById('timesheetUser');
        timesheetSelect.innerHTML = '<option value="">Select an employee</option>' +
            users.map(u => `<option value="${u._id}">${u.name} - ${u.employeeId}</option>`).join('');
        
    } catch (error) {
        console.error('Populate dropdowns error:', error);
    }
}

function openAddUserModal() {
    document.getElementById('addUserModal').classList.add('active');
}

async function handleAddUser(e) {
    e.preventDefault();
    
    const userData = {
        employeeId: document.getElementById('newEmployeeId').value,
        name: document.getElementById('newName').value,
        email: document.getElementById('newEmail').value,
        password: document.getElementById('newPassword').value,
        role: document.getElementById('newRole').value,
        reportingManager: document.getElementById('newReportingManager').value || null,
        department: document.getElementById('newDepartment').value,
        position: document.getElementById('newPosition').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create user');
        }
        
        showAlert('addUserAlert', 'User created successfully!', 'success');
        setTimeout(() => {
            closeModal('addUserModal');
            document.getElementById('addUserForm').reset();
            loadUsers();
            populateUserDropdowns();
        }, 1000);
        
    } catch (error) {
        showAlert('addUserAlert', error.message, 'error');
    }
}

function viewUserDetails(userId) {
    alert('User details view - To be implemented');
}

// Locations Management
async function loadLocations() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/locations`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const locations = await response.json();
        const tbody = document.getElementById('locationsTableBody');
        
        if (locations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="empty-state">
                            <div class="empty-state-icon">📍</div>
                            <p>No locations found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = locations.map(loc => `
            <tr>
                <td><strong>${loc.name}</strong></td>
                <td><code>${loc.terminalId}</code></td>
                <td>${loc.address || '-'}</td>
                <td>
                    <span class="badge ${loc.isActive ? 'badge-success' : 'badge-error'}">
                        ${loc.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-small btn-outline" onclick="viewLocation('${loc._id}')">View</button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Load locations error:', error);
    }
}

function openAddLocationModal() {
    document.getElementById('addLocationModal').classList.add('active');
}

async function handleAddLocation(e) {
    e.preventDefault();
    
    const locationData = {
        name: document.getElementById('newLocationName').value,
        terminalId: document.getElementById('newTerminalId').value,
        address: document.getElementById('newAddress').value,
        description: document.getElementById('newDescription').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/locations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(locationData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create location');
        }
        
        showAlert('addLocationAlert', 'Location created successfully!', 'success');
        setTimeout(() => {
            closeModal('addLocationModal');
            document.getElementById('addLocationForm').reset();
            loadLocations();
        }, 1000);
        
    } catch (error) {
        showAlert('addLocationAlert', error.message, 'error');
    }
}

function viewLocation(locationId) {
    alert('Location details view - To be implemented');
}

// Timesheet Management
function populateMonthYear() {
    const monthSelect = document.getElementById('timesheetMonth');
    const yearSelect = document.getElementById('timesheetYear');
    
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    monthSelect.innerHTML = months.map((month, index) => 
        `<option value="${index + 1}">${month}</option>`
    ).join('');
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    yearSelect.innerHTML = '';
    for (let year = currentYear - 2; year <= currentYear + 1; year++) {
        yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    }
    
    monthSelect.value = currentMonth;
    yearSelect.value = currentYear;
}

async function loadTimesheet() {
    const userId = document.getElementById('timesheetUser').value;
    const month = document.getElementById('timesheetMonth').value;
    const year = document.getElementById('timesheetYear').value;
    
    if (!userId) {
        alert('Please select an employee');
        return;
    }
    
    const reportDiv = document.getElementById('timesheetReport');
    reportDiv.innerHTML = '<div style="text-align: center;"><div class="loading"></div></div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/timesheet/${userId}/${year}/${month}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to load timesheet');
        }
        
        reportDiv.innerHTML = `
            <div class="card">
                <h3 style="font-family: 'Spectral', serif; color: var(--accent); margin-bottom: 1rem;">
                    Timesheet Report: ${data.user.name}
                </h3>
                <p style="color: var(--text-muted); margin-bottom: 2rem;">
                    ${data.user.employeeId} | ${data.user.department || 'N/A'} | ${data.user.position || 'N/A'}
                </p>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${data.statistics.presentDays}</div>
                        <div class="stat-label">Present Days</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${data.statistics.totalHours}</div>
                        <div class="stat-label">Total Hours</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${data.statistics.averageHoursPerDay}</div>
                        <div class="stat-label">Avg Hours/Day</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${data.statistics.incompleteDays}</div>
                        <div class="stat-label">Incomplete Days</div>
                    </div>
                </div>
                
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Check In</th>
                                <th>Check In Location</th>
                                <th>Check Out</th>
                                <th>Check Out Location</th>
                                <th>Total Hours</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.records.length === 0 ? `
                                <tr>
                                    <td colspan="7">
                                        <div class="empty-state">
                                            <div class="empty-state-icon">📅</div>
                                            <p>No attendance records for this period</p>
                                        </div>
                                    </td>
                                </tr>
                            ` : data.records.map(record => `
                                <tr>
                                    <td><strong>${formatDate(record.date)}</strong></td>
                                    <td>${record.checkInTime ? formatTime(record.checkInTime) : '-'}</td>
                                    <td>${record.checkInLocation || '-'}</td>
                                    <td>${record.checkOutTime ? formatTime(record.checkOutTime) : '-'}</td>
                                    <td>${record.checkOutLocation || '-'}</td>
                                    <td><strong>${record.totalHours.toFixed(2)} hrs</strong></td>
                                    <td>
                                        <span class="badge ${
                                            record.status === 'present' ? 'badge-success' :
                                            record.status === 'incomplete' ? 'badge-warning' : 'badge-error'
                                        }">
                                            ${record.status}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
    } catch (error) {
        reportDiv.innerHTML = `<div class="alert alert-error">${error.message}</div>`;
    }
}

// Utility Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showAlert(elementId, message, type) {
    const alertDiv = document.getElementById(elementId);
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
}
