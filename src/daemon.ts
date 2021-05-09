import { logError, init, run } from './lib';
import { getConfig } from './structures/Config';

if(typeof process.env.CONFIG_FILE === 'undefined') {
  logError('CONFIG_FILE not specified in environment variables.');
  process.exit(1);
}

const config = getConfig(process.env.CONFIG_FILE);

if(typeof config.intervalMs === 'undefined') {
  logError('intervalMs is undefined in configuration.');
  process.exit(1);
}

init(config)
  .then((sheets) => {
    setInterval(() => {
      run(config, sheets).catch((err) => {
        logError(`Failed to execute: ${err.stack}`);
      });
    }, Number(config.intervalMs));
  }).catch((err) => {
    logError(`Failed to initialize: ${err.stack}`);
  });
