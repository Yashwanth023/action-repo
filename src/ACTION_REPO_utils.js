/**
 * Utility Functions for GitHub Actions Demo Application
 * 
 * Provides logging, validation, metrics, and helper functions
 * for the TechStaX Developer Assessment action-repo.
 * 
 * @author TechStaX Developer Assessment
 * @date July 2025
 */

const winston = require('winston');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

/**
 * Configure Winston logger with structured logging
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level: level.toUpperCase(),
        message,
        ...meta
      });
    })
  ),
  defaultMeta: {
    service: 'action-repo',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File transport for production logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.json()
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.json()
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

/**
 * Validate webhook payload structure
 * Ensures webhook payloads meet expected GitHub format standards
 * 
 * @param {Object} payload - Webhook payload to validate
 * @param {string} eventType - Type of GitHub event (push, pull_request, etc.)
 * @returns {Object} Validation result with valid flag and errors array
 */
function validateWebhookPayload(payload, eventType) {
  const errors = [];
  
  // Basic payload structure validation
  if (!payload || typeof payload !== 'object') {
    errors.push('Payload must be a valid JSON object');
    return { valid: false, errors };
  }

  // Event type specific validation
  switch (eventType) {
    case 'push':
      if (!payload.repository) {
        errors.push('Push events require repository information');
      }
      if (!payload.ref) {
        errors.push('Push events require ref (branch) information');
      }
      break;

    case 'pull_request':
      if (!payload.pull_request) {
        errors.push('Pull request events require pull_request object');
      }
      if (!payload.action) {
        errors.push('Pull request events require action field');
      }
      break;

    case 'issues':
      if (!payload.issue) {
        errors.push('Issue events require issue object');
      }
      break;

    default:
      logger.warn('Unknown event type for validation', { eventType });
  }

  // Repository validation (common for most events)
  if (payload.repository && (!payload.repository.name || !payload.repository.full_name)) {
    errors.push('Repository object must include name and full_name');
  }

  const isValid = errors.length === 0;
  
  logger.debug('Webhook payload validation completed', {
    eventType,
    valid: isValid,
    errorCount: errors.length,
    payloadKeys: Object.keys(payload)
  });

  return {
    valid: isValid,
    errors,
    eventType,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate comprehensive application metrics
 * Collects performance, usage, and health metrics for monitoring
 * 
 * @param {Object} baseMetrics - Base metrics object from application
 * @returns {Object} Comprehensive metrics data
 */
function generateMetrics(baseMetrics) {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    // Application metrics
    application: {
      name: 'action-repo',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      pid: process.pid
    },
    
    // Performance metrics
    performance: {
      uptime: Math.floor(baseMetrics.uptime() / 1000),
      startTime: baseMetrics.startTime.toISOString(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024) // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        userPercent: Math.round((cpuUsage.user / 1000000) * 100) / 100,
        systemPercent: Math.round((cpuUsage.system / 1000000) * 100) / 100
      }
    },
    
    // Usage metrics
    usage: {
      totalRequests: baseMetrics.requests,
      totalErrors: baseMetrics.errors,
      errorRate: baseMetrics.requests > 0 ? 
        Math.round((baseMetrics.errors / baseMetrics.requests) * 10000) / 100 : 0,
      healthChecks: baseMetrics.healthChecks,
      webhookTests: baseMetrics.webhookTests,
      lastWebhookTest: baseMetrics.lastWebhookTest
    },
    
    // Health indicators
    health: {
      status: determineHealthStatus(baseMetrics, memoryUsage),
      memoryHealthy: memoryUsage.heapUsed < (500 * 1024 * 1024), // < 500MB
      uptimeHealthy: baseMetrics.uptime() > 60000, // > 1 minute
      errorRateHealthy: baseMetrics.requests === 0 || 
        (baseMetrics.errors / baseMetrics.requests) < 0.05 // < 5% error rate
    },
    
    // Timestamps
    timestamps: {
      generated: new Date().toISOString(),
      startTime: baseMetrics.startTime.toISOString(),
      lastWebhookTest: baseMetrics.lastWebhookTest || null
    }
  };
}

/**
 * Determine overall application health status
 * Analyzes various metrics to determine if application is healthy
 * 
 * @param {Object} metrics - Application metrics
 * @param {Object} memoryUsage - Memory usage data
 * @returns {string} Health status: 'healthy', 'degraded', or 'unhealthy'
 */
function determineHealthStatus(metrics, memoryUsage) {
  const errorRate = metrics.requests > 0 ? 
    (metrics.errors / metrics.requests) : 0;
  
  const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
  
  // Unhealthy conditions
  if (errorRate > 0.1 || memoryUsageMB > 1000) { // > 10% error rate or > 1GB memory
    return 'unhealthy';
  }
  
  // Degraded conditions
  if (errorRate > 0.05 || memoryUsageMB > 500) { // > 5% error rate or > 500MB memory
    return 'degraded';
  }
  
  return 'healthy';
}

/**
 * HTTP client for making requests to external services
 * Pre-configured Axios instance with timeout and error handling
 */
const httpClient = axios.create({
  timeout: 10000, // 10 second timeout
  headers: {
    'User-Agent': 'action-repo/1.0.0',
    'Content-Type': 'application/json'
  }
});

// Add request/response interceptors for logging
httpClient.interceptors.request.use(
  (config) => {
    const requestId = uuidv4();
    config.metadata = { requestId, startTime: Date.now() };
    
    logger.debug('HTTP request initiated', {
      requestId,
      method: config.method.toUpperCase(),
      url: config.url,
      timeout: config.timeout
    });
    
    return config;
  },
  (error) => {
    logger.error('HTTP request configuration error', { error: error.message });
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  (response) => {
    const { requestId, startTime } = response.config.metadata;
    const duration = Date.now() - startTime;
    
    logger.debug('HTTP request completed', {
      requestId,
      status: response.status,
      duration,
      url: response.config.url
    });
    
    return response;
  },
  (error) => {
    const config = error.config || {};
    const { requestId, startTime } = config.metadata || {};
    const duration = startTime ? Date.now() - startTime : null;
    
    logger.error('HTTP request failed', {
      requestId,
      duration,
      url: config.url,
      status: error.response?.status,
      message: error.message
    });
    
    return Promise.reject(error);
  }
);

/**
 * Send webhook to external service
 * Utility function for sending webhooks to webhook-repo or other services
 * 
 * @param {string} url - Webhook URL
 * @param {Object} payload - Webhook payload
 * @param {Object} headers - Additional headers
 * @returns {Promise<Object>} Response from webhook endpoint
 */
async function sendWebhook(url, payload, headers = {}) {
  const requestId = uuidv4();
  
  try {
    logger.info('Sending webhook', {
      requestId,
      url,
      payloadSize: JSON.stringify(payload).length,
      headers: Object.keys(headers)
    });

    const response = await httpClient.post(url, payload, {
      headers: {
        'X-Request-ID': requestId,
        'X-GitHub-Event': headers['X-GitHub-Event'] || 'ping',
        'X-GitHub-Delivery': requestId,
        ...headers
      }
    });

    logger.info('Webhook sent successfully', {
      requestId,
      status: response.status,
      responseSize: JSON.stringify(response.data).length
    });

    return {
      success: true,
      status: response.status,
      data: response.data,
      requestId
    };

  } catch (error) {
    logger.error('Webhook sending failed', {
      requestId,
      url,
      error: error.message,
      status: error.response?.status
    });

    return {
      success: false,
      error: error.message,
      status: error.response?.status || 0,
      requestId
    };
  }
}

/**
 * Format timestamp to human-readable string
 * Consistent timestamp formatting across the application
 * 
 * @param {Date|string} timestamp - Timestamp to format
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(timestamp) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toISOString();
}

/**
 * Generate unique request ID
 * Creates unique identifiers for request tracing
 * 
 * @returns {string} Unique request ID
 */
function generateRequestId() {
  return uuidv4();
}

/**
 * Validate environment configuration
 * Ensures required environment variables are present
 * 
 * @returns {Object} Validation result
 */
function validateEnvironment() {
  const required = ['NODE_ENV'];
  const optional = ['PORT', 'LOG_LEVEL', 'WEBHOOK_URL'];
  const missing = [];
  const present = [];

  // Check required variables
  required.forEach(key => {
    if (process.env[key]) {
      present.push(key);
    } else {
      missing.push(key);
    }
  });

  // Check optional variables
  optional.forEach(key => {
    if (process.env[key]) {
      present.push(key);
    }
  });

  const isValid = missing.length === 0;

  logger.info('Environment validation completed', {
    valid: isValid,
    present: present.length,
    missing: missing.length,
    missingVars: missing
  });

  return {
    valid: isValid,
    missing,
    present,
    total: required.length + optional.length
  };
}

// Export utility functions
module.exports = {
  logger,
  validateWebhookPayload,
  generateMetrics,
  determineHealthStatus,
  httpClient,
  sendWebhook,
  formatTimestamp,
  generateRequestId,
  validateEnvironment
};