import http from 'k6/http';
import { sleep } from 'k6';
import { BASE_URL, CURRENT_ENV } from '../config/environments.js';
import { standardChecks } from '../utils/checks.js';
import { errorRate, requestsCount } from '../utils/metrics.js';

export function crudScenario() {
  console.log(`Running crudScenario against ${CURRENT_ENV} → ${BASE_URL}`);

  // ----- SHORT WARM-UP -----
  sleep(0.5);

  // ----- GET -----
  const getRes = http.get(`${BASE_URL}/posts`, {
    tags: { endpoint: 'get_posts' },
  });

  requestsCount.add(1);
  const getFailed = !standardChecks(getRes);
  if (getFailed) errorRate.add(1);

  console.log(`[${CURRENT_ENV}] GET /posts status: ${getRes.status}`);
  if (getFailed) return;

  sleep(0.5);

  // ----- POST -----
  const postPayload = JSON.stringify({
    title: __ENV.TEST_POST_TITLE || 'k6 post',
    author: __ENV.TEST_POST_AUTHOR || 'k6 user',
  });

  const postRes = http.post(
    `${BASE_URL}/posts`,
    postPayload,
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'create_post' },
    }
  );

  requestsCount.add(1);
  const postFailed = !standardChecks(postRes);
  if (postFailed) errorRate.add(1);

  console.log(`[${CURRENT_ENV}] POST /posts status: ${postRes.status}`);
  if (postFailed) return;

  const postId = postRes.json('id');
  console.log(`[${CURRENT_ENV}] Created post id: ${postId}`);

  // Small pause to allow persistence (JSON server safety)
  sleep(1);

  // ----- DELETE -----
  if (postId) {
    const delRes = http.del(
      `${BASE_URL}/posts/${postId}`,
      null,
      { tags: { endpoint: 'delete_post' } }
    );

    requestsCount.add(1);
    const delFailed = !standardChecks(delRes);
    if (delFailed) errorRate.add(1);

    console.log(
      `[${CURRENT_ENV}] DELETE /posts/${postId} status: ${delRes.status}`
    );
  }

  sleep(0.5);
}