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
        this.interestChart = null;
        this.savedCalculations = [];
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.updateResults();
        this.loadSavedCalculations();
        this.initializeRangeSliders();
    }

    initializeRangeSliders() {
        const rangeSliders = document.querySelectorAll('input[type="range"]');
        rangeSliders.forEach(slider => {
            const targetId = slider.dataset.target;
            const targetInput = document.getElementById(targetId);
            const rangeValue = slider.nextElementSibling;

            // Set initial values
            targetInput.value = slider.value;
            this.updateRangeValue(slider, rangeValue);

            // Add event listeners
            slider.addEventListener('input', () => {
                targetInput.value = slider.value;
                this.updateRangeValue(slider, rangeValue);
                this.updateInputs();
                this.updateResults();
            });

            targetInput.addEventListener('input', () => {
                const value = parseFloat(targetInput.value);
                if (!isNaN(value)) {
                    slider.value = value;
                    this.updateRangeValue(slider, rangeValue);
                    this.updateInputs();
                    this.updateResults();
                }
            });
        });
    }

    updateRangeValue(slider, rangeValue) {
        const value = parseFloat(slider.value);
        if (slider.dataset.target === 'principal') {
            rangeValue.textContent = `₹${value.toLocaleString()}`;
        } else if (slider.dataset.target === 'interest') {
            rangeValue.textContent = `${value}%`;
        } else if (slider.dataset.target === 'tenure') {
            rangeValue.textContent = `${value} Years`;
        }
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

        // Buttons
        document.getElementById('calculateBtn').addEventListener('click', () => {
            this.updateInputs();
            this.updateResults();
            this.animateResults();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetCalculator();
        });

        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveCalculation();
        });

        document.getElementById('compareBtn').addEventListener('click', () => {
            this.showComparisonModal();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportAmortizationSchedule();
        });

        document.getElementById('printBtn').addEventListener('click', () => {
            this.printAmortizationSchedule();
        });
    }

    updateInputs() {
        this.principal = parseFloat(document.getElementById('principal').value) || 0;
        this.interestRate = parseFloat(document.getElementById('interest').value) || 0;
        this.tenure = parseInt(document.getElementById('tenure').value) || 0;
        this.loanType = document.getElementById('loanType').value;
    }

    calculateEMI(rate = this.interestRate, years = this.tenure) {
        const monthlyRate = rate / 12 / 100;
        const months = years * 12;
        const emi = this.principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
        return isNaN(emi) ? 0 : emi;
    }

    calculateTotalPayment(rate = this.interestRate, years = this.tenure) {
        const emi = this.calculateEMI(rate, years);
        return emi * years * 12;
    }

    calculateTotalInterest(rate = this.interestRate, years = this.tenure) {
        return this.calculateTotalPayment(rate, years) - this.principal;
    }

    calculateEffectiveRate() {
        const totalPayment = this.calculateTotalPayment();
        const effectiveRate = (Math.pow(totalPayment / this.principal, 1 / this.tenure) - 1) * 100;
        return isNaN(effectiveRate) ? 0 : effectiveRate.toFixed(2);
    }

    updateResults() {
        const emi = this.calculateEMI();
        const totalPayment = this.calculateTotalPayment();
        const totalInterest = this.calculateTotalInterest();
        const effectiveRate = this.calculateEffectiveRate();

        document.getElementById('emi').textContent = this.formatCurrency(emi);
        document.getElementById('totalPayment').textContent = this.formatCurrency(totalPayment);
        document.getElementById('totalInterest').textContent = this.formatCurrency(totalInterest);
        document.getElementById('effectiveRate').textContent = `${effectiveRate}%`;

        this.updateCharts();
        this.updateAmortizationTable();
    }

    // ... rest of the existing code ...
}
