import type { LockFileObject } from '@yarnpkg/lockfile';
import lockfile from '@yarnpkg/lockfile';
import { parseSyml } from '@yarnpkg/parsers';
import type { JSONSchemaType, Schema } from 'ajv';
import Ajv from 'ajv';
import chalk from 'chalk';
import Table from 'cli-table';
import type { Debugger } from 'debug';
import Debug from 'debug';
import { findUpMultiple, pathExists } from 'find-up';
import type { ListrBaseClassOptions, ListrGetRendererOptions, ListrRenderer, ListrTaskWrapper } from 'listr2';
import { Listr } from 'listr2';
import type { ListrDefaultRendererOptions, ListrRendererValue } from 'listr2';
import fs from 'node:fs/promises';
import { join, normalize } from 'node:path';
import * as semver from 'semver';

import type { CLIArgs } from './yargs.js';

type Dependencies = {
  [dependencyName: string]: string;
};

type PackageJson = {
  [key: string]: any;
  dependencies?: Dependencies | undefined;
  devDependencies?: Dependencies | undefined;
  optionalDependencies?: Dependencies | undefined;
};

type LockDependency = { version: string };
type LockDependencies = { [dependencyName: string]: LockDependency };
type PackageLockDependencies = { dependencies: LockDependencies };
type PackageLockPackages = { packages: { '': { version?: string } } & LockDependencies };

type PackageLockVersion1 = {
  lockfileVersion: 1;
} & PackageLockDependencies;

type PackageLockVersion2 = {
  lockfileVersion: 2;
} & Partial<PackageLockPackages> &
  PackageLockDependencies;

type PackageLockVersion3 = {
  lockfileVersion: 3;
} & PackageLockPackages;

type PackageLock = PackageLockVersion1 | PackageLockVersion2 | PackageLockVersion3;

type YarnLock = {
  type: 'success' | 'merge' | 'conflict';
  object: LockFileObject;
};

type VersionToPin = {
  dependency: string;
  version: string;
  pinnedVersion: string;
};

type LockFile = {
  content: any;
  mtime?: Date | undefined;
};

type NpmDependenciesInput = {
  packageLockFile?: LockFile | undefined;
};

type YarnDependenciesInput = {
  yarnLockFile?: LockFile | undefined;
};

type PinDependenciesPackage = { packageJson: PackageJson };

export type PinDependenciesInput = PinDependenciesPackage & NpmDependenciesInput & YarnDependenciesInput;

export type PinDependenciesOutput = {
  packageJson: PackageJson;
  versionsToPin: VersionToPin[];
};

export type PinDependenciesContext = PinDependenciesInput & Partial<PinDependenciesOutput>;

type PackageLockString = {
  packageLockString: string;
};

type YarnLockString = {
  yarnLockString: string;
};

export type PinDependenciesFromString = {
  packageJsonString: string;
} & (PackageLockString | YarnLockString);

type Options = {
  workingDir: string;
  update: boolean;
  verbose: boolean;
  quiet: boolean;
  debug: boolean;
  packageLockPath: string;
  yarnLockPath: string;
  packageJsonPath: string;
  enableSaveExact: boolean;
};

const packageLockFileName = 'package-lock.json' as const;
const yarnLockFileName = 'yarn.lock' as const;
const packageJsonFileName = 'package.json' as const;
export const parsePackageJsonString = (raw: string): PackageJson => JSON.parse(raw);
export const parsePackageLockString = (raw: string): PackageLock => JSON.parse(raw);
export const parseYarnLockString = (raw: string): YarnLock => {
  if (raw.includes('# yarn lockfile v1')) {
    return lockfile.parse(raw).object;
  } else if (/^__metadata:\s*version: (\d)(?:\r|\n)/m.test(raw)) {
    return parseSyml(raw) as YarnLock;
  } else {
    throw new Error('Lock file version not yet supported.');
  }
};
const debugNamespace: string = 'npd' as const;
const debug: Debugger = Debug(debugNamespace);
const namespaces = () => Debug.disable();
const enableNamespaces = (namespaces: string): void => Debug.enable(namespaces);

const renderer = (
  { debug, quiet, verbose }: { debug?: boolean; quiet?: boolean; verbose?: boolean },
  env = process.env,
): ListrDefaultRendererOptions<ListrRendererValue> => {
  const rendererOptions: ListrGetRendererOptions<ListrRendererValue> = {
    formatOutput: 'wrap',
    dateFormat: false,
    removeEmptyLines: false,
  };

  if (quiet) {
    return { renderer: 'silent', rendererOptions };
  }

  if (verbose) {
    return { renderer: 'simple', rendererOptions };
  }

  const isDumbTerminal = env.TERM === 'dumb';

  if (debug || isDumbTerminal || env.NODE_ENV === 'test') {
    return { renderer: 'verbose', rendererOptions };
  }

  return { renderer: 'default', rendererOptions };
};

export const pinDependenciesFromCLI = async (args: CLIArgs): Promise<PinDependenciesContext> => {
  const cliArgs = args;

  let options: Options = {
    workingDir: normalize(process.cwd()),
    update: cliArgs.update || false,
    verbose: cliArgs.verbose || false,
    quiet: cliArgs.quiet || false,
    debug: cliArgs.debug || false,
    enableSaveExact: cliArgs.enableSaveExact || false,
    packageLockPath: join(process.cwd(), packageLockFileName),
    packageJsonPath: join(process.cwd(), packageJsonFileName),
    yarnLockPath: join(process.cwd(), yarnLockFileName),
  };

  const context: ListrBaseClassOptions<PinDependenciesContext, ListrRendererValue> = {
    ...renderer({ quiet: options.quiet, debug: options.debug, verbose: options.verbose }),
  };

  const debugNamespaces = namespaces();
  if (options.debug) {
    enableNamespaces(debugNamespaces);
  }

  return pinDependenciesCommand({
    options,
    context,
  }).run();
};

// @ts-ignore https://github.com/ajv-validator/ajv/issues/2132
const ajv = new Ajv();

// @ts-ignore
const packageJsonSchema: JSONSchemaType<PackageJson> = {
  type: 'object',
  properties: {
    dependencies: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    },
    devDependencies: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    },
    optionalDependencies: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    },
  },
};

// @ts-ignore
const packageLockSchema: JSONSchemaType<PackageLock> = {
  type: 'object',
  properties: {
    lockfileVersion: { type: 'number', enum: [1, 2, 3] },
    dependencies: {
      type: 'object',
      patternProperties: {
        '^.*$': {
          type: 'object',
          properties: {
            version: { type: 'string' },
          },
          required: ['version'],
        },
      },
    },
    packages: {
      type: 'object',
      patternProperties: {
        '^.+$': {
          type: 'object',
          properties: {
            version: { type: 'string' },
          },
          required: ['version'],
        },
      },
    },
  },
  required: ['lockfileVersion'],
  oneOf: [
    {
      properties: { lockfileVersion: { const: 1 } },
      required: ['dependencies'],
      not: { required: ['packages'] },
    },
    {
      properties: { lockfileVersion: { const: 2 } },
      required: ['dependencies'],
    },
    {
      properties: { lockfileVersion: { const: 3 } },
      required: ['packages'],
      not: { required: ['dependencies'] },
    },
  ],
};

// @ts-ignore
const yarnLockSchema: JSONSchemaType<YarnLock> = {
  type: 'object',
  patternProperties: {
    '^[^@]+@[^@]+$': {
      type: 'object',
      properties: {
        version: {
          type: 'string',
        },
      },
      required: ['version'],
    },
  },
};

const createOutputTable = (colWidths: number[]): Table => {
  return new Table({
    style: {
      head: [],
      border: [],
      compact: false,
      'padding-left': 1,
      'padding-right': 1,
    },
    colWidths,
    colAligns: ['left', 'left', 'left', 'left'],
    chars: {
      top: '',
      'top-mid': '',
      'top-left': '',
      'top-right': '',
      bottom: '',
      'bottom-mid': '',
      'bottom-left': '',
      'bottom-right': '',
      left: '',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      right: '',
      'right-mid': '',
      middle: '',
    },
  });
};

const generateUpdateCommandFromContext = (options: Options): string => {
  const argv: string[] = ['npd'];

  if (options.quiet) {
    argv.push('-q');
  }

  if (options.debug) {
    argv.push('-d');
  }

  if (options.verbose) {
    argv.push('-v');
  }

  argv.push('-u');

  return argv.join(' ');
};

export const validateObj = ({ schema, obj, fileName }: { schema: Schema; obj: any; fileName: string }): boolean => {
  const validator = ajv.compile(schema);
  const isValid = validator(obj);
  if (!isValid) {
    throw new Error(`Invalid ${fileName}: ${ajv.errorsText(validator.errors)}`);
  }

  return isValid;
};

export const validatePackageLockString = (ctx: PackageLockString): boolean =>
  validatePackageLock({
    packageLockFile: {
      content: parsePackageLockString(ctx.packageLockString),
    },
  });

export const validatePackageLock = (ctx: Pick<NpmDependenciesInput, 'packageLockFile'>): boolean =>
  validateObj({
    fileName: packageLockFileName,
    obj: ctx.packageLockFile!.content,
    schema: packageLockSchema,
  });

export const validateYarnLockString = (ctx: YarnLockString): boolean =>
  validateYarnLock({
    yarnLockFile: {
      content: parseYarnLockString(ctx.yarnLockString),
    },
  });

export const validateYarnLock = (ctx: Pick<YarnDependenciesInput, 'yarnLockFile'>): boolean =>
  validateObj({
    fileName: yarnLockFileName,
    obj: ctx.yarnLockFile!.content,
    schema: yarnLockSchema,
  });

export const validatePackageJsonString = (ctx: Pick<PinDependenciesFromString, 'packageJsonString'>): boolean =>
  validatePackageJson({
    packageJson: parsePackageJsonString(ctx.packageJsonString),
  });

export const validatePackageJson = (ctx: Pick<PinDependenciesInput, 'packageJson'>): boolean =>
  validateObj({
    fileName: packageJsonFileName,
    obj: ctx.packageJson,
    schema: packageJsonSchema,
  });

type ResolveDependencyKey = ({ name, version }: { name: string; version: string }) => string;
type DependencyVersionResolver = {
  lockedDependencies: LockDependencies;
  resolveDependencyKey: ResolveDependencyKey;
};

const npmResolver = ({ packageLockFile }: NpmDependenciesInput): DependencyVersionResolver => {
  const packageLock: PackageLock = packageLockFile!.content;
  const resolvePackage: ResolveDependencyKey = ({ name }) => `node_modules/${name}`;
  const resolveDependency: ResolveDependencyKey = ({ name }) => name;

  if (packageLock.lockfileVersion === 1) {
    return {
      lockedDependencies: packageLock.dependencies,
      resolveDependencyKey: resolveDependency,
    };
  } else if (packageLock.lockfileVersion === 2) {
    return packageLock.packages
      ? {
          lockedDependencies: packageLock.packages,
          resolveDependencyKey: resolvePackage,
        }
      : {
          lockedDependencies: packageLock.dependencies,
          resolveDependencyKey: resolveDependency,
        };
  } else if (packageLock.lockfileVersion === 3) {
    return {
      lockedDependencies: packageLock.packages,
      resolveDependencyKey: resolvePackage,
    };
  } else {
    throw new Error(`Lock file version not yet supported.`);
  }
};

const yarnResolver = ({ yarnLockFile }: { yarnLockFile: LockFile }): DependencyVersionResolver => {
  return {
    lockedDependencies: yarnLockFile.content,
    resolveDependencyKey: ({ name, version }) => {
      if (!('__metadata' in yarnLockFile.content)) {
        return `${name}@${version}`;
      } else {
        return `${name}@npm:${version}`;
      }
    },
  };
};

export const pinDependencies = (ctx: PinDependenciesInput): PinDependenciesOutput => {
  let resolver: DependencyVersionResolver;
  const isLockFileDefined = (lockFile: LockFile | undefined): lockFile is LockFile =>
    typeof lockFile !== 'undefined' && lockFile !== undefined;

  if (
    isLockFileDefined(ctx.packageLockFile) &&
    typeof ctx.packageLockFile.mtime === 'undefined' &&
    isLockFileDefined(ctx.yarnLockFile) &&
    typeof ctx.yarnLockFile.mtime === 'undefined'
  ) {
    throw new Error(`Unable to decide which lock file to use.`);
  } else if (
    isLockFileDefined(ctx.packageLockFile) &&
    typeof ctx.packageLockFile.mtime !== 'undefined' &&
    isLockFileDefined(ctx.yarnLockFile) &&
    typeof ctx.yarnLockFile.mtime !== 'undefined'
  ) {
    resolver =
      ctx.packageLockFile.mtime.getTime() > ctx.yarnLockFile.mtime.getTime()
        ? npmResolver(ctx)
        : yarnResolver({ yarnLockFile: ctx.yarnLockFile });
  } else if (isLockFileDefined(ctx.packageLockFile)) {
    resolver = npmResolver(ctx);
  } else if (isLockFileDefined(ctx.yarnLockFile)) {
    resolver = yarnResolver({ yarnLockFile: ctx.yarnLockFile });
  } else {
    throw new Error(`Lock file is missing.`);
  }

  let packageJson: PackageJson = ctx.packageJson;
  const versionsToPin: VersionToPin[] = [];
  const dependencyTypes: (keyof PackageJson)[] = ['dependencies', 'devDependencies', 'optionalDependencies'];
  for (const dependencyType of dependencyTypes) {
    if (!(dependencyType in packageJson)) {
      continue;
    }

    for (const dependencyName of Object.keys(packageJson[dependencyType])) {
      const userDefinedVersion = packageJson[dependencyType][dependencyName];
      let dependencyKey: string = resolver.resolveDependencyKey({
        name: dependencyName,
        version: userDefinedVersion,
      });
      let packageLockDependency: LockDependency | undefined = resolver.lockedDependencies[dependencyKey];
      if (!packageLockDependency) {
        debug(`Dependency ${chalk.white(dependencyKey)} is undefined in ${chalk.cyan('dependencies')}.`);
        continue;
      }

      if (!('version' in packageLockDependency)) {
        debug(`Dependency ${chalk.white(dependencyKey)} version is undefined.`);
        continue;
      }

      const installedVersion = packageLockDependency.version;
      if (!semver.clean(userDefinedVersion, { loose: true }) && installedVersion !== userDefinedVersion) {
        debug(
          `Dependency ${chalk.white(dependencyName)} version is not pinned: ${chalk.red(
            userDefinedVersion,
          )} -> ${chalk.green(installedVersion)}.`,
        );
        versionsToPin.push({
          dependency: dependencyName,
          version: userDefinedVersion,
          pinnedVersion: installedVersion,
        });
        packageJson[dependencyType][dependencyName] = installedVersion;
      } else {
        debug(`Dependency ${chalk.white(dependencyName)} version is already pinned.`);
      }
    }
  }

  return {
    packageJson,
    versionsToPin,
  };
};

export const pinDependenciesFromString = (ctx: PinDependenciesFromString): PinDependenciesOutput => {
  if ('packageLockString' in ctx) {
    return pinDependencies({
      packageJson: parsePackageJsonString(ctx.packageJsonString),
      packageLockFile: {
        content: parsePackageLockString(ctx.packageLockString),
      },
      yarnLockFile: undefined,
    });
  } else {
    return pinDependencies({
      packageJson: JSON.parse(ctx.packageJsonString),
      packageLockFile: undefined,
      yarnLockFile: {
        content: parseYarnLockString(ctx.yarnLockString),
      },
    });
  }
};

type LockFileConfiguration = {
  fileName: string;
  filePath: string;
  parse: (raw: string) => any;
  contextKey: 'packageLockFile' | 'yarnLockFile';
};

type FetchedLockFile = {
  config: LockFileConfiguration;
  content: any;
  mtime: Date | undefined;
};

const lockFileConfigurations: LockFileConfiguration[] = [
  {
    fileName: packageLockFileName,
    filePath: join(process.cwd(), packageLockFileName),
    parse: parsePackageLockString,
    contextKey: 'packageLockFile',
  },
  {
    fileName: yarnLockFileName,
    filePath: join(process.cwd(), yarnLockFileName),
    parse: parseYarnLockString,
    contextKey: 'yarnLockFile',
  },
];

const resolveLockFileContent = ({ path, config }: { path: string; config: LockFileConfiguration }) =>
  Promise.all([
    config,
    fs
      .readFile(path, 'utf8')
      .then(raw => config.parse(raw))
      .catch(() => undefined),
    fs
      .stat(path)
      .then(payload => payload.mtime)
      .catch(() => undefined),
  ]);

const rawToFetchedLockFile = ([config, content, mtime]: [
  LockFileConfiguration,
  any,
  Date | undefined,
]): FetchedLockFile => ({
  config,
  content,
  mtime,
});

const filterLockFileWithUndefinedContent = (lockFile: FetchedLockFile): boolean =>
  typeof lockFile.content !== 'undefined';

const readLockFile = async ({ ctx }: { ctx: PinDependenciesContext }): Promise<PinDependenciesContext> => {
  const fileExists = await Promise.all(lockFileConfigurations.map(config => pathExists(config.filePath)));

  const fetchedLockFiles: FetchedLockFile[] = (
    await Promise.all(
      fileExists.map((fileExist, index) => {
        const config = lockFileConfigurations[index];

        if (!fileExist) {
          return Promise.all([config, undefined, undefined]);
        }

        return resolveLockFileContent({ config, path: config.filePath });
      }),
    )
  )
    .map(rawToFetchedLockFile)
    .filter(filterLockFileWithUndefinedContent);

  if (fetchedLockFiles.some(fetchedLockFile => typeof fetchedLockFile.content !== 'undefined')) {
    fetchedLockFiles.forEach(fetchedLockFile => {
      ctx[fetchedLockFile.config.contextKey] = { content: fetchedLockFile.content, mtime: fetchedLockFile.mtime };
    });

    return Promise.resolve(ctx);
  }

  const findUpLockPaths: string[] = await findUpMultiple(
    lockFileConfigurations.map(config => config.fileName),
    { type: 'file' },
  );

  const findUpLockFiles: FetchedLockFile[] = (
    await Promise.all(
      lockFileConfigurations.map(config => {
        const path = findUpLockPaths.find(absolutePath => absolutePath.endsWith(config.fileName))!;

        return resolveLockFileContent({ config, path });
      }),
    )
  )
    .map(rawToFetchedLockFile)
    .filter(filterLockFileWithUndefinedContent);

  findUpLockFiles.forEach(findUpLockFile => {
    ctx[findUpLockFile.config.contextKey] = { content: findUpLockFile.content, mtime: findUpLockFile.mtime };
  });

  return Promise.resolve(ctx);
};

const pinDependenciesReadFileTasks = ({
  options,
  task,
}: {
  options: Options;
  task: ListrTaskWrapper<PinDependenciesContext, typeof ListrRenderer>;
}): Listr<PinDependenciesContext, ListrRendererValue, ListrRendererValue> =>
  task.newListr(
    [
      {
        title: 'Reading lock files...',
        task: async (ctx: PinDependenciesContext) => {
          Object.assign(ctx, await readLockFile({ ctx }));
        },
      },
      {
        title: 'Reading package.json...',
        task: async (ctx: PinDependenciesContext) => {
          ctx.packageJson = await fs
            .readFile(options.packageJsonPath, 'utf8')
            .then<PackageJson>(raw => parsePackageJsonString(raw));
        },
      },
    ],
    {
      concurrent: true,
    },
  );

const pinDependenciesValidateTasks = ({
  task,
}: {
  task: ListrTaskWrapper<PinDependenciesContext, typeof ListrRenderer>;
}): Listr<PinDependenciesContext, ListrRendererValue, ListrRendererValue> =>
  task.newListr(
    [
      {
        title: 'Validating package-lock.json...',
        skip: ctx => typeof ctx.packageLockFile === 'undefined',
        task: (ctx: PinDependenciesContext) => {
          validatePackageLock(ctx);
        },
      },
      {
        title: 'Validating yarn.lock...',
        skip: ctx => typeof ctx.yarnLockFile === 'undefined',
        task: (ctx: PinDependenciesContext) => {
          validateYarnLock(ctx);
        },
      },
      {
        title: 'Validating package.json...',
        task: (ctx: PinDependenciesContext) => {
          validatePackageJson(ctx);
        },
      },
    ],
    {
      concurrent: true,
    },
  );

const pinDependenciesTasks = ({
  options,
  task,
}: {
  options: Options;
  task: ListrTaskWrapper<PinDependenciesContext, typeof ListrRenderer>;
}): Listr<PinDependenciesContext, ListrRendererValue, ListrRendererValue> =>
  task.newListr([
    {
      title: 'Reading...',
      task: (_, task) => pinDependenciesReadFileTasks({ options, task }),
    },
    {
      title: 'Validating...',
      task: (_, task) => pinDependenciesValidateTasks({ task }),
    },
    {
      title: 'Computing which dependency versions are to pin...',
      task: (ctx: PinDependenciesContext) => {
        Object.assign(ctx, pinDependencies(ctx));
      },
    },
    {
      title: 'Output dependency versions that can be pinned...',
      task: (ctx: PinDependenciesContext) => {
        const versionsToPin = ctx.versionsToPin!;
        const arrowSeparator: string = '→';
        let colWidths: [number, number, number, number] = [2, 2, 2, 2];
        let colValues: [string, string, string, string][] = [];

        for (const { pinnedVersion, version, dependency } of versionsToPin) {
          colWidths = [
            Math.max(colWidths[0], dependency.length + 2),
            Math.max(colWidths[1], version.length + 2),
            arrowSeparator.length + 2,
            Math.max(colWidths[3], pinnedVersion.length + 2),
          ];
          colValues.push([dependency, version, arrowSeparator, pinnedVersion]);
        }

        if (0 === versionsToPin.length) {
          task.title = `All dependency versions are already pinned ${chalk.green(':)')}`;
        } else {
          const table: Table = createOutputTable(colWidths);
          table.push(...colValues);

          let title = `${
            options.update ? 'Dependency versions pinned' : 'Dependency versions that can be pinned'
          }:\n\n${table.toString()}`;

          if (!options.update) {
            title += `\n\nRun ${chalk.cyan(generateUpdateCommandFromContext(options))} to upgrade package.json.`;
          }

          task.title = title;
        }
      },
    },
    {
      title: 'Updating package.json...',
      skip: () => (!options.update ? 'Update is disabled by default.' : !options.update),
      task: (ctx: PinDependenciesContext) => {
        return fs.writeFile(options.packageJsonPath, JSON.stringify(ctx.packageJson, null, 2) + '\n');
      },
    },
    {
      title: 'Enabling save-exact using .npmrc...',
      skip: () => (!options.enableSaveExact ? 'Enabling save-exact is disabled by default.' : !options.enableSaveExact),
      task: async (): Promise<void> => {
        const path = '.npmrc' as const;

        try {
          await fs.access(path, fs.constants.F_OK | fs.constants.R_OK);
          const contents = await fs.readFile(path, 'utf8');

          if (contents.includes('save-exact=true')) {
            debug('.npmrc file already contains save-exact=true');
          } else {
            await fs.appendFile(path, 'save-exact=true\n');
            debug('.npmrc file has been updated to set save-exact=true');
          }
        } catch {
          await fs.writeFile(path, 'save-exact=true\n');
          debug('.npmrc file has been created and set save-exact=true');
        }
      },
    },
  ]);

const pinDependenciesCommand = ({
  options,
  context,
}: {
  options: Options;
  context: ListrBaseClassOptions<PinDependenciesContext, ListrRendererValue>;
}): Listr<PinDependenciesContext, ListrRendererValue> => {
  return new Listr(
    [
      {
        title: `Pinning dependency versions in package.json file...`,
        task: (_, task) => pinDependenciesTasks({ task, options }),
      },
    ],
    context,
  );
};
