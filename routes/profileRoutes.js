const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth');
const profileController = require('../controllers/profileController');
const fileUpload = require('express-fileupload');

// Apply middleware
router.use(auth);
router.use(fileUpload());

// Get current user profile
router.get('/me', profileController.getCurrentUser);

// Update user profile
router.put('/update', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phone', 'Phone number is required').not().isEmpty(),
    check('address', 'Address is required').not().isEmpty()
], profileController.updateProfile);

// Upload profile image
router.post('/upload-image', profileController.uploadProfileImage);

module.exports = router; 