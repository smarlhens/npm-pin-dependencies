import { describe, expect, it } from 'vitest';

import { pinDependenciesFromString, PinDependenciesFromString } from '../lib/npd.js';

describe('pin from string', () => {
  it('should return dependency versions to pin', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString:
        '{"name":"fake","private":true,"dependencies":{"fake-package-01":"^1.0.0","fake-package-02":"~2.5.0","fake-package-03":"3.x","fake-package-04":"^0.0.3","fake-package-05":"~0.0.3","fake-package-06":"^0.1.0","fake-package-07":"~0.1.0","fake-package-08":"1.0.0-rc.1","fake-package-09":"1.0.0 - 1.2.0","fake-package-10":">2.1","fake-package-11":"^2 <2.2 || > 2.3","fake-package-12":"^2 <2.2 || > 2.3","fake-package-13":"file:foo/bar"},"devDependencies":{"fake-dev-package-1":"^4.0.0","fake-dev-package-2":"~5.0.0","fake-dev-package-3":"6.x"},"optionalDependencies":{"fake-optional-package-1":"^7.0.0","fake-optional-package-2":"~8.0.0","fake-optional-package-3":"9.x"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/fake-package-01":{"version":"1.1.0"},"node_modules/fake-package-02":{"version":"2.5.2"},"node_modules/fake-package-03":{"version":"3.1.1"},"node_modules/fake-package-04":{"version":"0.0.3"},"node_modules/fake-package-05":{"version":"0.0.9"},"node_modules/fake-package-06":{"version":"0.1.0"},"node_modules/fake-package-07":{"version":"0.1.1"},"node_modules/fake-package-08":{"version":"1.0.0-rc.1"},"node_modules/fake-package-09":{"version":"1.1.1"},"node_modules/fake-package-10":{"version":"2.2.2"},"node_modules/fake-package-11":{"version":"2.1.6"},"node_modules/fake-package-12":{"version":"2.4.2"},"node_modules/fake-package-13":{"version":"file:foo/bar"},"node_modules/fake-dev-package-1":{"version":"4.0.0"},"node_modules/fake-dev-package-2":{"version":"5.0.0"},"node_modules/fake-dev-package-3":{"version":"6.0.0"},"node_modules/fake-optional-package-1":{"version":"7.0.0"},"node_modules/fake-optional-package-2":{"version":"8.0.0"},"node_modules/fake-optional-package-3":{"version":"9.0.0"}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
        dependencies: {
          'fake-package-01': '1.1.0',
          'fake-package-02': '2.5.2',
          'fake-package-03': '3.1.1',
          'fake-package-04': '0.0.3',
          'fake-package-05': '0.0.9',
          'fake-package-06': '0.1.0',
          'fake-package-07': '0.1.1',
          'fake-package-08': '1.0.0-rc.1',
          'fake-package-09': '1.1.1',
          'fake-package-10': '2.2.2',
          'fake-package-11': '2.1.6',
          'fake-package-12': '2.4.2',
          'fake-package-13': 'file:foo/bar',
        },
        devDependencies: {
          'fake-dev-package-1': '4.0.0',
          'fake-dev-package-2': '5.0.0',
          'fake-dev-package-3': '6.0.0',
        },
        optionalDependencies: {
          'fake-optional-package-1': '7.0.0',
          'fake-optional-package-2': '8.0.0',
          'fake-optional-package-3': '9.0.0',
        },
      },
      versionsToPin: [
        { dependency: 'fake-package-01', version: '^1.0.0', pinnedVersion: '1.1.0' },
        { dependency: 'fake-package-02', version: '~2.5.0', pinnedVersion: '2.5.2' },
        { dependency: 'fake-package-03', version: '3.x', pinnedVersion: '3.1.1' },
        { dependency: 'fake-package-04', version: '^0.0.3', pinnedVersion: '0.0.3' },
        { dependency: 'fake-package-05', version: '~0.0.3', pinnedVersion: '0.0.9' },
        { dependency: 'fake-package-06', version: '^0.1.0', pinnedVersion: '0.1.0' },
        { dependency: 'fake-package-07', version: '~0.1.0', pinnedVersion: '0.1.1' },
        { dependency: 'fake-package-09', version: '1.0.0 - 1.2.0', pinnedVersion: '1.1.1' },
        { dependency: 'fake-package-10', version: '>2.1', pinnedVersion: '2.2.2' },
        { dependency: 'fake-package-11', version: '^2 <2.2 || > 2.3', pinnedVersion: '2.1.6' },
        { dependency: 'fake-package-12', version: '^2 <2.2 || > 2.3', pinnedVersion: '2.4.2' },
        { dependency: 'fake-dev-package-1', version: '^4.0.0', pinnedVersion: '4.0.0' },
        { dependency: 'fake-dev-package-2', version: '~5.0.0', pinnedVersion: '5.0.0' },
        { dependency: 'fake-dev-package-3', version: '6.x', pinnedVersion: '6.0.0' },
        { dependency: 'fake-optional-package-1', version: '^7.0.0', pinnedVersion: '7.0.0' },
        { dependency: 'fake-optional-package-2', version: '~8.0.0', pinnedVersion: '8.0.0' },
        { dependency: 'fake-optional-package-3', version: '9.x', pinnedVersion: '9.0.0' },
      ],
    });
  });

  it('should return no dependency versions to pin', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString:
        '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"},"devDependencies":{"fake-dev-package-1":"2.0.0"},"optionalDependencies":{"fake-optional-package-1":"3.0.0"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/fake-package-1":{"version":"1.0.0"},"node_modules/fake-dev-package-1":{"version":"2.0.0"},"node_modules/fake-optional-package-1":{"version":"3.0.0"}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
        dependencies: { 'fake-package-1': '1.0.0' },
        devDependencies: { 'fake-dev-package-1': '2.0.0' },
        optionalDependencies: { 'fake-optional-package-1': '3.0.0' },
      },
      versionsToPin: [],
    });
  });

  it('should return no dependency versions to pin from dependencies only', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString: '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/fake-package-1":{"version":"1.0.0"}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: { name: 'fake', private: true, dependencies: { 'fake-package-1': '1.0.0' } },
      versionsToPin: [],
    });
  });

  it('should return no dependency versions to pin from devDependencies only', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString: '{"name":"fake","private":true,"devDependencies":{"fake-dev-package-1":"2.0.0"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/fake-dev-package-1":{"version":"2.0.0"}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: { name: 'fake', private: true, devDependencies: { 'fake-dev-package-1': '2.0.0' } },
      versionsToPin: [],
    });
  });

  it('should return no dependency versions to pin from lock file version 1', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString: '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":1,"requires":true,"dependencies":{"fake-package-1":{"version":"1.0.0"}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: { name: 'fake', private: true, dependencies: { 'fake-package-1': '1.0.0' } },
      versionsToPin: [],
    });
  });

  it('should return no dependency versions to pin from lock file version 3', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString: '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":3,"requires":true,"packages":{"node_modules/fake-package-1":{"version":"1.0.0"}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: { name: 'fake', private: true, dependencies: { 'fake-package-1': '1.0.0' } },
      versionsToPin: [],
    });
  });

  it('should return no dependency versions to pin from lock file version 2 w/ dependencies only', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString: '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"dependencies":{"fake-package-1":{"version":"1.0.0"}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: { name: 'fake', private: true, dependencies: { 'fake-package-1': '1.0.0' } },
      versionsToPin: [],
    });
  });

  it('should return no dependency versions to pin from lock file version 2 w/ packages only', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString: '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/fake-package-1":{"version":"1.0.0"}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: { name: 'fake', private: true, dependencies: { 'fake-package-1': '1.0.0' } },
      versionsToPin: [],
    });
  });

  it('should return no dependency versions to pin from lock file version 2 w/ packages & dependencies', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString: '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/fake-package-1":{"version":"1.0.0"}},"dependencies":{"fake-package-1":{"version":"1.0.0"}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: { name: 'fake', private: true, dependencies: { 'fake-package-1': '1.0.0' } },
      versionsToPin: [],
    });
  });

  it('should throw error on unhandled lock file version', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString: '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"}}',
      packageLockString: '{"name":"fake","lockfileVersion":4,"requires":true}',
    };
    expect(() => pinDependenciesFromString(params)).toThrowError(/Lock file version not yet supported./);
  });

  it('should continue if dependency is undefined in dependencies', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString: '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"}}',
      packageLockString: '{"name":"fake","lockfileVersion":1,"requires":true,"dependencies":{}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: { name: 'fake', private: true, dependencies: { 'fake-package-1': '1.0.0' } },
      versionsToPin: [],
    });
  });

  it('should continue if dependency is undefined in packages', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString: '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"}}',
      packageLockString: '{"name":"fake","lockfileVersion":3,"requires":true,"packages":{}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: { name: 'fake', private: true, dependencies: { 'fake-package-1': '1.0.0' } },
      versionsToPin: [],
    });
  });

  it('should continue if dependency version is undefined in dependencies', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString: '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"}}',
      packageLockString: '{"name":"fake","lockfileVersion":1,"requires":true,"dependencies":{"fake-package-1":{}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: { name: 'fake', private: true, dependencies: { 'fake-package-1': '1.0.0' } },
      versionsToPin: [],
    });
  });

  it('should continue if dependency version is undefined in packages', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString: '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"}}',
      packageLockString: '{"name":"fake","lockfileVersion":3,"requires":true,"packages":{"fake-package-1":{}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: { name: 'fake', private: true, dependencies: { 'fake-package-1': '1.0.0' } },
      versionsToPin: [],
    });
  });

  it('should pin dependency versions base on yarn lock v1', async () => {
    const params: PinDependenciesFromString = {
      packageJsonString:
        '{"name":"fake","private":true,"dependencies":{"fake-package-1":"^1.0.0","fake-package-2":"^2.0.0","fake-package-3":"^3.0.0"}}',
      yarnLockString:
        'fake-package-1@^1.0.0:\n' +
        '  version "1.0.3"\n' +
        '  resolved "https://registry.npmjs.org/fake-package-1/-/fake-package-1-1.0.3.tgz#a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"\n' +
        'fake-package-2@^2.0.0:\n' +
        '  version "2.0.1"\n' +
        '  resolved "https://registry.npmjs.org/fake-package-2/-/fake-package-2-2.0.1.tgz#a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"\n' +
        '  dependencies:\n' +
        '    fake-package-4 "^4.0.0"\n' +
        'fake-package-3@^3.0.0:\n' +
        '  version "3.1.9"\n' +
        '  resolved "https://registry.npmjs.org/fake-package-3/-/fake-package-3-3.1.9.tgz#a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"\n' +
        '  dependencies:\n' +
        '    fake-package-4 "^4.5.0"\n' +
        'fake-package-4@^4.0.0, fake-package-4@^4.5.0:\n' +
        '  version "4.6.3"\n' +
        '  resolved "https://registry.npmjs.org/fake-package-4/-/fake-package-4-2.6.3.tgz#a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual({
      packageJson: {
        name: 'fake',
        private: true,
        dependencies: { 'fake-package-1': '1.0.3', 'fake-package-2': '2.0.1', 'fake-package-3': '3.1.9' },
      },
      versionsToPin: [
        { dependency: 'fake-package-1', version: '^1.0.0', pinnedVersion: '1.0.3' },
        { dependency: 'fake-package-2', version: '^2.0.0', pinnedVersion: '2.0.1' },
        { dependency: 'fake-package-3', version: '^3.0.0', pinnedVersion: '3.1.9' },
      ],
    });
  });
});
