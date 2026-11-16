export const retentionMs = 90 * 86400000;
export const deliveryWindowMs = 86400000;

export function createStore(db) {
  return {
    find: key => db.prepare('SELECT * FROM inquiries WHERE request_key = ?').bind(key).first(),
    async save({ id, key, hash, value, now }) {
      // A unique key arbitrates concurrent submissions; payload comparison happens after insertion.
      await db.prepare(`INSERT INTO inquiries
        (id, request_key, payload_hash, payload, created_at, expires_at, notification_deadline, next_attempt_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(request_key) DO NOTHING`)
        .bind(id, key, hash, JSON.stringify(value), now, now + retentionMs, now + deliveryWindowMs, now).run();
      return this.find(key);
    },
    async rateLimit(ipHash, now) {
      return db.prepare(`INSERT INTO rate_limits(ip_hash, attempts, expires_at) VALUES (?, 1, ?)
        ON CONFLICT(ip_hash) DO UPDATE SET
          attempts = CASE WHEN rate_limits.expires_at <= ? THEN 1 ELSE MIN(rate_limits.attempts + 1, 9) END,
          expires_at = CASE WHEN rate_limits.expires_at <= ? THEN excluded.expires_at ELSE rate_limits.expires_at END
        RETURNING attempts, expires_at`).bind(ipHash, now + 600000, now, now).first();
    },
    async claim(id, now) {
      const token = crypto.randomUUID();
      return db.prepare(`UPDATE inquiries SET notification_status = 'sending', lease_until = ?, lease_token = ?, attempts = attempts + 1
        WHERE id = ? AND expires_at > ? AND notification_deadline > ? AND next_attempt_at <= ?
        AND (notification_status = 'pending' OR (notification_status = 'sending' AND lease_until <= ?))
        RETURNING *`).bind(now + 120000, token, id, now, now, now, now).first();
    },
    async progress(id, token, parts) {
      const result = await db.prepare(`UPDATE inquiries SET sent_parts = ? WHERE id = ? AND lease_token = ? AND notification_status = 'sending'`)
        .bind(parts, id, token).run();
      if (!result.meta.changes) throw new Error('delivery_lease_lost');
    },
    async finish(id, token, status, nextAttempt, error = null) {
      await db.prepare(`UPDATE inquiries SET notification_status = ?, next_attempt_at = ?, last_error = ?, lease_until = 0, lease_token = NULL
        WHERE id = ? AND lease_token = ?`).bind(status, nextAttempt, error, id, token).run();
    },
    async due(now) {
      return (await db.prepare(`SELECT id FROM inquiries WHERE expires_at > ? AND notification_deadline > ? AND next_attempt_at <= ?
        AND (notification_status = 'pending' OR (notification_status = 'sending' AND lease_until <= ?))
        ORDER BY next_attempt_at LIMIT 20`).bind(now, now, now, now).all()).results;
    },
    async prune(now) {
      await db.batch([
        db.prepare('DELETE FROM inquiries WHERE expires_at <= ?').bind(now),
        db.prepare('DELETE FROM rate_limits WHERE expires_at <= ?').bind(now),
        db.prepare(`UPDATE inquiries SET notification_status = 'failed', last_error = 'delivery_window_expired', lease_token = NULL, lease_until = 0
          WHERE notification_deadline <= ? AND notification_status IN ('pending', 'sending') AND lease_until <= ?`).bind(now, now),
      ]);
    },
  };
}
