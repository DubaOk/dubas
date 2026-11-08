import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { createInquiryApi } from '../scripts/inquiry-api.mjs';
import { createInquiryStore } from '../scripts/inquiry-store.mjs';

const valid = { name: 'Тестовый посетитель', contact: 'visitor@example.test', description: 'Нужен сайт с каталогом и формой обращения.', service: 'shop', approach: 'template', consent: true, locale: 'ru', website: '' };

async function fixture(t, options = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'nodra-inquiry-test-'));
  const api = createInquiryApi({ directory, limit: 100, ...options });
  const server = createServer(async (req, res) => { if (!await api.handle(req, res)) { res.writeHead(404); res.end(); } });
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    api.close(); server.closeAllConnections();
    await new Promise(done => server.close(done));
    const target = resolve(directory);
    if (dirname(target) !== resolve(tmpdir()) || !basename(target).startsWith('nodra-inquiry-test-')) throw new Error('Unexpected test cleanup path.');
    await rm(target, { recursive: true, force: true });
  });
  return { directory, base, send: (payload = valid, headers = {}) => fetch(`${base}/api/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(payload) }) };
}

test('saves a Unicode enquiry with the chosen service, approach and consent record', async t => {
  const app = await fixture(t);
  const response = await app.send();
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.status, 'saved');
  assert.deepEqual(Object.keys(result).sort(), ['id', 'status']);
  const entry = JSON.parse((await readFile(join(app.directory, 'inquiries.ndjson'), 'utf8')).trim());
  assert.equal(entry.id, result.id);
  assert.equal(entry.name, valid.name);
  assert.equal(entry.description, valid.description);
  assert.equal(entry.service, 'shop');
  assert.equal(entry.approach, 'template');
  assert.equal(entry.consent, true);
  assert.ok(entry.consentVersion);
  assert.ok(Date.parse(entry.expiresAt) > Date.parse(entry.createdAt));
  assert.equal(entry.ip, undefined);
});

test('rejects missing consent, invalid contacts and invalid selections without storing them', async t => {
  const app = await fixture(t);
  for (const patch of [{ consent: false }, { name: ' ' }, { contact: 'not a contact' }, { description: 'short' }, { service: 'unknown' }, { approach: 'unknown' }]) {
    const response = await app.send({ ...valid, ...patch });
    assert.equal(response.status, 422);
  }
  assert.equal((await readFile(join(app.directory, 'inquiries.ndjson'), 'utf8')).trim(), '');
});

test('accepts formatted phone numbers and both locales', async t => {
  const app = await fixture(t);
  assert.equal((await app.send({ ...valid, contact: '+375 (29) 123-45-67', locale: 'en' })).status, 201);
});

test('denies foreign origins and public access to saved enquiries', async t => {
  const app = await fixture(t);
  assert.equal((await app.send(valid, { Origin: 'https://unrelated.example' })).status, 403);
  assert.equal((await fetch(`${app.base}/api/inquiries`)).status, 405);
  assert.equal((await fetch(`${app.base}/.data/inquiries.ndjson`)).status, 404);
});

test('rejects honeypot submissions, malformed JSON, unsupported bodies and oversized requests', async t => {
  const app = await fixture(t);
  assert.equal((await app.send({ ...valid, website: 'https://spam.example' })).status, 422);
  assert.equal((await fetch(`${app.base}/api/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
  assert.equal((await fetch(`${app.base}/api/inquiries`, { method: 'POST', body: 'name=test' })).status, 415);
  assert.equal((await app.send({ ...valid, description: 'a'.repeat(20000) })).status, 413);
});

test('preserves every successful concurrent submission', async t => {
  const app = await fixture(t);
  const responses = await Promise.all(Array.from({ length: 10 }, (_, i) => app.send({ ...valid, name: `Test visitor ${i}` })));
  assert.ok(responses.every(response => response.status === 201));
  const entries = (await readFile(join(app.directory, 'inquiries.ndjson'), 'utf8')).trim().split('\n').map(JSON.parse);
  assert.equal(entries.length, 10);
  assert.equal(new Set(entries.map(entry => entry.id)).size, 10);
});

test('rate limits repeated attempts', async t => {
  const app = await fixture(t, { limit: 2 });
  assert.equal((await app.send()).status, 201);
  assert.equal((await app.send()).status, 201);
  const response = await app.send();
  assert.equal(response.status, 429);
  assert.ok(response.headers.get('retry-after'));
});

test('prunes expired entries while keeping current ones', async t => {
  const app = await fixture(t);
  const dataDirectory = join(app.directory, 'retention');
  await mkdir(dataDirectory);
  await writeFile(join(dataDirectory, 'inquiries.ndjson'), [{ id: 'expired', expiresAt: '2020-01-01T00:00:00Z' }, { id: 'current', expiresAt: '2099-01-01T00:00:00Z' }].map(JSON.stringify).join('\n'));
  await createInquiryStore(dataDirectory).prune();
  const entries = (await readFile(join(dataDirectory, 'inquiries.ndjson'), 'utf8')).trim().split('\n').map(JSON.parse);
  assert.deepEqual(entries.map(entry => entry.id), ['current']);
});

test('reports unavailable storage rather than a successful submission', async t => {
  const app = await fixture(t);
  const blocked = join(app.directory, 'blocked');
  await writeFile(blocked, 'not a directory');
  const api = createInquiryApi({ directory: blocked });
  const server = createServer((req, res) => api.handle(req, res));
  await new Promise(done => server.listen(0, '127.0.0.1', done));
  t.after(async () => { api.close(); server.closeAllConnections(); await new Promise(done => server.close(done)); });
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/inquiries`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(valid) });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, 'storage_unavailable');
});
