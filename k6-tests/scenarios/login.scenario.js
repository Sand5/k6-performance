import http from "k6/http";
import { users as localUsers } from "../config/testData.js";
import { loginChecks, standardChecks } from "../utils/checks.js";
import { loginDuration, errorRate, requestsCount } from "../utils/metrics.js";
import { BASE_URL, CURRENT_ENV } from "../config/environments.js";

export function loginScenario(baseUrl = BASE_URL) {
  // Log which environment and URL we're running against
  console.log(`Running loginScenario against ${CURRENT_ENV} → ${baseUrl}`);

  // Determine which user to use: ENV variables override, otherwise random local user
  const user =
    __ENV.TEST_USER && __ENV.TEST_PASS
      ? { username: __ENV.TEST_USER, password: __ENV.TEST_PASS, role: __ENV.TEST_ROLE }
      : localUsers[Math.floor(Math.random() * localUsers.length)];

  const params = {
    tags: { endpoint: "login" },
    headers: { "Content-Type": "application/json" },
  };

  // ----- GET user -----
  let res = http.get(`${baseUrl}/users?username=${user.username}&password=${user.password}`, params);
  loginDuration.add(res.timings.duration, { endpoint: "login" });
  requestsCount.add(1);

  if (res.status !== 200) {
    errorRate.add(1);
    console.warn(`GET /users failed — status: ${res.status}`);
    return;
  }

  const body = JSON.parse(res.body);

  if (body.length > 0) {
    // User exists → login successful
    loginChecks(res);
    console.log(`User logged in: ${user.username}${user.role ? ` (role: ${user.role})` : ""}`);
  } else {
    //  User does not exist → create user
    const payload = JSON.stringify({
      username: user.username,
      password: user.password,
      role: user.role || "user",
    });

    res = http.post(`${baseUrl}/users`, payload, params);
    loginDuration.add(res.timings.duration, { endpoint: "create-user" });
    requestsCount.add(1);

    if (!standardChecks(res)) {
      errorRate.add(1);
      console.warn(`Failed to create user: ${user.username} — status: ${res.status}`);
    } else {
      console.log(`Created new user: ${user.username} with role: ${user.role || "user"}`);
    }
  }
}