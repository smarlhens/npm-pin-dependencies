import { execaCommand, Options } from 'execa';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('pin from cli', () => {
  it('should output dependency versions to pin', async () => {
    const execaOptions: Options = {
      cwd: resolve(process.cwd(), 'examples', 'with-versions-to-pin'),
      stdio: 'pipe',
      cleanup: true,
    };

    const { stdout } = await execaCommand(
      `node --experimental-specifier-resolution=node --loader ts-node/esm ${resolve(process.cwd(), 'bin', 'npd.ts')}`,
      execaOptions,
    );
    expect(stdout).toEqual(
      '[STARTED] Pinning dependency versions in package.json file...\n' +
        '[STARTED] Reading package-lock.json...\n' +
        '[SUCCESS] Reading package-lock.json...\n' +
        '[STARTED] Reading package.json...\n' +
        '[SUCCESS] Reading package.json...\n' +
        '[STARTED] Validating package-lock.json...\n' +
        '[SUCCESS] Validating package-lock.json...\n' +
        '[STARTED] Validating package.json...\n' +
        '[SUCCESS] Validating package.json...\n' +
        '[STARTED] Computing which dependency versions are to pin...\n' +
        '[SUCCESS] Computing which dependency versions are to pin...\n' +
        '[STARTED] Output dependency versions that can be pinned...\n' +
        '[TITLE] Dependency versions that can be pinned:\n' +
        '[TITLE] \n' +
        '[TITLE]  fake-package-01          ^1.0.0            →  1.1.0 \n' +
        '[TITLE]  fake-package-02          ~2.5.0            →  2.5.2 \n' +
        '[TITLE]  fake-package-03          3.x               →  3.1.1 \n' +
        '[TITLE]  fake-package-04          ^0.0.3            →  0.0.3 \n' +
        '[TITLE]  fake-package-05          ~0.0.3            →  0.0.9 \n' +
        '[TITLE]  fake-package-06          ^0.1.0            →  0.1.0 \n' +
        '[TITLE]  fake-package-07          ~0.1.0            →  0.1.1 \n' +
        '[TITLE]  fake-package-09          1.0.0 - 1.2.0     →  1.1.1 \n' +
        '[TITLE]  fake-package-10          >2.1              →  2.2.2 \n' +
        '[TITLE]  fake-package-11          ^2 <2.2 || > 2.3  →  2.1.6 \n' +
        '[TITLE]  fake-package-12          ^2 <2.2 || > 2.3  →  2.4.2 \n' +
        '[TITLE]  fake-dev-package-1       ^4.0.0            →  4.0.0 \n' +
        '[TITLE]  fake-dev-package-2       ~5.0.0            →  5.0.0 \n' +
        '[TITLE]  fake-dev-package-3       6.x               →  6.0.0 \n' +
        '[TITLE]  fake-optional-package-1  ^7.0.0            →  7.0.0 \n' +
        '[TITLE]  fake-optional-package-2  ~8.0.0            →  8.0.0 \n' +
        '[TITLE]  fake-optional-package-3  9.x               →  9.0.0 \n' +
        '[TITLE] \n' +
        `[TITLE] Run npd -u to upgrade package.json.\n` +
        '[SUCCESS] Output dependency versions that can be pinned...\n' +
        '[STARTED] Updating package.json...\n' +
        '[SKIPPED] Update is disabled by default.\n' +
        '[SUCCESS] Dependency versions that can be pinned:\n' +
        '[SUCCESS] \n' +
        '[SUCCESS]  fake-package-01          ^1.0.0            →  1.1.0 \n' +
        '[SUCCESS]  fake-package-02          ~2.5.0            →  2.5.2 \n' +
        '[SUCCESS]  fake-package-03          3.x               →  3.1.1 \n' +
        '[SUCCESS]  fake-package-04          ^0.0.3            →  0.0.3 \n' +
        '[SUCCESS]  fake-package-05          ~0.0.3            →  0.0.9 \n' +
        '[SUCCESS]  fake-package-06          ^0.1.0            →  0.1.0 \n' +
        '[SUCCESS]  fake-package-07          ~0.1.0            →  0.1.1 \n' +
        '[SUCCESS]  fake-package-09          1.0.0 - 1.2.0     →  1.1.1 \n' +
        '[SUCCESS]  fake-package-10          >2.1              →  2.2.2 \n' +
        '[SUCCESS]  fake-package-11          ^2 <2.2 || > 2.3  →  2.1.6 \n' +
        '[SUCCESS]  fake-package-12          ^2 <2.2 || > 2.3  →  2.4.2 \n' +
        '[SUCCESS]  fake-dev-package-1       ^4.0.0            →  4.0.0 \n' +
        '[SUCCESS]  fake-dev-package-2       ~5.0.0            →  5.0.0 \n' +
        '[SUCCESS]  fake-dev-package-3       6.x               →  6.0.0 \n' +
        '[SUCCESS]  fake-optional-package-1  ^7.0.0            →  7.0.0 \n' +
        '[SUCCESS]  fake-optional-package-2  ~8.0.0            →  8.0.0 \n' +
        '[SUCCESS]  fake-optional-package-3  9.x               →  9.0.0 \n' +
        '[SUCCESS] \n' +
        `[SUCCESS] Run npd -u to upgrade package.json.`,
    );
  }, 10000);

  it('should output no dependency versions to pin', async () => {
    const execaOptions: Options = {
      cwd: resolve(process.cwd(), 'examples', 'without-versions-to-pin'),
      stdio: 'pipe',
      cleanup: true,
    };
    const { stdout } = await execaCommand(
      `node --experimental-specifier-resolution=node --loader ts-node/esm ${resolve(process.cwd(), 'bin', 'npd.ts')}`,
      execaOptions,
    );
    expect(stdout).toEqual(
      '[STARTED] Pinning dependency versions in package.json file...\n' +
        '[STARTED] Reading package-lock.json...\n' +
        '[SUCCESS] Reading package-lock.json...\n' +
        '[STARTED] Reading package.json...\n' +
        '[SUCCESS] Reading package.json...\n' +
        '[STARTED] Validating package-lock.json...\n' +
        '[SUCCESS] Validating package-lock.json...\n' +
        '[STARTED] Validating package.json...\n' +
        '[SUCCESS] Validating package.json...\n' +
        '[STARTED] Computing which dependency versions are to pin...\n' +
        '[SUCCESS] Computing which dependency versions are to pin...\n' +
        '[STARTED] Output dependency versions that can be pinned...\n' +
        '[TITLE] All dependency versions are already pinned :)\n' +
        '[SUCCESS] Output dependency versions that can be pinned...\n' +
        '[STARTED] Updating package.json...\n' +
        '[SKIPPED] Update is disabled by default.\n' +
        '[SUCCESS] All dependency versions are already pinned :)',
    );
  }, 10000);

  it('should output no dependency versions to pin from dependencies only', async () => {
    const execaOptions: Options = {
      cwd: resolve(process.cwd(), 'examples', 'with-only-dependencies'),
      stdio: 'pipe',
      cleanup: true,
    };
    const { stdout } = await execaCommand(
      `node --experimental-specifier-resolution=node --loader ts-node/esm ${resolve(process.cwd(), 'bin', 'npd.ts')}`,
      execaOptions,
    );
    expect(stdout).toEqual(
      '[STARTED] Pinning dependency versions in package.json file...\n' +
        '[STARTED] Reading package-lock.json...\n' +
        '[SUCCESS] Reading package-lock.json...\n' +
        '[STARTED] Reading package.json...\n' +
        '[SUCCESS] Reading package.json...\n' +
        '[STARTED] Validating package-lock.json...\n' +
        '[SUCCESS] Validating package-lock.json...\n' +
        '[STARTED] Validating package.json...\n' +
        '[SUCCESS] Validating package.json...\n' +
        '[STARTED] Computing which dependency versions are to pin...\n' +
        '[SUCCESS] Computing which dependency versions are to pin...\n' +
        '[STARTED] Output dependency versions that can be pinned...\n' +
        '[TITLE] All dependency versions are already pinned :)\n' +
        '[SUCCESS] Output dependency versions that can be pinned...\n' +
        '[STARTED] Updating package.json...\n' +
        '[SKIPPED] Update is disabled by default.\n' +
        '[SUCCESS] All dependency versions are already pinned :)',
    );
  }, 10000);

  it('should output no dependency versions to pin from devDependencies only', async () => {
    const execaOptions: Options = {
      cwd: resolve(process.cwd(), 'examples', 'with-only-dev-dependencies'),
      stdio: 'pipe',
      cleanup: true,
    };
    const { stdout } = await execaCommand(
      `node --experimental-specifier-resolution=node --loader ts-node/esm ${resolve(process.cwd(), 'bin', 'npd.ts')}`,
      execaOptions,
    );
    expect(stdout).toEqual(
      '[STARTED] Pinning dependency versions in package.json file...\n' +
        '[STARTED] Reading package-lock.json...\n' +
        '[SUCCESS] Reading package-lock.json...\n' +
        '[STARTED] Reading package.json...\n' +
        '[SUCCESS] Reading package.json...\n' +
        '[STARTED] Validating package-lock.json...\n' +
        '[SUCCESS] Validating package-lock.json...\n' +
        '[STARTED] Validating package.json...\n' +
        '[SUCCESS] Validating package.json...\n' +
        '[STARTED] Computing which dependency versions are to pin...\n' +
        '[SUCCESS] Computing which dependency versions are to pin...\n' +
        '[STARTED] Output dependency versions that can be pinned...\n' +
        '[TITLE] All dependency versions are already pinned :)\n' +
        '[SUCCESS] Output dependency versions that can be pinned...\n' +
        '[STARTED] Updating package.json...\n' +
        '[SKIPPED] Update is disabled by default.\n' +
        '[SUCCESS] All dependency versions are already pinned :)',
    );
  }, 10000);

  it('should output no dependency versions to pin from lock file version 1', async () => {
    const execaOptions: Options = {
      cwd: resolve(process.cwd(), 'examples', 'with-lock-file-version-1'),
      stdio: 'pipe',
      cleanup: true,
    };
    const { stdout } = await execaCommand(
      `node --experimental-specifier-resolution=node --loader ts-node/esm ${resolve(process.cwd(), 'bin', 'npd.ts')}`,
      execaOptions,
    );
    expect(stdout).toEqual(
      '[STARTED] Pinning dependency versions in package.json file...\n' +
        '[STARTED] Reading package-lock.json...\n' +
        '[SUCCESS] Reading package-lock.json...\n' +
        '[STARTED] Reading package.json...\n' +
        '[SUCCESS] Reading package.json...\n' +
        '[STARTED] Validating package-lock.json...\n' +
        '[SUCCESS] Validating package-lock.json...\n' +
        '[STARTED] Validating package.json...\n' +
        '[SUCCESS] Validating package.json...\n' +
        '[STARTED] Computing which dependency versions are to pin...\n' +
        '[SUCCESS] Computing which dependency versions are to pin...\n' +
        '[STARTED] Output dependency versions that can be pinned...\n' +
        '[TITLE] All dependency versions are already pinned :)\n' +
        '[SUCCESS] Output dependency versions that can be pinned...\n' +
        '[STARTED] Updating package.json...\n' +
        '[SKIPPED] Update is disabled by default.\n' +
        '[SUCCESS] All dependency versions are already pinned :)',
    );
  }, 10000);
});
