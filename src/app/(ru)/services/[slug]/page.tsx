import { notFound } from 'next/navigation';
import { ServicePage } from '@/components/ServicePage';
import { serviceIds, type ServiceId } from '@/lib/services';
import { metadata } from '@/lib/seo';

export const dynamicParams = false;
export function generateStaticParams() { return serviceIds.map(slug => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return serviceIds.includes(slug as ServiceId) ? metadata('ru', slug as ServiceId) : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!serviceIds.includes(slug as ServiceId)) notFound();
  return <ServicePage locale="ru" id={slug as ServiceId} />;
}
