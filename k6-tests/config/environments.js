const CURRENT_ENV = __ENV.ENV || "local";

const environments = {
  local: {
    baseUrl: "http://localhost:3000",
  },
  qa: {
    baseUrl: "http://localhost:4000",
  },
  prod: {
    baseUrl: "http://localhost:5000",
  },
};

if (!environments[CURRENT_ENV]) {
  throw new Error(`Invalid ENV: ${CURRENT_ENV}`);
}

export const BASE_URL = environments[CURRENT_ENV].baseUrl;
export { CURRENT_ENV };
