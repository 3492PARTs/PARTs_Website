# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM ubuntu:22.04

RUN useradd -rm -d /home/ubuntu -s /bin/bash -g root -G sudo -u 1000 ubuntu

RUN apt update && apt upgrade -y && apt install curl python3 python3-pip -y

RUN curl -sL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh && bash /tmp/nodesource_setup.sh

RUN apt install nodejs -y

#RUN apt install npm -y

RUN pip install pysftp

RUN apt install sshpass -y
# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

# Install all the dependencies
RUN npm install

# Generate the build of the application
RUN npx ng build --configuration=uat
# npm run build

RUN rm -r ./node_modules

RUN ls -la
