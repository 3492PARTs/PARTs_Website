# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM ubuntu:22.04

RUN useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1000 ubuntu

RUN apt update && apt upgrade -y && apt install curl python3 python3-pip -y

RUN curl -sL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh && bash /tmp/nodesource_setup.sh

RUN apt install nodejs -y

#RUN apt install npm -y

RUN pip install pysftp

RUN apt install sshpass wget -y

RUN mkdir /scripts/
WORKDIR /scripts/
RUN wget https://raw.githubusercontent.com/bduke-dev/scripts/main/delete_remote_files.py \
    && wget https://raw.githubusercontent.com/bduke-dev/scripts/main/upload_directory.py
    
# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

# Install all the dependencies
RUN npm install

# Generate the build of the application
RUN npx ng build
# npm run build
