#!/usr/bin/env node
import fs from 'node:fs/promises';
import { dirname } from 'node:path';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import updateNotifier from 'update-notifier';

import { npd } from '../lib/index.js';
import { cli } from '../lib/yargs.js';

(async () => {
  const packageJsonPath = `../package.json` as const;
  const cliArgs = await cli;
  const pathToFile = join(dirname(fileURLToPath(import.meta.url)), packageJsonPath);
  const packageJson = JSON.parse(await fs.readFile(pathToFile, 'utf8'));
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

  await npd(cliArgs);
})();
