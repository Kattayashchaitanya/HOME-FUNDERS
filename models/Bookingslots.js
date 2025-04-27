const mongoose = require('mongoose');

const BookingSlotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'Please add a date']
    },
    time: {
        type: String,
        required: [true, 'Please add a time slot']
    },
    type: {
        type: String,
        enum: ['urban', 'rural'],
        required: [true, 'Please specify loan type']
    },
    purpose: {
        type: String,
        enum: ['document_verification', 'property_inspection', 'final_approval'],
        default: 'document_verification'
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    bookedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    loanApplication: {
        type: mongoose.Schema.ObjectId,
        ref: 'Loan'
    },
    documents: [{
        name: String,
        status: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        comments: String
    }],
    verificationStatus: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
    },
    verificationOfficer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate slots
BookingSlotSchema.index({ date: 1, time: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('BookingSlot', BookingSlotSchema); 
