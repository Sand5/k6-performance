# --------------------------------------------------
# Base image: Official k6 image from Grafana
# This image already contains the k6 binary
# --------------------------------------------------
FROM grafana/k6:latest

# --------------------------------------------------
# Switch to root user to install Node.js and global packages
# --------------------------------------------------
USER root

# --------------------------------------------------
# Install Node.js + npm
# Required for:
# - json-server (mock API)
# - wait-on
# - running npm scripts
# --------------------------------------------------
RUN apk add --no-cache nodejs npm

# --------------------------------------------------
# Install json-server globally so mock APIs can run without prompt
# --------------------------------------------------
RUN npm install -g json-server

# --------------------------------------------------
# Set working directory inside container
# All following commands run from /app
# --------------------------------------------------
WORKDIR /app

# --------------------------------------------------
# Copy package.json + package-lock.json first
# Improves Docker layer caching
# --------------------------------------------------
COPY package*.json ./

# --------------------------------------------------
# Install dependencies using clean install
# (Uses package-lock.json for reproducibility)
# --------------------------------------------------
RUN npm ci

# --------------------------------------------------
# Copy the rest of the project files
# (k6 tests, config, scripts, etc.)
# --------------------------------------------------
COPY . .

# --------------------------------------------------
# Expose ports:
# 3000 -> json-server mock API
# 5665 -> k6 web dashboard
# --------------------------------------------------
EXPOSE 3000 5665

# --------------------------------------------------
# Override entrypoint to allow shell commands
# --------------------------------------------------
ENTRYPOINT []

# --------------------------------------------------
# Default command:
# 1. Start mock API in background
# 2. Wait until localhost:3000 is ready
# 3. Run k6 smoke test
# --------------------------------------------------
CMD ["sh", "-c", "npm run mock:api & npx wait-on http://localhost:3000 && npm run k6:smoke"]