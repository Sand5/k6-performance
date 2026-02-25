# --------------------------------------------------
# Base image: Official k6 image from Grafana
# --------------------------------------------------
FROM grafana/k6:latest

# --------------------------------------------------
# Switch to root to install Node.js + npm
# --------------------------------------------------
USER root

# Install Node.js + npm
RUN apk add --no-cache nodejs npm

# Install json-server globally
RUN npm install -g json-server 

# Set working directory
WORKDIR /app

# Copy package.json + package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the project files
COPY . .

# Expose ports
EXPOSE 3000 5665

# Use entrypoint as shell
ENTRYPOINT []

# Default command: start mock API in foreground
CMD ["json-server", "--watch", "db.json", "--port", "3000"]