'use client';

import { useState, type CSSProperties } from 'react';
import { copy, type Locale } from '@/lib/content';
import { publicPath } from '@/lib/deployment';
import siteStyles from './Site.module.css';
import styles from './Process.module.css';

function JourneyArt({ stage, locale }: { stage: number; locale: Locale }) {
  const ru = locale === 'ru';
  return <div className={styles.art} data-stage={stage} data-built={stage >= 2} aria-hidden="true">
    <div className={styles.orbit} /><span className={styles.orb} /><span className={styles.spark}>✳</span>
    <div className={styles.window}><div className={styles.chrome}><span><i /><i /><i /></span><small>forma.example</small><span>↗</span></div><div className={styles.mockNav}><b>forma</b><span>{ru ? 'Проекты　Студия　Контакты' : 'Projects　Studio　Contact'}</span></div><div className={styles.mockBody}><div className={styles.mockCopy}><span className={styles.mockEyebrow}>{ru ? 'АРХИТЕКТУРА ЖИЗНИ' : 'ARCHITECTURE FOR LIFE'}</span><h3>{ru ? <>Место,<br />где хочется<br /><em>остаться.</em></> : <>A place<br />to call<br /><em>your own.</em></>}</h3><div className={styles.mockLines}><i /><i /></div><span className={styles.mockButton}>{ru ? 'Наши проекты' : 'Our projects'} ↗</span></div><div className={styles.mockImage}><img src={publicPath('/images/interior.jpg')} alt="" width="1400" height="934" /><span>01 / 03</span></div></div><div className={styles.mockFooter}><span>{ru ? 'ДЕТАЛИ СОЗДАЮТ ЦЕЛОЕ' : 'DETAILS MAKE THE WHOLE'}</span><span>✦</span></div></div>
    <div className={styles.briefNotes}><span><small>{ru ? 'ЗАДАЧА' : 'THE BRIEF'}</small><b>{ru ? 'Показать характер.' : 'Show the character.'}</b><i /><i /></span><span><small>{ru ? 'РЕЗУЛЬТАТ' : 'THE OUTCOME'}</small><b>{ru ? 'Сайт под ваш бизнес.' : 'A site for your business.'}</b><i /><i /></span></div>
    <div className={styles.swatches}><i /><i /><i /><span>Aa</span></div>
    <div className={styles.codeSheet}><span>index.tsx</span><code><i>&lt;Website&gt;</i><span>　&lt;YourStory /&gt;</span><span>　&lt;YourStyle /&gt;</span><i>&lt;/Website&gt;</i></code><b>● {ru ? 'Собираем сайт' : 'Building the website'}</b></div>
    <div className={styles.launch}><span>✓</span>{ru ? 'Можно запускать' : 'Ready to launch'}<i>↗</i></div>
  </div>;
}

export function Process({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const steps = t.process;
  const [active, setActive] = useState(0);
  const previous = () => setActive(step => Math.max(0, step - 1));
  const next = () => setActive(step => Math.min(steps.length - 1, step + 1));
  const ru = locale === 'ru';
  const progress = {
    '--scroll-progress': String((active + 1) / steps.length),
    '--structure-progress': active > 0 ? '1' : '0',
    '--design-progress': active >= 2 ? '1' : '0',
  } as CSSProperties;
  return <section id="process" className={siteStyles.section} aria-labelledby="process-title" onKeyDown={event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
  }}>
    <div className={styles.track} style={progress}>
      <div className={styles.heading}><p>{t.processLabel}</p><h2 id="process-title">{t.processTitle.split('\n').map((line, i) => <span key={line}>{i > 0 && <br />}{line}</span>)}</h2></div>
      <div className={styles.spotlight}>
        <div className={styles.controls} role="group" aria-label={ru ? 'Переключение этапов' : 'Browse the project stages'}><button type="button" onClick={previous} disabled={active === 0} aria-label={ru ? 'Предыдущий этап' : 'Previous stage'} aria-controls="process-stage"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button><button type="button" onClick={next} disabled={active === steps.length - 1} aria-label={ru ? 'Следующий этап' : 'Next stage'} aria-controls="process-stage"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button></div>
        <div className={styles.copy}><p className={styles.counter}><span key={active}>0{active + 1}</span><small> / 05</small></p><div className={styles.descriptions} id="process-stage" aria-live="polite" aria-atomic="true">{steps.map((step, i) => <article key={step.title} data-active={active === i} data-past={i < active} aria-hidden={active !== i}><h3>{step.title}</h3><p>{step.text}</p></article>)}</div><div className={styles.endAction}>{active === steps.length - 1 && <a href="#contact">{t.talk}<span aria-hidden="true">↗</span></a>}</div></div>
        <div className={styles.visual}><JourneyArt stage={active} locale={locale} /></div>
      </div>
      <div className={styles.navigation}>
        <div className={styles.timeline} aria-hidden="true"><div className={styles.timelineFill} /><div>{steps.map((step, i) => <span key={step.title} data-active={active === i} data-complete={active > i}><b>0{i + 1}</b><span>{step.title}</span></span>)}</div></div>
      </div>
    </div>
  </section>;
}
