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
├── basic-k6/
│   ├── breakpoint-test.js         # Breakpoint / capacity discovery test
│   ├── custom-metrics.js          # Examples of custom k6 metrics
│   ├── first-script.js            # Intro / learning k6 script
│   ├── load-test.js               # Basic load test example
│   ├── scenarios.js               # Scenario configuration examples
│   ├── smoke-test.js              # Basic smoke test example
│   ├── soak-test.js               # Long-running soak test example
│   ├── spike-test.js              # Sudden traffic spike test example
│   ├── stress-test.js             # Stress test to find system limits
│   └── system-tags.js             # k6 system tags examples
├── http-k6/
│   ├── env-var.js                 # Environment variable usage example
│   ├── http-get.js                # HTTP GET request example
│   ├── http-post.js               # HTTP POST request example
│   └── random-item.js             # Randomized test data example
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

-t k6-tests gives the image a friendly name.

2. Run this in the same directory as your Dockerfile.

3. Run smoke test (with mock API + dashboard)
docker run --rm -it k6-tests

The default CMD in your Dockerfile runs:
npm run mock:api & wait-on http://localhost:3000 && npm run k6:smoke

So it:

1. Starts the mock API

2. Waits for it to be ready

3. Runs the K6 smoke test with HTML report + dashboard

4. --rm removes the container when done.

5. -it keeps it interactive (you see logs live).

Optional: Run other test types

Option A – override CMD at runtime:
docker run --rm -it k6-tests sh -c "npm run mock:api & wait-on http://localhost:3000 && npm run k6:load"


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