module.exports = {
  reject: [],
  target: name => {
    const targets = {
      '@types/node': 'minor',
      /**
       * v6 requires node >=20, keeping v5.x
       */
      '@trivago/prettier-plugin-sort-imports': 'minor',
      /**
       * v8 requires node >=20, keeping v7.x
       */
      'find-up': 'minor',
      /**
       * v5.54+ has subdeps requiring node >=20 (walk-up-path@4), v6 requires node >=20
       */
      knip: 'patch',
      /**
       * v16 requires node >=20, keeping v15.x
       */
      'lint-staged': 'minor',
      /**
       * v9 requires node >=20, v10 requires node >=22, keeping v8.x
       */
      listr2: 'minor',
      /**
       * v6 requires node >=20, keeping v5.x
       */
      rimraf: 'minor',
      /**
       * v3 requires node >=20, keeping v2.x
       */
      'sort-package-json': 'minor',
      /**
       * v3.2+ has subdeps requiring node >=20 (vite@7), v4 requires node >=20
       */
      vitest: 'patch',
      '@vitest/coverage-v8': 'patch',
      /**
       * v6 breaking changes, not sure supported by all deps
       */
      typescript: 'minor',
      /**
       * v18 requires node >=20, keeping v17.x
       */
      yargs: 'minor',
    };

    const keys = Object.keys(targets);
    if (keys.some(key => new RegExp(key).test(name))) {
      return targets[keys.find(key => new RegExp(key).test(name))];
    }

    return 'latest';
  },
};
