class LoanForm {
    constructor() {
        this.form = document.getElementById('loanForm');
        this.emiDetails = document.getElementById('emiDetails');
        this.initializeForm();
    }

    initializeForm() {
        // Add event listeners
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.form.querySelector('#loanAmount').addEventListener('input', this.calculateEMI.bind(this));
        this.form.querySelector('#loanType').addEventListener('change', this.updatePurposeOptions.bind(this));
    }

    calculateEMI() {
        const amount = parseFloat(this.form.querySelector('#loanAmount').value) || 0;
        const rate = 10; // 10% annual interest rate
        const time = 5; // 5 years tenure
        const monthlyRate = rate / (12 * 100);
        const numberOfPayments = time * 12;
        
        const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        const totalAmount = emi * numberOfPayments;
        const totalInterest = totalAmount - amount;
        
        this.emiDetails.innerHTML = `
            <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-800 mb-2">Estimated EMI Details</h4>
                <p class="text-gray-600">Monthly EMI: ₹${Math.round(emi).toLocaleString()}</p>
                <p class="text-gray-600">Total Interest: ₹${Math.round(totalInterest).toLocaleString()}</p>
                <p class="text-gray-600">Total Amount: ₹${Math.round(totalAmount).toLocaleString()}</p>
                <p class="text-gray-600">Tenure: ${numberOfPayments} months</p>
            </div>
        `;
    }

    updatePurposeOptions() {
        const loanType = this.form.querySelector('#loanType').value;
        const purposeSelect = this.form.querySelector('#loanPurpose');
        
        // Clear existing options
        purposeSelect.innerHTML = '';
        
        // Add options based on loan type
        const purposes = loanType === 'rural' 
            ? ['Farm Equipment', 'Land Development', 'Livestock', 'Irrigation', 'Storage Facility']
            : ['Property Renovation', 'Business Expansion', 'Equipment Purchase', 'Marketing', 'Inventory'];
        
        purposes.forEach(purpose => {
            const option = document.createElement('option');
            option.value = purpose;
            option.textContent = purpose;
            purposeSelect.appendChild(option);
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const loanData = {
            loanType: formData.get('loanType'),
            loanAmount: parseFloat(formData.get('loanAmount')),
            loanPurpose: formData.get('loanPurpose'),
            location: formData.get('location'),
            monthlyIncome: parseFloat(formData.get('monthlyIncome')),
            documents: Array.from(formData.getAll('documents')).map(file => file.name)
        };

        try {
            const result = await window.api.loans.applyForLoan(loanData);
            if (result.success) {
                showAlert('Loan application submitted successfully');
                this.form.reset();
                this.emiDetails.innerHTML = '';
                // Close modal or redirect
                document.getElementById('loanModal').classList.add('hidden');
            }
        } catch (error) {
            showAlert('Error submitting loan application', 'error');
        }
    }
}

// Initialize loan form
document.addEventListener('DOMContentLoaded', () => {
    new LoanForm();
}); 