import { Privacy } from '@/components/Site';
import { metadata } from '@/lib/seo';
export const generateMetadata = () => metadata('en', 'privacy');
export default function Page() { return <Privacy locale="en" />; }
