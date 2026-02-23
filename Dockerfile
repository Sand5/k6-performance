# --------------------------------------------------
# Base image: Official k6 image from Grafana
# This image already contains the k6 binary
# --------------------------------------------------
FROM grafana/k6:latest

# --------------------------------------------------
# Switch to root user so we can install Node.js
# (The base k6 image does not include Node)
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
# Set working directory inside container
# All following commands run from /app
# --------------------------------------------------
WORKDIR /app

# --------------------------------------------------
# Copy package.json + package-lock.json first
# This improves Docker layer caching
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
# IMPORTANT:
# The official k6 image defines:
# ENTRYPOINT ["k6"]
# This causes Docker to run everything through k6.
# We override it so we can run shell commands instead.
# --------------------------------------------------
ENTRYPOINT []

# --------------------------------------------------
# Default command:
# 1. Start mock API in background
# 2. Wait until localhost:3000 is ready
# 3. Run k6 smoke test
#
# Using JSON array format (recommended by Docker)
# --------------------------------------------------
CMD ["sh", "-c", "npm run mock:api & npx wait-on http://localhost:3000 && npm run k6:smoke"]