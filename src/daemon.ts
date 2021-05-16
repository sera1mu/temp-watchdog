import { logError, init, run } from './lib';
import { getConfig } from './structures/Config';
import { schedule } from 'node-cron';

process.title = 'temp-watchdog';

// Check CONFIG_FILE not undefined
if(typeof process.env.CONFIG_FILE === 'undefined') {
  logError('CONFIG_FILE not specified in environment variables.');
  process.exit(1);
}

const config = getConfig(process.env.CONFIG_FILE);

// Check cronExpression not undefined
if(typeof config.cronExpression === 'undefined') {
  logError('cronExpression is undefined in configuration.');
  process.exit(1);
}

// Initialize
init(config)
  .then((sheets) => {
    if(typeof config.cronExpression !== 'undefined') {
      schedule(config.cronExpression, () => {
        run(config, sheets).catch((err) => {
          logError(`Failed to execute: ${err.stack}`)
        });
      });
    }
  }).catch((err) => {
    logError(`Failed to initialize: ${err.stack}`);
    process.exit(1);
  });
