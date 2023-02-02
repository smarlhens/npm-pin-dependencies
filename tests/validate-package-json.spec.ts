import { describe, expect, it } from 'vitest';

import { validatePackageJson } from '../lib/npd.js';

describe('validate package json', () => {
  it('should return valid json w/ dependencies, dev-dependencies & optional dependencies', async () => {
    const params = {
      packageJsonString:
        '{"name":"fake","private":true,"dependencies":{"fake-package-01":"^1.0.0","fake-package-02":"~2.5.0","fake-package-03":"3.x","fake-package-04":"^0.0.3","fake-package-05":"~0.0.3","fake-package-06":"^0.1.0","fake-package-07":"~0.1.0","fake-package-08":"1.0.0-rc.1","fake-package-09":"1.0.0 - 1.2.0","fake-package-10":">2.1","fake-package-11":"^2 <2.2 || > 2.3","fake-package-12":"^2 <2.2 || > 2.3"},"devDependencies":{"fake-dev-package-1":"^4.0.0","fake-dev-package-2":"~5.0.0","fake-dev-package-3":"6.x"},"optionalDependencies":{"fake-optional-package-1":"^7.0.0","fake-optional-package-2":"~8.0.0","fake-optional-package-3":"9.x"}}',
    };
    expect(validatePackageJson(params)).toEqual(true);
  });

  it('should return valid json w/ only dependencies', async () => {
    const params = {
      packageJsonString:
        '{"name":"fake","private":true,"dependencies":{"fake-package-01":"^1.0.0","fake-package-02":"~2.5.0","fake-package-03":"3.x","fake-package-04":"^0.0.3","fake-package-05":"~0.0.3","fake-package-06":"^0.1.0","fake-package-07":"~0.1.0","fake-package-08":"1.0.0-rc.1","fake-package-09":"1.0.0 - 1.2.0","fake-package-10":">2.1","fake-package-11":"^2 <2.2 || > 2.3","fake-package-12":"^2 <2.2 || > 2.3"}}',
    };
    expect(validatePackageJson(params)).toEqual(true);
  });

  it('should return valid json w/ only dev-dependencies', async () => {
    const params = {
      packageJsonString:
        '{"name":"fake","private":true,"devDependencies":{"fake-dev-package-1":"^4.0.0","fake-dev-package-2":"~5.0.0","fake-dev-package-3":"6.x"}}',
    };
    expect(validatePackageJson(params)).toEqual(true);
  });

  it('should return valid json w/ only optional dependencies', async () => {
    const params = {
      packageJsonString:
        '{"name":"fake","private":true,"optionalDependencies":{"fake-optional-package-1":"^7.0.0","fake-optional-package-2":"~8.0.0","fake-optional-package-3":"9.x"}}',
    };
    expect(validatePackageJson(params)).toEqual(true);
  });

  it('should return valid json w/o dependencies, dev-dependencies & optional dependencies', async () => {
    const params = {
      packageJsonString: '{"name":"fake","private":true}',
    };
    expect(validatePackageJson(params)).toEqual(true);
  });
});
