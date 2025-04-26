// API base URL
const API_BASE_URL = '/api/v1';

// Default headers
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

// Generic fetch wrapper
const fetchWrapper = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getHeaders(),
                ...options.headers
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

// API methods
export const api = {
    // Auth endpoints
    auth: {
        login: (credentials) => fetchWrapper('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),
        register: (userData) => fetchWrapper('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),
        getCurrentUser: () => fetchWrapper('/auth/me')
    },

    // Loan endpoints
    loans: {
        getAll: () => fetchWrapper('/loans'),
        getById: (id) => fetchWrapper(`/loans/${id}`),
        create: (loanData) => fetchWrapper('/loans', {
            method: 'POST',
            body: JSON.stringify(loanData)
        }),
        update: (id, loanData) => fetchWrapper(`/loans/${id}`, {
            method: 'PUT',
            body: JSON.stringify(loanData)
        }),
        delete: (id) => fetchWrapper(`/loans/${id}`, {
            method: 'DELETE'
        }),
        getUserLoans: () => fetchWrapper('/loans/user')
    },

    // Review endpoints
    reviews: {
        getAll: (loanId) => fetchWrapper(`/reviews${loanId ? `?loan=${loanId}` : ''}`),
        getById: (id) => fetchWrapper(`/reviews/${id}`),
        create: (reviewData) => fetchWrapper('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        }),
        update: (id, reviewData) => fetchWrapper(`/reviews/${id}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        }),
        delete: (id) => fetchWrapper(`/reviews/${id}`, {
            method: 'DELETE'
        })
    },

    // User endpoints
    users: {
        getProfile: () => fetchWrapper('/users/profile'),
        updateProfile: (userData) => fetchWrapper('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        }),
        updatePassword: (passwordData) => fetchWrapper('/users/updatepassword', {
            method: 'PUT',
            body: JSON.stringify(passwordData)
        })
    }
}; 