import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

if (!process.stdin.isTTY) throw new Error('Run npm run telegram:connect in your local interactive terminal.');
let muted = false;
const output = new Writable({ write(chunk, _encoding, done) { if (!muted) process.stdout.write(chunk); done(); } });
const input = createInterface({ input: process.stdin, output, terminal: true });
let token;
try {
  process.stdout.write('Telegram bot token (hidden): '); muted = true;
  token = (await input.question('')).trim();
} finally { muted = false; input.close(); process.stdout.write('\n'); }
if (!/^\d+:[A-Za-z0-9_-]+$/.test(token || '')) throw new Error('Invalid bot token format.');

async function telegram(method) {
  let response;
  try { response = await fetch(`https://api.telegram.org/bot${token}/${method}`, { method: 'POST', signal: AbortSignal.timeout(15000) }); }
  catch { throw new Error('Telegram connection failed.'); }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.ok) throw new Error(`Telegram ${method} failed (HTTP ${response.status}).`);
  return data.result;
}
const bot = await telegram('getMe');
if (bot.username?.toLowerCase() !== 'dubassitebot') throw new Error('This project expects @dubassitebot. No secrets were changed.');
const updates = await telegram('getUpdates');
const expected = new URL(process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/DubaArts').pathname.slice(1).toLowerCase();
const chat = updates.map(update => update.message).filter(message => message?.chat?.type === 'private' && message.from?.username?.toLowerCase() === expected).at(-1)?.chat;
if (!chat) throw new Error(`Open @${bot.username}, press Start from @${expected}, then run this command again. No secrets were changed.`);
const result = spawnSync(process.execPath, [resolve('node_modules/wrangler/bin/wrangler.js'), 'secret', 'bulk', '--config', 'worker/wrangler.production.json'], {
  input: JSON.stringify({ TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: String(chat.id), IP_HASH_SECRET: randomBytes(32).toString('hex') }),
  encoding: 'utf8', env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
});
token = undefined;
if (result.error || result.status !== 0) throw new Error('Cloudflare secret upload failed. Check Wrangler login and the generated production config.');
console.log(`Connected @${bot.username} to the private chat of @${expected}. Credentials were sent only to Telegram and Cloudflare, never to GitHub or the website build.`);
