import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { createInquiryApi } from './inquiry-api.mjs';

const apiPort = Number(process.env.INQUIRY_DEV_PORT || 3001);
const frontPort = Number(process.env.PORT || 3000);
const api = createInquiryApi({ directory: resolve(process.env.INQUIRY_STORAGE_DIR || '.data'), allowedOrigins: [`http://127.0.0.1:${frontPort}`, `http://localhost:${frontPort}`] });
const server = createServer(async (req, res) => {
  if (!await api.handle(req, res)) { res.writeHead(404); res.end(); }
});
server.requestTimeout = 15000;
server.headersTimeout = 10000;
let next;
function stop() { api.close(); server.close(); if (next && !next.killed) next.kill(); }
server.on('error', error => { console.error(`Local API could not start: ${error.code}`); stop(); process.exitCode = 1; });
server.listen(apiPort, '127.0.0.1', () => {
  next = spawn(process.execPath, [resolve('node_modules/next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1', '--port', String(frontPort)], { stdio: 'inherit', env: { ...process.env, NEXT_PUBLIC_INQUIRY_ENDPOINT: `http://127.0.0.1:${apiPort}/api/inquiries` } });
  next.on('exit', code => { stop(); process.exitCode = code || 0; });
});
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
