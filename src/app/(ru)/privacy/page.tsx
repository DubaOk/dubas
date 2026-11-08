import { Privacy } from '@/components/Site';
import { metadata } from '@/lib/seo';
export const generateMetadata = () => metadata('ru', 'privacy');
export default function Page() { return <Privacy locale="ru" />; }
