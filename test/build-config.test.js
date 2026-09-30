const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const semver = require('semver');

// npm test and bun test execute this suite from the repository root.
// These are fixed repository files, never paths supplied by a request.
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
// Bun 1.2.15 writes JSON with trailing commas, not a Yarn-format lockfile.
const lockText = fs.readFileSync('bun.lock', 'utf8');
const lock = JSON.parse(lockText.replace(/,(\s*[}\]])/g, '$1'));

function assertDirectDependencies(manifest, snapshot) {
  assert.deepEqual(snapshot.workspaces[''].dependencies, manifest.dependencies);
  assert.deepEqual(snapshot.workspaces[''].devDependencies || {}, manifest.devDependencies || {});
  const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
  for (const name of Object.keys(dependencies)) {
    const entry = snapshot.packages[name];
    assert.ok(Array.isArray(entry), `Missing resolved package: ${name}`);
    assert.ok(entry[0].startsWith(`${name}@`), `Wrong resolved package: ${name}`);
    const resolvedVersion = entry[0].slice(name.length + 1);
    assert.ok(semver.satisfies(resolvedVersion, dependencies[name]), `Out-of-range resolved version: ${name}`);
    assert.ok(entry.some(value => typeof value === 'string' && value.startsWith('sha512-')), `Missing integrity: ${name}`);
  }
}

describe('reproducible Workers Builds installs', () => {
  it('pins Bun and validates the root workspace and resolved direct packages', () => {
    assert.equal(pkg.packageManager, 'bun@1.2.15');
    assert.equal(lock.lockfileVersion, 1);
    assertDirectDependencies(pkg, lock);
  });

  it('rejects missing workspace dependencies even if transitive metadata contains them', () => {
    const damaged = structuredClone(lock);
    const name = Object.keys(pkg.dependencies)[0];
    delete damaged.workspaces[''].dependencies[name];
    damaged.packages.fake = ['fake@1.0.0', '', { dependencies: { [name]: pkg.dependencies[name] } }];
    assert.throws(() => assertDirectDependencies(pkg, damaged), assert.AssertionError);
  });

  it('rejects missing resolved direct packages', () => {
    const damaged = structuredClone(lock);
    delete damaged.packages[Object.keys(pkg.dependencies)[0]];
    assert.throws(() => assertDirectDependencies(pkg, damaged), /Missing resolved package/);
  });

  it('rejects resolved versions outside the declared dependency range', () => {
    const damaged = structuredClone(lock);
    const name = Object.keys(pkg.dependencies)[0];
    damaged.packages[name][0] = `${name}@0.0.1`;
    assert.throws(() => assertDirectDependencies(pkg, damaged), /Out-of-range resolved version/);
  });

  it('rejects dev dependency range and resolved-entry drift', () => {
    const name = Object.keys(pkg.devDependencies)[0];
    const missing = structuredClone(lock);
    delete missing.packages[name];
    assert.throws(() => assertDirectDependencies(pkg, missing), /Missing resolved package/);
    const stale = structuredClone(lock);
    stale.workspaces[''].devDependencies[name] = '^0.0.1';
    assert.throws(() => assertDirectDependencies(pkg, stale), assert.AssertionError);
  });

  it('keeps the text lockfile trackable for Cloudflare build caching', () => {
    const ignore = fs.readFileSync('.gitignore', 'utf8');
    const rules = ignore.split(/\r?\n/).map(line => line.trim());
    assert.ok(!rules.some(line => ['bun.lock', '/bun.lock', '*.lock'].includes(line)));
    assert.ok(rules.includes('bun.lockb'), 'Keep obsolete binary lockfiles ignored');
  });
});
