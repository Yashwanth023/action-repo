# GitHub Actions Demo Repository

A comprehensive demonstration of GitHub Actions workflows and CI/CD automation for the TechStaX Developer Assessment.

## 🚀 Overview

This repository showcases advanced GitHub Actions capabilities including:
- **Continuous Integration (CI)** with automated testing
- **Continuous Deployment (CD)** with Docker containerization  
- **Webhook Integration Testing** with the companion webhook-repo
- **Security Best Practices** with secrets management
- **Multi-environment Deployment** strategies

## 📁 Repository Structure

```
action-repo/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Continuous Integration Pipeline
│       ├── deploy.yml                # Production Deployment
│       ├── test.yml                  # Comprehensive Testing Suite
│       └── webhook-trigger.yml       # Webhook Integration Testing
├── src/
│   ├── app.js                        # Express.js Application
│   ├── utils.js                      # Utility Functions
│   ├── config.js                     # Configuration Management
│   └── __tests__/
│       ├── app.test.js               # Application Tests
│       └── utils.test.js             # Utility Tests
├── docker/
│   ├── Dockerfile                    # Production Container
│   └── docker-compose.yml            # Local Development
├── scripts/
│   ├── build.sh                      # Build Script
│   ├── deploy.sh                     # Deployment Script
│   └── test.sh                       # Testing Script
├── package.json                      # Node.js Dependencies
├── .eslintrc.js                      # ESLint Configuration
├── .gitignore                        # Git Ignore Rules
└── README.md                         # This Documentation
```

## 🔄 GitHub Actions Workflows

### 1. Continuous Integration (`ci.yml`)
**Triggers**: Push to `main`, `develop` branches and Pull Requests
- Code quality checks with ESLint
- Automated testing with Jest
- Security vulnerability scanning
- Build verification
- Multi-node version testing (16, 18, 20)

### 2. Deployment Pipeline (`deploy.yml`)
**Triggers**: Push to `main` branch (production ready)
- Docker image building
- Container registry push
- Production deployment simulation
- Health checks and rollback capability

### 3. Testing Suite (`test.yml`)
**Triggers**: Manual dispatch, scheduled runs
- Unit tests with coverage reporting
- Integration tests
- Performance testing
- Code quality metrics

### 4. Webhook Integration (`webhook-trigger.yml`)
**Triggers**: Scheduled (every 6 hours), manual dispatch
- Automated webhook testing
- Integration with webhook-repo
- Event simulation and verification
- Cross-repository communication

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Quick Start
```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/action-repo
cd action-repo

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run with Docker
docker-compose up
```

### Environment Variables
Create `.env` file:
```bash
NODE_ENV=development
PORT=3000
WEBHOOK_URL=https://your-webhook-repo-url.com
API_KEY=your-api-key
LOG_LEVEL=info
```

## 📊 Application Features

### Express.js API Server
- **Health Check Endpoint**: `/health` - Application status monitoring
- **Metrics Endpoint**: `/metrics` - Performance and usage statistics  
- **GitHub Integration**: `/github` - Webhook event simulation
- **Status Dashboard**: `/` - Real-time application status

### Utility Functions
- **Logger**: Structured logging with multiple levels
- **Config Manager**: Environment-aware configuration
- **HTTP Client**: Axios-based API communication
- **Validator**: Input validation and sanitization

## 🧪 Testing Strategy

### Unit Tests
```bash
npm run test:unit          # Run unit tests
npm run test:coverage      # Generate coverage report
npm run test:watch         # Watch mode for development
```

### Integration Tests
```bash
npm run test:integration   # API endpoint testing
npm run test:e2e          # End-to-end testing
```

### Performance Tests
```bash
npm run test:performance   # Load testing
npm run test:security     # Security scanning
```

## 🐳 Docker Configuration

### Production Container
```bash
# Build production image
docker build -f docker/Dockerfile -t action-repo:latest .

# Run container
docker run -p 3000:3000 action-repo:latest
```

### Development Environment
```bash
# Start development stack
docker-compose -f docker/docker-compose.yml up

# View logs
docker-compose logs -f app
```

## 🔐 Security Features

### Secrets Management
- **API Keys**: Stored in GitHub Secrets
- **Environment Variables**: Secure configuration
- **Docker Secrets**: Container-level security
- **Code Scanning**: Automated vulnerability detection

### Best Practices
- **Input Validation**: All endpoints validate input
- **Rate Limiting**: API rate limiting implementation
- **CORS Configuration**: Proper cross-origin setup
- **Security Headers**: Helmet.js integration

## 📈 Monitoring & Observability

### Health Checks
- **Application Health**: `/health` endpoint
- **Database Status**: Connection monitoring
- **External Dependencies**: API availability checks
- **Resource Usage**: Memory and CPU metrics

### Logging
- **Structured Logging**: JSON formatted logs
- **Log Levels**: Debug, Info, Warn, Error
- **Request Tracing**: Request ID tracking
- **Error Tracking**: Comprehensive error logging

## 🚀 Deployment Strategies

### Staging Environment
- Triggered on: Push to develop branch
- Automated deployment to staging
- Smoke tests execution
- Performance benchmarking
- Security scanning

### Production Environment
- Triggered on: Push to main branch
- Blue-green deployment strategy
- Health checks before traffic routing
- Automatic rollback on failure
- Post-deployment verification

## 📋 GitHub Actions Configuration

### Required Secrets
Configure these in GitHub repository settings:

```bash
WEBHOOK_URL          # URL of webhook-repo deployment
DOCKER_USERNAME      # Docker Hub username
DOCKER_PASSWORD      # Docker Hub password
DEPLOY_KEY          # SSH key for deployment
API_TOKEN           # Authentication token
SLACK_WEBHOOK       # Slack notifications (optional)
```

### Workflow Status Badges
Add to your README:
```markdown
![CI](https://github.com/YOUR_USERNAME/action-repo/workflows/CI/badge.svg)
![Deploy](https://github.com/YOUR_USERNAME/action-repo/workflows/Deploy/badge.svg)
![Tests](https://github.com/YOUR_USERNAME/action-repo/workflows/Tests/badge.svg)
```

## 🔗 Integration with webhook-repo

### Automated Testing
The webhook-trigger workflow automatically:
1. Sends test events to webhook-repo
2. Verifies event processing
3. Checks database persistence
4. Validates API responses
5. Reports integration status

### Test Scenarios
```javascript
// Push event simulation
{
  "repository": {"name": "action-repo"},
  "commits": [{"id": "abc123", "message": "CI/CD update"}],
  "ref": "refs/heads/main"
}

// Pull request simulation
{
  "action": "opened",
  "pull_request": {"number": 42, "title": "Feature implementation"},
  "repository": {"name": "action-repo"}
}
```

## 📚 Learning Objectives

This repository demonstrates:
- **GitHub Actions Mastery**: Advanced workflow configuration
- **CI/CD Best Practices**: Automated testing and deployment
- **Docker Containerization**: Production-ready containers
- **Security Implementation**: Secrets and security scanning
- **Monitoring Setup**: Health checks and observability
- **Cross-Repository Integration**: Communication between services

## 🎯 TechStaX Assessment Compliance

### ✅ Requirements Met
- **GitHub Actions Workflows**: Comprehensive CI/CD implementation
- **Code Quality**: ESLint, Prettier, comprehensive testing
- **Documentation**: Detailed README and inline comments
- **Security**: Secrets management and vulnerability scanning
- **Integration**: Webhook-repo communication testing
- **Production Ready**: Docker, monitoring, deployment strategies

### 🏆 Bonus Features
- **Multi-environment Support**: Staging and production workflows
- **Performance Testing**: Load testing and benchmarking
- **Security Scanning**: Automated vulnerability detection
- **Slack Integration**: Deployment notifications
- **Metrics Collection**: Application performance monitoring

---

**Author**: TechStaX Developer Assessment Submission  
**Date**: July 2025  
**Repository**: action-repo  
**Companion**: webhook-repo