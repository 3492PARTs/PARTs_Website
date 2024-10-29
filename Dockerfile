# Stage 1: Compile and Build angular codebase

# Use official node image as the base image
FROM ubuntu:22.04

RUN curl -sL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh && bash /tmp/nodesource_setup.sh

RUN apt update && apt upgrade -y && apt install nodejs npm lftp -y
# Set the working directory
WORKDIR /usr/local/app

# Add the source code to app
COPY ./ /usr/local/app/

# Install all the dependencies
RUN npm install

# Generate the build of the application
RUN npx ng build --configuration=uat
# npm run build --configuration=uat

