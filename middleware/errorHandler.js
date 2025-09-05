import logger from '../lib/logger.js';

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });

  // Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        error = new AppError('Duplicate field value', 400, 'DUPLICATE_ENTRY');
        break;
      case 'P2025':
        error = new AppError('Record not found', 404, 'NOT_FOUND');
        break;
      case 'P2003':
        error = new AppError('Foreign key constraint failed', 400, 'FOREIGN_KEY_CONSTRAINT');
        break;
      default:
        error = new AppError('Database error', 500, 'DATABASE_ERROR');
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // Cast errors
  if (err.name === 'CastError') {
    error = new AppError('Invalid ID format', 400, 'INVALID_ID');
  }

  // Default error
  if (!error.isOperational) {
    error = new AppError('Something went wrong', 500, 'INTERNAL_ERROR');
  }

  res.status(error.statusCode || 500).json({
    error: error.message,
    code: error.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export {
  AppError,
  errorHandler,
  notFound,
  asyncHandler
};
