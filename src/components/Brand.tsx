import Link from 'next/link';
import { homePath, site, type Locale } from '@/lib/content';
import styles from './Site.module.css';

export function Brand({ locale }: { locale: Locale }) {
  return <Link href={homePath(locale)} className={styles.brand} aria-label={`${site.name}, ${locale === 'ru' ? 'главная' : 'home'}`}>
    <svg className={styles.brandMark} aria-hidden="true" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="12" fill="currentColor" /><path d="M11 10h7.5C26 10 30 14 30 20s-4 10-11.5 10H11V10Zm7 6v8h1c3 0 5-1.3 5-4s-2-4-5-4h-1Z" fill="#f7f7f2" /><circle cx="30" cy="10" r="5" fill="#c5b0ec" /></svg>
    <span>{site.name}<span className={styles.brandDot} aria-hidden="true">.</span></span>
  </Link>;
}
