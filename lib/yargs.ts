/* istanbul ignore file */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

export type CLIArgs = {
  [p: string]: unknown;
  update?: boolean;
  quiet?: boolean;
  verbose?: boolean;
  debug?: boolean;
  _?: Array<string | number>;
  $0?: string;
};

const argv = yargs(hideBin(process.argv));
export const cli: Promise<CLIArgs> = argv
  .scriptName('npd')
  .usage('Usage: $0 [options]')
  .example(
    '$0',
    'Check installed dependency versions based on package-lock.json file in the current working directory.',
  )
  .example(
    '$0 -u',
    'Pin package.json dependency versions based on package-lock.json file in the current working directory.',
  )
  .strict()
  .options({
    quiet: {
      boolean: true,
      alias: 'q',
      default: false,
      description: 'Enable quiet mode.',
    },
    debug: {
      boolean: true,
      alias: 'd',
      default: false,
      description: 'Enable debug mode. Can be used with environment variable DEBUG=npd.',
    },
    verbose: {
      boolean: true,
      alias: 'v',
      default: false,
      description: 'A little more detailed than the default output.',
    },
    update: {
      boolean: true,
      alias: 'u',
      default: false,
      description: 'Update dependency versions in package.json file.',
    },
  })
  .help('help')
  .version()
  .wrap(argv.terminalWidth())
  .epilog('© 2023 Samuel MARLHENS').argv as Promise<CLIArgs>;
