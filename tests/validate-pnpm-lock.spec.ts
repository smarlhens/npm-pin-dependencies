import { describe, expect, it } from 'vitest';

import { validatePnpmLock } from '../lib/npd.js';

describe('validate pnpm lock', () => {
  it('should validate lock with 5.4 as number', async () => {
    const params = {
      pnpmLockFile: {
        content: {
          lockfileVersion: 5.4 as const,
          importers: {
            '.': {},
          },
        },
      },
    };
    expect(validatePnpmLock(params)).toEqual(true);
  });

  it('should validate lock with 5.4 as string', async () => {
    const params = {
      pnpmLockFile: {
        content: {
          lockfileVersion: '5.4' as const,
          importers: {
            '.': {},
          },
        },
      },
    };
    expect(validatePnpmLock(params)).toEqual(true);
  });

  it('should validate lock with 6.0 as number', async () => {
    const params = {
      pnpmLockFile: {
        content: {
          lockfileVersion: 6.0 as const,
          importers: {
            '.': {},
          },
        },
      },
    };
    expect(validatePnpmLock(params)).toEqual(true);
  });

  it('should validate lock with 6.0 as string', async () => {
    const params = {
      pnpmLockFile: {
        content: {
          lockfileVersion: '6.0' as const,
          importers: {
            '.': {},
          },
        },
      },
    };
    expect(validatePnpmLock(params)).toEqual(true);
  });

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

  it('should invalidate lock 6.0 w/ dependencies as string', async () => {
    const params = {
      pnpmLockFile: {
        content: {
          lockfileVersion: 6.0,
          importers: {
            '.': {
              dependencies: {
                'fake-package-1': '1.2.3',
              },
            },
          },
        },
      },
    };
    // @ts-ignore
    expect(() => validatePnpmLock(params)).toThrowError(
      /data\/importers\/\.\/dependencies\/fake-package-1 must be object/,
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
