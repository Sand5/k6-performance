# K6 Performance Test Suite

This project contains performance tests for your API using [k6](https://k6.io/).

# Project Structure
```text
k6_performance/
├─ k6-tests/
│  ├─ tests/
│  │  └─ smoke.test.js          # Main k6 test script
│  └─ reports/                  # Generated test reports (ignored by Git)
├─ utils/
│  ├─ checks.js                 # Standard checks for responses
│  └─ metrics.js                # Custom metrics like errorRate and requestsCount
├─ config/
│  └─ environments.js           # Environment-specific base URLs
├─ createReportsDir.js          # Script to create the reports folder
├─ package.json                 # npm project config
├─ README.md                    # Project documentation
└─ .gitignore                   # Git ignore file (ignores node_modules, reports, basic-k6, http-k6)


DELETE requests are expected to return 200 instead of 204 due to API behavior.

Make sure your server is running locally before running the tests.
```

# How to Run Tests

1. Install dependencies:
npm install

2. Run the smoke test with dashboard:
npm run k6:smoke

This will generate a report in k6-tests/reports/smoke-report.html and launch a local K6 dashboard.

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