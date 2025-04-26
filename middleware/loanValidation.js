const { validationResult } = require('express-validator');

const validateLoanApplication = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateUrbanLoan = [
  (req, res, next) => {
    if (!req.files) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const requiredFiles = [
      'hostingProfile',
      'bankStatements',
      'idProof',
      'propertyPapers',
      'bankDetails'
    ];

    for (const file of requiredFiles) {
      if (!req.files[file]) {
        return res.status(400).json({ error: `${file} is required` });
      }
    }

    next();
  }
];

const validateRuralLoan = [
  (req, res, next) => {
    if (!req.files) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const requiredFiles = [
      'idProof',
      'landProof',
      'propertyPhotos'
    ];

    for (const file of requiredFiles) {
      if (!req.files[file]) {
        return res.status(400).json({ error: `${file} is required` });
      }
    }

    next();
  }
];

module.exports = {
  validateLoanApplication,
  validateUrbanLoan,
  validateRuralLoan
}; 