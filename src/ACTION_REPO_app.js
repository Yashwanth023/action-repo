/**
 * GitHub Actions Demo Application
 * Express.js server for TechStaX Developer Assessment
 * 
 * Features:
 * - Health monitoring endpoints
 * - GitHub webhook simulation
 * - Performance metrics collection
 * - Comprehensive logging and error handling
 * 
 * @author TechStaX Developer Assessment
 * @date July 2025
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const logger = require('./utils').logger;
const config = require('./config');
const { validateWebhookPayload, generateMetrics } = require('./utils');

// Initialize Express application
const app = express();
const PORT = config.port || 3000;

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

// CORS configuration for cross-origin requests
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing and compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim(), { component: 'http' })
  }
}));

// Request ID middleware for tracing
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  logger.debug('Request received', {
    requestId: req.id,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent')
  });
  next();
});

/**
 * Application metrics storage
 * In production, this would be stored in Redis or a metrics database
 */
const metrics = {
  requests: 0,
  errors: 0,
  startTime: new Date(),
  webhookTests: 0,
  lastWebhookTest: null,
  healthChecks: 0,
  uptime: () => Date.now() - metrics.startTime.getTime()
};

/**
 * Root endpoint - Application status dashboard
 */
app.get('/', (req, res) => {
  metrics.requests++;
  
  const status = {
    application: 'GitHub Actions Demo',
    version: '1.0.0',
    environment: config.nodeEnv,
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(metrics.uptime() / 1000),
    requestId: req.id,
    features: [
      'Health monitoring',
      'Webhook simulation',
      'Performance metrics',
      'CI/CD integration',
      'Security best practices'
    ],
    endpoints: {
      health: '/health',
      metrics: '/metrics',
      github: '/api/github',
      webhook: '/api/webhook/test'
    }
  };

  logger.info('Status dashboard accessed', {
    requestId: req.id,
    userAgent: req.get('User-Agent')
  });

  res.json(status);
});

/**
 * Health check endpoint
 * Provides comprehensive health status for monitoring systems
 */
app.get('/health', (req, res) => {
  metrics.requests++;
  metrics.healthChecks++;
  
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(metrics.uptime() / 1000),
    version: '1.0.0',
    environment: config.nodeEnv,
    requestId: req.id,
    checks: {
      application: 'pass',
      memory: process.memoryUsage().heapUsed < 500 * 1024 * 1024 ? 'pass' : 'warn',
      cpu: process.cpuUsage(),
      dependencies: {
        webhookReceiver: 'unknown', // Would check webhook-repo availability
        database: 'not_applicable',
        external_apis: 'pass'
      }
    },
    metrics: {
      totalRequests: metrics.requests,
      errors: metrics.errors,
      healthChecks: metrics.healthChecks,
      webhookTests: metrics.webhookTests
    }
  };

  // Determine overall health status
  const hasWarnings = Object.values(healthStatus.checks).includes('warn') ||
                     Object.values(healthStatus.checks.dependencies).includes('warn');
  
  if (hasWarnings) {
    healthStatus.status = 'degraded';
  }

  const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
  
  logger.info('Health check performed', {
    requestId: req.id,
    status: healthStatus.status,
    uptime: healthStatus.uptime
  });

  res.status(statusCode).json(healthStatus);
});

/**
 * Metrics endpoint for monitoring and observability
 */
app.get('/metrics', (req, res) => {
  metrics.requests++;
  
  const metricsData = generateMetrics(metrics);
  
  logger.debug('Metrics requested', {
    requestId: req.id,
    metricsSnapshot: metricsData
  });

  res.json(metricsData);
});

/**
 * GitHub integration endpoint
 * Simulates GitHub webhook events for testing
 */
app.get('/api/github', (req, res) => {
  metrics.requests++;
  
  const githubInfo = {
    purpose: 'GitHub Actions integration testing',
    repository: 'action-repo',
    workflows: [
      'Continuous Integration',
      'Production Deployment', 
      'Webhook Integration Testing',
      'Security Scanning'
    ],
    features: {
      automated_testing: true,
      docker_build: true,
      security_scan: true,
      webhook_testing: true,
      cross_repo_integration: true
    },
    webhookEndpoint: '/api/webhook/test',
    requestId: req.id,
    timestamp: new Date().toISOString()
  };

  res.json(githubInfo);
});

/**
 * Webhook simulation endpoint
 * Simulates sending webhooks to the webhook-repo for testing
 */
app.post('/api/webhook/test', async (req, res) => {
  metrics.requests++;
  metrics.webhookTests++;
  metrics.lastWebhookTest = new Date();
  
  const { target_url, event_type = 'push', payload = {} } = req.body;
  
  try {
    // Validate webhook payload
    const validationResult = validateWebhookPayload(payload, event_type);
    if (!validationResult.valid) {
      metrics.errors++;
      return res.status(400).json({
        error: 'Invalid webhook payload',
        details: validationResult.errors,
        requestId: req.id
      });
    }

    // Default webhook payload for testing
    const defaultPayload = {
      repository: {
        name: 'action-repo',
        full_name: 'techstax/action-repo'
      },
      pusher: {
        name: 'GitHub Actions Bot'
      },
      head_commit: {
        id: uuidv4().substring(0, 7),
        message: 'Automated test from action-repo',
        author: {
          name: 'GitHub Actions',
          email: 'actions@github.com'
        }
      },
      ref: 'refs/heads/main'
    };

    const webhookPayload = { ...defaultPayload, ...payload };
    
    // Log webhook test attempt
    logger.info('Webhook test initiated', {
      requestId: req.id,
      targetUrl: target_url || 'not_specified',
      eventType: event_type,
      payloadSize: JSON.stringify(webhookPayload).length
    });

    // In a real scenario, we would send this to the webhook-repo
    // For demo purposes, we simulate the response
    const simulatedResponse = {
      success: true,
      message: 'Webhook test completed successfully',
      event_type,
      payload: webhookPayload,
      target_url: target_url || config.webhookUrl,
      timestamp: new Date().toISOString(),
      requestId: req.id,
      simulation: true,
      note: 'This is a simulated response. In production, this would send to webhook-repo.'
    };

    res.json(simulatedResponse);

  } catch (error) {
    metrics.errors++;
    
    logger.error('Webhook test failed', {
      requestId: req.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Webhook test failed',
      message: error.message,
      requestId: req.id,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * API status endpoint
 */
app.get('/api/status', (req, res) => {
  metrics.requests++;
  
  const apiStatus = {
    api_version: '1.0.0',
    status: 'operational',
    endpoints: {
      health: { status: 'active', path: '/health' },
      metrics: { status: 'active', path: '/metrics' },
      github: { status: 'active', path: '/api/github' },
      webhook_test: { status: 'active', path: '/api/webhook/test' }
    },
    rate_limits: {
      requests_per_window: 100,
      window_duration: '15 minutes',
      current_usage: metrics.requests % 100
    },
    last_webhook_test: metrics.lastWebhookTest,
    total_webhook_tests: metrics.webhookTests,
    requestId: req.id,
    timestamp: new Date().toISOString()
  };

  res.json(apiStatus);
});

/**
 * 404 handler for undefined routes
 */
app.use('*', (req, res) => {
  metrics.requests++;
  metrics.errors++;
  
  logger.warn('Route not found', {
    requestId: req.id,
    method: req.method,
    url: req.url
  });

  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`,
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /metrics',
      'GET /api/github',
      'GET /api/status',
      'POST /api/webhook/test'
    ],
    requestId: req.id,
    timestamp: new Date().toISOString()
  });
});

/**
 * Global error handler
 */
app.use((error, req, res, next) => {
  metrics.errors++;
  
  logger.error('Unhandled application error', {
    requestId: req.id,
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? error.message : 'Something went wrong',
    requestId: req.id,
    timestamp: new Date().toISOString()
  });
});

/**
 * Start server
 */
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info('GitHub Actions Demo server started', {
    port: PORT,
    environment: config.nodeEnv,
    nodeVersion: process.version,
    pid: process.pid
  });

  console.log(`
🚀 GitHub Actions Demo Server Running
📡 Port: ${PORT}
🌍 Environment: ${config.nodeEnv}
🔗 Health Check: http://localhost:${PORT}/health
📊 Metrics: http://localhost:${PORT}/metrics
🎯 GitHub Info: http://localhost:${PORT}/api/github
  `);
});

/**
 * Graceful shutdown handling
 */
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });
});

// Export for testing
module.exports = app;