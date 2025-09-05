import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import logger from '../lib/logger.js';

// Simple in-memory user store (in production, use a database)
const users = [
  {
    id: 1,
    username: 'admin',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin'
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Basic authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('Authentication failed: No token provided', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path
    });
    return res.status(401).json({ 
      error: 'Access denied. No token provided.',
      code: 'NO_TOKEN'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Authentication failed: Invalid token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        error: err.message
      });
      return res.status(403).json({ 
        error: 'Access denied. Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }

    req.user = user;
    logger.info('User authenticated successfully', {
      userId: user.id,
      username: user.username,
      ip: req.ip,
      path: req.path
    });
    next();
  });
};

// Login endpoint
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    // Find user (in production, query database)
    const user = users.find(u => u.username === username);
    if (!user) {
      logger.warn('Login attempt with invalid username', {
        username,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password (in production, use bcrypt.compare)
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      logger.warn('Login attempt with invalid password', {
        username,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    logger.info('User logged in successfully', {
      userId: user.id,
      username: user.username,
      ip: req.ip
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(500).json({
      error: 'Internal server error',
      code: 'LOGIN_ERROR'
    });
  }
};

// Middleware to require authentication for write operations
const requireAuth = (req, res, next) => {
  // Skip auth for read operations
  if (req.method === 'GET') {
    return next();
  }

  // Require auth for write operations
  return authenticateToken(req, res, next);
};

export {
  authenticateToken,
  login,
  requireAuth
};
