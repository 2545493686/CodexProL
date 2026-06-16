import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

function run(args, env) {
  const result = spawnSync(process.execPath, ['scripts/codexpro.mjs', ...args], {
    cwd: path.resolve('.'),
    env,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    throw new Error(`codexpro ${args.join(' ')} failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  }
  return `${result.stdout}\n${result.stderr}`;
}

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'codexpro-settings-root-'));
const reuseRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'codexpro-settings-reuse-'));
const home = await fs.mkdtemp(path.join(os.tmpdir(), 'codexpro-settings-home-'));
const env = { ...process.env, CODEXPRO_HOME: home };

const empty = run(['settings', 'show', '--root', root], env);
if (!empty.includes('No saved settings')) {
  throw new Error(`expected empty settings output, got:\n${empty}`);
}

const saved = run([
  'settings',
  'set',
  '--root',
  root,
  '--tunnel',
  'ngrok',
  '--hostname',
  'codexpro-test.ngrok-free.app',
  '--port',
  '19087',
  '--mode',
  'agent',
  '--token',
  'codexpro-settings-token'
], env);
if (!saved.includes('Saved workspace settings')) {
  throw new Error(`expected settings save output, got:\n${saved}`);
}

const shown = run(['settings', 'show', '--root', root], env);
for (const expected of ['Tunnel', 'ngrok', 'codexpro-test.ngrok-free.app', '19087', '<saved>']) {
  if (!shown.includes(expected)) {
    throw new Error(`settings show missing ${expected}\n${shown}`);
  }
}
if (shown.includes('codexpro-settings-token')) {
  throw new Error(`settings show leaked token\n${shown}`);
}

const listed = run(['settings', 'list'], env);
if (!listed.includes(root) || !listed.includes('codexpro-test.ngrok-free.app')) {
  throw new Error(`settings list missing saved profile\n${listed}`);
}

const reused = run(['settings', 'use', '--root', reuseRoot, '--from-root', root], env);
if (!reused.includes('Saved workspace settings from')) {
  throw new Error(`settings use did not save profile\n${reused}`);
}

const reusedShown = run(['settings', 'show', '--root', reuseRoot], env);
for (const expected of ['ngrok', 'codexpro-test.ngrok-free.app', '<saved>']) {
  if (!reusedShown.includes(expected)) {
    throw new Error(`reused settings show missing ${expected}\n${reusedShown}`);
  }
}

const deleted = run(['settings', 'delete', '--root', root, '--yes'], env);
if (!deleted.includes('Deleted saved settings')) {
  throw new Error(`expected settings delete output, got:\n${deleted}`);
}

run(['settings', 'delete', '--root', reuseRoot, '--yes'], env);

const afterDelete = run(['settings', 'show', '--root', root], env);
if (!afterDelete.includes('No saved settings')) {
  throw new Error(`expected empty settings after delete, got:\n${afterDelete}`);
}

console.log('✓ settings smoke test passed');
