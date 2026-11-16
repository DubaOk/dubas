import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { spawnSync } from 'node:child_process';

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
const result = spawnSync('gh', ['secret', 'set', 'CLOUDFLARE_API_TOKEN', '--repo', 'DubaOk/dubas'], { input: token, encoding: 'utf8' });
token = undefined;
if (result.error || result.status !== 0) throw new Error('Unable to save the GitHub Secret; check gh auth status.');
console.log('Verified the token and stored CLOUDFLARE_API_TOKEN in GitHub Actions Secrets.');
