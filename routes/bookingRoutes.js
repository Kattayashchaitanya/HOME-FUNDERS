const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAvailableSlots,
    bookSlot,
    createSlots,
    updateVerification
} = require('../controllers/bookingController');

// Public routes
router.route('/slots')
    .get(getAvailableSlots);

// Protected routes
router.route('/book')
    .post(protect, bookSlot);

// Admin routes
router.route('/create')
    .post(protect, authorize('admin'), createSlots);

router.route('/:id/verify')
    .put(protect, authorize('admin'), updateVerification);

module.exports = router; 
