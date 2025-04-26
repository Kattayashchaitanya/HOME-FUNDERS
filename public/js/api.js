// API base URL
const API_URL = '/api';

// Authentication functions
const auth = {
  // Register a new user
  register: async (userData) => {
    try {
      console.log('Sending registration request:', { ...userData, password: '[REDACTED]' });
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        return { 
          success: false, 
          message: data.message || `Registration failed with status ${response.status}` 
        };
      }
      
      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        return { success: true, data };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: 'Server error. Please check your connection and try again.' 
      };
    }
  },
  
  // Login user
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/users/updatedetails`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  }
};

// Property functions
const properties = {
  // Get all properties with optional filters
  getAll: async (filters = {}) => {
    try {
      let url = `${API_URL}/properties`;
      
      // Add query parameters if filters are provided
      if (Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams();
        
        for (const [key, value] of Object.entries(filters)) {
          if (value) {
            queryParams.append(key, value);
          }
        }
        
        url += `?${queryParams.toString()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data, count: data.count };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Get a single property by ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_URL}/properties/${id}`);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Create a new property
  create: async (propertyData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Update a property
  update: async (id, propertyData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Delete a property
  delete: async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  }
};

// User functions
const users = {
  // Get user profile
  getProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Get user properties
  getProperties: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/users/properties`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data, count: data.count };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  }
};

// Loan functions
const loans = {
  // Get all loans (admin only)
  getAll: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/loans`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data, count: data.count };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Get a single loan by ID
  getById: async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/loans/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Create a new loan application
  applyForLoan: async (loanData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/loans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(loanData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Update a loan application
  update: async (id, loanData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/loans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(loanData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Delete a loan application
  delete: async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/loans/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Get current user's loans
  getUserLoans: async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/loans/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data, count: data.count };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },
  
  // Get loan details
  getLoanDetails: async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'Not authenticated' };
      }
      
      const response = await fetch(`${API_URL}/loans/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Server error' };
    }
  },

  // Calculate EMI
  calculateEMI: (principal, rate, tenure) => {
    // Convert annual rate to monthly and percentage to decimal
    const monthlyRate = (rate / 12) / 100;
    
    // Calculate EMI using the formula
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
    
    // Calculate total payment and interest
    const totalPayment = emi * tenure;
    const totalInterest = totalPayment - principal;
    
    // Calculate monthly interest and principal components
    const monthlyBreakdown = [];
    let remainingPrincipal = principal;
    
    for (let i = 1; i <= tenure; i++) {
      const monthlyInterest = remainingPrincipal * monthlyRate;
      const monthlyPrincipal = emi - monthlyInterest;
      remainingPrincipal -= monthlyPrincipal;
      
      monthlyBreakdown.push({
        month: i,
        principal: monthlyPrincipal,
        interest: monthlyInterest,
        total: emi,
        remaining: remainingPrincipal
      });
    }
    
    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      monthlyBreakdown
    };
  },

  // Calculate eligibility
  calculateEligibility: (monthlyIncome, monthlyExpenses, existingEMIs) => {
    // Calculate disposable income
    const disposableIncome = monthlyIncome - monthlyExpenses - existingEMIs;
    
    // Maximum EMI should not exceed 50% of disposable income
    const maxEMI = disposableIncome * 0.5;
    
    // Calculate maximum loan amount based on EMI
    // Assuming 10% interest rate and 20 years tenure
    const maxLoanAmount = maxEMI * ((Math.pow(1.0083, 240) - 1) / (0.0083 * Math.pow(1.0083, 240)));
    
    return {
      disposableIncome: Math.round(disposableIncome),
      maxEMI: Math.round(maxEMI),
      maxLoanAmount: Math.round(maxLoanAmount)
    };
  }
};

// Review functions
const reviews = {
  getAll: async (filters = {}) => {
    try {
      let url = '/api/v1/reviews';
      if (Object.keys(filters).length > 0) {
        const queryParams = new URLSearchParams(filters);
        url += `?${queryParams.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await fetch(`/api/v1/reviews/${id}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      throw error;
    }
  },

  create: async (loanId, reviewData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/v1/loans/${loanId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, reviewData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/v1/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/v1/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      throw error;
    }
  },

  getUserReviews: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`/api/v1/reviews?user=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      throw error;
    }
  },

  getLoanReviews: async (loanId) => {
    try {
      const response = await fetch(`/api/v1/reviews?loan=${loanId}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data;
    } catch (error) {
      throw error;
    }
  }
};

// Export API functions
window.api = {
  auth,
  properties,
  users,
  loans
};

window.api.admin = {
    // Get all loans
    getAllLoans: async () => {
        try {
            const response = await fetch('/api/admin/loans', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching loans:', error);
            return { success: false, message: 'Error fetching loans' };
        }
    },

    // Approve loan
    approveLoan: async (loanId) => {
        try {
            const response = await fetch(`/api/admin/loans/${loanId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error approving loan:', error);
            return { success: false, message: 'Error approving loan' };
        }
    },

    // Reject loan
    rejectLoan: async (loanId, reason) => {
        try {
            const response = await fetch(`/api/admin/loans/${loanId}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reason })
            });
            return await response.json();
        } catch (error) {
            console.error('Error rejecting loan:', error);
            return { success: false, message: 'Error rejecting loan' };
        }
    },

    // Get all users
    getAllUsers: async () => {
        try {
            const response = await fetch('/api/admin/users', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching users:', error);
            return { success: false, message: 'Error fetching users' };
        }
    },

    // Get user by ID
    getUserById: async (userId) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error fetching user:', error);
            return { success: false, message: 'Error fetching user' };
        }
    },

    // Update user
    updateUser: async (userId, userData) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, message: 'Error updating user' };
        }
    },

    // Delete user
    deleteUser: async (userId) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting user:', error);
            return { success: false, message: 'Error deleting user' };
        }
    }
}; 