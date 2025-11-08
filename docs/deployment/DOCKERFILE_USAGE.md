# Unified Dockerfile Usage Guide

## Overview

The project now uses a single unified `Dockerfile` that supports multiple build configurations and runtime environments through Docker build arguments and multi-stage builds.

## Build Arguments

### BUILD_CONFIGURATION
Specifies which Angular build configuration to use:
- `production` (default): Production build
- `uat`: User Acceptance Testing build
- `development`: Development build

## Build Targets

The Dockerfile includes multiple runtime stages that can be selected using the `--target` flag:

### runtime-production
Python-based runtime for production deployment with SSH/SFTP capabilities.
- Base image: `python:3.11-slim`
- Includes: paramiko, pysftp, deployment scripts
- Use case: Production deployments requiring file transfer capabilities

### runtime-uat  
Nginx-based runtime for serving static files.
- Base image: `nginx:1.27-alpine`
- Includes: Custom nginx configuration
- Use case: UAT and static file serving

## Usage Examples

### Building for Production (Python runtime)
```bash
docker build \
  --build-arg BUILD_CONFIGURATION=production \
  --target runtime-production \
  -t parts-website:prod \
  .
```

### Building for UAT (Nginx runtime)
```bash
docker build \
  --build-arg BUILD_CONFIGURATION=uat \
  --target runtime-uat \
  -t parts-website:uat \
  .
```

### Building for Development (Nginx runtime)
```bash
docker build \
  --build-arg BUILD_CONFIGURATION=development \
  --target runtime-uat \
  -t parts-website:dev \
  .
```

## Docker Compose Integration

You can use build arguments in `docker-compose.yml`:

```yaml
services:
  parts_website_prod:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        BUILD_CONFIGURATION: production
      target: runtime-production
    # ... other configuration

  parts_website_uat:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        BUILD_CONFIGURATION: uat
      target: runtime-uat
    # ... other configuration
```

## Migration from Old Dockerfiles

### Old Dockerfile → New Dockerfile
```bash
# Old way
docker build -f Dockerfile -t parts-website:prod .

# New way
docker build --build-arg BUILD_CONFIGURATION=production --target runtime-production -t parts-website:prod .
```

### Old Dockerfile.uat → New Dockerfile
```bash
# Old way
docker build -f Dockerfile.uat -t parts-website:uat .

# New way
docker build --build-arg BUILD_CONFIGURATION=uat --target runtime-uat -t parts-website:uat .
```

## Benefits

1. **Single Source of Truth**: Build stage is defined once, eliminating duplication
2. **Easy Maintenance**: Updates to dependencies, Chrome installation, etc. only need to be made in one place
3. **Flexibility**: Supports multiple build configurations and runtime environments
4. **Consistency**: Ensures all builds use the same base configuration
5. **Clear Intent**: Build arguments and targets explicitly declare the build purpose

## Build Stage Details

The build stage (common to all configurations):
1. Uses Node.js 20 on Debian Bullseye
2. Installs Chrome for testing
3. Installs npm dependencies with `npm ci`
4. Builds the Angular application with the specified configuration
5. Produces build artifacts in `/usr/local/app/dist/parts-website/browser/`

## Runtime Stage Details

### Python Runtime
- Working directory: `/usr/local/app/dist/parts-website/browser/`
- Includes deployment scripts from bduke-dev/scripts repository
- Health check: Verifies `index.html` exists
- User: ubuntu (uid 1000)

### Nginx Runtime
- Serves files from: `/usr/share/nginx/html`
- Uses custom nginx configuration from `nginx.conf`
- Health check: HTTP request to localhost
- Exposed port: 80

## Troubleshooting

### Build fails with "configuration not found"
Ensure the `BUILD_CONFIGURATION` value matches one of the configurations in `angular.json`:
- production
- uat
- development

### Wrong runtime stage selected
Make sure you specify the correct `--target` flag:
- Use `runtime-production` for production deployments
- Use `runtime-uat` for UAT and static serving

### nginx.conf not found
The `runtime-uat` target requires `nginx.conf` to be present in the repository root.
