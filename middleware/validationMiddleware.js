const { body, validationResult } = require('express-validator');

exports.validateBabysitterProfile = [
  body('bio')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Bio must be between 10 and 500 characters'),
  
  body('experience')
    .isInt({ min: 0 })
    .withMessage('Experience must be a positive number'),
  
  body('hourlyRate')
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  
  body('location.coordinates')
    .isArray()
    .withMessage('Location coordinates must be an array'),
  
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  
  body('availability')
    .isArray()
    .withMessage('Availability must be an array'),
  
  body('availability.*.day')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day of week'),
  
  body('availability.*.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('availability.*.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateReservation = [
  body('babysitterId')
    .isMongoId()
    .withMessage('Invalid babysitter ID'),

  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start time must be in the future');
      }
      return true;
    }),

  body('endTime')
    .isISO8601()
    .withMessage('End time must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startTime)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),

  body('location.coordinates')
    .isArray()
    .withMessage('Location coordinates must be an array'),

  body('numberOfChildren')
    .isInt({ min: 1 })
    .withMessage('Number of children must be at least 1'),

  body('childrenAges')
    .isArray()
    .withMessage('Children ages must be an array')
    .custom((value) => {
      if (!value.every(age => Number.isInteger(age) && age >= 0 && age <= 17)) {
        throw new Error('Children ages must be between 0 and 17');
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateReview = [
  body('reservationId')
    .isMongoId()
    .withMessage('Invalid reservation ID'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateReviewResponse = [
  body('response')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Response must be between 10 and 500 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
]; 