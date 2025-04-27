const BookingSlot = require('../models/BookingSlot');
const Loan = require('../models/Loan');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// @desc    Get available slots
// @route   GET /api/bookings/slots
// @access  Public
exports.getAvailableSlots = async (req, res) => {
    try {
        const { type, date, purpose } = req.query;
        
        const query = { isBooked: false };
        if (type) query.type = type;
        if (date) query.date = new Date(date);
        if (purpose) query.purpose = purpose;

        const slots = await BookingSlot.find(query)
            .select('date time type purpose')
            .sort('date time');

        res.status(200).json({
            success: true,
            count: slots.length,
            data: slots
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Book a slot for document verification
// @route   POST /api/bookings/book
// @access  Private
exports.bookSlot = async (req, res) => {
    try {
        const { slotId, loanId, documents } = req.body;
        const userId = req.user.id;

        // Check if slot exists and is available
        const slot = await BookingSlot.findById(slotId);
        if (!slot) {
            return res.status(404).json({
                success: false,
                error: 'Slot not found'
            });
        }

        if (slot.isBooked) {
            return res.status(400).json({
                success: false,
                error: 'Slot is already booked'
            });
        }

        // Check if loan exists
        const loan = await Loan.findById(loanId);
        if (!loan) {
            return res.status(404).json({
                success: false,
                error: 'Loan application not found'
            });
        }

        // Update slot with documents to be verified
        slot.isBooked = true;
        slot.bookedBy = userId;
        slot.loanApplication = loanId;
        slot.documents = documents.map(doc => ({
            name: doc,
            status: 'pending'
        }));
        slot.verificationStatus = 'pending';
        await slot.save();

        // Get user details for email
        const user = await User.findById(userId);

        // Send confirmation email
        const emailData = {
            to: user.email,
            subject: 'Document Verification Appointment Confirmation',
            html: `
                <h2>Document Verification Appointment</h2>
                <p>Dear ${user.name},</p>
                <p>Your document verification appointment has been scheduled.</p>
                <p><strong>Date:</strong> ${slot.date.toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${slot.time}</p>
                <p><strong>Loan Type:</strong> ${slot.type}</p>
                <p><strong>Documents for Verification:</strong></p>
                <ul>
                    ${slot.documents.map(doc => `<li>${doc.name}</li>`).join('')}
                </ul>
                <p>Please bring all original documents for verification.</p>
                <p>Thank you for choosing Home Funders!</p>
            `
        };

        await sendEmail(emailData);
        slot.emailSent = true;
        await slot.save();

        res.status(200).json({
            success: true,
            data: slot
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Update document verification status
// @route   PUT /api/bookings/:id/verify
// @access  Private/Admin
exports.updateVerification = async (req, res) => {
    try {
        const { documents, verificationStatus } = req.body;
        const slot = await BookingSlot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({
                success: false,
                error: 'Booking slot not found'
            });
        }

        // Update document statuses
        if (documents) {
            documents.forEach(doc => {
                const existingDoc = slot.documents.find(d => d.name === doc.name);
                if (existingDoc) {
                    existingDoc.status = doc.status;
                    existingDoc.comments = doc.comments;
                }
            });
        }

        // Update verification status
        if (verificationStatus) {
            slot.verificationStatus = verificationStatus;
        }

        slot.verificationOfficer = req.user.id;
        await slot.save();

        // Send email notification about verification status
        const user = await User.findById(slot.bookedBy);
        const emailData = {
            to: user.email,
            subject: 'Document Verification Update',
            html: `
                <h2>Document Verification Status Update</h2>
                <p>Dear ${user.name},</p>
                <p>Your documents have been reviewed. Here are the results:</p>
                <ul>
                    ${slot.documents.map(doc => `
                        <li>
                            ${doc.name}: <strong>${doc.status}</strong>
                            ${doc.comments ? `<br>Comments: ${doc.comments}` : ''}
                        </li>
                    `).join('')}
                </ul>
                <p>Overall verification status: <strong>${slot.verificationStatus}</strong></p>
                <p>Thank you for choosing Home Funders!</p>
            `
        };

        await sendEmail(emailData);

        res.status(200).json({
            success: true,
            data: slot
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Create slots (Admin only)
// @route   POST /api/bookings/create
// @access  Private/Admin
exports.createSlots = async (req, res) => {
    try {
        const { dates, times, type, purpose } = req.body;

        const slots = [];
        for (const date of dates) {
            for (const time of times) {
                slots.push({
                    date: new Date(date),
                    time,
                    type,
                    purpose: purpose || 'document_verification'
                });
            }
        }

        await BookingSlot.insertMany(slots);

        res.status(201).json({
            success: true,
            count: slots.length,
            data: slots
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}; 
