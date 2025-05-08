module.exports = {
  reject: [],
  target: name => {
    const targets = {
      '@types/node': 'minor',
      /**
       * v3 requires node >=20, keeping v2.x
       */
      'sort-package-json': 'minor',
      /**
       * v6 requires node >=20, keeping v5.x
       */
      rimraf: 'minor',
      /**
       * breaking changes in v9
       */
      execa: 'minor',
    };

    const keys = Object.keys(targets);
    if (keys.some(key => new RegExp(key).test(name))) {
      return targets[keys.find(key => new RegExp(key).test(name))];
    }

    return 'latest';
  },
};
