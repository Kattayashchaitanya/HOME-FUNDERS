document.addEventListener('DOMContentLoaded', function() {
    // Initialize calculator
    const calculator = new LoanCalculator();
    calculator.init();
});

class LoanCalculator {
    constructor() {
        this.principal = 0;
        this.interestRate = 0;
        this.tenure = 0;
        this.loanType = 'urban';
        this.chart = null;
    }

    init() {
        this.setupEventListeners();
        this.initializeChart();
        this.updateResults();
    }

    setupEventListeners() {
        // Input fields
        const principalInput = document.getElementById('principal');
        const interestInput = document.getElementById('interest');
        const tenureInput = document.getElementById('tenure');
        const loanTypeSelect = document.getElementById('loanType');

        // Add input event listeners with debounce
        [principalInput, interestInput, tenureInput, loanTypeSelect].forEach(input => {
            input.addEventListener('input', this.debounce(() => {
                this.updateInputs();
                this.updateResults();
            }, 300));
        });

        // Calculate button
        document.getElementById('calculateBtn').addEventListener('click', () => {
            this.updateInputs();
            this.updateResults();
            this.animateResults();
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetCalculator();
        });
    }

    updateInputs() {
        this.principal = parseFloat(document.getElementById('principal').value) || 0;
        this.interestRate = parseFloat(document.getElementById('interest').value) || 0;
        this.tenure = parseInt(document.getElementById('tenure').value) || 0;
        this.loanType = document.getElementById('loanType').value;
    }

    calculateEMI() {
        const monthlyRate = this.interestRate / 12 / 100;
        const months = this.tenure * 12;
        const emi = this.principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        return isNaN(emi) ? 0 : emi;
    }

    calculateTotalPayment() {
        const emi = this.calculateEMI();
        return emi * this.tenure * 12;
    }

    calculateTotalInterest() {
        return this.calculateTotalPayment() - this.principal;
    }

    updateResults() {
        const emi = this.calculateEMI();
        const totalPayment = this.calculateTotalPayment();
        const totalInterest = this.calculateTotalInterest();

        document.getElementById('emi').textContent = this.formatCurrency(emi);
        document.getElementById('totalPayment').textContent = this.formatCurrency(totalPayment);
        document.getElementById('totalInterest').textContent = this.formatCurrency(totalInterest);

        this.updateChart();
        this.updateAmortizationTable();
    }

    updateChart() {
        const principal = this.principal;
        const interest = this.calculateTotalInterest();
        
        if (this.chart) {
            this.chart.destroy();
        }

        const ctx = document.getElementById('loanChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal', 'Interest'],
                datasets: [{
                    data: [principal, interest],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 99, 132, 0.8)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ₹${context.raw.toLocaleString()}`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateAmortizationTable() {
        const tableBody = document.getElementById('amortizationTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';

        const emi = this.calculateEMI();
        let balance = this.principal;
        const monthlyRate = this.interestRate / 12 / 100;

        for (let month = 1; month <= this.tenure * 12; month++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = emi - interestPayment;
            balance -= principalPayment;

            const row = tableBody.insertRow();
            row.insertCell(0).textContent = month;
            row.insertCell(1).textContent = this.formatCurrency(emi);
            row.insertCell(2).textContent = this.formatCurrency(principalPayment);
            row.insertCell(3).textContent = this.formatCurrency(interestPayment);
            row.insertCell(4).textContent = this.formatCurrency(balance);
        }
    }

    animateResults() {
        const results = document.querySelectorAll('.result-value');
        results.forEach(result => {
            result.style.animation = 'none';
            result.offsetHeight; // Trigger reflow
            result.style.animation = 'pulse 0.5s ease-in-out';
        });
    }

    resetCalculator() {
        document.getElementById('principal').value = '';
        document.getElementById('interest').value = '';
        document.getElementById('tenure').value = '';
        document.getElementById('loanType').value = 'urban';
        
        this.principal = 0;
        this.interestRate = 0;
        this.tenure = 0;
        
        this.updateResults();
        this.animateResults();
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
} 
