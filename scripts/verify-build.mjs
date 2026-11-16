import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

export async function verifyBuild({ site, endpoint, fixture = false, root = 'out' }) {
  const files = [];
  async function walk(path) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const target = join(path, entry.name);
      if (entry.isDirectory()) await walk(target); else files.push(target);
    }
  }
  await walk(root);
  assert(files.length > 0, 'Static build is empty.');
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  for (const path of htmlFiles) {
    const html = await readFile(path, 'utf8');
    if (/(?:^|[\\/])(?:404|_not-found)(?:[\\/]|\.html)/.test(path)) continue;
    assert(!html.includes('/dubas/_next/'), 'Production contains the GitHub Pages prefix.');
    assert(html.includes(`${site}/`), `Missing production domain in ${path}`);
    assert(html.includes('rel="canonical"'), `Missing canonical in ${path}`);
    assert(!/<meta name="robots" content="[^"]*noindex/.test(html), `Page is not indexable: ${path}`);
    assert(!html.includes('Отправка пока недоступна') && !html.includes('Sending is not available yet'), 'Form is disabled.');
    if (!fixture) assert(!html.includes('CI fixture') && !html.includes('CI-FIXTURE'), 'Fixture content must never be published.');
  }
  await readFile(join(root, '404.html'));
  for (const route of ['index.html', 'en/index.html', 'services/landing/index.html', 'en/services/landing/index.html']) await readFile(join(root, route));
  const robots = await readFile(join(root, 'robots.txt'), 'utf8');
  assert(robots.includes(`Sitemap: ${site}/sitemap.xml`) && !robots.includes('Disallow: /'), 'robots.txt is not ready.');
  const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
  assert(sitemap.includes(`${site}/en/`) && sitemap.includes(`${site}/services/landing/`), 'Incomplete sitemap.');
  let endpointFound = false;
  for (const path of files) {
    assert(!/(?:^|[\\/])(?:\.data|\.env[^\\/]*|\.git|node_modules|worker)(?:[\\/]|$)/.test(path), `Private file in output: ${path}`);
    if (!/\.(js|html|json|txt|xml)$/.test(path)) continue;
    const text = await readFile(path, 'utf8');
    if (text.includes(endpoint)) endpointFound = true;
    assert(!/-----BEGIN (?:RSA )?PRIVATE KEY-----|"private_key"\s*:|\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/.test(text), `Possible credential in output: ${path}`);
  }
  assert(endpointFound, 'Form endpoint is missing from the browser bundle.');
  console.log(`Verified ${htmlFiles.length} HTML files, sitemap, robots, form and public output${fixture ? ' (CI fixture only)' : ''}.`);
}
