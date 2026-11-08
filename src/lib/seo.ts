import { publicPath, staticPreview } from './deployment';
import type { Metadata } from 'next';
import { homePath, privacyPath, site, workPath, type Locale, type Project } from './content';

export const indexable = !staticPreview && process.env.SITE_INDEXABLE === 'true' && Boolean(site.url && site.providerName && site.providerTaxId && (site.email || site.telegram));

export function metadata(locale: Locale, page: 'home' | 'privacy' | Project = 'home'): Metadata {
  const isProject = typeof page === 'object';
  const title = isProject ? `${page.text[locale].title} | Dubas` : page === 'privacy' ? `${locale === 'ru' ? 'Конфиденциальность' : 'Privacy'} | Dubas` : locale === 'ru' ? 'Dubas · Дизайн и разработка сайтов' : 'Dubas · Website design and development';
  const description = isProject ? page.text[locale].description : locale === 'ru' ? 'Интернет-магазины, сайты-визитки, лендинги и многостраничные сайты. На основе шаблона или с индивидуальной разработкой.' : 'Online shops, business card websites, landing pages and multi-page sites. Template-based or custom development.';
  const path = (lang: Locale) => isProject ? workPath(lang, page.slug) : page === 'privacy' ? privacyPath(lang) : homePath(lang);
  return {
    metadataBase: new URL(site.url || 'http://localhost:3000'),
    title, description,
    applicationName: 'Dubas',
    robots: { index: indexable, follow: indexable },
    ...(site.url ? { alternates: { canonical: `${site.url}${publicPath(path(locale))}`, languages: { ru: `${site.url}${publicPath(path('ru'))}`, en: `${site.url}${publicPath(path('en'))}`, 'x-default': `${site.url}${publicPath(path('ru'))}` } } } : {}),
    openGraph: { title, description, type: 'website', siteName: 'Dubas', locale: locale === 'ru' ? 'ru_RU' : 'en_US', alternateLocale: locale === 'ru' ? 'en_US' : 'ru_RU', ...(site.url ? { url: `${site.url}${publicPath(path(locale))}` } : {}), images: [{ url: publicPath('/og.png'), width: 1200, height: 630, alt: locale === 'ru' ? 'Dubas. Дизайн и разработка сайтов.' : 'Dubas. Website design and development.' }] },
    twitter: { card: 'summary_large_image', title, description, images: [publicPath('/og.png')] },
    icons: { icon: publicPath('/favicon.svg') },
  };
}
