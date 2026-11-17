'use client';

import { BelarusianRuble } from './BelarusianRuble';
import { copy, type Locale } from '@/lib/content';
import { serviceIds, serviceInfo, servicePrices, servicesCopy, formatPrice, type DevelopmentApproach } from '@/lib/services';
import { useInquiry } from './InquiryProvider';
import { ServiceSketch } from './StudioArt';
import styles from './Services.module.css';
import siteStyles from './Site.module.css';

export function ApproachPicker({ locale }: { locale: Locale }) {
  const t = servicesCopy[locale];
  const { draft, setDraft } = useInquiry();
  const approach = draft.approach === 'custom' ? 'custom' : 'template';
  const current = t.approach[approach];
  return <div className={styles.approachPanel} data-approach={approach}>
    <div className={styles.tabs} role="group" aria-label={t.approachLabel}>{(['template', 'custom'] as const).map(key => <button type="button" key={key} aria-pressed={approach === key} onClick={() => setDraft(previous => ({ ...previous, approach: key }))}><span aria-hidden="true">{key === 'template' ? '▤' : '✳'}</span>{t.approach[key].title}</button>)}</div>
    <div className={styles.approachSummary} key={approach}><div><p className={styles.kicker}>{current.kicker}</p><h3>{current.heading}</h3><p>{current.text}</p></div><ul>{current.facts.map(fact => <li key={fact}><span aria-hidden="true">✓</span>{fact}</li>)}</ul></div>
  </div>;
}

export function Services({ locale }: { locale: Locale }) {
  const t = servicesCopy[locale];
  const { draft, setDraft } = useInquiry();
  const approach: DevelopmentApproach = draft.approach === 'custom' ? 'custom' : 'template';
  return <>
    <ApproachPicker locale={locale} />
    <p className={styles.srOnly} role="status">{t.approach[approach].title}</p>
    <div className={styles.cards} data-approach={approach}>{serviceIds.map((id, index) => {
      const service = serviceInfo(locale, id);
      const plan = t.formats[id][approach];
      return <article className={styles.card} key={id} data-service={id}>
        <div className={styles.cardArt}><ServiceSketch kind={id} /></div>
        <div className={styles.cardBody}><div className={styles.cardLabel}><span>{service.note}</span><span>0{index + 1}</span></div><h3>{service.title}</h3><div className={styles.planCopy} key={approach}><p>{plan.text}</p><ul>{plan.items.map(item => <li key={item}><span aria-hidden="true">↗</span>{item}</li>)}</ul></div><div className={styles.cardBottom}><p className={styles.price} data-price={servicePrices[id][approach]}><span>{t.from}</span><strong>{formatPrice(servicePrices[id][approach])}</strong><span><BelarusianRuble locale={locale} /></span></p><span className={styles.modeLabel}>{t.approach[approach].title}</span></div><div className={styles.cardLinks}><a href="#contact" onClick={() => setDraft({ service: id, approach })}>{copy[locale].estimateProject}<span aria-hidden="true">↗</span></a></div></div>
      </article>;
    })}</div>
    <p className={styles.priceNote}>{t.currencyNote}</p>
    <div className={siteStyles.included}><span aria-hidden="true">✦</span><h3>{copy[locale].included}</h3><p>{copy[locale].includedText}</p></div>
  </>;
}
