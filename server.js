import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';

import logger from './lib/logger.js';
import swaggerSpecs from './lib/swagger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

import profileRoutes from './routes/profile.js';
import queryRoutes from './routes/queries.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
app.use(generalLimiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Me-API Playground Documentation'
}));

// Auth routes removed

// API Routes
app.use('/api/profile', profileRoutes);
app.use('/api', queryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server started successfully`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    healthCheck: `http://localhost:${PORT}/health`,
    apiBaseUrl: `http://localhost:${PORT}/api`,
    apiDocs: `http://localhost:${PORT}/api-docs`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
