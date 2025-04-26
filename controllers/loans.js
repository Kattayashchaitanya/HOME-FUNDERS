const Loan = require('../models/Loan');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all loans
// @route   GET /api/v1/loans
// @access  Private/Admin
exports.getLoans = asyncHandler(async (req, res, next) => {
    const loans = await Loan.find().populate('user', 'name email');
    res.status(200).json({
        success: true,
        count: loans.length,
        data: loans
    });
});

// @desc    Get single loan
// @route   GET /api/v1/loans/:id
// @access  Private
exports.getLoan = asyncHandler(async (req, res, next) => {
    const loan = await Loan.findById(req.params.id).populate('user', 'name email');
    
    if (!loan) {
        return next(new ErrorResponse(`Loan not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is loan owner or admin
    if (loan.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to access this loan`, 401));
    }

    res.status(200).json({
        success: true,
        data: loan
    });
});

// @desc    Create new loan
// @route   POST /api/v1/loans
// @access  Private
exports.createLoan = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    const loan = await Loan.create(req.body);
    res.status(201).json({
        success: true,
        data: loan
    });
});

// @desc    Update loan
// @route   PUT /api/v1/loans/:id
// @access  Private
exports.updateLoan = asyncHandler(async (req, res, next) => {
    let loan = await Loan.findById(req.params.id);

    if (!loan) {
        return next(new ErrorResponse(`Loan not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is loan owner or admin
    if (loan.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this loan`, 401));
    }

    loan = await Loan.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: loan
    });
});

// @desc    Delete loan
// @route   DELETE /api/v1/loans/:id
// @access  Private
exports.deleteLoan = asyncHandler(async (req, res, next) => {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
        return next(new ErrorResponse(`Loan not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is loan owner or admin
    if (loan.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this loan`, 401));
    }

    await loan.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get user loans
// @route   GET /api/v1/loans/user/:userId
// @access  Private
exports.getUserLoans = asyncHandler(async (req, res, next) => {
    const loans = await Loan.find({ user: req.params.userId });
    
    res.status(200).json({
        success: true,
        count: loans.length,
        data: loans
    });
});

// @desc    Get loan details with EMI calculation
// @route   GET /api/v1/loans/:id/details
// @access  Private
exports.getLoanDetails = asyncHandler(async (req, res, next) => {
    const loan = await Loan.findById(req.params.id).populate('user', 'name email');
    
    if (!loan) {
        return next(new ErrorResponse(`Loan not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is loan owner or admin
    if (loan.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to access this loan`, 401));
    }

    res.status(200).json({
        success: true,
        data: loan
    });
});

// @desc    Get current user loans
// @route   GET /api/loans/me
// @access  Private
exports.getMyLoans = asyncHandler(async (req, res, next) => {
  const loans = await Loan.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: loans.length,
    data: loans
  });
});

// @desc    Update loan status
// @route   PUT /api/loans/:id/status
// @access  Private/Admin
exports.updateLoanStatus = asyncHandler(async (req, res, next) => {
  const loan = await Loan.findById(req.params.id);

  if (!loan) {
    return next(new ErrorResponse(`Loan not found with id of ${req.params.id}`, 404));
  }

  // Only admin can update loan status
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update loan status`, 401));
  }

  loan.status = req.body.status;
  loan.remarks = req.body.remarks;
  loan.processedAt = Date.now();

  await loan.save();

  res.status(200).json({
    success: true,
    data: loan
  });
}); 