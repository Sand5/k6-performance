export const smokeThresholds = {
    http_req_failed: ["rate<0.01"],
  http_req_duration: ["p(95)<300"],
  custom_error_rate: ['rate<0.01'],
  "api_operation_duration{endpoint:login}": ["p(95)<200"],
  "api_operation_duration{endpoint:create-user}": ["p(95)<250"],
};

export const loadThresholds = {
  http_req_failed: ["rate<0.01"],
  custom_error_rate: ['rate<0.01'],
  http_req_duration: ["p(95)<250"],
  "api_operation_duration{endpoint:login}": ["p(95)<200"],
  "api_operation_duration{endpoint:create-user}": ["p(95)<300"],
};

export const spikeThresholds = {
  http_req_failed: ["rate<0.05"],
  custom_error_rate: ['rate<0.05'],
  "api_operation_duration{endpoint:login}": ["p(95)<200"],
  "api_operation_duration{endpoint:create-user}": ["p(95)<300"],
};