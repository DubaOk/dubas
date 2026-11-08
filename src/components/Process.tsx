'use client';

import { useEffect, useRef, useState } from 'react';
import { copy, type Locale } from '@/lib/content';
import { ProcessArt } from './StudioArt';
import styles from './Site.module.css';

export function Process({ locale }: { locale: Locale }) {
  const steps = copy[locale].process;
  const [active, setActive] = useState(0);
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    if (!list.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (visible.length) setActive(Number((visible[0].target as HTMLElement).dataset.step));
    }, { rootMargin: '-25% 0px -45% 0px', threshold: 0 });
    for (const item of list.current.children) observer.observe(item);
    return () => observer.disconnect();
  }, []);
  return <div className={styles.processLayout}><div className={styles.processArtSticky}><ProcessArt step={active} title={steps[active].title} /></div><ol className={styles.processList} ref={list}>{steps.map((step, i) => <li key={step.title} data-step={i} data-active={active === i} data-reveal onMouseEnter={() => setActive(i)}><span className={styles.processNumber}>0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p><span className={styles.processArrow} aria-hidden="true">↗</span></li>)}</ol></div>;
}
