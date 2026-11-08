export const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || '';
export const publicPath = (path: string) => `${basePath}${path}`;
export const staticPreview = process.env.NEXT_PUBLIC_STATIC_PREVIEW === 'true';
