import type { NextConfig } from 'next';

const config: NextConfig = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || '',
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  experimental: { globalNotFound: true },
};

export default config;
