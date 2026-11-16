import assert from 'node:assert/strict';
import { productionConfig } from './production-config.mjs';

const { site, workerOrigin, indexable } = productionConfig();
async function checkHealth() {
  let lastError;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const response = await fetch(`${workerOrigin}/health`, { signal: AbortSignal.timeout(10000) });
      assert.equal(response.status, 200, 'API is not ready.');
      const body = await response.json();
      assert.equal(body.status, 'ready');
      if (process.env.GITHUB_SHA) assert.equal(body.revision, process.env.GITHUB_SHA, 'Previous Worker revision is still serving.');
      return;
    } catch (error) { lastError = error; if (attempt < 5) await new Promise(done => setTimeout(done, 5000)); }
  }
  throw lastError;
}
await checkHealth();
if (!process.argv.includes('--api-only')) {
  for (const path of ['/', '/en/', '/services/landing/', '/en/services/landing/']) {
    const response = await fetch(`${site}${path}`, { signal: AbortSignal.timeout(10000) });
    assert.equal(response.status, 200, `Missing page ${path}`);
    const html = await response.text();
    assert(html.includes(`href="${site}${path}"`), `Wrong canonical on ${path}`);
    assert.equal(!/<meta name="robots" content="[^"]*noindex/.test(html), indexable, `Wrong indexing setting on ${path}`);
  }
  const missing = await fetch(`${site}/__dubas_missing_page__/`, { signal: AbortSignal.timeout(10000) });
  assert.equal(missing.status, 404, 'Unknown page must return 404.');
}
console.log('Public smoke checks passed; no enquiry or Telegram message was generated.');
