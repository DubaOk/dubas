import { productionConfig } from './production-config.mjs';
import { verifyBuild } from './verify-build.mjs';
const config = productionConfig();
await verifyBuild({ site: config.site, endpoint: config.endpoint, indexable: config.indexable });
