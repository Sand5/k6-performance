export const smokeThresholds = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(95)<300'],
  login_duration: ['p(95)<200']
};

export const loadThresholds = {
  http_req_failed: ['rate<0.01'],
  http_req_duration: ['p(95)<250'],
  login_duration: ['p(95)<200']
};

export const spikeThresholds = {
  http_req_failed: ['rate<0.05'],
  http_req_duration: ['p(95)<500']
};
