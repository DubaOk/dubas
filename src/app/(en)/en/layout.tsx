import type { ReactNode } from 'react';
import { metadata as makeMetadata } from '@/lib/seo';
import { InquiryProvider } from '@/components/InquiryProvider';
import '../../globals.css';

export const metadata = makeMetadata('en');
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><InquiryProvider>{children}</InquiryProvider></body></html>;
}
