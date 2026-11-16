import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';

const project = process.env.FIREBASE_PROJECT_ID;
if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(project || '')) throw new Error('Set FIREBASE_PROJECT_ID to the real Firebase project.');
const existing = spawnSync('gh', ['secret', 'list', '--repo', 'DubaOk/dubas', '--json', 'name'], { encoding: 'utf8' });
if (existing.status !== 0) throw new Error('GitHub authentication is required.');
if (JSON.parse(existing.stdout).some(secret => secret.name === 'FIREBASE_SERVICE_ACCOUNT')) throw new Error('FIREBASE_SERVICE_ACCOUNT already exists. Rotate its key explicitly rather than creating another automatically.');

// Reuse the owner's Firebase CLI login, keeping tokens and the generated key in memory.
const require = createRequire(import.meta.url);
const auth = require('firebase-tools/lib/auth.js');
const account = auth.getGlobalDefaultAccount();
if (!account) throw new Error('Run firebase login first.');
const { access_token: token } = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
async function google(url, method = 'GET', body) {
  const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(`Google API returned HTTP ${response.status} (${data.error?.status || 'request_failed'}).`); error.status = response.status; throw error; }
  return data;
}
const operation = await google(`https://serviceusage.googleapis.com/v1/projects/${project}/services/iam.googleapis.com:enable`, 'POST', {});
if (operation.name && !operation.done) {
  let complete = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    const status = await google(`https://serviceusage.googleapis.com/v1/${operation.name}`);
    if (status.error) throw new Error('Enabling IAM failed.');
    if (status.done) { complete = true; break; }
    await new Promise(done => setTimeout(done, 1000));
  }
  if (!complete) throw new Error('IAM activation is still pending; run again later.');
}
const email = `dubas-github-hosting@${project}.iam.gserviceaccount.com`;
let serviceAccount;
try { serviceAccount = await google(`https://iam.googleapis.com/v1/projects/${project}/serviceAccounts/${email}`); }
catch (error) {
  if (error.status !== 404) throw error;
  serviceAccount = await google(`https://iam.googleapis.com/v1/projects/${project}/serviceAccounts`, 'POST', { accountId: 'dubas-github-hosting', serviceAccount: { displayName: 'Dubas GitHub Hosting deploy' } });
}
const policy = await google(`https://cloudresourcemanager.googleapis.com/v1/projects/${project}:getIamPolicy`, 'POST', { options: { requestedPolicyVersion: 3 } });
policy.bindings ||= [];
for (const role of ['roles/firebasehosting.admin', 'roles/serviceusage.serviceUsageConsumer']) {
  let binding = policy.bindings.find(item => item.role === role && !item.condition);
  if (!binding) { binding = { role, members: [] }; policy.bindings.push(binding); }
  if (!binding.members.includes(`serviceAccount:${email}`)) binding.members.push(`serviceAccount:${email}`);
}
// Preserve all existing bindings, conditions and the etag (concurrent edits must fail safely).
await google(`https://cloudresourcemanager.googleapis.com/v1/projects/${project}:setIamPolicy`, 'POST', { policy });
const key = await google(`https://iam.googleapis.com/v1/${serviceAccount.name}/keys`, 'POST', { privateKeyType: 'TYPE_GOOGLE_CREDENTIALS_FILE' });
const credentials = Buffer.from(key.privateKeyData, 'base64');
const saved = spawnSync('gh', ['secret', 'set', 'FIREBASE_SERVICE_ACCOUNT', '--repo', 'DubaOk/dubas'], { input: credentials, encoding: 'utf8' });
credentials.fill(0);
if (saved.error || saved.status !== 0) {
  await google(`https://iam.googleapis.com/v1/${key.name}`, 'DELETE');
  throw new Error('GitHub secret upload failed; the unused newly generated Google key was revoked.');
}
console.log('Configured the Hosting-only service account and stored its JSON key directly in GitHub Actions Secrets.');
