# K6 Performance Testing Framework

[![K6 Smoke Test](https://github.com/Sand5/k6-performance/actions/workflows/k6.yml/badge.svg)](https://github.com/Sand5/k6-performance/actions/workflows/k6.yml)
![Node.js](https://img.shields.io/badge/node-20.x-brightgreen?logo=node.js)
![Last Commit](https://img.shields.io/github/last-commit/Sand5/k6-performance)
[![Docker Image](https://img.shields.io/badge/docker-ready-blue?logo=docker)](https://hub.docker.com/)

Containerised k6 performance testing framework using Docker Compose and GitHub Actions CI.
This project contains performance tests for your API using [k6](https://k6.io/).

# Project Structure
```text
k6_performance/
├── .github/
│   └── workflows/
│       └── k6-performance.yml     # GitHub Actions CI workflow for k6 tests
├── .vscode/
│   └── settings.json              # VS Code workspace settings
├── k6-tests/
│   ├── config/
│   │   ├── environments.js        # Environment-specific base URLs
│   │   ├── testData.js            # Shared test data and fixtures
│   │   └── thresholds.js          # Centralized k6 performance thresholds
│   ├── reports/                   # Generated k6 HTML reports (ignored by Git)
│   │   └── smoke-report.html      # Smoke test HTML report (CI artifact)
│   ├── scenarios/
│   │   ├── crud.scenario.js       # CRUD user journey scenario
│   │   └── login.scenario.js      # Login flow scenario
│   ├── tests/
│   │   ├── load.test.js           # Load test entry point
│   │   ├── smoke.test.js          # Smoke test entry point
│   │   └── spike.test.js          # Spike test entry point
│   ├── utils/
│   │   ├── checks.js              # Standard response checks (status, timing)
│   │   └── metrics.js             # Custom metrics (error rate, request count)
│   └── db.json                    # Mock / local API test data
├── .DS_Store                      # macOS system file (ignored)
├── .gitignore                     # Git ignore rules (node_modules, reports, etc.)
├── README.md                      # Project documentation
├── createReportsDir.js            # Ensures reports directory exists before runs
├── package-lock.json              # npm dependency lock file
└── package.json                   # npm scripts and dependencies


DELETE requests are expected to return 200 instead of 204 due to API behavior.

Make sure your server is running locally before running the tests.
```

# How to Run Tests

1. Install dependencies:
npm install

2. Run the smoke,spike,load test with dashboard:
npm run k6:smoke or npm run k6:smoke:local - This command also starts the sever
Generates a report in k6-tests/reports/smoke-report.html and launches a local K6 dashboard.

- Note: The mock API logs every request by default, which can be verbose.
  To reduce console output, you can run the mock API in “quiet” mode:

- npm run mock:api -- --quiet

- npm run k6:spike or npm run k6:spike:local
  Generates a report in k6-tests/reports/spike-report.html and launches a local K6 dashboard.

- npm run k6:load or npm run k6:load:local
  Generates a report in k6-tests/reports/smoke-report.html and launches a local K6 dashboard.


3. When run in CI, the smoke test generates an HTML report that is uploaded 
as a GitHub Actions artifact. Download it from the workflow run summary.

# Docker

1. Build the Docker image
docker build -t k6-tests .
(Note Run this command in the same directory as your Dockerfile.)

-t k6-tests gives the image a friendly name.


2. Run Smoke Test with Mock API (single environment)
docker run --rm -it \
  -p 3000:3000 \       # mock API
  -p 5665:5665 \       # k6 dashboard
  -v $(pwd)/k6-tests/reports:/app/k6-tests/reports \
  k6-tests

  What happens:

1. Starts the mock API (json-server) in the container
2. Waits for port 3000 to be ready
3. Runs k6 smoke test with dashboard + HTML report
4. HTML report is saved locally in k6-tests/reports
5. Container is removed automatically when finished

  or 
  docker run --rm -it -p 3000:3000 -p 5665:5665 k6-tests -
  (Reports will not saved locally and deleted from the container)

4. Run Multiple Environments with Docker Compose
# Local environment
ENV_NAME=local docker-compose up -d mock-local
docker compose run --rm -v $(pwd)/k6-tests/reports:/app/k6-tests/reports -e ENV=$ENV_NAME k6 sh -c "npx wait-on http://mock-local:3000 && npm run k6:smoke"
docker-compose down

# QA environment
ENV_NAME=qa docker-compose up -d mock-qa
docker compose run --rm -v $(pwd)/k6-tests/reports:/app/k6-tests/reports -e ENV=$ENV_NAME k6 sh -c "npx wait-on http://mock-qa:4000 && npm run k6:smoke"
docker-compose down

Notes:
mock-local → uses port 3000
mock-qa → uses port 4000
Reports are saved locally for each run under k6-tests/reports
Docker Compose ensures multiple mock APIs can run independently and be torn down after tests
Change the ENV variable to switch which environment your k6 tests target

# Default Docker Behavior
Running the Dockerfile directly runs default CMD in your Dockerfile:
npm run mock:api & wait-on http://localhost:3000 && npm run k6:smoke

# Default Docker Compose Behavior
Compose starts the mock API as a named service (e.g., mock-local or mock-qa), 
so k6 connects using the service name instead of localhost. 

# Start the mock service
This will start your local mock API container(mock-local) in detached mode so it runs in the background
docker compose up -d mock-local

# Check the status of the mock service
You can check which containers are running and there health 
docker ps
docker inspect --format='{{json .State.Health}}' mock-local

# Run k6 tests inside the container
Even though the container started,json-server may takes a second to be ready you can use wait-on inside the container
docker compose run --rm -e ENV=local -e DOCKER=true k6 \
sh -c "npx wait-on http://mock-local:3000 && npm run k6:smoke:local:docker"

# Tear down services when done
docker compose down

# Start a shell termimal inside the k6 container 
Instead of running docker compose run with a command you can start an interactive shell inside the container 
## Start mock API
docker compose up -d mock-local

## Open interactive shell in k6 container
docker compose run --rm -e ENV=local -e DOCKER=true k6 /bin/sh

## Inside the container
npx wait-on http://mock-local:3000
npm run k6:smoke

## Exit when done
exit

## Tear down services (optional)
docker compose down

# Why Docker?

Using Docker demonstrates professional best practices:

- Ensures **consistent k6 and Node.js environment** across machines  
- Allows **reproducible performance tests** without installing dependencies  
- Mirrors **real-world DevOps pipelines** (CI/CD often runs in containers)  
- Separates local development from test execution, avoiding conflicts  

# Standard Checks

All responses are validated using standardChecks:

Status code is between 200–299
Response time is less than 500ms
Logs failures to console for debugging

# Metrics

This project tracks several custom metrics in K6:

- `custom_error_rate` – counts failed requests
- `custom_requests_count` – counts total requests
- `login_duration` – Trend metric that measures login request duration

Example of how a metric is defined:

import { Trend } from 'k6/metrics';

export const loginDuration = new Trend('login_duration');
export const errorRate = new Counter('custom_error_rate');
export const requestsCount = new Counter('custom_requests_count');

# Notes 
DELETE requests are expected to return 200 instead of 204 due to API behavior. Make sure your server is running locally before running the tests.