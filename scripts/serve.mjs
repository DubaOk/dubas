import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createInquiryApi } from './inquiry-api.mjs';

const root = resolve('out');
const portArg = process.argv.indexOf('--port');
const port = Number(portArg >= 0 ? process.argv[portArg + 1] : process.env.PORT || 3000);
const api = createInquiryApi({ directory: resolve(process.env.INQUIRY_STORAGE_DIR || '.data'), allowedOrigins: (process.env.INQUIRY_ALLOWED_ORIGINS || '').split(',').filter(Boolean) });
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
const server = createServer(async (req, res) => {
  try {
    if (await api.handle(req, res)) return;
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname.startsWith('/api/') || pathname.split('/').some(segment => segment.startsWith('.'))) { res.writeHead(404); res.end(); return; }
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    let status = 200;
    try { if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html'); await stat(file); }
    catch { file = resolve(root, '404.html'); status = 404; }
    const body = await readFile(file);
    res.writeHead(status, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Content-Length': body.length, 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(500, { 'Content-Type': 'text/plain' }); res.end('Build the website with npm run build before starting the preview.'); }
});
server.on('close', () => api.close());
server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(port, '127.0.0.1', () => console.log(`Dubas preview and enquiries: http://127.0.0.1:${port}`));
