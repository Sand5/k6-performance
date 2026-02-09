import { check } from 'k6';

export function standardChecks(res) {
  const method = res.request.method;

  const result = check(res, {
    'status is valid': r => r.status >= 200 && r.status < 300, // removed DELETE 204 special case
    'response time < 500ms': r => r.timings.duration < 500,
  });

  if (!result) {
    console.warn(`Check failed for ${method} ${res.url} — status: ${res.status}, duration: ${res.timings.duration}ms`);
  }

  return result;
}
