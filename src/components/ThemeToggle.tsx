'use client';

import { useSyncExternalStore } from 'react';
import type { Locale } from '@/lib/content';
import styles from './Site.module.css';

const storageKey = 'dubas-theme';
const systemTheme = '(prefers-color-scheme: dark)';

function savedTheme() {
  try {
    const value = localStorage.getItem(storageKey);
    if (value === 'light' || value === 'dark') return value;
  } catch { /* The toggle still works when storage is unavailable. */ }
  return null;
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia(systemTheme);
  const update = () => {
    document.documentElement.dataset.theme = savedTheme() ?? (media.matches ? 'dark' : 'light');
    onChange();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) update();
  };
  media.addEventListener('change', update);
  window.addEventListener('storage', onStorage);
  window.addEventListener('themechange', onChange);
  return () => {
    media.removeEventListener('change', update);
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('themechange', onChange);
  };
}

export function ThemeToggle({ locale }: { locale: Locale }) {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.dataset.theme === 'dark', () => false);
  const label = locale === 'ru'
    ? (dark ? 'Включить светлую тему' : 'Включить тёмную тему')
    : (dark ? 'Switch to light theme' : 'Switch to dark theme');

  function toggle() {
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(storageKey, next); } catch { /* Keep the in-memory choice. */ }
    window.dispatchEvent(new Event('themechange'));
  }

  return <button type="button" className={styles.themeToggle} onClick={toggle} aria-label={label} title={label}>
    <svg className={styles.themeMoon} aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 13.2A8.7 8.7 0 0 1 10.8 3.5a8.7 8.7 0 1 0 9.7 9.7Z" /></svg>
    <svg className={styles.themeSun} aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" /></svg>
  </button>;
}
