'use client';

import Link from 'next/link';
import { BelarusianRuble } from './BelarusianRuble';
import { useEffect, useState } from 'react';
import { homePath, type Locale } from '@/lib/content';
import { serviceIds, serviceInfo, servicePath, servicePrices, servicesCopy, formatPrice, type ServiceId, type DevelopmentApproach } from '@/lib/services';
import { useInquiry } from './InquiryProvider';
import { ApproachPicker } from './Services';
import { ServicePreview } from './ServicePreview';
import styles from './ServiceDetail.module.css';

export function ServiceDetail({ locale, id }: { locale: Locale; id: ServiceId }) {
  const t = servicesCopy[locale];
  const service = serviceInfo(locale, id);
  const format = t.formats[id];
  const { draft, setDraft } = useInquiry();
  const approach: DevelopmentApproach = draft.approach === 'custom' ? 'custom' : 'template';
  useEffect(() => { setDraft(previous => ({ ...previous, service: id })); }, [id, setDraft]);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const plan = format[approach];
  const discuss = () => setDraft({ service: id, approach });
  const ru = locale === 'ru';
  return <div className={styles.content} data-approach={approach}>
    <Link className={styles.back} href={`${homePath(locale)}#services`}>← {t.back}</Link>
    <section className={styles.hero} aria-labelledby="service-title"><div><p className={styles.eyebrow}>{service.title}</p><h1 id="service-title">{format.headline}</h1><p className={styles.heroText}>{service.text}</p></div><aside className={styles.priceCard}><span>{t.approach[approach].title}</span><p data-price={servicePrices[id][approach]}>{t.from} <strong>{formatPrice(servicePrices[id][approach])}</strong> <BelarusianRuble locale={locale} /></p><a href="#contact" onClick={discuss}>{t.discuss}<span aria-hidden="true">↗</span></a><small>{ru ? 'Начальная стоимость. Состав проекта согласуем до старта.' : 'Starting price. Scope is agreed before the project begins.'}</small></aside></section>
    <ApproachPicker locale={locale} />
    <section className={styles.example} aria-labelledby="example-title"><div className={styles.exampleHeading}><div><p className={styles.eyebrow}>{t.exampleLabel}</p><h2 id="example-title">{t.exampleTitle}</h2></div><div className={styles.devices} role="group" aria-label={ru ? 'Размер примера' : 'Example viewport'}><button type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}><span aria-hidden="true">▱</span>{ru ? 'Компьютер' : 'Desktop'}</button><button type="button" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}><span aria-hidden="true">▯</span>{ru ? 'Телефон' : 'Mobile'}</button></div></div><p className={styles.hint}>{t.demoHint}</p><div className={styles.demoStage}><div className={styles.demoViewport} data-device={device}><ServicePreview id={id} approach={approach} locale={locale} interactive /></div></div><p className={styles.exampleNote}>{t.exampleNote} {t.demoNotice}</p></section>
    <section className={styles.scope}><div><p className={styles.eyebrow}>{t.forWhom}</p><h2>{service.title}</h2><p>{format.audience}</p></div><div className={styles.scopeCard}><p className={styles.eyebrow}>{t.includes}</p><h3>{t.approach[approach].title}</h3><p>{plan.text}</p><ul>{plan.items.map(item => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul></div></section>
    <section className={styles.comparison}><h2>{t.compare}</h2><p>{t.compareIntro}</p><div className={styles.comparisonGrid}>{(['template', 'custom'] as const).map(key => <article key={key} data-selected={approach === key}><p className={styles.eyebrow}>{t.approach[key].kicker}</p><h3>{t.approach[key].title}</h3><p>{t.approach[key].reason}</p><ul>{t.approach[key].facts.map(fact => <li key={fact}>↗ {fact}</li>)}</ul><p className={styles.comparisonPrice}>{t.from} <strong>{formatPrice(servicePrices[id][key])}</strong> <BelarusianRuble locale={locale} /></p><button type="button" aria-pressed={approach === key} onClick={() => setDraft(previous => ({ ...previous, approach: key }))}>{approach === key ? (ru ? 'Выбран этот подход' : 'Selected approach') : (ru ? 'Посмотреть этот вариант' : 'Explore this approach')}<span aria-hidden="true">{approach === key ? '✓' : '↗'}</span></button></article>)}</div><p className={styles.exampleNote}>{t.currencyNote}</p></section>
    <section className={styles.other}><h2>{ru ? 'Или другой формат?' : 'Another format in mind?'}</h2><div>{serviceIds.filter(other => other !== id).map(other => <Link href={servicePath(locale, other)} key={other} onClick={() => setDraft(previous => ({ ...previous, service: other }))}><span>{serviceInfo(locale, other).title}</span><small>{t.from} {formatPrice(servicePrices[other][approach])} <BelarusianRuble locale={locale} /></small><span aria-hidden="true">↗</span></Link>)}</div></section>
  </div>;
}
