// k6-tests/config/environments.js

const CURRENT_ENV = __ENV.ENV || "local";
const IS_DOCKER = __ENV.DOCKER === "true";

const environments = {
  local: {
    baseUrl: IS_DOCKER ? "http://mock-local:3000" : "http://localhost:3000",
  },
  qa: {
    baseUrl: IS_DOCKER ? "http://mock-qa:4000" : "http://localhost:4000",
  },
  prod: {
    baseUrl: IS_DOCKER ? "http://mock-prod:5000" : "http://localhost:5000",
  },
};

if (!environments[CURRENT_ENV]) {
  throw new Error(`Invalid ENV: ${CURRENT_ENV}`);
}

export const BASE_URL = environments[CURRENT_ENV].baseUrl;
export { CURRENT_ENV };