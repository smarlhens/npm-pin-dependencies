# NPM pin dependencies

[![CodeQL](https://github.com/smarlhens/npm-pin-dependencies/workflows/codeql/badge.svg)](https://github.com/smarlhens/npm-pin-dependencies/actions/workflows/codeql.yml)
[![GitHub CI](https://github.com/smarlhens/npm-pin-dependencies/workflows/ci/badge.svg)](https://github.com/smarlhens/npm-pin-dependencies/actions/workflows/ci.yml)
![node-current (scoped)](https://img.shields.io/node/v/@smarlhens/npm-pin-dependencies)
[![GitHub license](https://img.shields.io/github/license/smarlhens/npm-pin-dependencies)](https://github.com/smarlhens/npm-pin-dependencies)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**npm-pin-dependencies will pin your dependency versions based on lock file using installed versions.**

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
  - [CLI](#cli)
  - [Node](#node)
- [Options](#options)
- [Debug](#debug)

---

## Prerequisites

- [Node.JS](https://nodejs.org/en/download/) **version ^18.12.0 || ^20.0.0 || ^22.0.0**

---

## Installation

Install globally:

```sh
npm install -g @smarlhens/npm-pin-dependencies
```

Or run with [npx](https://docs.npmjs.com/cli/v8/commands/npx):

```sh
npx @smarlhens/npm-pin-dependencies
```

---

## Usage

### CLI

Will pin `package.json` dependency versions for the project in the current directory based on the npm `package-lock.json` file:

```sh
$ npd
```

Upgrade a project's `package.json` file:

```sh
$ npd -u
```

### Node

```typescript
import {
  pinDependenciesFromString,
  validatePackageJsonString,
  validatePackageLockString,
} from '@smarlhens/npm-pin-dependencies';

let packageJsonString = ''; // load content of package.json as stringified JSON
let packageLockString = ''; // load content of package-lock.json as stringified JSON

validatePackageJsonString({ packageJsonString }); // can throw Errors if unexpected format
validatePackageLockString({ packageLockString }); // can throw Errors if unexpected format

// packageJson is the content of your package.json with pinned dependencies
// versionsToPin contains changes if you want to display them
const { versionsToPin, packageJson } = pinDependenciesFromString({
  packageJsonString,
  packageLockString,
});
console.log(packageJson);
console.log(
  versionsToPin
    .map(({ pinnedVersion, version, dependency }) => `${dependency} version ${version} replaced by ${pinnedVersion}`)
    .join('\n'),
);
```

---

## Options

```text
Usage: npd [options]

Options:
  -q, --quiet    Enable quiet mode.                                [boolean] [default: false]
  -d, --debug    Enable debug mode. Can be used with environment variable DEBUG=npd.
                                                                   [boolean] [default: false]
  -v, --verbose  A little more detailed than the default output.   [boolean] [default: false]
  -u, --update   Update dependency versions in package.json file.  [boolean] [default: false]
      --enableSaveExact  Enable save exact.                        [boolean] [default: false]
      --help     Show help                                                          [boolean]
      --version  Show version number                                                [boolean]

Examples:
  npd     Check installed dependency versions based on package-lock.json file in the current
          working directory.
  npd -u  Pin package.json dependency versions based on package-lock.json file in the current
           working directory.

© 2023 Samuel MARLHENS
```

---

## Debug

```sh
$ DEBUG=* npd -d
```

<details>

<summary>output with debug</summary>

```text
[STARTED] Pinning dependency versions in package.json file...
[STARTED] Reading package-lock.json...
[SUCCESS] Reading package-lock.json...
[STARTED] Reading yarn.lock...
[SUCCESS] Reading yarn.lock...
[STARTED] Reading package.json...
[SUCCESS] Reading package.json...
[STARTED] Validating package-lock.json...
[SUCCESS] Validating package-lock.json...
[STARTED] Validating yarn.lock...
[SKIPPED] Validating yarn.lock...
[STARTED] Validating package.json...
[SUCCESS] Validating package.json...
[STARTED] Computing which dependency versions are to pin...
  npd Dependency fake-package-1 version is not pinned: ^1.0.0 -> 1.1.0. +0ms
  npd Dependency fake-package-2 version is not pinned: ~2.5.0 -> 2.5.2. +0ms
  npd Dependency fake-package-3 version is not pinned: 3.x -> 3.1.1. +0ms
  npd Dependency fake-package-4 version is not pinned: ^0.0.3 -> 0.0.3. +0ms
  npd Dependency fake-package-5 version is not pinned: ~0.0.3 -> 0.0.9. +0ms
  npd Dependency fake-package-6 version is not pinned: ^0.1.0 -> 0.1.0. +0ms
  npd Dependency fake-package-7 version is not pinned: ~0.1.0 -> 0.1.1. +0ms
  npd Dependency fake-package-8 version is already pinned. +0ms
  npd Dependency fake-package-9 version is not pinned: 1.0.0 - 1.2.0 -> 1.1.1. +0ms
  npd Dependency fake-package-10 version is not pinned: >2.1 -> 2.2.2. +0ms
  npd Dependency fake-package-11 version is not pinned: ^2 <2.2 || > 2.3 -> 2.1.6. +0ms
  npd Dependency fake-package-12 version is not pinned: ^2 <2.2 || > 2.3 -> 2.4.2. +1ms
  npd Dependency fake-dev-package-1 version is not pinned: ^4.0.0 -> 4.0.0. +0ms
  npd Dependency fake-dev-package-2 version is not pinned: ~5.0.0 -> 5.0.0. +0ms
  npd Dependency fake-dev-package-3 version is not pinned: 6.x -> 6.0.0. +0ms
  npd Dependency fake-optional-package-1 version is not pinned: ^7.0.0 -> 7.0.0. +0ms
  npd Dependency fake-optional-package-2 version is not pinned: ~8.0.0 -> 8.0.0. +0ms
  npd Dependency fake-optional-package-3 version is not pinned: 9.x -> 9.0.0. +0ms
[SUCCESS] Computing which dependency versions are to pin...
[STARTED] Output dependency versions that can be pinned...
[TITLE] Dependency versions that can be pinned:
[TITLE]
[TITLE]  fake-package-1           ^1.0.0            →  1.1.0
[TITLE]  fake-package-2           ~2.5.0            →  2.5.2
[TITLE]  fake-package-3           3.x               →  3.1.1
[TITLE]  fake-package-4           ^0.0.3            →  0.0.3
[TITLE]  fake-package-5           ~0.0.3            →  0.0.9
[TITLE]  fake-package-6           ^0.1.0            →  0.1.0
[TITLE]  fake-package-7           ~0.1.0            →  0.1.1
[TITLE]  fake-package-9           1.0.0 - 1.2.0     →  1.1.1
[TITLE]  fake-package-10          >2.1              →  2.2.2
[TITLE]  fake-package-11          ^2 <2.2 || > 2.3  →  2.1.6
[TITLE]  fake-package-12          ^2 <2.2 || > 2.3  →  2.4.2
[TITLE]  fake-dev-package-1       ^4.0.0            →  4.0.0
[TITLE]  fake-dev-package-2       ~5.0.0            →  5.0.0
[TITLE]  fake-dev-package-3       6.x               →  6.0.0
[TITLE]  fake-optional-package-1  ^7.0.0            →  7.0.0
[TITLE]  fake-optional-package-2  ~8.0.0            →  8.0.0
[TITLE]  fake-optional-package-3  9.x               →  9.0.0
[TITLE]
[TITLE] Run npd -d -u to upgrade package.json.
[SUCCESS] Output dependency versions that can be pinned...
[STARTED] Updating package.json...
[SKIPPED] Update is disabled by default.
[STARTED] Enabling save-exact using .npmrc...
[SKIPPED] Enabling save-exact is disabled by default.
[SUCCESS] Dependency versions that can be pinned:
[SUCCESS]
[SUCCESS]  fake-package-1           ^1.0.0            →  1.1.0
[SUCCESS]  fake-package-2           ~2.5.0            →  2.5.2
[SUCCESS]  fake-package-3           3.x               →  3.1.1
[SUCCESS]  fake-package-4           ^0.0.3            →  0.0.3
[SUCCESS]  fake-package-5           ~0.0.3            →  0.0.9
[SUCCESS]  fake-package-6           ^0.1.0            →  0.1.0
[SUCCESS]  fake-package-7           ~0.1.0            →  0.1.1
[SUCCESS]  fake-package-9           1.0.0 - 1.2.0     →  1.1.1
[SUCCESS]  fake-package-10          >2.1              →  2.2.2
[SUCCESS]  fake-package-11          ^2 <2.2 || > 2.3  →  2.1.6
[SUCCESS]  fake-package-12          ^2 <2.2 || > 2.3  →  2.4.2
[SUCCESS]  fake-dev-package-1       ^4.0.0            →  4.0.0
[SUCCESS]  fake-dev-package-2       ~5.0.0            →  5.0.0
[SUCCESS]  fake-dev-package-3       6.x               →  6.0.0
[SUCCESS]  fake-optional-package-1  ^7.0.0            →  7.0.0
[SUCCESS]  fake-optional-package-2  ~8.0.0            →  8.0.0
[SUCCESS]  fake-optional-package-3  9.x               →  9.0.0
[SUCCESS]
[SUCCESS] Run npd -d -u to upgrade package.json.
```

</details>

---
