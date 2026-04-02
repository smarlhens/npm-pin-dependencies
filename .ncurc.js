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
       * v6 requires node >=20, keeping v5.x
       */
      knip: 'minor',
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
       * v4 requires node >=20, keeping v3.x
       */
      vitest: 'minor',
      '@vitest/coverage-v8': 'minor',
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
