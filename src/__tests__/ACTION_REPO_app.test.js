/**
 * Test Suite for GitHub Actions Demo Application
 * Comprehensive testing for TechStaX Developer Assessment action-repo
 * 
 * @author TechStaX Developer Assessment
 * @date July 2025
 */

const request = require('supertest');
const app = require('../src/app');

describe('GitHub Actions Demo Application', () => {
  
  describe('Health and Status Endpoints', () => {
    
    test('GET / should return application status', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
        
      expect(response.body).toHaveProperty('application', 'GitHub Actions Demo');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('features');
      expect(response.body).toHaveProperty('endpoints');
    });
    
    test('GET /health should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
        
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('checks');
      expect(response.body).toHaveProperty('metrics');
      
      // Verify checks structure
      expect(response.body.checks).toHaveProperty('application', 'pass');
      expect(response.body.checks).toHaveProperty('memory');
      expect(response.body.checks).toHaveProperty('dependencies');
    });
    
    test('GET /metrics should return application metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);
        
      expect(response.body).toHaveProperty('application');
      expect(response.body).toHaveProperty('performance');
      expect(response.body).toHaveProperty('usage');
      expect(response.body).toHaveProperty('health');
      expect(response.body).toHaveProperty('timestamps');
      
      // Verify application info
      expect(response.body.application).toHaveProperty('name', 'action-repo');
      expect(response.body.application).toHaveProperty('version', '1.0.0');
      
      // Verify performance metrics
      expect(response.body.performance).toHaveProperty('memory');
      expect(response.body.performance).toHaveProperty('cpu');
      expect(response.body.performance.memory).toHaveProperty('heapUsed');
      expect(response.body.performance.memory).toHaveProperty('heapTotal');
    });
    
  });
  
  describe('API Endpoints', () => {
    
    test('GET /api/github should return GitHub integration info', async () => {
      const response = await request(app)
        .get('/api/github')
        .expect(200);
        
      expect(response.body).toHaveProperty('purpose');
      expect(response.body).toHaveProperty('repository', 'action-repo');
      expect(response.body).toHaveProperty('workflows');
      expect(response.body).toHaveProperty('features');
      expect(response.body).toHaveProperty('webhookEndpoint', '/api/webhook/test');
      
      // Verify workflows array
      expect(Array.isArray(response.body.workflows)).toBe(true);
      expect(response.body.workflows.length).toBeGreaterThan(0);
      
      // Verify features
      expect(response.body.features).toHaveProperty('automated_testing', true);
      expect(response.body.features).toHaveProperty('docker_build', true);
      expect(response.body.features).toHaveProperty('security_scan', true);
    });
    
    test('GET /api/status should return API status', async () => {
      const response = await request(app)
        .get('/api/status')
        .expect(200);
        
      expect(response.body).toHaveProperty('api_version', '1.0.0');
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body).toHaveProperty('rate_limits');
      
      // Verify endpoints status
      const endpoints = response.body.endpoints;
      expect(endpoints.health).toHaveProperty('status', 'active');
      expect(endpoints.metrics).toHaveProperty('status', 'active');
      expect(endpoints.github).toHaveProperty('status', 'active');
      expect(endpoints.webhook_test).toHaveProperty('status', 'active');
    });
    
  });
  
  describe('Webhook Testing Endpoints', () => {
    
    test('POST /api/webhook/test should handle push webhook simulation', async () => {
      const webhookPayload = {
        event_type: 'push',
        payload: {
          repository: {
            name: 'test-repo',
            full_name: 'user/test-repo'
          },
          pusher: {
            name: 'Test User'
          },
          ref: 'refs/heads/main'
        }
      };
      
      const response = await request(app)
        .post('/api/webhook/test')
        .send(webhookPayload)
        .expect(200);
        
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Webhook test completed successfully');
      expect(response.body).toHaveProperty('event_type', 'push');
      expect(response.body).toHaveProperty('payload');
      expect(response.body).toHaveProperty('simulation', true);
    });
    
    test('POST /api/webhook/test should handle pull request webhook simulation', async () => {
      const webhookPayload = {
        event_type: 'pull_request',
        payload: {
          action: 'opened',
          pull_request: {
            number: 42,
            title: 'Test PR'
          },
          repository: {
            name: 'test-repo'
          }
        }
      };
      
      const response = await request(app)
        .post('/api/webhook/test')
        .send(webhookPayload)
        .expect(200);
        
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('event_type', 'pull_request');
    });
    
    test('POST /api/webhook/test should validate webhook payload', async () => {
      const invalidPayload = {
        event_type: 'push',
        payload: {
          // Missing required fields
        }
      };
      
      const response = await request(app)
        .post('/api/webhook/test')
        .send(invalidPayload)
        .expect(400);
        
      expect(response.body).toHaveProperty('error', 'Invalid webhook payload');
      expect(response.body).toHaveProperty('details');
    });
    
  });
  
  describe('Error Handling', () => {
    
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);
        
      expect(response.body).toHaveProperty('error', 'Route not found');
      expect(response.body).toHaveProperty('available_endpoints');
      expect(Array.isArray(response.body.available_endpoints)).toBe(true);
    });
    
    test('should handle malformed JSON in POST requests', async () => {
      const response = await request(app)
        .post('/api/webhook/test')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });
    
  });
  
  describe('Security Headers', () => {
    
    test('should include security headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);
        
      // Check for Helmet security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
    
    test('should include request ID in response headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
        
      expect(response.headers).toHaveProperty('x-request-id');
      expect(response.body).toHaveProperty('requestId');
      expect(response.headers['x-request-id']).toBe(response.body.requestId);
    });
    
  });
  
  describe('Performance and Metrics', () => {
    
    test('should track request metrics', async () => {
      // Make a few requests to increment metrics
      await request(app).get('/health');
      await request(app).get('/metrics');
      
      const response = await request(app)
        .get('/metrics')
        .expect(200);
        
      expect(response.body.usage.totalRequests).toBeGreaterThan(0);
      expect(response.body.usage.healthChecks).toBeGreaterThan(0);
    });
    
    test('should report memory usage in metrics', async () => {
      const response = await request(app)
        .get('/metrics')
        .expect(200);
        
      const memory = response.body.performance.memory;
      expect(typeof memory.heapUsed).toBe('number');
      expect(typeof memory.heapTotal).toBe('number');
      expect(memory.heapUsed).toBeGreaterThan(0);
      expect(memory.heapTotal).toBeGreaterThan(memory.heapUsed);
    });
    
  });
  
  describe('Health Status Determination', () => {
    
    test('should report healthy status under normal conditions', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
        
      expect(['healthy', 'degraded']).toContain(response.body.status);
      expect(response.body.checks.application).toBe('pass');
    });
    
    test('should include uptime in health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
        
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
    
  });
  
});

describe('Utility Functions Integration', () => {
  
  test('should validate webhook payloads correctly', () => {
    const { validateWebhookPayload } = require('../src/utils');
    
    // Valid push payload
    const validPushPayload = {
      repository: { name: 'test', full_name: 'user/test' },
      ref: 'refs/heads/main'
    };
    
    const pushResult = validateWebhookPayload(validPushPayload, 'push');
    expect(pushResult.valid).toBe(true);
    expect(pushResult.errors).toHaveLength(0);
    
    // Invalid push payload (missing ref)
    const invalidPushPayload = {
      repository: { name: 'test', full_name: 'user/test' }
    };
    
    const invalidResult = validateWebhookPayload(invalidPushPayload, 'push');
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });
  
  test('should generate comprehensive metrics', () => {
    const { generateMetrics } = require('../src/utils');
    
    const baseMetrics = {
      requests: 100,
      errors: 2,
      startTime: new Date(Date.now() - 60000), // 1 minute ago
      healthChecks: 10,
      webhookTests: 5,
      lastWebhookTest: new Date(),
      uptime: () => 60000 // 1 minute
    };
    
    const metrics = generateMetrics(baseMetrics);
    
    expect(metrics).toHaveProperty('application');
    expect(metrics).toHaveProperty('performance');
    expect(metrics).toHaveProperty('usage');
    expect(metrics).toHaveProperty('health');
    
    expect(metrics.usage.totalRequests).toBe(100);
    expect(metrics.usage.totalErrors).toBe(2);
    expect(metrics.usage.errorRate).toBe(2); // 2%
    expect(metrics.performance.uptime).toBe(60); // seconds
  });
  
});

// Cleanup after tests
afterAll(async () => {
  // Close any open connections, clear timers, etc.
  await new Promise(resolve => setTimeout(resolve, 100));
});