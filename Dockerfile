# Stage 1: Compile and Build angular codebase
FROM node:lts AS builder

WORKDIR /usr/local/app

# Install Chrome for running tests
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

ENV CHROME_BIN=/usr/bin/google-chrome-stable

COPY ./ /usr/local/app/

RUN npm install \
    && npm run test:ci \
    && npx ng build

# Stage 2: Runtime image
FROM python:3.11-slim AS runtime

WORKDIR /usr/local/app/dist/parts-website/browser/

COPY --from=builder /usr/local/app/dist/parts-website/browser/ ./

RUN  useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1000 ubuntu \
    && apt update \
    && apt upgrade -y \
    && apt install curl sshpass wget -y \
    && pip install paramiko==3.5.1  pysftp \
    && mkdir /scripts/ \
    && cd /scripts \
    && wget https://raw.githubusercontent.com/bduke-dev/scripts/main/delete_remote_files.py \
    && wget https://raw.githubusercontent.com/bduke-dev/scripts/main/upload_directory.py