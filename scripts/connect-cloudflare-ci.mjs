import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

if (!process.stdin.isTTY) throw new Error('Run npm run cloudflare:connect-ci in your local interactive terminal.');
let muted = false;
const output = new Writable({ write(chunk, _encoding, done) { if (!muted) process.stdout.write(chunk); done(); } });
const input = createInterface({ input: process.stdin, output, terminal: true });
let token;
try { process.stdout.write('Scoped Cloudflare CI API token (hidden): '); muted = true; token = (await input.question('')).trim(); }
finally { muted = false; input.close(); process.stdout.write('\n'); }
if (!token) throw new Error('No token entered.');
const response = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000) }).catch(() => null);
const data = await response?.json().catch(() => null);
if (!response?.ok || !data?.success || data.result?.status !== 'active') throw new Error('Cloudflare token verification failed.');
const config = JSON.parse(await readFile('worker/wrangler.production.json', 'utf8'));
const api = `https://api.cloudflare.com/client/v4/accounts/${config.account_id}`;
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
const database = await fetch(`${api}/d1/database/${config.d1_databases[0].database_id}/query`, {
  method: 'POST', headers, body: JSON.stringify({ sql: 'SELECT 1 AS ready' }), signal: AbortSignal.timeout(15000),
}).catch(() => null);
const databaseResult = await database?.json().catch(() => null);
if (!database?.ok || !databaseResult?.success) throw new Error(`Token cannot access the Dubas D1 database in account ${config.account_id}. Grant Account / D1 / Edit for this exact account, then run again. GitHub Secret was not changed.`);
const worker = await fetch(`${api}/workers/scripts/${config.name}/settings`, { headers, signal: AbortSignal.timeout(15000) }).catch(() => null);
if (!worker?.ok) throw new Error(`Token cannot access the Dubas Worker in account ${config.account_id}. Grant Account / Workers Scripts / Edit for this exact account, then run again. GitHub Secret was not changed.`);
const result = spawnSync('gh', ['secret', 'set', 'CLOUDFLARE_API_TOKEN', '--repo', 'DubaOk/dubas'], { input: token, encoding: 'utf8' });
token = undefined;
if (result.error || result.status !== 0) throw new Error('Unable to save the GitHub Secret; check gh auth status.');
console.log('Verified the token and stored CLOUDFLARE_API_TOKEN in GitHub Actions Secrets.');
