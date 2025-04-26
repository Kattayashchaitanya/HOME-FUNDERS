// Dashboard API endpoints
const api = {
    dashboard: {
        // Get dashboard statistics
        async getStats() {
            try {
                const response = await fetch('/api/dashboard/stats', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                return await response.json();
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
                throw error;
            }
        },

        // Get user profile
        async getProfile() {
            try {
                const response = await fetch('/api/dashboard/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                return await response.json();
            } catch (error) {
                console.error('Error fetching profile:', error);
                throw error;
            }
        },

        // Update user profile
        async updateProfile(profileData) {
            try {
                const response = await fetch('/api/dashboard/profile', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(profileData)
                });
                return await response.json();
            } catch (error) {
                console.error('Error updating profile:', error);
                throw error;
            }
        }
    }
};

// Check authentication
const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/signin.html';
    }
};

// Initialize dashboard
const initDashboard = async () => {
    try {
        // Show loading state
        showLoadingState();

        // Load dashboard statistics
        const statsResult = await api.dashboard.getStats();
        if (statsResult.success) {
            renderStats(statsResult.data);
        }

        // Load user profile
        const userResult = await api.dashboard.getProfile();
        if (userResult.success) {
            const user = userResult.data;
            renderProfile(user);
            
            // Load user's loans
            await getUserLoans();
            // Load user's reviews
            await getUserReviews();
        }

        // Hide loading state
        hideLoadingState();
    } catch (error) {
        showAlert('Error loading dashboard data', 'error');
        hideLoadingState();
    }
};

// Render dashboard statistics
const renderStats = (stats) => {
    const statsContainer = document.getElementById('dashboardStats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card" data-aos="fade-up" data-aos-delay="100">
                <div class="stat-icon">
                    <i class="fas fa-hand-holding-usd"></i>
                </div>
                <div class="stat-content">
                    <h3>Active Loans</h3>
                    <p class="stat-value">${stats.activeLoans || 0}</p>
                    <p class="stat-change ${stats.loansChange >= 0 ? 'positive' : 'negative'}">
                        <i class="fas fa-${stats.loansChange >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                        ${Math.abs(stats.loansChange)}%
                    </p>
                </div>
            </div>
            <div class="stat-card" data-aos="fade-up" data-aos-delay="200">
                <div class="stat-icon">
                    <i class="fas fa-star"></i>
                </div>
                <div class="stat-content">
                    <h3>Average Rating</h3>
                    <p class="stat-value">${stats.averageRating || 0}</p>
                    <div class="rating-stars">
                        ${Array(5).fill().map((_, i) => `
                            <i class="fas fa-star ${i < Math.floor(stats.averageRating) ? 'active' : ''}"></i>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="stat-card" data-aos="fade-up" data-aos-delay="300">
                <div class="stat-icon">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-content">
                    <h3>Processing Time</h3>
                    <p class="stat-value">${stats.avgProcessingTime || 0} days</p>
                    <p class="stat-info">Average loan approval time</p>
                </div>
            </div>
        </div>
    `;
};

// Render user profile
const renderProfile = (user) => {
    const profileInfo = document.getElementById('profileInfo');
    if (!profileInfo) return;

    profileInfo.innerHTML = `
        <div class="profile-card" data-aos="fade-up">
            <div class="profile-header">
                <div class="profile-avatar">
                    ${getInitials(user.name)}
                </div>
                <div class="profile-info">
                    <h3>${user.name}</h3>
                    <p class="email">${user.email}</p>
                    <span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">
                        ${user.role || 'User'}
                    </span>
                </div>
            </div>
            <div class="profile-details">
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <div>
                        <label>Member Since</label>
                        <p>${new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <div>
                        <label>Phone</label>
                        <p>${user.phone || 'Not provided'}</p>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <label>Location</label>
                        <p>${user.location || 'Not provided'}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
};

// Get user loans
const getUserLoans = async () => {
    try {
        const result = await window.api.loans.getUserLoans();
        if (result.success) {
            renderLoans(result.data);
        }
    } catch (error) {
        showAlert('Error loading loans', 'error');
    }
};

// Enhanced loan rendering
const renderLoans = (loans) => {
    const myLoans = document.getElementById('myLoans');
    if (!myLoans) return;
    
    if (loans.length === 0) {
        myLoans.innerHTML = `
            <div class="empty-state" data-aos="fade-up">
                <i class="fas fa-file-invoice"></i>
                <h3>No Loan Applications</h3>
                <p>You haven't applied for any loans yet</p>
                <button class="btn btn-primary" onclick="window.location.href='/loans.html'">
                    Apply for a Loan
                </button>
            </div>
        `;
        return;
    }

    myLoans.innerHTML = `
        <div class="loans-grid">
            ${loans.map(loan => `
                <div class="loan-card" data-aos="fade-up" data-loan-id="${loan._id}">
                    <div class="loan-header">
                        <h3>${loan.loanType === 'rural' ? 'Rural' : 'Urban'} Homestay Loan</h3>
                        <span class="status-badge ${getStatusClass(loan.status)}">
                            ${loan.status}
                        </span>
                    </div>
                    <div class="loan-details">
                        <div class="detail-row">
                            <i class="fas fa-rupee-sign"></i>
                            <span>Amount: ₹${loan.loanAmount.toLocaleString()}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>Location: ${loan.location}</span>
                        </div>
                        <div class="detail-row">
                            <i class="fas fa-calendar"></i>
                            <span>Applied: ${new Date(loan.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div class="loan-actions">
                        <button class="btn btn-secondary" onclick="showLoanDetails('${loan._id}')">
                            View Details
                        </button>
                        ${loan.status === 'approved' ? `
                            <button class="btn btn-primary" onclick="acceptLoan('${loan._id}')">
                                Accept Loan
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

// Enhanced loan details modal
const showLoanDetails = async (loanId) => {
    try {
        const result = await window.api.loans.getLoanDetails(loanId);
        if (result.success) {
            const loan = result.data;
            const content = document.getElementById('loanDetailsContent');
            
            content.innerHTML = `
                <div class="loan-details-modal">
                    <div class="loan-header">
                        <h2>${loan.loanType === 'rural' ? 'Rural' : 'Urban'} Homestay Loan</h2>
                        <span class="status-badge ${getStatusClass(loan.status)}">
                            ${loan.status}
                        </span>
                    </div>
                    
                    <div class="details-grid">
                        <div class="detail-section">
                            <h3>Loan Information</h3>
                            <div class="detail-item">
                                <i class="fas fa-rupee-sign"></i>
                                <div>
                                    <label>Amount</label>
                                    <p>₹${loan.loanAmount.toLocaleString()}</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-bullseye"></i>
                                <div>
                                    <label>Purpose</label>
                                    <p>${loan.loanPurpose}</p>
                                </div>
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <div>
                                    <label>Location</label>
                                    <p>${loan.location}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h3>Application Timeline</h3>
                            <div class="timeline">
                                <div class="timeline-item ${loan.status === 'approved' ? 'completed' : ''}">
                                    <div class="timeline-marker"></div>
                                    <div class="timeline-content">
                                        <h4>Application Submitted</h4>
                                        <p>${new Date(loan.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                ${loan.processedAt ? `
                                    <div class="timeline-item ${loan.status === 'approved' ? 'completed' : ''}">
                                        <div class="timeline-marker"></div>
                                        <div class="timeline-content">
                                            <h4>Application Processed</h4>
                                            <p>${new Date(loan.processedAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        ${loan.emiDetails ? `
                            <div class="detail-section">
                                <h3>EMI Details</h3>
                                <div class="emi-grid">
                                    <div class="emi-item">
                                        <label>Monthly EMI</label>
                                        <p>₹${loan.emiDetails.monthlyEMI.toLocaleString()}</p>
                                    </div>
                                    <div class="emi-item">
                                        <label>Total Interest</label>
                                        <p>₹${loan.emiDetails.totalInterest.toLocaleString()}</p>
                                    </div>
                                    <div class="emi-item">
                                        <label>Total Amount</label>
                                        <p>₹${loan.emiDetails.totalAmount.toLocaleString()}</p>
                                    </div>
                                    <div class="emi-item">
                                        <label>Tenure</label>
                                        <p>${loan.emiDetails.tenure} months</p>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${loan.remarks ? `
                            <div class="detail-section">
                                <h3>Remarks</h3>
                                <div class="remarks">
                                    <p>${loan.remarks}</p>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="modal-actions">
                        ${loan.status === 'approved' ? `
                            <button class="btn btn-primary" onclick="acceptLoan('${loan._id}')">
                                Accept Loan
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary" onclick="closeModal('loanDetailsModal')">
                            Close
                        </button>
                    </div>
                </div>
            `;
            
            showModal('loanDetailsModal');
        }
    } catch (error) {
        showAlert('Error loading loan details', 'error');
    }
};

// Get user's reviews
const getUserReviews = async () => {
    try {
        const result = await window.api.reviews.getUserReviews();
        if (result.success) {
            renderReviews(result.data);
        }
    } catch (error) {
        showAlert('Error loading reviews', 'error');
    }
};

// Enhanced reviews rendering
const renderReviews = (reviews) => {
    const myReviews = document.getElementById('myReviews');
    if (!myReviews) return;
    
    if (reviews.length === 0) {
        myReviews.innerHTML = `
            <div class="empty-state" data-aos="fade-up">
                <i class="fas fa-star"></i>
                <h3>No Reviews Yet</h3>
                <p>You haven't written any reviews yet</p>
                <button class="btn btn-primary" onclick="showReviewModal()">
                    Write a Review
                </button>
            </div>
        `;
        return;
    }

    myReviews.innerHTML = `
        <div class="reviews-grid">
            ${reviews.map(review => `
                <div class="review-card" data-aos="fade-up">
                    <div class="review-header">
                        <h3>${review.title}</h3>
                        <div class="rating">
                            ${Array(5).fill().map((_, i) => `
                                <i class="fas fa-star ${i < review.rating ? 'active' : ''}"></i>
                            `).join('')}
                        </div>
                    </div>
                    <div class="review-content">
                        <p>${review.text}</p>
                    </div>
                    <div class="review-footer">
                        <span class="date">
                            <i class="fas fa-calendar"></i>
                            ${new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <div class="review-actions">
                            <button class="btn btn-icon" onclick="editReview('${review._id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-icon" onclick="deleteReview('${review._id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

// Modal management
const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
};

const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
};

// Loading state management
const showLoadingState = () => {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading dashboard...</p>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
};

const hideLoadingState = () => {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
};

// Alert management
const showAlert = (message, type = 'error') => {
    const alertContainer = document.createElement('div');
    alertContainer.className = `alert alert-${type}`;
    alertContainer.innerHTML = `
        <div class="alert-content">
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <p>${message}</p>
        </div>
        <button class="alert-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    document.body.appendChild(alertContainer);
    setTimeout(() => alertContainer.remove(), 5000);
};

// Helper functions
const getInitials = (name) => {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'status-pending';
        case 'approved':
            return 'status-approved';
        case 'rejected':
            return 'status-rejected';
        case 'processing':
            return 'status-processing';
        default:
            return 'status-default';
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initDashboard();
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Close modals with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.show');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
});

// Dashboard functionality and animations
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard
    initDashboard();
    
    // Add event listeners
    setupEventListeners();
});

// Initialize dashboard components
function initDashboard() {
    // Load user data
    loadUserData();
    
    // Load loans data
    loadLoansData();
    
    // Load reviews data
    loadReviewsData();
    
    // Initialize animations
    initAnimations();
}

// Setup event listeners
function setupEventListeners() {
    // Profile edit form submission
    document.getElementById('editProfileForm')?.addEventListener('submit', handleProfileEdit);
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal.id);
        });
    });
}

// Load and display user data
async function loadUserData() {
    try {
        const response = await fetch('/api/user/profile');
        const userData = await response.json();
        
        // Update profile section
        updateProfileSection(userData);
    } catch (error) {
        showAlert('Error loading profile data', 'error');
    }
}

// Update profile section with user data
function updateProfileSection(userData) {
    const avatar = document.getElementById('userAvatar');
    const name = document.getElementById('userName');
    const email = document.getElementById('userEmail');
    
    // Set user initials in avatar
    const initials = userData.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase();
    avatar.textContent = initials;
    
    // Set user name and email
    name.textContent = userData.name;
    email.textContent = userData.email;
    
    // Add animation
    avatar.style.animation = 'pulse 1s ease-out';
    setTimeout(() => {
        avatar.style.animation = '';
    }, 1000);
}

// Load and display loans data
async function loadLoansData() {
    try {
        const response = await fetch('/api/user/loans');
        const loansData = await response.json();
        
        // Update loans section
        updateLoansSection(loansData);
        
        // Update stats
        updateStats(loansData);
    } catch (error) {
        showAlert('Error loading loans data', 'error');
    }
}

// Update loans section with loan data
function updateLoansSection(loansData) {
    const container = document.getElementById('loansContainer');
    container.innerHTML = '';
    
    loansData.forEach((loan, index) => {
        const loanCard = createLoanCard(loan);
        // Add staggered animation
        loanCard.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(loanCard);
    });
}

// Create loan card element
function createLoanCard(loan) {
    const card = document.createElement('div');
    card.className = 'loan-card';
    card.innerHTML = `
        <div class="loan-status status-${loan.status.toLowerCase()}">
            ${loan.status}
        </div>
        <div class="loan-details">
            <div class="loan-detail-item">
                <i class="fas fa-dollar-sign"></i>
                <span>Amount: $${loan.amount.toLocaleString()}</span>
            </div>
            <div class="loan-detail-item">
                <i class="fas fa-calendar"></i>
                <span>Date: ${new Date(loan.date).toLocaleDateString()}</span>
            </div>
            <div class="loan-detail-item">
                <i class="fas fa-percentage"></i>
                <span>Interest Rate: ${loan.interestRate}%</span>
            </div>
        </div>
    `;
    
    return card;
}

// Load and display reviews data
async function loadReviewsData() {
    try {
        const response = await fetch('/api/user/reviews');
        const reviewsData = await response.json();
        
        // Update reviews section
        updateReviewsSection(reviewsData);
    } catch (error) {
        showAlert('Error loading reviews data', 'error');
    }
}

// Update reviews section with review data
function updateReviewsSection(reviewsData) {
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = '';
    
    reviewsData.forEach((review, index) => {
        const reviewCard = createReviewCard(review);
        // Add staggered animation
        reviewCard.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(reviewCard);
    });
}

// Create review card element
function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.innerHTML = `
        <div class="review-header">
            <div class="review-rating">
                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
            </div>
            <div class="review-date">
                ${new Date(review.date).toLocaleDateString()}
            </div>
        </div>
        <div class="review-content">
            ${review.content}
        </div>
    `;
    
    return card;
}

// Update dashboard stats
function updateStats(loansData) {
    const totalLoans = document.getElementById('totalLoans');
    const activeLoans = document.getElementById('activeLoans');
    const avgRating = document.getElementById('avgRating');
    
    // Calculate stats
    const total = loansData.length;
    const active = loansData.filter(loan => loan.status === 'ACTIVE').length;
    const avg = loansData.reduce((sum, loan) => sum + loan.rating, 0) / total || 0;
    
    // Animate number updates
    animateNumber(totalLoans, 0, total);
    animateNumber(activeLoans, 0, active);
    animateNumber(avgRating, 0, avg, 1);
}

// Animate number updates
function animateNumber(element, start, end, decimals = 0) {
    const duration = 1000; // 1 second
    const steps = 60;
    const stepValue = (end - start) / steps;
    const stepTime = duration / steps;
    
    let current = start;
    const timer = setInterval(() => {
        current += stepValue;
        if (current >= end) {
            clearInterval(timer);
            current = end;
        }
        element.textContent = current.toFixed(decimals);
    }, stepTime);
}

// Initialize animations
function initAnimations() {
    // Add fade-in animation to all cards
    const cards = document.querySelectorAll('.stat-card, .loan-card, .review-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease-out';
        
        // Trigger animation when element is in viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(card);
    });
}

// Show edit profile modal
function showEditProfileModal() {
    const modal = document.getElementById('editProfileModal');
    modal.style.display = 'block';
    
    // Populate form with current data
    document.getElementById('editName').value = document.getElementById('userName').textContent;
    document.getElementById('editEmail').value = document.getElementById('userEmail').textContent;
}

// Handle profile edit form submission
async function handleProfileEdit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('editName').value,
        email: document.getElementById('editEmail').value
    };
    
    try {
        const response = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            // Update profile display
            updateProfileSection(formData);
            // Close modal
            closeModal('editProfileModal');
            // Show success message
            showAlert('Profile updated successfully', 'success');
        } else {
            throw new Error('Failed to update profile');
        }
    } catch (error) {
        showAlert('Error updating profile', 'error');
    }
}

// Navigation functionality
function toggleNav() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Logout functionality
async function logout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Clear any stored tokens or user data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login page
            window.location.href = '/signin.html';
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        showAlert('Error logging out', 'error');
    }
}

// Close mobile navigation when clicking outside
document.addEventListener('click', (event) => {
    const navLinks = document.querySelector('.nav-links');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (navLinks.classList.contains('active') && 
        !navLinks.contains(event.target) && 
        !navToggle.contains(event.target)) {
        navLinks.classList.remove('active');
    }
});