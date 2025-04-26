// Loan application page functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/signin.html';
        return;
    }

    // Initialize variables
    let selectedLoanType = null;
    let uploadedDocuments = [];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    // DOM Elements
    const loanTypeCards = document.querySelectorAll('.loan-type-card');
    const loanPurposeSelect = document.getElementById('loanPurpose');
    const loanAmountInput = document.getElementById('loanAmount');
    const monthlyIncomeInput = document.getElementById('monthlyIncome');
    const tenureSelect = document.getElementById('tenure');
    const emiResult = document.getElementById('emiResult');
    const documentDropZone = document.getElementById('documentDropZone');
    const documentList = document.getElementById('documentList');
    const loanForm = document.getElementById('loanForm');

    // Event Listeners
    loanTypeCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selected class from all cards
            loanTypeCards.forEach(c => c.classList.remove('selected'));
            // Add selected class to clicked card
            card.classList.add('selected');
            // Update selected loan type
            selectedLoanType = card.dataset.type;
            // Update loan purposes
            updateLoanPurposes();
        });
    });

    // Update loan amount based on monthly income
    monthlyIncomeInput.addEventListener('input', () => {
        const income = parseFloat(monthlyIncomeInput.value) || 0;
        const maxLoanAmount = loanUtils.calculateEligibility(income);
        loanAmountInput.max = maxLoanAmount;
        loanAmountInput.placeholder = `Maximum: ${loanUtils.formatCurrency(maxLoanAmount)}`;
    });

    // Calculate EMI when loan amount or tenure changes
    [loanAmountInput, tenureSelect].forEach(element => {
        element.addEventListener('input', calculateEMI);
    });

    // Document upload handling
    documentDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        documentDropZone.classList.add('dragover');
    });

    documentDropZone.addEventListener('dragleave', () => {
        documentDropZone.classList.remove('dragover');
    });

    documentDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        documentDropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    document.getElementById('documentInput').addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Form submission
    loanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate form data
        const formData = new FormData(loanForm);
        const loanData = Object.fromEntries(formData.entries());
        loanData.loanType = selectedLoanType;
        
        const errors = loanUtils.validateLoanApplication(loanData);
        if (errors.length > 0) {
            errors.forEach(error => showAlert(error, 'error'));
            return;
        }

        if (uploadedDocuments.length === 0) {
            showAlert('Please upload at least one document', 'error');
            return;
        }

        try {
            // Create FormData for API submission
            const apiFormData = new FormData();
            Object.entries(loanData).forEach(([key, value]) => {
                apiFormData.append(key, value);
            });
            uploadedDocuments.forEach(doc => {
                apiFormData.append('documents', doc);
            });

            // Submit loan application
            const response = await api.loans.applyForLoan(apiFormData);
            
            if (response.success) {
                showAlert('Loan application submitted successfully!', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 2000);
            } else {
                showAlert(response.message || 'Failed to submit loan application', 'error');
            }
        } catch (error) {
            showAlert('An error occurred while submitting your application', 'error');
            console.error('Loan application error:', error);
        }
    });

    // Helper Functions
    function updateLoanPurposes() {
        const purposes = loanUtils.getLoanPurposes(selectedLoanType);
        loanPurposeSelect.innerHTML = `
            <option value="">Select Loan Purpose</option>
            ${purposes.map(purpose => `
                <option value="${purpose}">${purpose}</option>
            `).join('')}
        `;
    }

    function calculateEMI() {
        const amount = parseFloat(loanAmountInput.value) || 0;
        const tenure = parseInt(tenureSelect.value) || 3;
        
        if (amount && tenure && selectedLoanType) {
            const rate = loanUtils.calculateInterestRate(selectedLoanType, amount);
            const emi = loanUtils.calculateEMI(amount, rate, tenure);
            const totalAmount = emi * tenure * 12;
            const totalInterest = totalAmount - amount;

            emiResult.innerHTML = `
                <div class="emi-details">
                    <div class="emi-amount">
                        <span class="label">Monthly EMI</span>
                        <span class="value">${loanUtils.formatCurrency(emi)}</span>
                    </div>
                    <div class="emi-breakdown">
                        <div class="breakdown-item">
                            <span class="label">Total Interest</span>
                            <span class="value">${loanUtils.formatCurrency(totalInterest)}</span>
                        </div>
                        <div class="breakdown-item">
                            <span class="label">Total Amount</span>
                            <span class="value">${loanUtils.formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            emiResult.innerHTML = '';
        }
    }

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            // Validate file type
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                showAlert('Invalid file type. Please upload PDF, JPG, or PNG files only.', 'error');
                return;
            }

            // Validate file size
            if (file.size > maxFileSize) {
                showAlert('File size exceeds 5MB limit', 'error');
                return;
            }

            // Add to uploaded documents
            uploadedDocuments.push(file);

            // Add to document list
            const documentItem = document.createElement('div');
            documentItem.className = 'document-item';
            documentItem.innerHTML = `
                <span class="document-name">${file.name}</span>
                <button class="remove-document" onclick="removeDocument('${file.name}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            documentList.appendChild(documentItem);
        });
    }

    // Make removeDocument function globally available
    window.removeDocument = (fileName) => {
        uploadedDocuments = uploadedDocuments.filter(doc => doc.name !== fileName);
        const items = documentList.querySelectorAll('.document-item');
        items.forEach(item => {
            if (item.querySelector('.document-name').textContent === fileName) {
                item.remove();
            }
        });
    };
}); 