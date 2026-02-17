import http from "k6/http";
import { ENV } from "../config/environments.js";
import { users as localUsers } from "../config/testData.js";
import { standardChecks } from "../utils/checks.js";
import { loginDuration, errorRate, requestsCount } from "../utils/metrics.js";

const BASE_URL = ENV.local.baseUrl;

export function loginScenario() {
  const user =
    __ENV.TEST_USER && __ENV.TEST_PASS
      ? { username: __ENV.TEST_USER, password: __ENV.TEST_PASS }
      : localUsers[Math.floor(Math.random() * localUsers.length)];

  const payload = JSON.stringify({
    username: user.username,
    password: user.password,
  });

  const params = {
    headers: { "Content-Type": "application/json" },
    tags: { endpoint: "login" },
  };

  const res = http.post(`${BASE_URL}/users`, payload, params);

  loginDuration.add(res.timings.duration,{endpoint:'login'} );
  requestsCount.add(1);

  if (!standardChecks(res)) {
    errorRate.add(1);
  }
}
