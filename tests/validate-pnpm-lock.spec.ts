import { describe, expect, it } from 'vitest';

import { validatePnpmLock } from '../lib/npd.js';

describe('validate pnpm lock', () => {
  for (const lockfileVersion of [5.4, '5.4', 6.0, '6.0', 9.0, '9.0'] as const) {
    it(`should validate lock with ${lockfileVersion} as ${typeof lockfileVersion}`, async () => {
      const params = {
        pnpmLockFile: {
          content: {
            lockfileVersion,
            importers: {
              '.': {},
            },
          },
        },
      };
      expect(validatePnpmLock(params)).toEqual(true);
    });
  }

  it('should invalidate lock w/o importers', async () => {
    const params = {
      pnpmLockFile: {
        content: {
          lockfileVersion: 5.4,
        },
      },
    };
    // @ts-ignore
    expect(() => validatePnpmLock(params)).toThrowError(/must have required property 'importers'/);
  });

  it('should invalidate lock 6.0 w/ dependencies as object', async () => {
    const params = {
      pnpmLockFile: {
        content: {
          lockfileVersion: 6.0,
          importers: {
            '.': {
              dependencies: {
                'fake-package-1': {
                  version: '1.2.3',
                },
              },
            },
          },
        },
      },
    };
    // @ts-ignore
    expect(() => validatePnpmLock(params)).toThrowError(
      /data\/importers\/\.\/dependencies\/fake-package-1 must be string/,
    );
  });

  it('should invalidate lock 5.4 w/ dependencies as object', async () => {
    const params = {
      pnpmLockFile: {
        content: {
          lockfileVersion: 5.4,
          importers: {
            '.': {
              dependencies: {
                'fake-package-1': {
                  version: '1.2.3',
                },
              },
            },
          },
        },
      },
    };
    // @ts-ignore
    expect(() => validatePnpmLock(params)).toThrowError(
      /data\/importers\/\.\/dependencies\/fake-package-1 must be string/,
    );
  });
});
