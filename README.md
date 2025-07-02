# GitHub Actions Demo Repository

A comprehensive demonstration of GitHub Actions workflows and CI/CD automation for the TechStaX Developer Assessment.

## 🚀 Overview

This repository showcases advanced GitHub Actions capabilities including:
- **Continuous Integration (CI)** with automated testing
- **Continuous Deployment (CD)** with Docker containerization  
- **Webhook Integration Testing** with the companion webhook-repo
- **Security Best Practices** with secrets management
- **Multi-environment Deployment** strategies

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



