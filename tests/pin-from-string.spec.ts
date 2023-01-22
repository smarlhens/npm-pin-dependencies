import { describe, expect, it } from 'vitest';

import { PinDependenciesContext, pinDependenciesFromString } from '../lib/npd';

describe('pin from string', () => {
  it('should return dependency versions to pin', async () => {
    const params: PinDependenciesContext = {
      packageJsonString:
        '{"name":"fake","private":true,"dependencies":{"fake-package-01":"^1.0.0","fake-package-02":"~2.5.0","fake-package-03":"3.x","fake-package-04":"^0.0.3","fake-package-05":"~0.0.3","fake-package-06":"^0.1.0","fake-package-07":"~0.1.0","fake-package-08":"1.0.0-rc.1","fake-package-09":"1.0.0 - 1.2.0","fake-package-10":">2.1","fake-package-11":"^2 <2.2 || > 2.3","fake-package-12":"^2 <2.2 || > 2.3"},"devDependencies":{"fake-dev-package-1":"^4.0.0","fake-dev-package-2":"~5.0.0","fake-dev-package-3":"6.x"},"optionalDependencies":{"fake-optional-package-1":"^7.0.0","fake-optional-package-2":"~8.0.0","fake-optional-package-3":"9.x"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/fake-package-01":{"version":"1.1.0"},"node_modules/fake-package-02":{"version":"2.5.2"},"node_modules/fake-package-03":{"version":"3.1.1"},"node_modules/fake-package-04":{"version":"0.0.3"},"node_modules/fake-package-05":{"version":"0.0.9"},"node_modules/fake-package-06":{"version":"0.1.0"},"node_modules/fake-package-07":{"version":"0.1.1"},"node_modules/fake-package-08":{"version":"1.0.0-rc.1"},"node_modules/fake-package-09":{"version":"1.1.1"},"node_modules/fake-package-10":{"version":"2.2.2"},"node_modules/fake-package-11":{"version":"2.1.6"},"node_modules/fake-package-12":{"version":"2.4.2"},"node_modules/fake-dev-package-1":{"version":"4.0.0"},"node_modules/fake-dev-package-2":{"version":"5.0.0"},"node_modules/fake-dev-package-3":{"version":"6.0.0"},"node_modules/fake-optional-package-1":{"version":"7.0.0"},"node_modules/fake-optional-package-2":{"version":"8.0.0"},"node_modules/fake-optional-package-3":{"version":"9.0.0"}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual(undefined);
    expect(params.versionsToPin).toEqual([
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
    ]);
  });

  it('should return no dependency versions to pin', async () => {
    const params: PinDependenciesContext = {
      packageJsonString:
        '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"},"devDependencies":{"fake-dev-package-1":"2.0.0"},"optionalDependencies":{"fake-optional-package-1":"3.0.0"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/fake-package-1":{"version":"1.0.0"},"node_modules/fake-dev-package-1":{"version":"2.0.0"},"node_modules/fake-optional-package-1":{"version":"3.0.0"}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual(undefined);
    expect(params.versionsToPin).toEqual([]);
  });

  it('should return no dependency versions to pin from dependencies only', async () => {
    const params: PinDependenciesContext = {
      packageJsonString: '{"name":"fake","private":true,"dependencies":{"fake-package-1":"1.0.0"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/fake-package-1":{"version":"1.0.0"}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual(undefined);
    expect(params.versionsToPin).toEqual([]);
  });

  it('should return no dependency versions to pin from devDependencies only', async () => {
    const params: PinDependenciesContext = {
      packageJsonString: '{"name":"fake","private":true,"devDependencies":{"fake-dev-package-1":"2.0.0"}}',
      packageLockString:
        '{"name":"fake","lockfileVersion":2,"requires":true,"packages":{"node_modules/fake-dev-package-1":{"version":"2.0.0"}}}',
    };
    const payload = pinDependenciesFromString(params);
    expect(payload).toEqual(undefined);
    expect(params.versionsToPin).toEqual([]);
  });
});
