const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanType: {
    type: String,
    enum: ['urban', 'rural'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  propertyLocation: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    required: true
  },
  documents: {
    idProof: String,
    propertyPapers: String,
    bankDetails: String,
    // Urban specific
    hostingProfile: String,
    bankStatements: String,
    // Rural specific
    landProof: String,
    propertyPhotos: [String],
    additionalDocs: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
loanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Loan', loanSchema); 