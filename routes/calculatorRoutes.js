const express = require('express');
const router = express.Router();
const { calculateEMI, calculateEligibility } = require('../utils/loanCalculator');

// @route   POST /api/calculator/emi
// @desc    Calculate EMI
// @access  Public
router.post('/emi', (req, res) => {
    try {
        const { principal, rate, tenure } = req.body;
        
        // Validate input
        if (!principal || !rate || !tenure) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const result = calculateEMI(principal, rate, tenure);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error calculating EMI'
        });
    }
});

// @route   POST /api/calculator/eligibility
// @desc    Calculate loan eligibility
// @access  Public
router.post('/eligibility', (req, res) => {
    try {
        const { monthlyIncome, monthlyExpenses, existingEMIs } = req.body;
        
        // Validate input
        if (!monthlyIncome || !monthlyExpenses || existingEMIs === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const result = calculateEligibility(monthlyIncome, monthlyExpenses, existingEMIs);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error calculating eligibility'
        });
    }
});

module.exports = router; 