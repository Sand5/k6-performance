# K6 Performance Testing Framework

[![K6 Smoke Test](https://github.com/Sand5/k6-performance/actions/workflows/k6.yml/badge.svg?branch=main)](https://github.com/Sand5/k6-performance/actions/workflows/k6.yml)

![Node.js](https://img.shields.io/badge/node-20.x-brightgreen?logo=node.js)

![Last Commit](https://img.shields.io/github/last-commit/Sand5/k6-performance)

[![Docker Image](https://img.shields.io/badge/docker-ready-blue?logo=docker)](https://hub.docker.com/)

A containerised API performance testing framework built with [Grafana k6](https://k6.io/), [Docker](https://www.docker.com/) and [GitHub Actions](https://github.com/features/actions).

The framework supports **smoke, load and spike testing** against a JSON Server mock REST API, with environment-specific configuration, reusable test scenarios, performance thresholds, HTML reports and automated CI execution.

## Project Structure

```text
k6_performance/
├── .github/
│   └── workflows/
│       └── k6.yml     # GitHub Actions CI workflow for k6 tests
├── .vscode/
│   └── settings.json              # VS Code workspace settings
├── k6-tests/                      # Main structured test framework
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
├── Dockerfile                     # Container definition for running k6 tests
├── docker-compose.yml             # Multi-container setup for local execution
├── createReportsDir.js            # Ensures reports directory exists before runs
├── eslint.config.mjs              # ESLint configuration
├── .gitignore                     # Git ignore rules (node_modules, reports, etc.)
├── README.md                      # Project documentation
├── package-lock.json              # npm dependency lock file
└── package.json                   # npm scripts and dependencies
```

## How to Run Tests

### 1. Install Dependencies

Install the project dependencies:

```bash
npm install
```

Ensure that k6 is installed and available on your system if running tests directly without Docker.

### 2. Start the Mock API

Open a terminal and start JSON Server:

```bash
npm run mock:api
```

This starts the mock REST API at `http://localhost:3000`.

To suppress mock API console output, use:

```bash
npm run mock:api:quiet
```

Keep the mock API running while executing your performance tests.

### 3. Run Performance Tests

Open a second terminal and run one of the following:

#### Smoke Test

```bash
npm run k6:smoke
```

Generates `k6-tests/reports/smoke-report.html`.

#### Load Test

```bash
npm run k6:load
```

Generates `k6-tests/reports/load-report.html`.

#### Spike Test

```bash
npm run k6:spike
```

Generates `k6-tests/reports/spike-report.html`.

Each command enables the k6 web dashboard and exports an HTML report.

### 4. CI Reports

When executed through GitHub Actions, the smoke test generates an HTML report that is uploaded as a workflow artifact.

The report can be downloaded from the GitHub Actions workflow run summary.

## Docker

Docker allows the framework to run without installing k6 or Node.js directly on your machine.

### 1. Build the Docker Image

From the project root directory, run:

```bash
docker build -t k6-tests .
```

This builds the Docker image using the project's `Dockerfile`.

### 2. Run the Smoke Test with the Mock API

Run the mock API and k6 smoke test inside a single container:

```bash
docker run --rm -it \
  -p 3000:3000 \
  -p 5665:5665 \
  -v "$(pwd)/k6-tests/reports:/app/k6-tests/reports" \
  k6-tests \
  sh -c 'npm run mock:api & npx wait-on http://localhost:3000 && npm run k6:smoke'
```

**What happens:**

1. JSON Server starts inside the container on port `3000`.
2. `wait-on` waits until the mock API is ready.
3. k6 executes the smoke test against the mock API.
4. The HTML report is saved to `k6-tests/reports/smoke-report.html` on your machine.
5. The container is automatically removed after execution.

**Ports:**

| Port | Purpose |
| --- | --- |
| `3000` | Mock API |
| `5665` | k6 web dashboard |

The k6 dashboard is enabled during the test. To access it from the host machine, the dashboard must listen on `0.0.0.0` inside the container.

The Dockerfile does not define a default `CMD`. The test command is supplied explicitly using `docker run`.

## Running Tests with Docker Compose

Docker Compose runs the mock API and k6 test runner in separate containers connected through a Docker network.

### Local Environment

**1. Build and start the local mock API:**

```bash
docker compose up --build -d mock-local
```

The local mock API runs on port `3000`.

**2. Execute the local smoke test:**

```bash
docker compose run --rm k6-local
```

This executes `smoke.test.js` with `ENV=local` and `DOCKER=true`, targeting `http://mock-local:3000`.

**3. Stop and remove the containers:**

```bash
docker compose down
```

### QA Environment

**1. Build and start the QA mock API:**

```bash
docker compose up --build -d mock-qa
```

The QA mock API runs on port `4000`.

**2. Execute the QA smoke test:**

```bash
docker compose run --rm k6-qa
```

This executes `smoke.test.js` with `ENV=qa` and `DOCKER=true`, targeting `http://mock-qa:4000`.

**3. Stop and remove the containers:**

```bash
docker compose down
```

### Test Reports

Both environments generate the HTML report at:

```text
k6-tests/reports/smoke-report.html
```

The report is saved locally through the Docker Compose volume mount.

**Note:** Running the QA smoke test after the local smoke test overwrites the existing smoke report because both environments use the same filename.

Docker Compose waits for the corresponding mock API to pass its health check before starting the k6 test runner.

## Dockerfile vs Docker Compose

The **Dockerfile** defines how the Docker image is built, including the k6 runtime, Node.js, npm and required dependencies.

The Dockerfile does not specify a default `CMD`. Instead, the command to execute is provided explicitly when starting a container.

**Docker Compose** defines and manages the services required for testing, including the mock API and k6 test runners.

It provides:

- Separate local and QA environments.
- Docker networking between the mock API and k6 containers.
- Health checks to ensure the mock API is ready before tests begin.
- Volume mounts to save generated HTML reports locally.

Use `docker build` and `docker run` for standalone container execution, or `docker compose` to orchestrate the mock API and test runner as separate services.

## Why Docker?

Docker provides a consistent, reproducible environment for running performance tests.

Key benefits include:

- **Consistency:** Runs k6 and its dependencies in a containerised environment.
- **Reproducibility:** Reduces differences between developers' machines and CI environments.
- **Isolation:** Keeps the mock API and k6 test runner separate when using Docker Compose.
- **CI/CD integration:** Supports automated performance testing through GitHub Actions.
- **Portability:** Allows the framework to run on any machine with a compatible Docker installation.

## Standard Checks

The framework uses reusable `standardChecks` to validate API responses during performance tests.

These checks include:

- **HTTP status:** Verifies that responses return a successful status code (200–299).
- **Response time:** Checks that responses complete within 500 ms.
- **Failure logging:** Logs unsuccessful requests to the console to assist with debugging.

These checks help identify functional failures alongside performance issues.

## Custom Metrics

The framework uses custom k6 metrics to monitor API performance and track test activity.

| Metric | Type | Description |
| --- | --- | --- |
| `custom_error_rate` | Counter | Tracks errors recorded during test execution. |
| `custom_requests_count` | Counter | Counts requests tracked by the framework. |
| `login_duration` | Trend | Measures login-related request durations. |

### Example Metric Definitions

The metrics are defined using the k6 metrics API:

```javascript
import { Counter, Trend } from 'k6/metrics';

export const loginDuration = new Trend('login_duration');
export const errorRate = new Counter('custom_error_rate');
export const requestsCount = new Counter('custom_requests_count');
```

The custom metrics complement k6's built-in measurements, such as `http_req_duration`, `http_req_failed` and `http_reqs`.

Performance thresholds are used to determine whether response-time requirements have been met.

## Notes

- **DELETE responses:** The mock API returns HTTP `200` for successful DELETE requests rather than `204`. The framework's checks account for this behaviour.
- **Running tests locally:** Start the mock API before executing k6 tests directly with npm.
- **Running tests with Docker:** The standalone Docker command starts the mock API and test runner in the same container.
- **Running tests with Docker Compose:** The mock API and k6 runner execute in separate containers, with health checks ensuring the API is ready before testing.

## Mock API (JSON Server)

This framework uses [JSON Server](https://github.com/typicode/json-server) to provide a lightweight REST API for performance testing without requiring an external backend service.

JSON Server reads the test data from `k6-tests/db.json` and exposes REST endpoints for API testing.

The mock API supports CRUD operations (Create, Read, Update and Delete), allowing k6 to execute smoke, load and spike tests against a controlled environment.

### Environment Configuration

| Environment | Port | Docker Hostname | Docker Compose Support |
| --- | --- | --- | --- |
| Local | `3000` | `mock-local` | Yes |
| QA | `4000` | `mock-qa` | Yes |
| Prod | `5000` | `mock-prod` | Not currently configured |

The framework's `environments.js` supports local, QA and prod environment URLs.

However, the current `docker-compose.yml` defines mock API and k6 runner services for **local and QA only**. A `mock-prod` service would need to be added before running the prod environment through Docker Compose.

### Mock API Execution

- **Local npm execution:** JSON Server runs directly on the host machine.
- **Standalone Docker:** JSON Server and k6 run inside the same container.
- **Docker Compose:** JSON Server and k6 run in separate containers connected through a Docker network.

**Important:** JSON Server is a mock API, not a production backend. Performance results demonstrate the framework's testing capabilities and should not be interpreted as representative of a real production application's performance.
