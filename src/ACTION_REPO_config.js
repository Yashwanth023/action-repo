/**
 * Configuration Management for GitHub Actions Demo Application
 * 
 * Centralizes all configuration settings with environment-aware defaults
 * and validation for the TechStaX Developer Assessment action-repo.
 * 
 * @author TechStaX Developer Assessment
 * @date July 2025
 */

require('dotenv').config();

/**
 * Application configuration object
 * Loads configuration from environment variables with sensible defaults
 */
const config = {
  // Server configuration
  port: parseInt(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Logging configuration
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Security configuration
  corsOrigins: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:5000', 'https://localhost:3000'],
    
  // API configuration
  apiTimeout: parseInt(process.env.API_TIMEOUT) || 10000, // 10 seconds
  maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb',
  
  // Rate limiting
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100, // requests per window
  
  // External services
  webhookUrl: process.env.WEBHOOK_URL || 'https://your-webhook-repo.replit.app',
  
  // GitHub integration
  githubToken: process.env.GITHUB_TOKEN || null,
  githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET || null,
  
  // Monitoring and health checks
  healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
  metricsRetention: parseInt(process.env.METRICS_RETENTION) || 86400000, // 24 hours in ms
  
  // Docker and deployment
  containerName: process.env.CONTAINER_NAME || 'action-repo',
  deploymentEnvironment: process.env.DEPLOYMENT_ENV || 'development',
  
  // Performance monitoring
  performanceMonitoring: process.env.PERFORMANCE_MONITORING === 'true',
  
  // Feature flags
  features: {
    webhookTesting: process.env.FEATURE_WEBHOOK_TESTING !== 'false',
    metricsCollection: process.env.FEATURE_METRICS !== 'false',
    securityScanning: process.env.FEATURE_SECURITY_SCAN !== 'false',
    performanceTesting: process.env.FEATURE_PERFORMANCE_TEST !== 'false'
  },
  
  // Database configuration (if needed in future)
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'action_repo',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true'
  },
  
  // Notification configuration
  notifications: {
    slack: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL || null,
      channel: process.env.SLACK_CHANNEL || '#deployments',
      enabled: process.env.SLACK_NOTIFICATIONS === 'true'
    },
    email: {
      enabled: process.env.EMAIL_NOTIFICATIONS === 'true',
      smtpHost: process.env.SMTP_HOST || null,
      smtpPort: parseInt(process.env.SMTP_PORT) || 587,
      smtpUser: process.env.SMTP_USER || null,
      smtpPassword: process.env.SMTP_PASSWORD || null
    }
  }
};

/**
 * Environment-specific configuration overrides
 */
const environmentConfig = {
  development: {
    logLevel: 'debug',
    corsOrigins: ['*'], // Allow all origins in development
    performanceMonitoring: false,
    features: {
      webhookTesting: true,
      metricsCollection: true,
      securityScanning: false,
      performanceTesting: false
    }
  },
  
  staging: {
    logLevel: 'info',
    performanceMonitoring: true,
    features: {
      webhookTesting: true,
      metricsCollection: true,
      securityScanning: true,
      performanceTesting: true
    }
  },
  
  production: {
    logLevel: 'warn',
    performanceMonitoring: true,
    features: {
      webhookTesting: true,
      metricsCollection: true,
      securityScanning: true,
      performanceTesting: false // Disable in production
    }
  }
};

/**
 * Apply environment-specific overrides
 */
if (environmentConfig[config.nodeEnv]) {
  Object.assign(config, environmentConfig[config.nodeEnv]);
  
  // Deep merge features object
  if (environmentConfig[config.nodeEnv].features) {
    Object.assign(config.features, environmentConfig[config.nodeEnv].features);
  }
}

/**
 * Configuration validation
 * Ensures critical configuration values are present and valid
 */
function validateConfig() {
  const errors = [];
  const warnings = [];
  
  // Validate port
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    errors.push('Invalid port number. Must be between 1 and 65535.');
  }
  
  // Validate environment
  const validEnvironments = ['development', 'staging', 'production'];
  if (!validEnvironments.includes(config.nodeEnv)) {
    warnings.push(`Unknown environment '${config.nodeEnv}'. Expected: ${validEnvironments.join(', ')}`);
  }
  
  // Validate timeout values
  if (config.apiTimeout < 1000) {
    warnings.push('API timeout is less than 1 second. This may cause issues.');
  }
  
  // Validate rate limiting
  if (config.rateLimitMax < 1) {
    errors.push('Rate limit max must be at least 1 request.');
  }
  
  // Check webhook URL format
  if (config.webhookUrl && !config.webhookUrl.startsWith('http')) {
    warnings.push('Webhook URL should start with http:// or https://');
  }
  
  // Production-specific validations
  if (config.nodeEnv === 'production') {
    if (!config.githubWebhookSecret) {
      warnings.push('GitHub webhook secret not configured for production.');
    }
    
    if (config.corsOrigins.includes('*')) {
      warnings.push('CORS allows all origins in production. Consider restricting.');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get configuration summary for logging/debugging
 */
function getConfigSummary() {
  return {
    environment: config.nodeEnv,
    port: config.port,
    logLevel: config.logLevel,
    webhookUrl: config.webhookUrl ? config.webhookUrl.replace(/\/\/.*@/, '//***@') : null,
    features: config.features,
    rateLimiting: {
      window: config.rateLimitWindow / 1000 / 60, // minutes
      maxRequests: config.rateLimitMax
    },
    corsOrigins: config.corsOrigins.length,
    performanceMonitoring: config.performanceMonitoring
  };
}

/**
 * Check if a feature is enabled
 * @param {string} featureName - Name of the feature to check
 * @returns {boolean} Whether the feature is enabled
 */
function isFeatureEnabled(featureName) {
  return config.features[featureName] === true;
}

/**
 * Get database connection string (if database is configured)
 * @returns {string|null} Database connection string or null
 */
function getDatabaseUrl() {
  if (!config.database.host || !config.database.name) {
    return null;
  }
  
  const auth = config.database.user && config.database.password ? 
    `${config.database.user}:${config.database.password}@` : '';
  
  const ssl = config.database.ssl ? '?ssl=true' : '';
  
  return `postgresql://${auth}${config.database.host}:${config.database.port}/${config.database.name}${ssl}`;
}

// Export configuration and utilities
module.exports = {
  ...config,
  validateConfig,
  getConfigSummary,
  isFeatureEnabled,
  getDatabaseUrl
};