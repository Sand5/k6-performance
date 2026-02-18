import { check } from 'k6';

/**
 * Standard response checks: status 2xx and response time < 500ms
 */
export function standardChecks(res) {
  const result = check(res, {
    'status is valid': r => r.status >= 200 && r.status < 300,
    'response time < 500ms': r => r.timings.duration < 500,
  });

  if (!result) {
    console.warn(`Check failed for ${res.url} — status: ${res.status}, duration: ${res.timings.duration}ms`);
  }

  return result;
}

/**
 * Login-specific check: ensures user exists
 * @param {Object} res - k6 HTTP response
 */
export function loginChecks(res) {
  let body = [];

  try {
    body = JSON.parse(res.body);
  } catch (err) {
    console.error(`Failed to parse response body for ${res.url}: ${err}`);
  }

  const result = check(res, {
    'status is 200': r => r.status === 200,
    'user exists': () => body.length > 0,
    'response time < 500ms': r => r.timings.duration < 500,
  });

  if (!result) {
    console.warn(`Login check failed for ${res.url} — status: ${res.status}, duration: ${res.timings.duration}ms`);
  }

  return result;
}
