import { type Locale } from '@/lib/content';
import { type ServiceId } from '@/lib/services';
import { Header } from './Header';
import { Contact, Footer } from './Site';
import { ServiceDetail } from './ServiceDetail';

export function ServicePage({ locale, id }: { locale: Locale; id: ServiceId }) {
  return <><Header locale={locale} serviceSlug={id} /><main id="main"><ServiceDetail locale={locale} id={id} /><Contact locale={locale} /></main><Footer locale={locale} /></>;
}
