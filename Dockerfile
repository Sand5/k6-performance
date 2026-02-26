# --------------------------------------------------
# Base image: Official k6 image from Grafana
# --------------------------------------------------
FROM grafana/k6:latest

# --------------------------------------------------
# Switch to root to install Node.js + npm
# --------------------------------------------------
USER root

# Install Node.js + npm + curl
RUN apk add --no-cache nodejs npm curl

# Install global packages: json-server + wait-on
RUN npm install -g json-server wait-on

# --------------------------------------------------
# Set working directory
# --------------------------------------------------
WORKDIR /app

# --------------------------------------------------
# Copy package.json + package-lock.json for layer caching
# --------------------------------------------------
COPY package*.json ./

# Install project dependencies
RUN npm ci

# --------------------------------------------------
# Copy the rest of the project files
# --------------------------------------------------
COPY . .

# --------------------------------------------------
# Expose ports:
# 3000 -> json-server mock API
# 5665 -> k6 dashboard (if used)
# --------------------------------------------------
EXPOSE 3000 5665

# --------------------------------------------------
# Use shell entrypoint
# --------------------------------------------------
ENTRYPOINT []
