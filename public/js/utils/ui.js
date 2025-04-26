// Alert handling
export const showAlert = (message, type = 'success') => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50`;
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2">
                ${type === 'success' 
                    ? '<i class="fas fa-check-circle text-green-500"></i>'
                    : '<i class="fas fa-exclamation-circle text-red-500"></i>'}
            </span>
            <span class="text-gray-800">${message}</span>
        </div>
    `;

    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
};

// Modal handling
export const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
};

export const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
};

// Loading spinner
export const showLoading = (containerId) => {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="flex justify-center items-center p-8">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        `;
    }
};

// Format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Validate form
export const validateForm = (formData, rules) => {
    const errors = {};
    
    for (const [field, value] of formData.entries()) {
        const fieldRules = rules[field];
        if (!fieldRules) continue;

        if (fieldRules.required && !value) {
            errors[field] = `${field} is required`;
        }

        if (fieldRules.min && value < fieldRules.min) {
            errors[field] = `${field} must be at least ${fieldRules.min}`;
        }

        if (fieldRules.max && value > fieldRules.max) {
            errors[field] = `${field} must be less than ${fieldRules.max}`;
        }

        if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
            errors[field] = `${field} is invalid`;
        }
    }

    return Object.keys(errors).length === 0 ? null : errors;
}; 