# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:lts AS builder

# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

RUN npm install 
RUN npx ng build 
    
# The runtime image, used to just run the code provided its virtual environment
FROM python:3.12-slim AS runtime

RUN  useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1000 ubuntu

WORKDIR /usr/local/app/dist/parts-website/browser/

# Copy virtual env from previous step
COPY --from=builder /usr/local/app/dist/parts-website/browser/ ./

RUN apt update \
    && apt upgrade -y \
    && apt install curl sshpass wget -y \
    && pip install pysftp \
    && mkdir /scripts/ \
    && cd /scripts \
    && wget https://raw.githubusercontent.com/bduke-dev/scripts/main/delete_remote_files.py \
    && wget https://raw.githubusercontent.com/bduke-dev/scripts/main/upload_directory.py