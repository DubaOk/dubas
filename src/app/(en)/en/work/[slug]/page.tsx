import { notFound } from 'next/navigation';
import { ProjectPage } from '@/components/Site';
import { projects } from '@/lib/content';
import { metadata } from '@/lib/seo';

export const dynamicParams = false;
export function generateStaticParams() { return projects.map(project => ({ slug: project.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  return project ? metadata('en', project) : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find(item => item.slug === slug);
  if (!project) notFound();
  return <ProjectPage locale="en" project={project} />;
}
