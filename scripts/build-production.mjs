import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { productionConfig, ciFixture } from './production-config.mjs';
import { verifyBuild } from './verify-build.mjs';

const fixture = process.argv.includes('--ci-fixture');
const env = { ...process.env, ...(fixture ? ciFixture : {}), NEXT_PUBLIC_BASE_PATH: '', NEXT_PUBLIC_STATIC_PREVIEW: 'false', SITE_INDEXABLE: fixture ? 'true' : process.env.SITE_INDEXABLE || 'false' };
if (!fixture) productionConfig(env);
const result = spawnSync(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'build'], { stdio: 'inherit', env });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
await verifyBuild({ site: env.NEXT_PUBLIC_SITE_URL, endpoint: env.NEXT_PUBLIC_INQUIRY_ENDPOINT, fixture, indexable: env.SITE_INDEXABLE === 'true' });
