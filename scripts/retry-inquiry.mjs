import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const id = process.argv[2];
if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id || '')) throw new Error('Usage: npm run inquiries:retry -- UUID');
const now = Date.now();
const sql = `UPDATE inquiries SET notification_status = 'pending', notification_deadline = ${now + 86400000}, next_attempt_at = ${now}, last_error = NULL, lease_token = NULL, lease_until = 0 WHERE id = '${id}' AND notification_status = 'failed' AND expires_at > ${now};`;
const result = spawnSync(process.execPath, [resolve('node_modules/wrangler/bin/wrangler.js'), 'd1', 'execute', 'DB', '--remote', '--config', 'worker/wrangler.production.json', '--command', sql], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status || 0;
