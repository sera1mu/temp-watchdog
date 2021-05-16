import { logError, init, run } from './lib';
import { getConfig } from './structures/Config';

process.title = 'temp-watchdog';

// Check CONFIG_FILE not undefined
if(typeof process.env.CONFIG_FILE === 'undefined') {
  logError('CONFIG_FILE not specified in environment variables.');
  process.exit(1);
}

const config = getConfig(process.env.CONFIG_FILE);

// Initialize
init(config)
  .then((sheets) => {
    // Run
    run(config, sheets).catch((err) => {
      logError(`Failed to execute: ${err.stack}`);
      process.exit(1);
    });
  })
  .catch((err) => {
    logError(`Failed to initialize: ${err.stack}`);
    process.exit(1);
  });

