import { body, query, param, validationResult } from 'express-validator';
import logger from '../lib/logger.js';

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors', {
      errors: errors.array(),
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    
    return res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: errors.array()
    });
  }
  next();
};

// Profile validation rules
const validateProfile = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  
  body('education')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Education must be less than 200 characters'),
  
  body('github_url')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('GitHub URL must be a valid URL'),
  
  body('linkedin_url')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('LinkedIn URL must be a valid URL'),
  
  body('portfolio_url')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Portfolio URL must be a valid URL'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        return value.length >= 1 && value.length <= 50;
      }
      if (typeof value === 'object' && value.name) {
        return value.name.length >= 1 && value.name.length <= 50;
      }
      return false;
    })
    .withMessage('Each skill must be a string or object with name property (1-50 characters)'),
  
  body('projects')
    .optional()
    .isArray()
    .withMessage('Projects must be an array'),
  
  body('projects.*.title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project title must be between 1 and 100 characters'),
  
  body('projects.*.description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Project description must be less than 500 characters'),
  
  body('workExperience')
    .optional()
    .isArray()
    .withMessage('Work experience must be an array'),
  
  body('workExperience.*.company')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name must be between 1 and 100 characters'),
  
  body('workExperience.*.position')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Position must be between 1 and 100 characters'),
  
  handleValidationErrors
];

// Query validation rules
const validateQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('type')
    .optional()
    .isIn(['all', 'profiles', 'projects', 'skills', 'work'])
    .withMessage('Type must be one of: all, profiles, projects, skills, work'),
  
  query('skill')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Skill filter must be between 1 and 50 characters'),
  
  handleValidationErrors
];

// Login validation
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Pagination helper
const paginate = (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  
  req.pagination = {
    limit: Math.min(limit, 100), // Cap at 100
    offset: Math.max(offset, 0)  // Ensure non-negative
  };
  
  next();
};

export {
  validateProfile,
  validateQuery,
  validateLogin,
  handleValidationErrors,
  paginate
};
