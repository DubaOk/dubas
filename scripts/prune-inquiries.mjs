import { resolve } from 'node:path';
import { createInquiryStore } from './inquiry-store.mjs';
await createInquiryStore(resolve(process.env.INQUIRY_STORAGE_DIR || '.data')).prune();
console.log('Expired enquiries removed.');
