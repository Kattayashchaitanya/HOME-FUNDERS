const Loan = require('../models/Loan');
const User = require('../models/User');
const sendEmail = require('../utils/email');
const { uploadToCloudinary } = require('../utils/cloudinary');

// @desc    Apply for urban loan
// @route   POST /api/loans/urban/apply
// @access  Private
exports.applyForUrbanLoan = async (req, res) => {
    try {
        const { propertyLocation, loanAmount, propertyType } = req.body;
        
        // Check for required documents
        if (!req.files || !req.files.airbnbProfile || !req.files.bankStatements || 
            !req.files.aadhaarPan || !req.files.propertyPapers || !req.files.bankDetails) {
            return res.status(400).json({ 
                success: false, 
                message: 'All required documents must be uploaded' 
            });
        }

        // Upload documents to Cloudinary
        const documents = {};
        for (const [key, file] of Object.entries(req.files)) {
            const result = await uploadToCloudinary(file);
            documents[key] = result.secure_url;
        }

        // Create loan application
        const loan = await Loan.create({
            user: req.user.id,
            loanType: 'urban',
            status: 'PENDING',
            amount: loanAmount,
            documents,
            propertyLocation,
            propertyType
        });

        // Send email notification
        const user = await User.findById(req.user.id);
        await sendEmail(user.email, 'loanSubmitted', [user, loan]);

        res.status(201).json({ 
            success: true, 
            data: loan 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error' 
        });
    }
};

// @desc    Apply for rural loan
// @route   POST /api/loans/rural/apply
// @access  Private
exports.applyForRuralLoan = async (req, res) => {
    try {
        const { propertyLocation, loanAmount, propertyType } = req.body;
        
        // Check for required documents
        if (!req.files || !req.files.landPapers || !req.files.bankStatements || 
            !req.files.aadhaarPan || !req.files.propertyPhotos || !req.files.bankDetails) {
            return res.status(400).json({ 
                success: false, 
                message: 'All required documents must be uploaded' 
            });
        }

        // Upload documents to Cloudinary
        const documents = {};
        for (const [key, file] of Object.entries(req.files)) {
            const result = await uploadToCloudinary(file);
            documents[key] = result.secure_url;
        }

        // Create loan application
        const loan = await Loan.create({
            user: req.user.id,
            loanType: 'rural',
            status: 'PENDING',
            amount: loanAmount,
            documents,
            propertyLocation,
            propertyType
        });

        // Send email notification
        const user = await User.findById(req.user.id);
        await sendEmail(user.email, 'loanSubmitted', [user, loan]);

        res.status(201).json({ 
            success: true, 
            data: loan 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error' 
        });
    }
};

// @desc    Get user loans
// @route   GET /api/loans/me
// @access  Private
exports.getUserLoans = async (req, res) => {
    try {
        const loans = await Loan.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        res.json({ 
            success: true, 
            data: loans 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error' 
        });
    }
};

// @desc    Get loan details
// @route   GET /api/loans/:id
// @access  Private
exports.getLoanDetails = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id)
            .populate('user', 'name email phone');
        
        if (!loan) {
            return res.status(404).json({ 
                success: false, 
                message: 'Loan not found' 
            });
        }

        // Check if user is authorized
        if (loan.user._id.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized' 
            });
        }

        res.json({ 
            success: true, 
            data: loan 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error' 
        });
    }
};

// @desc    Approve loan
// @route   PUT /api/admin/loans/:id/approve
// @access  Private/Admin
exports.approveLoan = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id)
            .populate('user', 'name email phone');
        
        if (!loan) {
            return res.status(404).json({ 
                success: false, 
                message: 'Loan not found' 
            });
        }

        loan.status = 'APPROVED';
        loan.approvedBy = req.user.id;
        loan.approvedAt = Date.now();
        await loan.save();

        // Send email notification
        await sendEmail(loan.user.email, 'loanApproved', [loan.user, loan]);

        res.json({ 
            success: true, 
            data: loan 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error' 
        });
    }
};

// @desc    Reject loan
// @route   PUT /api/admin/loans/:id/reject
// @access  Private/Admin
exports.rejectLoan = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id)
            .populate('user', 'name email phone');
        
        if (!loan) {
            return res.status(404).json({ 
                success: false, 
                message: 'Loan not found' 
            });
        }

        loan.status = 'REJECTED';
        loan.rejectedBy = req.user.id;
        loan.rejectedAt = Date.now();
        loan.rejectionReason = req.body.reason || 'Rejected by admin';
        await loan.save();

        // Send email notification
        await sendEmail(loan.user.email, 'loanRejected', [loan.user, loan, loan.rejectionReason]);

        res.json({ 
            success: true, 
            data: loan 
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error' 
        });
    }
}; 