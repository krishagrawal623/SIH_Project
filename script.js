// Global variables
let reports = [];
let currentUser = null;
let isAuthenticated = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    checkAuthentication();
});

// Initialize app functionality
function initializeApp() {
    // Set up form event listeners
    setupFormListeners();
    
    // Set up dashboard filters
    setupDashboardFilters();
    
    // Load reports and update dashboard
    loadReports();
    updateDashboardStats();
}

// Check authentication status
async function checkAuthentication() {
    try {
        if (API.utils.isAuthenticated()) {
            currentUser = await API.utils.getCurrentUser();
            isAuthenticated = !!currentUser;
            
            if (isAuthenticated) {
                updateUIForAuthenticatedUser();
            }
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        isAuthenticated = false;
    }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
    // Add user info to header
    const header = document.querySelector('.gov-header .header-content');
    if (header && currentUser) {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <div class="user-details">
                <span class="user-name">Welcome, ${currentUser.name}</span>
                <span class="user-role">${currentUser.role.replace('_', ' ').toUpperCase()}</span>
            </div>
            <button onclick="logout()" class="logout-btn">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
        header.appendChild(userInfo);
    }
}

// Tab switching functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load dashboard data if dashboard tab is selected
    if (tabName === 'dashboard') {
        loadReports();
        updateDashboardStats();
    }
}

// Form setup and validation
function setupFormListeners() {
    const form = document.getElementById('reportForm');
    const photoInput = document.getElementById('photo');
    const getLocationBtn = document.getElementById('getLocationBtn');
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Photo preview
    photoInput.addEventListener('change', handlePhotoPreview);
    
    // Location button
    getLocationBtn.addEventListener('click', getCurrentLocation);
    
    // Drag and drop for photo upload
    const fileUploadLabel = document.querySelector('.file-upload-label');
    fileUploadLabel.addEventListener('dragover', handleDragOver);
    fileUploadLabel.addEventListener('drop', handleDrop);
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const reportData = {
        problemType: formData.get('problemType'),
        priority: formData.get('priority'),
        location: formData.get('location'),
        municipalCorp: formData.get('municipalCorp'),
        description: formData.get('description'),
        contactInfo: {
            email: formData.get('contactInfo')
        }
    };
    
    // Validate form
    if (!validateForm(reportData)) {
        return;
    }
    
    // Get photo files
    const photoFiles = Array.from(formData.getAll('photo')).filter(file => file.size > 0);
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('.gov-submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Submitting...';
        submitBtn.disabled = true;
        
        // Submit to API
        const response = await API.reports.create(reportData, photoFiles);
        
        showMessage(`Report submitted successfully! Your report ID is: ${response.data.report._id}`, 'success');
        e.target.reset();
        document.getElementById('photoPreview').innerHTML = '';
        
        // Reload reports if dashboard is visible
        if (document.getElementById('dashboard-tab').classList.contains('active')) {
            loadReports();
            updateDashboardStats();
        }
        
    } catch (error) {
        API.utils.handleError(error);
    } finally {
        // Reset button state
        const submitBtn = e.target.querySelector('.gov-submit-btn');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Validate form data
function validateForm(data) {
    const requiredFields = ['problemType', 'priority', 'location', 'municipalCorp', 'description'];
    
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showMessage(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`, 'error');
            return false;
        }
    }
    
    return true;
}

// Load reports from API
async function loadReports() {
    try {
        const response = await API.reports.getAll();
        reports = response.data.reports;
        displayReports(reports);
    } catch (error) {
        console.error('Failed to load reports:', error);
        showMessage('Failed to load reports. Please try again.', 'error');
    }
}

// Photo preview functionality
function handlePhotoPreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('photoPreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Photo preview">`;
        };
        reader.readAsDataURL(file);
    }
}

// Convert file to base64
function convertToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Location services
function getCurrentLocation() {
    const locationInput = document.getElementById('location');
    const locationBtn = document.getElementById('getLocationBtn');
    
    if (!navigator.geolocation) {
        showMessage('Geolocation is not supported by this browser.', 'error');
        return;
    }
    
    locationBtn.innerHTML = '<div class="loading"></div> Getting location...';
    locationBtn.disabled = true;
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            // Reverse geocoding (simplified - in real app, use Google Maps API)
            locationInput.value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
            
            locationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Use Current Location';
            locationBtn.disabled = false;
            
            showMessage('Location captured successfully!', 'success');
        },
        function(error) {
            let errorMessage = 'Unable to retrieve your location. ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Please allow location access.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out.';
                    break;
                default:
                    errorMessage += 'An unknown error occurred.';
                    break;
            }
            
            showMessage(errorMessage, 'error');
            locationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Use Current Location';
            locationBtn.disabled = false;
        }
    );
}

// Drag and drop functionality
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.background = '#e3f2fd';
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.style.background = '#f8f9fa';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const photoInput = document.getElementById('photo');
        photoInput.files = files;
        handlePhotoPreview({ target: { files: files } });
    }
}

// Dashboard functionality
function setupDashboardFilters() {
    const corpFilter = document.getElementById('corpFilter');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    
    [corpFilter, statusFilter, priorityFilter].forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
}

async function applyFilters() {
    const corpFilter = document.getElementById('corpFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    
    const params = {};
    if (corpFilter) params.municipalCorp = corpFilter;
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    
    try {
        const response = await API.reports.getAll(params);
        reports = response.data.reports;
        displayReports(reports);
    } catch (error) {
        API.utils.handleError(error);
    }
}

function displayReports(reportsToShow) {
    const reportsList = document.getElementById('reportsList');
    
    if (reportsToShow.length === 0) {
        reportsList.innerHTML = '<div class="message info">No reports found matching the current filters.</div>';
        return;
    }
    
    // Sort by priority and timestamp
    reportsToShow.sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    reportsList.innerHTML = reportsToShow.map(report => createReportCard(report)).join('');
}

function createReportCard(report) {
    const statusClass = `status-${report.status.replace('-', '-')}`;
    const priorityClass = `priority-${report.priority}`;
    const date = new Date(report.timestamp).toLocaleDateString();
    const time = new Date(report.timestamp).toLocaleTimeString();
    
    return `
        <div class="report-card">
            <div class="report-header">
                <div class="report-id">Report #${report.id}</div>
                <div>
                    <span class="report-status ${statusClass}">${report.status.replace('-', ' ')}</span>
                    <span class="report-priority ${priorityClass}">${report.priority}</span>
                </div>
            </div>
            
            <div class="report-details">
                <div>
                    <p><strong>Problem:</strong> ${report.problemType.replace('-', ' ').toUpperCase()}</p>
                    <p><strong>Location:</strong> ${report.location}</p>
                    <p><strong>Municipal Corp:</strong> ${report.municipalCorp}</p>
                    <p><strong>Submitted:</strong> ${date} at ${time}</p>
                    ${report.contactInfo ? `<p><strong>Contact:</strong> ${report.contactInfo}</p>` : ''}
                </div>
                <div>
                    ${report.photoBase64 ? `<img src="${report.photoBase64}" alt="Problem photo" class="report-photo">` : ''}
                </div>
            </div>
            
            <p><strong>Description:</strong> ${report.description}</p>
            
            ${report.resolution ? `<p><strong>Resolution:</strong> ${report.resolution}</p>` : ''}
            
            <div class="report-actions">
                ${report.status === 'pending' ? `
                    <button class="action-btn btn-update" onclick="updateReportStatus(${report.id}, 'in-progress')">
                        <i class="fas fa-play"></i> Start Work
                    </button>
                ` : ''}
                
                ${report.status === 'in-progress' ? `
                    <button class="action-btn btn-resolve" onclick="resolveReport(${report.id})">
                        <i class="fas fa-check"></i> Mark Resolved
                    </button>
                ` : ''}
                
                <button class="action-btn" onclick="viewReportDetails(${report.id})" style="background: #6c757d; color: white;">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `;
}

async function updateDashboardStats() {
    try {
        const response = await API.reports.getStatistics();
        const stats = response.data;
        
        document.getElementById('totalReports').textContent = stats.total || 0;
        document.getElementById('pendingReports').textContent = stats.pending || 0;
        document.getElementById('inProgressReports').textContent = stats.inProgress || 0;
        document.getElementById('resolvedReports').textContent = stats.resolved || 0;
    } catch (error) {
        console.error('Failed to load statistics:', error);
        // Set default values
        document.getElementById('totalReports').textContent = '0';
        document.getElementById('pendingReports').textContent = '0';
        document.getElementById('inProgressReports').textContent = '0';
        document.getElementById('resolvedReports').textContent = '0';
    }
}

// Report management functions
async function updateReportStatus(reportId, newStatus) {
    try {
        await API.reports.update(reportId, { status: newStatus });
        showMessage(`Report #${reportId} status updated to ${newStatus.replace('-', ' ')}`, 'success');
        loadReports();
        updateDashboardStats();
    } catch (error) {
        API.utils.handleError(error);
    }
}

async function resolveReport(reportId) {
    const resolution = prompt('Please enter resolution details:');
    if (resolution) {
        try {
            await API.reports.resolve(reportId, {
                description: resolution,
                actionTaken: 'Issue resolved as per municipal standards'
            });
            showMessage(`Report #${reportId} has been resolved!`, 'success');
            loadReports();
            updateDashboardStats();
        } catch (error) {
            API.utils.handleError(error);
        }
    }
}

function viewReportDetails(reportId) {
    const report = reports.find(r => r.id === reportId);
    if (report) {
        const details = `
            Report ID: ${report.id}
            Problem Type: ${report.problemType.replace('-', ' ').toUpperCase()}
            Priority: ${report.priority.toUpperCase()}
            Location: ${report.location}
            Municipal Corporation: ${report.municipalCorp}
            Description: ${report.description}
            Status: ${report.status.replace('-', ' ').toUpperCase()}
            Submitted: ${new Date(report.timestamp).toLocaleString()}
            ${report.contactInfo ? `Contact: ${report.contactInfo}` : ''}
            ${report.assignedTo ? `Assigned To: ${report.assignedTo}` : ''}
            ${report.resolution ? `Resolution: ${report.resolution}` : ''}
            ${report.resolvedAt ? `Resolved At: ${new Date(report.resolvedAt).toLocaleString()}` : ''}
        `;
        
        alert(details);
    }
}

// Track report functionality
async function trackReport() {
    const trackingId = document.getElementById('trackingId').value.trim();
    const trackingResult = document.getElementById('trackingResult');
    
    if (!trackingId) {
        showMessage('Please enter a report ID to track.', 'error');
        return;
    }
    
    try {
        const response = await API.reports.getById(trackingId);
        const report = response.data.report;
        
        const statusIcon = {
            'pending': 'fas fa-clock',
            'in-progress': 'fas fa-tools',
            'resolved': 'fas fa-check-circle'
        };
        
        const statusColor = {
            'pending': '#f39c12',
            'in-progress': '#3498db',
            'resolved': '#27ae60'
        };
        
        trackingResult.innerHTML = `
            <h3>Report #${report._id} Status</h3>
            <div style="display: flex; align-items: center; gap: 1rem; margin: 1rem 0;">
                <i class="${statusIcon[report.status]}" style="font-size: 2rem; color: ${statusColor[report.status]};"></i>
                <div>
                    <h4 style="color: ${statusColor[report.status]}; margin: 0;">${report.status.replace('-', ' ').toUpperCase()}</h4>
                    <p style="margin: 0; color: #666;">${getStatusMessage(report.status)}</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
                <div>
                    <strong>Problem:</strong> ${report.problemType.replace('-', ' ').toUpperCase()}<br>
                    <strong>Priority:</strong> ${report.priority.toUpperCase()}<br>
                    <strong>Location:</strong> ${report.location}<br>
                    <strong>Municipal Corp:</strong> ${report.municipalCorp}
                </div>
                <div>
                    <strong>Submitted:</strong> ${API.utils.formatDate(report.submittedAt)}<br>
                    ${report.assignedTo ? `<strong>Assigned To:</strong> ${report.assignedTo.name}<br>` : ''}
                    ${report.resolvedAt ? `<strong>Resolved:</strong> ${API.utils.formatDate(report.resolvedAt)}<br>` : ''}
                </div>
            </div>
            
            <div style="margin: 1rem 0;">
                <strong>Description:</strong><br>
                ${report.description}
            </div>
            
            ${report.resolution ? `
                <div style="margin: 1rem 0;">
                    <strong>Resolution:</strong><br>
                    ${report.resolution.description}
                </div>
            ` : ''}
            
            ${report.photos && report.photos.length > 0 ? `
                <div style="text-align: center; margin: 1rem 0;">
                    ${report.photos.map(photo => `
                        <img src="/uploads/processed/${photo.filename}" alt="Problem photo" style="max-width: 300px; max-height: 300px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin: 0.5rem;">
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        trackingResult.style.display = 'block';
        
    } catch (error) {
        trackingResult.innerHTML = '<div class="message error">Report not found. Please check your report ID.</div>';
        trackingResult.style.display = 'block';
    }
}

function getStatusMessage(status) {
    const messages = {
        'pending': 'Your report has been received and is waiting to be assigned.',
        'in-progress': 'Work has started on your report. Municipal workers are addressing the issue.',
        'resolved': 'The issue has been resolved! Thank you for your report.'
    };
    return messages[status] || 'Status unknown.';
}

// Utility functions
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert message at the top of the main content
    const mainContent = document.querySelector('.main-content .container');
    mainContent.insertBefore(messageDiv, mainContent.firstChild);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Logout function
async function logout() {
    try {
        await API.auth.logout();
        currentUser = null;
        isAuthenticated = false;
        
        // Remove user info from header
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.remove();
        }
        
        showMessage('Logged out successfully', 'success');
    } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        currentUser = null;
        isAuthenticated = false;
        API.instance.removeToken();
    }
}