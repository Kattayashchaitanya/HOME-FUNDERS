// AI-based loan processing time estimation
const estimateLoanProcessingTime = async (loanData) => {
    try {
        const response = await fetch('/api/loans/estimate-time', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(loanData)
        });

        const data = await response.json();

        if (data.success) {
            return data.estimatedDays;
        } else {
            throw new Error(data.error);
        }
    } catch (err) {
        console.error('Error estimating loan processing time:', err);
        return 7; // Default to 7 days if estimation fails
    }
};

// Update loan processing time estimation in the UI
const updateLoanProcessingTime = async (loanId) => {
    try {
        const response = await fetch(`/api/loans/${loanId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const loan = data.data;
            const estimatedDays = await estimateLoanProcessingTime(loan);
            
            // Update the UI with the estimated processing time
            const processingTimeElement = document.querySelector(`[data-loan-id="${loanId}"] .processing-time`);
            if (processingTimeElement) {
                processingTimeElement.textContent = `Estimated Processing: ${estimatedDays} days`;
            }
        }
    } catch (err) {
        console.error('Error updating loan processing time:', err);
    }
};

// Add loan processing time estimation to the loan application form
const addLoanProcessingTimeEstimation = async () => {
    const loanForm = document.getElementById('loanForm');
    if (loanForm) {
        const formData = new FormData(loanForm);
        const loanData = {
            type: formData.get('loanType'),
            amount: formData.get('loanAmount'),
            purpose: formData.get('loanPurpose'),
            location: formData.get('location'),
            income: formData.get('monthlyIncome')
        };

        const estimatedDays = await estimateLoanProcessingTime(loanData);
        
        // Add the estimated processing time to the form
        const processingTimeElement = document.createElement('div');
        processingTimeElement.className = 'mt-4 p-4 bg-blue-50 rounded';
        processingTimeElement.innerHTML = `
            <p class="text-blue-800 font-semibold">Estimated Processing Time: ${estimatedDays} days</p>
            <p class="text-sm text-gray-600">Based on your application details and our AI analysis</p>
        `;
        
        loanForm.appendChild(processingTimeElement);
    }
};

// Initialize loan AI features
document.addEventListener('DOMContentLoaded', () => {
    // Add loan processing time estimation to the loan application form
    const loanForm = document.getElementById('loanForm');
    if (loanForm) {
        loanForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await addLoanProcessingTimeEstimation();
        });
    }
    
    // Update loan processing time for existing loans
    const loanCards = document.querySelectorAll('.loan-card');
    loanCards.forEach(card => {
        const loanId = card.dataset.loanId;
        if (loanId) {
            updateLoanProcessingTime(loanId);
        }
    });
}); 