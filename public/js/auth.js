// Authentication API endpoints
const api = {
    auth: {
        // Register a new user
        async register(userData) {
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                return await response.json();
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        },

        // Login user
        async login(credentials) {
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });
                return await response.json();
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },

        // Get current user
        async getCurrentUser() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    return { success: false, message: 'No token found' };
                }

                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                return await response.json();
            } catch (error) {
                console.error('Get current user error:', error);
                throw error;
            }
        },

        // Logout user
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showLogoutAnimation();
            setTimeout(() => {
                window.location.href = '/signin.html';
            }, 1000);
        }
    }
};

// Check authentication status and update UI
async function checkAuth() {
    const token = localStorage.getItem('token');
    const authLinks = document.getElementById('authLinks');
    const navLoading = document.querySelector('.nav-loading');
    
    if (navLoading) {
        navLoading.style.display = 'block';
    }

    try {
        if (token) {
            // Get user data
            const userData = await api.auth.getCurrentUser();
            if (userData.success) {
                localStorage.setItem('user', JSON.stringify(userData.data));
                renderUserMenu(userData.data);
            } else {
                renderAuthLinks();
            }
        } else {
            renderAuthLinks();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        renderAuthLinks();
    } finally {
        if (navLoading) {
            navLoading.style.display = 'none';
        }
    }
}

// Render user menu for logged-in users
function renderUserMenu(user) {
    const authLinks = document.getElementById('authLinks');
    const initials = getInitials(user.name);
    
    authLinks.innerHTML = `
        <div class="user-menu">
            <button class="user-menu-trigger" id="userMenuTrigger">
                <div class="user-avatar">${initials}</div>
                <span>${user.name}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="user-menu-dropdown">
                <div class="user-menu-header">
                    <h4>${user.name}</h4>
                    <p>${user.email}</p>
                </div>
                <ul class="user-menu-items">
                    <li>
                        <a href="/dashboard.html">
                            <i class="fas fa-tachometer-alt"></i>
                            Dashboard
                        </a>
                    </li>
                    <li>
                        <a href="/profile.html">
                            <i class="fas fa-user"></i>
                            Profile
                        </a>
                    </li>
                    <li>
                        <a href="/settings.html">
                            <i class="fas fa-cog"></i>
                            Settings
                        </a>
                    </li>
                    <li class="logout">
                        <a href="#" onclick="api.auth.logout(); return false;">
                            <i class="fas fa-sign-out-alt"></i>
                            Logout
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    `;

    // Setup user menu interactions
    setupUserMenu();
}

// Render auth links for non-logged-in users
function renderAuthLinks() {
    const authLinks = document.getElementById('authLinks');
    
    authLinks.innerHTML = `
        <li>
            <a href="/signin.html" class="btn-auth">
                <i class="fas fa-sign-in-alt"></i>
                Sign In
            </a>
        </li>
        <li>
            <a href="/register.html" class="btn-auth">
                <i class="fas fa-user-plus"></i>
                Register
            </a>
        </li>
    `;
}

// Setup user menu interactions
function setupUserMenu() {
    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const userMenu = userMenuTrigger.parentElement;
    
    userMenuTrigger.addEventListener('click', () => {
        userMenu.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!userMenu.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });
}

// Setup mobile menu
function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
            }
        });
    }
}

// Show logout animation
function showLogoutAnimation() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const loadingBar = navbar.querySelector('.nav-loading');
        if (loadingBar) {
            loadingBar.style.display = 'block';
        }
    }
}

// Helper function to get user initials
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Initialize authentication and navigation
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupMobileMenu();
}); 