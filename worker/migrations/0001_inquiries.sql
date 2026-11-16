CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  request_key TEXT NOT NULL UNIQUE,
  payload_hash TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  notification_deadline INTEGER NOT NULL,
  notification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (notification_status IN ('pending', 'sending', 'sent', 'failed')),
  next_attempt_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  sent_parts INTEGER NOT NULL DEFAULT 0,
  lease_until INTEGER NOT NULL DEFAULT 0,
  lease_token TEXT,
  last_error TEXT
);
CREATE INDEX IF NOT EXISTS inquiries_delivery ON inquiries(notification_status, next_attempt_at);
CREATE INDEX IF NOT EXISTS inquiries_expiry ON inquiries(expires_at);

CREATE TABLE IF NOT EXISTS rate_limits (
  ip_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS rate_limits_expiry ON rate_limits(expires_at);
