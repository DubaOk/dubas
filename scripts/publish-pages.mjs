import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmdirSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || `${command} exited with ${result.status}`);
  return result.stdout?.trim();
}

// Use the authenticated GitHub CLI without writing its token to disk or output.
const auth = ['-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential'];
const remote = run('git', ['remote', 'get-url', 'origin']);
if (!/^https:\/\/github\.com\/DubaOk\/dubas(?:\.git)?$/.test(remote)) {
  throw new Error('Expected origin to be DubaOk/dubas. Review the destination before publishing.');
}
if (!process.argv.includes('--skip-build')) {
  run(process.execPath, [resolve('scripts/build-pages.mjs')], { stdio: 'inherit' });
}
const html = readFileSync('out/index.html', 'utf8');
if (!html.includes('/dubas/_next/') || !html.includes('noindex')) throw new Error('Unexpected Pages build.');

const folder = mkdtempSync(join(tmpdir(), 'dubas-pages-index-'));
const index = join(folder, 'index');
const gitDir = run('git', ['rev-parse', '--absolute-git-dir']);
const env = { ...process.env, GIT_INDEX_FILE: index };
const git = ['--git-dir', gitDir, '--work-tree', resolve('out')];
try {
  const branches = run('git', [...auth, 'ls-remote', '--heads', 'origin', 'gh-pages']);
  let parent;
  if (branches) {
    run('git', [...auth, 'fetch', 'origin', 'gh-pages']);
    parent = run('git', ['rev-parse', 'FETCH_HEAD']);
  }
  run('git', [...git, 'read-tree', '--empty'], { env });
  run('git', [...git, 'add', '--all', '--force', '--', '.'], { env, cwd: resolve('out') });
  const tree = run('git', [...git, 'write-tree'], { env });
  const source = run('git', ['rev-parse', 'HEAD']);
  const commit = run('git', ['commit-tree', tree, ...(parent ? ['-p', parent] : [])], {
    input: `deploy: publish Dubas preview from ${source}\n`,
  });
  run('git', [...auth, 'push', 'origin', `${commit}:refs/heads/gh-pages`], { stdio: 'inherit' });
  console.log('Published gh-pages. GitHub Pages will deploy this revision.');
} finally {
  // Delete only our named temporary index, never a checkout or the project data.
  try { unlinkSync(index); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  rmdirSync(folder);
}
