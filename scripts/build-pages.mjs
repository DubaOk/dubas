import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repository = process.env.GITHUB_REPOSITORY || 'DubaOk/dubas';
if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error('Invalid GitHub repository.');
const [owner, name] = repository.split('/');
const basePath = name.toLowerCase() === `${owner.toLowerCase()}.github.io` ? '' : `/${name}`;
const result = spawnSync(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: `https://${owner.toLowerCase()}.github.io`,
    NEXT_PUBLIC_STATIC_PREVIEW: 'true',
    NEXT_PUBLIC_INQUIRY_ENDPOINT: '',
    SITE_INDEXABLE: 'false',
  },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
writeFileSync('out/.nojekyll', '');
console.log(`Pages preview: https://${owner.toLowerCase()}.github.io${basePath}/`);
