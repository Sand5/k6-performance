import http from "k6/http";
import { users as localUsers } from "../config/testData.js";
import { loginChecks, standardChecks } from "../utils/checks.js";
import {
  apiOperationDuration,
  errorRate,
  requestsCount,
} from "../utils/metrics.js";
import { BASE_URL, CURRENT_ENV } from "../config/environments.js";

export function loginScenario(baseUrl = BASE_URL) {
  // Log which environment and URL we're running against
  console.log(`Running loginScenario against ${CURRENT_ENV} → ${baseUrl}`);

  // Determine which user to use: ENV variables override, otherwise random local user
  const user =
    __ENV.TEST_USER && __ENV.TEST_PASS
      ? {
          username: __ENV.TEST_USER,
          password: __ENV.TEST_PASS,
          role: __ENV.TEST_ROLE,
        }
      : localUsers[Math.floor(Math.random() * localUsers.length)];

  const params = {
    tags: { endpoint: "login" },
    headers: { "Content-Type": "application/json" },
  };

  // ----- GET user -----
  let res = http.get(
    `${baseUrl}/users?username=${user.username}&password=${user.password}`,
    params,
  );
  apiOperationDuration.add(res.timings.duration, { endpoint: "login" });
  requestsCount.add(1);

  const getFailed = res.status !== 200;

  if (getFailed) {
    errorRate.add(true);
    console.warn(`GET /users failed — status: ${res.status}`);
    return;
  }

  let body;

  try {
    body = JSON.parse(res.body);
  } catch (err) {
    errorRate.add(true);
    console.error(`Failed to parse GET /users response: ${err.message}`);
    return;
  }

  if (!Array.isArray(body)) {
    errorRate.add(true);
    console.error("GET /users returned an unexpected response format");
    return;
  }

  if (body.length > 0) {
    // User exists → validate login
    const loginSucceeded = loginChecks(res);
    errorRate.add(!loginSucceeded);

    if (loginSucceeded) {
      console.log(
        `User logged in: ${user.username}${user.role ? ` (role: ${user.role})` : ""}`,
      );
    }
  } else {
    //  User does not exist → create user

    // GET lookup succeeded, but no matching user was found
    errorRate.add(false);

    const payload = JSON.stringify({
      username: user.username,
      password: user.password,
      role: user.role || "user",
    });

    // ----- POST user -----
    res = http.post(`${baseUrl}/users`, payload, {
      ...params,
      tags: { endpoint: "create-user" },
    });

    apiOperationDuration.add(res.timings.duration, { endpoint: "create-user" });
    requestsCount.add(1);

    // Run checks and record success (0) or failure (1)
    const createSucceeded = standardChecks(res);
    errorRate.add(!createSucceeded);

    if (!createSucceeded) {
      console.warn(
        `Failed to create user: ${user.username} — status: ${res.status}`,
      );
    } else {
      console.log(
        `Created new user: ${user.username} with role: ${user.role || "user"}`,
      );
    }
  }
}
