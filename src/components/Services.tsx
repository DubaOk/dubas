'use client';

import { BelarusianRuble } from './BelarusianRuble';
import { copy, type Locale } from '@/lib/content';
import { approachCopy } from '@/lib/approach-content';
import { serviceIds, serviceInfo, servicePrices, servicesCopy, formatPrice, type DevelopmentApproach, type ServiceId } from '@/lib/services';
import { useInquiry } from './InquiryProvider';
import styles from './Services.module.css';
import siteStyles from './Site.module.css';

const approaches = ['template', 'custom'] as const;

function Price({ value, locale }: { value: number; locale: Locale }) {
  return <span className={styles.price} data-price={value}>
    <span>{servicesCopy[locale].from}</span><strong>{formatPrice(value)}</strong><BelarusianRuble locale={locale} />
  </span>;
}

function ApproachDiagram({ approach }: { approach: DevelopmentApproach }) {
  return <span className={styles.diagram} data-kind={approach} aria-hidden="true">
    {approach === 'template'
      ? <><span className={styles.sourceSheet}><i /><i /><i /><i /></span><span className={styles.diagramArrow}>→</span><span className={styles.brandedSheet}><i /><i /><i /><i /></span></>
      : <><span className={styles.designGrid}><i /><i /><i /><i /><i /></span><span className={styles.designCursor}>↖</span><span className={styles.designSeal}>✳</span></>}
  </span>;
}

export function ApproachPicker({ locale, serviceId, showIntro = true }: { locale: Locale; serviceId?: ServiceId; showIntro?: boolean }) {
  const t = approachCopy[locale];
  const { draft, setDraft } = useInquiry();
  const approach = draft.approach === 'custom' ? 'custom' : 'template';
  return <div className={styles.approachPicker} id="development-approaches">
    {showIntro && <div className={styles.pickerIntro}><h3>{t.intro}</h3><p>{t.explanation}</p></div>}
    <div className={styles.budgetSummary}>{approaches.map(key => <div key={key}><span>{t[key].title}</span><Price value={serviceId ? servicePrices[serviceId][key] : Math.min(...serviceIds.map(id => servicePrices[id][key]))} locale={locale} /></div>)}</div>
    <div className={styles.offers} role="group" aria-label={servicesCopy[locale].approachLabel}>
      {approaches.map(key => {
        const offer = t[key];
        const minimum = serviceId ? servicePrices[serviceId][key] : Math.min(...serviceIds.map(id => servicePrices[id][key]));
        return <button type="button" className={styles.offer} data-kind={key} aria-pressed={approach === key}
          aria-label={`${offer.title}: ${servicesCopy[locale].from} ${formatPrice(minimum)} BYN`}
          aria-describedby={`${key}-approach-description ${key}-approach-boundary`}
          aria-controls={serviceId ? undefined : 'service-options'}
          onClick={() => {
            setDraft(previous => ({ ...previous, approach: key }));
            if (!serviceId) requestAnimationFrame(() => document.getElementById('service-options')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }));
          }} key={key}>
          <span className={styles.offerTop}><span>{offer.label}</span><span className={styles.selectionMark} aria-hidden="true">{approach === key ? '✓' : '+'}</span></span>
          <span className={styles.offerTitle}>{offer.title}</span>
          <span className={styles.offerSummary}>{offer.summary}</span>
          <span className={styles.offerMain}><span><span className={styles.priceLabel}>{t.starting}</span><Price value={minimum} locale={locale} /></span><ApproachDiagram approach={key} /></span>
          <span className={styles.offerDescription} id={`${key}-approach-description`}>{offer.description}</span>
          <span className={styles.offerFacts}>{offer.facts.map((fact, index) => <span key={fact}><span aria-hidden="true">0{index + 1}</span>{fact}</span>)}</span>
          <span className={styles.offerBoundary} id={`${key}-approach-boundary`}>{offer.boundary}</span>
          <span className={styles.offerAction}>{approach === key ? (serviceId ? t.selectedDetail : t.selected) : (serviceId ? t.chooseDetail : t.choose)}<span aria-hidden="true">{serviceId ? (approach === key ? '✓' : '+') : '↓'}</span></span>
        </button>;
      })}
    </div>
  </div>;
}

export function Services({ locale }: { locale: Locale }) {
  const t = servicesCopy[locale];
  const experience = approachCopy[locale];
  const { draft, setDraft } = useInquiry();
  const approach: DevelopmentApproach = draft.approach === 'custom' ? 'custom' : 'template';
  const other = approach === 'template' ? 'custom' : 'template';
  const selected = experience[approach];
  return <>
    <ApproachPicker locale={locale} showIntro={false} />
    <p className={styles.srOnly} role="status">{`${selected.title}. ${selected.payment}`}</p>
    <div id="service-options" className={styles.workspace} data-approach={approach}>
      <div className={styles.workspaceContent} key={approach}>
        <div className={styles.workspaceBar}><span>{selected.title}</span><button type="button" onClick={() => document.getElementById('development-approaches')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })}>{experience.change}</button></div>
        <div className={styles.workspaceHeading}>
          <div><p className={styles.kicker}>{selected.label}</p><h3>{selected.heading}</h3><p>{selected.detail}</p></div>
          <div className={styles.payment}><span>{experience.included}</span><p>{selected.payment}</p></div>
        </div>
        <ol className={styles.workflow} aria-label={experience.steps}>{selected.process.map((step, index) => <li key={step}><span>0{index + 1}</span><p>{step}</p><span className={styles.stepArrow} aria-hidden="true">→</span></li>)}</ol>
        <div className={styles.formatHeading}><span>{experience.formats}</span><span>04</span></div>
        <div className={styles.cards}>{serviceIds.map((id, index) => {
          const service = serviceInfo(locale, id);
          const plan = t.formats[id][approach];
          const prices = servicePrices[id];
          const difference = prices.custom - prices.template;
          const percent = Math.round(difference / prices.custom * 100);
          return <article className={styles.card} key={id} data-service={id}>
            <div className={styles.cardIdentity}><span className={styles.cardNumber}>0{index + 1}</span><div><p className={styles.cardLabel}>{service.note}</p><h4>{service.title}</h4></div><span className={styles.cardSymbol} aria-hidden="true">{approach === 'template' ? '▤' : '✳'}</span></div>
            <div className={styles.planCopy}><p>{plan.text}</p><ul aria-label={experience.scope}>{plan.items.map(item => <li key={item}><span aria-hidden="true">↗</span>{item}</li>)}</ul></div>
            <div className={styles.cardBudget}>
              <div className={styles.priceComparison}><div><span className={styles.priceLabel}>{selected.title}</span><Price value={prices[approach]} locale={locale} /></div><div className={styles.alternative}><span>{selected.otherPrice}</span><span>{t.from} {formatPrice(prices[other])} <BelarusianRuble locale={locale} /></span></div></div>
              <p className={styles.priceDifference}>{approach === 'template' ? experience.saving(formatPrice(difference), percent) : experience.extra(formatPrice(difference))}</p>
              <a className={styles.cardAction} href="#contact" onClick={() => setDraft({ service: id, approach })} aria-label={`${selected.action}: ${service.title}`}>{selected.action}<span aria-hidden="true">↗</span></a>
            </div>
          </article>;
        })}</div>
      </div>
    </div>
    <p className={styles.priceNote}>{experience.priceNote} {t.currencyNote}</p>
    <div className={siteStyles.included}><span aria-hidden="true">✦</span><h3>{copy[locale].included}</h3><p>{copy[locale].includedText}</p></div>
  </>;
}
