#!/usr/bin/env node
import { findUp } from 'find-up';
import fs from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import updateNotifier from 'update-notifier';

import { pinDependenciesFromCLI } from '../lib/npd.js';
import { cli } from '../lib/yargs.js';

(async () => {
  const packageJsonPath = await findUp('package.json', { type: 'file', cwd: dirname(fileURLToPath(import.meta.url)) });
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath!, 'utf8'));
  const notifier = updateNotifier({
    pkg: packageJson,
    updateCheckInterval: 1000 * 60,
    shouldNotifyInNpmScript: true,
  });

  if (notifier.update && notifier.update.latest !== packageJson.version) {
    notifier.notify({
      defer: false,
      isGlobal: true,
    });
  }

  const cliArgs = await cli;
  await pinDependenciesFromCLI(cliArgs);
})();
