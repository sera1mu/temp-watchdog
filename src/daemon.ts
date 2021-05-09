import { logError, init, run } from './lib';
import { getConfig } from './structures/Config';

// Check CONFIG_FILE not undefined
if(typeof process.env.CONFIG_FILE === 'undefined') {
  logError('CONFIG_FILE not specified in environment variables.');
  process.exit(1);
}

const config = getConfig(process.env.CONFIG_FILE);

// Check intervalMs not undefined
if(typeof config.intervalMs === 'undefined') {
  logError('intervalMs is undefined in configuration.');
  process.exit(1);
}

// Initialize
init(config)
  .then((sheets) => {
    // Set run interval
    setInterval(() => {
      run(config, sheets).catch((err) => {
        logError(`Failed to execute: ${err.stack}`);
      });
    }, Number(config.intervalMs));
  }).catch((err) => {
    logError(`Failed to initialize: ${err.stack}`);
    process.exit(1);
  });
