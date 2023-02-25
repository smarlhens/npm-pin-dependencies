import { describe, expect, it } from 'vitest';

import { validateYarnLockString } from '../lib/npd.js';

describe('validate yarn lock', () => {
  it('should return valid lock', async () => {
    const params = {
      yarnLockString: 'fake-package-1@^1.0.0:\n  version "1.0.3"',
    };
    expect(validateYarnLockString(params)).toEqual(true);
  });

  it('should return invalid lock', async () => {
    const params = {
      yarnLockString:
        'fake-package-1@^1.0.0:\n  resolved "https://registry.npmjs.org/fake-package-1/-/fake-package-1-1.0.3.tgz#a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"',
    };
    expect(() => validateYarnLockString(params)).toThrowError(/must have required property 'version'/);
  });
});
