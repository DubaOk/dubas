import { mkdir, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export const retentionDays = 90;

export function createInquiryStore(directory) {
  const file = join(directory, 'inquiries.ndjson');
  let queue = Promise.resolve();

  async function update(entry) {
    await mkdir(directory, { recursive: true });
    let existing = '';
    try { existing = await readFile(file, 'utf8'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const now = Date.now();
    const entries = existing.split('\n').filter(Boolean).map(line => JSON.parse(line)).filter(item => Date.parse(item.expiresAt) > now);
    if (entry) entries.push(entry);
    const temporary = join(directory, `inquiries-${randomUUID()}.tmp`);
    try {
      await writeFile(temporary, entries.map(item => JSON.stringify(item)).join('\n') + (entries.length ? '\n' : ''), { mode: 0o600 });
      await rename(temporary, file);
    } catch (error) {
      await unlink(temporary).catch(() => {});
      throw error;
    }
    return entry;
  }

  function enqueue(entry) {
    const result = queue.then(() => update(entry));
    queue = result.catch(() => {});
    return result;
  }

  return { save: entry => enqueue(entry), prune: () => enqueue(null) };
}
