const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user']
  },
  loanType: {
    type: String,
    required: [true, 'Please specify loan type'],
    enum: ['rural', 'urban'],
    default: 'urban'
  },
  loanAmount: {
    type: Number,
    required: [true, 'Please add loan amount'],
    min: [1000, 'Minimum loan amount is ₹1,000'],
    max: [10000000, 'Maximum loan amount is ₹1,00,00,000']
  },
  loanPurpose: {
    type: String,
    required: [true, 'Please add loan purpose'],
    maxlength: [500, 'Purpose cannot be more than 500 characters']
  },
  location: {
    type: String,
    required: [true, 'Please add property location']
  },
  monthlyIncome: {
    type: Number,
    required: [true, 'Please add monthly income']
  },
  documents: [{
    type: String // URLs to uploaded documents
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processing'],
    default: 'pending'
  },
  remarks: {
    type: String,
    maxlength: [1000, 'Remarks cannot be more than 1000 characters']
  },
  processedAt: Date,
  emiDetails: {
    monthlyEMI: Number,
    totalInterest: Number,
    totalAmount: Number,
    tenure: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate EMI details before saving
LoanSchema.pre('save', function(next) {
  if (this.isModified('loanAmount') || this.isModified('status')) {
    if (this.status === 'approved') {
      const principal = this.loanAmount;
      const rate = 10; // 10% annual interest rate
      const time = 5; // 5 years tenure
      const monthlyRate = rate / (12 * 100);
      const numberOfPayments = time * 12;
      
      const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      const totalAmount = emi * numberOfPayments;
      const totalInterest = totalAmount - principal;
      
      this.emiDetails = {
        monthlyEMI: Math.round(emi),
        totalInterest: Math.round(totalInterest),
        totalAmount: Math.round(totalAmount),
        tenure: numberOfPayments
      };
      
      this.processedAt = Date.now();
    }
  }
  next();
});

module.exports = mongoose.model('Loan', LoanSchema); 