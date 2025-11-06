# Stage 1: Compile and Build angular codebase
FROM node:20-bullseye AS build

# Build argument for Angular configuration (production, uat, development)
ARG BUILD_CONFIGURATION=production

WORKDIR /usr/local/app

# Install Chrome for running tests using modern GPG method
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    libnss3 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxrandr2 \
    libgbm-dev \
    libasound2 \
    libfontconfig1 \
    libgtk-3-0 \
    --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN=/usr/bin/google-chrome-stable

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies with clean install for reproducible builds
RUN npm ci --prefer-offline --no-audit --verbose

# Copy application source
COPY . .

# Build with the specified configuration
RUN npx ng build --configuration=$BUILD_CONFIGURATION --verbose

# incase above does not work in prod 
#RUN if [ "$BUILD_CONFIGURATION" = "production" ]; then \
#        npx ng build --verbose; \
#    else \
#        npx ng build --configuration=$BUILD_CONFIGURATION --verbose; \
#    fi

# Stage 2a: Python runtime image (for production deployment)
FROM python:3.11-slim AS runtime-production

WORKDIR /usr/local/app/dist/parts-website/browser/

COPY --from=build /usr/local/app/dist/parts-website/browser/ ./

# Create user and install dependencies in one layer to reduce image size
RUN useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1000 ubuntu \
    && apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y curl openssh-client sshpass wget --no-install-recommends \
    && pip install --no-cache-dir paramiko==3.5.1 pysftp \
    && mkdir /scripts/ \
    && cd /scripts \
    && wget -q https://raw.githubusercontent.com/bduke-dev/scripts/main/delete_remote_files.py \
    && wget -q https://raw.githubusercontent.com/bduke-dev/scripts/main/upload_directory.py \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python3 -c "import os; exit(0 if os.path.exists('index.html') else 1)"

# Stage 2b: Nginx runtime image (for UAT/static serving)
FROM nginx:1.27-alpine AS runtime-uat

# Install wget for health check
RUN apk add --no-cache wget

# Copy custom nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=build /usr/local/app/dist/parts-website/browser /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80
