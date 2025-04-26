/**
 * Calculate EMI (Equated Monthly Installment)
 * @param {number} principal - Loan amount
 * @param {number} rate - Annual interest rate (in percentage)
 * @param {number} tenure - Loan tenure in months
 * @returns {Object} - EMI details
 */
const calculateEMI = (principal, rate, tenure) => {
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
};

/**
 * Calculate eligibility based on income and expenses
 * @param {number} monthlyIncome - Monthly income
 * @param {number} monthlyExpenses - Monthly expenses
 * @param {number} existingEMIs - Existing EMIs
 * @returns {Object} - Eligibility details
 */
const calculateEligibility = (monthlyIncome, monthlyExpenses, existingEMIs) => {
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
};

module.exports = {
    calculateEMI,
    calculateEligibility
}; 