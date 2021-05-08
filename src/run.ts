import { logError, init, run } from './lib';

// Check specified records directory
if(typeof process.env.RECORDS_DIR !== 'string') {
  logError('Please specify recording directory.');
  process.exit(1);
}

if(typeof process.env.PIN_NUMBER !== 'string') {
  logError('Please specify DHT22 pin number.');
  process.exit(1);
}

init()
  .then(() => {
    run().catch((err: Error) => {
      logError(`Failed to run program: ${err.stack}`);
    });
  }).catch((err: Error) => {
    logError(`Failed to initialize: ${err.stack}`);
  });
