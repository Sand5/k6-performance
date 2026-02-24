# K6 Performance Test Suite

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

Example: docker-compose up -d mock-local
docker run --rm -v $(pwd)/k6-tests/reports:/app/k6-tests/reports -e ENV=local k6-tests sh -c "npx wait-on http://mock-local:3000 && npm run k6:smoke"
docker-compose down

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