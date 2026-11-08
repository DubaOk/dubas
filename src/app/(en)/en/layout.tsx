import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { metadata as makeMetadata } from '@/lib/seo';
import { InquiryProvider } from '@/components/InquiryProvider';
import { MotionController } from '@/components/MotionController';
import '../../globals.css';

const manrope = localFont({ src: '../../../../public/fonts/manrope.ttf', display: 'swap', weight: '200 800', variable: '--font-manrope' });

export const metadata = makeMetadata('en');
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en" className={manrope.variable}><body><MotionController /><InquiryProvider>{children}</InquiryProvider></body></html>;
}
