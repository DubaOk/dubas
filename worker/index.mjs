import { validateInquiry, consentVersion } from '../src/lib/inquiry-schema.mjs';
import { createStore } from './store.mjs';
import { deliver } from './telegram.mjs';

const encoder = new TextEncoder();
const hex = bytes => [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
const digest = async text => hex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));

export async function hashIp(ip, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, encoder.encode(ip)));
}

async function readBody(request) {
  if (Number(request.headers.get('content-length')) > 16384) throw 413;
  const reader = request.body?.getReader();
  if (!reader) throw 400;
  let size = 0; const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 16384) { await reader.cancel(); throw 413; }
    chunks.push(value);
  }
  const body = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(body)); } catch { throw 400; }
}

export function createHandler({ now = Date.now, fetcher = fetch } = {}) {
  return {
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      const origin = request.headers.get('Origin');
      const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
      const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
      const json = (status, body, extra = {}) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...extra } });
      if (origin && !allowed.includes(origin)) return json(403, { error: 'origin' });
      if (origin) { headers['Access-Control-Allow-Origin'] = origin; headers.Vary = 'Origin'; }
      if (url.pathname === '/health' && request.method === 'GET') {
        try {
          if (!env.DB || !env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID || !env.IP_HASH_SECRET || !allowed.length) throw new Error('not_ready');
          // Check the migration, not merely the database connection.
          await env.DB.prepare('SELECT id FROM inquiries LIMIT 1').first();
          await env.DB.prepare('SELECT ip_hash FROM rate_limits LIMIT 1').first();
          return json(200, { status: 'ready', revision: env.DEPLOY_REVISION || 'local' });
        } catch { return json(503, { status: 'unavailable' }); }
      }
      if (url.pathname !== '/api/inquiries') return json(404, { error: 'not_found' });
      if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key', 'Access-Control-Max-Age': '600' } });
      if (request.method !== 'POST') return json(405, { error: 'method' }, { Allow: 'POST, OPTIONS' });
      if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json(415, { error: 'content_type' });
      const key = request.headers.get('Idempotency-Key') || crypto.randomUUID();
      if (!/^[a-zA-Z0-9_-]{16,128}$/.test(key)) return json(400, { error: 'idempotency_key' });
      try {
        if (!env.DB || !env.IP_HASH_SECRET || !allowed.length) return json(503, { error: 'storage_unavailable' });
        const store = createStore(env.DB);
        const ipHash = await hashIp(request.headers.get('CF-Connecting-IP') || 'unknown', env.IP_HASH_SECRET);
        const attempt = await store.rateLimit(ipHash, now());
        // Replays are returned even after the rate limit, once their original payload is verified.
        let input;
        try { input = await readBody(request); } catch (status) { return json(status === 413 ? 413 : 400, { error: status === 413 ? 'too_large' : 'invalid_json' }); }
        const result = validateInquiry(input);
        if (!result.valid) {
          if (attempt.attempts > 8) return json(429, { error: 'rate_limit' }, { 'Retry-After': String(Math.max(1, Math.ceil((attempt.expires_at - now()) / 1000))) });
          return json(422, { error: 'validation', fields: Object.keys(result.errors).filter(field => field !== 'website') });
        }
        const value = { ...result.value, consentVersion };
        const hash = await digest(JSON.stringify(value));
        let row = await store.find(key);
        if (row && row.expires_at <= now()) return json(409, { error: 'idempotency_expired' });
        if (!row && attempt.attempts > 8) return json(429, { error: 'rate_limit' }, { 'Retry-After': String(Math.max(1, Math.ceil((attempt.expires_at - now()) / 1000))) });
        if (!row) row = await store.save({ id: crypto.randomUUID(), key, hash, value, now: now() });
        if (row.payload_hash !== hash) return json(409, { error: 'idempotency_conflict' });
        ctx.waitUntil(deliver(store, env, row.id, { now, fetcher }).catch(() => console.error('Notification processing failed.')));
        return json(201, { id: row.id, status: 'saved' });
      } catch { return json(503, { error: 'storage_unavailable' }); }
    },
    async scheduled(_event, env, ctx) {
      ctx.waitUntil((async () => {
        const store = createStore(env.DB);
        await store.prune(now());
        for (const row of await store.due(now())) await deliver(store, env, row.id, { now, fetcher });
      })().catch(() => console.error('Scheduled inquiry processing failed.')));
    },
  };
}

export default createHandler();
