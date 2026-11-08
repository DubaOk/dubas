import type { MetadataRoute } from 'next';
import { homePath, privacyPath, projects, site, workPath, type Locale } from '@/lib/content';

export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.url) return [];
  return (['ru', 'en'] as Locale[]).flatMap(locale => [homePath(locale), privacyPath(locale), ...projects.map(project => workPath(locale, project.slug))].map(path => ({ url: `${site.url}${path}` })));
}
