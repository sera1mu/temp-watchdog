import { logError, init, run } from './lib';
import { getConfig } from './structures/Config';
import { schedule } from 'node-cron';

// Check CONFIG_FILE not undefined
if(typeof process.env.CONFIG_FILE === 'undefined') {
  logError('CONFIG_FILE not specified in environment variables.');
  process.exit(1);
}

const config = getConfig(process.env.CONFIG_FILE);

// Check intervalMs not undefined
if(typeof config.cronSyntax === 'undefined') {
  logError('intervalMs is undefined in configuration.');
  process.exit(1);
}

// Initialize
init(config)
  .then((sheets) => {
    if(typeof config.cronSyntax !== 'undefined') {
      schedule(config.cronSyntax, () => {
        run(config, sheets).catch((err) => {
          logError(`Failed to execute: ${err.stack}`)
        });
      });
    }
  }).catch((err) => {
    logError(`Failed to initialize: ${err.stack}`);
    process.exit(1);
  });
