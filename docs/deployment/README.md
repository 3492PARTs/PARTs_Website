# Deployment Documentation

This directory contains documentation for building, deploying, and running the PARTs Website application.

## 📄 Documents

### [Dockerfile Usage](./DOCKERFILE_USAGE.md)
Guide for using the unified Dockerfile:
- Build arguments (`BUILD_CONFIGURATION`)
- Runtime targets (production vs UAT)
- Usage examples for different environments
- Docker Compose integration
- Migration from old Dockerfiles
- Build stage and runtime stage details
- Troubleshooting common issues

**When to read**: When building Docker images or deploying the application.

### [Build Pipeline Optimizations](./BUILD_PIPELINE_OPTIMIZATIONS.md)
Comprehensive documentation of CI/CD improvements:
- Unified Dockerfile architecture
- Docker BuildKit support
- Build cache optimization
- Stage timeouts
- nginx.conf security improvements
- docker-compose.yml enhancements
- .dockerignore improvements
- Performance metrics and benefits
- Security improvements
- Monitoring recommendations

**When to read**: When working on the build pipeline, CI/CD, or investigating performance issues.

## 🚀 Quick Deployment Guide

### Local Development
```bash
# Run locally without Docker
npm install
npm start
```

### Docker Builds

#### Production Build (Python runtime)
```bash
docker build \
  --build-arg BUILD_CONFIGURATION=production \
  --target runtime-production \
  -t parts-website:prod \
  .
```

#### UAT Build (Nginx runtime)
```bash
docker build \
  --build-arg BUILD_CONFIGURATION=uat \
  --target runtime-uat \
  -t parts-website:uat \
  .
```

#### Development Build
```bash
docker build \
  --build-arg BUILD_CONFIGURATION=development \
  --target runtime-uat \
  -t parts-website:dev \
  .
```

### Using Docker Compose
```bash
docker-compose up -d
```

## 🏗️ Build Configurations

| Configuration | Use Case | Runtime | Build Command |
|--------------|----------|---------|---------------|
| `production` | Production deployment | Python | `ng build --configuration production` |
| `uat` | User acceptance testing | Nginx | `ng build --configuration uat` |
| `development` | Development/testing | Nginx | `ng build --configuration development` |

## 📦 Artifacts

Build artifacts are stored in:
- **Local builds**: `dist/parts-website/browser/`
- **Docker builds**: `/usr/local/app/dist/parts-website/browser/` (production) or `/usr/share/nginx/html` (UAT)

## 🔗 Related Documentation

- [Development Guide](../development/CONTRIBUTING.md) - Development workflow
- [Architecture Overview](../architecture/README.md) - Application structure
- [Main README](../../README.md) - Project overview

## 🔧 Environment Variables

The application uses environment files located in `src/environments/`:
- `environment.ts` - Production
- `environment.development.ts` - Development
- `environment.uat.ts` - UAT

See [Environment Configuration](../../src/environments/README.md) for details.

## 🚢 CI/CD Pipeline

The project uses Jenkins for CI/CD with the following stages:
1. **Clone**: Checkout code
2. **Test**: Run unit tests
3. **Build**: Build Docker image with appropriate configuration
4. **Push**: Push to Docker registry
5. **Deploy**: Deploy to target environment

See [BUILD_PIPELINE_OPTIMIZATIONS.md](./BUILD_PIPELINE_OPTIMIZATIONS.md) for pipeline details and optimizations.

## 📊 Performance Metrics

| Optimization | Impact |
|-------------|--------|
| Docker BuildKit | 20-50% faster builds |
| Layer caching | 30-70% faster rebuilds |
| npm ci vs npm install | 10-20% faster installs |
| Alpine nginx image | 80% smaller runtime |
| Static asset caching | 50-90% faster page loads |

## 🔒 Security Features

- Security headers in nginx configuration
- Modern GPG key management
- No deprecated apt-key usage
- Resource limits to prevent DoS
- Health checks for monitoring
- HTTPS support in production
