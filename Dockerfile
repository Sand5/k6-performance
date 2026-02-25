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

# --------------------------------------------------
# Default command:
# 1. Start mock API in background
# 2. Wait until localhost:3000 is ready
# 3. Run k6 smoke test
# --------------------------------------------------
CMD ["sh", "-c", "json-server --watch db.json --port 3000 & npx wait-on http://localhost:3000 && npm run k6:smoke"]