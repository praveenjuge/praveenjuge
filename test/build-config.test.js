const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

describe('reproducible Workers Builds installs', () => {
  it('pins the Bun version that generated the committed lockfile', () => {
    assert.equal(pkg.packageManager, 'bun@1.2.15');
    const lock = fs.readFileSync(path.join(root, 'bun.lock'), 'utf8');
    assert.match(lock, /"lockfileVersion":\s*1/);
    for (const [name, range] of Object.entries(pkg.dependencies)) {
      assert.ok(lock.includes(`"${name}": "${range}"`), `Missing lockfile dependency: ${name}`);
    }
  });

  it('keeps the text lockfile trackable for Cloudflare build caching', () => {
    const ignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
    assert.ok(!ignore.split(/\r?\n/).some(line => ['bun.lock', '/bun.lock', '*.lock'].includes(line.trim())));
    assert.ok(ignore.split(/\r?\n/).includes('bun.lockb'), 'Keep obsolete binary lockfiles ignored');
  });
});
