const express = require('express');
const {
  getLoans,
  getLoan,
  createLoan,
  updateLoan,
  deleteLoan,
  getUserLoans,
  getLoanDetails
} = require('../controllers/loans');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:loanId/reviews', require('./reviews'));

router
  .route('/')
  .get(protect, authorize('admin'), getLoans)
  .post(protect, createLoan);

router
  .route('/:id')
  .get(protect, getLoan)
  .put(protect, updateLoan)
  .delete(protect, deleteLoan);

router
  .route('/user/:userId')
  .get(protect, getUserLoans);

router
  .route('/:id/details')
  .get(protect, getLoanDetails);

module.exports = router; 