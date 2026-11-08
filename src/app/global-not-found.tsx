import Link from 'next/link';
import './globals.css';

export default function NotFound() {
  return <html lang="ru"><body><main style={{ maxWidth: 800, margin: '15vh auto', padding: 30 }}><p style={{ color: '#00856a', marginBottom: 20 }}>NODRA / 404</p><h1 style={{ fontSize: 'clamp(36px, 7vw, 64px)', letterSpacing: '-2px' }}>Такой страницы нет.<br />This page is missing.</h1><p style={{ marginTop: 28 }}>Вернуться на главную / Back to the homepage</p><div style={{ display: 'flex', gap: 30, marginTop: 24 }}><Link href="/">Русский →</Link><Link href="/en/">English →</Link></div></main></body></html>;
}
