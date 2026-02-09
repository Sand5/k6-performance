import http from 'k6/http';
import { sleep } from 'k6';
import { ENV } from '../config/environments.js';
import { standardChecks } from '../utils/checks.js';
import { errorRate, requestsCount } from '../utils/metrics.js';

const BASE_URL = ENV.local.baseUrl;

export function crudScenario() {
  // ----- GET -----
  const getRes = http.get(`${BASE_URL}/posts`, { tags: { endpoint: 'get_posts' } });
  requestsCount.add(1);
  console.log(`GET /posts status: ${getRes.status}`);
  if (!standardChecks(getRes)) errorRate.add(1);

  sleep(1);

  // ----- POST -----
  const postPayload = JSON.stringify({ title: 'k6 post', author: 'k6 user' });
  const postRes = http.post(
    `${BASE_URL}/posts`,
    postPayload,
    { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'create_post' } }
  );
  requestsCount.add(1);
  console.log(`POST /posts status: ${postRes.status}`);
  if (!standardChecks(postRes)) errorRate.add(1);

  // Extract the ID of the created post
  const postId = postRes.json('id');
  console.log('Created post id:', postId);

  sleep(1);

  // ----- DELETE -----
  // Only delete if we have a valid postId
  if (postId) {
    // json-server expects no body for DELETE, so pass `null` as 2nd argument
    const delRes = http.del(
      `${BASE_URL}/posts/${postId}`,
      null,
      { tags: { endpoint: 'delete_post' } }
    );
    requestsCount.add(1);
    console.log(`DELETE /posts/${postId} status: ${delRes.status}`);
    if (!standardChecks(delRes)) errorRate.add(1);
  }

  sleep(1);
}
