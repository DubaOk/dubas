export function deploymentAddresses(env = process.env) {
  const required = ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_INQUIRY_ENDPOINT'];
  for (const name of required) if (!env[name]?.trim()) throw new Error(`Set ${name} before production publication.`);
  const site = new URL(env.NEXT_PUBLIC_SITE_URL);
  const endpoint = new URL(env.NEXT_PUBLIC_INQUIRY_ENDPOINT);
  if (site.protocol !== 'https:' || !/^[a-z0-9-]+\.web\.app$/.test(site.hostname) || site.pathname !== '/' || site.search || site.hash || site.username || site.password || site.port) throw new Error('NEXT_PUBLIC_SITE_URL must be the selected HTTPS web.app origin.');
  if (endpoint.protocol !== 'https:' || !endpoint.hostname.endsWith('.workers.dev') || endpoint.pathname !== '/api/inquiries' || endpoint.search || endpoint.hash || endpoint.username || endpoint.password || endpoint.port) throw new Error('NEXT_PUBLIC_INQUIRY_ENDPOINT must be the HTTPS workers.dev /api/inquiries URL.');
  return { site: site.origin, endpoint: endpoint.href, workerOrigin: endpoint.origin, siteId: site.hostname.slice(0, -8) };
}

export function productionConfig(env = process.env) {
  const config = deploymentAddresses(env);
  for (const name of ['NEXT_PUBLIC_TELEGRAM_URL', 'NEXT_PUBLIC_PROVIDER_NAME', 'NEXT_PUBLIC_PROVIDER_TAX_ID']) if (!env[name]?.trim()) throw new Error(`Set ${name} before production publication.`);
  const telegram = new URL(env.NEXT_PUBLIC_TELEGRAM_URL);
  if (telegram.protocol !== 'https:' || telegram.hostname !== 't.me' || !/^\/[a-zA-Z0-9_]{5,32}$/.test(telegram.pathname) || telegram.search || telegram.hash || telegram.username || telegram.password || telegram.port) throw new Error('Use a public https://t.me/username contact.');
  if (/fixture|placeholder|example/i.test(env.NEXT_PUBLIC_PROVIDER_NAME) || /^(0+|1+|123456789)$/.test(env.NEXT_PUBLIC_PROVIDER_TAX_ID)) throw new Error('Production provider information must be real.');
  return config;
}

export const ciFixture = {
  NEXT_PUBLIC_SITE_URL: 'https://dubas-ci-check.web.app',
  NEXT_PUBLIC_INQUIRY_ENDPOINT: 'https://dubas-ci-check.example.workers.dev/api/inquiries',
  NEXT_PUBLIC_TELEGRAM_URL: 'https://t.me/DubasCIFixture',
  NEXT_PUBLIC_PROVIDER_NAME: 'CI fixture — never publish',
  NEXT_PUBLIC_PROVIDER_TAX_ID: 'CI-FIXTURE',
};
