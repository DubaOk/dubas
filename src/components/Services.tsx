'use client';

import { copy, type Locale } from '@/lib/content';
import { useInquiry } from './InquiryProvider';
import styles from './Site.module.css';
import formStyles from './Inquiry.module.css';

export function Services({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const { draft, setDraft } = useInquiry();
  const approach = draft.approach === 'template' ? 'template' : 'custom';
  return <>
    <div className={formStyles.approachPicker}>
      <div className={formStyles.approachButtons} role="group" aria-label={t.approachLabelShort}>
        {(['template', 'custom'] as const).map(key => <button type="button" key={key} aria-pressed={approach === key} onClick={() => setDraft(previous => ({ ...previous, approach: key }))}><span aria-hidden="true">{key === 'template' ? '▤' : '✳'}</span>{t.development[key].title}</button>)}
      </div>
      <p>{t.development[approach].text}</p>
    </div>
    <div className={styles.servicesGrid}>{t.services.map((service, i) => <article className={`${styles.service} ${formStyles.serviceCard}`} key={service.id}>
      <div className={styles.serviceTop}><span className={formStyles.serviceSymbol} aria-hidden="true">{['↗', '⌘', '▤', '✳'][i]}</span><span className={styles.smallNumber}>0{i + 1}</span></div>
      <p className={styles.serviceNote}>{service.note}</p><h3>{service.title}</h3><p>{service.text}</p>
      <ul>{service.items.map(item => <li key={item}><span aria-hidden="true">↗</span>{item}</li>)}</ul>
      <a href="#contact" className={styles.serviceLink} onClick={() => setDraft({ service: service.id, approach })}>{t.estimateProject}<span aria-hidden="true">↗</span></a>
    </article>)}</div>
    <div className={styles.included}><span aria-hidden="true">✦</span><h3>{t.included}</h3><p>{t.includedText}</p></div>
  </>;
}
