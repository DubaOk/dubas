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
  const submission = useRef<{ fingerprint: string; key: string } | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!saved || !success.current) return;
    success.current.focus({ preventScroll: true });
    success.current.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [saved]);

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
    const fingerprint = JSON.stringify(payload);
    if (!submission.current || submission.current.fingerprint !== fingerprint) {
      submission.current = { fingerprint, key: crypto.randomUUID() };
    }
    setErrors({}); pending.current = true; setSending(true);
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 15000);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_INQUIRY_ENDPOINT || '/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': submission.current.key }, body: JSON.stringify(payload), signal: controller.current.signal });
      const body = await response.json();
      if (response.status === 422 && Array.isArray(body.fields) && body.fields.length) { markErrors(body.fields); return; }
      if (response.status === 429) { setRequestError(t.rateLimit); return; }
      if (!response.ok || body.status !== 'saved' || typeof body.id !== 'string') throw new Error('Delivery was not confirmed.');
      setSaved(true);
      submission.current = null;
    } catch { setRequestError(t.error); }
    finally { clearTimeout(timeout); pending.current = false; setSending(false); }
  }

  const required = <span className={styles.required} aria-label={t.required}>*</span>;
  return <div className={styles.formCard}>
    {saved ? <div className={styles.success} ref={success} tabIndex={-1} role="status" aria-labelledby="inquiry-success-title">
      <svg className={styles.successArt} viewBox="0 0 200 174" fill="none" aria-hidden="true">
        <circle cx="91" cy="85" r="62" fill="#C5B0EC" />
        <path d="m160 15 5 14 14-5-8 13 13 8-15 1 1 15-9-12-12 9 5-14-14-5 15-4-4-15 10 11Z" fill="#F5D56B" />
        <g transform="rotate(-9 95 88)">
          <rect x="48" y="29" width="94" height="119" rx="9" fill="#FFFEF9" stroke="#143D32" strokeWidth="1.5" />
          <path d="M66 53h37M66 65h57M66 77h48" stroke="#143D32" strokeOpacity=".25" strokeWidth="3" strokeLinecap="round" />
          <path d="M66 124h24" stroke="#143D32" strokeOpacity=".25" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx="138" cy="126" r="28" fill="#00856A" stroke="#FFFEF9" strokeWidth="4" />
        <path d="m126 126 8 8 16-17" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="29" cy="132" r="6" fill="#00856A" />
      </svg>
      <h3 id="inquiry-success-title">{t.successTitle}</h3>
      <p>{t.successText}</p>
      <button type="button" onClick={() => { setSaved(false); setErrors({}); setRequestError(''); }}>{t.another}<span aria-hidden="true">↗</span></button>
    </div> : <form ref={form} onSubmit={submit} noValidate aria-busy={sending}>
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
