import { randomUUID } from 'node:crypto';
import { validateInquiry, consentVersion } from '../src/lib/inquiry-schema.mjs';
import { createInquiryStore, retentionDays } from './inquiry-store.mjs';

export function createInquiryApi({ directory, allowedOrigins = [], limit = 8, windowMs = 10 * 60 * 1000 }) {
  const store = createInquiryStore(directory);
  const attempts = new Map();
  const expiryTimers = new Set();
  // A daily prune also expires requests when nobody submits a new enquiry.
  const pruning = setInterval(() => { store.prune().catch(() => console.error('Inquiry retention cleanup failed.')); }, 24 * 60 * 60 * 1000);
  pruning.unref();
  store.prune().catch(() => console.error('Inquiry storage is not ready.'));

  function json(res, status, body, extra = {}) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra });
    res.end(JSON.stringify(body));
  }

  async function handle(req, res) {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname !== '/api/inquiries') return false;
    const origin = req.headers.origin;
    const sameOrigin = origin === `http://${req.headers.host}` || origin === `https://${req.headers.host}`;
    if (origin && !sameOrigin && !allowedOrigins.includes(origin)) { json(res, 403, { error: 'origin' }); return true; }
    if (origin) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' }); res.end(); return true;
    }
    if (req.method !== 'POST') { json(res, 405, { error: 'method' }, { Allow: 'POST, OPTIONS' }); return true; }
    if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') { json(res, 415, { error: 'content_type' }); return true; }
    if (Number(req.headers['content-length']) > 16384) { json(res, 413, { error: 'too_large' }); return true; }

    const now = Date.now();
    for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
    const ip = req.socket.remoteAddress || 'unknown';
    const existingAttempt = attempts.get(ip);
    const attempt = existingAttempt || { count: 0, until: now + windowMs };
    if (attempt.count >= limit || (!attempts.has(ip) && attempts.size >= 2000)) { json(res, 429, { error: 'rate_limit' }, { 'Retry-After': String(Math.ceil(windowMs / 1000)) }); return true; }
    attempt.count++; attempts.set(ip, attempt);
    if (!existingAttempt) {
      const timer = setTimeout(() => { if (attempts.get(ip) === attempt) attempts.delete(ip); expiryTimers.delete(timer); }, windowMs);
      timer.unref(); expiryTimers.add(timer);
    }

    const chunks = [];
    let size = 0;
    let oversized = false;
    try {
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 16384) { oversized = true; chunks.length = 0; }
        if (!oversized) chunks.push(chunk);
      }
      if (oversized) { json(res, 413, { error: 'too_large' }); return true; }
      let data;
      try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
      catch { json(res, 400, { error: 'invalid_json' }); return true; }
      const result = validateInquiry(data);
      if (!result.valid) { json(res, 422, { error: 'validation', fields: Object.keys(result.errors).filter(key => key !== 'website') }); return true; }
      const createdAt = new Date().toISOString();
      const id = randomUUID();
      await store.save({ id, createdAt, expiresAt: new Date(Date.now() + retentionDays * 86400000).toISOString(), ...result.value, consentVersion });
      json(res, 201, { id, status: 'saved' });
    } catch {
      // Do not print request contents or contact details in server logs.
      json(res, 503, { error: 'storage_unavailable' });
    }
    return true;
  }
  return { handle, close: () => { clearInterval(pruning); for (const timer of expiryTimers) clearTimeout(timer); expiryTimers.clear(); attempts.clear(); } };
}
