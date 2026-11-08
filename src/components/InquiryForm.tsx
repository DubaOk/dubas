'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { privacyPath, type Locale } from '@/lib/content';
import { inquiryCopy } from '@/lib/inquiry-content';
import { validateInquiry } from '@/lib/inquiry-schema.mjs';
import { useInquiry } from './InquiryProvider';
import { publicPath, staticPreview } from '@/lib/deployment';
import styles from './Inquiry.module.css';

export function InquiryForm({ locale }: { locale: Locale }) {
  const t = inquiryCopy[locale];
  const { draft, setDraft } = useInquiry();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [requestError, setRequestError] = useState('');
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const success = useRef<HTMLDivElement>(null);
  const pending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => { if (saved) success.current?.focus(); }, [saved]);

  function markErrors(fields: string[]) {
    const messages: Record<string, string> = {};
    for (const field of fields) messages[field] = t.errors[field as keyof typeof t.errors] || t.error;
    setErrors(messages);
    const input = form.current?.elements.namedItem(fields[0]);
    if (input instanceof HTMLElement) input.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (staticPreview) return;
    if (pending.current) return;
    const data = new FormData(event.currentTarget);
    const payload = { name: data.get('name'), contact: data.get('contact'), description: data.get('description'), service: draft.service, approach: draft.approach, consent: data.get('consent') === 'on', website: data.get('website'), locale };
    const result = validateInquiry(payload);
    setRequestError('');
    if (!result.valid) { markErrors(Object.keys(result.errors)); return; }
    setErrors({}); pending.current = true; setSending(true);
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 15000);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_INQUIRY_ENDPOINT || '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.current.signal });
      const body = await response.json();
      if (response.status === 422 && Array.isArray(body.fields) && body.fields.length) { markErrors(body.fields); return; }
      if (response.status === 429) { setRequestError(t.rateLimit); return; }
      if (!response.ok || body.status !== 'saved' || typeof body.id !== 'string') throw new Error('Delivery was not confirmed.');
      setSaved(true);
    } catch { setRequestError(t.error); }
    finally { clearTimeout(timeout); pending.current = false; setSending(false); }
  }

  const required = <span className={styles.required} aria-label={t.required}>*</span>;
  return <div className={styles.formCard}>
    {saved ? <div className={styles.success} ref={success} tabIndex={-1} role="status"><span className={styles.successMark} aria-hidden="true">✓</span><h3>{t.successTitle}</h3><p>{t.successText}</p><button type="button" onClick={() => { setSaved(false); setErrors({}); setRequestError(''); }}>{t.another}<span aria-hidden="true">↗</span></button></div> : <form ref={form} onSubmit={submit} noValidate aria-busy={sending}>
      <p className={styles.formHeading}>{t.formTitle}<span aria-hidden="true">↗</span></p>
      {staticPreview && <p className={styles.previewNote}>{t.previewNote}</p>}
      <fieldset className={styles.fields} disabled={staticPreview}>
      <div className={styles.field}><label htmlFor="inquiry-name">{t.name} {required}</label><input id="inquiry-name" name="name" autoComplete="name" placeholder={t.namePlaceholder} required maxLength={80} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'error-name' : undefined} />{errors.name && <p id="error-name" className={styles.fieldError}>{errors.name}</p>}</div>
      <div className={styles.field}><label htmlFor="inquiry-contact">{t.contact} {required}</label><input id="inquiry-contact" name="contact" type="text" autoComplete="email" placeholder={t.contactPlaceholder} required maxLength={120} aria-invalid={Boolean(errors.contact)} aria-describedby={errors.contact ? 'error-contact' : undefined} />{errors.contact && <p id="error-contact" className={styles.fieldError}>{errors.contact}</p>}</div>
      <div className={styles.selectRow}><div className={styles.field}><label htmlFor="inquiry-service">{t.service}</label><select id="inquiry-service" name="service" value={draft.service} onChange={event => setDraft(previous => ({ ...previous, service: event.target.value }))} aria-invalid={Boolean(errors.service)} aria-describedby={errors.service ? 'error-service' : undefined}><option value="unsure">{t.unsure}</option>{t.serviceOptions.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select>{errors.service && <p id="error-service" className={styles.fieldError}>{errors.service}</p>}</div><div className={styles.field}><label htmlFor="inquiry-approach">{t.approach}</label><select id="inquiry-approach" name="approach" value={draft.approach} onChange={event => setDraft(previous => ({ ...previous, approach: event.target.value }))} aria-invalid={Boolean(errors.approach)} aria-describedby={errors.approach ? 'error-approach' : undefined}><option value="unsure">{t.unsure}</option>{t.approachOptions.map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select>{errors.approach && <p id="error-approach" className={styles.fieldError}>{errors.approach}</p>}</div></div>
      <div className={styles.field}><label htmlFor="inquiry-description">{t.description} {required}</label><textarea id="inquiry-description" name="description" placeholder={t.descriptionPlaceholder} required minLength={10} maxLength={3000} rows={4} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'error-description' : undefined} />{errors.description && <p id="error-description" className={styles.fieldError}>{errors.description}</p>}</div>
      <div className={styles.honeypot} aria-hidden="true"><label htmlFor="inquiry-website">Website</label><input id="inquiry-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      {!staticPreview && <label className={styles.consent}><input type="checkbox" name="consent" required aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? 'error-consent' : undefined} /><span>{t.consentStart}<a href={publicPath(privacyPath(locale))} target="_blank" rel="noopener noreferrer">{t.privacy}</a>.</span></label>}{errors.consent && <p id="error-consent" className={styles.fieldError}>{errors.consent}</p>}
      {requestError && <p className={styles.requestError} role="alert">{requestError}</p>}
      <button className={styles.submit} type="submit" disabled={sending || staticPreview}>{staticPreview ? t.previewSubmit : sending ? t.sending : t.submit}<span aria-hidden="true">↗</span></button>
      {!staticPreview && <p className={styles.security}><svg aria-hidden="true" viewBox="0 0 20 20" width="15" height="15" fill="none"><rect x="4" y="8" width="12" height="9" rx="2" stroke="currentColor" /><path d="M6.5 8V5a3.5 3.5 0 0 1 7 0v3" stroke="currentColor" /></svg>{t.security}</p>}
      {!staticPreview && <noscript><p>{t.noScript}</p></noscript>}
      </fieldset>
    </form>}
  </div>;
}
