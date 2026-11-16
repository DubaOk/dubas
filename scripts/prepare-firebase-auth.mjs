import { writeFile, appendFile, unlink, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const path = join(process.env.RUNNER_TEMP || '.deployment', 'dubas-firebase-service-account.json');
if (process.argv.includes('--cleanup')) {
  await unlink(path).catch(error => { if (error.code !== 'ENOENT') throw error; });
} else {
  if (!process.env.CLOUDFLARE_API_TOKEN) throw new Error('Missing CLOUDFLARE_API_TOKEN GitHub Secret.');
  let credentials;
  try { credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || ''); } catch { throw new Error('Set the FIREBASE_SERVICE_ACCOUNT GitHub Secret.'); }
  if (credentials.type !== 'service_account' || credentials.project_id !== process.env.FIREBASE_PROJECT_ID || !credentials.private_key || !credentials.client_email) throw new Error('Firebase service account does not match the selected project.');
  await mkdir(process.env.RUNNER_TEMP || '.deployment', { recursive: true });
  await writeFile(path, JSON.stringify(credentials), { mode: 0o600 });
  if (!process.env.GITHUB_ENV) throw new Error('This helper runs inside GitHub Actions.');
  await appendFile(process.env.GITHUB_ENV, `GOOGLE_APPLICATION_CREDENTIALS=${path}\n`);
}
