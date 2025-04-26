const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateUrbanLoan, validateRuralLoan } = require('../middleware/loanValidation');
const {
  applyUrbanLoan,
  applyRuralLoan,
  getUserLoans,
  getLoanDetails
} = require('../controllers/loanController');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Urban loan routes
router.post(
  '/urban/apply',
  protect,
  upload.fields([
    { name: 'hostingProfile', maxCount: 1 },
    { name: 'bankStatements', maxCount: 1 },
    { name: 'idProof', maxCount: 1 },
    { name: 'propertyPapers', maxCount: 1 },
    { name: 'bankDetails', maxCount: 1 }
  ]),
  validateUrbanLoan,
  applyUrbanLoan
);

// Rural loan routes
router.post(
  '/rural/apply',
  protect,
  upload.fields([
    { name: 'idProof', maxCount: 1 },
    { name: 'landProof', maxCount: 1 },
    { name: 'propertyPhotos', maxCount: 5 },
    { name: 'additionalDocs', maxCount: 5 }
  ]),
  validateRuralLoan,
  applyRuralLoan
);

// Get user's loans
router.get('/my-loans', protect, getUserLoans);

// Get loan details
router.get('/:id', protect, getLoanDetails);

module.exports = router; 