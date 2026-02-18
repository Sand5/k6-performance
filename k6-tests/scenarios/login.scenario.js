import http from "k6/http";
import { ENV } from "../config/environments.js";
import { users as localUsers } from "../config/testData.js";
import { loginChecks, standardChecks } from "../utils/checks.js";
import { loginDuration, errorRate, requestsCount } from "../utils/metrics.js";

const BASE_URL = ENV.local.baseUrl;

export function loginScenario() {
  // Select user from ENV or random localUsers
  const user =
    __ENV.TEST_USER && __ENV.TEST_PASS
      ? { 
          username: __ENV.TEST_USER, 
          password: __ENV.TEST_PASS, 
          role: __ENV.TEST_ROLE  // include role from env
        }
      : localUsers[Math.floor(Math.random() * localUsers.length)];

  const params = {
    tags: { endpoint: "login" },
    headers: { "Content-Type": "application/json" },
  };

  // Check if user exists
  let res = http.get(
    `${BASE_URL}/users?username=${user.username}&password=${user.password}`,
    params
  );

  // Track metrics
  loginDuration.add(res.timings.duration, { endpoint: "login" });
  requestsCount.add(1);

  if (res.status !== 200) {
    errorRate.add(1);
    console.warn(`GET /users failed — status: ${res.status}`);
    return;
  }

  const body = JSON.parse(res.body);

  if (body.length > 0) {
    // ✅ User exists → login successful
    loginChecks(res);
    console.log(
      `User logged in: ${user.username}${user.role ? ` (role: ${user.role})` : ""}`
    );
  } else {
    // ❌ User does not exist → create user
    const payload = JSON.stringify({
      username: user.username,
      password: user.password,
      role: user.role || "user", // default role if missing
    });

    res = http.post(`${BASE_URL}/users`, payload, params);

    // Track metrics for creation
    loginDuration.add(res.timings.duration, { endpoint: "create-user" });
    requestsCount.add(1);

    // Directly check response
    if (!standardChecks(res)) {
      errorRate.add(1);
      console.warn(
        `Failed to create user: ${user.username} — status: ${res.status}`
      );
    } else {
      console.log(
        `Created new user: ${user.username} with role: ${user.role || "user"}`
      );
    }
  }
}
