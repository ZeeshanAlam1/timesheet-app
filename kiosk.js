// Configuration (loaded from config.js)
const API_BASE_URL = CONFIG.API_BASE_URL;
let locations = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    loadLocations();
    setupFormHandlers();
});

// Clock
function updateClock() {
    const now = new Date();
    
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const dateString = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('currentTime').textContent = timeString;
    document.getElementById('currentDate').textContent = dateString;
}

// Load locations
async function loadLocations() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/locations`);
        locations = await response.json();
        
        const select = document.getElementById('locationSelect');
        
        if (locations.length === 0) {
            select.innerHTML = '<option value="">No locations available</option>';
            showAlert('No locations configured. Contact administrator.', 'warning');
            return;
        }
        
        const activeLocations = locations.filter(loc => loc.isActive);
        
        if (activeLocations.length === 0) {
            select.innerHTML = '<option value="">No active locations</option>';
            showAlert('No active locations available.', 'warning');
            return;
        }
        
        select.innerHTML = '<option value="">Select Location</option>' +
            activeLocations.map(loc => 
                `<option value="${loc.terminalId}">${loc.name}</option>`
            ).join('');
        
        // Auto-select if only one location
        if (activeLocations.length === 1) {
            select.value = activeLocations[0].terminalId;
            updateTerminalDisplay(activeLocations[0].name);
        }
        
    } catch (error) {
        console.error('Load locations error:', error);
        showAlert('Failed to load locations. Check network connection.', 'error');
    }
}

function updateTerminalDisplay(locationName) {
    document.getElementById('terminalDisplay').textContent = locationName || '-';
}

// Form handling
function setupFormHandlers() {
    const form = document.getElementById('attendanceForm');
    const locationSelect = document.getElementById('locationSelect');
    
    form.addEventListener('submit', handleAttendance);
    
    locationSelect.addEventListener('change', (e) => {
        const selectedLocation = locations.find(loc => loc.terminalId === e.target.value);
        updateTerminalDisplay(selectedLocation ? selectedLocation.name : '-');
    });
    
    // Auto-focus employee ID on load
    document.getElementById('employeeId').focus();
}

async function handleAttendance(e) {
    e.preventDefault();
    
    const employeeId = document.getElementById('employeeId').value.trim();
    const totpToken = document.getElementById('totpToken').value.trim();
    const locationId = document.getElementById('locationSelect').value;
    
    if (!employeeId || !totpToken || !locationId) {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    if (totpToken.length !== 6 || !/^\d+$/.test(totpToken)) {
        showAlert('TOTP code must be 6 digits', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                employeeId,
                totpToken,
                locationId
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Attendance marking failed');
        }
        
        // Success - show employee info and status
        showSuccessStatus(data);
        
        // Reset form after 5 seconds
        setTimeout(() => {
            resetForm();
        }, 5000);
        
    } catch (error) {
        showAlert(error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'MARK ATTENDANCE';
    }
}

function showSuccessStatus(data) {
    const statusContainer = document.getElementById('statusContainer');
    const isCheckIn = data.type === 'check-in';
    
    statusContainer.innerHTML = `
        <div class="status-card">
            <div class="status-icon">${isCheckIn ? '✅' : '👋'}</div>
            <div class="employee-info">
                <div class="employee-name">${data.employee.name}</div>
                <div class="employee-id">${data.employee.employeeId}</div>
            </div>
            <div class="status-text">${isCheckIn ? 'Checked In' : 'Checked Out'}</div>
            <div class="status-details">
                ${new Date(data.time).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true 
                })}
                <br>
                ${data.location}
                ${data.totalHours ? `<br><strong>${data.totalHours.toFixed(2)} hours worked</strong>` : ''}
            </div>
        </div>
    `;
    
    showAlert(data.message, 'success');
    
    // Hide form temporarily
    document.getElementById('attendanceForm').style.display = 'none';
}

function resetForm() {
    document.getElementById('attendanceForm').reset();
    document.getElementById('attendanceForm').style.display = 'block';
    document.getElementById('statusContainer').innerHTML = '';
    document.getElementById('submitBtn').disabled = false;
    document.getElementById('submitBtn').textContent = 'MARK ATTENDANCE';
    document.getElementById('employeeId').focus();
    
    // Re-select location if only one available
    const activeLocations = locations.filter(loc => loc.isActive);
    if (activeLocations.length === 1) {
        document.getElementById('locationSelect').value = activeLocations[0].terminalId;
        updateTerminalDisplay(activeLocations[0].name);
    }
}

function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 5000);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to reset
    if (e.key === 'Escape') {
        resetForm();
    }
    
    // Ctrl+R to reload locations
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        loadLocations();
        showAlert('Locations refreshed', 'success');
    }
});
