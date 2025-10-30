# Jenkins Build Process

This document explains how the Jenkins CI/CD pipeline works for the PARTs Website.

## Overview

The Jenkins pipeline builds and deploys the PARTs Website differently based on the branch:

- **Main branch**: Runs tests in Docker, builds production image, deploys to production
- **UAT branches**: Runs tests natively on Jenkins node, builds UAT image, deploys to UAT environment

## Pipeline Stages

### 1. Clone Repository
Checks out the source code from GitHub.

### 2. GitHub Status Update
Posts pending status to the GitHub commit using the GitHub API.

### 3. Run Tests (UAT Only)
**Only runs for non-main branches.**

```groovy
stage('Run Tests') {
    if (env.BRANCH_NAME != 'main') {
        sh '''
            npm ci
            npm run test:ci
        '''
    }
}
```

**Key Points:**
- Tests run **natively on the Jenkins node** (not in Docker)
- Uses `npm ci` for clean, reproducible dependency installation
- Runs headless Chrome tests with code coverage
- Must pass before Docker build proceeds

### 4. Build Image

**Main Branch:**
- Builds production Docker image from `Dockerfile`
- Tests run inside Docker during build
- Targets the `runtime` stage for deployment

**UAT Branches:**
- Builds UAT Docker image from `Dockerfile.uat`
- Tests already completed in previous stage
- Lighter image (no Chrome dependencies)

### 5. Push Image (UAT Only)
Pushes UAT images to Docker Hub with branch name as tag.

### 6. Deploy

**Main Branch:**
- Deploys to production server (vhost90-public.wvnet.edu)
- Uses Python scripts to upload files via SFTP

**UAT Branches:**
- Deploys to UAT server via Docker Compose
- Uses SSH to pull and restart containers

### 7. GitHub Status Update (Final)
Posts success or failure status to GitHub.

## Test Execution Changes

### Old Approach (Problematic)
Tests were run inside Docker containers with Chrome:

```groovy
def testImage = docker.build("parts-test-base", "-f ./Dockerfile.uat --target=build .") 
testImage.inside("--shm-size=2gb -u 0") {
    sh 'CHROME_BIN=/usr/bin/google-chrome-stable ./node_modules/.bin/ng test ...'
}
```

**Problems:**
- Docker shared memory issues (`--shm-size` workaround needed)
- Chrome sandbox permission errors (`--no-sandbox` required)
- Complex Docker configuration
- Slow build times
- Unreliable test results

### New Approach (Current)
Tests run directly on the Jenkins node:

```groovy
sh '''
    npm ci
    npm run test:ci
'''
```

**Benefits:**
- ✅ No Docker/Chrome compatibility issues
- ✅ Faster execution
- ✅ Simpler configuration
- ✅ More reliable results
- ✅ Smaller Docker images
- ✅ Easier to debug

## Jenkins Agent Requirements

For the new approach, the Jenkins agent must have:

1. **Node.js** (LTS version)
   ```bash
   node --version  # Should be v20.x or later
   ```

2. **npm**
   ```bash
   npm --version  # Should be v10.x or later
   ```

3. **Chrome/Chromium**
   ```bash
   google-chrome --version  # or chromium-browser --version
   ```

## Docker Images

### Production Image (`Dockerfile`)
- Based on `node:lts` for build
- Includes Chrome for running tests during build
- Tests run as part of `RUN npm install && npm run test:ci && npx ng build`
- Final stage uses `python:3.11-slim` with deployment scripts

### UAT Image (`Dockerfile.uat`)
- Based on `node:lts` for build
- **No Chrome** (tests run outside Docker)
- Just builds the Angular app: `RUN npm install && npx ng build --configuration=uat`
- Final stage uses `nginx:latest` to serve static files

## Environment Variables

The pipeline sets these environment variables:

- `BUILD_DATE`: Current date in `yyyy.MM.dd` format
- `BUILD_NO`: Jenkins build display name
- `FORMATTED_BRANCH_NAME`: Branch name with `/` replaced by `-`
- `SHA`: Git commit SHA
- `RESULT`: Build result (success/error)

For UAT builds, these values are substituted into `src/environments/environment.uat.ts`:
- `BRANCH` → `$FORMATTED_BRANCH_NAME`
- `VERSION` → `$SHA`

## Troubleshooting

### Tests Failing on Jenkins but Passing Locally

1. **Check Chrome installation:**
   ```bash
   which google-chrome-stable
   google-chrome-stable --version
   ```

2. **Check Node.js version:**
   ```bash
   node --version
   npm --version
   ```

3. **Test manually on Jenkins agent:**
   ```bash
   cd /path/to/workspace
   npm ci
   npm run test:ci
   ```

### Docker Build Failing

1. **Check Dockerfile syntax:**
   ```bash
   docker build -f Dockerfile.uat --no-cache .
   ```

2. **Verify environment variables:**
   ```bash
   echo $FORMATTED_BRANCH_NAME
   echo $SHA
   ```

### Deployment Failing

1. **Check SSH connectivity:**
   ```bash
   ssh brandon@192.168.1.41 "echo connected"
   ```

2. **Check Docker Compose:**
   ```bash
   TAG=test-branch docker compose config
   ```

## Best Practices

1. **Always run tests locally** before pushing to avoid build failures
2. **Use `npm ci`** instead of `npm install` for reproducible builds
3. **Keep Docker images small** by only including necessary dependencies
4. **Monitor build times** and optimize slow stages
5. **Check Jenkins logs** for detailed error information

## References

- [Jenkinsfile](./Jenkinsfile)
- [Dockerfile](./Dockerfile) - Production build
- [Dockerfile.uat](./Dockerfile.uat) - UAT build
- [Testing Guide](./TESTING.md) - How to run tests locally
