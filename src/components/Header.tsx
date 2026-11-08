'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { copy, homePath, privacyPath, workPath, type Locale } from '@/lib/content';
import { publicPath } from '@/lib/deployment';
import { Brand } from './Brand';
import styles from './Site.module.css';

export function Header({ locale, slug, privacy = false }: { locale: Locale; slug?: string; privacy?: boolean }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const t = copy[locale];
  const other = locale === 'ru' ? 'en' : 'ru';
  const otherPath = slug ? workPath(other, slug) : privacy ? privacyPath(other) : homePath(other);
  const [hash, setHash] = useState('');
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update(); window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = nav.current?.querySelector<HTMLAnchorElement>('a');
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); button.current?.focus(); }
      if (event.key === 'Tab') {
        const links = Array.from(nav.current?.querySelectorAll<HTMLAnchorElement>('a') || []);
        if (event.shiftKey && document.activeElement === links[0]) { event.preventDefault(); button.current?.focus(); }
        else if (!event.shiftKey && document.activeElement === links.at(-1)) { event.preventDefault(); button.current?.focus(); }
        else if (document.activeElement === button.current) { event.preventDefault(); (event.shiftKey ? links.at(-1) : links[0])?.focus(); }
      }
    };
    const onResize = () => { if (window.innerWidth > 760) setOpen(false); };
    window.addEventListener('keydown', onKey); window.addEventListener('resize', onResize);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, [open]);
  return <><a className={styles.skipLink} href="#main">{t.skip}</a><header className={styles.headerShell}><div className={styles.header}><Brand locale={locale} /><nav id="main-nav" ref={nav} aria-label={locale === 'ru' ? 'Основная навигация' : 'Main navigation'} className={`${styles.nav} ${open ? styles.navOpen : ''}`}>{['services', 'work', 'process'].map((id, i) => <Link href={`${homePath(locale)}#${id}`} onClick={() => setOpen(false)} key={id}>{t.nav[i]}</Link>)}<a className={styles.mobileTalk} href={`${publicPath(homePath(locale))}#contact`} onClick={() => setOpen(false)}>{t.talk}<span aria-hidden="true">↗</span></a></nav><div className={styles.headerActions}><Link className={styles.language} href={`${otherPath}${hash}`} hrefLang={other} lang={other} aria-label={other === 'en' ? 'Switch to English' : 'Переключить на русский'}><span className={locale === 'ru' ? styles.activeLang : ''}>RU</span><span className={styles.langSlash}>/</span><span className={locale === 'en' ? styles.activeLang : ''}>EN</span></Link><a href={`${publicPath(homePath(locale))}#contact`} className={styles.headerCta}>{t.talk}<span aria-hidden="true">↗</span></a><button ref={button} type="button" className={`${styles.menuButton} ${open ? styles.menuOpen : ''}`} aria-expanded={open} aria-controls="main-nav" aria-label={open ? t.close : t.menu} onClick={() => setOpen(!open)}><span /><span /></button></div></div></header></>;
}
