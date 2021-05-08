import { logError, init, run } from './lib';

// Check specified records directory
if(typeof process.env.RECORDS_DIR !== 'string') {
  logError('Please specify recording directory.');
  process.exit(1);
}

// Check specified pin number
if(typeof process.env.PIN_NUMBER !== 'string') {
  logError('Please specify DHT22 pin number.');
  process.exit(1);
}

// Check specified interval miliseconds
if(typeof process.env.INTERVAL_MS !== 'string') {
  logError('Please specify interval miliseconds number.');
  process.exit(1);
}

init()
  .then(() => {
    setInterval(() => {
      run().catch((err: Error) => {
        logError(`Failed to run program: ${err.stack}`);
      });
    }, Number(process.env.INTERVAL_MS));
  }).catch((err: Error) => {
    logError(`Failed to initialize: ${err.stack}`);
  });
