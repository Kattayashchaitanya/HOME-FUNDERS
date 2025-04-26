const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Loan = require('../models/Loan');
const User = require('../models/User');

// @route   GET api/admin/loans
// @desc    Get all loans
// @access  Private/Admin
router.get('/loans', [auth, adminAuth], async (req, res) => {
    try {
        const loans = await Loan.find()
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: loans });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT api/admin/loans/:id/approve
// @desc    Approve a loan
// @access  Private/Admin
router.put('/loans/:id/approve', [auth, adminAuth], async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) {
            return res.status(404).json({ success: false, message: 'Loan not found' });
        }

        loan.status = 'APPROVED';
        loan.approvedBy = req.user.id;
        loan.approvedAt = Date.now();
        await loan.save();

        res.json({ success: true, data: loan });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT api/admin/loans/:id/reject
// @desc    Reject a loan
// @access  Private/Admin
router.put('/loans/:id/reject', [auth, adminAuth], async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) {
            return res.status(404).json({ success: false, message: 'Loan not found' });
        }

        loan.status = 'REJECTED';
        loan.rejectedBy = req.user.id;
        loan.rejectedAt = Date.now();
        loan.rejectionReason = req.body.reason || 'Rejected by admin';
        await loan.save();

        res.json({ success: true, data: loan });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', [auth, adminAuth], async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, data: users });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET api/admin/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/users/:id', [auth, adminAuth], async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   PUT api/admin/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/users/:id', [
    auth,
    adminAuth,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('phone', 'Please include a valid phone number').isMobilePhone()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { name, email, phone, isActive } = req.body;

        user.name = name;
        user.email = email;
        user.phone = phone;
        user.isActive = isActive;

        await user.save();
        res.json({ success: true, data: user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', [auth, adminAuth], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.remove();
        res.json({ success: true, message: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router; 