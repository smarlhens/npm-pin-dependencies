import { execa } from 'execa';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('run cli over examples', () => {
  const examples: [string, string][] = [
    ['npm-lock-v1', ''],
    ['npm-lock-v2-dependencies', 'All dependency versions are already pinned'],
    ['npm-lock-v2-dependencies-packages', 'All dependency versions are already pinned'],
    ['npm-lock-v3', 'All dependency versions are already pinned'],
    ['resolve-dev-dependencies', 'All dependency versions are already pinned'],
    ['no-versions-to-pin', 'All dependency versions are already pinned'],
  ];

  for (let [folder] of examples) {
    it(`should run with ${folder}`, async () => {
      const { stdout } = await execa(`node`, [join('..', '..', 'dist', 'bin', 'npd.js')], {
        cwd: join(__dirname, '..', 'examples', folder),
      });
      expect(stdout).toContain('All dependency versions are already pinned');
    });
  }

  it('should handle error with npm-lock-v2-packages', async () => {
    await expect(
      execa(`node`, [join('..', '..', 'dist', 'bin', 'npd.js')], {
        cwd: join(__dirname, '..', 'examples', 'npm-lock-v2-packages'),
      }),
    ).rejects.toThrowError(/data must have required property 'dependencies'/);
  });

  it('should handle versions to pin with versions-to-pin', async () => {
    const { stdout } = await execa(`node`, [join('..', '..', 'dist', 'bin', 'npd.js')], {
      cwd: join(__dirname, '..', 'examples', 'versions-to-pin'),
    });
    expect(stdout).toContain('fake-package-01          ^1.0.0            →  1.1.0');
    expect(stdout).toContain('fake-package-02          ~2.5.0            →  2.5.2');
    expect(stdout).toContain('fake-package-03          3.x               →  3.1.1');
    expect(stdout).toContain('fake-package-04          ^0.0.3            →  0.0.3');
    expect(stdout).toContain('fake-package-05          ~0.0.3            →  0.0.9');
    expect(stdout).toContain('fake-package-06          ^0.1.0            →  0.1.0');
    expect(stdout).toContain('fake-package-07          ~0.1.0            →  0.1.1');
    expect(stdout).toContain('fake-package-09          1.0.0 - 1.2.0     →  1.1.1');
    expect(stdout).toContain('fake-package-10          >2.1              →  2.2.2');
    expect(stdout).toContain('fake-package-11          ^2 <2.2 || > 2.3  →  2.1.6');
    expect(stdout).toContain('fake-package-12          ^2 <2.2 || > 2.3  →  2.4.2');
    expect(stdout).toContain('fake-dev-package-1       ^4.0.0            →  4.0.0');
    expect(stdout).toContain('fake-dev-package-2       ~5.0.0            →  5.0.0');
    expect(stdout).toContain('fake-dev-package-3       6.x               →  6.0.0');
    expect(stdout).toContain('fake-optional-package-1  ^7.0.0            →  7.0.0');
    expect(stdout).toContain('fake-optional-package-2  ~8.0.0            →  8.0.0');
    expect(stdout).toContain('fake-optional-package-3  9.x               →  9.0.0');
  });

  it('should handle versions to pin with workspace foo', async () => {
    const { stdout } = await execa(`node`, [join('..', '..', '..', 'dist', 'bin', 'npd.js')], {
      cwd: join(__dirname, '..', 'examples', 'workspace', 'foo'),
    });

    expect(stdout).toContain('fake-package-1  ^1.0.0  →  1.0.3');
    expect(stdout).toContain('fake-package-2  ^2.0.0  →  2.0.1');
    expect(stdout).toContain('fake-package-3  ^3.0.0  →  3.1.9');
  });

  it('should handle versions to pin with yarn-lock-v1', async () => {
    const { stdout } = await execa(`node`, [join('..', '..', 'dist', 'bin', 'npd.js')], {
      cwd: join(__dirname, '..', 'examples', 'yarn-lock-v1'),
    });

    expect(stdout).toContain('fake-package-1  ^1.0.0  →  1.0.3');
    expect(stdout).toContain('fake-package-2  ^2.0.0  →  2.0.1');
    expect(stdout).toContain('fake-package-3  ^3.0.0  →  3.1.9');
  });

  it('should handle versions to pin with yarn-lock-v2', async () => {
    const { stdout } = await execa(`node`, [join('..', '..', 'dist', 'bin', 'npd.js')], {
      cwd: join(__dirname, '..', 'examples', 'yarn-lock-v2'),
    });

    expect(stdout).toContain('fake-package-1  ^1.0.0  →  1.0.3');
    expect(stdout).toContain('fake-package-2  ^2.0.0  →  2.0.1');
    expect(stdout).toContain('fake-package-3  ^3.0.0  →  3.1.9');
  });
});
