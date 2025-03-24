# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM node:lts as build

ENV VIRTUAL_ENV=/venv
ENV PATH=/venv/bin:$PATH

# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

RUN apt update \
    && apt upgrade -y \
    && apt install curl python3 python3-pip python3-venv -y \
    && python3 -m venv /venv \
    && pip install pysftp \
    && apt install sshpass wget -y \
    && npm install \
    && npx ng build \
    && mkdir /scripts/ \
    && cd /scripts \
    && wget https://raw.githubusercontent.com/bduke-dev/scripts/main/delete_remote_files.py \
    && wget https://raw.githubusercontent.com/bduke-dev/scripts/main/upload_directory.py
    
