import { describe, expect, it } from 'vitest';

import { pinDependencies, type PinDependenciesInput } from '../lib/npd.js';

describe('pin from obj', () => {
  it('should return dependency versions to pin using latest updated lock file', async () => {
    const params: PinDependenciesInput = {
      packageJson: {
        dependencies: {
          'fake-package-1': '^1.0.0',
          'fake-package-2': '~2.5.0',
          'fake-package-3': '3.x',
        },
      },
      packageJsonIndent: '  ',
      packageLockFile: {
        content: {
          lockfileVersion: 3,
          packages: {
            '': { version: '1.0.0' },
            'node_modules/fake-package-1': { version: '1.1.0' },
            'node_modules/fake-package-2': { version: '2.5.2' },
            'node_modules/fake-package-3': { version: '3.1.9' },
          },
        },
        mtime: new Date('2011-10-05T14:48:00.000Z'),
      },
      yarnLockFile: {
        content: {
          'fake-package-1@^1.0.0': {
            version: '1.0.1',
          },
          'fake-package-2@~2.5.0': {
            version: '2.5.0',
          },
          'fake-package-3@3.x': {
            version: '3.0.1',
          },
        },
        mtime: new Date('2010-10-05T14:48:00.000Z'),
      },
      pnpmLockFile: {
        content: {
          lockfileVersion: 5.4,
          importers: {
            '.': {
              dependencies: {
                'fake-package-1': '1.1.1',
                'fake-package-2': '2.5.1',
                'fake-package-3': '3.0.0',
              },
            },
          },
        },
        mtime: new Date('2009-10-05T14:48:00.000Z'),
      },
    };
    const payload = pinDependencies(params);
    expect(payload).toEqual({
      packageJson: {
        dependencies: {
          'fake-package-1': '1.1.0',
          'fake-package-2': '2.5.2',
          'fake-package-3': '3.1.9',
        },
      },
      versionsToPin: [
        { dependency: 'fake-package-1', version: '^1.0.0', pinnedVersion: '1.1.0' },
        { dependency: 'fake-package-2', version: '~2.5.0', pinnedVersion: '2.5.2' },
        { dependency: 'fake-package-3', version: '3.x', pinnedVersion: '3.1.9' },
      ],
    });
  });

  it('should throw error if multiple lock file without modified time provided', async () => {
    const params: PinDependenciesInput = {
      packageJson: {
        dependencies: {
          'fake-package-1': '^1.0.0',
          'fake-package-2': '~2.5.0',
          'fake-package-3': '3.x',
        },
      },
      packageJsonIndent: '  ',
      packageLockFile: {
        content: {
          lockfileVersion: 3,
          packages: {
            '': { version: '1.0.0' },
            'node_modules/fake-package-1': { version: '1.1.0' },
            'node_modules/fake-package-2': { version: '2.5.2' },
            'node_modules/fake-package-3': { version: '3.1.9' },
          },
        },
      },
      yarnLockFile: {
        content: {
          'fake-package-1@^1.0.0': {
            version: '1.0.1',
          },
          'fake-package-2@~2.5.0': {
            version: '2.5.0',
          },
          'fake-package-3@3.x': {
            version: '3.0.1',
          },
        },
      },
      pnpmLockFile: {
        content: {
          lockfileVersion: 5.4,
          importers: {
            '.': {
              dependencies: {
                'fake-package-1': '1.1.1',
                'fake-package-2': '2.5.1',
                'fake-package-3': '3.0.0',
              },
            },
          },
        },
      },
    };
    expect(() => pinDependencies(params)).toThrowError(/Unable to decide which lock file to use./);
  });

  it('should handle when only one lockfile has mtime', async () => {
    const params: PinDependenciesInput = {
      packageJson: {
        dependencies: {
          'fake-package-1': '^1.0.0',
          'fake-package-2': '~2.5.0',
          'fake-package-3': '3.x',
        },
      },
      packageJsonIndent: '  ',
      packageLockFile: {
        content: {
          lockfileVersion: 3,
          packages: {
            '': { version: '1.0.0' },
            'node_modules/fake-package-1': { version: '1.1.0' },
            'node_modules/fake-package-2': { version: '2.5.2' },
            'node_modules/fake-package-3': { version: '3.1.9' },
          },
        },
      },
      yarnLockFile: {
        content: {
          'fake-package-1@^1.0.0': {
            version: '1.0.1',
          },
          'fake-package-2@~2.5.0': {
            version: '2.5.0',
          },
          'fake-package-3@3.x': {
            version: '3.0.1',
          },
        },
      },
      pnpmLockFile: {
        content: {
          lockfileVersion: 5.4,
          importers: {
            '.': {
              dependencies: {
                'fake-package-1': '1.1.1',
                'fake-package-2': '2.5.1',
                'fake-package-3': '3.0.0',
              },
            },
          },
        },
        mtime: new Date('2009-10-05T14:48:00.000Z'),
      },
    };
    const payload = pinDependencies(params);
    expect(payload).toEqual({
      packageJson: {
        dependencies: {
          'fake-package-1': '1.1.1',
          'fake-package-2': '2.5.1',
          'fake-package-3': '3.0.0',
        },
      },
      versionsToPin: [
        { dependency: 'fake-package-1', version: '^1.0.0', pinnedVersion: '1.1.1' },
        { dependency: 'fake-package-2', version: '~2.5.0', pinnedVersion: '2.5.1' },
        { dependency: 'fake-package-3', version: '3.x', pinnedVersion: '3.0.0' },
      ],
    });
  });

  it('should handle when multiple but not all lockfile have mtime', async () => {
    const params: PinDependenciesInput = {
      packageJson: {
        dependencies: {
          'fake-package-1': '^1.0.0',
          'fake-package-2': '~2.5.0',
          'fake-package-3': '3.x',
        },
      },
      packageJsonIndent: '  ',
      packageLockFile: {
        content: {
          lockfileVersion: 3,
          packages: {
            '': { version: '1.0.0' },
            'node_modules/fake-package-1': { version: '1.1.0' },
            'node_modules/fake-package-2': { version: '2.5.2' },
            'node_modules/fake-package-3': { version: '3.1.9' },
          },
        },
      },
      yarnLockFile: {
        content: {
          'fake-package-1@^1.0.0': {
            version: '1.0.1',
          },
          'fake-package-2@~2.5.0': {
            version: '2.5.0',
          },
          'fake-package-3@3.x': {
            version: '3.0.1',
          },
        },
        mtime: new Date('2009-10-05T14:48:00.000Z'),
      },
      pnpmLockFile: {
        content: {
          lockfileVersion: 5.4,
          importers: {
            '.': {
              dependencies: {
                'fake-package-1': '1.1.1',
                'fake-package-2': '2.5.1',
                'fake-package-3': '3.0.0',
              },
            },
          },
        },
        mtime: new Date('2010-10-05T14:48:00.000Z'),
      },
    };
    const payload = pinDependencies(params);
    expect(payload).toEqual({
      packageJson: {
        dependencies: {
          'fake-package-1': '1.1.1',
          'fake-package-2': '2.5.1',
          'fake-package-3': '3.0.0',
        },
      },
      versionsToPin: [
        { dependency: 'fake-package-1', version: '^1.0.0', pinnedVersion: '1.1.1' },
        { dependency: 'fake-package-2', version: '~2.5.0', pinnedVersion: '2.5.1' },
        { dependency: 'fake-package-3', version: '3.x', pinnedVersion: '3.0.0' },
      ],
    });
  });

  it('should throw error if lock file missing', async () => {
    const params: PinDependenciesInput = {
      packageJson: {
        dependencies: {
          'fake-package-1': '^1.0.0',
          'fake-package-2': '~2.5.0',
          'fake-package-3': '3.x',
        },
      },
      packageJsonIndent: '  ',
    };
    expect(() => pinDependencies(params)).toThrowError(/Lock file is missing./);
  });

  it('should continue if dependency is linked but unresolved in packages', async () => {
    const params: PinDependenciesInput = {
      packageJson: {
        dependencies: {
          'fake-package-1': '1.0.0',
        },
      },
      packageJsonIndent: '  ',
      packageLockFile: {
        content: {
          lockfileVersion: 3,
          packages: {
            '': { version: '1.0.0' },
            'node_modules/fake-package-1': { link: true, resolved: 'foobar/fake-package-1' },
          },
        },
      },
    };
    const payload = pinDependencies(params);
    expect(payload).toEqual({
      packageJson: { dependencies: { 'fake-package-1': '1.0.0' } },
      versionsToPin: [],
    });
  });

  it('should continue if dependency is linked but resolved field missing', async () => {
    const params: PinDependenciesInput = {
      packageJson: {
        dependencies: {
          'fake-package-1': '1.0.0',
        },
      },
      packageJsonIndent: '  ',
      packageLockFile: {
        content: {
          lockfileVersion: 3,
          packages: {
            '': { version: '1.0.0' },
            'node_modules/fake-package-1': { link: true },
          },
        },
      },
    };
    const payload = pinDependencies(params);
    expect(payload).toEqual({
      packageJson: { dependencies: { 'fake-package-1': '1.0.0' } },
      versionsToPin: [],
    });
  });

  it('should continue if dependency is using a local path as version', async () => {
    const params: PinDependenciesInput = {
      packageJson: {
        dependencies: {
          'fake-package-1': 'file:../vendor/foo.tgz',
        },
      },
      packageJsonIndent: '  ',
      packageLockFile: {
        content: {
          lockfileVersion: 3,
          packages: {
            '': { version: '1.0.0' },
            'node_modules/fake-package-1': { version: '1.2.3', resolved: 'file:../vendor/foo.tgz' },
          },
        },
      },
    };
    const payload = pinDependencies(params);
    expect(payload).toEqual({
      packageJson: {
        dependencies: {
          'fake-package-1': 'file:../vendor/foo.tgz',
        },
      },
      versionsToPin: [],
    });
  });

  it('should handle pnpm lockfile v5.4', async () => {
    const params: PinDependenciesInput = {
      packageJson: {
        dependencies: {
          'fake-package-1': '^1.0.0',
        },
      },
      packageJsonIndent: '  ',
      pnpmLockFile: {
        content: {
          lockfileVersion: 5.4,
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
    const payload = pinDependencies(params);
    expect(payload).toEqual({
      packageJson: {
        dependencies: {
          'fake-package-1': '1.2.3',
        },
      },
      versionsToPin: [
        {
          dependency: 'fake-package-1',
          pinnedVersion: '1.2.3',
          version: '^1.0.0',
        },
      ],
    });
  });

  it('should handle pnpm lockfile v6.0', async () => {
    const params: PinDependenciesInput = {
      packageJson: {
        dependencies: {
          'fake-package-1': '^1.0.0',
        },
      },
      packageJsonIndent: '  ',
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
    const payload = pinDependencies(params);
    expect(payload).toEqual({
      packageJson: {
        dependencies: {
          'fake-package-1': '1.2.3',
        },
      },
      versionsToPin: [
        {
          dependency: 'fake-package-1',
          pinnedVersion: '1.2.3',
          version: '^1.0.0',
        },
      ],
    });
  });
});
