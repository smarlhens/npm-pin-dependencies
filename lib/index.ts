import Ajv, { JSONSchemaType } from 'ajv';
import chalk from 'chalk';
import Table from 'cli-table';
import Debug, { Debugger } from 'debug';
import { Listr, ListrBaseClassOptions, ListrRenderer, ListrTask, ListrTaskWrapper } from 'listr2';
import type { ListrDefaultRendererOptions, ListrRendererValue } from 'listr2';
import fs from 'node:fs/promises';
import { join, normalize } from 'node:path';
import * as semver from 'semver';

import type { CLIArgs } from './yargs.js';

type Dependencies = {
  [dependencyName: string]: string;
};

type PackageJson = {
  dependencies: Dependencies;
  devDependencies: Dependencies;
  optionalDependencies: Dependencies;
};

type PackageLock = {
  packages: { [dependencyName: string]: { version: string } };
};

type VersionToPin = {
  dependency: string;
  version: string;
  pinnedVersion: string;
};

type Context = {
  packageLockString: string;
  packageJsonString: string;
  packageJson: PackageJson;
  versionsToPin: VersionToPin[];
};

type Options = {
  workingDir: string;
  update: boolean;
  verbose: boolean;
  quiet: boolean;
  debug: boolean;
  packageLockPath: string;
  packageJsonPath: string;
};

const packageLockFilename = 'package-lock.json' as const;
const packageJsonFilename = 'package.json' as const;
const debugNamespace: string = 'npd' as const;
const debug: Debugger = Debug(debugNamespace);
const namespaces = () => Debug.disable();
const enableNamespaces = (namespaces: string): void => Debug.enable(namespaces);

const renderer = (
  { debug, quiet, verbose }: { debug?: boolean; quiet?: boolean; verbose?: boolean },
  env = process.env,
): ListrDefaultRendererOptions<ListrRendererValue> => {
  if (quiet) {
    return { renderer: 'silent' };
  }

  if (verbose) {
    return { renderer: 'simple' };
  }

  const isDumbTerminal = env.TERM === 'dumb';

  if (debug || isDumbTerminal || env.NODE_ENV === 'test') {
    return { renderer: 'verbose' };
  }

  return { renderer: 'default', rendererOptions: { dateFormat: false } };
};

export const npd = async (args: CLIArgs): Promise<Context> => {
  const cliArgs = args;

  let options: Options = {
    workingDir: normalize(process.cwd()),
    update: cliArgs.update || false,
    verbose: cliArgs.verbose || false,
    quiet: cliArgs.quiet || false,
    debug: cliArgs.debug || false,
    packageLockPath: join(process.cwd(), packageLockFilename),
    packageJsonPath: join(process.cwd(), packageJsonFilename),
  };

  const context = {
    ...renderer({ quiet: options.quiet, debug: options.debug, verbose: options.verbose }),
  };

  const debugNamespaces = namespaces();
  if (options.debug) {
    enableNamespaces(debugNamespaces);
  }

  return pinDependenciesCommand({
    options,
    context,
    debug,
  }).run();
};

// @ts-ignore https://github.com/ajv-validator/ajv/issues/2132
const ajv = new Ajv();

const packageJsonSchema: JSONSchemaType<PackageJson> = {
  type: 'object',
  properties: {
    dependencies: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      required: [],
    },
    devDependencies: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      required: [],
    },
    optionalDependencies: {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
      required: [],
    },
  },
  required: [],
};

// @ts-ignore
const packageLockSchema: JSONSchemaType<PackageLock> = {
  type: 'object',
  properties: {
    packages: {
      type: 'object',
      patternProperties: {
        '^.*$': {
          type: 'object',
          properties: {
            version: {
              type: 'string',
            },
          },
          required: ['version'],
        },
      },
    },
  },
  required: ['packages'],
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

export const generateUpdateCommandFromContext = (options: Options): string => {
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

const pinDependenciesTasks = ({
  options,
  parent,
  debug,
}: {
  options: Options;
  parent: Omit<ListrTaskWrapper<Context, typeof ListrRenderer>, 'skip' | 'enabled'>;
  debug: Debugger;
}): ListrTask<Context>[] => [
  {
    title: 'Reading package-lock.json...',
    task: async (ctx: Context) => {
      ctx.packageLockString = await fs.readFile(options.packageLockPath, 'utf8');
    },
  },
  {
    title: 'Reading package.json...',
    task: async (ctx: Context) => {
      ctx.packageJsonString = await fs.readFile(options.packageJsonPath, 'utf8');
    },
  },
  {
    title: 'Validating package-lock.json...',
    task: (ctx: Context) => {
      const packageLockValidator = ajv.compile(packageLockSchema);
      const isValid = packageLockValidator(JSON.parse(ctx.packageLockString));
      if (!isValid) {
        throw new Error(`Invalid package-lock.json: ${ajv.errorsText(packageLockValidator.errors)}`);
      }
    },
  },
  {
    title: 'Validating package.json...',
    task: (ctx: Context) => {
      const packageJsonValidator = ajv.compile(packageJsonSchema);
      const isValid = packageJsonValidator(JSON.parse(ctx.packageJsonString));
      if (!isValid) {
        throw new Error(`Invalid package.json: ${ajv.errorsText(packageJsonValidator.errors)}`);
      }
    },
  },
  {
    title: 'Computing which dependency versions are to pin...',
    task: (ctx: Context) => {
      const packageLock: PackageLock = JSON.parse(ctx.packageLockString);
      let packageJson: PackageJson = JSON.parse(ctx.packageJsonString);
      const versionsToPin: VersionToPin[] = [];
      const dependencyTypes: (keyof PackageJson)[] = ['dependencies', 'devDependencies', 'optionalDependencies'];
      for (const dependencyType of dependencyTypes) {
        if (!(dependencyType in packageJson)) {
          continue;
        }

        for (const dependencyName of Object.keys(packageJson[dependencyType])) {
          const packageLockDependency = packageLock.packages[`node_modules/${dependencyName}`].version;
          if (!packageLockDependency) {
            continue;
          }

          const installedVersion = packageLockDependency;
          const requiredVersion = packageJson[dependencyType][dependencyName];
          if (!semver.clean(requiredVersion)) {
            debug(
              `Dependency ${chalk.white(dependencyName)} version is not pinned: ${chalk.red(
                requiredVersion,
              )} -> ${chalk.green(installedVersion)}.`,
            );
            versionsToPin.push({
              dependency: dependencyName,
              version: requiredVersion,
              pinnedVersion: installedVersion,
            });
            packageJson[dependencyType][dependencyName] = installedVersion;
          } else {
            debug(`Dependency ${chalk.white(dependencyName)} version is already pinned.`);
          }
        }
      }
      ctx.packageJson = packageJson;
      ctx.versionsToPin = versionsToPin;
    },
  },
  {
    title: 'Output dependency versions that can be pinned...',
    task: (ctx: Context) => {
      const arrowSeparator: string = '→';
      let colWidths: [number, number, number, number] = [2, 2, 2, 2];
      let colValues: [string, string, string, string][] = [];

      for (const { pinnedVersion, version, dependency } of ctx.versionsToPin) {
        colWidths = [
          Math.max(colWidths[0], dependency.length + 2),
          Math.max(colWidths[1], version.length + 2),
          arrowSeparator.length + 2,
          Math.max(colWidths[3], pinnedVersion.length + 2),
        ];
        colValues.push([dependency, version, arrowSeparator, pinnedVersion]);
      }

      if (0 === ctx.versionsToPin.length) {
        parent.title = `All dependency versions are already pinned ${chalk.green(':)')}`;
      } else {
        const table: Table = createOutputTable(colWidths);
        table.push(...colValues);
        let title = `Dependency versions that can be pinned:\n\n${table.toString()}`;

        if (!options.update) {
          title += `\n\nRun ${chalk.cyan(generateUpdateCommandFromContext(options))} to upgrade package.json.`;
        }

        parent.title = title;
      }
    },
  },
  {
    title: 'Updating package.json...',
    skip: () => (!options.update ? 'Update is disabled by default.' : !options.update),
    task: (ctx: Context) => {
      return fs.writeFile(options.packageJsonPath, JSON.stringify(ctx.packageJson, null, 2));
    },
  },
];

export const pinDependenciesCommand = ({
  options,
  context,
  debug,
}: {
  options: Options;
  context: ListrBaseClassOptions<Context, ListrRendererValue>;
  debug: Debugger;
}): Listr<Context, ListrRendererValue> => {
  return new Listr(
    [
      {
        title: `Pinning dependency versions in package.json file...`,
        task: (_, task) => task.newListr(parent => pinDependenciesTasks({ parent, debug, options })),
      },
    ],
    context,
  );
};
