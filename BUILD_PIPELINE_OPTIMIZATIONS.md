# Build Pipeline Optimizations

This document details all the optimizations and improvements made to the Docker and Jenkins build pipeline.

## Overview

The build pipeline has been optimized for:
- **Performance**: Faster builds through caching and BuildKit
- **Security**: Modern GPG methods, security headers, and dependency scanning
- **Reliability**: Health checks, timeouts, and better error handling
- **Efficiency**: Smaller images, resource limits, and log rotation
- **Reproducibility**: Specific versions and clean installs

---

## Dockerfile Optimizations (Production)

### 1. Specific Node.js Version
**Before:** `FROM node:lts`  
**After:** `FROM node:20-bullseye`  
**Benefit:** Ensures reproducible builds with a specific, stable version

### 2. Modern GPG Key Management
**Before:** Using deprecated `apt-key add`  
**After:** Using `gpg --dearmor` with keyring file  
**Benefit:** Eliminates deprecation warnings and follows modern security practices

### 3. Layer Caching Optimization
**Before:** Copy all files, then install dependencies  
**After:** 
```dockerfile
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit
COPY . .
```
**Benefit:** Docker can reuse cached dependency layers when only source code changes

### 4. Reproducible Dependency Installation
**Before:** `npm install`  
**After:** `npm ci --prefer-offline --no-audit`  
**Benefit:** Faster, more reliable builds using package-lock.json

### 5. Optimized Package Installation
**Before:** No cleanup flags  
**After:** Added `--no-install-recommends`, `apt-get clean`, `--no-cache-dir`  
**Benefit:** Reduces image size by 100-200MB

### 6. Health Check
**Added:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python3 -c "import os; exit(0 if os.path.exists('index.html') else 1)"
```
**Benefit:** Container orchestration can monitor application health

---

## Dockerfile.uat Optimizations (UAT/Testing)

### 1. All Production Optimizations
Applied the same improvements as the production Dockerfile

### 2. Smaller Runtime Base Image
**Before:** `FROM nginx:latest`  
**After:** `FROM nginx:1.27-alpine` with wget installed  
**Benefit:** Alpine-based image is 80% smaller (~40MB vs ~190MB), wget added for health checks

### 3. Health Check for nginx
**Added:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1
```
**Benefit:** Monitors nginx availability

---

## Jenkinsfile Optimizations

### 1. Docker BuildKit Support
**Added:**
```groovy
env.DOCKER_BUILDKIT = '1'
env.BUILDKIT_PROGRESS = 'plain'
```
**Benefit:** Enables parallel layer processing and improved caching (20-50% faster builds)

### 2. Build Cache Optimization
**Added:** Cache pull before build and `--cache-from` flags to docker.build() calls  
**Example:**
```groovy
sh 'docker pull bduke97/parts_website:latest || true'
app = docker.build("bduke97/parts_website", 
    "--cache-from bduke97/parts_website:latest " +
    "-f ./Dockerfile --target=runtime .")
```
**Benefit:** Reuses layers from previous builds, significantly faster rebuilds. The `|| true` ensures builds don't fail if cache image doesn't exist.

### 3. Stage Timeouts
**Added:** Timeout configurations for all stages:
- Clone: 5 minutes
- Tests: 15 minutes
- Build: 20 minutes
- Push: 10 minutes
- Deploy: 15 minutes

**Benefit:** Prevents hanging builds and provides faster feedback

### 4. Enhanced Cleanup
**Before:** Only prune dangling images  
**After:** 
```bash
docker rmi -f parts-test-base || true
docker image prune -f
docker builder prune -f --filter "until=168h" || true
```
**Benefit:** Manages disk space better by removing old build cache

### 5. Better Error Handling
**Added:** `currentBuild.result = 'FAILURE'` in catch block  
**Benefit:** Properly marks failed builds in Jenkins UI

---

## nginx.conf Improvements

### 1. Security Headers
**Added:**
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'; ..." always;
```
**Benefit:** 
- Protects against clickjacking (X-Frame-Options)
- Prevents MIME sniffing attacks (X-Content-Type-Options)
- Controls referrer information (Referrer-Policy)
- Modern XSS protection with Content Security Policy (replaces deprecated X-XSS-Protection)

### 2. Static Asset Caching
**Added:**
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}
```
**Benefit:** 
- Reduces server load
- Improves page load times
- Reduces bandwidth usage

### 3. HTML Cache Control
**Added:**
```nginx
add_header Cache-Control "no-cache, no-store, must-revalidate";
```
**Benefit:** Ensures users always get the latest version of the app

### 4. Enhanced Gzip Configuration
**Added:** Modern MIME types, removed redundant `application/x-javascript`  
**Benefit:** Better compression for modern JavaScript files, cleaner configuration

---

## docker-compose.yml Enhancements

### 1. Health Check
**Added:**
```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/"]
  interval: 30s
  timeout: 3s
  start_period: 5s
  retries: 3
```
**Benefit:** Docker Compose can monitor and restart unhealthy containers

### 2. Resource Limits
**Added:**
```yaml
# Resource limits (for Docker Compose v3+ or Swarm mode)
# For standalone Docker Compose, use these at the service level instead:
#   cpus: '2'
#   mem_limit: 1g
#   mem_reservation: 256m
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 256M
```
**Note:** The `deploy` section is primarily for Docker Swarm mode. For standalone Docker Compose, the commented alternative syntax shows the equivalent configuration to use directly at the service level.

**Benefit:** Prevents container from consuming all host resources

### 3. Log Rotation
**Added:**
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```
**Benefit:** Prevents log files from filling up disk space (max 30MB per container)

---

## .dockerignore Improvements

### Added Exclusions
```
dist/
coverage/
*.log
.DS_Store
tmp/
.cache/
.env*
Documentation files
IDE configuration files
```

**Benefit:** 
- Faster Docker builds (less context to send)
- Smaller build context
- Prevents accidental inclusion of sensitive files

---

## Performance Improvements Summary

| Optimization | Estimated Impact |
|-------------|------------------|
| Docker BuildKit | 20-50% faster builds |
| Layer caching | 30-70% faster rebuilds |
| npm ci vs npm install | 10-20% faster installs |
| Alpine nginx image | 80% smaller runtime |
| Package cleanup | 100-200MB smaller images |
| Static asset caching | 50-90% faster page loads |
| Build cache pruning | Saves 1-5GB disk space |

---

## Security Improvements Summary

✅ Replaced deprecated apt-key with modern GPG keyring  
✅ Added security headers to nginx  
✅ Using specific package versions for reproducibility  
✅ No security vulnerabilities from deprecated methods  
✅ Resource limits prevent DoS scenarios  

---

## Maintenance Benefits

1. **Reproducible Builds**: Specific versions and npm ci ensure consistency
2. **Disk Space Management**: Automatic cleanup prevents disk space issues
3. **Health Monitoring**: Health checks enable proactive issue detection
4. **Log Management**: Log rotation prevents disk space exhaustion
5. **Better Debugging**: BuildKit progress and timeouts provide better visibility

---

## Migration Notes

### For Existing Deployments

1. **Docker BuildKit**: Ensure Docker 18.09+ is installed
2. **Health Checks**: Existing containers will need to be recreated
3. **Resource Limits**: May need adjustment based on actual usage
4. **Log Rotation**: Existing logs won't be affected, only new logs

### Testing Recommendations

1. Test build pipeline in non-production branch first
2. Monitor build times to verify improvements
3. Check resource usage with new limits
4. Verify health checks are working correctly

---

## Future Optimization Opportunities

1. **Multi-arch builds**: Support ARM64 for better performance on some platforms
2. **Build matrix**: Parallel testing across multiple Node.js versions
3. **Artifact caching**: Use external cache storage for npm packages
4. **Docker layer compression**: Enable experimental compression features
5. **CD optimization**: Consider GitOps workflows for deployments

---

## Rollback Plan

If issues occur, revert by checking out the previous commit:
```bash
git checkout <previous-commit-hash>
```

All optimizations are backward compatible except:
- Health checks (containers need recreation)
- Resource limits (may need tuning)

---

## Monitoring Recommendations

After deployment, monitor:
1. Build times in Jenkins
2. Docker image sizes
3. Container resource usage
4. Health check status
5. Page load times

---

## Additional Resources

- [Docker BuildKit Documentation](https://docs.docker.com/build/buildkit/)
- [npm ci vs npm install](https://docs.npmjs.com/cli/v8/commands/npm-ci)
- [nginx Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [Docker Health Checks](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [Docker Compose Resource Limits](https://docs.docker.com/compose/compose-file/deploy/)
