const serviceNames = { shop: 'Интернет-магазин', 'business-card': 'Сайт-визитка', landing: 'Лендинг', 'multi-page': 'Многостраничный сайт', unsure: 'Пока не определён' };
const approachNames = { template: 'На основе шаблона', custom: 'Индивидуальная разработка', unsure: 'Пока не определён' };

export function telegramParts(row) {
  const value = JSON.parse(row.payload);
  const message = [`Заявка Dubas № ${row.id}`, `Дата: ${new Date(row.created_at).toISOString()}`, `Имя: ${value.name}`, `Контакт: ${value.contact}`,
    `Услуга: ${serviceNames[value.service]}`, `Подход: ${approachNames[value.approach]}`, `Язык: ${value.locale}`, '', value.description].join('\n');
  // Count UTF-16 units conservatively, retaining complete Unicode code points.
  const parts = []; let part = '';
  for (const character of message) {
    if (part.length + character.length > 3500) { parts.push(part); part = ''; }
    part += character;
  }
  if (part) parts.push(part);
  return parts;
}

export async function deliver(store, env, id, { now = Date.now, fetcher = fetch } = {}) {
  const row = await store.claim(id, now());
  if (!row) return;
  const parts = telegramParts(row);
  try {
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) throw { code: 'telegram_not_configured' };
    for (let index = row.sent_parts; index < parts.length; index++) {
      const response = await fetcher(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(8000),
        body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: parts[index], link_preview_options: { is_disabled: true } }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok !== true) {
        const seconds = Number(result?.parameters?.retry_after);
        throw { code: `telegram_${response.status}`, retryMs: Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds * 1000, 86400000) : 600000 };
      }
      await store.progress(id, row.lease_token, index + 1);
    }
    await store.finish(id, row.lease_token, 'sent', now());
  } catch (error) {
    const next = now() + (error?.retryMs || 600000);
    const code = /^telegram_(\d{3}|not_configured)$/.test(error?.code || '') ? error.code : 'delivery_unconfirmed';
    await store.finish(id, row.lease_token, next >= row.notification_deadline ? 'failed' : 'pending', next, code);
  }
}
