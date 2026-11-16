import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { createHandler, hashIp } from '../worker/index.mjs';
import { createStore, retentionMs } from '../worker/store.mjs';
import { telegramParts, deliver } from '../worker/telegram.mjs';
import { productionConfig, ciFixture } from '../scripts/production-config.mjs';

// Run the real migration and SQL against SQLite, mirroring D1's prepared-statement interface.
function d1(sqlite) {
  function prepare(sql) {
    let params = [];
    return {
      bind(...values) { params = values; return this; },
      async first() { return sqlite.prepare(sql).get(...params) || null; },
      async all() { return { results: sqlite.prepare(sql).all(...params) }; },
      async run() { const result = sqlite.prepare(sql).run(...params); return { meta: { changes: Number(result.changes) } }; },
    };
  }
  return { prepare, async batch(statements) {
    sqlite.exec('BEGIN');
    try { const results = []; for (const statement of statements) results.push(await statement.run()); sqlite.exec('COMMIT'); return results; }
    catch (error) { sqlite.exec('ROLLBACK'); throw error; }
  } };
}

const valid = { name: 'Тестовый клиент', contact: '+375 (29) 123-45-67', description: 'Нужен сайт с каталогом и формой заявки.', service: 'shop', approach: 'custom', consent: true, website: '', locale: 'ru' };
async function fixture(t, options = {}) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(await readFile(new URL('../worker/migrations/0001_inquiries.sql', import.meta.url), 'utf8'));
  t.after(() => sqlite.close());
  const db = d1(sqlite); const tasks = []; const messages = [];
  let clock = Date.UTC(2026, 10, 16);
  const env = { DB: db, ALLOWED_ORIGINS: 'https://dubas.web.app,http://localhost:3000', IP_HASH_SECRET: 'unit-test-secret', TELEGRAM_BOT_TOKEN: 'unit-test-token', TELEGRAM_CHAT_ID: '123', DEPLOY_REVISION: 'test-revision' };
  const fetcher = options.fetcher || (async (_url, init) => { messages.push(JSON.parse(init.body)); return Response.json({ ok: true }); });
  const handler = createHandler({ now: () => clock, fetcher });
  const ctx = { waitUntil(task) { tasks.push(task); } };
  const send = (payload = valid, headers = {}, key = crypto.randomUUID()) => handler.fetch(new Request('https://test.workers.dev/api/inquiries', {
    method: 'POST', headers: { Origin: 'https://dubas.web.app', 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1', 'Idempotency-Key': key, ...headers }, body: JSON.stringify(payload),
  }), env, ctx);
  return { db, sqlite, env, ctx, handler, send, messages, now: () => clock, advance: ms => { clock += ms; }, flush: async () => { while (tasks.length) await Promise.all(tasks.splice(0)); } };
}

test('stores a validated Unicode enquiry and sends a plain-text Telegram notification', async t => {
  const app = await fixture(t);
  const response = await app.send(); assert.equal(response.status, 201);
  const result = await response.json(); assert.deepEqual(Object.keys(result).sort(), ['id', 'status']); assert.equal(result.status, 'saved');
  await app.flush();
  const row = app.sqlite.prepare('SELECT * FROM inquiries').get();
  assert.equal(row.id, result.id); assert.equal(row.notification_status, 'sent'); assert.equal(row.expires_at - row.created_at, retentionMs);
  const payload = JSON.parse(row.payload); assert.equal(payload.contact, valid.contact); assert(payload.consentVersion); assert.equal(payload.ip, undefined);
  assert.equal(app.messages.length, 1); assert(app.messages[0].text.includes('Интернет-магазин')); assert(app.messages[0].text.includes(valid.name)); assert.equal(app.messages[0].parse_mode, undefined);
  const counter = app.sqlite.prepare('SELECT * FROM rate_limits').get(); assert(!counter.ip_hash.includes('192.0.2.1')); assert.equal(counter.ip_hash.length, 64);
});

test('idempotency survives new handler instances and rejects changed payloads', async t => {
  const app = await fixture(t); const key = crypto.randomUUID();
  const first = await (await app.send(valid, {}, key)).json(); await app.flush();
  const second = await createHandler().fetch(new Request('https://test.workers.dev/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(valid) }), app.env, app.ctx);
  assert.equal(second.status, 201); assert.deepEqual(await second.json(), first); await app.flush();
  assert.equal((await app.send({ ...valid, name: 'Другое имя' }, {}, key)).status, 409);
  assert.equal(app.messages.length, 1); assert.equal(app.sqlite.prepare('SELECT COUNT(*) AS n FROM inquiries').get().n, 1);
});

test('concurrent duplicates create one row and one delivery; unique parallel enquiries are retained', async t => {
  const app = await fixture(t); const key = crypto.randomUUID();
  const responses = await Promise.all(Array.from({ length: 6 }, () => app.send(valid, {}, key)));
  assert(responses.every(response => response.status === 201)); await app.flush(); assert.equal(app.messages.length, 1);
  const unique = await Promise.all(Array.from({ length: 10 }, (_, index) => app.send(valid, { 'CF-Connecting-IP': `192.0.2.${index + 20}` })));
  assert(unique.every(response => response.status === 201)); await app.flush();
  assert.equal(app.sqlite.prepare('SELECT COUNT(*) AS n FROM inquiries').get().n, 11);
});

test('validates consent, contacts, selections, honeypot and English enquiries', async t => {
  const app = await fixture(t);
  for (const patch of [{ consent: false }, { contact: 'invalid' }, { name: '' }, { description: 'short' }, { service: 'other' }, { approach: 'other' }, { website: 'spam' }]) assert.equal((await app.send({ ...valid, ...patch })).status, 422);
  assert.equal((await app.send({ ...valid, locale: 'en', contact: 'client@example.test' })).status, 201); await app.flush();
  assert.equal(app.sqlite.prepare('SELECT COUNT(*) AS n FROM inquiries').get().n, 1);
});

test('protects CORS, methods, body size, JSON and idempotency-key format', async t => {
  const app = await fixture(t);
  assert.equal((await app.send(valid, { Origin: 'https://unrelated.example' })).status, 403);
  assert.equal((await app.send(valid, { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await app.send(valid, {}, 'short')).status, 400);
  assert.equal((await app.send({ ...valid, description: 'x'.repeat(17000) })).status, 413);
  assert.equal((await app.handler.fetch(new Request('https://test.workers.dev/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }), app.env, app.ctx)).status, 400);
  assert.equal((await app.handler.fetch(new Request('https://test.workers.dev/api/inquiries'), app.env, app.ctx)).status, 405);
  assert.equal((await app.handler.fetch(new Request('https://test.workers.dev/.data/inquiries.ndjson'), app.env, app.ctx)).status, 404);
  const preflight = await app.handler.fetch(new Request('https://test.workers.dev/api/inquiries', { method: 'OPTIONS', headers: { Origin: 'https://dubas.web.app' } }), app.env, app.ctx);
  assert.equal(preflight.status, 204); assert(preflight.headers.get('Access-Control-Allow-Headers').includes('Idempotency-Key'));
});

test('durable rate limiting resets after ten minutes and permits a verified replay', async t => {
  const app = await fixture(t); const key = crypto.randomUUID();
  await app.send(valid, {}, key);
  for (let n = 1; n < 8; n++) assert.equal((await app.send()).status, 201);
  const limited = await app.send(); assert.equal(limited.status, 429); assert.equal(limited.headers.get('Retry-After'), '600');
  assert.equal((await app.send(valid, {}, key)).status, 201); await app.flush();
  app.advance(600001); assert.equal((await app.send()).status, 201); await app.flush();
});

test('database failure never acknowledges storage; health checks require configuration and migration', async t => {
  const app = await fixture(t); const request = () => new Request('https://test.workers.dev/health');
  assert.equal((await app.handler.fetch(request(), app.env, app.ctx)).status, 200);
  assert.equal((await app.handler.fetch(request(), { ...app.env, TELEGRAM_BOT_TOKEN: '' }, app.ctx)).status, 503);
  app.env.DB = { prepare() { throw new Error('unavailable'); } };
  assert.equal((await app.send()).status, 503);
  assert.equal((await app.handler.fetch(request(), app.env, app.ctx)).status, 503);
  assert.equal(app.messages.length, 0);
});

test('Telegram downtime preserves the enquiry, observes retry_after, and scheduled delivery recovers', async t => {
  let calls = 0;
  const app = await fixture(t, { fetcher: async () => ++calls === 1 ? Response.json({ ok: false, parameters: { retry_after: 900 } }, { status: 429 }) : Response.json({ ok: true }) });
  assert.equal((await app.send()).status, 201); await app.flush();
  let row = app.sqlite.prepare('SELECT * FROM inquiries').get(); assert.equal(row.notification_status, 'pending'); assert.equal(row.next_attempt_at, app.now() + 900000);
  app.advance(600000); await app.handler.scheduled({}, app.env, app.ctx); await app.flush(); assert.equal(calls, 1);
  app.advance(300000); await app.handler.scheduled({}, app.env, app.ctx); await app.flush();
  row = app.sqlite.prepare('SELECT * FROM inquiries').get(); assert.equal(row.notification_status, 'sent'); assert.equal(calls, 2);
});

test('uncertain Telegram responses retry without leaking request contents into stored errors', async t => {
  const app = await fixture(t, { fetcher: async () => { throw new Error('token and private contact must not be logged'); } });
  await app.send(); await app.flush();
  assert.equal(app.sqlite.prepare('SELECT last_error FROM inquiries').get().last_error, 'delivery_unconfirmed');
});

test('delivery leases are recovered, retries end after a day, and retention cleanup removes private data', async t => {
  const app = await fixture(t); const response = await (await app.send()).json(); await app.flush();
  app.sqlite.prepare("UPDATE inquiries SET notification_status='sending', lease_until=?, lease_token='stale' WHERE id=?").run(app.now() - 1, response.id);
  await app.handler.scheduled({}, app.env, app.ctx); await app.flush();
  assert.equal(app.sqlite.prepare('SELECT notification_status FROM inquiries').get().notification_status, 'sent');
  app.sqlite.exec("UPDATE inquiries SET notification_status='pending'");
  app.advance(86400001); await app.handler.scheduled({}, app.env, app.ctx); await app.flush();
  assert.equal(app.sqlite.prepare('SELECT notification_status FROM inquiries').get().notification_status, 'failed');
  app.advance(retentionMs); await app.handler.scheduled({}, app.env, app.ctx); await app.flush();
  assert.equal(app.sqlite.prepare('SELECT COUNT(*) AS n FROM inquiries').get().n, 0); assert.equal(app.sqlite.prepare('SELECT COUNT(*) AS n FROM rate_limits').get().n, 0);
});

test('long Telegram messages split without corrupting Unicode; confirmed parts are not resent', async t => {
  const app = await fixture(t); await app.send(); await app.flush();
  const row = app.sqlite.prepare('SELECT * FROM inquiries').get(); row.payload = JSON.stringify({ ...valid, description: '😀'.repeat(4000) });
  const parts = telegramParts(row); assert(parts.length > 1); assert(parts.every(part => part.length <= 3500 && !/[\uD800-\uDBFF]$/.test(part)));
  app.sqlite.prepare("UPDATE inquiries SET payload=?, notification_status='pending', sent_parts=1 WHERE id=?").run(row.payload, row.id);
  const sent = [];
  await deliver(createStore(app.db), app.env, row.id, { now: app.now, fetcher: async (_url, init) => { sent.push(JSON.parse(init.body).text); return Response.json({ ok: true }); } });
  assert.deepEqual(sent, parts.slice(1));
});

test('IP hashing uses a secret; production builds reject missing and fixture identity', async () => {
  assert.notEqual(await hashIp('192.0.2.1', 'first'), await hashIp('192.0.2.1', 'second'));
  assert.throws(() => productionConfig({}), /NEXT_PUBLIC_SITE_URL/);
  assert.throws(() => productionConfig(ciFixture), /must be real/);
});
