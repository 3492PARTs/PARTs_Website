# Stage 1: Compile and Build angular codebase
FROM node:20-bullseye AS build

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

# Build
RUN npx ng build --verbose

# Stage 2: Runtime image
FROM python:3.11-slim AS runtime

WORKDIR /usr/local/app/dist/parts-website/browser/

COPY --from=builder /usr/local/app/dist/parts-website/browser/ ./

# Create user and install dependencies in one layer to reduce image size
RUN useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1000 ubuntu \
    && apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y curl sshpass wget --no-install-recommends \
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