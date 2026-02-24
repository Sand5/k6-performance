import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL, CURRENT_ENV } from '../config/environments.js';
import { standardChecks } from '../utils/checks.js';
import { errorRate, requestsCount } from '../utils/metrics.js';

export function crudScenario() {
  // Log which environment we're running against
  console.log(`Running crudScenario against ${CURRENT_ENV} → ${BASE_URL}`);

  // ----- GET -----
  const getRes = http.get(`${BASE_URL}/posts`, { tags: { endpoint: 'get_posts' } });
  requestsCount.add(1);
  console.log(`[${CURRENT_ENV}] GET /posts status: ${getRes.status}`);
  if (!standardChecks(getRes)) errorRate.add(1);

  sleep(1);

  // ----- POST -----
  const postTitle = __ENV.TEST_POST_TITLE || 'k6 post';
  const postAuthor = __ENV.TEST_POST_AUTHOR || 'k6 user';
  const postPayload = JSON.stringify({ title: postTitle, author: postAuthor });

  const postRes = http.post(
    `${BASE_URL}/posts`,
    postPayload,
    { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'create_post' } }
  );
  requestsCount.add(1);
  console.log(`[${CURRENT_ENV}] POST /posts status: ${postRes.status}`);
  if (!standardChecks(postRes)) errorRate.add(1);

  const postId = postRes.json('id');
  console.log(`[${CURRENT_ENV}] Created post id: ${postId}`);

  sleep(1);

  // ----- DELETE -----
  if (postId) {
    const delRes = http.del(
      `${BASE_URL}/posts/${postId}`,
      null,
      { tags: { endpoint: 'delete_post' } }
    );
    requestsCount.add(1);
    console.log(`[${CURRENT_ENV}] DELETE /posts/${postId} status: ${delRes.status}`);
    if (!standardChecks(delRes)) errorRate.add(1);
  }

  sleep(1);
}