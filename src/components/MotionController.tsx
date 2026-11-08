'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function MotionController() {
  const pathname = usePathname();
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) return;
    const elements = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.setAttribute('data-revealed', ''); observer.unobserve(entry.target); }
    }, { threshold: .08, rootMargin: '0px 0px -24px 0px' });
    for (const element of elements) {
      if (element.getBoundingClientRect().top < window.innerHeight - 30) element.setAttribute('data-revealed', '');
      else { element.setAttribute('data-reveal-ready', ''); observer.observe(element); }
    }
    const stop = () => { if (media.matches) { observer.disconnect(); for (const element of elements) element.setAttribute('data-revealed', ''); } };
    media.addEventListener('change', stop);
    return () => { observer.disconnect(); media.removeEventListener('change', stop); for (const element of elements) { element.removeAttribute('data-reveal-ready'); element.removeAttribute('data-revealed'); } };
  }, [pathname]);
  return null;
}
