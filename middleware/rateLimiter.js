import rateLimit from 'express-rate-limit';
import logger from '../lib/logger.js';

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Strict rate limiter for write operations
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 write requests per windowMs
  message: {
    error: 'Too many write requests from this IP, please try again later.',
    code: 'WRITE_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Write rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method
    });
    res.status(429).json({
      error: 'Too many write requests from this IP, please try again later.',
      code: 'WRITE_RATE_LIMIT_EXCEEDED'
    });
  }
});

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    res.status(429).json({
      error: 'Too many login attempts from this IP, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    });
  }
});

// Search rate limiter
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 search requests per minute
  message: {
    error: 'Too many search requests from this IP, please try again later.',
    code: 'SEARCH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Search rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    res.status(429).json({
      error: 'Too many search requests from this IP, please try again later.',
      code: 'SEARCH_RATE_LIMIT_EXCEEDED'
    });
  }
});

export {
  generalLimiter,
  writeLimiter,
  authLimiter,
  searchLimiter
};
