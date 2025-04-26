// Loan utilities for calculations and validation
const loanUtils = {
    // Get loan purposes based on loan type
    getLoanPurposes(loanType) {
        const purposes = {
            rural: [
                'Home Construction',
                'Home Renovation',
                'Land Purchase',
                'Farm Equipment',
                'Agricultural Development',
                'Homestay Setup',
                'Eco-Tourism Project',
                'Rural Business Expansion',
                'Farmhouse Construction',
                'Heritage Property Restoration'
            ],
            urban: [
                'Home Purchase',
                'Home Renovation',
                'Property Investment',
                'Business Expansion',
                'Education',
                'Commercial Property',
                'Hotel/Resort Development',
                'Mixed-Use Development',
                'Property Refinancing',
                'Urban Homestay Setup'
            ],
            semiurban: [
                'Property Purchase',
                'Home Construction',
                'Business Setup',
                'Tourism Project',
                'Renovation',
                'Land Development',
                'Commercial Complex',
                'Hospitality Business',
                'Educational Institute',
                'Healthcare Facility'
            ]
        };
        return purposes[loanType] || [];
    },

    // Get required documents based on loan type
    getRequiredDocuments(loanType) {
        const baseDocuments = [
            'Identity Proof (Aadhar/PAN)',
            'Address Proof',
            'Income Proof (Last 6 months)',
            'Bank Statements (Last 6 months)',
            'Property Documents'
        ];

        const additionalDocs = {
            rural: [
                'Land Records/7-12 Extract',
                'Agriculture Income Proof',
                'NOC from Local Authority',
                'Rural Tourism License (if applicable)',
                'Environmental Clearance (if required)'
            ],
            urban: [
                'Property Tax Receipts',
                'Building Plan Approval',
                'NOC from Society',
                'Occupancy Certificate',
                'Business License (if applicable)'
            ],
            semiurban: [
                'Land Use Certificate',
                'Development Authority Approval',
                'Property Registration Documents',
                'Building Permission',
                'Project Report'
            ]
        };

        return [...baseDocuments, ...(additionalDocs[loanType] || [])];
    },

    // Calculate EMI (Equated Monthly Installment)
    calculateEMI(principal, annualRate, years) {
        const monthlyRate = annualRate / 12 / 100;
        const numberOfPayments = years * 12;
        const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        const totalInterest = (emi * numberOfPayments) - principal;
        const totalAmount = emi * numberOfPayments;

        // Calculate yearly breakup
        const yearlyBreakup = [];
        let remainingPrincipal = principal;
        for (let year = 1; year <= years; year++) {
            const yearlyPrincipal = emi * 12 - (remainingPrincipal * monthlyRate * 12);
            const yearlyInterest = (emi * 12) - yearlyPrincipal;
            remainingPrincipal -= yearlyPrincipal;
            yearlyBreakup.push({
                year,
                principal: Math.round(yearlyPrincipal),
                interest: Math.round(yearlyInterest),
                balance: Math.round(remainingPrincipal)
            });
        }

        return {
            emi: Math.round(emi),
            totalInterest: Math.round(totalInterest),
            totalAmount: Math.round(totalAmount),
            yearlyBreakup,
            interestRate: annualRate
        };
    },

    // Calculate loan eligibility based on monthly income and existing obligations
    calculateEligibility(monthlyIncome, existingEMI = 0, creditScore = 700) {
        // Basic eligibility calculation with enhanced factors
        const maxEMIPercentage = creditScore >= 750 ? 0.65 : creditScore >= 700 ? 0.60 : 0.55;
        const availableEMI = (monthlyIncome * maxEMIPercentage) - existingEMI;
        
        // Calculate maximum loan amount based on available EMI
        // Assuming 20 years tenure and average interest rate of 9%
        const monthlyRate = 9 / 12 / 100;
        const months = 20 * 12;
        const maxLoanAmount = availableEMI * (Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months));
        
        return {
            maxLoanAmount: Math.min(Math.round(maxLoanAmount), 5000000), // Cap at 50 lakhs
            maxEMI: Math.round(availableEMI),
            eligibilityScore: creditScore,
            maxTenure: 20,
            minTenure: 1
        };
    },

    // Format currency in Indian Rupees
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    },

    // Calculate interest rate based on various factors
    calculateInterestRate(loanType, amount, creditScore = 700, tenure = 10) {
        // Base interest rates
        const baseRates = {
            rural: 8.5,
            urban: 7.5,
            semiurban: 8.0
        };

        // Credit score adjustment
        let creditScoreAdjustment = 0;
        if (creditScore >= 800) creditScoreAdjustment = -0.5;
        else if (creditScore >= 750) creditScoreAdjustment = -0.25;
        else if (creditScore < 650) creditScoreAdjustment = 0.5;

        // Loan amount adjustment
        let amountAdjustment = 0;
        if (amount > 3000000) amountAdjustment = 0.5;
        else if (amount > 1000000) amountAdjustment = 0.25;

        // Tenure adjustment
        let tenureAdjustment = 0;
        if (tenure > 15) tenureAdjustment = 0.25;
        else if (tenure < 5) tenureAdjustment = -0.25;

        const finalRate = baseRates[loanType] + creditScoreAdjustment + amountAdjustment + tenureAdjustment;
        return Math.round(finalRate * 100) / 100; // Round to 2 decimal places
    },

    // Validate loan application data with enhanced rules
    validateLoanApplication(data) {
        const errors = [];

        // Required fields
        if (!data.loanType) errors.push('Loan type is required');
        if (!data.purpose) errors.push('Loan purpose is required');
        if (!data.amount) errors.push('Loan amount is required');
        if (!data.tenure) errors.push('Loan tenure is required');
        if (!data.monthlyIncome) errors.push('Monthly income is required');
        if (!data.location) errors.push('Property location is required');
        if (!data.propertyType) errors.push('Property type is required');

        // Amount validation
        if (data.amount) {
            const amount = parseFloat(data.amount);
            if (isNaN(amount) || amount <= 0) {
                errors.push('Invalid loan amount');
            } else if (amount < 100000) {
                errors.push('Minimum loan amount is 1 lakh');
            } else if (amount > 5000000) {
                errors.push('Loan amount cannot exceed 50 lakhs');
            }
        }

        // Tenure validation
        if (data.tenure) {
            const tenure = parseInt(data.tenure);
            if (isNaN(tenure) || tenure < 1 || tenure > 20) {
                errors.push('Loan tenure must be between 1 and 20 years');
            }
        }

        // Monthly income validation
        if (data.monthlyIncome) {
            const income = parseFloat(data.monthlyIncome);
            if (isNaN(income) || income <= 0) {
                errors.push('Invalid monthly income');
            } else if (income < 25000) {
                errors.push('Minimum monthly income requirement is ₹25,000');
            }
        }

        // Location validation
        if (data.location && data.location.trim().length < 5) {
            errors.push('Please provide a detailed property location');
        }

        // Property type validation
        const validPropertyTypes = ['residential', 'commercial', 'mixed'];
        if (data.propertyType && !validPropertyTypes.includes(data.propertyType)) {
            errors.push('Invalid property type selected');
        }

        return errors;
    },

    // Calculate processing fees and other charges
    calculateCharges(loanAmount) {
        const processingFeeRate = 0.5; // 0.5% of loan amount
        const processingFee = Math.min(Math.round(loanAmount * processingFeeRate / 100), 25000); // Cap at 25,000
        const documentationCharge = 2500;
        const technicalAssessmentFee = 3500;
        const legalVerificationFee = 3000;

        return {
            processingFee,
            documentationCharge,
            technicalAssessmentFee,
            legalVerificationFee,
            totalCharges: processingFee + documentationCharge + technicalAssessmentFee + legalVerificationFee,
            gst: Math.round((processingFee + documentationCharge + technicalAssessmentFee + legalVerificationFee) * 0.18) // 18% GST
        };
    }
};

// Make loanUtils available globally
window.loanUtils = loanUtils; 