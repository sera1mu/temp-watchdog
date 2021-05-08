const lib = require('./lib');

// Check specified records directory
if(typeof process.env.RECORDS_DIR !== 'string') {
  lib.logError('Please specify recording directory.');
  process.exit(1);
}

// Check specified pin number
if(typeof process.env.PIN_NUMBER !== 'string') {
  lib.logError('Please specify DHT22 pin number.');
  process.exit(1);
}

// Check specified interval miliseconds
if(typeof process.env.INTERVAL_MS !== 'string') {
  lib.logError('Please specify interval miliseconds number.');
  process.exit(1);
}

lib.init()
  .then(() => {
    setInterval(() => {
      lib.run().catch((err) => {
        lib.logError(`Failed to run program: ${err.stack}`);
      });
    }, Number(process.env.INTERVAL_MS));
  }).catch((err) => {
    lib.logError(`Failed to initialize: ${err.stack}`);
  });
