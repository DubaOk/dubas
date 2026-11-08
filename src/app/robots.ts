import { publicPath } from '@/lib/deployment';
import type { MetadataRoute } from 'next';
import { site } from '@/lib/content';
import { indexable } from '@/lib/seo';

export const dynamic = 'force-static';
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', ...(indexable ? { allow: '/' } : { disallow: '/' }) }, ...(indexable && site.url ? { sitemap: `${site.url}${publicPath('/sitemap.xml')}` } : {}) };
}
