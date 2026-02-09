import { Trend, Counter, Rate } from 'k6/metrics';

export const loginDuration = new Trend('login_duration');
export const errorRate = new Rate('custom_error_rate');
export const requestsCount = new Counter('custom_requests_count');
